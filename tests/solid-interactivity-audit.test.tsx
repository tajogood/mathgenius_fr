import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import type {Problem,Topic} from '../src/math.ts';
import {UnitCubesLab} from '../src/components/labs/UnitCubesLab.tsx';
import {RoundSolidsExplorerLab} from '../src/components/labs/RoundSolidsExplorerLab.tsx';
import {ProjectionLab} from '../src/components/labs/SpecialLabs.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';

afterEach(cleanup);
const problem=(topic:Topic,a:number,b:number,c?:number):Problem=>({
 topic,a,b,c,prompt:topic+' 수학',answer:'6',choices:['6','4','8','12']
});
const props=(p:Problem,standardId?:string)=>({problem:p,phase:'concept' as const,step:0,standardId});

describe('83유형 교구 전수 감사: 입체의 실제 구성과 수량',()=>{
 it('부피는 실제 a×b개씩 한 층을 그리고 단계별로 4×3×5를 쌓는다',()=>{
  const {container}=render(<UnitCubesLab {...props(problem('volume',4,3,5))}/>);
  expect(screen.getByText('4 × 3 × 1 = 12')).toBeTruthy();
  expect(screen.getByText(/한 층의 개수 = 4개 × 3줄 = 12개/)).toBeTruthy();
  expect(container.querySelectorAll('.voxel-tile-top')).toHaveLength(12);
  fireEvent.click(screen.getByRole('button',{name:/한 층 더 쌓기/}));
  expect(screen.getByText('4 × 3 × 2 = 24')).toBeTruthy();
  for(let i=0;i<3;i++)fireEvent.click(screen.getByRole('button',{name:/한 층 더 쌓기/}));
  expect(screen.getByText('4 × 3 × 5 = 60')).toBeTruthy();
  expect(screen.getByText(/정육면체의 개수가 부피/)).toBeTruthy();
 });
 it('그림의 정육면체 자체를 클릭하면 한 줄의 개수가 강조된다',()=>{
  render(<UnitCubesLab {...props(problem('stacking',3,2,3))}/>);
  fireEvent.click(screen.getByRole('button',{name:'1번째 줄 1번째 칸 1층 나무 선택'}));
  expect(screen.getByText('선택한 줄: 1줄 × 3개 = 3개')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/다른 쪽에서 보기/}));
  expect(screen.getByTestId('voxel-stage')).toBeTruthy();
 });
 it('위 앞 오른쪽에서 본 쌓기나무는 문제 가로 5 세로 4의 20칸을 생략하지 않는다',()=>{
  const {container}=render(<ProjectionLab {...props(problem('solidviews',5,4,3))}/>);
  expect(screen.getByText('20개')).toBeTruthy();
  expect(screen.getByRole('group',{name:'위에서 본 4행 5열 칸별 블록 높이'}).querySelectorAll('button')).toHaveLength(20);
  expect(screen.getByRole('img',{name:'앞에서 본 각 열 최대 높이 1, 1, 1, 1, 1'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/1행 1열 높이 1/}));
  expect(screen.getByText('21개')).toBeTruthy();
  expect(container.querySelectorAll('.lab-projection-bars')[0].children.length).toBe(5);
 });
 it('원기둥·원뿔·구의 입체는 단순 그림이 아니라 직접 터치 가능한 곡면 요소로 구성된다',()=>{
  const {container}=render(<RoundSolidsExplorerLab {...props(problem('curvedsolids',0,0))}/>);
  expect(screen.getByTestId('round-solid-explorer')).toBeTruthy();
  expect(container.querySelectorAll('.round-surface-facet').length).toBeGreaterThan(20);
  expect(screen.getByText(/평평한 원형 밑면 2개/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'윗면 누르기'}));
  expect(screen.getByText(/위아래에 원 모양의 평평한 밑면이 2개/)).toBeTruthy();
  fireEvent.keyDown(screen.getByTestId('round-solid-rotate-stage'),{key:'ArrowRight'});
  expect(screen.getByTestId('round-solid-explorer')).toBeTruthy();
 });
 it('원뿔의 한 밑면과 부채꼴, 구의 밑면 없음 개념을 전개도로 탐구한다',()=>{
  render(<RoundSolidsExplorerLab {...props(problem('curvedsolids',1,0))}/>);
  expect(screen.getByText(/평평한 원형 밑면 1개/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/전개도 펼치기/}));
  expect(screen.getByTestId('round-solid-net')).toBeTruthy();
  expect(screen.getByRole('button',{name:'원뿔의 부채꼴 옆면 선택'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'구'}));
  fireEvent.click(screen.getByRole('button',{name:/전개도 펼치기/}));
  expect(screen.getByText(/구의 곡면은 찢거나 구기지 않고/)).toBeTruthy();
  expect(screen.getByText(/평평한 원형 밑면 0개/)).toBeTruthy();
 });
 it('기존 곡면, 부피, 쌓기, 방향별 보기 네 가족 모두 직접 조작 교구로 라우팅한다',()=>{
  const {rerender}=render(<InteractiveLab {...props(problem('volume',4,3,5))}/>);
  expect(screen.getByTestId('unit-cubes-explorer')).toBeTruthy();
  rerender(<InteractiveLab {...props(problem('stacking',4,3,2))}/>);
  expect(screen.getByTestId('unit-cubes-explorer')).toBeTruthy();
  rerender(<InteractiveLab {...props(problem('solidviews',5,4,2))}/>);
  expect(screen.getByTestId('projection-experiment')).toBeTruthy();
  rerender(<InteractiveLab {...props(problem('curvedsolids',0,0))}/>);
  expect(screen.getByTestId('round-solid-explorer')).toBeTruthy();
 });
});
