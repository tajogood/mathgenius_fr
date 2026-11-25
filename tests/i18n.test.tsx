import {describe,it,expect,beforeEach,vi} from 'vitest';
import {render,screen,cleanup} from '@testing-library/react';

async function freshI18n(){
  vi.resetModules();
  return import('../src/i18n/index.ts');
}
function setNavigator(languages:string[],ua='Mozilla/5.0',webdriver=false){
  Object.defineProperty(window.navigator,'languages',{value:languages,configurable:true});
  Object.defineProperty(window.navigator,'language',{value:languages[0],configurable:true});
  Object.defineProperty(window.navigator,'userAgent',{value:ua,configurable:true});
  Object.defineProperty(window.navigator,'webdriver',{value:webdriver,configurable:true});
}

describe('site language detection',()=>{
  beforeEach(()=>{
    cleanup();
    window.localStorage.clear();
    window.history.replaceState({},'','/');
  });
  it('uses English for non-Korean browsers and Korean for Korean browsers',async()=>{
    setNavigator(['en-US','en']);
    expect((await freshI18n()).detectLang()).toBe('en');
    setNavigator(['ko-KR','en-US']);
    expect((await freshI18n()).detectLang()).toBe('ko');
  });
  it('keeps crawlers and automated browsers on Korean',async()=>{
    setNavigator(['en-US'],'Mozilla/5.0 (compatible; Googlebot/2.1)');
    expect((await freshI18n()).detectLang()).toBe('ko');
    setNavigator(['en-US'],'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)');
    expect((await freshI18n()).detectLang()).toBe('ko');
    setNavigator(['en-US'],'Mozilla/5.0',true);
    expect((await freshI18n()).detectLang()).toBe('ko');
  });
  it('lets ?lang= and the saved choice override the browser',async()=>{
    setNavigator(['ko-KR']);
    window.history.replaceState({},'','/?lang=en');
    expect((await freshI18n()).detectLang()).toBe('en');
    window.history.replaceState({},'','/');
    expect((await freshI18n()).detectLang()).toBe('en'); // remembered
    window.localStorage.setItem('mathgenius.lang.v1','ko');
    setNavigator(['en-US']);
    expect((await freshI18n()).detectLang()).toBe('ko');
  });
  it('translates known strings and falls back to Korean',async()=>{
    window.localStorage.setItem('mathgenius.lang.v1','en');
    const i18n=await freshI18n();
    expect(i18n.tr('분수의 덧셈과 뺄셈')).toBe('Adding and Subtracting Fractions');
    expect(i18n.tr('아직 번역되지 않은 문장')).toBe('아직 번역되지 않은 문장');
    expect(document.documentElement.lang).toBe('en');
  });
});

describe('English interface',()=>{
  beforeEach(()=>{cleanup();window.history.replaceState({},'','/?guest=1&grade=5');});
  it('shows the elementary app shell in English',async()=>{
    window.localStorage.setItem('mathgenius.lang.v1','en');
    vi.resetModules();
    const {default:FreeSite}=await import('../src/free/FreeSite.tsx');
    render(<FreeSite/>);
    expect(screen.getByText('My Classroom')).toBeTruthy();
    expect(screen.getByRole('button',{name:'English'}).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button',{name:'High School →'})).toBeTruthy();
    expect(screen.getAllByText('Learn the idea').length).toBeGreaterThan(0);
  });
  it('every curriculum title and description has an English entry',async()=>{
    const {EN}=await import('../src/i18n/en.ts');
    const {curriculumUnits,grades}=await import('../src/curriculum.ts');
    const {middleUnits}=await import('../src/middle/curriculum.ts');
    const {highCourses}=await import('../src/high/curriculum.ts');
    const needed=[
      ...curriculumUnits.flatMap(u=>[u.title,u.subtitle,u.label]),...grades.map(g=>g.title),
      ...middleUnits.flatMap(u=>[u.title,u.subtitle,u.label]),
      ...highCourses.flatMap(c=>[c.name,c.level,c.kind,...c.chapters.flatMap(u=>[u.part,u.title,u.subtitle])]),
    ];
    expect([...new Set(needed)].filter(k=>!(k in EN))).toEqual([]);
  });
});
