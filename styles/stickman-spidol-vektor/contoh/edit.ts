import timeline from './timeline.json';

// One shot for now: the style is being tuned on a single scene before more are added.
export const shots=[{id:'door' as const,from:0,duration:timeline.durationInFrames,action:'Stickman berpikir di depan pintu terbuka yang memperlihatkan rumah.'}];
export type Shot=(typeof shots)[number];
