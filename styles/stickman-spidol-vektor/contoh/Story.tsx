import React from 'react';
import {useCurrentFrame} from 'remotion';
import {DoorScene} from './components/DoorScene';
import {Shot} from './edit';

export const StoryShot:React.FC<{shot:Shot}>=()=>{
 const f=useCurrentFrame();
 return <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{position:'absolute',inset:0}}>
  <DoorScene f={f}/>
 </svg>;
};
