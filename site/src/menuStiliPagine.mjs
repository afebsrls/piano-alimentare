// Pagine "menù dieta <stile>": un gruppo di pagine attorno a /menu-dieta/ (la pagina centrale).
// Ogni pagina mostra una settimana d'esempio costruita con le STESSE regole che l'app usa
// quando si sceglie quel menù (src/core/menuStili.js), con il pulsante per impostarlo con un tocco.
import { STILI_MENU, STILE_BY_ID } from '../../src/core/menuStili.js';
import { scegliSettimana, media, conteggio, ripartizione, htmlSettimana, htmlSpesa, PASTI, n0, esc } from './menuDieta.mjs';
import { svgMenu } from './immagini.mjs';
import { htmlFonti, htmlFirma, urlFonti, linkFonte } from './fonti.mjs';
import { htmlLivelli } from './menuCalorie.mjs';

export const SITE = 'https://www.menudieta.it';
export const imgStile = (s) => ({ file: `${s.slug}/${s.slug}-settimanale.webp`, url: `${SITE}/${s.slug}/${s.slug}-settimanale.webp`, og: `${s.slug}/${s.slug}-og.jpg` });
const SETT = Object.fromEntries(STILI_MENU.map(s => [s.id, scegliSettimana(s.id)]));
export const settimanaStile = (id) => SETT[id];
const tondo = (v) => Math.round(v / 10) * 10;

