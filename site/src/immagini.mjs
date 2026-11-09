// Immagini del sito disegnate in SVG e convertite in PNG con resvg (nessun servizio esterno).
//  - ricetta: il "piatto" della ricetta, con gli ingredienti in proporzione ai grammi
//    (porzione donna), il nome, le calorie per uomo/donna/bambino. Serve al campo
//    "image" dei dati strutturati Recipe (obbligatorio per Google) e come anteprima social.
//  - menù dieta: l'infografica della settimana, pensata per Google Immagini.
// Le immagini sono deterministiche: stesso dato → stessi byte → l'FTP non le ricarica.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FONTS = fs.readdirSync(path.join(__dirname, 'fonts')).filter(f => f.endsWith('.ttf')).map(f => path.join(__dirname, 'fonts', f));

const C = { ink: '#15251C', verde: '#2F6B3A', lime: '#C7F23E', sfondo: '#F4F7EF', bordo: '#DDE5D8', muted: '#5E7465', bianco: '#FFFFFF' };
// Colore di ogni categoria di alimento (prefisso emoji tolto)
const COLORI = {
  'Verdure': '#5E9E4B', 'Frutta': '#E8743B', 'Cereali': '#E2B868', 'Carni': '#B5543C', 'Frattaglie': '#9C4A3A',
  'Pesce': '#5B8DB8', 'Latticini': '#EFE3BF', 'Uova': '#F4C542', 'Legumi': '#A0703C', 'Salumi': '#D9707A',
  'Oli e grassi': '#C9B63A', 'Frutta secca': '#8B5A3C', 'Dolci': '#C98BB9', 'Bevande e alcolici': '#7FB2C9',
};
export const coloreCat = (cat) => COLORI[String(cat || '').replace(/^[^\p{L}]+/u, '').trim()] || '#9AA59A';

export const escXml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n0 = (v) => Math.round(+v || 0).toLocaleString('it-IT');

