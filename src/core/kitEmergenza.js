// ── Kit di emergenza ───────────────────────────────────────────────
// Formule per la lista di prime necessità di una famiglia per G giorni
// senza acqua, luce né negozi. Unica fonte: usata dall'app (Menu → Kit
// di emergenza) e dal sito (/kit-di-emergenza/, inlinata da build.mjs).
// Nessun import: deve girare anche come script semplice nel browser.

export const KIT_DEFAULT = {
  A: 2,      // adulti
  B: 0,      // bambini (< 14 anni)
  G: 3,      // giorni di autonomia
  Bp: 0,     // bambini con il pannolino
  P: 6,      // pannolini al giorno per bambino (10 neonato, 6 1–2 anni, 4 più grande)
  F: 1,      // donne in età fertile
  T: 2,      // smartphone
  S: 2,      // stanze usate di notte
  AUT: 20,   // ore di autonomia di un set di batterie (dalla confezione)
};

export const PANNOLINI_GIORNO = [
  { v: 10, label: 'Neonato (10 al giorno)' },
  { v: 6, label: '1–2 anni (6 al giorno)' },
  { v: 4, label: 'Più grande (4 al giorno)' },
];

const ceil = Math.ceil;

// Valori di partenza dai profili della famiglia (eta, sesso).
export function kitDaFamiglia(personas) {
  const list = Array.isArray(personas) ? personas : [];
  if (!list.length) return { ...KIT_DEFAULT };
  const eta = (p) => Number(p.eta) || 0;
  const bimbi = list.filter(p => eta(p) < 14);
  const panno = bimbi.filter(p => eta(p) <= 2);
  const P = panno.length ? Math.round(panno.reduce((s, p) => s + (eta(p) < 1 ? 10 : 6), 0) / panno.length) : 6;
  return {
    ...KIT_DEFAULT,
    A: list.length - bimbi.length,
    B: bimbi.length,
    Bp: panno.length,
    P,
    F: list.filter(p => p.sesso === 'F' && eta(p) >= 12 && eta(p) <= 50).length,
    T: Math.max(1, list.length - bimbi.length),
  };
}

