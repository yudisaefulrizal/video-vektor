import React,{useEffect,useMemo} from 'react';
import {interpolate,spring,useCurrentFrame} from 'remotion';
import * as THREE from 'three';

type V3=[number,number,number];

// Single source of truth for the style. Do not inline colours in scenes.
export const theme={skyTop:'#6FBDEB',horizon:'#E3F4FB',sun:'#FFD84D',water:'#47BDE8',
 sand:'#F3D9A4',seabed:'#E3C58F',grass1:'#9ED86B',grass2:'#62BF5C',forest:'#3FA463',rock:'#8D99AE',rock2:'#9AA5B8',rock3:'#7F8CA3',snow:'#FFFFFF',
 pine1:'#2F8F5B',pine2:'#3AA76A',pine3:'#47B979',round1:'#7BCB5C',round2:'#9EDB6B',trunk:'#A9744F',
 coral:'#F26B5B',cream:'#FFE9C7',door:'#5B6FD6',window:'#FFD84D',cloud:'#FFFFFF',ink:'#2B3A55'} as const;
const FPS=30;

// Things grow with a bouncy spring, or smoothly (no overshoot) for land and mountains.
// Never exactly 0: a zero scale breaks the normal matrix.
export const useRise=(delay=0,smooth=false)=>Math.max(spring({frame:useCurrentFrame()-delay,fps:FPS,
 config:smooth?{damping:20,stiffness:90,mass:1}:{damping:11,stiffness:130,mass:.8}}),.001);
export const useExit=(d:number)=>Math.max(interpolate(useCurrentFrame(),[d-12,d-2],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),.001);

// Flat-shaded material: every face reads as a flat polygon.
export const Facet:React.FC<{color:string;rough?:number;opacity?:number;emissive?:string;double?:boolean}>=({color,rough=.9,opacity=1,emissive,double})=>
 <meshStandardMaterial color={color} flatShading roughness={rough} metalness={0} transparent={opacity<1} opacity={opacity}
  {...(emissive?{emissive}:{})} {...(double?{side:THREE.DoubleSide}:{})}/>;

// ---- landscape math: deterministic, so every frame and every render is identical ----
const mulberry32=(a:number)=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
export const CABIN={x:-2.6,z:3.2,h:1.5};
const noise=(x:number,z:number)=>Math.sin(x*.34+1.3)*Math.cos(z*.29)*1.6+Math.sin(x*.75-z*.55)*.6+Math.cos(z*.95+x*.25)*.4;
// Island of radius ~12 around the origin, sea level at y=0, with a flat pad for the cabin.
export const height=(x:number,z:number)=>{
 const mask=Math.max(0,1-Math.pow(Math.hypot(x,z)/12,2.2)),h=mask*(3+noise(x,z)*.9)-1;
 const k=Math.max(0,1-Math.hypot(x-CABIN.x,z-CABIN.z)/3.4),w=k*k*(3-2*k);
 return h*(1-w)+CABIN.h*w;
};
const colorFor=(h:number)=>h<0?theme.seabed:h<.3?theme.sand:h<1.3?theme.grass1:h<2.5?theme.grass2:h<3.4?theme.forest:h<4?theme.rock:theme.snow;

const SIZE=30,N=28;
const buildTerrain=()=>{
 const g=new THREE.PlaneGeometry(SIZE,SIZE,N,N);
 g.rotateX(-Math.PI/2);
 const pos=g.attributes.position,rnd=mulberry32(11),cell=SIZE/N;
 for(let i=0;i<pos.count;i++){
  let x=pos.getX(i),z=pos.getZ(i);
  if(Math.abs(x)<SIZE/2-1e-3&&Math.abs(z)<SIZE/2-1e-3){x+=(rnd()-.5)*cell*.6;z+=(rnd()-.5)*cell*.6;}
  pos.setXYZ(i,x,height(x,z),z);
 }
 // Non-indexed so each triangle can carry its own colour.
 const ng=g.toNonIndexed(),p=ng.attributes.position,colors=new Float32Array(p.count*3),jr=mulberry32(5),c=new THREE.Color();
 for(let t=0;t<p.count;t+=3){
  c.set(colorFor((p.getY(t)+p.getY(t+1)+p.getY(t+2))/3));
  const k=.94+jr()*.12;
  for(let v=0;v<3;v++)colors.set([c.r*k,c.g*k,c.b*k],(t+v)*3);
 }
 ng.setAttribute('color',new THREE.BufferAttribute(colors,3));
 ng.computeVertexNormals();
 return ng;
};

