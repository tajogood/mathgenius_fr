import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {PolyhedronExplorerLab} from '../src/components/labs/PolyhedronExplorerLab.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import type {Problem,Topic} from '../src/math.ts';

afterEach(cleanup);
const problem=(topic:Topic='polyhedra',a=3):Problem=>({
 topic,a,b:0,prompt:'각기둥의 면, 모서리, 꼭짓점은?',answer:'6',
 choices:['6','7','5','4']
});
const props=(p:Problem,standardId?:string)=>({problem:p,phase:'concept' as const,step:0,standardId});

describe('각기둥·각뿔을 손으로 돌리고 면을 실제로 클릭하기',()=>{
 it('삼각기둥은 분리된 종이 그림 대신 입체의 면 5, 모서리 9, 꼭짓점 6을 표시한다',()=>{
  render(<PolyhedronExplorerLab {...props(problem())}/>);
  expect(screen.getByTestId('polyhedron-explorer')).toBeTruthy();
  expect(screen.getByText(/3각기둥: 밑면 2개 \+ 옆면 3개 = 면 5개/)).toBeTruthy();
  expect(screen.getByRole('button',{name:'모서리 9개'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'꼭짓점 6개'})).toBeTruthy();
  expect(screen.getByRole('group',{name:/3각기둥 3차원 모형/}).querySelectorAll('polygon')).toHaveLength(5);
 });
 it('직접 입체의 밑면을 선택하면 두 밑면의 성질을 설명한다',()=>{
  render(<PolyhedronExplorerLab {...props(problem())}/>);
  fireEvent.click(screen.getByRole('button',{name:'윗면(밑면) 직접 선택'}));
  expect(screen.getByText(/두 밑면은 서로 평행하고 크기와 모양이 같아요/)).toBeTruthy();
  expect(screen.getByText(/확인한 면 1\/5개/)).toBeTruthy();
 });
 it('슬라이더를 바꾸면 4각기둥은 6면, 12모서리, 8꼭짓점이 된다',()=>{
  render(<PolyhedronExplorerLab {...props(problem())}/>);
  fireEvent.click(screen.getByRole('button',{name:/밑면 변 하나 더/}));
  expect(screen.getByText(/4각기둥: 밑면 2개 \+ 옆면 4개 = 면 6개/)).toBeTruthy();
  expect(screen.getByRole('button',{name:'모서리 12개'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'꼭짓점 8개'})).toBeTruthy();
 });
 it('각뿔로 바꾸면 3각뿔의 면 4개, 모서리 6개, 꼭짓점 4개가 된다',()=>{
  render(<PolyhedronExplorerLab {...props(problem())}/>);
  fireEvent.click(screen.getByRole('button',{name:/각뿔/}));
  expect(screen.getByText(/3각뿔: 밑면 1개 \+ 옆면 3개 = 면 4개/)).toBeTruthy();
  expect(screen.getByRole('button',{name:'모서리 6개'})).toBeTruthy();
  expect(screen.getByRole('button',{name:'꼭짓점 4개'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'밑면 직접 선택'}));
  expect(screen.getByText(/각뿔의 밑면은 단 한 개예요/)).toBeTruthy();
 });
 it('입체의 모서리와 꼭짓점을 선택하면 이들이 연결된 면을 설명한다',()=>{
  render(<PolyhedronExplorerLab {...props(problem())}/>);
  fireEvent.click(screen.getByRole('button',{name:'모서리 9개'}));
  fireEvent.click(screen.getByRole('button',{name:'1번째 모서리 선택'}));
  expect(screen.getByText(/모서리는 면과 면이 만나는 선분이에요/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'꼭짓점 6개'}));
  fireEvent.click(screen.getByRole('button',{name:'1번째 꼭짓점 선택'}));
  expect(screen.getByText(/이 꼭짓점에 모인 면/)).toBeTruthy();
 });
 it('전개도를 펼쳐 면을 누르면 입체의 같은 면이 강조된다',()=>{
  render(<PolyhedronExplorerLab {...props(problem(),'6수03-06')}/>);
  const net=screen.getByTestId('polyhedron-net');
  expect(net.querySelectorAll('rect')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button',{name:'전개도의 아랫면 선택'}));
  expect(screen.getByText(/선택한 면: 아랫면\(밑면\)/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/전개도 접기/}));
  expect(screen.queryByTestId('polyhedron-net')).toBeNull();
 });
 it('키보드 방향키가 실제 3D 좌표 투영을 변화시킨다',()=>{
  render(<PolyhedronExplorerLab {...props(problem())}/>);
  const svg=screen.getByTestId('polyhedron-rotate-stage');
  const before=svg.querySelector('polygon')?.getAttribute('points');
  fireEvent.keyDown(svg,{key:'ArrowRight'});
  expect(svg.querySelector('polygon')?.getAttribute('points')).not.toBe(before);
 });
 it('기존 각기둥 및 각뿔 수업 모두 동적인 교구로 전환된다',()=>{
  const {rerender}=render(<InteractiveLab {...props(problem('polyhedra'))}/>);
  expect(screen.getByTestId('polyhedron-explorer')).toBeTruthy();
  rerender(<InteractiveLab {...props(problem('pyramid'))}/>);
  expect(screen.getByTestId('polyhedron-explorer')).toBeTruthy();
 });
});
