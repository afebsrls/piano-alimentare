// ── Layer admin (plancia) ────────────────────────────────────────────
// Tutto passa da funzioni RPC `security definer` (supabase/s12_plancia_admin.sql)
// che controllano is_admin() lato server: il client non può vedere nulla
// che il server non gli conceda esplicitamente.

import { supabase } from './cloud';

let adminCache = { uid: null, value: false };

export async function isAdmin() {
  if (!supabase) return false;
  const { data: { session } = {} } = await supabase.auth.getSession();
  const uid = session?.user?.id || null;
  if (!uid) { adminCache = { uid: null, value: false }; return false; }
  if (adminCache.uid === uid) return adminCache.value;
  const { data, error } = await supabase.rpc('is_admin');
  const value = !error && data === true;
  adminCache = { uid, value };
  return value;
}
export const resetAdminCache = () => { adminCache = { uid: null, value: false }; };

async function rpc(name, params) {
  if (!supabase) throw new Error('Cloud non configurato');
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw new Error(error.message);
  return data;
}

export const adminStats   = () => rpc('admin_stats');
export const adminUtenti  = () => rpc('admin_utenti');
export const adminRicette = () => rpc('admin_ricette');
export const adminRicettaAzione = (id, azione) => rpc('admin_ricetta_azione', { p_id: id, p_azione: azione });
export const adminCopiaRicetta  = (id) => rpc('admin_copia_ricetta', { p_id: id });

export const adminFamiglie = () => rpc('admin_famiglie');
export const adminFamigliaDettaglio = (id) => rpc('admin_famiglia_dettaglio', { p_id: id });
export const adminDettaglioProfilo = (id) => rpc('dettaglio_profilo', { p_profilo_id: id });
export const adminNutrizionisti = () => rpc('admin_nutrizionisti');
export const adminNutrizionistaStato = (userId, stato) => rpc('admin_nutrizionista_stato', { p_user_id: userId, p_stato: stato });

export const adminListaAttesa = () => rpc('admin_lista_attesa');
export const adminArrivi = () => rpc('admin_arrivi');
export const adminListaAttesaStato = (id, stato) => rpc('admin_lista_attesa_stato', { p_id: id, p_stato: stato });

// Catalogo pubblico: per tutti gli utenti loggati (tab Catalogo).
export const catalogoPubblico = () => rpc('catalogo_pubblico');
