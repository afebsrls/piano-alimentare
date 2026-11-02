# Sito pubblico www.fitsy.it — metodo SEO

## Come è fatto
- `site/src/keywords.mjs` — **la fonte unica**: una riga per ogni ricerca da vincere (parola chiave, varianti, intento, concorrenti, title, description).
- `site/src/contenuti.mjs` — il testo di ogni pagina (H1 = parola chiave esatta, varianti negli H2, risposta nelle prime 2 righe, FAQ con schema.org).
- `site/src/tools.js` — i calcolatori, con le stesse formule del motore dell'app (LARN, indice di Grant, EFSA).
- `node site/build.mjs` → `site/dist/` (HTML statico, sitemap.xml, robots.txt, .htaccess). Deploy automatico nella root di Aruba a ogni push.

## Perché queste pagine (novembre 2026)
| Ricerca | Chi vince oggi | Come la superiamo |
|---|---|---|
| piano alimentare / menu settimanale famiglia | raccolte di app (Aranzulla), PDF Migros, articoli generici | pagina dedicata + esempio + generatore vero |
| lista della spesa automatica | app di sole liste | lista che nasce dal menu, quantità per famiglia |
| calcolo fabbisogno calorico / peso forma / quanta acqua | calcolatori generici con formule USA | calcolatori con tabelle LARN italiane, spiegati |
| software/app per nutrizionisti | Nutrium, EvolutionFit, Coachway | posizionamento "l'app del paziente", lista d'attesa |

## Misurare (ogni mese)
1. **Google Search Console** → aggiungi proprietà `https://www.fitsy.it`, verifica, invia `sitemap.xml`.
2. Rendimento → Query: le query che portano clic ma non hanno una pagina dedicata → nuova voce in `keywords.mjs` + contenuto.
3. Pagine con impressioni alte e CTR basso → riscrivere title/description.
4. Posizione 4–10 → arricchire la pagina (esempio, tabella, FAQ) e linkarla dalle altre.

## Prossime pagine candidate
- ricette pubbliche del catalogo community (una pagina per ricetta: "ricetta X calorie e porzioni")
- stagionalità frutta e verdura mese per mese (12 pagine)
- equivalenze alimenti e misure casalinghe