// Testi specifici di ogni stile. dati = { md, mu, r (ripartizione), c (conteggio) }
const T = {
  mediterranea: {
    titoloImg: 'Menù dieta mediterranea',
    h1: 'Menù dieta mediterranea: esempio settimanale di 7 giorni',
    nome: 'menù dieta mediterranea',
    lead: (d) => `Un menù dieta mediterranea si basa su cereali integrali, verdura, frutta, legumi, pesce e olio extravergine d’oliva, con poca carne rossa e pochi dolci. Qui sotto trovi un esempio di 7 giorni costruito con le ricette di MenuDieta: <strong>circa ${n0(tondo(d.md))} kcal al giorno</strong> nella porzione per una donna (${n0(tondo(d.mu))} per un uomo), legumi ${d.c.legumi || 0} volte e pesce ${d.c.pesce || 0} volte a settimana, con lista della spesa e infografica da stampare.`,
    regole: ['Olio EVO a crudo, ogni giorno', 'Legumi 4 volte, pesce 3 a settimana', 'Cereali integrali a ogni pasto', 'Niente salumi né carne rossa', 'Porzioni su misura: menudieta.it'],
    corpo: (d) => `
<h2>Che cos’è la dieta mediterranea</h2>
<p>È il modo di mangiare tradizionale dei Paesi che si affacciano sul Mediterraneo, studiato dagli anni ’50 e riconosciuto dall’${linkFonte('unesco', 'UNESCO nel 2010')} come patrimonio culturale immateriale dell’umanità. Più che una dieta è un modello: tanti alimenti vegetali, l’olio extravergine d’oliva come grasso principale, pesce e legumi come fonti di proteine, porzioni moderate di formaggi, uova e carne bianca, carne rossa e dolci solo ogni tanto.</p>
<h2>Come è costruito questo menù mediterraneo</h2>
<ul>
  <li><strong>Proteine a rotazione.</strong> Sui 14 pasti principali: legumi ${d.c.legumi || 0}, pesce ${d.c.pesce || 0}, carne bianca ${d.c.carne || 0}, uova ${d.c.uova || 0}, formaggi ${d.c.formaggi || 0}${d.c.vegetale ? `, piatti unici vegetali ${d.c.vegetale}` : ''}. Le ${linkFonte('crea', 'Linee guida CREA 2018')} indicano almeno legumi 3 volte e pesce 2 volte a settimana: qui sono di più, come nella tradizione mediterranea.</li>
  <li><strong>Niente salumi né carne rossa.</strong> L’app esclude dal menù mediterraneo le ricette con salumi, manzo, maiale, agnello e salsiccia, e i dolci confezionati.</li>
  <li><strong>Calorie dai carboidrati complessi.</strong> In media il ${d.r.c}% delle calorie arriva dai carboidrati, il ${d.r.g}% dai grassi (soprattutto olio EVO e frutta secca) e il ${d.r.p}% dalle proteine.</li>
</ul>`,
    faq: (d) => [
      ['Cosa si mangia nella dieta mediterranea?', 'Ogni giorno cereali (meglio integrali), verdura, frutta, olio extravergine d’oliva e un po’ di frutta secca; più volte a settimana legumi e pesce; con moderazione uova, formaggi e carne bianca; carne rossa, salumi e dolci solo ogni tanto.'],
      ['La dieta mediterranea fa dimagrire?', 'È un modello alimentare, non una dieta ipocalorica: si dimagrisce quando le porzioni danno meno calorie di quelle che si consumano. Per questo MenuDieta calcola le grammature di ogni piatto sul fabbisogno di ogni persona.'],
      ['Quante volte a settimana legumi e pesce?', `Le Linee guida CREA 2018 indicano almeno 3 porzioni di legumi e 2 di pesce a settimana. In questo esempio di menù mediterraneo i legumi sono ${d.c.legumi || 0} e il pesce ${d.c.pesce || 0}.`],
      ['Posso impostare il menù mediterraneo per tutta la famiglia?', 'Sì: nell’app scegli “Mediterranea” nel riquadro Menù dieta della pagina Piano. Le ricette sono le stesse per tutti, le porzioni cambiano per ogni persona di casa.'],
    ],
  },
  lowcarb: {
    titoloImg: 'Menù low carb',
    h1: 'Menù low carb settimanale: esempio di 7 giorni',
    nome: 'menù low carb',
    lead: (d) => `Un menù low carb riduce i carboidrati (pane, pasta, riso, dolci) e punta su verdure, proteine e grassi buoni. In questo esempio di 7 giorni ogni pasto prende dai carboidrati al massimo il 30% delle sue calorie: in media il <strong>${d.r.c}% della giornata, circa ${d.r.gc} g di carboidrati al giorno</strong> per una donna, con circa ${n0(tondo(d.md))} kcal (${n0(tondo(d.mu))} per un uomo). Trovi anche la lista della spesa e l’infografica da stampare.`,
    regole: ['Carboidrati: max 30% di ogni pasto', 'Verdura a volontà, a ogni pasto', 'Proteine e grassi buoni a ogni pasto', 'Acqua: 1,5–2 litri al giorno', 'Porzioni su misura: menudieta.it'],
    corpo: (d) => `
<h2>Che cosa vuol dire low carb</h2>
<p>Non esiste un’unica definizione. Una delle più usate considera “low carb” un’alimentazione con meno di circa 130 g di carboidrati al giorno, o meno del 26% delle calorie; sotto i 50 g al giorno si parla di dieta chetogenica, che è un’altra cosa e va seguita con un medico. Questo menù è un low carb moderato: in media ${d.r.gc} g di carboidrati al giorno nella porzione donna, il ${d.r.c}% delle calorie.</p>
<h2>Come è costruito questo menù low carb</h2>
<ul>
  <li><strong>Colazioni senza zuccheri aggiunti.</strong> Uova, yogurt greco, skyr e fiocchi di latte con frutta secca e frutti di bosco al posto di biscotti e cereali.</li>
  <li><strong>Pranzo e cena con proteine e verdura.</strong> Pesce, carne bianca, uova, formaggi e tofu, sempre con verdura; pane e cereali in piccole quantità o assenti.</li>
  <li><strong>Grassi buoni al posto dei carboidrati.</strong> In media il ${d.r.g}% delle calorie arriva dai grassi (olio EVO, avocado, frutta secca, pesce azzurro) e il ${d.r.p}% dalle proteine.</li>
</ul>
<h2>Per chi è (e per chi no)</h2>
<p>Un menù povero di carboidrati non è adatto ai bambini e ai ragazzi in crescita: in famiglia conviene che aggiungano al proprio piatto pane, pasta o frutta. Chi ha il diabete e prende farmaci, chi è in gravidanza o ha una malattia dei reni deve parlarne prima con il medico, perché cambiare molto i carboidrati può richiedere di adattare la terapia.</p>`,
    faq: (d) => [
      ['Quanti carboidrati si mangiano in una dieta low carb?', `Dipende dalla definizione: una delle più usate indica meno di circa 130 g al giorno. In questo esempio la media è di ${d.r.gc} g al giorno nella porzione donna, il ${d.r.c}% delle calorie.`],
      ['Low carb e dieta chetogenica sono la stessa cosa?', 'No. La chetogenica scende di solito sotto i 50 g di carboidrati al giorno per mettere il corpo in chetosi e va seguita da un medico; il low carb di questo menù è moderato e include frutta, legumi e un po’ di cereali.'],
      ['Il menù low carb va bene anche per i bambini?', 'No: ai bambini e ai ragazzi in crescita servono i carboidrati. Se in famiglia qualcuno segue il menù low carb, ai più piccoli basta aggiungere pane, pasta, riso o frutta al proprio piatto.'],
      ['Come imposto il menù low carb nell’app?', 'Nella pagina Piano tocca “Menù dieta” e scegli “Low carb”: il piano da oggi in avanti userà solo ricette con al massimo il 30% delle calorie dai carboidrati, con le porzioni di ogni persona.'],
    ],
  },
  proteica: {
    titoloImg: 'Menù dieta proteica',
    h1: 'Menù dieta proteica settimanale: esempio di 7 giorni',
    nome: 'menù dieta proteica',
    lead: (d) => `Un menù dieta proteica mette una buona fonte di proteine in ogni pasto: pesce, carne bianca, uova, legumi, yogurt greco e latticini magri. In questo esempio di 7 giorni pranzo e cena prendono dalle proteine almeno il 30% delle calorie: in media il <strong>${d.r.p}% della giornata, circa ${d.r.gp} g di proteine al giorno</strong> per una donna, con circa ${n0(tondo(d.md))} kcal (${n0(tondo(d.mu))} per un uomo). Con lista della spesa e infografica da stampare.`,
    regole: ['Proteine: almeno 30% a pranzo e cena', 'Uova, pesce, legumi, latticini magri', 'Verdura a ogni pasto principale', 'Acqua: 1,5–2 litri al giorno', 'Porzioni su misura: menudieta.it'],
    corpo: (d) => `
<h2>Quante proteine servono</h2>
<p>Per un adulto i ${linkFonte('larn', 'LARN')} (i livelli di riferimento italiani) indicano 0,9 g di proteine per chilo di peso al giorno. Chi sta dimagrendo o si allena spesso ne usa spesso di più, in genere tra 1,2 e 1,6 g per chilo, per conservare la massa muscolare e sentire meno fame. Questo menù arriva a circa ${d.r.gp} g al giorno nella porzione donna: per una donna di 65 kg sono circa ${(Math.round(d.r.gp / 65 * 10) / 10).toLocaleString('it-IT')} g per chilo.</p>
<h2>Come è costruito questo menù proteico</h2>
<ul>
  <li><strong>Colazioni proteiche.</strong> Uova, albumi, skyr, yogurt greco e fiocchi di latte: almeno il 25% delle calorie della colazione arriva dalle proteine.</li>
  <li><strong>Fonti diverse a pranzo e cena.</strong> Sui 14 pasti principali: pesce ${d.c.pesce || 0}, carne ${d.c.carne || 0}, uova ${d.c.uova || 0}, legumi ${d.c.legumi || 0}, formaggi ${d.c.formaggi || 0}${d.c.salumi ? `, salumi magri ${d.c.salumi}` : ''}.</li>
  <li><strong>Carboidrati presenti, non eliminati.</strong> In media il ${d.r.c}% delle calorie: pane e cereali integrali restano, in porzioni più piccole. Non è una dieta iperproteica estrema.</li>
</ul>
<h2>Attenzioni</h2>
<p>Chi ha una malattia dei reni o del fegato deve concordare la quota di proteine con il medico. A tutti gli altri conviene bere a sufficienza e variare le fonti, alternando proteine animali e vegetali.</p>`,
    faq: (d) => [
      ['Quante proteine al giorno in una dieta proteica?', `Non c’è una soglia unica: i LARN indicano 0,9 g per chilo di peso per un adulto, e chi dimagrisce o si allena spesso arriva a 1,2–1,6 g per chilo. In questo esempio la porzione donna ne ha circa ${d.r.gp} g al giorno.`],
      ['La dieta proteica fa male ai reni?', 'In una persona sana una quota di proteine moderatamente più alta, come in questo menù, non risulta dannosa. Chi ha già una malattia renale deve invece stabilire le proteine con il proprio medico.'],
      ['Si possono mangiare pane e pasta in una dieta proteica?', `Sì: in questo menù i carboidrati sono il ${d.r.c}% delle calorie. Le proteine crescono, ma pane, pasta e cereali integrali restano in porzioni più piccole.`],
      ['Come imposto il menù proteico nell’app?', 'Nella pagina Piano tocca “Menù dieta” e scegli “Proteica”: da oggi il piano userà ricette con più proteine, con le porzioni calcolate per ogni persona di casa.'],
    ],
  },
  vegetariana: {
    titoloImg: 'Menù dieta vegetariana',
    h1: 'Menù dieta vegetariana settimanale: esempio di 7 giorni',
    nome: 'menù dieta vegetariana',
    lead: (d) => `Un menù dieta vegetariana esclude carne, pesce e salumi e prende le proteine da legumi, uova, latticini e tofu. Qui sotto trovi un esempio latto-ovo-vegetariano di 7 giorni con le ricette di MenuDieta: <strong>circa ${n0(tondo(d.md))} kcal al giorno</strong> nella porzione per una donna (${n0(tondo(d.mu))} per un uomo), legumi ${d.c.legumi || 0} volte nei pasti principali, con lista della spesa e infografica da stampare.`,
    regole: ['Legumi ogni giorno, a rotazione', 'Uova e latticini per le proteine', 'Vitamina C con i legumi (ferro)', 'Frutta secca e semi tutti i giorni', 'Porzioni su misura: menudieta.it'],
    corpo: (d) => `
<h2>Come si equilibra un menù vegetariano</h2>
<ul>
  <li><strong>Proteine complete.</strong> Legumi e cereali nella stessa giornata si completano a vicenda; uova, yogurt e formaggi aggiungono proteine di alta qualità. Sui 14 pasti principali di questo esempio: legumi ${d.c.legumi || 0}, uova ${d.c.uova || 0}, formaggi ${d.c.formaggi || 0}${d.c.vegetale ? `, piatti unici vegetali ${d.c.vegetale}` : ''}.</li>
  <li><strong>Ferro.</strong> Legumi, verdure a foglia verde e cereali integrali ne sono ricchi; il ferro vegetale si assorbe meglio se nello stesso pasto c’è vitamina C (limone, agrumi, peperoni, pomodori).</li>
  <li><strong>Vitamina B12 e omega-3.</strong> Uova e latticini forniscono B12; chi li riduce molto dovrebbe parlarne con il medico. Noci, semi di lino e di chia aiutano per gli omega-3.</li>
</ul>
<p>In media il ${d.r.p}% delle calorie arriva dalle proteine, il ${d.r.c}% dai carboidrati e il ${d.r.g}% dai grassi.</p>`,
    faq: (d) => [
      ['Una dieta vegetariana è completa?', 'Secondo le principali società scientifiche di nutrizione, una dieta vegetariana ben pianificata è adeguata a tutte le età. La chiave è variare: legumi, cereali integrali, uova, latticini, verdura, frutta e frutta secca.'],
      ['Quante volte si mangiano i legumi in un menù vegetariano?', `Spesso, anche tutti i giorni a rotazione. In questo esempio sono la fonte principale di ${d.c.legumi || 0} pasti su 14, oltre agli spuntini con hummus.`],
      ['I bambini possono seguire il menù vegetariano?', 'Sì, se è ben pianificato e concordato con il pediatra. Nell’app le porzioni dei bambini sono calcolate sul loro fabbisogno, come per gli adulti.'],
      ['Come imposto il menù vegetariano nell’app?', 'Nella pagina Piano tocca “Menù dieta” e scegli “Vegetariana”: da oggi il piano non avrà più carne, pesce e salumi, con le porzioni giuste per ogni persona di casa.'],
    ],
  },
};
export const titoloImgStile = (id) => T[id].titoloImg;

