import React from 'react';
import {P,onTwos,pop,scallopTop,wobble} from './Paper';
import {Capsule,Cut} from './Cut';

// Every object below is a stack of simple flat shapes, each wrapped in <Cut> so it casts a small
// shadow on what lies beneath. No outlines, gradients, textures or translucent highlights.

const skin='#F7CFAE',ink='#22263A',mouth='#B8443E';

/** Soft four-point sparkle (rounded tips). */
const Sparkle:React.FC<{x:number;y:number;s?:number}>=({x,y,s=1})=><Cut depth={3}>
 <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -30 Q7 -7 30 0 Q7 7 0 30 Q-7 7 -30 0 Q-7 -7 0 -30Z" fill={P.yellow} stroke={P.yellow} strokeWidth="8" strokeLinejoin="round"/>
</Cut>;

/** Cloud made of overlapping circles. */
const CloudShape:React.FC<{x:number;y:number;s?:number;tail?:[number,number][]}>=({x,y,s=1,tail=[]})=><g transform={`translate(${x} ${y}) scale(${s})`}>
 <Cut depth={7}><g>
  {[[-120,10,78],[-50,-50,92],[50,-56,96],[125,0,80],[60,52,82],[-40,56,84]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} fill="#FFFFFF"/>)}
  {tail.map(([cx,cy],i)=><circle key={`t${i}`} cx={cx} cy={cy} r={24-i*7} fill="#FFFFFF"/>)}
 </g></Cut>
</g>;

// ---------------------------------------------------------------------------------------------------
// Characters: head circle, hair blobs, body blob, capsule arms, circle hands. Both face right; flip
// with scale(-1 1) to face left. Origin is the seat (bottom of the body).

// Hair is built the way hair grows: a cap that follows the skull from the forehead hairline over the
// crown to the nape, then volume and a fringe coming out of the crown. Head circle: centre (14,-258), r 82.
const HEAD={x:14,y:-258,r:82};
const at=(deg:number,r:number):[number,number]=>[HEAD.x+r*Math.cos(deg*Math.PI/180),HEAD.y+r*Math.sin(deg*Math.PI/180)];
/** Cap over the skull: outer arc from the forehead round the back to the nape, closed by the hairline,
 *  which runs from the nape up behind the ear and across the forehead above the brows. */
function capPath(front=-35,nape=145,r=92){
 const [fx,fy]=at(front,r),[nx,ny]=at(nape,r);
 return `M${fx} ${fy} A${r} ${r} 0 1 0 ${nx} ${ny} C-44 -226 -46 -268 -16 -300 C10 -318 50 -322 ${fx} ${fy}Z`;
}

const BoyHair:React.FC=()=><g fill={P.navy}>
 <path d={capPath()}/>
 {/* tousled volume on the crown and back, largest at the back, all growing out of the cap */}
 {([[-160,74,34],[-130,76,40],[-100,78,40],[-70,76,34],[-46,74,26]] as const).map(([a,r,size],i)=>{const [cx,cy]=at(a,r);return <circle key={i} cx={cx} cy={cy} r={size}/>;})}
 {/* one fringe lock sweeping from the crown toward the forehead, above the brows */}
 <ellipse cx="62" cy="-318" rx="40" ry="18" transform="rotate(28 62 -318)"/>
</g>;

const GirlBackHair:React.FC=()=><path fill={P.brown} d="M14 -354 C-64 -354 -112 -300 -114 -220 C-116 -160 -120 -112 -104 -84 Q-88 -64 -70 -82 Q-54 -62 -36 -80 Q-18 -62 -2 -84 C18 -110 26 -150 26 -190 Z"/>;

const GirlHair:React.FC=()=><g fill={P.brown}>
 <path d={capPath(-38,150)}/>
 {/* side-parted fringe sweeping across the forehead to the far temple, above the brows */}
 <ellipse cx="34" cy="-326" rx="66" ry="22" transform="rotate(16 34 -326)"/>
 {/* lock falling in front of the ear down beside the cheek */}
 <ellipse cx="-50" cy="-226" rx="24" ry="70" transform="rotate(10 -50 -226)"/>
</g>;

