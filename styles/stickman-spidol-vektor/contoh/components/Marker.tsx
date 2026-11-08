import React from 'react';

// Marker-and-coloured-pencil look: thick black marker outlines with round ends, and colour filled with
// visible diagonal pencil hatching over a light base. Shapes stay simple; the hand-made feel comes from
// slightly uneven lines and the hatching, not from detail.
// Marker look: every shape is one flat colour with a thick black marker outline (round ends, slightly
// uneven like a hand-drawn line). No hatching, gradients or textures.
export const M={
 ink:'#1D1D24',paper:'#FFFFFF',
 sky:'#BFE0F7',grass:'#9FD46C',sand:'#F2CF95',
 wood:'#C8773A',light:'#FFF1A8',roof:'#EE5A2E',wall:'#FFF8EE',window:'#9FD0F2',
 yellow:'#FFC928',orange:'#FF9F1C',
};
export const LINE=12;

/** Deterministic pseudo-random in [-1,1], so a frame always draws the same wobble. */
export const rand=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return (x-Math.floor(x))*2-1;};

/** A hand-drawn line through points: each segment bows a little, as a marker stroke does. */
export function wobbly(points:[number,number][],seed=0,amount=4){
 let d=`M${points[0][0]} ${points[0][1]}`;
 for(let i=1;i<points.length;i++){
  const [x0,y0]=points[i-1],[x1,y1]=points[i];
  const mx=(x0+x1)/2+rand(seed+i)*amount,my=(y0+y1)/2+rand(seed+i+50)*amount;
  d+=` Q${mx} ${my} ${x1} ${y1}`;
 }
 return d;
}

/** Closed hand-drawn rectangle with slightly uneven corners. */
export const wobblyRect=(x:number,y:number,w:number,h:number,seed=0,amount=4)=>
 wobbly([[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]],seed,amount)+'Z';

/** Exclamation marks drawn with a marker: yellow fill, dark outline. */
export const Exclaim:React.FC<{x:number;y:number;s?:number;p?:number}>=({x,y,s=1,p=1})=><g transform={`translate(${x} ${y}) scale(${s*p})`}>
 {[[0,0,-14,1],[78,-26,-6,1.25]].map(([dx,dy,rot,k],i)=><g key={i} transform={`translate(${dx} ${dy}) rotate(${rot}) scale(${k})`}>
  <path d="M-18 -72 L18 -72 L10 12 L-10 12Z" fill={M.yellow} stroke={M.ink} strokeWidth={LINE*.8} strokeLinejoin="round"/>
  <circle cx="0" cy="40" r="15" fill={M.yellow} stroke={M.ink} strokeWidth={LINE*.8}/>
 </g>)}
</g>;

/**
 * Stickman: a big white round head with a thick marker outline, and limbs drawn as single marker lines.
 * Origin is the neck. `pose` sets where the hands go; `face` is optional and minimal.
 */
export type StickPose='stand'|'chin'|'shrug'|'point';
export const Stickman:React.FC<{x:number;y:number;s?:number;pose?:StickPose;face?:'none'|'dots'|'surprised';flip?:boolean;seed?:number}>=({x,y,s=1,pose='stand',face='none',flip,seed=0})=>{
 const line={stroke:M.ink,strokeWidth:LINE*1.1,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,fill:'none'};
 const arms:Record<StickPose,[number,number][][]>={
  stand:[[[0,40],[-60,150],[-70,250]],[[0,40],[60,150],[70,250]]],
  chin:[[[0,40],[-60,150],[-70,250]],[[0,40],[96,120],[66,-6]]],
  shrug:[[[0,40],[-90,110],[-150,70]],[[0,40],[90,110],[150,70]]],
  point:[[[0,40],[-60,150],[-70,250]],[[0,40],[110,60],[210,30]]],
 };
 return <g transform={`translate(${x} ${y}) scale(${flip?-s:s} ${s})`}>
  {/* body and legs */}
  <path d={wobbly([[0,-10],[0,300]],seed,3)} {...line}/>
  <path d={wobbly([[0,300],[-60,480]],seed+3,4)} {...line}/><path d={wobbly([[0,300],[60,480]],seed+5,4)} {...line}/>
  {arms[pose].map((pts,i)=><path key={i} d={wobbly(pts,seed+10+i*4,4)} {...line}/>)}
  {pose==='chin'&&<circle cx="66" cy="-6" r="22" fill={M.paper} stroke={M.ink} strokeWidth={LINE*.8}/>}
  {/* head on top, so the neck line tucks under it */}
  <path d={circlePath(0,-130,128,seed)} fill={M.paper} stroke={M.ink} strokeWidth={LINE*1.15} strokeLinejoin="round"/>
  {face==='dots'&&<g fill={M.ink}><ellipse cx="34" cy="-140" rx="9" ry="13"/><ellipse cx="80" cy="-142" rx="8" ry="12"/></g>}
  {face==='surprised'&&<g fill={M.ink}><ellipse cx="34" cy="-146" rx="10" ry="15"/><ellipse cx="80" cy="-148" rx="9" ry="14"/><ellipse cx="58" cy="-88" rx="12" ry="16"/></g>}
 </g>;
};

/** A circle drawn by hand: slightly irregular radius, closed with a small overlap like a marker loop. */
export function circlePath(cx:number,cy:number,r:number,seed=0,steps=18){
 const pts:[number,number][]=[];
 for(let i=0;i<=steps;i++){const a=i/steps*Math.PI*2-Math.PI/2,rr=r*(1+rand(seed+i)*.015);pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
 let d=`M${pts[0][0]} ${pts[0][1]}`;
 for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],a=((i-.5)/steps)*Math.PI*2-Math.PI/2,k=r/Math.cos(Math.PI/steps);d+=` Q${cx+Math.cos(a)*k} ${cy+Math.sin(a)*k} ${x1} ${y1}`;void x0;void y0;}
 return d+'Z';
}
