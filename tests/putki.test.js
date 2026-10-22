process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-14T10:00:00+02:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ console.log(w.eval(`(function(){
 const R=[]; const ok=(n,c,x='')=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,190):''));
 const tryit=(n,f)=>{try{f();}catch(e){R.push('VIRHE '+n+': '+e.message+' @'+(e.stack||'').split('\\n')[1]);}};
 const add=(ds,n)=>{const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return dateStr(d);};
 const starts=[]; for(let n=1;n<=16;n++) starts.push(n<=8?add('2026-10-12',7*(n-1)):add('2026-12-07',7*(n-9)));
 const sum=m=>Object.values(m).reduce((a,b)=>a+b,0)*2; const keys=m=>Object.keys(m).map(Number);
 tryit('taulukko',()=>{ const exp={1:[100,0],2:[100,0],3:[100,60],4:[120,80],5:[120,80],6:[120,80],7:[120,100],9:[120,100],10:[140,120],11:[140,120],12:[140,120],13:[140,120],14:[140,120],15:[100,80],16:[110,70]}; let bad=[];
   Object.entries(exp).forEach(([n,[ind,c2]])=>{ n=+n; const st=starts[n-1]; const di=puttiDataFor(add(st,1),n); const dc=puttiDataFor(add(st,5),n);
     if(!di.finale||di.finale.dist!==8||di.finale.n!==10)bad.push('vk'+n+' sisällä ei putkisarjaa 8 m'); if(sum(di.perStyle)+10!==(n<=2?100:ind))bad.push('vk'+n+' sisällä '+sum(di.perStyle)+'+10≠'+ind); if(keys(di.perStyle).some(k=>k>10))bad.push('vk'+n+' sisällä >10 m');
     if(n>=3){ if(!dc.c2||!dc.finale||dc.finale.dist!==12)bad.push('vk'+n+' C2: ei putkisarjaa 12 m'); if(sum(dc.perStyle)+10!==c2)bad.push('vk'+n+' C2 '+sum(dc.perStyle)+'+10≠'+c2); const k=keys(dc.perStyle); if(!k.includes(10)||!k.includes(12)||!k.includes(14))bad.push('vk'+n+' C2:sta puuttuu 10/12/14'); if(n>=4&&n!==8&&!k.includes(16))bad.push('vk'+n+' C2:sta puuttuu 16 m'); if(n===3&&k.includes(16))bad.push('vk3 ei vielä 16 m'); } });
   ok('vk 1–16: sisällä aina 8 m putkisarja (10 putkeen), C2 12 m putkisarja; C2-etäisyydet 10/12/14 (16 m vk 4+); määrät ennallaan', bad.length===0, bad.join(' | ')); });
 tryit('vk8',()=>{ const st=starts[7]; const to=puttiDataFor(add(st,3),8), pe=puttiDataFor('2026-12-04',8), ti=puttiDataFor(add(st,1),8);
   ok('vk 8: to C2 = 10/12/14 m, 50 putin sessio (40+putkisarja 12 m); pe 40 putin (4 m, 10 m + putkisarja); ti 80', to.c2&&keys(to.perStyle).join()==='10,12,14'&&sum(to.perStyle)+10===50&&pe.finale.dist===8&&sum(pe.perStyle)+10===40&&sum(ti.perStyle)+10===80, JSON.stringify(to.perStyle)+' | '+JSON.stringify(pe.perStyle)); });
 tryit('tyyli',()=>{ const a=puttiDataFor('2026-11-10',5).finale.style, b=puttiDataFor('2026-11-11',5).finale.style, c=puttiDataFor('2026-11-12',5).finale.style; ok('putkisarjan tyyli vaihtuu päivittäin (n/h)', a!==b&&a===c&&['n','h'].includes(a), a+b+c); });
 tryit('vaihe3-4',()=>{ const sat=puttiDataFor('2027-02-06',1), wed=puttiDataFor('2027-02-03',1), ph4=puttiDataFor('2027-05-04',1);
   ok('Vaihe 3: la C2 sis. 16 m + putkisarja 12 m (80 putin sessio), ke sisällä putkisarja 8 m; viikkosumma 320', sat.c2&&keys(sat.perStyle).includes(16)&&sat.finale.dist===12&&sum(sat.perStyle)+10===80&&wed.finale.dist===8&&sum(wed.perStyle)+10===120&&wed.weekTotal===320, JSON.stringify(sat.perStyle)+' | '+JSON.stringify(wed.perStyle));
   ok('Vaihe 4 (kisaviikko): ei putkisarjaa', !ph4.finale); });
 tryit('UI la (C2)',()=>{ showPg('train'); trainTab('putti',null); const root=()=>document.getElementById('train-content'); const t=root().textContent.replace(/\\s+/g,' ');
   const rows=Array.from(root().querySelectorAll('.pt-row')).map(r=>r.dataset.d+':'+r.dataset.plan).join(' ');
   ok('la 14.11. (vk 5): rivit 10, 12, 14, 16 m + putkisarja (F12) viimeisenä', rows==='10:10 12:10 14:10 16:5 F12:10', rows);
   const fin=root().querySelector('.pt-row[data-fin="1"]'); ok('putkisarja-rivi: otsikko, tyyli, ohje', !!fin&&/Putkisarja · 12 m/.test(fin.textContent)&&/(Normaali|Haara)/.test(fin.textContent)&&/10 puttia peräkkäin/.test(fin.textContent)&&fin.dataset.style===puttiDayStyle('2026-11-14'), fin&&fin.textContent.replace(/\\s+/g,' ').slice(0,120));
   ok('yhteensä 0 / 80 putin tavoite (sis. putkisarja)', /0 \\/ 80/.test(t), (t.match(/\\d+ \\/ \\d+/)||[''])[0]);
   ok('ohjelmakortti: "Lopuksi putkisarja: 10 puttia peräkkäin 12 m"', /Lopuksi putkisarja: 10 puttia peräkkäin 12 m/.test(t)); });
 tryit('viikkosumma kortissa',()=>{ showPg('train'); trainTab('putti',null); const t=document.getElementById('train-content').textContent.replace(/\\s+/g,' '); ok('ohjelmakortti: 80 puttia/sessio · 4 + C2 = 560 puttia/vk', /80 puttia\\/sessio/.test(t)&&/560 puttia\\/vk/.test(t), (t.match(/Viikko 5[^|]{0,230}/)||[''])[0]); });
 tryit('putkisarjan kirjaus',()=>{ const root=()=>document.getElementById('train-content'); const finRow=()=>root().querySelector('.pt-row[data-fin="1"]'); const pat='1110111011';
   for(const ch of pat){ finRow().querySelector(ch==='1'?'.pt-hit':'.pt-miss').click(); }
   finRow().querySelector('.pt-hit').click(); // 11. ei saa mennä läpi
   const cnt=finRow().querySelector('.pt-cnt').textContent; ok('10 putin jälkeen laskuri 8/10 · paras putki 3, 11. ei kirjaudu', /8\\/10 · paras putki 3/.test(cnt)&&finRow().querySelectorAll('.pt-dots span').length===10, cnt);
   finRow().querySelector('.pt-undo').click(); ok('kumoa poistaa viimeisen (7/9)', /7\\/9/.test(finRow().querySelector('.pt-cnt').textContent)); finRow().querySelector('.pt-hit').click();
   const r12=root().querySelector('.pt-row[data-d="12"]'); for(let i=0;i<3;i++)r12.querySelector('.pt-hit').click();
   const before=(get('putti_sessions')||[]).length; root().querySelector('#putti-tally-save').click(); const ss=get('putti_sessions')||[]; const last=ss[ss.length-1];
   const f=last.sarjat.find(s=>s.putki); const reg=last.sarjat.find(s=>s.dist===12&&!s.putki);
   ok('tallennus: putkisarja {dist 12, made 8, putki, jono 1110111011}, tyyli oikein; tavallinen 12 m -rivi erillään (n 3)', ss.length===before+1&&f&&f.dist===12&&f.made===8&&f.jono===pat&&f.tyyli===(puttiDayStyle('2026-11-14')==='h'?'haara':'normaali')&&reg&&reg.n===3&&reg.made===3, JSON.stringify(last.sarjat));
   showPg('train'); trainTab('putti',null); const t=document.getElementById('train-content').textContent.replace(/\\s+/g,' ');
   ok('tilasto: "🔟 Putkisarjat" 12 m · keskiarvo 8.0/10 · paras putki 3', /Putkisarjat/.test(t)&&/12 m · 1 sarjaa · keskiarvo 8\\.0\\/10 · paras putki 3/.test(t), (t.match(/Putkisarjat[^|]{0,140}/)||[''])[0]); });
 tryit('sisällä-tila',()=>{ localStorage.setItem('fp_putti_c2_2026-11-14','0'); showPg('train'); trainTab('putti',null); const root=document.getElementById('train-content'); const rows=Array.from(root.querySelectorAll('.pt-row')).map(r=>r.dataset.d+':'+r.dataset.plan).join(' ');
   ok('sisällä (la 14.11. käsin): rivit 6, 8 (15), 10 + putkisarja F8; 4 m numeroruutu mukana', /6:10 8:15 10:20 F8:10/.test(rows)&&root.querySelectorAll('.pt-four').length===2, rows);
   const fin=root.querySelector('.pt-row[data-fin="1"]'); ok('sisällä-putkisarja 8 m', /Putkisarja · 8 m/.test(fin.textContent)); localStorage.removeItem('fp_putti_c2_2026-11-14'); });
 tryit('uudet etäisyydet tilastoissa',()=>{ const ss=(get('putti_sessions')||[]).slice(); ss.push({id:99991,date:'2026-11-15',tyyli:'normaali',sarjat:[{made:5,dist:11,tyyli:'normaali'},{made:4,dist:13,tyyli:'normaali'},{made:3,dist:15,tyyli:'haara'},{made:2,dist:16,tyyli:'haara'}]}); set('putti_sessions',ss);
   const t=puttiTotalsOf(getPuttiSessions()); ok('d11, d13, d15, d16 laskeutuvat tilastoihin (a=10 kukin)', t.d11.a>=10&&t.d13.a>=10&&t.d15.a>=10&&t.d16.a>=10&&t.d16.m>=2, [11,13,15,16].map(k=>k+':'+t['d'+k].m+'/'+t['d'+k].a).join(' '));
   ok('PTDISTS: C2 = 11–16 m', PTDISTS.filter(d=>d.circle==='C2').map(d=>d.dist).join()==='11,12,13,14,15,16'); const t0=document.body.textContent;
   ['putti','week'].forEach(tab=>{showPg('train');trainTab(tab,null);}); showPg('cal'); showPg('train'); trainTab('putti',null); ok('Putti-sivu piirtyy uusien etäisyyksien kanssa ilman NaN/undefined', !/NaN|undefined|\\[object/.test(document.getElementById('train-content').textContent)); });
 tryit('kaikki päivät',()=>{ const bad=[]; const d0=new Date('2026-10-12T12:00:00'); let n=0; for(let k=0;k<210;k++){ const d=new Date(d0); d.setDate(d.getDate()+k); const ds=dateStr(d); ['0','1'].forEach(v=>{ localStorage.setItem('fp_putti_c2_'+ds,v); const pd=puttiDataFor(ds,Math.max(1,Math.min(16,offWeekN(ds)))); const t=JSON.stringify(pd); if(/NaN|undefined/.test(t))bad.push(ds+' '+v+' NaN'); if(!Object.keys(pd.perStyle).length&&!pd.finale)bad.push(ds+' tyhjä'); const ph=offseasonPhaseOf(weekStartOf(ds)); if(ph!==4&&pd.finale){ const tot=sum(pd.perStyle)+10; if(tot!==sum(pd.mix&&Object.fromEntries(Object.entries(pd.mix).map(([k,x])=>[k,x/2]))||{}))bad.push(ds+' '+v+' määrä '+tot+'≠'+sum(Object.fromEntries(Object.entries(pd.mix).map(([k,x])=>[k,x/2])))); } n++; }); localStorage.removeItem('fp_putti_c2_'+ds); }
   ok('puttiDataFor: kaikille päiville 12.10.–9.5. molemmissa tiloissa, määrät täsmäävät pd.mix:iin ('+n+' tarkistusta)', bad.length===0, bad.slice(0,4).join(' | ')); });
 return R.join('\\n'); })()`)); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
