// FrisbeePro service worker: verkko ensin, välimuisti varalla (toimii offline, mutta uusi versio latautuu aina kun verkko on).
const CACHE='fp-shell-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url); if(u.origin!==self.location.origin)return;     // GitHub API (Gist-synkronointi) ei kulje tämän kautta
  e.respondWith(fetch(r,{cache:'no-cache'}).then(function(res){
    if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp);});}
    return res;
  }).catch(function(){return caches.match(r).then(function(m){return m||caches.match('./index.html');});}));
});
