import React from 'react';
const { useState, useEffect, useCallback } = React;
import { adminStats, adminUtenti, adminRicette, adminRicettaAzione, adminFamiglie, adminFamigliaDettaglio, adminDettaglioProfilo, adminNutrizionisti, adminNutrizionistaStato, adminListaAttesa, adminListaAttesaStato } from '@/db/admin';
import { ING_MAP } from '@/core';
import { SchedaPersona, C, card, btn, fmtData, Pill } from '@/features/pro/SchedaPersona';

// ── 🛠️ Plancia admin ─────────────────────────────────────────────────
// Tutto è esplorabile: ogni numero della Panoramica porta alla lista
// corrispondente; ogni utente apre la sua scheda completa (anagrafica,
// target, misure con grafici, diario pasti, ricette, dati grezzi); ogni
// famiglia apre i membri e lo stato di piano e spesa; ogni nutrizionista
// si attiva/sospende da qui.

const nomeIng = (id) => ING_MAP?.[id]?.nome || id;

export function AdminPage() {
  const [tab, setTab] = useState('panoramica');
  const [stats, setStats] = useState(null);
  const [utenti, setUtenti] = useState(null);
  const [famiglie, setFamiglie] = useState(null);
  const [ricette, setRicette] = useState(null);
  const [nutr, setNutr] = useState(null);
  const [attesa, setAttesa] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [stack, setStack] = useState([]);     // navigazione a pila: [{tipo:'profilo'|'famiglia', id}]
  const [dett, setDett] = useState(null);
  const [filtroRicette, setFiltroRicette] = useState('da_validare');
  const [filtroUtenti, setFiltroUtenti] = useState('');

  const carica = useCallback(async () => {
    setErr('');
    try {
      const [s, u, f, r, n] = await Promise.all([adminStats(), adminUtenti(), adminFamiglie(), adminRicette(), adminNutrizionisti()]);
      setStats(s); setUtenti(u || []); setFamiglie(f || []); setRicette(r || []); setNutr(n || []);
      try { setAttesa(await adminListaAttesa()); } catch { setAttesa([]); }
    } catch (e) { setErr(e?.message || 'Errore di caricamento'); }
  }, []);
  useEffect(() => { carica(); }, [carica]);
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500); };

  const apri = async (tipo, id, push = true) => {
    setDett(null); setErr('');
    if (push) setStack(s => [...s, { tipo, id }]);
    try { setDett(tipo === 'profilo' ? await adminDettaglioProfilo(id) : await adminFamigliaDettaglio(id)); }
    catch (e) { setErr(e.message); }
  };
  const indietro = () => {
    const s = stack.slice(0, -1); setStack(s);
    if (s.length) apri(s[s.length - 1].tipo, s[s.length - 1].id, false); else setDett(null);
  };
  const vai = (t, filtro) => { setStack([]); setDett(null); setTab(t); if (t === 'ricette' && filtro) setFiltroRicette(filtro); if (t === 'utenti') setFiltroUtenti(filtro || ''); };

  const top = stack[stack.length - 1];
  const TABS = [['panoramica', '📊 Panoramica'], ['utenti', '👥 Utenti'], ['famiglie', '👨‍👩‍👧 Famiglie'], ['ricette', '📖 Ricette'], ['nutrizionisti', '🩺 Nutrizionisti'], ['attesa', '📬 Lista d’attesa']];

  return (
    <div style={{ padding: '12px 14px 60px', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.scuro }}>🛠️ Plancia admin</div>
          <div style={{ fontSize: 12, color: C.grigio }}>Tutto quello che succede su MenuDieta, esplorabile</div>
        </div>
        <button onClick={carica} style={{ ...btn(C.chiaro, C.verde), marginLeft: 'auto' }}>↻ Aggiorna</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {TABS.map(([k, l]) => {
          const badge = k === 'ricette' && stats?.ricette_da_validare ? stats.ricette_da_validare : k === 'nutrizionisti' && stats?.nutrizionisti_attesa ? stats.nutrizionisti_attesa : k === 'attesa' && attesa ? attesa.filter(a => a.stato === 'nuova').length : 0;
          return <button key={k} onClick={() => vai(k)} style={{ ...btn(tab === k ? C.verde : C.chiaro, tab === k ? '#fff' : C.verde), flex: '1 1 auto' }}>{l}{badge ? ` (${badge})` : ''}</button>;
        })}
      </div>

      {err && <div style={{ ...card, borderColor: C.rosso, color: C.rosso, fontSize: 13 }}>⛔ {err}<div style={{ color: C.grigio, marginTop: 4 }}>Se è la prima volta: vanno eseguiti <code>s12_plancia_admin.sql</code> e <code>s13_nutrizionisti.sql</code> nel SQL Editor.</div></div>}
      {msg && <div style={{ ...card, background: C.chiaro, color: C.verde, fontSize: 13, fontWeight: 700 }}>{msg}</div>}

      {top && (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <button onClick={indietro} style={btn(C.chiaro, C.verde)}>‹ Indietro</button>
            <div style={{ fontSize: 12, color: C.grigio }}>{stack.map((s, i) => <span key={i}>{i > 0 ? ' › ' : ''}{s.tipo === 'profilo' ? '👤 profilo' : '👨‍👩‍👧 famiglia'}</span>)}</div>
          </div>
          {!dett && <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>}
          {dett && top.tipo === 'profilo' && <SchedaPersona dettaglio={dett} onApriFamiglia={(id) => apri('famiglia', id)} onApriProfilo={(id) => apri('profilo', id)} />}
          {dett && top.tipo === 'famiglia' && <DettaglioFamiglia d={dett} onApriProfilo={(id) => apri('profilo', id)} />}
        </div>
      )}

      {!top && tab === 'panoramica' && <Panoramica stats={stats} vai={vai} attesaNuove={attesa ? attesa.filter(a => a.stato === 'nuova').length : 0} />}
      {!top && tab === 'utenti' && <Utenti utenti={utenti} filtro={filtroUtenti} setFiltro={setFiltroUtenti} onApri={(id) => apri('profilo', id)} onApriFamiglia={(id) => apri('famiglia', id)} />}
      {!top && tab === 'famiglie' && <Famiglie famiglie={famiglie} onApri={(id) => apri('famiglia', id)} />}
      {!top && tab === 'ricette' && <Ricette ricette={ricette} filtro={filtroRicette} setFiltro={setFiltroRicette} onReload={carica} flash={flash} setErr={setErr} onApriAutore={(uid) => { const u = (utenti || []).find(x => x.user_id === uid); if (u) apri('profilo', u.profilo_id); }} />}
      {!top && tab === 'nutrizionisti' && <Nutrizionisti lista={nutr} onReload={carica} flash={flash} setErr={setErr} />}
      {!top && tab === 'attesa' && <ListaAttesa lista={attesa} onReload={carica} flash={flash} setErr={setErr} />}
    </div>
  );
}