// Land rises out of the sea: scaled about y=-1.2 so it starts below the water.
export const Terrain:React.FC=()=>{
 const geo=useMemo(buildTerrain,[]),s=useRise(0,true);
 return <group position={[0,-1.2,0]} scale={[1,s,1]}><mesh position={[0,1.2,0]} geometry={geo}><meshStandardMaterial vertexColors flatShading roughness={.95} metalness={0}/></mesh></group>;
};

// Water: a faceted plane whose points travel as waves. Rebuilt per frame, old geometry disposed.
const makeWater=(f:number)=>{
 const g=new THREE.PlaneGeometry(130,130,52,52);
 g.rotateX(-Math.PI/2);
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,Math.sin(x*.55+f*.08)*Math.cos(z*.45+f*.06)*.16+Math.sin((x+z)*.3-f*.05)*.09);}
 return g;
};
export const Water:React.FC=()=>{
 const f=useCurrentFrame(),geo=useMemo(()=>makeWater(f),[f]);
 useEffect(()=>()=>geo.dispose(),[geo]);
 return <mesh geometry={geo}><Facet color={theme.water} rough={.28} opacity={.92}/></mesh>;
};

// ---- scatter: fixed by seeds ----
type TreeData={p:V3;s:number;kind:'pine'|'round';tone:number;delay:number};
const makeTrees=():TreeData[]=>{
 const r=mulberry32(21),out:TreeData[]=[];
 for(let i=0;i<600&&out.length<34;i++){
  const x=(r()-.5)*24,z=(r()-.5)*24,h=height(x,z),a=r(),b=r(),c=r();
  if(h<.5||h>3.5||Math.hypot(x-CABIN.x,z-CABIN.z)<3.4)continue;
  if(Math.abs(x-CABIN.x)<3.4&&z>CABIN.z&&z<CABIN.z+6)continue; // meadow in front of the cabin
  if(Math.sin(x*.5+z*.3)+Math.cos(z*.45-x*.2)<-.4)continue; // leave clearings, so trees form groves
  if(out.some(t=>Math.hypot(t.p[0]-x,t.p[2]-z)<1.5))continue;
  out.push({p:[x,h-.12,z],s:.7+a*.4,kind:h>2?'pine':'round',tone:Math.floor(b*3),delay:30+out.length+Math.floor(c*2)});
 }
 return out;
};
export const TREES=makeTrees();
const makeRocks=()=>{
 const r=mulberry32(9),out:{p:V3;s:number;c:string}[]=[];
 for(let i=0;i<300&&out.length<9;i++){
  const a=r()*Math.PI*2,d=7+r()*5,x=Math.cos(a)*d,z=Math.sin(a)*d,h=height(x,z),s=.3+r()*.35,c=r()>.5?theme.rock2:theme.rock3;
  if(h<-.1||h>1.2||Math.hypot(x-CABIN.x,z-CABIN.z)<3)continue;
  out.push({p:[x,h,z],s,c});
 }
 return out;
};
export const ROCKS=makeRocks();
// [angle in degrees behind the island, distance, height, radius]
export const MOUNTAINS=[[-70,26,7,5],[-50,28,11,6.5],[-30,24,8,5],[-12,30,14,7.5],[8,26,9,5.5],[26,29,12,6.5],[44,25,7.5,5],[62,27,10,6]] as const;

