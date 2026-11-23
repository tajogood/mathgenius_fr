import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { LabProps } from './types';
import { LabHint, LabTools, SmallControl, bound } from './types';
import { displayNumber } from '../../interactions.ts';
import { gcd, lcm } from '../../math.ts';
import { Fraction, MathText } from '../MathText.tsx';

type PieceBarProps = { n:number; d:number; color:'blue'|'amber'; onChange:(value:number)=>void; title:string };
function PieceBar({n,d,color,onChange,title}:PieceBarProps) {
  const rows=Math.max(1,Math.ceil(n/d));
  return <div className="lab-fraction-group">
    <div className="lab-fraction-caption"><strong>{title}</strong><span><Fraction numerator={n} denominator={d}/></span></div>
    {Array.from({length:rows},(_,row)=>
      <div className="lab-fraction-row" role="group" key={row} style={{gridTemplateColumns:'repeat('+d+',minmax(0,1fr))'}}>
        {Array.from({length:d},(_,i)=>{
          const index=row*d+i,filled=index<n;
          return <button key={i} type="button" aria-label={(index+1)+'번째 분수 칸 '+(filled?'색칠됨':'빈칸')+', 눌러 색칠 수 바꾸기'}
            aria-pressed={filled}
            className={'lab-frac-cell lab-frac-cell--'+color+(filled?' lab-frac-cell--filled':'')}
            onClick={()=>onChange(index+1===n?n-1:index+1)}/>;
        })}
      </div>)}
  </div>;
}

function fractionInputs(p:LabProps['problem']) {
  const t=p.topic;
  const firstN=t==='fractiontypes'?(p.a===2?p.b+(p.c??1):p.c??1):p.a;
  const firstD=t==='samefraction'?p.c??p.b:t==='probability'?10:p.b;
  const two=['fraction','fractionmul','fractiondiv','fractioncompare','fractionsub','samefraction'].includes(t);
  const secondN=t==='samefraction'?p.b:p.c??0;
  const secondD=t==='samefraction'?p.c??p.b:p.d??p.b;
  return {firstN,firstD,secondN,secondD,two};
}
function reducedFraction(n:number,d:number):string {
  if(d===0) return '계산 불가';
  const g=gcd(Math.abs(n),Math.abs(d));
  return (n/g)+'/'+(d/g);
}

