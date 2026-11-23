import {useState} from 'react';
import type {LabProps} from './types';
import {LabHint,LabTools,SmallControl,bound} from './types';

const point=(x:number,y:number,z:number)=>({x:170+(x-y)*18,y:182+(x+y)*9-z*19});
const polygon=(corners:{x:number;y:number}[])=>corners.map(p=>p.x+','+p.y).join(' ');
export function UnitCubesLab({problem:p}:LabProps){
 const initialWidth=bound(p.a,2,5),initialDepth=bound(p.b,2,5);
 const initialHeight=bound(p.c??3,2,5);
 const [width,setWidth]=useState(initialWidth);
 const [depth,setDepth]=useState(initialDepth);
 const [layers,setLayers]=useState(1);
 const [highlight,setHighlight]=useState<Set<number>>(()=>new Set());
 const [view,setView]=useState(0);
 const totalOne=width*depth,volume=totalOne*layers;
 const resetRows=()=>setHighlight(new Set());
 const setDimension=(axis:'width'|'depth',value:number)=>{
   if(axis==='width')setWidth(value);else setDepth(value);
   resetRows();
 };
 const goLayer=()=>{setLayers(v=>v>=initialHeight?1:v+1);resetRows();};
 const toggleRow=(row:number)=>setHighlight(prev=>{
   const next=new Set(prev);
   if(next.has(row))next.delete(row);else next.add(row);
   return next;
 });
 const P=(x:number,y:number,z:number)=>{
   if(view%2===0)return point(x,y,z);
   return point(width-x,y,z);
 };
 const tiles=[];
 for(let z=0;z<layers;z++){
   for(let row=0;row<depth;row++)for(let col=0;col<width;col++){
     const max=z===layers-1;
     const top=[P(col,row,z+1),P(col+1,row,z+1),
       P(col+1,row+1,z+1),P(col,row+1,z+1)];
     // Side planes use actual unit-cube boundaries; there is no fabricated block count.
     const sideX=[P(col+1,row,z),P(col+1,row+1,z),
       P(col+1,row+1,z+1),P(col+1,row,z+1)];
     const sideY=[P(col,row+1,z),P(col+1,row+1,z),
       P(col+1,row+1,z+1),P(col,row+1,z+1)];
     tiles.push({id:z+'-'+row+'-'+col,row,col,z,max,top,sideX,sideY,
       sideVisibleX:col===width-1,sideVisibleY:row===depth-1});
   }
 }
 return <div className="lab-body lab-voxel" data-testid="unit-cubes-explorer">
   <div className="lab-hero-count"><strong>{width} × {depth} × {layers} = {volume}</strong>
      <span>{p.topic==='volume'?'cm³ (부피)':'개 (쌓기나무)'}</span></div>
   <div className="voxel-explainer">
     <strong>1cm × 1cm × 1cm인 정육면체 한 개 = 1cm³</strong>
     <span>한 층을 먼저 세고, 그 층을 위로 몇 번 쌓았는지 확인해 보세요.</span>
   </div>
   <div className="voxel-stage" data-testid="voxel-stage">
     <svg viewBox="0 0 340 245" role="group" className="voxel-svg"
       aria-label={'가로 '+width+'개 세로 '+depth+'개 높이 '+layers+'층의 입체 쌓기나무'}>
       <defs><pattern id="voxel-grid" width="18" height="18" patternUnits="userSpaceOnUse">
         <path d="M18 0H0V18" stroke="#e5edfb" strokeWidth="1" fill="none"/></pattern></defs>
       <rect x="0" y="0" width="340" height="245" rx="12" fill="url(#voxel-grid)" pointerEvents="none"/>
       {tiles.map(tile=><g key={tile.id} role="button" tabIndex={0}
         aria-label={(tile.row+1)+'번째 줄 '+(tile.col+1)+'번째 칸 '+(tile.z+1)+'층 나무 선택'}
         aria-pressed={highlight.has(tile.row)}
         onClick={()=>toggleRow(tile.row)}
         onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleRow(tile.row);}}}>
         {tile.sideVisibleY&&<polygon points={polygon(tile.sideY)}
           fill={highlight.has(tile.row)?'#e9a25b':'#5977ca'}
           stroke="#d1ddfa" strokeWidth="1.4"/>}
         {tile.sideVisibleX&&<polygon points={polygon(tile.sideX)}
           fill="#8ea4dd" stroke="#d8e4fb" strokeWidth="1.4"/>}
         {tile.max&&<polygon points={polygon(tile.top)}
           fill={highlight.has(tile.row)?'#ffd294':'#c5d4fa'}
           stroke="#5f79c6" strokeWidth="1.5"
           className="voxel-tile-top"/>}
       </g>)}
       <text x="170" y="233" fontSize="11" textAnchor="middle" fill="#667fb9" pointerEvents="none">
          윗면의 한 줄을 눌러 {width}개씩 세어 보세요
       </text>
     </svg>
     <button type="button" className="voxel-floor-button" onClick={goLayer}>
       {layers===initialHeight?'↺ 다시 1층부터':'▲ 한 층 더 쌓기'}
     </button>
   </div>
   <div className="voxel-math" aria-live="polite">
     <strong>한 층의 개수 = {width}개 × {depth}줄 = {totalOne}개</strong>
     <span>선택한 줄: {highlight.size}줄 × {width}개 = {highlight.size*width}개</span>
     <strong>{totalOne}개씩 {layers}층 = {volume}{p.topic==='volume'?'cm³':'개'}</strong>
     {layers===initialHeight&&<small>✓ {initialHeight}개 층을 모두 쌓았어요. 공간을 채운 정육면체의 개수가 부피예요.</small>}
   </div>
   <LabTools>
     <SmallControl label="가로" value={width} change={n=>setDimension('width',n)} min={2} max={5}/>
     <SmallControl label="세로" value={depth} change={n=>setDimension('depth',n)} min={2} max={5}/>
     <SmallControl label="층" value={layers} change={n=>{setLayers(n);resetRows();}} min={1} max={5}/>
     <button type="button" className="lab-action" onClick={()=>setView(v=>v+1)}>↷ 다른 쪽에서 보기</button>
     <button type="button" className="lab-action" onClick={()=>{
       setWidth(initialWidth);setDepth(initialDepth);setLayers(1);setHighlight(new Set());setView(0);
     }}>↺ 처음부터 쌓기</button>
   </LabTools>
   <LabHint>그림 안의 정육면체를 클릭하면 같은 줄이 강조돼요. 한 층 {totalOne}개를 세고,
      『한 층 더 쌓기』를 눌러 층마다 똑같이 {totalOne}개가 추가되는 과정을 확인해 보세요.</LabHint>
 </div>;
}
