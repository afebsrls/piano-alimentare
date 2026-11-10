import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
for (const [slug, fill, expect] of [
  ['calcolo-fabbisogno-calorico', (d)=>{ d.querySelector('[name=eta]').value='40'; d.querySelector('[name=peso]').value='80'; d.querySelector('[name=altezza]').value='178'; d.querySelectorAll('.seg[data-k=gg] button')[3].click(); d.querySelector('[name=eta]').dispatchEvent(new d.defaultView.Event('input')); }, /27\d\d kcal/],
  ['peso-forma-calcolo', (d)=>{ d.querySelector('[name=altezza]').value='170'; d.querySelector('[name=polso]').value='17'; d.querySelector('[name=polso]').dispatchEvent(new d.defaultView.Event('input')); }, /kg/],
  ['quanta-acqua-bere-al-giorno', (d)=>{ d.querySelector('[name=peso]').value='65'; d.querySelectorAll('.seg[data-k=gg] button')[2].click(); d.querySelector('[name=peso]').dispatchEvent(new d.defaultView.Event('input')); }, /2,2 litri/],
  ['kit-di-emergenza', (d)=>{ d.querySelector('[name=A]').value='2'; d.querySelector('[name=B]').value='1'; d.querySelector('[name=Bp]').value='1'; d.querySelector('.genera').click(); }, /Acqua potabile[^<]*39 litri|39 litri/],
]) {
  const html = fs.readFileSync(`site/dist/${slug}/index.html`,'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', virtualConsole: new VirtualConsole() });
  const d = dom.window.document; fill(d);
  const txt = d.querySelector('.risultato').textContent;
  const ok = expect.test(txt); console.log('  ' + (ok?'✓':'✗') + ' ' + slug + ' → ' + txt.slice(0,60)); if (!ok) process.exitCode = 1;
}

// Kit: lista statica leggibile senza JS, precompilazione da link, zaino filtrato
{
  const raw = fs.readFileSync('site/dist/kit-di-emergenza/famiglia-4-persone/index.html','utf8');
  const ok1 = /Acqua potabile[\s\S]{0,80}48 litri/.test(raw.replace(/<script[\s\S]*?<\/script>/g,''));
  console.log('  ' + (ok1?'✓':'✗') + ' lista statica nell’HTML (48 litri per 4 persone)'); if (!ok1) process.exitCode = 1;
  const dom = new JSDOM(fs.readFileSync('site/dist/kit-di-emergenza/index.html','utf8'), { url: 'https://www.menudieta.it/kit-di-emergenza/?A=2&B=1&G=3', runScripts: 'dangerously', virtualConsole: new VirtualConsole() });
  const ok2 = /39 litri/.test(dom.window.document.querySelector('.risultato').textContent);
  console.log('  ' + (ok2?'✓':'✗') + ' precompilazione da link ?A=2&B=1 → 39 litri'); if (!ok2) process.exitCode = 1;
  const dz = new JSDOM(fs.readFileSync('site/dist/kit-di-emergenza/zaino-terremoto/index.html','utf8'), { runScripts: 'dangerously', virtualConsole: new VirtualConsole() });
  const tz = dz.window.document.querySelector('.risultato').textContent;
  const ok3 = /Torce frontali/.test(tz) && !/Sacchi a pelo|Lettiera|Scatolame/.test(tz);
  console.log('  ' + (ok3?'✓':'✗') + ' zaino: solo le voci da portare via'); if (!ok3) process.exitCode = 1;
}

