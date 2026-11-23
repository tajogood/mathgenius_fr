import type {MiddleTopic} from '../curriculum.ts';
import MotionPlayer from '../../motion/MotionPlayer.tsx';
import {MOTION_SCENES} from './index.ts';

/** 중등 직접 탐구: 단원 원리 애니메이션 */
export default function MotionExplainer({topic}:{topic:MiddleTopic}){
  return <MotionPlayer id={topic} scenes={MOTION_SCENES[topic]??[]}/>;
}
