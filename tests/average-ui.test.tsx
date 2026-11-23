import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {AverageBalanceLab} from '../src/components/labs/AverageBalanceLab.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';
import type {Problem} from '../src/math.ts';

afterEach(cleanup);
const problem=(a:number,b:number,c:number):Problem=>({
 topic:'average',a,b,c,prompt:'세 값의 평균은?',answer:String((a+b+c)/3),
 choices:['8','9','10','11']
});
const props=(p:Problem)=>({problem:p,phase:'concept' as const,step:0});

describe('평균은 고르게 나누기',()=>{
 it('9,13,4에서는 평균을 먼저 노출하지 않고 세 묶음과 전체 26개를 보여준다',()=>{
  const {container}=render(<AverageBalanceLab {...props(problem(9,13,4))}/>);
  expect(screen.getByTestId('average-balance-lab')).toBeTruthy();
  expect(screen.getByText('9 + 13 + 4 = 26개')).toBeTruthy();
  expect(screen.getByText(/총 26개를 세 사람에게/)).toBeTruthy();
  expect(container.querySelectorAll('.average-candy')).toHaveLength(26);
  expect(screen.queryByTestId('average-equal-shares')).toBeNull();
 });
 it('두 친구 사이에서 사탕을 옮겨도 합계 26개는 변하지 않는다',()=>{
  render(<AverageBalanceLab {...props(problem(9,13,4))}/>);
  fireEvent.click(screen.getByRole('button',{name:'두 번째 친구 1번째 사탕 선택해 옮기기'}));
  fireEvent.click(screen.getByRole('button',{name:'첫 번째 친구에게 사탕 한 개 전달'}));
  expect(screen.getByText('10 + 12 + 4 = 26개')).toBeTruthy();
  expect(screen.getAllByText(/전체 26개는 그대로예요/).length).toBeGreaterThan(0);
 });
 it('한 개씩 고르게 옮기기를 네 번 하면 9,9,8이 되고 2/3를 발견한다',()=>{
  render(<AverageBalanceLab {...props(problem(9,13,4))}/>);
  for(let i=0;i<4;i++)fireEvent.click(screen.getByRole('button',{name:/사탕 한 개 고르게 옮기기/}));
  expect(screen.getByText('9 + 9 + 8 = 26개')).toBeTruthy();
  expect(screen.getByRole('math',{name:'3분의 2'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/남은 사탕까지 똑같이 나누기/}));
  expect(screen.getByTestId('average-equal-shares')).toBeTruthy();
  expect(screen.getAllByRole('math',{name:'3분의 2'}).length).toBeGreaterThanOrEqual(4);
  expect(screen.getByText(/평균은 원래의 세 값 중 하나일 필요가 없어요/)).toBeTruthy();
 });
 it('6,12,9는 세 번 이동하면 각각 9개로 정확히 나누어진다',()=>{
  render(<AverageBalanceLab {...props(problem(9,13,4))}/>);
  fireEvent.click(screen.getByRole('button',{name:'6·12·9 (딱 나눠짐)'}));
  expect(screen.getByText('6 + 12 + 9 = 27개')).toBeTruthy();
  for(let i=0;i<3;i++)fireEvent.click(screen.getByRole('button',{name:/사탕 한 개 고르게 옮기기/}));
  expect(screen.getByText('9 + 9 + 9 = 27개')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:/남은 사탕까지 똑같이 나누기/}));
  expect(screen.queryByRole('math')).toBeNull();
  expect(screen.getByText(/모두 9개씩 같아졌어요/)).toBeTruthy();
 });
 it('한 번에 공평하게 버튼도 26개를 나눈 세 친구에게 동일한 평균을 제시한다',()=>{
  render(<AverageBalanceLab {...props(problem(9,13,4))}/>);
  fireEvent.click(screen.getByRole('button',{name:/한 번에 공평하게/}));
  const share=screen.getByTestId('average-equal-shares');
  expect(share).toBeTruthy();
  expect(share.querySelectorAll('.average-share')).toHaveLength(3);
  expect(screen.getByText(/한 명에게 8개씩 주면 24개/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'↺ 원래 자료'}));
  expect(screen.getByText('9 + 13 + 4 = 26개')).toBeTruthy();
  expect(screen.queryByTestId('average-equal-shares')).toBeNull();
 });
 it('기존 학년 단원 및 성취기준 모드에서 예전 막대가 아닌 사탕 교구를 사용한다',()=>{
  const {container}=render(<InteractiveLab {...props(problem(9,13,4))}/>);
  expect(screen.getByTestId('average-balance-lab')).toBeTruthy();
  expect(screen.getByText('고르게 나누는 평균 실험실')).toBeTruthy();
  expect(container.querySelector('.lab-chart-bar')).toBeNull();
 });
});
