# MenuDieta — strategia di crescita (bozza del 3/11/2026)

Tre parti: (1) come funziona e come deve evolvere il profilo nutrizionista, (2) quali pagine creare per portare traffico, (3) come fare volumi senza pubblicità. Ogni voce ha una stima di sforzo: **S** = poche ore, **M** = 1–2 giorni, **L** = una settimana.

---

## 1. Il profilo nutrizionista e l'accoppiamento con i pazienti

### Com'è oggi (v16)
- Il nutrizionista accede con Google → "Sei un nutrizionista?" → riceve un codice `NUT-XXXXXX`, stato *attesa*.
- L'admin lo attiva dalla plancia (è il punto in cui si aggancerà il pagamento).
- Il paziente inserisce il codice in Account → Il mio nutrizionista, oppure apre il **link di invito** `menudieta.it/app/?nut=NUT-XXXXXX` (nuovo: il codice è già compilato, basta confermare).
- Il nutrizionista vede scheda, misure con grafici, diario pasti, ricette; imposta il **target** (kcal + macro + nota) che il motore usa al posto del calcolo; **messaggi** in tempo reale.
- Il paziente può scollegarsi in un tocco; il target torna automatico.

### Perché il modello "codice" è quello giusto
Il consenso GDPR è esplicito e revocabile; nessuna email del paziente passa per il nutrizionista prima che il paziente decida; funziona anche se il paziente ha già l'app. L'alternativa (il nutrizionista crea l'account del paziente) sarebbe comoda ma crea un problema di titolarità dei dati e di password da gestire: da evitare.

### Cosa manca per venderlo (in ordine di priorità)
1. **Onboarding dal sito, non solo dall'app** (S). Oggi la pagina /per-nutrizionisti/ manda all'app. Serve un bottone che apra l'app già in modalità "registrazione professionista" (`/app/?pro=1`) e una mail automatica all'admin quando si registra qualcuno (trigger Supabase → funzione edge o semplicemente un controllo giornaliero della plancia).
2. **Piano del nutrizionista oltre al target** (M). Oggi imposta kcal e macro. Il passo successivo che i professionisti chiedono: *escludere* alimenti (allergie, patologie) e *fissare* alcuni pasti (es. colazione sempre uguale). Entrambe le cose esistono già lato famiglia (ingredienti esclusi, override pasto): vanno esposte al nutrizionista con scrittura via RPC sulle stesse chiavi.
3. **Ricettario dello studio** (M). Il nutrizionista crea ricette che compaiono nel ricettario di tutti i suoi pazienti (scope `nutrizionista`): riusa `ricette_utente` con `famiglia_id` nullo e una tabella ponte. Il pool del generatore del paziente include quelle del suo nutrizionista.
4. **Notifiche** (M). Oggi i messaggi arrivano in tempo reale solo con l'app aperta. Push via service worker (già presente per i promemoria) + email di riepilogo giornaliera "hai 2 messaggi non letti".
5. **Pagamento** (M). Stripe Checkout con abbonamento mensile a scaglioni (fino a 10 pazienti, fino a 30, illimitati), webhook che aggiorna `nutrizionisti.stato`. Finché non c'è, l'attivazione manuale dalla plancia va benissimo: i primi 20 nutrizionisti meglio sentirli uno a uno.
6. **Report di visita** (S). Un PDF con grafici e diario delle ultime 4 settimane, da stampare o inviare: è ciò che il nutrizionista mostra al paziente in studio e giustifica il canone.

### Prezzo: come ragionarlo
Nutrium parte da 25 €/mese per 10 pazienti; Coachway 25 € per 25 pazienti. MenuDieta non sostituisce il gestionale, lo affianca: il prezzo deve stare **sotto** (es. 9 €/mese fino a 10 pazienti, 19 € fino a 40, 39 € illimitati) e il messaggio è "i tuoi pazienti seguono il piano perché cucinano con MenuDieta tutti i giorni". Primo anno gratis ai primi 20 in cambio di feedback e di una recensione.

---

## 2. Pagine mirate per il traffico

Il sito ha 13 pagine. Per fare volumi servono **molte pagine lunghe e specifiche** (long tail): ciascuna porta poco, ma sommate fanno il grosso del traffico organico. Tre gruppi, in ordine di rendimento atteso.

### A. Pagine-strumento (le più forti: la gente le usa, le salva, le linka)
| Pagina | Ricerca | Sforzo | Note |
|---|---|---|---|
| /calorie-alimenti/ + 1 pagina per alimento (828) | "calorie [alimento]", "[alimento] valori nutrizionali" | M (generate dal JSON) | 828 pagine da `ingredients.json`: nome, kcal, P/C/G per 100 g, peso di un pezzo, stagionalità, ricette che lo usano. È il motore di traffico più grande disponibile. |
| /ricette/ + 1 pagina per ricetta (196 + community) | "[ricetta] calorie", "[ricetta] light" | M (da `recipes.json` + `catalogo_pubblico`) | Ricetta con porzioni uomo/donna/bambino, macro, stagione, "aggiungi al mio menu". Schema.org Recipe → rich result con foto e calorie. |
| /frutta-verdura-di-stagione/ + 12 pagine mese | "frutta e verdura di novembre" | S | Dati già in `stagioni` degli ingredienti. Query forte e ricorrente ogni mese. |
| /misure-casalinghe/ e /equivalenze-alimenti/ | "un cucchiaio di olio quanti grammi", "100 g di pasta quanto riso" | S | Tool già nell'app (Strumenti). |
| /calcolo-bmi/, /percentuale-massa-grassa/ | "calcolo bmi", "calcolo massa grassa" | S | Formule già nel motore (US Navy). Alta concorrenza ma volume enorme; vale per i link interni. |

### B. Pagine informative con intento "famiglia" (meno concorrenza)
| Pagina | Ricerca |
|---|---|
| /menu-settimanale-economico/ | "menu settimanale economico famiglia", "spesa settimanale 4 persone" |
| /menu-settimanale-vegetariano-famiglia/ | "menu settimanale vegetariano" |
| /menu-settimanale-bambini-asilo/ | "menu settimanale bambini 3 anni" (già una guida, serve la pagina-pilastro) |
| /colazione-sana-bambini/ | "colazione sana per bambini" |
| /dieta-in-gravidanza-menu/ | "menu settimanale gravidanza" (richiede disclaimer e revisione di un professionista: ottimo contenuto da far firmare a un nutrizionista partner) |
| /svezzamento-menu-settimanale/ | "menu svezzamento 8 mesi" (traffico altissimo, concorrenza forte: fare solo con un partner pediatrico) |

### C. Pagine per i nutrizionisti (poche, ma portano i clienti paganti)
| Pagina | Ricerca |
|---|---|
| /app-per-pazienti-nutrizionista/ | "app per pazienti nutrizionista", "app diario alimentare per pazienti" |
| /aderenza-dieta-pazienti/ | "come far seguire la dieta ai pazienti" (contenuto che il professionista condivide) |
| /nutrizionista-online-strumenti/ | "strumenti per nutrizionista online" |
| /fitsy-vs-nutrium/ (confronto onesto) | "nutrium alternative", "nutrium prezzi" |

### Regola per ogni pagina
Parola chiave esatta nel title e nell'H1; risposta nelle prime 2 righe; una tabella o uno strumento; FAQ reali; 2–3 link verso altre pagine MenuDieta; bottone verso l'app con un motivo concreto ("genera il tuo menu con questi ingredienti"). Tutto resta generato da `keywords.mjs` + `contenuti.mjs`: le pagine alimento/ricetta/stagione saranno generate dai JSON con un template.

---

## 3. Strategia organica per fare volumi

Ordine cronologico. Nessuna pubblicità a pagamento finché il prodotto non converte da solo.

### Mese 1 — Fondamenta (da fare subito)
- [x] Sito, calcolatori, Search Console, sitemap.
- [ ] **Pagine alimenti e ricette generate** (gruppo A): sono 1.000+ URL indicizzabili in una settimana di lavoro. È la singola cosa più efficace.
- [ ] **Profilo Google Business** per AF&B/MenuDieta (gratis): dà credibilità e un riquadro nei risultati.
- [ ] **Schede sugli store senza app nativa**: non ancora. La PWA basta; Capacitor più avanti quando c'è volume.

### Mese 2–3 — Autorità (link e menzioni)
- [ ] **5 nutrizionisti partner** (gratis a vita) che usano MenuDieta con i pazienti e la citano sul proprio sito/profilo: 5 link veri da siti del settore valgono più di 500 directory.
- [ ] **Directory e confronti**: Capterra, GetApp, Trustpilot (gratis), AlternativeTo, Product Hunt (un lancio ben fatto porta link e 1–2 giorni di traffico).
- [ ] **Università e associazioni**: ANDID (dietisti), ASAND, corsi di laurea in dietistica: MenuDieta gratis per gli studenti → link `.edu/.it` istituzionali.
- [ ] **Stampa locale e di settore**: un comunicato "startup romana lancia l'app gratuita per il menu di famiglia" a testate come StartupItalia, Wired Italia, Il Fatto Alimentare, ANSA Lifestyle. Gancio: gratis, senza pubblicità, dati in UE, tabelle LARN.

### Mese 2 in poi — Ricorrenza (contenuti che tornano ogni mese)
- [ ] **"Di stagione a [mese]"**: ogni primo del mese una pagina/post aggiornata + email agli utenti + post social. Costo quasi zero, traffico garantito.
- [ ] **Newsletter mensile** (Brevo è gratis fino a 300 mail/giorno): menu del mese, ricetta della community, novità. Doppio opt-in, informativa già pronta.
- [ ] **2 guide al mese** dalle query reali di Search Console (quelle con impressioni ma senza pagina dedicata).

### Loop interni (crescita che si auto-alimenta)
- **Famiglia → famiglia**: il codice famiglia è già un invito. Aggiungere "Invita un amico" con link `?fam=CODICE` come fatto per i nutrizionisti (S).
- **Nutrizionista → pazienti**: ogni professionista attivo porta 10–40 utenti. 20 nutrizionisti = 500 famiglie. È il canale più efficiente in assoluto.
- **Ricette community → pagine pubbliche**: ogni ricetta validata diventa una pagina indicizzata con il nome dell'autore (se acconsente): le persone condividono la "loro" pagina.
- **PWA**: promemoria "aggiungi alla schermata home" dopo il 3° accesso (S): chi installa torna il doppio.

### Cosa misurare (ogni mese, 20 minuti)
| Metrica | Dove | Obiettivo a 3 mesi |
|---|---|---|
| Clic organici | Search Console → Rendimento | 1.000/mese |
| Pagine indicizzate | Search Console → Pagine | > 800 |
| Nuovi utenti registrati | Plancia → Panoramica | 150 |
| Famiglie attive 30 gg | Plancia | 60% dei registrati |
| Nutrizionisti attivi / pazienti collegati | Plancia → Nutrizionisti | 10 / 100 |
| Ricette pubblicate | Plancia → Ricette | 50 |

### Cosa NON fare
- Non comprare link né iscriversi a 200 directory: Google li ignora o li penalizza.
- Non aprire 5 social: uno solo (Instagram o TikTok, dove stanno le famiglie), con il formato "menu della settimana in 30 secondi".
- Non fare ads prima di avere 1.000 visite organiche/mese: senza dati sulla conversione si brucia budget.

---

## Prossime 3 cose che farò, salvo tuo diverso parere
1. Generatore delle **pagine alimenti** (828) e **ricette** (196 + community) con schema.org (gruppo A, righe 1–2).
2. Le **12 pagine di stagionalità**.
3. **Invito famiglia** con link `?fam=` e promemoria "installa l'app".
