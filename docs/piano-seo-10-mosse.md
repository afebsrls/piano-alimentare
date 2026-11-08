# MenuDieta — piano SEO in 10 mosse (8/11/2026)

Obiettivo: più traffico organico e posizioni più alte su Google. Si affianca a
`strategia-crescita.md` (cosa costruire) e `seo-metodo.md` (regole di pagina).
Stato: ✅ fatto · 🔧 da fare nel codice · 👤 da fare a mano (titolare).

| # | Mossa | Stato | Cosa resta |
|---|---|---|---|
| 1 | Cambio di nome fitsy → menudieta senza perdite | ✅ 301 pagina→pagina su fitsy.it, canonico unico www.menudieta.it | 👤 Search Console di fitsy.it → Impostazioni → *Cambio di indirizzo* verso menudieta.it; inviare `sitemap.xml` nella proprietà menudieta.it |
| 2 | Pagine leggibili da Google (HTML statico + dati strutturati) | ✅ sito statico, Recipe/FAQ/Article/Breadcrumb, sitemap divise | 👤 Search Console → Controllo URL su 3 pagine a campione: lo screenshot deve mostrare il testo |
| 3 | Pagine alimenti uniche | ✅ (8/11) sezione **porzione per età** con kcal su ~400 schede + FAQ "porzione per un bambino" | 🔧 mettere `noindex` alle schede alimento troppo povere (cotti/varianti senza ricette) dopo 4 settimane di dati Search Console |
| 4 | Grappoli di pagine attorno al menu settimanale | 🔧 | pagine: menu settimanale economico, vegetariano, bambini 3 anni, invernale/estivo, 1500 kcal; ognuna linka `/menu-settimanale-famiglia/` e viceversa |
| 5 | Strumenti gratuiti | ✅ fabbisogno, peso forma, acqua, kit, **porzioni per età** (8/11) | 🔧 misure casalinghe ("un cucchiaio di olio quanti grammi"), equivalenze (pasta↔riso↔pane), calcolo BMI bambini |
| 6 | Calendario stagionale | ✅ 12 pagine "di stagione" | 🔧 pubblicare **entro novembre**: "menu leggero dopo le feste", "menu di Natale equilibrato"; entro marzo: "menu estivo" |
| 7 | Firma e fonti (E-E-A-T, tema salute) | ✅ (8/11) `/chi-siamo/` con metodo e fonti, autore "Redazione MenuDieta" negli articoli | 👤 trovare 1 nutrizionista revisore (dalla lista d'attesa): nome, albo, foto → poi 🔧 campo `revisore` negli articoli |
| 8 | Link da siti autorevoli | 👤 | proporre il calcolatore del kit a Comuni / Protezione Civile locali / scuole; directory (AlternativeTo, Capterra, Trustpilot); comunicato stampa con un dato originale anonimo dall'app |
| 9 | Pinterest + menu stampabile | 🔧 + 👤 | 🔧 PDF settimanale del menu di esempio; 👤 account Pinterest business, 3–4 pin verticali a settimana |
| 10 | Revisione mensile | 👤 ogni 1° del mese | Search Console → Rendimento → pagine in posizione 8–20 → migliorare title, primo paragrafo e link interni di 5 pagine |

## Note sui contenuti del primo lotto (Claude Docs, 8/11)
- "Menu settimanale per la famiglia" e "Kit 72 ore" **non** diventano pagine nuove: esistono già
  (`/menu-settimanale-famiglia/`, `/kit-di-emergenza/`). Una seconda pagina sulla stessa ricerca
  farebbe concorrenza alla prima. Il kit ha ricevuto l'aggiornamento UE del 3/11/2026.
- "Porzioni per età" è diventata la pagina-strumento `/porzioni-bambini-per-eta/`.
- "Lista della spesa settimanale" è l'articolo `blog/lista-della-spesa-settimanale`.
