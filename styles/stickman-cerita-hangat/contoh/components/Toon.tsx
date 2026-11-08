import React from 'react';

// Single source of truth for the style. Do not inline colours in scenes.
export const theme={ink:'#1F2A44',cream:'#F3EEE3',sky:'#EAF0E6',brick:'#E8DFD2',teal:'#8BB5A8',leaf:'#8FB573',leaf2:'#A6C987',mug:'#D9A441',alert:'#E4574B',window:'#C9D6D8',sidewalk:'#D8D3C5',road:'#C9CFCB'} as const;

// Seated protagonist. (hx,hy) is the head centre; the torso hangs below it.
// `armR` is the hand target of the right arm, `eyes` is 'open' or 'closed'.
export const Head:React.FC<{x:number;y:number;eyes:'open'|'closed';bob?:number}>=({x,y,eyes,bob=0})=>
 <g transform={`translate(${x} ${y+bob})`}>
  <circle r={125} fill="#FFFFFF" stroke={theme.ink} strokeWidth={8}/>
  <path d="M-98,-30 A110,110 0 0 1 -30,-108" fill="none" stroke="#E6EAF0" strokeWidth={14} strokeLinecap="round"/>
  {eyes==='closed'
   ?<g fill="none" stroke={theme.ink} strokeWidth={6} strokeLinecap="round"><path d="M-62,-6 Q-42,8 -22,-6"/><path d="M22,-6 Q42,8 62,-6"/></g>
   :<g fill={theme.ink}><ellipse cx={-42} cy={-4} rx={9} ry={14}/><ellipse cx={42} cy={-4} rx={9} ry={14}/></g>}
  <g fill="none" stroke={theme.ink} strokeWidth={5} strokeLinecap="round"><path d="M-66,-38 Q-44,-52 -22,-40"/><path d="M22,-40 Q44,-52 66,-38"/><path d="M-30,52 Q0,80 34,50"/></g>
 </g>;

export const Torso:React.FC<{x:number;y:number}>=({x,y})=>
 <g transform={`translate(${x} ${y})`}>
  <path d="M-62,0 Q-8,-14 62,0 L38,300 Q0,312 -38,300 Z" fill="#FFFFFF" stroke={theme.ink} strokeWidth={8} strokeLinejoin="round"/>
  <path d="M-50,40 L-30,60 M-52,80 L-28,100 M-48,120 L-26,140 M-44,160 L-24,180" stroke="#D5DBE5" strokeWidth={5} strokeLinecap="round"/>
 </g>;

// Single-line limb through three points with a round hand/foot at the end.
export const Limb:React.FC<{pts:[number,number][]}>=({pts})=>{
 const [a,b,c]=pts;
 return <g><path d={`M${a[0]},${a[1]} Q${b[0]},${b[1]} ${c[0]},${c[1]}`} fill="none" stroke={theme.ink} strokeWidth={9} strokeLinecap="round"/><circle cx={c[0]} cy={c[1]} r={15} fill={theme.ink}/></g>;
};

// Rising steam.
export const Steam:React.FC<{x:number;y:number;f:number}>=({x,y,f})=>
 <g fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={.8}>
  {[0,1,2].map(i=>{const t=((f+i*20)%60)/60;
   return <path key={i} d={`M${x+i*22-22},${y-t*70} q10,-14 0,-28 q-10,-14 0,-28`} opacity={1-t}/>;})}
 </g>;
