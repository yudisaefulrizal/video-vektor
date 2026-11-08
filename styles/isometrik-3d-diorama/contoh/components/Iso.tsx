import React,{useMemo} from 'react';
import {interpolate,spring,useCurrentFrame} from 'remotion';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type V3=[number,number,number];

// Single source of truth for the style. Do not inline colours in scenes.
export const theme={bgTop:'#EAF3FC',bgBottom:'#D6E6F6',grass:'#BFE3C8',soil:'#D9B99B',soilDark:'#C4A17F',wall:'#F6F8FB',cream:'#FFF1E0',
 blue:'#5B8DEF',glass:'#A9CBFF',orange:'#FF9F5A',yellow:'#FFD166',pink:'#F28DA6',ink:'#2B3A55',road:'#6F7C93',sidewalk:'#E9EDF3',
 leaf:'#7BC99A',leafDark:'#5FB583',trunk:'#B98F6B',skin:'#FFE2C8'} as const;
const FPS=30;
const grow={damping:11,stiffness:130,mass:.8};

// Elements grow out of the ground with a small overshoot. Never exactly 0: a zero scale breaks the normal matrix.
export const useRise=(delay=0)=>Math.max(spring({frame:useCurrentFrame()-delay,fps:FPS,config:grow}),.001);
export const useExit=(d:number)=>Math.max(interpolate(useCurrentFrame(),[d-12,d-2],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),.001);

// Rounded box centred on `p`. Details (windows, doors) pass cast={false} so they do not clutter the shadows.
export const Block:React.FC<{p:V3;s:V3;color:string;r?:number;cast?:boolean;rot?:V3}>=({p,s,color,r=.1,cast=true,rot})=>{
 const geo=useMemo(()=>new RoundedBoxGeometry(s[0],s[1],s[2],4,Math.max(.004,Math.min(r,Math.min(s[0],s[1],s[2])/2-.002))),[s[0],s[1],s[2],r]);
 return <mesh position={p} rotation={rot} geometry={geo} castShadow={cast} receiveShadow><meshLambertMaterial color={color}/></mesh>;
};

// Group whose origin is its base on the ground: grows upward from that point.
export const Rise:React.FC<{p:V3;delay?:number;children:React.ReactNode}>=({p,delay=0,children})=>{
 const s=useRise(delay);
 return <group position={p} scale={[s,s,s]}>{children}</group>;
};

// Floating island: grass on top, soil layers that step in underneath. Top surface is y=0.
// Each step in is small, otherwise the lower layers hide behind the upper ones in the isometric view.
export const Island:React.FC=()=>{
 const s=useRise(0);
 return <group scale={[s,s,s]}>
  <Block p={[0,-.2,0]} s={[8,.4,8]} color={theme.grass} r={.15}/>
  <Block p={[0,-.75,0]} s={[7.7,.7,7.7]} color={theme.soil} r={.15}/>
  <Block p={[0,-1.4,0]} s={[7,.6,7]} color={theme.soilDark} r={.15}/>
  <Block p={[0,-2,0]} s={[5.9,.6,5.9]} color={theme.soil} r={.15}/>
 </group>;
};

// Road along the x axis at depth z, with a sidewalk on its far side.
export const Road:React.FC<{z:number;delay?:number}>=({z,delay=0})=>{
 const s=Math.min(useRise(delay),1);
 return <group position={[0,0,z]} scale={[s,1,s]}>
  <Block p={[0,.03,0]} s={[7.9,.06,1.5]} color={theme.road} r={.02} cast={false}/>
  <Block p={[0,.02,-1.15]} s={[7.9,.04,.6]} color={theme.sidewalk} r={.015} cast={false}/>
  {[-3.5,-2.5,-1.5,-.5,.5,1.5,2.5,3.5].map(x=><Block key={x} p={[x,.065,0]} s={[.5,.012,.08]} color={theme.wall} r={.004} cast={false}/>)}
 </group>;
};

export const Office:React.FC<{p:V3;delay?:number}>=({p,delay=0})=>{
 const w=2.2,h=3.4,d=2.2;
 return <Rise p={p} delay={delay}>
  <Block p={[0,h/2,0]} s={[w,h,d]} color={theme.wall} r={.12}/>
  <Block p={[0,h+.1,0]} s={[w+.2,.2,d+.2]} color={theme.blue} r={.06}/>
  <Block p={[.4,h+.35,-.3]} s={[.7,.3,.6]} color={theme.glass} r={.05}/>
  {[0,1,2,3].map(r=>[-.5,.5].map(c=><React.Fragment key={`${r}${c}`}>
   <Block p={[w/2,1.05+r*.68,c]} s={[.04,.4,.5]} color={theme.glass} r={.015} cast={false}/>
   <Block p={[c,1.05+r*.68,d/2]} s={[.5,.4,.04]} color={theme.glass} r={.015} cast={false}/>
  </React.Fragment>))}
  <Block p={[0,.38,d/2]} s={[.6,.76,.04]} color={theme.orange} r={.015} cast={false}/>
 </Rise>;
};

export const Shop:React.FC<{p:V3;delay?:number}>=({p,delay=0})=>{
 const w=2,h=1.5,d=2;
 return <Rise p={p} delay={delay}>
  <Block p={[0,h/2,0]} s={[w,h,d]} color={theme.cream} r={.1}/>
  <Block p={[0,h+.08,0]} s={[w+.2,.16,d+.2]} color={theme.orange} r={.05}/>
  <Block p={[0,1.05,d/2+.32]} s={[1.8,.1,.7]} color={theme.pink} r={.04} rot={[.22,0,0]}/>
  <Block p={[0,.4,d/2]} s={[.6,.8,.04]} color={theme.blue} r={.015} cast={false}/>
  {[-.65,.65].map(x=><Block key={x} p={[x,.55,d/2]} s={[.45,.45,.04]} color={theme.glass} r={.015} cast={false}/>)}
  <Block p={[w/2,.7,0]} s={[.04,.5,1.1]} color={theme.glass} r={.015} cast={false}/>
 </Rise>;
};

