process.env.TZ='Europe/Helsinki';
const dates=['2026-12-29T10:00:00+02:00','2027-01-01T10:00:00+02:00','2027-01-04T10:00:00+02:00','2027-01-07T10:00:00+02:00','2027-01-12T10:00:00+02:00','2027-01-18T10:00:00+02:00','2027-01-19T10:00:00+02:00','2027-01-22T10:00:00+02:00','2027-01-27T10:00:00+02:00','2026-11-14T10:00:00+02:00','2027-02-06T10:00:00+02:00'];
const {APP}=require('./harness.js'); const file=process.argv[2]||APP; const out=[];
(async()=>{ for(const d of dates){ process.env.FAKE_NOW=d; delete require.cache[require.resolve('./harness.js')]; const {boot,APP}=require('./harness.js'); const {w,errors}=boot(file);
  await new Promise(r=>setTimeout(r,1200));
  const res=w.eval(`(function(){ const bad=[]; const pages=${JSON.stringify(process.env.PAGES||'')}; 
    const PG=['cal','comp','dev','profile','speed','train'];
    PG.forEach(p=>{ try{ showPg(p); const t=document.body.textContent; const el=document.getElementById('pg-'+p)||document.getElementById('page-'+p)||document.getElementById(p); if(el&&/NaN|undefined|\\[object Object\\]/.test(el.textContent)) bad.push(p+': NaN/undefined/[object]'); }catch(e){bad.push(p+': '+e.message);} });
    try{ showPg('train'); ['putti','throw','str','mob','week','kierros','kierros_vayla','comp_day'].forEach(t=>{ try{ trainTab(t,null); const x=document.getElementById('train-content').textContent; if(/NaN|undefined|\\[object Object\\]/.test(x)) bad.push('train/'+t+': NaN/undefined'); }catch(e){bad.push('train/'+t+': '+e.message);} }); }catch(e){bad.push('train: '+e.message);}
    return PG.length+' sivua; ongelmia: '+(bad.length?bad.join(' | '):'ei'); })()`);
  out.push(d.slice(0,10)+': '+res+' | JS-virheitä '+errors.length+(errors.length?' '+errors[0]:'')); }
  console.log(out.join('\n')); process.exit(0); })();
