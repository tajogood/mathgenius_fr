import {afterEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import StandardStudio from '../src/components/StandardStudio.tsx';
import {standardLessons} from '../src/standards/lessons.ts';

afterEach(()=>{cleanup();window.localStorage.clear();vi.restoreAllMocks();});
function advanceScenes(){
  fireEvent.click(screen.getByRole('button',{name:/다음 장면/}));
  fireEvent.click(screen.getByRole('button',{name:/다음 장면/}));
  fireEvent.click(screen.getByRole('button',{name:/개념 확인 시작/}));
}

describe('성취기준 121개 독립 교실',()=>{
  it('학년군을 선택하고 개별 기준을 검색해 수업을 바꿀 수 있다',()=>{
    render(<StandardStudio initialId="2수01-01" onExit={()=>{}}/>);
    expect(screen.getByLabelText('성취기준별 학습 확인 0/121')).toBeTruthy();
    expect(screen.getByRole('heading',{name:'0부터 100까지 세고 표현하기'})).toBeTruthy();
    fireEvent.change(screen.getByLabelText('학년군'),{target:{value:'5~6학년'}});
    expect(screen.getByText('6수03-14')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('학습할 성취기준 찾기'),{target:{value:'6수03-14'}});
    fireEvent.click(screen.getByRole('button',{name:/6수03-14.*삼각형 사다리꼴 마름모의 넓이/}));
    expect(screen.getByRole('heading',{name:'삼각형 사다리꼴 마름모의 넓이'})).toBeTruthy();
    expect(screen.getByText('사다리꼴의 넓이')).toBeTruthy();
  });

  it('복합 수업에서는 첫 개념 확인 후 바로 완료되지 않고 다음 세부 확인으로 넘어간다',()=>{
    render(<StandardStudio initialId="6수03-14" onExit={()=>{}}/>);
    advanceScenes();
    expect(screen.getByText(/개념 확인 1 \/ 4/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'24cm²'}));
    fireEvent.click(screen.getByRole('button',{name:'정답 확인'}));
    expect(screen.getByText(/정답이에요/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/다음 세부 개념/}));
    expect(screen.getByText(/개념 확인 2 \/ 4/)).toBeTruthy();
    expect(screen.getByRole('heading',{name:/평행사변형 넓이는/})).toBeTruthy();
    expect(screen.queryByText(/학습 확인 완료!/)).toBeNull();
  });

  it('121개 모두 탐색 가능하며 실수로 완료 버튼이 노출되지 않는다',()=>{
    expect(standardLessons.length).toBe(121);
    render(<StandardStudio initialId="6수01-01" onExit={()=>{}}/>);
    expect(screen.getAllByRole('button',{name:/수0[1-4]-/}).length).toBe(121);
    expect(screen.queryByText(/학습 확인 완료!/)).toBeNull();
  });
});
