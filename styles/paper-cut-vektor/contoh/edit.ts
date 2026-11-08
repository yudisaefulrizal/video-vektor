import timeline from './timeline.json';

// Shots: where the picture changes. Place cuts with `at(scene, seconds)` so they land on the words
// they illustrate; shots follow the development of ideas, not one shot per sentence.
// This example has a single shot: the café conversation.
export const at=(scene:number,seconds:number)=>timeline.scenes[scene].from+timeline.scenes[scene].audioLead+Math.round(seconds*timeline.fps);
const cuts=[0,timeline.durationInFrames];
const ids=['cafe'] as const;
const actions=['Dua orang mengobrol di kafe; gelembung hati dan awan pikiran bertanda tanya muncul.'];
export const shots=ids.map((id,i)=>({id,from:cuts[i],duration:cuts[i+1]-cuts[i],action:actions[i]}));
export type Shot=(typeof shots)[number];
