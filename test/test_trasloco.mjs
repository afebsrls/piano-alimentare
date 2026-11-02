// TEST 2l — Trasloco github.io → fitsy.it: i dati locali fanno il giro
// completo (impacchettamento nell'hash → importazione) senza perdite.
import { JSDOM, VirtualConsole } from 'jsdom';

function makeWin(url) {
  const dom = new JSDOM('<div id="root"></div>', { url, virtualConsole: new VirtualConsole() });
  globalThis.window = dom.window;
  globalThis.localStorage = dom.window.localStorage;
  return dom.window;
}

let ok = true;
const check = (c, msg) => { console.log((c ? '  ✓ ' : '  ✗ ') + msg); if (!c) ok = false; };

// ── 1. Vecchio sito: riconoscimento + impacchettamento ──
const w1 = makeWin('https://tarzanhello.github.io/piano-alimentare/');
const T = await import('@/features/trasloco/Trasloco.jsx');
check(T.isVecchioSito(), 'github.io è riconosciuto come vecchio sito');

const campione = {
  'pa__profili': JSON.stringify([{ nome: 'Niccolò 🍝', peso: 70.5, note: 'più carboidrati — "ok"' }]),
  'pa__piano': JSON.stringify({ seed: 'abc', giorni: Array.from({ length: 300 }, (_, i) => ({ i, pasto: 'Pasta al pomodoro ' + i })) }),
  'sb-xyz-auth-token': JSON.stringify({ access_token: 'tok', user: { email: 'a@b.it' } }),
  'fitsy-intro-done': '1',
};
for (const [k, v] of Object.entries(campione)) w1.localStorage.setItem(k, v);
w1.localStorage.setItem('pa__trasloco-fatto', '1');   // NON deve viaggiare
const dati = T.raccogliDatiLocali();
check(Object.keys(dati).length === 4 && !('pa__trasloco-fatto' in dati), 'raccoglie tutto tranne il flag di trasloco');

// Simula ciò che fa il bottone (stesso codice di toB64 del modulo)
const toB64 = (s) => { const b = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const hash = '#trasloco=' + toB64(JSON.stringify(dati));
check(!/[+/=]/.test(hash.slice(10)), "l'hash è URL-safe (niente + / =)");

// ── 2. Nuovo sito: importazione ──
const w2 = makeWin('https://www.fitsy.it/app/' + hash);
check(!T.isVecchioSito(), 'fitsy.it NON è il vecchio sito (niente banner)');
const importato = T.importaTrasloco();
check(importato === true, 'importa (e chiede il reload)');
for (const [k, v] of Object.entries(campione)) check(w2.localStorage.getItem(k) === v, `chiave ${k} identica dopo il giro`);
check(w2.localStorage.getItem('pa__trasloco-fatto') === null, 'il flag di trasloco non è arrivato');
check(!w2.location.hash, "l'URL è stato ripulito dai dati");

// ── 3. Nuovo sito senza hash: non fa nulla ──
const w3 = makeWin('https://www.fitsy.it/app/');
check(T.importaTrasloco() === false, 'senza hash non importa nulla');

if (!ok) { console.log('✗ TEST 2l FALLITO'); process.exit(1); }
console.log('✓ TEST 2l OK');
