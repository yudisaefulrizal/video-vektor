import React from 'react';
import {interpolate,spring} from 'remotion';

// Single source of truth for the style. Do not inline colours or springs in scenes.
export const theme={
 bg:'#0A0A0F',surface:'#12121A',hero:'#7C3AED',accent:'#22D3EE',text:'#F4F4F5',dim:'#A1A1AA',
 snappy:{damping:14,stiffness:160,mass:.6},smooth:{damping:20,stiffness:90,mass:1},bouncy:{damping:11,stiffness:170,mass:.7},
} as const;
const FPS=30;
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

export const pop=(f:number,delay=0,config:{damping:number;stiffness:number;mass:number}=theme.smooth)=>spring({frame:f-delay,fps:FPS,config});

// Entrance: fade + rise + scale. Wrap any SVG group. Rise is in px, around the group's own origin (cx,cy).
export const Entrance:React.FC<{f:number;delay?:number;cx:number;cy:number;children:React.ReactNode}>=({f,delay=0,cx,cy,children})=>{
 const p=pop(f,delay),s=interpolate(p,[0,1],[.94,1]);
 return <g opacity={p} transform={`translate(${cx} ${cy+interpolate(p,[0,1],[40,0])}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};

// Exit: faster than entrance (10 frames). Wrap the whole scene.
export const SceneExit:React.FC<{f:number;d:number;children:React.ReactNode}>=({f,d,children})=>{
 const t=interpolate(f,[d-12,d-2],[0,1],clamp);
 return <g opacity={1-t} transform={`translate(0 ${-42*t})`}>{children}</g>;
};

// Idle breathing for anything on screen longer than 2 seconds.
export const Breathe:React.FC<{f:number;cx:number;cy:number;children:React.ReactNode}>=({f,cx,cy,children})=>
 <g transform={`translate(${cx} ${cy+Math.sin(f/30)*3}) scale(${1+Math.sin(f/22)*.015}) translate(${-cx} ${-cy})`}>{children}</g>;

// Background: never flat. Two large blurred discs drifting slowly.
export const Background:React.FC<{f:number}>=({f})=><g>
 <defs><filter id="blur-a" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter></defs>
 <rect width="1920" height="1080" fill={theme.bg}/>
 <circle cx={300+Math.sin(f/55)*50} cy={150} r={600} fill={theme.hero} opacity={.2} filter="url(#blur-a)"/>
 <circle cx={1700-Math.cos(f/70)*40} cy={1000} r={450} fill={theme.accent} opacity={.12} filter="url(#blur-a)"/>
</g>;

// Glow for the single hero element of the frame.
export const Glow:React.FC<{children:React.ReactNode}>=({children})=>
 <g style={{filter:`drop-shadow(0 0 40px ${theme.hero}88)`}}>{children}</g>;
