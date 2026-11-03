/* Lista d'attesa: inserisce in Supabase (tabella lista_attesa, solo insert) */
(function () {
  var URL = '__SB_URL__', KEY = '__SB_KEY__';
  document.querySelectorAll('form.waitlist').forEach(function (f) {
    f.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type=submit]'), msg = f.querySelector('.wl-msg');
      var d = Object.fromEntries(new FormData(f).entries());
      if (d.website) return; // honeypot anti-spam
      if (!f.querySelector('[name=consenso]').checked) { msg.textContent = 'Serve il consenso per essere ricontattati.'; return; }
      btn.disabled = true; msg.textContent = 'Invio…';
      try {
        var r = await fetch(URL + '/rest/v1/lista_attesa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ tipo: d.tipo || 'nutrizionista', nome: d.nome.trim(), email: d.email.trim(), citta: (d.citta || '').trim() || null, note: (d.note || '').trim() || null, origine: location.pathname })
        });
        if (r.status === 409) { f.innerHTML = '<p class="wl-ok">✅ Sei già in lista con questa email: ti scriviamo noi.</p>'; return; }
        if (!r.ok) throw new Error('HTTP ' + r.status);
        f.innerHTML = '<p class="wl-ok">✅ Grazie, sei in lista. Ti scriviamo noi, a breve, all’indirizzo indicato.</p>';
      } catch (err) {
        btn.disabled = false; msg.textContent = 'Non sono riuscito a inviare. Scrivici a info@fitsy.it.';
      }
    });
  });
})();
