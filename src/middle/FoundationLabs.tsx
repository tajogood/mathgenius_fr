import {useState,type ReactNode} from 'react';
import {dotRepeat} from './notation.ts';
import type {MiddleTopic} from './curriculum.ts';
import './foundation-labs.css';

const range=(count:number)=>Array.from({length:Math.max(0,count)},(_,i)=>i);
const signed=(n:number)=>(n>=0?' + ':' − ')+Math.abs(n);
const sup=(n:number)=>String(n).replace(/[0-9]/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);

function ConceptPanel({title,children}:{title:string;children:ReactNode}){
  return <section className="discovery-lab"><div className="discovery-heading"><span>직접 해보기</span><h3>{title}</h3></div>{children}</section>;
}
function Slider({id,label,value,min,max,onChange}:{id:string;label:string;value:number;min:number;max:number;onChange:(n:number)=>void}){
  return <div className="discovery-slider">
    <label htmlFor={id}>{label} <strong>{value}</strong></label>
    <input id={id} type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/>
  </div>;
}
function ExpressionLab(){
  const [x,setX]=useState(3),[a,setA]=useState(3),[b,setB]=useState(2);
  return <ConceptPanel title="x의 값을 바꾸면 모든 x가 함께 변할까요?">
    <p>글자 x는 아직 정해지지 않은 수예요. 먼저 x의 값을 정하고, 그 수를 실제로 대입해 보세요.</p>
    <div className="discovery-grid">
      <div className="discovery-controls">
        <Slider id="expression-x" label="문자 x에 넣을 수" min={-5} max={8} value={x} onChange={setX}/>
        <Slider id="expression-a" label="x가 몇 개인가요?" min={1} max={6} value={a} onChange={setA}/>
        <Slider id="expression-b" label="마지막에 더할 수" min={-6} max={8} value={b} onChange={setB}/>
      </div>
      <div className="discovery-canvas">
        <div className="discovery-token-line" aria-label={'x 카드 '+a+'장'}>
          {range(a).map(i=><span key={i} className="discovery-x-card">{x}</span>)}
          <b>{b>=0?'+':'−'}</b><span className="discovery-number-card">{Math.abs(b)}</span>
        </div>
        <div className="discovery-big-formula">{a}x{signed(b)}</div>
        <p>각 x 자리에 <strong>{x}</strong>을 넣어요.</p>
        <div className="discovery-big-formula">{a} × ({x}){signed(b)} = <strong>{a*x+b}</strong></div>
      </div>
    </div>
    <div className="discovery-result">발견: x가 1 커지면 식의 값은 <strong>{a}</strong>만큼 커져요. x가 {a}개 있기 때문이에요.</div>
  </ConceptPanel>;
}

function EquationLab(){
  const [a,setA]=useState(3),[b,setB]=useState(2),[secret,setSecret]=useState(4),[stage,setStage]=useState(0);
  const total=a*secret+b;
  const cubes=(n:number)=>range(n).map(i=><span key={i} className="discovery-cube"/>);
  const bags=(n:number)=>range(n).map(i=><span key={i} className="discovery-bag">x</span>);
  const leftBags=stage===2?1:a,rightCubes=stage===0?total:stage===1?a*secret:secret;
  function newPuzzle(){
    setA(2+Math.floor(Math.random()*4));setB(1+Math.floor(Math.random()*7));
    setSecret(2+Math.floor(Math.random()*5));setStage(0);
  }
  return <ConceptPanel title="양쪽에 똑같이 계산해서 x를 찾아요">
    <p>왼쪽과 오른쪽은 같아요. x는 **모든 주머니에 들어 있는 같은 개수의 구슬을 뜻해요.</p>
    <div className="discovery-eq-title" aria-label="풀어야 할 일차방정식">
      {stage===0?a+'x + '+b+' = '+total:stage===1?a+'x = '+a*secret:'x = '+secret}
    </div>
    <div className="discovery-balance">
      <div><h4>왼쪽</h4><div className="discovery-pieces">{bags(leftBags)}{stage===0&&cubes(b)}</div></div>
      <div className="discovery-balance-equal">=</div>
      <div><h4>오른쪽</h4><div className="discovery-pieces">{cubes(rightCubes)}</div></div>
    </div>
    <div className="discovery-actions">
      {stage===0&&<button type="button" onClick={()=>setStage(1)}>양쪽에서 {b}개씩 빼기 →</button>}
      {stage===1&&<button type="button" onClick={()=>setStage(2)}>양쪽을 {a}묶음으로 나누기 →</button>}
      {stage===2&&<div role="status" className="discovery-result">완성! x 한 묶음은 {secret}개예요. 검산: {a}×{secret}+{b}={total} ✓</div>}
      <button type="button" className="discovery-secondary" onClick={newPuzzle}>↻ 새로운 방정식</button>
    </div>
    <p className="discovery-caption">{stage===0?'양쪽에서 같은 수를 빼도 균형이 유지돼요.':stage===1?'양쪽을 같은 수로 나누어도 균형이 유지돼요.':'구한 x를 원래 식에 넣어도 양쪽이 같아요.'}</p>
  </ConceptPanel>;
}

