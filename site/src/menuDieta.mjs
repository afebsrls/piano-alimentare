// Pagina "menù dieta" (ricerca: menù dieta / menù dieta settimanale / dieta 1500 calorie menù).
// Chi cerca vuole un esempio pronto di 7 giorni, con le calorie, da stampare: glielo diamo
// costruito con le ricette vere dell'app (tutte linkate), le calorie calcolate, la lista della
// spesa e un'infografica per Google Immagini (dove oggi c'è mezza prima pagina per questa ricerca).
// La settimana è scelta in modo deterministico: stesso database → stesso menù → stessa immagine.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RICETTE } from './generati.mjs';
import { quantita, svgMenu } from './immagini.mjs';
import { compatibileStile } from '../../src/core/menuStili.js';
import { htmlFonti, htmlFirma, urlFonti, linkFonte } from './fonti.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ING = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/data/ingredients.json'), 'utf8'));
const BY_ID = Object.fromEntries(ING.map(i => [i.id, i]));

export const SLUG = 'menu-dieta';
export const KCAL = 1500;
export const IMG = { file: `${SLUG}/menu-dieta-settimanale.webp`, url: `https://www.menudieta.it/${SLUG}/menu-dieta-settimanale.webp`, og: `${SLUG}/menu-dieta-og.jpg` };
const GIORNI = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const PASTI = [['colazione', 'Colazione'], ['spuntino_m', 'Spuntino'], ['pranzo', 'Pranzo'], ['spuntino_p', 'Merenda'], ['cena', 'Cena']];
const CAT = (c) => String(c || '').replace(/^[^\p{L}]+/u, '').trim();
const n0 = (v) => Math.round(+v || 0).toLocaleString('it-IT');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Ricette ammesse: menù libero = pool del generatore (niente soloMenu); con uno stile
// (mediterranea, low carb…) le stesse regole dell'app (src/core/menuStili.js).
// Preferenza per ingredienti di tutto l'anno, così la pagina resta valida in ogni mese:
// si allarga a 1-2 ingredienti stagionali solo se lo stile non ha abbastanza ricette.
const fuoriStagione = (r) => r.ingredients.filter(id => { const s = BY_ID[id]?.stagioni; return Array.isArray(s) && s.length > 0 && s.length < 12; }).length;
const infoIng = (id) => BY_ID[id];
export function poolPer(stile, cat, serve = 7) {
  const base = RICETTE.filter(r => r.categoria === cat && r.donna?.kcal > 0 && (stile ? compatibileStile(stile, r, infoIng, cat) : !r.soloMenu));
  for (const max of [0, 1, 2]) { const p = base.filter(r => fuoriStagione(r) <= max); if (p.length >= serve) return p; }
  return base.filter(r => fuoriStagione(r) <= 2);
}

// Grammi (porzione donna) di un ingrediente nella ricetta
const grammi = (r, id) => { const q = r.quantita?.[id]; if (!q) return 0; const a = BY_ID[id];
  return q.unit === 'pz' ? q.donna * (a?.pesoPezzoG || 50) : q.unit === 'cucchiaio' ? q.donna * 10 : q.donna; };
// Fonte proteica principale di pranzo e cena (per alternare come chiedono le linee guida CREA)
const GRUPPO = { 'Legumi': 'legumi', 'Pesce': 'pesce', 'Carni': 'carne', 'Frattaglie': 'carne', 'Salumi': 'salumi', 'Uova': 'uova', 'Latticini': 'formaggi' };
export const gruppo = (r) => {
  let best = null, max = 5;
  for (const id of r.ingredients) { const a = BY_ID[id], g = GRUPPO[CAT(a?.cat)]; if (!g) continue;
    const p = (+a.nutrizione?.p || 0) * grammi(r, id) / 100; if (p > max) { max = p; best = g; } }
  return best || 'vegetale';
};
// Frequenze di riferimento CREA 2018 sui 14 pasti principali della settimana
export const OBIETTIVO = { legumi: 3, carne: 3, formaggi: 3, pesce: 2, uova: 2, salumi: 1 };
// Frequenze usate per costruire gli esempi di ogni stile (null = nessun vincolo, solo varietà)
const OBIETTIVO_STILE = {
  mediterranea: { legumi: 4, pesce: 3, carne: 2, uova: 2, formaggi: 3, salumi: 0 },
  lowcarb:      { pesce: 4, carne: 4, uova: 2, legumi: 1, formaggi: 2, salumi: 1 },
  proteica:     { pesce: 4, carne: 4, uova: 2, legumi: 2, formaggi: 2, salumi: 0 },
  vegetariana:  { legumi: 5, uova: 3, formaggi: 3 },
};

