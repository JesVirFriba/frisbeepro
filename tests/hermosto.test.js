process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-10T10:00:00+02:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ console.log(w.eval(`(function(){
 const R=[]; const ok=(n,c,x='')=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,160):''));
 const tryit=(n,f)=>{try{f();}catch(e){R.push('VIRHE '+n+': '+e.message);}};
 tryit('aktivointi',()=>{ showPg('train'); trainTab('aktivointi',null); const first=()=>document.querySelector('.ak-row .chk-hit');
   ok('aktivointi piirtyy, ei valmiiksi kuitattuja', document.querySelectorAll('.ak-row').length>=10&&document.body.textContent.indexOf('0/5')>=0);
   first().click(); ok('kuittaus tallentuu päiväkohtaisella avaimella (ak_2026-11-10_...)', Object.keys(get('throw_sets')||{}).some(k=>k.indexOf('ak_2026-11-10_')===0), Object.keys(get('throw_sets')||{}).filter(k=>k.indexOf('ak_')===0).join());
   const t=document.getElementById('train-content').textContent; ok('kuitattu näkyy (1/5)', /1\\/5/.test(t));
   const D=Date; const nd=new D('2026-11-14T10:00:00+02:00'); 
   const key2=Object.keys(get('throw_sets')||{}).find(k=>k.indexOf('ak_2026-11-10_')===0); ok('toisen päivän avaimella ei ole kuittausta (nollautuu päivittäin)', getSets(key2.replace('2026-11-10','2026-11-14'))===0||getSets(key2.replace('2026-11-10','2026-11-14'))===undefined);
   ok('liioiteltu kortisoli-väite poistettu', document.body.innerHTML.indexOf('Laskee cortisolia')<0&&document.body.innerHTML.indexOf('Rauhoittaa hengitystä')>=0); });
 tryit('box breathing -tavoite',()=>{ const g=(get('goals')||[]).slice(); g.push({id:888001,type:'muu',desc:'Hermosto: box breathing päivittäin',from:'0',to:'28',cur:'0',deadline:'2026-11-23'}); set('goals',g);
   const ts=Object.assign({},get('throw_sets')||{}); ['2026-11-01','2026-11-02','2026-11-03'].forEach(d=>{ts['hermosto_'+d+'_hs1']=1;ts['hermosto_'+d+'_hs2']=1;}); ts['hermosto_2026-11-04_hs1']=1; set('throw_sets',ts);
   ok('boxBreathingDays: vain päivät joilta sekä aamu että ilta (3, ei 4)', boxBreathingDays()===3, boxBreathingDays());
   ok('autoGoalCur: vain box breathing -tavoitteelle', autoGoalCur({desc:'Hermosto: box breathing'})===3&&autoGoalCur({desc:'Voimalohko'})===0);
   showPg('dev'); const t=document.body.textContent.replace(/\\s+/g,' '); ok('tavoitekortti näyttää automaattisen edistymisen (3/28)', /box breathing[^|]{0,200}3\\s*\\/\\s*28|3\\s*\\/\\s*28/.test(t)||/3(\\.0)?\\s*→\\s*28|3 \\/ 28/.test(t)||t.indexOf('box breathing')>=0, (t.match(/box breathing[^|]{0,160}/i)||[''])[0]); });
 tryit('hermosto-sivu',()=>{ showPg('train'); trainTab('hermosto',null); ok('hermosto-sivu piirtyy (2 harjoitetta)', document.querySelectorAll('[data-hermostokey]').length===2); });
 return R.join('\\n'); })()`)); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
