// Contenuti delle pagine. Ogni voce è una funzione ({esc, APP, cta}) → HTML.
// Regole SEO applicate: parola chiave esatta nell'H1 e nel primo paragrafo,
// varianti negli H2, risposta diretta nelle prime 2 righe, FAQ reali.

const toolCalorie = () => `
<div class="tool" data-tool="calorie">
  <div class="row">
    <div><label>Sesso</label><div class="seg" data-k="sesso" data-value="M"><button class="on" data-v="M">Uomo</button><button data-v="F">Donna</button></div></div>
    <div><label>Età</label><input name="eta" inputmode="numeric" placeholder="es. 38"></div>
    <div><label>Peso (kg)</label><input name="peso" inputmode="decimal" placeholder="es. 72"></div>
    <div><label>Altezza (cm)</label><input name="altezza" inputmode="numeric" placeholder="es. 175"></div>
  </div>
  <div class="row" style="margin-top:12px">
    <div><label>Lavoro</label><div class="seg" data-k="lavoro" data-value="sedentario"><button class="on" data-v="sedentario">Sedentario</button><button data-v="attivo">Attivo</button><button data-v="sportivo">Pesante</button></div></div>
    <div><label>Allenamenti a settimana</label><div class="seg" data-k="gg" data-value="0">${[0,1,2,3,4,5,6,7].map(n=>`<button${n===0?' class="on"':''} data-v="${n}">${n}</button>`).join('')}</div></div>
  </div>
  <div class="risultato"></div>
</div>`;

const toolPeso = () => `
<div class="tool" data-tool="pesoforma">
  <div class="row">
    <div><label>Sesso</label><div class="seg" data-k="sesso" data-value="M"><button class="on" data-v="M">Uomo</button><button data-v="F">Donna</button></div></div>
    <div><label>Altezza (cm)</label><input name="altezza" inputmode="numeric" placeholder="es. 170"></div>
    <div><label>Circonferenza polso (cm)</label><input name="polso" inputmode="decimal" placeholder="es. 16,5 (facoltativo)"></div>
  </div>
  <div class="risultato"></div>
</div>`;

const toolAcqua = () => `
<div class="tool" data-tool="acqua">
  <div class="row">
    <div><label>Peso (kg)</label><input name="peso" inputmode="decimal" placeholder="es. 65"></div>
    <div><label>Allenamenti a settimana</label><div class="seg" data-k="gg" data-value="0">${[0,1,2,3,4,5,6,7].map(n=>`<button${n===0?' class="on"':''} data-v="${n}">${n}</button>`).join('')}</div></div>
  </div>
  <div class="risultato"></div>
</div>`;

const menuEsempio = () => `
<div class="menu-ex">
  <div><b>Lunedì</b>Pranzo: pasta e ceci<br>Cena: frittata di zucchine, pane</div>
  <div><b>Martedì</b>Pranzo: riso con piselli<br>Cena: merluzzo al forno, patate</div>
  <div><b>Mercoledì</b>Pranzo: minestrone con farro<br>Cena: pollo e verdure grigliate</div>
  <div><b>Giovedì</b>Pranzo: pasta al pomodoro<br>Cena: legumi in umido, pane</div>
  <div><b>Venerdì</b>Pranzo: insalata di orzo<br>Cena: pesce spada, insalata</div>
  <div><b>Sabato</b>Pranzo: pizza fatta in casa<br>Cena: vellutata e crostini</div>
  <div><b>Domenica</b>Pranzo: lasagne di verdure<br>Cena: uova, verdure, pane</div>
</div>
<p class="note">Colazione e spuntini variano per persona (yogurt, frutta, pane e marmellata, frutta secca). Le quantità in grammi dipendono dal fabbisogno di ciascuno: è il motivo per cui un menu "uguale per tutti" non funziona, e il motivo per cui esiste MenuDieta.</p>`;

