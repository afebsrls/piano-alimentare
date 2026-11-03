// Mockup SVG delle schermate dell'app, nello stile grafico reale di Fitsy
// (colori, header scuro con il logo, card bianche, bottom nav).
// Non sono screenshot: sono illustrazioni leggere (inline, niente immagini
// esterne) che anticipano cosa vedrà l'utente. Sostituibili con screenshot
// veri mettendo i PNG in site/src/img/ e cambiando `phone()` in build.

const ink = '#15251C', verde = '#2F6B3A', lime = '#C7F23E', bg = '#F4F7EF', bordo = '#E7EDE2', grigio = '#9DB1A2';

const frame = (inner, w = 300, h = 600) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true">
<rect x="0" y="0" width="${w}" height="${h}" rx="34" fill="#0f1d15"/>
<rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="28" fill="${bg}"/>
<clipPath id="c"><rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="28"/></clipPath>
<g clip-path="url(#c)">
<rect x="8" y="8" width="${w - 16}" height="86" fill="${ink}"/>
<text x="26" y="64" font-family="system-ui,Arial" font-size="30" font-weight="800" fill="#F5F8F1" letter-spacing="-1.2">f<tspan fill="${lime}">i</tspan>tsy</text>
${inner}
<rect x="8" y="${h - 62}" width="${w - 16}" height="54" fill="#fff"/><line x1="8" y1="${h - 62}" x2="${w - 8}" y2="${h - 62}" stroke="${bordo}"/>
${['🏠', '📋', '🛒', '📏', '☰'].map((e, i) => `<text x="${8 + (w - 16) / 5 * (i + .5)}" y="${h - 28}" text-anchor="middle" font-size="18">${e}</text>`).join('')}
</g></svg>`;

const card = (y, h, inner) => `<rect x="22" y="${y}" width="256" height="${h}" rx="14" fill="#fff" stroke="${bordo}"/>${inner}`;
const t = (x, y, s, size = 11, color = ink, w = 600, extra = '') => `<text x="${x}" y="${y}" font-family="system-ui,Arial" font-size="${size}" font-weight="${w}" fill="${color}" ${extra}>${s}</text>`;
const bar = (x, y, w, pct, color) => `<rect x="${x}" y="${y}" width="${w}" height="7" rx="3.5" fill="#E7EDE2"/><rect x="${x}" y="${y}" width="${Math.round(w * pct)}" height="7" rx="3.5" fill="${color}"/>`;

export const OGGI = frame(`
${t(26, 84, 'Buongiorno, Marta', 11, '#9DB1A2', 600)}
${card(110, 92, `
  ${t(36, 132, 'Oggi', 13, ink, 800)}${t(240, 132, 'ven 3 nov', 10, grigio, 600, 'text-anchor="end"')}
  ${t(36, 160, '1.240', 26, ink, 800)}${t(122, 160, '/ 1.850 kcal', 11, grigio, 600)}
  ${bar(36, 172, 228, .67, verde)}
  ${t(36, 194, 'P 62/90 g', 9, '#4A6152', 600)}${t(110, 194, 'C 150/230 g', 9, '#4A6152', 600)}${t(190, 194, 'G 38/58 g', 9, '#4A6152', 600)}
`)}
${card(212, 60, `${t(36, 236, '☀️ Colazione', 12, ink, 700)}${t(36, 254, 'Yogurt, fiocchi d’avena e pera · 380 kcal', 9.5, '#4A6152', 500)}${t(262, 246, '✓', 16, verde, 800, 'text-anchor="end"')}`)}
${card(282, 60, `${t(36, 306, '🥗 Pranzo', 12, ink, 700)}${t(36, 324, 'Pasta e ceci, insalata · 560 kcal', 9.5, '#4A6152', 500)}${t(262, 316, '✓', 16, verde, 800, 'text-anchor="end"')}`)}
${card(352, 60, `${t(36, 376, '🍽️ Cena', 12, ink, 700)}${t(36, 394, 'Merluzzo al forno, patate · 520 kcal', 9.5, '#4A6152', 500)}<rect x="212" y="366" width="52" height="24" rx="8" fill="${verde}"/>${t(238, 382, 'Mangiato', 8.5, '#fff', 800, 'text-anchor="middle"')}`)}
${card(422, 70, `${t(36, 446, '💧 Acqua', 12, ink, 700)}${t(262, 446, '5 / 8 bicchieri', 10, grigio, 600, 'text-anchor="end"')}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${36 + i * 29}" y="458" width="22" height="22" rx="6" fill="${i < 5 ? '#0891b2' : '#E7EDE2'}"/>`).join('')}`)}
`);

