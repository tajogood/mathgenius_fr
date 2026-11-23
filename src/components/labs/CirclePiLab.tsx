import {useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import type {LabProps} from './types';
import {bound,LabHint,LabTools,SmallControl} from './types';

export function CirclePiLab({problem:p}:LabProps){
  const start=bound(Math.round(p.a),1,10);
  const [radius,setRadius]=useState(start);
  const [traced,setTraced]=useState(0);
  const [unrolled,setUnrolled]=useState(false);
  const [topic,setTopic]=useState<'circumference'|'area'>(p.topic==='circlearea'?'area':'circumference');
  const [hint,setHint]=useState('원의 테두리를 누르거나 주황 점을 끌어 크기를 바꿔 보세요.');
  const dragging=useRef(false);
  const r=radius*8.5+10;
  const centerX=170,centerY=114;
  const diameter=2*radius,circumference=diameter*3.14,area=radius*radius*3.14;
  const percent=Number((circumference/diameter).toFixed(2));
  const setSize=(next:number)=>{
    setRadius(bound(next,1,10));setTraced(0);setUnrolled(false);
  };
  const move=(e:ReactPointerEvent<SVGSVGElement>)=>{
    const b=e.currentTarget.getBoundingClientRect();if(!b)return;
    const x=(e.clientX-b.left)*340/b.width-centerX;
    const y=(e.clientY-b.top)*228/b.height-centerY;
    const n=bound(Math.round((Math.hypot(x,y)-10)/8.5),1,10);
    setSize(n);
  };
  const stageDown=(e:ReactPointerEvent<SVGSVGElement>)=>{
    if(!(e.target as Element).closest('[data-radius-control]'))return;
    dragging.current=true;
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* simulated DOM */}
  };
  const stageUp=(e:ReactPointerEvent<SVGSVGElement>)=>{
    dragging.current=false;
    try{if(e.currentTarget.hasPointerCapture?.(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);}catch{/* released */}
  };
  const marker=Math.PI*2*traced/100-Math.PI/2;
  const markerX=centerX+Math.cos(marker)*r,markerY=centerY+Math.sin(marker)*r;
  const segment=diameter*4;
  return <div className="lab-body lab-pi" data-testid="circle-pi-lab">
    <div className="pi-intro">
      <strong>원주율은 원의 둘레가 지름의 몇 배인지 알려주는 수예요.</strong>
      <span>원의 크기가 달라도 원주 ÷ 지름의 값은 거의 3.14예요.</span>
    </div>
    <div className="pi-switch" role="group" aria-label="원의 원주율과 넓이 선택">
      <button type="button" aria-pressed={topic==='circumference'}
        onClick={()=>setTopic('circumference')}>원을 둘러싼 길이 (원주)</button>
      <button type="button" aria-pressed={topic==='area'}
        onClick={()=>setTopic('area')}>원 안쪽의 넓이</button>
    </div>
    <svg className="pi-circle-svg" viewBox="0 0 340 228" role="group" tabIndex={0}
      aria-label={'반지름 '+radius+'cm인 원의 테두리를 따라가고 주황 점을 이동하기'}
      onPointerDown={stageDown} onPointerMove={e=>{if(dragging.current)move(e);}}
      onPointerUp={stageUp} onPointerCancel={stageUp}>
      <defs><pattern id="pi-grid" width="21" height="21" patternUnits="userSpaceOnUse">
        <path d="M21 0H0V21" stroke="#dfe9fb" strokeWidth="1" fill="none"/></pattern></defs>
      <rect width="340" height="228" rx="11" fill="url(#pi-grid)" pointerEvents="none"/>
      <circle cx={centerX} cy={centerY} r={r} fill="#d3dffd"
        stroke="#6e87d2" strokeWidth="4"/>
      <circle cx={centerX} cy={centerY} r={r} fill="none"
        stroke="#eda351" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={traced+' '+(100-traced)} pathLength={100}
        transform={'rotate(-90 '+centerX+' '+centerY+')'} className="pi-traced-arc"/>
      <line x1={centerX-r} y1={centerY} x2={centerX+r} y2={centerY}
        stroke="#5475c9" strokeWidth="4" strokeDasharray="6 3"/>
      <line x1={centerX} y1={centerY} x2={centerX+r} y2={centerY}
        stroke="#e8a24d" strokeWidth="4"/>
      <circle cx={centerX} cy={centerY} r="6" fill="#445eb3"/>
      <circle data-radius-control="true" cx={centerX+r} cy={centerY} r="13"
        fill="#f6b261" stroke="white" strokeWidth="3" className="pi-radius-handle"/>
      {traced>0&&<circle cx={markerX} cy={markerY} r="6" fill="#e67c2d"
        stroke="white" strokeWidth="2" pointerEvents="none"/>}
      <text x={centerX} y={centerY-12} textAnchor="middle" fontSize="11" fontWeight="900"
        fill="#4e68b8" pointerEvents="none">지름 {diameter}cm</text>
      <text x={centerX+r/2} y={centerY+18} textAnchor="middle" fontSize="11"
        fontWeight="800" fill="#a06a36" pointerEvents="none">반지름 {radius}cm</text>
    </svg>
    <div className="pi-stats" aria-live="polite">
      <span>지름 <strong>{diameter}cm</strong></span>
      <span>원주 <strong>약 {Number(circumference.toFixed(2))}cm</strong></span>
      <span>원주 ÷ 지름 <strong>≈ {percent}</strong></span>
    </div>
    <div className="pi-progress">
      <label htmlFor="pi-trace-slider">원을 따라 잰 길이 {traced}%</label>
      <input type="range" id="pi-trace-slider" aria-label="원의 테두리를 따라 측정한 비율"
        min="0" max="100" step="5" value={traced}
        onChange={e=>{setTraced(Number(e.target.value));setHint('주황색으로 표시된 길이가 원주예요.');}}/>
      <button type="button" className="lab-action" onClick={()=>{
        setTraced(100);setHint('주황색 선이 한 바퀴 돌아 원주 전체를 측정했어요.');
      }}>↻ 줄자로 한 바퀴 재기</button>
    </div>
    <div className="pi-reveal">
      <button type="button" className="lab-action" aria-expanded={unrolled} onClick={()=>{
        setTraced(100);setUnrolled(v=>!v);
      }}>{unrolled?'▴ 줄자 접기':'▾ 잰 줄자를 펼쳐 지름과 비교'}</button>
      {unrolled&&<div className="pi-unroll" data-testid="pi-unroll-explanation" aria-live="polite">
        <strong>원주 길이는 지름 3개에 조금 더한 길이!</strong>
        <div className="pi-diameter-track" style={{width:segment*3.14+'px'}}
          role="img" aria-label={'원주 약 '+Number(circumference.toFixed(2))+'cm는 지름 '+diameter+'cm의 3.14배'}>
          <span style={{width:segment+'px'}}>지름 1개</span>
          <span style={{width:segment+'px'}}>지름 1개</span>
          <span style={{width:segment+'px'}}>지름 1개</span>
          <i title="지름의 약 0.14배" style={{width:segment*.14+'px'}}/>
        </div>
        <div className="pi-equation"><strong>원주 ÷ 지름 = 원주율 ≈ 3.14</strong></div>
        <p>π(파이)는 원주율을 나타내는 기호예요. 초등학교에서는 먼저
          ‘원주율 ≈ 3.14’의 의미를 이해하면 됩니다. π는 3.14와 정확히 같지는 않아요.</p>
      </div>}
    </div>
    <div className="pi-concept-summary" aria-live="polite">
      {topic==='circumference'?<><strong>원의 둘레 = 지름 × 원주율</strong>
        <span>{diameter} × 3.14 ≈ {Number(circumference.toFixed(2))}cm</span></>:
        <><strong>원의 넓이 = 반지름 × 반지름 × 원주율</strong>
        <span>{radius} × {radius} × 3.14 ≈ {Number(area.toFixed(2))}cm²</span></>}
      <small>{hint}</small>
    </div>
    <LabTools>
      <SmallControl label="반지름" min={1} max={10} value={radius} change={setSize}/>
      <button type="button" className="lab-action" onClick={()=>{
        setSize(start);setTopic(p.topic==='circlearea'?'area':'circumference');
        setHint('원의 크기가 바뀌어도 원주 ÷ 지름은 약 3.14예요.');
      }}>↺ 처음 원</button>
    </LabTools>
    <LabHint>원을 직접 키우고 줄자를 한 바퀴 감은 다음 펼쳐 보세요.
      원을 크게 그려도 지름을 약 3.14번 이어 붙이면 원주가 된다는 사실을 확인할 수 있어요.</LabHint>
  </div>;
}
