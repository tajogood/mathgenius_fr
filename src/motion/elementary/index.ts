import type {Topic} from '../../math.ts';
import type {MotionScene} from '../types.ts';
import {G12} from './g12.ts';
import {G34} from './g34.ts';
import {G56} from './g56.ts';

/** 초등 개념별 애니메이션 장면 (없는 개념은 플레이어를 표시하지 않음) */
export const ELEMENTARY_SCENES={...G12,...G34,...G56} as Partial<Record<Topic,MotionScene[]>>;
