import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { LabProps } from './types';
import { LabHint, LabTools, SmallControl, bound } from './types';
import { displayNumber } from '../../interactions.ts';

export function ChartsLab({problem:p}:LabProps) {
  const pie=p.topic==='circlegraph'||p.topic==='bandgraph';
  const values0=pie?[p.topic==='circlegraph'?p.a*10:p.a,100-(p.topic==='circlegraph'?p.a*10:p.a)]:
    [p.a,p.topic==='linegraph'?(p.c??p.a+p.b):p.b,p.c??3];
  const [values,setValues]=useState(values0);
  const max=pie?100:Math.max(10,...values0)+3;
  const update=(i:number,v:number)=>setValues(prev=>{
    if(pie) return i===0?[v,100-v]:[100-v,v];
    return prev.map((x,index)=>i===index?v:x);
  });
  const average=(values.reduce((a,b)=>a+b,0)/values.length);
  const line=p.topic==='linegraph';
  const svg=useRef<SVGSVGElement>(null);
  const pieRef=useRef<HTMLDivElement>(null);
  const pieDragging=useRef(false);
  const movePie=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const bounds=pieRef.current?.getBoundingClientRect();
    if(!bounds)return;
    let percent:number;
    if(p.topic==='bandgraph'){
      percent=(event.clientX-bounds.left)/bounds.width*100;
    }else{
      const x=event.clientX-bounds.left-bounds.width/2;
      const y=event.clientY-bounds.top-bounds.height/2;
      percent=((Math.atan2(x,-y)*180/Math.PI+360)%360)/3.6;
    }
    update(0,bound(Math.round(percent),0,100));
  };
  const [dragIndex,setDragIndex]=useState<number|null>(null);
  const move=(event:ReactPointerEvent<SVGSVGElement|SVGCircleElement>,i:number)=>{
    const bounds=svg.current?.getBoundingClientRect();
    if(!bounds)return;
    const y=(event.clientY-bounds.top)*168/bounds.height;
    update(i,bound(Math.round((135-y)/100*max),0,max));
  };
  const points=values.map((v,i)=>({x:40+i*130,y:135-v/max*100}));
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{pie?values[0]+'%':p.topic==='average'?displayNumber(average,1):values[0]}</strong>
      <span>{pie?' 파란 영역의 비율':p.topic==='average'?' 현재 그래프 평균':' 파란 막대의 높이'}</span></div>
    {pie?<div ref={pieRef} className={'lab-pie '+(p.topic==='bandgraph'?'lab-pie--band':'')}
      role="slider" tabIndex={0} aria-valuemin={0} aria-valuemax={100} aria-valuenow={values[0]}
      aria-label={'파란 영역과 주황 영역의 경계를 직접 드래그해 조절: 파랑 '+values[0]+'%'}
      onPointerDown={e=>{pieDragging.current=true;
        try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* simulated DOM */}
        movePie(e);
      }}
      onPointerMove={e=>{if(pieDragging.current)movePie(e);}}
      onPointerUp={e=>{pieDragging.current=false;
        try{if(e.currentTarget.hasPointerCapture?.(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);}catch{/* released */}
      }}
      onPointerCancel={()=>{pieDragging.current=false;}}
      onKeyDown={e=>{
        if(e.key==='ArrowLeft'||e.key==='ArrowDown'){
          e.preventDefault();update(0,bound(values[0]-5,0,100));
        }
        if(e.key==='ArrowRight'||e.key==='ArrowUp'){
          e.preventDefault();update(0,bound(values[0]+5,0,100));
        }
      }}
      style={{background:p.topic==='bandgraph'?undefined:
        'conic-gradient(#667deb '+values[0]+'%,#f4ae69 '+values[0]+'% 100%)'}}>
      {p.topic==='bandgraph'?<div className="lab-band">
        <span style={{width:values[0]+'%'}}>파랑 {values[0]}%</span>
        <span style={{width:values[1]+'%'}}>주황 {values[1]}%</span>
        <i className="lab-band-divider" style={{left:values[0]+'%'}} aria-hidden="true"/>
      </div>:<><span className="lab-pie-center">전체 100%</span>
        <span className="lab-pie-divider" aria-hidden="true"
          style={{transform:'translate(-50%,-50%) rotate('+(values[0]*3.6)+'deg) translateY(-73px)'}}/>
      </>}
    </div>:line?<svg ref={svg} viewBox="0 0 340 168" className="lab-linechart-svg"
      role="img" aria-label="데이터 점을 드래그해 꺾은선그래프를 바꿔 보세요"
      onPointerMove={e=>{if(dragIndex!==null&&e.buttons>0)move(e,dragIndex);}}
      onPointerUp={()=>setDragIndex(null)} onPointerCancel={()=>setDragIndex(null)}>
      {Array.from({length:5},(_,i)=><line key={i} x1="20" x2="320" y1={35+i*25} y2={35+i*25}
        stroke="#dce4f8" strokeDasharray="5 4"/>)}
      <polyline points={points.map(point=>point.x+','+point.y).join(' ')}
        fill="none" stroke="#6681e8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((point,i)=><g key={i}>
        <circle cx={point.x} cy={point.y} r="12" fill={i===1?'#f0ae65':'#647ded'} stroke="#fff"
          strokeWidth="3" className="lab-linechart-handle"
          onPointerDown={e=>{
            e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);setDragIndex(i);move(e,i);
          }}/>
        <text x={point.x} y={point.y-18} textAnchor="middle" fill="#5267c6" fontSize="15"
          fontWeight="900">{values[i]}</text>
        <text x={point.x} y="160" textAnchor="middle" fill="#7a8aab" fontSize="12">{i+1}번</text>
      </g>)}
    </svg>:<div className="lab-chart" role="group" aria-label="막대를 눌러 높이를 바꾸세요">
      {values.map((v,i)=><div className="lab-chart-column" key={i}>
        <strong>{v}</strong>
        <button className={'lab-chart-bar'+(line?' lab-chart-bar--line':'')}
          type="button" title="눌러 한 칸 올리기" aria-label={'그래프 '+(i+1)+'번 값을 한 칸 올리기'}
          style={{height:(v/max*100)+'%',background:i===0?'#647ded':i===1?'#f4ad65':'#63c7b6'}}
          onClick={()=>update(i,Math.min(max,v+1))} />
        <span>{i+1}번</span>
      </div>)}
    </div>}
    <LabHint>{pie?'원그래프나 띠그래프를 직접 눌러 경계를 옮겨 보세요. 파랑과 주황을 더하면 항상 100%예요.':
      line?'점에 손가락을 올려 드래그하거나 아래 슬라이더를 움직이면 꺾은선이 달라져요.':
      '막대를 터치하면 높이가 1 증가해요. 아래 슬라이더로도 바꿀 수 있어요.'}</LabHint>
    <LabTools>
      {values.map((value,i)=><label className="lab-slider-label" key={i}>{pie?(i===0?'파랑':'주황'):(i+1)+'번'} {value}
        <input type="range" min={pie?0:0} max={max} value={value}
          onChange={e=>update(i,Number(e.target.value))}/></label>)}
      <button type="button" className="lab-action" onClick={()=>setValues(values0)}>↺ 원래 그래프</button>
    </LabTools>
  </div>;
}