export function FractionsLab({problem:p,phase,step}:LabProps) {
  const {firstN,firstD,secondN,secondD,two}=fractionInputs(p);
  const [factor,setFactor]=useState(1);
  const [left,setLeft]=useState(firstN);
  const [right,setRight]=useState(secondN);
  const [notice,setNotice]=useState('');
  const totalDen=firstD*factor;
  const fixedLeft=firstN/firstD;
  const fractionValue=left/totalDen;
  const rhsValue=right/secondD;
  const same=two && Math.abs(fractionValue-rhsValue)<1e-9;
  const maxFactor=Math.max(1,Math.min(6,Math.floor(36/firstD)));
  const multiply=p.topic==='fractionmul';
  const divide=p.topic==='fractiondiv';
  const add=p.topic==='fraction'||p.topic==='samefraction'&&p.mode!=='subtract';
  const subtract=p.topic==='fractionsub'||p.topic==='samefraction'&&p.mode==='subtract';
  const compare=p.topic==='fractioncompare';
  const operation=multiply?'×':divide?'÷':add?'+':subtract?'−':compare?'?':'';
  const calculated=two?(multiply?reducedFraction(left*right,totalDen*secondD):
    divide?(right===0?'0으로 나눌 수 없어요':reducedFraction(left*secondD,totalDen*right)):
    add?reducedFraction(left*secondD+right*totalDen,totalDen*secondD):
    subtract?reducedFraction(left*secondD-right*totalDen,totalDen*secondD):
    compare?Math.abs(fractionValue-rhsValue)<1e-9?'=':fractionValue>rhsValue?'>':'<':
    ''):reducedFraction(left,totalDen);
  useEffect(()=>{
    if(phase==='concept'&&step===1&&two){
      const next=Math.min(maxFactor,Math.max(1,lcm(firstD,secondD)/firstD));
      setFactor(next);setLeft(firstN*next);setNotice('');
    }
  },[phase,step,two,firstN,firstD,secondD,maxFactor]);
  const changeFactor=(next:number)=>{
    const desired=Math.max(1,Math.min(maxFactor,next));
    const newNumerator=left*desired/factor;
    if(!Number.isInteger(newNumerator)){
      setNotice('지금 색칠한 양을 이 칸 수로는 정확히 나눌 수 없어요. 먼저 색칠한 칸을 조정하거나 원래 분수로 돌아가 보세요.');
      return;
    }
    setFactor(desired);setLeft(newNumerator);setNotice('');
  };
  const updateLeft=(n:number)=>{setLeft(n);setNotice('');};
  const updateRight=(n:number)=>{setRight(n);setNotice('');};
  const reset=()=>{setFactor(1);setLeft(firstN);setRight(secondN);setNotice('');};
  return <div className="lab-body">
    <div className="lab-hero-count">
      <strong><Fraction numerator={left} denominator={totalDen}/></strong><span> = {displayNumber(fractionValue,3)} 전체</span>
    </div>
    <div className="lab-fractions">
      <div className="lab-whole-ruler"><span>전체 길이는 언제나 같아요 = 1</span></div>
      <PieceBar n={left} d={totalDen} title="첫 번째 분수 · 눌러 색칠해 보세요"
        color="blue" onChange={updateLeft}/>
      {two&&<PieceBar n={right} d={secondD} title="두 번째 분수 · 눌러 색칠해 보세요"
        color="amber" onChange={updateRight}/>}
    </div>
    {multiply&&<div className="lab-fraction-area" role="img"
      aria-label={'첫 번째 분수 '+left+'/'+totalDen+'와 두 번째 분수 '+right+'/'+secondD+'를 곱할 때 겹치는 부분'}>
      <div className="lab-fraction-area-grid" style={{gridTemplateColumns:'repeat('+totalDen+',minmax(0,1fr))'}}>
        {Array.from({length:totalDen*secondD},(_,i)=>{
          const x=i%totalDen, y=Math.floor(i/totalDen);
          const xSelected=x<left,ySelected=y<right;
          return <span key={i} className={
            'lab-fraction-area-cell'+(xSelected&&ySelected?' lab-fraction-area-cell--overlap':
            xSelected?' lab-fraction-area-cell--blue':ySelected?' lab-fraction-area-cell--amber':'')}/>;
        })}
      </div>
      <small>파란 세로 부분 × 주황 가로 부분 = 겹친 부분</small>
    </div>}
    {two?<div className="lab-math-feedback">
      <span className="math-expression"><Fraction numerator={left} denominator={totalDen}/> {operation} <Fraction numerator={right} denominator={secondD}/></span>
      <strong><MathText text={compare?'비교 결과: '+calculated:
        operation?'= '+calculated:
        same?'같은 크기예요!':fractionValue>rhsValue?'파란색이 더 커요':'주황색이 더 커요'}/></strong>
    </div>:<div className="lab-math-feedback">
      <span>색칠된 부분</span>
      <strong><Fraction numerator={left} denominator={totalDen}/> ({displayNumber(fractionValue*100,1)}%)</strong>
      {p.topic==='reduce'&&<span>기약분수 <MathText text={calculated}/></span>}
    </div>}
    {notice&&<LabHint>{notice}</LabHint>}
    <LabTools>
      <SmallControl label="등분을 더 잘게" value={factor} min={1} max={maxFactor} change={changeFactor}/>
      <button type="button" className="lab-action" onClick={()=>{
        const wanted=two?lcm(firstD,secondD)/firstD:factor+1;
        changeFactor(wanted);
      }}>같은 크기로 나누기</button>
      <button type="button" className="lab-action" onClick={reset}>↺ 원래 분수</button>
    </LabTools>
    <LabHint>막대의 전체 길이는 같고 점선은 등분을 뜻해요. 칸을 터치해 분자 수를 바꿔 보세요.
      {fixedLeft===fractionValue?' 분수를 더 잘게 나눠도 같은 크기예요.':' 지금은 원래 분수와 다른 크기예요.'}
      {multiply?' 두 방향이 겹치는 칸이 분수 곱셈의 크기예요.':''}</LabHint>
  </div>;
}