type DecimalStep={before:number;timesTen:number;digit:number;after:number};
function RepeatingLab(){
  const [numerator,setNumerator]=useState(1),[denominator,setDenominator]=useState(7);
  const [steps,setSteps]=useState<DecimalStep[]>([]);
  const integer=Math.floor(numerator/denominator),initial=numerator%denominator;
  const remainder=steps.length?steps[steps.length-1].after:initial;
  const seen=[initial,...steps.map(s=>s.after)];
  const firstRepeat=remainder===0?-1:seen.slice(0,-1).indexOf(remainder);
  const finished=remainder===0||firstRepeat>=0;
  const digits=steps.map(s=>s.digit).join('');
  const expression=steps.length===0?(initial===0?String(integer):'아직 계산하지 않았어요'):remainder===0?
    String(integer)+'.'+digits:
    firstRepeat>=0?dotRepeat(integer,digits.slice(0,firstRepeat),digits.slice(firstRepeat)):
      String(integer)+'.'+digits+'…';
  function next(){
    if(finished)return;
    const current=remainder*10;
    setSteps(list=>[...list,{before:remainder,timesTen:current,digit:Math.floor(current/denominator),after:current%denominator}]);
  }
  function reset(n=numerator,d=denominator){setNumerator(n);setDenominator(d);setSteps([]);}
  return <ConceptPanel title="나눗셈의 나머지가 반복되면 소수도 반복돼요">
    <p>종이에 하던 나눗셈을 한 자리씩 계산해 보세요. 나머지가 <strong>0이 되거나 전에 나왔던 수로 돌아오는 순간</strong>을 찾아요.</p>
    <div className="discovery-grid">
      <div className="discovery-controls">
        <Slider id="recurring-n" label="분자" min={1} max={12} value={numerator} onChange={n=>reset(n,denominator)}/>
        <Slider id="recurring-d" label="분모" min={2} max={15} value={denominator} onChange={d=>reset(numerator,d)}/>
        <div className="discovery-fraction"><span>{numerator}</span><i/><span>{denominator}</span></div>
        <div className="discovery-actions"><button type="button" disabled={finished} onClick={next}>다음 소수 자리 계산하기 →</button>
          <button type="button" className="discovery-secondary" onClick={()=>reset()}>↻ 다시 나누기</button></div>
      </div>
      <div className="discovery-canvas">
        <h4>계산한 소수</h4><div className="discovery-big-formula">{expression}</div>
        <p>지금 나머지: <strong>{remainder}</strong></p>
        {finished&&<div className="discovery-result">{remainder===0?'나머지가 0이어서 유한소수예요!':'나머지 '+remainder+'이 다시 나왔어요. 앞으로 숫자가 같은 순서로 반복돼요!'}</div>}
        <div className="discovery-decimal-steps" aria-label="나눗셈 단계">
          {steps.map((s,i)=><div key={i}>
            <span>{i+1}번째 소수 자리</span><strong>{s.timesTen} ÷ {denominator} → {s.digit}</strong>
            <span>나머지 {s.after}</span>
          </div>)}
        </div>
      </div>
    </div>
  </ConceptPanel>;
}

