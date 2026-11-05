// Pagine generate dai dati dell'app: una per alimento (calorie e valori
// nutrizionali) e una per ricetta (porzioni uomo/donna/bambino e macro).
// Sono le pagine "long tail": ciascuna porta poco, insieme molto.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ING = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/data/ingredients.json'), 'utf8'));
const REC = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/data/recipes.json'), 'utf8'));
const BY_ID = Object.fromEntries(ING.map(i => [i.id, i]));

export const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const n1 = (v) => (Math.round((+v || 0) * 10) / 10).toLocaleString('it-IT');
const n0 = (v) => Math.round(+v || 0).toLocaleString('it-IT');
const MESI = ['', 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const CAT_LABEL = (c) => String(c || '').replace(/^[^\p{L}]+/u, '').trim();

// Nome "pulito" per URL e title (via parentesi ecc.)
const nomeBreve = (nome) => nome.replace(/\s*\([^)]*\)/g, '').trim();
// "Bowl di ceci + spinaci + feta" → "Bowl di ceci, spinaci e feta" (title, H1, schema)
export const bello = (nome) => { const p = String(nome).split(/\s*\+\s*/); return p.length > 1 ? p.slice(0, -1).join(', ') + ' e ' + p[p.length - 1] : p[0]; };
// Data dell'ultima modifica dei dati (aggiornare quando cambiano ingredients.json / recipes.json)
export const DATA_MOD = '2026-11-05';

// Ricette che usano un alimento
const RIC_PER_ING = {};
for (const r of REC) for (const id of r.ingredients) (RIC_PER_ING[id] ||= []).push(r);

const CAT_RIC = { colazione: 'Colazione', spuntino: 'Spuntino', pranzo: 'Pranzo', cena: 'Cena' };

// Evita slug duplicati
const used = new Map();
const uniq = (s) => { const n = (used.get(s) || 0) + 1; used.set(s, n); return n === 1 ? s : `${s}-${n}`; };
export const ALIMENTI = ING.filter(i => i.nutrizione && i.nutrizione.kcal != null && i.nome).map(i => {
  const base = slug(nomeBreve(i.nome)); const sl = uniq(base);
  // Omonimi (es. "Noci" secche vs fresche): nome distinto preso dall'id
  const nomeVis = sl === base ? nomeBreve(i.nome) : `${nomeBreve(i.nome)} (${i.id.replace(/^db_|^ing_/, '').replace(/_/g, ' ').replace(new RegExp('^' + base.replace(/-/g, ' ') + '\\s*'), '').trim() || 'variante'})`;
  return { ...i, slug: sl, nomeVis };
});
const ALI_BY_ID = Object.fromEntries(ALIMENTI.map(a => [a.id, a]));
export const RICETTE = REC.map(r => { const base = slug(r.nome); const sl = uniq(base); return { ...r, slug: sl, nomeVis: sl === base ? bello(r.nome) : `${bello(r.nome)} (versione ${CAT_RIC[r.categoria] || r.categoria})` }; });
const RIC_BY_ID = Object.fromEntries(RICETTE.map(r => [r.id, r]));