export function NumberlineLab({problem:p}:LabProps) {
  const t=p.topic;
  const decimals=['decimalcompare','decimaladd','decimalsub'].includes(t);
  const scale=decimals?t==='decimalcompare'?100:10:1;
  const reference=p.a/scale;
  const gap=['rounding','roundup','rounddown'].includes(t)?p.b:decimals?1:t==='range'?5:10;
  const min=t==='range'?p.a-5:Math.max(0,Math.floor(reference/gap)*gap-gap);
  const max=t==='range'?p.a+5:Math.max(reference+gap,Math.ceil(reference/gap)*gap+gap);
  const isDecimal=decimals;
  const initial=reference;
  const comparator=['compare','decimalcompare'].includes(t) ? p.b/scale : null;
  const operand=['decimaladd','decimalsub'].includes(t) ? p.b/scale : null;
  const [value,setValue]=useState(initial);
  const svgRef=useRef<SVGSVGElement>(null);
  const pos=(x:number)=>20+300*((x-min)/(max-min));
  const change=(next:number)=>setValue(bound(Math.round(next*(isDecimal?100:1))/(isDecimal?100:1),min,max));
  const pointer=(event:ReactPointerEvent<SVGSVGElement>)=>{
    const rect=svgRef.current?.getBoundingClientRect();if(!rect)return;
    const ratio=(event.clientX-rect.left)/rect.width;
    change(min+bound((ratio*340-20)/300,0,1)*(max-min));
  };
  const nextResult= t==='rounding'?Math.round(value/p.b)*p.b:
    t==='roundup'?Math.ceil(value/p.b)*p.b:t==='rounddown'?Math.floor(value/p.b)*p.b:null;
  const boundary=t==='range'?(p.mode==='이상'?value>=p.a:value>p.a):null;
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{displayNumber(value,isDecimal?2:0)}</strong><span> 수직선 위의 움직이는 점</span></div>
    <svg ref={svgRef} className="lab-numberline" viewBox="0 0 340 105" role="img"
      aria-label="수직선에서 손가락으로 위치를 옮겨 볼 수 있어요"
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);pointer(e);}}
      onPointerMove={e=>{if(e.buttons>0)pointer(e);}}>
      <line x1="20" y1="52" x2="320" y2="52" stroke="#7894d8" strokeWidth="5" strokeLinecap="round"/>
      {Array.from({length:11},(_,i)=><g key={i}>
        <line x1={20+i*30} x2={20+i*30} y1="45" y2="59" stroke="#6176be" strokeWidth="2"/>
      </g>)}
      <circle cx={pos(reference)} cy="52" r="14" fill="#ffdb9e" opacity=".7" stroke="#eda753" strokeWidth="1.5"/>
      {comparator!==null&&<g>
        <circle cx={pos(comparator)} cy="52" r="9" fill="#eead68" stroke="#fff" strokeWidth="2"/>
        <text x={pos(comparator)} y="15" fontSize="12" fill="#b2753a" textAnchor="middle">
          비교 {displayNumber(comparator,isDecimal?2:0)}</text>
      </g>}
      <circle cx={pos(value)} cy="52" r="10" fill="#526de1" stroke="#fff" strokeWidth="3"/>
      <text x={pos(value)} y="28" fontSize="17" fill="#5369d2" textAnchor="middle" fontWeight="900">{displayNumber(value,isDecimal?2:0)}</text>
      <text x="20" y="90" fontSize="13" fill="#7081aa" textAnchor="middle">{displayNumber(min,isDecimal?2:0)}</text>
      <text x="320" y="90" fontSize="13" fill="#7081aa" textAnchor="middle">{displayNumber(max,isDecimal?2:0)}</text>
    </svg>
    <div className="lab-math-feedback">
      {comparator!==null?
        <strong>{displayNumber(value,isDecimal?2:0)} {value===comparator?'=':value>comparator?'>':'<'} {displayNumber(comparator,isDecimal?2:0)}</strong>
      :operand!==null?
        <strong>{displayNumber(value,2)} {t==='decimaladd'?'+':'−'} {displayNumber(operand,2)} =
          {displayNumber(t==='decimaladd'?value+operand:value-operand,2)}</strong>
      :nextResult!==null?
        <strong>{t==='rounding'?'반올림':t==='roundup'?'올림':'버림'} 결과 {nextResult}</strong>
      :boundary!==null?<strong>현재 점은 범위에 {boundary?'포함돼요':'포함되지 않아요'}</strong>:
        <strong>원래 수와 차이 {displayNumber(Math.abs(value-reference),isDecimal?2:0)}</strong>}
    </div>
    <LabHint>파란 점을 드래그하거나 슬라이더를 움직여 보세요. 연한 주황 원은 문제의 원래 수 {displayNumber(reference,isDecimal?2:0)}예요.</LabHint>
    <LabTools>
      <label className="lab-slider-label">점 움직이기
        <input type="range" min={min} max={max} step={isDecimal?0.01:1} value={value}
          onChange={e=>change(Number(e.target.value))}/></label>
      <button type="button" className="lab-action" onClick={()=>setValue(initial)}>↺ 원래 위치</button>
    </LabTools>
  </div>;
}

