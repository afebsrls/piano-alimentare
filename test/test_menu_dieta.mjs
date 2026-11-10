// Test: menù dieta impostabili con un tocco (core/menuStili.js + motore).
//   1. ogni stile ha abbastanza ricette per categoria in OGNI mese
//   2. con uno stile attivo ogni pasto del piano rispetta lo stile
//   3. senza stile il piano non cambia: le ricette soloMenu non entrano nel pool libero
//   4. lo stile vale per settimana: cambiarlo non riscrive le settimane passate
//   5. le proposte di scambio restano nello stile attivo
import { DB, ING_MAP, MEAL_KEYS, STILI_MENU, compatibileStile, generateWeekPlan, planForWeek, stileForWeek,
         aggiornaMenu, buildMergedPool, findAlternatives, impostaStileCorrente } from '@/core';

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? "  ✓ " : "  ✗ ") + msg); if (!cond) fail++; };
const info = (id) => ING_MAP[id];
const catDi = (mk) => mk.startsWith('spuntino') ? 'spuntino' : mk;
const SEEDS = [1, 42, 999, 123456789, 1783848005545];

// 1) Pool sufficiente per ogni stile, categoria e mese (con stagionalità)
for (const s of STILI_MENU) {
  let minimo = Infinity, dove = '';
  for (let m = 1; m <= 12; m++) for (const c of ['colazione', 'pranzo', 'cena', 'spuntino']) {
    const n = new Set(buildMergedPool(c, [], [], m, [], s.id).map(r => r.id)).size;
    if (n < minimo) { minimo = n; dove = `${c}, mese ${m}`; }
  }
  ok(minimo >= 7, `${s.nome}: almeno 7 ricette diverse per categoria in ogni mese (minimo ${minimo}, ${dove})`);
}

// 2) Ogni pasto rispetta lo stile, per molti semi e mesi
for (const s of STILI_MENU) {
  const fuori = [];
  for (const seed of SEEDS) for (const m of [1, 4, 7, 10]) {
    const w = generateWeekPlan(seed, [], m, [], [], s.id);
    for (const d of w) for (const mk of MEAL_KEYS) if (d[mk] && !compatibileStile(s.id, d[mk], info, catDi(mk))) fuori.push(`${d[mk].id}@${mk}`);
  }
  ok(fuori.length === 0, `${s.nome}: tutti i pasti del piano sono nello stile` + (fuori.length ? ` (fuori: ${[...new Set(fuori)].slice(0, 5)})` : ''));
}
// spot check sui criteri
const w1 = generateWeekPlan(42, [], 3, [], [], 'vegetariana');
ok(w1.every(d => MEAL_KEYS.every(mk => !d[mk].ingredients.some(id => /Carni|Pesce|Salumi/.test(ING_MAP[id]?.cat || '')))), 'vegetariana: niente carne, pesce o salumi');
const w2 = generateWeekPlan(42, [], 3, [], [], 'lowcarb');
const quotaC = w2.reduce((s, d) => s + MEAL_KEYS.reduce((t, mk) => t + d[mk].donna.c * 4, 0), 0) / w2.reduce((s, d) => s + MEAL_KEYS.reduce((t, mk) => t + d[mk].donna.kcal, 0), 0);
ok(quotaC <= 0.30, `low carb: carboidrati al ${Math.round(quotaC * 100)}% delle calorie della settimana (≤ 30%)`);
const w3 = generateWeekPlan(42, [], 3, [], [], 'proteica');
const quotaP = w3.reduce((s, d) => s + MEAL_KEYS.reduce((t, mk) => t + d[mk].donna.p * 4, 0), 0) / w3.reduce((s, d) => s + MEAL_KEYS.reduce((t, mk) => t + d[mk].donna.kcal, 0), 0);
ok(quotaP >= 0.28, `proteica: proteine al ${Math.round(quotaP * 100)}% delle calorie della settimana (≥ 28%)`);

// 3) Senza stile: nessuna ricetta soloMenu e piano identico a prima delle aggiunte
const soloMenu = new Set(Object.values(DB).flat().filter(r => r.soloMenu).map(r => r.id));
ok(soloMenu.size >= 20, `ci sono ricette solo per i menù dieta (${soloMenu.size})`);
ok(SEEDS.every(s => generateWeekPlan(s, [], 7).every(d => MEAL_KEYS.every(mk => !soloMenu.has(d[mk].id)))), 'menù libero: le ricette soloMenu non entrano nel piano (i piani esistenti non cambiano)');
const firma = (w) => w.map(d => MEAL_KEYS.map(mk => d[mk].id).join(',')).join('|');
ok(SEEDS.every(s => firma(generateWeekPlan(s, [], 7)) === firma(generateWeekPlan(s, [], 7, [], [], null))), 'stile null = comportamento di prima');

// 4) Lo stile vale per settimana
const menu = aggiornaMenu(aggiornaMenu([], 100, 'mediterranea'), 105, 'lowcarb');
ok(stileForWeek(menu, 99) === null && stileForWeek(menu, 100) === 'mediterranea' && stileForWeek(menu, 104) === 'mediterranea' && stileForWeek(menu, 105) === 'lowcarb' && stileForWeek(menu, 200) === 'lowcarb', 'stileForWeek: ogni settimana usa la scelta valida in quel momento');
const m2 = aggiornaMenu(menu, 105, null);
ok(stileForWeek(m2, 105) === null && stileForWeek(m2, 102) === 'mediterranea' && m2.length === 2, 'tornare al menù libero non tocca le settimane passate');
ok(stileForWeek([{ dal: 1, stile: 'inesistente' }], 5) === null && stileForWeek(undefined, 5) === null, 'stile sconosciuto o assente → menù libero');
const ps = { baseSeed: 777, frozen: {}, menu: [{ dal: 50, stile: 'vegetariana' }] };
ok(firma(planForWeek(ps, 49)) === firma(planForWeek({ baseSeed: 777, frozen: {} }, 49)), 'planForWeek: settimana prima della scelta = piano libero');
ok(planForWeek(ps, 50).every(d => MEAL_KEYS.every(mk => compatibileStile('vegetariana', d[mk], info, catDi(mk)))), 'planForWeek: dalla settimana della scelta il piano è nello stile');

// 5) Proposte di scambio nello stile attivo
const pasto = generateWeekPlan(42, [], 5, [], [], 'lowcarb')[0].pranzo;
impostaStileCorrente('lowcarb');
const alt = findAlternatives('pranzo', pasto, 0, 999, [], new Set(), 'donna', []);
impostaStileCorrente(null);
const lista = Array.isArray(alt) ? alt : (alt?.ricette || alt?.alternative || []);
ok(lista.length > 0 && lista.every(r => compatibileStile('lowcarb', r, info, DB.cena.some(c => c.id === r.id) ? 'cena' : 'pranzo')), `scambi con menù low carb: solo piatti low carb (${lista.length} proposte)`);

console.log(fail === 0 ? 'MENÙ DIETA: TUTTO OK' : `MENÙ DIETA: ${fail} FALLIMENTI`);
process.exit(fail === 0 ? 0 : 1);
