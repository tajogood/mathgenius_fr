import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Problem, Topic } from '../src/math.ts';
import { BlocksLab, PlaceLab, ArraysLab, EquationLab } from '../src/components/labs/CountingLabs.tsx';
import { FractionsLab, NumberlineLab, RatiosLab } from '../src/components/labs/RepresentLabs.tsx';
import { GeometryLab, AnglesLab, ClockLab, SolidsLab } from '../src/components/labs/GeometryLabs.tsx';
import { ChartsLab, PatternsLab, ChanceLab } from '../src/components/labs/DataLabs.tsx';
import { AreaShapesLab,ProjectionLab,NetLab } from '../src/components/labs/SpecialLabs.tsx';
import { DecimalMultiplyLab } from '../src/components/labs/DecimalMultiplyLab.tsx';

afterEach(cleanup);
const problem = (topic:Topic,a:number,b:number,c?:number,d?:number):Problem=>
  ({topic,a,b,c,d,prompt:topic+' practice',answer:'?',choices:['1','2','3','4']});
const props=(p:Problem)=>({problem:p,phase:'question' as const,step:0});

describe('학생이 조작하면 실제 수학 모형의 값과 그림이 변한다',()=>{
  it('1학년 블록을 터치해 세고 다시 누르면 취소된다',()=>{
    render(<BlocksLab {...props(problem('count9',7,0))}/>);
    const tile=screen.getByRole('button',{name:/1번째 블록 세기/});
    expect(tile.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(tile);
    expect(tile.getAttribute('aria-pressed')).toBe('true');
    expect(tile.className).toContain('lab-count-tile--on');
    fireEvent.click(tile);
    expect(tile.getAttribute('aria-pressed')).toBe('false');
  });

  it('수 가르기는 블록을 옮길 때 남은 수를 즉시 계산한다',()=>{
    render(<BlocksLab {...props(problem('split',7,3))}/>);
    for(let i=1;i<=3;i++)fireEvent.click(screen.getByRole('button',{name:new RegExp(i+'번째 블록 옮기기')}));
    expect(screen.getByText(/개 남음 · 옮긴 블록 3개/)).toBeTruthy();
    expect(screen.getByText(/7 = 3 \+ 4!/)).toBeTruthy();
  });

  it('뺄셈은 블록을 실제로 제거하고 남은 값을 표시한다',()=>{
    const p={...problem('addsub',8,2),mode:'subtract'};
    render(<BlocksLab {...props(p)}/>);
    fireEvent.click(screen.getByRole('button',{name:/1번째 블록 빼기/}));
    fireEvent.click(screen.getByRole('button',{name:/2번째 블록 빼기/}));
    expect(screen.getByText(/개 남음 · 뺀 블록 2개/)).toBeTruthy();
  });

  it('받아올림 덧셈에서 10개를 선택하면 십 묶음 1개를 표시한다',()=>{
    render(<BlocksLab {...props(problem('carry',8,5))}/>);
    for(let i=1;i<=10;i++)fireEvent.click(screen.getByRole('button',{
      name:i+'번째 블록 세기'
    }));
    expect(screen.getByText('10개 묶음 1개')).toBeTruthy();
    expect(screen.getByText('낱개 0개')).toBeTruthy();
    expect(screen.getByText(/10개를 묶었어요/)).toBeTruthy();
  });

  it('분류 학습에서는 파란색 블록만 따로 세어 준다',()=>{
    render(<BlocksLab {...props(problem('classify',3,2))}/>);
    fireEvent.click(screen.getByRole('button',{name:/1번째 블록 세기/}));
    fireEvent.click(screen.getByRole('button',{name:/4번째 블록 세기/}));
    expect(screen.getByText(/개 파란 블록 선택 · 주황 1개 선택/)).toBeTruthy();
  });

  it('10개 묶음은 실제 개수대로 더하고 마지막 3개 묶음도 반영한다',()=>{
    render(<BlocksLab {...props(problem('count100',23,0))}/>);
    fireEvent.click(screen.getByRole('button',{name:/1번째 10개 묶음/}));
    fireEvent.click(screen.getByRole('button',{name:/3번째 3개 묶음/}));
    expect(screen.getByText('13')).toBeTruthy();
  });

  it('분수 막대의 색칠을 바꾸고 등분 수를 2배 해도 같은 값을 유지한다',()=>{
    render(<FractionsLab {...props(problem('fractionintro',1,4))}/>);
    fireEvent.click(screen.getByRole('button',{name:/3번째 분수 칸/}));
    expect(screen.getAllByRole('math',{name:'4분의 3'}).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button',{name:/등분을 더 잘게 늘리기/}));
    expect(screen.getAllByRole('math',{name:'8분의 6'}).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button',{name:/원래 분수/}));
    expect(screen.getAllByRole('math',{name:'4분의 1'}).length).toBeGreaterThan(0);
  });

  it('분수 곱셈은 부분의 부분을 겹치는 격자로 보여 주고 곱셈 결과를 계산한다',()=>{
    render(<FractionsLab {...props(problem('fractionmul',1,2,1,4))}/>);
    expect(screen.getByRole('img',{name:/곱할 때 겹치는 부분/})).toBeTruthy();
    expect(screen.getByRole('math',{name:'8분의 1'})).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button',{name:/2번째 분수 칸/})[1]);
    expect(screen.getAllByRole('math',{name:'4분의 1'})[0]).toBeTruthy();
  });

  it('분수 나눗셈에서 나누는 수를 0으로 바꾸면 계산을 막는다',()=>{
    render(<FractionsLab {...props(problem('fractiondiv',1,2,1,4))}/>);
    expect(screen.getByRole('math',{name:'1분의 2'})).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button',{name:/1번째 분수 칸/})[1]);
    expect(screen.getByText(/0으로 나눌 수 없어요/)).toBeTruthy();
  });

  it('분수의 뺄셈은 두 막대의 현재 색칠 양으로 결과를 다시 계산한다',()=>{
    const p={...problem('samefraction',3,1,4),mode:'subtract'};
    render(<FractionsLab {...props(p)}/>);
    expect(screen.getAllByRole('math',{name:'2분의 1'})[0]).toBeTruthy();
  });

  it('자릿값 카드를 선택하고 선택한 자리의 수를 1만큼 증가시킨다',()=>{
    render(<PlaceLab {...props(problem('place3',524,1))}/>);
    fireEvent.click(screen.getByRole('button',{name:/십의 자리/}));
    fireEvent.click(screen.getByRole('button',{name:/선택 자리 \+1/}));
    expect(screen.getByText('534')).toBeTruthy();
  });

  it('직사각형의 가로를 바꾸면 둘레와 넓이가 같이 바뀐다',()=>{
    render(<GeometryLab {...props(problem('perimeter',4,3))}/>);
    expect(screen.getByText(/둘레 14cm · 넓이 12cm²/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'가로 늘리기'}));
    expect(screen.getByText(/둘레 16cm · 넓이 15cm²/)).toBeTruthy();
  });

  it('각도기를 슬라이더로 움직여 90도 직각을 만든다',()=>{
    render(<AnglesLab {...props(problem('angles',60,0))}/>);
    fireEvent.change(screen.getByRole('slider',{name:/각도/}),{target:{value:'90'}});
    expect(screen.getByText(/직각이에요/)).toBeTruthy();
  });

  it('시계의 시침을 변경하면 읽는 시각도 바뀐다',()=>{
    render(<ClockLab {...props(problem('clock',3,30))}/>);
    fireEvent.click(screen.getByRole('button',{name:'시 늘리기'}));
    expect(screen.getByText('4시 30분')).toBeTruthy();
  });

  it('원래 비율에서 구슬을 하나 더하면 퍼센트가 변한다',()=>{
    render(<RatiosLab {...props(problem('ratio',2,3))}/>);
    expect(screen.getByText('40%')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'파란 구슬 늘리기'}));
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('막대를 클릭해 그래프 높이를 조절한다',()=>{
    render(<ChartsLab {...props(problem('bargraph',4,3,2))}/>);
    fireEvent.click(screen.getByRole('button',{name:/그래프 1번 값을 한 칸 올리기/}));
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('수직선의 값을 슬라이더로 움직이면 숫자가 변한다',()=>{
    render(<NumberlineLab {...props(problem('compare',4,7))}/>);
    fireEvent.change(screen.getByRole('slider',{name:/점 움직이기/}),{target:{value:'8'}});
    expect(screen.getByText(/8 > 7/)).toBeTruthy();
  });

  it('쌓기나무를 한 층 더하면 표시된 개수가 증가한다',()=>{
    render(<SolidsLab {...props(problem('stacking',3,2,2))}/>);
    expect(screen.getByText(/2층 × 층당 6개 = 12개/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'층 늘리기'}));
    expect(screen.getByText(/3층 × 층당 6개 = 18개/)).toBeTruthy();
  });

  it('꺾은선그래프의 자료값을 조절하면 점의 위치도 달라진다',()=>{
    const p=problem('linegraph',4,3,7);
    render(<ChartsLab {...props(p)}/>);
    const sliders=screen.getAllByRole('slider');
    fireEvent.change(sliders[1],{target:{value:'9'}});
    expect(screen.getAllByText('9').length).toBeGreaterThan(0);
  });

  it('최대공약수 모형은 두 수 모두를 나누는 수만 공약수로 인정한다',()=>{
    const p={...problem('gcdlcm',8,12),mode:'gcd'};
    render(<EquationLab {...props(p)}/>);
    fireEvent.click(screen.getByRole('button',{name:'4'}));
    expect(screen.getByText(/두 수 모두 4로 나누어떨어져요/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'3'}));
    expect(screen.getByText(/아직 공약수가 아니에요/)).toBeTruthy();
  });

  it('구 문제에서는 사각형 블록 대신 둥근 구를 보여 준다',()=>{
    const p=problem('curvedsolids',2,0);
    render(<SolidsLab {...props(p)}/>);
    expect(screen.getByRole('img',{name:/sphere/})).toBeTruthy();
  });

  it('규칙의 간격을 조절하면 뒤의 숫자들이 바뀐다',()=>{
    render(<PatternsLab {...props(problem('patterns',2,3))}/>);
    fireEvent.click(screen.getByRole('button',{name:'늘어나는 수 늘리기'}));
    expect(screen.getAllByText('14').length).toBeGreaterThan(0);
  });

  it('확률 실험에서 공의 색을 직접 바꾸면 비율도 변한다',()=>{
    render(<ChanceLab {...props(problem('probability',2,3))}/>);
    expect(screen.getByText('40%')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/1번째 공, 파란색/}));
    expect(screen.getByText('20%')).toBeTruthy();
  });

  it('나눗셈 묶음을 탭하면 선택한 줄이 강조된다',()=>{
    render(<ArraysLab {...props(problem('divide',3,4))}/>);
    const row=screen.getByRole('button',{name:/1번째 줄 4개 선택/});
    fireEvent.click(row);
    expect(row.getAttribute('aria-pressed')).toBe('true');
  });
  it('성취기준 6수03-14는 사다리꼴의 넓이와 네 도형 넓이를 직접 조작하게 한다',()=>{
    render(<AreaShapesLab {...props(problem('area',8,6))}/>);
    const buttons=screen.getByRole('group',{name:'넓이 구할 도형 선택'});
    expect(buttons.querySelectorAll('button').length).toBe(4);
    fireEvent.click(screen.getByRole('button',{name:'사다리꼴'}));
    expect(screen.getByText('넓이 36cm²')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'윗변 늘리기'}));
    expect(screen.getByText('넓이 39cm²')).toBeTruthy();
  });

  it('성취기준 6수03-10은 블록을 실제로 쌓고 위 앞 옆을 각각 변화시킨다',()=>{
    render(<ProjectionLab {...props(problem('solidviews',3,2))}/>);
    const first=screen.getByRole('button',{name:/1행 1열 높이/});
    const before=first.getAttribute('aria-label');
    fireEvent.click(first);
    expect(first.getAttribute('aria-label')).not.toBe(before);
    expect(screen.getByRole('img',{name:/앞에서 본 각 열 최대 높이/})).toBeTruthy();
    expect(screen.getByRole('img',{name:/오른쪽에서 본 각 줄 최대 높이/})).toBeTruthy();
  });

  it('각기둥과 원기둥의 전개도를 접고 펼칠 수 있다',()=>{
    const p=problem('curvedsolids',0,0);
    const {rerender}=render(<NetLab {...props(p)} standardId="6수03-08"/>);
    expect(screen.getByText('원기둥')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/접어 보기/}));
    expect(screen.getByText('접힌 입체 모형')).toBeTruthy();
    rerender(<NetLab {...props(p)} standardId="6수03-06"/>);
    expect(screen.getAllByText('삼각기둥').length).toBeGreaterThan(0);
  });

  it('소수 곱셈은 9라는 정수 카드 대신 0.9×0.6의 겹친 54칸을 나타낸다',()=>{
    render(<DecimalMultiplyLab {...props(problem('decimalmul',9,6))}/>);
    expect(screen.getByText('0.9 × 0.6 = 0.54')).toBeTruthy();
    expect(screen.getByText(/겹치는 칸 54개/)).toBeTruthy();
    expect(screen.getAllByRole('button',{name:/번째 줄 .*번째 칸/})).toHaveLength(100);
    expect(screen.getByRole('math',{name:'100분의 54'})).toBeTruthy();
    expect(screen.queryByText(/^9$/)).toBeNull();
  });

  it('소수 곱셈 격자를 클릭하거나 슬라이더를 옮기면 실제 겹치는 수가 달라진다',()=>{
    render(<DecimalMultiplyLab {...props(problem('decimalmul',9,6))}/>);
    fireEvent.click(screen.getByRole('button',{name:/2번째 줄 3번째 칸/}));
    expect(screen.getByText('0.3 × 0.2 = 0.06')).toBeTruthy();
    fireEvent.change(screen.getByRole('slider',{name:/두 번째 소수/}),{target:{value:'8'}});
    expect(screen.getByText('0.3 × 0.8 = 0.24')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/원래 소수/}));
    expect(screen.getByText('0.9 × 0.6 = 0.54')).toBeTruthy();
  });

  it('반복 덧셈을 택하면 0.9를 여섯 번 더한 값 5.4를 10으로 나눔을 설명한다',()=>{
    render(<DecimalMultiplyLab {...props(problem('decimalmul',9,6))}/>);
    fireEvent.click(screen.getByRole('button',{name:/반복 덧셈으로도 보기/}));
    expect(screen.getByTestId('decimal-repeated-addition')).toBeTruthy();
    expect(screen.getByText(/5.4 ÷ 10 = 0.54/)).toBeTruthy();
    expect(screen.getByText(/6개의 10분의 1/)).toBeTruthy();
    const chips=screen.getByLabelText('0.9을 6번 반복해 더하기');
    expect(chips.querySelectorAll('b')).toHaveLength(6);
    expect(chips.textContent).not.toContain('9 + 9');
  });

});
