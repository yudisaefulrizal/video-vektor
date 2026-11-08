import React from 'react';
import {AbsoluteFill,Audio,interpolate,Sequence,staticFile,useCurrentFrame} from 'remotion';
import timeline from './timeline.json';
import {shots} from './edit';
import {StoryShot} from './Story';
import './style.css';

/** Picture only: every shot as a Sequence and a fade to the end card. Colours stay flat: no grain or vignette. */
export const VisualFilm:React.FC=()=>{
 const f=useCurrentFrame();
 return <AbsoluteFill style={{fontFamily:'Lato',backgroundColor:'#3D8FE0'}}>
  <style>{`@font-face {font-family: Lato; src: url("${staticFile('fonts/Lato-Regular.ttf')}"); font-weight: 400;} @font-face {font-family: Lato; src: url("${staticFile('fonts/Lato-Heavy.ttf')}"); font-weight: 900;}`}</style>
  {shots.map(shot=><Sequence key={shot.id} from={shot.from} durationInFrames={shot.duration} name={shot.action}><StoryShot shot={shot}/></Sequence>)}
  <AbsoluteFill style={{background:'#FFF6E4',opacity:interpolate(f,[timeline.durationInFrames-14,timeline.durationInFrames-1],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),pointerEvents:'none'}}/>
 </AbsoluteFill>;
};

/** Picture with narration placed by the timeline and the music bed. */
export const Film:React.FC=()=> <AbsoluteFill>
 <VisualFilm/>
 {timeline.scenes.map(scene=><Sequence key={scene.index} from={scene.from+scene.audioLead} durationInFrames={scene.audioTrimEnd-scene.audioTrimStart} name={`Suara ${scene.index+1}`}>
  <Audio src={staticFile(`audio/scene-${scene.index+1}.mp3`)} trimBefore={scene.audioTrimStart} durationInFrames={scene.audioTrimEnd-scene.audioTrimStart}/>
 </Sequence>)}
 <Audio src={staticFile('audio/score.wav')} volume={frame=>interpolate(frame,[0,30,timeline.durationInFrames-35,timeline.durationInFrames],[0,.34,.34,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/>
</AbsoluteFill>;