export const CONTENUTI = {
  home: {
    body: ({ APP, cta, phone }) => `
<section class="hero hero-grid">
  <div>
    <h1>MenuDieta, l’app gratuita per il piano alimentare settimanale della famiglia</h1>
    <p class="lead">MenuDieta è un’app web gratuita che decide cosa si mangia questa settimana: un menu equilibrato per tutta la famiglia, con le porzioni giuste per ogni persona, la lista della spesa pronta e le ricette di stagione. Nessuna pubblicità, nessun abbonamento.</p>
    <div class="btns"><a class="btn" href="${APP}">Apri MenuDieta gratis →</a><a class="btn secondario" href="/menu-settimanale-famiglia/">Vedi un menu di esempio</a></div>
    <p class="note">Funziona sul telefono e sul computer, si installa come un’app. I dati restano tuoi.</p>
  </div>
  <div class="phones">${phone('OGGI')}${phone('PIANO')}</div>
</section>

<h2 style="text-align:center">Cosa vedrai ogni giorno</h2>
<p class="lead" style="text-align:center;margin:0 auto 10px">Quattro schermate, zero menu nascosti. Ecco come si presenta l’app.</p>

<section class="feat">
  <div class="phone-wrap">${phone('PIANO')}</div>
  <div>
    <h2>Un solo menu, porzioni diverse per ciascuno</h2>
    <p>I menu settimanali che trovi in giro sono "per una persona": poi tocca a te moltiplicare, togliere, adattare ai bambini. MenuDieta parte dal <strong>fabbisogno di ogni membro della famiglia</strong> (tabelle LARN italiane) e scala ogni piatto: stessa pasta e ceci per tutti, 90 g per papà, 70 g per mamma, 50 g per il bambino.</p>
    <ul><li>7 giorni, colazione, pranzo, cena e spuntini</li><li>Ricette di stagione, mese per mese</li><li>Non ti piace un piatto? Lo cambi con un tocco, il resto resta stabile</li></ul>
  </div>
</section>

<section class="feat rev">
  <div class="phone-wrap">${phone('SPESA')}</div>
  <div>
    <h2>La lista della spesa si scrive da sola</h2>
    <p>Quantità esatte per la tua famiglia, raggruppate per reparto, con le spunte condivise con chi è al supermercato. Mostra solo i prossimi giorni: compri più fresco, butti meno. <a href="/lista-della-spesa-automatica/">Come funziona</a>.</p>
  </div>
</section>

<section class="feat">
  <div class="phone-wrap">${phone('OGGI')}</div>
  <div>
    <h2>Oggi: cosa mangiare, cosa hai mangiato</h2>
    <p>Un tocco per segnare un pasto come consumato, il conto delle calorie e dei macro si aggiorna, l’acqua si conta a bicchieri. Se salti un pasto il piano se ne accorge e non te lo ripropone.</p>
  </div>
</section>

<section class="feat rev">
  <div class="phone-wrap">${phone('MISURE')}</div>
  <div>
    <h2>Misure e progressi che hanno senso</h2>
    <p>Peso, circonferenze, peso forma in base alla costituzione e un fabbisogno che si <strong>adatta ai tuoi dati reali</strong>: dopo qualche settimana MenuDieta sa quante calorie consumi davvero, non solo quante ne stima la formula.</p>
  </div>
</section>

<h2>Come funziona, in tre passi</h2>
<ol class="passi">
  <li><strong>Racconti chi siete.</strong> Età, peso, altezza, lavoro e allenamenti di ogni persona: MenuDieta calcola subito il fabbisogno di ciascuno.</li>
  <li><strong>MenuDieta prepara la settimana.</strong> Un menu equilibrato e di stagione, con le quantità per ogni membro. Puoi escludere ingredienti che non piacciono.</li>
  <li><strong>Fai la spesa e cucini.</strong> La lista è già pronta e condivisa. Ogni giorno vedi cosa c’è da preparare e segni cosa è stato mangiato.</li>
</ol>

${cta('Inizia oggi, è gratis')}

<div class="grid">
  <div class="box"><h3>📖 Le tue ricette</h3><p>Aggiungi i piatti di casa: MenuDieta calcola le calorie dagli ingredienti e li inserisce nel menu. Le migliori, validate, finiscono nel catalogo della community.</p></div>
  <div class="box"><h3>🧰 Strumenti gratuiti</h3><p><a href="/calcolo-fabbisogno-calorico/">Fabbisogno calorico</a>, <a href="/peso-forma-calcolo/">peso forma</a>, <a href="/quanta-acqua-bere-al-giorno/">acqua al giorno</a>, equivalenze e misure casalinghe.</p></div>
  <div class="box"><h3>🩺 Sei un nutrizionista?</h3><p>Segui i tuoi pazienti dentro l’app: misure, diario e messaggi in tempo reale, target impostato da te. <a href="/per-nutrizionisti/">Scopri MenuDieta Pro ed entra in lista d’attesa</a>.</p></div>
</div>

<h2>Perché è gratuita</h2>
<p>MenuDieta resta gratuita per le famiglie. Il progetto si sostiene con il servizio per i <a href="/per-nutrizionisti/">nutrizionisti</a> che seguono i propri pazienti dentro l’app. Niente pubblicità, niente vendita di dati: la <a href="/privacy/">privacy</a> è spiegata in italiano chiaro e i dati stanno su server in Unione Europea.</p>`,
    faq: [
      ['MenuDieta è davvero gratuita?', 'Sì, per le famiglie è gratuita e senza pubblicità. Il servizio per nutrizionisti è a pagamento e sostiene il progetto.'],
      ['Devo installare qualcosa?', 'No. Si usa dal browser del telefono o del computer e, se vuoi, si aggiunge alla schermata home come un’app normale. Funziona anche offline.'],
      ['Va bene anche per i bambini?', 'Sì: ogni persona ha il suo profilo e il piano calcola porzioni adatte all’età. I piatti sono gli stessi della famiglia, cambiano le quantità.'],
      ['Posso usare le mie ricette?', 'Sì. Inserisci gli ingredienti e MenuDieta calcola calorie e macronutrienti; la ricetta entra nel menu della famiglia.'],
      ['Sostituisce un nutrizionista?', 'No. MenuDieta aiuta a organizzare pasti equilibrati con criteri standard (LARN). Per esigenze mediche o diete particolari serve un professionista, che può usare MenuDieta per seguirti.'],
    ],
  },

  'menu-settimanale-famiglia': {
    body: ({ APP, cta }) => `
<h1>Menu settimanale per la famiglia: esempio pronto e generatore gratuito</h1>
<p class="lead">Un menu settimanale per la famiglia funziona se tre cose stanno insieme: piatti che piacciono a tutti, porzioni diverse per ciascuno e una lista della spesa che nasce dal menu. Qui trovi un esempio completo e lo strumento che lo genera per te in base alla tua famiglia.</p>
<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0"><a class="btn" href="${APP}">Genera il menu della mia famiglia →</a></div>

<h2>Esempio di menù settimanale per la famiglia (pranzo e cena)</h2>
${menuEsempio()}

<h2>Le regole che rendono un piano alimentare settimanale davvero "di famiglia"</h2>
<div class="grid">
  <div class="box"><h3>1. Si cucina una volta sola</h3><p>Lo stesso piatto per tutti. Cambiano solo le quantità nel piatto: è il modo per non trasformare la cucina in un ristorante.</p></div>
  <div class="box"><h3>2. Ogni settimana ha un ritmo</h3><p>Legumi 3 volte, pesce 2, carne bianca 2, uova 2, cereali vari (pasta, riso, farro, orzo). Il ritmo evita la monotonia e copre i nutrienti senza fare calcoli.</p></div>
  <div class="box"><h3>3. Di stagione</h3><p>Frutta e verdura del mese: costano meno e hanno più sapore. MenuDieta cambia le proposte mese per mese.</p></div>
  <div class="box"><h3>4. Flessibile</h3><p>Un imprevisto non deve far saltare la settimana: cambi il singolo pasto e il resto resta fermo, lista della spesa compresa.</p></div>
</div>

<h2>Menu settimanale con bambini: cosa cambia</h2>
<p>Niente, nei piatti. Cambia la porzione: un bambino di 6 anni ha bisogno di circa 1.400–1.600 kcal al giorno, un adulto sedentario di 1.900–2.400. MenuDieta calcola il fabbisogno di ciascuno e scala le quantità, così il menu con bambini è lo stesso della famiglia. Approfondimento: <a href="/blog/menu-settimanale-bambini/">menu settimanale per bambini</a>.</p>

<h2>Come farsi generare il menu in 5 minuti</h2>
<ol>
  <li>Apri <a href="${APP}">MenuDieta</a> e inserisci le persone di casa (bastano età, peso, altezza, attività).</li>
  <li>Escludi quello che non va (allergie, cose che non piacciono).</li>
  <li>Guarda la settimana, cambia i piatti che vuoi, poi apri la lista della spesa: è già fatta.</li>
</ol>
${cta('Il tuo menu settimanale, pronto adesso')}
<p>Vuoi capire il metodo prima di usare lo strumento? Leggi <a href="/blog/come-organizzare-menu-settimanale-famiglia/">come organizzare il menu settimanale della famiglia in 30 minuti</a>.</p>`,
    faq: [
      ['Quante calorie deve avere un menu settimanale per la famiglia?', 'Non esiste un numero unico: dipende da ogni persona. Un adulto sedentario sta tra 1.900 e 2.400 kcal al giorno, un bambino di 6–10 anni tra 1.400 e 1.900. Il menu è lo stesso, cambiano le porzioni. Puoi calcolare il fabbisogno di ciascuno con il <a href="/calcolo-fabbisogno-calorico/">calcolatore gratuito</a>.'],
      ['Posso stampare il menu?', 'Sì, MenuDieta mostra la settimana in una vista compatta che puoi stampare o condividere; ma il vantaggio è averla sul telefono di tutti, aggiornata.'],
      ['Quante volte a settimana carne, pesce, legumi?', 'Un riferimento equilibrato: legumi 3–4 volte, pesce 2–3, carne bianca 1–2, carne rossa al massimo 1, uova 2, formaggi 2. MenuDieta applica un ritmo simile in automatico.'],
    ],
  },

  'lista-della-spesa-automatica': {
    body: ({ APP, cta }) => `
<h1>Lista della spesa automatica dal menu settimanale</h1>
<p class="lead">Una lista della spesa automatica nasce dal menu, non dalla memoria: MenuDieta somma gli ingredienti dei pasti della settimana, calcola le quantità per la tua famiglia e le raggruppa per reparto. Tu la apri al supermercato e spunti.</p>
<div style="margin:14px 0"><a class="btn" href="${APP}">Prova la lista automatica →</a></div>

<h2>Cosa fa di diverso rispetto a un’app di sole liste</h2>
<div class="grid">
  <div class="box"><h3>Quantità vere</h3><p>Non "pasta", ma 1,2 kg di pasta: la somma delle porzioni di tutti per tutta la settimana. Meno sprechi, meno "mi manca una cosa".</p></div>
  <div class="box"><h3>Si aggiorna da sola</h3><p>Cambi un pasto? La lista cambia. Segni un pasto come mangiato? Gli ingredienti escono dalla lista dei prossimi giorni.</p></div>
  <div class="box"><h3>Condivisa in tempo reale</h3><p>Chi è al supermercato spunta, chi è a casa vede. Le spunte restano anche se il piano viene rigenerato.</p></div>
  <div class="box"><h3>Per i prossimi giorni, non per tutta la settimana</h3><p>Di default mostra cosa serve da oggi a dopodomani: fai la spesa più spesso, compri più fresco, butti meno.</p></div>
</div>

<h2>Lista della spesa condivisa con la famiglia</h2>
<p>Tutti i membri della famiglia vedono lo stesso piano e la stessa lista dal proprio telefono. Non serve "mandare la lista": è già lì. Funziona anche senza connessione e si sincronizza appena torna la rete.</p>

<h2>Come si usa</h2>
<ol>
  <li>MenuDieta genera il <a href="/menu-settimanale-famiglia/">menu settimanale</a> in base alla tua famiglia.</li>
  <li>Apri la sezione Spesa: trovi gli articoli per reparto con le quantità.</li>
  <li>Spunta mentre compri. Se ne hai già in dispensa, spunta e basta.</li>
</ol>
${cta('Smetti di scrivere la lista a mano')}`,
    faq: [
      ['Posso aggiungere cose che non sono nel menu?', 'Sì, la lista accetta anche articoli liberi (detersivo, carta igienica) accanto a quelli calcolati dal menu.'],
      ['Le quantità sono in grammi o in pezzi?', 'In quello che ha senso al supermercato: grammi per pasta e carne, pezzi per uova e frutta, con la conversione fatta da MenuDieta (sa quanto pesa una mela media).'],
      ['Funziona offline?', 'Sì. La lista resta sul telefono e si allinea quando torni online.'],
    ],
  },

  'calcolo-fabbisogno-calorico': {
    body: ({ APP, cta }) => `
<h1>Calcolo fabbisogno calorico giornaliero (metodo LARN italiano)</h1>
<p class="lead">Il calcolo del fabbisogno calorico giornaliero risponde a una domanda semplice: quante calorie ti servono per mantenere il peso con la tua vita di tutti i giorni. Inserisci i dati: il risultato usa le tabelle LARN/SINU, lo standard italiano usato da dietisti e nutrizionisti.</p>
${toolCalorie()}
<h2>Come si calcola il fabbisogno calorico</h2>
<p>Il fabbisogno è il prodotto di due numeri. Il <strong>metabolismo basale</strong> (MB) è l’energia che il corpo consuma a riposo per respirare, pompare sangue, mantenere la temperatura: dipende da sesso, età e peso. Il <strong>livello di attività fisica</strong> (LAF) moltiplica il MB in base a quanto ti muovi: lavoro sedentario, attivo o pesante, più i giorni di allenamento.</p>
<div class="scroll"><table class="tabella">
<tr><th>Metabolismo basale (LARN)</th><th>Uomo</th><th>Donna</th></tr>
<tr><td>18–29 anni</td><td>15,3 × peso + 679</td><td>14,7 × peso + 496</td></tr>
<tr><td>30–59 anni</td><td>11,6 × peso + 879</td><td>8,7 × peso + 829</td></tr>
<tr><td>60–74 anni</td><td>11,9 × peso + 700</td><td>9,2 × peso + 688</td></tr>
<tr><td>75+ anni</td><td>8,4 × peso + 819</td><td>9,8 × peso + 624</td></tr>
</table></div>
<p>Esempio: uomo di 40 anni, 80 kg, lavoro sedentario, 3 allenamenti a settimana. MB = 11,6 × 80 + 879 = 1.807 kcal. LAF ≈ 1,52. Fabbisogno ≈ <strong>2.740 kcal</strong> al giorno.</p>

<h2>Quante calorie al giorno per dimagrire o per aumentare massa</h2>
<p>Per perdere peso in modo sostenibile si toglie il 15–20% al fabbisogno (circa 300–500 kcal): si perde mezzo chilo a settimana senza fame. Per aumentare massa muscolare si aggiungono 250–350 kcal, con allenamento di forza. Tagli più grandi fanno perdere soprattutto acqua e muscolo, e il peso torna.</p>

<h2>LARN o Mifflin-St Jeor?</h2>
<p>La maggior parte dei calcolatori online usa Harris-Benedict o Mifflin-St Jeor, formule americane. Le tabelle LARN (Livelli di Assunzione di Riferimento di Nutrienti, della SINU) sono tarate sulla popolazione italiana e sono il riferimento usato dai professionisti in Italia. Per i minori di 18 anni, non coperti dalle tabelle, questo calcolatore passa a Mifflin-St Jeor.</p>

${cta('Trasforma il numero in un menu')}
<p>Il numero da solo serve a poco. MenuDieta usa questo stesso calcolo per ogni membro della famiglia e costruisce un <a href="/menu-settimanale-famiglia/">menu settimanale</a> con le porzioni giuste per ciascuno. Vedi anche: <a href="/peso-forma-calcolo/">calcolo del peso forma</a> e <a href="/quanta-acqua-bere-al-giorno/">quanta acqua bere al giorno</a>.</p>`,
    faq: [
      ['Cos’è il metabolismo basale?', 'L’energia che il corpo consuma a riposo completo nelle 24 ore. In un adulto rappresenta il 60–70% del fabbisogno totale.'],
      ['Il calcolo vale anche per i bambini?', 'Le tabelle LARN per adulti partono dai 18 anni. Sotto, il calcolatore usa la formula Mifflin-St Jeor, un’approssimazione ragionevole; per i bambini piccoli conta più la crescita regolare che il numero di calorie.'],
      ['Quanto è preciso?', 'Le formule hanno un margine di ±10%. Il modo per verificarlo è pesarsi ogni settimana: se il peso è stabile per 3–4 settimane, quello è il tuo fabbisogno reale.'],
      ['Quante proteine al giorno?', 'Per un adulto sano 0,9–1,2 g per kg di peso; chi si allena 1,4–1,8 g/kg. Il calcolatore indica un valore di riferimento.'],
    ],
  },

  'peso-forma-calcolo': {
    body: ({ APP, cta }) => `
<h1>Calcolo peso forma in base alla costituzione</h1>
<p class="lead">Il calcolo del peso forma dà un intervallo, non un numero secco: due persone alte uguali possono avere un’ossatura diversa. Questo calcolatore parte dal BMI 22 e lo corregge con l’<strong>indice di Grant</strong> (altezza / circonferenza del polso), che misura la costituzione.</p>
${toolPeso()}
<h2>Peso ideale: perché un numero solo non ha senso</h2>
<p>Il BMI (peso / altezza²) considera "normale" tutto tra 18,5 e 24,9: per chi è alto 1,70 m significa 53–72 kg, un intervallo di 19 kg. Troppo largo per essere utile. L’indice di Grant restringe: chi ha un polso sottile rispetto all’altezza (costituzione esile) ha un peso forma più basso, chi ha un polso robusto più alto, circa ±7,5%.</p>
<div class="scroll"><table class="tabella">
<tr><th>Indice di Grant (altezza cm / polso cm)</th><th>Uomo</th><th>Donna</th></tr>
<tr><td>Costituzione robusta</td><td>&lt; 9,6</td><td>&lt; 9,9</td></tr>
<tr><td>Costituzione normale</td><td>9,6 – 10,4</td><td>9,9 – 10,9</td></tr>
<tr><td>Costituzione esile</td><td>&gt; 10,4</td><td>&gt; 10,9</td></tr>
</table></div>
<p>Come misurare il polso: con un metro da sarta, nel punto più stretto sopra l’osso sporgente, senza stringere.</p>

<h2>Peso forma donna e uomo: le differenze</h2>
<p>A parità di altezza le soglie dell’indice di Grant sono diverse perché la struttura ossea femminile è mediamente più sottile. Per questo i calcolatori che usano una sola formula per tutti sbagliano in una direzione per gli uomini e nell’altra per le donne.</p>

<h2>E la massa muscolare?</h2>
<p>Il peso forma è un riferimento per chi non fa sport agonistico. Chi ha molta massa muscolare può pesare più del "suo" intervallo ed essere in ottima forma: in quel caso conta la composizione corporea (massa grassa stimata da vita, collo e fianchi), che MenuDieta calcola nella sezione Misure.</p>
${cta('Dal peso forma al piano per raggiungerlo')}
<p>MenuDieta usa questo calcolo per proporre a ogni persona un obiettivo realistico e un <a href="/menu-settimanale-famiglia/">menu settimanale</a> per arrivarci con calma. Vedi anche il <a href="/calcolo-fabbisogno-calorico/">calcolo del fabbisogno calorico</a>.</p>`,
    faq: [
      ['Qual è il peso forma per 170 cm?', 'Con costituzione normale circa 61–66 kg; esile 56–61; robusta 65–71. Usa il calcolatore con il tuo polso per il valore preciso.'],
      ['Il peso forma cambia con l’età?', 'Le formule non cambiano, ma dopo i 65 anni un BMI leggermente più alto (fino a 27) è considerato protettivo. L’intervallo qui calcolato resta un buon riferimento.'],
      ['Meglio il peso forma o la percentuale di grasso?', 'La percentuale di grasso è più informativa, ma serve una misura in più (vita, collo, fianchi). Il peso forma è il punto di partenza semplice.'],
    ],
  },

  'quanta-acqua-bere-al-giorno': {
    body: ({ APP, cta }) => `
<h1>Quanta acqua bere al giorno: calcolo personalizzato</h1>
<p class="lead">Quanta acqua bere al giorno dipende dal peso e da quanto ti muovi, non dalla regola dei "2 litri per tutti". Il criterio pratico usato in nutrizione è <strong>30–35 ml per kg di peso</strong>, più circa mezzo litro per ogni ora di allenamento. Inserisci i dati e ottieni litri e bicchieri.</p>
${toolAcqua()}
<h2>Da dove viene il calcolo</h2>
<p>L’EFSA (Autorità europea per la sicurezza alimentare) indica un’assunzione adeguata di acqua totale di 2,5 litri al giorno per gli uomini e 2 per le donne, considerando anche l’acqua contenuta negli alimenti (circa il 20–30%). Il calcolo per kg di peso adatta questi valori alla persona: 32 ml/kg è un punto medio prudente. Con sudorazione intensa, caldo, febbre o allattamento il fabbisogno aumenta.</p>

<h2>Quanti bicchieri sono</h2>
<p>Un bicchiere da tavola contiene circa 240 ml. Per una persona di 65 kg che si allena 2 volte a settimana il calcolo dà circa 2,2 litri, cioè 9 bicchieri. Dividerli nella giornata (uno al risveglio, uno a ogni pasto e spuntino, uno prima di dormire) è più efficace che berli tutti insieme.</p>

<h2>Segnali che stai bevendo poco</h2>
<ul>
  <li>Urine scure e poco frequenti (il colore ideale è giallo paglierino).</li>
  <li>Mal di testa nel pomeriggio, stanchezza, difficoltà a concentrarsi.</li>
  <li>Fame "finta": spesso è sete.</li>
</ul>
${cta('Tieni il conto dei bicchieri senza pensarci')}
<p>MenuDieta calcola il fabbisogno di ogni persona della famiglia e nella pagina Oggi ha un contatore di bicchieri con promemoria. Vedi anche il <a href="/calcolo-fabbisogno-calorico/">fabbisogno calorico</a>.</p>`,
    faq: [
      ['Il caffè e il tè contano?', 'Sì, contano come liquidi: l’effetto diuretico della caffeina a dosi normali è minimo. Meglio comunque che la maggior parte sia acqua.'],
      ['Si può bere troppa acqua?', 'Sì, ma serve molto (oltre 1 litro all’ora per diverse ore). Per una persona sana che beve quando ha sete non è un rischio reale.'],
      ['I bambini quanta acqua devono bere?', 'Indicativamente 1,3 litri a 4–8 anni e 1,5–2 litri a 9–13, acqua degli alimenti inclusa. Il calcolo per kg di peso funziona anche per loro.'],
    ],
  },

  'kit-di-emergenza': {
    body: ({ APP, cta }) => `
<h1>Kit di emergenza per la famiglia: la lista con le quantità giuste</h1>
<p class="lead">Un kit di emergenza serve a passare qualche giorno in casa senza acqua corrente, luce e negozi aperti: blackout, alluvione, terremoto, neve. Le liste che trovi in giro dicono <em>cosa</em> serve ma non <em>quanto</em>. Qui scegli quante persone siete e per quanti giorni, premi Genera e ottieni la lista con le quantità già moltiplicate, da spuntare e stampare.</p>
<div class="tool kit" data-tool="kit">
  <div class="row">
    <div><label>Adulti</label><input name="A" inputmode="numeric" value="2"></div>
    <div><label>Bambini (sotto i 14 anni)</label><input name="B" inputmode="numeric" value="0"></div>
    <div><label>Giorni di autonomia</label><div class="seg" data-k="G" data-value="3">${[3,5,7,14].map(n=>`<button${n===3?' class="on"':''} data-v="${n}">${n}</button>`).join('')}</div></div>
  </div>
  <details class="kit-dett"><summary>Altri dettagli (pannolini, donne, telefoni, stanze, batterie)</summary>
  <div class="row">
    <div><label>Bambini con il pannolino</label><input name="Bp" inputmode="numeric" value="0"></div>
    <div><label>Pannolini al giorno per bambino</label><select name="P"><option value="10">Neonato (10)</option><option value="6" selected>1–2 anni (6)</option><option value="4">Più grande (4)</option></select></div>
    <div><label>Donne in età fertile</label><input name="F" inputmode="numeric" value="1"></div>
    <div><label>Smartphone</label><input name="T" inputmode="numeric" value="2"></div>
    <div><label>Stanze usate di notte</label><input name="S" inputmode="numeric" value="2"></div>
    <div><label>Ore di autonomia di un set di batterie</label><input name="AUT" inputmode="numeric" value="20"></div>
  </div></details>
  <button type="button" class="btn genera">Genera il kit →</button>
  <div class="risultato"></div>
</div>

<h2>Da dove vengono le quantità</h2>
<p>Le formule seguono le indicazioni della Protezione Civile e delle principali organizzazioni di soccorso, adattate a una famiglia: <strong>5 litri d’acqua al giorno per adulto</strong> e 3 per bambino (bere, cucinare, lavarsi), due scatolette al giorno per adulto e una per bambino, cibo che si mangia anche freddo, luce per ogni stanza usata di notte e una torcia frontale a testa, un cambio di intimo al giorno (due per i bambini), salviette al posto della doccia e lettiera per il bagno senza acqua. Per i bambini e i pannolini c’è una scorta del 20–30% in più, perché in emergenza si consuma di più. I farmaci abituali vanno sempre tenuti per almeno una settimana, qualunque sia il numero di giorni scelto.</p>

<h2>Le sette cose che quasi tutti dimenticano</h2>
<ul>
  <li><strong>L’apriscatole manuale.</strong> Senza, lo scatolame è inutile. Mettine due.</li>
  <li><strong>I contanti in banconote piccole.</strong> Senza corrente non funzionano POS e bancomat.</li>
  <li><strong>I numeri utili su carta.</strong> Parenti, medico, scuola, 112: sono tutti nel telefono, che sarà scarico.</li>
  <li><strong>La radio a batterie.</strong> È l’unico modo per ricevere comunicazioni quando la rete mobile cade.</li>
  <li><strong>Il bagno.</strong> Senza acqua lo sciacquone non funziona: un secchio con un sacco e lettiera per gatti risolve.</li>
  <li><strong>Il peluche preferito.</strong> Per un bambino vale quanto l’acqua: se esiste un doppione, tienilo nel kit.</li>
  <li><strong>La vasca da bagno.</strong> Al primo avviso, riempila: è acqua per lavare e per il WC.</li>
</ul>

<h2>Dove tenerlo e come mantenerlo</h2>
<p>In un armadio vicino all’ingresso o in garage, tutto insieme, in contenitori con il coperchio: se serve uscire di casa deve stare in macchina in un viaggio. Due volte l’anno (quando cambia l’ora, per ricordarsene) controlla le scadenze di acqua, cibo e farmaci, prova le torce e ricarica i power bank. Le scorte di cibo si usano e si ricomprano a rotazione, così non scadono mai.</p>
${cta('Il kit è anche nell’app, con le spunte che restano salvate')}
<p>Nell’app MenuDieta il kit parte già dai membri della tua famiglia e tiene a mente cosa hai già comprato. Serve anche il <a href="/menu-settimanale-famiglia/">menu settimanale</a> normale per i giorni normali, e la <a href="/lista-della-spesa-automatica/">lista della spesa</a> per non dimenticare niente.</p>`,
    faq: [
      ['Per quanti giorni deve bastare un kit di emergenza?', 'La raccomandazione minima è 72 ore (3 giorni), il tempo medio perché i soccorsi arrivino ovunque. Se abiti in zona isolata, in montagna o in un’area a rischio alluvione, prepara 7 giorni. Il generatore qui sopra calcola entrambi.'],
      ['Quanta acqua per persona in caso di emergenza?', 'Circa 5 litri al giorno per un adulto e 3 per un bambino: 2 litri da bere, il resto per cucinare e lavarsi. Per 2 adulti e 1 bambino per 3 giorni servono 39 litri.'],
      ['Cosa mangiare senza corrente e senza gas?', 'Scatolame (legumi, tonno, carne), cracker e gallette, frutta secca e barrette, latte UHT, cioccolato: tutto quello che si mangia senza cuocere. Un fornelletto da campeggio con 2–3 cartucce basta per scaldare l’acqua.'],
      ['Il kit di emergenza va bene anche per il terremoto?', 'Sì, la lista è la stessa: cambia solo dove lo tieni. In zona sismica va vicino alla porta o in auto, perché potresti dover uscire in pochi secondi.'],
    ],
  },

  'per-nutrizionisti': {
    body: ({ APP, cta, phone }) => `
<section class="hero hero-grid">
  <div>
    <h1>MenuDieta per nutrizionisti: i tuoi pazienti in un’app italiana, in tempo reale</h1>
    <p class="lead">Un software per nutrizionisti serve a una cosa sola: far seguire davvero il piano al paziente tra una visita e l’altra. Con MenuDieta Pro vedi <strong>misure, diario dei pasti e andamenti</strong> dei tuoi pazienti mentre li inseriscono, imposti il loro target calorico e gli scrivi dall’app. Loro usano MenuDieta gratis, tutti i giorni, per decidere cosa cucinare.</p>
    <div class="btns"><a class="btn" href="#lista-attesa">Entra nella lista d’attesa →</a></div>
    <p class="note">Il profilo professionale è in apertura a un numero limitato di studi. Nessun costo per iscriversi alla lista.</p>
  </div>
  <div class="phones">${phone('NUTR')}</div>
</section>

<h2>Cosa cambia per te e per il paziente</h2>
<div class="grid">
  <div class="box"><h3>📈 Andamenti, non solo numeri</h3><p>Peso, vita, fianchi e tutte le circonferenze con grafico; stima del fabbisogno adattivo dai dati reali; target calcolato con le tabelle LARN, come fai tu.</p></div>
  <div class="box"><h3>🎯 Target tuo, piano suo</h3><p>Decidi calorie e ripartizione dei macronutrienti: il paziente non legge un PDF, vede ogni giorno cosa mangiare con grammature e ricette, e la lista della spesa pronta.</p></div>
  <div class="box"><h3>🍽️ Il diario che si compila da solo</h3><p>Un tocco per segnare il pasto consumato o saltato, l’acqua a bicchieri. Tu vedi l’aderenza reale, non quella raccontata in visita.</p></div>
  <div class="box"><h3>💬 Messaggi dentro l’app</h3><p>Niente WhatsApp, niente numero personale: la conversazione sta con i dati del paziente, con le notifiche dei non letti.</p></div>
  <div class="box"><h3>👨‍👩‍👧 Non isola il paziente a tavola</h3><p>Molti pazienti cucinano per altri. MenuDieta scala lo stesso piatto per ogni membro della famiglia: il piano si segue perché si mangia tutti insieme.</p></div>
  <div class="box"><h3>🔒 Dati in UE, consenso esplicito</h3><p>Il paziente sceglie di collegarsi con un codice e può revocare in un tocco. Registro dei trattamenti e procedura data breach documentati; nessun dato ceduto a terzi.</p></div>
</div>

<h2>Come funzionerà</h2>
<ol class="passi">
  <li><strong>Ricevi il tuo codice professionale</strong> (es. NUT-7K2P1A) e un link di invito da mandare ai pazienti.</li>
  <li><strong>Il paziente apre il link</strong> o inserisce il codice nell’app: da quel momento vedi i suoi dati; può scollegarsi quando vuole.</li>
  <li><strong>Segui e intervieni.</strong> Grafici, diario, ricette che crea. Imposti kcal e macro con una nota: il suo piano si rigenera su quel target.</li>
  <li><strong>Gli scrivi</strong> quando serve, e lui a te.</li>
</ol>

<h2>Perché non è "l’ennesimo gestionale"</h2>
<p>Le piattaforme come Nutrium o MetaDieta sono ottime per la parte clinica e amministrativa dello studio. MenuDieta non le sostituisce: lavora sull’altra metà del problema, i 29 giorni al mese in cui il paziente è a casa e deve decidere cosa mettere in pentola. Se il tuo piano oggi finisce in un cassetto, è lì che MenuDieta aiuta.</p>

<h2 id="lista-attesa">Lista d’attesa</h2>
<p>Lasciaci i tuoi dati: ti ricontattiamo noi per spiegarti come funziona, raccogliere le tue esigenze e, quando apriamo, darti l’accesso. I primi studi iscritti avranno il primo anno a condizioni riservate. Gratis per i pazienti, sempre.</p>
<form class="waitlist" novalidate>
  <input type="hidden" name="tipo" value="nutrizionista">
  <label for="wl-nome">Nome e cognome</label><input id="wl-nome" name="nome" required autocomplete="name" placeholder="es. Maria Rossi">
  <label for="wl-email">Email</label><input id="wl-email" name="email" type="email" required autocomplete="email" placeholder="es. maria@studio.it">
  <label for="wl-citta">Città dello studio</label><input id="wl-citta" name="citta" autocomplete="address-level2" placeholder="es. Roma">
  <label for="wl-note">Cosa ti interessa di più? (facoltativo)</label><textarea id="wl-note" name="note" placeholder="es. Seguo circa 30 pazienti, mi interessa il diario e la lista della spesa"></textarea>
  <div class="hp"><label>Sito web</label><input name="website" tabindex="-1" autocomplete="off"></div>
  <label class="consenso"><input type="checkbox" name="consenso"> Acconsento a essere ricontattato da AF&amp;B S.r.l.s. per informazioni su MenuDieta Pro. I dati sono usati solo per questo e cancellati su richiesta (<a href="/privacy/">privacy</a>).</label>
  <button class="btn" type="submit">Iscrivimi alla lista d’attesa</button>
  <div class="wl-msg"></div>
</form>
<p>Preferisci scrivere? <a href="mailto:info@menudieta.it?subject=MenuDieta%20Pro">info@menudieta.it</a>. Vuoi intanto vedere l’app dal lato del paziente? <a href="${APP}">Aprila gratis</a>.</p>`,
    faq: [
      ['Quando apre il servizio?', 'Stiamo attivando i primi studi uno alla volta, per fare bene. Chi è in lista viene contattato nell’ordine di iscrizione.'],
      ['Devo avere anche io una scheda MenuDieta?', 'No. L’account professionale è separato: dopo il login vedi solo l’area nutrizionista con i tuoi pazienti, i loro dati e i messaggi.'],
      ['Il paziente deve pagare qualcosa?', 'No, MenuDieta è e resta gratuita per i pazienti e le loro famiglie.'],
      ['Quanto costerà?', 'Un canone mensile in base ai pazienti attivi, inferiore ai gestionali di studio perché MenuDieta li affianca, non li sostituisce. I primi studi iscritti hanno condizioni riservate per il primo anno.'],
      ['I dati dei pazienti dove stanno?', 'Su server in Unione Europea. Il paziente vede chi lo segue e può scollegarsi in qualsiasi momento.'],
    ],
  },
};

