import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,render} from '@testing-library/react';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import {createProblem,solutionSteps,type Problem} from '../src/math.ts';

afterEach(cleanup);
const same=(a:number,b:number,d:number,mode='add'):Problem=>({topic:'samefraction',a,b,c:d,d:0,mode,
  prompt:`${a}/${d} + ${b}/${d} = ?`,answer:'',choices:[]});
const caption=()=>document.querySelector('[data-testid="fraction-solution"] figcaption')?.textContent??'';

describe('분수 덧셈·뺄셈 풀이는 계산 결과 → 약분 순서로 그림과 함께 설명한다',()=>{
  it('1/8 + 3/8: 같은 크기 조각 → 4/8 → 약분해서 1/2',()=>{
    const {rerender}=render(<InteractiveLab problem={same(1,3,8)} phase="solution" step={0}/>);
    expect(caption()).toMatch(/분모가 8로 같/);
    rerender(<InteractiveLab problem={same(1,3,8)} phase="solution" step={1}/>);
    expect(caption()).toMatch(/1\/8 \+ 3\/8 = 4\/8/);
    expect(document.querySelectorAll('.fs-cell--blue').length).toBe(1);
    expect(document.querySelectorAll('.fs-cell--amber').length).toBe(3);
    rerender(<InteractiveLab problem={same(1,3,8)} phase="solution" step={2}/>);
    expect(caption()).toMatch(/4\/8.*4개씩 묶으면 1\/2.*약분/);
  });
  it('뺄셈은 덜어 낸 칸을 지우고, 약분이 안 되면 그대로 답이라고 알려 준다',()=>{
    const {rerender}=render(<InteractiveLab problem={same(5,2,7,'subtract')} phase="solution" step={1}/>);
    expect(caption()).toMatch(/5\/7 − 2\/7 = 3\/7/);
    expect(document.querySelectorAll('.fs-strike').length).toBe(2);
    rerender(<InteractiveLab problem={same(5,2,7,'subtract')} phase="solution" step={2}/>);
    expect(caption()).toMatch(/더 간단히 할 수 없어요/);
  });
  it('풀이 문장도 계산 결과와 약분을 단계로 나눠 설명한다',()=>{
    for(let i=0;i<200;i++){
      const p=createProblem('samefraction');
      const [, s2, s3]=solutionSteps(p);
      expect(s2).toMatch(/= \d+\/\d+ :/);
      expect(s3).toContain(p.answer);
      const m=s2.match(/= (\d+)\/(\d+) :/)!;
      if(`${m[1]}/${m[2]}`!==p.answer && Number(m[1])!==0) expect(s3).toMatch(/약분/);
    }
  });
});
