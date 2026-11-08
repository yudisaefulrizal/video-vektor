import React from 'react';
import {interpolate,spring} from 'remotion';
import {Exclaim,LINE,M,Stickman,wobbly,wobblyRect} from './Marker';

const outline={stroke:M.ink,strokeWidth:LINE,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};

/** Small house seen through the doorway: white walls, red roof, a fence and grass. */
const House:React.FC<{x:number;y:number}>=({x,y})=><g transform={`translate(${x} ${y})`}>
 <path d={wobbly([[-150,40],[150,40],[150,250],[-150,250]],3,3)+'Z'} fill={M.grass} {...outline} strokeWidth={LINE*.6}/>
 <path d={wobblyRect(-90,-40,180,150,7,3)} fill={M.wall} {...outline} strokeWidth={LINE*.7}/>
 <path d={wobbly([[-115,-30],[0,-120],[115,-30]],9,3)+'Z'} fill={M.roof} {...outline} strokeWidth={LINE*.7}/>
 <path d={wobblyRect(-22,40,44,70,11,2)} fill={M.roof} {...outline} strokeWidth={LINE*.55}/>
 <path d={wobblyRect(-70,0,36,32,13,2)} fill={M.window} {...outline} strokeWidth={LINE*.5}/><path d={wobblyRect(34,0,36,32,15,2)} fill={M.window} {...outline} strokeWidth={LINE*.5}/>
 {/* picket fence */}
 {Array.from({length:9},(_,i)=><path key={i} d={wobblyRect(-156+i*36,100,14,52,20+i,1)} fill={M.paper} {...outline} strokeWidth={LINE*.4}/>)}
 <path d={wobblyRect(-162,118,324,12,40,1)} fill={M.paper} {...outline} strokeWidth={LINE*.4}/>
</g>;

/** Open double door with a bright view inside; leaves swing open with the progress `open` (0..1). */
const OpenDoor:React.FC<{x:number;y:number;open:number}>=({x,y,open})=>{
 const w=420,h=640,swing=open*150;
 return <g transform={`translate(${x} ${y})`}>
  {/* doorway: bright light and the house */}
  <path d={wobblyRect(-w/2,-h,w,h,1,3)} fill={M.light} {...outline}/>
  <svg x={-w/2+6} y={-h+6} width={w-12} height={h-12} viewBox={`${-w/2+6} ${-h+6} ${w-12} ${h-12}`} overflow="hidden"><House x={0} y={-260}/></svg>
  <path d={wobblyRect(-w/2,-h,w,h,1,3)} fill="none" {...outline}/>
  {/* leaves: wood panels hinged on each side */}
  {[-1,1].map(side=>{const hinge=side*w/2,edge=hinge+side*swing;return <g key={side}>
   <path d={wobbly([[hinge,-h-6],[edge,-h-40*open],[edge,30*open],[hinge,6]],5+side,3)+'Z'} fill={M.wood} {...outline}/>
   {[.2,.62].map((t,i)=><path key={i} d={wobbly([[hinge+(edge-hinge)*.2,-h*(1-t)+(-30*open)*(1-t)],[hinge+(edge-hinge)*.8,-h*(1-t)-24*open*(1-t)],[hinge+(edge-hinge)*.8,-h*(1-t)+h*.3],[hinge+(edge-hinge)*.2,-h*(1-t)+h*.3]],30+i+side,2)+'Z'} fill="none" stroke={M.ink} strokeWidth={LINE*.55} strokeLinejoin="round"/>)}
   <circle cx={hinge+(edge-hinge)*.86} cy={-h*.45} r="12" fill={M.yellow} stroke={M.ink} strokeWidth={LINE*.5}/>
  </g>;})}
 </g>;
};

/** A stickman, hand on chin, looking at an open door with a home inside. */
export const DoorScene:React.FC<{f:number}>=({f})=>{
 const open=spring({frame:f-8,fps:30,config:{damping:16,stiffness:60}});
 const marks=spring({frame:f-40,fps:30,config:{damping:10,stiffness:150}});
 const breathe=Math.sin(Math.floor(f/3)*3/14)*3;
 return <g>
  <rect x="-100" y="-100" width="2120" height="1280" fill={M.sky}/>
  {/* rolling hills and a winding sandy path leading out of the door */}
  <path d={wobbly([[-100,760],[300,700],[700,740],[1100,690],[1500,720],[2020,680]],60,10)+' L2020 1180 L-100 1180Z'} fill={M.grass} {...outline}/>
  <path d={wobbly([[1180,1010],[1060,1060],[900,1110],[760,1180]],70,8)+' L860 1180 '+wobbly([[1180,1180],[1300,1100],[1400,1010]],80,8).slice(1)+'Z'} fill={M.sand} {...outline}/>
  <g transform="translate(1290 1010) scale(1.32)"><OpenDoor x={0} y={0} open={open}/></g>
  <g transform={`translate(0 ${breathe})`}>
   <Stickman x={340} y={930} s={1.85} pose="chin" seed={2}/>
  </g>
  <Exclaim x={540} y={250} s={1.1} p={marks}/>
 </g>;
};

export const progress=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
