import React, { useState } from 'react';

// ── 🚚 Trasloco: da tarzanhello.github.io a www.fitsy.it ────────
// Il browser tiene i dati locali (localStorage) separati per indirizzo:
// chi apre il nuovo sito partirebbe da zero. Questo modulo:
//  1. sul VECCHIO sito mostra un banner "Fitsy si è trasferita" con un
//     bottone che impacchetta tutto il localStorage (dati, impostazioni e
//     sessione di login) e apre il nuovo sito passandoglielo nell'hash
//     dell'URL (#trasloco=…). L'hash non viene mai inviato al server.
//  2. sul NUOVO sito, prima che l'app parta, legge l'hash, scrive i dati
//     in localStorage, pulisce l'URL e ricarica. Vedi importaTrasloco().
// I dati sul vecchio sito NON vengono cancellati: restano come backup.

export const NUOVO_SITO = 'https://www.fitsy.it/app/';
const VECCHI_HOST = ['tarzanhello.github.io', 'afebsrls.github.io'];
const KEY_FATTO = 'pa__trasloco-fatto';

export const isVecchioSito = () =>
  typeof window !== 'undefined' && VECCHI_HOST.includes(window.location.hostname);

// ── codifica base64url sicura per UTF-8 ──
const toB64 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64 = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export function raccogliDatiLocali() {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k !== KEY_FATTO) out[k] = localStorage.getItem(k);
  }
  return out;
}

// Chiamata PRIMA del render dell'app sul nuovo sito. Ritorna true se ha
// importato qualcosa (e sta ricaricando la pagina).
export function importaTrasloco() {
  try {
    const m = /[#&]trasloco=([^&]+)/.exec(window.location.hash || '');
    if (!m) return false;
    const dati = JSON.parse(fromB64(m[1]));
    if (!dati || typeof dati !== 'object') return false;
    let n = 0;
    for (const [k, v] of Object.entries(dati)) {
      if (typeof v !== 'string') continue;
      localStorage.setItem(k, v);
      n++;
    }
    localStorage.setItem('pa__trasloco-ricevuto', JSON.stringify({ quando: new Date().toISOString(), chiavi: n }));
    // Toglie i dati dall'URL (cronologia compresa) e riparte pulito
    window.history.replaceState(null, '', window.location.pathname);
    window.location.reload();
    return true;
  } catch (e) {
    console.warn('[trasloco] import fallito:', e?.message);
    return false;
  }
}

const S = {
  wrap: { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999, padding: '14px 16px calc(14px + env(safe-area-inset-bottom, 0px))',
    background: '#15251C', color: '#ECF1E2', boxShadow: '0 -6px 24px rgba(0,0,0,.25)', fontFamily: 'inherit' },
  inner: { maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 },
  title: { fontWeight: 800, fontSize: 16, margin: 0 },
  text: { fontSize: 13, margin: 0, opacity: .9, lineHeight: 1.4 },
  btn: { padding: '12px 16px', borderRadius: 12, border: 'none', background: '#C7F23E', color: '#15251C', fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  link: { color: '#C7F23E', fontWeight: 700 },
};

export function BannerTrasloco() {
  const [fatto, setFatto] = useState(() => { try { return localStorage.getItem(KEY_FATTO) === '1'; } catch { return false; } });
  const [err, setErr] = useState('');

  const vai = () => {
    try {
      const dati = raccogliDatiLocali();
      const url = NUOVO_SITO + '#trasloco=' + toB64(JSON.stringify(dati));
      localStorage.setItem(KEY_FATTO, '1');
      setFatto(true);
      window.location.href = url;
    } catch (e) {
      setErr('Non sono riuscito a preparare i dati: ' + (e?.message || 'errore'));
    }
  };

  return (
    <div style={S.wrap} role="dialog" aria-label="Fitsy si è trasferita">
      <div style={S.inner}>
        <p style={S.title}>🚚 Fitsy si è trasferita su www.fitsy.it</p>
        {fatto ? (
          <p style={S.text}>
            I tuoi dati sono già stati portati sul nuovo sito. Da ora usa{' '}
            <a href={NUOVO_SITO} style={S.link}>www.fitsy.it/app</a> e, se l’hai installata, reinstalla l’app da lì.
            Questa vecchia versione non riceverà più aggiornamenti.
          </p>
        ) : (
          <p style={S.text}>
            Premi il bottone: porto con te piani, misure, spesa e accesso. Qui non viene cancellato nulla.
          </p>
        )}
        {err && <p style={{ ...S.text, color: '#FFB4A2' }}>{err}</p>}
        <button style={S.btn} onClick={vai}>
          {fatto ? 'Vai al nuovo sito →' : 'Porta i miei dati su fitsy.it →'}
        </button>
      </div>
    </div>
  );
}
