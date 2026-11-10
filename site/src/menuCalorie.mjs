// Pagine "menù dieta da N calorie" (1200 … 2000 kcal): la famiglia di ricerche più frequente
// attorno a "menù dieta" ("dieta 1500 calorie menù settimanale", "dieta 1200 calorie"…).
// Ogni settimana è composta con le ricette del catalogo nelle loro porzioni standard
// (donna fino a 1600 kcal, uomo da 1800): nessuna grammatura inventata, i grammi sono
// gli stessi delle pagine ricetta. La scelta punta a N kcal ogni giorno e alterna le fonti di proteine.
import { scegliSettimana, conteggio, htmlSpesa, PASTI, n0, esc, BY_ID } from './menuDieta.mjs';
import { svgMenu, quantita } from './immagini.mjs';
import { htmlFonti, htmlFirma, urlFonti, linkFonte } from './fonti.mjs';
import { STILI_MENU } from '../../src/core/menuStili.js';

export const SITE = 'https://www.menudieta.it';
// fabb: fabbisogno indicativo di chi, con questo menù, è in deficit di circa 500 kcal al giorno
export const LIVELLI = [
  { kcal: 1200, slot: 'donna', fabb: 1700, chi: 'donne di corporatura piccola e poco attive', nota: 'È il livello più basso che abbia senso seguire da soli, e solo per periodi brevi: sotto le 1200 kcal diventa difficile coprire vitamine e minerali, e serve un medico o un nutrizionista.' },
  { kcal: 1400, slot: 'donna', fabb: 1900, chi: 'donne sedentarie di corporatura media', nota: 'È un livello ipocalorico moderato: lascia spazio a cinque pasti completi senza porzioni troppo piccole.' },
  { kcal: 1500, slot: 'donna', fabb: 2000, chi: 'donne moderatamente attive e uomini sedentari di corporatura piccola', nota: 'È il livello di dieta dimagrante più cercato: abbastanza basso da far perdere peso a molte donne, abbastanza alto da essere sostenibile per mesi.' },
  { kcal: 1600, slot: 'donna', fabb: 2100, chi: 'donne attive e uomini sedentari di corporatura piccola', nota: 'Per molte donne poco attive è vicino al mantenimento: prima di sceglierlo conviene calcolare il proprio fabbisogno.' },
  { kcal: 1800, slot: 'uomo', fabb: 2300, chi: 'uomini sedentari e donne molto attive', nota: 'Per un uomo è un livello dimagrante moderato; per molte donne è un menù di mantenimento.' },
  { kcal: 2000, slot: 'uomo', fabb: 2500, chi: 'uomini moderatamente attivi', nota: 'Per molte donne attive e per gli uomini sedentari 2000 kcal sono un menù di mantenimento, non dimagrante.' },
].map(l => ({ ...l, slug: `menu-dieta-${l.kcal}-calorie` }));
export const LIVELLO = Object.fromEntries(LIVELLI.map(l => [l.kcal, l]));
export const imgLivello = (l) => ({ file: `${l.slug}/${l.slug}.webp`, url: `${SITE}/${l.slug}/${l.slug}.webp`, og: `${l.slug}/${l.slug}-og.jpg` });

const SETT = Object.fromEntries(LIVELLI.map(l => [l.kcal, scegliSettimana(null, { kcal: l.kcal, slot: l.slot, seme: 7000 + l.kcal, pesoKcal: 3, affina: true })]));
const giorno = (g, slot) => { const t = (m) => PASTI.reduce((s, [k]) => s + (+g.pasti[k][slot]?.[m] || 0), 0); return { kcal: t('kcal'), p: t('p'), c: t('c'), g: t('g') }; };
export function datiLivello(kcal) {
  const l = LIVELLO[kcal], sett = SETT[kcal];
  const gg = sett.map(g => ({ nome: g.nome, pasti: g.pasti, ...giorno(g, l.slot) }));
  const tot = (m) => gg.reduce((s, x) => s + x[m], 0), kc = tot('kcal');
  return { l, sett, gg, media: kc / 7, min: Math.min(...gg.map(x => x.kcal)), max: Math.max(...gg.map(x => x.kcal)),
    r: { p: Math.round(100 * tot('p') * 4 / kc), c: Math.round(100 * tot('c') * 4 / kc), g: Math.round(100 * tot('g') * 9 / kc), gp: Math.round(tot('p') / 7), gc: Math.round(tot('c') / 7), gg: Math.round(tot('g') / 7) },
    c: conteggio(sett) };
}
export const infograficaLivello = (kcal) => { const d = datiLivello(kcal);
  return svgMenu({ titolo: `Menù dieta da ${kcal} calorie`, sottotitolo: `Esempio di 7 giorni · circa ${kcal} kcal al giorno · proteine ${d.r.gp} g, carboidrati ${d.r.gc} g, grassi ${d.r.gg} g`,
    giorni: d.gg.map(g => ({ nome: g.nome, kcal: g.kcal, pasti: PASTI.map(([k, et]) => ({ etichetta: et, nome: g.pasti[k].nomeVis })) })),
    box: { titolo: 'Le regole del menù', righe: ['5 pasti al giorno, nessuno saltato', 'Olio EVO a crudo, col cucchiaio', 'Verdura a pranzo e a cena', 'Acqua: 1,5–2 litri al giorno', 'Porzioni su misura: menudieta.it'] },
    piede: 'Esempio indicativo, non sostituisce il parere di un medico o di un nutrizionista · www.menudieta.it' }); };

