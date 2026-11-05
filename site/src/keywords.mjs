// ═══════════════════════════════════════════════════════════════════
// REGISTRO PAROLE CHIAVE → PAGINE  (fonte unica del sito pubblico)
// ─────────────────────────────────────────────────────────────────
// Metodo: ogni ricerca che vogliamo vincere ha UNA pagina dedicata.
// Per ogni pagina: la parola chiave principale (esatta nel title, H1 e
// URL), le varianti che Google tratta come sinonimi (usate nel testo e
// negli H2), l'intento (cosa vuole davvero chi cerca) e chi oggi occupa
// la prima pagina (per capire cosa serve per superarlo).
// Misura: Google Search Console → "Rendimento" → filtra per pagina.
// Rivedi questo file ogni mese: le query reali che portano clic vanno
// promosse a pagina dedicata se hanno volume.
// ═══════════════════════════════════════════════════════════════════

export const SITE = 'https://www.menudieta.it';
export const APP  = 'https://www.menudieta.it/app/';

export const PAGES = [
  {
    slug: '',                       // home
    kw: 'app piano alimentare settimanale per la famiglia',
    varianti: ['app menu settimanale famiglia', 'pianificare i pasti della settimana', 'piano alimentare famiglia gratis'],
    intento: 'cercano uno strumento gratuito che decida cosa cucinare per tutta la famiglia',
    concorrenti: 'raccolte di app (aranzulla, trend-online), schede App Store di app straniere',
    title: 'MenuDieta – App gratuita per il piano alimentare settimanale della famiglia',
    description: 'MenuDieta crea il menu settimanale per tutta la famiglia con porzioni per ciascuno, lista della spesa automatica e ricette di stagione. Gratis, senza pubblicità.',
    tipo: 'home',
  },
  {
    slug: 'menu-settimanale-famiglia',
    kw: 'menu settimanale per la famiglia',
    varianti: ['menù settimanale famiglia', 'piano alimentare settimanale famiglia', 'menu settimanale con bambini', 'esempio menu settimanale'],
    intento: 'vogliono un menu pronto, equilibrato, che vada bene a grandi e piccoli',
    concorrenti: 'migros (PDF), dilei, postfinance',
    title: 'Menu settimanale per la famiglia: esempio pronto e generatore gratuito',
    description: 'Un menu settimanale per la famiglia equilibrato, con porzioni per adulti e bambini e lista della spesa. Esempio completo e generatore automatico gratuito.',
    tipo: 'landing',
  },
  {
    slug: 'lista-della-spesa-automatica',
    kw: 'lista della spesa automatica',
    varianti: ['lista della spesa dal menu settimanale', 'app lista della spesa condivisa famiglia', 'lista spesa intelligente'],
    intento: 'vogliono smettere di scrivere la lista a mano e condividerla con il partner',
    concorrenti: 'app di sole liste (La lista spesa, Bring), Paprika',
    title: 'Lista della spesa automatica dal menu settimanale – MenuDieta',
    description: 'MenuDieta crea la lista della spesa in automatico dal piano della settimana, con quantità esatte per la tua famiglia e spunte condivise in tempo reale.',
    tipo: 'landing',
  },
  {
    slug: 'calcolo-fabbisogno-calorico',
    kw: 'calcolo fabbisogno calorico giornaliero',
    varianti: ['fabbisogno calorico', 'quante calorie al giorno', 'metabolismo basale calcolo', 'calcolatore calorie LARN'],
    intento: 'vogliono un numero subito, spiegato, con una formula affidabile',
    concorrenti: 'calcolatori generici (my-personaltrainer, dietagratis), spesso con formule americane',
    title: 'Calcolo fabbisogno calorico giornaliero (metodo LARN italiano) – gratis',
    description: 'Calcola in 10 secondi il tuo fabbisogno calorico giornaliero e il metabolismo basale con il metodo LARN/SINU, lo standard italiano. Gratis, senza registrazione.',
    tipo: 'tool', tool: 'calorie',
  },
  {
    slug: 'peso-forma-calcolo',
    kw: 'calcolo peso forma',
    varianti: ['peso ideale', 'peso forma in base a costituzione', 'indice di Grant', 'peso forma donna', 'peso forma uomo'],
    intento: 'vogliono un intervallo realistico, non un numero secco',
    concorrenti: 'calcolatori BMI generici',
    title: 'Calcolo peso forma in base a costituzione (indice di Grant) – gratis',
    description: 'Calcola il tuo peso forma tenendo conto della costituzione ossea (polso e altezza). Intervallo realistico, non un numero unico. Strumento gratuito.',
    tipo: 'tool', tool: 'pesoforma',
  },
  {
    slug: 'quanta-acqua-bere-al-giorno',
    kw: 'quanta acqua bere al giorno',
    varianti: ['fabbisogno idrico calcolo', 'quanti litri di acqua al giorno', 'bicchieri di acqua al giorno'],
    intento: 'vogliono una quantità personalizzata in litri e bicchieri',
    concorrenti: 'articoli generici (2 litri per tutti)',
    title: 'Quanta acqua bere al giorno: calcolo personalizzato in litri e bicchieri',
    description: 'Calcola quanta acqua bere al giorno in base a peso e allenamento (30–35 ml/kg, criterio EFSA). Risultato in litri e bicchieri. Gratis.',
    tipo: 'tool', tool: 'acqua',
  },
  {
    slug: 'per-nutrizionisti',
    kw: 'software per nutrizionisti',
    varianti: ['app per nutrizionisti', 'gestione pazienti nutrizionista', 'app per i clienti del nutrizionista', 'piano alimentare da inviare ai pazienti'],
    intento: 'professionisti che vogliono consegnare piani ai clienti in un\'app italiana e seguirli',
    concorrenti: 'Nutrium, EvolutionFit, Coachway, MetaDieta',
    title: 'MenuDieta per nutrizionisti: i piani dei tuoi pazienti in un\'app italiana',
    description: 'Carica i dati dei tuoi pazienti, assegna il piano alimentare e seguili dall\'app MenuDieta, gratuita per le famiglie. Lista di attesa per i professionisti.',
    tipo: 'nutrizionisti',
  },
];

