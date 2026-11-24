import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import HighApp from '../src/high/HighApp.tsx';
import FreeSite from '../src/free/FreeSite.tsx';
import {highCourses} from '../src/high/curriculum.ts';
import {MathLine} from '../src/components/MathLine.tsx';

afterEach(()=>{cleanup();window.history.replaceState({},'','/');localStorage.clear();});
const rawMarkup=/\{\{|\}\}|\^\{|_\{|⟦|⟧|∑\{|lim\{|∫\{/;
const slashFraction=/[0-9a-zA-Z)π√]\s*\/\s*[0-9a-zA-Z(√]/;
function textNodes(root:Element){
  const out:string[]=[];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(w.nextNode())out.push(w.currentNode.textContent??'');
  return out;
}
describe('MathLine typesetting',()=>{
  it('stacks slash, explicit and nested fractions and renders scripts, matrices and operators',()=>{
    const {container}=render(<MathLine text={'P=2/5, y={{k|x−p}}+q, 8^{{{2|3}}}, a_{n}, ⟦1,2;3,4⟧, ∑{k=1}{10} k, lim{x→2}, ∫{0}{1}'}/>);
    expect(container.querySelectorAll('.math-fraction').length).toBe(3);
    expect(container.querySelector('.math-sup .math-fraction')).toBeTruthy();
    expect(container.querySelector('.math-sub')?.textContent).toBe('n');
    expect(container.querySelectorAll('.math-matrix__grid > span').length).toBe(4);
    expect(container.querySelector('.math-op--sum .math-op__upper')?.textContent).toBe('10');
    expect(container.querySelector('.math-op--lim .math-op__lower')?.textContent).toBe('x→2');
    expect(container.querySelector('.math-int')).toBeTruthy();
    for(const t of textNodes(container)){expect(t).not.toMatch(rawMarkup);expect(t).not.toMatch(slashFraction);}
  });
});
describe('high-school learning portal',()=>{
  it('lists five subjects and switches between them',()=>{
    render(<HighApp initialCourse="c1" onElementary={()=>{}} onMiddle={()=>{}}/>);
    const group=screen.getByRole('group',{name:'고등학교 과목 선택'});
    expect(group.querySelectorAll('button')).toHaveLength(5);
    fireEvent.click(within(group).getByRole('button',{name:/미적분Ⅰ/}));
    expect(screen.getByRole('heading',{name:/미적분Ⅰ, 그래프로/})).toBeTruthy();
    expect(screen.getByRole('heading',{name:'함수의 극한'})).toBeTruthy();
    expect(window.location.search).toContain('course=calc');
  });
  it('every unit renders exploration and practice without raw markup or slash fractions',{timeout:180000},()=>{
    for(const course of highCourses){
      const view=render(<HighApp initialCourse={course.id} onElementary={()=>{}} onMiddle={()=>{}}/>);
      const nav=screen.getByRole('navigation',{name:'고등학교 단원 목록'});
      const buttons=nav.querySelectorAll('button');
      expect(buttons.length).toBe(course.chapters.length);
      buttons.forEach((b,i)=>{
        fireEvent.click(b);
        const lesson=view.container.querySelector('.middle-lesson')!;
        expect(lesson.querySelector('.high-lab svg')).toBeTruthy();
        for(const t of textNodes(lesson)){expect(t,course.id+'#'+(i+1)).not.toMatch(rawMarkup);expect(t,course.id+'#'+(i+1)+' '+t).not.toMatch(slashFraction);}
        fireEvent.click(screen.getByRole('button',{name:/문제 풀어보기/}));
        const choices=lesson.querySelectorAll('.middle-choice-grid button');
        expect(choices).toHaveLength(4);
        fireEvent.click(choices[0]);
        expect(screen.getByRole('status')).toBeTruthy();
        for(const t of textNodes(lesson)){expect(t).not.toMatch(rawMarkup);expect(t,course.id+'#'+(i+1)+' '+t).not.toMatch(slashFraction);}
      });
      view.unmount();
    }
  });
  it('lab sliders change the live mathematical result',()=>{
    render(<HighApp initialCourse="c1" onElementary={()=>{}} onMiddle={()=>{}}/>);
    const result=()=>document.querySelector('.middle-live-result')!.textContent;
    expect(result()).toContain('25');
    fireEvent.change(screen.getByRole('slider',{name:/a의 길이/}),{target:{value:'5'}});
    expect(result()).toContain('49');
  });
  it('a correct answer marks the unit complete in local storage only',()=>{
    render(<HighApp initialCourse="stat" onElementary={()=>{}} onMiddle={()=>{}}/>);
    fireEvent.click(screen.getByRole('button',{name:/문제 풀어보기/}));
    const status=()=>screen.queryByRole('status');
    for(const b of Array.from(document.querySelectorAll<HTMLButtonElement>('.middle-choice-grid button'))){
      if(status())break;
      fireEvent.click(b);
      if(!status()?.textContent?.includes('정답입니다')){fireEvent.click(screen.getByRole('button',{name:/다른 문제 풀기/}));}
    }
    for(let k=0;k<30&&!screen.queryByText(/정답입니다/);k++){
      const btns=Array.from(document.querySelectorAll<HTMLButtonElement>('.middle-choice-grid button'));
      fireEvent.click(btns[k%4]);
      if(!screen.queryByText(/정답입니다/))fireEvent.click(screen.getByRole('button',{name:/다른 문제 풀기/}));
    }
    expect(screen.getByText(/정답입니다/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('mathgenius.high.completed.v1')||'[]')).toContain('h-stat-1');
  });
  it('site level switch opens the high-school course from elementary and middle pages',()=>{
    render(<FreeSite/>);
    fireEvent.click(screen.getByRole('button',{name:/고등 수학 →/}));
    expect(screen.getByRole('heading',{name:/공통수학1, 그래프로/})).toBeTruthy();
    expect(window.location.search).toContain('level=high');
    fireEvent.click(screen.getByRole('button',{name:'중등 수학'}));
    expect(screen.getByRole('heading',{name:/중1 수학을/})).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:/고등 수학 →/}));
    expect(screen.getByRole('heading',{name:/공통수학1, 그래프로/})).toBeTruthy();
  });
});
