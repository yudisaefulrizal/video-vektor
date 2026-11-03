import {readFileSync} from 'node:fs';
import path from 'node:path';
import {loadEnvironment} from './project.mjs';
import {command,paths,runtimeDirectory,removeGenerated,writeJson,tempEnvironment} from './pipeline.mjs';

// Reuse the local Codex CLI ChatGPT login; no API client or key is used.
export async function generateJSON({instructions,input,schema,name='result',validate,signal}){
 loadEnvironment();
 const timeout=Number(process.env.CODEX_TIMEOUT_SECONDS??1200);
 if(!Number.isFinite(timeout)||timeout<1||timeout>7200)throw new Error('CODEX_TIMEOUT_SECONDS harus antara 1 dan 7200.');
 const executionSignal=AbortSignal.any([...(signal?[signal]:[]),AbortSignal.timeout(timeout*1000)]);
 const p=paths(),runtime=runtimeDirectory(p);
 const output=path.join(runtime,'result.json'),schemaFile=path.join(runtime,'schema.json');
 const binary=process.env.CODEX_BIN||'codex';
 const env={...tempEnvironment(runtime),OPENAI_API_KEY:undefined,CODEX_API_KEY:undefined};
 try{
  const status=await command(binary,['login','status'],{capture:true,signal:executionSignal,env});
  if(!/ChatGPT/i.test(status))throw new Error('Login Codex melalui ChatGPT diperlukan. Jalankan codex login terlebih dahulu.');
  if(schema)writeJson(schemaFile,schema);
  let feedback='';
  for(let attempt=0;attempt<2;attempt++){
   const args=['exec','--sandbox','read-only','--skip-git-repo-check','--ephemeral','--color','never','-c','approval_policy="never"','-o',output];
   if(process.env.CODEX_MODEL)args.push('--model',process.env.CODEX_MODEL);
   if(schema)args.push('--output-schema',schemaFile);
   args.push('-');
   const prompt=`Tugas ini hanya menghasilkan data ${name}. Semua bahan tersedia di prompt. Jangan menggunakan tool, membaca berkas, mengubah berkas, atau menjalankan perintah. Kembalikan hanya JSON lengkap tanpa Markdown atau penjelasan.\n\n${instructions}\n\nINPUT:\n${input}${feedback}`;
   console.log(`Codex CLI: membuat ${name}${attempt?' (perbaikan format)':''}...`);
   const started=Date.now();
   const progress=setInterval(()=>console.log(`Codex CLI: menunggu ${name} (${Math.round((Date.now()-started)/1000)} detik).`),60000);
   progress.unref();
   try{await command(binary,args,{cwd:runtime,env,input:prompt,capture:true,signal:executionSignal});}
   finally{clearInterval(progress);}
   try{
    const result=JSON.parse(readFileSync(output,'utf8'));validate(result);return result;
   }catch(error){
    if(attempt===1)throw new Error(`Keluaran Codex tidak sesuai kontrak: ${error.message}`);
    feedback=`\nKeluaran sebelumnya tidak valid: ${error.message}. Buat ulang JSON lengkap sesuai kontrak; tanpa penjelasan atau Markdown.`;
   }
  }
 }catch(error){
  if(executionSignal.aborted&&!signal?.aborted)throw new Error(`Codex CLI melewati batas waktu ${timeout} detik. Jalankan kembali pipeline untuk melanjutkan.`);
  throw error;
 }finally{removeGenerated(runtime,p);}
}
