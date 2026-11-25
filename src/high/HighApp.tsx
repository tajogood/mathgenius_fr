import {useEffect,useMemo,useState} from 'react';
import HighLab from './HighLab.tsx';
import {highCourses,type HighChapter,type HighCourseId} from './curriculum.ts';
import {createHighProblem,type HighProblem} from './problems.ts';
import {MathLine,mathPlain} from '../components/MathLine.tsx';
import '../middle/middle.css';
import './high.css';
import {L,tr,isEn} from '../i18n/index.ts';
import LangSwitch from '../i18n/LangSwitch.tsx';

type Phase=0|1;
const STORAGE_KEY='mathgenius.high.completed.v1';
function loadCompleted():string[]{
  try{
    const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    return Array.isArray(data)?data.filter((v):v is string=>typeof v==='string'&&/^h-(c1|c2|alg|calc|stat)-\d{1,2}$/.test(v)):[];
  }catch{return [];}
}
const courseOf=(id:HighCourseId)=>highCourses.find(c=>c.id===id)!;

export default function HighApp({initialCourse='c1',onElementary,onMiddle}:{
  initialCourse?:HighCourseId;onElementary:()=>void;onMiddle:()=>void;
}){
  const [courseId,setCourseId]=useState<HighCourseId>(initialCourse);
  const course=courseOf(courseId);
  const [chapter,setChapter]=useState<HighChapter>(()=>courseOf(initialCourse).chapters[0]);
  const [phase,setPhase]=useState<Phase>(0);
  const [question,setQuestion]=useState<HighProblem>(()=>createHighProblem(courseOf(initialCourse).chapters[0].topic));
  const [selected,setSelected]=useState<string|null>(null);
  const [showHint,setShowHint]=useState(false);
  const [completed,setCompleted]=useState<string[]>(loadCompleted);
  const parts=useMemo(()=>{
    const out:{part:string;items:HighChapter[]}[]=[];
    for(const c of course.chapters){
      const last=out.at(-1);
      if(last&&last.part===c.part)last.items.push(c);else out.push({part:c.part,items:[c]});
    }
    return out;
  },[course]);
  const doneOf=(id:HighCourseId)=>courseOf(id).chapters.filter(c=>completed.includes(c.id)).length;
  const index=course.chapters.findIndex(c=>c.id===chapter.id);
  const correct=selected===question.answer,result=selected!==null;
  useEffect(()=>{document.title=tr(course.name)+' · '+mathPlain(tr(chapter.title))+L(' | 수학천재',' | MathGenius');},[course.name,chapter.title]);

  function selectChapter(next:HighChapter){
    setChapter(next);setPhase(0);setQuestion(createHighProblem(next.topic));setSelected(null);setShowHint(false);
  }
  function selectCourse(id:HighCourseId){
    setCourseId(id);selectChapter(courseOf(id).chapters[0]);
    const url=new URL(window.location.href);
    url.searchParams.set('level','high');url.searchParams.set('course',id);url.searchParams.delete('grade');
    window.history.replaceState({},'',url.pathname+url.search);
  }
  function openNext(){
    if(index<course.chapters.length-1){selectChapter(course.chapters[index+1]);return;}
    const ids=highCourses.map(c=>c.id),k=ids.indexOf(courseId);
    selectCourse(ids[(k+1)%ids.length]);
  }
  function selectAnswer(answer:string){
    if(selected!==null)return;
    setSelected(answer);
    if(answer===question.answer){
      setCompleted(prev=>{
        if(prev.includes(chapter.id))return prev;
        const next=[...prev,chapter.id];
        try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{/* 저장소를 쓸 수 없어도 학습은 계속 */}
        return next;
      });
    }
  }
  function regenerate(){setQuestion(createHighProblem(chapter.topic));setSelected(null);setShowHint(false);}
  const done=doneOf(courseId);
  return <div className="middle-root high-root">
    <header className="middle-site-header">
      <div className="middle-brand"><strong>{L('✦ 수학천재','✦ MathGenius')}</strong>
        <span>{L('고등 수학 실험실','High School Math Lab')}</span><small>{L('2022 개정 참고','Based on Korea\'s 2022 curriculum')}</small>
      </div>
      <div className="high-level-links">
        <button type="button" onClick={onElementary}>{L('초등 수학','Elementary')}</button>
        <button type="button" onClick={onMiddle}>{L('중등 수학','Middle school')}</button>
        <LangSwitch/>
      </div>
    </header>
    <div className="middle-topline">
      <div className="middle-headline">
        <span>{L('고등학교 수학 · 직접 탐구','High school math · Hands-on')}</span>
        <h1>{isEn()?tr(course.name)+': see it in a graph first.':course.name+', 그래프로 먼저 이해해요.'}</h1>
        <p>{L('값을 바꿔 보며 원리를 확인하고 문제로 점검하세요. · 로그인 없이 바로 이용','Change the values to see why it works, then check with problems. · No sign-up needed')}</p>
      </div>
      <div className="middle-grade-select high-course-select" role="group" aria-label={L('고등학교 과목 선택','Choose high school course')}>
        {highCourses.map(c=><button key={c.id} type="button" aria-pressed={courseId===c.id} onClick={()=>selectCourse(c.id)}>
          {tr(c.name)}<small>{tr(c.level)} · {doneOf(c.id)} / {c.chapters.length} {L('완료','done')}</small>
        </button>)}
      </div>
    </div>
    <div className="middle-workspace">
      <aside className="middle-sidebar">
        <div className="middle-sidebar-title"><h2>{isEn()?tr(course.name)+' units':course.name+' 단원'}</h2>
          <p>{isEn()?tr(course.kind)+' course · Done '+done+' / '+course.chapters.length:course.kind+' 과목 · 완료 '+done+' / '+course.chapters.length}</p>
          <div className="middle-progress"><div style={{width:(done/course.chapters.length*100)+'%'}}/></div>
        </div>
        <nav aria-label={L('고등학교 단원 목록','High school units')}>
          {parts.map(group=><div key={group.part} className="high-part">
            <h3>{tr(group.part)}</h3>
            {group.items.map(unit=><button type="button" key={unit.id}
              className={chapter.id===unit.id?'middle-unit-current':''}
              aria-current={chapter.id===unit.id?'page':undefined} onClick={()=>selectChapter(unit)}>
              <span className="middle-unit-number">{String(unit.number).padStart(2,'0')}</span>
              <span><strong>{tr(unit.title)}</strong><small>{tr(group.part)}</small></span>
              {completed.includes(unit.id)&&<span className="middle-done" aria-label={L('완료','Done')}>✓</span>}
            </button>)}
          </div>)}
        </nav>
      </aside>
      <main className="middle-lesson">
        <div className="middle-chapter-top">
          <div><span className="middle-eyebrow">{tr(course.name)} · {tr(chapter.part)}</span>
            <h2>{tr(chapter.title)}</h2><p><MathLine text={tr(chapter.subtitle)}/></p></div>
          <span className="middle-chapter-icon" aria-hidden="true">{chapter.illustration}</span>
        </div>
        <div className="middle-steps" role="group" aria-label={L('학습 단계','Lesson steps')}>
          {[L('직접 탐구','Explore'),L('문제 풀기','Practice')].map((name,i)=>
            <button type="button" key={name} aria-current={phase===i?'step':undefined}
              className={phase===i?'middle-step-selected':''} onClick={()=>setPhase(i as Phase)}>
              <span>{i+1}</span>{name}</button>)}
        </div>
        {phase===0&&<section className="middle-concept">
          <div className="middle-section-label"><span>STEP 01 · EXPLORE</span><h3>{L('직접 탐구','Explore')}</h3></div>
          <ol className="high-concepts" aria-label={L('핵심 개념','Key ideas')}>
            {chapter.concept.map((c,i)=><li key={i}><span>{i+1}</span><p><MathLine text={c}/></p></li>)}
          </ol>
          <div className="middle-activity-cue"><span>{L('오늘 해 볼 일','Try this today')}</span><strong><MathLine text={chapter.action}/></strong></div>
          <HighLab key={chapter.id} topic={chapter.topic}/>
          <div className="middle-inquiry"><strong>{L('관찰할 점','What to notice')}</strong><p><MathLine text={chapter.notice}/></p></div>
          <details className="middle-why"><summary>{L('왜 이런 결과가 나올까요?','Why does this happen?')}</summary><p><MathLine text={chapter.reason}/></p></details>
          <button type="button" className="middle-next" onClick={()=>setPhase(1)}>{L('문제 풀어보기 →','Try the problems →')}</button>
        </section>}
        {phase===1&&<section className="middle-concept middle-quiz">
          <div className="middle-section-label"><span>STEP 02 · PRACTICE</span><h3>{L('문제로 확인해 보세요','Check with a problem')}</h3></div>
          <div className="middle-question">
            <div className="middle-question-badge">{L('연습 문제','Practice')} · {tr(chapter.title)}</div>
            <h3><MathLine text={question.prompt}/></h3>
            <div className="middle-choice-grid">
              {question.choices.map((choice,i)=><button key={choice} type="button" disabled={result}
                aria-pressed={selected===choice}
                className={result&&choice===question.answer?'middle-choice-right':result&&choice===selected?'middle-choice-wrong':''}
                onClick={()=>selectAnswer(choice)}><span>{i+1}</span><span className="middle-choice-text"><MathLine text={choice}/></span></button>)}
            </div>
            {result&&<div role="status" className={'middle-feedback '+(correct?'middle-feedback--right':'middle-feedback--wrong')}>
              <strong>{correct?L('🎉 정답입니다!','🎉 Correct!'):!isEn()?<>다시 생각해 보세요. 정답은 <MathLine text={question.answer}/>입니다.</>:<>Not quite. The answer is <MathLine text={question.answer}/>.</>}</strong>
              <p><MathLine text={question.solution}/></p>
            </div>}
            {!result&&<button type="button" className="middle-hint-toggle" onClick={()=>setShowHint(p=>!p)}>{showHint?L('힌트 접기','Hide hint'):L('힌트 보기','Show hint')}</button>}
            {showHint&&!result&&<p className="middle-hint"><MathLine text={chapter.concept[1]}/></p>}
            <div className="middle-quiz-actions">
              <button type="button" onClick={regenerate}>{L('↻ 다른 문제 풀기','↻ Another problem')}</button>
              {correct&&<button type="button" className="middle-next" onClick={openNext}>{L('다음 단원으로 이동 →','Go to the next unit →')}</button>}
              {result&&!correct&&<button type="button" onClick={()=>setPhase(0)}>{L('다시 탐구하기','Explore again')}</button>}
            </div>
          </div>
        </section>}
        <div className="middle-bottom-note">
          {L('학습 진도는 이 브라우저에만 저장됩니다. · 2022 개정 고등학교 교육과정은 2025학년도 고1부터 적용되며, 단원 배열은 교과서마다 다를 수 있습니다.',
            'Progress is saved only in this browser. · Courses follow the Korean high school curriculum, so the order may differ from your school\'s.')}
        </div>
      </main>
    </div>
    <footer className="middle-footer">© {new Date().getFullYear()} {L('주식회사 라릭 · 수학천재','Larix Inc. · MathGenius')}
      <span>{L('교육부·교육청 공식 서비스 또는 성취평가가 아닙니다.','Not an official Ministry of Education service or assessment.')}</span></footer>
  </div>;
}
