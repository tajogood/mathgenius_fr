import { useState } from 'react';
import type { LabProps } from './types';
import { Fraction } from '../MathText.tsx';
import { LabHint, LabTools } from './types';

/** 0.9 × 0.6 is 9 tenths × 6 tenths, not nine copied six times. */
export function DecimalMultiplyLab({problem:p}:LabProps) {
  const initialA=Math.max(1,Math.min(9,p.a));
  const initialB=Math.max(1,Math.min(9,p.b));
  const [a,setA]=useState(initialA);
  const [b,setB]=useState(initialB);
  const [showAddition,setShowAddition]=useState(false);
  const amount=(n:number)=>(n/10).toFixed(1);
  const result=(a*b/100).toFixed(2);
  const repeatedSum=(a*b/10).toFixed(1);
  const cells=Array.from({length:100},(_,index)=>{
    const col=index%10,row=Math.floor(index/10);
    const blue=col<a,amber=row<b;
    return {index,col,row,kind:blue&&amber?'overlap':blue?'blue':amber?'amber':'empty'};
  });
  return <div className="lab-body lab-decimal-multiply" data-testid="decimal-multiplication-lab">
    <div className="lab-hero-count">
      <strong>{amount(a)} × {amount(b)} = {result}</strong>
      <span>전체 1을 100칸으로 나눈 넓이 모형</span>
    </div>
    <div className="lab-decimal-layout">
      <div className="lab-decimal-visual">
        <div className="lab-decimal-key" aria-label="칸 색깔의 뜻">
          <span><i className="lab-decimal-key--blue"/>세로 {amount(a)}</span>
          <span><i className="lab-decimal-key--amber"/>가로 {amount(b)}</span>
          <span><i className="lab-decimal-key--overlap"/>겹침 {result}</span>
        </div>
        <div className="lab-decimal-grid" role="group"
          aria-label={'100칸 격자. 첫 번째 소수 '+amount(a)+', 두 번째 소수 '+amount(b)}>
          {cells.map(({index,col,row,kind})=><button type="button" key={index}
            className={'lab-decimal-cell lab-decimal-cell--'+kind}
            aria-label={(row+1)+'번째 줄 '+(col+1)+'번째 칸, '+(kind==='overlap'?'겹친 부분':kind==='blue'?'파란 부분':kind==='amber'?'주황 부분':'빈 부분')+', 터치하면 해당 크기로 변경'}
            onClick={()=>{setA(col+1);setB(row+1);}}
            title={'가로 '+((col+1)/10).toFixed(1)+', 세로 '+((row+1)/10).toFixed(1)} />)}
        </div>
        <span className="lab-decimal-count" aria-live="polite">겹치는 칸 {a*b}개 = <Fraction numerator={a*b} denominator={100}/> = {result}</span>
      </div>
      <div className="lab-decimal-explain">
        <div className="lab-decimal-explain-row"><b>① 파란 세로</b><span>{a}칸 ÷ 10 = {amount(a)}</span></div>
        <div className="lab-decimal-explain-row"><b>② 주황 가로</b><span>{b}칸 ÷ 10 = {amount(b)}</span></div>
        <div className="lab-decimal-explain-row lab-decimal-explain-row--result">
          <b>③ 두 색이 겹친 칸</b><span>{a} × {b} = {a*b}칸</span>
          <strong>{a*b}칸 ÷ 100칸 = {result}</strong>
        </div>
        <button type="button" className="lab-action lab-decimal-explanation-toggle"
          onClick={()=>setShowAddition(x=>!x)}
          aria-expanded={showAddition}>
          {showAddition?'▴ 반복 덧셈 접기':'▾ 반복 덧셈으로도 보기'}
        </button>
        {showAddition&&<div className="lab-decimal-repeated" data-testid="decimal-repeated-addition">
          <p>{amount(a)}을(를) <strong>{b}번 더하면</strong> {repeatedSum}이에요.</p>
          <div className="lab-decimal-repeated-chips" aria-label={amount(a)+'을 '+b+'번 반복해 더하기'}>
            {Array.from({length:b},(_,index)=><span key={index}>
              {index>0&&<span aria-hidden="true"> + </span>}
              <b>{amount(a)}</b>
            </span>)}
          </div>
          <p><strong>{repeatedSum} ÷ 10 = {result}</strong></p>
          <small>주의! {amount(b)}은 {b}개가 아니라 {b}개의 10분의 1이에요. 따라서 {b}번 더한 값을 다시 10으로 나눠요.</small>
        </div>}
      </div>
    </div>
    <LabTools>
      <label className="lab-slider-label">첫 번째 소수 {amount(a)}
        <input type="range" min="1" max="9" step="1" value={a}
          onChange={e=>setA(Number(e.target.value))}/></label>
      <label className="lab-slider-label">두 번째 소수 {amount(b)}
        <input type="range" min="1" max="9" step="1" value={b}
          onChange={e=>setB(Number(e.target.value))}/></label>
      <button type="button" className="lab-action"
        onClick={()=>{setA(initialA);setB(initialB);setShowAddition(false);}}>↺ 원래 소수</button>
    </LabTools>
    <LabHint>100칸 격자에서 파란 부분과 주황 부분이 겹친 칸을 세어 보세요.
      칸을 터치하거나 두 슬라이더를 움직이면 소수와 결과가 함께 바뀌어요.</LabHint>
  </div>;
}
