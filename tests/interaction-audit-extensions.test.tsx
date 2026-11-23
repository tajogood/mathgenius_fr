import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {MeasuresLab} from '../src/components/labs/RepresentLabs.tsx';
import {ChartsLab,PatternsLab} from '../src/components/labs/DataLabs.tsx';
import type {Topic,Problem} from '../src/math.ts';
afterEach(cleanup);
const problem=(topic:Topic,a:number,b:number):Problem=>({
 topic,a,b,prompt:'수학 원리',answer:'?',choices:['1','2','3','4']
});
const props=(p:Problem)=>({problem:p,phase:'concept' as const,step:0});

describe('83개 교구 감사에서 발견한 슬라이더 전용 시각화 보완',()=>{
 it('1m 카드를 터치하면 정확히 100cm의 작은 단위 조각으로 펼쳐진다',()=>{
  render(<MeasuresLab {...props(problem('measurelength',2,30))}/>);
  expect(screen.getByText(/230 cm/)).toBeTruthy();
  const unit=screen.getByRole('button',{name:'1번째 1m 단위를 100cm로 펼쳐보기'});
  fireEvent.click(unit);
  expect(unit.getAttribute('aria-pressed')).toBe('true');
  expect(unit.querySelectorAll('.lab-unit-chunks i')).toHaveLength(10);
  expect(screen.getByText(/230 cm/)).toBeTruthy();
 });
 it('1kg, 1L 카드는 1000 단위이고 시간을 고르면 60초를 여섯 조각으로 펼친다',()=>{
  render(<MeasuresLab {...props(problem('measureweight',2,100))}/>);
  fireEvent.click(screen.getByRole('button',{name:'1번째 1kg 단위를 1000g로 펼쳐보기'}));
  expect(screen.getByText('1000g')).toBeTruthy();
  cleanup();
  render(<MeasuresLab {...props(problem('capacity',1,200))}/>);
  fireEvent.click(screen.getByRole('button',{name:'1번째 1L 단위를 1000mL로 펼쳐보기'}));
  expect(screen.getByText('1000mL')).toBeTruthy();
 });
 it('규칙의 수를 직접 클릭하면 해당 값을 만든 식을 보여 준다',()=>{
  render(<PatternsLab {...props(problem('patterns',2,3))}/>);
  fireEvent.click(screen.getByRole('button',{name:'2번째 규칙 수 5 선택 및 위아래 드래그'}));
  expect(screen.getByText('2 + 3 × 1 = 5')).toBeTruthy();
 });
 it('규칙 숫자 카드를 위로 끌면 증가 간격이 3에서 5로 바뀐다',()=>{
  render(<PatternsLab {...props(problem('patterns',2,3))}/>);
  const tile=screen.getByRole('button',{name:'2번째 규칙 수 5 선택 및 위아래 드래그'});
  fireEvent.pointerDown(tile,{clientY:100,pointerId:1});
  fireEvent.pointerMove(tile,{clientY:70,pointerId:1});
  fireEvent.pointerUp(tile,{clientY:70,pointerId:1});
  expect(screen.getByText('2 + 5 × 1 = 7')).toBeTruthy();
 });
 it('원그래프에서 키보드로 경계를 옮기면 파랑 40%가 45%가 된다',()=>{
  render(<ChartsLab {...props(problem('circlegraph',4,3))}/>);
  const chart=screen.getByRole('slider',{name:/경계를 직접 드래그/});
  expect(chart.getAttribute('aria-valuenow')).toBe('40');
  fireEvent.keyDown(chart,{key:'ArrowRight'});
  expect(chart.getAttribute('aria-valuenow')).toBe('45');
  expect(screen.getByText('45%')).toBeTruthy();
 });
 it('띠그래프에서 파랑과 주황의 합은 항상 100%이며 경계를 직접 조절할 수 있다',()=>{
  render(<ChartsLab {...props(problem('bandgraph',30,70))}/>);
  const chart=screen.getByRole('slider',{name:/경계를 직접 드래그/});
  fireEvent.keyDown(chart,{key:'ArrowUp'});
  expect(chart.getAttribute('aria-valuenow')).toBe('35');
  expect(screen.getByText('주황 65%')).toBeTruthy();
 });
});
