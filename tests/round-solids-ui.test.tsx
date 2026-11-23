import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {RoundSolidsExplorerLab} from '../src/components/labs/RoundSolidsExplorerLab.tsx';
import {ROUND_SOLID_PARTS} from '../src/components/labs/roundSolidMath.ts';
import type {Problem} from '../src/math.ts';

afterEach(cleanup);
const problem=(a:number):Problem=>({
 topic:'curvedsolids',a,b:0,prompt:'입체 이름?',answer:'원기둥',choices:['원기둥','원뿔','구','각뿔']
});
const props=(p:Problem,standardId?:string)=>({problem:p,phase:'concept' as const,step:0,standardId});

describe('원기둥 원뿔 구의 직접 조작',()=>{
 it('원기둥의 진짜 평평한 밑면을 클릭하면 2개라는 설명을 준다',()=>{
  render(<RoundSolidsExplorerLab {...props(problem(0))}/>);
  expect(screen.getByTestId('round-solid-explorer')).toBeTruthy();
  expect(screen.getByText(/평평한 원형 밑면 2개/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'윗면 누르기'}));
  expect(screen.getByText(/위아래에 원 모양의 평평한 밑면이 2개/)).toBeTruthy();
 });
 it('도형 내부의 다각형 패치와 방향키 회전이 실제 투영 좌표를 바꾼다',()=>{
  const {container}=render(<RoundSolidsExplorerLab {...props(problem(1))}/>);
  const stage=screen.getByTestId('round-solid-rotate-stage');
  const before=container.querySelector('.round-surface-facet')?.getAttribute('points');
  fireEvent.keyDown(stage,{key:'ArrowRight'});
  expect(container.querySelector('.round-surface-facet')?.getAttribute('points')).not.toBe(before);
 });
 it('원뿔의 부채꼴 전개도와 밑면이 각각 클릭된다',()=>{
  render(<RoundSolidsExplorerLab {...props(problem(1))}/>);
  fireEvent.click(screen.getByRole('button',{name:/전개도 펼치기/}));
  expect(screen.getByTestId('round-solid-net')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'원뿔의 원형 밑면 선택'}));
  expect(screen.getByText(/원뿔에는 평평한 원 모양 밑면이 1개/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'원뿔의 부채꼴 옆면 선택'}));
  expect(screen.getByText(/부채꼴이 돼요/)).toBeTruthy();
 });
 it('구에는 밑면이 없고 평면 전개도를 정확히 만들 수 없다는 사실을 가르친다',()=>{
  render(<RoundSolidsExplorerLab {...props(problem(2))}/>);
  expect(ROUND_SOLID_PARTS.sphere.flatBases).toBe(0);
  expect(screen.getByText(/평평한 원형 밑면 0개/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/전개도 펼치기/}));
  expect(screen.getByText(/구의 곡면은 찢거나 구기지 않고/)).toBeTruthy();
 });
 it('원기둥 전개도 성취기준은 랜덤한 문제 값과 무관하게 원기둥을 기본으로 보여 준다',()=>{
  render(<RoundSolidsExplorerLab {...props(problem(2),'6수03-08')}/>);
  expect(screen.getByText(/평평한 원형 밑면 2개/)).toBeTruthy();
  expect(screen.getByTestId('round-solid-net')).toBeTruthy();
 });
});
