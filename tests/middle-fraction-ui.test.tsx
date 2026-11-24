import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import MiddleApp from '../src/middle/MiddleApp.tsx';

afterEach(()=>{cleanup();localStorage.clear();});
const slash=/\d\s*\/\s*\d|√\d+\s*\/\s*\d/;
function texts(root:Element){const o:string[]=[];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(w.nextNode())o.push(w.currentNode.textContent??'');return o;}
describe('middle-school fractions are typeset numerator over denominator',()=>{
  it('no slash fractions in any unit, lab result or practice problem',{timeout:180000},()=>{
    for(const grade of [1,2,3] as const){
      const view=render(<MiddleApp initialGrade={grade} onElementary={()=>{}}/>);
      for(const sem of ['1학기','2학기']){
        fireEvent.click(screen.getByRole('button',{name:sem}));
        const units=view.container.querySelectorAll('nav[aria-label="중학교 단원 목록"] button');
        units.forEach(u=>{
          fireEvent.click(u);
          for(let k=0;k<3;k++){
            fireEvent.click(screen.getByRole('button',{name:/문제 풀어보기/}));
            fireEvent.click(view.container.querySelectorAll('.middle-choice-grid button')[0]);
            for(const t of texts(view.container.querySelector('.middle-lesson')!))expect(t,'중'+grade+' '+t).not.toMatch(slash);
            fireEvent.click(screen.getByRole('button',{name:/다른 문제 풀기/}));
            fireEvent.click(screen.getAllByRole('button',{name:/직접 탐구/})[0]);
          }
        });
      }
      view.unmount();
    }
  });
});
