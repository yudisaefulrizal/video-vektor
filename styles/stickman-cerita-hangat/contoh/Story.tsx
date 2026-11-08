import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
import {Shot} from './edit';
import {Head,Limb,Steam,Torso,theme} from './components/Toon';

// Draw each shot here, following ../style.md. Format fixed by the pipeline: a 1920x1080 SVG per shot,
// `f` is the frame inside the shot. This example: a cafe by the street, the protagonist at a table.
const Window:React.FC<{x:number;y:number}>=({x,y})=><rect x={x} y={y} width={50} height={80} rx={8} fill={theme.window} opacity={.8}/>;
const Tree:React.FC<{x:number;f:number}>=({x,f})=><g>
 <path d={`M${x-14},800 L${x-10},430 Q${x},420 ${x+10},430 L${x+14},800 Z`} fill="#8A7A66" stroke="#6B5D4C" strokeWidth={3}/>
 {[[0,360,170],[-120,430,120],[130,420,130],[-30,300,110],[70,330,100]].map(([dx,dy,r],i)=>
  <circle key={i} cx={x+dx+Math.sin(f/40+i)*4} cy={dy} r={r} fill={i%2?theme.leaf2:theme.leaf} stroke="#6E9457" strokeWidth={3}/>)}
</g>;

const Adegan:React.FC<{f:number;d:number}>=({f})=>{
 const bob=Math.sin(f/22)*3,blink=f%90>84?'closed':'open',sip=interpolate(f%150,[100,120,140],[0,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const eyes=(sip>.5||blink==='closed')?'closed':'open';
 const hand:[number,number]=[905+sip*-60,646-sip*200];
 const fall=(i:number)=>((f*2+i*190)%1100);
 return <g>
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E3ECE6"/><stop offset="1" stopColor={theme.cream}/></linearGradient>
   <filter id="mist"><feGaussianBlur stdDeviation="2"/></filter></defs>
  <rect width="1920" height="1080" fill="url(#sky)"/>
  {/* far layer: pale buildings fading into mist */}
  <g opacity={.55} filter="url(#mist)">
   <rect x={1000} y={200} width={420} height={560} rx={14} fill={theme.brick}/>
   <rect x={1480} y={120} width={440} height={640} rx={14} fill="#E3D6C6"/>
   {[0,1,2].map(r=>[0,1,2,3].map(c=><Window key={r+'-'+c} x={1030+c*95} y={250+r*150}/>))}
   {[0,1,2,3].map(r=>[0,1,2,3].map(c=><Window key={'b'+r+c} x={1520+c*100} y={180+r*140}/>))}
   <rect x={1080} y={650} width={120} height={110} rx={10} fill="#C98F7E"/>
  </g>
  {/* street, sidewalk */}
  <rect x={0} y={700} width={1920} height={380} fill={theme.road}/>
  <path d="M0,760 L1920,720 L1920,1080 L0,1080 Z" fill={theme.sidewalk}/>
  <path d="M0,760 L1920,720" stroke="#B9B39F" strokeWidth={4}/>
  {/* mid layer: tree and street lamp */}
  <Tree x={1330} f={f}/>
  <g stroke="#6B7280" strokeWidth={3}><rect x={1060} y={380} width={16} height={420} rx={6} fill="#9AA2AE"/><path d="M1068,380 Q1068,340 1110,340" fill="none" strokeWidth={8}/><circle cx={1112} cy={344} r={20} fill="#F6E7B6"/></g>
  {/* falling leaves */}
  {[0,1,2].map(i=><ellipse key={i} cx={1500-fall(i)*.5+Math.sin((f+i*30)/12)*30} cy={500+fall(i)*.45} rx={14} ry={7} fill={theme.leaf2} transform={`rotate(${f*4+i*60} ${1500-fall(i)*.5} ${500+fall(i)*.45})`} opacity={.9}/>)}
  {/* chair back */}
  <g fill={theme.teal} stroke="#5E8A7C" strokeWidth={3}>
   <rect x={395} y={470} width={26} height={400} rx={10}/><rect x={395} y={470} width={190} height={26} rx={12}/>
   <rect x={410} y={870} width={400} height={30} rx={12}/>
  </g>
  {/* protagonist */}
  <Torso x={650} y={455}/>
  <Head x={650} y={330} eyes={eyes} bob={bob}/>
  {/* table */}
  <rect x={950} y={810} width={22} height={240} fill="#7FA89B" stroke="#5E8A7C" strokeWidth={3}/>
  <ellipse cx={960} cy={1050} rx={120} ry={22} fill="#7FA89B" stroke="#5E8A7C" strokeWidth={3}/>
  <ellipse cx={960} cy={790} rx={380} ry={62} fill="#6E9C8E"/>
  <ellipse cx={960} cy={768} rx={380} ry={62} fill={theme.teal} stroke="#5E8A7C" strokeWidth={3}/>
  <g opacity={.28} fill="#4F7A5A">{[[760,760],[880,775],[1010,760],[1100,780]].map(([x,y],i)=><ellipse key={i} cx={x+Math.sin(f/50+i)*6} cy={y} rx={34} ry={9}/>)}</g>
  {/* props: book, pen */}
  <path d="M780,745 L930,730 L1010,748 L860,768 Z" fill="#EFE7D6" stroke="#8C8470" strokeWidth={3}/>
  <path d="M870,760 L1005,745" stroke="#B3AA92" strokeWidth={3}/>
  <rect x={1060} y={755} width={150} height={26} rx={8} fill="#394150" stroke={theme.ink} strokeWidth={3} transform="rotate(-6 1135 768)"/>
  {/* mug */}
  <g transform={`translate(${sip*-60} ${sip*-200})`}>
   <path d="M960,700 q50,0 50,28 q0,28 -50,28" fill="none" stroke={theme.mug} strokeWidth={14}/>
   <rect x={850} y={650} width={110} height={120} rx={16} fill={theme.mug} stroke="#A67C25" strokeWidth={3}/>
   <rect x={864} y={662} width={14} height={90} rx={7} fill="#F0CC7A" opacity={.7}/>
  </g>
  <Steam x={905-sip*60} y={640-sip*200} f={f}/>
  {/* arms and legs, over the table */}
  <Limb pts={[[600,490],[540,650],[700,782]]}/>
  <Limb pts={[[705,495],[830,600],hand]}/>
  <Limb pts={[[650,840],[800,890],[790,1040]]}/>
 </g>;
};

const scenes:Record<Shot['id'],React.FC<{f:number;d:number}>>={adegan:Adegan};

export const StoryShot:React.FC<{shot:Shot}>=({shot})=>{
 const f=useCurrentFrame(),Scene=scenes[shot.id];
 return <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{position:'absolute',inset:0}}>
  <Scene f={f} d={shot.duration}/>
 </svg>;
};
