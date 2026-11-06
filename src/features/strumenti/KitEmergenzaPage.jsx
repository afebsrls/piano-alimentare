import React from 'react';
const { useState, useEffect, useMemo } = React;
import { calcolaKit, kitDaFamiglia, kitTesto, KIT_DEFAULT, PANNOLINI_GIORNO } from '@/core/kitEmergenza';
import { toast } from '@/components/toast';

// ── Kit di emergenza ─────────────────────────────────────────────────
// Si imposta quante persone e per quanti giorni, "Genera" → lista con le
// quantità già moltiplicate e le caselle per segnare cosa c'è già in
// casa. Parametri e spunte restano salvati sul dispositivo.

const SK_KIT = 'kit_emergenza';

const stileInput = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E7EDE2', fontSize: 15, fontWeight: 700, background: '#F8FAF6', outline: 'none' };
const stileLabel = { fontSize: 10.5, fontWeight: 800, color: '#8AA192', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 };
const card = { background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 16, marginBottom: 12 };
const chip = (on) => ({ flex: 1, padding: '9px 2px', borderRadius: 9, border: `1.5px solid ${on ? '#2F6B3A' : '#E7EDE2'}`, background: on ? '#2F6B3A14' : '#F8FAF6', color: on ? '#2F6B3A' : '#6E8576', fontWeight: 800, fontSize: 12, cursor: 'pointer' });
const fmt = (n) => Number(n).toLocaleString('it-IT');

function Contatore({ label, value, min = 0, max = 20, onChange, nota }) {
  return (
    <div>
      <div style={stileLabel}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onChange(Math.max(min, value - 1))} aria-label={`meno ${label}`} style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E7EDE2', background: '#fff', fontSize: 18, fontWeight: 800, color: '#2F6B3A', cursor: 'pointer' }}>−</button>
        <input inputMode="numeric" value={value} onChange={e => { const v = parseInt(e.target.value, 10); onChange(isNaN(v) ? min : Math.max(min, Math.min(max, v))); }} style={{ ...stileInput, textAlign: 'center', flex: 1 }}/>
        <button onClick={() => onChange(Math.min(max, value + 1))} aria-label={`più ${label}`} style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E7EDE2', background: '#fff', fontSize: 18, fontWeight: 800, color: '#2F6B3A', cursor: 'pointer' }}>+</button>
      </div>
      {nota && <div style={{ fontSize: 10.5, color: '#8AA192', marginTop: 4, lineHeight: 1.4 }}>{nota}</div>}
    </div>
  );
}

