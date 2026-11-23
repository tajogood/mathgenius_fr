import {useRef,useState} from 'react';
import './geometry-interactions.css';
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function CoordinateDiscovery(){
  const [x,setX]=useState(3),[y,setY]=useState(4);
  const canvas=useRef<SVGSVGElement>(null);
  const quadrant=x===0?'y축 위':y===0?'x축 위':x>0?(y>0?'제1사분면':'제4사분면'):y>0?'제2사분면':'제3사분면';
  const step=16,center=205,mid=136;
  function updateFromPointer(clientX:number,clientY:number){
    const svg=canvas.current,matrix=svg?.getScreenCTM();
    if(!matrix)return;
    const point=new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse());
    setX(clamp(Math.round((point.x-center)/step),-8,8));
    setY(clamp(Math.round((mid-point.y)/step),-7,7));
  }
  return <section className="tactile-lesson">
    <h3>점을 직접 잡아 이동시키고 좌표를 읽어 보세요.</h3>
    <p>먼저 좌우로 움직이면 x값이, 위아래로 움직이면 y값이 변합니다.</p>
    <div className="tactile-grid">
      <div className="tactile-controls">
        <label htmlFor="point-x">x좌표 <strong>{x}</strong></label>
        <input id="point-x" type="range" min="-8" max="8" value={x} onChange={e=>setX(Number(e.target.value))}/>
        <label htmlFor="point-y">y좌표 <strong>{y}</strong></label>
        <input id="point-y" type="range" min="-7" max="7" value={y} onChange={e=>setY(Number(e.target.value))}/>
        <p className="tactile-answer" aria-live="polite">P = ({x}, {y})<small>{quadrant}</small></p>
      </div>
      <svg ref={canvas} viewBox="0 0 412 272" className="tactile-svg" role="img"
        aria-label={'끌어서 이동할 수 있는 점 P는 ('+x+', '+y+')이며 '+quadrant+'에 있습니다.'}
        onPointerDown={e=>{
          e.preventDefault();
          try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* pointer capture optional */}
          updateFromPointer(e.clientX,e.clientY);
        }}
        onPointerMove={e=>{if(e.buttons===1)updateFromPointer(e.clientX,e.clientY)}}
        onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{/* released */}}}>
        {Array.from({length:17},(_,i)=>i-8).map(i=><g key={i}>
          <line x1={center+i*step} y1="8" x2={center+i*step} y2="264" stroke="#ebeff8"/>
          {i<=7&&<line x1="70" y1={mid+i*step} x2="341" y2={mid+i*step} stroke="#ebeff8"/>}
        </g>)}
        <line x1="64" y1={mid} x2="346" y2={mid} stroke="#7387b0" strokeWidth="2"/>
        <line x1={center} y1="7" x2={center} y2="265" stroke="#7387b0" strokeWidth="2"/>
        {[-8,-4,0,4,8].map(n=><text key={n} x={center+n*step} y={mid+17}
          fontSize="10" textAnchor="middle" fill="#8594ac">{n}</text>)}
        <line x1={center+x*step} y1={mid-y*step} x2={center+x*step} y2={mid}
          stroke="#e69e5e" strokeWidth="2" strokeDasharray="5 4"/>
        <line x1={center} y1={mid-y*step} x2={center+x*step} y2={mid-y*step}
          stroke="#e69e5e" strokeWidth="2" strokeDasharray="5 4"/>
        <circle cx={center+x*step} cy={mid-y*step} r="10" fill="#4d64d9" stroke="#fff" strokeWidth="3"/>
        <text x={center+x*step+12} y={mid-y*step-12} fontSize="13" fill="#3f58ac" fontWeight="800">P</text>
        <text x="235" y="260" fill="#6779a1" fontSize="11">점 P를 직접 끌어보세요</text>
      </svg>
    </div>
    <p className="tactile-why">확인: x가 양수면 y축 오른쪽, y가 음수면 x축 아래에 위치합니다. 축 위의 점은 사분면에 포함되지 않습니다.</p>
  </section>;
}
const squareFree=[2,3,5,6,7] as const;
export function RadicalDiscovery(){
  const [a,setA]=useState(3),[b,setB]=useState<number>(2),[open,setOpen]=useState(false);
  const n=a*a*b;
  function reset(newA:number,newB:number){setA(newA);setB(newB);setOpen(false);}
  return <section className="tactile-lesson">
    <h3>근호 안에서 한 쌍의 같은 수를 찾아보세요.</h3>
    <p>같은 양의 수가 두 번 곱해졌다면 제곱근 밖으로 한 개를 꺼낼 수 있어요.</p>
    <div className="tactile-grid">
      <div className="tactile-controls">
        <label htmlFor="radical-a">짝을 이루는 수 <strong>{a}</strong></label>
        <input id="radical-a" type="range" min="2" max="7" value={a} onChange={e=>reset(Number(e.target.value),b)}/>
        <p className="tactile-label">짝 없이 남을 수</p>
        <div className="tactile-choices" role="group" aria-label="근호 안에 남길 수">
          {squareFree.map(v=><button type="button" key={v} aria-pressed={b===v}
            onClick={()=>reset(a,v)}>{v}</button>)}
        </div>
        <button type="button" className="tactile-action" onClick={()=>setOpen(v=>!v)}>
          {open?'↻ 다시 묶기':'같은 수 두 개를 짝지어 꺼내기 →'}</button>
      </div>
      <div className="tactile-display" aria-live="polite">
        <div className="tactile-formula">√{n}</div>
        <div className="tactile-factor-row">
          <span className={open?'tactile-pair outside':'tactile-pair'}>{a}</span>
          <span className={open?'tactile-pair outside':'tactile-pair'}>{a}</span>
          <span className="tactile-unpaired">{b}</span>
        </div>
        {open?<div className="tactile-formula">√({a}×{a}×{b}) = <strong>{a}√{b}</strong></div>:
          <div className="tactile-formula">√({a}×{a}×{b})</div>}
        <p>{open?'같은 수 '+a+'가 두 번 곱해져 있으므로 근호 밖에서 '+a+'이 됩니다.':'두 개의 '+a+'가 한 쌍을 이루고, '+b+'는 근호 안에 남습니다.'}</p>
      </div>
    </div>
    <p className="tactile-why">확인: ({a}√{b})² = {a*a}×{b} = {n} 이므로 같은 수입니다.</p>
  </section>;
}
export function DispersionDiscovery(){
  const [gap,setGap]=useState(3),[mean,setMean]=useState(6);
  const values=[mean-gap,mean,mean+gap],variance=2*gap*gap/3;
  const x=(v:number)=>206+(v-mean)*9;
  return <section className="tactile-lesson">
    <h3>평균은 그대로인데 자료만 벌어지면 어떻게 될까요?</h3>
    <p>자료 세 개를 평균 중심으로 좌우에 같은 간격으로 놓고 간격을 바꿔 보세요.</p>
    <div className="tactile-grid">
      <div className="tactile-controls">
        <label htmlFor="spread-gap">평균에서 떨어진 거리 <strong>{gap}</strong></label>
        <input id="spread-gap" type="range" min="1" max="9" value={gap} onChange={e=>setGap(Number(e.target.value))}/>
        <label htmlFor="spread-mean">평균 <strong>{mean}</strong></label>
        <input id="spread-mean" type="range" min="-4" max="12" value={mean} onChange={e=>setMean(Number(e.target.value))}/>
        <div className="tactile-answer">평균 {mean}<small>분산 {Math.round(variance*100)/100}</small></div>
      </div>
      <svg className="tactile-svg" viewBox="0 0 412 272" role="img"
        aria-label={'자료 '+values.join(', ')+', 평균 '+mean+', 분산 '+Math.round(variance*100)/100}>
        <line x1="52" y1="150" x2="360" y2="150" stroke="#9aaac5" strokeWidth="3"/>
        <line x1="206" y1="41" x2="206" y2="231" stroke="#61b09d" strokeWidth="2" strokeDasharray="6 5"/>
        <text x="206" y="33" textAnchor="middle" fontSize="13" fill="#26957b">평균 {mean}</text>
        {values.map((v,i)=><g key={i}>
          <line x1={x(v)} y1="150" x2={x(v)} y2={i===1?91:117} stroke="#a0b4db" strokeWidth="3"/>
          <circle cx={x(v)} cy={i===1?91:117} r="11" fill={i===1?'#51b79b':'#5970d8'}/>
          <text x={x(v)} y="177" fontSize="15" textAnchor="middle" fill="#50659d" fontWeight="800">{v}</text>
        </g>)}
        <text x="206" y="221" fontSize="14" textAnchor="middle" fill="#5467b1">편차: −{gap}, 0, +{gap}</text>
        <text x="206" y="244" fontSize="13" textAnchor="middle" fill="#6b7c9d">분산 = ( {gap*gap} + 0 + {gap*gap} ) ÷ 3</text>
      </svg>
    </div>
    <p className="tactile-why">발견: 간격이 두 배면 편차 제곱은 네 배이므로 분산도 네 배입니다. 평균 {mean}은 변하지 않습니다.</p>
  </section>;
}
