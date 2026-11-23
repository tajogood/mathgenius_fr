import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import FreeSite from '../src/free/FreeSite.tsx';

afterEach(()=>{
  cleanup();window.history.replaceState({},'','/');
  window.localStorage.clear();vi.restoreAllMocks();
});

describe('수학천재 무료판',()=>{
  it('학년별 로그인 없는 수학 체험을 제공한다',()=>{
    window.history.replaceState({},'','/');
    render(<FreeSite/>);
    for(let n=1;n<=6;n++)
      expect(screen.getByRole('button',{name:new RegExp(n+'학년 수학 시작하기')})).toBeTruthy();
    expect(screen.getByText(/회원가입 불필요/)).toBeTruthy();
  });
  it('학년 선택 시 계정 없이 바로 학습을 시작한다',()=>{
    window.history.replaceState({},'','/');
    vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
    render(<FreeSite/>);
    fireEvent.click(screen.getByRole('button',{name:/2학년 수학 시작하기/}));
    expect(screen.getByRole('button',{name:/무료판 첫 화면/})).toBeTruthy();
    expect(window.location.search).toContain('guest=1');
    expect(window.location.search).toContain('grade=2');
  });
});