export const ARTICOLI = [
  {
    slug: 'blog/come-organizzare-menu-settimanale-famiglia',
    kw: 'come organizzare il menu settimanale della famiglia',
    varianti: ['organizzare i pasti della settimana', 'pianificazione pasti famiglia', 'meal planning famiglia'],
    title: 'Come organizzare il menu settimanale della famiglia in 30 minuti',
    description: 'Metodo in 5 passi per organizzare il menu settimanale della famiglia: stagione, porzioni per ciascuno, lista della spesa e flessibilità. Con esempio.',
    data: '2026-11-03',
  },
  {
    slug: 'blog/menu-settimanale-bambini',
    kw: 'menu settimanale per bambini',
    varianti: ['dieta equilibrata bambini settimana', 'porzioni bambini', 'cosa far mangiare ai bambini a cena'],
    title: 'Menu settimanale per bambini: porzioni giuste e piatti che piacciono',
    description: 'Come costruire un menu settimanale per bambini equilibrato senza cucinare due volte: stessi piatti della famiglia, porzioni adatte all\'età. Esempio di settimana.',
    data: '2026-11-03',
  },
  {
    slug: 'blog/piano-alimentare-mantenimento',
    kw: 'piano alimentare di mantenimento',
    varianti: ['dieta di mantenimento cosa mangiare', 'mantenere il peso dopo la dieta', 'calorie di mantenimento'],
    title: 'Piano alimentare di mantenimento: come mangiare per restare al tuo peso',
    description: 'Cos\'è un piano alimentare di mantenimento, come calcolare le calorie giuste e come costruire la settimana senza rinunce. Guida pratica con calcolatore.',
    data: '2026-11-03',
  },
];
