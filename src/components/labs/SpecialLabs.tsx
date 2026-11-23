import { useState } from 'react';
import type { LabProps } from './types';
import { LabHint, LabTools, SmallControl,bound } from './types';

const SHAPES=['삼각형','평행사변형','사다리꼴','마름모'] as const;
type AreaShape=typeof SHAPES[number];
function cleanNumber(n:number):string{return Number(n.toFixed(2)).toLocaleString('ko-KR');}

export function AreaShapesLab({problem:p}:LabProps){
  const [shape,setShape]=useState<AreaShape>('삼각형');
  const [width,setWidth]=useState(8);
  const [height,setHeight]=useState(6);
  const [upper,setUpper]=useState(4);
  const base=width*14, vertical=height*13;
  const area=shape==='삼각형'?width*height/2:
    shape==='평행사변형'?width*height:
    shape==='사다리꼴'?(width+upper)*height/2:width*height/2;
  let points='';
  if(shape==='삼각형')points=`60,173 ${60+base},173 ${60+base/2},${173-vertical}`;
  else if(shape==='평행사변형')points=`60,173 ${60+base},173 ${95+base},${173-vertical} 95,${173-vertical}`;
  else if(shape==='사다리꼴')points=`60,173 ${60+base},173 ${60+base/2+upper*7},${173-vertical} ${60+base/2-upper*7},${173-vertical}`;
  else points=`${156-width*7},95 156,${95-height*6.5} ${156+width*7},95 156,${95+height*6.5}`;
  const formula=shape==='삼각형'?'밑변 × 높이 ÷ 2':
    shape==='평행사변형'?'밑변 × 높이':
    shape==='사다리꼴'?'(윗변 + 아랫변) × 높이 ÷ 2':'대각선 × 대각선 ÷ 2';
  return <div className="lab-body" data-testid="area-shape-experiment">
    <div className="lab-shape-selector" role="group" aria-label="넓이 구할 도형 선택">
      {SHAPES.map(item=><button type="button" key={item} onClick={()=>setShape(item)}
        aria-pressed={shape===item} className={shape===item?'lab-shape-choice--active':''}>{item}</button>)}
    </div>
    <svg viewBox="0 0 320 210" className="lab-area-svg" role="img" aria-label={shape+' 넓이 구하는 방법'}>
      <defs><pattern id="area-grid" width="14" height="13" patternUnits="userSpaceOnUse">
        <path d="M14 0 H0 V13" fill="none" stroke="#dce6fa" strokeWidth=".8"/></pattern></defs>
      <rect width="320" height="200" fill="url(#area-grid)"/>
      <polygon points={points} fill="#afc2f7" fillOpacity=".83" stroke="#607de0" strokeWidth="3.5"
        strokeLinejoin="round"/>
      {shape!=='마름모'?<>
        <line x1={shape==='평행사변형'?95:60+base/2} y1={173-vertical}
          x2={shape==='평행사변형'?95:60+base/2} y2="173"
          stroke="#e1a355" strokeWidth="2.5" strokeDasharray="5 4"/>
        <text x="56" y="190" fontSize="12" fill="#586cb0">밑변 {width}cm</text>
      </>:<>
        <path d={`M${156-width*7} 95 H${156+width*7} M156 ${95-height*6.5} V${95+height*6.5}`}
          fill="none" stroke="#e1a355" strokeDasharray="5 4" strokeWidth="2.4"/>
        <text x="80" y="190" fontSize="12" fill="#586cb0">대각선 {width}cm × {height}cm</text>
      </>}
      {shape==='사다리꼴'&&<text x="146" y={164-vertical} textAnchor="middle" fontSize="11"
        fill="#536bc2">윗변 {upper}cm</text>}
      {shape!=='마름모'&&<text x={Math.min(291,65+base)} y="55" fontSize="12" fill="#586cb0"
        textAnchor="end">높이 {height}cm</text>}
    </svg>
    <div className="lab-math-feedback"><strong>{formula}</strong>
      <span>넓이 {cleanNumber(area)}cm²</span></div>
    <LabTools>
      <SmallControl label={shape==='마름모'?'대각선 1':'밑변'} value={width} change={setWidth} min={3} max={11}/>
      <SmallControl label={shape==='마름모'?'대각선 2':'높이'} value={height} change={setHeight} min={2} max={10}/>
      {shape==='사다리꼴'&&<SmallControl label="윗변" value={upper} change={setUpper} min={2} max={10}/>}
    </LabTools>
    <LabHint>도형을 직접 바꾸고 길이를 조절해 보세요. 사각형의 모양이 같아 보여도 넓이를 구하는 방식이 달라요.
      {shape==='삼각형'?' 삼각형 두 개로 평행사변형 하나를 만들 수 있어요.':''}</LabHint>
  </div>;
}

