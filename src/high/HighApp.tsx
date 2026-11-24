import {useEffect,useMemo,useState} from 'react';
import HighLab from './HighLab.tsx';
import {highCourses,type HighChapter,type HighCourseId} from './curriculum.ts';
import {createHighProblem,type HighProblem} from './problems.ts';
import {MathLine,mathPlain} from '../components/MathLine.tsx';
import '../middle/middle.css';
import './high.css';

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
  useEffect(()=>{document.title=course.name+' · '+mathPlain(chapter.title)+' | 수학천재';},[course.name,chapter.title]);

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
      <div className="middle-brand"><strong>✦ 수학천재</strong>
        <span>고등 수학 실험실</span><small>2022 개정 참고</small>
      </div>
      <div className="high-level-links">
        <button type="button" onClick={onElementary}>초등 수학</button>
        <button type="button" onClick={onMiddle}>중등 수학</button>
      </div>
    </header>
    <div className="middle-topline">
      <div className="middle-headline">
        <span>고등학교 수학 · 직접 탐구</span>
        <h1>{course.name}, 그래프로 먼저 이해해요.</h1>
        <p>값을 바꿔 보며 원리를 확인하고 문제로 점검하세요. · 로그인 없이 바로 이용</p>
      </div>
      <div className="middle-grade-select high-course-select" role="group" aria-label="고등학교 과목 선택">
        {highCourses.map(c=><button key={c.id} type="button" aria-pressed={courseId===c.id} onClick={()=>selectCourse(c.id)}>
          {c.name}<small>{c.level} · {doneOf(c.id)} / {c.chapters.length} 완료</small>
        </button>)}
      </div>
    </div>
    <div className="middle-workspace">
      <aside className="middle-sidebar">
        <div className="middle-sidebar-title"><h2>{course.name} 단원</h2>
          <p>{course.kind} 과목 · 완료 {done} / {course.chapters.length}</p>
          <div className="middle-progress"><div style={{width:(done/course.chapters.length*100)+'%'}}/></div>
        </div>
        <nav aria-label="고등학교 단원 목록">
          {parts.map(group=><div key={group.part} className="high-part">
            <h3>{group.part}</h3>
            {group.items.map(unit=><button type="button" key={unit.id}
              className={chapter.id===unit.id?'middle-unit-current':''}
              aria-current={chapter.id===unit.id?'page':undefined} onClick={()=>selectChapter(unit)}>
              <span className="middle-unit-number">{String(unit.number).padStart(2,'0')}</span>
              <span><strong>{unit.title}</strong><small>{group.part}</small></span>
              {completed.includes(unit.id)&&<span className="middle-done" aria-label="완료">✓</span>}
            </button>)}
          </div>)}
        </nav>
      </aside>
      <main className="middle-lesson">
        <div className="middle-chapter-top">
          <div><span className="middle-eyebrow">{course.name} · {chapter.part}</span>
            <h2>{chapter.title}</h2><p><MathLine text={chapter.subtitle}/></p></div>
          <span className="middle-chapter-icon" aria-hidden="true">{chapter.illustration}</span>
        </div>
        <div className="middle-steps" role="group" aria-label="학습 단계">
          {(['직접 탐구','문제 풀기'] as const).map((name,i)=>
            <button type="button" key={name} aria-current={phase===i?'step':undefined}
              className={phase===i?'middle-step-selected':''} onClick={()=>setPhase(i as Phase)}>
              <span>{i+1}</span>{name}</button>)}
        </div>
        {phase===0&&<section className="middle-concept">
          <div className="middle-section-label"><span>STEP 01 · EXPLORE</span><h3>직접 탐구</h3></div>
          <ol className="high-concepts" aria-label="핵심 개념">
            {chapter.concept.map((c,i)=><li key={i}><span>{i+1}</span><p><MathLine text={c}/></p></li>)}
          </ol>
          <div className="middle-activity-cue"><span>오늘 해 볼 일</span><strong><MathLine text={chapter.action}/></strong></div>
          <HighLab key={chapter.id} topic={chapter.topic}/>
          <div className="middle-inquiry"><strong>관찰할 점</strong><p><MathLine text={chapter.notice}/></p></div>
          <details className="middle-why"><summary>왜 이런 결과가 나올까요?</summary><p><MathLine text={chapter.reason}/></p></details>
          <button type="button" className="middle-next" onClick={()=>setPhase(1)}>문제 풀어보기 →</button>
        </section>}
        {phase===1&&<section className="middle-concept middle-quiz">
          <div className="middle-section-label"><span>STEP 02 · PRACTICE</span><h3>문제로 확인해 보세요</h3></div>
          <div className="middle-question">
            <div className="middle-question-badge">연습 문제 · {chapter.title}</div>
            <h3><MathLine text={question.prompt}/></h3>
            <div className="middle-choice-grid">
              {question.choices.map((choice,i)=><button key={choice} type="button" disabled={result}
                aria-pressed={selected===choice}
                className={result&&choice===question.answer?'middle-choice-right':result&&choice===selected?'middle-choice-wrong':''}
                onClick={()=>selectAnswer(choice)}><span>{i+1}</span><span className="middle-choice-text"><MathLine text={choice}/></span></button>)}
            </div>
            {result&&<div role="status" className={'middle-feedback '+(correct?'middle-feedback--right':'middle-feedback--wrong')}>
              <strong>{correct?'🎉 정답입니다!':<>다시 생각해 보세요. 정답은 <MathLine text={question.answer}/>입니다.</>}</strong>
              <p><MathLine text={question.solution}/></p>
            </div>}
            {!result&&<button type="button" className="middle-hint-toggle" onClick={()=>setShowHint(p=>!p)}>{showHint?'힌트 접기':'힌트 보기'}</button>}
            {showHint&&!result&&<p className="middle-hint"><MathLine text={chapter.concept[1]}/></p>}
            <div className="middle-quiz-actions">
              <button type="button" onClick={regenerate}>↻ 다른 문제 풀기</button>
              {correct&&<button type="button" className="middle-next" onClick={openNext}>다음 단원으로 이동 →</button>}
              {result&&!correct&&<button type="button" onClick={()=>setPhase(0)}>다시 탐구하기</button>}
            </div>
          </div>
        </section>}
        <div className="middle-bottom-note">
          학습 진도는 이 브라우저에만 저장됩니다. · 2022 개정 고등학교 교육과정은 2025학년도 고1부터 적용되며, 단원 배열은 교과서마다 다를 수 있습니다.
        </div>
      </main>
    </div>
    <footer className="middle-footer">© {new Date().getFullYear()} 주식회사 라릭 · 수학천재
      <span>교육부·교육청 공식 서비스 또는 성취평가가 아닙니다.</span></footer>
  </div>;
}
