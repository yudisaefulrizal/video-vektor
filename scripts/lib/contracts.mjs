import assert from 'node:assert/strict';

const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const number={type:'number'},string={type:'string'};
const array=items=>({type:'array',items});
const pose=object({at:number,x:number,y:number,scale:number,rotation:number,rotationX:number,rotationY:number,opacity:number});
const camera=object({at:number,x:number,y:number,zoom:number});
const accent=object({at:number,kind:{type:'string',enum:['soft','impact','chime','water']}});
export const PLAN_SCHEMA=object({
 assets:array(object({id:string,markup:string})),
 shots:array(object({
  id:string,startScene:{type:'integer'},startProgress:number,action:string,background:string,
  camera:array(camera),
  entities:array(object({id:string,assetId:string,kind:{type:'string',enum:['vector','solid']},layer:{type:'string',enum:['back','front']},depth:number,easing:{type:'string',enum:['linear','smooth']},keyframes:array(pose)})),
  keyText:{anyOf:[object({sceneIndex:{type:'integer'},from:number,to:number,x:number,y:number,size:number,color:string}),{type:'null'}]},
  accent:{anyOf:[accent,{type:'null'}]},
 })),
});

export function validateScript(script,{maxUnits=5}={}){
 assert(Array.isArray(script)&&script.length>0&&script.length<=maxUnits,`Naskah harus berupa array berisi 1–${maxUnits} kalimat.`);
 for(const [index,unit] of script.entries()){
  assert.deepEqual(Object.keys(unit),['audio_text','key_text','motion_description'],`Properti kalimat ${index+1} harus tepat dan berurutan.`);
  assert(typeof unit.audio_text==='string'&&unit.audio_text.trim().length>15,'audio_text harus berisi kalimat lengkap.');
  assert(/[.!?]$/.test(unit.audio_text.trim()),'audio_text harus diakhiri tanda baca.');
  assert(unit.key_text===null||(typeof unit.key_text==='string'&&unit.key_text.length<=100),'key_text harus singkat atau null.');
  assert(typeof unit.motion_description==='string'&&unit.motion_description.trim().length>30,'motion_description harus menjelaskan aksi visual.');
 }
}

function ordered(frames,fields){
 assert(frames.length>=2,'Gerak membutuhkan sedikitnya dua keyframe.');
 assert.equal(frames[0].at,0);assert.equal(frames.at(-1).at,1);
 let previous=-1;
 for(const frame of frames){
  assert(frame.at>previous&&frame.at<=1,'Keyframe harus berurutan dari 0 sampai 1.');previous=frame.at;
  for(const field of fields)assert(Number.isFinite(frame[field]),`Nilai ${field} harus angka finite.`);
 }
}
export function validateMarkup(markup){
 assert(typeof markup==='string'&&markup.length>10&&markup.length<35000,'Aset SVG kosong atau terlalu besar.');
 const allowed=new Set(['g','path','rect','circle','ellipse','polygon','polyline','line','defs','lineargradient','radialgradient','stop','clippath','mask','text','tspan']);
 for(const match of markup.matchAll(/<\/?\s*([\w:-]+)/g))assert(allowed.has(match[1].toLowerCase()),`Elemen SVG tidak diizinkan: ${match[1]}`);
 assert(!/\bon[a-z]+\s*=|\b(?:href|src|style)\s*=|<!|<\?/i.test(markup),'Aset harus berupa SVG statis tanpa event, link, CSS, atau konten eksternal.');
 for(const match of markup.matchAll(/url\s*\(([^)]*)\)/gi))assert(/^\s*#[\w-]+\s*$/.test(match[1]),'Referensi SVG hanya boleh menuju ID lokal.');
}
export function validatePlan(plan,script){
 assert(Array.isArray(plan.assets)&&plan.assets.length>=1&&plan.assets.length<=48,'Jumlah aset tidak valid.');
 const assets=new Set();
 for(const asset of plan.assets){assert(/^[a-z][\w-]*$/.test(asset.id)&&!assets.has(asset.id),'ID aset harus unik.');assets.add(asset.id);validateMarkup(asset.markup);}
 assert(Array.isArray(plan.shots)&&plan.shots.length>=script.length&&plan.shots.length<=32,'Jumlah shot tidak valid.');
 assert.equal(plan.shots[0].startScene,0);assert.equal(plan.shots[0].startProgress,0);
 let previous=-1,solid=false;const ids=new Set();
 for(const shot of plan.shots){
  assert(!ids.has(shot.id));ids.add(shot.id);
  assert(Number.isInteger(shot.startScene)&&shot.startScene>=0&&shot.startScene<script.length);
  assert(shot.startProgress>=0&&shot.startProgress<1);
  const start=shot.startScene+shot.startProgress;assert(start>previous,'Shot harus berurutan.');previous=start;
  assert(/^#[\da-f]{6}$/i.test(shot.background));
  ordered(shot.camera,['x','y','zoom']);for(const frame of shot.camera)assert(frame.zoom>=.2&&frame.zoom<=8);
  assert(shot.entities.length>0&&shot.entities.length<=32);
  let active=false;const entities=new Set();
  for(const entity of shot.entities){
   assert(!entities.has(entity.id));entities.add(entity.id);assert(assets.has(entity.assetId),'Aset entity tidak ditemukan.');
   assert(['vector','solid'].includes(entity.kind));assert(['back','front'].includes(entity.layer));assert(['linear','smooth'].includes(entity.easing));
   assert(Number.isFinite(entity.depth)&&entity.depth>=0&&entity.depth<=100);
   ordered(entity.keyframes,['x','y','scale','rotation','rotationX','rotationY','opacity']);
   for(const frame of entity.keyframes){assert(frame.scale>=0&&frame.scale<=30);assert(frame.opacity>=0&&frame.opacity<=1);}
   const first=entity.keyframes[0];
   active ||= entity.keyframes.some(frame=>['x','y','scale','rotation','rotationX','rotationY'].some(field=>frame[field]!==first[field]));
   solid ||= entity.kind==='solid';
  }
  assert(active,'Setiap shot harus mempunyai aksi objek, tidak hanya gerak kamera atau fade.');
  if(shot.keyText){const k=shot.keyText;assert(script[k.sceneIndex]?.key_text);assert(k.from>=0&&k.to>k.from&&k.to<=1);assert(k.size>=20&&k.size<=110);assert(/^#[\da-f]{6}$/i.test(k.color));}
  if(shot.accent)assert(shot.accent.at>=0&&shot.accent.at<=1&&['soft','impact','chime','water'].includes(shot.accent.kind));
 }
 assert(solid,'Gunakan setidaknya satu objek Three.js untuk menjelaskan objek/kejadian yang relevan.');
}

export function compilePlan(plan,timeline){
 return {...plan,shots:plan.shots.map((shot,i)=>{
  const at=s=>Math.round(timeline.scenes[s.startScene].from+timeline.scenes[s.startScene].durationInFrames*s.startProgress);
  const from=at(shot),end=i+1<plan.shots.length?at(plan.shots[i+1]):timeline.durationInFrames;
  assert(end-from>=12,'Shot terlalu pendek setelah diselaraskan dengan audio.');
  if(shot.keyText)assert((shot.keyText.to-shot.keyText.from)*(end-from)/timeline.fps<=3,'Teks kunci harus tampil singkat, maksimal tiga detik.');
  return {...shot,from,duration:end-from};
 })};
}