export const PIANO = frame(`
${t(26, 84, 'Piano · settimana 45', 11, '#9DB1A2', 600)}
<rect x="22" y="104" width="256" height="30" rx="10" fill="#fff" stroke="${bordo}"/>
${['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => `<rect x="${28 + i * 36}" y="109" width="30" height="20" rx="7" fill="${i === 4 ? verde : 'none'}"/>${t(43 + i * 36, 123, d, 10, i === 4 ? '#fff' : ink, 700, 'text-anchor="middle"')}`).join('')}
<rect x="22" y="142" width="256" height="24" rx="8" fill="#EDF7EF"/>${t(34, 158, '👩 Marta  👨 Luca  🧒 Leo', 10, verde, 700)}${t(266, 158, 'porzioni per ciascuno', 8, grigio, 600, 'text-anchor="end"')}
${card(176, 84, `${t(36, 198, '🥗 Pranzo', 10, grigio, 700)}${t(36, 216, 'Pasta e ceci', 13, ink, 800)}${t(36, 232, 'Marta 70 g · Luca 90 g · Leo 50 g', 9.5, '#4A6152', 500)}
  ${bar(36, 244, 150, .3, '#db2777')}<rect x="${36 + 45}" y="244" width="60" height="7" fill="#d97706"/><rect x="${36 + 105}" y="244" width="30" height="7" rx="3.5" fill="#0891b2"/>
  <rect x="200" y="232" width="64" height="20" rx="7" fill="#F4F7EF" stroke="${bordo}"/>${t(232, 246, '🔄 Cambia', 8.5, verde, 700, 'text-anchor="middle"')}`)}
${card(270, 84, `${t(36, 292, '🍽️ Cena', 10, grigio, 700)}${t(36, 310, 'Merluzzo al forno con patate', 13, ink, 800)}${t(36, 326, 'Marta 150 g · Luca 180 g · Leo 100 g', 9.5, '#4A6152', 500)}
  ${bar(36, 338, 150, .5, '#db2777')}<rect x="${36 + 75}" y="338" width="45" height="7" fill="#d97706"/><rect x="${36 + 120}" y="338" width="30" height="7" rx="3.5" fill="#0891b2"/>
  <rect x="200" y="326" width="64" height="20" rx="7" fill="#F4F7EF" stroke="${bordo}"/>${t(232, 340, '🔄 Cambia', 8.5, verde, 700, 'text-anchor="middle"')}`)}
${card(364, 70, `${t(36, 386, '🍎 Spuntini', 10, grigio, 700)}${t(36, 404, 'Mela e mandorle · Yogurt', 12, ink, 700)}${t(36, 420, 'di stagione · novembre', 9.5, '#4A6152', 500)}`)}
${card(444, 60, `${t(36, 468, 'Totale giorno', 10, grigio, 700)}${t(36, 488, '1.850 kcal', 14, ink, 800)}${t(262, 488, 'P 90 · C 230 · G 58', 10, '#4A6152', 600, 'text-anchor="end"')}`)}
`);

export const SPESA = frame(`
${t(26, 84, 'Spesa · oggi + 2 giorni', 11, '#9DB1A2', 600)}
<rect x="22" y="104" width="256" height="28" rx="10" fill="#EDF7EF"/>${t(34, 122, '11 articoli · 4 presi', 10, verde, 700)}${t(266, 122, 'condivisa con Luca', 8.5, grigio, 600, 'text-anchor="end"')}
${t(28, 156, 'ORTOFRUTTA', 9, grigio, 800)}
${[['Ceci secchi', '400 g', true], ['Patate', '900 g', true], ['Zucchine', '600 g', false], ['Pere', '4 pz', false]].map(([n, q, c], i) => `${card(164 + i * 42, 36, `<rect x="36" y="${173 + i * 42}" width="18" height="18" rx="5" fill="${c ? verde : '#fff'}" stroke="${c ? verde : '#C2D0C6'}"/>${c ? t(45, 187 + i * 42, '✓', 11, '#fff', 800, 'text-anchor="middle"') : ''}${t(64, 187 + i * 42, n, 12, c ? grigio : ink, 700, c ? 'text-decoration="line-through"' : '')}${t(262, 187 + i * 42, q, 10, '#4A6152', 600, 'text-anchor="end"')}`)}`).join('')}
${t(28, 346, 'PESCE E CARNE', 9, grigio, 800)}
${[['Filetto di merluzzo', '430 g', true], ['Petto di pollo', '350 g', false]].map(([n, q, c], i) => `${card(354 + i * 42, 36, `<rect x="36" y="${363 + i * 42}" width="18" height="18" rx="5" fill="${c ? verde : '#fff'}" stroke="${c ? verde : '#C2D0C6'}"/>${c ? t(45, 377 + i * 42, '✓', 11, '#fff', 800, 'text-anchor="middle"') : ''}${t(64, 377 + i * 42, n, 12, c ? grigio : ink, 700, c ? 'text-decoration="line-through"' : '')}${t(262, 377 + i * 42, q, 10, '#4A6152', 600, 'text-anchor="end"')}`)}`).join('')}
${t(28, 452, 'DISPENSA', 9, grigio, 800)}
${[['Pasta corta', '1,2 kg', false], ['Fiocchi d’avena', '300 g', false]].map(([n, q, c], i) => `${card(460 + i * 42, 36, `<rect x="36" y="${469 + i * 42}" width="18" height="18" rx="5" fill="#fff" stroke="#C2D0C6"/>${t(64, 483 + i * 42, n, 12, ink, 700)}${t(262, 483 + i * 42, q, 10, '#4A6152', 600, 'text-anchor="end"')}`)}`).join('')}
`);

