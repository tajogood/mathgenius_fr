import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import App from '../src/App.tsx';
import { TOPIC_CHALLENGES } from '../src/interactions.ts';

beforeEach(()=>{
  window.localStorage.clear();
  vi.stubGlobal('scrollTo',vi.fn());
});
afterEach(()=>{
  cleanup();vi.unstubAllGlobals();
});

describe('복합 단원과 단원 달성 흐름',()=>{
  it('한 문제를 풀기만 해서는 단원 완료가 되지 않는다',()=>{
    const {container}=render(<App/>);
    expect(screen.getByText('0/71')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/다음 단계/}));
    fireEvent.click(screen.getByRole('button',{name:/다음 단계/}));
    fireEvent.click(screen.getByRole('button',{name:/문제 풀러 가기/}));
    const choices=container.querySelectorAll('.choice');
    expect(choices.length).toBe(4);
    fireEvent.click(choices[0]);
    fireEvent.click(screen.getByRole('button',{name:'정답 확인'}));
    expect(screen.getByText('0/71')).toBeTruthy();
  });

  it('분수 덧셈 뒤 처음 만나는 다른 개념을 바로 출제하지 않고 개념 화면부터 보여 준다',()=>{
    const {container}=render(<App/>);
    for(let i=0;i<3;i++) fireEvent.click(container.querySelector('.guide-actions .btn--primary')!);
    fireEvent.click(container.querySelector('.choice')!);
    fireEvent.click(screen.getByRole('button',{name:'정답 확인'}));
    fireEvent.click(container.querySelector('.guide-actions .btn--primary')!);
    fireEvent.click(screen.getByRole('button',{name:/다음 풀이/}));
    fireEvent.click(screen.getByRole('button',{name:/다음 풀이/}));
    fireEvent.click(screen.getByRole('button',{name:/다시 풀기/}));
    expect(container.querySelector('.guide-eyebrow')?.textContent).toContain('STEP 1 / 3');
    expect(container.querySelector('.guide-body p')?.textContent).toContain(TOPIC_CHALLENGES.fractionsub);
    expect(container.querySelector('.interactive-lab--fractions')).toBeTruthy();
  });

  it('풀이 마지막 단계에서 이전 단원·다시 풀기·다음 단원 버튼으로 이동한다',()=>{
    const {container}=render(<App initialGrade={1}/>);
    const goToLastSolution=()=>{
      for(let i=0;i<3;i++) fireEvent.click(container.querySelector('.guide-actions .btn--primary')!);
      fireEvent.click(container.querySelector('.choice')!);
      fireEvent.click(screen.getByRole('button',{name:'정답 확인'}));
      fireEvent.click(container.querySelector('.guide-actions .btn--primary')!);
      fireEvent.click(screen.getByRole('button',{name:/다음 풀이/}));
      fireEvent.click(screen.getByRole('button',{name:/다음 풀이/}));
    };
    const firstTitle=container.querySelector('h1')?.textContent;
    goToLastSolution();
    const prev=screen.getByRole('button',{name:/이전 단원/}) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    expect(screen.getByRole('button',{name:/다시 풀기/})).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/다음 단원/}));
    expect(container.querySelector('h1')?.textContent).not.toBe(firstTitle);
    expect(container.querySelector('.guide-eyebrow')?.textContent).toContain('STEP 1 / 3');
    goToLastSolution();
    fireEvent.click(screen.getByRole('button',{name:/이전 단원/}));
    expect(container.querySelector('h1')?.textContent).toBe(firstTitle);
  });
});
