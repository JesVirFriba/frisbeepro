process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-13T10:00:00+02:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ console.log(w.eval(`(function(){
 const R=[]; const ok=(n,c,x='')=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,230):''));
 const tryit=(n,f)=>{try{f();}catch(e){R.push('VIRHE '+n+': '+e.message);}};
 set('profile',{rating:923,metrix:938,target:940,metrix_target:970,bh_target:125,fh_target:110});
 const cs=[]; for(let i=0;i<20;i++)cs.push({id:i+1,date:'2026-08-'+String(i+1).padStart(2,'0'),mrating:i<4?900:960});
 set('comps',cs);
 tryit('yksi laskenta kaikkialla',()=>{
   ok('currentMetrix = 16 viimeisen keskiarvo (960)', currentMetrix()===960, currentMetrix());
   showPg('profile'); ok('etusivu näyttää 960', /960\\s*Metrix/.test(document.getElementById('pv').textContent.replace(/\\s+/g,' ').replace('Metrix','Metrix')) || document.getElementById('pv').textContent.indexOf('960')>=0);
   renderSettings(); ok('asetuskenttä näyttää 960 eikä vanhaa 938', document.getElementById('s-metrix').value==='960', document.getElementById('s-metrix').value);
   ok('chat-teksti ei sisällä vanhaa 938', buildCtx().indexOf('Metrix: 960')>=0 && buildCtx().indexOf('938')<0); });
 return R.join('\\n'); })()`)); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
