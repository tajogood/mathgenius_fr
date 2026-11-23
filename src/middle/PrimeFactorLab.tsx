import {useState} from 'react';
import './prime-lab.css';

export const isPrime=(n:number):boolean=>{
  if(!Number.isInteger(n)||n<2)return false;
  for(let d=2;d*d<=n;d++)if(n%d===0)return false;
  return true;
};
export const decompose=(n:number):number[]=>{
  if(!Number.isInteger(n)||n<2)return [];
  const factors:number[]=[];let value=n;
  for(let d=2;d*d<=value;d++)while(value%d===0){factors.push(d);value/=d;}
  if(value>1)factors.push(value);
  return factors;
};
const candidates=[2,3,5,7,11,13,17,19,23,29,31,37] as const;
const product=(values:number[])=>values.reduce((p,v)=>p*v,1);

export default function PrimeFactorLab(){
  const [target,setTarget]=useState(26);
  const [chosen,setChosen]=useState(2);
  const [found,setFound]=useState<number[]>([]);
  const [message,setMessage]=useState('26개의 점을 2개씩 묶으면 정확히 나눠질까요?');
  const remaining=target/product(found);
  const finished=remaining===1;
  const choices=[...candidates.filter(v=>v<=remaining),
    ...(isPrime(remaining)&&!candidates.includes(remaining as typeof candidates[number])?[remaining]:[])];
  const valid=remaining%chosen===0;
  const groupCount=remaining%chosen===0?chosen:1;
  const itemsPerGroup=remaining/groupCount;
  const expression=found.length?[...found,...(remaining>1?[remaining]:[])].join(' × '):String(target);
  function reset(value:number){
    setTarget(value);setChosen(2);setFound([]);
    setMessage(value+'개의 점을 나눠 보세요. '+(isPrime(value)?'이 수는 이미 소수예요.':'어떤 소수로 나눠떨어질까요?'));
  }
  function divide(){
    if(finished)return;
    if(!isPrime(chosen)){setMessage('1이나 합성수는 소인수로 사용할 수 없어요. 소수를 선택해 주세요.');return;}
    if(!valid){
      setMessage('남은 수 '+remaining+'을 '+chosen+'로 나누면 나머지가 '+(remaining%chosen)+'이에요. 다른 소수를 선택하세요.');
      return;
    }
    const next=[...found,chosen],r=remaining/chosen;
    setFound(next);
    setChosen(candidates.find(p=>r%p===0)??(isPrime(r)?r:2));
    setMessage(r===1?'완성! '+target+' = '+next.join(' × '):r+'이 남았습니다. '+(isPrime(r)?'남은 수도 소수예요. 마지막으로 선택하세요.':'다른 소수로 계속 나눠 보세요.'));
  }
  return <section className="prime-experiment" aria-label="소수를 골라 직접 나누는 소인수분해">
    <div className="prime-question">
      <h3>도전: {target}을 소수만의 곱으로 나타내 볼까요?</h3>
      <label htmlFor="prime-number">분해할 수 <span>{target}</span></label>
      <input id="prime-number" type="range" min="2" max="120" value={target}
        onChange={e=>reset(Number(e.target.value))}/>
      <div className="prime-presets" role="group" aria-label="분해할 수 빠른 선택">
        {[12,18,26,36,48,72,97].map(n=><button key={n} type="button"
          aria-pressed={target===n} onClick={()=>reset(n)}>{n}</button>)}
      </div>
    </div>
    <div className="prime-layout">
      <div className="prime-divisor-panel">
        <h4>① 나눌 소수를 선택하세요</h4>
        <p><strong>소수</strong>는 약수가 1과 자기 자신뿐인 2 이상의 자연수예요. 1은 소수가 아닙니다.</p>
        <div className="prime-candidates" role="group" aria-label="나눌 소수 선택">
          {choices.map(p=><button key={p} type="button" aria-pressed={chosen===p} disabled={finished}
            onClick={()=>{setChosen(p);setMessage('남은 '+remaining+'을 '+p+'로 나눠 볼까요?')}}>{p}</button>)}
        </div>
        <button className="prime-try" type="button" disabled={finished} onClick={divide}>
          {finished?'소인수분해 완료 ✓':remaining+' ÷ '+chosen+' 계산하기'}</button>
        <p className="prime-feedback" aria-live="polite">{message}</p>
        <button className="prime-restore" type="button" onClick={()=>reset(target)}>↻ 다시 나누기</button>
      </div>
      <div className="prime-dots-panel">
        <h4>② 점의 개수를 직접 세어 보세요</h4>
        <p className="prime-dot-caption">{remaining}개의 남은 점 · {groupCount}묶음 × {itemsPerGroup}개
          {!valid&&<small>현재 남은 수 {remaining}은 {chosen}로 나누어떨어지지 않아요.</small>}</p>
        <div className="prime-groups" role="img"
          aria-label={remaining+'개의 점을 '+groupCount+'묶음으로 나누어 한 묶음에 '+itemsPerGroup+'개씩 나타냄'}>
          {Array.from({length:groupCount},(_,i)=><div key={i} className="prime-dot-group"
            style={{gridTemplateColumns:'repeat('+Math.min(12,itemsPerGroup)+',1fr)'}}>
            {Array.from({length:itemsPerGroup},(_,j)=><span key={j} className={'prime-dot prime-tone-'+i%5}/>)}
          </div>)}
        </div>
        <p className="prime-dot-tip">그림에는 지금 남은 수와 똑같이 <strong>{remaining}개</strong>의 점이 있습니다. 나눗셈이 성공하면 점의 수도 줄어듭니다.</p>
      </div>
    </div>
    <div className="prime-equation" aria-live="polite">
      <div><small>찾은 소인수</small><strong>{found.length?found.join(' × '):'아직 없음'}</strong></div>
      <div><small>남은 수</small><strong>{remaining}{remaining>1&&isPrime(remaining)?' · 소수':''}</strong></div>
      <div><small>처음 수로 확인</small><strong>{target} = {expression}</strong></div>
    </div>
    {finished&&<div className="prime-complete" role="status">
      🎉 <strong>{target} = {found.join(' × ')}</strong>. 모든 인수가 소수이며 곱하면 원래 수가 됩니다!
    </div>}
  </section>;
}
