import {useEffect,useMemo,useState} from 'react';
import MiddleLab from './MiddleLab.tsx';
import {middleGrades,middleUnits,type MiddleChapter} from './curriculum.ts';
import {createMiddleProblem,type MiddleProblem} from './problems.ts';
import './middle.css';

type Grade=1|2|3;
type Phase=0|1;
const STORAGE_KEY='mathgenius.middle.completed.v1';
function loadCompleted():string[]{
  try{
    const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    return Array.isArray(data)?data.filter((value):value is string=>
      typeof value==='string' && /^m[123]-[12]-[1-9]\d?$/.test(value)):[];
  }catch{return [];}
}
function chooseChapter(grade:Grade,semester:1|2):MiddleChapter{
  const found=middleUnits.find(u=>u.grade===grade&&u.semester===semester);
  if(!found)throw new Error('Middle grade lesson not found');
  return found;
}
export default function MiddleApp({initialGrade=1,onElementary}:{
  initialGrade?:Grade;onElementary:()=>void;
}){
  const [grade,setGrade]=useState<Grade>(initialGrade);
  const [semester,setSemester]=useState<1|2>(1);
  const [chapter,setChapter]=useState<MiddleChapter>(()=>chooseChapter(initialGrade,1));
  const [phase,setPhase]=useState<Phase>(0);
  const [question,setQuestion]=useState<MiddleProblem>(()=>createMiddleProblem(chapter.topic));
  const [selected,setSelected]=useState<string|null>(null);
  const [showHint,setShowHint]=useState(false);
  const [completed,setCompleted]=useState<string[]>(loadCompleted);
  const units=useMemo(()=>middleGrades.find(g=>g.grade===grade)!.chapters
    .filter(u=>u.semester===semester),[grade,semester]);
  const done=useMemo(()=>middleGrades.map(g=>({
    grade:g.grade,
    completed:g.chapters.filter(c=>completed.includes(c.id)).length,
    total:g.chapters.length,
  })),[completed]);
  const chapterIndex=units.findIndex(c=>c.id===chapter.id);
  const correct=selected===question.answer;
  const result=selected!==null;
  useEffect(()=>{document.title='중'+grade+' 수학 · '+chapter.title+' | 수학천재 무료판';},[grade,chapter.title]);

  function selectChapter(next:MiddleChapter){
    setGrade(next.grade);setSemester(next.semester);setChapter(next);
    setPhase(0);setQuestion(createMiddleProblem(next.topic));setSelected(null);setShowHint(false);
  }
  function selectGrade(next:Grade){
    selectChapter(chooseChapter(next,1));
    const url=new URL(window.location.href);
    url.searchParams.set('level','middle');
    url.searchParams.set('grade',String(next));
    window.history.replaceState({},'',url.pathname+url.search);
  }
  function selectSemester(next:1|2){
    selectChapter(chooseChapter(grade,next));
  }
  function openNext(){
    if(chapterIndex<units.length-1){selectChapter(units[chapterIndex+1]);return;}
    const nextSemester=semester===1?2:1;
    if(semester===1){selectSemester(2);return;}
    if(grade<3){selectGrade((grade+1) as Grade);return;}
    selectGrade(1);
  }
  function selectAnswer(answer:string){
    if(selected!==null)return;
    setSelected(answer);
    if(answer===question.answer){
      setCompleted(prev=>{
        if(prev.includes(chapter.id))return prev;
        const next=[...prev,chapter.id];
        try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{/* local mode remains usable */}
        return next;
      });
    }
  }
  function regenerate(){
    setQuestion(createMiddleProblem(chapter.topic));
    setSelected(null);setShowHint(false);
  }
  const currentDone=done.find(v=>v.grade===grade)!;
  return <div className="middle-root">
    <header className="middle-site-header">
      <div className="middle-brand"><strong>✦ 수학천재</strong>
        <span>중등 수학 실험실</span><small>FREE · 2022 개정 참고</small>
      </div>
      <button type="button" onClick={onElementary}>← 초등 수학 학습실</button>
    </header>
    <div className="middle-topline">
      <div className="middle-headline">
        <span>중학교 수학 · 직접 탐구</span>
        <h1>중{grade} 수학을 손으로 이해해요.</h1>
        <p>숫자와 도형을 바꿔 보고, 문제로 확인하세요. · 로그인 없이 무료 이용</p>
      </div>
      <div className="middle-grade-select" role="group" aria-label="중학교 학년 선택">
        {([1,2,3] as const).map(g=><button key={g} type="button"
          aria-pressed={grade===g} onClick={()=>selectGrade(g)}>
          중{g}<small>{done.find(v=>v.grade===g)!.completed} / {done.find(v=>v.grade===g)!.total} 완료</small>
        </button>)}
      </div>
    </div>
    <div className="middle-workspace">
      <aside className="middle-sidebar">
        <div className="middle-sidebar-title"><h2>중{grade} 수학 단원</h2>
          <p>완료 {currentDone.completed} / {currentDone.total}</p>
          <div className="middle-progress"><div style={{width:(currentDone.completed/currentDone.total*100)+'%'}}/></div>
        </div>
        <div className="middle-semester-selector" role="group" aria-label="학기 선택">
          {([1,2] as const).map(s=><button type="button" key={s} aria-pressed={semester===s}
            onClick={()=>selectSemester(s)}>{s}학기</button>)}
        </div>
        <nav aria-label="중학교 단원 목록">
          {units.map((unit,i)=><button type="button" key={unit.id}
            className={chapter.id===unit.id?'middle-unit-current':''}
            aria-current={chapter.id===unit.id?'page':undefined} onClick={()=>selectChapter(unit)}>
            <span className="middle-unit-number">{String(i+1).padStart(2,'0')}</span>
            <span><strong>{unit.title}</strong><small>{unit.label}</small></span>
            {completed.includes(unit.id)&&<span className="middle-done" aria-label="완료">✓</span>}
          </button>)}
        </nav>
      </aside>
      <main className="middle-lesson">
        <div className="middle-chapter-top">
          <div><span className="middle-eyebrow">중{grade} · {semester}학기 · {chapter.label}</span>
            <h2>{chapter.title}</h2><p>{chapter.subtitle}</p></div>
          <span className="middle-chapter-icon" aria-hidden="true">{chapter.illustration}</span>
        </div>
        <div className="middle-steps" role="group" aria-label="학습 단계">
          {(['직접 탐구','문제 풀기'] as const).map((name,i)=>
            <button type="button" key={name} aria-current={phase===i?'step':undefined}
              className={phase===i?'middle-step-selected':''}
              onClick={()=>setPhase(i as Phase)}>
              <span>{i+1}</span>{name}</button>)}
        </div>

        {phase===0&&<section className="middle-concept">
          <div className="middle-section-label"><span>STEP 01 · EXPLORE</span>
            <h3>숫자와 도형을 바꿔 보세요</h3></div>
          <MiddleLab key={chapter.id} topic={chapter.topic}/>
          <div className="middle-inquiry"><strong>눈여겨볼 점</strong><p>{chapter.inquiry}</p></div>
          <button type="button" className="middle-next" onClick={()=>setPhase(1)}>
            문제 풀어보기 →</button>
        </section>}
        {phase===1&&<section className="middle-concept middle-quiz">
          <div className="middle-section-label"><span>STEP 02 · PRACTICE</span>
            <h3>문제로 확인해 보세요</h3></div>
          <div className="middle-question">
            <div className="middle-question-badge">연습 문제 · {chapter.title}</div>
            <h3>{question.prompt}</h3>
            <div className="middle-choice-grid">
              {question.choices.map((choice,i)=><button key={choice} type="button"
                disabled={result} aria-pressed={selected===choice}
                className={result&&choice===question.answer?'middle-choice-right':
                  result&&choice===selected?'middle-choice-wrong':''}
                onClick={()=>selectAnswer(choice)}>
                <span>{i+1}</span>{choice}
              </button>)}
            </div>
            {result&&<div role="status" className={'middle-feedback '+(correct?'middle-feedback--right':'middle-feedback--wrong')}>
              <strong>{correct?'🎉 정답입니다!':'다시 생각해 보세요. 정답은 '+question.answer+'입니다.'}</strong>
              <p>{question.solution}</p>
            </div>}
            {!result&&<button type="button" className="middle-hint-toggle"
              onClick={()=>setShowHint(p=>!p)}>{showHint?'힌트 접기':'힌트 보기'}</button>}
            {showHint&&!result&&<p className="middle-hint">{chapter.concept[1]}</p>}
            <div className="middle-quiz-actions">
              <button type="button" onClick={regenerate}>↻ 다른 문제 풀기</button>
              {correct&&<button type="button" className="middle-next" onClick={openNext}>
                다음 단원으로 이동 →</button>}
              {result&&!correct&&<button type="button" onClick={()=>setPhase(0)}>
                다시 탐구하기</button>}
            </div>
          </div>
        </section>}
        <div className="middle-bottom-note">
          학습 진도는 이 브라우저에만 저장됩니다. · 단원 배열은 학교 교과서마다 다를 수 있습니다.
          중3의 2022 개정 과정은 2027학년도부터 적용됩니다.
        </div>
      </main>
    </div>
    <footer className="middle-footer">© {new Date().getFullYear()} 주식회사 라릭 · 수학천재 무료판
      <span>교육부·교육청 공식 서비스 또는 성취평가가 아닙니다.</span></footer>
  </div>;
}
