import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {existsSync,lstatSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';
import {ROOT,FINAL_FILES,readJson,writeJson} from './pipeline.mjs';
import {projectSlug} from './project.mjs';

export const STEPS=['Folder proyek','Naskah','Narasi','Rencana animasi','Render video','Gabungkan audio','Simpan & bersihkan'];
const pending=job=>['queued','scheduled'].includes(job.state);
const read=(file,fallback=null)=>{try{return readJson(file);}catch{return fallback;}};
export const isAlive=pid=>{if(!Number.isInteger(pid)||pid<=0)return false;try{process.kill(pid,0);return true;}catch(error){return error.code!=='ESRCH';}};
export class StudioError extends Error{constructor(message,status=400){super(message);this.status=status;}}

export class StudioStore{
 constructor({root=ROOT,now=Date.now,launch}={}){
  this.root=root;this.now=now;this.base=path.join(root,'.cache/video-pipeline');
  this.file=path.join(this.base,'studio/jobs.json');
  this.jobs=read(this.file,[]);if(!Array.isArray(this.jobs))throw new Error('Data antrean studio tidak valid.');
  this.launch=launch??(job=>spawn(process.execPath,[path.join(ROOT,'scripts/video.mjs'),'--title',job.title,'--id',job.projectId],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']}));
  this.closing=false;this.child=null;
 }
 save(){writeJson(this.file,this.jobs);}
 progress(projectId){return read(path.join(this.base,'projects',projectId,'status.json'));}
 locked(){const lock=read(path.join(this.base,'pipeline.lock'));return lock&&isAlive(lock.pid)?lock:null;}
 validateTitle(value){
  if(typeof value!=='string')throw new StudioError('Masukkan judul video.');
  const title=value.trim().replace(/\s+/g,' ');
  if(title.length<5||title.length>200)throw new StudioError('Judul harus berisi 5–200 karakter.');
  let projectId;try{projectId=projectSlug(title);}catch(error){throw new StudioError(error.message);}
  const metadata=read(path.join(this.base,'projects',projectId,'project.json'));
  if(metadata?.title&&metadata.title.toLowerCase()!==title.toLowerCase())throw new StudioError('Judul ini menghasilkan nama folder yang sudah digunakan. Pilih judul yang lebih spesifik.',409);
  return {title,projectId};
 }
 schedule(value){
  if(value===null||value===undefined||value==='')return null;
  if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))throw new StudioError('Tanggal dan waktu jadwal tidak valid.');
  const time=Date.parse(value);if(time<=this.now())throw new StudioError('Pilih jadwal setelah waktu sekarang.');
  return new Date(time).toISOString();
 }
 create({title,scheduledAt}={}){
  const source=this.validateTitle(title),when=this.schedule(scheduledAt);
  if(this.jobs.some(job=>job.projectId===source.projectId&&(pending(job)||job.state==='running')))throw new StudioError('Proyek ini sudah ada dalam antrean atau sedang diproses.',409);
  const job={id:randomUUID(),...source,scheduledAt:when,state:when?'scheduled':'queued',createdAt:new Date(this.now()).toISOString(),startedAt:null,finishedAt:null,pid:null,error:null};
  this.jobs.push(job);this.save();return job;
 }
 get(id){const job=this.jobs.find(job=>job.id===id);if(!job)throw new StudioError('Pekerjaan tidak ditemukan.',404);return job;}
 update(id,body){
  const job=this.get(id);if(!pending(job))throw new StudioError('Hanya pekerjaan yang belum berjalan yang dapat diubah.',409);
  if(!Object.hasOwn(body,'scheduledAt'))throw new StudioError('Waktu mulai belum diberikan.');
  job.scheduledAt=this.schedule(body.scheduledAt);job.state=job.scheduledAt?'scheduled':'queued';this.save();return job;
 }
 cancel(id){const job=this.get(id);if(!pending(job))throw new StudioError('Pekerjaan yang sudah berjalan tidak dapat dibatalkan dari antrean.',409);job.state='cancelled';job.finishedAt=new Date(this.now()).toISOString();this.save();return job;}
 retry(id){
  const job=this.get(id);if(!['failed','interrupted'].includes(job.state))throw new StudioError('Pekerjaan ini tidak memerlukan pengulangan.',409);
  if(this.jobs.some(other=>other.id!==id&&other.projectId===job.projectId&&(pending(other)||other.state==='running')))throw new StudioError('Proyek ini sudah ada dalam antrean.',409);
  Object.assign(job,{state:'queued',scheduledAt:null,startedAt:null,finishedAt:null,pid:null,error:null});this.save();return job;
 }
 results(){
  const dir=path.join(this.root,'hasil');if(!existsSync(dir))return [];
  return readdirSync(dir,{withFileTypes:true}).filter(e=>e.isDirectory()&&/^[a-z0-9][a-z0-9-]{0,71}$/.test(e.name)).flatMap(e=>{
   const folder=path.join(dir,e.name),video=path.join(folder,'video.mp4');
   if(!existsSync(video)||lstatSync(video).isSymbolicLink())return [];
   const cache=path.join(this.base,'projects',e.name),meta=read(path.join(cache,'project.json'));
   const receipt=read(path.join(cache,'build-manifest.json'))??(e.name==='kucing-tidak-berguna'?read(path.join(this.base,'build-manifest.json')):null);
   const timeline=read(path.join(cache,'timeline.json'));
   const title=meta?.title??receipt?.title??e.name.replace(/-/g,' ');
   const files=FINAL_FILES.filter(name=>existsSync(path.join(folder,name))&&!lstatSync(path.join(folder,name)).isSymbolicLink());
   const poster=existsSync(path.join(cache,'reports/poster.png'))||e.name==='kucing-tidak-berguna'&&existsSync(path.join(this.base,'reports/poster.png'));
   return [{id:e.name,title,updatedAt:new Date(statSync(video).mtimeMs).toISOString(),duration:timeline?timeline.durationInFrames/timeline.fps:null,size:statSync(video).size,files,poster}];
  }).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 }
 external(){
  const lock=this.locked();if(!lock)return null;
  const dir=path.join(this.base,'projects');
  if(existsSync(dir))for(const e of readdirSync(dir,{withFileTypes:true})){
   if(!e.isDirectory()||!/^[a-z0-9][a-z0-9-]{0,71}$/.test(e.name))continue;
   const status=this.progress(e.name);if(status?.pid===lock.pid&&status.state==='running')return {id:`external-${lock.pid}`,title:status.title,projectId:e.name,state:'running',external:true,startedAt:status.startedAt,progress:status};
  }
  return {id:`external-${lock.pid}`,title:'Pipeline dari terminal',state:'running',external:true,progress:null};
 }
 snapshot(){
  const running=this.jobs.find(job=>job.state==='running');
  let active=null;
  if(running){const status=this.progress(running.projectId);active={...running,progress:status?.pid===running.pid?status:null};}
  else active=this.external();
  const latest=this.jobs.filter(job=>job.state==='completed').at(-1);
  return {steps:STEPS,active,lastCompleted:latest??null,jobs:this.jobs,results:this.results(),timezone:'Asia/Jakarta'};
 }
 start(){this.tick();this.timer=setInterval(()=>this.tick(),1000);}
 tick(){
  if(this.closing)return;
  const running=this.jobs.find(job=>job.state==='running');
  if(running){
   if(!this.child&&!isAlive(running.pid)){
    const status=this.progress(running.projectId);
    this.finish(running,status?.pid===running.pid&&status.state==='completed'?0:1,'Proses sebelumnya terhenti. Lanjutkan untuk memakai naskah dan checkpoint yang sudah tersimpan.');
   }
   return;
  }
  if(this.child||this.locked())return;
  const next=this.jobs.filter(job=>pending(job)&&(!job.scheduledAt||Date.parse(job.scheduledAt)<=this.now())).sort((a,b)=>(Date.parse(a.scheduledAt??a.createdAt)-Date.parse(b.scheduledAt??b.createdAt)))[0];
  if(!next)return;
  Object.assign(next,{state:'running',startedAt:new Date(this.now()).toISOString(),finishedAt:null,error:null});this.save();
  let tail='';
  try{
   const child=this.launch(next);this.child=child;next.pid=child.pid;this.save();
   const capture=data=>{tail=(tail+data.toString()).slice(-8000);};child.stdout?.on('data',capture);child.stderr?.on('data',capture);
   let settled=false;
   const done=(code,message)=>{if(settled)return;settled=true;this.child=null;this.finish(next,code,message??tail);};
   child.once('error',error=>done(1,error.message));child.once('close',(code,signal)=>done(code??1,signal?`Proses terhenti (${signal}). Naskah dan checkpoint dapat dilanjutkan.`:undefined));
  }catch(error){this.child=null;this.finish(next,1,error.message);}
 }
 finish(job,code,message){
  const status=this.progress(job.projectId);
  job.state=code===0?'completed':this.closing?'interrupted':'failed';job.finishedAt=new Date(this.now()).toISOString();
  job.error=code===0?null:((status?.pid===job.pid&&status.state==='failed'?status.message:null)||String(message||'Pipeline terhenti. Coba lanjutkan kembali.').trim().slice(-1500));
  this.save();
 }
 async close(){
  this.closing=true;clearInterval(this.timer);
  if(this.child){const child=this.child;await new Promise(resolve=>{child.once('close',resolve);child.kill('SIGTERM');});}
 }
}
