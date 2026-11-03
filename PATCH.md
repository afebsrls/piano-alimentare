# PATCH.md — Changelog cumulativo

## v16 — 03/11/2026 · Nutrizionisti (Fitsy Pro), plancia esplorabile, sito GDPR + mockup
- **🩺 Fitsy Pro** (`supabase/s13_nutrizionisti.sql`, `src/db/nutrizionista.js`, `src/features/pro/`): il professionista si registra dall'onboarding ("Sei un nutrizionista?"), riceve un codice NUT-XXXXXX, l'admin lo attiva dalla plancia. Il paziente inserisce il codice in Account → Il mio nutrizionista (consenso, revocabile). Il nutrizionista ha una shell dedicata: lista pazienti (non letti, ultimo peso, attività), scheda completa (anagrafica, target, grafici di tutte le misure, diario pasti, ricette, dati grezzi), **target imposto** (kcal + macro + nota) che il motore usa al posto del calcolo (`targetNutrizionista` in `calcTargetAdattivo`), **messaggistica** realtime (tabella `messaggi`, RLS a due parti).
- **Plancia admin esplorabile**: ogni numero della panoramica apre la lista; utenti → scheda completa (stessa `SchedaPersona`); famiglie → membri, stato piano/spesa, ricette; ricette → autore cliccabile; nuovo tab Nutrizionisti con attiva/sospendi. Navigazione a pila con Indietro.
- **Sito**: privacy policy e cookie policy dedicate (`/privacy/`, `/cookie/`), avviso informativo (nessun cookie: non serve consenso, solo flag tecnico `fitsy-cn`), mockup SVG delle schermate (Oggi, Piano, Spesa, Misure, Area nutrizionista) in home e nella pagina nutrizionisti aggiornata con il flusso reale.
- **GDPR app**: informativa versione 2026-11-03 (nuova sezione "Nutrizionista collegato") → gli utenti rinnovano il consenso alla prossima apertura; registro dei trattamenti aggiornato.
- Test 5 (montaggio scheda/pro/admin + precedenza del target imposto).

## v15 — 03/11/2026 · Admin solo admin + sito pubblico www.fitsy.it
- **Admin solo admin**: dopo il login un account admin vede una shell dedicata (plancia + Esci), niente scheda, onboarding o piano. Verifica via `is_admin()` ascoltando direttamente l'auth. Tolto "copia nelle mie" dalla plancia (l'admin non ha ricette).
- **Sito pubblico** (`site/`): generatore statico da registro parole chiave (`keywords.mjs`) → 11 pagine: home, menu settimanale famiglia, lista spesa automatica, 3 calcolatori (fabbisogno LARN, peso forma/Grant, acqua), per nutrizionisti, 3 guide. Schema.org (SoftwareApplication, WebApplication, FAQPage, Article), sitemap, robots, canonical, OG. Test 4 verifica build e calcolatori. Metodo in `docs/seo-metodo.md`.
- Deploy: secondo job FTP nella root di Aruba (non tocca `/app/`).

## v14 — 03/11/2026 · Plancia admin + ricette pubbliche
- **🛠️ Plancia admin** (`src/features/admin/AdminPage.jsx`, `src/db/admin.js`, `supabase/s12_plancia_admin.sql`): voce di menu visibile solo agli admin (tabella `admin_users`, verifica server-side `is_admin()`). Tre sezioni: Panoramica (utenti, famiglie attive 7/30 gg, ricette da validare…), Utenti (email, famiglia, ultima attività, login, ricette, misure, ricerca) e Ricette (vedi ingredienti, 📋 copia nelle proprie come privata/esclusa, ✅ valida, 🌍 pubblica, 🔒 ritira).
- **Nessuna RLS allargata**: tutto passa da funzioni `security definer` (`admin_stats`, `admin_utenti`, `admin_ricette`, `admin_ricetta_azione`, `admin_copia_ricetta`).
- **🌍 Dalla community** nella tab Catalogo: le ricette con `scope='pubblica'` arrivano da `catalogo_pubblico()` (funzione a parte), quindi NON entrano nel pool del generatore delle altre famiglie: si possono solo esplorare e duplicare. I piani esistenti restano stabili.
- Colonne nuove su `ricette_utente`: `validata_at`, `validata_da`, `pubblicata_at`, `origine_id`; `scope` ammette anche `pubblica`.

## v13 — 03/11/2026 · Trasloco su www.fitsy.it
- **Deploy su Aruba** (`.github/workflows/deploy-aruba.yml` + `deploy/htaccess-app`): a ogni push su main l'app va in `www.fitsy.it/app/` via FTP; GitHub Pages resta attivo in parallelo per gli utenti non ancora migrati.
- **🚚 Trasloco utenti** (`src/features/trasloco/Trasloco.jsx`): su github.io compare un banner "Fitsy si è trasferita"; il bottone impacchetta tutto il localStorage (dati, impostazioni, sessione di login) nell'hash dell'URL e apre il nuovo sito, che lo importa prima di avviare l'app e ricarica. L'hash non raggiunge mai il server; i dati sul vecchio sito restano come backup. Test 2l (andata/ritorno con accenti, emoji, 300 giorni di piano).
- Supabase: Site URL e Redirect URL aggiornati a `https://www.fitsy.it/app/**` (github.io resta in lista fino a fine migrazione).

