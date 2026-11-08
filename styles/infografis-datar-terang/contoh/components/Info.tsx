import React from 'react';
import {interpolate,spring} from 'remotion';

// Single source of truth for the style. Do not inline colours in scenes.
export const theme={bg:'#F7F5F0',ink:'#1F2937',blue:'#2563EB',orange:'#F97316',green:'#10B981',yellow:'#FBBF24',
 spring:{damping:16,stiffness:130,mass:.8}} as const;
const FPS=30;
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const pop=(f:number,delay=0)=>spring({frame:f-delay,fps:FPS,config:theme.spring});

export const Entrance:React.FC<{f:number;delay?:number;cx:number;cy:number;children:React.ReactNode}>=({f,delay=0,cx,cy,children})=>{
 const p=pop(f,delay);
 return <g opacity={p} transform={`translate(${cx} ${cy+interpolate(p,[0,1],[40,0])}) scale(${interpolate(p,[0,1],[.94,1])}) translate(${-cx} ${-cy})`}>{children}</g>;
};
export const SceneExit:React.FC<{f:number;d:number;children:React.ReactNode}>=({f,d,children})=>{
 const t=interpolate(f,[d-12,d-2],[0,1],clamp);
 return <g opacity={1-t} transform={`translate(0 ${-42*t})`}>{children}</g>;
};

// Title: one word in the accent colour.
export const Title:React.FC<{f:number;text:string;hero:string;color:string;delay?:number;x?:number;y?:number}>=({f,text,hero,color,delay=0,x=960,y=190})=>{
 const words=text.split(' ');
 const widths=words.map(w=>w.length*56+36);
 const total=widths.reduce((a,b)=>a+b,0);
 let cur=x-total/2;
 return <g>{words.map((w,i)=>{const px=cur;cur+=widths[i];
  return <Entrance key={i} f={f} delay={delay+i*3} cx={px} cy={y}><text x={px} y={y} fontFamily="Lato" fontWeight={900} fontSize={110} letterSpacing={-3} fill={w===hero?color:theme.ink}>{w}</text></Entrance>;})}</g>;
};

// Counter that counts up; tabular-nums avoids jitter.
export const Counter:React.FC<{f:number;to:number;delay?:number;x:number;y:number;suffix?:string;color:string;size?:number}>=({f,to,delay=0,x,y,suffix='',color,size=170})=>{
 const v=interpolate(spring({frame:f-delay,fps:FPS,config:{damping:30,stiffness:60,mass:1}}),[0,1],[0,to]);
 return <text x={x} y={y} textAnchor="middle" fontFamily="Lato" fontWeight={900} fontSize={size} fill={color} style={{fontVariantNumeric:'tabular-nums'}}>{Math.round(v)}{suffix}</text>;
};

// Line that draws itself from start to end.
export const DrawLine:React.FC<{f:number;delay?:number;x1:number;y1:number;x2:number;y2:number;color?:string}>=({f,delay=0,x1,y1,x2,y2,color=theme.ink})=>{
 const len=Math.hypot(x2-x1,y2-y1),p=interpolate(f,[delay,delay+20],[0,1],clamp);
 return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len*(1-p)}/>;
};

// Person icon: head circle on a capsule body, no face.
export const Person:React.FC<{x:number;y:number;color:string;s?:number}>=({x,y,color,s=1})=>
 <g transform={`translate(${x} ${y}) scale(${s})`}><circle cx={0} cy={-62} r={34} fill={color}/><rect x={-48} y={-14} width={96} height={110} rx={48} fill={color}/></g>;
