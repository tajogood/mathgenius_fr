import {useMemo,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent,KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {LabProps} from './types';
import {LabHint,LabTools,bound} from './types';
import {
  buildPolyhedron,projectPoint,polyhedronCounts,facesContainingEdge,facesContainingVertex,
  type PolyKind,type P2
} from './polyhedronMath.ts';

type Focus='face'|'edge'|'vertex';
type Drag={x:number;y:number;yaw:number;pitch:number;moved:boolean};
const COLORS=['#93b1f5','#8dc6d7','#b3a5ef','#f1c283','#a0d3b6','#e9b1bd','#9cbded','#c6c8ea'];
const toPoints=(points:readonly P2[])=>points.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
function attachedPolygon(x:number,y:number,side:number,n:number,direction:'above'|'below') {
 const apothem=side/(2*Math.tan(Math.PI/n)),radius=side/(2*Math.sin(Math.PI/n));
 const cx=x+side/2,cy=y+(direction==='above'?-apothem:apothem);
 const start=(direction==='above'?Math.PI/2+Math.PI/n:-Math.PI/2-Math.PI/n);
 const delta=(direction==='above'?-1:1)*2*Math.PI/n;
 return Array.from({length:n},(_,i)=>({
   x:cx+radius*Math.cos(start+delta*i),
   y:cy+radius*Math.sin(start+delta*i),
 }));
}
function PolygonNet({kind,sides,select,selected}:{
 kind:PolyKind;sides:number;select:(id:string)=>void;selected:string;
}){
 const n=sides;
 if(kind==='prism'){
   const unit=270/n, start=(334-unit*n)/2;
   // Side length equals the base-polygon edge; strip height preserves
   // the prism's 1.66:side-length ratio (not a fake flat drawing).
   const stripHeight=unit*1.66/(2*Math.sin(Math.PI/n));
   const stripTop=110,stripBottom=stripTop+stripHeight;
   const top=attachedPolygon(start,stripTop,unit,n,'above');
   const bottom=attachedPolygon(start+unit*(n-1),stripBottom,unit,n,'below');
   return <svg className="polyhedron-net" viewBox="0 0 334 305"
      role="group" aria-label={n+'각기둥의 두 밑면과 '+n+'개 옆면을 연결한 전개도'}>
     {Array.from({length:n},(_,i)=><g key={i} role="button" tabIndex={0}
       aria-label={'전개도의 '+(i+1)+'번째 옆면 선택'}
       aria-pressed={selected==='side-'+i}
       onClick={()=>select('side-'+i)}
       onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('side-'+i);}}}>
       <rect x={start+unit*i} y={stripTop} width={unit} height={stripHeight}
         fill={COLORS[i%COLORS.length]} fillOpacity=".9"
         stroke={selected==='side-'+i?'#f59d3b':'#657fce'}
         strokeWidth={selected==='side-'+i?4:2}/>
       <text x={start+unit*(i+.5)} y={stripTop+stripHeight/2+4} textAnchor="middle" fontSize={n<=5?12:9}
         fontWeight="800" fill="#395293" pointerEvents="none">{i+1}</text>
     </g>)}
     {[
       {id:'top',title:'윗면',points:top},
       {id:'bottom',title:'아랫면',points:bottom}
     ].map(f=><g key={f.id} role="button" tabIndex={0}
       aria-pressed={selected===f.id} aria-label={'전개도의 '+f.title+' 선택'}
       onClick={()=>select(f.id)}
       onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(f.id);}}}>
       <polygon points={toPoints(f.points.map(p=>({...p,depth:0})))}
         fill="#f0d7a3" stroke={selected===f.id?'#f59d3b':'#977dbe'}
         strokeWidth={selected===f.id?4:2}/>
       <text x={f.points.reduce((s,p)=>s+p.x,0)/n}
         y={f.points.reduce((s,p)=>s+p.y,0)/n+4}
         fontSize="11" fontWeight="900" fill="#71548d" textAnchor="middle" pointerEvents="none">
         {f.title}</text>
     </g>)}
     <text x="167" y="295" fontSize="10" fill="#7386b4" textAnchor="middle">
      같은 다각형 밑면 2개 + 옆면 {n}개</text>
   </svg>;
 }
 const radius=44,cx=167,cy=148;
 const base=Array.from({length:n},(_,i)=>({
   x:cx+radius*Math.cos(2*Math.PI*i/n-Math.PI/2),
   y:cy+radius*Math.sin(2*Math.PI*i/n-Math.PI/2),depth:0
 }));
 return <svg className="polyhedron-net" viewBox="0 0 334 305" role="group"
   aria-label={n+'각뿔의 다각형 밑면 하나와 삼각형 옆면 '+n+'개 전개도'}>
   {base.map((point,i)=>{
     const next=base[(i+1)%n],mx=(point.x+next.x)/2,my=(point.y+next.y)/2;
     const vx=mx-cx,vy=my-cy,dist=Math.hypot(vx,vy)||1;
     // Slant height of each unfolded triangular face comes from the
     // pyramid's actual 1.86-unit altitude and polygon apothem.
     const altitude=1.86*radius,apothem=radius*Math.cos(Math.PI/n);
     const slantHeight=Math.hypot(altitude,apothem);
     const tip={x:mx+vx/dist*slantHeight,y:my+vy/dist*slantHeight};
     const id='side-'+i;
     return <g key={id} role="button" tabIndex={0} aria-pressed={selected===id}
       aria-label={'전개도의 '+(i+1)+'번째 삼각형 옆면 선택'}
       onClick={()=>select(id)}
       onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(id);}}}>
       <polygon points={toPoints([point,next,{...tip,depth:0}])}
         stroke={selected===id?'#e89438':'#7186cd'}
         strokeWidth={selected===id?4:2}
         fill={COLORS[i%COLORS.length]} fillOpacity=".85"/>
       <text x={mx+(tip.x-mx)*.48} y={my+(tip.y-my)*.48+3}
         fontSize="11" fontWeight="900" fill="#38548b" textAnchor="middle"
         pointerEvents="none">{i+1}</text>
     </g>;
   })}
   <g role="button" tabIndex={0} aria-pressed={selected==='base'}
     aria-label="전개도의 다각형 밑면 선택"
     onClick={()=>select('base')}
     onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('base');}}}>
     <polygon points={toPoints(base)} fill="#edcf94"
       stroke={selected==='base'?'#e89438':'#8c7bb7'}
       strokeWidth={selected==='base'?4:2}/>
     <text x={cx} y={cy+4} textAnchor="middle" fontSize="12"
       fontWeight="900" fill="#71528a" pointerEvents="none">밑면</text>
   </g>
   <text x="167" y="295" fontSize="10" fill="#7386b4" textAnchor="middle">
    다각형 밑면 1개 + 삼각형 옆면 {n}개</text>
 </svg>;
}