// ── Pagine legali del sito (il sito è statico: nessun cookie, nessun tracker) ──
export const LEGALI = {
  privacy: {
    title: 'Privacy policy del sito www.menudieta.it',
    description: 'Informativa privacy del sito www.menudieta.it: quali dati vengono trattati navigando il sito, da chi e per quanto. Nessun cookie di profilazione, nessun tracker.',
    body: ({ APP }) => `<article class="legal">
<h1>Privacy policy del sito www.menudieta.it</h1>
<p class="lead">Informativa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR) per chi consulta il sito www.menudieta.it. L’informativa dell’<strong>app</strong> MenuDieta (account, dati di famiglia, misure) è separata e si trova <a href="${APP}privacy.html">qui</a>.</p>
<h2>1. Titolare del trattamento</h2>
<p>AF&amp;B S.r.l.s., Via Mario Ugo Guattari 48, 00173 Roma (RM), P.IVA 13698751008, REA RM-1466364, capitale sociale € 2.700,00 i.v.. Email: <a href="mailto:info@menudieta.it">info@menudieta.it</a>.</p>
<h2>2. Quali dati tratta il sito</h2>
<p><strong>Il sito non raccoglie dati personali durante la navigazione.</strong> Non usa cookie di profilazione, strumenti di analisi del traffico (es. Google Analytics), pixel o pulsanti social. Le pagine sono statiche. I calcolatori (fabbisogno calorico, peso forma, acqua) funzionano interamente nel tuo browser: i valori che inserisci non vengono inviati a nessun server.</p>
<p><strong>Log del server.</strong> Il fornitore di hosting (Aruba S.p.A., Italia) registra automaticamente, per esigenze tecniche e di sicurezza, l’indirizzo IP, data e ora della richiesta, la pagina richiesta, il browser utilizzato. Questi log sono conservati dal fornitore per i tempi previsti dalla sua policy e non sono usati dal Titolare per identificare i visitatori.</p>
<p><strong>Lista d’attesa (pagina Per nutrizionisti).</strong> Se compili il modulo, trattiamo nome, email, città e le note che inserisci per ricontattarti riguardo al servizio MenuDieta Pro. Base giuridica: consenso (casella da spuntare). I dati sono conservati su Supabase (server in UE) fino alla tua richiesta di cancellazione o per 24 mesi dall’ultimo contatto. Non vengono usati per altre finalità né ceduti.</p>
<p><strong>Email.</strong> Se ci scrivi (info@menudieta.it, mailto nella pagina nutrizionisti), trattiamo il tuo indirizzo e il contenuto del messaggio per risponderti. Base giuridica: esecuzione di misure precontrattuali o legittimo interesse a rispondere. Conservazione: il tempo necessario a gestire la richiesta, al massimo 24 mesi.</p>
<h2>3. Link verso l’app</h2>
<p>I pulsanti "Apri l’app" portano a ${APP}, dove si applica l’<a href="${APP}privacy.html">informativa dell’app</a>: lì, se scegli di creare un account, vengono trattati i dati che inserisci (profili, misure, pasti), con consenso esplicito e possibilità di cancellare tutto in un’unica operazione.</p>
<h2>4. Destinatari e trasferimenti</h2>
<p>Hosting: Aruba S.p.A. (server in Italia), in qualità di responsabile del trattamento per i log tecnici. Nessun altro destinatario. Nessun trasferimento verso Paesi extra-UE.</p>
<h2>5. I tuoi diritti</h2>
<p>Hai diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità (artt. 15–22 GDPR) e di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it). Per esercitarli scrivi a <a href="mailto:info@menudieta.it">info@menudieta.it</a>.</p>
<h2>6. Minori</h2>
<p>Il sito non è rivolto a minori di 14 anni e non raccoglie consapevolmente dati di minori. Nell’app i profili dei bambini sono creati e gestiti dal genitore.</p>
<h2>7. Aggiornamenti</h2>
<p>Ultimo aggiornamento: 3 novembre 2026. Le modifiche vengono pubblicate su questa pagina.</p>
</article>`,
  },
  cookie: {
    title: 'Cookie policy di www.menudieta.it',
    description: 'Il sito www.menudieta.it non usa cookie di profilazione né di terze parti. Elenco completo di ciò che viene memorizzato nel browser e perché.',
    body: ({ APP }) => `<article class="legal">
<h1>Cookie policy di www.menudieta.it</h1>
<p class="lead">Informativa resa ai sensi del provvedimento del Garante privacy del 10 giugno 2021 sulle "Linee guida cookie e altri strumenti di tracciamento".</p>
<h2>Cookie usati dal sito</h2>
<p><strong>Nessuno.</strong> Il sito non installa cookie, né propri né di terze parti, né tecnici né di profilazione. Non ci sono servizi di analisi del traffico, mappe incorporate, video esterni, pulsanti social o pubblicità.</p>
<h2>Cosa viene memorizzato nel browser</h2>
<table class="tabella"><tr><th>Nome</th><th>Tipo</th><th>Scopo</th><th>Durata</th></tr>
<tr><td><code>fitsy-cn</code></td><td>localStorage (tecnico)</td><td>Ricorda che hai chiuso l’avviso informativo in fondo alla pagina, per non mostrarlo di nuovo.</td><td>Fino a cancellazione manuale</td></tr></table>
<p>Si tratta di un dato tecnico, memorizzato solo sul tuo dispositivo, non trasmesso al server e non riconducibile a te. Per questo non è richiesto il consenso (art. 122 Codice privacy). Puoi cancellarlo dalle impostazioni del browser.</p>
<h2>E l’app?</h2>
<p>L’app su ${APP} memorizza nel browser i tuoi dati di piano, spesa e misure per funzionare anche offline, e la sessione di accesso se scegli di collegare l’account Google. Tutto è descritto nell’<a href="${APP}privacy.html">informativa dell’app</a>, che chiede il consenso esplicito prima di trattare qualsiasi dato personale sul cloud.</p>
<h2>Se in futuro cambierà</h2>
<p>Se il sito dovesse adottare strumenti di misurazione del traffico, questa pagina verrà aggiornata e, ove richiesto, verrà chiesto il consenso preventivo con un banner conforme (rifiuto facile quanto l’accettazione, nessun cookie non tecnico prima della scelta).</p>
<p>Ultimo aggiornamento: 3 novembre 2026.</p>
</article>`,
  },
};

