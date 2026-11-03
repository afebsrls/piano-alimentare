import React from 'react';
const { useState, useEffect, useRef, useMemo } = React;
import { LineChart } from '@/components/charts';
import { TUTTI_FIELDS, MEAL_META, calcTargetAdattivo } from '@/core';
import { dataNascitaToEta } from '@/db/cloud';
import { caricaMessaggi, inviaMessaggio, segnaLetti, onNuoviMessaggi } from '@/db/nutrizionista';

// ── Stili condivisi (plancia admin e area nutrizionista) ─────────────
export const C = { verde: '#2F6B3A', scuro: '#15251C', grigio: '#9DB1A2', chiaro: '#EDF7EF', bordo: '#E7EDE2', lime: '#C7F23E', rosso: '#dc2626', ambra: '#d97706', blu: '#0891b2' };
export const card = { background: '#fff', border: `1px solid ${C.bordo}`, borderRadius: 14, padding: 14, marginBottom: 10 };
export const btn = (bg, fg = '#fff') => ({ padding: '8px 12px', borderRadius: 10, border: 'none', background: bg, color: fg, fontWeight: 700, fontSize: 12, cursor: 'pointer' });
export const fmtData = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso), diff = (Date.now() - d.getTime()) / 864e5;
  if (diff < 1) return 'oggi';
  if (diff < 2) return 'ieri';
  if (diff < 30) return `${Math.floor(diff)} gg fa`;
  return d.toLocaleDateString('it-IT');
};
const isoToIT = (iso) => { const [a, m, g] = String(iso).slice(0, 10).split('-'); return `${g}/${m}/${a}`; };

// Converte le misure cloud [{data, valori}] nel formato dei grafici dell'app
export const misureCloudToRecords = (misure) => (misure || []).map(m => ({ date: isoToIT(m.data), ...(m.valori || {}) }));

export function Pill({ children, color = C.verde, bg = C.chiaro }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: bg, color, fontSize: 11, fontWeight: 700, marginRight: 4 }}>{children}</span>;
}

