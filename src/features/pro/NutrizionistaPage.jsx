import React from 'react';
const { useState, useEffect, useCallback } = React;
import { pazienti as caricaPazienti, dettaglioProfilo, impostaTarget, registraNutrizionista } from '@/db/nutrizionista';
import { SchedaPersona, Chat, C, card, btn, fmtData, Pill } from './SchedaPersona';

// ── Area nutrizionista ───────────────────────────────────────────────
// Shell dedicata (come l'admin): l'account professionale non ha scheda
// MenuDieta. `pro` = { nome, studio, codice, stato } da is_nutrizionista().
export function NutrizionistaPage({ pro, myId, onAggiornaPro }) {
  const [lista, setLista] = useState(null);
  const [sel, setSel] = useState(null);         // paziente selezionato (riga lista)
  const [dett, setDett] = useState(null);
  const [vista, setVista] = useState('scheda'); // scheda | chat
  const [err, setErr] = useState('');

  const carica = useCallback(async () => {
    setErr('');
    try { setLista(await caricaPazienti()); } catch (e) { setErr(e.message); setLista([]); }
  }, []);
  useEffect(() => { if (pro?.stato === 'attivo') carica(); }, [pro?.stato, carica]);

  const apri = async (r) => {
    setSel(r); setDett(null); setVista('scheda');
    try { setDett(await dettaglioProfilo(r.profilo_id)); } catch (e) { setErr(e.message); }
  };
  const salvaTarget = async (t) => {
    try { await impostaTarget(sel.user_id, t); setDett(await dettaglioProfilo(sel.profilo_id)); carica(); }
    catch (e) { setErr(e.message); }
  };

  if (pro?.stato !== 'attivo') {
    return (
      <div style={{ padding: '14px', maxWidth: 640, margin: '0 auto' }}>
        <div style={card}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.scuro }}>🩺 {pro?.nome}{pro?.studio ? ` · ${pro.studio}` : ''}</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
            {pro?.stato === 'sospeso'
              ? 'Il tuo profilo professionale è sospeso. Scrivi a info@menudieta.it.'
              : <>Grazie per esserti registrato. Il profilo professionale viene <b>attivato manualmente</b> entro pochi giorni: riceverai una mail. Nel frattempo questo è il tuo codice, da dare ai pazienti quando sarai attivo:</>}
          </div>
          {pro?.stato !== 'sospeso' && <div style={{ marginTop: 10, fontFamily: 'ui-monospace, monospace', fontSize: 26, fontWeight: 800, color: C.verde, letterSpacing: 2 }}>{pro?.codice}</div>}
          <button onClick={onAggiornaPro} style={{ ...btn(C.chiaro, C.verde), marginTop: 12 }}>↻ Controlla lo stato</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 14px 30px', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.scuro }}>🩺 {pro.nome}{pro.studio ? <span style={{ color: C.grigio, fontWeight: 600 }}> · {pro.studio}</span> : null}</div>
          <div style={{ fontSize: 12, color: C.grigio }}>Codice per i pazienti: <b style={{ fontFamily: 'ui-monospace, monospace', color: C.verde, fontSize: 14, letterSpacing: 1 }}>{pro.codice}</b> · lo inseriscono in Account → Il mio nutrizionista</div>
          <button onClick={() => { const l = `https://www.menudieta.it/app/?nut=${pro.codice}`; navigator.clipboard?.writeText(l); alert('Link di invito copiato:\n' + l + '\n\nMandalo al paziente: aprendolo trova già il tuo codice.'); }} style={{ ...btn(C.chiaro, C.verde), marginTop: 6 }}>🔗 Copia link di invito</button>
        </div>
        <button onClick={carica} style={{ ...btn(C.chiaro, C.verde), marginLeft: 'auto' }}>↻ Aggiorna</button>
      </div>
      {err && <div style={{ ...card, borderColor: C.rosso, color: C.rosso, fontSize: 13 }}>⛔ {err}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: sel ? 'minmax(220px, 300px) 1fr' : '1fr', gap: 12 }}>
        <div>
          {lista === null && <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>}
          {lista && lista.length === 0 && <div style={{ ...card, fontSize: 13 }}>Nessun paziente collegato. Dai il codice <b>{pro.codice}</b> ai tuoi pazienti: lo inseriscono nell’app in Account → Il mio nutrizionista.</div>}
          {(lista || []).map(r => (
            <div key={r.profilo_id} onClick={() => apri(r)} style={{ ...card, cursor: 'pointer', borderColor: sel?.profilo_id === r.profilo_id ? C.verde : C.bordo, background: sel?.profilo_id === r.profilo_id ? C.chiaro : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ fontWeight: 800, color: C.scuro }}>{r.sesso === 'F' ? '👩' : '👨'} {r.nome}</div>
                {r.non_letti > 0 && <span style={{ background: C.rosso, color: '#fff', borderRadius: 999, padding: '0 7px', fontSize: 11, fontWeight: 800 }}>{r.non_letti}</span>}
              </div>
              <div style={{ fontSize: 12, color: '#4A6152', marginTop: 4 }}>
                {r.ultimo_peso ? `⚖️ ${r.ultimo_peso} kg · ` : ''}📏 {r.n_misure} misure{r.ultima_misura ? ` (ultima ${fmtData(r.ultima_misura)})` : ''}<br />
                attivo {fmtData(r.ultima_attivita)} · dal {fmtData(r.dal)}
                {r.target_nutrizionista ? <><br /><Pill color='#fff' bg={C.blu}>target {r.target_nutrizionista.kcal} kcal</Pill></> : null}
              </div>
            </div>
          ))}
        </div>
        {sel && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
              <button onClick={() => setVista('scheda')} style={btn(vista === 'scheda' ? C.scuro : C.chiaro, vista === 'scheda' ? '#fff' : C.verde)}>📋 Scheda</button>
              <button onClick={() => setVista('chat')} style={btn(vista === 'chat' ? C.scuro : C.chiaro, vista === 'chat' ? '#fff' : C.verde)}>💬 Messaggi{sel.non_letti > 0 ? ` (${sel.non_letti})` : ''}</button>
              <button onClick={() => setSel(null)} style={{ ...btn('transparent', C.grigio), marginLeft: 'auto' }}>✕ Chiudi</button>
            </div>
            {vista === 'scheda' && (dett ? <SchedaPersona dettaglio={dett} onTarget={salvaTarget} /> : <div style={{ color: C.grigio, fontSize: 13 }}>Carico la scheda…</div>)}
            {vista === 'chat' && <Chat nutrizionistaId={myId} pazienteId={sel.user_id} myId={myId} altezza={420} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Registrazione professionista (dall'onboarding) ────────────────────
export function RegistrazioneNutrizionista({ onFatto, onAnnulla }) {
  const [f, setF] = useState({ nome: '', studio: '', citta: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inp = (k, ph) => <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} style={{ width: '100%', padding: 11, borderRadius: 10, border: `1.5px solid ${C.bordo}`, fontSize: 15, marginBottom: 8, boxSizing: 'border-box' }} />;
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${C.bordo}`, borderRadius: 18, padding: '22px', boxShadow: '0 8px 30px #00000010' }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: C.scuro, marginBottom: 4 }}>🩺 Sei un nutrizionista?</div>
      <div style={{ fontSize: 13, color: '#4A6152', marginBottom: 12, lineHeight: 1.5 }}>Registra il profilo professionale: i tuoi pazienti si collegano con un codice e vedi misure, diario e andamenti in tempo reale, con la messaggistica integrata. L’attivazione è manuale.</div>
      {inp('nome', 'Nome e cognome *')}{inp('studio', 'Studio / titolo (es. Biologa nutrizionista)')}{inp('citta', 'Città')}
      {err && <div style={{ color: C.rosso, fontSize: 12, marginBottom: 8 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={busy || f.nome.trim().length < 2} onClick={async () => { setBusy(true); setErr(''); try { const r = await registraNutrizionista(f.nome, f.studio, f.citta); onFatto(r); } catch (e) { setErr(e.message); } setBusy(false); }} style={{ ...btn(C.verde), padding: '12px 16px', fontSize: 14, flex: 1 }}>Registra profilo professionale</button>
        <button onClick={onAnnulla} style={{ ...btn(C.chiaro, C.grigio), padding: '12px 16px' }}>Annulla</button>
      </div>
    </div>
  );
}

// ── Lato paziente: "Il mio nutrizionista" (in Account) ───────────────
export function MioNutrizionista({ myId }) {
  const [n, setN] = useState(undefined);
  const [codice, setCodice] = useState(() => { try { return localStorage.getItem('pa__nut-pending') || ''; } catch { return ''; } });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [chat, setChat] = useState(false);
  const daLink = !!codice;   // arrivato da un link di invito
  const ricarica = useCallback(async () => { const { mioNutrizionista } = await import('@/db/nutrizionista'); setN(await mioNutrizionista()); }, []);
  useEffect(() => { ricarica(); }, [ricarica]);
  if (n === undefined) return null;
  if (!n) return (
    <div style={{ ...card, marginBottom: 0 }}>
      <div style={{ fontWeight: 800, color: C.scuro }}>🩺 Il mio nutrizionista</div>
      <div style={{ fontSize: 13, color: '#4A6152', margin: '4px 0 8px', lineHeight: 1.5 }}>{daLink ? 'Il tuo nutrizionista ti ha invitato: conferma il collegamento. Potrà vedere le tue misure e il tuo diario, impostare il tuo target e scriverti. Puoi scollegarti quando vuoi.' : 'Se sei seguito da un nutrizionista che usa MenuDieta, inserisci il suo codice: potrà vedere le tue misure e il tuo diario, impostare il tuo target e scriverti.'}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={codice} onChange={e => setCodice(e.target.value.toUpperCase())} placeholder="NUT-XXXXXX" style={{ flex: 1, padding: 10, borderRadius: 10, border: `1.5px solid ${C.bordo}`, fontSize: 15, fontFamily: 'ui-monospace, monospace' }} />
        <button disabled={busy || codice.trim().length < 6} onClick={async () => { setBusy(true); setErr(''); try { const { collegaNutrizionista } = await import('@/db/nutrizionista'); await collegaNutrizionista(codice); try { localStorage.removeItem('pa__nut-pending'); } catch {} await ricarica(); } catch (e) { setErr(e.message); } setBusy(false); }} style={btn(C.verde)}>Collega</button>
      </div>
      {err && <div style={{ color: C.rosso, fontSize: 12, marginTop: 6 }}>{err}</div>}
    </div>
  );
  return (
    <div style={{ ...card, marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div><div style={{ fontWeight: 800, color: C.scuro }}>🩺 {n.nome}</div><div style={{ fontSize: 12, color: C.grigio }}>{n.studio || 'nutrizionista'} · ti segue dal {fmtData(n.dal)}</div></div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setChat(c => !c)} style={btn(chat ? C.scuro : C.verde)}>💬 Messaggi</button>
          <button disabled={busy} onClick={async () => { if (!window.confirm('Scollegare il nutrizionista? Il target tornerà al calcolo automatico.')) return; setBusy(true); try { const { scollegaNutrizionista } = await import('@/db/nutrizionista'); await scollegaNutrizionista(); await ricarica(); } catch (e) { setErr(e.message); } setBusy(false); }} style={btn(C.chiaro, C.rosso)}>Scollega</button>
        </div>
      </div>
      {err && <div style={{ color: C.rosso, fontSize: 12, marginTop: 6 }}>{err}</div>}
      {chat && <div style={{ marginTop: 10 }}><Chat nutrizionistaId={n.user_id} pazienteId={myId} myId={myId} altezza={300} /></div>}
    </div>
  );
}
