import React from 'react';
import {interpolate,spring,useCurrentFrame} from 'remotion';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Single source of truth for the style. Do not inline colours in scenes.
export const theme={bg:'#F6EFE6',floor:'#F2E4D2',blue:'#8EC5E8',pink:'#F4A9B8',yellow:'#F7D488',green:'#9ED6B0',purple:'#C3B1E1',bone:'#FFF8EE',eye:'#3B3A4A'} as const;
const FPS=30;
const bouncy={damping:9,stiffness:140,mass:.8};

// Bouncy scale-in: overshoots slightly, then settles.
export const usePop=(delay=0)=>spring({frame:useCurrentFrame()-delay,fps:FPS,config:bouncy});
export const useExit=(d:number)=>interpolate(useCurrentFrame(),[d-12,d-2],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});

export const ClayMaterial:React.FC<{color:string}>=({color})=><meshStandardMaterial color={color} roughness={.92} metalness={0}/>;

export const Ball:React.FC<{p:[number,number,number];r:number;color:string}>=({p,r,color})=>
 <mesh position={p} castShadow><sphereGeometry args={[r,48,48]}/><ClayMaterial color={color}/></mesh>;

export const Block:React.FC<{p:[number,number,number];s:[number,number,number];color:string;rot?:number}>=({p,s,color,rot=0})=>{
 const geo=React.useMemo(()=>new RoundedBoxGeometry(s[0],s[1],s[2],6,Math.min(...s)*.28),[s]);
 return <mesh position={p} rotation={[0,rot,0]} geometry={geo} castShadow receiveShadow><ClayMaterial color={color}/></mesh>;
};

// Round clay creature: body ball, head ball, eyes, cheeks, mouth, stubby arms and feet.
export const Creature:React.FC<{p:[number,number,number];delay?:number;wave?:boolean}>=({p,delay=0,wave=false})=>{
 const f=useCurrentFrame(),pop=usePop(delay),breathe=1+Math.sin(f/18)*.02,sway=Math.sin(f/26)*.05;
 const blink=f%100>94?.12:1,armA=wave?-1.9+Math.sin(f/6)*.45:-.3;
 return <group position={p} scale={pop} rotation={[0,0,sway]}>
  <group scale={[1,breathe,1]}>
   <mesh position={[0,.9,0]} castShadow><sphereGeometry args={[.95,48,48]}/><ClayMaterial color={theme.blue}/></mesh>
   <mesh position={[0,2.2,.05]} castShadow><sphereGeometry args={[.95,48,48]}/><ClayMaterial color={theme.blue}/></mesh>
   {[-.34,.34].map((x,i)=><mesh key={i} position={[x,2.3,.88]} scale={[1,blink,1]}><sphereGeometry args={[.1,24,24]}/><meshStandardMaterial color={theme.eye} roughness={.5}/></mesh>)}
   {[-.62,.62].map((x,i)=><mesh key={i} position={[x,2.06,.78]} scale={[1,.7,.4]}><sphereGeometry args={[.17,24,24]}/><meshStandardMaterial color={theme.pink} roughness={1}/></mesh>)}
   <mesh position={[0,2.08,.9]} rotation={[0,0,Math.PI]}><torusGeometry args={[.22,.05,16,32,Math.PI]}/><meshStandardMaterial color={theme.eye} roughness={.6}/></mesh>
   <group position={[-.95,1.0,0]} rotation={[0,0,.5]}><mesh position={[-.2,-.2,0]} castShadow><capsuleGeometry args={[.2,.4,12,24]}/><ClayMaterial color={theme.blue}/></mesh></group>
   <group position={[.95,1.2,0]} rotation={[0,0,armA]}><mesh position={[.2,-.2,0]} castShadow><capsuleGeometry args={[.2,.4,12,24]}/><ClayMaterial color={theme.blue}/></mesh></group>
   {[-.4,.4].map((x,i)=><mesh key={i} position={[x,.08,.25]} scale={[1,.55,1.3]} castShadow><sphereGeometry args={[.3,24,24]}/><ClayMaterial color={theme.blue}/></mesh>)}
  </group>
 </group>;
};

// Pot with a plant that grows.
export const Plant:React.FC<{p:[number,number,number];delay?:number}>=({p,delay=0})=>{
 const f=useCurrentFrame(),pop=usePop(delay),grow=usePop(delay+14),sway=Math.sin(f/20)*.06;
 return <group position={p} scale={pop}>
  <mesh position={[0,.45,0]} castShadow><cylinderGeometry args={[.6,.45,.9,40]}/><ClayMaterial color={theme.pink}/></mesh>
  <group scale={[1,grow,1]} rotation={[0,0,sway]}>
   <mesh position={[0,1.1,0]} castShadow><cylinderGeometry args={[.07,.09,1.2,16]}/><ClayMaterial color={theme.green}/></mesh>
   <mesh position={[-.45,1.7,0]} rotation={[0,0,.7]} scale={[1.4,.55,.7]} castShadow><sphereGeometry args={[.4,32,32]}/><ClayMaterial color={theme.green}/></mesh>
   <mesh position={[.45,1.95,0]} rotation={[0,0,-.7]} scale={[1.4,.55,.7]} castShadow><sphereGeometry args={[.4,32,32]}/><ClayMaterial color={theme.green}/></mesh>
   <mesh position={[0,2.35,0]} castShadow><sphereGeometry args={[.3,32,32]}/><ClayMaterial color={theme.yellow}/></mesh>
  </group>
 </group>;
};

// Puffy cloud made of balls, drifting.
export const Cloud:React.FC<{p:[number,number,number];delay?:number}>=({p,delay=0})=>{
 const f=useCurrentFrame(),pop=usePop(delay);
 return <group position={[p[0]+Math.sin(f/40)*.25,p[1]+Math.sin(f/30)*.1,p[2]]} scale={pop}>
  {[[-.7,0,.5],[0,.25,.7],[.75,0,.5],[0,-.05,.45]].map(([x,y,r],i)=><Ball key={i} p={[x,y,0]} r={r} color={theme.bone}/>)}
 </group>;
};
