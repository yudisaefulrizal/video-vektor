import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease,mix} from './components/Paper';
import {CafeScene} from './components/CafeScene';
import {Shot} from './edit';

/** Camera over the paper board: x/y is the point looked at, z the zoom. */
const Cam:React.FC<{x?:number;y?:number;z?:number;children:React.ReactNode}>=({x=960,y=540,z=1,children})=><g transform={`translate(960 540) scale(${z}) translate(${-x} ${-y})`}>{children}</g>;

const CafeShot:React.FC<{f:number;d:number}>=({f,d})=><Cam z={mix(1,1.05,ease(f,0,d))}><CafeScene f={f}/></Cam>;

const scenes:Record<Shot['id'],React.FC<{f:number;d:number}>>={cafe:CafeShot};

export const StoryShot:React.FC<{shot:Shot}>=({shot})=>{
 const f=useCurrentFrame(),Scene=scenes[shot.id];
 return <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{position:'absolute',inset:0}}>
  <Scene f={f} d={shot.duration}/>
 </svg>;
};