// Larghezza stimata del testo (Outfit): basta per andare a capo senza sbordare
const larghezza = (s, size, bold) => [...String(s)].reduce((w, ch) => w + (/[ilj.,:;'’!|]/.test(ch) ? 0.27 : /[mwMW]/.test(ch) ? 0.82 : /[A-Z]/.test(ch) ? 0.64 : ch === ' ' ? 0.26 : 0.52), 0) * size * (bold ? 1.05 : 1);
export function aCapo(testo, size, maxW, maxRighe = 3, bold = false) {
  const parole = String(testo).split(/\s+/); const righe = []; let cur = '';
  for (const p of parole) {
    const prova = cur ? cur + ' ' + p : p;
    if (larghezza(prova, size, bold) <= maxW || !cur) cur = prova; else { righe.push(cur); cur = p; }
  }
  if (cur) righe.push(cur);
  if (righe.length > maxRighe) { const r = righe.slice(0, maxRighe); r[maxRighe - 1] = r[maxRighe - 1].replace(/\s*\S*$/, '') + '…'; return r; }
  return righe;
}
const testo = (x, y, righe, { size, peso = 400, colore = C.ink, interlinea = 1.18, famiglia = 'Outfit', anchor = 'start' }) =>
  righe.map((r, i) => `<text x="${x}" y="${(y + i * size * interlinea).toFixed(1)}" font-family="${famiglia}" font-size="${size}" font-weight="${peso}" fill="${colore}" text-anchor="${anchor}">${escXml(r)}</text>`).join('');

// Marchio: piatto con tre porzioni + "menudieta"
const marchio = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><circle cx="22" cy="22" r="22" fill="${C.bianco}"/><circle cx="22" cy="22" r="18" fill="none" stroke="${C.bordo}" stroke-width="1.5"/><circle cx="16.5" cy="20.5" r="7.5" fill="${C.verde}"/><circle cx="28.5" cy="17.5" r="5" fill="${C.lime}"/><circle cx="27.5" cy="28.5" r="3.3" fill="${C.ink}"/>
<text x="54" y="31" font-family="Outfit" font-size="27" font-weight="800" fill="${C.ink}">menu<tspan fill="${C.verde}">dieta</tspan></text></g>`;

// ── Piatto: cerchi degli ingredienti impacchettati dentro il piatto ─────────
function impacchetta(items, R) {
  // items: [{g, colore}] → posizioni dentro un cerchio di raggio R (centro 0,0)
  const tot = items.reduce((s, i) => s + Math.max(i.g, 1), 0) || 1;
  const area = Math.PI * R * R * 0.5;
  let cerchi = items.map(i => ({ ...i, r: Math.max(R * 0.13, Math.sqrt(area * Math.max(i.g, 1) / tot / Math.PI)) })).sort((a, b) => b.r - a.r);
  for (let tentativo = 0; tentativo < 12; tentativo++) {
    const fatti = []; let ok = true;
    for (const c of cerchi) {
      let messo = false;
      for (let k = 0; k < 2400 && !messo; k++) {
        const a = k * 0.5, d = k === 0 ? 0 : 2 + k * R / 900;
        const x = d * Math.cos(a), y = d * Math.sin(a);
        if (Math.hypot(x, y) + c.r > R - 4) continue;
        if (fatti.every(f => Math.hypot(f.x - x, f.y - y) >= f.r + c.r + 5)) { fatti.push({ ...c, x, y }); messo = true; }
      }
      if (!messo) { ok = false; break; }
    }
    if (ok) {
      // ricentra il gruppo nel piatto (baricentro pesato sull'area) e, se serve, lo riduce per farlo stare dentro
      const A = fatti.reduce((t, f) => t + f.r * f.r, 0);
      const gx = fatti.reduce((t, f) => t + f.x * f.r * f.r, 0) / A, gy = fatti.reduce((t, f) => t + f.y * f.r * f.r, 0) / A;
      let out = fatti.map(f => ({ ...f, x: f.x - gx, y: f.y - gy }));
      const ext = Math.max(...out.map(f => Math.hypot(f.x, f.y) + f.r));
      if (ext > R - 4) { const k = (R - 4) / ext; out = out.map(f => ({ ...f, x: f.x * k, y: f.y * k, r: f.r * k })); }
      return out;
    }
    cerchi = cerchi.map(c => ({ ...c, r: c.r * 0.92 }));
  }
  return [];
}
function piatto(cx, cy, R, ingredienti) {
  const dentro = R * 0.84;
  const cerchi = impacchetta(ingredienti.map(i => ({ g: i.g, colore: i.colore })), dentro);
  return `<g transform="translate(${cx},${cy})">
<circle r="${R + 6}" fill="#000" opacity="0.06" cy="8"/>
<circle r="${R}" fill="${C.bianco}" stroke="${C.bordo}" stroke-width="3"/>
<circle r="${dentro + 6}" fill="none" stroke="#EEF2EA" stroke-width="2"/>
${cerchi.map(c => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.r.toFixed(1)}" fill="${c.colore}"${c.colore === '#EFE3BF' ? ' stroke="#D9CCA3" stroke-width="2"' : ''}/><ellipse cx="${(c.x - c.r * 0.32).toFixed(1)}" cy="${(c.y - c.r * 0.38).toFixed(1)}" rx="${(c.r * 0.34).toFixed(1)}" ry="${(c.r * 0.2).toFixed(1)}" fill="#fff" opacity="0.28" transform="rotate(-30 ${(c.x - c.r * 0.32).toFixed(1)} ${(c.y - c.r * 0.38).toFixed(1)})"/>`).join('')}
</g>`;
}

// Riquadro calorie uomo/donna/bambino
function calorie(x, y, w, r, size) {
  const righe = [['Donna', r.donna?.kcal], ['Uomo', r.uomo?.kcal], ['Bambino', r.bimbo?.kcal]];
  const h = size * 1.9;
  return righe.map(([chi, k], i) => `<g transform="translate(${x},${y + i * (h + size * 0.45)})"><rect width="${w}" height="${h}" rx="${h / 2}" fill="${i === 0 ? C.ink : C.bianco}" stroke="${i === 0 ? C.ink : C.bordo}" stroke-width="2"/>
<text x="${size * 0.9}" y="${h * 0.64}" font-family="Outfit" font-size="${size * 0.82}" font-weight="600" fill="${i === 0 ? '#CFE3C8' : C.muted}">Porzione ${chi.toLowerCase()}</text>
<text x="${w - size * 0.9}" y="${h * 0.66}" font-family="Outfit" font-size="${size}" font-weight="800" fill="${i === 0 ? C.lime : C.ink}" text-anchor="end">${n0(k)} kcal</text></g>`).join('');
}

// "0,5 cucchiai" → "½ cucchiaio", "2 pz" → "2 pz"
export const quantita = (q, unit) => {
  if (!q) return '';
  const num = q === 0.5 ? '½' : q === 0.25 ? '¼' : String(Math.round(q * 10) / 10).replace('.', ',');
  if (unit === 'cucchiaio') return `${num} ${q <= 1 ? 'cucchiaio' : 'cucchiai'}`;
  return `${num} ${unit || 'g'}`;
};
// Legenda: pallino colorato + ingrediente + grammi (porzione donna)
function legenda(x, y, w, ingredienti, size, maxVoci) {
  const voci = ingredienti.slice(0, maxVoci);
  return voci.map((i, k) => {
    const yy = y + k * size * 1.55;
    const q = quantita(i.q, i.unit);
    const nome = aCapo(i.nome, size, w - size * 1.6 - larghezza(q, size) - 12, 1)[0];
    return `<circle cx="${x + size * 0.45}" cy="${yy - size * 0.33}" r="${size * 0.42}" fill="${i.colore}"${i.colore === '#EFE3BF' ? ' stroke="#D9CCA3" stroke-width="1.5"' : ''}/>
<text x="${x + size * 1.3}" y="${yy}" font-family="Outfit" font-size="${size}" font-weight="400" fill="${C.ink}">${escXml(nome)}</text>
<text x="${x + w}" y="${yy}" font-family="Outfit" font-size="${size}" font-weight="600" fill="${C.muted}" text-anchor="end">${escXml(q)}</text>`;
  }).join('');
}

// ── Immagine di una ricetta, in tre formati (Google: 16:9, 4:3, 1:1) ───────
// ric = { nome, categoria, prep, uomo, donna, bimbo, ingredienti: [{nome, g, q, unit, colore}] }
export function svgRicetta(ric, w, h) {
  const meta = `${ric.categoria}${ric.prep ? ` · ${ric.prep} minuti` : ''} · ${ric.ingredienti.length} ingredienti`;
  const sfondo = `<rect width="${w}" height="${h}" fill="${C.sfondo}"/><circle cx="${w}" cy="0" r="${h * 0.42}" fill="${C.lime}" opacity="0.18"/>`;
  let corpo;
  if (w / h >= 1.6) {
    // 16:9 — piatto a sinistra, testo a destra
    const R = h * 0.37, cx = h * 0.47, cy = h * 0.53, x0 = cx + R + 56, wT = w - x0 - 52;
    const tit = aCapo(ric.nome, 46, wT, 3, true);
    let y = 120;
    corpo = `${marchio(x0, 44, 0.9)}${piatto(cx, cy, R, ric.ingredienti)}
${testo(x0, y + 22, tit, { size: 46, peso: 800, interlinea: 1.1 })}
${testo(x0, (y += 22 + tit.length * 50) + 8, [meta], { size: 22, peso: 600, colore: C.verde })}
${calorie(x0, y + 34, wT, ric, 24)}
${(() => { const yL = y + 34 + 3 * 24 * 1.9 + 2 * 24 * 0.45 + 46, n = Math.floor((h - 36 - yL) / (20 * 1.55)); return n >= 2 ? legenda(x0, yL, wT, ric.ingredienti, 20, Math.min(n, ric.ingredienti.length)) : ''; })()}`;
  } else {
    // 1:1 e 4:3 — titolo in alto, piatto a sinistra, calorie e ingredienti a destra
    const s = w / 1200, alto = h / w > 0.9;
    const tSize = (alto ? 62 : 54) * s, tit = aCapo(ric.nome, tSize, w - 120 * s, alto ? 3 : 2, true);
    let y = 150 * s;
    const testa = `${marchio(60 * s, 44 * s, s)}${testo(60 * s, y + tSize * 0.4, tit, { size: tSize, peso: 800, interlinea: 1.08 })}${testo(60 * s, (y += tSize * 0.4 + tit.length * tSize * 1.08) + 4 * s, [meta], { size: 26 * s, peso: 600, colore: C.verde })}`;
    const top = y + 30 * s, spazio = h - top - 40 * s;
    const R = Math.min(spazio * 0.47, w * 0.27), cx = 60 * s + R + 10 * s, cy = top + spazio / 2;
    const x0 = cx + R + 60 * s, wT = w - x0 - 60 * s, cs = 25 * s;
    const hCal = 3 * cs * 1.9 + 2 * cs * 0.45;
    const lSize = 23 * s, maxVoci = Math.max(0, Math.floor((spazio - hCal - 70 * s) / (lSize * 1.55)));
    const yCal = top + Math.max(0, (spazio - hCal - (Math.min(maxVoci, ric.ingredienti.length) * lSize * 1.55 + 50 * s)) / 2);
    corpo = `${testa}${piatto(cx, cy, R, ric.ingredienti)}${calorie(x0, yCal, wT, ric, cs)}
${maxVoci ? `${testo(x0, yCal + hCal + 44 * s, ['Ingredienti (porzione donna)'], { size: 19 * s, peso: 600, colore: C.muted })}${legenda(x0, yCal + hCal + 80 * s, wT, ric.ingredienti, lSize, maxVoci)}` : ''}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${sfondo}${corpo}</svg>`;
}

// ── Infografica del menù dieta settimanale ─────────────────────────────────
// giorni = [{ nome: 'Lunedì', kcal, pasti: [{ etichetta: 'Colazione', nome }] }]
export function svgMenu({ titolo, sottotitolo, giorni, piede, box }) {
  const W = 1200, col = 2, gap = 24, mx = 40, wB = (W - mx * 2 - gap) / col;
  const fs = 19, fl = 17, lab = 112, wTxt = wB - 36 - lab - 10;
  const blocchi = giorni.map(g => {
    const righe = g.pasti.map(p => ({ ...p, righe: aCapo(p.nome, fs, wTxt, 2) }));
    const h = 62 + righe.reduce((s, r) => s + r.righe.length * fs * 1.22 + 11, 0) + 8;
    return { ...g, righe, h };
  });
  const yTop = 210; const rows = Math.ceil((blocchi.length + (box ? 1 : 0)) / col);
  const hRiga = []; for (let r = 0; r < rows; r++) hRiga.push(Math.max(...blocchi.slice(r * col, r * col + col).map(b => b.h), box && r === rows - 1 ? 300 : 0));
  const H = yTop + hRiga.reduce((s, x) => s + x + gap, 0) + 70;
  let out = `<rect width="${W}" height="${H}" fill="${C.sfondo}"/><circle cx="${W}" cy="0" r="300" fill="${C.lime}" opacity="0.22"/>
${marchio(mx, 34, 1)}
${testo(mx, 140, [titolo], { size: 58, peso: 800 })}
${testo(mx, 182, [sottotitolo], { size: 24, peso: 600, colore: C.verde })}`;
  let y = yTop;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < col; c++) {
      const i = r * col + c, x = mx + c * (wB + gap);
      const b = blocchi[i];
      if (b) {
        let yy = y + 62;
        out += `<rect x="${x}" y="${y}" width="${wB}" height="${hRiga[r]}" rx="18" fill="${C.bianco}" stroke="${C.bordo}" stroke-width="2"/>
<rect x="${x}" y="${y}" width="${wB}" height="46" rx="18" fill="${C.ink}"/><rect x="${x}" y="${y + 28}" width="${wB}" height="18" fill="${C.ink}"/>
${testo(x + 18, y + 31, [b.nome], { size: 23, peso: 800, colore: C.bianco })}
${testo(x + wB - 18, y + 31, [`${n0(b.kcal)} kcal`], { size: 20, peso: 800, colore: C.lime, anchor: 'end' })}`;
        for (const p of b.righe) {
          out += `${testo(x + 18, yy + 4, [p.etichetta], { size: fl, peso: 600, colore: C.verde })}${testo(x + 18 + lab, yy + 4, p.righe, { size: fs, interlinea: 1.22 })}`;
          yy += p.righe.length * fs * 1.22 + 11;
        }
      } else if (box && i === blocchi.length) {
        out += `<rect x="${x}" y="${y}" width="${wB}" height="${hRiga[r]}" rx="18" fill="${C.verde}"/>
${testo(x + 24, y + 48, [box.titolo], { size: 26, peso: 800, colore: C.lime })}
${box.righe.map((t, k) => testo(x + 24, y + 92 + k * 38, aCapo('• ' + t, 20, wB - 48, 1), { size: 20, colore: C.bianco })).join('')}`;
      }
    }
    y += hRiga[r] + gap;
  }
  out += testo(mx, H - 32, [piede], { size: 20, peso: 600, colore: C.muted });
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`, w: W, h: Math.round(H) };
}

export function png(svg) {
  return new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Outfit' }, background: C.sfondo }).render().asPng();
}

// WebP: un terzo del peso del PNG a parità di resa (Google lo accetta per Recipe e Immagini)
export const webp = (svg) => sharp(png(svg)).webp({ quality: 82, effort: 5 }).toBuffer();
export const jpg = (svg) => sharp(png(svg)).flatten({ background: C.sfondo }).jpeg({ quality: 84, mozjpeg: true }).toBuffer();

// Anteprima social (1200×630) per le pagine senza immagine propria
export function svgOg(titolo, sottotitolo) {
  const W = 1200, H = 630, tit = aCapo(titolo, 64, 700, 3, true);
  const fette = [['#5E9E4B', 0, 140], ['#E2B868', 140, 230], ['#5B8DB8', 230, 290], ['#E8743B', 290, 360]];
  const cx = 930, cy = 330, R = 210;
  const arco = ([col, a0, a1]) => { const r = (a) => (a - 90) * Math.PI / 180, x0 = cx + (R - 30) * Math.cos(r(a0)), y0 = cy + (R - 30) * Math.sin(r(a0)), x1 = cx + (R - 30) * Math.cos(r(a1)), y1 = cy + (R - 30) * Math.sin(r(a1));
    return `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${R - 30},${R - 30} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${col}" stroke="#fff" stroke-width="6"/>`; };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.sfondo}"/><circle cx="${W}" cy="0" r="280" fill="${C.lime}" opacity="0.25"/>
${marchio(60, 50, 1)}${testo(60, 210, tit, { size: 64, peso: 800, interlinea: 1.08 })}${testo(60, 210 + tit.length * 69 + 18, [sottotitolo], { size: 28, peso: 600, colore: C.verde })}
<circle cx="${cx}" cy="${cy + 10}" r="${R + 4}" fill="#000" opacity="0.06"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="${C.bordo}" stroke-width="3"/>${fette.map(arco).join('')}</svg>`;
}
