import {useRef,useState} from 'react';
import type {CSSProperties,KeyboardEvent as ReactKeyboardEvent,PointerEvent as ReactPointerEvent} from 'react';
import type {LabProps} from './types';
import {bound,LabHint,LabTools,SmallControl} from './types';
import {
  SOLID_FACE_IDS,SOLID_FACE_NAMES,SOLID_EDGE_IDS,SOLID_VERTEX_IDS,
  cuboidFaceEdges,cuboidFaceVertices,faceDimensions,cuboidSurfaceArea,cuboidVolume,
  facesForEdge,facesForVertex,type SolidFace,type SolidEdge,type SolidVertex,
  type CuboidDimensions
} from './solidMath';

type PartMode='face'|'edge'|'vertex';
type DragInfo={
  x:number;y:number;pitch:number;yaw:number;
  face:SolidFace|null;edge:SolidEdge|null;vertex:SolidVertex|null;moved:boolean;
};
const faceColors:Record<SolidFace,string>={
  front:'#7da4ed',back:'#b3a2e9',top:'#f0bf7c',bottom:'#a7caca',
  left:'#93c6ea',right:'#80c6b2'
};
const edgeNames=['윗앞','윗뒤','아랫앞','아랫뒤','앞왼쪽','앞오른쪽',
  '뒤왼쪽','뒤오른쪽','윗왼쪽','윗오른쪽','아랫왼쪽','아랫오른쪽'] as const;

const faceCss=(face:SolidFace,size:CuboidDimensions,unit:number):CSSProperties=>{
  const W=size.width*unit,H=size.height*unit,D=size.depth*unit;
  const [fw,fh]=faceDimensions(face,size);
  const placement={
    front:'translate(-50%,-50%) translateZ('+(D/2)+'px)',
    back:'translate(-50%,-50%) rotateY(180deg) translateZ('+(D/2)+'px)',
    top:'translate(-50%,-50%) rotateX(90deg) translateZ('+(H/2)+'px)',
    bottom:'translate(-50%,-50%) rotateX(-90deg) translateZ('+(H/2)+'px)',
    left:'translate(-50%,-50%) rotateY(-90deg) translateZ('+(W/2)+'px)',
    right:'translate(-50%,-50%) rotateY(90deg) translateZ('+(W/2)+'px)'
  };
  return {width:fw*unit,height:fh*unit,left:-fw*unit/2,top:-fh*unit/2,
    transform:placement[face].replace('translate(-50%,-50%) ', ''),
    '--solid-face-color':faceColors[face]} as CSSProperties;
};
const facePositions:Record<SolidFace,{col:number;row:number}>={
  front:{col:2,row:2},back:{col:4,row:2},
  top:{col:2,row:1},bottom:{col:2,row:3},
  left:{col:1,row:2},right:{col:3,row:2}
};
const faceDirections=['top','bottom','left','right'] as const;
const cornerDirections=['tl','tr','br','bl'] as const;

