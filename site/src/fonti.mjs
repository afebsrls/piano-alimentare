// Fonti ufficiali citate nel sito, con il link alla pagina originale.
// Servono a tre cose: fiducia del lettore, valutazione di qualità di Google sui temi
// di salute (E-E-A-T) e citabilità da parte dei motori di risposta (ChatGPT, Perplexity,
// AI Overview), che preferiscono le pagine che dichiarano da dove vengono i numeri.
// Indirizzi verificati il 10/11/2026.
export const FONTI = {
  larn:    { nome: 'LARN – Livelli di assunzione di riferimento di nutrienti ed energia', ente: 'SINU, Società Italiana di Nutrizione Umana (IV revisione, 2014)', url: 'https://sinu.it/larn/' },
  crea:    { nome: 'Linee guida per una sana alimentazione', ente: 'CREA, Centro di ricerca Alimenti e Nutrizione (revisione 2018)', url: 'https://www.crea.gov.it/web/alimenti-e-nutrizione/-/linee-guida-per-una-sana-alimentazione-2018' },
  tabelle: { nome: 'Tabelle di composizione degli alimenti', ente: 'CREA, Centro di ricerca Alimenti e Nutrizione', url: 'https://www.alimentinutrizione.it/sezioni/tabelle-nutrizionali' },
  efsa:    { nome: 'Scientific Opinion on Dietary Reference Values for water', ente: 'EFSA, Autorità europea per la sicurezza alimentare (2010)', url: 'https://www.efsa.europa.eu/it/efsajournal/pub/1459' },
  unesco:  { nome: 'Mediterranean diet – Lista del patrimonio culturale immateriale dell’umanità', ente: 'UNESCO (iscrizione 2010, estesa nel 2013)', url: 'https://ich.unesco.org/en/RL/mediterranean-diet-00884' },
};
export const linkFonte = (k, testo) => `<a href="${FONTI[k].url}" rel="noopener" target="_blank">${testo || FONTI[k].nome}</a>`;
export const htmlFonti = (chiavi, titolo = 'Fonti') => `<h2>${titolo}</h2>
<ul class="fonti">${chiavi.map(k => `<li>${linkFonte(k)}, ${FONTI[k].ente}.</li>`).join('')}</ul>`;
export const urlFonti = (chiavi) => chiavi.map(k => FONTI[k].url);
// Firma visibile sotto il titolo delle pagine di contenuto
export const htmlFirma = (dataIt) => `<p class="firma">A cura della <a href="/chi-siamo/">Redazione MenuDieta</a> · dati calcolati con il motore dell’app su ${linkFonte('larn', 'LARN')} e ${linkFonte('crea', 'Linee guida CREA')}${dataIt ? ` · aggiornato il ${dataIt}` : ''}</p>`;