export function ProjectionLab({problem:p}:LabProps){
  // Model the problem's actual footprint: never truncate a 5×4 grid to 3×3.
  const cols=bound(p.a,2,5),rows=bound(p.b,2,4);
  const [blocks,setBlocks]=useState<number[]>(()=>Array(cols*rows).fill(1));
  const value=blocks.reduce((sum,n)=>sum+n,0);
  const front=Array.from({length:cols},(_,column)=>
    Math.max(...Array.from({length:rows},(_,row)=>blocks[row*cols+column])));
  const right=Array.from({length:rows},(_,row)=>
    Math.max(...Array.from({length:cols},(_,column)=>blocks[row*cols+column])));
  const top=blocks.map(height=>height>0);
  return <div className="lab-body" data-testid="projection-experiment">
    <div className="lab-hero-count"><strong>{value}개</strong><span>쌓기나무 총 개수</span></div>
    <div className="lab-views">
      <div><strong>위에서 보기</strong><div className="lab-projection-top" role="group"
        aria-label={'위에서 본 '+rows+'행 '+cols+'열 칸별 블록 높이'}
        style={{gridTemplateColumns:'repeat('+cols+',minmax(0,1fr))'}}> 
        {blocks.map((height,i)=><button type="button" key={i}
          aria-label={(Math.floor(i/cols)+1)+'행 '+(i%cols+1)+'열 높이 '+height+', 터치해 쌓기'}
          className={top[i]?'lab-projection-top--filled':''}
          onClick={()=>setBlocks(prev=>prev.map((v,index)=>index===i?(v+1)%5:v))}>
          {height?height:'+'}</button>)}
      </div></div>
      <div><strong>앞에서 보기</strong><div className="lab-projection-bars" role="img"
        aria-label={'앞에서 본 각 열 최대 높이 '+front.join(', ')}>
        {front.map((value,i)=><span key={i} style={{height:value*25+4+'px'}}>{value||''}</span>)}
      </div></div>
      <div><strong>오른쪽 보기</strong><div className="lab-projection-bars" role="img"
        aria-label={'오른쪽에서 본 각 줄 최대 높이 '+right.join(', ')}>
        {right.map((value,i)=><span key={i} style={{height:value*25+4+'px'}}>{value||''}</span>)}
      </div></div>
    </div>
    <LabTools>
      <button type="button" className="lab-action" onClick={()=>setBlocks(Array(cols*rows).fill(0))}>모두 비우기</button>
      <button type="button" className="lab-action" onClick={()=>setBlocks(Array(cols*rows).fill(1))}>1층 모두 채우기</button>
    </LabTools>
    <LabHint>위에서 본 칸을 터치하면 해당 위치에 쌓기나무가 1개씩 추가돼요. 같은 위치에 몇 층이 있어도 위에서 볼 때는 한 칸이에요.</LabHint>
  </div>;
}

export function NetLab({standardId}:LabProps){
  const cylinder=standardId==='6수03-08';
  const [unfold,setUnfold]=useState(true);
  return <div className="lab-body" data-testid="net-experiment">
    <div className="lab-hero-count"><strong>{cylinder?'원기둥':'삼각기둥'}</strong>
      <span>{unfold?'펼친 전개도':'접힌 입체 모형'}</span></div>
    <svg className="lab-net-svg" viewBox="0 0 310 220" role="img"
      aria-label={cylinder?'원기둥의 두 원과 직사각형 옆면 전개도':'삼각기둥의 두 삼각형과 세 사각형 옆면 전개도'}>
      {unfold?cylinder?<g stroke="#637cd5" strokeWidth="3" fill="#b9ccfa">
        <rect x="72" y="72" width="166" height="76" rx="2"/>
        <circle cx="155" cy="48" r="24" fill="#f7d29d"/>
        <circle cx="155" cy="172" r="24" fill="#f7d29d"/>
        <line x1="155" y1="72" x2="155" y2="148" stroke="#91a5dc" strokeWidth="1"
          strokeDasharray="5 4"/>
        <text x="155" y="113" textAnchor="middle" fill="#5267b5" fontSize="13" stroke="none">직사각형 옆면</text>
      </g>:<g stroke="#637cd5" strokeWidth="2.8" fill="#b9ccfa">
        {[55,125,195].map(x=><rect key={x} x={x} y="76" width="70" height="70"/>)}
        <polygon points="125,76 195,76 160,15" fill="#f7d29d"/>
        <polygon points="125,146 195,146 160,207" fill="#f7d29d"/>
        <path d="M125 76 V146 M195 76 V146" strokeDasharray="4 4"/>
      </g>:cylinder?<g stroke="#637cd5" strokeWidth="3">
        <path d="M80 68 V156 Q155 200 230 156 V68" fill="#b9ccfa"/>
        <ellipse cx="155" cy="68" rx="75" ry="29" fill="#f7d29d"/>
        <path d="M80 156 Q155 200 230 156" fill="none"/>
        <text x="155" y="117" fill="#5267b5" textAnchor="middle" fontSize="13" stroke="none">원기둥</text>
      </g>:<g stroke="#637cd5" strokeWidth="3">
        <polygon points="155,25 240,86 155,135 70,86" fill="#f7d29d"/>
        <path d="M70 86 V155 L155 206 V135 M240 86 V155 L155 206" fill="#b9ccfa"/>
        <path d="M70 86 L155 135 L240 86" fill="none"/>
        <text x="155" y="120" textAnchor="middle" fill="#5267b5" stroke="none" fontSize="12">삼각기둥</text>
      </g>}
    </svg>
    <LabTools>
      <button className="lab-action lab-action--accent" type="button" onClick={()=>setUnfold(v=>!v)}>
        {unfold?'▣ 접어 보기':'▤ 전개도 펼치기'}</button>
    </LabTools>
    <LabHint>{cylinder?
      '원기둥은 원 모양 밑면 2개와, 펼치면 직사각형이 되는 옆면 1개가 있어요.':
      '삼각기둥은 삼각형 밑면 2개와 사각형 옆면 3개가 서로 연결돼요.'}
      펼친 모양과 접힌 입체 모양의 면을 대응시켜 보세요.</LabHint>
  </div>;
}
