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
  it('concept -> lab changes live math results -> exercise practice',()=>{
    render(<MiddleApp initialGrade={1} onElementary={()=>{}}/>);
    expect(screen.getByRole('heading',{name:'원리를 먼저 알아봐요'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/움직이는 교구로 확인하기/}));
    expect(screen.getByRole('heading',{name:'직접 조절하면서 개념을 발견하세요'})).toBeTruthy();
    const slider=screen.getByLabelText(/소인수분해할 자연수/);
    expect(slider).toBeTruthy();
    fireEvent.change(slider,{target:{value:'48'}});
    expect(screen.getByText('48 = 2×2×2×2×3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/배운 개념으로 문제 풀기/}));
    expect(screen.getByRole('heading',{name:'스스로 문제를 해결해요'})).toBeTruthy();
    expect(screen.getByRole('button',{name:/다른 문제 풀기/})).toBeTruthy();
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