export function datiInfograficaStile(id) {
  const sett = SETT[id];
  return {
    titolo: T[id].titoloImg,
    sottotitolo: `Esempio di 7 giorni · circa ${n0(tondo(media('donna', sett)))} kcal al giorno (porzione donna)`,
    giorni: sett.map(g => ({ nome: g.nome, kcal: g.donna, pasti: PASTI.map(([k, et]) => ({ etichetta: et, nome: g.pasti[k].nomeVis })) })),
    box: { titolo: 'Le regole del menù', righe: T[id].regole },
    piede: 'Esempio indicativo, non sostituisce il parere di un medico o di un nutrizionista · www.menudieta.it',
  };
}
export const infograficaStile = (id) => svgMenu(datiInfograficaStile(id));

// Riquadri verso gli altri menù (pagina centrale e pagine di stile)
export function htmlAltriMenu(escludi, titolo = 'Scegli il tuo menù dieta') {
  return `<h2>${titolo}</h2>
<div class="grid menu-stili">${STILI_MENU.filter(s => s.id !== escludi).map(s => `<a class="box" href="/${s.slug}/"><h3>${s.emoji} Menù ${s.nome.toLowerCase()}</h3><p>${esc(s.breve)}</p><span class="note">Esempio di 7 giorni →</span></a>`).join('')}${escludi ? `<a class="box" href="/menu-dieta/"><h3>🍽️ Menù dieta equilibrato</h3><p>Tutte le ricette a rotazione, circa 1500 kcal al giorno nella porzione donna.</p><span class="note">Esempio di 7 giorni →</span></a>` : ''}</div>
<p class="note">Ognuno di questi menù si imposta con un tocco nell’app: il piano cambia stile, le porzioni restano calcolate per ogni persona di casa.</p>`;
}

