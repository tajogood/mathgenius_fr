import { useEffect,useMemo,useState } from 'react';
import type { StudyEvent } from '../types.ts';
import { achievementStandards } from '../standards.ts';
import { standardLessons, standardSections,standardAssessments,standardLessonMap,rotateOptions } from '../standards/lessons.ts';
import { extraChecksFor } from '../standards/extraChecks.ts';
import { answerStandard,masteredStandards,readStandardProgress,STANDARD_STORAGE_KEY,type StandardProgress } from '../standards/progress.ts';
import type { StandardAssessment } from '../standards/lessons.ts';
import Visuals from './Visuals.tsx';
import { MathText } from './MathText.tsx';
import { isEn,tr } from '../i18n/index.ts';

type Mode='explore'|'concept'|'application'|'complete';
type Props={initialId:string;onExit:()=>void;initialRecords?:StandardProgress;onRecordsChange?:(next:StandardProgress)=>void;onLearningEvent?:(event:StudyEvent)=>void};

export default function StandardStudio({initialId,onExit,initialRecords,onRecordsChange,onLearningEvent}:Props){
  const [id,setId]=useState(()=>standardLessonMap.has(initialId)?initialId:standardLessons[0].id);
  const [mode,setMode]=useState<Mode>('explore');
  const [step,setStep]=useState(0);
  const [checkpointIndex,setCheckpointIndex]=useState(0);
  const [selected,setSelected]=useState<string|null>(null);
  const [checked,setChecked]=useState(false);
  const [interacted,setInteracted]=useState(false);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [catalogOpen,setCatalogOpen]=useState(false);
  const [round,setRound]=useState(0);
  const [records,setRecords]=useState<StandardProgress>(()=>initialRecords??readStandardProgress());
  const lesson=standardLessonMap.get(id)!;
  const [concept,application]=useMemo(()=>standardAssessments(lesson),[lesson,round]);
  const supplements=useMemo(()=>extraChecksFor(id),[id]);
  const conceptChecks=useMemo(()=>[
    {...concept,label:lesson.title},
    ...supplements.map((item,i)=>({
      kind:'concept' as const,label:item.label,question:item.prompt,
      choices:rotateOptions(item.choices,(i+id.length)%4),
      answer:item.answer,explanation:item.explanation,
      visualProblem:concept.visualProblem,
    })),
  ],[concept,id,lesson,supplements]);
  const assessment:StandardAssessment=mode==='application'?application:conceptChecks[checkpointIndex];
  const band=achievementStandards.find(entry=>entry.id===id)!.band;
  const passed=selected===assessment.answer;
  const total=masteredStandards(records);
  const sceneText=[
    lesson.discover,
    lesson.principle,
    isEn()?'Move the "'+tr(lesson.title)+'" model yourself to check the idea. Once you can explain what happened in your own words, try the concept questions.':
      '직접 '+lesson.title+' 교구를 움직이며 원리를 확인해 보세요. 조작한 결과를 말로 설명할 수 있다면 개념 문제에 도전해요.',
  ];
  const displayLesson=(nextId:string)=>{
    setId(nextId);setMode('explore');setStep(0);setCheckpointIndex(0);setSelected(null);setChecked(false);
    setInteracted(false);setRound(v=>v+1);setCatalogOpen(false);
    onLearningEvent?.({event_type:'standard_open',standard_id:nextId});
    window.scrollTo?.({top:0,behavior:'instant'});
  };
  useEffect(()=>{
    if(onRecordsChange){onRecordsChange(records);return;}
    try{localStorage.setItem(STANDARD_STORAGE_KEY,JSON.stringify(records));}catch{/* offline restricted storage */}
  },[records,onRecordsChange]);
  useEffect(()=>{if(standardLessonMap.has(initialId))displayLesson(initialId);},[initialId]);
  const answer=()=>{
    if(selected===null||checked)return;
    const isRight=selected===assessment.answer;
    setChecked(true);
    onLearningEvent?.({event_type:'standard_answer',standard_id:id,correct:isRight});
    setRecords(prev=>answerStandard(prev,id,isRight,isRight&&mode==='application'));
  };
  const forward=()=>{
    if(!checked)return;
    if(!passed){
      if(mode==='application')setRound(v=>v+1);
      setSelected(null);setChecked(false);
      return;
    }
    setSelected(null);setChecked(false);
    if(mode==='concept'){
      if(checkpointIndex<conceptChecks.length-1)setCheckpointIndex(v=>v+1);
      else setMode('application');
    } else setMode('complete');
  };
  const sections=standardSections();
  const list=standardLessons.filter(l=>{
    const candidate=achievementStandards.find(x=>x.id===l.id)!;
    return (filter==='all'||candidate.band===filter)
      && (l.id.includes(search.trim())||l.title.includes(search.trim()));
  });
  const nextId=standardLessons[(standardLessons.findIndex(l=>l.id===id)+1)%121].id;

  return <section className={'standard-studio standard-studio--'+mode} aria-label="121개 성취기준 독립 학습실">
    <header className="studio-header">
      <div>
        <div className="studio-eyebrow">2022 개정 수학과 교육과정 · 성취기준 학습</div>
        <h1>121개 기준을 하나씩 배우고 확인해요</h1>
        <p>각 기준마다 조작 수업과 별도 개념 확인 문제, 자동으로 바뀌는 적용 문제를 제공합니다.</p>
      </div>
      <button type="button" className="studio-exit" onClick={onExit}>← 단원 학습으로</button>
    </header>
    <div className="studio-progress" aria-label={'성취기준별 학습 확인 '+total+'/121'}>
      <strong>{total}<small> / 121개 기준 확인</small></strong>
      <div><span style={{width:(total/121*100)+'%'}}/></div>
      <small>현재 표시는 앱의 2단계 확인 문제를 통과했다는 뜻이며, 학교 성취평가 결과는 아닙니다.</small>
    </div>

    <div className="studio-layout">
      <div className={'studio-catalog'+(catalogOpen?' studio-catalog--open':'')}>
        <div className="studio-catalog-top"><label htmlFor="standard-search">학습할 성취기준 찾기</label>
          <button type="button" onClick={()=>setCatalogOpen(v=>!v)} aria-expanded={catalogOpen}
            className="studio-catalog-toggle">{catalogOpen?'목록 접기':'121개 목록 보기'}</button>
        </div>
        <input id="standard-search" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="예: 6수01-09, 분수 곱셈" />
        <label htmlFor="standard-band">학년군</label>
        <select id="standard-band" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">전체 학년군 · 121개</option>
          {sections.map(section=><option value={section.name.replace('군','')} key={section.name}>
            {section.name} · {section.lessons.length}개</option>)}
        </select>
        <nav className="studio-list" aria-label="성취기준 목록">
          {list.map(item=><button type="button" key={item.id}
            className={'studio-lesson-link'+(id===item.id?' studio-lesson-link--active':'')}
            onClick={()=>displayLesson(item.id)} aria-current={id===item.id?'page':undefined}>
            <small>{item.id}</small><span>{item.title}</span>
            <b aria-label={records[item.id]?.mastered?'학습 확인 완료':'학습 확인 전'}>
              {records[item.id]?.mastered?'✓':'›'}
            </b>
          </button>)}
          {list.length===0&&<p>해당하는 성취기준이 없습니다.</p>}
        </nav>
      </div>

      <div className="studio-lesson">
        <div className="studio-lesson-heading">
          <small>{band} · {lesson.id}</small>
          <h2>{lesson.title}</h2>
          <div className="studio-stages" aria-label="수업 단계">
            <span className={mode==='explore'?'active':''}>1. 직접 탐구</span>
            <span className={mode==='concept'?'active':''}>2. 개념 확인</span>
            <span className={mode==='application'?'active':''}>3. 적용 평가</span>
            <span className={mode==='complete'?'active':''}>4. 완료</span>
          </div>
          {supplements.length>0&&<div className="studio-subskills" aria-label="세부 개념 학습 항목">
            <span>세부 확인:</span>{supplements.map(item=><span key={item.label}>{item.label}</span>)}
          </div>}
        </div>
        {mode==='complete'?<div className="studio-complete">
          <span aria-hidden="true">🏅</span>
          <h3>{lesson.id} · 학습 확인 완료!</h3>
          <p>교구를 체험하고 {conceptChecks.length}개의 세부 개념 확인 문제와 자동 생성 적용 문제를 모두 맞혔어요.</p>
          <p className="studio-disclaimer">이는 두 문항의 앱 내 확인 결과이며 해당 성취기준의 모든 세부 기능을 평가했다는 뜻은 아니에요.</p>
          <div className="studio-actions">
            <button className="btn btn--outline" type="button" onClick={()=>displayLesson(id)}>다시 배우기</button>
            <button className="btn btn--primary" type="button" onClick={()=>displayLesson(nextId)}>다음 기준으로 →</button>
          </div>
        </div>:<div className="studio-stage-layout">
          <div className="studio-manipulative">
            <strong>☝️ 만지고 움직이는 수학</strong>
            <Visuals phase={mode==='application'?'question':'concept'} step={step} standardId={id}
              problem={mode==='application'?application.visualProblem:concept.visualProblem}
              onEngage={()=>setInteracted(true)}/>
            <div className="studio-lab-caption">
              {interacted?'✓ 직접 조작했어요. 다른 수치도 시도해 보세요.':
                '그림 속 블록·선·도형을 터치하거나 끌어 보세요.'}
              {mode==='concept'&&<small>교구는 개념 연습용입니다. 왼쪽 그림의 숫자와 확인 문제의 숫자는 다를 수 있어요.</small>}
            </div>
          </div>
          <div className="studio-card">
            {mode==='explore'?<>
              <div className="studio-card-step">개념 수업 {step+1}/3</div>
              <h3>{['무엇을 움직여 볼까요?','어떤 원리가 숨어 있나요?','내 말로 설명해 볼까요?'][step]}</h3>
              <p className="studio-instruction"><MathText text={sceneText[step]}/></p>
              <div className="studio-actions">
                <button className="btn btn--outline" type="button" onClick={()=>setStep(Math.max(0,step-1))}
                  disabled={step===0}>← 이전</button>
                <button className="btn btn--primary" type="button" onClick={()=>{
                  if(step<2)setStep(v=>v+1);
                  else {setMode('concept');setSelected(null);setChecked(false);}
                }}>{step===2?'개념 확인 시작 →':'다음 장면 →'}</button>
              </div>
            </>:<>
              <div className="studio-card-step">{mode==='concept'?
                (isEn()?'Concept check '+(checkpointIndex+1)+' / '+conceptChecks.length+' · '+tr(conceptChecks[checkpointIndex].label):
                '개념 확인 '+(checkpointIndex+1)+' / '+conceptChecks.length+' · '+conceptChecks[checkpointIndex].label):
                '자동 생성 적용 문제'}</div>
              <h3><MathText text={assessment.question}/></h3>
              <div className="studio-options" role="group" aria-label="성취기준 문제의 정답 선택">
                {assessment.choices.map(value=><button type="button" key={value}
                  onClick={()=>setSelected(value)} disabled={checked}
                  aria-pressed={selected===value}
                  className={'studio-option'+(selected===value?' studio-option--selected':'')+
                    (checked&&value===assessment.answer?' studio-option--correct':'')+
                    (checked&&selected===value&&!passed?' studio-option--incorrect':'')}>
                  <MathText text={value}/>
                </button>)}
              </div>
              {checked&&<div className={'studio-feedback'+(passed?' studio-feedback--correct':'')}>
                <strong>{passed?'✔ 정답이에요':'다시 탐구해 봐요'}</strong>
                <p><MathText text={passed?assessment.explanation:isEn()?'Look at your answer again. '+tr(mode==='concept'?lesson.explanation:lesson.principle):'선택한 답을 다시 살펴봐요. '+(mode==='concept'?lesson.explanation:lesson.principle)}/></p>
              </div>}
              <div className="studio-actions">
                <button className="btn btn--outline" type="button" onClick={()=>{
                  setMode('explore');setStep(0);setChecked(false);setSelected(null);
                }}>개념 다시 보기</button>
                <button className="btn btn--primary" type="button"
                  disabled={selected===null&&!checked}
                  onClick={checked?forward:answer}>
                  {checked?(passed?mode==='concept'?
                    checkpointIndex<conceptChecks.length-1?'다음 세부 개념 →':'적용 문제로 →':
                    '학습 결과 보기 →':'다시 도전 ↻'):'정답 확인'}
                </button>
              </div>
            </>}
          </div>
        </div>}
      </div>
    </div>
  </section>;
}
