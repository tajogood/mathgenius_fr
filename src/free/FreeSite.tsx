import {useEffect,useState} from 'react';
import App from '../App.tsx';
import MiddleApp from '../middle/MiddleApp.tsx';
import HighApp from '../high/HighApp.tsx';
import {HIGH_COURSE_IDS,type HighCourseId} from '../high/curriculum.ts';
import './level-switch.css';
import LangSwitch,{TranslationNotice} from '../i18n/LangSwitch.tsx';
import {L} from '../i18n/index.ts';

// Elementary curriculum and its App component are intentionally untouched.
// Middle- and high-school modes have independent, browser-only lesson engines.
type Mode={level:'elementary';grade:number}|{level:'middle';grade:1|2|3}|{level:'high';course:HighCourseId};
function readMode():Mode{
  const params=new URLSearchParams(window.location.search);
  if(params.get('level')==='high'){
    const c=params.get('course') as HighCourseId|null;
    return {level:'high',course:c&&HIGH_COURSE_IDS.includes(c)?c:'c1'};
  }
  if(params.get('level')==='middle'){
    const n=Number(params.get('grade'));
    return {level:'middle',grade:(n>=1&&n<=3&&Number.isInteger(n)?n:1) as 1|2|3};
  }
  const n=Number(params.get('grade'));
  return {level:'elementary',grade:Number.isInteger(n)&&n>=1&&n<=6?n:5};
}
function go(params:Record<string,string|null>){
  const url=new URL(window.location.href);
  for(const k of ['guest','level','grade','course'])url.searchParams.delete(k);
  for(const [k,v] of Object.entries(params))if(v!==null)url.searchParams.set(k,v);
  window.history.pushState({},'',url.pathname+url.search);
  window.scrollTo?.({top:0,behavior:'auto'});
}
export default function FreeSite(){
  const [mode,setMode]=useState<Mode>(readMode);
  useEffect(()=>{
    const pop=()=>setMode(readMode());
    window.addEventListener('popstate',pop);
    return ()=>window.removeEventListener('popstate',pop);
  },[]);
  const openMiddle=(grade:1|2|3)=>{go({level:'middle',grade:String(grade)});setMode({level:'middle',grade});};
  const openHigh=(course:HighCourseId='c1')=>{go({level:'high',course});setMode({level:'high',course});};
  const openElementary=()=>{go({});setMode({level:'elementary',grade:5});};
  if(mode.level==='high')return <><TranslationNotice/><HighApp key={'high'+mode.course} initialCourse={mode.course}
    onElementary={openElementary} onMiddle={()=>openMiddle(1)}/></>;
  if(mode.level==='middle')return <><TranslationNotice/><MiddleApp key={'middle'+mode.grade}
    initialGrade={mode.grade} onElementary={openElementary} onHigh={()=>openHigh('c1')}/></>;
  return <div className="free-grade-portal">
    <nav className="free-level-nav" aria-label={L('학교급 선택','Choose school level')}>
      <strong>{L('✦ 수학천재','✦ MathGenius')}</strong>
      <span className="free-current-level">{L('초등 1~6학년','Elementary · Grades 1–6')}</span>
      <span className="free-level-intro">{L('중·고등 수학도 숫자와 그래프를 바꿔 보세요.','Middle and high school math too: change the numbers and watch the graphs move.')}</span>
      <div role="group" aria-label={L('중학교 수학 선택','Choose middle school math')}>
        {([1,2,3] as const).map(grade=><button type="button" key={grade}
          onClick={()=>openMiddle(grade)}>{L('중'+grade+' 수학 →','Grade '+(grade+6)+' →')}</button>)}
      </div>
      <div role="group" aria-label={L('고등학교 수학 선택','Choose high school math')}>
        <button type="button" className="free-high-button" onClick={()=>openHigh('c1')}>{L('고등 수학 →','High School →')}</button>
      </div>
      <LangSwitch/>
    </nav>
    <App initialGrade={mode.grade}/>
  </div>;
}
