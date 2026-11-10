import React from 'react';
const { useState, useEffect } = React;
import { STILI_MENU, STILE_BY_ID } from '@/core';

// Menù dieta impostabile con un tocco (mediterranea, low carb, proteica, vegetariana).
// Lo stile filtra le ricette da cui pesca il generatore: porzioni per persona,
// stagionalità ed esclusioni restano quelle di sempre.
// Scegliere un menù rigenera il piano da oggi in avanti (come "Genera nuovo piano"):
// i giorni passati e i pasti già mangiati oggi non cambiano.

const VERDE = '#2F6B3A', INK = '#15251C', LIME = '#C7F23E', BORDO = '#CBE0B4';
const LIBERO = { id: null, nome: 'Libero', emoji: '🍽️', breve: 'Tutte le ricette, a rotazione: il menù equilibrato di sempre.' };

export function MenuDietaBottone({ stile, onApri, disabled }) {
  const s = STILE_BY_ID[stile] || LIBERO;
  return (
    <button onClick={onApri} disabled={disabled} aria-label="Scegli il menù dieta"
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: stile ? '#F3FBE3' : '#fff', border: `1.5px solid ${stile ? VERDE : BORDO}`, borderRadius: 12, padding: '10px 12px', marginBottom: 8, cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left' }}>
      <span style={{ fontSize: 20 }}>{s.emoji}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 10.5, fontWeight: 800, color: '#6E8576', textTransform: 'uppercase', letterSpacing: 0.4 }}>Menù dieta</span>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: INK }}>{s.nome}</span>
      </span>
      <span style={{ fontSize: 12, fontWeight: 800, color: VERDE }}>Cambia ›</span>
    </button>
  );
}

// Foglio di scelta. preselezione: stile arrivato da un link del sito (chiede conferma).
export function MenuDietaFoglio({ aperto, stileAttuale, preselezione, onScegli, onChiudi, ciSonoMinori }) {
  const [scelto, setScelto] = useState(preselezione ?? undefined);
  useEffect(() => { if (aperto) setScelto(preselezione ?? undefined); }, [aperto, preselezione]);
  if (!aperto) return null;
  const opzioni = [LIBERO, ...STILI_MENU];
  const daConfermare = scelto !== undefined && (scelto || null) !== (stileAttuale || null);
  const nomeScelto = (STILE_BY_ID[scelto] || LIBERO).nome;
  return (
    <div role="dialog" aria-modal="true" aria-label="Scegli il menù dieta" onClick={onChiudi}
      style={{ position: 'fixed', inset: 0, background: 'rgba(21,37,28,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto', borderRadius: '20px 20px 0 0', padding: '18px 16px calc(18px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: INK, flex: 1 }}>Scegli il menù dieta</h2>
          <button onClick={onChiudi} aria-label="Chiudi" style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#6E8576' }}>×</button>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#6E8576', lineHeight: 1.45 }}>
          Vale per tutta la famiglia: le porzioni restano calcolate per ciascuno. Il piano cambia da oggi in avanti; i giorni passati e i pasti già mangiati restano.
        </p>
        {opzioni.map(o => {
          const sel = (scelto === undefined ? (stileAttuale || null) : (scelto || null)) === (o.id || null);
          const attuale = (stileAttuale || null) === (o.id || null);
          return (
            <button key={o.id || 'libero'} onClick={() => setScelto(o.id)}
              style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', background: sel ? '#F3FBE3' : '#fff', border: `1.5px solid ${sel ? VERDE : '#E7EDE2'}`, borderRadius: 14, padding: '12px', marginBottom: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 24, lineHeight: 1 }}>{o.emoji}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 15, color: INK }}>
                  {o.nome}{attuale && <span style={{ fontSize: 9.5, background: INK, color: LIME, borderRadius: 6, padding: '2px 6px', fontWeight: 900 }}>ATTUALE</span>}
                </span>
                <span style={{ display: 'block', fontSize: 12.5, color: '#4B5F52', marginTop: 3, lineHeight: 1.4 }}>{o.breve}</span>
              </span>
            </button>
          );
        })}
        {ciSonoMinori && (scelto === 'lowcarb' || scelto === 'proteica') && (
          <p role="note" style={{ margin: '4px 0 8px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '9px 11px', fontSize: 12.5, color: '#92400e', lineHeight: 1.45 }}>
            ⚠️ In famiglia ci sono bambini o ragazzi: questo menù non è pensato per chi è in crescita. Ai loro piatti aggiungi pane, pasta, riso o frutta, oppure chiedi al pediatra.
          </p>
        )}
        <button disabled={!daConfermare} onClick={() => onScegli(scelto || null)}
          style={{ width: '100%', marginTop: 6, background: daConfermare ? LIME : '#EEF2EA', color: INK, border: 'none', borderRadius: 12, padding: '14px', fontWeight: 900, fontSize: 15, cursor: daConfermare ? 'pointer' : 'default' }}>
          {daConfermare ? `Imposta il menù ${nomeScelto}` : 'Scegli un menù'}
        </button>
      </div>
    </div>
  );
}
