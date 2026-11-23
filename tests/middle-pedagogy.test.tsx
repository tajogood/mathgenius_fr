import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {middleUnits,MIDDLE_TOPICS} from '../src/middle/curriculum.ts';
import {activityGuide} from '../src/middle/activityGuide.ts';
import PrimeFactorLab,{decompose,isPrime} from '../src/middle/PrimeFactorLab.tsx';
import FoundationLab from '../src/middle/FoundationLabs.tsx';
import {CoordinateDiscovery,RadicalDiscovery,DispersionDiscovery} from '../src/middle/ConceptInteractionLabs.tsx';

afterEach(()=>cleanup());

describe('middle-school concept-first exploration QA',()=>{
  it('all 34 topics have specific action, observation and mathematical reason',()=>{
    expect(middleUnits.length).toBe(34);
    for(const topic of MIDDLE_TOPICS){
      const item=activityGuide[topic];
      expect(item.action.length).toBeGreaterThan(20);
      expect(item.notice.length).toBeGreaterThan(18);
      expect(item.reason.length).toBeGreaterThan(18);
    }
  });
  it('prime factorization is actually performed: 26 = 2 × 13, no fake 40 squares',()=>{
    const view=render(<PrimeFactorLab/>);
    expect(isPrime(1)).toBe(false);expect(isPrime(2)).toBe(true);
    expect(isPrime(13)).toBe(true);expect(isPrime(26)).toBe(false);
    expect(decompose(26)).toEqual([2,13]);
    expect(decompose(36)).toEqual([2,2,3,3]);
    expect(view.container.querySelectorAll('.prime-dot')).toHaveLength(26);
    fireEvent.click(screen.getByRole('button',{name:/26 ÷ 2 계산하기/}));
    expect(view.container.querySelectorAll('.prime-dot')).toHaveLength(13);
    fireEvent.click(screen.getByRole('button',{name:/13 ÷ 13 계산하기/}));
    expect(screen.getByRole('status').textContent).toContain('26 = 2 × 13');
    expect(view.container.querySelectorAll('.prime-dot')).toHaveLength(1);
  });
  it('algebra uses actual substitution for x rather than unrelated tiles',()=>{
    render(<FoundationLab topic="expressions"/>);
    expect(screen.getByText(/3 × \(3\) \+ 2/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/문자 x에 넣을 수/),{target:{value:'4'}});
    expect(screen.getByText(/3 × \(4\) \+ 2/)).toBeTruthy();
  });
  it('equation makes student apply the same operations to both sides',()=>{
    render(<FoundationLab topic="equations"/>);
    expect(screen.getByText('3x + 2 = 14')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/양쪽에서 2개씩 빼기/}));
    expect(screen.getByText('3x = 12')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/양쪽을 3묶음으로 나누기/}));
    expect(screen.getByText('x = 4')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('검산');
  });
  it('long division exposes recurring decimal by a repeated remainder, not a number line',()=>{
    render(<FoundationLab topic="recurring"/>);
    for(let i=0;i<6;i++)fireEvent.click(screen.getByRole('button',{name:/다음 소수 자리/}));
    expect(screen.getByText('0.(142857)')).toBeTruthy();
    expect(screen.getByText(/나머지 1이 다시 나왔어요/)).toBeTruthy();
  });
  it('inequality reverses sign under multiplication by negative one without changing solution set',()=>{
    render(<FoundationLab topic="inequalities"/>);
    expect(screen.getByText('x > 3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/양쪽에 −1을 곱해 보기/}));
    expect(screen.getByText('−x < −3')).toBeTruthy();
    expect(screen.getByRole('img',{name:/오른쪽/})).toBeTruthy();
  });
  it('coordinates support selected point display and radicals require a genuine square pair',()=>{
    const view=render(<CoordinateDiscovery/>);
    expect(screen.getByRole('img',{name:/점 P는 \(3, 4\)/})).toBeTruthy();
    cleanup();
    render(<RadicalDiscovery/>);
    expect(screen.getByText('√18')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/같은 수 두 개를 짝지어/}));
    expect(screen.getByText(/3√2/)).toBeTruthy();
  });
  it('dispersion remains centered at mean while variance grows with spread',()=>{
    render(<DispersionDiscovery/>);
    expect(screen.getByRole('img',{name:/평균 6, 분산 6/})).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/평균에서 떨어진 거리/),{target:{value:'6'}});
    expect(screen.getByRole('img',{name:/평균 6, 분산 24/})).toBeTruthy();
  });
});
