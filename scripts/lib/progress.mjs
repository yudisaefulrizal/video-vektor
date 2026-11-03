import path from 'node:path';
import {writeJson} from './pipeline.mjs';

export function progressReporter(p,title){
 const status={projectId:p.id,title,pid:process.pid,state:'running',step:1,message:'Menyiapkan folder proyek.',startedAt:new Date().toISOString(),render:null};
 return (step,message,extra={})=>{
  Object.assign(status,{step:step??status.step,message,updatedAt:new Date().toISOString()},extra);
  writeJson(path.join(p.cache,'status.json'),status);
 };
}