// Generatore pseudo-casuale con seme fisso (mulberry32)
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pesca = (rand, arr, n) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
// 14 spuntini: tutti diversi se ce ne sono abbastanza, altrimenti mai uguali nello stesso giorno o di fila
const pescaSpuntini = (rand, pool) => {
  if (pool.length >= 14) return pesca(rand, pool, 14);
  const out = [];
  while (out.length < 14) { const giro = pesca(rand, pool, pool.length); for (const r of giro) { if (out.length >= 14) break; if (out.length && out[out.length - 1].id === r.id) continue; out.push(r); } }
  return out;
};

export function scegliSettimana(stile = null) {
  const P = { colazione: poolPer(stile, 'colazione'), pranzo: poolPer(stile, 'pranzo'), cena: poolPer(stile, 'cena'), spuntino: poolPer(stile, 'spuntino', 14) };
  const obiettivo = stile ? (OBIETTIVO_STILE[stile] || null) : OBIETTIVO;
  const rand = rng(stile ? 20261110 : 20261109); let best = null;
  for (let it = 0; it < (stile ? 25000 : 40000); it++) {
    const col = pesca(rand, P.colazione, 7), pra = pesca(rand, P.pranzo, 7), cen = pesca(rand, P.cena, 7), spu = pescaSpuntini(rand, P.spuntino);
    if (col.length < 7 || pra.length < 7 || cen.length < 7 || spu.length < 14) throw new Error(`menù dieta ${stile || 'libero'}: ricette insufficienti`);
    let score = 0; const conta = {};
    for (let d = 0; d < 7; d++) {
      const k = col[d].donna.kcal + spu[2 * d].donna.kcal + pra[d].donna.kcal + spu[2 * d + 1].donna.kcal + cen[d].donna.kcal;
      score += Math.abs(k - KCAL) * 1.2;
      if (spu[2 * d].id === spu[2 * d + 1].id) score += 200;
      const gp = gruppo(pra[d]), gc = gruppo(cen[d]);
      conta[gp] = (conta[gp] || 0) + 1; conta[gc] = (conta[gc] || 0) + 1;
      if (gp === gc && gp !== 'vegetale') score += 60;
      if (d && gruppo(cen[d - 1]) === gp && gp !== 'vegetale') score += 25;
    }
    if (obiettivo) for (const [g, n] of Object.entries(obiettivo)) score += Math.abs((conta[g] || 0) - n) * 45;
    else score += Math.max(0, (conta.salumi || 0) - 1) * 120 + Math.max(0, (conta.carne || 0) - 4) * 60;
    if (!best || score < best.score) best = { score, col, pra, cen, spu, conta };
  }
  return GIORNI.map((nome, d) => {
    const pasti = { colazione: best.col[d], spuntino_m: best.spu[2 * d], pranzo: best.pra[d], spuntino_p: best.spu[2 * d + 1], cena: best.cen[d] };
    const tot = (p, m = 'kcal') => PASTI.reduce((s, [k]) => s + (+pasti[k][p]?.[m] || 0), 0);
    return { nome, pasti, donna: tot('donna'), uomo: tot('uomo'), bimbo: tot('bimbo'), macro: { p: tot('donna', 'p'), c: tot('donna', 'c'), g: tot('donna', 'g') } };
  });
}
export const SETTIMANA = scegliSettimana(null);