const Eye:React.FC<{x:number;y:number;closed?:boolean}>=({x,y,closed})=>closed
 ?<path d={`M${x-10} ${y+2} Q${x} ${y-9} ${x+10} ${y+2}`} stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round"/>
 :<g><ellipse cx={x} cy={y} rx="7.5" ry="10" fill={ink}/><circle cx={x+2.5} cy={y-3.5} r="2.6" fill="#FFF"/></g>;

export const Boy:React.FC<{x:number;y:number;s?:number;f:number;flip?:boolean}>=({x,y,s=1,f,flip})=>{
 const bob=wobble(f,0,2.5),talk=Math.abs(Math.sin(onTwos(f)/3))>.45,blink=onTwos(f)%120>114;
 const gesture=Math.sin(onTwos(f)/7)*6;
 return <g transform={`translate(${x} ${y}) scale(${flip?-s:s} ${s})`}>
  {/* body: one rounded blob, collar on top */}
  <Cut><path d="M-112 0 C-120 -86 -96 -158 -30 -176 C10 -186 58 -180 96 -160 C134 -138 130 -62 120 0Z" fill={P.shirtBlue}/></Cut>
  <Cut depth={4}><path d="M-6 -178 L30 -132 L58 -174Z" fill="#244C96" stroke="#244C96" strokeWidth="10" strokeLinejoin="round"/></Cut>
  <g transform={`translate(0 ${bob})`}>
   <Cut depth={5}><ellipse cx="18" cy="-176" rx="30" ry="22" fill="#E9B994"/></Cut>
   {/* head: ear, face circle, then hair blobs stacked over the back of the head */}
   <Cut><circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={skin}/></Cut>
   <Cut><BoyHair/></Cut>
   <Cut depth={3}><circle cx="-44" cy="-252" r="19" fill={skin}/></Cut>
   {/* face: features on the facing side */}
   <path d="M28 -292 Q42 -300 56 -294 M74 -296 Q86 -302 96 -294" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round"/>
   <Eye x={44} y={-262} closed={blink}/><Eye x={84} y={-264} closed={blink}/>
   {talk
    ?<path d="M50 -220 Q64 -198 78 -220Z" fill={mouth} stroke={mouth} strokeWidth="6" strokeLinejoin="round"/>
    :<path d="M52 -218 Q64 -208 76 -218" stroke={mouth} strokeWidth="6" fill="none" strokeLinecap="round"/>}
  </g>
  {/* front arm: open-hand gesture toward the other person */}
  <Cut><g>
   <Capsule x1={60} y1={-128} x2={150} y2={-150+gesture} w={50} fill="#2A55A3"/>
   <circle cx={168} cy={-160+gesture} r="27" fill={skin}/>
   <ellipse cx={186} cy={-184+gesture} rx="10" ry="16" fill={skin} transform={`rotate(20 186 ${-184+gesture})`}/>
  </g></Cut>
 </g>;
};

export const Girl:React.FC<{x:number;y:number;s?:number;f:number;flip?:boolean}>=({x,y,s=1,f,flip})=>{
 const bob=wobble(f,3,2.5),blink=(onTwos(f)+40)%130>124;
 return <g transform={`translate(${x} ${y}) scale(${flip?-s:s} ${s})`}>
  <g transform={`translate(0 ${bob})`}>
   {/* long hair behind: one big rounded mass with soft lobes at the ends */}
   <Cut><GirlBackHair/></Cut>
  </g>
  <Cut><path d="M-108 0 C-116 -80 -96 -150 -36 -168 C4 -178 52 -172 90 -152 C126 -130 122 -60 112 0Z" fill={P.shirtPink}/></Cut>
  <Cut depth={4}><path d="M-2 -172 Q26 -146 54 -168" stroke="#D9628E" strokeWidth="12" fill="none" strokeLinecap="round"/></Cut>
  {/* arms rest on the table, hands meet under the chin */}
  <Cut><g>
   <Capsule x1={-36} y1={-30} x2={18} y2={-170} w={46} fill="#E36F99"/>
   <Capsule x1={76} y1={-30} x2={66} y2={-172} w={46} fill="#E36F99"/>
  </g></Cut>
  <g transform={`translate(0 ${bob})`}>
   <Cut><circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={skin}/></Cut>
   <Cut><GirlHair/></Cut>
   <Eye x={42} y={-258} closed/><Eye x={82} y={-260} closed/>
   <path d="M50 -218 Q62 -204 74 -218" stroke={mouth} strokeWidth="6" fill="none" strokeLinecap="round"/>
  </g>
  <Cut depth={4}><g><circle cx="22" cy={-176+bob} r="25" fill={skin}/><circle cx="64" cy={-178+bob} r="25" fill={skin}/></g></Cut>
 </g>;
};

