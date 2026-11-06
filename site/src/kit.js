/* Pagina /kit-di-emergenza/: usa calcolaKit/kitTesto definite sopra (inlinate da build.mjs) */
var t = document.querySelector('.tool[data-tool=kit]'); if (!t) return;
var out = t.querySelector('.risultato'), fmt = function (n) { return Number(n).toLocaleString('it-IT'); };
var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
var sez = [], par = null, zaino = t.dataset.zaino ? t.dataset.zaino.split(',') : null;
// precompila da ?A=2&B=1&G=3… (link condivisi e pagine pronte)
try { var qs = new URLSearchParams(location.search); ['A','B','Bp','P','F','T','S','AUT'].forEach(function (k) { var el = t.querySelector('[name=' + k + ']'); if (el && qs.get(k) != null) el.value = qs.get(k); });
  if (qs.get('G')) { var sg = t.querySelector('.seg[data-k=G]'); sg.dataset.value = qs.get('G'); sg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === qs.get('G')); }); } } catch (e) {}
function leggi() {
  var v = function (n) { var el = t.querySelector('[name=' + n + ']'); return el ? parseFloat(el.value) || 0 : 0; };
  return { A: v('A'), B: v('B'), G: parseFloat(t.querySelector('.seg[data-k=G]').dataset.value) || 3, Bp: v('Bp'), P: v('P') || 6, F: v('F'), T: v('T'), S: v('S'), AUT: v('AUT') || 20 };
}
function render() {
  par = leggi(); sez = calcolaKit(par);
  if (zaino) sez = sez.map(function (s) { return Object.assign({}, s, { items: s.items.filter(function (x) { return zaino.indexOf(x.id) >= 0; }) }); }).filter(function (s) { return s.items.length; });
  var n = par.A + par.B;
  out.innerHTML = '<div class="big">' + n + ' <small>person' + (n === 1 ? 'a' : 'e') + ' · ' + par.G + ' giorni</small></div><div class="dett">Spunta quello che hai già in casa. Le quantità sono indicative per una famiglia media.</div>' +
    sez.map(function (s) { return '<h3>' + s.icona + ' ' + esc(s.titolo) + '</h3><ul>' + s.items.map(function (x) { return '<li><input type="checkbox" aria-label="' + esc(x.nome) + '"><div><b>' + esc(x.nome) + '</b>' + (x.fisso ? '' : ' · <span style="color:var(--verde)">' + fmt(x.qta) + ' ' + esc(x.unita) + '</span>') + (x.nota ? '<span class="nota">' + esc(x.nota) + '</span>' : '') + '</div></li>'; }).join('') + '</ul>'; }).join('') +
    '<div class="azioni"><button type="button" data-az="copia">📋 Copia la lista</button><button type="button" data-az="whatsapp">💬 Manda su WhatsApp</button><button type="button" data-az="stampa">🖨️ Stampa o salva in PDF</button></div>';
  out.classList.add('on');
}
t.querySelector('.genera').addEventListener('click', function () { render(); out.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
t.querySelector('.seg[data-k=G]').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; this.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); this.dataset.value = b.dataset.v; });
out.addEventListener('change', function (e) { if (e.target.type === 'checkbox') e.target.closest('li').classList.toggle('ok', e.target.checked); });
out.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-az]'); if (!b) return;
  if (b.dataset.az === 'stampa') { window.print(); return; }
  var txt = kitTesto(sez, par);
  if (b.dataset.az === 'whatsapp') { window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank'); return; }
  if (navigator.share) { navigator.share({ title: 'Kit di emergenza', text: txt }).catch(function () {}); return; }
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { b.textContent = '✓ Copiata'; });
});

// allinea la lista statica ai dati (eventualmente presi dal link)
render();