// ── Pagina alimento ──────────────────────────────────────────────────
export function paginaAlimento(a, { APP, cta }) {
  const nome = a.nomeVis, nz = a.nutrizione, cat = CAT_LABEL(a.cat);
  const pezzo = a.pesoPezzoG ? Math.round(a.pesoPezzoG) : null;
  const kcalPezzo = pezzo ? Math.round(nz.kcal * pezzo / 100) : null;
  const stag = Array.isArray(a.stagioni) && a.stagioni.length ? a.stagioni.map(m => MESI[m]).join(', ') : null;
  const ricette = (RIC_PER_ING[a.id] || []).map(r => RIC_BY_ID[r.id]).filter(Boolean).slice(0, 8);
  const stessaCat = ALIMENTI.filter(x => x.cat === a.cat); const pos = stessaCat.findIndex(x => x.id === a.id);
  const simili = stessaCat.length > 1 ? Array.from({ length: Math.min(8, stessaCat.length - 1) }, (_, k) => stessaCat[(pos + 1 + k) % stessaCat.length]) : [];
  const kcalPer = (g) => Math.round(nz.kcal * g / 100);
  const faq = [
    [`Quante calorie ha 100 g di ${nome.toLowerCase()}?`, `${n0(nz.kcal)} kcal per 100 g, con ${n1(nz.p)} g di proteine, ${n1(nz.c)} g di carboidrati e ${n1(nz.g)} g di grassi.`],
    ...(pezzo ? [[`Quante calorie ha un ${nome.toLowerCase()}?`, `Un pezzo medio pesa circa ${pezzo} g e apporta circa ${kcalPezzo} kcal.`]] : []),
    [`${nome} fa ingrassare?`, `Nessun alimento fa ingrassare da solo: conta il totale della giornata. ${nz.kcal >= 300 ? `Con ${n0(nz.kcal)} kcal per 100 g è un alimento denso: la porzione va misurata.` : `Con ${n0(nz.kcal)} kcal per 100 g è un alimento a densità ${nz.kcal < 100 ? 'bassa' : 'media'}: le porzioni normali rientrano facilmente in un piano equilibrato.`} Il <a href="/calcolo-fabbisogno-calorico/">calcolatore del fabbisogno</a> ti dice quante calorie ti servono.`],
  ];
  const body = `
<p class="crumb"><a href="/">Home</a> · <a href="/alimenti/">Alimenti</a> · ${esc(cat)}</p>
<h1>Calorie ${esc(nome)}: valori nutrizionali per 100 g</h1>
<p class="lead"><strong>${esc(nome)}</strong> apporta <strong>${n0(nz.kcal)} kcal per 100 g</strong>: ${n1(nz.p)} g di proteine, ${n1(nz.c)} g di carboidrati${nz.z ? ` (di cui zuccheri ${n1(nz.z)} g)` : ''}, ${n1(nz.g)} g di grassi${nz.f ? ` e ${n1(nz.f)} g di fibre` : ''}.${pezzo ? ` Un pezzo medio (${pezzo} g) vale circa ${kcalPezzo} kcal.` : ''}</p>
<div class="scroll"><table class="tabella">
<tr><th>Per 100 g</th><th>Valore</th>${pezzo ? `<th>Per 1 pezzo (${pezzo} g)</th>` : ''}</tr>
<tr><td>Energia</td><td><strong>${n0(nz.kcal)} kcal</strong></td>${pezzo ? `<td>${kcalPezzo} kcal</td>` : ''}</tr>
<tr><td>Proteine</td><td>${n1(nz.p)} g</td>${pezzo ? `<td>${n1(nz.p * pezzo / 100)} g</td>` : ''}</tr>
<tr><td>Carboidrati</td><td>${n1(nz.c)} g</td>${pezzo ? `<td>${n1(nz.c * pezzo / 100)} g</td>` : ''}</tr>
${nz.z != null ? `<tr><td>di cui zuccheri</td><td>${n1(nz.z)} g</td>${pezzo ? `<td>${n1(nz.z * pezzo / 100)} g</td>` : ''}</tr>` : ''}
<tr><td>Grassi</td><td>${n1(nz.g)} g</td>${pezzo ? `<td>${n1(nz.g * pezzo / 100)} g</td>` : ''}</tr>
${nz.f != null ? `<tr><td>Fibre</td><td>${n1(nz.f)} g</td>${pezzo ? `<td>${n1(nz.f * pezzo / 100)} g</td>` : ''}</tr>` : ''}
</table></div>
<p class="note">Fonte: tabelle di composizione degli alimenti usate nel motore di MenuDieta${nz.fonte && nz.fonte !== a.nome ? ` (voce: ${esc(nz.fonte)})` : ''}. I valori sono medi e possono variare per varietà, marca e cottura.</p>

<h2>Porzioni comuni di ${esc(nome.toLowerCase())}</h2>
<div class="scroll"><table class="tabella"><tr><th>Quantità</th><th>Calorie</th><th>Proteine</th><th>Carboidrati</th><th>Grassi</th></tr>
${[30, 50, 80, 100, 150, 200].map(g => `<tr><td>${g} g</td><td>${kcalPer(g)} kcal</td><td>${n1(nz.p * g / 100)} g</td><td>${n1(nz.c * g / 100)} g</td><td>${n1(nz.g * g / 100)} g</td></tr>`).join('')}
</table></div>
${stag ? `<h2>Quando è di stagione</h2><p>${esc(nome)} è di stagione in: <strong>${stag}</strong>. MenuDieta lo propone nel menu in quei mesi, quando costa meno e ha più sapore.</p>` : ''}
${ricette.length ? `<h2>Ricette con ${esc(nome.toLowerCase())}</h2><ul>${ricette.map(r => `<li><a href="/ricette/${r.slug}/">${esc(r.nomeVis)}</a> <span class="note">(${CAT_RIC[r.categoria] || r.categoria}, ${n0(r.donna?.kcal)} kcal porzione donna)</span></li>`).join('')}</ul>` : ''}
${cta(`Quanto ${nome.toLowerCase()} per te? MenuDieta calcola la porzione giusta`)}
<p>MenuDieta inserisce ${esc(nome.toLowerCase())} nel <a href="/menu-settimanale-famiglia/">menu settimanale della famiglia</a> con la grammatura adatta a ciascuno, e lo aggiunge alla <a href="/lista-della-spesa-automatica/">lista della spesa</a> nella quantità esatta.</p>
<h2>Altri alimenti: ${esc(cat)}</h2>
<p>${simili.map(x => `<a href="/alimenti/${x.slug}/">${esc(x.nomeVis)}</a>`).join(' · ')} · <a href="/alimenti/">tutti gli alimenti</a></p>`;
  return {
    slug: `alimenti/${a.slug}`,
    title: `Calorie ${nome}: valori nutrizionali per 100 g`,
    description: `${nome}: ${n0(nz.kcal)} kcal per 100 g, ${n1(nz.p)} g proteine, ${n1(nz.c)} g carboidrati, ${n1(nz.g)} g grassi.${pezzo ? ` Un pezzo (${pezzo} g): ${kcalPezzo} kcal.` : ''} Porzioni, stagione e ricette.`,
    body, faq,
    schema: [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.menudieta.it/' },
      { '@type': 'ListItem', position: 2, name: 'Alimenti', item: 'https://www.menudieta.it/alimenti/' },
      { '@type': 'ListItem', position: 3, name: nome, item: `https://www.menudieta.it/alimenti/${a.slug}/` }] }],
  };
}

