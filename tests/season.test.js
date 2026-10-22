process.env.TZ='Europe/Helsinki';
const {boot,APP}=require('./harness.js'); 
(async()=>{ const out=[]; const ok=(n,c,x='')=>out.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+x:''));
 for(const [d,exp] of [['2026-11-14',false],['2027-04-26',false],['2027-05-03',true],['2027-05-10',true],['2027-06-14',true],['2027-09-01',true]]){
   process.env.FAKE_NOW=d+'T10:00:00+03:00'; delete require.cache[require.resolve('./harness.js')]; const {boot:b}=require('./harness.js'); const {w,errors}=b(APP); await new Promise(r=>setTimeout(r,1000));
   const r=w.eval(`(function(){ showPg('train'); trainTab('week',null); const el=document.getElementById('season-banner'); return el?el.textContent.replace(/\\s+/g,' ').slice(0,170):null; })()`);
   ok(d+': kisakausi-banneri '+(exp?'näkyy':'ei näy'), (!!r)===exp&&errors.length===0, r||('JS-virheitä '+errors.length)); }
 console.log(out.join('\n')); process.exit(0); })();
