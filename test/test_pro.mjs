// TEST 5 — Area nutrizionista, scheda persona e plancia admin montano senza crash.
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><div id=root></div>', { url:'https://localhost/', pretendToBeVisual:true });
global.window = dom.window; global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
window.matchMedia = () => ({ matches:false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
window.storage = { get: async () => { throw new Error('nf'); }, set: async () => {}, delete: async () => {}, list: async () => ({ keys:[] }) };
global.IS_REACT_ACT_ENVIRONMENT = true;

const React = (await import('react')).default;
const { createRoot } = await import('react-dom/client');
const { act } = await import('react');
const { SchedaPersona, Chat } = await import('@/features/pro/SchedaPersona');
const { NutrizionistaPage, MioNutrizionista } = await import('@/features/pro/NutrizionistaPage');
const { AdminPage } = await import('@/features/admin/AdminPage');

let fails = 0;
const check = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
async function mount(el, name) {
  const host = document.createElement('div'); document.body.appendChild(host);
  const root = createRoot(host);
  let err = null;
  try { await act(async () => { root.render(el); }); await act(async () => { await new Promise(r => setTimeout(r, 30)); }); }
  catch (e) { err = e; }
  check(!err && host.textContent.length > 0, `${name} monta (${host.textContent.slice(0, 50).replace(/\s+/g, ' ')}…)${err ? ' ERR: ' + err.message : ''}`);
  return host;
}

const dettaglio = {
  profilo: { id: 'pr1', user_id: 'u1', nome: 'Marta', sesso: 'F', data_nascita: '1988-05-01', peso: 64, altezza: 168, lavoro: 'attivo', allenamenti: 3, obiettivo: 'perdita', email: 'm@x.it', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z', target_nutrizionista: { kcal: 1700, p: 90, nota: 'test' } },
  famiglia: { id: 'f1', nome: 'Rossi', membri: [{ id: 'pr1', nome: 'Marta', sesso: 'F', user_id: 'u1' }, { id: 'pr2', nome: 'Leo', sesso: 'M', user_id: null }] },
  misure: [{ data: '2026-10-01', valori: { peso: '66', vita: '80' } }, { data: '2026-10-15', valori: { peso: '65,2', vita: '79' } }, { data: '2026-11-01', valori: { peso: '64', vita: '78' } }],
  dati: { meals_log: { updated_at: '2026-11-01T00:00:00Z', valore: { '2026-11-01': { colazione: { consumed: true, kcal: 350 }, pranzo: { saltato: true } } } } },
  ricette: [{ id: 'r1', titolo: 'Pasta e ceci', categoria: 'pranzo', kcal: 520, scope: 'famiglia', created_at: '2026-10-10' }],
  nutrizionista: { nome: 'Dott.ssa Bianchi', studio: 'Studio', dal: '2026-10-01' },
};
const h1 = await mount(React.createElement(SchedaPersona, { dettaglio, onTarget: async () => {} }), 'SchedaPersona');
check(h1.textContent.includes('1700') && h1.textContent.includes('impostato dal nutrizionista'), 'la scheda mostra il target imposto dal nutrizionista (1700 kcal)');
check(h1.querySelector('svg') !== null, 'grafico del peso disegnato con 3 misure');
await mount(React.createElement(NutrizionistaPage, { pro: { nome: 'Dott. Verdi', codice: 'NUT-ABC123', stato: 'attesa' }, myId: 'n1', onAggiornaPro: () => {} }), 'NutrizionistaPage (in attesa)');
await mount(React.createElement(NutrizionistaPage, { pro: { nome: 'Dott. Verdi', codice: 'NUT-ABC123', stato: 'attivo' }, myId: 'n1', onAggiornaPro: () => {} }), 'NutrizionistaPage (attivo, cloud assente)');
await mount(React.createElement(AdminPage), 'AdminPage (cloud assente → messaggio di errore, non crash)');

// Motore: il target del nutrizionista ha la precedenza
const { calcTargetAdattivo } = await import('@/core');
const t = calcTargetAdattivo({ nome: 'X', sesso: 'M', eta: 40, peso: 80, altezza: 178, lavoro: 'attivo', allenamenti: 3, obiettivo: 'mantenimento', targetNutrizionista: { kcal: 2100, p: 120 } }, []);
check(t.kcal === 2100 && t.p === 120 && t.daNutrizionista && t.c > 0 && t.g > 0, `calcTargetAdattivo rispetta il target del nutrizionista (${t.kcal} kcal, P${t.p} C${t.c} G${t.g})`);
const t2 = calcTargetAdattivo({ nome: 'X', sesso: 'M', eta: 40, peso: 80, altezza: 178, lavoro: 'attivo', allenamenti: 3, obiettivo: 'mantenimento', targetNutrizionista: null }, []);
check(!t2.daNutrizionista && t2.kcal > 2000, 'senza target imposto il calcolo resta quello automatico');

if (fails) { console.log('✗ TEST 5 FALLITO'); process.exit(1); }
console.log('✓ TEST 5 OK'); process.exit(0);