// Restituisce le sezioni del kit: [{ id, titolo, icona, items: [{ id, nome, qta, unita, nota }] }]
// Le voci con quantità 0 (es. pannolini senza bambini) sono omesse.
export function calcolaKit(input) {
  const i = { ...KIT_DEFAULT, ...(input || {}) };
  const n = (v) => Math.max(0, Number(v) || 0);
  const A = n(i.A), B = n(i.B), G = Math.max(1, n(i.G)), Bp = Math.min(n(i.Bp), B), P = n(i.P) || 6;
  const F = n(i.F), T = n(i.T), S = n(i.S), AUT = n(i.AUT) || 20;
  const N = A + B;

  const cambiBatterie = ceil(5 * G / AUT) + 1;
  const dispositivi = S + 1 + N + 1; // lanterne + frontalini + radio
  const mah = ceil(T * G * 4000 / 0.65);
  const nPowerbank = ceil(mah / 20000);
  const contanti = 75 * N;

  const S_ = (id, titolo, icona, items) => ({ id, titolo, icona, items: items.filter(x => x && x.qta > 0 || (x && x.fisso)) });
  const it = (id, nome, qta, unita, nota) => ({ id, nome, qta: typeof qta === 'number' ? qta : 0, unita: unita || '', nota: nota || '' });
  const fisso = (id, nome, nota) => ({ id, nome, qta: null, unita: '', nota: nota || '', fisso: true });

  return [
    S_('acqua', 'Acqua', '💧', [
      it('acqua', 'Acqua potabile', 5 * A * G + 3 * B * G, 'litri', 'circa 5 L al giorno per adulto, 3 per bambino: da bere, cucinare e lavarsi'),
      it('bottigliette', 'Bottigliette da 0,5 L per i bambini', 3 * B * G, 'pezzi', 'già comprese nei litri sopra: comode da portare in mano'),
      fisso('vasca', 'Vasca da bagno e pentole', 'al primo segnale, riempi tutto: è acqua per il bagno e per lavare'),
    ]),
    S_('cibo', 'Cibo', '🥫', [
      it('scatolame', 'Scatolame (legumi, tonno, carne, verdure)', 2 * A * G + B * G + N, 'scatolette', 'cose che si mangiano anche fredde'),
      it('apriscatole', 'Apriscatole manuale', 2, 'pezzi', 'uno di scorta: è il pezzo che si perde sempre'),
      it('cracker', 'Cracker, gallette, fette biscottate', 2 * N * G, 'monoporzioni'),
      it('snack', 'Snack: frutta secca, barrette, biscotti', 3 * N * G, 'pezzi'),
      it('cioccolato', 'Cioccolato', N, 'tavolette', 'energia e morale'),
      it('latte', 'Latte UHT', Math.round((0.25 * A * G + 0.5 * B * G) * 10) / 10, 'litri'),
      it('succhi', 'Succhi di frutta', N * G, 'brick'),
      it('omogeneizzati', 'Merende e omogeneizzati', ceil(5 * B * G * 1.2), 'pezzi', 'con il 20% in più: i bambini mangiano a orari diversi'),
      it('cartucce', 'Cartucce per fornelletto da campeggio', ceil(0.5 * G / 1.5) + 1, 'cartucce da 190 g', 'mezz’ora di fiamma al giorno; una cartuccia dura circa 1 ora e mezza'),
      it('piatti', 'Piatti e posate usa e getta', ceil(3 * N * G * 1.2), 'set', 'senza acqua non si lava'),
      it('bicchieri', 'Bicchieri', ceil(4 * N * G * 1.2), 'pezzi'),
    ]),
    S_('energia', 'Luce ed energia', '🔦', [
      it('lanterne', 'Lanterne o torce', S + 1, 'pezzi', 'una per stanza usata di notte, più una per il bagno'),
      it('frontalini', 'Torce frontali', N, 'pezzi', 'una a testa: lasciano le mani libere'),
      it('batterie', 'Batterie', dispositivi * cambiBatterie, 'set', `${dispositivi} dispositivi (lanterne, frontalini, radio) × ${cambiBatterie} cambi per ${G} giorni a 5 ore di uso al giorno`),
      it('powerbank', 'Power bank', nPowerbank, 'pezzi da 20.000 mAh', `${mah.toLocaleString('it-IT')} mAh totali: ${T} telefoni × ${G} giorni × 4.000 mAh, con il 35% di perdita di carica`),
      it('radio', 'Radio a batterie o a manovella', 1, 'pezzi', 'per le comunicazioni di emergenza quando la rete non c’è'),
    ]),
    S_('caldo', 'Caldo', '🧣', [
      it('coperte', 'Coperte', 2 * N, 'pezzi'),
      it('isotermiche', 'Coperte isotermiche (d’emergenza)', N, 'pezzi'),
      it('sacchi', 'Sacchi a pelo', N, 'pezzi'),
      it('intimo', 'Intimo di ricambio', G * A + 2 * G * B, 'cambi', 'uno al giorno per gli adulti, due per i bambini'),
      it('calze', 'Calze', G * A + 2 * G * B, 'paia'),
      it('calze-pesanti', 'Calze pesanti', A + 2 * B, 'paia'),
      it('pile', 'Pile e berretti', N, 'pezzi ciascuno', 'uno a testa'),
    ]),
    S_('igiene', 'Igiene e bagno', '🧻', [
      it('salviette', 'Salviette umidificate', 20 * N * G + 10 * Bp * G, 'pezzi', 'sostituiscono la doccia'),
      it('gel', 'Gel igienizzante', 10 * N * G, 'ml'),
      it('carta', 'Carta igienica', ceil(0.5 * N * G) + 1, 'rotoli'),
      it('sacchi-spazzatura', 'Sacchi della spazzatura', 2 * G + N * G, 'pezzi', 'anche per il bagno di emergenza'),
      it('lettiera', 'Lettiera per gatti o segatura', 3 * N * G, 'litri', 'per il WC senza acqua: un secchio con il sacco, uno strato dopo ogni uso'),
      it('pannolini', 'Pannolini', ceil(P * Bp * G * 1.3), 'pezzi', 'con il 30% di scorta'),
      it('assorbenti', 'Assorbenti', 6 * F * G, 'pezzi'),
    ]),
    S_('salute', 'Salute', '🩹', [
      it('pronto-soccorso', 'Kit di pronto soccorso', 1, 'kit', 'cerotti, garze, disinfettante, forbici, termometro'),
      fisso('farmaci', 'Farmaci abituali', `la dose di ogni giorno × ${Math.max(G, 7)} giorni, per ogni farmaco e per ogni persona (mai meno di una settimana)`),
      it('antipiretico', 'Antipiretico per bambini', B > 0 ? 2 : 0, 'confezioni', 'la dose dipende dal peso: leggila sulla confezione o chiedila al pediatra'),
    ]),
    S_('varie', 'Documenti e varie', '📄', [
      it('contanti', 'Contanti in banconote piccole', contanti, '€', `tra ${50 * N} e ${100 * N} €: senza corrente i POS non funzionano`),
      it('documenti', 'Copie dei documenti', N, 'serie', 'carta d’identità, tessera sanitaria, in una busta impermeabile'),
      it('numeri', 'Numeri utili su carta', N, 'fogli', 'parenti, medico, 112: il telefono può essere scarico'),
      it('fischietto', 'Fischietto', N, 'pezzi', 'per farsi sentire senza voce'),
      it('nastro', 'Nastro adesivo (americano)', 2, 'rotoli'),
      it('coltellino', 'Coltellino multiuso', A, 'pezzi'),
    ]),
    S_('bambini', 'Bambini', '🧸', [
      it('giochi', 'Giochi e attività senza corrente', 2 * G * B, 'attività', 'libri, colori, carte: due al giorno per bambino'),
      it('peluche', 'Peluche o oggetto preferito', B, 'pezzi', 'se esiste il doppione, portalo: ne servono 2 a bambino'),
    ]),
  ].filter(s => s.items.length);
}

// Testo semplice della lista (per copia/condivisione)
export function kitTesto(sezioni, input) {
  const i = { ...KIT_DEFAULT, ...(input || {}) };
  const righe = [`KIT DI EMERGENZA — ${i.A} adulti, ${i.B} bambini, ${i.G} giorni`, ''];
  for (const s of sezioni) {
    righe.push(`${s.icona} ${s.titolo.toUpperCase()}`);
    for (const x of s.items) righe.push(x.fisso ? `☐ ${x.nome}: ${x.nota}` : `☐ ${x.nome}: ${x.qta.toLocaleString('it-IT')} ${x.unita}`);
    righe.push('');
  }
  righe.push('Generato con MenuDieta · www.menudieta.it/kit-di-emergenza/');
  return righe.join('\n');
}
