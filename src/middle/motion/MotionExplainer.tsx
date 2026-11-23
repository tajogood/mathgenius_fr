import {useEffect,useRef,useState,type CSSProperties} from 'react';
import type {MiddleTopic} from '../curriculum.ts';
import {MOTION_SCENES,renderMotionScene} from './index.ts';
import './motion.css';

const prefersReducedMotion=()=>typeof window!=='undefined'&&typeof window.matchMedia==='function'&&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 직접 탐구 단계에서 단원 원리를 CSS 키프레임 애니메이션으로 보여 주는 장면 플레이어 */
export default function MotionExplainer({topic}:{topic:MiddleTopic}){
  const scenes=MOTION_SCENES[topic]??[];
  const [idx,setIdx]=useState(0);
  const [run,setRun]=useState(0);          // 같은 장면을 다시 그릴 때 애니메이션을 처음부터 재생
  const [started,setStarted]=useState(false);
  const [paused,setPaused]=useState(true);
  const [finished,setFinished]=useState(false);
  const root=useRef<HTMLElement>(null);

  // 화면에 처음 보일 때 재생 시작 (화면 밖에서 애니메이션이 끝나 버리지 않도록)
  useEffect(()=>{
    const el=root.current;
    const start=()=>{setStarted(true);setPaused(prefersReducedMotion());setRun(r=>r+1);};
    if(!el||typeof IntersectionObserver==='undefined'){start();return;}
    const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){start();io.disconnect();}},{threshold:.35});
    io.observe(el);
    return ()=>io.disconnect();
  },[]);

  if(!scenes.length) return null;
  const scene=scenes[idx];
  const go=(i:number)=>{
    setIdx(Math.max(0,Math.min(scenes.length-1,i)));
    setStarted(true);setPaused(false);setFinished(false);setRun(r=>r+1);
  };
  const onBarEnd=()=>{
    if(prefersReducedMotion()) return;
    if(idx<scenes.length-1) go(idx+1);
    else {setFinished(true);setPaused(true);}
  };

  return <section ref={root} className={`mm-player${paused?' mm-paused':''}`} aria-label="움직이는 개념 설명" data-topic={topic}>
    <div className="mm-head">
      <div><span className="mm-kicker">🎬 MOTION · 움직이며 이해하기</span><h4>애니메이션으로 원리 보기</h4></div>
      <div className="mm-tabs" role="tablist" aria-label="장면 선택">
        {scenes.map((_,i)=><button type="button" role="tab" key={i} aria-selected={i===idx}
          aria-label={`장면 ${i+1}`} onClick={()=>go(i)}>{i+1}</button>)}
      </div>
    </div>
    <div className="mm-stage-wrap">
      <svg key={`${idx}-${run}`} className="mm-stage" viewBox="0 0 520 260" aria-hidden="true" focusable="false"
        dangerouslySetInnerHTML={{__html:renderMotionScene(scene)}}/>
    </div>
    <div className="mm-progress" aria-hidden="true">
      {started&&<i key={`${idx}-${run}`} style={{'--dur':`${scene.dur}s`} as CSSProperties} onAnimationEnd={onBarEnd}/>}
    </div>
    {/* 그림은 장식(aria-hidden), 설명은 아래 캡션이 화면낭독기로 전달 */}
    <p className="mm-caption" aria-live="polite"><b>{idx+1} / {scenes.length}</b><span dangerouslySetInnerHTML={{__html:scene.cap}}/></p>
    <div className="mm-ctrl">
      <button type="button" disabled={idx===0} onClick={()=>go(idx-1)}>◀ 이전</button>
      <button type="button" className="mm-main" onClick={()=>{
        if(finished) go(0); else {setStarted(true);setPaused(p=>!p);}
      }}>{finished?'↻ 처음부터':paused?'▶ 재생':'❚❚ 일시정지'}</button>
      <button type="button" onClick={()=>go(idx)}>↻ 다시 보기</button>
      <button type="button" disabled={idx===scenes.length-1} onClick={()=>go(idx+1)}>다음 ▶</button>
    </div>
  </section>;
}