// Porzioni per età: selettore interattivo, sezione nelle schede alimento, FAQ negli articoli
{
  const dp = new JSDOM(fs.readFileSync('site/dist/porzioni-bambini-per-eta/index.html','utf8'), { runScripts: 'dangerously', virtualConsole: new VirtualConsole() });
  const d = dp.window.document, s = d.getElementById('pz-eta');
  s.value = '2'; s.dispatchEvent(new dp.window.Event('change'));
  const pasta = d.querySelector('#pz-out tr[data-k=pasta]').cells[1].textContent;
  s.value = '5'; s.dispatchEvent(new dp.window.Event('change'));
  const adulti = d.querySelector('#pz-out tr[data-k=pasta]').cells[1].textContent;
  const ok1 = pasta === '70 g' && adulti === '80 g';
  console.log('  ' + (ok1?'✓':'✗') + ' porzioni per età: pasta 7–10 anni ' + pasta + ', adulti ' + adulti); if (!ok1) process.exitCode = 1;
  const mozz = fs.readFileSync('site/dist/alimenti/mozzarella/index.html','utf8');
  const ok2 = /Porzione di mozzarella per età/.test(mozz) && /Qual è la porzione di mozzarella per un bambino/.test(mozz);
  console.log('  ' + (ok2?'✓':'✗') + ' scheda alimento con porzione per età e FAQ bambini'); if (!ok2) process.exitCode = 1;
  const olioPalma = fs.readFileSync('site/dist/alimenti/olio-di-palma/index.html','utf8');
  const ok3 = !/per età<\/h2>/.test(olioPalma);
  console.log('  ' + (ok3?'✓':'✗') + ' nessuna porzione EVO attribuita all’olio di palma'); if (!ok3) process.exitCode = 1;
  const art = fs.readFileSync('site/dist/blog/lista-della-spesa-settimanale/index.html','utf8');
  const ok4 = /"FAQPage"/.test(art) && /Redazione MenuDieta/.test(art);
  console.log('  ' + (ok4?'✓':'✗') + ' articolo lista spesa con FAQ strutturate e autore'); if (!ok4) process.exitCode = 1;
}

// GEO e conversioni: llms.txt, robots per i motori AI, IndexNow, link all'app tracciati, title entro 65 caratteri
{
  const ok1 = /^# MenuDieta/.test(fs.readFileSync('site/dist/llms.txt','utf8'));
  const rob = fs.readFileSync('site/dist/robots.txt','utf8');
  const ok2 = /User-agent: GPTBot/.test(rob) && /User-agent: ClaudeBot/.test(rob) && /Disallow: \/app\//.test(rob);
  const chiave = fs.readdirSync('site/dist').find(f => /^[0-9a-f]{32}\.txt$/.test(f));
  const ok3 = !!chiave && fs.readFileSync('site/dist/' + chiave, 'utf8') === chiave.replace('.txt', '');
  const moz = fs.readFileSync('site/dist/alimenti/mozzarella/index.html','utf8');
  const ok4 = /app\/#da=alimenti\/mozzarella"/.test(moz) && /app\/privacy\.html"/.test(moz) && !/app\/\?da=/.test(moz);
  const kit = fs.readFileSync('site/dist/kit-di-emergenza/index.html','utf8');
  const ok5 = !/href="https:\/\/www\.menudieta\.it\/app\/\?kit=1"/.test(kit);
  const t = (moz.match(/<title>([^<]*)/) || [])[1] || '';
  const ok6 = t.length <= 65;
  for (const [ok, m] of [[ok1, 'llms.txt presente'], [ok2, 'robots.txt accoglie i motori AI e tiene fuori /app/'], [ok3, 'file chiave IndexNow'], [ok4, 'link all\u2019app con #da=pagina, un solo URL per Google (privacy esclusa)'], [ok5, 'link kit con parametri: da aggiunto in coda'], [ok6, 'title entro 65 caratteri']]) { console.log('  ' + (ok ? '✓' : '✗') + ' ' + m); if (!ok) process.exitCode = 1; }
}

// Ricette: campo "image" nei dati strutturati (errore critico in Search Console) e file presenti
{
  const dir = 'site/dist/ricette';
  const slugs = fs.readdirSync(dir).filter(f => fs.existsSync(`${dir}/${f}/index.html`));
  let senza = [], mancanti = [], senzaPassi = [];
  for (const s of slugs) {
    const html = fs.readFileSync(`${dir}/${s}/index.html`, 'utf8');
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1]));
    const rec = ld.find(x => x['@type'] === 'Recipe');
    if (!rec) continue;
    if (!Array.isArray(rec.image) || rec.image.length !== 3) senza.push(s);
    if (!Array.isArray(rec.recipeInstructions) || !rec.recipeInstructions.length || !/<h2>Come si prepara<\/h2>/.test(html)) senzaPassi.push(s);
    for (const u of rec.image || []) if (!fs.existsSync('site/dist' + u.replace('https://www.menudieta.it', ''))) mancanti.push(u);
  }
  const ok1 = slugs.length > 100 && !senza.length, ok2 = !mancanti.length;
  console.log('  ' + (ok1 ? '✓' : '✗') + ` Recipe con image (3 formati) in ${slugs.length} pagine` + (senza.length ? ' — senza: ' + senza.slice(0, 3) : '')); if (!ok1) process.exitCode = 1;
  console.log('  ' + (ok2 ? '✓' : '✗') + ' file immagine delle ricette presenti' + (mancanti.length ? ' — mancano: ' + mancanti.slice(0, 3) : '')); if (!ok2) process.exitCode = 1;
  const ok3 = !senzaPassi.length;
  console.log('  ' + (ok3 ? '✓' : '✗') + ' Recipe con recipeInstructions e sezione "Come si prepara"' + (senzaPassi.length ? ' — senza: ' + senzaPassi.length + ' (' + senzaPassi.slice(0, 3) + ')' : '')); if (!ok3) process.exitCode = 1;
}

