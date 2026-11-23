import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {ELEMENTARY_SCENES} from '../src/motion/elementary/index.ts';
import {renderMotionScene} from '../src/motion/types.ts';
import {TOPICS} from '../src/math.ts';
import App from '../src/App.tsx';

afterEach(()=>{cleanup();localStorage.clear();});

describe('elementary motion explainers',()=>{
  it('all 83 elementary concepts have 2-3 valid animated scenes with captions',()=>{
    expect(TOPICS.length).toBe(83);
    for(const topic of TOPICS){
      const scenes=ELEMENTARY_SCENES[topic];
      expect(scenes,topic).toBeTruthy();
      expect(scenes!.length,topic).toBeGreaterThanOrEqual(2);
      expect(scenes!.length,topic).toBeLessThanOrEqual(3);
      for(const scene of scenes!){
        const svg=renderMotionScene(scene);
        expect(svg,topic).not.toMatch(/undefined|NaN|Infinity|\[object/);
        expect(scene.cap.length,topic).toBeGreaterThan(20);
        const doc=new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`,'image/svg+xml');
        expect(doc.querySelector('parsererror'),topic).toBeNull();
      }
    }
  });
  it('shows in the concept step below the lab, follows the selected concept and hides while solving',()=>{
    render(<App initialGrade={5}/>);
    const player=()=>document.querySelector('.mm-player--elementary');
    expect(player()).toBeTruthy();
    expect(player()!.previousElementSibling?.className).toBe('workspace');
    fireEvent.click(screen.getByRole('button',{name:/문제 도전하기/}));
    expect(player()).toBeNull();
  });
});
