import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import type {Problem} from '../src/math.ts';

afterEach(cleanup);
const solid=(a:number):Problem=>({topic:'curvedsolids',a,b:0,prompt:'그림 속 입체도형의 이름은?',
  answer:['원기둥','원뿔','구'][a],choices:['원기둥','원뿔','구','각기둥']});
const discovery=()=>document.querySelector('.round-discovery strong')?.textContent??'';

describe('문제 단계의 그림은 정답과 일치하고 바꿀 수 없다',()=>{
  it('문장이 같아도 정답이 바뀌면 그림이 새 문제의 입체로 바뀐다',()=>{
    const {rerender}=render(<InteractiveLab problem={solid(0)} phase="question" step={0}/>);
    expect(discovery()).toMatch(/밑면 2개/);           // 원기둥
    rerender(<InteractiveLab problem={solid(2)} phase="question" step={0}/>);
    expect(discovery()).toMatch(/밑면 0개/);           // 구
    rerender(<InteractiveLab problem={solid(1)} phase="question" step={0}/>);
    expect(discovery()).toMatch(/밑면 1개/);           // 원뿔
  });
  it('문제 풀이 중에는 모양 바꾸기 버튼·전개도·도형 이름이 보이지 않는다',()=>{
    render(<InteractiveLab problem={solid(2)} phase="question" step={0}/>);
    for(const name of ['원기둥','원뿔','구']) expect(screen.queryByRole('button',{name})).toBeNull();
    expect(screen.queryByRole('button',{name:/전개도 펼치기/})).toBeNull();
    expect(discovery()).not.toMatch(/^(원기둥|원뿔|구)/);
    expect(document.querySelector('.round-discovery p')?.textContent).not.toMatch(/원기둥|원뿔|구/);
  });
  it('개념 단계에서는 여전히 자유롭게 모양을 바꿀 수 있다',()=>{
    render(<InteractiveLab problem={solid(0)} phase="concept" step={0}/>);
    expect(screen.getByRole('button',{name:'원뿔'})).toBeTruthy();
    expect(screen.getByRole('button',{name:/전개도 펼치기/})).toBeTruthy();
  });
  it('개념 단계에서 모양을 바꿔도 문제 단계로 넘어가면 정답 입체로 돌아간다',()=>{
    const {rerender}=render(<InteractiveLab problem={solid(2)} phase="concept" step={0}/>);
    fireEvent.click(screen.getByRole('button',{name:'원기둥'}));
    expect(discovery()).toMatch(/원기둥/);
    rerender(<InteractiveLab problem={solid(2)} phase="question" step={0}/>);
    expect(discovery()).toMatch(/밑면 0개/);           // 구
  });
});
