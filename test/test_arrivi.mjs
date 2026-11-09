// Arrivi dal sito: #da=<pagina> (nuovo) e ?da=<pagina> (vecchi link) letti e tolti dall’indirizzo
import { leggiDa } from '@/db/arrivi';
const casi = [['', '#da=alimenti/mozzarella', {da:'alimenti/mozzarella', search:'', hash:''}], ['?kit=1&A=2', '#da=kit-di-emergenza', {da:'kit-di-emergenza', search:'?kit=1&A=2', hash:''}], ['?da=home', '', {da:'home', search:'', hash:''}], ['', '#trasloco=abc&da=home', {da:'home', search:'', hash:'#trasloco=abc'}], ['', '', null]];
let ok=true; for (const [s,h,att] of casi) { const r=leggiDa(s,h); const p=JSON.stringify(r)===JSON.stringify(att); ok&&=p; console.log(p?'✓':'✗', s, h, JSON.stringify(r)); }
process.exit(ok?0:1);