export const media = (k, sett = SETTIMANA) => sett.reduce((s, g) => s + g[k], 0) / 7;
export const conteggio = (sett = SETTIMANA) => { const c = {}; for (const g of sett) for (const k of ['pranzo', 'cena']) { const x = gruppo(g.pasti[k]); c[x] = (c[x] || 0) + 1; } return c; };
const quota = (chiavi, sett = SETTIMANA) => Math.round(100 * sett.reduce((s, g) => s + chiavi.reduce((t, k) => t + g.pasti[k].donna.kcal, 0), 0) / sett.reduce((s, g) => s + g.donna, 0));
// Quota media di calorie da proteine / carboidrati / grassi (porzione donna) e grammi al giorno
export const ripartizione = (sett = SETTIMANA) => { const kc = sett.reduce((s, g) => s + g.donna, 0); const t = (m) => sett.reduce((s, g) => s + g.macro[m], 0);
  return { p: Math.round(100 * t('p') * 4 / kc), c: Math.round(100 * t('c') * 4 / kc), g: Math.round(100 * t('g') * 9 / kc), gp: Math.round(t('p') / 7), gc: Math.round(t('c') / 7), gg: Math.round(t('g') / 7) }; };

// Lista della spesa della settimana (una persona, porzione donna), per categoria
export function listaSpesa(sett = SETTIMANA) {
  const tot = {};
  for (const g of sett) for (const [k] of PASTI) { const r = g.pasti[k];
    for (const id of r.ingredients) { const q = r.quantita?.[id]; if (!q) continue; const u = q.unit || 'g'; const key = id + '|' + u;
      (tot[key] ||= { id, u, q: 0 }).q += +q.donna || 0; } }
  const perCat = {};
  for (const v of Object.values(tot)) { const a = BY_ID[v.id]; if (!a || !v.q) continue; (perCat[CAT(a.cat) || 'Varie'] ||= []).push({ nome: a.nome.replace(/\s*\([^)]*\)/g, '').trim(), q: v.q, u: v.u }); }
  return Object.entries(perCat).sort((a, b) => b[1].length - a[1].length).map(([c, L]) => [c, L.sort((x, y) => x.nome.localeCompare(y.nome, 'it'))]);
}
export const fmtQ = (q, u) => u === 'g' && q >= 1000 ? `${(Math.round(q / 100) / 10).toLocaleString('it-IT')} kg` : u === 'ml' && q >= 1000 ? `${(Math.round(q / 100) / 10).toLocaleString('it-IT')} l` : quantita(Math.round(q * 10) / 10, u);
export const htmlSpesa = (sett) => `<div class="spesa-menu">${listaSpesa(sett).map(([cat, L]) => `<div><h3>${esc(cat)}</h3><ul>${L.map(i => `<li>${esc(i.nome)} <span class="note">${fmtQ(i.q, i.u)}</span></li>`).join('')}</ul></div>`).join('')}</div>`;
export const htmlSettimana = (sett) => `<div class="settimana">
${sett.map(g => `<section class="giorno"><h3>${g.nome} <span>${n0(g.donna)} kcal <small>(uomo ${n0(g.uomo)})</small></span></h3><ul>${PASTI.map(([k, et]) => { const r = g.pasti[k]; return `<li><b>${et}</b><a href="/ricette/${r.slug}/">${esc(r.nomeVis)}</a> <span class="note">${n0(r.donna.kcal)} kcal</span></li>`; }).join('')}</ul></section>`).join('\n')}
</div>`;
export { GIORNI, PASTI, n0, esc };

// Dati per l'infografica (immagini.mjs → svgMenu)
export const datiInfografica = () => ({
  titolo: 'Menù dieta settimanale',
  sottotitolo: `Esempio di 7 giorni · circa ${n0(Math.round(media('donna') / 10) * 10)} kcal al giorno (porzione donna)`,
  giorni: SETTIMANA.map(g => ({ nome: g.nome, kcal: g.donna, pasti: PASTI.map(([k, et]) => ({ etichetta: et, nome: g.pasti[k].nomeVis })) })),
  box: { titolo: 'Le regole del menù', righe: ['Acqua: 1,5–2 litri al giorno', 'Olio EVO a crudo, col cucchiaio', 'Verdura a pranzo e a cena', 'Legumi 3 volte, pesce 2 a settimana', 'Porzioni su misura: menudieta.it'] },
  piede: 'Esempio indicativo, non sostituisce il parere di un medico o di un nutrizionista · www.menudieta.it',
});

