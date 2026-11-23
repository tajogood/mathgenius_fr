import { afterEach, describe, expect, it } from 'vitest';
import { cleanup,fireEvent,render,screen } from '@testing-library/react';
import type {Problem} from '../src/math.ts';
import {SymmetryLab} from '../src/components/labs/SymmetryLab.tsx';
import InteractiveLab from '../src/components/InteractiveLab.tsx';

afterEach(cleanup);
const problem=(a=0):Problem=>({topic:'symmetry',a,b:0,prompt:'합동과 대칭',answer:'선대칭',
  choices:['선대칭','점대칭','평행이동','회전이동']});
const props=(p:Problem,standardId?:string)=>({problem:p,phase:'concept' as const,step:0,standardId});

describe('직접 움직이는 합동과 대칭 실험실',()=>{
  it('대칭축과 실제 나비 양쪽을 그리고 오른쪽 날개를 키보드로도 이동시킨다',()=>{
    const {container}=render(<SymmetryLab {...props(problem(0),'6수03-02')}/>);
    expect(screen.getByText('선대칭: 대칭축 양쪽이 거울처럼 같아요')).toBeTruthy();
    expect(screen.getByText('대칭축')).toBeTruthy();
    const wing=screen.getByRole('button',{name:/오른쪽 나비 날개를 드래그/});
    const before=wing.getAttribute('transform');
    fireEvent.keyDown(wing,{key:'ArrowLeft'});
    expect(wing.getAttribute('transform')).not.toBe(before);
    expect(container.querySelector('.lab-symmetry-stage')).toBeTruthy();
  });

  it('합동은 직접 도형을 움직이고 회전할 수 있으며 다른 도형 예시도 선택할 수 있다',()=>{
    render(<SymmetryLab {...props(problem(0),'6수03-01')}/>);
    const moving=screen.getByRole('button',{name:/파란 도형을 직접 드래그해 옮기세요/});
    const before=moving.getAttribute('transform');
    fireEvent.keyDown(moving,{key:'ArrowLeft'});
    fireEvent.keyDown(moving,{key:'r'});
    expect(moving.getAttribute('transform')).not.toBe(before);
    expect(screen.getByText(/회전 45°/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'ㄱ자'}));
    expect(screen.getByRole('button',{name:'ㄱ자'}).getAttribute('aria-pressed')).toBe('true');
  });

  it('점대칭은 대칭 중심과 평행사변형을 사용한다',()=>{
    render(<SymmetryLab {...props(problem(1),'6수03-02')}/>);
    expect(screen.getByText('대칭의 중심 O')).toBeTruthy();
    expect(screen.getByText('점대칭: 중심을 기준으로 180° 돌려 겹쳐요')).toBeTruthy();
    expect(screen.getByRole('button',{name:'평행사변형'}).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button',{name:'직사각형'}));
    expect(screen.getByRole('button',{name:'직사각형'}).getAttribute('aria-pressed')).toBe('true');
  });

  it('기존 83개 유형 라우터에서도 정적인 도형이 아니라 드래그 실험실을 연다',()=>{
    render(<InteractiveLab {...props(problem(0),'6수03-02')}/>);
    expect(screen.getByTestId('symmetry-experiment')).toBeTruthy();
    expect(screen.getByRole('img',{name:/마우스 또는 손가락으로 직접 끌어 움직이는 선대칭 도형/})).toBeTruthy();
    expect(screen.getByText('합동·선대칭·점대칭 실험실')).toBeTruthy();
  });

  it('소수의 곱셈에서는 정수 9 반복 카드 대신 소수 곱셈 실험실을 사용한다',()=>{
    const p:Problem={topic:'decimalmul',a:9,b:6,prompt:'0.9 × 0.6 = ?',answer:'0.54',
      choices:['0.54','5.4','0.06','0.15']};
    render(<InteractiveLab {...props(p)}/>);
    expect(screen.getByTestId('decimal-multiplication-lab')).toBeTruthy();
    expect(screen.getByText('소수 100칸 곱셈 실험실')).toBeTruthy();
    expect(screen.queryByText(/^9$/)).toBeNull();
  });
});
