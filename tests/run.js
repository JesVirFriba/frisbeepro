// Testiajuri: ajaa kaikki *.test.js -tiedostot ja epäonnistuu, jos jokin tarkistus (VIRHE) tai JS-virhe löytyy.
const {spawnSync}=require('child_process'); const fs=require('fs'); const path=require('path');
const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).sort(); let fail=0, checks=0;
files.forEach(function(f){
  const r=spawnSync('node',[path.join(__dirname,f)],{encoding:'utf-8',env:Object.assign({},process.env),timeout:240000});
  const out=(r.stdout||'')+(r.stderr||''); const lines=out.split('\n');
  const ok=lines.filter(l=>/^OK\s/.test(l)).length, bad=lines.filter(l=>/^VIRHE/.test(l)||/ongelmia: (?!ei)/.test(l)||/JS-virheitä:?\s*[1-9]/.test(l));
  checks+=ok; if(bad.length||r.status!==0){fail++; console.log('✗ '+f+' ('+ok+' OK)'); bad.slice(0,8).forEach(l=>console.log('    '+l.slice(0,220)));}
  else console.log('✓ '+f+' ('+ok+' tarkistusta'+(ok?'':', savu')+')');
});
console.log('\n'+(fail?fail+' tiedostoa epäonnistui':'Kaikki testit läpi')+' · '+checks+' tarkistusta');
process.exit(fail?1:0);
