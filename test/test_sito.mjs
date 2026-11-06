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

console.log(process.exitCode ? '✗ TEST SITO FALLITO' : '✓ TEST SITO OK');
