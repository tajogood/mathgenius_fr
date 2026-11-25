import { TOPICS,createProblem,type Topic,type Problem } from '../math.ts';
import { achievementStandards } from '../standards.ts';
import { lowerLessons } from './lowerLessons.ts';
import { middleLessons } from './middleLessons.ts';
import { upperLessons } from './upperLessons.ts';
import type { StandardLesson } from './lessonTypes.ts';
import { tr } from '../i18n/index.ts';

export type { StandardLesson } from './lessonTypes.ts';
export const standardLessons:StandardLesson[]=[
  ...lowerLessons,...middleLessons,...upperLessons,
];
export const standardLessonMap = new Map(standardLessons.map(x=>[x.id,x]));

const codes=new Set(achievementStandards.map(x=>x.id));
if(standardLessons.length!==121||standardLessonMap.size!==121)
  throw new Error('Every one of the 121 standards requires an individual lesson');
for(const item of standardLessons){
  if(!codes.has(item.id))throw new Error('Lesson uses non-curriculum standard: '+item.id);
  if(!TOPICS.includes(item.topic))throw new Error('Lesson requires a real interactive topic: '+item.id);
}
for(const standard of achievementStandards){
  if(!standardLessonMap.has(standard.id))throw new Error('Lesson missing for '+standard.id);
}

export type StandardAssessment = {
  kind:'concept'|'application';
  question:string;choices:string[];answer:string;explanation:string;visualProblem:Problem;
};
export function standardAssessments(lesson:StandardLesson):[StandardAssessment,StandardAssessment]{
  const p=createProblem(lesson.topic);
  const first:StandardAssessment={
    kind:'concept',question:lesson.check.prompt,
    // Keep the answer in a different position for each standard without introducing random grading.
    choices:rotateOptions(lesson.check.choices,codeIndex(lesson.id)%4),
    answer:lesson.check.answer,explanation:lesson.explanation,
    visualProblem:p,
  };
  const second:StandardAssessment={
    kind:'application',question:p.prompt,
    choices:p.choices,answer:p.answer,
    // Each step is translated on its own so English mode never needs every joined combination.
    explanation:p.steps?.map(tr).join(' ')||tr('교구에서 실제 수량을 움직여 확인한 뒤 원래 문제의 계산 순서를 다시 적용해 보세요.'),
    visualProblem:p,
  };
  return [first,second];
}
export function codeIndex(id:string):number {
  const digits=id.match(/(\d+)$/);
  return digits?Number(digits[1]):0;
}
export function rotateOptions(choices:readonly string[],count:number):string[]{
  return [...choices.slice(count),...choices.slice(0,count)];
}
export function standardSections() {
  return [
    {name:'1~2학년군',lessons:lowerLessons},
    {name:'3~4학년군',lessons:middleLessons},
    {name:'5~6학년군',lessons:upperLessons},
  ];
}
