import { useEffect,useRef,useState } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { LabProps } from './types';
import { LabHint,LabTools } from './types';
import { shapeSamples,isLineSymmetric,isPointSymmetric,type GeometryPoint,type SymmetryMode,type SymmetryShape } from './symmetryMath';

const SIZE={width:360,height:235};
type DragState={
  action:'move'|'rotate';
  origin:GeometryPoint;
  originalPosition:GeometryPoint;
  originalAngle:number;
  originalPointerAngle:number;
};
const pointString=(values:GeometryPoint[])=>values.map(p=>p.x+','+p.y).join(' ');
const startPosition=(mode:SymmetryMode):GeometryPoint=>
  mode==='line'?{x:30,y:16}:mode==='point'?{x:270,y:130}:{x:265,y:120};
const originalPosition=(mode:SymmetryMode):GeometryPoint=>
  mode==='congruence'?{x:97,y:122}:{x:180,y:120};
const isNear=(a:GeometryPoint,b:GeometryPoint)=>
  Math.hypot(a.x-b.x,a.y-b.y)<13;
const normalizedAngle=(value:number)=>(value%360+360)%360;
const angleNear=(x:number,y:number)=>Math.abs(((x-y+540)%360)-180)<8;

const leftWing:GeometryPoint[]=[
  {x:0,y:-24},{x:-18,y:-42},{x:-63,y:-54},{x:-57,y:-15},
  {x:-37,y:-2},{x:-59,y:26},{x:-47,y:50},{x:-8,y:29},{x:0,y:18},
];
const halfHouse:GeometryPoint[]=[
  {x:0,y:-54},{x:-42,y:-5},{x:-42,y:48},{x:0,y:48},
];
const mirrored=(vertices:GeometryPoint[])=>vertices.map(p=>({x:-p.x,y:p.y}));