// ---------------------------------------------------------------------------------------------------
// Set pieces.

const Awning:React.FC=()=>{
 const stripes=Array.from({length:7},(_,i)=>i);
 return <Cut depth={8}><g>
  <path d="M-40 -20 L640 -20 L640 120 L-40 120Z" fill="#FFFFFF"/>
  {stripes.map(i=><rect key={i} x={-40+i*100} y={-20} width={50} height={140} fill={P.red}/>)}
  {stripes.flatMap(i=>[<circle key={`a${i}`} cx={-15+i*100} cy={120} r={25} fill={P.red}/>,<circle key={`b${i}`} cx={35+i*100} cy={120} r={25} fill="#FFFFFF"/>])}
 </g></Cut>;
};

const Lamp:React.FC<{x:number;f:number}>=({x,f})=>{const sway=wobble(f,1,1.5);return <g transform={`translate(${x} 0) rotate(${sway} 0 0)`}>
 <Cut depth={5}><g>
  <Capsule x1={0} y1={-20} x2={0} y2={150} w={8} fill={ink}/>
  <path d="M-70 210 C-70 160 -40 140 0 140 C40 140 70 160 70 210Z" fill="#2B3047"/>
  <circle cx="0" cy="214" r="26" fill={P.yellow}/>
 </g></Cut>
</g>;};

/** Café window wall behind the characters: wooden frame, glass panes, awning and lamp on top. */
const CafeWall:React.FC<{f:number}>=({f})=><g>
 <Cut depth={10}><rect x="-60" y="150" width="2040" height="720" rx="30" fill={P.woodDeep}/></Cut>
 <Cut depth={6}><g>
  {[0,1,2,3].map(i=><rect key={i} x={-30+i*500} y={176} width={470} height={540} rx={20} fill="#6FB4EC"/>)}
 </g></Cut>
 <g transform="translate(-60 40) scale(1.1 1)"><Awning/></g>
 <Lamp x={260} f={f}/>
</g>;

const Bushes:React.FC<{y:number}>=({y})=><g>
 <Cut depth={8}><g fill={P.leafDeep}>{Array.from({length:12},(_,i)=><circle key={i} cx={520+i*130} cy={y+(i%2)*20} r={92}/>)}</g></Cut>
 <Cut depth={8}><g fill={P.leaf}>{Array.from({length:12},(_,i)=><circle key={i} cx={460+i*130} cy={y+70+(i%2)*14} r={84}/>)}</g></Cut>
</g>;

const Tree:React.FC<{x:number;y:number}>=({x,y})=><g>
 <Cut depth={8}><Capsule x1={x} y1={y} x2={x} y2={y+330} w={42} fill={P.brownLight}/></Cut>
 <Cut depth={8}><g fill={P.leafDeep}><circle cx={x-70} cy={y+10} r={96}/><circle cx={x+80} cy={y} r={100}/></g></Cut>
 <Cut depth={8}><g fill={P.leaf}><circle cx={x} cy={y-70} r={110}/><circle cx={x+70} cy={y-110} r={76}/></g></Cut>
</g>;

const Table:React.FC<{x:number;y:number;rx:number}>=({x,y,rx})=><g>
 <Cut depth={10}><g><ellipse cx={x} cy={y+22} rx={rx} ry={rx*.19} fill={P.woodDeep}/><ellipse cx={x} cy={y} rx={rx} ry={rx*.19} fill={P.wood}/></g></Cut>
</g>;