// ── Scheda persona: anagrafica, target, misure (grafici), diario, ricette ──
// `dettaglio` = risultato di dettaglio_profilo(). `onTarget` (solo
// nutrizionista) riceve il nuovo target o null.
export function SchedaPersona({ dettaglio, onTarget, onApriFamiglia, onApriProfilo }) {
  const [tab, setTab] = useState('riepilogo');
  const p = dettaglio.profilo;
  const records = useMemo(() => misureCloudToRecords(dettaglio.misure), [dettaglio.misure]);
  const eta = p.data_nascita ? dataNascitaToEta(p.data_nascita) : null;
  const persona = { nome: p.nome, sesso: p.sesso, eta: eta ?? 30, peso: +p.peso || 70, altezza: +p.altezza || 170, lavoro: p.lavoro, allenamenti: p.allenamenti ?? 3, obiettivo: p.obiettivo, dietaIntensita: p.dieta_intensita, pesoTarget: p.peso_target, targetNutrizionista: p.target_nutrizionista };
  const target = useMemo(() => { try { return calcTargetAdattivo(persona, records); } catch { return null; } }, [dettaglio]);
  const ultima = records.length ? records[records.length - 1] : null;
  const mealsLog = dettaglio.dati?.meals_log?.valore || {};
  const giorniLog = Object.keys(mealsLog).sort().reverse().slice(0, 14);

  const TABS = [['riepilogo', '📋 Riepilogo'], ['misure', '📏 Misure'], ['diario', '🍽️ Diario'], ['dati', '🗂️ Dati']];
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} style={btn(tab === k ? C.scuro : C.chiaro, tab === k ? '#fff' : C.verde)}>{l}</button>)}
      </div>

      {tab === 'riepilogo' && (
        <>
          <div style={card}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.scuro }}>{p.sesso === 'F' ? '👩' : '👨'} {p.nome} {eta != null ? <span style={{ color: C.grigio, fontWeight: 600 }}>· {eta} anni</span> : null}</div>
            {p.email && <div style={{ fontSize: 12, color: C.grigio, wordBreak: 'break-all' }}>{p.email}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 13, marginTop: 8, color: '#4A6152' }}>
              <span>⚖️ {p.peso ?? '—'} kg</span><span>📐 {p.altezza ?? '—'} cm</span><span>💼 {p.lavoro}</span><span>🏃 {p.allenamenti} gg/sett</span>
              <span>🎯 {p.obiettivo}{p.peso_target ? ` → ${p.peso_target} kg` : ''}</span>
              <span>🆕 iscritto {fmtData(p.created_at)}</span><span>🔐 login {fmtData(p.ultimo_login)}</span><span>✏️ aggiornato {fmtData(p.updated_at)}</span>
            </div>
            {dettaglio.famiglia && (
              <div style={{ marginTop: 10, fontSize: 13 }}>
                👨‍👩‍👧 Famiglia <b>{dettaglio.famiglia.nome}</b>{onApriFamiglia && <button onClick={() => onApriFamiglia(dettaglio.famiglia.id)} style={{ ...btn(C.chiaro, C.verde), marginLeft: 8 }}>Apri →</button>}
                <div style={{ marginTop: 4 }}>{(dettaglio.famiglia.membri || []).map(m => (
                  <span key={m.id} onClick={() => onApriProfilo && m.id !== p.id && onApriProfilo(m.id)} style={{ cursor: onApriProfilo && m.id !== p.id ? 'pointer' : 'default' }}>
                    <Pill color={m.id === p.id ? '#fff' : C.verde} bg={m.id === p.id ? C.verde : C.chiaro}>{m.sesso === 'F' ? '👩' : '👨'} {m.nome}{!m.user_id ? ' (gestito)' : ''}</Pill>
                  </span>))}</div>
              </div>
            )}
            {dettaglio.nutrizionista && <div style={{ marginTop: 8, fontSize: 13 }}>🩺 Seguito da <b>{dettaglio.nutrizionista.nome}</b>{dettaglio.nutrizionista.studio ? ` (${dettaglio.nutrizionista.studio})` : ''} dal {fmtData(dettaglio.nutrizionista.dal)}</div>}
          </div>

          <div style={card}>
            <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>🎯 Target giornaliero {target?.daNutrizionista ? <Pill color='#fff' bg={C.blu}>impostato dal nutrizionista</Pill> : <Pill>calcolato dall’app</Pill>}</div>
            {target ? (
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'ui-monospace, monospace', fontSize: 15 }}>
                <span><b>{target.kcal}</b> kcal</span><span>P <b>{target.p}</b> g</span><span>C <b>{target.c}</b> g</span><span>G <b>{target.g}</b> g</span>
                <span style={{ fontSize: 12, color: C.grigio, fontFamily: 'inherit' }}>fabbisogno stimato {target.tdeeFinale} kcal · {target.nMisure} misure{target.usaTDEEAdattivo ? ' · adattivo' : ''}</span>
              </div>
            ) : <div style={{ color: C.grigio, fontSize: 13 }}>Dati insufficienti.</div>}
            {p.target_nutrizionista?.nota && <div style={{ fontSize: 12, color: '#4A6152', marginTop: 6 }}>Nota: {p.target_nutrizionista.nota}</div>}
            {onTarget && <TargetEditor attuale={p.target_nutrizionista} suggerito={target} onSave={onTarget} />}
          </div>

          <div style={card}>
            <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>⚖️ Andamento peso</div>
            {records.filter(r => !isNaN(parseFloat(r.peso))).length >= 2
              ? <LineChart records={records} field="peso" color={C.scuro} unit="kg" label="Peso" />
              : <div style={{ color: C.grigio, fontSize: 13 }}>Servono almeno 2 pesate. {ultima ? `Ultima: ${ultima.peso ?? '—'} kg il ${ultima.date}.` : 'Nessuna misurazione.'}</div>}
          </div>
        </>
      )}

      {tab === 'misure' && (
        <>
          {records.length === 0 && <div style={{ ...card, color: C.grigio, fontSize: 13 }}>Nessuna misurazione registrata.</div>}
          {TUTTI_FIELDS.filter(f => records.some(r => !isNaN(parseFloat(r[f.key])))).map(f => (
            <div key={f.key} style={card}>
              <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 4 }}>{f.emoji} {f.label} <span style={{ color: C.grigio, fontWeight: 600, fontSize: 12 }}>· ultimo {ultima?.[f.key] ?? '—'} {f.unit}</span></div>
              <LineChart records={records} field={f.key} color={f.color} unit={f.unit} label={f.label} />
            </div>
          ))}
          {records.length > 0 && (
            <div style={card}>
              <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>Tutte le misurazioni ({records.length})</div>
              <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
                <thead><tr>{['Data', ...TUTTI_FIELDS.map(f => f.label)].map(h => <th key={h} style={{ textAlign: 'left', padding: '4px 6px', borderBottom: `1px solid ${C.bordo}`, color: C.grigio }}>{h}</th>)}</tr></thead>
                <tbody>{records.slice().reverse().map((r, i) => <tr key={i}><td style={{ padding: '4px 6px', whiteSpace: 'nowrap' }}>{r.date}</td>{TUTTI_FIELDS.map(f => <td key={f.key} style={{ padding: '4px 6px' }}>{r[f.key] ?? ''}</td>)}</tr>)}</tbody>
              </table></div>
            </div>
          )}
        </>
      )}

      {tab === 'diario' && (
        <>
          {giorniLog.length === 0 && <div style={{ ...card, color: C.grigio, fontSize: 13 }}>Nessun pasto registrato.</div>}
          {giorniLog.map(g => {
            const d = mealsLog[g] || {};
            const pasti = Object.entries(d).filter(([k, v]) => k !== 'acqua' && v && typeof v === 'object');
            return (
              <div key={g} style={card}>
                <div style={{ fontWeight: 800, color: C.scuro }}>{isoToIT(g)} {d.acqua != null ? <span style={{ color: C.blu, fontWeight: 600, fontSize: 12 }}>· 💧 {d.acqua} bicchieri</span> : null}</div>
                <div style={{ fontSize: 13, color: '#4A6152', marginTop: 4 }}>
                  {pasti.length === 0 ? 'nessun pasto segnato' : pasti.map(([k, v]) => {
                    const lab = MEAL_META?.[k]?.label || k;
                    const stato = v?.saltato ? ' · saltato' : v?.consumed ? (v.kcal ? ` · ${Math.round(v.kcal)} kcal ✓` : ' ✓') : '';
                    return <span key={k} style={{ marginRight: 12, color: v?.saltato ? C.ambra : 'inherit' }}>{lab}{stato}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {tab === 'dati' && (
        <>
          <div style={card}>
            <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>📖 Ricette create ({dettaglio.ricette?.length || 0})</div>
            {(dettaglio.ricette || []).map(r => <div key={r.id} style={{ fontSize: 13, padding: '3px 0' }}>{r.titolo} <span style={{ color: C.grigio }}>· {r.categoria} · {Math.round(r.kcal || 0)} kcal · {r.scope} · {fmtData(r.created_at)}</span></div>)}
          </div>
          <div style={card}>
            <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>🗂️ Dati sincronizzati del profilo</div>
            {Object.entries(dettaglio.dati || {}).map(([k, v]) => (
              <details key={k} style={{ fontSize: 13, padding: '4px 0' }}>
                <summary style={{ cursor: 'pointer' }}><b>{k}</b> <span style={{ color: C.grigio }}>· aggiornato {fmtData(v.updated_at)}</span></summary>
                <pre style={{ fontSize: 11, background: '#F4F7EF', padding: 8, borderRadius: 8, overflowX: 'auto', maxHeight: 260 }}>{JSON.stringify(v.valore, null, 1)}</pre>
              </details>
            ))}
            {Object.keys(dettaglio.dati || {}).length === 0 && <div style={{ color: C.grigio, fontSize: 13 }}>Nessun dato.</div>}
          </div>
        </>
      )}
    </div>
  );
}

function TargetEditor({ attuale, suggerito, onSave }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ kcal: attuale?.kcal || suggerito?.kcal || '', p: attuale?.p || '', c: attuale?.c || '', g: attuale?.g || '', nota: attuale?.nota || '' });
  const [busy, setBusy] = useState(false);
  const inp = (k, ph) => <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} inputMode="numeric" style={{ width: '100%', padding: 8, borderRadius: 8, border: `1px solid ${C.bordo}`, fontSize: 14 }} />;
  if (!open) return <div style={{ marginTop: 10, display: 'flex', gap: 6 }}><button onClick={() => setOpen(true)} style={btn(C.blu)}>✏️ {attuale ? 'Modifica target' : 'Imposta target'}</button>{attuale && <button disabled={busy} onClick={async () => { setBusy(true); await onSave(null); setBusy(false); }} style={btn(C.chiaro, C.rosso)}>Torna al calcolo automatico</button>}</div>;
  return (
    <div style={{ marginTop: 10, background: '#F4F7EF', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        <div><label style={{ fontSize: 11, color: C.grigio, fontWeight: 700 }}>KCAL</label>{inp('kcal', 'es. 1800')}</div>
        <div><label style={{ fontSize: 11, color: C.grigio, fontWeight: 700 }}>PROT g</label>{inp('p', 'auto')}</div>
        <div><label style={{ fontSize: 11, color: C.grigio, fontWeight: 700 }}>CARB g</label>{inp('c', 'auto')}</div>
        <div><label style={{ fontSize: 11, color: C.grigio, fontWeight: 700 }}>GRASSI g</label>{inp('g', 'auto')}</div>
      </div>
      <input value={f.nota} onChange={e => setF({ ...f, nota: e.target.value })} placeholder="Nota per il paziente (facoltativa)" style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 8, border: `1px solid ${C.bordo}`, fontSize: 13 }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <button disabled={busy || !(+f.kcal > 0)} onClick={async () => { setBusy(true); await onSave({ kcal: +f.kcal, p: +f.p || null, c: +f.c || null, g: +f.g || null, nota: f.nota || null }); setBusy(false); setOpen(false); }} style={btn(C.verde)}>Salva</button>
        <button onClick={() => setOpen(false)} style={btn(C.chiaro, C.grigio)}>Annulla</button>
      </div>
      <div style={{ fontSize: 11, color: C.grigio, marginTop: 6 }}>Il paziente vedrà questo target in Oggi e nel Piano; i macro lasciati vuoti vengono calcolati in proporzione.</div>
    </div>
  );
}

// ── Chat nutrizionista ↔ paziente ────────────────────────────────────
export function Chat({ nutrizionistaId, pazienteId, myId, altezza = 320 }) {
  const [msgs, setMsgs] = useState(null);
  const [testo, setTesto] = useState('');
  const [err, setErr] = useState('');
  const box = useRef(null);
  useEffect(() => {
    let vivo = true;
    caricaMessaggi(nutrizionistaId, pazienteId).then(m => { if (vivo) setMsgs(m); segnaLetti(nutrizionistaId, pazienteId); }).catch(e => setErr(e.message));
    const off = onNuoviMessaggi(nutrizionistaId, pazienteId, (m) => { setMsgs(prev => prev && prev.some(x => x.id === m.id) ? prev : [...(prev || []), m]); if (m.mittente !== myId) segnaLetti(nutrizionistaId, pazienteId); });
    return () => { vivo = false; off(); };
  }, [nutrizionistaId, pazienteId]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs]);
  const invia = async () => {
    const t = testo.trim(); if (!t) return;
    setTesto('');
    try { await inviaMessaggio(nutrizionistaId, pazienteId, t); } catch (e) { setErr(e.message); setTesto(t); }
  };
  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
      <div ref={box} style={{ height: altezza, overflowY: 'auto', padding: 12, background: '#F4F7EF' }}>
        {msgs === null && <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>}
        {msgs && msgs.length === 0 && <div style={{ color: C.grigio, fontSize: 13, textAlign: 'center', marginTop: 40 }}>Nessun messaggio. Scrivi il primo.</div>}
        {(msgs || []).map(m => {
          const mio = m.mittente === myId;
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: mio ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
              <div style={{ maxWidth: '78%', background: mio ? C.verde : '#fff', color: mio ? '#fff' : C.scuro, padding: '8px 12px', borderRadius: 14, fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word', boxShadow: '0 1px 2px #0001' }}>
                {m.testo}
                <div style={{ fontSize: 10, opacity: .7, marginTop: 3, textAlign: 'right' }}>{new Date(m.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          );
        })}
      </div>
      {err && <div style={{ color: C.rosso, fontSize: 12, padding: '6px 12px' }}>{err}</div>}
      <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: `1px solid ${C.bordo}` }}>
        <input value={testo} onChange={e => setTesto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); invia(); } }} placeholder="Scrivi un messaggio…" style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${C.bordo}`, fontSize: 14 }} />
        <button onClick={invia} style={btn(C.verde)}>Invia</button>
      </div>
    </div>
  );
}
