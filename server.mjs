import http from 'node:http';
import { randomBytes,randomUUID } from 'node:crypto';
import { readFile,writeFile,mkdir,readdir } from 'node:fs/promises';
import { dirname,join,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authorizedMutation,validHost,readJson } from './lib/security.mjs';
import { selectJourneys,JOURNEYS } from './learner/journey.mjs';
import { executeRun } from './lib/runner.mjs';
import { suggestPlan } from './lib/planner.mjs';
const ROOT=dirname(fileURLToPath(import.meta.url)); process.chdir(ROOT);
const port=Number(process.env.PORT||3083);if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('PORT must be 1024–65535.');
const token=randomBytes(24).toString('hex');const runs=new Map();const dataDir=join(ROOT,'.data','runs');await mkdir(dataDir,{recursive:true});
for(const name of (await readdir(dataDir)).slice(-50)) {try{const run=JSON.parse(await readFile(join(dataDir,name,'report.json'),'utf8'));if(run.id===name)runs.set(name,run);}catch{}}
let active=null;let planning=false;
const send=(res,status,data,type='application/json')=>{res.writeHead(status,{'content-type':`${type}; charset=utf-8`,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'none'; form-action 'self'"});res.end(type==='application/json'?JSON.stringify(data):data);};
const assets={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/lds-logo.svg':'lds-logo.svg','/practice/':'practice.html','/practice/app.js':'practice.js','/practice/style.css':'practice.css','/practice/lds-logo.svg':'lds-logo.svg'};
const server=http.createServer(async(req,res)=>{
 try {
  if(!validHost(req.headers.host,port))return send(res,403,{error:'Unrecognized local host.'});
  const url=new URL(req.url,`http://${req.headers.host}`);const path=url.pathname;
  if(req.method==='GET' && path==='/api/config')return send(res,200,{token,version:'1.0.0',aiEnabled:Boolean(process.env.GEMINI_API_KEY),journeys:Object.entries(JOURNEYS).map(([id,j])=>({id,name:j.name,detail:j.detail})),port});
  if(req.method==='GET' && path==='/practice/config')return send(res,200,{token});
  if(req.method==='GET'&&path==='/api/runs')return send(res,200,[...runs.values()].sort((a,b)=>b.startedAt-a.startedAt));
  const file=path.match(/^\/api\/runs\/([\da-f-]{36})\/files\/((?:signup|search|menu)-\d\.png|report\.json)$/);
  if(req.method==='GET'&&file){if(!runs.has(file[1]))return send(res,404,{error:'Run not found.'});try {return send(res,200,await readFile(join(dataDir,file[1],file[2])),file[2].endsWith('.png')?'image/png':'application/octet-stream');}catch{return send(res,404,{error:'Evidence not available.'});}}
  if(req.method==='POST') {
   if(!authorizedMutation(req,port,token))return send(res,403,{error:'Reload this local page before making changes.'});
   const body=await readJson(req);
   if(path==='/api/runs'){
    if(active)return send(res,409,{error:'Wait for the current browser run to finish.'});
    if(runs.size>=50)return send(res,409,{error:'50 saved runs reached. Archive .data/runs before starting more.'});
    selectJourneys(body.journeys);if(!['broken','fixed'].includes(body.variant))throw new Error('Choose a practice version.');
    const run={id:randomUUID(),startedAt:Date.now(),variant:body.variant,selected:body.journeys,mode:'Scripted verification through Chrome DevTools MCP',status:'starting',journeys:[],events:[]};runs.set(run.id,run);active=run;
    // Persist the initial state so a server interruption cannot silently erase the run.
    await mkdir(join(dataDir,run.id),{recursive:true});await writeFile(join(dataDir,run.id,'report.json'),JSON.stringify({...run,status:'error',error:'The server stopped before this run finished.'},null,2));
    send(res,202,run);executeRun(run,`http://127.0.0.1:${port}`,dataDir).catch(error=>{run.status='error';run.error=error.message;}).finally(()=>{active=null;});return;
   }
   if(path==='/api/plan') {if(planning)return send(res,409,{error:'A plan request is already running.'});planning=true;try{return send(res,200,await suggestPlan(body.goal));}finally{planning=false;}}
   if(path==='/practice/signup') {if(body.variant==='broken')return send(res,503,{error:'Practice defect: signup handler unavailable.'});return send(res,200,{message:'Practice account created'});}
   return send(res,404,{error:'Route not found.'});
  }
  if(req.method==='GET'&&assets[path]){const name=assets[path];return send(res,200,await readFile(join(ROOT,'ui',name)),name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/javascript');}
  if(path==='/favicon.ico'){res.writeHead(204);res.end();return;}
  send(res,404,{error:'Page not found.'});
 }catch(error){send(res,400,{error:error.message});}
});
server.listen(port,'127.0.0.1',()=>console.log(`AI Browser QA Engineer 1.0.0 — http://localhost:${port}\nLocal practice app: http://localhost:${port}/practice/\nKeys are optional. Browser runs use a fresh isolated Chrome profile.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(active)active.cancelled=true;server.close(()=>process.exit());setTimeout(()=>process.exit(),3000).unref();});