## v12 — 13/07/2026 · Fix Costituzione (virgola) + resilienza Strumenti
- **Fix bug UI Costituzione**: gli input di Costituzione e Fabbisogno convertivano con l'unario `+`, che su decimali con la virgola italiana ("19,7") dà NaN → il risultato non appariva mai. Ora parsing tollerante (`num()`) come gli altri tool.
- **ToolBoundary**: ogni sezione del flusso Strumenti ha il suo error boundary — un tool rotto degrada in una card d'errore locale col messaggio, senza abbattere la pagina.
- **Test 2k**: interazione reale sul tool Costituzione con i valori esatti del bug report (185 / 19,7).
- Include la v11 (piano stabile weighted-rendezvous): ⚠️ al primo avvio post-deploy rimescolamento UNA-TANTUM dei piani correnti; regione protetta e spunte spesa sopravvivono (fix v10).

## v11 — 12/07/2026 · Piano stabile (weighted rendezvous)
- **Selezione ricette riscritta**: da rng-su-indice a weighted rendezvous (HRW) — chiave deterministica hash(seed|slot|ricettaId) pesata u^(1/w). Garanzie: rimuovere una ricetta mai scelta non cambia nulla; aggiungerne una tocca solo gli slot della sua categoria dove vince (misurato: 2 slot su 35). I pesi stagionali/proteici/3× utente sono preservati come pesi HRW.
- Test 2j con le garanzie matematiche (determinismo, rimozione-zero-impatto, categorie indipendenti, vincolo spuntini).
- ⚠️ Al primo deploy: rimescolamento UNA-TANTUM dei piani correnti (l'algoritmo cambia). La regione protetta (giorni passati + consumati) e le spunte spesa sopravvivono grazie ai fix v10.

## v10 — 12/07/2026 · Fix da field test (stabilità piano/spesa)
- **Spunte spesa preservate alla rigenerazione**: carry-over locale + `migraSpesaSeed` sul cloud (prima ~30 articoli andavano rispuntati a mano dopo ogni regen).
- **Regen preserva anche gli swap personali** della regione protetta (giorni passati della settimana corrente + pasti di oggi consumati) su tutti i layer, non solo la vista condivisa.
- **Swap scrive nel layer della persona selezionata nel Piano** (prima sempre in `myPersonaId`, con rischio di applicare il proprio swap guardando il piano di un altro membro).
- **Log boot corretto**: `overrides` ora conta gli override reali (`contaOverrides`), non le 3 chiavi del container v2.
- ⚠️ Noto, non fixato (decisione architetturale aperta): l'ampliamento del DB ricette rimescola i piani esistenti a parità di seed (la selezione dipende dalla dimensione del pool).

## v9 — 11/07/2026 · Chiusura backlog
- **Override per-membro (fix isolamento)**: gli swap non sporcano più i piani degli altri membri. Container v2 `{condivisi, perPersona}` retrocompatibile col formato flat legacy; scrittura nel layer del membro (`myPersonaId`); Oggi/Piano per persona selezionata; spesa riscritta per-persona (`buildShoppingPerPersona`: ogni membro contribuisce col SUO piatto e col suo slot). Test 2i dedicato.
- **+30 ricette dietetiche** (196 totali) e **+10 ingredienti** (skyr, kefir, tempeh, chia, gallette, yogurt di soia, farina di ceci, cime di rapa, marmellata, orecchiette). Macro calcolate dai nutrienti; porzioni derivate dai nomi ingrediente → allineamento garantito.
- **Costituzione nel piano**: campo Polso nelle misure; `indiceGrant` spostata nel core; `calcPesoObiettivo` corregge il ramo Hamwi (±7,5%) e riporta la costituzione anche nel ramo LBM (senza correggerlo: misura la composizione reale).
- **Tool 💧 Fabbisogno idrico** (7° strumento nel flusso).
- **docs/sql/audit_rls.sql**: audit helper functions + policy + copertura `pesi_pezzo`, con hardening commentati. Da eseguire nel SQL Editor.
- **docs/gdpr/**: registro dei trattamenti (art. 30) e procedura data breach (artt. 33–34) — Fase 4.

## v8 — 11/07/2026 · Strumenti a flusso verticale
Tutti i tool aperti in un flusso scroll-down, chip-nav sticky con sezione attiva, bande d'accento per tool.

## v7 — 11/07/2026 · Tools completi + peso/pezzo nel form
Fabbisogno energetico (ospite, LARN/Mifflin spiegati), Costituzione (Grant), Analizzatore ricetta (con 🧪 salva come ingrediente). Campo peso/pezzo facoltativo nel form ingrediente custom con rimando alla taratura.

## v6 — 11/07/2026 · Calibri e tarature
`pesoPezzoRange` su 11 alimenti; `pesoPezzoInfo` (taratura famiglia > mediana DB > mediana range, flag `incerto`); niente decimali fasulli (range onesti); wizard taratura gamificato 🎯 con sync famiglia (`famiglia_dati:pesi_pezzo`); hub ripulito + Stagionalità.

## v5 — 11/07/2026 · Hub Strumenti
Pagina 🧰 con Equivalenze cibi e Misure casalinghe funzionanti.

## v4 — 11/07/2026 · Ricetta → ingrediente
`nutriPer100DaQuantita` nel core; bottone 🧪 sulle card ricetta (famiglia e catalogo); `AddIngredientModal` esportato con prefill; conteggio catalogo dinamico. Test 2h.

## v3 — 11/07/2026 · Allineamento ricette ↔ ingredienti
3 nuovi ingredienti (piadina/wrap, hummus, teriyaki); 13 ricette corrette con macro ricalcolate; campo `preparazione` per 9 ricette (porzioni solo-quantità); test 2g permanente (ID, porzioni, semantica).

## v2 — 10/07/2026 · Schede pasto + modifica ingredienti
Card pasto ridisegnate (nome a riga piena, barra ripartizione P/C/G, action bar etichettata); modifica ingredienti custom (modale add/edit, bottone ✏️).
