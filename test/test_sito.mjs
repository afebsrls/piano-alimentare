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

console.log(process.exitCode ? '✗ TEST SITO FALLITO' : '✓ TEST SITO OK');
