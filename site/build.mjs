// Genera il sito pubblico statico in site/dist/ a partire da keywords.mjs
// e contenuti.mjs. Uso: node site/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, APP, PAGES, ARTICOLI } from './src/keywords.mjs';
import { CONTENUTI, ARTICOLI_HTML, LEGALI } from './src/contenuti.mjs';
import * as MOCK from './src/mockups.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT = path.join(__dirname, 'dist');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const CSS = fs.readFileSync(path.join(__dirname, 'src/style.css'), 'utf8');
const TOOLS_JS = fs.readFileSync(path.join(__dirname, 'src/tools.js'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const url = (slug) => slug ? `${SITE}/${slug}/` : `${SITE}/`;

const phone = (name, cls = '') => `<div class="phone ${cls}">${MOCK[name]}</div>`;
const LOGO = `<a class="logo" href="/" aria-label="Fitsy">f<span>i</span>tsy</a>`;
const NAV = `
<nav class="nav">
  <a href="/menu-settimanale-famiglia/">Menu settimanale</a>
  <a href="/lista-della-spesa-automatica/">Lista spesa</a>
  <a href="/calcolo-fabbisogno-calorico/">Calcolatori</a>
  <a href="/blog/">Guide</a>
  <a href="/per-nutrizionisti/">Nutrizionisti</a>
  <a class="cta" href="${APP}">Apri l’app</a>
</nav>`;

function layout({ title, description, slug, body, schema = [], type = 'website', datePublished }) {
  const canonical = url(slug);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Fitsy', legalName: 'AF&B S.r.l.s.', url: SITE, logo: `${SITE}/icon.svg`, email: 'info@fitsy.it', vatID: 'IT13698751008', address: { '@type': 'PostalAddress', streetAddress: 'Via Mario Ugo Guattari 48', postalCode: '00173', addressLocality: 'Roma', addressRegion: 'RM', addressCountry: 'IT' } },
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
<meta property="og:site_name" content="Fitsy">
<meta property="og:locale" content="it_IT">
<meta property="og:image" content="${SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
${datePublished ? `<meta property="article:published_time" content="${datePublished}">` : ''}
<meta name="theme-color" content="#15251C">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<header class="top"><div class="wrap">${LOGO}${NAV}</div></header>
<main class="wrap">
${body}
</main>
<footer class="foot"><div class="wrap">
  <div class="cols">
    <div><strong>Fitsy</strong><br>Nutrizione intelligente per la famiglia.<br><a href="${APP}">Apri l’app</a> · gratis, senza pubblicità.</div>
    <div><strong>Strumenti gratuiti</strong><br>
      <a href="/calcolo-fabbisogno-calorico/">Fabbisogno calorico</a><br>
      <a href="/peso-forma-calcolo/">Peso forma</a><br>
      <a href="/quanta-acqua-bere-al-giorno/">Acqua al giorno</a></div>
    <div><strong>Guide</strong><br>${ARTICOLI.map(a => `<a href="/${a.slug}/">${esc(a.title)}</a>`).join('<br>')}</div>
    <div><strong>Info</strong><br><a href="/per-nutrizionisti/">Per nutrizionisti</a><br><a href="/privacy/">Privacy policy</a><br><a href="/cookie/">Cookie policy</a><br><a href="${APP}privacy.html">Privacy dell’app</a><br><a href="mailto:info@fitsy.it">info@fitsy.it</a></div>
  </div>
  <div class="fine">Fitsy è un servizio di AF&amp;B S.r.l.s. · Via Mario Ugo Guattari 48, 00173 Roma (RM) · P.IVA 13698751008 · REA RM-1466364 · Capitale sociale € 2.700,00 i.v.<br>© ${new Date().getFullYear()} AF&amp;B S.r.l.s. · I calcolatori forniscono stime indicative e non sostituiscono il parere di un medico o di un nutrizionista.</div>
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

const ctaHtml = (testo = 'Prova Fitsy gratis') => `<div class="ctabox"><div><strong>${esc(testo)}</strong><br>Menu settimanale per tutta la famiglia, porzioni per ciascuno e lista della spesa automatica. Senza pubblicità, senza carta di credito.</div><a class="btn" href="${APP}">Apri l’app →</a></div>`;

function writePage(slug, html) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// ── Pagine principali ──
for (const p of PAGES) {
  const c = CONTENUTI[p.slug || 'home'];
  if (!c) throw new Error('Contenuto mancante per ' + (p.slug || 'home'));
  const schema = [...faqSchema(c.faq)];
  if (p.tipo === 'home') schema.push({
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Fitsy',
    applicationCategory: 'HealthApplication', operatingSystem: 'Web, Android, iOS',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    description: p.description, url: APP, inLanguage: 'it',
  });
  if (p.tipo === 'tool') schema.push({
    '@context': 'https://schema.org', '@type': 'WebApplication', name: p.title,
    applicationCategory: 'HealthApplication', operatingSystem: 'Web', browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, url: url(p.slug), inLanguage: 'it',
  });
  const body = `${c.body({ esc, APP, cta: ctaHtml, phone })}${faqHtml(c.faq)}${p.tipo === 'tool' ? `<script>${TOOLS_JS}</script>` : ''}`;
  writePage(p.slug, layout({ ...p, body, schema }));
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
    datePublished: a.data, dateModified: a.data, inLanguage: 'it',
    author: { '@type': 'Organization', name: 'Fitsy' }, publisher: { '@type': 'Organization', name: 'Fitsy' },
    mainEntityOfPage: url(a.slug),
  }];
  const body = `<article class="art"><p class="crumb"><a href="/blog/">Guide</a> · ${new Date(a.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>${html({ esc, APP, cta: ctaHtml, phone })}</article>`;
  writePage(a.slug, layout({ ...a, body, schema, type: 'article', datePublished: a.data }));
}
writePage('blog', layout({
  title: 'Guide Fitsy: organizzare i pasti della famiglia',
  description: 'Guide pratiche per organizzare il menu settimanale, le porzioni dei bambini e il piano alimentare di mantenimento.',
  slug: 'blog',
  body: `<h1>Guide per organizzare i pasti della famiglia</h1><p class="lead">Metodi concreti, senza mode. Ogni guida rimanda a uno strumento gratuito con cui provare subito.</p>
  <div class="cards">${ARTICOLI.map(a => `<a class="card" href="/${a.slug}/"><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p></a>`).join('')}</div>`,
}));

// ── File di servizio ──
const tutte = [...PAGES.map(p => ({ slug: p.slug, pri: p.tipo === 'home' ? '1.0' : '0.8', mod: '2026-11-03' })), { slug: 'blog', pri: '0.5', mod: '2026-11-03' }, ...Object.keys(LEGALI).map(slug => ({ slug, pri: '0.3', mod: '2026-11-03' })), ...ARTICOLI.map(a => ({ slug: a.slug, pri: '0.6', mod: a.data }))];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tutte.map(u => `  <url><loc>${url(u.slug)}</loc><lastmod>${u.mod}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /app/\nSitemap: ${SITE}/sitemap.xml\n`);
fs.copyFileSync(path.join(__dirname, 'src/htaccess-root'), path.join(OUT, '.htaccess'));
fs.copyFileSync(path.join(__dirname, 'src/icon.svg'), path.join(OUT, 'icon.svg'));
fs.copyFileSync(path.join(__dirname, 'src/og.png'), path.join(OUT, 'og.png'));

console.log(`[site] generate ${tutte.length} pagine in site/dist/`);
