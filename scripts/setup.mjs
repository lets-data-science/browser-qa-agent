import {existsSync} from 'node:fs';import{copyFile}from'node:fs/promises';import{execFileSync}from'node:child_process';import{chromePath}from'../lib/chrome.mjs';
if(Number(process.versions.node.split('.')[0])<22)throw new Error('Install Node.js22.13 or newer.');
const chrome=chromePath();let version='';try{version=execFileSync(chrome,['--version'],{encoding:'utf8',timeout:10000}).trim();}catch{version='Chrome detected; check chrome://version for version149 or newer.';}
const major=Number(version.match(/(?:Chrome|Chromium)\s+(\d+)/)?.[1]);if(major&&major<149)throw new Error('Update Chrome to version149 or newer for browser URL restrictions.');
if(!existsSync('.env.local'))await copyFile('.env.example','.env.local');console.log(`${version}\nSetup ready. Run npm start, then open the printed local address. No key is required.`);
