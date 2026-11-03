/* Calcolatori MenuDieta — stesse formule del motore dell'app (src/core/engine.js) */
(function () {
  var num = function (v) { var n = parseFloat(String(v || '').replace(',', '.')); return isFinite(n) ? n : 0; };
  var MB = { F: [[29, 14.7, 496], [59, 8.7, 829], [74, 9.2, 688], [999, 9.8, 624]], M: [[29, 15.3, 679], [59, 11.6, 879], [74, 11.9, 700], [999, 8.4, 819]] };
  var LAF = {
    F: { adulto: { leggero: [1.56, 1.42], moderato: [1.64, 1.56], pesante: [1.82, 1.73] }, e60: [1.56, 1.44], e75: [1.56, 1.37] },
    M: { adulto: { leggero: [1.55, 1.41], moderato: [1.78, 1.70], pesante: [2.10, 2.01] }, e60: [1.51, 1.40], e75: [1.51, 1.33] }
  };
  var LAV = { sedentario: 'leggero', attivo: 'moderato', sportivo: 'pesante' };

  function mbLARN(s, eta, kg) { var t = MB[s]; for (var i = 0; i < t.length; i++) if (eta <= t[i][0]) return t[i][1] * kg + t[i][2]; return 0; }
  function mifflin(s, eta, kg, cm) { return 10 * kg + 6.25 * cm - 5 * eta + (s === 'M' ? 5 : -161); }
  function laf(s, eta, lavoro, gg) {
    var S = LAF[s], r = eta >= 75 ? S.e75 : eta >= 60 ? S.e60 : S.adulto[LAV[lavoro] || 'moderato'];
    gg = Math.max(0, Math.min(7, gg)); var f = Math.min(gg, 4) / 4, extra = Math.max(0, gg - 4) * 0.02;
    return Math.round((r[1] + f * (r[0] - r[1]) + extra) * 1000) / 1000;
  }

  // segmented buttons
  document.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); seg.dataset.value = b.dataset.v; calcola(seg.closest('.tool'));
    });
  });
  document.querySelectorAll('.tool input, .tool select').forEach(function (i) { i.addEventListener('input', function () { calcola(i.closest('.tool')); }); });

  function val(t, sel) { var el = t.querySelector(sel); return el ? (el.dataset.value || el.value) : ''; }
  function calcola(t) {
    if (!t) return; var out = t.querySelector('.risultato'); var tipo = t.dataset.tool;
    if (tipo === 'calorie') {
      var s = val(t, '.seg[data-k=sesso]') || 'M', eta = num(val(t, '[name=eta]')), kg = num(val(t, '[name=peso]')), cm = num(val(t, '[name=altezza]'));
      var lav = val(t, '.seg[data-k=lavoro]') || 'sedentario', gg = num(val(t, '.seg[data-k=gg]') || 0);
      if (!(eta > 0 && kg > 0)) { out.classList.remove('on'); return; }
      var minore = eta < 18, mb = minore ? mifflin(s, eta, kg, cm || 165) : mbLARN(s, eta, kg), l = laf(s, Math.max(eta, 18), lav, gg), tot = Math.round(mb * l);
      out.innerHTML = '<div class="big">' + tot + ' <small>kcal al giorno</small></div>' +
        '<div class="dett">Metabolismo basale ' + Math.round(mb) + ' kcal (' + (minore ? 'Mifflin-St Jeor, sotto i 18 anni' : 'tabella LARN/SINU') + ') × livello di attività ' + l.toFixed(2) + '.<br>' +
        'Per dimagrire con calma: circa ' + Math.round(tot - 400) + ' kcal. Per aumentare massa: circa ' + Math.round(tot + 300) + ' kcal.<br>' +
        'Ripartizione di riferimento: proteine ' + Math.round(kg * 1.4) + ' g · carboidrati ' + Math.round(tot * 0.5 / 4) + ' g · grassi ' + Math.round(tot * 0.28 / 9) + ' g.</div>';
      out.classList.add('on');
    }
    if (tipo === 'pesoforma') {
      var s2 = val(t, '.seg[data-k=sesso]') || 'M', h = num(val(t, '[name=altezza]')), polso = num(val(t, '[name=polso]'));
      if (!(h > 0)) { out.classList.remove('on'); return; }
      var base = 22 * Math.pow(h / 100, 2), tipoC = 'normale', corr = 0, idx = null;
      if (polso > 0) { idx = h / polso; var sg = s2 === 'F' ? [9.9, 10.9] : [9.6, 10.4]; tipoC = idx > sg[1] ? 'esile' : idx < sg[0] ? 'robusta' : 'normale'; corr = { esile: -0.075, normale: 0, robusta: 0.075 }[tipoC]; }
      var c = base * (1 + corr), lo = Math.round(c * 0.96 * 10) / 10, hi = Math.round(c * 1.04 * 10) / 10;
      out.innerHTML = '<div class="big">' + lo.toLocaleString('it-IT') + '–' + hi.toLocaleString('it-IT') + ' <small>kg</small></div>' +
        '<div class="dett">' + (polso > 0 ? 'Costituzione <b>' + tipoC + '</b> (indice di Grant ' + (Math.round(idx * 100) / 100).toLocaleString('it-IT') + '). ' : 'Inserisci la circonferenza del polso per correggere in base alla costituzione. ') +
        'Riferimento: BMI 22 ± 4%' + (corr ? ', ' + (corr > 0 ? '+' : '−') + '7,5% per la costituzione' : '') + '. Intervallo sano di BMI: ' + Math.round(18.5 * Math.pow(h / 100, 2)) + '–' + Math.round(24.9 * Math.pow(h / 100, 2)) + ' kg.</div>';
      out.classList.add('on');
    }
    if (tipo === 'acqua') {
      var kg3 = num(val(t, '[name=peso]')), gg3 = num(val(t, '.seg[data-k=gg]') || 0);
      if (!(kg3 > 0)) { out.classList.remove('on'); return; }
      var ml = Math.round((kg3 * 32 + (gg3 * 500) / 7) / 50) * 50, bic = Math.round(ml / 240);
      out.innerHTML = '<div class="big">' + (ml / 1000).toLocaleString('it-IT', { maximumFractionDigits: 2 }) + ' <small>litri al giorno</small></div>' +
        '<div class="dett">Circa <b>' + bic + ' bicchieri</b> da 240 ml. Stima: 32 ml per kg + quota allenamenti. Aumenta con caldo intenso, febbre o sudorazione abbondante; frutta e verdura contribuiscono.</div>';
      out.classList.add('on');
    }
  }
  document.querySelectorAll('.tool').forEach(calcola);
})();
