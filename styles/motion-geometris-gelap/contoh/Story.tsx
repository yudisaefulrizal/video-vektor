import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
import {Shot} from './edit';
import {Background,Breathe,Entrance,Glow,SceneExit,theme,pop} from './components/Motion';

// Draw each shot here, following ../style.md. Format fixed by the pipeline: a 1920x1080 SVG per shot,
// `f` is the frame inside the shot. This example: bars rise in turn, the last one is the hero.
const values=[.35,.55,.45,.9];
const Adegan:React.FC<{f:number;d:number}>=({f,d})=>{
 const heroP=pop(f,28,theme.bouncy);
 return <g>
  <Background f={f}/>
  <SceneExit f={f} d={d}>
   {values.map((v,i)=>{
    const x=560+i*240,h=interpolate(pop(f,8+i*5,theme.snappy),[0,1],[0,v*520],{extrapolateLeft:'clamp'}),isHero=i===3;
    const bar=<rect x={x} y={800-h} width={160} height={h} rx={40} fill={isHero?theme.hero:theme.surface} stroke={isHero?'none':theme.dim} strokeWidth={isHero?0:4} strokeOpacity={.4}/>;
    return <Entrance key={i} f={f} delay={4+i*5} cx={x+80} cy={800}>{isHero?<Breathe f={f} cx={x+80} cy={800}><Glow>{bar}</Glow></Breathe>:bar}</Entrance>;
   })}
   <Entrance f={f} delay={34} cx={1280} cy={230}><circle cx={1280} cy={230} r={34*heroP} fill={theme.accent}/></Entrance>
   <line x1={500} y1={800} x2={1480} y2={800} stroke={theme.dim} strokeWidth={4} strokeLinecap="round" opacity={.5}/>
  </SceneExit>
 </g>;
};

const scenes:Record<Shot['id'],React.FC<{f:number;d:number}>>={adegan:Adegan};

export const StoryShot:React.FC<{shot:Shot}>=({shot})=>{
 const f=useCurrentFrame(),Scene=scenes[shot.id];
 return <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{position:'absolute',inset:0}}>
  <Scene f={f} d={shot.duration}/>
 </svg>;
};
