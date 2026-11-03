import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {generateJSON} from '../lib/ai.mjs';

test('CLI generation repairs invalid data, excludes API credentials, and cleans up on timeout',async t=>{
 const root=mkdtempSync(path.join(os.tmpdir(),'video-codex-test-'));
 const binary=path.join(root,'codex'),trace=path.join(root,'trace.jsonl');
 const keys=['CODEX_BIN','CODEX_TIMEOUT_SECONDS','CODEX_FIXTURE_ROOT','OPENAI_API_KEY','CODEX_API_KEY'];
 const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 t.after(()=>{for(const k of keys){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}rmSync(root,{recursive:true,force:true});});
 writeFileSync(binary,`#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path');
if(process.argv[2]==='login'){console.log('Logged in using ChatGPT');process.exit(0);}
let prompt='';process.stdin.on('data',chunk=>prompt+=chunk);process.stdin.on('end',()=>{
 const root=process.env.CODEX_FIXTURE_ROOT,file=path.join(root,'trace.jsonl');
 const count=fs.existsSync(file)?fs.readFileSync(file,'utf8').trim().split('\\n').length:0;
 fs.appendFileSync(file,JSON.stringify({cwd:process.cwd(),prompt,hasKey:Boolean(process.env.OPENAI_API_KEY||process.env.CODEX_API_KEY)})+'\\n');
 if(fs.existsSync(path.join(root,'timeout'))){setInterval(()=>{},1000);return;}
 fs.writeFileSync(process.argv[process.argv.indexOf('-o')+1],JSON.stringify({ok:count>0}));
});
`,{mode:0o700});
 Object.assign(process.env,{CODEX_BIN:binary,CODEX_TIMEOUT_SECONDS:'10',CODEX_FIXTURE_ROOT:root,OPENAI_API_KEY:'fixture-key',CODEX_API_KEY:'fixture-key'});
 const result=await generateJSON({instructions:'JSON only.',input:'Literal `quote` $HOME\njudul',validate:data=>assert(data.ok,'ok harus true')});
 assert.equal(result.ok,true);
 let calls=readFileSync(trace,'utf8').trim().split('\n').map(JSON.parse);
 assert.equal(calls.length,2);assert(calls[0].prompt.includes('Literal `quote` $HOME\njudul'));
 assert(calls[1].prompt.includes('ok harus true'));
 assert(calls.every(call=>!call.hasKey&&!existsSync(call.cwd)));
 writeFileSync(path.join(root,'timeout'),'');process.env.CODEX_TIMEOUT_SECONDS='1';
 await assert.rejects(generateJSON({instructions:'JSON only.',input:'timeout',validate:()=>{}}),/batas waktu 1 detik/);
 calls=readFileSync(trace,'utf8').trim().split('\n').map(JSON.parse);
 assert(!existsSync(calls.at(-1).cwd),'Interrupted CLI runtime must be removed');
});