export const MISURE = frame(`
${t(26, 84, 'Misure · Marta', 11, '#9DB1A2', 600)}
${card(104, 150, `${t(36, 126, '⚖️ Peso', 12, ink, 700)}${t(262, 126, '64,0 kg · −2,0 in 6 sett.', 10, verde, 700, 'text-anchor="end"')}
  <polyline points="36,210 70,205 104,208 138,198 172,192 206,186 240,180 264,176" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <polygon points="36,210 70,205 104,208 138,198 172,192 206,186 240,180 264,176 264,236 36,236" fill="${ink}" opacity=".07"/>
  ${[36, 70, 104, 138, 172, 206, 240, 264].map((x, i) => `<circle cx="${x}" cy="${[210, 205, 208, 198, 192, 186, 180, 176][i]}" r="3" fill="${lime}" stroke="${ink}" stroke-width="1.5"/>`).join('')}
  ${t(36, 248, 'set', 8, grigio, 600)}${t(264, 248, 'nov', 8, grigio, 600, 'text-anchor="end"')}`)}
${card(264, 64, `${t(36, 288, '🎯 Peso forma', 12, ink, 700)}${t(36, 308, '58–63 kg · costituzione normale', 10, '#4A6152', 500)}${t(262, 300, '−1,5 kg', 14, verde, 800, 'text-anchor="end"')}`)}
${card(338, 64, `${t(36, 362, '📉 Fabbisogno adattivo', 12, ink, 700)}${t(36, 382, 'stimato dai tuoi dati: 2.050 kcal', 10, '#4A6152', 500)}${t(262, 374, 'alta', 10, '#0891b2', 800, 'text-anchor="end"')}`)}
${card(412, 90, `${t(36, 436, 'Ultime misurazioni', 10, grigio, 700)}
  ${[['03/11', '64,0', '78'], ['27/10', '64,6', '79'], ['20/10', '65,2', '79']].map(([d, p, v], i) => `${t(36, 458 + i * 16, d, 10, ink, 600)}${t(130, 458 + i * 16, p + ' kg', 10, ink, 700)}${t(210, 458 + i * 16, 'vita ' + v, 10, '#4A6152', 500)}`).join('')}`)}
`);

export const NUTR = frame(`
${t(26, 84, 'Area nutrizionista', 11, '#9DB1A2', 600)}
${card(104, 48, `${t(36, 124, '👩 Marta R.', 12, ink, 800)}<rect x="206" y="112" width="58" height="18" rx="9" fill="#dc2626"/>${t(235, 125, '2 nuovi', 8.5, '#fff', 800, 'text-anchor="middle"')}${t(36, 142, '64,0 kg · 12 misure · attiva oggi', 9.5, '#4A6152', 500)}`)}
${card(160, 48, `${t(36, 180, '👨 Paolo B.', 12, ink, 800)}${t(36, 198, '88,4 kg · 7 misure · attivo ieri', 9.5, '#4A6152', 500)}`)}
${card(216, 48, `${t(36, 236, '👩 Giulia T.', 12, ink, 800)}${t(36, 254, '58,1 kg · 20 misure · 3 gg fa', 9.5, '#4A6152', 500)}`)}
${card(278, 110, `${t(36, 300, '🎯 Target di Marta', 12, ink, 800)}<rect x="170" y="289" width="94" height="16" rx="8" fill="#0891b2"/>${t(217, 301, 'impostato da te', 8, '#fff', 800, 'text-anchor="middle"')}
  ${t(36, 328, '1.700', 22, ink, 800)}${t(112, 328, 'kcal · P 90 · C 190 · G 55', 10, '#4A6152', 600)}
  ${t(36, 350, 'Nota: più proteine a colazione', 9.5, '#4A6152', 500)}
  <rect x="36" y="360" width="90" height="20" rx="7" fill="${verde}"/>${t(81, 374, '✏️ Modifica', 8.5, '#fff', 800, 'text-anchor="middle"')}`)}
${card(398, 118, `${t(36, 420, '💬 Messaggi', 12, ink, 800)}
  <rect x="36" y="430" width="160" height="28" rx="10" fill="#F4F7EF"/>${t(44, 448, 'Buongiorno! Ho inserito il peso', 9, ink, 500)}
  <rect x="104" y="464" width="160" height="28" rx="10" fill="${verde}"/>${t(112, 482, 'Perfetto, continua così 👍', 9, '#fff', 500)}
  <rect x="36" y="498" width="190" height="12" rx="6" fill="#fff" stroke="${bordo}"/>${t(42, 507, 'Scrivi un messaggio…', 7.5, grigio, 500)}`)}
`);
