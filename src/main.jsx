// Font self-hosted (GDPR): sostituiscono il CDN Google Fonts
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './db/storage.js';   // imposta window.storage PRIMA dell'app
import './index.css';
import { App } from '@/App';
import { IntroSplash } from '@/features/intro/IntroSplash';
import { importaTrasloco, isVecchioSito, BannerTrasloco } from '@/features/trasloco/Trasloco';
import { registraArrivo } from '@/db/arrivi';

// 🚚 Trasloco: se arrivo da github.io con i dati nell'URL, li importo e
// ricarico PRIMA di avviare l'app (così parte già con tutto).
const traslocoInCorso = importaTrasloco();

// 🔗 Arrivo dal sito (?da=<pagina>): conteggio anonimo per sapere quali pagine
// portano persone nell'app. Il parametro viene tolto subito dall'URL.
if (!traslocoInCorso) registraArrivo();

// 🩺 Link di invito del nutrizionista (?nut=NUT-XXXXXX): il codice viene
// memorizzato e proposto in Account → Il mio nutrizionista dopo il login.
try {
  const nut = new URLSearchParams(window.location.search).get('nut');
  if (nut && /^NUT-[A-Z0-9]{4,8}$/i.test(nut)) {
    localStorage.setItem('pa__nut-pending', nut.toUpperCase());
    window.history.replaceState(null, '', window.location.pathname);
  }
} catch {}

// Splash introduttivo all'apertura. Per mostrarlo SOLO la primissima volta,
// sostituisci useState(true) con:
//   useState(() => { const v = !localStorage.getItem('fitsy-intro-done'); if (v) localStorage.setItem('fitsy-intro-done','1'); return v; })
function Root() {
  const [intro, setIntro] = React.useState(true);
  return (
    <>
      <App />
      {intro && <IntroSplash onDone={() => setIntro(false)} />}
      {isVecchioSito() && <BannerTrasloco />}
    </>
  );
}

if (!traslocoInCorso) createRoot(document.getElementById('root')).render(<Root />);

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // ── Produzione: registra il service worker (offline) ──
    // Aggiornamento MANUALE: il SW nuovo resta in attesa e l'app mostra un
    // avviso "Nuova versione". Il reload avviene SOLO quando l'utente accetta.
    // Questo elimina i riavvii spontanei della PWA (riapertura, sfratto dalla
    // RAM, controlli di update di Chrome non causano più reload).
    let refreshing = false;
    // C'era già un SW a controllare la pagina all'avvio? Se no, siamo alla
    // primissima installazione: la presa di controllo NON deve ricaricare.
    const avevaController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing || !avevaController) return;
      refreshing = true;
      window.location.reload();
    });

    const proponiAggiornamento = (worker) => {
      if (!worker) return;
      window.__pfWaitingWorker = worker;
      window.dispatchEvent(new window.CustomEvent('pf-sw-update'));
    };

    window.addEventListener('load', async () => {
      const reg = await navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch(e => { console.log('SW:', e); return null; });
      if (!reg) return;

      // Un aggiornamento è già pronto e in attesa al caricamento
      if (reg.waiting && navigator.serviceWorker.controller) proponiAggiornamento(reg.waiting);

      // Un aggiornamento arriva mentre l'app è aperta
      reg.addEventListener('updatefound', () => {
        const nuovo = reg.installing;
        if (!nuovo) return;
        nuovo.addEventListener('statechange', () => {
          // "installed" + controller esistente = è un AGGIORNAMENTO (non la
          // prima installazione) → proponi all'utente.
          if (nuovo.state === 'installed' && navigator.serviceWorker.controller) {
            proponiAggiornamento(nuovo);
          }
        });
      });

      // Controllo proattivo: quando l'app torna in primo piano (o riprende il
      // focus) chiede al browser di verificare se sul server c'è una nuova
      // versione. Così il banner "Nuova versione" appare senza dover chiudere
      // e riaprire l'app. reg.update() è un no-op se non c'è nulla di nuovo.
      const checkAggiornamenti = () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => {});
        }
      };
      document.addEventListener('visibilitychange', checkAggiornamenti);
      window.addEventListener('focus', checkAggiornamenti);
    });
  } else {
    // ── Sviluppo: rimuovi SW e cache vecchie (altrimenti rompono l'HMR) ──
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
    if (window.caches) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
  }
}
