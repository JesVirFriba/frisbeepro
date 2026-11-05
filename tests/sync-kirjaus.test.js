process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-11-05T10:00:00+02:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(async()=>{ let out; try{ out=await w.eval(`(async function(){
 const R=[]; const ok=(n,c,x)=>R.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+String(x).slice(0,220):''));
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const DAY='2026-11-05';
 gistScheduleSave=function(){};          // ei ajastettuja tallennuksia: ajamme synkronoinnin itse
 let calls=[]; let remoteData=null, failMode=null;
 function stub(delay){ window.fetch=function(url,opts){ const method=(opts&&opts.method)||'GET'; calls.push(method); return new Promise(function(res,rej){ setTimeout(function(){
     if(failMode==='reject'){rej(new Error('offline'));return;}
     if(method==='PATCH'){ try{ const pl=JSON.parse(JSON.parse(opts.body).files[GIST_FILENAME].content); remoteData=pl.data; }catch(e){} res({ok:true,json:async()=>({}),text:async()=>''});return;}
     res({ok:true,json:async()=>({files:{[GIST_FILENAME]:{content:JSON.stringify({version:1,updated:'2026-11-05T07:00:00.000Z',data:remoteData})}}}),text:async()=>''}); },delay); }); }; }
 function reset(initial){ localStorage.setItem(GIST_TOKEN_KEY,'t'); localStorage.setItem(GIST_ID_KEY,'g'); const d=ld(); d.putti_tally={}; if(initial)d.putti_tally[DAY]={'6|n':initial}; sv(d); remoteData=JSON.parse(JSON.stringify(ld())); putSyncBase(JSON.parse(JSON.stringify(ld()))); calls=[]; failMode=null; }
 const tallyNow=()=>String((puttiTallyOf(DAY)||{})['6|n']||'');
 const tap=ch=>{ const s=tallyNow(); puttiTSet(DAY,'6','n',s+ch); };
 // 1) napautus Gist-haun aikana (nopea ja hidas verkko)
 for(const delay of [20,150,600]){ reset('101'); stub(delay); const p=gistSave(); await sleep(delay/2); tap('1'); await p; ok('napautus GET-haun aikana ('+delay+' ms): merkintä säilyy', tallyNow()==='1011', 'tally='+tallyNow()+' pyynnöt='+calls.join(',')); }
 // 2) kaksi napautusta peräkkäin haun aikana
 reset('1'); stub(200); let p=gistSave(); await sleep(60); tap('1'); await sleep(40); tap('0'); await p; ok('kaksi napautusta haun aikana säilyy', tallyNow()==='110', tallyNow());
 // 3) napautus PATCH-vaiheen aikana, sen jälkeen uusi synkronointi
 reset('11'); stub(80); p=gistSave(); await sleep(130); tap('1'); await p; ok('napautus PATCH-vaiheen aikana säilyy', tallyNow()==='111', tallyNow()); stub(30); await gistSave(); ok('...ja säilyy seuraavassakin synkronoinnissa', tallyNow()==='111', tallyNow());
 // 4) pull (gistLoad) napautuksen aikana
 reset('10'); stub(150); p=gistLoad(); await sleep(60); tap('1'); await p; ok('napautus gistLoad-haun aikana säilyy', tallyNow()==='101', tallyNow());
 // 5) offline: haku epäonnistuu
 reset('10'); stub(30); failMode='reject'; p=gistSave(); await sleep(10); tap('1'); await p; ok('offline (haku hylätään): merkinnät säilyvät, ei ylikirjoitusta', tallyNow()==='101'&&calls.indexOf('PATCH')<0, tallyNow()+' '+calls.join(','));
 // 6) Gistissä vanhempi tila, paikalliset muutokset voittavat
 reset('1011'); remoteData.putti_tally[DAY]={'6|n':'1'}; { const b=JSON.parse(JSON.stringify(remoteData)); putSyncBase(b); } stub(30); await gistSave(); ok('viimeksi synkattu (1), Gist ennallaan, paikallinen uudempi (1011): paikallinen säilyy', tallyNow()==='1011', tallyNow());
 // 7) toinen laite lisäsi merkintöjä, paikallinen ei muuttunut: Gist voittaa
 reset('1'); remoteData.putti_tally[DAY]={'6|n':'1110'}; stub(30); await gistLoad(); ok('toinen laite lisäsi (1110), paikallinen muuttumaton: Gistin tila tulee mukaan', tallyNow()==='1110', tallyNow());
 // 8) satunnaistesti: 40 napautusta, synkronointeja (save ja load) sekaisin satunnaisilla viiveillä ja ajoituksilla
 let seed=12345; const rnd=()=>{ seed=(seed*1664525+1013904223)%4294967296; return seed/4294967296; };
 let fails=0, totalTaps=0;
 for(let run=0;run<12;run++){ reset(''); stub(20+Math.floor(rnd()*300)); let expect=''; const ps=[];
   for(let i=0;i<24;i++){ const ch=rnd()<0.7?'1':'0'; tap(ch); expect+=ch; totalTaps++; const r=rnd();
     if(r<0.25){ ps.push(gistSave()); } else if(r<0.4){ ps.push(gistLoad()); }
     await sleep(Math.floor(rnd()*70)); }
   await Promise.all(ps); await sleep(50); if(tallyNow()!==expect){ fails++; R.push('   (satunnaisajo '+run+' epäonnistui: odotettu '+expect+' / saatu '+tallyNow()+')'); } }
 ok('satunnaistesti: 12 ajoa × 24 napautusta ('+totalTaps+') synkronoinnin lomassa, kaikki merkinnät säilyvät', fails===0, fails+' epäonnistunutta ajoa');
 // 9) oikea käyttöliittymä: napautus riviltä ja synkronointi käynnissä
 reset(''); stub(120); showPg('train'); trainTab('putti',null); const row=()=>document.querySelector('#putti-tally .pt-row[data-d="6"]'); const cnt=()=>(row().querySelector('.pt-cnt').textContent||'');
 p=gistSave(); await sleep(30); row().querySelector('.pt-hit').click(); await sleep(20); row().querySelector('.pt-hit').click(); await p;
 ok('käyttöliittymä: kaksi "Sisään"-napautusta haun aikana → molemmat näkyvät ja tallessa', tallyNow()==='11'&&cnt().indexOf('Normaali 2/2')>=0, tallyNow()+' | '+cnt());
 // 10) käyttöliittymän satunnaistesti: Sisään / Ohi / Kumoa, tyylin vaihto, uudelleenpiirto ja synkronointi sekaisin
 { reset(''); stub(40); showPg('train'); trainTab('putti',null);
   const model={}; const key=(d,s)=>d+'|'+s; const plan={'6':10,'10':20}; let seed2=777; const rnd2=()=>{ seed2=(seed2*1664525+1013904223)%4294967296; return seed2/4294967296; }; let steps=0; const ps=[];
   for(let i=0;i<160;i++){ const d=rnd2()<0.5?'6':'10'; const st=rnd2()<0.7?'n':'h'; localStorage.setItem('fp_putti_nyt',st); const r=rnd2();
     if(r<0.08){ renderTrain(); }                                   // uudelleenpiirto kesken kirjauksen
     else if(r<0.14){ ps.push(gistSave()); } else if(r<0.2){ ps.push(gistLoad()); }
     else if(r<0.24){ window.dispatchEvent(new Event('pageshow')); document.dispatchEvent(new Event('visibilitychange')); }
     const row=document.querySelector('#putti-tally .pt-row[data-d="'+d+'"]'); if(!row)continue; const k=key(d,st); const cur=model[k]||''; const q=rnd2();
     if(q<0.12){ row.querySelector('.pt-undo').click(); model[k]=cur.slice(0,-1); } else if(q<0.6){ row.querySelector('.pt-hit').click(); if(cur.length<plan[d]+10)model[k]=cur+'1'; } else { row.querySelector('.pt-miss').click(); if(cur.length<plan[d]+10)model[k]=cur+'0'; }
     steps++; await sleep(Math.floor(rnd2()*25)); }
   await Promise.all(ps); await sleep(80); const t2=puttiTallyOf(DAY); let bad=[]; Object.keys(model).forEach(k=>{ if(String(t2[k]||'')!==model[k])bad.push(k+': odotettu '+model[k]+' / saatu '+(t2[k]||'')); });
   ok('käyttöliittymän satunnaistesti: '+steps+' napautusta/kumoa/uudelleenpiirtoa synkronoinnin lomassa, kaikki rivit täsmäävät mallin kanssa', bad.length===0, bad.join(' | ')); }
 // 11) Gist-haku epäonnistuu (HTTP 500) kesken kirjauksen
 reset('10'); window.fetch=function(){ return Promise.resolve({ok:false,status:500,json:async()=>({}),text:async()=>''}); }; p=gistSave(); await sleep(5); tap('1'); await p; ok('HTTP 500 Gististä: merkinnät säilyvät ja dataa ei kirjoiteta yli', tallyNow()==='101', tallyNow());
 // 12) katkennut vastaus (JSON-virhe)
 reset('10'); window.fetch=function(){ return Promise.resolve({ok:true,json:async()=>{ throw new Error('katkennut'); },text:async()=>''}); }; p=gistSave(); await sleep(5); tap('1'); await p; ok('katkennut/virheellinen vastaus: merkinnät säilyvät', tallyNow()==='101', tallyNow());
 return R.join('\\n'); })()`); }catch(e){ out='VIRHE testin ajossa: '+e.message; }
 console.log(out); console.log('JS-virheitä:',errors.length,errors.slice(0,2)); process.exit(0); },1800);