export function indiceAlimenti({ cta }) {
  const cats = {};
  for (const a of ALIMENTI) (cats[a.cat] ||= []).push(a);
  const body = `<h1>Calorie e valori nutrizionali degli alimenti</h1>
<p class="lead">${ALIMENTI.length} alimenti con calorie, proteine, carboidrati e grassi per 100 g e per porzione: le stesse tabelle che MenuDieta usa per calcolare il menu della famiglia. Scegli una categoria.</p>
${Object.entries(cats).sort((x, y) => y[1].length - x[1].length).map(([c, L]) => `<h2>${esc(c)} <span class="note">(${L.length})</span></h2><p>${L.sort((x, y) => x.nome.localeCompare(y.nome, 'it')).map(a => `<a href="/alimenti/${a.slug}/">${esc(a.nomeVis)}</a>`).join(' · ')}</p>`).join('')}
${cta('Le porzioni giuste per la tua famiglia, in automatico')}`;
  return { slug: 'alimenti', title: 'Calorie e valori nutrizionali di 700+ alimenti – MenuDieta', description: `Tabella calorie di ${ALIMENTI.length} alimenti con proteine, carboidrati e grassi per 100 g e per porzione, divisi per categoria. Dati usati dal motore di MenuDieta.`, body };
}

// ── Pagina ricetta ───────────────────────────────────────────────────
export function paginaRicetta(r, { APP, cta }) {
  const cat = CAT_RIC[r.categoria] || r.categoria;
  const ingr = r.ingredients.map(id => ({ id, a: ALI_BY_ID[id] || BY_ID[id], q: r.quantita?.[id] }));
  const riga = (p) => `<td>${n0(r[p]?.kcal)} kcal</td><td>${n0(r[p]?.p)} g</td><td>${n0(r[p]?.c)} g</td><td>${n0(r[p]?.g)} g</td>`;
  const stessaCat = RICETTE.filter(x => x.categoria === r.categoria); const pos = stessaCat.findIndex(x => x.id === r.id);
  const altre = stessaCat.length > 1 ? Array.from({ length: Math.min(8, stessaCat.length - 1) }, (_, k) => stessaCat[(pos + 1 + k) % stessaCat.length]) : [];
  const faq = [
    [`Quante calorie ha ${bello(r.nome)}?`, `Dipende dalla porzione: ${n0(r.donna?.kcal)} kcal nella porzione per una donna, ${n0(r.uomo?.kcal)} per un uomo, ${n0(r.bimbo?.kcal)} per un bambino. Nel piano MenuDieta ogni membro della famiglia ha la sua grammatura.`],
    [`${bello(r.nome)} va bene per i bambini?`, `Sì: è la stessa ricetta della famiglia, con la porzione ridotta (${esc(r.porzioni?.bimbo || 'porzione bambino')}).`],
    ['Posso sostituire un ingrediente?', 'Sì. In MenuDieta ogni ingrediente ha equivalenti con lo stesso ruolo nutrizionale; cambiandolo il piano ricalcola calorie e lista della spesa.'],
  ];
  const body = `
<p class="crumb"><a href="/">Home</a> · <a href="/ricette/">Ricette</a> · ${esc(cat)}</p>
<h1>${esc(r.nomeVis)}: calorie e porzioni per uomo, donna e bambino</h1>
<p class="lead">${esc(bello(r.nome))} è una ricetta da ${esc(cat.toLowerCase())}${r.prep ? ` pronta in circa ${r.prep} minuti` : ''}: <strong>${n0(r.donna?.kcal)} kcal</strong> nella porzione per una donna, ${n0(r.uomo?.kcal)} per un uomo, ${n0(r.bimbo?.kcal)} per un bambino. Stessi ingredienti, grammature diverse: è così che MenuDieta cucina una volta sola per tutta la famiglia.</p>
<h2>Ingredienti e quantità per persona</h2>
<div class="scroll"><table class="tabella"><tr><th>Ingrediente</th><th>👨 Uomo</th><th>👩 Donna</th><th>🧒 Bambino</th></tr>
${ingr.map(({ a, q, id }) => `<tr><td>${a ? (ALI_BY_ID[id] ? `<a href="/alimenti/${ALI_BY_ID[id].slug}/">${esc(nomeBreve(a.nome))}</a>` : esc(nomeBreve(a.nome))) : esc(id)}</td><td>${q ? `${q.uomo} ${q.unit || 'g'}` : '—'}</td><td>${q ? `${q.donna} ${q.unit || 'g'}` : '—'}</td><td>${q ? `${q.bimbo} ${q.unit || 'g'}` : '—'}</td></tr>`).join('')}
</table></div>
${r.porzioni?.donna ? `<p class="note">In breve, porzione donna: ${esc(r.porzioni.donna)}.</p>` : ''}
<h2>Valori nutrizionali per porzione</h2>
<div class="scroll"><table class="tabella"><tr><th>Porzione</th><th>Calorie</th><th>Proteine</th><th>Carboidrati</th><th>Grassi</th></tr>
<tr><td>👨 Uomo</td>${riga('uomo')}</tr><tr><td>👩 Donna</td>${riga('donna')}</tr><tr><td>🧒 Bambino</td>${riga('bimbo')}</tr>
</table></div>
<p class="note">Le tre porzioni sono riferimenti medi. Nell’app la grammatura è calcolata sul fabbisogno reale di ogni persona (età, peso, attività, obiettivo), non su tre taglie fisse.</p>
${cta(`Metti ${bello(r.nome)} nel menu della tua famiglia`)}
<p>Apri <a href="${APP}">MenuDieta</a>: la ricetta entra nel <a href="/menu-settimanale-famiglia/">menu settimanale</a> con le porzioni di ciascuno e gli ingredienti finiscono nella <a href="/lista-della-spesa-automatica/">lista della spesa</a>.</p>
<h2>Altre ricette da ${esc(cat.toLowerCase())}</h2>
<p>${altre.map(x => `<a href="/ricette/${x.slug}/">${esc(x.nomeVis)}</a>`).join(' · ')} · <a href="/ricette/">tutte le ricette</a></p>`;
  return {
    slug: `ricette/${r.slug}`,
    title: `${r.nomeVis}: calorie e porzioni`,
    description: `${r.nomeVis} (${cat.toLowerCase()}${r.prep ? `, ${r.prep} min` : ''}): ${n0(r.donna?.kcal)} kcal porzione donna, ${n0(r.uomo?.kcal)} uomo, ${n0(r.bimbo?.kcal)} bambino. Ingredienti e grammature.`,
    body, faq,
    schema: [{
      '@context': 'https://schema.org', '@type': 'Recipe', name: bello(r.nome), description: `${bello(r.nome)}: ricetta da ${cat.toLowerCase()} con porzioni e calorie per uomo, donna e bambino.`, recipeCategory: cat, recipeCuisine: 'Italiana', inLanguage: 'it',
      author: { '@type': 'Organization', name: 'MenuDieta' }, recipeYield: '1 porzione',
      ...(r.prep ? { totalTime: `PT${r.prep}M` } : {}),
      recipeIngredient: ingr.map(({ a, q, id }) => `${q ? `${q.donna} ${q.unit || 'g'} ` : ''}${a ? nomeBreve(a.nome) : id}`),
      nutrition: { '@type': 'NutritionInformation', calories: `${n0(r.donna?.kcal)} kcal`, proteinContent: `${n0(r.donna?.p)} g`, carbohydrateContent: `${n0(r.donna?.c)} g`, fatContent: `${n0(r.donna?.g)} g` },
      keywords: `${bello(r.nome)}, calorie, porzioni, ${cat.toLowerCase()}, famiglia`,
    }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.menudieta.it/' },
      { '@type': 'ListItem', position: 2, name: 'Ricette', item: 'https://www.menudieta.it/ricette/' },
      { '@type': 'ListItem', position: 3, name: bello(r.nome), item: `https://www.menudieta.it/ricette/${r.slug}/` }] }],
  };
}

