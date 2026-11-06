/* Pagina /kit-di-emergenza/: usa calcolaKit/kitTesto definite sopra (inlinate da build.mjs) */
var t = document.querySelector('.tool[data-tool=kit]'); if (!t) return;
var out = t.querySelector('.risultato'), fmt = function (n) { return Number(n).toLocaleString('it-IT'); };
var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
var sez = [], par = null;
function leggi() {
  var v = function (n) { var el = t.querySelector('[name=' + n + ']'); return el ? parseFloat(el.value) || 0 : 0; };
  return { A: v('A'), B: v('B'), G: parseFloat(t.querySelector('.seg[data-k=G]').dataset.value) || 3, Bp: v('Bp'), P: v('P') || 6, F: v('F'), T: v('T'), S: v('S'), AUT: v('AUT') || 20 };
}
function render() {
  par = leggi(); sez = calcolaKit(par);
  var n = par.A + par.B;
  out.innerHTML = '<div class="big">' + n + ' <small>person' + (n === 1 ? 'a' : 'e') + ' · ' + par.G + ' giorni</small></div><div class="dett">Spunta quello che hai già in casa. Le quantità sono indicative per una famiglia media.</div>' +
    sez.map(function (s) { return '<h3>' + s.icona + ' ' + esc(s.titolo) + '</h3><ul>' + s.items.map(function (x) { return '<li><input type="checkbox" aria-label="' + esc(x.nome) + '"><div><b>' + esc(x.nome) + '</b>' + (x.fisso ? '' : ' · <span style="color:var(--verde)">' + fmt(x.qta) + ' ' + esc(x.unita) + '</span>') + (x.nota ? '<span class="nota">' + esc(x.nota) + '</span>' : '') + '</div></li>'; }).join('') + '</ul>'; }).join('') +
    '<div class="azioni"><button type="button" data-az="copia">📋 Copia la lista</button><button type="button" data-az="stampa">🖨️ Stampa</button></div>';
  out.classList.add('on');
}
t.querySelector('.genera').addEventListener('click', function () { render(); out.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
t.querySelector('.seg[data-k=G]').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; this.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); this.dataset.value = b.dataset.v; });
out.addEventListener('change', function (e) { if (e.target.type === 'checkbox') e.target.closest('li').classList.toggle('ok', e.target.checked); });
out.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-az]'); if (!b) return;
  if (b.dataset.az === 'stampa') { window.print(); return; }
  var txt = kitTesto(sez, par);
  if (navigator.share) { navigator.share({ title: 'Kit di emergenza', text: txt }).catch(function () {}); return; }
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { b.textContent = '✓ Copiata'; });
});