export function SolidExplorerLab({problem:p}:LabProps){
  const [shape,setShape]=useState<'cuboid'|'cube'>('cuboid');
  const [width,setWidth]=useState(4);
  const [height,setHeight]=useState(3);
  const [depth,setDepth]=useState(2);
  const [side,setSide]=useState(3);
  const [pitch,setPitch]=useState(-24);
  const [yaw,setYaw]=useState(-32);
  const [partMode,setPartMode]=useState<PartMode>('face');
  const [selectedFace,setSelectedFace]=useState<SolidFace>('front');
  const [selectedEdge,setSelectedEdge]=useState<SolidEdge>(SOLID_EDGE_IDS[0]);
  const [selectedVertex,setSelectedVertex]=useState<SolidVertex>('ftl');
  const [netOpen,setNetOpen]=useState(false);
  const [hoveredFace,setHoveredFace]=useState<SolidFace|null>(null);
  const drag=useRef<DragInfo|null>(null);
  const size:CuboidDimensions=shape==='cube'?{width:side,height:side,depth:side}:{width,height,depth};
  const unit=29;
  const netUnit=15;
  const selectedEdgeIndex=SOLID_EDGE_IDS.indexOf(selectedEdge)+1;
  const selectedVertexIndex=SOLID_VERTEX_IDS.indexOf(selectedVertex)+1;
  const selectedFaceDims=faceDimensions(selectedFace,size);
  const surfaceArea=cuboidSurfaceArea(size);
  const volume=cuboidVolume(size);
  const unitMeaning=shape==='cube'?'정육면체는 모든 모서리 길이가 같아요.':'직육면체는 마주 보는 면의 크기가 같아요.';
  const tapFace=(face:SolidFace)=>{setSelectedFace(face);setPartMode('face');};
  const tapEdge=(edge:SolidEdge)=>{setSelectedEdge(edge);setPartMode('edge');};
  const tapVertex=(vertex:SolidVertex)=>{setSelectedVertex(vertex);setPartMode('vertex');};
  const changeShape=(next:'cuboid'|'cube')=>{
    setShape(next);setSelectedFace('front');setPartMode('face');
    setNetOpen(false);setYaw(-32);setPitch(-24);
  };
  const onDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(event.button!==0&&event.pointerType==='mouse')return;
    const target=event.target as Element;
    const face=target.closest('[data-solid-face]')?.getAttribute('data-solid-face') as SolidFace|null;
    const edge=target.closest('[data-solid-edge]')?.getAttribute('data-solid-edge') as SolidEdge|null;
    const vertex=target.closest('[data-solid-vertex]')?.getAttribute('data-solid-vertex') as SolidVertex|null;
    drag.current={x:event.clientX,y:event.clientY,pitch,yaw,face,edge,vertex,moved:false};
    try{event.currentTarget.setPointerCapture(event.pointerId);}catch{ /* non-pointer test environment */ }
  };
  const onMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const origin=drag.current;if(!origin)return;
    const dx=event.clientX-origin.x,dy=event.clientY-origin.y;
    if(Math.abs(dx)+Math.abs(dy)>5)origin.moved=true;
    if(!origin.moved)return;
    setYaw(origin.yaw+dx*.8);
    setPitch(bound(origin.pitch-dy*.6,-78,78));
  };
  const onUp=(event:ReactPointerEvent<HTMLDivElement>)=>{
    const origin=drag.current;if(!origin)return;
    drag.current=null;
    if(!origin.moved){
      if(origin.vertex&&partMode==='vertex')tapVertex(origin.vertex);
      else if(origin.edge&&partMode==='edge')tapEdge(origin.edge);
      else if(origin.face)tapFace(origin.face);
    }
    try{if(event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);}catch{/* released by host */}
  };
  const onStageKey=(event:ReactKeyboardEvent<HTMLDivElement>)=>{
    if(event.target!==event.currentTarget)return;
    switch(event.key){
      case 'ArrowLeft':event.preventDefault();setYaw(v=>v-15);break;
      case 'ArrowRight':event.preventDefault();setYaw(v=>v+15);break;
      case 'ArrowUp':event.preventDefault();setPitch(v=>bound(v+15,-78,78));break;
      case 'ArrowDown':event.preventDefault();setPitch(v=>bound(v-15,-78,78));break;
    }
  };
  const message=partMode==='face'?
    SOLID_FACE_NAMES[selectedFace]+'의 크기는 '+selectedFaceDims[0]+'cm × '+selectedFaceDims[1]+'cm입니다. 면을 눌러 색이 바뀌는 모습을 확인해요.':
    partMode==='edge'?
      selectedEdgeIndex+'번째 모서리는 '+facesForEdge(selectedEdge).map(f=>SOLID_FACE_NAMES[f]).join('과 ')+'이 만나는 선이에요. 길이는 '+
      (selectedEdge[0]==='x'?size.width:selectedEdge[0]==='y'?size.height:size.depth)+'cm예요.':
      selectedVertexIndex+'번째 꼭짓점에는 '+facesForVertex(selectedVertex).map(f=>SOLID_FACE_NAMES[f]).join('·')+' 세 면이 만나요.';
  const reset=()=>{
    setShape('cuboid');setWidth(4);setHeight(3);setDepth(2);setSide(3);
    setPitch(-24);setYaw(-32);setPartMode('face');setSelectedFace('front');
    setSelectedEdge(SOLID_EDGE_IDS[0]);setSelectedVertex('ftl');
    setHoveredFace(null);setNetOpen(false);
  };
  return <div className="lab-body lab-solid-explorer" data-testid="solid-3d-explorer">
    <div className="solid-explorer-toolbar" role="group" aria-label="입체도형과 정육면체 선택">
      <button type="button" aria-pressed={shape==='cuboid'} onClick={()=>changeShape('cuboid')}>직육면체</button>
      <button type="button" aria-pressed={shape==='cube'} onClick={()=>changeShape('cube')}>정육면체</button>
      <button type="button" className="solid-explorer-net-toggle" aria-expanded={netOpen}
        onClick={()=>setNetOpen(v=>!v)}>{netOpen?'▣ 전개도 접기':'▤ 전개도 펼치기'}</button>
    </div>
    <div className="solid-explorer-modes" role="group" aria-label="입체도형의 부분 관찰">
      <button type="button" aria-pressed={partMode==='face'} onClick={()=>setPartMode('face')}>면 6개</button>
      <button type="button" aria-pressed={partMode==='edge'} onClick={()=>setPartMode('edge')}>모서리 12개</button>
      <button type="button" aria-pressed={partMode==='vertex'} onClick={()=>setPartMode('vertex')}>꼭짓점 8개</button>
    </div>
    <div className={'solid-explorer-layout'+(netOpen?' solid-explorer-layout--with-net':'')}>
      <div className="solid-explorer-model">
        <div className="solid-viewport" role="group" tabIndex={0}
          aria-label="마우스 또는 손가락으로 직육면체를 직접 끌어 360도 회전하세요. 키보드 방향키도 사용할 수 있어요."
          data-testid="solid-rotate-stage"
          onPointerDown={onDown} onPointerMove={onMove}
          onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onStageKey}>
          <div className="solid-cuboid"
            style={{transform:'rotateX('+pitch+'deg) rotateY('+yaw+'deg) scale(var(--solid-cuboid-scale,1))'}}>
            {SOLID_FACE_IDS.map(face=>{
              const highlighted=partMode==='face'?selectedFace===face:
                partMode==='edge'?cuboidFaceEdges[face].includes(selectedEdge):
                  cuboidFaceVertices[face].includes(selectedVertex);
              return <div key={face} className={'solid-cuboid-face'+(highlighted?' solid-cuboid-face--selected':'')+
                (hoveredFace===face?' solid-cuboid-face--hover':'')}
                style={faceCss(face,size,unit)} data-solid-face={face}
                role="button" tabIndex={0}
                aria-label={SOLID_FACE_NAMES[face]+' 선택'}
                onPointerEnter={()=>setHoveredFace(face)} onPointerLeave={()=>setHoveredFace(null)}
                onClick={()=>{if(!drag.current)tapFace(face);}}
                onKeyDown={event=>{
                  if(event.key==='Enter'||event.key===' '){event.stopPropagation();event.preventDefault();tapFace(face);}
                }}>
                <span className="solid-cuboid-face-name" aria-hidden="true">{SOLID_FACE_NAMES[face]}</span>
                {partMode==='edge'&&faceDirections.map((direction,index)=>{
                  const edge=cuboidFaceEdges[face][index] as SolidEdge;
                  return <span key={edge} className={'solid-face-edge solid-face-edge--'+direction+
                    (edge===selectedEdge?' solid-face-edge--active':'')}
                    data-solid-edge={edge} role="button" tabIndex={0}
                    aria-label={SOLID_EDGE_IDS.indexOf(edge)+1+'번 모서리 선택'}
                    onClick={event=>{event.stopPropagation();tapEdge(edge);}}
                    onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){
                      event.preventDefault();event.stopPropagation();tapEdge(edge);}}}/>;
                })}
                {partMode==='vertex'&&cornerDirections.map((direction,index)=>{
                  const vertex=cuboidFaceVertices[face][index];
                  return <span key={vertex} className={'solid-face-vertex solid-face-vertex--'+direction+
                    (vertex===selectedVertex?' solid-face-vertex--active':'')}
                    data-solid-vertex={vertex} role="button" tabIndex={0}
                    aria-label={SOLID_VERTEX_IDS.indexOf(vertex)+1+'번 꼭짓점 선택'}
                    onClick={event=>{event.stopPropagation();tapVertex(vertex);}}
                    onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){
                      event.preventDefault();event.stopPropagation();tapVertex(vertex);}}}/>;
                })}
              </div>;
            })}
          </div>
          <span className="solid-viewport-help" aria-hidden="true">☝️ 모형을 직접 끌어 돌려 보세요</span>
        </div>
        <div className="solid-rotate-controls" role="group" aria-label="입체도형 회전 보조 도구">
          <button type="button" onClick={()=>setYaw(v=>v-45)}>↶ 왼쪽</button>
          <button type="button" onClick={()=>setYaw(v=>v+45)}>↷ 오른쪽</button>
          <button type="button" onClick={()=>setPitch(v=>bound(v+20,-78,78))}>↑ 위쪽</button>
          <button type="button" onClick={()=>{setPitch(-24);setYaw(-32);}}>↺ 정면</button>
        </div>
      </div>
      {netOpen&&<div className="solid-net-panel" data-testid="solid-face-net">
        <strong>▤ 펼친 전개도 · 면을 눌러 보세요</strong>
        <div className="solid-net-layout" role="group" aria-label="직육면체 여섯 면의 실제 대응 전개도"
          style={{
            gridTemplateColumns:[size.depth,size.width,size.depth,size.width].map(v=>v*netUnit+'px').join(' '),
            gridTemplateRows:[size.depth,size.height,size.depth].map(v=>v*netUnit+'px').join(' '),
          }}>
          {SOLID_FACE_IDS.map(face=>{
            const pos=facePositions[face];
            const [a,b]=faceDimensions(face,size);
            return <button key={face} type="button" aria-pressed={selectedFace===face}
              className={'solid-net-face'+(selectedFace===face?' solid-net-face--selected':'')}
              onClick={()=>tapFace(face)}
              style={{gridColumn:pos.col,gridRow:pos.row,
                background:faceColors[face]}}
              aria-label={'전개도 '+SOLID_FACE_NAMES[face]+' 선택'}>
              <span>{SOLID_FACE_NAMES[face]}</span><small>{a}×{b}</small>
            </button>;
          })}
        </div>
        <span className="solid-net-caption">각 면을 누르면 입체 모형의 같은 면이 강조돼요.</span>
      </div>}
    </div>
    <div className="solid-discovery" aria-live="polite" data-testid="solid-geometry-feedback">
      <strong>{partMode==='face'?'면을 알아봐요':partMode==='edge'?'모서리를 알아봐요':'꼭짓점을 알아봐요'}</strong>
      <p>{message}</p>
      <p>{unitMeaning}</p>
    </div>
    {partMode==='face'&&<div className="solid-select-parts" role="group" aria-label="직육면체의 여섯 면 직접 선택">
      {SOLID_FACE_IDS.map(face=><button key={face} type="button" aria-pressed={selectedFace===face}
        onClick={()=>tapFace(face)}>{SOLID_FACE_NAMES[face]}</button>)}
    </div>}
    {partMode==='edge'&&<div className="solid-select-parts" role="group" aria-label="12개 모서리 직접 선택">
      {SOLID_EDGE_IDS.map((edge,index)=><button key={edge} type="button" aria-pressed={selectedEdge===edge}
        onClick={()=>tapEdge(edge)}>{index+1}번</button>)}
    </div>}
    {partMode==='vertex'&&<div className="solid-select-parts" role="group" aria-label="8개 꼭짓점 직접 선택">
      {SOLID_VERTEX_IDS.map((vertex,index)=><button key={vertex} type="button" aria-pressed={selectedVertex===vertex}
        onClick={()=>tapVertex(vertex)}>{index+1}번</button>)}
    </div>}
    <LabTools>
      {shape==='cuboid'?<>
        <SmallControl label="가로" min={2} max={6} value={width} change={setWidth}/>
        <SmallControl label="세로" min={2} max={5} value={height} change={setHeight}/>
        <SmallControl label="깊이" min={2} max={5} value={depth} change={setDepth}/>
      </>:<SmallControl label="모서리 길이" min={2} max={5} value={side} change={setSide}/>}
      <button type="button" className="lab-action" onClick={reset}>↺ 원래 도형</button>
    </LabTools>
    <div className="solid-counters" aria-label="직육면체 구성 요소 개수">
      <span>면 <strong>6개</strong></span><span>모서리 <strong>12개</strong></span>
      <span>꼭짓점 <strong>8개</strong></span>
      {p.topic==='surface'&&<span>겉넓이 <strong>{surfaceArea}cm²</strong></span>}
      {p.topic==='volume'&&<span>부피 <strong>{volume}cm³</strong></span>}
    </div>
    <LabHint>직육면체는 펼친 종이 그림이 아니라 공간을 차지하는 입체도형이에요.
      직접 돌리고, 면·모서리·꼭짓점을 누르고, 전개도의 같은 면과 대응시켜 보세요.</LabHint>
  </div>;
}
