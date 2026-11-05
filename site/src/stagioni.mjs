// Pagine "frutta e verdura di stagione a [mese]": 12 pagine + 1 indice.
// Ricerca mensile ricorrente ("frutta e verdura di novembre"): ogni mese
// la pagina giusta torna in cima da sola. Il calendario è quello italiano
// (coltivazione in campo); ogni voce rimanda alla pagina calorie se esiste.
import { ALIMENTI, slug } from './generati.mjs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const MESI = ['', 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const Cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// [nome, mesi (1-12), tipo, nome della voce in ingredients.json (se diverso)]
const CAL = [
  // ── Verdure ──
  ['Carciofi', [1, 2, 3, 4, 5, 10, 11, 12], 'v'],
  ['Cavolfiore', [1, 2, 3, 10, 11, 12], 'v'],
  ['Broccoli', [1, 2, 3, 10, 11, 12], 'v'],
  ['Cime di rapa', [1, 2, 11, 12], 'v'],
  ['Cavolo verza', [1, 2, 3, 10, 11, 12], 'v', 'Cavolo / Verza'],
  ['Cavolo cappuccio', [1, 2, 3, 10, 11, 12], 'v', 'Cavolo cappuccio rosso'],
  ['Cavoletti di Bruxelles', [1, 2, 11, 12], 'v', 'Cavoli di bruxelles crudi'],
  ['Cavolo nero', [1, 2, 11, 12], 'v'],
  ['Finocchi', [1, 2, 3, 4, 10, 11, 12], 'v'],
  ['Porri', [1, 2, 3, 10, 11, 12], 'v'],
  ['Radicchio', [1, 2, 3, 10, 11, 12], 'v'],
  ['Spinaci', [1, 2, 3, 4, 10, 11, 12], 'v', 'Spinaci freschi'],
  ['Bieta', [1, 2, 3, 4, 5, 10, 11, 12], 'v', 'Bieta cruda'],
  ['Cicoria', [1, 2, 3, 4, 10, 11, 12], 'v', 'Cicoria da taglio coltivata'],
  ['Indivia', [1, 2, 3, 10, 11, 12], 'v'],
  ['Zucca', [1, 9, 10, 11, 12], 'v'],
  ['Cardi', [1, 2, 11, 12], 'v', 'Cardi crudi'],
  ['Rape', [1, 2, 3, 10, 11, 12], 'v', 'Rape crude'],
  ['Sedano rapa', [1, 2, 10, 11, 12], 'v'],
  ['Barbabietole', [1, 2, 3, 9, 10, 11, 12], 'v'],
  ['Carote', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'v'],
  ['Patate', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'v'],
  ['Cipolle', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'v', 'Cipolla'],
  ['Aglio', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'v'],
  ['Funghi', [9, 10, 11], 'v', 'Funghi porcini'],
  ['Asparagi', [3, 4, 5, 6], 'v'],
  ['Agretti', [3, 4, 5], 'v'],
  ['Fave', [4, 5, 6], 'v', 'Fave fresche crude'],
  ['Piselli', [4, 5, 6], 'v', 'Piselli freschi crudi'],
  ['Ravanelli', [3, 4, 5, 6, 9, 10], 'v'],
  ['Rucola', [3, 4, 5, 6, 7, 8, 9, 10], 'v', 'Rughetta o rucola'],
  ['Lattuga', [3, 4, 5, 6, 7, 8, 9, 10, 11], 'v', 'Lattuga / Songino / Iceberg'],
  ['Fagiolini', [5, 6, 7, 8, 9], 'v'],
  ['Zucchine', [5, 6, 7, 8, 9], 'v'],
  ['Fiori di zucca', [5, 6, 7, 8, 9], 'v'],
  ['Cetrioli', [5, 6, 7, 8, 9], 'v'],
  ['Pomodori', [6, 7, 8, 9], 'v', 'Pomodori / pomodorini'],
  ['Peperoni', [6, 7, 8, 9, 10], 'v'],
  ['Melanzane', [6, 7, 8, 9], 'v'],
  ['Sedano', [6, 7, 8, 9, 10, 11], 'v'],
  ['Mais', [7, 8, 9], 'v', 'Mais (fresco/surgelato)'],
  ['Basilico', [5, 6, 7, 8, 9], 'v', 'Basilico fresco'],
  // ── Frutta ──
  ['Arance', [1, 2, 3, 4, 11, 12], 'f'],
  ['Mandarini', [1, 2, 11, 12], 'f'],
  ['Clementine', [1, 11, 12], 'f'],
  ['Pompelmo', [1, 2, 3, 12], 'f'],
  ['Limoni', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 'f', 'Limone / Lime'],
  ['Kiwi', [1, 2, 3, 4, 11, 12], 'f'],
  ['Mele', [1, 2, 3, 4, 9, 10, 11, 12], 'f'],
  ['Pere', [1, 2, 9, 10, 11, 12], 'f'],
  ['Cachi', [10, 11, 12], 'f', 'Loti o kaki'],
  ['Melograno', [10, 11, 12], 'f'],
  ['Castagne', [10, 11, 12], 'f'],
  ['Uva', [8, 9, 10, 11], 'f'],
  ['Fichi', [8, 9, 10], 'f'],
  ['Prugne', [7, 8, 9], 'f'],
  ['Pesche e nettarine', [6, 7, 8, 9], 'f', 'Pesche / Nettarine'],
  ['Albicocche', [6, 7], 'f'],
  ['Ciliegie', [5, 6, 7], 'f'],
  ['Fragole', [4, 5, 6], 'f'],
  ['Nespole', [4, 5, 6], 'f'],
  ['Anguria', [6, 7, 8, 9], 'f'],
  ['Melone', [6, 7, 8, 9], 'f'],
  ['Lamponi', [6, 7, 8, 9], 'f'],
  ['Mirtilli', [6, 7, 8, 9], 'f'],
  ['More', [7, 8, 9], 'f', 'Mora di rovo'],
  ['Fichi d’India', [8, 9, 10], 'f', "Fichi d'India"],
  ['Mele cotogne', [10, 11], 'f'],
];

