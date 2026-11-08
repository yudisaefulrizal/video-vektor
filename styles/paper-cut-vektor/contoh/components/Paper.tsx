import {Easing,interpolate,spring} from 'remotion';

// Paper palette: saturated sky blues, leafy greens, warm wood, pink/purple accents. Every shape is a cut
// piece of one flat colour; depth comes only from the small shadows drawn by <Cut> (see Cut.tsx).
export const P={
 sky:'#3D8FE0',skyDeep:'#2366C4',skyLight:'#7FBFF2',
 leaf:'#5DB84A',leafDeep:'#3F9338',
 navy:'#22305A',brown:'#7B4A2C',brownLight:'#A86A3E',
 shirtBlue:'#2F5FB3',shirtPink:'#F07FA6',purple:'#9C86D8',
 red:'#E8433D',yellow:'#FFD23C',wood:'#D98B45',woodDeep:'#B9692E',
};

export const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp,easing:Easing.inOut(Easing.cubic)});
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
// Paper pieces "pop" in with a small overshoot, like a cut-out pressed onto the board.
export const pop=(f:number,start:number,fps=30)=>spring({frame:f-start,fps,config:{damping:11,stiffness:170,mass:.6}});
// Stop-motion feel: idle motion advances on twos, as if each pose were placed by hand.
export const onTwos=(f:number)=>Math.floor(f/2)*2;
export const wobble=(f:number,seed=0,amount=1.6)=>Math.sin(onTwos(f)/9+seed)*amount;

/** Scalloped band hanging from the top of the frame: the torn-paper sky edge. */
export function scallopTop({y,amp,wave,phase=0}:{y:number;amp:number;wave:number;phase?:number}){
 let d=`M2300 -400 L-300 -400 L-300 ${y}`;
 for(let x=-300;x<2300;x+=wave){const h=amp*(.7+.3*Math.sin((x+phase)/83));d+=` Q${x+wave/2} ${y+h} ${x+wave} ${y}`;}
 return d+'Z';
}
