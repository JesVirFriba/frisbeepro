process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-14T10:00:00+02:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ console.log(w.eval(`(function(){
 const R=[]; const ok=(n,c,x='')=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,190):''));
 const tryit=(n,f)=>{try{f();}catch(e){R.push('VIRHE '+n+': '+e.message+' @'+(e.stack||'').split('\\n')[1]);}};
 const add=(ds,n)=>{const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return dateStr(d);};
 const starts=[]; for(let n=1;n<=16;n++) starts.push(n<=8?add('2026-10-12',7*(n-1)):add('2026-12-07',7*(n-9)));
 const sum=m=>Object.values(m).reduce((a,b)=>a+b,0)*2; const keys=m=>Object.keys(m).map(Number);
 tryit('sisällä-tila',()=>{ localStorage.setItem('fp_putti_c2_2026-11-14','0'); showPg('train'); trainTab('putti',null); const root=document.getElementById('train-content'); const rows=Array.from(root.querySelectorAll('.pt-row')).map(r=>r.dataset.d+':'+r.dataset.plan).join(' ');
   ok('sisällä (la 14.11. käsin): rivit 4, 6, 8 (10), 10 kierrossa + putkisarjat F8 (normaali ja haara); ei erillistä 4 m numerokenttää', rows==='4:10 6:10 8:10 10:20 F8:10 F8:10'&&root.querySelectorAll('.pt-four').length===0, rows);
   const fin=root.querySelector('.pt-row[data-fin="1"]'); ok('sisällä-putkisarja 8 m', /Putkisarja · 8 m/.test(fin.textContent)); localStorage.removeItem('fp_putti_c2_2026-11-14'); });
 tryit('uudet etäisyydet tilastoissa',()=>{ const ss=(get('putti_sessions')||[]).slice(); ss.push({id:99991,date:'2026-11-15',tyyli:'normaali',sarjat:[{made:5,dist:11,tyyli:'normaali'},{made:4,dist:13,tyyli:'normaali'},{made:3,dist:15,tyyli:'haara'},{made:2,dist:16,tyyli:'haara'}]}); set('putti_sessions',ss);
   const t=puttiTotalsOf(getPuttiSessions()); ok('d11, d13, d15, d16 laskeutuvat tilastoihin (a=10 kukin)', t.d11.a>=10&&t.d13.a>=10&&t.d15.a>=10&&t.d16.a>=10&&t.d16.m>=2, [11,13,15,16].map(k=>k+':'+t['d'+k].m+'/'+t['d'+k].a).join(' '));
   ok('PTDISTS: C2 = 11–16 m', PTDISTS.filter(d=>d.circle==='C2').map(d=>d.dist).join()==='11,12,13,14,15,16'); const t0=document.body.textContent;
   ['putti','week'].forEach(tab=>{showPg('train');trainTab(tab,null);}); showPg('cal'); showPg('train'); trainTab('putti',null); ok('Putti-sivu piirtyy uusien etäisyyksien kanssa ilman NaN/undefined', !/NaN|undefined|\\[object/.test(document.getElementById('train-content').textContent)); });
 tryit('kaikki päivät',()=>{ const bad=[]; const d0=new Date('2026-10-12T12:00:00'); let n=0; for(let k=0;k<210;k++){ const d=new Date(d0); d.setDate(d.getDate()+k); const ds=dateStr(d); ['0','1'].forEach(v=>{ localStorage.setItem('fp_putti_c2_'+ds,v); const pd=puttiDataFor(ds,Math.max(1,Math.min(16,offWeekN(ds)))); const t=JSON.stringify(pd); if(/NaN|undefined/.test(t))bad.push(ds+' '+v+' NaN'); if(!Object.keys(pd.perStyle).length&&!pd.finale)bad.push(ds+' tyhjä'); const ph=offseasonPhaseOf(weekStartOf(ds)); if(ph!==4&&pd.finale){ const tot=sum(pd.perStyle)+(pd.finale.styles?20:10); if(tot!==sum(pd.mix&&Object.fromEntries(Object.entries(pd.mix).map(([k,x])=>[k,x/2]))||{}))bad.push(ds+' '+v+' määrä '+tot+'≠'+sum(Object.fromEntries(Object.entries(pd.mix).map(([k,x])=>[k,x/2])))); } n++; }); localStorage.removeItem('fp_putti_c2_'+ds); }
   ok('puttiDataFor: kaikille päiville 12.10.–9.5. molemmissa tiloissa, määrät täsmäävät pd.mix:iin ('+n+' tarkistusta)', bad.length===0, bad.slice(0,4).join(' | ')); });
 return R.join('\\n'); })()`)); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