// Menù dieta: pagina, infografica, nel menu di navigazione e nella sitemap
{
  const html = fs.readFileSync('site/dist/menu-dieta/index.html', 'utf8');
  const t = (html.match(/<title>([^<]*)/) || [])[1] || '';
  const giorni = (html.match(/<section class="giorno">/g) || []).length;
  const ok1 = /^Menù dieta settimanale/.test(t) && t.length <= 65 && /<h1>Menù dieta settimanale/.test(html) && giorni === 7;
  const ok2 = fs.existsSync('site/dist/menu-dieta/menu-dieta-settimanale.webp') && fs.existsSync('site/dist/menu-dieta/menu-dieta-og.jpg') && /"Article"/.test(html) && /"FAQPage"/.test(html);
  const ok3 = /href="\/menu-dieta\/">Menù dieta<\/a>/.test(fs.readFileSync('site/dist/index.html', 'utf8')) && /menu-dieta\/<\/loc>/.test(fs.readFileSync('site/dist/sitemap-pagine.xml', 'utf8'));
  const kcal = [...html.matchAll(/<h3>[^<]+ <span>([\d.]+) kcal/g)].map(m => +m[1].replace('.', ''));
  const ok4 = kcal.length === 7 && kcal.every(k => k >= 1350 && k <= 1700);
  for (const [ok, m] of [[ok1, 'menù dieta: title, H1 e 7 giorni'], [ok2, 'menù dieta: infografica, anteprima social, Article e FAQ'], [ok3, 'menù dieta nel menu del sito e nella sitemap'], [ok4, 'menù dieta: ogni giorno tra 1350 e 1700 kcal (' + kcal.join(', ') + ')']]) { console.log('  ' + (ok ? '✓' : '✗') + ' ' + m); if (!ok) process.exitCode = 1; }
}

// Menù dieta per stile: pagina, 7 giorni, pulsante "imposta nell'app", infografica, collegamenti dal centro
{
  const stili = [['menu-dieta-mediterranea', 'mediterranea'], ['menu-dieta-low-carb', 'lowcarb'], ['menu-dieta-proteica', 'proteica'], ['menu-dieta-vegetariana', 'vegetariana']];
  const centro = fs.readFileSync('site/dist/menu-dieta/index.html', 'utf8');
  const sitemap = fs.readFileSync('site/dist/sitemap-pagine.xml', 'utf8');
  for (const [slug, id] of stili) {
    const html = fs.readFileSync(`site/dist/${slug}/index.html`, 'utf8');
    const t = (html.match(/<title>([^<]*)/) || [])[1] || '';
    const ok = t.length <= 65 && /<h1>Menù/.test(html) && (html.match(/<section class="giorno">/g) || []).length === 7
      && html.includes(`/app/?menu=${id}#da=${slug}"`) && fs.existsSync(`site/dist/${slug}/${slug}-settimanale.webp`) && fs.existsSync(`site/dist/${slug}/${slug}-og.jpg`)
      && centro.includes(`href="/${slug}/"`) && sitemap.includes(`/${slug}/</loc>`) && /"Article"/.test(html) && /"FAQPage"/.test(html);
    console.log('  ' + (ok ? '✓' : '✗') + ` ${slug}: title, 7 giorni, link all’app con ?menu=${id}, infografica, sitemap, link dal centro`); if (!ok) process.exitCode = 1;
  }
}