export const Tree:React.FC<{p:V3;delay?:number;s?:number}>=({p,delay=0,s=1})=>{
 const f=useCurrentFrame(),sway=Math.sin(f/24+p[0])*.03;
 return <Rise p={p} delay={delay}><group scale={[s,s,s]} rotation={[sway,0,sway]}>
  <mesh position={[0,.28,0]} castShadow><cylinderGeometry args={[.09,.12,.56,12]}/><meshLambertMaterial color={theme.trunk}/></mesh>
  <mesh position={[0,.95,0]} scale={[1,1.1,1]} castShadow><sphereGeometry args={[.6,24,24]}/><meshLambertMaterial color={theme.leafDark}/></mesh>
  <mesh position={[0,1.55,0]} castShadow><sphereGeometry args={[.4,24,24]}/><meshLambertMaterial color={theme.leaf}/></mesh>
 </group></Rise>;
};

export const Bush:React.FC<{p:V3;delay?:number}>=({p,delay=0})=>
 <Rise p={p} delay={delay}><mesh position={[0,.2,0]} scale={[1.3,.8,1.1]} castShadow><sphereGeometry args={[.3,20,20]}/><meshLambertMaterial color={theme.leafDark}/></mesh></Rise>;

// Car drives along +x at depth z and shrinks away at both ends of the road so it never vanishes abruptly.
export const Car:React.FC<{z:number;delay?:number;speed?:number;offset?:number;color?:string}>=({z,delay=0,speed=.07,offset=0,color=theme.pink})=>{
 const f=useCurrentFrame(),s=useRise(delay);
 const x=-3.4+((f*speed+offset)%6.8),edge=Math.min(1,(x+3.4)/.7,(3.4-x)/.7);
 const k=Math.max(Math.min(s,1.1)*edge,.001);
 return <group position={[x,.06,z]} scale={[k,k,k]}>
  <Block p={[0,.3,0]} s={[1.2,.34,.62]} color={color} r={.1}/>
  <Block p={[-.12,.62,0]} s={[.66,.3,.54]} color={theme.glass} r={.1}/>
  {[[-.38,-.31],[.38,-.31],[-.38,.31],[.38,.31]].map(([wx,wz],i)=><mesh key={i} position={[wx,.14,wz]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.14,.14,.1,14]}/><meshLambertMaterial color={theme.ink}/></mesh>)}
 </group>;
};

// Tiny person (capsule + ball, no face) walking back and forth along x.
export const Walker:React.FC<{z:number;delay?:number;color?:string}>=({z,delay=0,color=theme.orange})=>{
 const f=useCurrentFrame(),s=useRise(delay),t=(f/150)*Math.PI*2;
 const x=-2.6+2.4*(1-Math.cos(t)),bob=Math.abs(Math.sin(f/3.5))*.05*Math.abs(Math.sin(t));
 return <group position={[x,bob,z]} scale={[s,s,s]}>
  <mesh position={[0,.42,0]} castShadow><capsuleGeometry args={[.17,.42,8,16]}/><meshLambertMaterial color={color}/></mesh>
  <mesh position={[0,.98,0]} castShadow><sphereGeometry args={[.17,20,20]}/><meshLambertMaterial color={theme.skin}/></mesh>
 </group>;
};

// Spinning coin that bobs in the air.
export const Coin:React.FC<{p:V3;delay?:number}>=({p,delay=0})=>{
 const f=useCurrentFrame(),s=useRise(delay);
 return <group position={[p[0],p[1]+Math.sin(f/20)*.15,p[2]]} scale={[s,s,s]} rotation={[0,f*.05,0]}>
  <group rotation={[Math.PI/2,0,0]}>
   <mesh castShadow><cylinderGeometry args={[.55,.55,.14,40]}/><meshLambertMaterial color={theme.yellow}/></mesh>
   <mesh><cylinderGeometry args={[.38,.38,.16,40]}/><meshLambertMaterial color={theme.orange}/></mesh>
  </group>
 </group>;
};

export const Cloud:React.FC<{p:V3;delay?:number}>=({p,delay=0})=>{
 const f=useCurrentFrame();
 return <Rise p={[p[0]+Math.sin(f/45+p[2])*.35,p[1]+Math.sin(f/32+p[0])*.1,p[2]]} delay={delay}>
  {[[-.75,0,.75,.42],[-.35,.15,.35,.55],[.05,.28,-.05,.62],[.45,.12,-.45,.55],[.8,0,-.8,.4]].map(([x,y,z,r],i)=><mesh key={i} position={[x,y,z]}><sphereGeometry args={[r,24,24]}/><meshLambertMaterial color={theme.wall}/></mesh>)}
 </Rise>;
};

// Soft elliptical shadow under the floating island, built from stacked translucent discs.
export const GroundShadow:React.FC<{o:number}>=({o})=>
 <group position={[0,-3,0]} rotation={[-Math.PI/2,0,0]}>
  {[[3.8,.03],[3.3,.035],[2.8,.04],[2.3,.045],[1.8,.05]].map(([r,op],i)=><mesh key={i} position={[0,0,i*.01]}><circleGeometry args={[r,48]}/><meshBasicMaterial color="#5B7FA8" transparent opacity={op*o} depthWrite={false}/></mesh>)}
 </group>;
