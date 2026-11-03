import path from 'node:path';
import {copyFileSync,cpSync,existsSync,mkdirSync,readdirSync,renameSync} from 'node:fs';
import {ROOT,FINAL_FILES,acquireLock,checksum,cleanup,command,fingerprint,publish,pythonFor,readJson,removeGenerated,runtimeDirectory,tempEnvironment,writeJson} from './lib/pipeline.mjs';
import {ensureProject,projectEnvironment,projectPaths,projectSlug} from './lib/project.mjs';
import {createScript,createPlan} from './lib/generation.mjs';
import {validateTimeline,reviewProject} from './lib/project-review.mjs';
import {partName,resumeSegments,validateSegment,verifyOutput} from './lib/media.mjs';
import {assemble} from './assemble.mjs';
import {exportAudio} from './export-audio.mjs';
import {progressReporter} from './lib/progress.mjs';

export async function runProject({title,id,regenerate=false,replan=false,force=false,assembleOnly=false,qualityFeedback=null,repairAttempt=0}){
 const p=projectPaths(id??projectSlug(title));
 Object.assign(process.env,projectEnvironment(p));
 const release=acquireLock(p),controller=new AbortController(),stop=()=>controller.abort();
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
 let runtime,checkpoint,published=false,retry=null,report;
 try{
  ensureProject(p);
  let metadata;try{metadata=readJson(p.metadata);}catch{}
  title=title??metadata?.title??p.id.replace(/-/g,' ');
  if(metadata?.title&&metadata.title.toLowerCase()!==title.toLowerCase()&&!regenerate)throw new Error('Nama folder sudah dipakai judul lain. Gunakan --id berbeda atau --regenerate untuk mengganti isi proyek ini.');
  report=progressReporter(p,title);report(1,'Folder proyek siap.');
  runtime=runtimeDirectory(p);const stage=path.join(runtime,'stage');mkdirSync(stage);
  const env={...projectEnvironment(p),...tempEnvironment(runtime,stage)},signal=controller.signal;
  console.log(`[1/7] Judul: ${title}\nFolder: ${p.out}`);
  report(2,'Membuat atau membaca naskah melalui Codex CLI.');
  const script=await createScript({title,p,regenerate,signal});
  let savedMetadata={};try{savedMetadata=readJson(p.metadata);}catch{}
  writeJson(p.metadata,{...savedMetadata,title,id:p.id});
  console.log(`[2/7] Naskah tersimpan: ${p.script}`);
  report(3,'Menyiapkan narasi dan timing kata.');
  cpSync(path.join(ROOT,'public/fonts'),path.join(p.publicDir,'fonts'),{recursive:true});
  const python=existsSync(path.join(ROOT,'.venv/bin/python'))?path.join(ROOT,'.venv/bin/python'):'python3';
  await command(python,['scripts/prepare_audio.py'],{env,signal});
  const timeline=readJson(p.timeline);validateTimeline(script,timeline);
  for(const name of readdirSync(p.audioDir)){
   const match=/^scene-(\d+)\.(?:mp3|json|meta\.json)$/.exec(name);
   if(match&&Number(match[1])>script.length)removeGenerated(path.join(p.audioDir,name),p);
  }
  console.log('[3/7] Terjemahkan motion_description menjadi aset dan keyframe.');
  report(4,'Menyusun aset, gerak objek, dan kamera melalui Codex CLI.');
  const plan=await createPlan({title,p,script,timeline,regenerate:regenerate||replan,feedback:qualityFeedback,signal});
  const props={title,projectId:p.id,width:1920,height:1080,timeline,plan};writeJson(p.props,props);
  report(4,'Menyiapkan musik dan efek suara.');
  await command(pythonFor('numpy'),['scripts/score.py'],{env,signal});
  const relative=file=>path.relative(ROOT,file);
  const visual=fingerprint(['src/generic','src/style.css','package-lock.json','remotion.config.ts',relative(p.props),relative(path.join(p.publicDir,'fonts'))]);
  const audio=fingerprint([relative(p.audioDir),'scripts/assemble.mjs']);
  const build=fingerprint([relative(p.script),relative(p.props),relative(p.audioDir),'src/generic','src/style.css','package-lock.json','remotion.config.ts','scripts/assemble.mjs','scripts/export-audio.mjs','scripts/lib/project-review.mjs']);
  checkpoint=path.join(p.checkpoints,visual);const segments=path.join(checkpoint,'segments');mkdirSync(segments,{recursive:true});
  for(const name of readdirSync(p.checkpoints))if(name!==visual)removeGenerated(path.join(p.checkpoints,name),p);
  writeJson(path.join(checkpoint,'manifest.json'),{visual,frames:timeline.durationInFrames});
  let receipt;try{receipt=readJson(p.receipt);}catch{}
  const current=path.join(p.out,'video.mp4');
  const reusable=!force&&receipt?.visual===visual&&existsSync(current)&&checksum(current)===receipt.files?.['video.mp4'];
  if(reusable&&receipt.build===build&&FINAL_FILES.every(name=>existsSync(path.join(p.out,name))&&checksum(path.join(p.out,name))===receipt.files[name])){
   verifyOutput(current,timeline);cleanup({p,completed:true});writeJson(path.join(ROOT,'.cache/video-pipeline/last-project.json'),{id:p.id,title});report(7,'Hasil terbaru masih valid dan siap ditonton.',{state:'completed'});console.log('Hasil terbaru masih valid; tidak perlu render ulang.');return;
  }
  console.log('[4/7] Render memakai renderer dinamis yang sama untuk semua judul.');
  report(5,'Menyiapkan render Remotion + Three.js.',{render:{completed:0,total:timeline.durationInFrames}});
  if(!reusable){
   if(force)for(const name of readdirSync(segments))removeGenerated(path.join(segments,name),p);
   let cursor=resumeSegments(segments,timeline,p);
   report(5,'Merender animasi dan gerak kamera.',{render:{completed:cursor,total:timeline.durationInFrames}});
   while(cursor<timeline.durationInFrames){
    if(assembleOnly)throw new Error('Gambar belum lengkap. Jalankan pipeline tanpa --assemble-only.');
    const end=Math.min(cursor+199,timeline.durationInFrames-1),name=partName(cursor,end),partial=path.join(segments,name.replace('.mp4','.partial.mp4'));
    await command(process.execPath,['node_modules/@remotion/cli/remotion-cli.js','render','src/generic/index.tsx','NarrativeVisual',partial,`--frames=${cursor}-${end}`,`--props=${p.props}`,`--public-dir=${p.publicDir}`,`--gl=${process.env.REMOTION_GL??'angle'}`,'--muted','--log=error'],{env,signal});
    validateSegment(partial,cursor,end,timeline);renameSync(partial,path.join(segments,name));cursor=end+1;
    console.log(`Frame ${cursor}/${timeline.durationInFrames}`);
    report(5,'Merender animasi dan gerak kamera.',{render:{completed:cursor,total:timeline.durationInFrames}});
   }
  }
  const video=path.join(stage,'video.mp4');
  report(6,'Menggabungkan gambar, narasi, musik, dan efek suara.');
  if(reusable&&receipt.audio===audio)copyFileSync(current,video);
  else await assemble({timeline,segments,inputVideo:reusable?current:undefined,output:video,runtime,signal,title});
  console.log('[5/7] Ekspor narasi, musik dan audio final.');
  verifyOutput(video,timeline);await exportAudio({timeline,video,stage,runtime,signal});
  copyFileSync(p.script,path.join(stage,'naskah.json'));renameSync(path.join(stage,'kucing.id.srt'),path.join(stage,'subtitle.srt'));
  console.log('[6/7] Pemeriksaan hasil sebelum mengganti video final.');
  report(7,'Memeriksa video, audio, dan gerakan sebelum menyimpan hasil.');
  await reviewProject({video,props,stage,runtime,signal});
  const files=Object.fromEntries(FINAL_FILES.map(name=>[name,checksum(path.join(stage,name))]));
  writeJson(path.join(stage,'build-manifest.json'),{version:4,projectId:p.id,title,visual,audio,build,verifiedAt:new Date().toISOString(),files});
  publish(stage,p);published=true;
  console.log('[7/7] Bersihkan sementara; simpan satu hasil terbaru.');cleanup({p,completed:true});
  writeJson(path.join(ROOT,'.cache/video-pipeline/last-project.json'),{id:p.id,title});
  console.log(`Selesai: ${path.join(p.out,'video.mp4')}`);
  report(7,'Video dan audio siap. File sementara sudah dibersihkan.',{state:'completed'});
 }catch(error){
  if(checkpoint)writeJson(path.join(checkpoint,'failure.json'),{message:error.message,at:new Date().toISOString()});
  if(error.code==='MOTION_FREEZE'&&repairAttempt<1&&!controller.signal.aborted){
   retry={title,id:p.id,replan:true,qualityFeedback:error.feedback,repairAttempt:repairAttempt+1};
   console.log('Gerak terlalu diam; rencana animasi akan diperbaiki otomatis satu kali tanpa menulis ulang naskah.');
  }else {report?.(undefined,error.message,{state:'failed'});throw new Error(`${error.message}\n${published?'Hasil baru sudah tersimpan; ulangi cleanup.':'Naskah dan checkpoint dipertahankan; hasil video sebelumnya tetap tersimpan.'}`);}
 }finally{
  try{if(runtime)removeGenerated(runtime,p);}finally{release();process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);}
 }
 if(retry)return runProject(retry);
}
