// Kit di emergenza — contenuti SEO del sito.
// La lista viene scritta anche in HTML statico (Google la legge senza
// JavaScript); il generatore la ricalcola nel browser quando si cambiano
// i dati. Formule: src/core/kitEmergenza.js (le stesse dell'app).
import { calcolaKit, KIT_DEFAULT } from '../../src/core/kitEmergenza.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = (n) => Number(n).toLocaleString('it-IT');
const SITE = 'https://www.menudieta.it';
const q = (sez, id) => { for (const s of sez) for (const x of s.items) if (x.id === id) return x; return null; };

// ── Generatore (form + lista) ──
export function toolKit(par = {}, { zaino = null } = {}) {
  const p = { ...KIT_DEFAULT, F: 1, ...par };
  const num = (n, label) => `<div><label>${label}</label><input name="${n}" inputmode="numeric" value="${p[n]}"></div>`;
  return `
<div class="tool kit" data-tool="kit" id="calcolatore"${zaino ? ` data-zaino="${zaino.join(',')}"` : ''}>
  <div class="row">
    ${num('A', 'Adulti')}
    ${num('B', 'Bambini (sotto i 14 anni)')}
    <div><label>Giorni di autonomia</label><div class="seg" data-k="G" data-value="${p.G}">${[3, 5, 7, 14].map(n => `<button${n === p.G ? ' class="on"' : ''} data-v="${n}">${n}</button>`).join('')}</div></div>
  </div>
  <details class="kit-dett"${p.Bp ? ' open' : ''}><summary>Altri dettagli (pannolini, donne, telefoni, stanze, batterie)</summary>
  <div class="row">
    ${num('Bp', 'Bambini con il pannolino')}
    <div><label>Pannolini al giorno per bambino</label><select name="P">${[[10, 'Neonato (10)'], [6, '1–2 anni (6)'], [4, 'Più grande (4)']].map(([v, l]) => `<option value="${v}"${v === p.P ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
    ${num('F', 'Donne in età fertile')}
    ${num('T', 'Smartphone')}
    ${num('S', 'Stanze usate di notte')}
    ${num('AUT', 'Ore di autonomia di un set di batterie')}
  </div></details>
  <button type="button" class="btn genera">Genera il kit →</button>
  <div class="risultato on">${listaStatica(p, zaino)}</div>
</div>`;
}

// Stessa struttura che produce site/src/kit.js nel browser
export function listaStatica(p, zaino = null) {
  let sez = calcolaKit(p);
  if (zaino) sez = sez.map(s => ({ ...s, items: s.items.filter(x => zaino.includes(x.id)) })).filter(s => s.items.length);
  const n = p.A + p.B;
  return `<div class="big">${n} <small>person${n === 1 ? 'a' : 'e'} · ${p.G} giorni</small></div><div class="dett">Spunta quello che hai già in casa. Le quantità sono indicative per una famiglia media.</div>` +
    sez.map(s => `<h3>${s.icona} ${esc(s.titolo)}</h3><ul>${s.items.map(x => `<li><input type="checkbox" aria-label="${esc(x.nome)}"><div><b>${esc(x.nome)}</b>${x.fisso ? '' : ` · <span style="color:var(--verde)">${fmt(x.qta)} ${esc(x.unita)}</span>`}${x.nota ? `<span class="nota">${esc(x.nota)}</span>` : ''}</div></li>`).join('')}</ul>`).join('') +
    `<div class="azioni"><button type="button" data-az="copia">📋 Copia la lista</button><button type="button" data-az="whatsapp">💬 Manda su WhatsApp</button><button type="button" data-az="stampa">🖨️ Stampa o salva in PDF</button></div>`;
}

// Tabella "quanto serve per N persone" (risposta diretta a 'quanta acqua per 4 persone')
export function tabellaPersone(G = 3) {
  const righe = [1, 2, 3, 4, 5, 6].map(N => {
    const A = Math.min(N, 2), B = N - A, sez = calcolaKit({ A, B, G, Bp: 0, F: 1, T: A, S: 2 });
    const v = (id) => fmt(q(sez, id)?.qta || 0);
    return `<tr><td><b>${N}</b> <span class="note">(${A} ad.${B ? ` + ${B} bamb.` : ''})</span></td><td>${v('acqua')} L</td><td>${v('scatolame')}</td><td>${v('cracker')}</td><td>${v('batterie')} set</td><td>${v('powerbank')}</td><td>${v('carta')}</td><td>${v('contanti')} €</td></tr>`;
  }).join('');
  return `<div class="scroll"><table class="tabella"><tr><th>Persone</th><th>Acqua</th><th>Scatolette</th><th>Cracker</th><th>Batterie</th><th>Power bank</th><th>Carta igienica</th><th>Contanti</th></tr>${righe}</table></div>
<p class="note">Per ${G} giorni. Oltre i 2 adulti la tabella conta bambini; per altre combinazioni usa il <a href="#calcolatore">calcolatore</a>.</p>`;
}

// ── Pagine long tail ────────────────────────────────────────────────
// Ognuna risponde a una ricerca precisa con la lista già calcolata.
const ZAINO = ['bottigliette', 'snack', 'cioccolato', 'cracker', 'frontalini', 'batterie', 'powerbank', 'radio', 'isotermiche', 'pile', 'calze-pesanti', 'intimo', 'salviette', 'gel', 'carta', 'pronto-soccorso', 'farmaci', 'antipiretico', 'contanti', 'documenti', 'numeri', 'fischietto', 'coltellino', 'peluche', 'pannolini', 'assorbenti'];

export const VARIANTI = [
  {
    slug: 'famiglia-4-persone', breve: 'Famiglia di 4 persone',
    par: { A: 2, B: 2, G: 3, F: 1, T: 2, S: 2 },
    title: 'Kit di emergenza per una famiglia di 4 persone: lista completa',
    description: (s) => `Il kit di emergenza per 2 adulti e 2 bambini per 72 ore, con le quantità già calcolate: ${fmt(q(s, 'acqua').qta)} litri d’acqua, scatolame, luce, batterie, igiene e farmaci.`,
    h1: 'Kit di emergenza per una famiglia di 4 persone',
    intro: (s) => `Per due adulti e due bambini, per le 72 ore raccomandate dall’Unione europea, servono <strong>${fmt(q(s, 'acqua').qta)} litri d’acqua</strong>, ${fmt(q(s, 'scatolame').qta)} scatolette, ${fmt(q(s, 'lanterne').qta)} lanterne e una torcia frontale a testa, ${fmt(q(s, 'batterie').qta)} set di batterie e ${fmt(q(s, 'contanti').qta)} € in contanti. Qui sotto la lista completa, voce per voce, già moltiplicata per quattro.`,
    extra: `<h2>Come dividersi i compiti in una famiglia di quattro</h2><p>Il kit si prepara in un pomeriggio se ognuno ha una sezione: un adulto si occupa di acqua e cibo (la spesa più pesante), l’altro di luce, energia e documenti. I bambini possono preparare la propria parte: il peluche, i giochi senza corrente, la loro torcia frontale. Coinvolgerli serve anche a ridurre la paura il giorno in cui servirà davvero.</p>`,
    faq: [
      ['Quanta acqua serve a una famiglia di 4 persone per 3 giorni?', 'Con 5 litri al giorno per adulto e 3 per bambino servono 48 litri: 8 confezioni da 6 bottiglie da 1 litro. Se i bambini sono adolescenti, contali come adulti: 60 litri.'],
      ['Quanto costa un kit di emergenza per 4 persone?', 'Partendo da zero, tra 200 e 350 euro esclusi i contanti; la maggior parte delle cose (coperte, intimo, calze) è già in casa e va solo raccolta in un posto.'],
    ],
  },
  {
    slug: 'coppia', breve: '2 persone',
    par: { A: 2, B: 0, G: 3, F: 1, T: 2, S: 2 },
    title: 'Kit di emergenza per 2 persone: lista per una coppia (72 ore)',
    description: (s) => `Lista del kit di emergenza per due adulti per 3 giorni con quantità calcolate: ${fmt(q(s, 'acqua').qta)} litri d’acqua, ${fmt(q(s, 'scatolame').qta)} scatolette, luce, batterie, power bank, igiene. Stampabile.`,
    h1: 'Kit di emergenza per 2 persone',
    intro: (s) => `Per una coppia, per 72 ore, servono <strong>${fmt(q(s, 'acqua').qta)} litri d’acqua</strong>, ${fmt(q(s, 'scatolame').qta)} scatolette, ${fmt(q(s, 'snack').qta)} snack, ${fmt(q(s, 'powerbank').qta)} power bank da 20.000 mAh e ${fmt(q(s, 'contanti').qta)} € in banconote piccole. Ecco la lista completa con le quantità.`,
    extra: `<h2>In un appartamento piccolo: dove lo metto?</h2><p>Per due persone il kit sta in due casse di plastica da 50 litri più le confezioni d’acqua: sotto il letto, in fondo a un armadio, in cantina se ci si arriva senza ascensore. Tienilo tutto insieme: in emergenza non c’è tempo per cercare la torcia in un cassetto e le batterie in un altro.</p>`,
    faq: [
      ['Quanta acqua serve a 2 persone per 3 giorni?', '30 litri: 5 litri al giorno a testa, tra bere, cucinare e lavarsi. Sono 5 confezioni da 6 bottiglie da un litro.'],
      ['Serve un fornelletto?', 'Non è indispensabile: la lista è fatta di cibi che si mangiano freddi. Un fornelletto da campeggio con due cartucce permette però di scaldare acqua e latte, e in inverno fa la differenza.'],
    ],
  },
  {
    slug: 'una-persona', breve: '1 persona',
    par: { A: 1, B: 0, G: 3, F: 0, T: 1, S: 1 },
    title: 'Kit di emergenza per una persona: lista per chi vive da solo',
    description: (s) => `Il kit di emergenza per una persona sola per 72 ore: ${fmt(q(s, 'acqua').qta)} litri d’acqua, cibo, luce, batterie, power bank, farmaci e documenti. Lista stampabile.`,
    h1: 'Kit di emergenza per una persona sola',
    intro: (s) => `Chi vive da solo ha bisogno di <strong>${fmt(q(s, 'acqua').qta)} litri d’acqua</strong>, ${fmt(q(s, 'scatolame').qta)} scatolette, ${fmt(q(s, 'lanterne').qta)} lanterne, una torcia frontale, ${fmt(q(s, 'batterie').qta)} set di batterie e ${fmt(q(s, 'contanti').qta)} € in contanti per essere autonomo 72 ore. Da solo conta ancora di più una cosa: che qualcuno sappia come stai.`,
    extra: `<h2>La cosa più importante se vivi da solo</h2><p>Accordati prima con un vicino o un parente: in caso di blackout o allerta, chi chiama chi e a che ora. Scrivi i loro numeri su carta (sono nella lista) e lascia a qualcuno una copia delle chiavi. Il fischietto non è un dettaglio: se resti bloccato, si sente più lontano della voce e non stanca.</p>`,
    faq: [
      ['Per una persona sola basta uno zaino?', 'Per uscire di casa sì: vedi lo <a href="/kit-di-emergenza/zaino-terremoto/">zaino di emergenza</a>. Le scorte per restare in casa (acqua, scatolame, coperte) stanno in una cassa a parte.'],
      ['Quanti power bank servono a una persona?', 'Uno da 20.000 mAh basta per 3 giorni con un solo telefono, tenendo conto che circa un terzo della carica si perde nel trasferimento.'],
    ],
  },
  {
    slug: 'neonato', breve: 'Con un neonato',
    par: { A: 2, B: 1, Bp: 1, P: 10, G: 3, F: 1, T: 2, S: 2 },
    title: 'Kit di emergenza con un neonato: lista per mamma, papà e bebè',
    description: () => 'Kit di emergenza per una famiglia con neonato per 72 ore: pannolini, omogeneizzati, acqua, salviette, antipiretico, peluche: quantità calcolate.',
    h1: 'Kit di emergenza con un neonato',
    intro: (s) => `Con un neonato il kit cambia soprattutto in tre voci: <strong>${fmt(q(s, 'pannolini').qta)} pannolini</strong> per tre giorni (10 al giorno, più il 30% di scorta), ${fmt(q(s, 'salviette').qta)} salviette umidificate e l’antipiretico pediatrico. Il resto è la lista di una famiglia normale, qui già calcolata per due adulti e un bebè.`,
    extra: `<h2>Allattamento, latte artificiale e biberon</h2><p>Se allatti al seno, la cosa più importante del kit è l’acqua per te: non ridurre la tua quota. Se usi latte artificiale, tieni nel kit il <strong>latte liquido già pronto</strong> in brick: non richiede acqua bollita, che in emergenza può mancare. Aggiungi biberon e tettarelle di scorta, che senza acqua calda non si sterilizzano bene. Per l’antipiretico la lista conta solo le confezioni: la dose dipende dal peso e va letta sulla confezione o chiesta al pediatra.</p>`,
    faq: [
      ['Quanti pannolini servono per 3 giorni di emergenza?', 'Per un neonato circa 39 (10 al giorno più il 30% di scorta); per un bambino di 1–2 anni circa 24. Il calcolatore li conta per ogni bambino che lo usa.'],
      ['Il latte in polvere va bene per il kit?', 'Meglio quello liquido pronto: la polvere va sciolta in acqua bollita, che durante un blackout o un’alluvione può non esserci.'],
    ],
  },
  {
    slug: '7-giorni', breve: '7 giorni',
    par: { A: 2, B: 2, G: 7, F: 1, T: 2, S: 2 },
    title: 'Kit di emergenza per 7 giorni: quantità per tutta la famiglia',
    description: (s) => `Le scorte di emergenza per una settimana per una famiglia di 4: ${fmt(q(s, 'acqua').qta)} litri d’acqua, scatolame, batterie, power bank, igiene e farmaci. Stampabile.`,
    h1: 'Kit di emergenza per 7 giorni',
    intro: (s) => `Una settimana di autonomia è la scelta giusta per chi vive in montagna, in zone isolate o soggette ad alluvioni. Per una famiglia di quattro significa <strong>${fmt(q(s, 'acqua').qta)} litri d’acqua</strong>, ${fmt(q(s, 'scatolame').qta)} scatolette, ${fmt(q(s, 'batterie').qta)} set di batterie e ${fmt(q(s, 'powerbank').qta)} power bank. Ecco la lista completa.`,
    extra: `<h2>Come conservare più di 100 litri d’acqua</h2><p>Le bottiglie sigillate durano due anni: ruotale usandole a casa e ricomprandole, così non scadono. In alternativa, taniche alimentari da 10–20 litri riempite dal rubinetto, da cambiare ogni sei mesi. Tienile al buio e lontano da detersivi e vernici: la plastica assorbe gli odori.</p>`,
    faq: [
      ['Meglio 3 o 7 giorni?', 'Tre giorni sono il minimo raccomandato dall’Unione europea e dalla Protezione Civile. Sette sono consigliati dove i soccorsi possono arrivare tardi: montagna, isole, zone a rischio alluvione o frana.'],
      ['Come si fa durare il cibo una settimana senza frigo?', 'Prima si consuma ciò che è in frigo e in freezer (il freezer chiuso tiene 24–48 ore), poi si passa allo scatolame e alle scorte secche del kit.'],
    ],
  },
  {
    slug: 'blackout', breve: 'Blackout',
    par: { A: 2, B: 2, G: 3, F: 1, T: 2, S: 3 },
    title: 'Kit blackout: cosa tenere in casa se manca la corrente',
    description: () => 'Cosa serve in casa per un blackout di più giorni: luce, batterie, power bank, radio, cibo senza cottura, acqua e contanti. Lista calcolata per la tua famiglia.',
    h1: 'Kit per il blackout: cosa tenere in casa se manca la corrente',
    intro: (s) => `In un blackout lungo smettono di funzionare insieme luce, frigorifero, POS, ricarica dei telefoni e, nei condomini, spesso anche le pompe dell’acqua. Per una famiglia di quattro servono <strong>${fmt(q(s, 'lanterne').qta)} lanterne</strong>, ${fmt(q(s, 'frontalini').qta)} torce frontali, ${fmt(q(s, 'batterie').qta)} set di batterie, ${fmt(q(s, 'powerbank').qta)} power bank, una radio e ${fmt(q(s, 'contanti').qta)} € in contanti. Ecco la lista completa.`,
    extra: `<h2>Le prime due ore di un blackout</h2><p>Spegni gli apparecchi accesi (quando la corrente torna, il picco può danneggiarli) e lascia accesa una sola lampadina per accorgerti del ritorno. Non aprire frigo e freezer: chiusi, conservano il freddo da 4 ore (frigo) a 24–48 ore (freezer pieno). Se abiti in condominio, riempi subito vasca e pentole: le autoclavi si fermano e l’acqua ai piani alti finisce per prima. Accendi la radio e cerca le comunicazioni ufficiali; usa il telefono solo per chiamate brevi.</p>
<h2>Candele sì o no?</h2><p>Meglio di no: sono la prima causa di incendi domestici durante i blackout. Lanterne a LED e torce frontali fanno più luce, durano di più e non bruciano niente.</p>`,
    faq: [
      ['Quanto dura il cibo in frigo senza corrente?', 'Circa 4 ore se il frigo resta chiuso; un freezer pieno e chiuso tiene 48 ore, mezzo pieno 24. Dopo, carne, pesce e latticini vanno buttati se sono sopra i 4 °C da più di due ore.'],
      ['Come ricaricare il telefono durante un blackout?', 'Con un power bank carico (il calcolatore dice quanti ne servono) o dalla presa USB dell’auto. Abbassa la luminosità, attiva il risparmio energetico e spegni i dati quando non servono.'],
    ],
  },
  {
    slug: 'zaino-terremoto', breve: 'Zaino di emergenza', zaino: ZAINO,
    par: { A: 2, B: 2, G: 3, F: 1, T: 2, S: 2 },
    title: 'Zaino di emergenza per il terremoto: cosa metterci (lista)',
    description: () => 'Cosa mettere nello zaino di emergenza per terremoto ed evacuazione: acqua, documenti, contanti, farmaci, torcia, radio, coperta isotermica, per tutta la famiglia.',
    h1: 'Zaino di emergenza per il terremoto: cosa metterci',
    intro: (s) => `Lo zaino di emergenza (o “go bag”) è la parte del kit che si prende in pochi secondi quando bisogna uscire di casa: terremoto, alluvione, evacuazione. Contiene solo quello che si porta a mano: acqua in bottigliette, snack, documenti in busta impermeabile, contanti, farmaci, torcia frontale, power bank, radio, coperta isotermica. Qui sotto la lista già calcolata per una famiglia di quattro; il resto delle scorte resta a casa nel <a href="/kit-di-emergenza/">kit completo</a>.`,
    extra: `<h2>Dove tenere lo zaino</h2><p>Vicino alla porta d’ingresso, appeso o in un armadio basso, mai in cantina o in soffitta. In zona sismica ogni adulto ha il suo zaino, leggero (non più di 8–10 kg): meglio due zaini medi che uno che nessuno riesce a portare. Una seconda versione ridotta sta bene nel bagagliaio dell’auto.</p>
<h2>Cosa fare durante la scossa</h2><p>Non correre fuori: riparati sotto un tavolo robusto o nel vano di una porta in un muro portante, lontano da finestre e mobili alti. Esci solo quando la scossa è finita, con le scale e mai con l’ascensore, prendendo lo zaino. Raggiungi l’area di attesa indicata dal piano di protezione civile del tuo Comune.</p>`,
    faq: [
      ['Quanto deve pesare uno zaino di emergenza?', 'Al massimo il 10–15% del peso di chi lo porta: 8–10 kg per un adulto. L’acqua pesa più di tutto: nello zaino ne bastano 1,5–2 litri a testa, il resto delle scorte resta a casa.'],
      ['Lo zaino di emergenza va bene anche per l’alluvione?', 'Sì: è lo stesso. Per l’alluvione aggiungi stivali di gomma e metti documenti e telefono in buste stagne.'],
    ],
  },
];

export function paginaVariante(v, { APP, cta }) {
  const sez = calcolaKit({ ...KIT_DEFAULT, F: 1, ...v.par });
  const qs = new URLSearchParams(Object.entries(v.par).map(([k, x]) => [k, String(x)])).toString();
  const altre = VARIANTI.filter(x => x.slug !== v.slug).map(x => `<a href="/kit-di-emergenza/${x.slug}/">${esc(x.breve)}</a>`).join(' · ');
  const body = `
<p class="crumb"><a href="/">Home</a> · <a href="/kit-di-emergenza/">Kit di emergenza</a> · ${esc(v.breve)}</p>
<h1>${esc(v.h1)}</h1>
<p class="lead">${v.intro(sez)}</p>
${toolKit({ ...KIT_DEFAULT, F: 1, ...v.par }, { zaino: v.zaino })}
${v.extra}
<h2>Quanto serve per altre famiglie</h2>
${tabellaPersone(v.par.G || 3)}
${cta('Il kit è anche nell’app, con le spunte che restano salvate')}
<p>Nell’app MenuDieta il kit parte dai membri della tua famiglia e tiene a mente cosa hai già comprato. Se vuoi solo il calcolatore, senza account: <a href="${APP}?kit=1&amp;${esc(qs)}">calcolatore di emergenza</a>.</p>
<h2>Altre liste pronte</h2><p>${altre} · <a href="/kit-di-emergenza/">calcolatore completo</a></p>`;
  return {
    slug: `kit-di-emergenza/${v.slug}`, title: v.title, description: v.description(sez), body, faq: v.faq,
    ogImage: `${SITE}/og-kit.png`,
    schema: [
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Kit di emergenza', item: `${SITE}/kit-di-emergenza/` },
        { '@type': 'ListItem', position: 3, name: v.breve, item: `${SITE}/kit-di-emergenza/${v.slug}/` }] },
      itemListSchema(sez, v.h1, v.zaino),
    ],
  };
}

// ItemList: la lista del kit come elenco ordinato leggibile dai motori
export function itemListSchema(sez, nome, zaino = null) {
  const items = sez.flatMap(s => s.items).filter(x => !zaino || zaino.includes(x.id));
  return { '@context': 'https://schema.org', '@type': 'ItemList', name: nome, numberOfItems: items.length,
    itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.fisso ? `${x.nome}: ${x.nota}` : `${x.nome}: ${fmt(x.qta)} ${x.unita}` })) };
}

export const linkVarianti = () => VARIANTI.map(v => `<a class="card" href="/kit-di-emergenza/${v.slug}/"><h2>${esc(v.breve)}</h2><p>${esc(v.description(calcolaKit({ ...KIT_DEFAULT, F: 1, ...v.par })).split(':')[0].split('.')[0])}</p></a>`).join('');
