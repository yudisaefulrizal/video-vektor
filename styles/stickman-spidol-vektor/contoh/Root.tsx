import React from 'react';
import {Composition} from 'remotion';
import {Film,VisualFilm} from './Film';
import timeline from './timeline.json';

// In a project the pipeline rewrites this file to register ProjectFilm and ProjectVisual.
export const Root:React.FC=()=> <>
 <Composition id="Stickman" component={Film} durationInFrames={timeline.durationInFrames} fps={timeline.fps} width={1920} height={1080}/>
 <Composition id="StickmanVisual" component={VisualFilm} durationInFrames={timeline.durationInFrames} fps={timeline.fps} width={1920} height={1080}/>
</>;
