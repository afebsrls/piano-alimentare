// Test: pasti con 0 kcal (bug segnalato dalla pagina Oggi, 9/11/2026).
// Una ricetta di famiglia nel formato nuovo (quantita per taglia) o salvata
// senza kcal sulla riga cloud, scelta dal Ricettario, entrava nel piano con
// 0 kcal e senza ingredienti. Verifica la conversione corretta e la
// riparazione dei pasti già salvati.
import { ING_MAP, cloudRecipeToMeal, registraRicetteUtente, riparaMacroPasto, applyOverridesWeek, macroVuote } from '@/core';

let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fail++; };

ING_MAP.tst_trippa = { id: 'tst_trippa', nome: 'Trippa test', cat: '🫀 Frattaglie', nutri: { kcal: 100, p: 15, c: 0, z: 0, g: 4, f: 0 } };
ING_MAP.tst_passata = { id: 'tst_passata', nome: 'Passata test', cat: '🥫 Varie', nutri: { kcal: 30, p: 1, c: 6, z: 4, g: 0, f: 1 } };

// Riga cloud come la produce rowToRicetta: formato nuovo, kcal della riga a 0
const riga = { id: 'abc-123', titolo: 'Trippa alla romana', categoria: 'pranzo', prep: 60, kcal: 0, p: 0, c: 0, g: 0,
  quantita: { tst_trippa: { uomo: 200, donna: 150, bimbo: 80, unit: 'g' }, tst_passata: { uomo: 100, donna: 100, bimbo: 50, unit: 'g' } },
  ingredienti: [], isMine: true, scope: 'famiglia' };

const m = cloudRecipeToMeal(riga, 'pra_01');
ok(m.uomo.kcal === 230 && m.donna.kcal === 180 && m.bimbo.kcal === 95, `scelta dal Ricettario: kcal per taglia ${m.uomo.kcal}/${m.donna.kcal}/${m.bimbo.kcal} (attese 230/180/95)`);
ok(m.ingredients.length === 2 && m.baseId === 'pra_01', 'ingredienti presenti e collegamento al pasto sostituito');

// Pasto salvato prima della correzione: 0 kcal, nessun ingrediente
const vecchio = { id: 'cloud_abc-123', nome: 'Trippa alla romana', baseId: 'pra_01', isCustom: true,
  uomo: { kcal: 0, p: 0, c: 0, g: 0 }, donna: { kcal: 0, p: 0, c: 0, g: 0 }, bimbo: { kcal: 0, p: 0, c: 0, g: 0 }, _ingredienti: {}, ingredients: [] };
ok(riparaMacroPasto(vecchio) === vecchio, 'senza la ricetta caricata il pasto resta com’era (nessun crash)');
registraRicetteUtente([riga]);
const r = riparaMacroPasto(vecchio);
ok(!macroVuote(r) && r.donna.kcal === 180, `pasto salvato riparato: ${r.donna.kcal} kcal per la taglia donna`);

// Attraverso applyOverridesWeek (quello che usano Oggi, Piano e Spesa)
const settimana = [{ colazione: { id: 'col_01', uomo: { kcal: 481 }, donna: { kcal: 368 }, bimbo: { kcal: 180 } } }];
const ov = { '5:0-pranzo': vecchio };
const w = applyOverridesWeek(settimana, ov, 5);
ok(w[0].pranzo.uomo.kcal === 230 && w[0].colazione.uomo.kcal === 481, 'pagina Oggi: pasto scambiato con kcal corrette, gli altri invariati');
ok(applyOverridesWeek(settimana, {}, 5) === settimana, 'senza nulla da riparare la settimana è lo stesso oggetto (nessun ricalcolo inutile)');

// Pasto personale con ingredienti nel pasto ma macro a zero
const personale = { id: 'custom_1', isCustom: true, uomo: { kcal: 0 }, donna: { kcal: 0 }, bimbo: { kcal: 0 }, _ingredienti: { tst_trippa: { valore: 100, unit: 'g' } } };
ok(riparaMacroPasto(personale).uomo.kcal === 100, 'ricetta personale: kcal dagli ingredienti salvati');

console.log(fail ? `✗ ${fail} test falliti` : '✓ TEST KCAL ZERO OK');
process.exit(fail ? 1 : 0);