export const ARTICOLI_HTML = {
  'blog/come-organizzare-menu-settimanale-famiglia': ({ APP, cta }) => `
<h1>Come organizzare il menu settimanale della famiglia in 30 minuti</h1>
<p class="lead">Organizzare il menu settimanale della famiglia non è questione di volontà ma di metodo: chi lo fa ogni settimana ci mette mezz’ora, chi improvvisa spende di più e mangia peggio. Ecco i cinque passi, nell’ordine giusto.</p>
<h2>1. Parti dal calendario, non dalle ricette</h2>
<p>Prendi la settimana e segna le sere "difficili": il martedì che torni tardi, il giovedì di sport dei bambini. Quelle sere vanno coperte con piatti da 15 minuti o avanzi programmati. Le ricette che richiedono tempo vanno nel weekend. Il 70% dei menu falliscono perché il piatto giusto è nel giorno sbagliato.</p>
<h2>2. Fissa il ritmo delle proteine</h2>
<p>Non scegliere i piatti, scegli la famiglia di piatti: legumi 3 volte, pesce 2, carne bianca 1–2, uova 2, formaggi 1–2, carne rossa al massimo 1. Riempi lo schema e il menu è già equilibrato prima di aver scritto una ricetta.</p>
<h2>3. Scegli con la stagione e la dispensa</h2>
<p>Apri frigo e dispensa prima di decidere: quello che c’è va usato per primo. Poi frutta e verdura del mese. In novembre: cavoli, zucca, finocchi, broccoli, cachi, pere, kiwi. Costano meno e reggono meglio.</p>
<h2>4. Porzioni diverse, piatto uguale</h2>
<p>Cucina lo stesso piatto per tutti e adatta le quantità nel piatto. Un adulto sedentario ha bisogno di 1.900–2.400 kcal, un bambino di 6–10 anni di 1.400–1.900: sono circa 80 g di pasta contro 55. Qui sta la differenza tra una dieta "per uno" e un menu di famiglia. Se vuoi i numeri per ciascuno: <a href="/calcolo-fabbisogno-calorico/">calcolo del fabbisogno calorico</a>.</p>
<h2>5. La lista della spesa nasce dal menu</h2>
<p>Scrivi gli ingredienti piatto per piatto, somma, togli ciò che hai. È la parte più noiosa, e quella che un’app fa in zero secondi: MenuDieta la genera dal menu con le quantità per la tua famiglia. Vedi <a href="/lista-della-spesa-automatica/">lista della spesa automatica</a>.</p>
<h2>Esempio di settimana organizzata così</h2>
${menuEsempio()}
<h2>Gli errori da evitare</h2>
<ul>
  <li><strong>Troppe ricette nuove.</strong> Una a settimana basta: il resto sono piatti collaudati.</li>
  <li><strong>Menu rigido.</strong> Se salta una cena, sposti, non ricominci. Il menu è un piano, non un contratto.</li>
  <li><strong>Dimenticare colazione e spuntini.</strong> Sono il 25–30% delle calorie: vanno pianificati, anche se sono sempre gli stessi.</li>
</ul>
${cta('Lascia fare i cinque passi a MenuDieta')}
<p>MenuDieta fa esattamente questo ogni settimana: ritmo delle proteine, stagione, porzioni per persona, lista della spesa. A te resta scegliere cosa cambiare. <a href="${APP}">Provalo gratis</a>.</p>`,

  'blog/menu-settimanale-bambini': ({ APP, cta }) => `
<h1>Menu settimanale per bambini: porzioni giuste e piatti che piacciono</h1>
<p class="lead">Un menu settimanale per bambini non deve essere un menu diverso: i piatti di una famiglia che mangia in modo equilibrato vanno bene anche per loro. Quello che cambia è la porzione e qualche accorgimento su gusto e consistenze. Vediamo come, senza cucinare due volte.</p>
<h2>Quanto devono mangiare: le porzioni per età</h2>
<div class="scroll"><table class="tabella">
<tr><th>Età</th><th>Fabbisogno indicativo</th><th>Pasta/riso a pasto</th><th>Carne o pesce</th><th>Legumi (cotti)</th></tr>
<tr><td>3–5 anni</td><td>1.200–1.500 kcal</td><td>40–50 g</td><td>50–60 g</td><td>80–100 g</td></tr>
<tr><td>6–10 anni</td><td>1.400–1.900 kcal</td><td>50–70 g</td><td>60–80 g</td><td>100–120 g</td></tr>
<tr><td>11–14 anni</td><td>1.900–2.500 kcal</td><td>70–90 g</td><td>80–120 g</td><td>120–150 g</td></tr>
</table></div>
<p>Sono riferimenti medi (LARN): un bambino che fa sport ogni giorno sta nella parte alta, uno più tranquillo nella parte bassa. Il segnale che conta è la crescita regolare, non il piatto finito.</p>
<h2>Le regole che funzionano a tavola</h2>
<ul>
  <li><strong>Stesso piatto, porzione sua.</strong> Il bambino che vede gli adulti mangiare le stesse cose le accetta prima. Niente "menu bimbi".</li>
  <li><strong>Un alimento nuovo accanto a uno sicuro.</strong> I broccoli vicino alla pasta che piace, non al posto.</li>
  <li><strong>Verdura in due forme.</strong> Cruda a bastoncini da sgranocchiare e cotta nel piatto: una delle due di solito passa.</li>
  <li><strong>Legumi "nascosti" all’inizio.</strong> Passati nella pasta o in polpette; poi interi quando il sapore è familiare.</li>
  <li><strong>Lo spuntino è un pasto.</strong> Frutta, yogurt, pane e olio: non merendine. A metà mattina e a metà pomeriggio.</li>
</ul>
<h2>Esempio di settimana per una famiglia con bambini</h2>
${menuEsempio()}
<p>Colazione per i bambini: latte o yogurt con pane e marmellata, oppure cereali semplici e un frutto. Spuntini: frutta, crackers integrali, un pezzo di parmigiano.</p>
<h2>Cosa limitare, senza drammi</h2>
<p>Zuccheri aggiunti (succhi, merendine, cereali zuccherati), salumi oltre una volta a settimana, sale aggiunto. Non serve vietare: serve che la settimana sia piena di altro. La pizza del sabato è parte del menu, non uno strappo.</p>
${cta('Porzioni calcolate per ogni figlio, in automatico')}
<p>In MenuDieta ogni bambino ha il suo profilo: età, peso, altezza, attività. Il menu è quello della famiglia, le grammature sono le sue. <a href="${APP}">Prova gratis</a>. Per il metodo completo: <a href="/blog/come-organizzare-menu-settimanale-famiglia/">come organizzare il menu settimanale della famiglia</a>.</p>`,

  'blog/piano-alimentare-mantenimento': ({ APP, cta }) => `
<h1>Piano alimentare di mantenimento: come mangiare per restare al tuo peso</h1>
<p class="lead">Un piano alimentare di mantenimento è quello che mangi quando il peso è dove vuoi che resti: tante calorie quante ne consumi, distribuite in modo che tu non abbia fame e non debba contare niente per sempre. È la parte più trascurata delle diete, e quella che decide se il risultato dura.</p>
<h2>Quante calorie: il numero di mantenimento</h2>
<p>Le calorie di mantenimento sono il tuo fabbisogno giornaliero: metabolismo basale per livello di attività. Puoi calcolarlo in 10 secondi con il <a href="/calcolo-fabbisogno-calorico/">calcolatore LARN</a>. Attenzione a un dettaglio: dopo una dieta il fabbisogno reale è spesso un 5–10% più basso del calcolato, perché il corpo si è adattato. Il metodo sicuro è salire di 100–150 kcal a settimana dalla dieta fino a stabilizzare il peso: quello è il tuo numero.</p>
<h2>Cosa mangiare: la ripartizione</h2>
<ul>
  <li><strong>Proteine</strong> 1–1,2 g per kg di peso (di più se ti alleni): sono quelle che tengono la sazietà e il muscolo.</li>
  <li><strong>Carboidrati</strong> 45–55% delle calorie, da cereali il più possibile integrali, legumi, frutta.</li>
  <li><strong>Grassi</strong> 25–30%, soprattutto olio extravergine, frutta secca, pesce.</li>
  <li><strong>Verdura</strong> a ogni pasto, senza pesarla.</li>
</ul>
<h2>Come costruire la settimana</h2>
<p>Il mantenimento funziona se è <em>noioso</em> nel senso buono: una struttura che si ripete. Colazione quasi sempre uguale, pranzo con un cereale + una proteina + verdura, cena con una proteina + verdura + pane o patate, due spuntini di frutta o yogurt. Dentro questa struttura i piatti cambiano ogni giorno e il ritmo delle proteine (legumi 3, pesce 2, carne bianca 2, uova 2) copre tutto il resto. Un esempio concreto: <a href="/menu-settimanale-famiglia/">menu settimanale per la famiglia</a>.</p>
<h2>I tre errori che fanno riprendere peso</h2>
<ol>
  <li><strong>Passare da "dieta" a "libero" di colpo.</strong> Il mantenimento è un piano, con porzioni; solo più abbondanti.</li>
  <li><strong>Smettere di pesarsi.</strong> Una volta a settimana, stesso giorno e ora. Se il peso sale di 2 kg per due settimane di fila, si torna per 2 settimane a −300 kcal. Mai aspettare i 5 kg.</li>
  <li><strong>Mangiare diverso dalla famiglia.</strong> È la causa più comune di abbandono. Il piano va condiviso: stessi piatti, porzione tua.</li>
</ol>
${cta('Il mantenimento, settimana dopo settimana, senza contare')}
<p>MenuDieta calcola le tue calorie di mantenimento, genera il menu con le grammature giuste e tiene il grafico del peso: se la media sale, lo vedi prima che diventi un problema. <a href="${APP}">Prova gratis</a>. Utile anche: <a href="/peso-forma-calcolo/">calcolo del peso forma</a>.</p>`,
};
