import {useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import type {LabProps} from './types';
import {bound,LabHint,LabTools} from './types';

type Point={x:number;y:number};
type Drag={origin:Point;original:Point[];circle:Point;radius:number;index:number};
const presets:Record<number,Point[]>={
 1:[{x:170,y:36},{x:81,y:161},{x:262,y:161}],
 2:[{x:106,y:48},{x:239,y:48},{x:239,y:165},{x:106,y:165}],
 3:[{x:72,y:77},{x:271,y:77},{x:271,y:146},{x:72,y:146}],
};
const names=['원','삼각형','사각형','직사각형'];
const xy=(event:ReactPointerEvent<SVGSVGElement>):Point=>{
 const r=event.currentTarget.getBoundingClientRect();
 return {x:(event.clientX-r.left)*340/r.width,y:(event.clientY-r.top)*210/r.height};
};
const pointsText=(pts:Point[])=>pts.map(pt=>pt.x+','+pt.y).join(' ');
const clone=(id:number)=>presets[id]?.map(pt=>({...pt}))??[];
export function ShapePlayLab({problem:p}:LabProps){
 const start=bound(Math.round(p.a),0,3);
 const [shape,setShape]=useState(start);
 const [vertices,setVertices]=useState<Point[]>(clone(start));
 const [center,setCenter]=useState<Point>({x:170,y:105});
 const [radius,setRadius]=useState(65);
 const [selected,setSelected]=useState<{kind:'side'|'corner';index:number}|null>(null);
 const [edits,setEdits]=useState(0);
 const drag=useRef<Drag|null>(null);
 const choose=(kind:number)=>{
  setShape(kind);setVertices(clone(kind));setCenter({x:170,y:105});
  setRadius(65);setSelected(null);setEdits(0);
 };
 const down=(event:ReactPointerEvent<SVGSVGElement>)=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const target=event.target as Element;
  const side=target.closest('[data-side]')?.getAttribute('data-side');
  if(side!==null&&side!==undefined){
    setSelected({kind:'side',index:Number(side)});setEdits(n=>n+1);return;
  }
  const vertex=target.closest('[data-corner]')?.getAttribute('data-corner');
  const body=target.closest('[data-shape-body]');
  if(vertex===null&&!body)return;
  const index=vertex===null?-1:Number(vertex);
  if(index>=0)setSelected({kind:'corner',index});
  drag.current={origin:xy(event),original:vertices.map(pt=>({...pt})),
    circle:{...center},radius,index};
  setEdits(n=>n+1);
  try{event.currentTarget.setPointerCapture(event.pointerId);}catch{/* simulated DOM */}
 };
 const move=(event:ReactPointerEvent<SVGSVGElement>)=>{
  const state=drag.current;if(!state)return;
  const now=xy(event),dx=now.x-state.origin.x,dy=now.y-state.origin.y;
  if(shape===0){
    if(state.index===0){
      setRadius(bound(Math.round(Math.hypot(now.x-center.x,now.y-center.y)),28,90));
    }else setCenter({x:bound(state.circle.x+dx,92,248),y:bound(state.circle.y+dy,82,137)});
  }else{
    setVertices(state.original.map((pt,i)=>i===state.index||state.index===-1?
      {x:bound(pt.x+dx,22,317),y:bound(pt.y+dy,20,189)}:pt));
  }
 };
 const up=(event:ReactPointerEvent<SVGSVGElement>)=>{
  drag.current=null;
  try{if(event.currentTarget.hasPointerCapture?.(event.pointerId))
    event.currentTarget.releasePointerCapture(event.pointerId);}catch{/* released */}
 };
 const n=vertices.length;
 return <div className="lab-body lab-shape-play" data-testid="shape-play-lab">
  <div className="shape-play-hint"><strong>세모·네모·동그라미를 직접 움직여 봐요!</strong>
    <span>도형 안쪽을 잡고 이동하거나 주황 점을 끌어 모양을 바꿔 보세요.</span></div>
  <div className="shape-play-select" role="group" aria-label="도형 선택">
    {names.map((name,i)=><button type="button" key={name} aria-pressed={shape===i}
      onClick={()=>choose(i)}>{name}</button>)}
  </div>
  <svg className="shape-play-stage" viewBox="0 0 340 210" data-testid="shape-play-stage"
    role="group" tabIndex={0} aria-label="도형을 직접 끌어 이동하고 꼭짓점을 터치해 모양을 바꿔 보세요"
    onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
    <defs><pattern id="shape-play-grid" width="21" height="21" patternUnits="userSpaceOnUse">
      <path d="M21 0H0V21" fill="none" stroke="#dee9fa" strokeWidth="1"/></pattern></defs>
    <rect width="340" height="210" rx="10" fill="url(#shape-play-grid)" pointerEvents="none"/>
    {shape===0?<g>
      <circle data-shape-body="true" cx={center.x} cy={center.y} r={radius}
        className="shape-play-body" strokeWidth="4" fill="#bfd0fc" stroke="#647ee0"/>
      <circle cx={center.x} cy={center.y} r="5" fill="#4d65b9" pointerEvents="none"/>
      <circle data-corner="0" cx={center.x+radius} cy={center.y} r="12"
        className="shape-play-handle" fill="#f4b363" stroke="#fff" strokeWidth="3"/>
    </g>:<g>
      <polygon data-shape-body="true" points={pointsText(vertices)}
        className="shape-play-body" fill="#bfd0fc" stroke="#647ee0" strokeWidth="3"/>
      {vertices.map((pt,i)=><g key={'s'+i} role="button" tabIndex={0}
        aria-label={(i+1)+'번째 변 선택'}
        onClick={()=>setSelected({kind:'side',index:i})}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected({kind:'side',index:i});}}}>
        <line data-side={i} x1={pt.x} y1={pt.y}
          x2={vertices[(i+1)%n].x} y2={vertices[(i+1)%n].y}
          stroke={selected?.kind==='side'&&selected.index===i?'#f3a04d':'#647ee0'}
          strokeWidth={selected?.kind==='side'&&selected.index===i?11:8} strokeLinecap="round"/>
      </g>)}
      {vertices.map((pt,i)=><g key={'v'+i} role="button" tabIndex={0}
        aria-label={(i+1)+'번째 꼭짓점 선택'}
        onClick={()=>setSelected({kind:'corner',index:i})}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected({kind:'corner',index:i});}}}>
        <circle data-corner={i} cx={pt.x} cy={pt.y} r="12"
          className="shape-play-handle"
          fill={selected?.kind==='corner'&&selected.index===i?'#ed8e3a':'#f4b363'}
          stroke="#fff" strokeWidth="3"/>
      </g>)}
    </g>}
  </svg>
  <div className="shape-play-explain" aria-live="polite">
    <strong>{names[shape]} · {shape===0?'곧은 변 0개 · 꼭짓점 0개':
      '변 '+n+'개 · 꼭짓점 '+n+'개'}</strong>
    <span>{shape===0?'원에는 곧은 변이나 꼭짓점이 없어요. 주황 점을 끌면 원의 크기가 달라져요.':
      selected?(selected.index+1)+'번째 '+(selected.kind==='side'?'변':'꼭짓점')+
       '을 선택했어요. 곧은 변과 꺾이는 꼭짓점을 직접 찾아보세요.':
       '변과 꼭짓점을 눌러 보세요. 꼭짓점을 옮겨도 삼각형은 변 3개, 사각형은 변 4개예요.'}</span>
    <small>직접 조작 {edits}번 · 각도의 도(°) 단위는 4학년에서 배워요.</small>
  </div>
  <LabTools>
    <button className="lab-action" type="button" onClick={()=>{
      if(shape===0)setCenter(v=>({...v,x:v.x===170?192:170}));
      else setVertices(v=>v.map(pt=>({...pt,x:bound(pt.x+12,22,317)})));
      setEdits(n=>n+1);
    }}>→ 도형 직접 옮기기</button>
    <button className="lab-action" type="button" onClick={()=>choose(start)}>↺ 원래 도형</button>
  </LabTools>
  <LabHint>2학년에서는 각도를 45°처럼 계산하기보다 세모·네모·동그라미의
    생김새와 변·꼭짓점의 수를 찾아요.</LabHint>
 </div>;
}

