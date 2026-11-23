import {afterEach,describe,expect,it} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import MotionExplainer from '../src/middle/motion/MotionExplainer.tsx';
import {MOTION_SCENES,renderMotionScene} from '../src/middle/motion/index.ts';
import {MIDDLE_TOPICS} from '../src/middle/curriculum.ts';
import MiddleApp from '../src/middle/MiddleApp.tsx';

afterEach(()=>{cleanup();window.history.replaceState({},'','/');localStorage.clear();});

describe('middle school motion explainers',()=>{
  it('every one of the 34 topics has 2-4 animated scenes with valid SVG and a caption',()=>{
    expect(MIDDLE_TOPICS.length).toBe(34);
    for(const topic of MIDDLE_TOPICS){
      const scenes=MOTION_SCENES[topic];
      expect(scenes,topic).toBeTruthy();
      expect(scenes.length,topic).toBeGreaterThanOrEqual(2);
      expect(scenes.length,topic).toBeLessThanOrEqual(4);
      for(const scene of scenes){
        const svg=renderMotionScene(scene);
        expect(svg.length,topic).toBeGreaterThan(100);
        expect(svg,topic).not.toMatch(/undefined|NaN|Infinity/);
        expect(scene.cap.length,topic).toBeGreaterThan(20);
        expect(scene.dur,topic).toBeGreaterThan(3);
        const doc=new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`,'image/svg+xml');
        expect(doc.querySelector('parsererror'),topic).toBeNull();
      }
    }
  });
  it('scene tabs and next/previous controls change the explanation',()=>{
    render(<MotionExplainer topic="equations"/>);
    const player=screen.getByRole('region',{name:'움직이는 개념 설명'});
    expect(player.querySelector('.mm-caption b')?.textContent).toBe('1 / 3');
    fireEvent.click(screen.getByRole('button',{name:/다음/}));
    expect(player.querySelector('.mm-caption b')?.textContent).toBe('2 / 3');
    expect(player.querySelector('.mm-caption')?.textContent).toMatch(/양쪽에서 똑같이/);
    expect(player.querySelector('svg.mm-stage')?.getAttribute('aria-hidden')).toBe('true');
    fireEvent.click(screen.getByRole('tab',{name:'장면 3'}));
    expect(screen.getByRole('tab',{name:'장면 3'}).getAttribute('aria-selected')).toBe('true');
    expect((screen.getByRole('button',{name:/다음/}) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button',{name:/이전/}));
    expect(player.querySelector('.mm-caption b')?.textContent).toBe('2 / 3');
  });
  it('appears in the explore step right after the activity cue and leaves during practice',()=>{
    render(<MiddleApp initialGrade={1} onElementary={()=>{}}/>);
    const player=document.querySelector('.middle-concept > .mm-player');
    expect(player?.getAttribute('data-topic')).toBe('primes');
    expect(player?.previousElementSibling?.className).toBe('middle-activity-cue');
    fireEvent.click(screen.getByRole('button',{name:/문제 풀어보기/}));
    expect(document.querySelector('.mm-player')).toBeNull();
  });
});