const pines=[theme.pine1,theme.pine2,theme.pine3];
export const TreeMesh:React.FC<{t:TreeData}>=({t})=>{
 const f=useCurrentFrame(),s=useRise(t.delay),sway=Math.sin(f/26+t.p[0])*.035;
 return <group position={t.p} scale={s*t.s} rotation={[sway,0,sway]}>
  <mesh position={[0,.3,0]}><cylinderGeometry args={[.1,.15,.6,6]}/><Facet color={theme.trunk}/></mesh>
  {t.kind==='pine'?<>
   <mesh position={[0,1,0]}><coneGeometry args={[.85,1.2,6]}/><Facet color={pines[t.tone]}/></mesh>
   <mesh position={[0,1.7,0]}><coneGeometry args={[.65,1.1,6]}/><Facet color={pines[(t.tone+1)%3]}/></mesh>
   <mesh position={[0,2.35,0]}><coneGeometry args={[.42,.95,6]}/><Facet color={pines[(t.tone+2)%3]}/></mesh>
  </>:<mesh position={[0,1.2,0]} scale={[1,1.1,1]}><icosahedronGeometry args={[.85,1]}/><Facet color={t.tone%2?theme.round1:theme.round2}/></mesh>}
 </group>;
};

export const Rock:React.FC<{p:V3;s:number;c:string;delay?:number}>=({p,s,c,delay=0})=>{
 const k=useRise(delay);
 return <mesh position={[p[0],p[1]+s*.2,p[2]]} scale={[s*k,s*.7*k,s*.9*k]}><icosahedronGeometry args={[1,0]}/><Facet color={c}/></mesh>;
};

// Mountain: green foot (a frustum on the cone's slope), grey body, snow cap on the tall ones.
export const Mountain:React.FC<{a:number;d:number;h:number;r:number;delay:number}>=({a,d,h,r,delay})=>{
 const s=useRise(delay,true),ang=a*Math.PI/180;
 return <group position={[Math.sin(ang)*d,-1.5,-Math.cos(ang)*d]} rotation={[0,a*.1,0]} scale={[1,s,1]}>
  <mesh position={[0,h/2,0]}><coneGeometry args={[r,h,6]}/><Facet color={theme.rock}/></mesh>
  <mesh position={[0,h*.2,0]}><cylinderGeometry args={[r*.6*1.01,r*1.01,h*.4,6]}/><Facet color={theme.forest}/></mesh>
  {h>9&&<mesh position={[0,h*.835,0]}><coneGeometry args={[r*.355,h*.35,6]}/><Facet color={theme.snow}/></mesh>}
 </group>;
};

const Smoke:React.FC<{p:V3}>=({p})=>{
 const f=useCurrentFrame();
 return <group position={p}>{[0,1,2,3].map(i=>{const t=((f+i*14)%56)/56;
  return <mesh key={i} position={[t*.5+Math.sin(t*6+i)*.1,t*2.4,0]} scale={.14+t*.3}><icosahedronGeometry args={[1,0]}/><Facet color="#FFFFFF" opacity={(1-t)*.9}/></mesh>;})}</group>;
};

