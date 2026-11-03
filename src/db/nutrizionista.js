// ── Layer nutrizionista / paziente ──────────────────────────────────
// RPC `security definer` (supabase/s13_nutrizionisti.sql). Messaggi via
// tabella `messaggi` con RLS + realtime.
import { supabase } from './cloud';

async function rpc(name, params) {
  if (!supabase) throw new Error('Cloud non configurato');
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw new Error(error.message);
  return data;
}

// ruolo
export const isNutrizionista = async () => { try { const r = await rpc('is_nutrizionista'); return r || null; } catch { return null; } };
export const registraNutrizionista = (nome, studio, citta) => rpc('nutrizionista_registra', { p_nome: nome, p_studio: studio || null, p_citta: citta || null });

// paziente
export const mioNutrizionista = async () => { try { return (await rpc('paziente_mio_nutrizionista')) || null; } catch { return null; } };
export const collegaNutrizionista = (codice) => rpc('paziente_collega', { p_codice: codice });
export const scollegaNutrizionista = () => rpc('paziente_scollega');

// nutrizionista
export const pazienti = () => rpc('nutrizionista_pazienti');
export const dettaglioProfilo = (profiloId) => rpc('dettaglio_profilo', { p_profilo_id: profiloId });
export const impostaTarget = (pazienteId, target) => rpc('nutrizionista_imposta_target', { p_paziente_id: pazienteId, p_target: target });

// messaggi (conversazione nutrizionista ↔ paziente)
export async function caricaMessaggi(nutrizionistaId, pazienteId) {
  const { data, error } = await supabase.from('messaggi').select('*')
    .eq('nutrizionista_id', nutrizionistaId).eq('paziente_id', pazienteId).order('created_at', { ascending: true }).limit(500);
  if (error) throw new Error(error.message);
  return data || [];
}
export async function inviaMessaggio(nutrizionistaId, pazienteId, testo) {
  const { data: { session } = {} } = await supabase.auth.getSession();
  const { error } = await supabase.from('messaggi').insert({ nutrizionista_id: nutrizionistaId, paziente_id: pazienteId, mittente: session.user.id, testo: testo.trim() });
  if (error) throw new Error(error.message);
}
export async function segnaLetti(nutrizionistaId, pazienteId) {
  const { data: { session } = {} } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from('messaggi').update({ letto: true })
    .eq('nutrizionista_id', nutrizionistaId).eq('paziente_id', pazienteId).neq('mittente', session.user.id).eq('letto', false);
}
export function onNuoviMessaggi(nutrizionistaId, pazienteId, cb) {
  if (!supabase) return () => {};
  const ch = supabase.channel(`msg-${nutrizionistaId}-${pazienteId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaggi', filter: `paziente_id=eq.${pazienteId}` }, (p) => { if (p.new?.nutrizionista_id === nutrizionistaId) cb(p.new); })
    .subscribe();
  return () => { try { supabase.removeChannel(ch); } catch {} };
}
