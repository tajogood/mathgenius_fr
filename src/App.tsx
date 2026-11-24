import { useEffect, useRef, useState } from 'react';
import { grades, curriculumUnits, TOTAL_UNITS, type Chapter } from './curriculum';
import { standardsForChapter } from './standards';
import { createProblem, solutionSteps, TOPICS, type Problem, type Topic } from './math';
import Visuals from './components/Visuals';
import { Fraction, MathText } from './components/MathText.tsx';
import StandardStudio from './components/StandardStudio.tsx';
import MotionPlayer from './motion/MotionPlayer.tsx';
import {ELEMENTARY_SCENES} from './motion/elementary/index.ts';
import { parseProgress, recordAnswer, unitMastery, masteryCount, nextPracticeTopic, type LearningProgress } from './progress.ts';
import { diagnosticHint, conceptTipForTopic } from './feedback.ts';
import { TOPIC_CHALLENGES } from './interactions.ts';

import type { StudyEvent } from './types.ts';
import type { StandardProgress } from './standards/progress.ts';

type Phase = 'concept' | 'question' | 'solution';
export type AppProps = {
  initialGrade?: number;
  initialUnitId?: string;
  initialProgress?: LearningProgress;
  initialStandardProgress?: StandardProgress;
  onProgressChange?: (next: LearningProgress) => void;
  onStandardProgressChange?: (next: StandardProgress) => void;
  onLearningEvent?: (event: StudyEvent) => void;
  cloudMode?: boolean;
};
const storageKey = 'mathgenius-progress-v1';

function readProgress(): LearningProgress {
  try {
    return parseProgress(JSON.parse(window.localStorage.getItem(storageKey) || 'null'));
  } catch {
    return parseProgress(null);
  }
}

const phaseLabels: Record<Phase, string> = {
  concept: '개념 이해하기',
  question: '문제 도전하기',
  solution: '풀이 확인하기',
};
const topicIcons: Partial<Record<Topic, string>> = {
  split: '🍎', addsub: '➕', shapes: '🔺',
  carry: '🧩', multiply: '✖️', clock: '🕒',
  divide: '🍬', fractionintro: '🍕', lengthtime: '📏',
  angles: '📐', transform: '🔄', decimaladd: '🔢',
  fraction: '🍰', reduce: '🧮', area: '🟦',
  ratio: '🔵', proportion: '⚖️', volume: '🧊',
};

