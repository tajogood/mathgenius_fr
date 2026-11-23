import {useState} from 'react';
import type {CSSProperties} from 'react';
import type {LabProps} from './types';
import {LabHint,LabTools} from './types';

const decimal=(value:number)=>{
  const exact=Math.abs(value-Number(value.toFixed(3)))<1e-10;
  return {display:exact?String(Number(value.toFixed(3))):value.toFixed(3),exact};
};

/** Divide the SAME dividend into changing numbers of equal shares.
 *  p.a is the result in tenths and p.b is the original divisor, so the
 *  generated problem's original dividend is p.a * p.b / 10.
 */
export function DecimalDivisionLab({problem:p}:LabProps){
  const originalDivisor=Math.max(1,Math.round(p.b));
  const tenths=Math.round(p.a*p.b);
  const dividend=tenths/10;
  const [divisor,setDivisor]=useState(originalDivisor);
  const [focusedGroup,setFocusedGroup]=useState<number|null>(null);
  const quotient=dividend/divisor;
  const {display,exact}=decimal(quotient);
  const unitPerGroup=tenths/divisor;
  const wholeTenths=Math.floor(unitPerGroup);
  const fractionalTenth=unitPerGroup-wholeTenths;
  const fullUnits=Math.min(wholeTenths,72);
  const makeGroup=(index:number)=><button key={index} type="button"
    aria-pressed={focusedGroup===index}
    aria-label={(index+1)+'번째 몫 '+(exact?'':'약 ')+display+' 선택'}
    className={'decimal-share'+(focusedGroup===index?' decimal-share--selected':'')}
    onClick={()=>setFocusedGroup(index)}>
    <strong>{index+1}번째 몫</strong>
    <div className="decimal-share-chips" aria-hidden="true">
      {Array.from({length:fullUnits},(_,i)=><i key={i} className="decimal-share-chip"/>)}
      {fractionalTenth>1e-9&&<i className="decimal-share-chip decimal-share-chip--part"
        style={{'--fill':(fractionalTenth*100)+'%'} as CSSProperties}/>}
    </div>
    <span>{exact?'':'약 '}{display}</span>
  </button>;
  return <div className="lab-body lab-decimal-division" data-testid="decimal-division-lab">
    <div className="lab-math-feedback lab-math-feedback--big">
      <strong>{dividend.toFixed(1)} ÷ {divisor} {exact?'=':'≈'} {display}</strong>
    </div>
    <div className="decimal-division-constant" aria-live="polite">
      <strong>나누어지는 수 {dividend.toFixed(1)}은 그대로!</strong>
      <span>0.1이 {tenths}개 있어요. 이것을 {divisor}개의 같은 몫으로 나눕니다.</span>
    </div>
    <div className="decimal-division-tenths" role="img"
      aria-label={'0.1 크기인 조각 '+tenths+'개로 구성된 '+dividend.toFixed(1)}>
      {Array.from({length:tenths},(_,i)=><span key={i}
        className="decimal-division-tenth" title={'0.1씩 '+(i+1)+'개'}/>)}
    </div>
    <div className="decimal-division-label">전체 {dividend.toFixed(1)}을 {divisor}묶음으로 똑같이 나눠 보세요.</div>
    <div className="decimal-shares" role="group" aria-label={'같은 크기의 몫 '+divisor+'개'}
      style={{gridTemplateColumns:'repeat('+Math.min(divisor,5)+',minmax(0,1fr))'}}>
      {Array.from({length:divisor},(_,i)=>makeGroup(i))}
    </div>
    <div className="decimal-division-feedback" aria-live="polite">
      {focusedGroup===null?
        '각 몫을 직접 눌러 보세요. 나누는 수를 바꾸면 전체는 같고 한 몫의 크기만 달라져요.':
        (focusedGroup+1)+'번째 몫은 '+(exact?'':'약 ')+display+
        '입니다. '+divisor+'개를 합하면 전체 '+dividend.toFixed(1)+'이에요.'}
      {!exact&&<small>0.1 조각도 더 잘게 나눌 수 있어요. 소수 셋째 자리까지 나타낸 근삿값입니다.</small>}
    </div>
    <LabTools>
      <label className="lab-slider-label">나누는 수 {divisor}
        <input type="range" aria-label="나누는 수" min="1" max="10" step="1"
          value={divisor} onChange={e=>{setDivisor(Number(e.target.value));setFocusedGroup(null);}}/>
      </label>
      <button className="lab-action" type="button" onClick={()=>{
        setDivisor(originalDivisor);setFocusedGroup(null);
      }}>↺ 처음</button>
    </LabTools>
    <LabHint>나누는 수는 전체를 몇 개의 같은 몫으로 나눌지 정하는 수예요.
      나누어지는 수 {dividend.toFixed(1)}은 고정하고, {divisor}개의 몫을 직접 터치해 한 묶음의 크기를 살펴보세요.</LabHint>
  </div>;
}