const trova = (nome, alt) => ALIMENTI.find(a => a.nome.toLowerCase() === (alt || nome).toLowerCase() || a.nome.toLowerCase() === nome.toLowerCase());
const link = ([nome, , , alt]) => { const a = trova(nome, alt); return a ? `<a href="/alimenti/${a.slug}/">${esc(nome)}</a>` : esc(nome); };
const perMese = (m, tipo) => CAL.filter(c => c[2] === tipo && c[1].includes(m));
const inizia = (m, tipo) => CAL.filter(c => c[2] === tipo && c[1].includes(m) && !c[1].includes(m === 1 ? 12 : m - 1));
const finisce = (m, tipo) => CAL.filter(c => c[2] === tipo && c[1].includes(m) && !c[1].includes(m === 12 ? 1 : m + 1));
const lista = (L) => L.map(link).join(' · ');
const nomi = (L) => L.map(c => c[0].toLowerCase());
const ricetteCon = (m) => { // ricette dell'app che usano un prodotto di stagione nel mese
  const ids = new Set(perMese(m, 'v').concat(perMese(m, 'f')).map(c => trova(c[0], c[3])?.id).filter(Boolean));
  return ids;
};

export const slugMese = (m) => `frutta-verdura-di-stagione/${MESI[m]}`;