function Panoramica({ stats, vai, attesaNuove }) {
  if (!stats) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;
  const voci = [
    ['👤 Utenti registrati', stats.utenti, () => vai('utenti')],
    ['🧒 Profili gestiti (figli ecc.)', stats.profili_gestiti, () => vai('famiglie')],
    ['👨‍👩‍👧 Famiglie', stats.famiglie, () => vai('famiglie')],
    ['🔥 Famiglie attive (7 gg)', stats.famiglie_attive_7g, () => vai('famiglie')],
    ['📅 Famiglie attive (30 gg)', stats.famiglie_attive_30g, () => vai('famiglie')],
    ['🆕 Nuovi utenti (30 gg)', stats.nuovi_utenti_30g, () => vai('utenti', 'nuovi')],
    ['📖 Ricette create dagli utenti', stats.ricette_utente, () => vai('ricette', 'tutte')],
    ['⏳ Ricette da validare', stats.ricette_da_validare, () => vai('ricette', 'da_validare')],
    ['🌍 Ricette pubbliche', stats.ricette_pubbliche, () => vai('ricette', 'pubbliche')],
    ['📏 Misurazioni salvate', stats.misure_totali, () => vai('utenti')],
    ['🩺 Nutrizionisti', stats.nutrizionisti, () => vai('nutrizionisti')],
    ['⏳ Nutrizionisti da attivare', stats.nutrizionisti_attesa, () => vai('nutrizionisti')],
    ['🔗 Pazienti collegati', stats.pazienti_collegati, () => vai('nutrizionisti')],
    ['💬 Messaggi (7 gg)', stats.messaggi_7g, () => vai('nutrizionisti')],
    ['📬 Lista d’attesa (nuove)', attesaNuove, () => vai('attesa')],
  ];
  return (
    <>
      <div style={{ fontSize: 12, color: C.grigio, marginBottom: 8 }}>Tocca un numero per aprire la lista.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {voci.map(([l, v, go]) => (
          <div key={l} onClick={go} style={{ ...card, marginBottom: 0, cursor: 'pointer' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.scuro }}>{v ?? 0}</div>
            <div style={{ fontSize: 12, color: C.grigio }}>{l}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Utenti({ utenti, filtro, setFiltro, onApri, onApriFamiglia }) {
  const [q, setQ] = useState('');
  if (!utenti) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;
  const lista = utenti.filter(u => (!q || [u.email, u.nome, u.famiglia_nome].join(' ').toLowerCase().includes(q.toLowerCase()))
    && (filtro !== 'nuovi' || (Date.now() - new Date(u.iscritto_il)) < 30 * 864e5));
  return (
    <>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca per email, nome o famiglia…"
        style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${C.bordo}`, marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: C.grigio, marginBottom: 8 }}>
        {lista.length} utenti · ordinati per attività recente · tocca per aprire la scheda
        {filtro === 'nuovi' && <button onClick={() => setFiltro('')} style={btn(C.chiaro, C.verde)}>solo nuovi (30 gg) ✕</button>}
      </div>
      {lista.map(u => (
        <div key={u.profilo_id} onClick={() => onApri(u.profilo_id)} style={{ ...card, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
            <div style={{ fontWeight: 800, color: C.scuro }}>{u.sesso === 'F' ? '👩' : '👨'} {u.nome} {u.capo_famiglia ? <span title="Capo famiglia">👑</span> : null}</div>
            <div style={{ fontSize: 12, color: (Date.now() - new Date(u.ultima_attivita || 0)) < 7 * 864e5 ? C.verde : C.grigio, fontWeight: 700 }}>attivo: {fmtData(u.ultima_attivita)}</div>
          </div>
          <div style={{ fontSize: 12, color: C.grigio, marginTop: 2, wordBreak: 'break-all' }}>{u.email || '—'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, marginTop: 8, color: '#4A6152' }}>
            <span onClick={(e) => { if (u.famiglia_id) { e.stopPropagation(); onApriFamiglia(u.famiglia_id); } }} style={{ textDecoration: u.famiglia_id ? 'underline' : 'none' }}>👨‍👩‍👧 {u.famiglia_nome ? `${u.famiglia_nome} (${u.membri})` : 'nessuna famiglia'}</span>
            <span>📖 {u.n_ricette} ricette</span><span>📏 {u.n_misure} misure</span>
            <span>🆕 iscritto {fmtData(u.iscritto_il)}</span><span>🔐 login {fmtData(u.ultimo_login)}</span>
          </div>
        </div>
      ))}
    </>
  );
}

function Famiglie({ famiglie, onApri }) {
  if (!famiglie) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;
  return (
    <>
      <div style={{ fontSize: 12, color: C.grigio, marginBottom: 8 }}>{famiglie.length} famiglie · ordinate per attività recente · tocca per aprire</div>
      {famiglie.map(f => (
        <div key={f.id} onClick={() => onApri(f.id)} style={{ ...card, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
            <div style={{ fontWeight: 800, color: C.scuro }}>👨‍👩‍👧 {f.nome}</div>
            <div style={{ fontSize: 12, color: (Date.now() - new Date(f.ultima_attivita || 0)) < 7 * 864e5 ? C.verde : C.grigio, fontWeight: 700 }}>attiva: {fmtData(f.ultima_attivita)}</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, marginTop: 6, color: '#4A6152' }}>
            <span>👥 {f.membri} membri ({f.registrati} con account)</span><span>👑 {f.capo_email || '—'}</span>
            <span>📋 piano aggiornato {fmtData(f.piano_aggiornato)}</span><span>🛒 {f.spunte_spesa} spunte spesa</span>
            <span>🎟️ {f.invite_code}</span><span>🆕 creata {fmtData(f.created_at)}</span>
          </div>
        </div>
      ))}
    </>
  );
}

function DettaglioFamiglia({ d, onApriProfilo }) {
  const f = d.famiglia || {};
  return (
    <>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.scuro }}>👨‍👩‍👧 {f.nome}</div>
        <div style={{ fontSize: 12, color: C.grigio }}>codice invito {f.invite_code} · creata {fmtData(f.created_at)}</div>
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>Membri ({(d.membri || []).length}) <span style={{ fontSize: 12, color: C.grigio, fontWeight: 600 }}>· tocca per aprire la scheda</span></div>
        {(d.membri || []).map(m => (
          <div key={m.id} onClick={() => onApriProfilo(m.id)} style={{ padding: '8px 0', borderBottom: `1px solid ${C.bordo}`, cursor: 'pointer', fontSize: 13 }}>
            <b>{m.sesso === 'F' ? '👩' : '👨'} {m.nome}</b> {m.user_id ? <Pill>account</Pill> : <Pill color={C.ambra} bg='#FDF0D5'>gestito</Pill>}
            <span style={{ color: '#4A6152' }}>{m.peso ? ` ${m.peso} kg` : ''}{m.altezza ? ` · ${m.altezza} cm` : ''} · {m.obiettivo} · {m.n_misure} misure</span>
          </div>
        ))}
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>Stato dei dati condivisi</div>
        {Object.entries(d.dati || {}).map(([k, v]) => <div key={k} style={{ fontSize: 13, padding: '2px 0' }}><b>{k}</b> <span style={{ color: C.grigio }}>· aggiornato {fmtData(v.updated_at)} · {Math.round((v.dimensione || 0) / 1024)} KB</span></div>)}
        {Object.keys(d.dati || {}).length === 0 && <div style={{ color: C.grigio, fontSize: 13 }}>Nessun dato condiviso (piano non ancora generato sul cloud).</div>}
        {d.spesa && <div style={{ fontSize: 13, marginTop: 6 }}>🛒 Spesa: {d.spesa.settimane} settimane, {d.spesa.spuntati} articoli spuntati, ultima spunta {fmtData(d.spesa.ultima)}</div>}
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, color: C.scuro, marginBottom: 6 }}>📖 Ricette di famiglia ({(d.ricette || []).length})</div>
        {(d.ricette || []).map(r => <div key={r.id} style={{ fontSize: 13, padding: '2px 0' }}>{r.titolo} <span style={{ color: C.grigio }}>· {r.categoria} · {r.scope} · {fmtData(r.created_at)}</span></div>)}
      </div>
    </>
  );
}

function Ricette({ ricette, filtro, setFiltro, onReload, flash, setErr, onApriAutore }) {
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
                <span style={{ fontSize: 11, fontWeight: 700, color: r.scope === 'pubblica' ? C.verde : r.validata_at ? C.blu : C.ambra }}>
                  {r.scope === 'pubblica' ? '🌍 pubblica' : r.validata_at ? '✅ validata' : '⏳ da validare'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.grigio, marginTop: 2 }}>
                {r.categoria} · {Math.round(r.kcal || 0)} kcal · P {Math.round(r.p || 0)} C {Math.round(r.c || 0)} G {Math.round(r.g || 0)}{r.prep ? ` · ⏱ ${r.prep}'` : ''} · 👍 {r.like_count} 👎 {r.dislike_count}
              </div>
              <div style={{ fontSize: 12, color: '#4A6152', marginTop: 2 }}>di <span onClick={(e) => { e.stopPropagation(); onApriAutore(r.autore_id); }} style={{ textDecoration: 'underline', cursor: 'pointer' }}>{r.autore_nome || '?'}</span> ({r.autore_email || '—'}){r.famiglia_nome ? ` · fam. ${r.famiglia_nome}` : ''} · {fmtData(r.updated_at)}{r.origine_id ? ' · 📋 copia' : ''}</div>
            </div>
            {open && (
              <div style={{ marginTop: 10, borderTop: `1px solid ${C.bordo}`, paddingTop: 10 }}>
                {r.descrizione && <div style={{ fontSize: 13, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{r.descrizione}</div>}
                <div style={{ fontSize: 12, color: '#4A6152', marginBottom: 10 }}><b>Ingredienti:</b> {ingList.length ? ingList.join(' · ') : '—'}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {!r.validata_at && <button disabled={!!busy} onClick={() => azione(r, 'valida')} style={btn(C.blu)}>✅ Valida</button>}
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

function Nutrizionisti({ lista, onReload, flash, setErr }) {
  const [busy, setBusy] = useState(null);
  if (!lista) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;
  const cambia = async (n, stato) => {
    setBusy(n.user_id); setErr('');
    try { await adminNutrizionistaStato(n.user_id, stato); flash(stato === 'attivo' ? `✅ ${n.nome} attivato: può collegare pazienti` : `⏸️ ${n.nome}: ${stato}`); await onReload(); }
    catch (e) { setErr(e.message); }
    setBusy(null);
  };
  return (
    <>
      <div style={{ fontSize: 12, color: C.grigio, marginBottom: 8 }}>{lista.length} professionisti registrati. L’attivazione abilita il codice paziente (qui si gestirà anche il pagamento).</div>
      {lista.length === 0 && <div style={{ ...card, fontSize: 13, color: C.grigio }}>Nessun nutrizionista registrato. Si registrano dall’app: login Google → "Sei un nutrizionista?".</div>}
      {lista.map(n => (
        <div key={n.user_id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 800, color: C.scuro }}>🩺 {n.nome} {n.studio ? <span style={{ color: C.grigio, fontWeight: 600 }}>· {n.studio}</span> : null}</div>
            <Pill color={n.stato === 'attivo' ? '#fff' : n.stato === 'attesa' ? C.ambra : C.rosso} bg={n.stato === 'attivo' ? C.verde : n.stato === 'attesa' ? '#FDF0D5' : '#FEE2E2'}>{n.stato}</Pill>
          </div>
          <div style={{ fontSize: 12, color: C.grigio, wordBreak: 'break-all' }}>{n.email} {n.citta ? `· ${n.citta}` : ''} · codice <b style={{ fontFamily: 'ui-monospace, monospace' }}>{n.codice}</b></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, marginTop: 6, color: '#4A6152' }}>
            <span>🔗 {n.n_pazienti} pazienti</span><span>💬 {n.n_messaggi} messaggi</span><span>🆕 registrato {fmtData(n.created_at)}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {n.stato !== 'attivo' && <button disabled={busy === n.user_id} onClick={() => cambia(n, 'attivo')} style={btn(C.verde)}>✅ Attiva</button>}
            {n.stato === 'attivo' && <button disabled={busy === n.user_id} onClick={() => cambia(n, 'sospeso')} style={btn(C.chiaro, C.rosso)}>⏸️ Sospendi</button>}
          </div>
        </div>
      ))}
    </>
  );
}

function ListaAttesa({ lista, onReload, flash, setErr }) {
  const [filtro, setFiltro] = useState('nuova');
  const [busy, setBusy] = useState(null);
  if (!lista) return <div style={{ color: C.grigio, fontSize: 13 }}>Carico…</div>;
  const L = lista.filter(a => filtro === 'tutte' || a.stato === filtro);
  const cambia = async (a, stato) => {
    setBusy(a.id); setErr('');
    try { await adminListaAttesaStato(a.id, stato); flash(`${a.nome}: ${stato}`); await onReload(); } catch (e) { setErr(e.message); }
    setBusy(null);
  };
  const colore = { nuova: [C.ambra, '#FDF0D5'], contattata: [C.blu, '#E0F2FE'], attivata: ['#fff', C.verde], scartata: [C.grigio, '#F1F5F1'] };
  const csv = () => {
    const righe = [['data', 'tipo', 'nome', 'email', 'citta', 'note', 'stato'], ...lista.map(a => [a.created_at, a.tipo, a.nome, a.email, a.citta || '', (a.note || '').replace(/\n/g, ' '), a.stato])];
    const blob = new Blob([righe.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\n')], { type: 'text/csv' });
    const u = URL.createObjectURL(blob); const el = document.createElement('a'); el.href = u; el.download = 'lista-attesa-menudieta.csv'; el.click(); URL.revokeObjectURL(u);
  };
  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['nuova', '🆕 Nuove'], ['contattata', '📞 Contattate'], ['attivata', '✅ Attivate'], ['scartata', 'Scartate'], ['tutte', 'Tutte']].map(([k, l]) => (
          <button key={k} onClick={() => setFiltro(k)} style={btn(filtro === k ? C.scuro : C.chiaro, filtro === k ? '#fff' : C.verde)}>{l}</button>
        ))}
        <button onClick={csv} style={{ ...btn(C.chiaro, C.verde), marginLeft: 'auto' }}>⬇️ CSV</button>
      </div>
      <div style={{ fontSize: 12, color: C.grigio, marginBottom: 8 }}>{L.length} richieste · dal modulo "Sei un nutrizionista?" del sito. Se è vuoto e dà errore: eseguire <code>s14_lista_attesa.sql</code>.</div>
      {L.length === 0 && <div style={{ ...card, fontSize: 13, color: C.grigio }}>Nessuna richiesta in questa sezione.</div>}
      {L.map(a => (
        <div key={a.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 800, color: C.scuro }}>{a.tipo === 'nutrizionista' ? '🩺' : '👨‍👩‍👧'} {a.nome} <span style={{ color: C.grigio, fontWeight: 600 }}>· {a.citta || '—'}</span></div>
            <Pill color={colore[a.stato][0]} bg={colore[a.stato][1]}>{a.stato}</Pill>
          </div>
          <div style={{ fontSize: 12, color: C.grigio, wordBreak: 'break-all' }}><a href={`mailto:${a.email}`} style={{ color: C.verde }}>{a.email}</a> · {fmtData(a.created_at)}{a.origine ? ` · da ${a.origine}` : ''}</div>
          {a.note && <div style={{ fontSize: 13, color: '#4A6152', marginTop: 6, whiteSpace: 'pre-wrap' }}>{a.note}</div>}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {a.stato !== 'contattata' && <button disabled={busy === a.id} onClick={() => cambia(a, 'contattata')} style={btn(C.blu)}>📞 Contattata</button>}
            {a.stato !== 'attivata' && <button disabled={busy === a.id} onClick={() => cambia(a, 'attivata')} style={btn(C.verde)}>✅ Attivata</button>}
            {a.stato !== 'scartata' && <button disabled={busy === a.id} onClick={() => cambia(a, 'scartata')} style={btn(C.chiaro, C.grigio)}>Scarta</button>}
          </div>
        </div>
      ))}
    </>
  );
}