export function PatternsLab({problem:p}:LabProps) {
  const correspond=p.topic==='correspond';
  const [start,setStart]=useState(correspond?p.c??2:p.a);
  const [interval,setInterval]=useState(correspond?p.a:p.b);
  const [selected,setSelected]=useState<number|null>(null);
  const dragging=useRef<{y:number;interval:number}|null>(null);
  const next=correspond?interval*start+p.b:start+interval*3;
  const list=correspond?
    [start,start+1,start+2].map(x=>[x,interval*x+p.b]):[0,1,2,3].map(i=>[i,start+interval*i]);
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{next}</strong><span>{correspond?' 출력값':' 다음 수'}</span></div>
    <div className="lab-pattern-strip" role="group" aria-label="규칙의 숫자를 직접 눌러 조사하거나 위아래로 끌어 규칙 바꾸기">
      {list.map(([input,out],i)=><div className="lab-pattern-pair" key={input}>
        {correspond&&<small>입력 {input}</small>}
        <button type="button" className="lab-pattern-value"
          aria-label={(i+1)+'번째 규칙 수 '+out+' 선택 및 위아래 드래그'}
          aria-pressed={selected===i}
          onClick={()=>setSelected(i)}
          onPointerDown={e=>{
            dragging.current={y:e.clientY,interval};setSelected(i);
            try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* test DOM */}
          }}
          onPointerMove={e=>{
            const info=dragging.current;if(!info)return;
            const next=bound(info.interval+Math.round((info.y-e.clientY)/15),1,10);
            setInterval(next);
          }}
          onPointerUp={e=>{
            dragging.current=null;
            try{if(e.currentTarget.hasPointerCapture?.(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);}catch{/* browser */}
          }}
          onPointerCancel={()=>{dragging.current=null;}}>{out}</button>
        {!correspond&&i<3&&<em>+{interval} →</em>}
      </div>)}
    </div>
    <div className="lab-pattern-explanation" aria-live="polite">
      {selected===null?'숫자를 눌러 이 값이 만들어지는 식을 찾아보세요.':
        correspond?
          list[selected][0]+' × '+interval+' + '+p.b+' = '+list[selected][1]:
          start+' + '+interval+' × '+selected+' = '+list[selected][1]}
    </div>
    <LabHint>수를 직접 누르면 해당 규칙을 식으로 확인할 수 있어요.
      수 카드를 위아래로 끌면 간격이 변하며 다른 수들도 함께 바뀌어요.</LabHint>
    <LabTools>
      <SmallControl label={correspond?'입력':'시작 수'} value={start} change={setStart} min={0} max={20}/>
      <SmallControl label={correspond?'곱하는 수':'늘어나는 수'} value={interval} change={setInterval} min={1} max={10}/>
      <button type="button" className="lab-action" onClick={()=>{setStart(correspond?p.c??2:p.a);setInterval(correspond?p.a:p.b);setSelected(null);}}>
        ↺ 원래 규칙</button>
    </LabTools>
  </div>;
}