export function paginaMese(m, { cta, RICETTE }) {
  const mese = MESI[m], V = perMese(m, 'v'), F = perMese(m, 'f');
  const nuoviV = inizia(m, 'v'), nuoviF = inizia(m, 'f'), ultimiV = finisce(m, 'v'), ultimiF = finisce(m, 'f');
  const ids = ricetteCon(m);
  const ric = RICETTE.filter(r => r.ingredients.some(id => ids.has(id))).slice(0, 10);
  const prev = m === 1 ? 12 : m - 1, next = m === 12 ? 1 : m + 1;
  const faq = [
    [`Quale frutta è di stagione a ${mese}?`, `A ${mese} in Italia si trovano: ${nomi(F).join(', ')}.`],
    [`Quale verdura è di stagione a ${mese}?`, `Le verdure di ${mese} sono: ${nomi(V).join(', ')}.`],
    [`Perché conviene comprare frutta e verdura di stagione?`, `Costa meno (c’è abbondanza), ha più sapore e più nutrienti (viene raccolta matura), e di solito arriva da più vicino. MenuDieta propone nel menu settimanale i prodotti del mese in corso.`],
  ];
  const body = `
<p class="crumb"><a href="/">Home</a> · <a href="/frutta-verdura-di-stagione/">Frutta e verdura di stagione</a> · ${Cap(mese)}</p>
<h1>Frutta e verdura di stagione a ${mese}</h1>
<p class="lead">A ${mese} in Italia sono di stagione <strong>${V.length} verdure</strong> e <strong>${F.length} frutti</strong>. In cima alla lista: ${nomi(V.slice(0, 4)).join(', ')}, ${nomi(F.slice(0, 3)).join(', ')}. Ogni prodotto rimanda alla sua tabella di calorie e valori nutrizionali.</p>
<h2>Verdura di ${mese}</h2>
<p class="stagione">${lista(V)}</p>
${nuoviV.length ? `<p class="note">Arrivano a ${mese}: ${nomi(nuoviV).join(', ')}.${ultimiV.length ? ` Ultimo mese per: ${nomi(ultimiV).join(', ')}.` : ''}</p>` : ultimiV.length ? `<p class="note">Ultimo mese per: ${nomi(ultimiV).join(', ')}.</p>` : ''}
<h2>Frutta di ${mese}</h2>
<p class="stagione">${lista(F)}</p>
${nuoviF.length ? `<p class="note">Arrivano a ${mese}: ${nomi(nuoviF).join(', ')}.${ultimiF.length ? ` Ultimo mese per: ${nomi(ultimiF).join(', ')}.` : ''}</p>` : ultimiF.length ? `<p class="note">Ultimo mese per: ${nomi(ultimiF).join(', ')}.</p>` : ''}
<h2>Tabella di ${mese}: calorie per 100 g</h2>
<div class="scroll"><table class="tabella"><tr><th>Prodotto</th><th>Tipo</th><th>Calorie</th><th>Fibre</th><th>Di stagione anche a</th></tr>
${[...V, ...F].map(c => { const a = trova(c[0], c[3]); const nz = a?.nutrizione; return `<tr><td>${link(c)}</td><td>${c[2] === 'v' ? 'verdura' : 'frutta'}</td><td>${nz ? `${Math.round(nz.kcal)} kcal` : '—'}</td><td>${nz?.f != null ? `${(Math.round(nz.f * 10) / 10).toLocaleString('it-IT')} g` : '—'}</td><td class="note">${c[1].filter(x => x !== m).map(x => MESI[x].slice(0, 3)).join(' ')}</td></tr>`; }).join('')}
</table></div>
${ric.length ? `<h2>Ricette con gli ingredienti di ${mese}</h2><ul>${ric.map(r => `<li><a href="/ricette/${r.slug}/">${esc(r.nomeVis)}</a> <span class="note">(${Math.round(r.donna?.kcal || 0)} kcal porzione donna)</span></li>`).join('')}</ul>` : ''}
${cta(`Il menu di ${mese} si fa da solo con quello che è di stagione`)}
<p>MenuDieta conosce la stagione di ogni ingrediente: nel <a href="/menu-settimanale-famiglia/">menu settimanale della famiglia</a> mette i prodotti di ${mese}, con le porzioni di ciascuno, e li aggiunge alla <a href="/lista-della-spesa-automatica/">lista della spesa</a>.</p>
<h2>Gli altri mesi</h2>
<p><a href="/${slugMese(prev)}/">← ${Cap(MESI[prev])}</a> · <a href="/${slugMese(next)}/">${Cap(MESI[next])} →</a> · <a href="/frutta-verdura-di-stagione/">calendario di tutto l’anno</a></p>`;
  return {
    slug: slugMese(m),
    title: `Frutta e verdura di stagione a ${mese}: la lista completa`,
    description: `Di stagione a ${mese} in Italia: ${V.length} verdure e ${F.length} frutti (${nomi(V.slice(0, 3)).join(', ')}, ${nomi(F.slice(0, 2)).join(', ')}…) con calorie per 100 g e ricette per la famiglia.`,
    body, faq,
    schema: [{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.menudieta.it/' },
      { '@type': 'ListItem', position: 2, name: 'Frutta e verdura di stagione', item: 'https://www.menudieta.it/frutta-verdura-di-stagione/' },
      { '@type': 'ListItem', position: 3, name: Cap(mese), item: `https://www.menudieta.it/${slugMese(m)}/` }] }],
  };
}

