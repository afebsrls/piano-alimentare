// Sostituisce il vecchio service worker dell'app: si attiva subito,
// svuota le cache, si disinstalla e ricarica le pagine aperte, che così
// arrivano alla pagina di trasloco (index.html) invece della vecchia app.
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll({ type: 'window' }); })
      .then(function(cs){ cs.forEach(function(c){ try { c.navigate(c.url.split('#')[0].replace(/[^/]*$/, '')); } catch(_){} }); })
  );
});