export const infografica = () => svgMenu(datiInfografica());
export function paginaMenuDieta({ APP, cta, altriMenu = '', dataIt = '' }) {
  const { w: imgW, h: imgH } = infografica();
  const md = media('donna'), mu = media('uomo'), mb = media('bimbo');
  const c = conteggio();
  const freq = Object.keys(OBIETTIVO).map(g => `${g} ${c[g] || 0} ${c[g] === 1 ? 'volta' : 'volte'}`).join(', ') + (c.vegetale ? `, piatti unici vegetali ${c.vegetale}` : '');
  const qCol = quota(['colazione']), qSpu = quota(['spuntino_m', 'spuntino_p']), qPra = quota(['pranzo']), qCen = quota(['cena']);
  const tondo = Math.round(md / 10) * 10;
  const body = `
<p class="crumb"><a href="/">Home</a> · Menù dieta</p>
<h1>Menù dieta settimanale: esempio di 7 giorni da ${n0(KCAL)} kcal</h1>
${htmlFirma(dataIt)}
<p class="lead">Un menù dieta settimanale equilibrato divide le calorie in cinque pasti (colazione, spuntino, pranzo, merenda e cena) e alterna legumi, pesce, carne, uova e formaggi come indicano le linee guida CREA. Qui sotto trovi un esempio completo di 7 giorni da <strong>circa ${n0(tondo)} kcal al giorno</strong> nella porzione per una donna, con le stesse ricette in versione uomo (circa ${n0(Math.round(mu / 10) * 10)} kcal) e bambino, la lista della spesa e l’infografica da stampare.</p>
<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0"><a class="btn" href="${APP}">Crea il tuo menù dieta su misura →</a><a class="btn secondario" href="/${IMG.file}" download>Scarica l’immagine</a><button class="btn secondario" type="button" onclick="window.print()">Stampa</button></div>

<div class="inbreve"><strong>In breve</strong><ul>
<li><strong>5 pasti al giorno</strong>: colazione, spuntino, pranzo, merenda, cena.</li>
<li><strong>Calorie</strong>: in media ${n0(md)} kcal al giorno per una donna, ${n0(mu)} per un uomo, ${n0(mb)} per un bambino (stesse ricette, porzioni diverse).</li>
<li><strong>Ripartizione</strong>: colazione ${qCol}%, spuntini ${qSpu}%, pranzo ${qPra}%, cena ${qCen}% delle calorie.</li>
<li><strong>Proteine a rotazione</strong> su 14 pasti principali: ${freq}.</li>
<li><strong>35 piatti</strong> con ingredienti, grammi e preparazione, più la lista della spesa della settimana.</li>
</ul></div>

<figure class="infografica"><img src="/${IMG.file}" width="${imgW}" height="${imgH}" alt="Menù dieta settimanale: esempio di 7 giorni con colazione, spuntino, pranzo, merenda e cena, circa ${n0(tondo)} kcal al giorno" fetchpriority="high"><figcaption>L’infografica del menù dieta settimanale: salvala o stampala e attaccala al frigo.</figcaption></figure>

__ALTRI_MENU__

<h2>Esempio di menù dieta settimanale, giorno per giorno</h2>
<p>Ogni piatto rimanda alla sua ricetta, con ingredienti e grammi per uomo, donna e bambino. Le calorie sono quelle della porzione donna; tra parentesi il totale della giornata per un uomo.</p>
<div class="settimana">
${SETTIMANA.map(g => `<section class="giorno"><h3>${g.nome} <span>${n0(g.donna)} kcal <small>(uomo ${n0(g.uomo)})</small></span></h3><ul>${PASTI.map(([k, et]) => { const r = g.pasti[k]; return `<li><b>${et}</b><a href="/ricette/${r.slug}/">${esc(r.nomeVis)}</a> <span class="note">${n0(r.donna.kcal)} kcal</span></li>`; }).join('')}</ul></section>`).join('\n')}
</div>

<h2>Quante calorie ha il menù dieta: donna, uomo e bambino</h2>
<p>Stesse ricette, porzioni diverse: per questo il menù può essere seguito da tutta la famiglia, cucinando una volta sola.</p>
<div class="scroll"><table class="tabella"><tr><th>Giorno</th><th>👩 Donna</th><th>👨 Uomo</th><th>🧒 Bambino</th></tr>
${SETTIMANA.map(g => `<tr><td>${g.nome}</td><td>${n0(g.donna)} kcal</td><td>${n0(g.uomo)} kcal</td><td>${n0(g.bimbo)} kcal</td></tr>`).join('')}
<tr><td><strong>Media al giorno</strong></td><td><strong>${n0(md)} kcal</strong></td><td><strong>${n0(mu)} kcal</strong></td><td><strong>${n0(mb)} kcal</strong></td></tr></table></div>
<p class="note">La porzione bambino è un riferimento medio: a un bambino in crescita le calorie vanno date in base all’età (vedi le <a href="/porzioni-bambini-per-eta/">porzioni per età</a>), non ridotte come in una dieta.</p>

<h2>Come si costruisce un menù dieta equilibrato</h2>
<ul>
  <li><strong>Calorie distribuite su 5 pasti.</strong> In questa settimana la colazione vale in media il ${qCol}% delle calorie, i due spuntini insieme il ${qSpu}%, il pranzo il ${qPra}% e la cena il ${qCen}%: niente pasti saltati, niente arrivi affamati a cena.</li>
  <li><strong>Fonti di proteine alternate.</strong> Sui 14 pasti principali: ${freq}. Il riferimento delle ${linkFonte('crea', 'Linee guida CREA 2018')} è legumi 3, carne 3, formaggi 3, pesce 2, uova 2, salumi 1.</li>
  <li><strong>Ricette vere, con i grammi.</strong> Ogni piatto è una ricetta del database di MenuDieta, con calorie e macronutrienti calcolati sugli ingredienti.</li>
  <li><strong>Ingredienti che trovi tutto l’anno.</strong> Il menù non dipende dalla stagione; nell’app il menù cambia invece mese per mese con <a href="/frutta-verdura-di-stagione/">frutta e verdura di stagione</a>.</li>
</ul>

<h2>Menù dieta per dimagrire: quante calorie servono davvero</h2>
<p>${n0(KCAL)} kcal al giorno sono un esempio, non una cifra adatta a tutti. Per perdere peso in modo sostenibile si toglie dal proprio fabbisogno un deficit moderato, in genere 300–500 kcal al giorno: chi ha un fabbisogno di 2.000 kcal dimagrisce con un menù da 1.500–1.700, chi ne ha 1.700 con uno da 1.300–1.400. Scendere sotto le 1.200 kcal senza un medico o un nutrizionista non è consigliato.</p>
<p>Per partire dal numero giusto calcola il tuo <a href="/calcolo-fabbisogno-calorico/">fabbisogno calorico giornaliero</a> e il tuo <a href="/peso-forma-calcolo/">peso forma</a>: MenuDieta fa questi calcoli per ogni persona di casa e adatta le porzioni del menù di conseguenza.</p>
${cta('Il tuo menù dieta, con le tue calorie')}

<h2>Lista della spesa del menù dieta (una persona, 7 giorni)</h2>
<p>Le quantità della settimana per una persona (porzione donna). Per una famiglia, l’app somma le porzioni di tutti e crea la <a href="/lista-della-spesa-automatica/">lista della spesa automatica</a>.</p>
<div class="spesa-menu">${listaSpesa().map(([cat, L]) => `<div><h3>${esc(cat)}</h3><ul>${L.map(i => `<li>${esc(i.nome)} <span class="note">${fmtQ(i.q, i.u)}</span></li>`).join('')}</ul></div>`).join('')}</div>

<h2>Le regole d’oro di un menù dieta equilibrato</h2>
<div class="grid">
  <div class="box"><h3>Acqua</h3><p>Da 1,5 a 2 litri al giorno per un adulto, di più se ti alleni o fa caldo. Calcola la tua quantità con lo strumento <a href="/quanta-acqua-bere-al-giorno/">quanta acqua bere al giorno</a>.</p></div>
  <div class="box"><h3>Condimenti misurati</h3><p>Olio extravergine d’oliva, a crudo e con il cucchiaio: un cucchiaio vale circa 90 kcal. È il punto dove un menù dieta si rompe più spesso.</p></div>
  <div class="box"><h3>Verdura a ogni pasto principale</h3><p>Riempie, costa poco e ha poche calorie. Meglio se di stagione e variando i colori.</p></div>
  <div class="box"><h3>Cereali integrali</h3><p>Pane, pasta, riso, farro e avena integrali saziano più a lungo dei raffinati, a parità di calorie.</p></div>
</div>

<h2>Dal menù di esempio al tuo menù dieta personalizzato</h2>
<p>Un menù uguale per tutti è un punto di partenza. <a href="${APP}">MenuDieta</a> lo trasforma nel tuo: inserisci età, peso, altezza e attività di ogni persona di casa, togli ciò che non mangiate e l’app compone la settimana con le porzioni giuste per ciascuno, la <a href="/lista-della-spesa-automatica/">lista della spesa</a> e il conteggio delle calorie. Gratis e senza pubblicità. Vuoi capire il metodo? Leggi <a href="/blog/come-organizzare-menu-settimanale-famiglia/">come organizzare il menu settimanale</a> o il <a href="/blog/piano-alimentare-mantenimento/">piano alimentare di mantenimento</a>.</p>
${htmlFonti(['crea', 'larn', 'tabelle', 'efsa'])}
<p class="note">Questo menù è un esempio indicativo per adulti sani e non sostituisce il parere di un medico o di un nutrizionista.</p>`;

  const faq = [
    ['Esistono menù dieta diversi (mediterranea, low carb, proteica, vegetariana)?', 'Sì: oltre al menù equilibrato di questa pagina trovi un esempio settimanale per la dieta mediterranea, low carb, proteica e vegetariana. Nell’app ognuno si imposta con un tocco e il piano usa solo ricette di quello stile, con le porzioni per ogni persona.'],
    ['Che cosa si mangia in un menù dieta settimanale?', `Cinque pasti al giorno: colazione (per esempio yogurt, avena e frutta), uno spuntino a metà mattina, pranzo con cereali e verdura, una merenda e una cena con una fonte di proteine e verdura. Nell’esempio di questa pagina la media è di circa ${n0(tondo)} kcal al giorno per una donna.`],
    ['Quante calorie ha questo menù dieta?', `In media ${n0(md)} kcal al giorno nella porzione donna, ${n0(mu)} kcal nella porzione uomo e ${n0(mb)} kcal nella porzione bambino. I totali di ogni giorno sono nella tabella delle calorie.`],
    ['Il menù dieta da 1500 calorie fa dimagrire?', 'Fa dimagrire chi ha un fabbisogno più alto di circa 300–500 kcal, per esempio una donna moderatamente attiva. Per sapere se fa al caso tuo calcola il tuo fabbisogno calorico: se è già vicino a 1.500 kcal ti serve un menù diverso, meglio con l’aiuto di un professionista.'],
    ['Posso seguire il menù dieta con tutta la famiglia?', 'Sì: le ricette sono le stesse per tutti, cambiano solo le grammature. Ogni ricetta indica le quantità per uomo, donna e bambino, e MenuDieta le calcola sul fabbisogno reale di ogni persona.'],
    ['Posso cambiare un piatto del menù?', 'Sì, scegli un’altra ricetta della stessa categoria con calorie simili. Nell’app basta un tocco: il piatto cambia e calorie e lista della spesa si aggiornano da sole.'],
  ];
  return {
    slug: SLUG, body: body.replace('__ALTRI_MENU__', altriMenu), faq, giorni: SETTIMANA, mediaDonna: md,
    schemaExtra: (mod) => [{
      '@context': 'https://schema.org', '@type': 'Article', headline: `Menù dieta settimanale: esempio di 7 giorni da ${n0(KCAL)} kcal`, inLanguage: 'it',
      description: `Esempio di menù dieta settimanale con 5 pasti al giorno, circa ${n0(tondo)} kcal (porzione donna), versioni uomo e bambino, lista della spesa e infografica.`,
      image: [{ '@type': 'ImageObject', url: IMG.url, width: imgW, height: imgH, caption: 'Menù dieta settimanale: esempio di 7 giorni' }, `https://www.menudieta.it/${IMG.og}`],
      datePublished: '2026-11-09', dateModified: mod,
      author: { '@type': 'Organization', name: 'Redazione MenuDieta', url: 'https://www.menudieta.it/chi-siamo/' },
      publisher: { '@id': 'https://www.menudieta.it/#org' }, mainEntityOfPage: `https://www.menudieta.it/${SLUG}/`,
      about: ['menù dieta', 'menù settimanale', 'dieta 1500 calorie'],
      citation: urlFonti(['crea', 'larn', 'tabelle', 'efsa']),
    }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.menudieta.it/' },
      { '@type': 'ListItem', position: 2, name: 'Menù dieta', item: `https://www.menudieta.it/${SLUG}/` }] }],
  };
}
