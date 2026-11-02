import React from 'react';
const { useState, useEffect, useMemo, useCallback } = React;
import { adminStats, adminUtenti, adminRicette, adminRicettaAzione } from '@/db/admin';
import { ING_MAP } from '@/core';

// ── 🛠️ Plancia admin ─────────────────────────────────────────────────
// Tre sezioni: Panoramica (numeri), Utenti (chi fa cosa), Ricette
// (vedi / copia / valida / pubblica / ritira). Visibile solo agli admin.

const C = { verde: '#2F6B3A', scuro: '#15251C', grigio: '#9DB1A2', chiaro: '#EDF7EF', bordo: '#E7EDE2', lime: '#C7F23E', rosso: '#dc2626', ambra: '#d97706' };
const card = { background: '#fff', border: `1px solid ${C.bordo}`, borderRadius: 14, padding: 14, marginBottom: 10 };
const btn = (bg, fg = '#fff') => ({ padding: '8px 12px', borderRadius: 10, border: 'none', background: bg, color: fg, fontWeight: 700, fontSize: 12, cursor: 'pointer' });

const fmtData = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso), diff = (Date.now() - d.getTime()) / 864e5;
  if (diff < 1) return 'oggi';
  if (diff < 2) return 'ieri';
  if (diff < 30) return `${Math.floor(diff)} gg fa`;
  return d.toLocaleDateString('it-IT');
};
const nomeIng = (id) => ING_MAP?.[id]?.nome || id;