// Cabin on the flat pad: box walls, four-sided roof, chimney with smoke.
export const Cabin:React.FC<{delay?:number}>=({delay=0})=>{
 const s=useRise(delay);
 return <group position={[CABIN.x,CABIN.h-.02,CABIN.z]} rotation={[0,.55,0]} scale={s*1.4}>
  <mesh position={[0,.55,0]}><boxGeometry args={[1.5,1.1,1.5]}/><Facet color={theme.cream}/></mesh>
  <mesh position={[0,1.525,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[1.25,.85,4]}/><Facet color={theme.coral}/></mesh>
  <mesh position={[0,.35,.76]}><boxGeometry args={[.4,.7,.06]}/><Facet color={theme.door}/></mesh>
  {[-.5,.5].map(x=><mesh key={x} position={[x,.65,.76]}><boxGeometry args={[.3,.3,.06]}/><Facet color={theme.window} emissive="#FFB400"/></mesh>)}
  <mesh position={[.4,1.5,-.3]}><boxGeometry args={[.22,.7,.22]}/><Facet color={theme.rock}/></mesh>
  <Smoke p={[.4,1.95,-.3]}/>
 </group>;
};

export const Boat:React.FC<{p:V3;delay?:number}>=({p,delay=0})=>{
 const f=useCurrentFrame(),s=useRise(delay);
 return <group position={[p[0],p[1]+Math.sin(f/16)*.07,p[2]]} rotation={[0,.6,Math.sin(f/20)*.05]} scale={s*1.3}>
  <mesh position={[0,.15,0]}><boxGeometry args={[1.6,.3,.6]}/><Facet color={theme.coral}/></mesh>
  <mesh position={[1.05,.15,0]} rotation={[Math.PI/4,0,-Math.PI/2]}><coneGeometry args={[.42,.5,4]}/><Facet color={theme.coral}/></mesh>
  <mesh position={[0,.9,0]}><cylinderGeometry args={[.04,.04,1.7,6]}/><Facet color={theme.trunk}/></mesh>
  <mesh position={[-.1,.95,0]} rotation={[0,0,Math.PI/2]}><circleGeometry args={[.75,3]}/><Facet color="#FFFFFF" double/></mesh>
 </group>;
};

// Faceted sun with a pale halo; it rises into the sky.
export const Sun:React.FC<{delay?:number}>=({delay=0})=>{
 const f=useCurrentFrame(),s=useRise(delay,true);
 return <group position={[-21,12-(1-Math.min(s,1))*8,-40]} rotation={[0,f*.005,f*.003]}>
  <mesh scale={s}><icosahedronGeometry args={[3,1]}/><meshStandardMaterial color={theme.sun} emissive="#FFC933" emissiveIntensity={1.1} flatShading roughness={1} fog={false}/></mesh>
  <mesh scale={s*1.45}><icosahedronGeometry args={[3,1]}/><meshBasicMaterial color="#FFE88A" transparent opacity={.22} fog={false}/></mesh>
 </group>;
};

export const Cloud:React.FC<{p:V3;delay?:number;s?:number}>=({p,delay=0,s=1})=>{
 const f=useCurrentFrame(),k=useRise(delay,true);
 return <group position={[p[0]+Math.sin(f/70+p[2])*1.2-(1-Math.min(k,1))*10,p[1]+Math.sin(f/40+p[0])*.2,p[2]]} scale={k*s}>
  {[[-1.4,0,0,1],[0,.35,0,1.4],[1.5,0,.2,1.1],[.4,-.1,.8,.9]].map(([x,y,z,r],i)=><mesh key={i} position={[x,y,z]}><icosahedronGeometry args={[r,1]}/><Facet color={theme.cloud}/></mesh>)}
 </group>;
};

// Bird: two triangle wings flapping, flying a slow circle.
export const Bird:React.FC<{c:V3;R:number;speed:number;phase:number;delay:number}>=({c,R,speed,phase,delay})=>{
 const f=useCurrentFrame(),s=useRise(delay),a=f*speed+phase,flap=Math.sin(f*.55+phase*3)*.6;
 return <group position={[c[0]+Math.cos(a)*R,c[1]+Math.sin(a*2)*.4,c[2]+Math.sin(a)*R]} rotation={[0,-a,0]} scale={s*1.5}>
  {[-1,1].map(side=><group key={side} rotation={[0,0,flap*side]}>
   <mesh position={[side*.05,0,0]} scale={[side,1,1]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.32,3]}/><Facet color={theme.ink} double/></mesh>
  </group>)}
 </group>;
};