const FONTI_STILE = { mediterranea: ['crea', 'unesco', 'larn', 'tabelle'], lowcarb: ['larn', 'crea', 'tabelle'], proteica: ['larn', 'crea', 'tabelle'], vegetariana: ['crea', 'larn', 'tabelle'] };
export function paginaStile(id, { APP, cta, dataIt = '' }) {
  const s = STILE_BY_ID[id], t = T[id], sett = SETT[id], img = imgStile(s);
  const { w: imgW, h: imgH } = infograficaStile(id);
  const d = { md: media('donna', sett), mu: media('uomo', sett), mb: media('bimbo', sett), r: ripartizione(sett), c: conteggio(sett) };
  const link = `${APP}?menu=${id}`;
  const body = `
<p class="crumb"><a href="/">Home</a> · <a href="/menu-dieta/">Menù dieta</a> · ${s.nome}</p>
<h1>${t.h1}</h1>
${htmlFirma(dataIt)}
<p class="lead">${t.lead(d)}</p>
<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0"><a class="btn" href="${link}">Imposta questo menù nell’app →</a><a class="btn secondario" href="/${img.file}" download>Scarica l’immagine</a><button class="btn secondario" type="button" onclick="window.print()">Stampa</button></div>

<div class="inbreve"><strong>In breve</strong><ul>
<li><strong>Regola del menù</strong>: ${s.regola}.</li>
<li><strong>Calorie</strong>: in media ${n0(d.md)} kcal al giorno per una donna, ${n0(d.mu)} per un uomo.</li>
<li><strong>Macronutrienti</strong> (porzione donna): proteine ${d.r.gp} g (${d.r.p}%), carboidrati ${d.r.gc} g (${d.r.c}%), grassi ${d.r.gg} g (${d.r.g}%).</li>
<li><strong>35 piatti</strong> con grammi e preparazione, lista della spesa, infografica.</li>
<li><strong>Si imposta con un tocco</strong> nell’app gratuita, con le porzioni per ogni persona di casa.</li>
</ul></div>

<figure class="infografica"><img src="/${img.file}" width="${imgW}" height="${imgH}" alt="${esc(t.titoloImg)} settimanale: esempio di 7 giorni con colazione, spuntino, pranzo, merenda e cena" fetchpriority="high"><figcaption>L’infografica del ${t.nome} settimanale: salvala o stampala.</figcaption></figure>

<h2>Esempio di ${t.nome} settimanale, giorno per giorno</h2>
<p>Ogni piatto rimanda alla sua ricetta, con ingredienti e grammi per uomo, donna e bambino. Le calorie sono quelle della porzione donna; tra parentesi il totale della giornata per un uomo.</p>
${htmlSettimana(sett)}

<h2>Calorie e macronutrienti del menù</h2>
<div class="scroll"><table class="tabella"><tr><th>Giorno</th><th>👩 Donna</th><th>👨 Uomo</th><th>Proteine</th><th>Carboidrati</th><th>Grassi</th></tr>
${sett.map(g => `<tr><td>${g.nome}</td><td>${n0(g.donna)} kcal</td><td>${n0(g.uomo)} kcal</td><td>${n0(g.macro.p)} g</td><td>${n0(g.macro.c)} g</td><td>${n0(g.macro.g)} g</td></tr>`).join('')}
<tr><td><strong>Media</strong></td><td><strong>${n0(d.md)} kcal</strong></td><td><strong>${n0(d.mu)} kcal</strong></td><td><strong>${d.r.gp} g (${d.r.p}%)</strong></td><td><strong>${d.r.gc} g (${d.r.c}%)</strong></td><td><strong>${d.r.gg} g (${d.r.g}%)</strong></td></tr></table></div>
<p class="note">Grammi e percentuali si riferiscono alla porzione donna. Nell’app le porzioni sono calcolate sul fabbisogno reale di ogni persona.</p>
${t.corpo(d)}
${cta(`Imposta il ${t.nome} con un tocco`)}

<h2>Lista della spesa del ${t.nome} (una persona, 7 giorni)</h2>
<p>Le quantità della settimana per una persona (porzione donna). Per una famiglia l’app somma le porzioni di tutti e crea la <a href="/lista-della-spesa-automatica/">lista della spesa automatica</a>.</p>
${htmlSpesa(sett)}

<h2>Dal menù di esempio al tuo ${t.nome}</h2>
<p>Nell’app <a href="${link}">MenuDieta</a> scegli “${s.nome}” nel riquadro Menù dieta della pagina Piano: il piano si rigenera con le ricette di questo stile, sempre diverse di settimana in settimana, con le porzioni per ogni persona di casa, la lista della spesa e il conteggio delle calorie. Per partire dal numero giusto calcola il tuo <a href="/calcolo-fabbisogno-calorico/">fabbisogno calorico</a>.</p>
${htmlAltriMenu(id, 'Gli altri menù dieta')}
${htmlLivelli(null)}
${htmlFonti(FONTI_STILE[id])}
<p class="note">Questo menù è un esempio indicativo per adulti sani e non sostituisce il parere di un medico o di un nutrizionista.</p>`;
  const faq = t.faq(d);
  return {
    slug: s.slug, body, faq, settimana: sett, img, imgW, imgH,
    schemaExtra: (mod) => [{
      '@context': 'https://schema.org', '@type': 'Article', headline: t.h1, inLanguage: 'it',
      description: `Esempio di ${t.nome} settimanale con 5 pasti al giorno, circa ${n0(tondo(d.md))} kcal (porzione donna), lista della spesa e infografica.`,
      image: [{ '@type': 'ImageObject', url: img.url, width: imgW, height: imgH, caption: `${t.titoloImg} settimanale: esempio di 7 giorni` }, `${SITE}/${img.og}`],
      datePublished: '2026-11-10', dateModified: mod,
      author: { '@type': 'Organization', name: 'Redazione MenuDieta', url: `${SITE}/chi-siamo/` },
      publisher: { '@id': `${SITE}/#org` }, mainEntityOfPage: `${SITE}/${s.slug}/`,
      about: [t.nome, 'menù dieta', 'menù settimanale'],
      citation: urlFonti(FONTI_STILE[id]),
    }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Menù dieta', item: `${SITE}/menu-dieta/` },
      { '@type': 'ListItem', position: 3, name: s.nome, item: `${SITE}/${s.slug}/` }] }],
  };
}
