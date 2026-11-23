import { afterEach,describe,it,expect } from 'vitest';
import { cleanup,render, screen, within } from '@testing-library/react';
afterEach(cleanup);
import { Fraction,MathText } from '../src/components/MathText.tsx';

describe('초등 교과서형 분수 표기',()=>{
  it('분자는 위, 분모는 아래, 사이에 분수선이 있다',()=>{
    const {container}=render(<Fraction numerator={2} denominator={5}/>);
    const fraction=screen.getByRole('math',{name:'5분의 2'});
    expect(within(fraction).getByText('2')).toBeTruthy();
    expect(within(fraction).getByText('5')).toBeTruthy();
    expect(container.querySelector('.math-fraction__bar')).toBeTruthy();
    expect(fraction.textContent).toBe('25');
    expect(fraction.textContent).not.toContain('/');
  });
  it('문제·선택지·풀이의 여러 분수와 대분수 텍스트를 변환한다',()=>{
    const {container}=render(<MathText text="2/5 × 2/2 = 2/5, 2와 1/3은 대분수예요."/>);
    expect(screen.getAllByRole('math',{name:/^5분의 2$/})).toHaveLength(2);
    expect(screen.getByRole('math',{name:/^2분의 2$/})).toBeTruthy();
    expect(screen.getByRole('math',{name:/^3분의 1$/})).toBeTruthy();
    expect(container.textContent).not.toContain('/');
  });
  it('분수 아닌 소수·시각·숫자는 있는 그대로 유지한다',()=>{
    const {container}=render(<MathText text="0.4는 40%이고 12:30에 시작해요."/>) ;
    expect(container.textContent).toBe('0.4는 40%이고 12:30에 시작해요.');
    expect(container.querySelectorAll('.math-fraction')).toHaveLength(0);
  });
  it('마이너스 분수도 위아래 표기한다',()=>{
    render(<MathText text="−2/7과 -1/4를 비교해요."/>) ;
    expect(screen.getByRole('math',{name:'7분의 2'})).toBeTruthy();
    expect(screen.getByRole('math',{name:'4분의 -1'})).toBeTruthy();
  });
});
