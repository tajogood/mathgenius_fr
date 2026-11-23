import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {ShapePlayLab,LinePlayLab} from '../src/components/labs/ShapePlayLab.tsx';
import {CirclePiLab} from '../src/components/labs/CirclePiLab.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import type {Problem,Topic} from '../src/math.ts';

afterEach(cleanup);
const problem=(topic:Topic,a:number,b=0):Problem=>({
 topic,a,b,prompt:'수학 도형 학습',answer:'삼각형',choices:['삼각형','원','사각형','직사각형']
});
const props=(p:Problem)=>({problem:p,phase:'concept' as const,step:0});

describe('학년별 도형과 원주율 직접 조작',()=>{
 it('2학년 평면도형은 각도 45도 대신 변과 꼭짓점을 터치하는 교구를 쓴다',()=>{
  const {container}=render(<InteractiveLab {...props(problem('shapes',1))}/>);
  expect(screen.getByTestId('shape-play-lab')).toBeTruthy();
  expect(screen.queryByText(/45° 회전/)).toBeNull();
  expect(screen.getByText(/삼각형 · 변 3개 · 꼭짓점 3개/)).toBeTruthy();
  expect(container.querySelectorAll('[data-corner]')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button',{name:'1번째 변 선택'}));
  expect(screen.getByText(/1번째 변을 선택했어요/)).toBeTruthy();
 });
 it('삼각형, 사각형, 원을 골라 바꾸면 변과 꼭짓점 개수도 바뀐다',()=>{
  render(<ShapePlayLab {...props(problem('shapes',1))}/>);
  fireEvent.click(screen.getByRole('button',{name:'사각형'}));
  expect(screen.getByText(/사각형 · 변 4개 · 꼭짓점 4개/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'원'}));
  expect(screen.getByText(/원 · 곧은 변 0개 · 꼭짓점 0개/)).toBeTruthy();
 });
 it('선분, 반직선, 직선을 누를 때 끝점과 화살표 설명이 달라진다',()=>{
  render(<LinePlayLab {...props(problem('lines',1))}/>);
  expect(screen.getByText(/선분은 양쪽에 끝점이 있어요/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'반직선'}));
  expect(screen.getByText(/반직선은 시작점이 하나/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'직선'}));
  expect(screen.getByText(/직선은 양쪽으로 끝없이 뻗어요/)).toBeTruthy();
 });
 it('6학년 원주율은 실제 지름·원주 관계를 설명하고 π 기호도 소개한다',()=>{
  render(<CirclePiLab {...props(problem('circumference',5))}/>);
  expect(screen.getByText(/원주율은 원의 둘레가 지름의 몇 배인지/)).toBeTruthy();
  expect(screen.getByText('원주 ÷ 지름').closest('.pi-stats')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/잰 줄자를 펼쳐 지름과 비교/}));
  expect(screen.getByTestId('pi-unroll-explanation')).toBeTruthy();
  expect(screen.getByText(/π\(파이\)는 원주율을 나타내는 기호/)).toBeTruthy();
  expect(screen.getByText(/π는 3.14와 정확히 같지는 않아요/)).toBeTruthy();
 });
 it('원의 크기를 바꾸어도 원주 ÷ 지름 약 3.14는 그대로이다',()=>{
  render(<CirclePiLab {...props(problem('circumference',5))}/>);
  expect(screen.getByText('원주 ÷ 지름').parentElement?.textContent).toContain('3.14');
  fireEvent.click(screen.getByRole('button',{name:'반지름 늘리기'}));
  expect(screen.getByText('원주 ÷ 지름').parentElement?.textContent).toContain('3.14');
  fireEvent.click(screen.getByRole('button',{name:/줄자로 한 바퀴 재기/}));
  expect(screen.getByRole('slider',{name:/원의 테두리를 따라 측정한 비율/})).toHaveProperty('value','100');
 });
 it('원 넓이로 바꾸면 단위가 cm²로 계산된다',()=>{
  render(<CirclePiLab {...props(problem('circlearea',3))}/>);
  expect(screen.getByText(/원의 넓이 = 반지름 × 반지름 × 원주율/)).toBeTruthy();
  expect(screen.getByText(/3 × 3 × 3.14/)).toBeTruthy();
 });
});
