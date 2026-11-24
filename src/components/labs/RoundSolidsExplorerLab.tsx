import {useMemo,useRef,useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent,PointerEvent as ReactPointerEvent} from 'react';
import type {LabProps} from './types';
import {LabHint,LabTools,SmallControl,bound} from './types';
import {projectPoint,type P3,type P2} from './polyhedronMath.ts';
import {ROUND_SOLID_LABELS,ROUND_SOLID_PARTS,roundSurfaceExplanation,
  coneNetSectorAngle,type RoundSolid} from './roundSolidMath.ts';

type RoundPart='base'|'curve'|'apex';
type MeshFace={id:string;part:RoundPart;points:P3[];label:string};
const sides=24;
const ring=(y:number,radius:number):P3[]=>Array.from({length:sides},(_,i)=>{
  const t=i*2*Math.PI/sides;
  return {x:Math.sin(t)*radius,y,z:Math.cos(t)*radius};
});
function meshFor(shape:RoundSolid,radius:number):MeshFace[]{
 if(shape==='sphere'){
  const latSteps=10;
  const rows=Array.from({length:latSteps+1},(_,i)=>{
    const angle=-Math.PI/2+i*Math.PI/latSteps;
    return ring(Math.sin(angle)*radius,Math.cos(angle)*radius);
  });
  const result:MeshFace[]=[];
  for(let a=0;a<latSteps;a++)for(let b=0;b<sides;b++){
    result.push({
      id:'patch-'+a+'-'+b,part:'curve',label:'구의 둥근 곡면',
      points:[rows[a][b],rows[a][(b+1)%sides],
        rows[a+1][(b+1)%sides],rows[a+1][b]]
    });
  }
  return result;
 }
 const low=ring(-.86,radius),high=ring(.86,radius);
 const result:MeshFace[]=[];
 if(shape==='cylinder'){
   result.push({id:'bottom',part:'base',label:'아랫면',points:[...low].reverse()});
   for(let i=0;i<sides;i++)result.push({id:'side-'+i,part:'curve',
     label:'둥근 옆면',points:[low[i],low[(i+1)%sides],high[(i+1)%sides],high[i]]});
   result.push({id:'top',part:'base',label:'윗면',points:high});
 }else{
   const apex:P3={x:0,y:1.16,z:0};
   result.push({id:'bottom',part:'base',label:'원 모양 밑면',points:[...low].reverse()});
   for(let i=0;i<sides;i++)result.push({id:'side-'+i,part:'curve',
     label:'부드러운 원뿔 옆면',points:[low[i],low[(i+1)%sides],apex]});
 }
 return result;
}
const points=(pts:readonly P2[])=>pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
function RoundNet({shape,select,selected}:{
  shape:RoundSolid;select:(part:RoundPart)=>void;selected:RoundPart
}){
 if(shape==='sphere')return <div className="round-net-none">구의 곡면은 찢거나 구기지 않고
   평면으로 완전히 펼칠 수 없어요.</div>;
 if(shape==='cylinder')return <svg viewBox="0 0 300 230" className="round-net-svg"
   role="group" aria-label="원기둥의 원 두 개와 옆면 직사각형 전개도">
   <g role="button" tabIndex={0} aria-label="둥근 옆면을 펼친 직사각형 선택"
      onClick={()=>select('curve')}
      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('curve');}}}>
     <rect x="55" y="78" width="190" height="72" rx="1"
       fill="#a6bdf3" stroke={selected==='curve'?'#eb953e':'#607acc'}
       strokeWidth={selected==='curve'?4:2.5}/>
     <text x="150" y="115" fontSize="12" textAnchor="middle"
       fill="#4c63a5" fontWeight="900" pointerEvents="none">직사각형 옆면</text>
   </g>
   {[{y:48,name:'윗면'},{y:180,name:'아랫면'}].map((circle,i)=>
      <g key={i} role="button" tabIndex={0}
        aria-label={'전개도의 '+circle.name+' 선택'}
        onClick={()=>select('base')}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('base');}}}>
        <circle cx="150" cy={circle.y} r="30"
          fill="#f3d09c" stroke={selected==='base'?'#eb953e':'#8978c2'}
          strokeWidth={selected==='base'?4:2.5}/>
        <text x="150" y={circle.y+4} fontSize="11" fill="#8569a1"
          textAnchor="middle" fontWeight="900" pointerEvents="none">{circle.name}</text>
      </g>)}
   <text x="150" y="219" textAnchor="middle" fontSize="10" fill="#7086b4">
     원 2개 + 직사각형 옆면</text>
 </svg>;
 // Exact sector geometry: radius=slant height; arc length=base circumference.
 const angle=coneNetSectorAngle(1,2.02);
 const R=91,center={x:163,y:80};
 const start=Math.PI/2-angle/2,end=Math.PI/2+angle/2;
 const ax=center.x+R*Math.cos(start),ay=center.y+R*Math.sin(start);
 const bx=center.x+R*Math.cos(end),by=center.y+R*Math.sin(end);
 const path='M'+center.x+' '+center.y+'L'+ax+' '+ay+'A'+R+' '+R+' 0 0 1 '+bx+' '+by+'Z';
 return <svg viewBox="0 0 300 260" className="round-net-svg" role="group"
   aria-label="원뿔 밑면 원 하나와 옆면 부채꼴 전개도">
   <g role="button" tabIndex={0} aria-label="원뿔의 부채꼴 옆면 선택"
     onClick={()=>select('curve')}
     onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('curve');}}}>
      <path d={path} fill="#a6bdf3" stroke={selected==='curve'?'#eb953e':'#607acc'}
        strokeWidth={selected==='curve'?4:2.5}/>
      <text x="163" y="129" fontSize="11" fontWeight="900"
        textAnchor="middle" fill="#5268b0" pointerEvents="none">부채꼴 옆면</text>
   </g>
   <g role="button" tabIndex={0} aria-label="원뿔의 원형 밑면 선택"
     onClick={()=>select('base')}
     onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('base');}}}>
     <circle cx="163" cy="202" r="31" fill="#f2d098"
       stroke={selected==='base'?'#eb953e':'#8978c2'}
       strokeWidth={selected==='base'?4:2.5}/>
     <text x="163" y="207" fontSize="11" fill="#826b9c"
       textAnchor="middle" fontWeight="900" pointerEvents="none">밑면</text>
   </g>
   <text x="150" y="252" textAnchor="middle" fontSize="10" fill="#7086b4">
     원 1개 + 부채꼴 옆면</text>
 </svg>;
}
export function RoundSolidsExplorerLab({problem:p,phase,standardId}:LabProps){
 // 문제 풀이 중에는 그림이 곧 문제이므로 모양을 바꾸거나 이름을 보여 주지 않는다
 const quiz=phase==='question';
 const initial:RoundSolid=standardId==='6수03-08'?'cylinder':
    p.topic==='shapes3d'&&p.a===2?'sphere':
    p.topic==='curvedsolids'&&p.a===1?'cone':
    p.topic==='curvedsolids'&&p.a===2?'sphere':'cylinder';
 const [chosenShape,setShape]=useState<RoundSolid>(initial);
 const shape:RoundSolid=quiz?initial:chosenShape; // 문제 중에는 항상 정답 입체
 const [yaw,setYaw]=useState(-25),[pitch,setPitch]=useState(24);
 const [radius,setRadius]=useState(3);
 const [selected,setSelected]=useState<RoundPart>('curve');
 const [netOpen,setNetOpen]=useState(standardId==='6수03-08');
 const drag=useRef<{x:number;y:number;yaw:number;pitch:number;moved:boolean}|null>(null);
 const skip=useRef(false);
 const model=useMemo(()=>meshFor(shape,radius/3),[shape,radius]);
 const projected=useMemo(()=>model.map(face=>{
   const pts=face.points.map(p=>projectPoint(p,yaw,pitch));
   return {...face,points:pts,
     depth:pts.reduce((acc,p)=>acc+p.depth,0)/pts.length};
 }).sort((a,b)=>a.depth-b.depth),[model,yaw,pitch]);
 const info=ROUND_SOLID_PARTS[shape];
 const chooseShape=(next:RoundSolid)=>{
   setShape(next);setSelected('curve');setNetOpen(false);setYaw(-25);setPitch(24);
 };
 const start=(e:ReactPointerEvent<SVGSVGElement>)=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   skip.current=false;
   drag.current={x:e.clientX,y:e.clientY,yaw,pitch,moved:false};
   try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* JSDOM */}
 };
 const move=(e:ReactPointerEvent<SVGSVGElement>)=>{
   const state=drag.current;if(!state)return;
   const dx=e.clientX-state.x,dy=e.clientY-state.y;
   if(Math.abs(dx)+Math.abs(dy)>5)state.moved=true;
   if(!state.moved)return;
   skip.current=true;
   setYaw(state.yaw+dx*.8);setPitch(bound(state.pitch+dy*.6,-72,72));
 };
 const finish=(e:ReactPointerEvent<SVGSVGElement>)=>{
   drag.current=null;
   try{if(e.currentTarget.hasPointerCapture?.(e.pointerId))
     e.currentTarget.releasePointerCapture(e.pointerId);}catch{/* released */}
 };
 const select=(part:RoundPart)=>{
   if(skip.current){skip.current=false;return;}
   setSelected(part);
 };
 const onKey=(e:ReactKeyboardEvent<SVGSVGElement>)=>{
   if(e.target!==e.currentTarget)return;
   if(e.key==='ArrowLeft'){e.preventDefault();setYaw(v=>v-19);}
   if(e.key==='ArrowRight'){e.preventDefault();setYaw(v=>v+19);}
   if(e.key==='ArrowUp'){e.preventDefault();setPitch(v=>bound(v+15,-72,72));}
   if(e.key==='ArrowDown'){e.preventDefault();setPitch(v=>bound(v-15,-72,72));}
 };
 return <div className="lab-body lab-round-solids" data-testid="round-solid-explorer">
   <div className="round-solids-select" role="group" aria-label="원기둥 원뿔 구 모양 선택" hidden={quiz}>
     {!quiz&&(['cylinder','cone','sphere'] as const).map(name=><button key={name}
       type="button" aria-pressed={shape===name} onClick={()=>chooseShape(name)}>
       {ROUND_SOLID_LABELS[name]}</button>)}
     {!quiz&&<button type="button" aria-expanded={netOpen} onClick={()=>setNetOpen(v=>!v)}>
        {netOpen?'전개도 접기':'전개도 펼치기'}</button>}
   </div>
   <div className={'round-layout'+(netOpen?' round-layout--net':'')}>
     <svg viewBox="0 0 334 235" className="round-solid-stage" role="group" tabIndex={0}
       data-testid="round-solid-rotate-stage"
       aria-label={'마우스나 손가락으로 직접 회전하는 '+(quiz?'문제 속':ROUND_SOLID_LABELS[shape])+' 입체'}
       onPointerDown={start} onPointerMove={move}
       onPointerUp={finish} onPointerCancel={finish} onKeyDown={onKey}>
       <defs>
         <radialGradient id="sphere-tint" cx=".35" cy=".3"><stop stopColor="#e6eefe"/>
           <stop offset="1" stopColor="#7593da"/></radialGradient>
         <pattern id="round-grid" width="20" height="20" patternUnits="userSpaceOnUse">
           <path d="M20 0H0V20" fill="none" stroke="#e4eaf8" strokeWidth=".8"/></pattern>
       </defs>
       <rect width="334" height="235" fill="url(#round-grid)" pointerEvents="none"/>
       {projected.map((face,i)=>{
         const highlighted=selected===face.part;
         return <g key={face.id} role="button" tabIndex={0}
           aria-label={face.label+' 누르기'}
           aria-pressed={highlighted} onClick={()=>select(face.part)}
           onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(face.part);}}}>
           <polygon points={points(face.points)}
             className="round-surface-facet"
             fill={shape==='sphere'?
               (i%3===0?'#adc2ed':i%3===1?'#a4b9e9':'#95b0e5'):
               face.part==='base'?'#f2cc92':'#99b7ec'}
             stroke={highlighted?'#e3a257':'#7188c8'}
             strokeWidth={highlighted?1.7:.9}
             fillOpacity={highlighted?1:.76}/>
         </g>;
       })}
       {shape==='cone'&&(()=>{
         const pt=projectPoint({x:0,y:1.16,z:0},yaw,pitch);
         return <g role="button" tabIndex={0} aria-label="원뿔의 꼭짓점 선택"
           onClick={()=>select('apex')}
           onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select('apex');}}}>
           <circle cx={pt.x} cy={pt.y} r="8" fill={selected==='apex'?'#eb8732':'#f9c17a'}
             stroke="#fff" strokeWidth="2"/>
         </g>;
       })()}
       <text x="167" y="225" textAnchor="middle" fontSize="10"
         fill="#7086b3" pointerEvents="none">직접 끌어서 돌려 보세요</text>
     </svg>
     {netOpen&&<div className="round-net-panel" data-testid="round-solid-net">
       <strong>옆면을 펼치면 어떤 모양일까요?</strong>
       <RoundNet shape={shape} select={select} selected={selected}/>
     </div>}
   </div>
   <div className="round-discovery" aria-live="polite">
     <strong>{quiz?'그림 속 입체':ROUND_SOLID_LABELS[shape]} · 평평한 원형 밑면 {info.flatBases}개 · 둥근 곡면 {info.curvedSurfaces}개</strong>
     <p>{quiz?'입체를 돌려 보며 평평한 원 모양 밑면과 둥근 면이 몇 개인지 세어 보세요.':roundSurfaceExplanation(shape,selected)}</p>
     {shape==='cone'&&<span>꼭짓점 1개 · 원 모양 모서리 1개</span>}
     {shape==='cylinder'&&<span>원 모양의 모서리 2개 · 뾰족한 꼭짓점 0개</span>}
     {shape==='sphere'&&<span>평평한 면 0개 · 꼭짓점 0개</span>}
   </div>
   <LabTools>
     <SmallControl label="모형 크기" min={2} max={5} value={radius} change={setRadius}/>
     <button type="button" className="lab-action" onClick={()=>setPitch(v=>bound(v+20,-72,72))}>↑ 위에서 관찰</button>
     <button type="button" className="lab-action" onClick={()=>setYaw(v=>v+40)}>↷ 직접 돌리기</button>
     <button type="button" className="lab-action" onClick={()=>{
       chooseShape(initial);setRadius(3);setNetOpen(false);setSelected('curve');
     }}>↺ 원래 모형</button>
   </LabTools>
   <LabHint>입체를 손가락으로 돌리고 둥근 면이나 평평한 원을 클릭해 성질을 비교해 보세요.
     원기둥과 원뿔의 옆면은 펼칠 수 있지만 구의 표면은 찢지 않고 정확한 평면으로 펼칠 수 없어요.</LabHint>
 </div>;
}
