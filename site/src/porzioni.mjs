// Porzioni di riferimento per età (pesi a crudo, al netto degli scarti, per un pasto).
// Fonte: AUSL Modena, "Standard delle grammature di riferimento", adattati dal dossier
// CREA 2018 e dai LARN — https://www.ausl.mo.it/media/Grammature.pdf
// Usata da: pagina strumento /porzioni-bambini-per-eta/ e sezione "porzione per età"
// delle pagine alimento (site/src/generati.mjs).

export const FONTE_PORZIONI = 'https://www.ausl.mo.it/media/Grammature.pdf';

export const ETA = [
  { id: '2-3', label: '2–3 anni' },
  { id: '4-6', label: '4–6 anni' },
  { id: '7-10', label: '7–10 anni' },
  { id: '11-14', label: '11–14 anni' },
  { id: '15-17', label: '15–17 anni' },
  { id: 'adulti', label: 'Adulti' },
];

// g per età, nello stesso ordine di ETA. null = non indicato per quell'età.
export const PORZIONI = {
  pasta:      { nome: 'Pasta, riso, farro, orzo',          g: [40, 50, 70, 100, 100, 80], nota: 'nei primi in brodo si dimezza' },
  pastaUovo:  { nome: 'Pasta all’uovo fresca',              g: [50, 60, 85, 125, 125, 100] },
  ripiena:    { nome: 'Pasta ripiena (ravioli, tortellini)', g: [60, 75, 100, 150, 150, 120] },
  pizza:      { nome: 'Pizza',                              g: [50, 60, 85, 125, 125, 100] },
  pane:       { nome: 'Pane',                               g: [20, 40, 50, 50, 50, 50] },
  forno:      { nome: 'Fette biscottate, cracker, biscotti, cereali da colazione', g: [20, 30, 40, 40, 50, 30], nota: 'a colazione o merenda' },
  patate:     { nome: 'Patate',                             g: [100, 100, 150, 200, 200, 200], nota: 'al posto di pasta o pane, non come contorno' },
  legumiFr:   { nome: 'Legumi freschi, surgelati o in scatola', g: [30, 60, 90, 120, 120, 150] },
  legumiSec:  { nome: 'Legumi secchi',                      g: [10, 20, 30, 40, 40, 50] },
  pesce:      { nome: 'Pesce',                              g: [50, 60, 80, 150, 150, 150], nota: 'nel sugo per la pasta si dimezza' },
  carne:      { nome: 'Carne',                              g: [35, 45, 80, 100, 100, 100], nota: 'nel ragù si dimezza' },
  salumi:     { nome: 'Salumi',                             g: [15, 20, 40, 50, 50, 50] },
  uova:       { nome: 'Uova',                               g: [50, 50, 50, 50, 50, 50], nota: 'un uovo a porzione' },
  fresco:     { nome: 'Formaggio fresco (mozzarella, ricotta)', g: [30, 40, 70, 100, 100, 100] },
  semi:       { nome: 'Formaggio semi-stagionato (caciotta)', g: [20, 30, 50, 80, 80, 50] },
  stagionato: { nome: 'Formaggio stagionato (parmigiano)',  g: [20, 20, 30, 50, 50, 50] },
  latte:      { nome: 'Latte',                              g: [200, 200, 200, 200, 200, 125], unita: 'ml' },
  yogurt:     { nome: 'Yogurt',                             g: [60, 125, 125, 125, 125, 125] },
  insalata:   { nome: 'Insalate e verdure crude',           g: [20, 40, 50, 50, 50, 80] },
  verdura:    { nome: 'Verdure da cuocere',                 g: [80, 120, 150, 200, 200, 200] },
  frutta:     { nome: 'Frutta fresca',                      g: [70, 80, 100, 120, 150, 150] },
  fruttaSecca:{ nome: 'Frutta secca a guscio',              g: [null, 20, 30, 30, 50, 30], nota: 'intera sconsigliata sotto i 4 anni per il rischio di soffocamento' },
  olio:       { nome: 'Olio extravergine d’oliva',          g: [15, 10, 10, 15, 15, 10], nota: 'per pasto' },
};

// Ordine di presentazione nella tabella completa
export const ORDINE = ['pasta', 'pastaUovo', 'ripiena', 'pizza', 'pane', 'forno', 'patate', 'legumiFr', 'legumiSec', 'pesce', 'carne', 'salumi', 'uova', 'fresco', 'semi', 'stagionato', 'latte', 'yogurt', 'insalata', 'verdura', 'frutta', 'fruttaSecca', 'olio'];

