import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import {TOPICS,createProblem} from '../src/math.ts';
import {interactionForTopic,TOPIC_CHALLENGES} from '../src/interactions.ts';
import {standardLessons} from '../src/standards/lessons.ts';
import InteractiveLab from '../src/components/InteractiveLab.tsx';

afterEach(cleanup);

describe('전체 83개 대표 학습 유형을 직접 실행하여 교구 누락 검사',()=>{
 it('모든 83개 주제에 인터랙션 가족과 실습 안내가 있고 121개 기준에 연결된다',()=>{
   expect(TOPICS.length).toBe(83);
   expect(new Set(TOPICS).size).toBe(83);
   expect(standardLessons.length).toBe(121);
   for(const topic of TOPICS){
     expect(interactionForTopic[topic]).toBeTruthy();
     expect(TOPIC_CHALLENGES[topic].length).toBeGreaterThan(15);
   }
   for(const standard of standardLessons)expect(TOPICS).toContain(standard.topic);
 });
 for(const topic of TOPICS){
   it(topic+' 단원이 크래시 없이 조작 가능한 교구를 렌더링한다',()=>{
     const problem=createProblem(topic);
     const {container}=render(<InteractiveLab problem={problem}
       phase="concept" step={0}/>);
     expect(container.querySelector('.interactive-lab')).toBeTruthy();
     expect(container.querySelector('.lab-body')).toBeTruthy();
     const inputs=container.querySelectorAll('button,input[type="range"],svg[tabindex],svg [role="button"]');
     expect(inputs.length).toBeGreaterThan(0);
     expect(screen.getByText('터치 가능')).toBeTruthy();
   });
 }
});
