// Misura anonima delle conversioni sito → app.
// I link del sito portano #da=<pagina> (es. #da=alimenti/mozzarella). Il frammento (#)
// non arriva a Google, che così vede un solo indirizzo /app/ invece di uno per pagina.
// I vecchi link con ?da=<pagina> continuano a funzionare.
// Qui si registra solo il nome della pagina (il giorno lo mette il database):
// niente utente, niente cookie, niente localStorage. Poi il parametro viene
// tolto dall'indirizzo, così un ricaricamento non conta due volte.
import { supabase, cloudEnabled } from './cloud';

export function leggiDa(search, hash) {
  const q = new URLSearchParams(search || '');
  const h = new URLSearchParams(String(hash || '').replace(/^#/, ''));
  const da = h.get('da') || q.get('da');
  if (!da) return null;
  q.delete('da'); h.delete('da');
  const resto = q.toString(), restoH = h.toString().replace(/=$/, '').replace(/=&/g, '&');
  return { da, search: resto ? `?${resto}` : '', hash: restoH ? `#${restoH}` : '' };
}

export function registraArrivo() {
  try {
    const r = leggiDa(window.location.search, window.location.hash);
    if (!r) return;
    window.history.replaceState(window.history.state, '', window.location.pathname + r.search + r.hash);
    if (!cloudEnabled || !supabase || !/^[a-z0-9/_-]{1,120}$/.test(r.da)) return;
    supabase.from('arrivi').insert({ pagina: r.da }).then(() => {}, () => {});
  } catch { /* la misura non deve mai bloccare l'app */ }
}
