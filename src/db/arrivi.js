// Misura anonima delle conversioni sito → app.
// I link del sito portano ?da=<pagina> (es. ?da=alimenti/mozzarella).
// Qui si registra solo il nome della pagina (il giorno lo mette il database):
// niente utente, niente cookie, niente localStorage. Poi il parametro viene
// tolto dall'indirizzo, così un ricaricamento non conta due volte.
import { supabase, cloudEnabled } from './cloud';

export function registraArrivo() {
  try {
    const q = new URLSearchParams(window.location.search);
    const da = q.get('da');
    if (!da) return;
    q.delete('da');
    const resto = q.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (resto ? `?${resto}` : '') + window.location.hash);
    if (!cloudEnabled || !supabase || !/^[a-z0-9/_-]{1,120}$/.test(da)) return;
    supabase.from('arrivi').insert({ pagina: da }).then(() => {}, () => {});
  } catch { /* la misura non deve mai bloccare l'app */ }
}