const nomeIng = (id) => String(BY_ID[id]?.nome || id).replace(/\s*\([^)]*\)/g, '').split(' / ')[0].trim().toLowerCase();
const voce = (id, v, u) => { const n = nomeIng(id).replace(/\bevo\b/, 'EVO');
  if (u !== 'pz') return `${quantita(v, u)} ${n}`;
  const num = quantita(v, 'pz').replace(/ pz$/, '');
  return `${num} ${n === 'uova' && v <= 1 ? 'uovo' : n}`; };
const ingredienti = (r, slot) => r.ingredients.map(id => { const q = r.quantita?.[id]; return q && q[slot] ? voce(id, q[slot], q.unit) : null; }).filter(Boolean).join(', ');

// Collegamenti tra i livelli di calorie (pagina centrale, pagine di stile, pagine per calorie)
export const htmlLivelli = (escludi, titolo = 'Menù dieta per calorie') => `<h2>${titolo}</h2>
<p class="menu-adatti">${LIVELLI.filter(l => l.kcal !== escludi).map(l => `<a href="/${l.slug}/">${l.kcal} kcal</a>`).join(' ')}</p>
<p class="note">Non sai quale scegliere? Calcola il tuo <a href="/calcolo-fabbisogno-calorico/">fabbisogno calorico</a>: per dimagrire in modo graduale si tolgono di solito 300–500 kcal al giorno.</p>`;

