import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3083';
const config=await fetch(`${origin}/api/config`).then(r=>r.json());
const denied=await fetch(`${origin}/api/runs`,{method:'POST',headers:{'content-type':'application/json',origin:'https://untrusted.example'},body:JSON.stringify({journeys:['signup'],variant:'broken'})});assert.equal(denied.status,403);
for(const variant of ['broken','fixed']){
 const started=await fetch(`${origin}/api/runs`,{method:'POST',headers:{'content-type':'application/json',origin,'x-lds-token':config.token},body:JSON.stringify({journeys:['signup','search','menu'],variant})});const initial=await started.json();assert.equal(started.status,202,JSON.stringify(initial));
 let run;const deadline=Date.now()+180000;do{await new Promise(r=>setTimeout(r,500));const runs=await fetch(`${origin}/api/runs`).then(r=>r.json());run=runs.find(r=>r.id===initial.id);}while(['starting','running'].includes(run.status)&&Date.now()<deadline);
 console.log(JSON.stringify({variant,status:run.status,id:run.id,journeys:run.journeys.map(j=>({id:j.id,status:j.status,error:j.error,checks:j.checks,screenshots:j.screenshots.length})),error:run.error},null,2));
 assert.equal(run.status,variant==='broken'?'failed':'passed');assert.equal(run.journeys.length,3);assert.ok(run.journeys.every(j=>j.screenshots.length>0&&j.evidence.network&&j.evidence.console));
}
console.log('Real MCP integration passed: three failures before the fix; three passes after. Cross-origin request rejected.');