function ExponentLab(){
  const [base,setBase]=useState(2),[left,setLeft]=useState(2),[right,setRight]=useState(3),[merged,setMerged]=useState(false);
  return <ConceptPanel title="밑이 같은 거듭제곱을 곱하면 지수는 왜 더할까요?">
    <p>지수는 같은 수를 곱하는 <strong>횟수</strong>예요. 두 묶음의 카드가 하나로 합쳐지는 모습을 확인해 보세요.</p>
    <div className="discovery-grid">
      <div className="discovery-controls">
        <Slider id="power-base" label="같은 밑" min={2} max={5} value={base} onChange={setBase}/>
        <Slider id="power-left" label="첫 번째 묶음 지수" min={1} max={4} value={left} onChange={n=>{setLeft(n);setMerged(false)}}/>
        <Slider id="power-right" label="두 번째 묶음 지수" min={1} max={4} value={right} onChange={n=>{setRight(n);setMerged(false)}}/>
        <button type="button" className="discovery-merge" onClick={()=>setMerged(v=>!v)}>{merged?'두 묶음으로 다시 보기':'곱셈을 한 묶음으로 모으기 →'}</button>
      </div>
      <div className="discovery-canvas">
        <div className="discovery-big-formula">{base}{sup(left)} × {base}{sup(right)} = {base}{sup(left+right)}</div>
        <div className="discovery-power-cards" aria-label={'총 '+(left+right)+'개의 '+base+' 곱셈 인수'}>
          {range(left+right).map(i=><span key={i} className={merged?'discovery-factor merged':i<left?'discovery-factor first':'discovery-factor second'}>{base}</span>)}
        </div>
        <p>왼쪽 {left}개 + 오른쪽 {right}개 = 총 {left+right}개</p>
        <div className="discovery-big-formula">{base}{sup(left+right)} = <strong>{(base**(left+right)).toLocaleString('ko-KR')}</strong></div>
      </div>
    </div>
    <div className="discovery-result">발견: 밑은 <strong>{base}</strong>로 그대로이고, 곱해진 인수의 개수만 <strong>{left}+{right}={left+right}</strong>로 늘어납니다.</div>
  </ConceptPanel>;
}

function CountingLab(){
  const [shirts,setShirts]=useState(3),[pants,setPants]=useState(4),[chosen,setChosen]=useState<[number,number]|null>(null);
  return <ConceptPanel title="서로 다른 옷을 한 가지씩 고르면 몇 가지일까요?">
    <p>첫 번째 선택의 각각에 두 번째 선택이 모두 연결돼요. 실제로 하나씩 선택해 모든 조합을 확인하세요.</p>
    <div className="discovery-grid">
      <div className="discovery-controls">
        <Slider id="count-shirts" label="윗옷 종류" min={2} max={6} value={shirts} onChange={v=>{setShirts(v);setChosen(null)}}/>
        <Slider id="count-pants" label="바지 종류" min={2} max={6} value={pants} onChange={v=>{setPants(v);setChosen(null)}}/>
        <div className="discovery-big-formula">{shirts} × {pants} = {shirts*pants}가지</div>
        <div className="discovery-result">윗옷 하나마다 바지 {pants}가지가 있고, 그런 윗옷이 {shirts}개예요.</div>
      </div>
      <div className="discovery-canvas">
        <p>각 칸을 눌러서 조합을 확인하세요.</p>
        <div className="discovery-combination-grid" style={{gridTemplateColumns:'repeat('+pants+',minmax(0,1fr))'}}>
          {range(shirts).flatMap(i=>range(pants).map(j=><button key={i+'-'+j}
            type="button" aria-pressed={chosen?.[0]===i&&chosen?.[1]===j}
            aria-label={(i+1)+'번째 윗옷, '+(j+1)+'번째 바지'}
            onClick={()=>setChosen([i,j])}>👕{i+1}<small>👖{j+1}</small></button>))}
        </div>
        <p aria-live="polite">{chosen?'선택한 조합: 윗옷 '+(chosen[0]+1)+'번 + 바지 '+(chosen[1]+1)+'번':'원하는 조합을 하나 선택해 보세요.'}</p>
      </div>
    </div>
  </ConceptPanel>;
}