export function RatiosLab({problem:p}:LabProps) {
  const [blue,setBlue]=useState(p.a);
  const [amber,setAmber]=useState(p.b);
  const total=blue+amber;
  const percentage=100*blue/total;
  const proportional=p.topic==='proportion'||p.topic==='proportionshare';
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{displayNumber(percentage,1)}%</strong><span> 파란 부분의 비율</span></div>
    <div className="lab-ratio-bar" role="img" aria-label={'파랑 '+blue+', 주황 '+amber+'의 비율'}>
      <span style={{flex:blue}}>{blue}</span><span style={{flex:amber}}>{amber}</span>
    </div>
    <div className="lab-two-marbles" role="group" aria-label="구슬의 수">
      {Array.from({length:Math.min(20,blue)},(_,i)=><button type="button" key={'b'+i}
        onClick={()=>setBlue(v=>Math.max(1,v-1))} className="lab-marble lab-marble--blue"
        aria-label="파란 구슬 한 개 줄이기" />)}
      {Array.from({length:Math.min(20,amber)},(_,i)=><button type="button" key={'o'+i}
        onClick={()=>setAmber(v=>Math.max(1,v-1))} className="lab-marble lab-marble--amber"
        aria-label="주황 구슬 한 개 줄이기" />)}
    </div>
    <LabHint>{proportional?'두 수에 같은 배수를 곱해도 비율은 그대로예요.':'구슬을 터치하면 하나씩 줄어듭니다.'}
      <br/>현재 파랑 : 주황 = {blue} : {amber}, 전체 {total}개예요.</LabHint>
    <LabTools>
      <SmallControl label="파란 구슬" value={blue} change={setBlue} min={1} max={20}/>
      <SmallControl label="주황 구슬" value={amber} change={setAmber} min={1} max={20}/>
      <button type="button" className="lab-action" onClick={()=>{setBlue(p.a);setAmber(p.b);}}>↺ 처음 비율</button>
    </LabTools>
  </div>;
}

export function MeasuresLab({problem:p}:LabProps) {
  const time=(p.topic==='lengthtime'&&p.mode==='time');
  const capacity=p.topic==='capacity';
  const weight=p.topic==='measureweight';
  const unit=time?'분':capacity?'L':weight?'kg':'m';
  const lower=time?'초':capacity?'mL':weight?'g':'cm';
  const factor=time?60:capacity||weight?1000:100;
  const [whole,setWhole]=useState(p.a);
  const [extra,setExtra]=useState(time?0:p.b);
  const [expanded,setExpanded]=useState<Set<number>>(()=>new Set());
  const wholeChange=(next:number)=>{setWhole(next);setExpanded(new Set());};
  const chunks=time?6:10;
  const chunkValue=factor/chunks;
  const toggleUnit=(index:number)=>setExpanded(prev=>{
    const next=new Set(prev);
    if(next.has(index))next.delete(index);else next.add(index);
    return next;
  });
  const sum=whole*factor+extra;
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{sum.toLocaleString('ko-KR')} {lower}</strong>
      <span> 작은 단위로 바꾼 값</span></div>
    <div className="lab-meter" role="group" aria-label="큰 단위를 직접 눌러 작은 단위로 펼쳐보기">
      {Array.from({length:Math.min(8,whole)},(_,i)=><button key={i} type="button"
        aria-pressed={expanded.has(i)}
        aria-label={(i+1)+'번째 1'+unit+' 단위를 '+factor+lower+'로 펼쳐보기'}
        onClick={()=>toggleUnit(i)}
        className={'lab-meter-whole lab-meter-whole--clickable'+(expanded.has(i)?' lab-meter-whole--opened':'')}>
        <strong>{expanded.has(i)?factor+lower:'1'+unit}</strong>
        {expanded.has(i)&&<span className="lab-unit-chunks"
          aria-label={chunks+'개로 나눈 작은 단위, 각 '+chunkValue+lower}>
          {Array.from({length:chunks},(_,j)=><i key={j} title={chunkValue+lower}/>)}
        </span>}
      </button>)}
      {extra>0&&<button type="button" className="lab-meter-extra lab-meter-extra--clickable"
        onClick={()=>setExtra(v=>Math.max(0,v-(time?10:capacity||weight?100:10)))}
        aria-label={extra+lower+'에서 작은 단위 조금 덜어내기'}>{extra}{lower} ▾</button>}
    </div>
    <div className="lab-math-feedback"><strong>{whole}{unit} + {extra}{lower}</strong>
      <span>= {sum}{lower}</span></div>
    <LabTools>
      <SmallControl label={unit} value={whole} change={wholeChange} min={0} max={8}/>
      {!time&&<label className="lab-slider-label">{lower} {extra}
        <input type="range" min={0} max={factor-1} step={capacity||weight?100:10} value={extra}
          onChange={e=>setExtra(Number(e.target.value))}/></label>}
      <button type="button" className="lab-action" onClick={()=>{setWhole(p.a);setExtra(time?0:p.b);setExpanded(new Set());}}>↺ 원래 단위</button>
    </LabTools>
    <LabHint>큰 단위 카드 하나를 직접 눌러 작은 단위 {factor}{lower}로 펼쳐 보세요.
      모양이 바뀌어도 전체 양은 같아요. 작은 단위 카드를 누르면 실제 양을 덜어낼 수도 있어요.</LabHint>
  </div>;
}
