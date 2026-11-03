import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {removeGenerated} from './pipeline.mjs';

export function probe(file){return JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));}
export function verifyOutput(file,timeline,{width=1920,height=1080}={}){
 const info=probe(file),video=info.streams.find(s=>s.codec_type==='video'),audio=info.streams.find(s=>s.codec_type==='audio');
 assert(video&&audio,'The film must contain video and audio');
 assert.equal(video.codec_name,'h264');assert.equal(video.width,width);assert.equal(video.height,height);
 assert.equal(video.r_frame_rate,`${timeline.fps}/1`);assert.equal(Number(video.nb_frames),timeline.durationInFrames);
 assert(['yuv420p','yuvj420p'].includes(video.pix_fmt));assert.equal(audio.codec_name,'aac');assert.equal(audio.channels,2);
 assert(Math.abs(Number(info.format.duration)-timeline.durationInFrames/timeline.fps)<.15);
 return {frames:Number(video.nb_frames),duration:Number(info.format.duration),width:video.width,height:video.height};
}
export const partName=(start,end)=>`${String(start).padStart(4,'0')}-${String(end).padStart(4,'0')}.mp4`;
export function segmentFiles(dir){return existsSync(dir)?readdirSync(dir).filter(n=>/^\d+-\d+\.mp4$/.test(n)).sort((a,b)=>Number(a.split('-')[0])-Number(b.split('-')[0])):[];}
export function validateSegment(file,start,end,timeline){
 const info=probe(file),video=info.streams.find(s=>s.codec_type==='video');
 assert(video);assert.equal(video.width,1920);assert.equal(video.height,1080);assert.equal(video.r_frame_rate,`${timeline.fps}/1`);
 assert.equal(Number(video.nb_frames),end-start+1);assert(end<timeline.durationInFrames);
}
export function resumeSegments(dir,timeline,p){
 let cursor=0,invalid=false;
 for(const name of segmentFiles(dir)){
  const [start,end]=name.replace('.mp4','').split('-').map(Number),file=path.join(dir,name);
  if(!invalid)try{assert.equal(start,cursor);assert(end>=start);validateSegment(file,start,end,timeline);}catch{invalid=true;}
  if(invalid)removeGenerated(file,p);else cursor=end+1;
 }
 for(const name of readdirSync(dir))if(name.endsWith('.partial.mp4'))removeGenerated(path.join(dir,name),p);
 return cursor;
}