export function LinePlayLab({problem:p}:LabProps){
 const initial=bound(Math.round(p.a),0,2);
 const [kind,setKind]=useState(initial);
 const [endpoints,setEndpoints]=useState<Point[]>([{x:92,y:104},{x:244,y:104}]);
 const drag=useRef<{index:number;origin:Point;original:Point[]}|null>(null);
 const names=['직선','선분','반직선'];
 const pointer=(e:ReactPointerEvent<SVGSVGElement>)=>{
  const state=drag.current;if(!state)return;
  const now=xy(e),dx=now.x-state.origin.x,dy=now.y-state.origin.y;
  setEndpoints(state.original.map((pt,i)=>i===state.index?
    {x:bound(pt.x+dx,35,309),y:bound(pt.y+dy,35,177)}:pt));
 };
 const onDown=(e:ReactPointerEvent<SVGSVGElement>)=>{
  const part=(e.target as Element).closest('[data-line-point]')?.getAttribute('data-line-point');
  if(part===undefined||part===null)return;
  drag.current={index:Number(part),origin:xy(e),original:endpoints.map(pt=>({...pt}))};
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* simulated DOM */}
 };
 const onUp=(e:ReactPointerEvent<SVGSVGElement>)=>{
  drag.current=null;
  try{if(e.currentTarget.hasPointerCapture?.(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}catch{/* released */}
 };
 const a=endpoints[0],b=endpoints[1],size=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));
 const ux=(b.x-a.x)/size,uy=(b.y-a.y)/size;
 const from=kind===0?{x:a.x-ux*48,y:a.y-uy*48}:a;
 const to=kind===1?b:{x:b.x+ux*48,y:b.y+uy*48};
 return <div className="lab-body lab-shape-play" data-testid="line-play-lab">
  <div className="shape-play-hint"><strong>선의 양 끝을 비교해 보세요.</strong>
   <span>주황 점을 잡아서 선의 길이와 방향을 직접 바꿀 수 있어요.</span></div>
  <div className="shape-play-select" role="group" aria-label="선의 종류 선택">
   {names.map((name,i)=><button key={name} type="button" aria-pressed={kind===i}
     onClick={()=>setKind(i)}>{name}</button>)}
  </div>
  <svg viewBox="0 0 340 210" role="group" tabIndex={0}
    className="shape-play-stage" data-testid="line-play-stage"
    aria-label="주황색 양 끝 손잡이를 드래그하여 선을 움직여 보세요"
    onPointerDown={onDown} onPointerMove={pointer} onPointerUp={onUp} onPointerCancel={onUp}>
    <defs><marker id="line-play-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5"
      orient="auto-start-reverse"><path d="M0 0L7 3.5L0 7Z" fill="#5b76d1"/></marker></defs>
    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
      stroke="#5d78d8" strokeWidth="7" strokeLinecap="round"
      markerStart={kind===0?'url(#line-play-arrow)':undefined}
      markerEnd={kind!==1?'url(#line-play-arrow)':undefined}/>
    {endpoints.map((pt,i)=><circle key={i} data-line-point={i}
      cx={pt.x} cy={pt.y} r="13" className="shape-play-handle"
      fill="#f1b066" stroke="#fff" strokeWidth="3"/>)}
  </svg>
  <div className="shape-play-explain"><strong>{names[kind]}</strong>
    <span>{kind===0?'직선은 양쪽으로 끝없이 뻗어요.':
      kind===1?'선분은 양쪽에 끝점이 있어요.':'반직선은 시작점이 하나이고 한쪽으로 계속 뻗어요.'}</span></div>
  <LabTools><button type="button" className="lab-action"
    onClick={()=>{setKind(initial);setEndpoints([{x:92,y:104},{x:244,y:104}]);}}>
    ↺ 처음 선</button></LabTools>
  <LabHint>화살표가 붙은 쪽은 계속 뻗는 방향이에요. 45° 같은 각도 수치는 아직 필요 없어요.</LabHint>
 </div>;
}
