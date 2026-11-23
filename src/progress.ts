import { TOPICS, type Topic } from './math.ts';
import { curriculumUnits } from './curriculum.ts';

export const MASTERY_STREAK = 2;
export type TopicRecord = {
  attempts: number;
  correct: number;
  streak: number;
  mastered: boolean;
};
export type UnitRecords = Record<string, TopicRecord>;
export type LearningProgress = {
  /** Legacy "finished" means a lesson was once visited, not proven mastered. */
  finished: string[];
  attempts: number;
  correct: number;
  records: Record<string, UnitRecords>;
};

export function emptyProgress(): LearningProgress {
  return { finished: [], attempts: 0, correct: 0, records: {} };
}

export function recordAnswer(progress: LearningProgress, unitId: string, topic: Topic, correct: boolean): LearningProgress {
  const unit = curriculumUnits.find(x=>x.id===unitId);
  if (!unit || !unit.topics.includes(topic)) return progress;
  const prev = progress.records[unitId]?.[topic] ?? {attempts:0,correct:0,streak:0,mastered:false};
  const streak = correct ? prev.streak+1 : 0;
  const record = {
    attempts: prev.attempts+1,
    correct: prev.correct+(correct?1:0),
    streak,
    mastered: prev.mastered || streak >= MASTERY_STREAK,
  };
  return {
    ...progress,
    attempts: progress.attempts+1,
    correct: progress.correct+(correct?1:0),
    records:{
      ...progress.records,
      [unitId]:{
        ...(progress.records[unitId]||{}),
        [topic]:record,
      },
    },
  };
}

export function unitMastery(progress: LearningProgress, unitId: string): {mastered:number,total:number,complete:boolean} {
  const unit = curriculumUnits.find(ch=>ch.id===unitId);
  if (!unit) return {mastered:0,total:0,complete:false};
  const mastered = unit.topics.filter(topic=>progress.records[unitId]?.[topic]?.mastered===true).length;
  return {mastered,total:unit.topics.length,complete:mastered===unit.topics.length};
}

export function masteryCount(progress: LearningProgress): number {
  return curriculumUnits.filter(unit=>unitMastery(progress,unit.id).complete).length;
}

export function nextPracticeTopic(
  progress: LearningProgress,
  unitId: string,
  current: Topic,
): Topic {
  const unit = curriculumUnits.find(ch=>ch.id===unitId);
  if (!unit) return current;
  const start=Math.max(0,unit.topics.indexOf(current));
  for(let offset=1;offset<=unit.topics.length;offset++){
    const topic=unit.topics[(start+offset)%unit.topics.length];
    if(!progress.records[unitId]?.[topic]?.mastered)return topic;
  }
  return unit.topics[(start+1)%unit.topics.length];
}

function numeric(value:unknown): number {
  return typeof value==='number'&&Number.isFinite(value)&&value>=0?Math.floor(value):0;
}
function isRecord(v:unknown):v is Record<string,unknown> {
  return typeof v==='object' && v!==null && !Array.isArray(v);
}

/** Never trust raw localStorage records, and do not misrepresent old demo completions as mastery. */
export function parseProgress(raw: unknown): LearningProgress {
  if (!isRecord(raw)) return emptyProgress();
  const finished = Array.isArray(raw.finished) ? raw.finished.flatMap((item:unknown):string[]=>{
    if(typeof item!=='string')return [];
    if(curriculumUnits.some(unit=>unit.id===item))return [item];
    // The original 18-topic demo used topic IDs instead of chapter IDs.
    if(TOPICS.includes(item as Topic)) {
      const legacy=curriculumUnits.find(unit=>unit.topics.includes(item as Topic));
      return legacy?[legacy.id]:[];
    }
    return [];
  }) : [];
  const result:LearningProgress={
    finished:[...new Set(finished)],
    attempts:numeric(raw.attempts),
    correct:numeric(raw.correct),
    records:{},
  };
  if (!isRecord(raw.records)) return result;
  for(const unit of curriculumUnits){
    const rawUnit=raw.records[unit.id];
    if(!isRecord(rawUnit))continue;
    const entries:UnitRecords={};
    for(const topic of unit.topics){
      const item=rawUnit[topic];
      if(!isRecord(item))continue;
      const attempts=numeric(item.attempts);
      const correct=Math.min(numeric(item.correct),attempts);
      const streak=Math.min(numeric(item.streak),correct);
      entries[topic]={
        attempts,correct,streak,
        mastered:item.mastered===true || streak>=MASTERY_STREAK,
      };
    }
    if(Object.keys(entries).length) result.records[unit.id]=entries;
  }
  return result;
}