export function indiceRicette({ cta }) {
  const cats = ['colazione', 'spuntino', 'pranzo', 'cena'];
  const body = `<h1>Ricette con calorie e porzioni per tutta la famiglia</h1>
<p class="lead">${RICETTE.length} ricette del menu MenuDieta, ognuna con ingredienti, grammature e valori nutrizionali per uomo, donna e bambino. Sono quelle che il generatore usa per comporre la settimana.</p>
${cats.map(c => { const L = RICETTE.filter(r => r.categoria === c); return `<h2>${CAT_RIC[c]} <span class="note">(${L.length})</span></h2><div class="cards">${L.sort((x, y) => x.nome.localeCompare(y.nome, 'it')).map(r => `<a class="card" href="/ricette/${r.slug}/"><h2>${esc(r.nomeVis)}</h2><p>${n0(r.donna?.kcal)} kcal porzione donna${r.prep ? ` · ${r.prep} min` : ''}</p></a>`).join('')}</div>`; }).join('')}
${cta('Il menu si compone da solo con queste ricette')}`;
  return { slug: 'ricette', title: `${RICETTE.length} ricette con calorie e porzioni per la famiglia – MenuDieta`, description: `Tutte le ricette del menu MenuDieta con ingredienti, grammature e calorie per uomo, donna e bambino, divise per colazione, spuntino, pranzo e cena.`, body };
}
