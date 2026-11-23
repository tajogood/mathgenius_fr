import { useRef,useState } from 'react';
import type { CSSProperties,PointerEvent as ReactPointerEvent } from 'react';
import type { LabProps } from './types';
import { bound, LabHint, LabTools, SmallControl } from './types';
import {
  RECTANGLE_EDGES,rectangleArea,rectanglePerimeter,rectangleEdgeLength,
  selectedArea,selectedPerimeter,type RectangleEdge
} from './rectangleMath';

type Mode='area'|'perimeter';
const edgeNames:Record<RectangleEdge,string>={top:'윗변',right:'오른쪽 변',bottom:'아랫변',left:'왼쪽 변'};
type DragOrigin={x:number;y:number;width:number;height:number;cellW:number;cellH:number};

export function RectangleConceptLab({problem:p}:LabProps) {
  const initialWidth=bound(Math.round(p.a)||5,2,9);
  const initialHeight=bound(Math.round(p.b)||3,2,7);
  const [width,setWidth]=useState(initialWidth);
  const [height,setHeight]=useState(initialHeight);
  const [mode,setMode]=useState<Mode>(p.topic==='perimeter'?'perimeter':'area');
  const [rows,setRows]=useState<Set<number>>(()=>new Set());
  const [edges,setEdges]=useState<Set<RectangleEdge>>(()=>new Set());
  const [hover,setHover]=useState<number|null>(null);
  const [resizing,setResizing]=useState(false);
  const gridRef=useRef<HTMLDivElement>(null);
  const dragOrigin=useRef<DragOrigin|null>(null);
  const total=rectangleArea(width,height);
  const perimeter=rectanglePerimeter(width,height);
  const filled=selectedArea(width,rows);
  const traced=selectedPerimeter(width,height,edges);
  const selectedSides=RECTANGLE_EDGES.filter(side=>edges.has(side));
  const selectedSideNumbers=selectedSides.map(side=>rectangleEdgeLength(width,height,side));
  const areaDone=rows.size===height, perimeterDone=edges.size===4;

  const changeSize=(nextWidth:number,nextHeight:number)=>{
    setWidth(bound(Math.round(nextWidth),2,9));
    setHeight(bound(Math.round(nextHeight),2,7));
    setRows(new Set());setEdges(new Set());setHover(null);
  };
  const switchMode=(next:Mode)=>{setMode(next);setHover(null);};
  const toggleRow=(index:number)=>{
    setRows(previous=>{
      const next=new Set(previous);
      if(next.has(index))next.delete(index);else next.add(index);
      return next;
    });
  };
  const paintRow=(index:number)=>{
    setRows(previous=>new Set(previous).add(index));
  };
  const toggleEdge=(edge:RectangleEdge)=>{
    setEdges(previous=>{
      const next=new Set(previous);
      if(next.has(edge))next.delete(edge);else next.add(edge);
      return next;
    });
  };
  const advance=()=>{
    if(mode==='area'){
      const missing=Array.from({length:height},(_,i)=>i).find(i=>!rows.has(i));
      setRows(previous=>missing===undefined?new Set():new Set(previous).add(missing));
    }else{
      const missing=RECTANGLE_EDGES.find(edge=>!edges.has(edge));
      setEdges(previous=>missing===undefined?new Set():new Set(previous).add(missing));
    }
  };
  const pointerDown=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    e.preventDefault();e.stopPropagation();
    const box=gridRef.current?.getBoundingClientRect();
    if(!box)return;
    dragOrigin.current={
      x:e.clientX,y:e.clientY,width,height,
      cellW:box.width/width,cellH:box.height/height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setResizing(true);
  };
  const pointerMove=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    const origin=dragOrigin.current;if(!origin)return;
    const dw=Math.round((e.clientX-origin.x)/origin.cellW);
    const dh=Math.round((e.clientY-origin.y)/origin.cellH);
    const w=bound(origin.width+dw,2,9), h=bound(origin.height+dh,2,7);
    if(w!==width||h!==height)changeSize(w,h);
  };
  const pointerUp=(e:ReactPointerEvent<HTMLButtonElement>)=>{
    dragOrigin.current=null;setResizing(false);
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const variableStyle={'--rect-cols':String(width),'--rect-rows':String(height)} as CSSProperties;
  return <div className="lab-body lab-rectangle-concept" data-testid="rectangle-concept-lab">
    <div className="rect-mode-tabs" role="group" aria-label="둘레와 넓이 학습 선택">
      <button type="button" aria-pressed={mode==='area'} onClick={()=>switchMode('area')}
        className={mode==='area'?'rect-mode--active':''}>▦ 넓이: 안쪽 채우기</button>
      <button type="button" aria-pressed={mode==='perimeter'} onClick={()=>switchMode('perimeter')}
        className={mode==='perimeter'?'rect-mode--active':''}>▢ 둘레: 바깥 따라가기</button>
    </div>
    <div className="rect-student-guide" aria-live="polite">
      <strong>{mode==='area'?'1cm² 정사각형으로 안쪽을 채워요':
        '네 변을 따라서 바깥쪽 길이를 더해요'}</strong>
      <span>{mode==='area'?'한 줄에는 '+width+'칸, 줄은 모두 '+height+'줄이에요. 줄을 직접 터치해 보세요.':
        '바깥 테두리의 윗변·오른쪽 변·아랫변·왼쪽 변을 하나씩 눌러 보세요.'}</span>
    </div>
    <div className="rect-model-stage" data-testid="rectangle-model-stage">
      <div className="rect-model-shell" style={variableStyle}>
        <div className="rect-dimension rect-dimension--top">가로 {width}cm</div>
        <div className="rect-dimension rect-dimension--left">세로 {height}cm</div>
        <div ref={gridRef}
          className={'rect-grid-board'+(mode==='perimeter'?' rect-grid-board--perimeter':'')}
          role="group" aria-label={'가로 '+width+'칸 세로 '+height+'칸 직사각형'}>
          {Array.from({length:height},(_,row)=><button key={row} type="button"
            className={'rect-unit-row'+(rows.has(row)?' rect-unit-row--filled':'')+
              (hover===row?' rect-unit-row--hover':'')}
            onClick={()=>{if(mode==='area')toggleRow(row);}}
            onPointerEnter={e=>{if(mode==='area'){setHover(row);if(e.buttons>0)paintRow(row);}}}
            onPointerLeave={()=>setHover(null)}
            aria-label={(row+1)+'번째 줄, 1cm² 칸 '+width+'개'+(rows.has(row)?', 색칠됨':'')}
            aria-pressed={rows.has(row)} disabled={mode!=='area'}
            style={{gridTemplateColumns:'repeat('+width+',minmax(0,1fr))'}}>
            {Array.from({length:width},(_,col)=><span key={col} className="rect-unit-square"
              aria-hidden="true">{rows.has(row)?'✓':''}</span>)}
          </button>)}
          {mode==='perimeter'&&RECTANGLE_EDGES.map((edge,index)=><button type="button" key={edge}
            className={'rect-edge rect-edge--'+edge+(edges.has(edge)?' rect-edge--selected':'')}
            aria-label={edgeNames[edge]+' '+rectangleEdgeLength(width,height,edge)+'cm 따라가기'}
            aria-pressed={edges.has(edge)}
            onClick={()=>toggleEdge(edge)}
            title={edgeNames[edge]+' '+rectangleEdgeLength(width,height,edge)+'cm'}>
            <span aria-hidden="true">{index+1}</span>
          </button>)}
        </div>
        <button type="button" className={'rect-resize-handle'+(resizing?' rect-resize-handle--active':'')}
          aria-label="주황 손잡이를 드래그해 직사각형 가로와 세로 크기 변경"
          onPointerDown={pointerDown} onPointerMove={pointerMove}
          onPointerUp={pointerUp} onPointerCancel={pointerUp} title="드래그하면 가로·세로가 바뀌어요">↘</button>
      </div>
      <div className="rect-model-caption">
        {mode==='area'?<><span className="rect-unit-swatch" aria-hidden="true"/> 한 칸 = 1cm × 1cm = <strong>1cm²</strong></>:
          <><span className="rect-edge-swatch" aria-hidden="true"/> 색칠한 테두리만 둘레 길이에 더해요</>}
      </div>
    </div>
    {mode==='area'?<div className="rect-teaching" aria-live="polite" data-testid="rectangle-area-equation">
      <div className="rect-teaching-lead">
        <strong>채운 줄 {rows.size} / {height}줄</strong>
        <span>{width}칸씩 {rows.size}줄 = {filled}칸</span>
      </div>
      <div className="rect-teaching-equation">
        {rows.size?Array.from({length:rows.size},()=>width).join(' + ')+' = '+filled+'칸':
          '첫 번째 줄을 눌러 시작해 보세요'}
      </div>
      <div className="rect-teaching-result">
        <span>{width}칸 × {rows.size}줄 = <strong>{filled}cm²</strong></span>
        {areaDone&&<span className="rect-concept-done">✓ 전체 넓이 {width} × {height} = {total}cm²</span>}
      </div>
      <p>{areaDone?'모든 칸을 채웠어요! 1cm² 정사각형 '+total+'개가 직사각형 안에 들어가요.':
        <>넓이는 테두리의 길이가 아니라 <strong>안쪽을 채운 1cm² 칸의 개수</strong>예요.</>}</p>
    </div>:<div className="rect-teaching" aria-live="polite" data-testid="rectangle-perimeter-equation">
      <div className="rect-teaching-lead">
        <strong>따라간 변 {edges.size} / 4개</strong><span>지금까지 {traced}cm</span>
      </div>
      <div className="rect-teaching-equation">
        {selectedSides.length?selectedSideNumbers.map(n=>n+'cm').join(' + ')+' = '+traced+'cm':
          '첫 번째 변을 눌러 테두리를 따라가 보세요'}
      </div>
      <div className="rect-teaching-result">
        <span>윗변 {width}cm · 오른쪽 {height}cm · 아랫변 {width}cm · 왼쪽 {height}cm</span>
        {perimeterDone&&<span className="rect-concept-done">
          ✓ 전체 둘레 {width} + {height} + {width} + {height} = {perimeter}cm
        </span>}
      </div>
      <p>{perimeterDone?'한 바퀴 돌았어요! 둘레는 바깥 경계를 따라 걸은 길이 '+perimeter+'cm예요.':
        <>둘레는 안쪽의 칸 수가 아니라 바깥쪽 <strong>네 변의 길이를 모두 더한 값</strong>이에요.</>}</p>
    </div>}
    <LabTools>
      <button type="button" className="lab-action rect-next-step" onClick={advance}>
        {mode==='area'?(areaDone?'↺ 줄 다시 세기':'▶ 다음 줄 채우기'):(perimeterDone?'↺ 테두리 다시 따라가기':'▶ 다음 변 따라가기')}
      </button>
      <button type="button" className="lab-action" onClick={()=>{
        if(mode==='area')setRows(new Set(Array.from({length:height},(_,i)=>i)));
        else setEdges(new Set(RECTANGLE_EDGES));
      }}>전체 확인</button>
      <button type="button" className="lab-action" onClick={()=>{
        setRows(new Set());setEdges(new Set());setHover(null);
      }}>↺ 색칠 지우기</button>
    </LabTools>
    <LabTools>
      <SmallControl label="가로" value={width} change={n=>changeSize(n,height)} min={2} max={9}/>
      <SmallControl label="세로" value={height} change={n=>changeSize(width,n)} min={2} max={7}/>
      <button type="button" className="lab-action" onClick={()=>changeSize(5,3)}>5×3 예시</button>
      <button type="button" className="lab-action" onClick={()=>changeSize(initialWidth,initialHeight)}>원래 크기</button>
    </LabTools>
    <LabHint>{mode==='area'?
      '같은 크기의 1cm² 정사각형을 가로로 '+width+'개씩, 세로로 '+height+'줄 모으면 전체 넓이를 구할 수 있어요.':
      '위와 아래는 길이가 '+width+'cm, 왼쪽과 오른쪽은 '+height+'cm로 똑같아요. 네 변을 더해야 둘레예요.'}
      {' '}주황 손잡이를 드래그하면 도형 크기도 바뀌어요.</LabHint>
  </div>;
}
