import React from 'react';
import {Easing,interpolate,useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Shot} from './edit';
import {Bird,Boat,Cabin,Cloud,MOUNTAINS,Mountain,ROCKS,Rock,Sun,Terrain,TREES,TreeMesh,Water,theme,useExit} from './components/Poly';

// Draw each shot here, following ../style.md. Format fixed by the pipeline: a 1920x1080 picture per shot,
// `d` is the shot length in frames. This example: an island rises from the sea while the camera drifts around it.
// The whole world (lights included) turns slightly under a fixed camera, which looks like a slow orbit.
const Adegan:React.FC<{d:number}>=({d})=>{
 const f=useCurrentFrame(),out=useExit(d);
 const orbit=interpolate(f,[0,d],[-.11,.1],{easing:Easing.inOut(Easing.ease)});
 // Sea and lights stay while everything else sinks, so the last frame is the same empty sea as the first.
 return <group rotation={[0,orbit,0]}>
  <hemisphereLight args={['#FFFFFF','#9CC5D8',1.9]}/>
  <directionalLight position={[10,14,8]} intensity={2.4} color="#FFF3D6"/>
  <Water/>
  <group scale={out} position={[0,-(1-out)*3,0]}>
   <Terrain/>
   {MOUNTAINS.map(([a,dist,h,r],i)=><Mountain key={i} a={a} d={dist} h={h} r={r} delay={8+i*3}/>)}
   {TREES.map((t,i)=><TreeMesh key={i} t={t}/>)}
   {ROCKS.map((r,i)=><Rock key={i} p={r.p} s={r.s} c={r.c} delay={44+i}/>)}
   <Cabin delay={48}/>
   <Boat p={[6.5,0,9]} delay={56}/>
   <Sun delay={30}/>
   <Cloud p={[-3,10,-10]} delay={40}/>
   <Cloud p={[9,9.4,-16]} delay={46} s={1.3}/>
   <Cloud p={[4,9.8,-6]} delay={52} s={.8}/>
   <Bird c={[0,8.8,-8]} R={4.8} speed={.018} phase={0} delay={60}/>
   <Bird c={[0,8.8,-8]} R={5.4} speed={.018} phase={.5} delay={62}/>
   <Bird c={[0,8.8,-8]} R={4.2} speed={.018} phase={1} delay={64}/>
  </group>
 </group>;
};

const scenes:Record<Shot['id'],React.FC<{d:number}>>={adegan:Adegan};

export const StoryShot:React.FC<{shot:Shot}>=({shot})=>{
 const Scene=scenes[shot.id];
 return <div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,${theme.skyTop} 0%,${theme.horizon} 24%,${theme.horizon} 100%)`}}>
  <ThreeCanvas width={1920} height={1080} flat dpr={1} camera={{position:[0,6.8,22],fov:45,near:.5,far:200}}
   gl={{antialias:true}} onCreated={({camera})=>camera.lookAt(0,1.5,0)}>
   <fog attach="fog" args={[theme.horizon,22,80]}/>
   <Scene d={shot.duration}/>
  </ThreeCanvas>
 </div>;
};
