import { standardLessonMap } from './lessons.ts';

export type StandardRecord={ attempts:number;correct:number;mastered:boolean;lastAt:string };
export type StandardProgress=Record<string,StandardRecord>;
export const STANDARD_STORAGE_KEY='mathgenius-achievement-v1';

export function normalizeStandardProgress(raw:unknown):StandardProgress {
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
  const result:StandardProgress={};
  for(const [id,value] of Object.entries(raw)){
    if(!standardLessonMap.has(id)||!value||typeof value!=='object'||Array.isArray(value))continue;
    const v=value as Record<string,unknown>;
    const a=typeof v.attempts==='number'&&Number.isFinite(v.attempts)?Math.max(0,Math.floor(v.attempts)):0;
    const c=typeof v.correct==='number'&&Number.isFinite(v.correct)?Math.max(0,Math.min(a,Math.floor(v.correct))):0;
    result[id]={attempts:a,correct:c,mastered:v.mastered===true,lastAt:typeof v.lastAt==='string'?v.lastAt:''};
  }
  return result;
}
export function readStandardProgress():StandardProgress {
  try{return normalizeStandardProgress(JSON.parse(window.localStorage.getItem(STANDARD_STORAGE_KEY)||'null'));}
  catch{return {};}
}
export function answerStandard(progress:StandardProgress,id:string,correct:boolean,bothPassed:boolean):StandardProgress {
  if(!standardLessonMap.has(id))return progress;
  const previous=progress[id]||{attempts:0,correct:0,mastered:false,lastAt:''};
  return {...progress,[id]:{
    attempts:previous.attempts+1,
    correct:previous.correct+(correct?1:0),
    mastered:previous.mastered||bothPassed,
    lastAt:new Date().toISOString(),
  }};
}
export function masteredStandards(progress:StandardProgress):number {
  return Object.values(progress).filter(record=>record.mastered).length;
}
