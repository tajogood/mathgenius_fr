import {useRef,useState} from 'react';
import type {CSSProperties,PointerEvent as ReactPointerEvent} from 'react';
import type {LabProps} from './types';
import {LabHint,LabTools} from './types';
import {Fraction} from '../MathText.tsx';
import {totalOf,meanOf,nextEqualizingTransfer,transferOne,equalShares} from './averageMath.ts';

type Gesture={from:number;x:number;y:number;moved:boolean};
const captions=['첫 번째 친구','두 번째 친구','세 번째 친구'];
const presets:{label:string;values:[number,number,number]}[]=[
  {label:'9·13·4 (나머지 있음)',values:[9,13,4]},
  {label:'6·12·9 (딱 나눠짐)',values:[6,12,9]},
];

export function AverageBalanceLab({problem:p}:LabProps){
  const starting=[p.a,p.b,p.c??3].map(n=>Math.max(0,Math.min(24,Math.round(n))));
  const [values,setValues]=useState<number[]>(starting);
  const [picked,setPicked]=useState<number|null>(null);
  const [moves,setMoves]=useState(0);
  const [equalized,setEqualized]=useState(false);
  const [touched,setTouched]=useState(false);
  const [message,setMessage]=useState('한 친구의 사탕을 눌러 고르고, 받을 친구의 바구니를 눌러 보세요.');
  const gesture=useRef<Gesture|null>(null);
  const skipClick=useRef(false);
  const sum=totalOf(values);
  const mean=meanOf(values);
  const share=equalShares(values);
  const balanced=nextEqualizingTransfer(values)===null;
  const liveNumbers=values.join(' + ');
  const fractional=share.remainder!==0;
  const displayMean=Number(mean.toFixed(1)).toLocaleString('ko-KR');
  const setExample=(example:number[])=>{
    setValues([...example]);setPicked(null);setMoves(0);
    setEqualized(false);setTouched(false);
    setMessage('전체 사탕 수를 세고 한 친구에게 몰린 사탕을 다른 친구에게 옮겨 보세요.');
  };
  const transfer=(from:number,to:number)=>{
    if(from===to){setMessage('서로 다른 두 바구니를 골라 주세요.');return;}
    if(values[from]<=0){setMessage('이 바구니에는 옮길 사탕이 없어요.');return;}
    const next=transferOne(values,from,to);
    if(next.every((n,i)=>n===values[i]))return;
    setValues(next);setPicked(null);setEqualized(false);
    setMoves(n=>n+1);setTouched(true);
    setMessage((from+1)+'번에서 '+(to+1)+'번으로 사탕 한 개를 옮겼어요. 전체 '+totalOf(next)+'개는 그대로예요.');
  };
  const startGesture=(event:ReactPointerEvent<HTMLButtonElement>,from:number)=>{
    skipClick.current=false;
    gesture.current={from,x:event.clientX,y:event.clientY,moved:false};
    try{event.currentTarget.setPointerCapture(event.pointerId);}catch{/* pointer capture unavailable */}
  };
  const moveGesture=(event:ReactPointerEvent<HTMLButtonElement>)=>{
    const drag=gesture.current;if(!drag)return;
    if(Math.abs(event.clientX-drag.x)+Math.abs(event.clientY-drag.y)>8)drag.moved=true;
  };
  const finishGesture=(event:ReactPointerEvent<HTMLButtonElement>)=>{
    const drag=gesture.current;
    if(!drag)return;
    gesture.current=null;
    if(drag.moved){
      const element=event.currentTarget.ownerDocument.elementFromPoint(event.clientX,event.clientY);
      const basket=element?.closest('[data-average-basket]')?.getAttribute('data-average-basket');
      if(basket!==null&&basket!==undefined&&Number(basket)!==drag.from){
        transfer(drag.from,Number(basket));
        skipClick.current=true;
      }else{
        setPicked(drag.from);
        setMessage('옮기고 싶은 바구니를 터치해 사탕 한 개를 전달해 보세요.');
      }
    }
    try{
      if(event.currentTarget.hasPointerCapture?.(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    }catch{/* released by browser */}
  };
  const chooseToken=(from:number)=>{
    if(skipClick.current){skipClick.current=false;return;}
    setEqualized(false);setPicked(from);
    setMessage(captions[from]+'의 사탕 한 개를 골랐어요. 이제 받을 바구니를 누르세요.');
    setTouched(true);
  };
  const chooseBasket=(to:number)=>{
    if(picked===null){
      setMessage('먼저 사탕을 나눠 줄 친구의 사탕 하나를 터치해 주세요.');
    }else transfer(picked,to);
  };
  const nextStep=()=>{
    const next=nextEqualizingTransfer(values);
    if(next){transfer(next.from,next.to);}
    else{
      setEqualized(true);setPicked(null);setTouched(true);
      setMessage(fractional?
        '각자 '+share.whole+'개씩 먼저 나누고 남은 '+share.remainder+'개를 세 친구에게 똑같이 3등분했어요.':
        '모두 '+share.whole+'개씩 같아졌어요! 이 수가 평균이에요.');
    }
  };
  const finishAll=()=>{
    setEqualized(true);setPicked(null);setTouched(true);
    setMessage('전체 '+sum+'개를 세 친구가 똑같이 나눌 때 한 친구가 받는 양을 확인해 보세요.');
  };
  const showResult=equalized||balanced&&touched;
  return <div className="lab-body lab-average-balance" data-testid="average-balance-lab">
    <div className="average-intro">
      <strong>평균 = 전체를 똑같이 나누었을 때 한 명의 몫</strong>
      <span>세 친구의 사탕을 한 개씩 옮겨 모두 비슷하게 만들어 보세요. 옮겨도 전체 개수는 변하지 않아요.</span>
    </div>
    <div className="average-constant" aria-live="polite">
      <span>세 바구니를 모두 합하면</span>
      <strong>{liveNumbers} = {sum}개</strong>
      <small>누가 받아도 전체 {sum}개는 그대로예요!</small>
    </div>
    <div className="average-baskets" role="group" aria-label="세 친구 사이에 사탕을 옮길 수 있는 바구니">
      {values.map((value,i)=><div className={'average-basket'+(picked===i?' average-basket--picked':'')}
        data-average-basket={i} key={i} data-testid={'average-basket-'+i}>
        <strong className="average-basket-name">{captions[i]}</strong>
        <span className="average-basket-count">{value}<small>개</small></span>
        <div className="average-candies" aria-label={captions[i]+' 사탕 '+value+'개'}>
          {Array.from({length:value},(_,j)=><button key={j} type="button"
            className={'average-candy average-candy--'+i}
            aria-label={captions[i]+' '+(j+1)+'번째 사탕 선택해 옮기기'}
            onPointerDown={event=>startGesture(event,i)}
            onPointerMove={moveGesture}
            onPointerUp={finishGesture}
            onPointerCancel={()=>{gesture.current=null;}}
            onClick={()=>chooseToken(i)} aria-pressed={picked===i}>●</button>)}
          {value===0&&<span className="average-empty">비어 있어요</span>}
        </div>
        <button type="button" className="average-receive"
          aria-label={captions[i]+'에게 사탕 한 개 전달'}
          onClick={()=>chooseBasket(i)}>
          {picked===null?'여기로 받기':picked===i?'보내는 바구니':'여기로 1개 보내기'}
        </button>
      </div>)}
    </div>
    <div className="average-status" role="status" aria-live="polite">
      <span>{message}</span>
      <small>지금까지 {moves}개 이동 · 전체 합계는 {sum}개로 변하지 않음</small>
    </div>
    <LabTools>
      <button type="button" className="lab-action average-step-action" onClick={nextStep}>
        {balanced?'✨ 남은 사탕까지 똑같이 나누기':'▶ 사탕 한 개 고르게 옮기기'}
      </button>
      <button type="button" className="lab-action" onClick={finishAll}>⚖️ 한 번에 공평하게</button>
      <button type="button" className="lab-action" onClick={()=>setExample(starting)}>↺ 원래 자료</button>
    </LabTools>
    <div className="average-equation" data-testid="average-explanation" aria-live="polite">
      <span className="average-equation-heading">{showResult?'🎉 이제 평균의 뜻을 발견했어요':'🔍 왜 모두 같아져야 할까요?'}</span>
      <div className="average-equation-line">
        <span>전체 합계</span><strong>{sum}개</strong>
        <span>친구 수</span><strong>3명</strong>
      </div>
      <div className="average-equation-formula">
        {showResult?<><strong>{sum} ÷ 3 = </strong>
          <span className="average-exact-mean">
            {share.whole}{fractional&&<>과 <Fraction numerator={share.remainder} denominator={3}/></>}
          </span>
          {fractional&&<span>≈ {displayMean}개</span>}
        </>:<strong>총 {sum}개를 세 사람에게 똑같이 나누려면?</strong>}
      </div>
      {showResult&&<p>{fractional?
        '한 명에게 '+share.whole+'개씩 주면 '+(share.whole*3)+'개를 사용하고 '+share.remainder+'개가 남아요. 남은 것까지 똑같이 나누려면 각각 '+share.remainder+'개를 3등분한 만큼 더 받아요.':
        '한 명에게 '+share.whole+'개씩 나누어 주면 전체 '+sum+'개를 모두 똑같이 나눌 수 있어요.'}</p>}
    </div>
    {equalized&&<div className="average-equalized" data-testid="average-equal-shares">
      <strong>세 친구에게 똑같이 나누어 준 모습</strong>
      <div className="average-shares">
        {captions.map((name,i)=><div className="average-share" key={name}>
          <b>{name}</b>
          <div className="average-share-candies" aria-label={name+' '+share.whole+'개'+(fractional?'와 3분의 '+share.remainder+'개':'')}>
            {Array.from({length:share.whole},(_,j)=><i key={j} className={'average-share-candy average-candy--'+i}/>)}
            {fractional&&<span className="average-piece" style={{'--share-pct':(share.remainder/3*100)+'%'} as CSSProperties}>
              <Fraction numerator={share.remainder} denominator={3}/></span>}
          </div>
          <span>{share.whole}{fractional&&<> + <Fraction numerator={share.remainder} denominator={3}/></>}개</span>
        </div>)}
      </div>
      <p>평균은 원래의 세 값 중 하나일 필요가 없어요. 전체 수량을 똑같이 나눈 양이에요.</p>
    </div>}
    <div className="average-presets">
      <span>다른 예시도 탐구해 보기</span>
      {presets.map(sample=><button key={sample.label} type="button"
        onClick={()=>setExample(sample.values)}>{sample.label}</button>)}
    </div>
    <LabHint>사탕을 눌러 선택한 뒤 다른 바구니의 ‘여기로 1개 보내기’를 누르거나,
      사탕을 다른 바구니로 직접 끌어 놓으세요.
      평균은 모든 값을 더한 뒤 자료 수로 나눠 구해요. 총합이 3의 배수가 아니면 나누어진 양이 분수일 수도 있어요.</LabHint>
  </div>;
}
