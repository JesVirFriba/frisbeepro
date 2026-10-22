const {JSDOM,VirtualConsole}=require('jsdom'); const fs=require('fs'); const path=require('path');
const APP=process.env.APP_FILE||path.resolve(__dirname,'..','index.html');
function boot(file,opts={}){
  const html=fs.readFileSync(file,'utf-8'); const errors=[];
  const vc=new VirtualConsole(); vc.on('jsdomError',e=>errors.push(String(e.message||e).slice(0,200))); vc.on('error',e=>errors.push(String(e).slice(0,200)));
  const dataFile=process.env.GIST_DATA||path.resolve(__dirname,'fixtures','empty.json');
  const seed=fs.existsSync(dataFile)?fs.readFileSync(dataFile,'utf-8'):'{}';
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://jesvirfriba.github.io/frisbeepro/',virtualConsole:vc,
    beforeParse(w){
      w.localStorage.setItem('fp_complete_v1',seed); 
      w.scrollTo=()=>{}; w.alert=()=>{}; w.confirm=()=>true; w.prompt=()=>null;
      w.matchMedia=w.matchMedia||(()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}));
      w.fetch=()=>Promise.reject(new Error('ei verkkoa testissä')); w.HTMLElement.prototype.scrollIntoView=function(){};
      if(process.env.FAKE_NOW){ const R=w.Date; const base=new R(process.env.FAKE_NOW).getTime(); const t0=R.now();
        class FD extends R{ constructor(...a){ if(a.length===0) super(base+(R.now()-t0)); else super(...a);} static now(){return base+(R.now()-t0);} } w.Date=FD; }
    }});
  return {w:dom.window,errors,dom};
}
module.exports={boot,APP};
