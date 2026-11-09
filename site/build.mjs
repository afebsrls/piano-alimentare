// Genera il sito pubblico statico in site/dist/ a partire da keywords.mjs
// e contenuti.mjs. Uso: node site/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, APP, PAGES, ARTICOLI, INDEXNOW_KEY } from './src/keywords.mjs';
import { CONTENUTI, ARTICOLI_HTML, ARTICOLI_FAQ, LEGALI } from './src/contenuti.mjs';
import * as MOCK from './src/mockups.mjs';
import { ALIMENTI, RICETTE, DATA_MOD, paginaAlimento, indiceAlimenti, paginaRicetta, indiceRicette } from './src/generati.mjs';
import { paginaMese, indiceStagioni } from './src/stagioni.mjs';
import { VARIANTI, paginaVariante, itemListSchema } from './src/kitPagine.mjs';
import { calcolaKit, KIT_DEFAULT } from '../src/core/kitEmergenza.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT = path.join(__dirname, 'dist');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const CSS = fs.readFileSync(path.join(__dirname, 'src/style.css'), 'utf8');
// Chiave anon di Supabase (pubblica per natura: è la stessa nel bundle dell'app).
const cfg = fs.readFileSync(path.join(__dirname, '../src/db/supabaseConfig.js'), 'utf8');
const SB_URL = (cfg.match(/SUPABASE_URL\s*=\s*["']([^"']+)/) || [])[1] || '';
const SB_KEY = (cfg.match(/SUPABASE_ANON_KEY\s*=\s*["']([^"']+)/) || [])[1] || '';
if (!SB_URL || !SB_KEY) console.warn('[site] Supabase non configurato: il modulo lista d\'attesa non funzionerà');
const WAITLIST_JS = fs.readFileSync(path.join(__dirname, 'src/waitlist.js'), 'utf8').replace('__SB_URL__', SB_URL).replace('__SB_KEY__', SB_KEY);
const TOOLS_JS = fs.readFileSync(path.join(__dirname, 'src/tools.js'), 'utf8');
// Motore del kit di emergenza: stesso file dell'app (src/core/kitEmergenza.js), reso script semplice
const KIT_JS = fs.readFileSync(path.join(__dirname, '../src/core/kitEmergenza.js'), 'utf8').replace(/^export /gm, '') + '\n' + fs.readFileSync(path.join(__dirname, 'src/kit.js'), 'utf8');

// Entità MenuDieta, uguale su tutte le pagine: aiuta Google e gli assistenti AI a riconoscere il marchio (anche il vecchio nome Fitsy)
const ORG = { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE}/#org`, name: 'MenuDieta', alternateName: ['Menu Dieta', 'menudieta.it', 'Fitsy'], legalName: 'AF&B S.r.l.s.', url: `${SITE}/`, logo: `${SITE}/icon.svg`, email: 'info@menudieta.it', vatID: 'IT13698751008', slogan: 'Nutrizione intelligente', description: 'App gratuita italiana che crea il menu settimanale della famiglia con le porzioni di ciascuno e la lista della spesa, basata su LARN e linee guida CREA.', knowsAbout: ['menu settimanale', 'porzioni per età', 'fabbisogno calorico', 'linee guida CREA', 'LARN', 'lista della spesa', 'kit di emergenza 72 ore'], address: { '@type': 'PostalAddress', streetAddress: 'Via Mario Ugo Guattari 48', postalCode: '00173', addressLocality: 'Roma', addressRegion: 'RM', addressCountry: 'IT' }, contactPoint: { '@type': 'ContactPoint', email: 'info@menudieta.it', contactType: 'customer support', availableLanguage: 'Italian' } };
const DATA_IT = (d) => new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
// Meta description entro i ~155 caratteri mostrati da Google
const corta = (s, max = 155) => s.length <= max ? s : s.slice(0, max - 1).replace(/[\s,;:.–-]+\S*$/, '') + '…';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const url = (slug) => slug ? `${SITE}/${slug}/` : `${SITE}/`;

const phone = (name, cls = '') => `<div class="phone ${cls}">${MOCK[name]}</div>`;
const ICONA = `<svg viewBox="0 0 176 176" width="34" height="34" aria-hidden="true"><circle cx="88" cy="88" r="88" fill="#F5F8F1"/><circle cx="88" cy="88" r="72" fill="none" stroke="#DDE5D8" stroke-width="3"/><circle cx="66" cy="82" r="30" fill="#2F6B3A"/><circle cx="114" cy="70" r="20" fill="#C7F23E"/><circle cx="110" cy="114" r="13" fill="#15251C"/></svg>`;
const LOGO = `<a class="logo" href="/" aria-label="MenuDieta">${ICONA}menu<span>dieta</span></a>`;
const NAV = `
<nav class="nav">
  <a href="/menu-settimanale-famiglia/">Menu settimanale</a>
  <a href="/lista-della-spesa-automatica/">Lista spesa</a>
  <a href="/calcolo-fabbisogno-calorico/">Calcolatori</a>
  <a href="/ricette/">Ricette</a>
  <a href="/alimenti/">Alimenti</a>
  <a href="/frutta-verdura-di-stagione/">Di stagione</a>
  <a href="/blog/">Guide</a>
  <a href="/kit-di-emergenza/">🎒 Kit emergenza</a>
  <a href="/per-nutrizionisti/">Nutrizionisti</a>
  <a class="cta" href="${APP}">Apri l’app</a>
</nav>`;

function layout({ title, description, slug, body, schema = [], type = 'website', datePublished, dateModified, noindex = false, ogImage }) {
  const canonical = url(slug);
  description = corta(description);
  const ld = [
    ORG,
    ...schema,
  ];
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MenuDieta">
<meta property="og:locale" content="it_IT">
<meta property="og:image" content="${ogImage || SITE + '/og.png'}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
${datePublished ? `<meta property="article:published_time" content="${datePublished}">` : ''}${dateModified ? `<meta property="article:modified_time" content="${dateModified}">` : ''}
<meta name="theme-color" content="#15251C">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<header class="top"><div class="wrap">${LOGO}${NAV}</div></header>
<main class="wrap">
${body}
${dateModified && !noindex ? `<p class="note agg">Ultimo aggiornamento: ${DATA_IT(dateModified)} · <a href="/chi-siamo/">metodo e fonti</a></p>` : ''}
</main>
${slug === '' || noindex ? '' : `<a class="stickycta" href="${APP}">Crea il menu della tua famiglia <strong>gratis →</strong></a>`}
<footer class="foot"><div class="wrap">
  <div class="cols">
    <div><strong>MenuDieta</strong><br>Nutrizione intelligente per la famiglia.<br><a href="${APP}">Apri l’app</a> · gratis, senza pubblicità.</div>
    <div><strong>Strumenti gratuiti</strong><br>
      <a href="/calcolo-fabbisogno-calorico/">Fabbisogno calorico</a><br>
      <a href="/peso-forma-calcolo/">Peso forma</a><br>
      <a href="/quanta-acqua-bere-al-giorno/">Acqua al giorno</a><br>
      <a href="/porzioni-bambini-per-eta/">Porzioni per età</a><br>
      <a href="/kit-di-emergenza/">Kit di emergenza</a><br>
      <a href="/frutta-verdura-di-stagione/">Frutta e verdura di stagione</a><br>
      <a href="/alimenti/">Calorie degli alimenti</a><br>
      <a href="/ricette/">Ricette con porzioni</a></div>
    <div><strong>Guide</strong><br>${ARTICOLI.map(a => `<a href="/${a.slug}/">${esc(a.title)}</a>`).join('<br>')}</div>
    <div><strong>Info</strong><br><a href="/chi-siamo/">Chi siamo, metodo e fonti</a><br><a href="/per-nutrizionisti/">Per nutrizionisti</a><br><a href="/privacy/">Privacy policy</a><br><a href="/cookie/">Cookie policy</a><br><a href="${APP}privacy.html">Privacy dell’app</a><br><a href="mailto:info@menudieta.it">info@menudieta.it</a></div>
  </div>
  <div class="fine">MenuDieta è un servizio di AF&amp;B S.r.l.s. · Via Mario Ugo Guattari 48, 00173 Roma (RM) · P.IVA 13698751008 · REA RM-1466364 · Capitale sociale € 2.700,00 i.v.<br>© ${new Date().getFullYear()} AF&amp;B S.r.l.s. · I calcolatori forniscono stime indicative e non sostituiscono il parere di un medico o di un nutrizionista.</div>
</div></footer>
<div id="cn" class="cn" role="region" aria-label="Informativa cookie" hidden>
  <div>Questo sito <strong>non usa cookie di profilazione</strong> né strumenti di tracciamento: nessun dato viene raccolto mentre lo consulti. I calcolatori funzionano nel tuo browser e non inviano nulla. <a href="/cookie/">Cookie policy</a> · <a href="/privacy/">Privacy</a></div>
  <button id="cn-ok" type="button">Ho capito</button>
</div>
<script>(function(){try{if(localStorage.getItem('fitsy-cn')==='1')return;}catch(e){}var b=document.getElementById('cn');if(!b)return;b.hidden=false;document.getElementById('cn-ok').onclick=function(){b.hidden=true;try{localStorage.setItem('fitsy-cn','1');}catch(e){}};})();</script>
</body>
</html>`;
}

const faqSchema = (faq) => faq?.length ? [{
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })),
}] : [];

const faqHtml = (faq) => faq?.length ? `<section class="faq"><h2>Domande frequenti</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div>${a}</div></details>`).join('')}</section>` : '';

const ctaHtml = (testo = 'Prova MenuDieta gratis') => `<div class="ctabox"><div><strong>${esc(testo)}</strong><br>Menu settimanale per tutta la famiglia, porzioni per ciascuno e lista della spesa automatica. Senza pubblicità, senza carta di credito.</div><a class="btn" href="${APP}">Apri l’app →</a></div>`;

// Ogni link all'app porta ?da=<pagina>: l'app conta in modo anonimo quali pagine portano persone (vedi supabase/s15_arrivi.sql)
const tagApp = (html, slug) => html.replace(/href="https:\/\/www\.menudieta\.it\/app\/(\?[^"#]*)?(#[^"]*)?"/g, (m, q = '', h = '') => `href="${APP}${q ? q + '&' : '?'}da=${slug || 'home'}${h}"`);
function writePage(slug, html) {
  html = tagApp(html, slug);
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// ── Pagine principali ──
for (const p of PAGES) {
  const c = CONTENUTI[p.slug || 'home'];
  if (!c) throw new Error('Contenuto mancante per ' + (p.slug || 'home'));
  const schema = [...faqSchema(c.faq)];
  if (p.tipo === 'home') schema.push({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'MenuDieta', alternateName: ['Menu Dieta', 'Fitsy'], url: `${SITE}/`, inLanguage: 'it', publisher: { '@id': `${SITE}/#org` } }, {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'MenuDieta',
    applicationCategory: 'HealthApplication', operatingSystem: 'Web, Android, iOS',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    description: p.description, url: APP, inLanguage: 'it',
  });
  if (p.tipo === 'kit') { p.ogImage = `${SITE}/og-kit.png`; schema.push(itemListSchema(calcolaKit({ ...KIT_DEFAULT, A: 2, B: 0, G: 3, F: 1 }), 'Kit di emergenza per 2 adulti, 72 ore'), { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: 'Kit di emergenza', item: `${SITE}/kit-di-emergenza/` }] }); }
  if (p.tipo === 'tool' || p.tipo === 'kit' || p.tipo === 'porzioni') schema.push({
    '@context': 'https://schema.org', '@type': 'WebApplication', name: p.title,
    applicationCategory: 'HealthApplication', operatingSystem: 'Web', browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, url: url(p.slug), inLanguage: 'it',
  });
  const body = `${c.body({ esc, APP, cta: ctaHtml, phone })}${faqHtml(c.faq)}${p.tipo === 'tool' ? `<script>${TOOLS_JS}</script>` : ''}${p.tipo === 'nutrizionisti' ? `<script>${WAITLIST_JS}</script>` : ''}${p.tipo === 'kit' ? `<script>(function(){${KIT_JS}})();</script>` : ''}`;
  writePage(p.slug, layout({ ...p, body, schema, dateModified: p.slug ? (p.mod || '2026-11-03') : undefined }));
}

// ── Pagine legali ──
for (const [slug, l] of Object.entries(LEGALI)) {
  writePage(slug, layout({ title: l.title, description: l.description, slug, body: l.body({ esc, APP }) }));
}

// ── Blog: indice + articoli ──
for (const a of ARTICOLI) {
  const html = ARTICOLI_HTML[a.slug];
  if (!html) throw new Error('Articolo mancante: ' + a.slug);
  const schema = [{
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description,
    datePublished: a.data, dateModified: a.mod || a.data, inLanguage: 'it',
    author: { '@type': 'Organization', name: 'Redazione MenuDieta', url: url('chi-siamo') }, publisher: { '@type': 'Organization', name: 'MenuDieta', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/icon.svg` } },
    mainEntityOfPage: url(a.slug),
  }, ...faqSchema(ARTICOLI_FAQ[a.slug])];
  const correlati = ARTICOLI.filter(x => x.slug !== a.slug).slice(0, 3);
  const body = `<article class="art"><p class="crumb"><a href="/blog/">Guide</a> · ${DATA_IT(a.data)} · <a href="/chi-siamo/">Redazione MenuDieta, metodo e fonti</a></p>${html({ esc, APP, cta: ctaHtml, phone })}${faqHtml(ARTICOLI_FAQ[a.slug])}<h2>Leggi anche</h2><ul>${correlati.map(x => `<li><a href="/${x.slug}/">${esc(x.title)}</a></li>`).join('')}<li><a href="/porzioni-bambini-per-eta/">Porzioni per bambini e adulti: la tabella per età</a></li></ul></article>`;
  writePage(a.slug, layout({ ...a, body, schema, type: 'article', datePublished: a.data, dateModified: a.mod || a.data }));
}
writePage('blog', layout({
  title: 'Guide MenuDieta: organizzare i pasti della famiglia',
  description: 'Guide pratiche per organizzare il menu settimanale, le porzioni dei bambini e il piano alimentare di mantenimento.',
  slug: 'blog',
  body: `<h1>Guide per organizzare i pasti della famiglia</h1><p class="lead">Guide pratiche per cucinare una volta sola per tutta la famiglia: come organizzare il menu della settimana, quanto mettere nel piatto di adulti e bambini, come fare la spesa senza sprechi. Ogni guida cita le fonti (LARN, linee guida CREA) e rimanda a uno strumento gratuito con cui provare subito.</p>
  <div class="cards">${[...ARTICOLI].sort((x, y) => (y.data > x.data ? 1 : -1)).map(a => `<a class="card" href="/${a.slug}/"><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p><p class="note">${DATA_IT(a.data)}</p></a>`).join('')}</div>
  <h2>Strumenti gratuiti</h2>
  <p>Per mettere subito in pratica le guide: <a href="/porzioni-bambini-per-eta/">porzioni per età</a> · <a href="/calcolo-fabbisogno-calorico/">calcolo del fabbisogno calorico</a> · <a href="/quanta-acqua-bere-al-giorno/">quanta acqua bere</a> · <a href="/peso-forma-calcolo/">peso forma</a> · <a href="/frutta-verdura-di-stagione/">frutta e verdura di stagione</a> · <a href="/kit-di-emergenza/">kit di emergenza 72 ore</a> · <a href="/alimenti/">calorie degli alimenti</a> · <a href="/ricette/">ricette con porzioni</a>.</p>
  ${ctaHtml('Dalla guida al menu della tua famiglia')}`,
}));

// ── Pagine generate: alimenti e ricette ──
const gen = [];
const ctx = { esc, APP, cta: ctaHtml };
for (const a of ALIMENTI) { const pg = paginaAlimento(a, ctx); writePage(pg.slug, layout({ ...pg, body: `${pg.body}${faqHtml(pg.faq)}`, schema: [...faqSchema(pg.faq), ...pg.schema], dateModified: DATA_MOD })); gen.push(pg.slug); }
for (const r of RICETTE) { const pg = paginaRicetta(r, ctx); writePage(pg.slug, layout({ ...pg, body: `${pg.body}${faqHtml(pg.faq)}`, schema: [...faqSchema(pg.faq), ...pg.schema], dateModified: DATA_MOD })); gen.push(pg.slug); }
{ const pg = indiceAlimenti(ctx); writePage(pg.slug, layout(pg)); }
{ const pg = indiceRicette(ctx); writePage(pg.slug, layout(pg)); }

// ── Pagine stagionalità: 12 mesi + calendario ──
const stag = [];
for (let m = 1; m <= 12; m++) { const pg = paginaMese(m, { ...ctx, RICETTE }); writePage(pg.slug, layout({ ...pg, body: `${pg.body}${faqHtml(pg.faq)}`, schema: [...faqSchema(pg.faq), ...pg.schema], dateModified: DATA_MOD })); stag.push(pg.slug); }
{ const pg = indiceStagioni(ctx); writePage(pg.slug, layout({ ...pg, body: `${pg.body}${faqHtml(pg.faq)}`, schema: faqSchema(pg.faq) })); }

// ── Kit di emergenza: liste pronte (long tail) ──
const kitPag = [];
for (const v of VARIANTI) { const pg = paginaVariante(v, ctx); writePage(pg.slug, layout({ ...pg, body: `${pg.body}${faqHtml(pg.faq)}<script>(function(){${KIT_JS}})();</script>`, schema: [...faqSchema(pg.faq), ...pg.schema], dateModified: DATA_MOD })); kitPag.push(pg.slug); }

// ── Pagina 404 vera (status 404 dal server, vedi .htaccess) ──
fs.writeFileSync(path.join(OUT, '404.html'), layout({
  title: 'Pagina non trovata – MenuDieta', description: 'La pagina che cercavi non esiste o è stata spostata.', slug: '404', noindex: true,
  body: `<h1>Pagina non trovata</h1><p class="lead">L’indirizzo non esiste o è cambiato. Prova da qui:</p>
<ul><li><a href="/">Home di MenuDieta</a></li><li><a href="/menu-settimanale-famiglia/">Menu settimanale per la famiglia</a></li><li><a href="/ricette/">Ricette con calorie e porzioni</a></li><li><a href="/alimenti/">Calorie degli alimenti</a></li><li><a href="/frutta-verdura-di-stagione/">Frutta e verdura di stagione</a></li><li><a href="/calcolo-fabbisogno-calorico/">Calcolatori gratuiti</a></li></ul>${ctaHtml()}`,
}));
const OGGI = DATA_MOD; // data vera dell'ultima modifica dei dati, non del build
fs.writeFileSync(path.join(OUT, 'sitemap-alimenti.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['alimenti', ...gen.filter(g => g.startsWith('alimenti/'))].map(g => `  <url><loc>${url(g)}</loc><lastmod>${OGGI}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'sitemap-ricette.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['ricette', ...gen.filter(g => g.startsWith('ricette/'))].map(g => `  <url><loc>${url(g)}</loc><lastmod>${OGGI}</lastmod></url>`).join('\n')}\n</urlset>\n`);

// ── File di servizio ──
const tutte = [...PAGES.map(p => ({ slug: p.slug, pri: p.tipo === 'home' ? '1.0' : p.tipo === 'info' ? '0.4' : '0.8', mod: p.mod || '2026-11-03' })), { slug: 'blog', pri: '0.5', mod: '2026-11-03' }, ...Object.keys(LEGALI).map(slug => ({ slug, pri: '0.3', mod: '2026-11-03' })), ...ARTICOLI.map(a => ({ slug: a.slug, pri: '0.6', mod: a.mod || a.data })), { slug: 'frutta-verdura-di-stagione', pri: '0.8', mod: DATA_MOD }, ...stag.map(slug => ({ slug, pri: '0.7', mod: DATA_MOD })), ...kitPag.map(slug => ({ slug, pri: '0.7', mod: DATA_MOD }))];
fs.writeFileSync(path.join(OUT, 'sitemap-pagine.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tutte.map(u => `  <url><loc>${url(u.slug)}</loc><lastmod>${u.mod}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE}/sitemap-pagine.xml</loc></sitemap>
  <sitemap><loc>${SITE}/sitemap-ricette.xml</loc></sitemap>
  <sitemap><loc>${SITE}/sitemap-alimenti.xml</loc></sitemap>
</sitemapindex>
`);
// robots.txt: tutti benvenuti, compresi i motori di risposta AI (citano le pagine con link alla fonte). L'app resta fuori.
const BOT_AI = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'MistralAI-User'];
fs.writeFileSync(path.join(OUT, 'robots.txt'), `# MenuDieta: contenuti liberamente consultabili e citabili, con link alla fonte.\nUser-agent: *\n${BOT_AI.map(b => `User-agent: ${b}`).join('\n')}\nAllow: /\nDisallow: /app/\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
// llms.txt: sommario del sito per gli assistenti AI (standard llmstxt.org): cosa siamo, pagine chiave, fatti citabili
const riga = (slug, t, d) => `- [${t}](${url(slug)}): ${d}`;
fs.writeFileSync(path.join(OUT, 'llms.txt'), `# MenuDieta

> MenuDieta (www.menudieta.it, prima chiamata Fitsy) è un'app web gratuita e senza pubblicità, italiana, che crea il menu settimanale per tutta la famiglia con la porzione giusta per ogni persona (adulti e bambini) e la lista della spesa automatica. I calcoli seguono i LARN (SINU) e le Linee guida per una sana alimentazione del CREA (2018). Servizio di AF&B S.r.l.s., Roma.

Fatti utili, con fonte nelle pagine indicate:
- Frequenze settimanali dei secondi piatti (CREA 2018, su 14 pasti): legumi 3, carne 3, formaggi 3, pesce 2, uova 2, salumi 1.
- Porzione di pasta a crudo per pasto: 40 g a 2–3 anni, 50 g a 4–6 anni, 70 g a 7–10 anni, 100 g a 11–17 anni, 80 g per un adulto (grammature ASL da CREA e LARN).
- Kit di emergenza 72 ore: circa 5 litri d'acqua al giorno per adulto e 3 per bambino; per 2 adulti e 1 bambino servono 39 litri.
- Fabbisogno calorico calcolato con il metodo LARN (metabolismo basale × livello di attività).

## Strumenti gratuiti
${PAGES.filter(p => ['tool', 'kit', 'porzioni', 'landing'].includes(p.tipo)).map(p => riga(p.slug, p.title.replace(/ [–-] .*$/, ''), p.description)).join('\n')}

## Guide
${ARTICOLI.map(a => riga(a.slug, a.title, a.description)).join('\n')}

## Dati
- [Calorie degli alimenti](${url('alimenti')}): ${gen.filter(g => g.startsWith('alimenti/')).length} alimenti con calorie, macronutrienti per 100 g e porzione per età.
- [Ricette con porzioni](${url('ricette')}): ${gen.filter(g => g.startsWith('ricette/')).length} ricette con grammature per uomo, donna e bambino e valori nutrizionali.
- [Frutta e verdura di stagione](${url('frutta-verdura-di-stagione')}): calendario mese per mese.

## Chi siamo
${riga('chi-siamo', 'Chi siamo, metodo e fonti', 'chi c’è dietro MenuDieta e su quali fonti si basano i calcoli.')}
${riga('per-nutrizionisti', 'Per nutrizionisti', 'MenuDieta per i professionisti della nutrizione (lista d’attesa).')}

## App
- [Apri l'app](${APP}): gratuita per le famiglie, funziona nel browser e si installa sul telefono.
`);
fs.copyFileSync(path.join(__dirname, 'src/htaccess-root'), path.join(OUT, '.htaccess'));
fs.copyFileSync(path.join(__dirname, 'src/icon.svg'), path.join(OUT, 'icon.svg'));
fs.copyFileSync(path.join(__dirname, 'src/og.png'), path.join(OUT, 'og.png'));
fs.copyFileSync(path.join(__dirname, 'src/og-kit.png'), path.join(OUT, 'og-kit.png'));

console.log(`[site] generate ${tutte.length + gen.length + 3} pagine in site/dist/ (${gen.length} alimenti+ricette)`);
