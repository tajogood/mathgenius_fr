import {describe,expect,it} from 'vitest';
import {mathTokens,fractionHtml} from '../src/motion/mathTokens.ts';

const fracs=(s:string)=>mathTokens(s).filter(t=>t.t==='frac').map(t=>t.t==='frac'?`${t.n}|${t.d}`:'');
describe('분수 표기 인식 (분자 위·분모 아래로 쌓기 위해)',()=>{
  it('숫자·대분수·괄호·근호·한글 낱말 분수를 찾는다',()=>{
    expect(fracs('2/3 + 1/2 = 7/6 = 1⅙')).toEqual(['2|3','1|2','7|6','1|6']);
    expect(fracs('20 × 2/(2+3) = 8')).toEqual(['2|2+3']);
    expect(fracs('tan 30° = 1/√3, cos 30° = √3/2')).toEqual(['1|√3','√3|2']);
    expect(fracs('sin A = 높이/빗변')).toEqual(['높이|빗변']);
    expect(fracs('기울기 = (y 증가량)/(x 증가량)')).toEqual(['y 증가량|x 증가량']);
    expect(fracs('P(빨강) = 2 / 5, y = 12 / x')).toEqual(['2|5','12|x']);
  });
  it('문장 속 빗금이나 분수가 아닌 글은 건드리지 않는다',()=>{
    expect(fracs('조사한 자료를 / 표시로 세요')).toEqual([]);
    expect(fracs('3 + 4 × 2 = 11, 2.4 ÷ 0.6 = 4')).toEqual([]);
  });
  it('HTML 설명 문장의 태그는 유지하고 분수만 쌓아 쓴다',()=>{
    const h=fractionHtml('답은 <strong>3/4</strong>이에요');
    expect(h).toContain('<strong><span class="math-fraction"');
    expect(h).toContain('math-fraction__top" aria-hidden="true">3<');
    expect(h).toContain('math-fraction__bottom" aria-hidden="true">4<');
    expect(h).not.toMatch(/3\/4/);
  });
});

import {ELEMENTARY_SCENES} from '../src/motion/elementary/index.ts';
import {MOTION_SCENES} from '../src/middle/motion/index.ts';
import {renderMotionScene} from '../src/motion/types.ts';
describe('애니메이션 117개 개념의 그림·설명에는 빗금 분수(3/4)가 화면에 나오지 않는다',()=>{
  it('초등 83개 + 중등 34개 전 장면',()=>{
    const all=[...Object.entries(ELEMENTARY_SCENES),...Object.entries(MOTION_SCENES)];
    expect(all.length).toBe(117);
    const slashFrac=/(\d|[가-힣)])\s*\/\s*(\d|[가-힣(√a-z])/;
    for(const [topic,scenes] of all) for(const sc of scenes!){
      const doc=new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${renderMotionScene(sc)}</svg>`,'image/svg+xml');
      for(const t of doc.querySelectorAll('text')) expect(t.textContent,topic).not.toMatch(slashFrac);
      const cap=document.createElement('p');cap.innerHTML=fractionHtml(sc.cap);
      expect(cap.textContent,topic).not.toMatch(/\d\s*\/\s*\d|[⅓⅔¼¾⅕⅙⅛½]/);
    }
  });
});
