import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { mkdir,writeFile } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import { chromePath } from './chrome.mjs';
import { practiceUrl,findUid } from './security.mjs';
import { selectJourneys } from '../learner/journey.mjs';
import { checkAssertion } from '../learner/assertions.mjs';
import { summarizeRun } from '../learner/report.mjs';
import { finalizeRun } from './run-lifecycle.mjs';
const text = result => result.content?.filter(c=>c.type==='text').map(c=>c.text).join('\n') || '';
export async function executeRun(run,origin,dataDir,notify=()=>{}) {
  const folder=join(dataDir,run.id); await mkdir(folder,{recursive:true});
  const client=new Client({name:'lds-browser-qa',version:'1.0.0'},{capabilities:{}});
  const transport=new StdioClientTransport({command:process.execPath,args:[resolve('node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js'),'--headless','--isolated',`--executablePath=${chromePath()}`,'--no-usage-statistics','--no-performance-crux','--no-category-performance','--no-category-memory','--no-javascript-evaluation',`--allowedUrlPattern=${origin}/practice/*`,`--workspace=${folder}`,'--redact-network-headers'],env:{PATH:process.env.PATH || '',HOME:process.env.HOME || '',CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS:'1'},stderr:'pipe'});
  let calls=0, finalResult;
  const call=async(name,args,entry)=>{
    if(++calls>65) throw new Error('This run reached its tool limit.');
    const event={at:Date.now(),tool:name,label:entry,status:'running'}; run.events.push(event); notify();
    try { const result=await client.callTool({name,arguments:args},undefined,{timeout:20000});
      if(result.isError) throw new Error(text(result).slice(0,700));
      event.status='done'; event.result=text(result).slice(0,14000); notify(); return result;
    } catch(error) { event.status='error'; event.result=error.message; notify(); throw error; }
  };
  const deadline=setTimeout(()=>{run.cancelled=true; client.close().catch(()=>{});},150000);
  try {
    await client.connect(transport); run.status='running';notify();
    for(const journey of selectJourneys(run.selected)) {
      if(run.cancelled) throw new Error('Run cancelled or timed out.');
      const result={id:journey.id,name:journey.name,status:'running',checks:[],screenshots:[],evidence:{}};run.journeys.push(result);notify();
      let pageId;
      try {
        const opened=await call('new_page',{url:practiceUrl(origin,run.variant,journey.id),timeout:12000},`Open ${journey.name}`);
        const pages=text(opened); pageId=Number(pages.match(/(?:^|\n)(\d+):[^\n]*\[selected\]/)?.[1] ?? pages.match(/(?:^|\n)(\d+):[^\n]*\/practice/)?.[1]);
        if(!Number.isFinite(pageId)) throw new Error('Could not resolve the practice browser page.');
        await call('resize_page',{pageId,width:journey.width,height:journey.height},`Set ${journey.width} × ${journey.height} viewport`);
        for(const [index,step] of journey.steps.entries()) {
          if(run.cancelled) throw new Error('Run cancelled.');
          const snapshot=text(await call('take_snapshot',{pageId},'Read the accessibility snapshot'));
          if(step.type==='expect') {
            const check=checkAssertion(step.assertion,snapshot);result.checks.push(check);
            run.events.push({at:Date.now(),tool:'assertion',label:check.expected,status:check.passed?'done':'failed',result:check.observed});notify();
          } else {
            const uid=findUid(snapshot,step.role,step.label);
            await call(step.type,{pageId,uid,...(step.type==='fill'?{value:step.value}:{}),includeSnapshot:true},`${step.type==='fill'?'Enter':'Click'} ${step.label}`);
          }
          // Capture actual pixels after every interaction/check, never a fabricated preview.
          const filename=`${journey.id}-${index}.png`;
          await call('take_screenshot',{pageId,format:'png',filePath:join(folder,filename)},'Capture browser evidence');
          result.screenshots.push({url:`/api/runs/${run.id}/files/${filename}`,label:step.type==='expect'?'Final assertion':step.label});notify();
        }
        result.status=result.checks.length && result.checks.every(c=>c.passed)?'passed':'failed';
      } catch(error) {result.status='error';result.error=error.message;}
      if(Number.isFinite(pageId)) {
        for(const [key,tool] of [['network','list_network_requests'],['console','list_console_messages']]) {
          try {result.evidence[key]=text(await call(tool,{pageId,pageSize:40},`Collect ${key} evidence`));}catch(error){result.evidence[key]=`Evidence unavailable: ${error.message}`;}
        }
      }
      notify();
    }
    finalResult=summarizeRun(run.journeys);
  }catch(error){finalResult={status:'error',error:error.message};}
  finally {
    clearTimeout(deadline);
    await finalizeRun(run, finalResult, {
      close: () => client.close(),
      persist: report => writeFile(join(folder,'report.json'),JSON.stringify(report,null,2)),
    }, notify);
  }
}
