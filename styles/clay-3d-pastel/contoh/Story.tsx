import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Shot} from './edit';
import {Ball,Block,Cloud,Creature,Plant,theme,useExit} from './components/Clay';

// Draw each shot here, following ../style.md. Format fixed by the pipeline: a 1920x1080 picture per shot,
// `f` is the frame inside the shot. This example: a clay creature waves next to a growing plant, cloud above.
const Adegan:React.FC<{d:number}>=({d})=>{
 const f=useCurrentFrame(),out=useExit(d),dolly=1-f/Math.max(d,1)*.05;
 return <group scale={out} position={[0,(1-out)*-.5,0]}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow><circleGeometry args={[9,64]}/><meshStandardMaterial color={theme.floor} roughness={1}/></mesh>
  <Creature p={[-1.6,0,0]} delay={4} wave/>
  <Plant p={[2.1,0,.2]} delay={14}/>
  <Block p={[0,.35,-2.2]} s={[1.6,.7,1.2]} color={theme.purple} rot={.4}/>
  <Block p={[-3.6,.5,-1.5]} s={[1,1,1]} color={theme.yellow} rot={-.3}/>
  <Ball p={[3.8,.45,-1.6]} r={.45} color={theme.green}/>
  <Cloud p={[.3,4.3,-3]} delay={24}/>
  <group scale={dolly}/>
 </group>;
};

const scenes:Record<Shot['id'],React.FC<{d:number}>>={adegan:Adegan};

export const StoryShot:React.FC<{shot:Shot}>=({shot})=>{
 const Scene=scenes[shot.id];
 return <div style={{position:'absolute',inset:0,background:theme.bg}}>
  <ThreeCanvas width={1920} height={1080} shadows dpr={1} camera={{position:[0,3.2,11],fov:32}} gl={{antialias:true}}
   onCreated={({camera})=>camera.lookAt(0,1.8,0)}>
   <ambientLight intensity={1.5}/>
   <directionalLight position={[-5,9,7]} intensity={2.1} color="#FFE9CC" castShadow shadow-mapSize={[2048,2048]} shadow-radius={9} shadow-bias={-.0004}
    shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9}/>
   <directionalLight position={[6,3,4]} intensity={.7} color="#CFE6F7"/>
   <Scene d={shot.duration}/>
  </ThreeCanvas>
 </div>;
};