const Cup:React.FC<{x:number;y:number;f:number;s?:number}>=({x,y,f,s=1})=><g transform={`translate(${x} ${y}) scale(${s})`}>
 <Cut depth={4}><ellipse cx="0" cy="30" rx="74" ry="20" fill="#FFFFFF"/></Cut>
 <Cut depth={4}><g>
  <circle cx="54" cy="-6" r="22" fill="none" stroke="#FFFFFF" strokeWidth="12"/>
  <path d="M-48 -36 L48 -36 C48 0 34 26 0 26 C-34 26 -48 0 -48 -36Z" fill="#FFFFFF"/>
  <ellipse cx="0" cy="-36" rx="48" ry="13" fill="#6B3D22"/>
 </g></Cut>
 {[0,1].map(i=><path key={i} d={`M${-14+i*26} -54 q12 -16 0 -32 q-12 -16 0 -32`} stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round" opacity={.8} transform={`translate(0 ${-((onTwos(f)*.5+i*14)%20)})`}/>)}
</g>;

const Plant:React.FC<{x:number;y:number;f:number;s?:number}>=({x,y,f,s=1})=><g transform={`translate(${x} ${y}) scale(${s})`}>
 <Cut depth={5}><g>
  {[-36,-12,12,36].map((a,i)=><ellipse key={i} cx="0" cy="-74" rx="20" ry="56" fill={i%2?P.leaf:P.leafDeep} transform={`rotate(${a+wobble(f,i,2)} 0 -10)`}/>)}
 </g></Cut>
 <Cut depth={5}><rect x="-50" y="-20" width="100" height="84" rx="22" fill={P.yellow}/></Cut>
</g>;

const HeartBubble:React.FC<{x:number;y:number;p:number}>=({x,y,p})=><g transform={`translate(${x} ${y}) scale(${p})`}>
 <CloudShape x={0} y={0} s={.62} tail={[[-150,140],[-196,186],[-230,222]]}/>
 <Cut depth={3}><path d="M0 34 C-56 -2 -50 -52 -18 -52 C-6 -52 0 -42 0 -34 C0 -42 6 -52 18 -52 C50 -52 56 -2 0 34Z" fill={P.red} stroke={P.red} strokeWidth="4" strokeLinejoin="round"/></Cut>
</g>;

/** Thought cloud holding the faceless silhouette of someone imagined, marked with a question. */
const ThoughtBubble:React.FC<{x:number;y:number;p:number;f:number}>=({x,y,p,f})=><g transform={`translate(${x} ${y}) scale(${p})`}>
 <CloudShape x={0} y={0} s={1.25} tail={[[-150,170],[-196,212],[-226,246]]}/>
 <Cut depth={5}><g>
  <ellipse cx="0" cy="-20" rx="104" ry="118" fill="#6E5BB0"/>
  <path d="M-96 110 C-90 50 -46 30 0 30 C46 30 90 50 96 110Z" fill="#B9A6EE"/>
  <circle cx="0" cy="-30" r="66" fill="#9C86D8"/>
 </g></Cut>
 <text x="0" y="-2" textAnchor="middle" fontFamily="Lato" fontWeight="900" fontSize="96" fill="#FFFFFF">?</text>
 <Sparkle x={-170} y={-120} s={1.1}/><Sparkle x={190} y={-60} s={.8}/><Sparkle x={150} y={120} s={.6}/>
</g>;

/** The café conversation, built from stacked shapes.
 *  Close framing: the two people fill the lower half, the café window is the backdrop. */
export const CafeScene:React.FC<{f:number}>=({f})=><g>
 <rect x="-200" y="-200" width="2320" height="1480" fill={P.sky}/>
 <Cut depth={8}><path d={scallopTop({y:96,amp:44,wave:200,phase:wobble(f,0,4)})} fill={P.skyLight}/></Cut>
 <Cut depth={8}><path d={scallopTop({y:48,amp:38,wave:180,phase:60+wobble(f,0,4)})} fill={P.skyDeep}/></Cut>
 <CafeWall f={f}/>
 <Bushes y={760}/>
 <Boy x={560} y={1060} s={1.5} f={f}/>
 <Girl x={1370} y={1060} s={1.45} f={f} flip/>
 <Table x={960} y={1030} rx={560}/>
 <Cup x={760} y={970} s={1.35} f={f}/><Cup x={1160} y={970} s={1.35} f={f+9}/><Plant x={962} y={910} s={1.4} f={f}/>
 <HeartBubble x={980} y={400} p={pop(f,14)}/>
 <ThoughtBubble x={1470} y={290} p={pop(f,40)} f={f}/>
</g>;