function InequalityLab(){
  const [threshold,setThreshold]=useState(3),[greater,setGreater]=useState(true),[negative,setNegative]=useState(false);
  const x=206+threshold*18;
  const signedNumber=(n:number)=>n<0?'−'+Math.abs(n):String(n);
  const statement=(negative?'−x '+(greater?'<':'>')+' '+signedNumber(-threshold):
    'x '+(greater?'>':'<')+' '+signedNumber(threshold));
  return <ConceptPanel title="부등호가 가리키는 쪽이 해가 되는 방향이에요">
    <p>빈 동그라미는 경계값 자체가 포함되지 않는다는 뜻입니다. 음수를 곱하면 부등호 방향이 바뀌어요.</p>
    <div className="discovery-grid">
      <div className="discovery-controls">
        <Slider id="ineq-bound" label="경계값" min={-8} max={8} value={threshold} onChange={setThreshold}/>
        <div className="discovery-switch" role="group" aria-label="해의 방향">
          <button aria-pressed={greater} type="button" onClick={()=>setGreater(true)}>x가 더 클 때 ( &gt; )</button>
          <button aria-pressed={!greater} type="button" onClick={()=>setGreater(false)}>x가 더 작을 때 ( &lt; )</button>
        </div>
        <button className="discovery-merge" type="button" aria-pressed={negative} onClick={()=>setNegative(v=>!v)}>
          {negative?'원래 식으로 보기':'양쪽에 −1을 곱해 보기'}
        </button>
      </div>
      <div className="discovery-canvas">
        <div className="discovery-big-formula">{statement}</div>
        <svg viewBox="0 0 412 195" role="img" aria-label={'경계값 '+threshold+'을 제외하고 '+(greater?'오른쪽':'왼쪽')+'을 색칠한 해의 수직선'} className="discovery-ineq-svg">
          <line x1="28" y1="102" x2="384" y2="102" stroke="#aab6d0" strokeWidth="3"/>
          {range(19).map(i=><g key={i}><line x1={206+(i-9)*18} y1="96" x2={206+(i-9)*18} y2="108" stroke="#a0aec5"/>
            {(i-9)%3===0&&<text x={206+(i-9)*18} y="128" textAnchor="middle" fill="#7a88a5" fontSize="12">{i-9}</text>}</g>)}
          <line x1={greater?x+7:34} y1="102" x2={greater?379:x-7} y2="102" stroke="#5270df" strokeWidth="8" strokeLinecap="round"/>
          <path d={greater?'M385,102 l-14,-9 v18 Z':'M27,102 l14,-9 v18 Z'} fill="#5270df"/>
          <circle cx={x} cy="102" r="9" fill="#fff" stroke="#5270df" strokeWidth="4"/>
          <text x={x} y="78" fontSize="16" fontWeight="800" fill="#3f59c2" textAnchor="middle">{threshold}</text>
        </svg>
        <p>{negative?'음수 −1을 곱해 부등호를 뒤집었습니다.':'빈 동그라미를 기준으로 색칠한 방향의 모든 수가 해입니다.'}</p>
        <div className="discovery-result">해: x {greater?'>':'<'} {threshold}. {threshold}은 해가 아니에요.</div>
      </div>
    </div>
  </ConceptPanel>;
}
const specialized=['expressions','equations','recurring','exponents','inequalities','counting'] as const;
type Specialized=typeof specialized[number];
export const isFoundationTopic=(topic:MiddleTopic):topic is Specialized=>
  (specialized as readonly string[]).includes(topic);
export default function FoundationLab({topic}:{topic:Specialized}){
  if(topic==='expressions')return <ExpressionLab/>;
  if(topic==='equations')return <EquationLab/>;
  if(topic==='recurring')return <RepeatingLab/>;
  if(topic==='exponents')return <ExponentLab/>;
  if(topic==='inequalities')return <InequalityLab/>;
  return <CountingLab/>;
}
