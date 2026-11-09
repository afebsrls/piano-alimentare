// Avvisa Bing e gli altri motori IndexNow (che alimentano anche Copilot e la ricerca
// di ChatGPT) delle pagine nuove o modificate. Gira nel deploy dopo l'upload.
// Uso: node site/indexnow.mjs            → solo URL con lastmod negli ultimi 3 giorni
//      INDEXNOW_TUTTE=1 node site/indexnow.mjs → tutte le URL delle sitemap (prima volta)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, INDEXNOW_KEY } from './src/keywords.mjs';

const DIST = path.join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const tutte = process.env.INDEXNOW_TUTTE === '1';
const limite = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
const urls = [];
for (const f of fs.readdirSync(DIST).filter(f => /^sitemap-.*\.xml$/.test(f))) {
  for (const m of fs.readFileSync(path.join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
    if (tutte || m[2] >= limite) urls.push(m[1]);
  }
}
if (!urls.length) { console.log('[indexnow] nessuna pagina modificata di recente'); process.exit(0); }
const host = new URL(SITE).host;
for (let i = 0; i < urls.length; i += 10000) {
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`[indexnow] inviate ${Math.min(10000, urls.length - i)} URL → HTTP ${r.status}`);
}