export function indiceStagioni({ cta }) {
  const oggi = new Date().getMonth() + 1;
  const body = `<p class="crumb"><a href="/">Home</a> · Frutta e verdura di stagione</p>
<h1>Frutta e verdura di stagione: il calendario mese per mese</h1>
<p class="lead">Cosa comprare in ogni mese dell’anno in Italia: ${CAL.filter(c => c[2] === 'v').length} verdure e ${CAL.filter(c => c[2] === 'f').length} frutti con il loro periodo di raccolta. Apri il mese che ti interessa: trovi la lista, le calorie per 100 g e le ricette.</p>
<div class="cards">${MESI.slice(1).map((mese, i) => { const m = i + 1; return `<a class="card${m === oggi ? ' ora' : ''}" href="/${slugMese(m)}/"><h2>${Cap(mese)}${m === oggi ? ' <span class="note">· questo mese</span>' : ''}</h2><p>${nomi(perMese(m, 'v').slice(0, 3)).join(', ')}, ${nomi(perMese(m, 'f').slice(0, 2)).join(', ')}…</p></a>`; }).join('')}</div>
<h2>Calendario completo</h2>
<div class="scroll"><table class="tabella"><tr><th>Prodotto</th>${MESI.slice(1).map(x => `<th>${Cap(x.slice(0, 3))}</th>`).join('')}</tr>
${['v', 'f'].map(t => CAL.filter(c => c[2] === t).sort((a, b) => a[0].localeCompare(b[0], 'it')).map(c => `<tr><td>${link(c)}</td>${MESI.slice(1).map((_, i) => `<td class="${c[1].includes(i + 1) ? 'si' : ''}">${c[1].includes(i + 1) ? '●' : ''}</td>`).join('')}</tr>`).join('')).join('')}
</table></div>
${cta('Un menu che segue le stagioni, senza pensarci')}`;
  return {
    slug: 'frutta-verdura-di-stagione',
    title: 'Frutta e verdura di stagione: calendario mese per mese',
    description: 'Calendario italiano della frutta e verdura di stagione, mese per mese, con calorie per 100 g e ricette: cosa comprare a gennaio, febbraio… dicembre.',
    body,
    faq: [
      ['Come si legge il calendario?', 'Ogni riga è un prodotto, ogni colonna un mese: il pallino indica che in quel mese il prodotto è di stagione in Italia (coltivazione in campo). Le stagioni possono spostarsi di qualche settimana tra nord e sud.'],
      ['Perché alcune verdure sono di stagione tutto l’anno?', 'Carote, patate, cipolle e aglio si conservano bene e si raccolgono in più periodi: si trovano italiani in ogni mese.'],
    ],
  };
}
