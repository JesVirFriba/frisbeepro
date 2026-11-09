process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-10T10:00:00+02:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ console.log(w.eval(`(function(){
 const R=[]; const ok=(n,c,x='')=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,230):''));
 const tryit=(n,f)=>{try{f();}catch(e){R.push('VIRHE '+n+': '+e.message+' @'+(e.stack||'').split('\\\\n')[1]);}};
 const sum=m=>Object.values(m).reduce((a,b)=>a+b,0);
 set('events',[{id:5001,type:'loma',name:'Sairaana 30.10.–4.11.',icon:'🤒',date:'2026-10-30',dateTo:'2026-11-04',returnTo:'2026-11-15'},
   {id:6001,type:'kevennys',name:'Kevennysjakso 9.–22.11.',icon:'🪶',date:'2026-11-09',dateTo:'2026-11-22',throwFactor:0.6,noStrength:true,noSpeed:true}]);
 const plan=ds=>buildWeekPlan(getWeekDates(weekOffsetOf(new Date(ds+'T12:00:00')))).find(x=>x.date===ds); const S=ds=>plan(ds).sessions.join('+');
 tryit('ikkunat',()=>{ ok('kevennysjakso 9.–22.11. (8.11. ja 23.11. ulkopuolella)', !!lightWindowOf('2026-11-09')&&!!lightWindowOf('2026-11-22')&&!lightWindowOf('2026-11-08')&&!lightWindowOf('2026-11-23'));
   const r=x=>{const q=returnWindowOf(x);return q?q.label:null;}; ok('paluuviikko kevennysjakson jälkeen 23.–29.11. (30.11. normaali)', r('2026-11-23')==='kevennysjaksolta'&&r('2026-11-29')==='kevennysjaksolta'&&r('2026-11-30')===null, r('2026-11-23')+' '+r('2026-11-29')+' '+r('2026-11-30')); });
 tryit('suunnitelma',()=>{ const wk1=['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13','2026-11-14','2026-11-15'].map(S), wk2=['2026-11-16','2026-11-17','2026-11-18','2026-11-19','2026-11-20','2026-11-21','2026-11-22'].map(S);
   const exp=['mob+hermosto','heitto_tek+mob+hermosto+putti','hermosto+putti','putti+mob+hermosto+peruskunto','hermosto+putti','heitto_tek+putti+hermosto','lepo+mob+hermosto+peruskunto'];
   ok('viikko 1 (9.–15.11.): ei voimaa eikä nopeustreeniä, putti/liikkuvuus/peruskunto ennallaan', JSON.stringify(wk1)===JSON.stringify(exp), wk1.join(' | '));
   ok('viikko 2 (16.–22.11.): sama rakenne', JSON.stringify(wk2)===JSON.stringify(exp), wk2.join(' | '));
   const all=wk1.concat(wk2).join('+'); ok('jaksolla ei yhtään voima- eikä nopeussessiota', !/voima_|teho|heitto_nop/.test(all));
   ok('poistetut päivät ovat "low" (ma, ke, pe), ei medium', ['2026-11-09','2026-11-11','2026-11-13'].every(x=>plan(x).intensity==='low'), ['2026-11-09','2026-11-11','2026-11-13'].map(x=>plan(x).intensity).join());
   ok('23.11. (ma) voima_a palaa ja 30.11. normaali', /voima_a/.test(S('2026-11-23'))&&/voima_a/.test(S('2026-11-30')), S('2026-11-23')+' | '+S('2026-11-30')); });
 tryit('heitto',()=>{ const th=(ds)=>{ const prog=throwProgramFor(ds,'tek'); const sess=(THROW_SESSIONS[prog.cw]||[]).find(s=>/^t[12]/.test(s.id)); const sets=s=>s.exercises.reduce((a,e)=>a+(e.totalSets||0),0); const hasSp=s=>s.exercises.some(e=>/Nopeusheitot/.test(e.name)); return {prog,sess,ad:thAdapt(sess,prog),nor:thAdapt(sess,Object.assign({},prog,{ret:null})),sets,hasSp}; };
   const a=th('2026-11-10'); ok('heitto 10.11.: kevennys −40 %, ei nopeusheittoja, maininta', a.prog.ret&&a.prog.ret.light&&a.prog.ret.factor===0.6&&/KEVENNYSJAKSO/.test(a.prog.note)&&!a.hasSp(a.ad)&&a.sets(a.ad)<=a.sets(a.nor)*0.65, 'sarjat '+a.sets(a.nor)+'→'+a.sets(a.ad)+' nopeus '+a.hasSp(a.nor)+'→'+a.hasSp(a.ad));
   const b=th('2026-11-14'); ok('heitto 14.11. (la): sama kevennys', b.prog.ret&&b.prog.ret.light&&!b.hasSp(b.ad), 'sarjat '+b.sets(b.nor)+'→'+b.sets(b.ad));
   const c2=th('2026-11-24'); ok('heitto 24.11. (paluuviikko): −30 %, nopeusheitot mukana −50 %', c2.prog.ret&&!c2.prog.ret.light&&c2.prog.ret.label==='kevennysjaksolta'&&c2.hasSp(c2.ad)&&!/KEVENNYSJAKSO:/.test(c2.prog.note)&&/PALUU KEVENNYSJAKSOLTA/.test(c2.prog.note), 'sarjat '+c2.sets(c2.nor)+'→'+c2.sets(c2.ad)); });
 tryit('putti',()=>{ const i=puttiDataFor('2026-11-10',5), c=puttiDataFor('2026-11-14',5), r=puttiDataFor('2026-11-24',7);
   ok('putti 10.11. ja 14.11. normaali (ei paluuviikon 70 %): {4:10,6:10,8:10,10:20}, C2 {10:10,12:16,14:16,16:8}, viikkosumma 600', JSON.stringify(i.perStyle)==='{"4":10,"6":10,"8":10,"10":20}'&&JSON.stringify(c.perStyle)==='{"10":10,"12":16,"14":16,"16":8}'&&i.weekTotal===600, JSON.stringify(i.perStyle)+' '+i.weekTotal);
   ok('putti 24.11. (paluuviikko kevennysjakson jälkeen): normaali, ei skaalausta', JSON.stringify(r.perStyle)==='{"4":10,"8":10,"10":30}'&&!/paluu/.test(r.label||''), JSON.stringify(r.perStyle)); });
 tryit('voima paluu',()=>{ trainCtxSession='voima_a'; trainCtxDate='2026-11-24'; strManualWk=null; const sp=strProgramCtx(); ok('voima 24.11.: paluu kevennysjaksolta (−10 %, −1 sarja)', sp.reentry===true&&sp.retLabel==='kevennysjaksolta'&&/paluu kevennysjaksolta/.test(sp.title), sp.title.slice(-60)); });
 tryit('banneri ja kalenteri',()=>{ showPg('train'); trainTab('week',null); const lb=document.getElementById('light-banner'), rb=document.getElementById('return-banner'); ok('viikkonäkymässä Kevennysjakso-banneri, ei paluubanneria (10.11.)', !!lb&&lb.textContent.indexOf('Kevennysjakso 09.11.–22.11.')>=0&&!rb, lb&&lb.textContent.slice(0,70));
   showPg('cal'); const t=(document.getElementById('pg-cal')||document.body).textContent; ok('kalenteri piirtyy kevennys-tapahtumalla ilman NaN/undefined', !(t.indexOf('NaN')>=0||t.indexOf('undefined')>=0||t.indexOf('[object')>=0)); });
 return R.join('\\n'); })()`)); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
