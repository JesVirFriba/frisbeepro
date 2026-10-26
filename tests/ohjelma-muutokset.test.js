process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-14T10:00:00+02:00'; process.env.GIST_DATA='/home/claude/repo_tests/tests/fixtures/empty.json';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ console.log(w.eval(`(function(){
 const R=[]; const ok=(n,c,x='')=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,230):''));
 const tryit=(n,f)=>{try{f();}catch(e){R.push('VIRHE '+n+': '+e.message+' @'+(e.stack||'').split('\\n')[1]);}};
 const add=(ds,n)=>{const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return dateStr(d);};
 const st=n=>n<=8?add('2026-10-12',7*(n-1)):add('2026-12-07',7*(n-9));
 const sum=m=>Object.values(m).reduce((a,b)=>a+b,0);
 tryit('nopeuspäivä',()=>{ const S=STR_DATA.find(s=>s.id==='strN'); const ids=S.exercises.map(e=>e.id).join();
   ok('nopeuspäivän liikkeet: sn0 sn1 sn3 sn6 sn7 sl1 sl2 sc1 sc3 (box squat jump tasajalkaa mukana, valinnaiset ja karsitut pois)', ids==='sn0,sn1,sn3,sn6,sn7,sl1,sl2,sc1,sc3', ids);
   ok('tasajalka-box-hyppy säilyy ja on nimetty', S.exercises.find(e=>e.id==='sn3').name.indexOf('tasajalkaa')>=0);
   const wk=4; const sets=S.exercises.map(e=>e.sets[wk]||0); const tot=sets.reduce((a,b)=>a+b,0); ok('nopeuspäivä vk 5: 25 sarjaa (ennen 43)', tot===25, tot+' sarjaa: '+sets.join('+'));
   ok('ei valinnaisia (leuat, RDL) ja ei ydinliikkeistä woodchop/sivulankku', !S.exercises.some(e=>e.grp==='opt'||e.id==='sc2'||e.id==='sc4'));
   ok('ydinlohko: Pallof + voimapyörä (vk 5: 6 sarjaa)', S.exercises.filter(e=>e.grp==='core').map(e=>e.name).join('|')==='Pallof-puristus (anti-rotaatio)|Voimapyörä (ab wheel)'); });
 tryit('dead bug -> voimapyörä',()=>{ const all=STR_DATA.flatMap(s=>s.exercises); ok('Dead bug ei esiinny missään ohjelmassa', !all.some(e=>/dead ?bug/i.test(e.name+' '+(e.hint||''))), all.filter(e=>/dead ?bug/i.test(e.name+' '+(e.hint||''))).map(e=>e.id).join());
   ok('voimapyörä jalkapäivässä, nopeuspäivässä ja nivelterveydessä (sj9, sc3, nh5)', ['sj9','sc3','nh5'].every(id=>(all.find(e=>e.id===id)||{}).name==='Voimapyörä (ab wheel)')); });
 tryit('leuat pääliikkeenä',()=>{ ok('yläkroppapäivän leuanveto (sb3) säilyy', STR_DATA.flatMap(s=>s.exercises).some(e=>e.id==='sb3')); });
 tryit('nopeuspäivä UI',()=>{ showPg('train'); trainTab('str',null); const t=document.getElementById('train-content').textContent; ok('Voima-sivu piirtyy ilman NaN/undefined', !/NaN|undefined|\\[object/.test(t)); openSession('str','2026-11-13','teho'); const t2=document.getElementById('train-content').textContent.replace(/\\s+/g,' ');
   ok('nopeustreeni-kortti: 9 liikettä, ydinlohko ~8 min, ei "Täydentävä osa"', /Nopeustreeni/.test(t2)&&/ydinlohko \\(~8 min\\)/i.test(t2.toLowerCase().replace('ydinlohko (~8 min)','ydinlohko (~8 min)'))&&!/Täydentävä osa/.test(t2)&&/Box squat jump tasajalkaa/.test(t2)&&/Voimapyörä/.test(t2)&&!/Woodchop|Sivulankku|Leuanveto \\(valinnainen/.test(t2), (t2.match(/Nopeustreeni[^|]{0,60}/)||[''])[0]); });
 tryit('sunnuntai',()=>{ localStorage.setItem('fp_week_off','0'); showPg('train'); trainTab('week',null); const root=document.getElementById('train-content');
   const cards=Array.from(root.querySelectorAll('div[onclick]')).filter(e=>/(^|\\s)Su\\b/i.test(e.textContent.slice(0,6))||/15\\.$/.test((e.textContent.match(/\\d+\\./)||[''])[0]));
   const html=root.innerHTML; const idx=html.indexOf('trainTabPick'); 
   const pick=Array.from(root.querySelectorAll('[onclick^="trainTabPick"]')).map(e=>e.getAttribute('onclick'));
   const sundayPick=pick.find(p=>/2026-11-15/.test(p)); ok('su 15.11.: kortti avaa valitsimen (mob, hermosto, peruskunto + lepopäivä)', !!sundayPick&&/mob/.test(sundayPick)&&/peruskunto/.test(sundayPick)&&/hermosto/.test(sundayPick)&&/lepo/.test(sundayPick), sundayPick);
   const chips=Array.from(root.querySelectorAll('.sess-chip')).filter(e=>/toggleSubCheck\\('2026-11-15'/.test(e.getAttribute('onclick')||'')); ok('su 15.11.: kuittausmerkit (liikkuvuus, hermosto, peruskunto), ei lepo-merkkiä', chips.length===3&&!chips.some(e=>/'lepo'/.test(e.getAttribute('onclick'))), chips.map(e=>e.textContent.trim()).join('|'));
   if(chips[0]){ chips.forEach(e=>e.click()); const done=getDone('2026-11-15'); ok('kaikki kolme kuitattu → päivä merkitään tehdyksi', !!done); }
   const restFull=Array.from(root.querySelectorAll('[onclick*="rest_day"]')).length; R.push('INFO lepopäivä-kortteja suoraan rest_day-sivulle tällä viikolla: '+restFull); });
 tryit('putti la C2',()=>{ for(const n of [3,4,5,7,8,10,15,16]){ const c=puttiDataFor(add(st(n),n===8?3:5),n), i=puttiDataFor(add(st(n),1),n); const T=sum(c.perStyle)*2+20, TI=sum(i.perStyle)*2+10;
     if(!c.finale||c.finale.dist!==10||c.finale.styles.join()!=='n,h')R.push('VIRHE vk'+n+' C2 loppusarja väärä'); const k=Object.keys(c.perStyle).map(Number);
     ok('vk'+n+': C2 '+T+' putin sessio'+(n===8?' (testiviikko)':' = sisäsessio '+TI)+' · lohkot '+JSON.stringify(c.perStyle)+' · lyhin '+Math.min.apply(null,k)+' m', (n===8?T===60:T===TI), 'sum(mix)='+sum(c.mix)); }
   showPg('train'); trainTab('putti',null); const root=document.getElementById('train-content');
   const rows=Array.from(root.querySelectorAll('.pt-row')).map(r=>r.dataset.d+':'+r.dataset.plan+(r.dataset.fin?'f'+r.dataset.style:'')).join(' ');
   ok('la 14.11. (vk 5): rivit 10, 12, 14, 16 m + loppusarjat 10 m normaali ja haara', rows==='10:10 12:15 14:15 16:10 F10:10fn F10:10fh', rows);
   const t=root.textContent.replace(/\\s+/g,' '); ok('yhteensä 0 / 120 putin tavoite', /0 \\/ 120/.test(t), (t.match(/\\d+ \\/ \\d+/)||[''])[0]); ok('ohjelmakortti: loppusarja 10 m, normaali + haara; 120 puttia/sessio; viikkosumma 600', /10 m, 10 puttia peräkkäin normaalilla ja sitten 10 haaralla/.test(t)&&/120 puttia\\/sessio/.test(t)&&/600 puttia\\/vk/.test(t), (t.match(/Viikko 5[^|]{0,260}/)||[''])[0]);
   const fin=Array.from(root.querySelectorAll('.pt-row[data-fin="1"]')); for(const r of fin){ for(let k=0;k<10;k++) r.querySelector(k%3===2?'.pt-miss':'.pt-hit').click(); }
   const fin2=Array.from(document.getElementById('train-content').querySelectorAll('.pt-row[data-fin="1"]')); ok('kirjaus: kummallekin loppusarjalle 10 puttia (7/10 ja paras putki 2)', fin2.every(r=>/7\\/10 · paras putki 2/.test(r.querySelector('.pt-cnt').textContent)), fin2.map(r=>r.querySelector('.pt-cnt').textContent).join(' | '));
   document.getElementById('train-content').querySelector('#putti-tally-save').click(); const ss=get('putti_sessions')||[]; const last=ss[ss.length-1]; const f=(last&&last.sarjat||[]).filter(s=>s.putki);
   showPg('train'); trainTab('putti',null); const t3=document.getElementById('train-content').textContent.replace(/\\s+/g,' '); ok('tilasto: Putkisarjat 10 m · 2 sarjaa · keskiarvo 7.0/10 · paras putki 2', /10 m · 2 sarjaa · keskiarvo 7\\.0\\/10 · paras putki 2/.test(t3), (t3.match(/Putkisarjat[^|]{0,120}/)||[''])[0]);
   ok('tallennus: kaksi putkisarjaa 10 m (normaali ja haara)', f.length===2&&f.every(s=>s.dist===10&&s.made===7)&&f.map(s=>s.tyyli).sort().join()==='haara,normaali', JSON.stringify(f).slice(0,160)); });
 tryit('putti sisällä ennallaan',()=>{ localStorage.setItem('fp_putti_c2_2026-11-14','0'); showPg('train'); trainTab('putti',null); const rows=Array.from(document.getElementById('train-content').querySelectorAll('.pt-row')).map(r=>r.dataset.d+':'+r.dataset.plan).join(' '); ok('sisäsessio: 6/8/10 m + yksi 8 m loppusarja (vuorotteleva tyyli)', /6:10 8:15 10:20 F8:10/.test(rows), rows); localStorage.removeItem('fp_putti_c2_2026-11-14'); });
 return R.join('\\n'); })()`)); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