// Alimento già cotto, conservato o trasformato: la tabella (pesi a crudo) non si applica
const NON_CRUDO = /bollit|cott[oaie]\b|saltat|fritt|arrost|grigliat|in scatola|sott[’']?olio|sottaceto|affumicat|essiccat|disidrat|candit|sciropp|succo|sotto sale|marmellat|concentrat|passata|condensat|in polvere|evaporat/i;

// Restituisce la chiave di PORZIONI adatta all'alimento, o null se non c'è un riferimento sicuro
export function chiavePorzione(a) {
  const n = String(a.nome || '').toLowerCase();
  const cat = String(a.cat || '');
  const kcal = +a.nutrizione?.kcal || 0;
  const legume = /Legumi/.test(cat);
  // i legumi in scatola restano nella tabella (riga "freschi o in scatola")
  if (NON_CRUDO.test(n) && !(legume && /in scatola/.test(n) && !/bollit/.test(n))) return null;

  if (/Cereali/.test(cat)) {
    if (/farin|crusca|germe|amido|maizena|fecola|panko|pangrattato|tapioca|semola|semolino|soffiat|pop ?corn|cornett|croissant|mais/.test(n)) return null;
    if (/tortellin|raviol|agnolott|cappellett/.test(n)) return 'ripiena';
    if (/pasta fresca|pasta all[’']uovo/.test(n)) return 'pastaUovo';
    if (/pizza/.test(n)) return 'pizza';
    if (/^pane|panin|pane /.test(n)) return 'pane';
    if (/biscott|cracker|cracotte|grissin|cornflakes|muesli|fiocchi/.test(n)) return 'forno';
    if (/pasta|riso|farro|orzo|miglio|grano saraceno|frumento|quinoa|cous|bulgur/.test(n)) return 'pasta';
    return null;
  }
  if (legume) {
    if (/fagiolin/.test(n)) return 'verdura';
    if (/isolato|lupin|farin/.test(n)) return null;
    return /secc/.test(n) || kcal >= 250 ? 'legumiSec' : 'legumiFr';
  }
  if (/Verdure/.test(cat)) {
    if (/basilico|menta|prezzemolo|rosmarino|salvia|timo|origano|aglio|erba cipollina|zenzero|peperoncin|alloro|aneto|coriandol|maggiorana|dragoncello/.test(n)) return null;
    if (/patat/.test(n)) return 'patate';
    if (/lattuga|insalat|rucola|radicchio|valerian|songino|indivia|scarola|crescione|pomodor|cetriol|lattughin/.test(n)) return 'insalata';
    return 'verdura';
  }
  if (/patat/.test(n) && !/fecola|chips|fritt/.test(n)) return 'patate';
  if (/Frutta secca/.test(cat)) return /burro|crema|farin/.test(n) ? null : 'fruttaSecca';
  if (/Frutta/.test(cat)) return /olive|secch|secc[oa]/.test(n) ? null : 'frutta';
  if (/Carni/.test(cat)) return 'carne';
  if (/Salumi/.test(cat)) return 'salumi';
  if (/Pesce/.test(cat)) return (/tonno|sgombro|acciugh|sardin/.test(n) && /scatol|olio/.test(n)) || /baccal|stoccafiss|salat/.test(n) ? null : 'pesce';
  if (/Uova/.test(cat)) return /tuorl|album|in polvere/.test(n) ? null : 'uova';
  if (/Latticini/.test(cat)) {
    if (/panna|crema|burro|mascarpone/.test(n)) return null;
    if (/^latte( |$)/.test(n)) return 'latte';
    if (/yogurt|kefir|skyr/.test(n)) return 'yogurt';
    if (/grana|parmigian|pecorino|emmenthal|fontina|provolone|asiago|caciocavallo|cheddar|gruyere|groviera|montasio|stagionat/.test(n)) return 'stagionato';
    if (/caciott|taleggio|brie|camembert|gorgonzola|dolce verde|edam|gouda|provola|scamorza|feta|butirr|burrin/.test(n)) return 'semi';
    return 'fresco';
  }
  if (/Oli e grassi/.test(cat)) return /olio (extra ?)?vergine|olio d[’']oliva|olio di oliva|olio evo/.test(n) ? 'olio' : null;
  return null;
}
