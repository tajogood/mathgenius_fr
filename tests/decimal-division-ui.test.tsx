import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {DecimalDivisionLab} from '../src/components/labs/DecimalDivisionLab.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import type {Problem} from '../src/math.ts';

afterEach(cleanup);
const problem=(a:number,b:number):Problem=>({
 topic:'decimaldiv',a,b,prompt:'소수의 나눗셈',answer:String(a/10),choices:['0.8','0.4','1.6','3.2']
});
const props=(p:Problem)=>({problem:p,phase:'concept' as const,step:0});
describe('소수 나눗셈의 용어와 직접 조작',()=>{
 it('1.6 ÷ 2는 곱하는 수가 아닌 나누는 수이고 전체 1.6이 고정이다',()=>{
  const {container}=render(<DecimalDivisionLab {...props(problem(8,2))}/>);
  expect(screen.getByTestId('decimal-division-lab')).toBeTruthy();
  expect(screen.getByText('1.6 ÷ 2 = 0.8')).toBeTruthy();
  expect(screen.getByRole('slider',{name:'나누는 수'})).toBeTruthy();
  expect(screen.queryByText(/곱하는 수/)).toBeNull();
  expect(screen.getByText(/나누어지는 수 1.6은 그대로/)).toBeTruthy();
  expect(container.querySelectorAll('.decimal-division-tenth')).toHaveLength(16);
  expect(container.querySelectorAll('.decimal-share')).toHaveLength(2);
 });
 it('나누는 수를 3으로 움직이면 1.6은 보존되면서 몫만 약 0.533으로 바뀐다',()=>{
  const {container}=render(<DecimalDivisionLab {...props(problem(8,2))}/>);
  fireEvent.change(screen.getByRole('slider',{name:'나누는 수'}),{target:{value:'3'}});
  expect(screen.getByText('1.6 ÷ 3 ≈ 0.533')).toBeTruthy();
  expect(screen.getByText(/나누어지는 수 1.6은 그대로/)).toBeTruthy();
  expect(container.querySelectorAll('.decimal-division-tenth')).toHaveLength(16);
  expect(container.querySelectorAll('.decimal-share')).toHaveLength(3);
  expect(screen.getByText(/셋째 자리까지 나타낸 근삿값/)).toBeTruthy();
 });
 it('실제 몫 그림을 누르면 해당 묶음을 강조하고 나눈 결과를 설명한다',()=>{
  render(<DecimalDivisionLab {...props(problem(8,2))}/>);
  const share=screen.getByRole('button',{name:'첫 번째 몫 0.8 선택'.replace('첫 번째','1번째')});
  fireEvent.click(share);
  expect(share.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByText(/1번째 몫은 0.8입니다/)).toBeTruthy();
 });
 it('조절 후 처음을 누르면 문제에 나온 제수와 몫으로 돌아간다',()=>{
  render(<DecimalDivisionLab {...props(problem(8,2))}/>);
  fireEvent.change(screen.getByRole('slider',{name:'나누는 수'}),{target:{value:'4'}});
  expect(screen.getByText('1.6 ÷ 4 = 0.4')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'↺ 처음'}));
  expect(screen.getByText('1.6 ÷ 2 = 0.8')).toBeTruthy();
 });
 it('초기 문제가 5.4 ÷ 6일 때 제수를 바꾸더라도 피제수 5.4는 바뀌지 않는다',()=>{
  render(<DecimalDivisionLab {...props(problem(9,6))}/>);
  expect(screen.getByText('5.4 ÷ 6 = 0.9')).toBeTruthy();
  fireEvent.change(screen.getByRole('slider',{name:'나누는 수'}),{target:{value:'9'}});
  expect(screen.getByText('5.4 ÷ 9 = 0.6')).toBeTruthy();
 });
 it('실제 학년 및 성취기준 화면 라우터에서도 나눗셈 전용 교구가 열린다',()=>{
  render(<InteractiveLab {...props(problem(8,2))}/>);
  expect(screen.getByTestId('decimal-division-lab')).toBeTruthy();
  expect(screen.getByText('같은 양을 고르게 나누는 소수 나눗셈')).toBeTruthy();
  expect(screen.queryByText(/곱하는 수/)).toBeNull();
 });
});
