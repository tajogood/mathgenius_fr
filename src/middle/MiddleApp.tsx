import {useEffect,useMemo,useState} from 'react';
import MiddleLab from './MiddleLab.tsx';
import MotionExplainer from './motion/MotionExplainer.tsx';
import {middleGrades,middleUnits,type MiddleChapter} from './curriculum.ts';
import {createMiddleProblem,type MiddleProblem} from './problems.ts';
import {activityGuide} from './activityGuide.ts';
import {MathLine} from '../components/MathLine.tsx';
import './middle.css';
import {L,tr,isEn} from '../i18n/index.ts';
import LangSwitch from '../i18n/LangSwitch.tsx';

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
export default function MiddleApp({initialGrade=1,onElementary,onHigh}:{
  initialGrade?:Grade;onElementary:()=>void;onHigh?:()=>void;
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
  useEffect(()=>{document.title=L('중'+grade+' 수학 · '+chapter.title+' | 수학천재','Grade '+(grade+6)+' Math · '+tr(chapter.title)+' | MathGenius');},[grade,chapter.title]);

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
      <div className="middle-brand"><strong>{L('✦ 수학천재','✦ MathGenius')}</strong>
        <span>{L('중등 수학 실험실','Middle School Math Lab')}</span><small>{L('2022 개정 참고','Based on Korea\'s 2022 curriculum')}</small>
      </div>
      <div className="middle-level-links">
        <button type="button" onClick={onElementary}>{L('← 초등 수학 학습실','← Elementary math')}</button>
        {onHigh&&<button type="button" onClick={onHigh}>{L('고등 수학 →','High school math →')}</button>}
        <LangSwitch/>
      </div>
    </header>
    <div className="middle-topline">
      <div className="middle-headline">
        <span>{L('중학교 수학 · 직접 탐구','Middle school math · Hands-on')}</span>
        <h1>{L('중'+grade+' 수학을 손으로 이해해요.','Understand Grade '+(grade+6)+' math with your hands.')}</h1>
        <p>{L('숫자와 도형을 바꿔 보고, 문제로 확인하세요. · 로그인 없이 바로 이용','Change the numbers and shapes, then check with problems. · No sign-up needed')}</p>
      </div>
      <div className="middle-grade-select" role="group" aria-label={L('중학교 학년 선택','Choose middle school grade')}>
        {([1,2,3] as const).map(g=><button key={g} type="button"
          aria-pressed={grade===g} onClick={()=>selectGrade(g)}>
          {L('중'+g,'Grade '+(g+6))}<small>{done.find(v=>v.grade===g)!.completed} / {done.find(v=>v.grade===g)!.total} {L('완료','done')}</small>
        </button>)}
      </div>
    </div>
    <div className="middle-workspace">
      <aside className="middle-sidebar">
        <div className="middle-sidebar-title"><h2>{L('중'+grade+' 수학 단원','Grade '+(grade+6)+' units')}</h2>
          <p>{L('완료','Done')} {currentDone.completed} / {currentDone.total}</p>
          <div className="middle-progress"><div style={{width:(currentDone.completed/currentDone.total*100)+'%'}}/></div>
        </div>
        <div className="middle-semester-selector" role="group" aria-label={L('학기 선택','Choose semester')}>
          {([1,2] as const).map(s=><button type="button" key={s} aria-pressed={semester===s}
            onClick={()=>selectSemester(s)}>{L(s+'학기','Semester '+s)}</button>)}
        </div>
        <nav aria-label={L('중학교 단원 목록','Middle school units')}>
          {units.map((unit,i)=><button type="button" key={unit.id}
            className={chapter.id===unit.id?'middle-unit-current':''}
            aria-current={chapter.id===unit.id?'page':undefined} onClick={()=>selectChapter(unit)}>
            <span className="middle-unit-number">{String(i+1).padStart(2,'0')}</span>
            <span><strong>{tr(unit.title)}</strong><small>{tr(unit.label)}</small></span>
            {completed.includes(unit.id)&&<span className="middle-done" aria-label={L('완료','Done')}>✓</span>}
          </button>)}
        </nav>
      </aside>
      <main className="middle-lesson">
        <div className="middle-chapter-top">
          <div><span className="middle-eyebrow">{L('중'+grade+' · '+semester+'학기','Grade '+(grade+6)+' · Semester '+semester)} · {tr(chapter.label)}</span>
            <h2>{tr(chapter.title)}</h2><p><MathLine text={tr(chapter.subtitle)}/></p></div>
          <span className="middle-chapter-icon" aria-hidden="true">{chapter.illustration}</span>
        </div>
        <div className="middle-steps" role="group" aria-label={L('학습 단계','Lesson steps')}>
          {[L('직접 탐구','Explore'),L('문제 풀기','Practice')].map((name,i)=>
            <button type="button" key={name} aria-current={phase===i?'step':undefined}
              className={phase===i?'middle-step-selected':''}
              onClick={()=>setPhase(i as Phase)}>
              <span>{i+1}</span>{name}</button>)}
        </div>

        {phase===0&&<section className="middle-concept">
          <div className="middle-section-label"><span>STEP 01 · EXPLORE</span>
            <h3>{L('직접 탐구','Explore')}</h3></div>
          <div className="middle-activity-cue"><span>{L('오늘 해 볼 일','Try this today')}</span>
            <strong><MathLine text={activityGuide[chapter.topic].action}/></strong></div>
          <MotionExplainer key={`motion-${chapter.id}`} topic={chapter.topic}/>
          <MiddleLab key={chapter.id} topic={chapter.topic}/>
          <div className="middle-inquiry"><strong>{L('관찰할 점','What to notice')}</strong><p><MathLine text={activityGuide[chapter.topic].notice}/></p></div>
          <details className="middle-why"><summary>{L('왜 이런 결과가 나올까요?','Why does this happen?')}</summary>
            <p><MathLine text={activityGuide[chapter.topic].reason}/></p></details>
          <button type="button" className="middle-next" onClick={()=>setPhase(1)}>
            {L('문제 풀어보기 →','Try the problems →')}</button>
        </section>}
        {phase===1&&<section className="middle-concept middle-quiz">
          <div className="middle-section-label"><span>STEP 02 · PRACTICE</span>
            <h3>{L('문제로 확인해 보세요','Check with a problem')}</h3></div>
          <div className="middle-question">
            <div className="middle-question-badge">{L('연습 문제','Practice')} · {tr(chapter.title)}</div>
            <h3><MathLine text={question.prompt}/></h3>
            <div className="middle-choice-grid">
              {question.choices.map((choice,i)=><button key={choice} type="button"
                disabled={result} aria-pressed={selected===choice}
                className={result&&choice===question.answer?'middle-choice-right':
                  result&&choice===selected?'middle-choice-wrong':''}
                onClick={()=>selectAnswer(choice)}>
                <span>{i+1}</span><span className="middle-choice-text"><MathLine text={choice}/></span>
              </button>)}
            </div>
            {result&&<div role="status" className={'middle-feedback '+(correct?'middle-feedback--right':'middle-feedback--wrong')}>
              <strong>{correct?L('🎉 정답입니다!','🎉 Correct!'):!isEn()?<>다시 생각해 보세요. 정답은 <MathLine text={question.answer}/>입니다.</>:<>Not quite. The answer is <MathLine text={question.answer}/>.</>}</strong>
              <p><MathLine text={question.solution}/></p>
            </div>}
            {!result&&<button type="button" className="middle-hint-toggle"
              onClick={()=>setShowHint(p=>!p)}>{showHint?L('힌트 접기','Hide hint'):L('힌트 보기','Show hint')}</button>}
            {showHint&&!result&&<p className="middle-hint"><MathLine text={chapter.concept[1]}/></p>}
            <div className="middle-quiz-actions">
              <button type="button" onClick={regenerate}>{L('↻ 다른 문제 풀기','↻ Another problem')}</button>
              {correct&&<button type="button" className="middle-next" onClick={openNext}>
                {L('다음 단원으로 이동 →','Go to the next unit →')}</button>}
              {result&&!correct&&<button type="button" onClick={()=>setPhase(0)}>
                {L('다시 탐구하기','Explore again')}</button>}
            </div>
          </div>
        </section>}
        <div className="middle-bottom-note">
          {L('학습 진도는 이 브라우저에만 저장됩니다. · 단원 배열은 학교 교과서마다 다를 수 있습니다. 중3의 2022 개정 과정은 2027학년도부터 적용됩니다.',
            'Progress is saved only in this browser. · Units follow the Korean curriculum, so the order may differ from your school\'s.')}
        </div>
      </main>
    </div>
    <footer className="middle-footer">© {new Date().getFullYear()} {L('주식회사 라릭 · 수학천재','Larix Inc. · MathGenius')}
      <span>{L('교육부·교육청 공식 서비스 또는 성취평가가 아닙니다.','Not an official Ministry of Education service or assessment.')}</span></footer>
  </div>;
}
