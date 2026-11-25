import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {L,tr} from '../i18n/index.ts';
import {renderMotionScene,type MotionScene} from './types.ts';
import {fractionHtml} from './mathTokens.ts';
import './motion.css';

const prefersReducedMotion=()=>typeof window!=='undefined'&&typeof window.matchMedia==='function'&&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 단원 원리를 CSS 키프레임 애니메이션 장면으로 보여 주는 플레이어 (초등·중등 공용) */
export default function MotionPlayer({id,scenes,className}:{id:string;scenes:readonly MotionScene[];className?:string}){
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

  return <section ref={root} className={`mm-player${className?' '+className:''}${paused?' mm-paused':''}`} aria-label={L('움직이는 개념 설명','Animated explanation')} data-topic={id}>
    <div className="mm-head">
      <div><span className="mm-kicker">🎬 MOTION · {L('움직이며 이해하기','Learn by watching it move')}</span><h4>{L('애니메이션으로 원리 보기','See the idea in an animation')}</h4></div>
      <div className="mm-tabs" role="tablist" aria-label={L('장면 선택','Choose scene')}>
        {scenes.map((_,i)=><button type="button" role="tab" key={i} aria-selected={i===idx}
          aria-label={L(`장면 ${i+1}`,`Scene ${i+1}`)} onClick={()=>go(i)}>{i+1}</button>)}
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
    <p className="mm-caption" aria-live="polite"><b>{idx+1} / {scenes.length}</b><span dangerouslySetInnerHTML={{__html:fractionHtml(tr(scene.cap))}}/></p>
    <div className="mm-ctrl">
      <button type="button" disabled={idx===0} onClick={()=>go(idx-1)}>{L('◀ 이전','◀ Back')}</button>
      <button type="button" className="mm-main" onClick={()=>{
        if(finished) go(0); else {setStarted(true);setPaused(p=>!p);}
      }}>{finished?L('↻ 처음부터','↻ Start over'):paused?L('▶ 재생','▶ Play'):L('❚❚ 일시정지','❚❚ Pause')}</button>
      <button type="button" onClick={()=>go(idx)}>{L('↻ 다시 보기','↻ Replay')}</button>
      <button type="button" disabled={idx===scenes.length-1} onClick={()=>go(idx+1)}>{L('다음 ▶','Next ▶')}</button>
    </div>
  </section>;
}
