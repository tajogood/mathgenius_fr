import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {SolidExplorerLab} from '../src/components/labs/SolidExplorerLab.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import type {Problem} from '../src/math.ts';

afterEach(cleanup);
const problem=(topic:'nets'|'surface'|'shapes3d'='nets'):Problem=>({
 topic,a:0,b:0,prompt:'직육면체를 관찰해 보세요',
 answer:'6',choices:['6','8','12','4']
});
const props=(p:Problem)=>({problem:p,phase:'concept' as const,step:0});

describe('손으로 돌리는 실제 직육면체와 정육면체',()=>{
 it('진짜 여섯 면의 입체도형과 앞면, 뒷면, 윗면, 아랫면, 왼쪽면, 오른쪽면을 보여 준다',()=>{
  const {container}=render(<SolidExplorerLab {...props(problem())}/>);
  expect(screen.getByTestId('solid-3d-explorer')).toBeTruthy();
  expect(container.querySelectorAll('.solid-cuboid-face')).toHaveLength(6);
  expect(container.querySelectorAll('.solid-cuboid-face[style*="rotate"]')).toHaveLength(5);
  expect(screen.getByText('면')).toBeTruthy();
  expect(screen.getByText('12개')).toBeTruthy();
  expect(screen.getByText('8개')).toBeTruthy();
  expect(screen.getByText(/앞면의 크기는 4cm × 3cm/)).toBeTruthy();
 });

 it('3D 모형 자체를 누르면 해당 면의 크기와 강조 표시가 바뀐다',()=>{
  const {container}=render(<SolidExplorerLab {...props(problem())}/>);
  fireEvent.click(screen.getByRole('button',{name:'윗면 선택'}));
  expect(screen.getByText(/윗면의 크기는 4cm × 2cm/)).toBeTruthy();
  expect(container.querySelector('[data-solid-face="top"]')?.className).toContain('solid-cuboid-face--selected');
 });

 it('마우스 이동과 키보드 방향키가 입체 모형을 돌린다',()=>{
  const {container}=render(<SolidExplorerLab {...props(problem())}/>);
  const cube=container.querySelector('.solid-cuboid') as HTMLElement;
  const initial=cube.style.transform;
  fireEvent.keyDown(screen.getByTestId('solid-rotate-stage'),{key:'ArrowRight'});
  expect(cube.style.transform).not.toBe(initial);
  const after=cube.style.transform;
  fireEvent.click(screen.getByRole('button',{name:'↶ 왼쪽'}));
  expect(cube.style.transform).not.toBe(after);
 });

 it('전개도를 펼치면 6개 면이 모두 클릭 가능하고 3D의 같은 면이 강조된다',()=>{
  const {container}=render(<SolidExplorerLab {...props(problem())}/>);
  fireEvent.click(screen.getByRole('button',{name:/전개도 펼치기/}));
  expect(screen.getByTestId('solid-face-net')).toBeTruthy();
  expect(container.querySelectorAll('.solid-net-face')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button',{name:'전개도 뒷면 선택'}));
  expect(screen.getByText(/뒷면의 크기는 4cm × 3cm/)).toBeTruthy();
  expect(container.querySelector('[data-solid-face="back"]')?.className).toContain('solid-cuboid-face--selected');
  fireEvent.click(screen.getByRole('button',{name:/전개도 접기/}));
  expect(screen.queryByTestId('solid-face-net')).toBeNull();
  expect(container.querySelectorAll('.solid-cuboid-face')).toHaveLength(6);
 });

 it('면 6개·모서리 12개·꼭짓점 8개를 독립 선택할 수 있다',()=>{
  const {container}=render(<SolidExplorerLab {...props(problem())}/>);
  fireEvent.click(screen.getByRole('button',{name:'모서리 12개'}));
  expect(screen.getByRole('group',{name:'12개 모서리 직접 선택'}).querySelectorAll('button')).toHaveLength(12);
  fireEvent.click(screen.getByRole('group',{name:'12개 모서리 직접 선택'}).querySelectorAll('button')[4]);
  expect(screen.getByText(/5번째 모서리는/)).toBeTruthy();
  expect(container.querySelectorAll('.solid-face-edge').length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button',{name:'꼭짓점 8개'}));
  expect(screen.getByRole('group',{name:'8개 꼭짓점 직접 선택'}).querySelectorAll('button')).toHaveLength(8);
  fireEvent.click(screen.getByRole('group',{name:'8개 꼭짓점 직접 선택'}).querySelectorAll('button')[7]);
  expect(screen.getByText(/8번째 꼭짓점에는/)).toBeTruthy();
  expect(container.querySelectorAll('.solid-face-vertex').length).toBeGreaterThan(0);
 });

 it('정육면체와 직육면체를 바꾸면 각 면이 연결된 채 실제 치수가 바뀐다',()=>{
  render(<SolidExplorerLab {...props(problem('surface'))}/>);
  expect(screen.getByText('겉넓이')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'정육면체'}));
  expect(screen.getByText(/앞면의 크기는 3cm × 3cm/)).toBeTruthy();
  expect(screen.getByText('54cm²')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'모서리 길이 늘리기'}));
  expect(screen.getByText('96cm²')).toBeTruthy();
 });

 it('기존 직육면체 단원 넷과 성취기준 겉넓이에 새로운 교구를 연결한다',()=>{
  const {rerender}=render(<InteractiveLab {...props(problem('nets'))}/>);
  expect(screen.getByTestId('solid-3d-explorer')).toBeTruthy();
  expect(screen.getByText('손으로 돌리는 입체도형 실험실')).toBeTruthy();
  rerender(<InteractiveLab {...props(problem('surface'))}/>);
  expect(screen.getByTestId('solid-3d-explorer')).toBeTruthy();
 });
});
