import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import MiddleApp from '../src/middle/MiddleApp.tsx';
import FreeSite from '../src/free/FreeSite.tsx';

afterEach(()=>{
  cleanup();window.history.replaceState({},'','/');localStorage.clear();
  vi.restoreAllMocks();
});
describe('middle school interactive learning portal',()=>{
  it('all three middle school grades are present and can be selected',()=>{
    window.history.replaceState({},'','/');
    render(<MiddleApp initialGrade={2} onElementary={()=>{}}/>);
    expect(screen.getByRole('heading',{name:/중2 수학을/})).toBeTruthy();
    const nav=screen.getByRole('group',{name:'중학교 학년 선택'});
    expect(nav.querySelectorAll('button').length).toBe(3);
    fireEvent.click(screen.getByRole('button',{name:/중3.*완료/}));
    expect(screen.getByRole('heading',{name:/중3 수학을/})).toBeTruthy();
  });
  it('opens directly to interactive exploration, then proceeds to practice',()=>{
    render(<MiddleApp initialGrade={1} onElementary={()=>{}}/>);
    expect(screen.queryByText('개념 이해')).toBeNull();
    expect(screen.getByRole('heading',{name:'직접 탐구'})).toBeTruthy();
    expect(screen.getByRole('heading',{name:/소수만의 곱/})).toBeTruthy();
    expect(screen.getByRole('group',{name:'학습 단계'}).querySelectorAll('button')).toHaveLength(2);
    const number=screen.getByRole('slider',{name:/분해할 수/});
    fireEvent.change(number,{target:{value:'48'}});
    expect(screen.getByRole('img',{name:/48개의 점/})).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/48 ÷ 2 계산하기/}));
    expect(screen.getByRole('img',{name:/24개의 점/})).toBeTruthy();
    expect(screen.getByText(/48 = 2 × 24/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/문제 풀어보기/}));
    expect(screen.getByRole('heading',{name:'문제로 확인해 보세요'})).toBeTruthy();
    expect(screen.getByRole('button',{name:/다른 문제 풀기/})).toBeTruthy();
  });
  it('prime factorization completes 26=2×13 with true dot counts',()=>{
    render(<MiddleApp initialGrade={1} onElementary={()=>{}}/>);
    expect(screen.getByRole('img',{name:/26개의 점/})).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/26 ÷ 2 계산하기/}));
    expect(screen.getByRole('img',{name:/13개의 점/})).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/13 ÷ 13 계산하기/}));
    expect(screen.getByText(/모든 인수가 소수/)).toBeTruthy();
    expect(screen.getAllByText(/26 = 2 × 13/).length).toBeGreaterThan(0);
  });
  it('free site retains elementary mode and switches to middle with no login',()=>{
    window.history.replaceState({},'','/mathgenius_fr/');
    vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
    render(<FreeSite/>);
    fireEvent.click(screen.getByRole('button',{name:/중1 수학 →/}));
    expect(screen.getByRole('heading',{name:/중1 수학을/})).toBeTruthy();
    expect(window.location.search).toContain('level=middle');
    fireEvent.click(screen.getByRole('button',{name:/초등 수학 학습실/}));
    expect(screen.getByRole('group',{name:'학년 선택'})).toBeTruthy();
  });
});
