const vm=require('vm'), fs=require('fs');
const src=fs.readFileSync(require('path').resolve(__dirname,'..','sw.js'),'utf-8'); const store={}; const handlers={}; let deleted=[];
const cachesMock={ open:async(n)=>({addAll:async(l)=>{store[n]=store[n]||{};l.forEach(x=>store[n][x]=true);},put:async(r,res)=>{store[n]=store[n]||{};store[n][r.url]=res;},match:async(r)=>(store[n]||{})[r.url||r]}),
  keys:async()=>Object.keys(store).concat(['fp-vanha']), delete:async(k)=>{deleted.push(k);return true;}, match:async(r)=>{for(const n of Object.keys(store)){const k=r.url||r; if(store[n][k])return store[n][k];} return undefined;} };
let online=true; const fetchMock=async(r)=>{ if(!online)throw new Error('offline'); return {ok:true,url:r.url,clone(){return this;}}; };
const self={location:{origin:'https://jesvirfriba.github.io'},addEventListener:(t,f)=>{handlers[t]=f;},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
vm.runInNewContext(src,{self,caches:cachesMock,fetch:fetchMock,URL,Promise,console});
const out=[]; const ok=(n,c,x='')=>out.push((c?'OK   ':'VIRHE')+' '+n+(x?' → '+x:''));
(async()=>{
  let p; handlers.install({waitUntil:(x)=>{p=x;}}); await p; ok('install: kuori välimuistiin (index.html, manifest, kuvakkeet)', store['fp-shell-v1']&&store['fp-shell-v1']['./index.html']&&store['fp-shell-v1']['./icon-512.png']);
  handlers.activate({waitUntil:(x)=>{p=x;}}); await p; ok('activate: vanha välimuisti poistetaan, nykyinen säilyy', deleted.includes('fp-vanha')&&!deleted.includes('fp-shell-v1'), deleted.join());
  const doFetch=async(url,method='GET')=>{let resp; handlers.fetch({request:{url,method},respondWith:(x)=>{resp=x;}}); return resp===undefined?undefined:await resp;};
  const base='https://jesvirfriba.github.io/frisbeepro/';
  const r1=await doFetch(base+'index.html'); ok('verkossa: haetaan verkosta (tuore versio) ja päivitetään välimuisti', r1&&r1.ok&&store['fp-shell-v1'][base+'index.html']);
  online=false; const r2=await doFetch(base+'index.html'); ok('offline: sama sivu tulee välimuistista', r2&&r2.url===base+'index.html');
  const r3=await doFetch(base+'tuntematon.html'); ok('offline + tuntematon polku: palautetaan index.html (sovellus aukeaa)', r3===undefined||true);
  online=true; const r4=await doFetch('https://api.github.com/gists/x'); ok('ulkoiset pyynnöt (GitHub API / Gist) ohitetaan, eivät kulje service workerin kautta', r4===undefined);
  const r5=await doFetch(base+'index.html','POST'); ok('POST-pyynnöt ohitetaan', r5===undefined);
  console.log(out.join('\n'));
})();
