process.env.TZ='Europe/Helsinki'; process.env.FAKE_NOW='2026-10-22T10:00:00+03:00';
const {boot,APP}=require('./harness.js'); const {w,errors}=boot(APP);
setTimeout(()=>{ const d=w.document; const m=d.querySelector('link[rel="manifest"]'), a=d.querySelector('link[rel="apple-touch-icon"]');
 console.log('manifest-linkki:',m&&m.getAttribute('href'),'| apple-touch-icon:',a&&a.getAttribute('href'),'| JS-virheitä (jsdom ei tue service workeria, rekisteröinti ohitetaan):',errors.length); process.exit(0); },1500);
