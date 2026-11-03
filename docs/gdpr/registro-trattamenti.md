# Registro delle attività di trattamento — MenuDieta
*Art. 30 GDPR · Titolare: AF&B S.r.l.s., Via Mario Ugo Guattari 48, 00173 Roma (RM), P.IVA 13698751008, REA RM-1466364 · info@menudieta.it · Ultimo aggiornamento: 11/07/2026*

## 1. Trattamento: gestione account e famiglia
- **Finalità**: autenticazione, associazione dei membri a una famiglia, sincronizzazione multi-dispositivo
- **Base giuridica**: esecuzione del contratto (art. 6.1.b)
- **Interessati**: utenti registrati e loro familiari (inclusi minori, inseriti dai genitori)
- **Dati**: email, identificativi account, codice famiglia, nome/colore profilo
- **Destinatari**: Supabase Inc. (responsabile ex art. 28, hosting Francoforte — DPA Supabase)
- **Trasferimenti extra-UE**: nessuno (region eu-central-1)
- **Conservazione**: fino a cancellazione account (`delete_account()` con cascata completa)
- **Misure**: RLS per-famiglia con WITH CHECK, TLS, accesso per-identità in sola lettura sui profili altrui

## 2. Trattamento: pianificazione alimentare e preferenze
- **Finalità**: generazione piano pasti, lista spesa, preferenze e esclusioni alimentari
- **Base giuridica**: esecuzione del contratto (art. 6.1.b)
- **Dati**: profilo fisico (sesso, età, peso, altezza, attività, obiettivo), piani, swap, gusti, tarature peso-pezzo (chiave `pesi_pezzo`)
- **Conservazione/misure**: come punto 1; swap memorizzati per-membro (v 07/2026)

## 3. Trattamento: dati relativi alla salute (art. 9)
- **Finalità**: calcolo fabbisogno, peso forma, tracciamento misure corporee (peso, circonferenze incluso polso, % grasso stimata)
- **Base giuridica**: consenso esplicito (art. 9.2.a) — raccolto via ConsensoGate, versionato in `profilo_dati`, revocabile da Opzioni
- **Interessati**: anche minori — consenso prestato dal titolare della responsabilità genitoriale
- **Conservazione**: fino a cancellazione o revoca del consenso (revoca → blocco funzioni salute)
- **Misure**: come punto 1; nessun dato salute condiviso con terze parti; font self-hosted (nessuna chiamata a Google Fonts)

## 4. Trattamento: log tecnici di sincronizzazione
- **Finalità**: diagnostica sync (SyncLog locale al dispositivo)
- **Base giuridica**: legittimo interesse (art. 6.1.f) — dati tecnici minimi, locali
- **Conservazione**: rotazione locale, mai inviati a server di terzi

## Sub-responsabili
| Fornitore | Ruolo | Sede dati | Garanzia |
|---|---|---|---|
| Supabase Inc. | DB, Auth, Realtime | Francoforte (AWS eu-central-1) | DPA + SCC |
| GitHub Pages | hosting statico frontend | CDN globale (nessun dato personale servito) | — |

*Nessuna profilazione, nessuna decisione automatizzata con effetti giuridici, nessuna cessione a terzi.*


## Aggiunta 2026-11-03 — Nutrizionista collegato
- **Trattamento**: condivisione dei dati del paziente (profilo, misure, diario pasti, ricette, messaggi) con il nutrizionista scelto dall'interessato tramite codice.
- **Base giuridica**: consenso (collegamento volontario, revocabile con lo scollegamento).
- **Ruoli**: il nutrizionista è titolare autonomo per la propria attività professionale; MenuDieta fornisce la piattaforma (responsabile per conto del nutrizionista per i soli dati condivisi).
- **Tabelle**: `nutrizionisti`, `nutrizionista_pazienti`, `messaggi`, colonna `profili.target_nutrizionista`. Accesso via RLS e funzioni `security definer` (S13).
- **Conservazione**: fino allo scollegamento (link e target rimossi); i messaggi restano alle parti; cancellazione account → cascata.
