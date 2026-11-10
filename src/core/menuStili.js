// ═══════════════════════════════════════════════════════════════════
// MENÙ DIETA — stili impostabili con un tocco (mediterranea, low carb, …)
// ═══════════════════════════════════════════════════════════════════
// Modulo PURO (nessun import): lo usano sia il motore dell'app sia il
// generatore del sito, così la pagina "menù dieta low carb" mostra
// esattamente il tipo di piatti che l'app propone con quel menù.
//
// Uno stile NON è una lista fissa di 7 giorni: è un filtro sulle ricette.
// Il generatore continua a fare il suo lavoro (stagionalità, esclusioni,
// porzioni per ogni persona, varietà di settimana in settimana) ma pesca
// solo tra le ricette compatibili. Le regole si basano sui dati (categorie
// degli ingredienti e ripartizione delle calorie), quindi ogni ricetta
// nuova viene classificata da sola.

export const STILI_MENU = [
  { id: 'mediterranea', nome: 'Mediterranea', emoji: '🫒', slug: 'menu-dieta-mediterranea',
    breve: 'Cereali integrali, legumi, pesce, verdura e olio EVO. Niente salumi né carne rossa.',
    regola: 'esclude salumi, carne rossa (manzo, maiale, agnello, salsiccia) e dolci confezionati; legumi e pesce compaiono più spesso' },
  { id: 'lowcarb', nome: 'Low carb', emoji: '🥑', slug: 'menu-dieta-low-carb',
    breve: 'Pochi carboidrati: al massimo il 30% delle calorie di ogni pasto (35% negli spuntini).',
    regola: 'ogni pasto ha al massimo il 30% delle calorie dai carboidrati (35% negli spuntini)' },
  { id: 'proteica', nome: 'Proteica', emoji: '💪', slug: 'menu-dieta-proteica',
    breve: 'Almeno il 30% delle calorie da proteine a pranzo e cena, 25% a colazione e negli spuntini.',
    regola: 'pranzo e cena hanno almeno il 30% delle calorie dalle proteine, colazione e spuntini almeno il 25%' },
  { id: 'vegetariana', nome: 'Vegetariana', emoji: '🥦', slug: 'menu-dieta-vegetariana',
    breve: 'Niente carne, pesce e salumi: proteine da legumi, uova, latticini e tofu.',
    regola: 'esclude carne, pesce, salumi e frattaglie' },
];
export const STILE_BY_ID = Object.fromEntries(STILI_MENU.map(s => [s.id, s]));
export const isStileValido = (id) => !!STILE_BY_ID[id];

const CARNE_ROSSA = /manzo|bovin|maiale|suin|lonza|agnello|salsicc|vitell|cavallo|wurstel/i;
const DOLCI_OK = /miele|cacao|marmellat|confettur|cioccolato fondente/i;
// Ripieni tradizionali con carne (tortellini, cappelletti, agnolotti) e derivati animali
const SOLO_VEG_NO = /brodo di carne|gelatina|acciug|colatura|tortellin|cappellett|agnolott/i;
const pulisciCat = (c) => String(c || '').replace(/^[^\p{L}]+/u, '').trim();

// Quota di calorie da un macronutriente (porzione donna; uomo come riserva)
export function quotaMacro(r, k) {
  const m = (r && (r.donna || r.uomo)) || null;
  if (!m || !m.kcal) return null;
  return (+m[k] || 0) * (k === 'g' ? 9 : 4) / m.kcal;
}

// infoIng(id) → { cat, nome } dell'ingrediente (dal database dell'app o del sito)
// categoria: quella della ricetta (le ricette del DB dell'app non la portano con sé)
export function compatibileStile(stile, r, infoIng, categoria) {
  if (!stile || !STILE_BY_ID[stile]) return true;
  if (!r || !Array.isArray(r.ingredients)) return false;
  const info = r.ingredients.map(id => { const a = infoIng(id) || {}; return { cat: pulisciCat(a.cat), nome: `${a.nome || ''} ${id}` }; });
  const cats = new Set(info.map(i => i.cat));
  const cat = categoria || r.categoria;
  switch (stile) {
    case 'vegetariana':
      return !['Carni', 'Pesce', 'Salumi', 'Frattaglie'].some(c => cats.has(c)) && !info.some(i => SOLO_VEG_NO.test(i.nome));
    case 'mediterranea':
      if (['Salumi', 'Frattaglie', 'Fast food'].some(c => cats.has(c))) return false;
      if (info.some(i => CARNE_ROSSA.test(i.nome))) return false;
      return !info.some(i => i.cat === 'Dolci' && !DOLCI_OK.test(i.nome));
    case 'lowcarb': {
      const q = quotaMacro(r, 'c');
      return q != null && q <= (cat === 'spuntino' ? 0.35 : 0.30);
    }
    case 'proteica': {
      const q = quotaMacro(r, 'p');
      return q != null && q >= (cat === 'pranzo' || cat === 'cena' ? 0.30 : 0.25);
    }
    default: return true;
  }
}

// Peso extra nel pool (copie in più): la mediterranea privilegia legumi e pesce
export function pesoStile(stile, r, infoIng) {
  if (stile !== 'mediterranea' || !r?.ingredients) return 1;
  return r.ingredients.some(id => ['Legumi', 'Pesce'].includes(pulisciCat((infoIng(id) || {}).cat))) ? 2 : 1;
}

// ── Stile per settimana ─────────────────────────────────────────────
// Lo stato del piano tiene lo storico delle scelte: [{ dal: weekIndex, stile }].
// Una settimana usa l'ultima scelta fatta a partire da una settimana ≤ alla sua:
// così cambiare menù oggi non riscrive le settimane già passate.
export function stileForWeek(menu, weekIndex) {
  if (!Array.isArray(menu) || !menu.length) return null;
  let s = null, dal = -Infinity;
  for (const m of menu) {
    if (!m || !Number.isFinite(+m.dal)) continue;
    if (+m.dal <= weekIndex && +m.dal >= dal) { dal = +m.dal; s = isStileValido(m.stile) ? m.stile : null; }
  }
  return s;
}
// Nuovo storico dopo la scelta di `stile` (null = menù libero) dalla settimana `dal`
export function aggiornaMenu(menu, dal, stile) {
  const prima = (Array.isArray(menu) ? menu : []).filter(m => m && Number.isFinite(+m.dal) && +m.dal < dal);
  const out = [...prima, { dal, stile: isStileValido(stile) ? stile : null }];
  return out.slice(-12);   // bastano le ultime scelte
}
