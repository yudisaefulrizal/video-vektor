import React from 'react';

/**
 * The paper-cut principle: everything is built from simple flat shapes (circle, ellipse, capsule, blob)
 * stacked on top of each other. Each piece casts a small shadow on the pieces below it; that shadow,
 * not gradients or textures, is what makes the picture read as layered paper.
 *
 * <Cut> draws its children twice: first as a dark, slightly offset silhouette (the shadow), then as
 * themselves. The shadow is a plain shape, not an SVG filter, so it stays crisp and cheap to render.
 */
const SHADOW='#0B2447';

function silhouette(node:React.ReactNode):React.ReactNode{
 return React.Children.map(node,child=>{
  if(!React.isValidElement(child))return child;
  const props=child.props as Record<string,unknown>;
  const next:Record<string,unknown>={};
  if(props.fill!==undefined&&props.fill!=='none')next.fill=SHADOW;
  if(props.stroke!==undefined&&props.stroke!=='none')next.stroke=SHADOW;
  if(props.children!==undefined&&typeof props.children!=='string')next.children=silhouette(props.children as React.ReactNode);
  return React.cloneElement(child,next);
 });
}

export const Cut:React.FC<{children:React.ReactNode;depth?:number}>=({children,depth=6})=><>
 <g transform={`translate(${depth*.25} ${depth})`} opacity={.16}>{silhouette(children)}</g>
 <g transform={`translate(${depth*.1} ${depth*.45})`} opacity={.14}>{silhouette(children)}</g>
 {children}
</>;

/** Capsule between two points: arms, legs, lamp cords. */
export const Capsule:React.FC<{x1:number;y1:number;x2:number;y2:number;w:number;fill:string}>=({x1,y1,x2,y2,w,fill})=>
 <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={fill} strokeWidth={w} strokeLinecap="round" fill="none"/>;
