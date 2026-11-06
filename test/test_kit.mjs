// Formule del kit di emergenza: esempio di riferimento 2 adulti + 1 bambino
// con pannolino (6/giorno), 3 giorni, 1 donna, 2 telefoni, 2 stanze, AUT 20 h.
import { calcolaKit, kitDaFamiglia, kitTesto } from '../src/core/kitEmergenza.js';
let fail = 0;
const ok = (n, c) => { console.log('  ' + (c ? '✓' : '✗') + ' ' + n); if (!c) fail = 1; };
const kit = calcolaKit({ A: 2, B: 1, G: 3, Bp: 1, P: 6, F: 1, T: 2, S: 2, AUT: 20 });
const q = (id) => { for (const s of kit) for (const x of s.items) if (x.id === id) return x.qta; return undefined; };
ok('acqua 5·2·3 + 3·1·3 = 39 L', q('acqua') === 39);
ok('scatolame 2·2·3 + 1·3 + 3 = 18', q('scatolame') === 18);
ok('latte 0,25·2·3 + 0,5·1·3 = 3 L', q('latte') === 3);
ok('omogeneizzati ceil(5·1·3·1,2) = 18', q('omogeneizzati') === 18);
ok('cartucce ceil(1,5/1,5)+1 = 2', q('cartucce') === 2);
ok('batterie (2+1+3+1)·(ceil(15/20)+1) = 14', q('batterie') === 14);
ok('power bank ceil(2·3·4000/0,65)=36924 → 2 pezzi', q('powerbank') === 2);
ok('salviette 20·3·3 + 10·1·3 = 210', q('salviette') === 210);
ok('carta igienica ceil(4,5)+1 = 6', q('carta') === 6);
ok('pannolini ceil(6·1·3·1,3) = 24', q('pannolini') === 24);
ok('assorbenti 6·1·3 = 18', q('assorbenti') === 18);
ok('antipiretico 2 confezioni con bambini', q('antipiretico') === 2);
ok('contanti 75·3 = 225', q('contanti') === 225);
ok('giochi 2·3·1 = 6', q('giochi') === 6);
const senza = calcolaKit({ A: 2, B: 0, G: 3, Bp: 0, F: 0 });
ok('senza bambini: niente sezione Bambini né pannolini', !senza.some(s => s.id === 'bambini') && senza.every(s => !s.items.some(x => x.id === 'pannolini' || x.id === 'antipiretico')));
const fam = kitDaFamiglia([{ eta: 38, sesso: 'M' }, { eta: 31, sesso: 'F' }, { eta: 2, sesso: 'M' }]);
ok('dalla famiglia: 2 adulti, 1 bambino con pannolino, 1 donna', fam.A === 2 && fam.B === 1 && fam.Bp === 1 && fam.F === 1 && fam.P === 6);
ok('testo condivisibile contiene le voci', /Acqua potabile: 39 litri/.test(kitTesto(kit, { A: 2, B: 1, G: 3 })));
console.log(fail ? '✗ TEST KIT FALLITO' : '✓ TEST KIT OK'); process.exit(fail);
