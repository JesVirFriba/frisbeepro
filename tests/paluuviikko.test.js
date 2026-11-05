process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-10T10:00:00+02:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ console.log(w.eval(`(function(){
 const R=[]; const ok=(n,c,x='')=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,230):''));
 const tryit=(n,f)=>{try{f();}catch(e){R.push('VIRHE '+n+': '+e.message+' @'+(e.stack||'').split('\\\\n')[1]);}};
 const sum=m=>Object.values(m).reduce((a,b)=>a+b,0);
 tryit('ilman tapahtumaa',()=>{ ok('ei paluuikkunaa ilman sairaustapahtumaa (10.11.), tammikuun kiinteä ikkuna on (21.1.2027: lomalta)', returnWindowOf('2026-11-10')===null&&returnWindowOf('2027-01-21')&&returnWindowOf('2027-01-21').label==='lomalta'); });
 const base={}; tryit('perusluvut ilman tapahtumaa',()=>{ const pd=puttiDataFor('2026-11-10',5), pc=puttiDataFor('2026-11-14',5); base.ind=JSON.stringify(pd.perStyle); base.c2=JSON.stringify(pc.perStyle); base.wt=pd.weekTotal; ok('perus: sisäsessio {4:10,6:10,8:10,10:20}, C2 {10:10,12:16,14:16,16:8}, viikkosumma 600', base.ind==='{"4":10,"6":10,"8":10,"10":20}'&&base.c2==='{"10":10,"12":16,"14":16,"16":8}'&&base.wt===600, base.ind+' '+base.c2+' '+base.wt); });
 set('events',[{id:5001,type:'loma',name:'Sairaana - lepo',icon:'🤒',date:'2026-10-30',dateTo:'2026-11-07'},{id:5002,type:'loma',name:'Sairaana - vanha jakso',date:'2026-10-05',dateTo:'2026-10-11'}]);
 tryit('ikkuna',()=>{ const d=x=>{const r=returnWindowOf(x);return r?r.label:null;};
   ok('paluuikkuna alkaa jakson päättymistä seuraavasta päivästä (8.11.) ja kestää 8 päivää (15.11.); 16.11. normaali; vanha jakso 5.–11.10. ei vaikuta', d('2026-11-07')===null&&d('2026-11-08')==='sairaudesta'&&d('2026-11-15')==='sairaudesta'&&d('2026-11-16')===null&&d('2026-10-13')===null, ['2026-11-07','2026-11-08','2026-11-15','2026-11-16','2026-10-13'].map(x=>x+':'+d(x)).join(' ')); });
 tryit('lepo',()=>{ const wk=o=>buildWeekPlan(getWeekDates(weekOffsetOf(new Date(o+'T12:00:00')))); const days=wk('2026-11-02').concat(wk('2026-10-30')).filter(x=>x.date>='2026-10-30'&&x.date<='2026-11-07'); const uniq={}; days.forEach(x=>uniq[x.date]=x);
   ok('30.10.–7.11. kaikki päivät ovat lepopäiviä (9 päivää)', Object.keys(uniq).length===9&&Object.values(uniq).every(x=>x.intensity==='rest'), Object.values(uniq).map(x=>x.date.slice(5)+':'+x.intensity).join(' ')); });
 tryit('voima',()=>{ trainCtxSession='voima_a'; trainCtxDate='2026-11-10'; strManualWk=null; let sp=strProgramCtx(); const ex=sp.data.find(s=>s.id==='strA').exercises[0]; const norm=sp.cfgAt(ex,sp.wk).sets, red=sp.cfg(ex).sets;
   ok('voima 10.11.: paluu sairaudesta, −1 sarja, otsikossa maininta', sp.reentry===true&&sp.retLabel==='sairaudesta'&&/paluu sairaudesta/.test(sp.title)&&red===Math.max(1,norm-1), 'sarjat '+norm+'→'+red+' | '+sp.title.slice(-60));
   trainCtxDate='2026-11-16'; sp=strProgramCtx(); ok('voima 16.11.: normaali ohjelma', sp.reentry===false&&!/paluu/.test(sp.title)); });
 tryit('heitto',()=>{ const prog=throwProgramFor('2026-11-10','tek'); const base0=(THROW_SESSIONS[prog.cw]||[]).find(s=>/^t[12]/.test(s.id)); const sums=s=>s.exercises.reduce((a,e)=>a+(e.totalSets||0),0);
   const withR=thAdapt(base0,prog), noR=thAdapt(base0,Object.assign({},prog,{ret:null}));
   ok('heitto 10.11.: PALUU SAIRAUDESTA -teksti ja sarjat vähintään −20 % (nopeusheitot −50 %)', !!prog.ret&&/PALUU SAIRAUDESTA/.test(prog.note)&&sums(withR)<=sums(noR)*0.8, 'sarjat '+sums(noR)+'→'+sums(withR)); });
 tryit('putti',()=>{ const pd=puttiDataFor('2026-11-10',5), pc=puttiDataFor('2026-11-14',5);
   ok('putti sisällä 10.11.: lohkot ~70 % parillisina {4:8,6:8,8:8,10:14}, loppusarja 8 m normaali + haara ennallaan, viikkosumma 450, maininta', JSON.stringify(pd.perStyle)==='{"4":8,"6":8,"8":8,"10":14}'&&pd.finale.dist===8&&pd.finale.styles.join()==='n,h'&&pd.weekTotal===450&&/paluu sairaudesta/.test(pd.label||''), JSON.stringify(pd.perStyle)+' '+pd.weekTotal);
   ok('putti C2 14.11.: {10:8,12:12,14:12,16:6}, loppusarja 10 m', JSON.stringify(pc.perStyle)==='{"10":8,"12":12,"14":12,"16":6}'&&pc.finale.dist===10, JSON.stringify(pc.perStyle));
   const jan=puttiDataFor('2027-01-21',15); ok('tammikuun paluuviikko: putti ei skaalata kahdesti (4:10, 6:10, 10:20)', JSON.stringify(jan.perStyle)==='{"4":10,"6":10,"10":20}', JSON.stringify(jan.perStyle)); });
 tryit('parilliset',()=>{ const bad=[]; ['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13','2026-11-14','2026-11-15'].forEach(ds=>{ ['0','1'].forEach(v=>{ localStorage.setItem('fp_putti_c2_'+ds,v); const pd=puttiDataFor(ds,5); Object.entries(pd.perStyle).forEach(([d,n])=>{if(n%2||n<2)bad.push(ds+' '+v+' '+d+':'+n);}); localStorage.removeItem('fp_putti_c2_'+ds); }); });
   ok('paluuviikon putti-määrät parillisia', bad.length===0, bad.join(' | ')); });
 tryit('banneri',()=>{ showPg('train'); trainTab('week',null); const b=document.getElementById('return-banner'); ok('viikkonäkymässä Paluuviikko-banneri (10.11.)', !!b&&b.textContent.indexOf('Paluuviikko (sairaudesta)')>=0, b&&b.textContent.slice(0,80)); });
 set('events',[{id:5001,type:'loma',name:'Sairaana 30.10.–4.11.',icon:'🤒',date:'2026-10-30',dateTo:'2026-11-04',returnTo:'2026-11-15'},
   {id:5011,type:'palautus',name:'Paluu 1 · liikkuvuus + kevyt putti',date:'2026-11-05',sessions:['mob','putti','hermosto'],icon:'🔄'},
   {id:5012,type:'palautus',name:'Paluu 2 · kevyt heitto',date:'2026-11-06',sessions:['heitto_tek','hermosto'],noSpeed:true,icon:'🔄'},
   {id:5013,type:'palautus',name:'Paluu 3 · yläkroppa',date:'2026-11-07',sessions:['voima_b','hermosto'],icon:'🔄'}]);
 tryit('aikainen paluu 5.–7.11.',()=>{ const d=x=>{const r=returnWindowOf(x);return r?r.label:null;};
   ok('paluuikkuna 5.–15.11. (4.11. ja 16.11. ulkopuolella)', d('2026-11-04')===null&&d('2026-11-05')==='sairaudesta'&&d('2026-11-15')==='sairaudesta'&&d('2026-11-16')===null);
   const wk=o=>buildWeekPlan(getWeekDates(weekOffsetOf(new Date(o+'T12:00:00')))); const pl={}; wk('2026-11-02').concat(wk('2026-10-30')).forEach(x=>pl[x.date]=x);
   const S=ds=>pl[ds].sessions.join('+');
   ok('lepo 30.10.–4.11.; 5.11. mob+putti+hermosto; 6.11. heitto_tek+hermosto; 7.11. voima_b+hermosto; 8.11. normaali sunnuntai', ['2026-10-30','2026-11-02','2026-11-04'].every(x=>pl[x].intensity==='rest')&&S('2026-11-05')==='mob+putti+hermosto'&&S('2026-11-06')==='heitto_tek+hermosto'&&S('2026-11-07')==='voima_b+hermosto'&&S('2026-11-08')==='lepo+mob+hermosto+peruskunto', ['2026-11-04','2026-11-05','2026-11-06','2026-11-07','2026-11-08'].map(x=>x.slice(5)+':'+S(x)).join(' | '));
   const pd=puttiDataFor('2026-11-05',4); ok('putti 5.11.: lohkot ~70 % parillisina {4:8,6:8,8:8,10:14}, loppusarja 8 m normaali + haara', JSON.stringify(pd.perStyle)==='{"4":8,"6":8,"8":8,"10":14}'&&pd.finale.dist===8&&pd.finale.styles.join()==='n,h', JSON.stringify(pd.perStyle));
   const prog=throwProgramFor('2026-11-06','tek'); const sess=(THROW_SESSIONS[prog.cw]||[]).find(s=>/^t[12]/.test(s.id)); const ad=thAdapt(sess,prog); const hasSp=x=>x.exercises.some(e=>/Nopeusheitot/.test(e.name));
   ok('heitto 6.11.: ei nopeusheittoja, maininta ja sarjat kevennetty', prog.ret&&prog.ret.noSpeed===true&&/Ei nopeusheittoja/.test(prog.note)&&hasSp(sess)&&!hasSp(ad), 'ennen: nopeusheittoja '+hasSp(sess)+' | jälkeen '+hasSp(ad));
   const prog2=throwProgramFor('2026-11-10','tek'); ok('heitto 10.11.: nopeusheitot mukana (−50 %), noSpeed vain 6.11.', !prog2.ret.noSpeed);
   trainCtxSession='voima_b'; trainCtxDate='2026-11-07'; strManualWk=null; const sp=strProgramCtx(); ok('voima 7.11. (yläkroppa): paluu sairaudesta (−10 %, −1 sarja)', sp.reentry===true&&sp.retLabel==='sairaudesta'); });
 return R.join('\\n'); })()`)); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
