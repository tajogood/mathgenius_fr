import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import FreeSite from '../src/free/FreeSite.tsx';
afterEach(()=>{cleanup();window.history.replaceState({},'','/');localStorage.clear();});

describe('무료판은 기존 수학천재와 동일한 학습 엔진을 렌더링한다',()=>{
  it('기본 5학년과 모든 학년 선택 기능이 원본 그대로 표시된다',()=>{
    window.history.replaceState({},'','/mathgenius_fr/');
    render(<FreeSite/>);
    const grades=screen.getByRole('group',{name:'학년 선택'});
    expect(grades).toBeTruthy();
    expect(screen.getByRole('button',{name:'5학년'}).getAttribute('aria-pressed')).toBe('true');
    for(let n=1;n<=6;n++)
      expect(screen.getByRole('button',{name:n+'학년'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'2학년'}));
    expect(screen.getByRole('button',{name:'2학년'}).getAttribute('aria-pressed')).toBe('true');
  });
  it('학년별 검색 안내에서 원본 교과 콘텐츠로 바로 들어간다',()=>{
    window.history.replaceState({},'','/mathgenius_fr/?guest=1&grade=3');
    render(<FreeSite/>);
    expect(screen.getByRole('button',{name:'3학년'}).getAttribute('aria-pressed')).toBe('true');
  });
});