export default function App({initialGrade=5,initialUnitId,initialProgress,initialStandardProgress,
  onProgressChange,onStandardProgressChange,onLearningEvent,cloudMode=false}:AppProps={}) {
  const initialUnit=curriculumUnits.find(u=>u.id===initialUnitId) ??
    (initialGrade!==5?curriculumUnits.find(u=>u.grade===initialGrade):null) ??
    curriculumUnits.find(u=>u.id==='5-1-5')!;
  const firstTopic=initialUnit.topics[0];
  const [grade, setGrade] = useState(initialUnit.grade);
  const [studioOpen,setStudioOpen] = useState(false);
  const [studioId,setStudioId] = useState('6수01-08');
  const [unitId, setUnitId] = useState(initialUnit.id);
  const [topic, setTopic] = useState<Topic>(firstTopic);
  const [introduced, setIntroduced] = useState<Set<Topic>>(()=>new Set([firstTopic]));
  const [phase, setPhase] = useState<Phase>('concept');
  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => createProblem(firstTopic));
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [progress, setProgress] = useState<LearningProgress>(()=>initialProgress?
    parseProgress(initialProgress):readProgress());
  const lastActivityAt=useRef(Date.now());
  const lastInteractionReportAt=useRef(0);
  const [explored, setExplored] = useState(false);
  const visualWrapRef = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);
  const [scrolledOnce, setScrolledOnce] = useState(false);
  const gradeInfo = grades.find(item => item.grade === grade)!;
  const currentInfo = gradeInfo.chapters.find(item => item.id === unitId) ?? gradeInfo.chapters[0];
  const right = selected === problem.answer;
  const explanations = solutionSteps(problem);
  const completedCount = masteryCount(progress);
  const unitStatus = unitMastery(progress, unitId);
  const topicStatus = progress.records[unitId]?.[topic];
  const unitIndex = curriculumUnits.findIndex(unit => unit.id === unitId);
  const prevUnit = unitIndex > 0 ? curriculumUnits[unitIndex - 1] : null;
  const nextUnit = unitIndex >= 0 && unitIndex < curriculumUnits.length - 1 ? curriculumUnits[unitIndex + 1] : null;
  const conceptGuidance = topic==='shapes' ? [
    '세모·네모·동그라미를 골라 보세요. 도형 안쪽을 직접 끌어 움직이며 생김새를 살펴봐요.',
    '도형의 곧은 변과 주황색 꼭짓점을 하나씩 눌러 세어 보세요. 삼각형은 3개씩, 사각형은 4개씩이에요.',
    '주황색 꼭짓점을 끌어 모양을 바꿔도 변과 꼭짓점의 개수가 그대로인지 확인해 보세요. 45° 같은 각도 재기는 4학년에서 배워요.',
  ] as const : topic==='circumference' ? [
    '원둘레를 따라 줄자로 한 바퀴 재어 보세요. 둥근 테두리의 길이를 원주라고 해요.',
    '잰 줄자를 펼쳐 지름을 세 번 이어 붙인 길이와 비교해 보세요. 지름 세 개보다 조금 더 길어요.',
    '원주를 지름으로 나누면 크기가 다른 원도 약 3.14예요. 이를 원주율이라고 하고 π(파이)는 원주율을 나타내는 기호예요.',
  ] as const : topic==='average' ? [
    '세 친구의 사탕을 모두 합쳐 보세요. '+problem.a+'개, '+problem.b+'개, '+(problem.c??3)+'개를 합한 총 '+(problem.a+problem.b+(problem.c??3))+'개를 고르게 나눠 볼 거예요.',
    '많은 친구의 사탕을 하나 선택해 적은 친구에게 옮겨 주세요. 사탕을 옮겨도 전체 합계는 그대로예요. ▶ 사탕 한 개 고르게 옮기기 버튼으로도 체험할 수 있어요.',
    '모두 비슷해지면 남은 사탕까지 똑같이 나눠 보세요. 전체 '+(problem.a+problem.b+(problem.c??3))+'개를 3명에게 나눈 수가 평균이에요. 3으로 나누어떨어지지 않으면 사탕을 세 조각으로 나눠 줄 수도 있어요.',
  ] as const : topic==='nets'||topic==='surface' ? [
    '직육면체의 여섯 면을 공간에서 만나게 해 보세요. 파란 3D 모형을 마우스나 손가락으로 직접 돌리고, 앞면·윗면·옆면을 눌러 서로 다른 면을 선택해요.',
    '위의 ‘모서리 12개’와 ‘꼭짓점 8개’ 버튼을 눌러 관찰 모드를 바꿔 보세요. 모서리는 두 면이 만나는 선, 꼭짓점은 세 모서리가 만나는 점이에요.',
    '‘전개도 펼치기’를 눌러 평면의 여섯 면과 입체의 여섯 면을 짝지어 보세요. 정육면체로 바꾸면 여섯 면 모두 같은 정사각형이 돼요.',
  ] as const : topic==='area'||topic==='perimeter' ? [
    '넓이 탭을 선택해 보세요. 한 칸은 가로 1cm, 세로 1cm인 1cm² 정사각형이에요. 가로 5칸을 세로 3줄 채워 5+5+5=15칸을 직접 만들어 보세요.',
    '둘레 탭을 선택하고 윗변, 오른쪽 변, 아랫변, 왼쪽 변을 차례로 터치해 보세요. 5cm+3cm+5cm+3cm=16cm로 바깥쪽 경계 길이를 구해요.',
    '같은 직사각형도 넓이는 안에 들어간 칸 수(5×3=15cm²), 둘레는 바깥 네 변의 길이(16cm)예요. 주황 모서리를 움직이며 둘의 차이를 다시 비교해 보세요.',
  ] as const : topic===currentInfo.topics[0] ? currentInfo.concept :
    [TOPIC_CHALLENGES[topic],conceptTipForTopic(topic),
      '직접 교구를 여러 번 움직이며 결과가 어떻게 달라지는지 살펴봐요. 원래대로 돌려놓은 뒤 문제에 도전해 보세요.'] as const;

  useEffect(() => {
    if (onProgressChange) {onProgressChange(progress);return;}
    try { window.localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* 저장 제한 시 무시 */ }
  }, [progress, onProgressChange]);

  useEffect(()=>{
    if(!cloudMode || !onLearningEvent)return;
    const markActive=()=>{lastActivityAt.current=Date.now();};
    window.addEventListener('pointerdown',markActive);
    window.addEventListener('keydown',markActive);
    const timer=window.setInterval(()=>{
      if(document.visibilityState!=='hidden' && Date.now()-lastActivityAt.current<90000){
        onLearningEvent({event_type:'active_time',unit_id:unitId,seconds:20});
      }
    },20000);
    return ()=>{
      window.clearInterval(timer);
      window.removeEventListener('pointerdown',markActive);
      window.removeEventListener('keydown',markActive);
    };
  },[cloudMode,onLearningEvent,unitId]);

  useEffect(()=>{
    if(cloudMode && onLearningEvent){
      onLearningEvent({event_type:'lesson_open',unit_id:unitId});
    }
  },[]); // Opening of the initially selected unit


  // 휴대폰 문제 화면: 교구 칸 안쪽에 가려진 내용이 있으면 '아래로 더 보기' 안내를 보여 준다.
  useEffect(()=>{
    setScrolledOnce(false);
    const canvas=visualWrapRef.current?.querySelector<HTMLElement>('.visual-canvas');
    if(!canvas){setMoreBelow(false);return;}
    const update=()=>setMoreBelow(canvas.scrollHeight-canvas.clientHeight-canvas.scrollTop>6);
    const onScroll=()=>{update();if(canvas.scrollTop>4)setScrolledOnce(true);};
    update();
    canvas.addEventListener('scroll',onScroll,{passive:true});
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;
    observer?.observe(canvas);
    if(canvas.firstElementChild)observer?.observe(canvas.firstElementChild);
    window.addEventListener('resize',update);
    return ()=>{canvas.removeEventListener('scroll',onScroll);observer?.disconnect();window.removeEventListener('resize',update);};
  },[phase,topic,problem,studioOpen]);

  function scrollVisualDown(){
    const canvas=visualWrapRef.current?.querySelector<HTMLElement>('.visual-canvas');
    if(canvas)canvas.scrollBy?.({top:Math.round(canvas.clientHeight*.7),behavior:'smooth'});
  }

  function startTopic(unit: Chapter) {
    const nextTopic = unit.topics[0];
    setGrade(unit.grade);
    setUnitId(unit.id);
    onLearningEvent?.({event_type:'lesson_open',unit_id:unit.id});
    setTopic(nextTopic);
    setIntroduced(new Set([nextTopic]));
    setPhase('concept');
    setStep(0);
    setExplored(false);
    setProblem(createProblem(nextTopic));
    setExplored(false);
    setSelected(null);
    setChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectGrade(nextGrade: number) {
    const info = grades.find(item => item.grade === nextGrade)!;
    startTopic(info.chapters[0]);
  }

  function nextConcept() {
    onLearningEvent?.({event_type:'concept_view',unit_id:unitId,topic});
    if (step < 2) setStep(step + 1);
    else {
      setPhase('question');
      setStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function checkAnswer() {
    if (selected === null || checked) return;
    setChecked(true);
    onLearningEvent?.({event_type:'answer',unit_id:unitId,topic,correct:selected===problem.answer});
    setProgress(previous => recordAnswer(previous, unitId, topic, selected === problem.answer));
  }

  function newQuestion() {
    const nextTopic = nextPracticeTopic(progress, unitId, topic);
    setTopic(nextTopic);
    setProblem(createProblem(nextTopic));
    const needsConcept=nextTopic!==topic&&!introduced.has(nextTopic);
    if(needsConcept)setIntroduced(previous=>new Set(previous).add(nextTopic));
    setSelected(null);
    setChecked(false);
    setExplored(false);
    setStep(0);
    setPhase(needsConcept?'concept':'question');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <div className={"app-shell" + (!studioOpen && phase === "question" && topic ? " app-shell--question" : "")}>
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-symbol" aria-hidden="true">✦</span>
        <span>수학<span className="brand-accent">천재</span><small>MathGenius</small></span>
      </div>

      <div className="sidebar-title">나의 학습 교실</div>
      <div className="grade-picker" role="group" aria-label="학년 선택">
        {grades.map(item => <button
          key={item.grade}
          type="button"
          className={'grade-button' + (grade === item.grade ? ' grade-button--active' : '')}
          onClick={() => selectGrade(item.grade)}
          aria-pressed={grade === item.grade}
        >{item.grade}<small>학년</small></button>)}
      </div>

      <div className="sidebar-section-label"><span>{grade}학년 전체 단원</span><span>{gradeInfo.chapters.length}개</span></div>
      <nav className="chapter-list" aria-label={grade + '학년 수학 단원'}>
        {gradeInfo.chapters.map(chapter => {
          const selectedChapter = chapter.id === unitId;
          const done = unitMastery(progress,chapter.id).complete;
          return <div className="chapter-row-group" key={chapter.id}>
            {chapter.number === 1 && <div className="semester-heading">{chapter.semester}학기 · {grade}학년</div>}
            <button
              className={'chapter' + (selectedChapter ? ' chapter--active' : '')}
              type="button"
              onClick={() => startTopic(chapter)}
              aria-current={selectedChapter ? 'page' : undefined}
            >
              <span className="chapter-number">{String(chapter.number).padStart(2, '0')}</span>
              <span className="chapter-main"><strong>{chapter.title}</strong><small>{chapter.label}</small></span>
              <span className="chapter-state">{done ? '✓' : '→'}</span>
            </button>
          </div>;
        })}
      </nav>

      <div className="sidebar-bottom">
        <span className="sidebar-bottom-icon" aria-hidden="true">💡</span>
        <strong>수학은 외우는 게 아니에요.</strong>
        <p>직접 움직이고 발견하면 어려운 수학도 쉬워져요!</p>
      </div>
    </aside>

    <main className="main">
      <div className="standard-mode-switch" role="group" aria-label="학습 방식 선택">
        <button type="button" className={!studioOpen?'active':''}
          aria-pressed={!studioOpen} onClick={()=>setStudioOpen(false)}>📗 단원별 학습</button>
        <button type="button" className={studioOpen?'active':''}
          aria-pressed={studioOpen}
          onClick={()=>{
            const first=standardsForChapter(unitId)[0];
            if(first)setStudioId(first.id);
            setStudioOpen(true);
          }}>🎯 성취기준 121개 학습</button>
      </div>
      {studioOpen ? <StandardStudio initialId={studioId} onExit={()=>setStudioOpen(false)} initialRecords={initialStandardProgress} onRecordsChange={onStandardProgressChange} onLearningEvent={onLearningEvent}/> : <>
      <div className="mobile-unit-picker">
        <label htmlFor="lesson-picker">{grade}학년 · 학습할 단원</label>
        <select id="lesson-picker" value={unitId}
          onChange={event => {
            const selectedUnit = gradeInfo.chapters.find(item => item.id === event.target.value);
            if (selectedUnit) startTopic(selectedUnit);
          }}>
          {gradeInfo.chapters.map(unit => <option key={unit.id} value={unit.id}>
            {unit.semester}학기 {unit.number}. {unit.title}
          </option>)}
        </select>
      </div>
      <header className="top-bar">
        <div className="breadcrumb">수학천재 <span>›</span> {grade}학년 <span>›</span> {currentInfo.semester}학기 <span>›</span> 개념 학습</div>
        <div className="top-progress" title="각 개념 두 문제 연속 정답을 달성한 단원">
          <span className="progress-star" aria-hidden="true">★</span>
          <strong>{completedCount}/{TOTAL_UNITS}</strong>
          <span>단원 학습 달성</span>
        </div>
      </header>

      <div className="welcome">
        <div className="welcome-text">
          <div className="eyebrow"><span className="eyebrow-dot" /> 생각이 자라는 수학 시간</div>
          <h1>{currentInfo ? currentInfo.title : grade + '학년 수학을 준비하고 있어요'}</h1>
          <p>{currentInfo ? currentInfo.subtitle : '이 학년의 수학 수업을 만나 보세요. 먼저 2, 5, 6학년 체험 단원을 둘러보세요.'}</p>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <span className="floating-figure figure-circle"><Fraction numerator={1} denominator={2}/></span>
          <span className="floating-figure figure-square">+</span>
          <span className="floating-figure figure-star">✦</span>
        </div>
      </div>

      {currentInfo ? <>
        <div className="lesson-heading">
          <div>
            <span className="lesson-tag">{topicIcons[topic] ?? '🧠'} {currentInfo.tag}</span>
            <h2>오늘의 미션 <span>✨</span></h2>
          </div>
          <div className="lesson-level">LEVEL 01 <span>· 기초 개념</span></div>
        </div>

        <div className="step-nav" role="group" aria-label="학습 단계">
          {(['concept', 'question', 'solution'] as Phase[]).map((id, i) => (
            <button
              key={id}
              className={'step-button' + (phase === id ? ' step-button--active' : '')}
              type="button"
              onClick={() => { if (id !== 'solution' || checked) { setPhase(id); setStep(0); window.scrollTo({top:0,behavior:'smooth'}); } }}
              disabled={id === 'solution' && !checked}
              aria-current={phase === id ? 'step' : undefined}
            >
              <span className="step-index">{i + 1}</span>
              <span>{phaseLabels[id]}</span>
            </button>
          ))}
        </div>

        {/* 개념 학습: 애니메이션으로 원리를 먼저 보고 → 교구·안내 카드로 직접 이해하기 */}
        {phase === 'concept' && ELEMENTARY_SCENES[topic] && <MotionPlayer key={'motion-' + topic}
          id={topic} scenes={ELEMENTARY_SCENES[topic]!} className="mm-player--elementary"/>}

        <div className="workspace">
          <section className="visual-card" aria-label="수학 체험 화면">
            <div className="card-topline"><div className="card-kicker">✳ INTERACTIVE MATH</div><span className="live-badge"><span /> 움직이는 수학</span></div>
            <h3>{phase === 'concept' ? '직접 움직여 원리를 발견해요'
              : phase === 'question' ? '그림을 보면서 풀어 보세요'
              : '정답까지 가는 길을 살펴봐요'}</h3>
            <div className={'visual-scroll-wrap' + (moreBelow ? ' visual-scroll-wrap--more' : '')} ref={visualWrapRef}>
            <Visuals phase={phase} step={step} problem={problem} onEngage={() => {setExplored(true);const now=Date.now();if(now-lastInteractionReportAt.current>=5000){lastInteractionReportAt.current=now;onLearningEvent?.({event_type:'lab_interaction',unit_id:unitId,topic});}}} />
            {moreBelow && <button type="button" className={'visual-more-hint' + (scrolledOnce ? ' visual-more-hint--mini' : '')}
              onClick={scrollVisualDown} aria-label="교구 아래쪽 더 보기">
              <span aria-hidden="true">↓</span>{!scrolledOnce && ' 아래로 밀어서 더 보기'}
            </button>}
            </div>
            <div className="visual-caption"><span aria-hidden="true">✦</span> {explored ? '내 손으로 수학을 변화시켰어요! 다른 방법도 탐구해 보세요.' : '블록·선·도형을 클릭하거나 손가락으로 움직여 보세요.'}</div>
          </section>

          <section className="guide-card" aria-live="polite">
            {phase === 'concept' ? <>
              <div className="guide-eyebrow">STEP {step + 1} / 3 · {explored ? '✓ 직접 조작 완료' : '☝ 교구를 움직여 보세요'}</div>
              <h3>차근차근 알아볼까요?</h3>
              <div className="guide-body">
                <span className="guide-icon" aria-hidden="true">💡</span>
                <p><MathText text={conceptGuidance[step]}/></p>
              </div>
              <div className="guide-progress" role="img" aria-label={'개념 ' + String(step + 1) + '/3 단계'}>
                {[0, 1, 2].map(i => <span key={i} className={i <= step ? 'guide-progress--filled' : ''} />)}
              </div>
              <div className="guide-actions">
                <button type="button" className="btn btn--outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← 이전</button>
                <button type="button" className="btn btn--primary" onClick={nextConcept}>{step === 2 ? '문제 풀러 가기 →' : '다음 단계 →'}</button>
              </div>
            </> : phase === 'question' ? <>
              <div className="guide-eyebrow">CHALLENGE · 문제 풀기 · 단원 {unitStatus.mastered}/{unitStatus.total}개 개념 달성</div>
              <h3><MathText text={problem.prompt}/></h3>
              <p className="question-hint">알맞은 답을 하나 골라 보세요. 같은 개념 2문제를 연속으로 맞히면 해당 개념을 달성해요.</p>
              <div className="choices" role="group" aria-label="문제의 정답 선택">
                {problem.choices.map(choice => <button
                  type="button"
                  key={choice}
                  disabled={checked}
                  onClick={() => setSelected(choice)}
                  aria-pressed={selected === choice}
                  className={'choice' + (selected === choice ? ' choice--selected' : '') + (checked && choice === problem.answer ? ' choice--correct' : '') + (checked && selected === choice && !right ? ' choice--wrong' : '')}
                ><MathText text={choice}/></button>)}
              </div>
              {checked && <div className={'feedback ' + (right ? 'feedback--correct' : 'feedback--wrong')}>
                <strong>{right ? '🎉 정답이에요!' : '🌱 조금 더 생각해 봐요!'}</strong>
                <p>{right ? (topicStatus?.mastered ? '이 개념을 달성했어요! 다음 개념도 도전해 보세요.' :
                  '잘했어요! 같은 개념을 한 번 더 연속해서 맞히면 달성해요.') :
                  <MathText text={diagnosticHint(problem, selected!)}/>}</p>
              </div>}
              <div className="guide-actions">
                <button type="button" className="btn btn--outline" onClick={() => { setPhase('concept'); setStep(0); }}>개념 다시 보기</button>
                <button type="button" className="btn btn--primary" disabled={!checked && selected === null} onClick={() => {
                  if (checked) { setPhase('solution'); setStep(0); } else checkAnswer();
                }}>{checked ? '풀이 확인하기 →' : '정답 확인'}</button>
              </div>
            </> : <>
              <div className="guide-eyebrow">SOLUTION · 풀이 {step + 1} / 3</div>
              <h3>이렇게 생각하면 쉬워요!</h3>
              <div className="guide-body guide-body--solution"><span className="guide-icon" aria-hidden="true">🔎</span><p><MathText text={explanations[step]}/></p></div>
              <div className="guide-progress" role="img" aria-label={'풀이 ' + String(step + 1) + '/3 단계'}>
                {[0, 1, 2].map(i => <span key={i} className={i <= step ? 'guide-progress--filled' : ''} />)}
              </div>
              {step < 2 ? <div className="guide-actions">
                <button type="button" className="btn btn--outline" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>← 이전 풀이</button>
                <button type="button" className="btn btn--primary" onClick={() => setStep(step + 1)}>다음 풀이 →</button>
              </div> : <div className="unit-nav-wrap">
                <button type="button" className="unit-nav-back" onClick={() => setStep(1)}>← 이전 풀이 다시 보기</button>
                <div className="unit-nav" role="group" aria-label="다음 학습 선택">
                  <button type="button" className="btn btn--outline unit-nav-btn" disabled={!prevUnit}
                    onClick={() => prevUnit && startTopic(prevUnit)}>
                    <span>← 이전 단원</span>{prevUnit && <small>{prevUnit.grade !== grade ? prevUnit.grade + '학년 · ' : ''}{prevUnit.title}</small>}
                  </button>
                  <button type="button" className="btn btn--outline unit-nav-btn unit-nav-btn--retry" onClick={newQuestion}>
                    <span>↻ 다시 풀기</span><small>문제 하나 더</small>
                  </button>
                  <button type="button" className="btn btn--primary unit-nav-btn" disabled={!nextUnit}
                    onClick={() => nextUnit && startTopic(nextUnit)}>
                    <span>다음 단원 →</span>{nextUnit && <small>{nextUnit.grade !== grade ? nextUnit.grade + '학년 · ' : ''}{nextUnit.title}</small>}
                  </button>
                </div>
              </div>}
            </>}
          </section>
        </div>

        <div className="below-workspace">
          <div className="learning-tip"><span>🌈</span><div><strong>오늘의 수학 습관</strong><p>틀리는 것도 배움의 일부예요. 정답보다 ‘왜?’를 아는 것이 더 중요해요.</p></div></div>
          <div className="learning-stats"><strong>{progress.attempts}</strong><span>도전한 문제</span><span className="stats-divider" /><strong>{progress.correct}</strong><span>맞힌 문제</span><span className="stats-divider" /><strong>{unitStatus.mastered}/{unitStatus.total}</strong><span>이 단원의 개념 달성</span></div>
        </div>
      </> : <section className="coming-soon">
        <div className="coming-icon" aria-hidden="true">🚀</div>
        <h2>{grade}학년 수업은 준비 중이에요</h2>
        <p>앞으로 이런 단원들을 그림으로 배우게 될 거예요.</p>
        <div className="coming-list">{gradeInfo.chapters.map(item => <span key={item.title}>{item.title}</span>)}</div>
        <button type="button" className="btn btn--primary" onClick={() => startTopic(grades[4].chapters[4])}>5학년 분수 학습 체험하기 →</button>
      </section>}

      </>}
      <footer className="page-footer" role="contentinfo" aria-label="수학천재 운영회사 정보">
        <div className="footer-top">
          <strong className="footer-brand">수학<span>천재</span> <small>MathGenius</small></strong>
          <a href="https://larix.kr" target="_blank" rel="noopener noreferrer" className="footer-company-site">운영사 웹사이트 ↗</a>
        </div>
        <div className="footer-company-info">
          <span><b>운영사</b> 주식회사 라릭 (Larix Inc.)</span>
          <span><b>대표이사</b> 김영상</span>
          <span><b>사업자등록번호</b> 336-88-03923</span>
          <span className="footer-address"><b>사업장 주소</b> 경기도 성남시 분당구 미금일로 7, A동 102호(구미동, 힐스빌8차)</span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Larix Inc. All rights reserved.</span>
          <span>{cloudMode?'학습 기록은 로그인 계정에 연결해 저장됩니다.':'학습 기록은 이 기기에만 저장됩니다.'}</span>
        </div>
      </footer>
    </main>
  </div>;
}