// Fiducia e citabilità (E-E-A-T, AEO, GEO): fonti ufficiali con link, firma, riquadro "In breve", fatti in llms.txt
{
  const menu = ['menu-dieta', 'menu-dieta-mediterranea', 'menu-dieta-low-carb', 'menu-dieta-proteica', 'menu-dieta-vegetariana'].map(s => fs.readFileSync(`site/dist/${s}/index.html`, 'utf8'));
  const ok1 = menu.every(h => /class="firma"/.test(h) && /class="inbreve"/.test(h) && /<h2>Fonti<\/h2>/.test(h) && h.includes('https://sinu.it/larn/') && h.includes('crea.gov.it') && /"citation":\[/.test(h));
  const moz = fs.readFileSync('site/dist/alimenti/mozzarella/index.html', 'utf8');
  const ok2 = moz.includes('alimentinutrizione.it') && /Tabelle di composizione degli alimenti<\/a> del CREA/.test(moz);
  const ric = fs.readFileSync('site/dist/ricette/pasta-e-ceci/index.html', 'utf8');
  const ok3 = /class="menu-adatti"/.test(ric) && ric.includes('href="/menu-dieta-vegetariana/"') && ric.includes('VegetarianDiet') && /"totalTime"/.test(ric);
  const llms = fs.readFileSync('site/dist/llms.txt', 'utf8');
  const ok4 = /Menù low carb di esempio/.test(llms) && /Fonti dei calcoli/.test(llms);
  const home = fs.readFileSync('site/dist/index.html', 'utf8');
  const ok5 = /<title>[^<]*menù dieta[^<]*<\/title>/.test(home) && /<h1>[^<]*menù dieta/.test(home) && !/content="[^"]*…"/.test(home.match(/<meta name="description"[^>]*>/)[0]);
  const senzaTempo = fs.readdirSync('site/dist/ricette').filter(s => fs.existsSync(`site/dist/ricette/${s}/index.html`) && /"@type":"Recipe"/.test(fs.readFileSync(`site/dist/ricette/${s}/index.html`, 'utf8')) && !/"totalTime"/.test(fs.readFileSync(`site/dist/ricette/${s}/index.html`, 'utf8')));
  for (const [ok, m] of [[ok1, 'pagine menù: firma, "In breve", fonti ufficiali con link e citation nello schema'], [ok2, 'alimenti: fonte CREA con link'], [ok3, 'ricette: menù adatti con link, VegetarianDiet, tempo'], [ok4, 'llms.txt: fatti sui menù e fonti'], [ok5, 'home: "menù dieta" in title e H1, description non troncata'], [senzaTempo.length === 0, `tutte le ricette hanno il tempo di preparazione (senza: ${senzaTempo.length})`]]) { console.log('  ' + (ok ? '✓' : '✗') + ' ' + m); if (!ok) process.exitCode = 1; }
}

// Menù dieta per calorie: ogni giorno vicino all'obiettivo, grammi degli ingredienti, collegamenti
{
  const centro = fs.readFileSync('site/dist/menu-dieta/index.html', 'utf8');
  const sitemap = fs.readFileSync('site/dist/sitemap-pagine.xml', 'utf8');
  for (const k of [1200, 1400, 1500, 1600, 1800, 2000]) {
    const slug = `menu-dieta-${k}-calorie`, html = fs.readFileSync(`site/dist/${slug}/index.html`, 'utf8');
    const t = (html.match(/<title>([^<]*)/) || [])[1] || '';
    const kcal = [...html.matchAll(/<section class="giorno"><h3>[^<]+ <span>([\d.]+) kcal/g)].map(m => +m[1].replace('.', ''));
    const ok = t.length <= 65 && kcal.length === 7 && kcal.every(x => Math.abs(x - k) <= k * 0.07) && (html.match(/class="ingr"/g) || []).length === 35
      && fs.existsSync(`site/dist/${slug}/${slug}.webp`) && fs.existsSync(`site/dist/${slug}/${slug}-og.jpg`) && centro.includes(`href="/${slug}/"`) && sitemap.includes(`/${slug}/</loc>`)
      && /class="inbreve"/.test(html) && /<h2>Fonti<\/h2>/.test(html) && /"Article"/.test(html) && /"FAQPage"/.test(html);
    console.log('  ' + (ok ? '✓' : '✗') + ` ${slug}: 7 giorni entro il 7% da ${k} kcal (${kcal.join(', ')}), grammi, infografica, fonti, link dal centro`); if (!ok) process.exitCode = 1;
  }
}

console.log(process.exitCode ? '✗ TEST SITO FALLITO' : '✓ TEST SITO OK');