export function SymmetryLab({problem:p,standardId}:LabProps){
  const initial:SymmetryMode=standardId==='6수03-01'?'congruence':
    p.topic==='symmetry'&&p.a===1?'point':'line';
  const [mode,setMode]=useState<SymmetryMode>(initial);
  const [shape,setShape]=useState<SymmetryShape>(initial==='line'?'butterfly':
    initial==='point'?'parallelogram':'house');
  const [move,setMove]=useState<GeometryPoint>(()=>startPosition(initial));
  const [angle,setAngle]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [active,setActive]=useState(false);
  const [didTouch,setDidTouch]=useState(false);
  const canvas=useRef<SVGSVGElement>(null);
  const dragging=useRef<DragState|null>(null);
  const removePointerListeners=useRef<(()=>void)|null>(null);
  useEffect(()=>()=>removePointerListeners.current?.(),[]);
  const finishDrag=()=>{
    dragging.current=null;
    removePointerListeners.current?.();
    removePointerListeners.current=null;
    setActive(false);
  };
  const isLine=mode==='line';
  const target=originalPosition(mode);
  const targetAngle=mode==='point'?180:0;
  const matched=isLine?isNear(move,{x:0,y:0}):
    isNear(move,target)&&angleNear(angle,targetAngle);
  const vertices=shapeSamples[shape].vertices;
  const left=shape==='house'?halfHouse:leftWing;
  const shapeOptions:SymmetryShape[]=mode==='congruence'?['house','ell']:
    mode==='line'?['butterfly','house']:['parallelogram','rectangle'];
  const chooseMode=(next:SymmetryMode)=>{
    setMode(next);setShape(next==='line'?'butterfly':next==='point'?'parallelogram':'house');
    setMove(startPosition(next));setAngle(0);setFlipped(false);
    setDidTouch(false);finishDrag();
  };
  const reset=()=>{
    setMove(startPosition(mode));setAngle(0);setFlipped(false);
    setDidTouch(false);finishDrag();
  };
  // SVG viewBox coordinates differ from its CSS bounding box whenever
  // preserveAspectRatio letterboxes the experiment (especially in mobile cards).
  // The screen matrix handles both the viewBox and responsive scaling.
  const pointer=(clientX:number,clientY:number):GeometryPoint|null=>{
    const matrix=canvas.current?.getScreenCTM();
    if(matrix){
      const point=new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse());
      return {x:point.x,y:point.y};
    }
    const rect=canvas.current?.getBoundingClientRect();
    if(!rect||!rect.width||!rect.height)return null;
    return {x:(clientX-rect.left)*SIZE.width/rect.width,
      y:(clientY-rect.top)*SIZE.height/rect.height};
  };
  const dragFromClient=(clientX:number,clientY:number)=>{
    const data=dragging.current;if(!data)return;
    const now=pointer(clientX,clientY);if(!now)return;
    if(data.action==='move'){
      const dx=now.x-data.origin.x,dy=now.y-data.origin.y;
      const limits=isLine?{minX:-75,maxX:60,minY:-75,maxY:75}:
        {minX:65,maxX:296,minY:68,maxY:166};
      setMove({x:Math.max(limits.minX,Math.min(limits.maxX,data.originalPosition.x+dx)),
        y:Math.max(limits.minY,Math.min(limits.maxY,data.originalPosition.y+dy))});
    }else{
      const pivot=isLine?
        {x:180+data.originalPosition.x,y:120+data.originalPosition.y}:
        data.originalPosition;
      const rad=Math.atan2(now.y-pivot.y,now.x-pivot.x);
      const deg=(rad-data.originalPointerAngle)*180/Math.PI;
      setAngle(normalizedAngle(Math.round((data.originalAngle+deg)/15)*15));
    }
  };
  const begin=(e:ReactPointerEvent<SVGElement>,action:DragState['action'])=>{
    const pos=pointer(e.clientX,e.clientY);if(!pos)return;
    e.stopPropagation();e.preventDefault();
    removePointerListeners.current?.();
    const base=isLine?{x:180+move.x,y:120+move.y}:move;
    dragging.current={action,origin:pos,originalPosition:{...move},
      originalAngle:angle,
      originalPointerAngle:Math.atan2(pos.y-base.y,pos.x-base.x)};
    // Window listeners retain dragging if pointer capture changes target,
    // including when pointer leaves the SVG or React re-renders the handle.
    const pointerId=e.pointerId;
    const onWindowMove=(event:PointerEvent)=>{
      if(event.pointerId===pointerId)dragFromClient(event.clientX,event.clientY);
    };
    const onWindowEnd=(event:PointerEvent)=>{
      if(event.pointerId===pointerId)finishDrag();
    };
    window.addEventListener('pointermove',onWindowMove);
    window.addEventListener('pointerup',onWindowEnd);
    window.addEventListener('pointercancel',onWindowEnd);
    removePointerListeners.current=()=>{
      window.removeEventListener('pointermove',onWindowMove);
      window.removeEventListener('pointerup',onWindowEnd);
      window.removeEventListener('pointercancel',onWindowEnd);
    };
    try{canvas.current?.setPointerCapture?.(pointerId);}catch{/* global listener still handles drag */}
    setActive(true);setDidTouch(true);
  };
  const release=(e:ReactPointerEvent<SVGSVGElement>)=>{
    if(!dragging.current)return;
    finishDrag();
    try{
      if(e.currentTarget.hasPointerCapture?.(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
    }catch{/* pointer already released */}
  };
  const onKeys=(e:ReactKeyboardEvent<SVGGElement>)=>{
    const shifts:Record<string,GeometryPoint>={
      ArrowLeft:{x:-10,y:0},ArrowRight:{x:10,y:0},
      ArrowUp:{x:0,y:-10},ArrowDown:{x:0,y:10},
    };
    if(shifts[e.key]){
      e.preventDefault();
      const shift=shifts[e.key];
      setMove(v=>({x:v.x+shift.x,y:v.y+shift.y}));setDidTouch(true);
    }
    if(e.key==='r'||e.key==='R'){
      e.preventDefault();setAngle(v=>(v+45)%360);setDidTouch(true);
    }
    if(e.key==='Enter'){e.preventDefault();setActive(v=>!v);setDidTouch(true);}
  };
  const message=mode==='congruence'?
    matched?'✨ 회색 윤곽 위에 겹쳤어요! 위치와 방향이 달라도 크기와 모양이 같으면 합동이에요.':
      '파란 도형을 회색 도형 위로 드래그해 겹쳐 보세요. 위쪽 주황 점을 돌리면 방향도 바꿀 수 있어요.':
    mode==='line'?
      matched?'✨ 대칭축을 기준으로 두 날개가 정확히 겹쳐요. 선대칭 도형이에요.':
        '나비의 왼쪽 날개를 거울에 비춘 모양을 찾아, 오른쪽 파란 날개를 점선 윤곽 안으로 끌어 보세요.':
      matched&&angleNear(angle,180)?
        '✨ 중심을 기준으로 180° 돌렸어요! 평행사변형이 원래 윤곽과 일치해요.':
        '평행사변형을 점 표시가 있는 중심으로 옮겨 보세요. 주황 점으로 반 바퀴 돌려도 겹칩니다.';
  const menu:[SymmetryMode,string][]=[
    ['congruence','같은 모양 겹치기'],['line','선대칭 거울'],['point','점대칭 180°'],
  ];
  const displayPolygon=pointString(vertices);
  return <div className="lab-body lab-symmetry" data-testid="symmetry-experiment">
    <div className="lab-symmetry-tabs" role="group" aria-label="합동·대칭 실험 종류">
      {menu.map(([value,label])=><button key={value} type="button"
        aria-pressed={mode===value} onClick={()=>chooseMode(value)}
        className={mode===value?'lab-symmetry-tab--active':''}>{label}</button>)}
    </div>
    <div className="lab-symmetry-shapes" role="group" aria-label="정확한 도형 예시 선택">
      {shapeOptions.map(value=><button key={value} type="button" aria-pressed={shape===value}
        className={shape===value?'lab-symmetry-shape--active':''} onClick={()=>{setShape(value);reset();}}>
        {shapeSamples[value].name}</button>)}
    </div>
    <svg ref={canvas} className="lab-symmetry-stage" viewBox="0 0 360 235"
      role="img" aria-label={'마우스 또는 손가락으로 직접 끌어 움직이는 '+(mode==='congruence'?'합동':mode==='line'?'선대칭':'점대칭')+' 도형'}
      onPointerUp={release} onPointerCancel={release}>
      <defs><pattern id="symmetry-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0 H0 V20" stroke="#dce5f7" strokeWidth=".85" fill="none"/></pattern></defs>
      <rect width="360" height="235" rx="12" fill="url(#symmetry-grid)" pointerEvents="none"/>
      {isLine?<>
        <line x1="180" y1="15" x2="180" y2="215" stroke="#df9f50" strokeWidth="3"
          strokeDasharray="8 5" pointerEvents="none"/>
        <text x="180" y="16" textAnchor="middle" fontSize="11" fill="#bf853d">대칭축</text>
        <g transform="translate(180 120)">
          <polygon points={pointString(left)} fill="#c6d3fe" stroke="#5d72d9" strokeWidth="3"
            pointerEvents="none"/>
          <polygon points={pointString(mirrored(left))} fill="#f4ebd9" fillOpacity=".55"
            stroke="#cb9950" strokeWidth="3" strokeDasharray="5 4" pointerEvents="none"/>
        </g>
        <g transform={'translate('+(180+move.x)+' '+(120+move.y)+')'}
          className={'lab-symmetry-draggable'+(active?' lab-symmetry-draggable--active':'')}
          role="button" tabIndex={0} aria-label="오른쪽 나비 날개를 드래그하여 거울 대칭 윤곽에 맞춰 보세요"
          onPointerDown={e=>begin(e,'move')} onKeyDown={onKeys}>
          <polygon points={pointString(mirrored(left))} fill="#88a6f2" stroke="#496bcd"
            strokeWidth="3.5" strokeLinejoin="round"/>
          <circle cx="31" cy="-7" r="7" fill="#e99f58" stroke="#fff" strokeWidth="1.8" pointerEvents="all"/>
        </g>
      </>:<>
        {mode==='point'&&<>
          <line x1="180" y1="18" x2="180" y2="220" stroke="#e3b47a" strokeDasharray="5 5" pointerEvents="none"/>
          <line x1="58" y1="120" x2="306" y2="120" stroke="#e3b47a" strokeDasharray="5 5" pointerEvents="none"/>
          <circle cx="180" cy="120" r="5" fill="#e5a057" stroke="#fff" strokeWidth="2"/>
          <text x="187" y="113" fontSize="11" fill="#b3834d">대칭의 중심 O</text>
        </>}
        <g transform={'translate('+target.x+' '+target.y+')'} pointerEvents="none">
          <polygon points={displayPolygon} fill="#e5e9f1" fillOpacity=".65"
            stroke="#94a2bb" strokeWidth="3" strokeDasharray="7 4"/>
        </g>
        <g transform={'translate('+move.x+' '+move.y+') rotate('+angle+')'+
          (flipped?' scale(-1 1)':'')}
          className={'lab-symmetry-draggable'+(active?' lab-symmetry-draggable--active':'')}
          role="button" tabIndex={0} aria-label="파란 도형을 직접 드래그해 옮기세요. R 키로 회전할 수도 있어요"
          onPointerDown={e=>begin(e,'move')} onKeyDown={onKeys}>
          <polygon points={displayPolygon} fill="#91aef7" fillOpacity=".88"
            stroke="#526fd9" strokeWidth="3.8" strokeLinejoin="round"/>
          <path d="M0 -58 V-69" stroke="#eb9e55" strokeWidth="3" pointerEvents="none"/>
          <circle cx="0" cy="-71" r="13" fill="#f5b76c" stroke="#fff" strokeWidth="3"
            className="lab-symmetry-turn-handle"
            role="button" tabIndex={0} aria-label="주황색 회전 손잡이를 드래그하여 도형을 회전하세요"
            onPointerDown={e=>begin(e,'rotate')}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();
              setAngle(v=>(v+45)%360);setDidTouch(true);}}}/>
        </g>
        {mode==='congruence'&&<text x="100" y="208" fontSize="11" textAnchor="middle" fill="#8591ab">
          회색 원본</text>}
        <text x={mode==='congruence'?257:281} y="208" fontSize="11"
          textAnchor="middle" fill="#526fcb">파란 도형</text>
      </>}
    </svg>
    <div className="lab-math-feedback" aria-live="polite">
      <strong>{mode==='congruence'?'합동: 크기와 모양이 똑같아요':
        mode==='line'?'선대칭: 대칭축 양쪽이 거울처럼 같아요':
          '점대칭: 중심을 기준으로 180° 돌려 겹쳐요'}</strong>
      {!isLine&&<span>회전 {angle}° {flipped?'· 좌우 뒤집음':''}</span>}
      {matched&&<span className="lab-symmetry-success">✓ 일치했어요</span>}
    </div>
    <LabTools>
      {!isLine&&<>
        <button type="button" className="lab-action" onClick={()=>{setAngle(v=>(v+45)%360);setDidTouch(true);}}>
          ↻ 45° 회전</button>
        <button type="button" className="lab-action" onClick={()=>{setFlipped(v=>!v);setDidTouch(true);}}
          aria-pressed={flipped}>⇄ 좌우 뒤집기</button>
      </>}
      <button type="button" className="lab-action" onClick={reset}>↺ 처음 위치</button>
    </LabTools>
    <LabHint>{message}{didTouch?' 도형을 직접 만지며 위치와 방향을 바꿔 보세요.':''}</LabHint>
    <div className="lab-symmetry-legend">☝️ 파란 도형을 끌어 옮기기 · 주황 점을 끌어 회전하기
      <span>키보드: 방향키로 이동 · R로 45° 회전</span></div>
  </div>;
}
