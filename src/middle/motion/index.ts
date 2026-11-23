import type {MiddleTopic} from '../curriculum.ts';
import {SCENES} from './scenes.ts';

export type MotionScene={cap:string; dur:number; svg:string|(()=>string)};
export const MOTION_SCENES=SCENES as Record<MiddleTopic,MotionScene[]>;
export const renderMotionScene=(scene:MotionScene)=>typeof scene.svg==='function'?scene.svg():scene.svg;