export function ChanceLab({problem:p}:LabProps) {
  const total=Math.max(2,Math.min(20,p.a+p.b));
  const [colors,setColors]=useState<boolean[]>(()=>Array.from({length:total},(_,i)=>i<p.a));
  const [draw,setDraw]=useState<boolean|null>(null);
  const [times,setTimes]=useState([0,0]);
  const blue=colors.filter(Boolean).length;
  const chance=blue/total*100;
  const flip=(index:number)=>setColors(prev=>prev.map((v,i)=>i===index?!v:v));
  const sample=()=>{
    const selected=Math.floor(Math.random()*colors.length);
    const isBlue=colors[selected];
    setDraw(isBlue);
    setTimes(prev=>[prev[0]+(isBlue?1:0),prev[1]+1]);
  };
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{displayNumber(chance,1)}%</strong><span> 파란 공을 뽑을 가능성</span></div>
    <div className="lab-chance-tray" role="group" aria-label="공을 터치해 색깔을 바꿔 보세요">
      {colors.map((v,i)=><button type="button" key={i} aria-label={(i+1)+'번째 공, '+(v?'파란':'주황')+'색, 터치해 색 바꾸기'}
        className={'lab-chance-ball'+(v?' lab-chance-ball--blue':' lab-chance-ball--amber')}
        onClick={()=>{flip(i);setDraw(null);}} />)}
    </div>
    <div className="lab-math-feedback">
      <strong>{blue}/{total}</strong><span>파랑 {blue}개 · 주황 {total-blue}개</span>
    </div>
    <LabTools>
      <button type="button" className="lab-action lab-action--accent" onClick={sample}>🎲 공 한 개 무작위 뽑기</button>
      <button type="button" className="lab-action" onClick={()=>{
        setColors(Array.from({length:total},(_,i)=>i<p.a));setDraw(null);setTimes([0,0]);
      }}>↺ 다시 시작</button>
    </LabTools>
    <LabHint>{draw===null?'공을 터치해 색을 바꾸거나 무작위로 한 개 뽑아 보세요.':
      '이번에는 '+(draw?'🔵 파란':'🟠 주황')+' 공이 나왔어요.'}
      {times[1]>0?' '+times[1]+'번 뽑아 파란 공 '+times[0]+'번!':''}</LabHint>
  </div>;
}