export function paginaCalorie(kcal, { APP, cta, dataIt = '' }) {
  const d = datiLivello(kcal), { l } = d, img = imgLivello(l), { w: imgW, h: imgH } = infograficaLivello(kcal);
  const porz = l.slot === 'donna' ? 'porzione donna' : 'porzione uomo';
  const i = LIVELLI.indexOf(l), meno = LIVELLI[i - 1], piu = LIVELLI[i + 1];
  const freq = ['legumi', 'pesce', 'carne', 'uova', 'formaggi', 'salumi'].filter(g => d.c[g]).map(g => `${g} ${d.c[g]}`).join(', ') + (d.c.vegetale ? `, piatti unici vegetali ${d.c.vegetale}` : '');
  const body = `
<p class="crumb"><a href="/">Home</a> · <a href="/menu-dieta/">Menù dieta</a> · ${kcal} calorie</p>
<h1>Menù dieta da ${kcal} calorie: esempio settimanale di 7 giorni</h1>
${htmlFirma(dataIt)}
<p class="lead">Un menù dieta da ${kcal} calorie al giorno, diviso in cinque pasti, è adatto indicativamente a ${l.chi} che vogliono perdere peso in modo graduale. Qui sotto trovi un esempio completo di 7 giorni con i grammi di ogni ingrediente: <strong>tra ${n0(d.min)} e ${n0(d.max)} kcal al giorno</strong>, in media ${d.r.gp} g di proteine, ${d.r.gc} g di carboidrati e ${d.r.gg} g di grassi, con lista della spesa e infografica da stampare.</p>
<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0"><a class="btn" href="${APP}">Crea il menù con le tue calorie →</a><a class="btn secondario" href="/${img.file}" download>Scarica l’immagine</a><button class="btn secondario" type="button" onclick="window.print()">Stampa</button></div>

<div class="inbreve"><strong>In breve</strong><ul>
<li><strong>Calorie</strong>: circa ${kcal} kcal al giorno (da ${n0(d.min)} a ${n0(d.max)}), in 5 pasti.</li>
<li><strong>Macronutrienti</strong> (media al giorno): proteine ${d.r.gp} g (${d.r.p}%), carboidrati ${d.r.gc} g (${d.r.c}%), grassi ${d.r.gg} g (${d.r.g}%).</li>
<li><strong>Proteine a rotazione</strong> su 14 pasti principali: ${freq}.</li>
<li><strong>Per chi</strong>: indicativamente ${l.chi}; fa dimagrire chi ha un fabbisogno di circa ${n0(l.fabb)} kcal o più.</li>
<li><strong>35 piatti</strong> con i grammi di ogni ingrediente, più la lista della spesa della settimana.</li>
</ul></div>

<figure class="infografica"><img src="/${img.file}" width="${imgW}" height="${imgH}" alt="Menù dieta da ${kcal} calorie: esempio settimanale di 7 giorni con colazione, spuntino, pranzo, merenda e cena" fetchpriority="high"><figcaption>L’infografica del menù dieta da ${kcal} calorie: salvala o stampala.</figcaption></figure>

<h2>Menù settimanale da ${kcal} calorie, giorno per giorno</h2>
<p>Le quantità sono a crudo e corrispondono alla ${porz} delle ricette di MenuDieta. Ogni piatto rimanda alla ricetta con la preparazione.</p>
<div class="settimana">
${d.gg.map(g => `<section class="giorno"><h3>${g.nome} <span>${n0(g.kcal)} kcal</span></h3><ul>${PASTI.map(([k, et]) => { const r = g.pasti[k]; return `<li><b>${et}</b><a href="/ricette/${r.slug}/">${esc(r.nomeVis)}</a> <span class="note">${n0(r[l.slot].kcal)} kcal</span><span class="ingr">${esc(ingredienti(r, l.slot))}</span></li>`; }).join('')}</ul></section>`).join('\n')}
</div>

<h2>Calorie e macronutrienti di ogni giorno</h2>
<div class="scroll"><table class="tabella"><tr><th>Giorno</th><th>Calorie</th><th>Proteine</th><th>Carboidrati</th><th>Grassi</th></tr>
${d.gg.map(g => `<tr><td>${g.nome}</td><td>${n0(g.kcal)} kcal</td><td>${n0(g.p)} g</td><td>${n0(g.c)} g</td><td>${n0(g.g)} g</td></tr>`).join('')}
<tr><td><strong>Media</strong></td><td><strong>${n0(d.media)} kcal</strong></td><td><strong>${d.r.gp} g (${d.r.p}%)</strong></td><td><strong>${d.r.gc} g (${d.r.c}%)</strong></td><td><strong>${d.r.gg} g (${d.r.g}%)</strong></td></tr></table></div>

<h2>Per chi è adatta una dieta da ${kcal} calorie</h2>
<p>Per perdere peso in modo graduale si mangiano di solito 300–500 kcal in meno del proprio fabbisogno: con 500 kcal in meno al giorno si perde circa mezzo chilo a settimana. Un menù da ${kcal} kcal è quindi indicato, a grandi linee, per chi ha un fabbisogno di circa ${n0(l.fabb)} kcal: ${l.chi}. ${l.nota}</p>
<p>Il numero giusto dipende da età, peso, altezza e attività: calcola il tuo <a href="/calcolo-fabbisogno-calorico/">fabbisogno calorico giornaliero</a> (metodo ${linkFonte('larn', 'LARN')}) prima di scegliere.${meno ? ` Se ti serve meno, guarda il <a href="/${meno.slug}/">menù da ${meno.kcal} calorie</a>.` : ''}${piu ? ` Se ti serve di più, guarda il <a href="/${piu.slug}/">menù da ${piu.kcal} calorie</a>.` : ''}</p>
<p class="note">Non è adatta a bambini e ragazzi, in gravidanza e in allattamento. Con patologie o farmaci serve il parere del medico.</p>

<h2>Come è costruito il menù</h2>
<ul>
  <li><strong>Calorie quasi uguali ogni giorno</strong>: da ${n0(d.min)} a ${n0(d.max)} kcal, così non serve compensare.</li>
  <li><strong>Fonti di proteine alternate</strong> su 14 pasti principali: ${freq}. Il riferimento delle ${linkFonte('crea', 'Linee guida CREA 2018')} è legumi 3, carne 3, formaggi 3, pesce 2, uova 2, salumi 1.</li>
  <li><strong>Ricette vere</strong>: calorie e macronutrienti sono calcolati sugli ingredienti con le ${linkFonte('tabelle', 'Tabelle di composizione degli alimenti')} del CREA.</li>
</ul>
${cta(`Il tuo menù dieta, con le tue calorie`)}

<h2>Lista della spesa del menù da ${kcal} calorie (una persona, 7 giorni)</h2>
<p>Per una famiglia l’app somma le porzioni di tutti e crea la <a href="/lista-della-spesa-automatica/">lista della spesa automatica</a>.</p>
${htmlSpesa(d.sett, l.slot)}

<h2>Dal menù di esempio al tuo menù su misura</h2>
<p>${kcal} calorie sono una cifra tonda, non la tua. <a href="${APP}">MenuDieta</a> calcola il fabbisogno di ogni persona di casa da età, peso, altezza e attività, e adatta le porzioni di ogni piatto: stesse ricette per tutti, grammi diversi per ciascuno, con la lista della spesa già pronta. Gratis e senza pubblicità.</p>
${htmlLivelli(kcal, 'Gli altri menù per calorie')}
<h2>Menù dieta per stile</h2>
<p class="menu-adatti"><a href="/menu-dieta/">🍽️ Equilibrato</a> ${STILI_MENU.map(s => `<a href="/${s.slug}/">${s.emoji} ${s.nome}</a>`).join(' ')}</p>
${htmlFonti(['larn', 'crea', 'tabelle'])}
<p class="note">Questo menù è un esempio indicativo per adulti sani e non sostituisce il parere di un medico o di un nutrizionista.</p>`;
  const faq = [
    [`Quanto si dimagrisce con una dieta da ${kcal} calorie?`, `Dipende dal tuo fabbisogno. Chi consuma circa ${n0(l.fabb)} kcal al giorno, con ${kcal} kcal è in deficit di 500 e perde circa mezzo chilo a settimana; chi consuma di meno perde più lentamente.`],
    [`Cosa si mangia in un giorno da ${kcal} calorie?`, `Cinque pasti. Per esempio ${d.gg[0].nome.toLowerCase()}: ${PASTI.map(([k]) => d.gg[0].pasti[k].nomeVis.toLowerCase()).join('; ')}. In tutto ${n0(d.gg[0].kcal)} kcal.`],
    [`${kcal} calorie al giorno sono poche?`, `${l.nota} Calcola il tuo fabbisogno calorico per capire se è il livello giusto per te.`],
    ['Posso seguire questo menù con la mia famiglia?', 'Le ricette sì, le quantità no: ognuno ha il suo fabbisogno. Nell’app MenuDieta i piatti sono gli stessi per tutti e le porzioni sono calcolate per ogni persona, bambini compresi.'],
  ];
  return {
    slug: l.slug, body, faq, img, imgW, imgH,
    schemaExtra: (mod) => [{
      '@context': 'https://schema.org', '@type': 'Article', headline: `Menù dieta da ${kcal} calorie: esempio settimanale di 7 giorni`, inLanguage: 'it',
      description: `Esempio di menù dieta da ${kcal} calorie al giorno: 7 giorni con 5 pasti, grammi di ogni ingrediente, macronutrienti, lista della spesa e infografica.`,
      image: [{ '@type': 'ImageObject', url: img.url, width: imgW, height: imgH, caption: `Menù dieta da ${kcal} calorie: esempio settimanale` }, `${SITE}/${img.og}`],
      datePublished: '2026-11-10', dateModified: mod,
      author: { '@type': 'Organization', name: 'Redazione MenuDieta', url: `${SITE}/chi-siamo/` },
      publisher: { '@id': `${SITE}/#org` }, mainEntityOfPage: `${SITE}/${l.slug}/`,
      about: [`dieta ${kcal} calorie`, 'menù dieta', 'menù settimanale'], citation: urlFonti(['larn', 'crea', 'tabelle']),
    }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Menù dieta', item: `${SITE}/menu-dieta/` },
      { '@type': 'ListItem', position: 3, name: `${kcal} calorie`, item: `${SITE}/${l.slug}/` }] }],
  };
}
