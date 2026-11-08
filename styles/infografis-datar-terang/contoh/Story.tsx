import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
import {Shot} from './edit';
import {Counter,DrawLine,Entrance,Person,SceneExit,Title,pop,theme} from './components/Info';

// Draw each shot here, following ../style.md. Format fixed by the pipeline: a 1920x1080 SVG per shot,
// `f` is the frame inside the shot. This example: title, three aligned icon cards, a counter and a growing bar.
const cards=[{c:theme.blue,l:'Pelajar'},{c:theme.orange,l:'Pekerja'},{c:theme.green,l:'Pensiun'}];
const Adegan:React.FC<{f:number;d:number}>=({f,d})=>{
 const bar=interpolate(pop(f,52),[0,1],[0,1],{extrapolateLeft:'clamp'});
 return <g>
  <rect width="1920" height="1080" fill={theme.bg}/>
  <circle cx={1500} cy={720} r={380} fill={theme.yellow} opacity={.15}/>
  <SceneExit f={f} d={d}>
   <Title f={f} text="Tiga fase hidup" hero="hidup" color={theme.blue}/>
   {cards.map((k,i)=>{const cx=420+i*360;
    return <Entrance key={i} f={f} delay={14+i*5} cx={cx} cy={600}>
     <rect x={cx-150} y={400} width={300} height={400} rx={24} fill="#FFFFFF"/>
     <Person x={cx} y={570} color={k.c} s={1.3}/>
     <text x={cx} y={760} textAnchor="middle" fontFamily="Lato" fontWeight={400} fontSize={40} fill={theme.ink}>{k.l}</text>
    </Entrance>;})}
   <DrawLine f={f} delay={34} x1={1380} y1={800} x2={1800} y2={800}/>
   <Counter f={f} to={72} delay={40} x={1590} y={620} suffix="%" color={theme.orange}/>
   <rect x={1380} y={700} width={420*bar*.72} height={50} rx={25} fill={theme.orange}/>
   <text x={1590} y={860} textAnchor="middle" fontFamily="Lato" fontWeight={400} fontSize={40} fill={theme.ink}>menabung</text>
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
