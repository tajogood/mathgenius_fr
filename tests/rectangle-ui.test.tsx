import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {RectangleConceptLab} from '../src/components/labs/RectangleConceptLab.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import type {Problem} from '../src/math.ts';

afterEach(cleanup);
const problem=(topic:'area'|'perimeter',a=5,b=3):Problem=>({
 topic,a,b,prompt:'직사각형의 둘레와 넓이를 구하세요',
 answer:topic==='area'?'15cm²':'16cm',
 choices:['15cm²','16cm','8cm','12cm²'],
});
const props=(p:Problem)=>({problem:p,phase:'concept' as const,step:0});

describe('1cm² 넓이와 cm 둘레를 직접 탐구한다',()=>{
 it('5cm×3cm를 세 줄 채워 5+5+5=15칸, 15cm²의 원리를 보여준다',()=>{
  render(<RectangleConceptLab {...props(problem('area'))}/>);
  expect(screen.getByText(/한 칸 = 1cm × 1cm =/)).toBeTruthy();
  const first=screen.getByRole('button',{name:/1번째 줄, 1cm² 칸 5개/});
  expect(first.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(first);
  expect(first.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText('5칸 × 1줄 =')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/2번째 줄, 1cm² 칸 5개/}));
  fireEvent.click(screen.getByRole('button',{name:/3번째 줄, 1cm² 칸 5개/}));
  expect(screen.getByText('5 + 5 + 5 = 15칸')).toBeTruthy();
  expect(screen.getByText('✓ 전체 넓이 5 × 3 = 15cm²')).toBeTruthy();
  expect(screen.getByText(/1cm² 정사각형 15개/)).toBeTruthy();
 });

 it('한 줄씩 채우기 버튼은 남은 줄을 채우고 모두 채우면 리셋할 수 있다',()=>{
  render(<RectangleConceptLab {...props(problem('area'))}/>);
  for(let i=0;i<3;i++)fireEvent.click(screen.getByRole('button',{name:/다음 줄 채우기/}));
  expect(screen.getByText('5 + 5 + 5 = 15칸')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/줄 다시 세기/}));
  expect(screen.getByText(/첫 번째 줄을 눌러 시작/)).toBeTruthy();
  expect(screen.getByText('채운 줄 0 / 3줄')).toBeTruthy();
 });

 it('둘레는 네 변을 선택할 때만 5+3+5+3=16cm로 완성된다',()=>{
  render(<RectangleConceptLab {...props(problem('perimeter'))}/>);
  expect(screen.getByText(/네 변을 따라서 바깥쪽 길이를 더해요/)).toBeTruthy();
  for(const side of ['윗변 5cm','오른쪽 변 3cm','아랫변 5cm','왼쪽 변 3cm']){
   fireEvent.click(screen.getByRole('button',{name:side+' 따라가기'}));
  }
  expect(screen.getByText('5cm + 3cm + 5cm + 3cm = 16cm')).toBeTruthy();
  expect(screen.getByText('✓ 전체 둘레 5 + 3 + 5 + 3 = 16cm')).toBeTruthy();
  expect(screen.getByText(/바깥 경계를 따라 걸은 길이 16cm/)).toBeTruthy();
 });

 it('두 모드를 바꾸더라도 같은 도형을 유지하며 넓이/둘레 단위를 구분한다',()=>{
  render(<RectangleConceptLab {...props(problem('perimeter'))}/>);
  fireEvent.click(screen.getByRole('button',{name:/넓이: 안쪽 채우기/}));
  fireEvent.click(screen.getByRole('button',{name:/전체 확인/}));
  expect(screen.getByText('✓ 전체 넓이 5 × 3 = 15cm²')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/둘레: 바깥 따라가기/}));
  fireEvent.click(screen.getByRole('button',{name:/전체 확인/}));
  expect(screen.getByText('✓ 전체 둘레 5 + 3 + 5 + 3 = 16cm')).toBeTruthy();
 });

 it('치수 변경 시 색칠 상태를 초기화하고 6×3의 새 값을 계산한다',()=>{
  render(<RectangleConceptLab {...props(problem('area'))}/>);
  fireEvent.click(screen.getByRole('button',{name:/전체 확인/}));
  fireEvent.click(screen.getByRole('button',{name:'가로 늘리기'}));
  expect(screen.getByRole('group',{name:'가로 6칸 세로 3칸 직사각형'})).toBeTruthy();
  expect(screen.getByText('채운 줄 0 / 3줄')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/전체 확인/}));
  expect(screen.getByText('✓ 전체 넓이 6 × 3 = 18cm²')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'5×3 예시'}));
  expect(screen.getByRole('group',{name:'가로 5칸 세로 3칸 직사각형'})).toBeTruthy();
 });

 it('기존 단원과 성취기준에서도 실제 직사각형 실험이 연결된다',()=>{
  const p=problem('perimeter');
  const {rerender}=render(<InteractiveLab {...props(p)}/>);
  expect(screen.getByTestId('rectangle-concept-lab')).toBeTruthy();
  rerender(<InteractiveLab {...props(problem('area'))}/>);
  expect(screen.getByTestId('rectangle-concept-lab')).toBeTruthy();
 });
});
