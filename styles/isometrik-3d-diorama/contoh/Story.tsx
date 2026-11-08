import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Shot} from './edit';
import {Bush,Car,Cloud,Coin,GroundShadow,Island,Office,Road,Shop,Tree,Walker,theme,useExit} from './components/Iso';

// Draw each shot here, following ../style.md. Format fixed by the pipeline: a 1920x1080 picture per shot,
// `d` is the shot length in frames. This example: an isometric island builds itself, then the town comes alive.
const Adegan:React.FC<{d:number}>=({d})=>{
 const f=useCurrentFrame(),out=useExit(d),drift=1+f/Math.max(d,1)*.04;
 return <>
  <GroundShadow o={out}/>
  <group scale={out*drift} position={[0,Math.sin(f/34)*.12-(1-out)*2,0]}>
   <Island/>
   <Road z={2.5} delay={10}/>
   <Office p={[-1.4,0,-1.6]} delay={16}/>
   <Shop p={[2.1,0,-1.3]} delay={22}/>
   <Tree p={[-3.2,0,.4]} delay={28}/>
   <Tree p={[3.1,0,-3.1]} delay={31} s={1.1}/>
   <Bush p={[3.4,0,.7]} delay={34}/>
   <Bush p={[.4,0,-3.2]} delay={36}/>
   <Bush p={[-.1,0,.3]} delay={38}/>
   <Car z={2.5} delay={40}/>
   <Car z={2.5} delay={42} offset={3.4} color={theme.blue}/>
   <Walker z={1.35} delay={44}/>
   <Coin p={[-1.4,5,-1.6]} delay={50}/>
   <Cloud p={[-5.5,2.2,-.5]} delay={54}/>
   <Cloud p={[3.6,3.6,-3.8]} delay={58}/>
  </group>
 </>;
};

const scenes:Record<Shot['id'],React.FC<{d:number}>>={adegan:Adegan};

export const StoryShot:React.FC<{shot:Shot}>=({shot})=>{
 const Scene=scenes[shot.id];
 return <div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,${theme.bgTop},${theme.bgBottom})`}}>
  <ThreeCanvas width={1920} height={1080} orthographic flat shadows dpr={1} camera={{position:[10,10,10],zoom:84,near:.1,far:100}}
   gl={{antialias:true}} onCreated={({camera})=>camera.lookAt(0,1,0)}>
   <ambientLight intensity={1.6}/>
   <directionalLight position={[4,12,8]} intensity={2} castShadow shadow-mapSize={[2048,2048]} shadow-bias={-.0006} shadow-normalBias={.03}
    shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={40}/>
   <Scene d={shot.duration}/>
  </ThreeCanvas>
 </div>;
};