export function KitEmergenzaPage({ personas = [] }) {
  const [p, setP] = useState(() => kitDaFamiglia(personas));
  const [generato, setGenerato] = useState(null);   // parametri con cui è stata generata la lista
  const [checks, setChecks] = useState({});
  const [dettagli, setDettagli] = useState(false);
  const [caricato, setCaricato] = useState(false);

  // Riprendi l'ultima lista salvata
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(SK_KIT);
        const s = JSON.parse(r.value);
        if (s && s.p) { setP({ ...KIT_DEFAULT, ...s.p }); setGenerato({ ...KIT_DEFAULT, ...s.p }); setChecks(s.checks || {}); }
      } catch {}
      setCaricato(true);
    })();
  }, []);
  useEffect(() => {
    if (!caricato || !generato) return;
    try { window.storage.set(SK_KIT, JSON.stringify({ p: generato, checks })); } catch {}
  }, [generato, checks, caricato]);

  const set = (k) => (v) => setP(x => ({ ...x, [k]: v }));
  const sezioni = useMemo(() => generato ? calcolaKit(generato) : [], [generato]);
  const totale = sezioni.reduce((s, x) => s + x.items.length, 0);
  const fatti = sezioni.reduce((s, x) => s + x.items.filter(i => checks[i.id]).length, 0);
  const cambiato = generato && JSON.stringify(generato) !== JSON.stringify(p);

  const genera = () => { setGenerato({ ...p }); setTimeout(() => document.getElementById('kit-lista')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 50); };
  const testo = () => kitTesto(sezioni, generato);
  const condividi = async () => {
    const t = testo();
    try {
      if (navigator.share) { await navigator.share({ title: 'Kit di emergenza', text: t }); return; }
      await navigator.clipboard.writeText(t); toast('📋 Lista copiata');
    } catch (e) { if (e?.name !== 'AbortError') { try { await navigator.clipboard.writeText(t); toast('📋 Lista copiata'); } catch { toast('Non riesco a copiare'); } } }
  };
  const stampa = () => {
    const w = window.open('', '_blank');
    if (!w) { toast('Consenti i popup per stampare'); return; }
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    w.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Kit di emergenza</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#15251C}h1{font-size:22px}h2{font-size:16px;margin:18px 0 6px;border-bottom:1px solid #ddd;padding-bottom:3px}li{margin:4px 0;list-style:none}li:before{content:"☐ ";}small{color:#666}</style></head><body><h1>Kit di emergenza — ${generato.A} adulti, ${generato.B} bambini, ${generato.G} giorni</h1>${sezioni.map(s => `<h2>${s.icona} ${esc(s.titolo)}</h2><ul>${s.items.map(x => `<li><b>${esc(x.nome)}</b>${x.fisso ? '' : `: ${fmt(x.qta)} ${esc(x.unita)}`}${x.nota ? ` <small>— ${esc(x.nota)}</small>` : ''}</li>`).join('')}</ul>`).join('')}<p><small>Generato con MenuDieta · www.menudieta.it/kit-di-emergenza/</small></p></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
  };

  return (
    <div style={{ padding: '16px 14px 90px' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#15251C' }}>🎒 Kit di emergenza</div>
      <div style={{ fontSize: 12.5, color: '#6E8576', margin: '2px 0 12px', lineHeight: 1.5 }}>
        Cosa serve in casa per cavarsela qualche giorno senza acqua, luce e negozi. Dici per chi è, premi Genera e spunti quello che hai già.
      </div>

      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Contatore label="Adulti" value={p.A} onChange={set('A')}/>
          <Contatore label="Bambini" value={p.B} onChange={v => setP(x => ({ ...x, B: v, Bp: Math.min(x.Bp, v) }))}/>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={stileLabel}>Giorni di autonomia</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[3, 5, 7, 14].map(g => <button key={g} onClick={set('G').bind(null, g)} style={chip(p.G === g)}>{g} giorni</button>)}
          </div>
        </div>
        {p.B > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <Contatore label="Con il pannolino" value={p.Bp} max={p.B} onChange={set('Bp')}/>
            <div>
              <div style={stileLabel}>Pannolini al giorno</div>
              <select value={p.P} onChange={e => set('P')(+e.target.value)} style={stileInput}>
                {PANNOLINI_GIORNO.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
              </select>
            </div>
          </div>
        )}
        <button onClick={() => setDettagli(d => !d)} style={{ marginTop: 12, border: 'none', background: 'none', color: '#2F6B3A', fontWeight: 800, fontSize: 12, cursor: 'pointer', padding: 0 }}>
          {dettagli ? '▾' : '▸'} Altri dettagli (donne, telefoni, stanze, batterie)
        </button>
        {dettagli && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
            <Contatore label="Donne in età fertile" value={p.F} onChange={set('F')}/>
            <Contatore label="Smartphone" value={p.T} onChange={set('T')}/>
            <Contatore label="Stanze usate di notte" value={p.S} min={1} onChange={set('S')}/>
            <div>
              <div style={stileLabel}>Ore di una batteria</div>
              <input inputMode="numeric" value={p.AUT} onChange={e => set('AUT')(Math.max(1, parseInt(e.target.value, 10) || 1))} style={stileInput}/>
              <div style={{ fontSize: 10.5, color: '#8AA192', marginTop: 4 }}>autonomia di un set, dalla confezione della torcia</div>
            </div>
          </div>
        )}
        <button onClick={genera} style={{ width: '100%', marginTop: 14, padding: '13px 0', borderRadius: 12, border: 'none', background: '#15251C', color: '#C7F23E', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
          {generato ? (cambiato ? '🔄 Rigenera la lista' : '✓ Lista generata') : '🎒 Genera il kit'}
        </button>
      </div>

      {generato && (
        <div id="kit-lista">
          <div style={{ ...card, background: '#15251C', color: '#F4F7EF', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{fatti} su {totale} voci già pronte</div>
              <div style={{ fontSize: 11.5, opacity: .8 }}>{generato.A + generato.B} persone · {generato.G} giorni{cambiato ? ' · hai cambiato i dati: rigenera' : ''}</div>
              <div style={{ height: 6, borderRadius: 3, background: '#ffffff22', marginTop: 8, overflow: 'hidden' }}><div style={{ width: `${totale ? Math.round(100 * fatti / totale) : 0}%`, height: '100%', background: '#C7F23E', transition: 'width .3s' }}/></div>
            </div>
            <button onClick={condividi} style={{ border: 'none', background: '#C7F23E', color: '#15251C', borderRadius: 10, padding: '9px 11px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>📤 Condividi</button>
            <button onClick={stampa} style={{ border: '1.5px solid #ffffff44', background: 'none', color: '#F4F7EF', borderRadius: 10, padding: '9px 11px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>🖨️</button>
          </div>

          {sezioni.map(s => (
            <div key={s.id} style={card}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#15251C', marginBottom: 8 }}>{s.icona} {s.titolo} <span style={{ fontSize: 11, color: '#8AA192', fontWeight: 700 }}>{s.items.filter(i => checks[i.id]).length}/{s.items.length}</span></div>
              {s.items.map(x => {
                const on = !!checks[x.id];
                return (
                  <label key={x.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderTop: '1px solid #F0F4EC', cursor: 'pointer', opacity: on ? .55 : 1 }}>
                    <input type="checkbox" checked={on} onChange={() => setChecks(c => ({ ...c, [x.id]: !c[x.id] }))} style={{ width: 20, height: 20, marginTop: 1, accentColor: '#2F6B3A' }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15251C', textDecoration: on ? 'line-through' : 'none' }}>
                        {x.nome}{!x.fisso && <span style={{ color: '#2F6B3A' }}> · {fmt(x.qta)} {x.unita}</span>}
                      </div>
                      {x.nota && <div style={{ fontSize: 11, color: '#6E8576', lineHeight: 1.4, marginTop: 2 }}>{x.nota}</div>}
                    </div>
                  </label>
                );
              })}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setChecks({})} style={{ flex: 1, padding: '11px 0', borderRadius: 11, border: '1.5px solid #E7EDE2', background: '#fff', color: '#6E8576', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>Azzera le spunte</button>
          </div>
          <div style={{ fontSize: 10.5, color: '#9DB1A2', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
            Quantità indicative per una famiglia media. Controlla le scadenze ogni 6 mesi e ruota le scorte.
          </div>
        </div>
      )}
    </div>
  );
}