export function PolyhedronExplorerLab({problem:p,standardId}:LabProps){
 const initialKind:PolyKind=p.topic==='pyramid'?'pyramid':'prism';
 const [kind,setKind]=useState<PolyKind>(initialKind);
 const [sides,setSides]=useState(bound(Math.round(p.a)||3,3,8));
 const [yaw,setYaw]=useState(-29);
 const [pitch,setPitch]=useState(25);
 const [mode,setMode]=useState<Focus>('face');
 const [faceId,setFaceId]=useState('side-0');
 const [edgeId,setEdgeId]=useState('');
 const [vertexId,setVertexId]=useState(0);
 const [netOpen,setNetOpen]=useState(standardId==='6수03-06');
 const [touchedFaces,setTouchedFaces]=useState<Set<string>>(()=>new Set());
 const drag=useRef<Drag|null>(null);
 const movedClick=useRef(false);
 const model=useMemo(()=>buildPolyhedron(kind,sides),[kind,sides]);
 const counts=polyhedronCounts(kind,sides);
 const shown=useMemo(()=>model.vertices.map(p=>projectPoint(p,yaw,pitch)),[model,yaw,pitch]);
 const sortedFaces=useMemo(()=>model.faces.map(face=>({
   ...face,
   depth:face.vertices.reduce((sum,i)=>sum+shown[i].depth,0)/face.vertices.length,
   points:face.vertices.map(i=>shown[i])
 })).sort((a,b)=>a.depth-b.depth),[model,shown]);
 const changeKind=(next:PolyKind)=>{
   setKind(next);setFaceId(next==='prism'?'side-0':'base');setMode('face');
   setEdgeId('');setVertexId(0);setTouchedFaces(new Set());
 };
 const changeSides=(next:number)=>{
   setSides(bound(next,3,8));setFaceId('side-0');setMode('face');
   setEdgeId('');setVertexId(0);setTouchedFaces(new Set());
 };
 const selectedFace=model.faces.find(f=>f.id===faceId)??model.faces[0];
 const chosenEdge=model.edges.find(e=>e.id===edgeId)??model.edges[0];
 const chosenFaces=mode==='edge'&&chosenEdge?facesContainingEdge(model,chosenEdge):
   mode==='vertex'?facesContainingVertex(model,vertexId):[];
 const selectFace=(id:string)=>{
   if(movedClick.current){movedClick.current=false;return;}
   setFaceId(id);setMode('face');
   setTouchedFaces(prev=>new Set(prev).add(id));
 };
 const pickEdge=(id:string)=>{setEdgeId(id);setMode('edge');};
 const pickVertex=(index:number)=>{setVertexId(index);setMode('vertex');};
 const startDrag=(e:ReactPointerEvent<SVGSVGElement>)=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   movedClick.current=false;
   drag.current={x:e.clientX,y:e.clientY,yaw,pitch,moved:false};
   try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* unavailable in simulated UI */}
 };
 const moveDrag=(e:ReactPointerEvent<SVGSVGElement>)=>{
   const state=drag.current;if(!state)return;
   const dx=e.clientX-state.x,dy=e.clientY-state.y;
   if(Math.abs(dx)+Math.abs(dy)>6)state.moved=true;
   if(!state.moved)return;
   movedClick.current=true;
   setYaw(state.yaw+dx*.7);
   setPitch(bound(state.pitch+dy*.55,-65,65));
 };
 const endDrag=(e:ReactPointerEvent<SVGSVGElement>)=>{
   drag.current=null;
   try{
     if(e.currentTarget.hasPointerCapture?.(e.pointerId))
       e.currentTarget.releasePointerCapture(e.pointerId);
   }catch{/* already released */}
 };
 const onStageKey=(e:ReactKeyboardEvent<SVGSVGElement>)=>{
   if(e.target!==e.currentTarget)return;
   if(e.key==='ArrowLeft'){e.preventDefault();setYaw(v=>v-15);}
   if(e.key==='ArrowRight'){e.preventDefault();setYaw(v=>v+15);}
   if(e.key==='ArrowUp'){e.preventDefault();setPitch(v=>bound(v+12,-65,65));}
   if(e.key==='ArrowDown'){e.preventDefault();setPitch(v=>bound(v-12,-65,65));}
 };
 const nextFace=()=>{
   const index=model.faces.findIndex(f=>f.id===faceId);
   selectFace(model.faces[(index+1)%model.faces.length].id);
 };
 const selectedInfo=mode==='face'?(selectedFace.kind==='base'?
   (kind==='prism'?'두 밑면은 서로 평행하고 크기와 모양이 같아요.':'각뿔의 밑면은 단 한 개예요.'):
   (kind==='prism'?'각기둥의 옆면은 직사각형이에요.':'각뿔의 옆면은 꼭대기에서 만나는 삼각형이에요.')):
   mode==='edge'?'모서리는 면과 면이 만나는 선분이에요. 각기둥은 3×'+sides+'='+counts.edges+'개, 각뿔은 2×'+sides+'='+counts.edges+'개예요.':
     '꼭짓점은 여러 모서리가 만나는 점이에요. 도형을 돌리면서 모든 점을 찾아보세요.';
 return <div className="lab-body lab-polyhedron" data-testid="polyhedron-explorer">
   <div className="poly-choice" role="group" aria-label="각기둥과 각뿔 모양 선택">
     <button type="button" aria-pressed={kind==='prism'} onClick={()=>changeKind('prism')}>▣ 각기둥</button>
     <button type="button" aria-pressed={kind==='pyramid'} onClick={()=>changeKind('pyramid')}>▲ 각뿔</button>
     <button type="button" aria-expanded={netOpen} onClick={()=>setNetOpen(v=>!v)}>
       {netOpen?'▣ 전개도 접기':'▤ 전개도 펼치기'}</button>
   </div>
   <div className="poly-focus" role="group" aria-label="면 모서리 꼭짓점 관찰">
     <button type="button" aria-pressed={mode==='face'} onClick={()=>setMode('face')}>면 {counts.faces}개</button>
     <button type="button" aria-pressed={mode==='edge'} onClick={()=>{setMode('edge');setEdgeId(model.edges[0].id);}}>모서리 {counts.edges}개</button>
     <button type="button" aria-pressed={mode==='vertex'} onClick={()=>setMode('vertex')}>꼭짓점 {counts.vertices}개</button>
   </div>
   <div className={'poly-layout'+(netOpen?' poly-layout--net':'')}>
     <div className="poly-view">
       <svg viewBox="0 0 334 236" className="poly-viewport" tabIndex={0}
         role="group" aria-label={sides+'각'+(kind==='prism'?'기둥':'뿔')+' 3차원 모형. 마우스나 손가락으로 끌어 회전'}
         data-testid="polyhedron-rotate-stage" onPointerDown={startDrag}
         onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
         onKeyDown={onStageKey}>
         <defs><pattern id="poly-grid" width="20" height="20" patternUnits="userSpaceOnUse">
           <path d="M20 0H0V20" fill="none" stroke="#e0e9f8" strokeWidth="0.8"/></pattern></defs>
         <rect width="334" height="236" rx="14" fill="url(#poly-grid)" pointerEvents="none"/>
         {sortedFaces.map((face)=>{
           const highlighted=mode==='face'?face.id===faceId:chosenFaces.some(f=>f.id===face.id);
           return <g key={face.id} role="button" tabIndex={0}
             aria-label={face.label+' 직접 선택'}
             aria-pressed={mode==='face'&&face.id===faceId}
             onClick={()=>selectFace(face.id)}
             onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.stopPropagation();e.preventDefault();selectFace(face.id);}}}>
             <polygon points={toPoints(face.points)}
               fill={face.kind==='base'?'#f0cd93':COLORS[Number(face.id.split('-')[1]||0)%COLORS.length]}
               fillOpacity={highlighted?.98:.88}
               stroke={highlighted?'#e48f2d':'#6177c8'} strokeWidth={highlighted?4:2.5}
               strokeLinejoin="round" className="poly-face-polygon"/>
             <text x={face.points.reduce((acc,p)=>acc+p.x,0)/face.points.length}
               y={face.points.reduce((acc,p)=>acc+p.y,0)/face.points.length+4}
               textAnchor="middle" fill="#324a91" fontWeight="900" fontSize="10"
               pointerEvents="none">{face.kind==='base'?'밑면':Number(face.id.split('-')[1])+1}</text>
           </g>;
         })}
         {mode==='edge'&&model.edges.map((edge,i)=>{
           const a=shown[edge.vertices[0]],b=shown[edge.vertices[1]];
           return <g key={edge.id} role="button" tabIndex={0} aria-pressed={edge.id===edgeId}
             aria-label={(i+1)+'번째 모서리 선택'}
             onClick={()=>pickEdge(edge.id)}
             onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickEdge(edge.id);}}}>
             <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
               stroke={edge.id===edgeId?'#ee8136':'#5c6db7'}
               strokeWidth={edge.id===edgeId?8:6} opacity={edge.id===edgeId?1:.62}
               strokeLinecap="round"/>
           </g>;
         })}
         {mode==='vertex'&&shown.map((pt,i)=><g key={i} role="button" tabIndex={0}
           aria-label={(i+1)+'번째 꼭짓점 선택'} aria-pressed={vertexId===i}
           onClick={()=>pickVertex(i)}
           onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickVertex(i);}}}>
           <circle cx={pt.x} cy={pt.y} r={vertexId===i?10:7}
             stroke="#fff" strokeWidth="2.5" fill={vertexId===i?'#ef8d37':'#708ee4'}/>
         </g>)}
         <text x="167" y="224" textAnchor="middle" fontSize="10"
           fontWeight="800" fill="#7184b0" pointerEvents="none">손가락으로 돌리기 · 면을 누르면 강조돼요</text>
       </svg>
       <div className="poly-turn-buttons" role="group" aria-label="입체도형 회전 도우미">
         <button type="button" onClick={()=>setYaw(v=>v-35)}>↶ 왼쪽</button>
         <button type="button" onClick={()=>setYaw(v=>v+35)}>↷ 오른쪽</button>
         <button type="button" onClick={()=>setPitch(v=>bound(v+20,-65,65))}>↑ 위로</button>
         <button type="button" onClick={()=>{setYaw(-29);setPitch(25);}}>↺ 처음 각도</button>
       </div>
     </div>
     {netOpen&&<div className="poly-net-panel" data-testid="polyhedron-net">
       <strong>{sides}각{kind==='prism'?'기둥':'뿔'}을 펼친 진짜 전개도</strong>
       <PolygonNet kind={kind} sides={sides} selected={faceId} select={selectFace}/>
       <small>펼친 면을 직접 누르면 입체의 같은 면이 강조돼요.</small>
     </div>}
   </div>
   <div className="poly-info" data-testid="polyhedron-count-explanation" aria-live="polite">
     <strong>{sides}각{kind==='prism'?'기둥':'뿔'}: 밑면 {counts.bases}개 + 옆면 {counts.sideFaces}개 = 면 {counts.faces}개</strong>
     <div className="poly-count-row">
       <span>면 <b>{counts.faces}개</b></span>
       <span>모서리 <b>{counts.edges}개</b></span>
       <span>꼭짓점 <b>{counts.vertices}개</b></span>
     </div>
     <p>{selectedInfo}</p>
     {mode==='face'&&<small>선택한 면: {selectedFace.label} · 확인한 면 {touchedFaces.size}/{counts.faces}개</small>}
     {mode==='edge'&&chosenEdge&&<small>선택한 모서리: {facesContainingEdge(model,chosenEdge).map(f=>f.label).join('과 ')}이 만나요.</small>}
     {mode==='vertex'&&<small>이 꼭짓점에 모인 면: {facesContainingVertex(model,vertexId).map(f=>f.label).join(', ')}</small>}
   </div>
   <LabTools>
     <label className="lab-slider-label">밑면 변 {sides}개
       <input type="range" aria-label="밑면 변 수" min="3" max="8" step="1"
         value={sides} onChange={e=>changeSides(Number(e.target.value))}/></label>
     <button type="button" className="lab-action" onClick={()=>changeSides(sides<8?sides+1:3)}>+ 밑면 변 하나 더</button>
     <button type="button" className="lab-action" onClick={nextFace}>▶ 다음 면 찾기</button>
     <button type="button" className="lab-action" onClick={()=>{
       changeKind(initialKind);changeSides(bound(p.a||3,3,8));
       setYaw(-29);setPitch(25);setNetOpen(standardId==='6수03-06');
     }}>↺ 원래 도형</button>
   </LabTools>
   <LabHint>밑면의 변 수를 바꾸어 {kind==='prism'?'옆면과 꼭짓점이 모두 함께 늘어나는지':
     '삼각형 옆면과 꼭짓점 수가 어떻게 달라지는지'} 관찰해 보세요.
     {' '}입체를 직접 돌리고 면을 터치한 뒤 전개도에서도 같은 면을 찾아보세요.</LabHint>
 </div>;
}
