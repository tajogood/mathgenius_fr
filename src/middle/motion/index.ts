import type {MiddleTopic} from '../curriculum.ts';
import type {MotionScene} from '../../motion/types.ts';
import {SCENES} from './scenes.ts';

export type {MotionScene};
export {renderMotionScene} from '../../motion/types.ts';
export const MOTION_SCENES=SCENES as Record<MiddleTopic,MotionScene[]>;