export function AdminPage({ onTorna }) {
  const [tab, setTab] = useState('panoramica');
  const [stats, setStats] = useState(null);
  const [utenti, setUtenti] = useState(null);
  const [ricette, setRicette] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const carica = useCallback(async () => {
    setErr('');
    try {
      const [s, u, r] = await Promise.all([adminStats(), adminUtenti(), adminRicette()]);
      setStats(s); setUtenti(u || []); setRicette(r || []);
    } catch (e) {
      setErr(e?.message || 'Errore di caricamento');
    }
  }, []);
  useEffect(() => { carica(); }, [carica]);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500); };

  return (
    <div style={{ padding: '12px 14px 90px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {onTorna && <button onClick={onTorna} style={{ ...btn('transparent', C.verde), fontSize: 18, padding: '4px 8px' }}>‹</button>}
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.scuro }}>🛠️ Plancia admin</div>
          <div style={{ fontSize: 12, color: C.grigio }}>Solo per gli amministratori di Fitsy</div>
        </div>
        <button onClick={carica} style={{ ...btn(C.chiaro, C.verde), marginLeft: 'auto' }}>↻ Aggiorna</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[['panoramica', '📊 Panoramica'], ['utenti', '👥 Utenti'], ['ricette', '📖 Ricette']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ ...btn(tab === k ? C.verde : C.chiaro, tab === k ? '#fff' : C.verde), flex: 1 }}>
            {l}{k === 'ricette' && stats?.ricette_da_validare > 0 ? ` (${stats.ricette_da_validare})` : ''}
          </button>
        ))}
      </div>

      {err && <div style={{ ...card, borderColor: C.rosso, color: C.rosso, fontSize: 13 }}>⛔ {err}<div style={{ color: C.grigio, marginTop: 4 }}>Se è la prima volta: va eseguito <code>supabase/s12_plancia_admin.sql</code> nel SQL Editor.</div></div>}
      {msg && <div style={{ ...card, background: C.chiaro, color: C.verde, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

      {tab === 'panoramica' && <Panoramica stats={stats} />}
      {tab === 'utenti' && <Utenti utenti={utenti} />}
      {tab === 'ricette' && <Ricette ricette={ricette} onReload={carica} flash={flash} setErr={setErr} />}
    </div>
  );
}

function Panoramica({ stats }) {
  if (!stats) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;
  const voci = [
    ['👤 Utenti registrati', stats.utenti],
    ['🧒 Profili gestiti (figli ecc.)', stats.profili_gestiti],
    ['👨‍👩‍👧 Famiglie', stats.famiglie],
    ['🔥 Famiglie attive (7 gg)', stats.famiglie_attive_7g],
    ['📅 Famiglie attive (30 gg)', stats.famiglie_attive_30g],
    ['🆕 Nuovi utenti (30 gg)', stats.nuovi_utenti_30g],
    ['📖 Ricette create dagli utenti', stats.ricette_utente],
    ['⏳ Ricette da validare', stats.ricette_da_validare],
    ['🌍 Ricette pubbliche', stats.ricette_pubbliche],
    ['📏 Misurazioni salvate', stats.misure_totali],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
      {voci.map(([l, v]) => (
        <div key={l} style={{ ...card, marginBottom: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.scuro }}>{v ?? 0}</div>
          <div style={{ fontSize: 12, color: C.grigio }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Utenti({ utenti }) {
  const [q, setQ] = useState('');
  if (!utenti) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;
  const lista = utenti.filter(u => !q || [u.email, u.nome, u.famiglia_nome].join(' ').toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca per email, nome o famiglia…"
        style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${C.bordo}`, marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }} />
      <div style={{ fontSize: 12, color: C.grigio, marginBottom: 8 }}>{lista.length} utenti · ordinati per attività recente</div>
      {lista.map(u => (
        <div key={u.profilo_id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
            <div style={{ fontWeight: 800, color: C.scuro }}>{u.sesso === 'F' ? '👩' : '👨'} {u.nome} {u.capo_famiglia ? <span title="Capo famiglia">👑</span> : null}</div>
            <div style={{ fontSize: 12, color: (Date.now() - new Date(u.ultima_attivita || 0)) < 7 * 864e5 ? C.verde : C.grigio, fontWeight: 700 }}>attivo: {fmtData(u.ultima_attivita)}</div>
          </div>
          <div style={{ fontSize: 12, color: C.grigio, marginTop: 2, wordBreak: 'break-all' }}>{u.email || '—'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, marginTop: 8, color: '#4A6152' }}>
            <span>👨‍👩‍👧 {u.famiglia_nome ? `${u.famiglia_nome} (${u.membri})` : 'nessuna famiglia'}</span>
            <span>📖 {u.n_ricette} ricette</span>
            <span>📏 {u.n_misure} misure</span>
            <span>🆕 iscritto {fmtData(u.iscritto_il)}</span>
            <span>🔐 login {fmtData(u.ultimo_login)}</span>
          </div>
        </div>
      ))}
    </>
  );
}

function Ricette({ ricette, onReload, flash, setErr }) {
  const [filtro, setFiltro] = useState('da_validare');
  const [aperta, setAperta] = useState(null);
  const [busy, setBusy] = useState(null);
  if (!ricette) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;

  const lista = ricette.filter(r =>
    filtro === 'tutte' ? true :
    filtro === 'pubbliche' ? r.scope === 'pubblica' :
    filtro === 'validate' ? (r.validata_at && r.scope !== 'pubblica') :
    (!r.validata_at && r.scope !== 'pubblica'));

  const azione = async (r, az) => {
    setBusy(r.id + az); setErr('');
    try {
      await adminRicettaAzione(r.id, az);
      flash({ valida: '✅ Ricetta validata', annulla_validazione: '↩️ Validazione annullata', pubblica: '🌍 Ricetta pubblicata nel catalogo', ritira: '🔒 Ricetta ritirata dal catalogo' }[az]);
      await onReload();
    } catch (e) { setErr(e?.message || 'Errore'); }
    setBusy(null);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {[['da_validare', '⏳ Da validare'], ['validate', '✅ Validate'], ['pubbliche', '🌍 Pubbliche'], ['tutte', 'Tutte']].map(([k, l]) => (
          <button key={k} onClick={() => setFiltro(k)} style={btn(filtro === k ? C.scuro : C.chiaro, filtro === k ? '#fff' : C.verde)}>{l}</button>
        ))}
      </div>
      {lista.length === 0 && <div style={{ color: C.grigio, fontSize: 13 }}>Nessuna ricetta in questa sezione.</div>}
      {lista.map(r => {
        const open = aperta === r.id;
        const ingList = r.quantita && typeof r.quantita === 'object'
          ? Object.entries(r.quantita).map(([id, q]) => `${nomeIng(id)} ${q?.uomo ?? q?.g ?? ''}${q?.unit || 'g'}`)
          : (r.ingredienti || []).map(x => `${nomeIng(x.ing)} ${x.g}g`);
        return (
          <div key={r.id} style={card}>
            <div onClick={() => setAperta(open ? null : r.id)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <div style={{ fontWeight: 800, color: C.scuro, flex: 1 }}>{r.titolo}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: r.scope === 'pubblica' ? C.verde : r.validata_at ? '#0891b2' : C.ambra }}>
                  {r.scope === 'pubblica' ? '🌍 pubblica' : r.validata_at ? '✅ validata' : '⏳ da validare'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.grigio, marginTop: 2 }}>
                {r.categoria} · {Math.round(r.kcal || 0)} kcal · P {Math.round(r.p || 0)} C {Math.round(r.c || 0)} G {Math.round(r.g || 0)}
                {r.prep ? ` · ⏱ ${r.prep}'` : ''} · 👍 {r.like_count} 👎 {r.dislike_count}
              </div>
              <div style={{ fontSize: 12, color: '#4A6152', marginTop: 2 }}>di {r.autore_nome || '?'} ({r.autore_email || '—'}){r.famiglia_nome ? ` · fam. ${r.famiglia_nome}` : ''} · {fmtData(r.updated_at)}{r.origine_id ? ' · 📋 copia' : ''}</div>
            </div>
            {open && (
              <div style={{ marginTop: 10, borderTop: `1px solid ${C.bordo}`, paddingTop: 10 }}>
                {r.descrizione && <div style={{ fontSize: 13, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{r.descrizione}</div>}
                <div style={{ fontSize: 12, color: '#4A6152', marginBottom: 10 }}>
                  <b>Ingredienti:</b> {ingList.length ? ingList.join(' · ') : '—'}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {!r.validata_at && <button disabled={!!busy} onClick={() => azione(r, 'valida')} style={btn('#0891b2')}>✅ Valida</button>}
                  {r.validata_at && r.scope !== 'pubblica' && <button disabled={!!busy} onClick={() => azione(r, 'annulla_validazione')} style={btn(C.chiaro, C.ambra)}>↩️ Annulla validazione</button>}
                  {r.scope !== 'pubblica' && <button disabled={!!busy} onClick={() => azione(r, 'pubblica')} style={btn(C.verde)}>🌍 Pubblica nel catalogo</button>}
                  {r.scope === 'pubblica' && <button disabled={!!busy} onClick={() => azione(r, 'ritira')} style={btn(C.chiaro, C.rosso)}>🔒 Ritira</button>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
