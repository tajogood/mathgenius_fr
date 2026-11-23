import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { LabProps } from './types';
import { bound, LabHint, LabTools, SmallControl } from './types';

function basePolygon(sides:number,r:number,cx:number,cy:number):string {
  return Array.from({length:sides},(_,i)=>{
    const angle=-Math.PI/2+2*Math.PI*i/sides;
    return (cx+r*Math.cos(angle)).toFixed(1)+','+(cy+r*Math.sin(angle)).toFixed(1);
  }).join(' ');
}
export function GeometryLab({problem:p}:LabProps) {
  const fixed=p.topic==='triangletypes'?3:p.topic==='quadtypes'||p.topic==='perimeter'?4:
    p.topic==='polygons'||p.topic==='anglesum'?p.a:p.topic==='shapes'?p.a===1?3:p.a>=2?4:6:4;
  const [sides,setSides]=useState(bound(fixed,3,9));
  const [angle,setAngle]=useState(p.topic==='transform'&&p.a===2?90:0);
  const [flip,setFlip]=useState(p.topic==='transform'&&p.a===1);
  const [shift,setShift]=useState(p.topic==='transform'&&p.a===0?28:0);
  const [width,setWidth]=useState(p.topic==='perimeter'?p.a:5);
  const [height,setHeight]=useState(p.topic==='perimeter'?p.b:4);
  const [touched,setTouched]=useState(false);
  const rect=p.topic==='perimeter';
  const isLine=p.topic==='lines';
  const isCircle=p.topic==='shapes'&&p.a===0;
  const rotate='translate('+shift+' 0) rotate('+angle+' 170 105)'+(flip?' translate(340 0) scale(-1 1)':'');
  const shapePoints=
    p.topic==='shapes'&&p.a===2?'114,51 226,51 226,163 114,163':
    p.topic==='shapes'&&p.a===3?'85,72 255,72 255,150 85,150':
    p.topic==='triangletypes'&&p.a===0?'170,28 95,158 245,158':
    p.topic==='triangletypes'&&p.a===1?'170,34 122,158 218,158':
    p.topic==='triangletypes'&&p.a===2?'95,158 95,42 247,158':
    p.topic==='quadtypes'?[
      '114,51 226,51 226,163 114,163',
      '85,72 255,72 255,150 85,150',
      '110,66 245,66 215,154 80,154',
      '120,66 220,66 260,154 80,154',
    ][p.a] :
    ['transform','symmetry'].includes(p.topic)?'105,56 205,56 205,93 152,93 152,157 105,157':
    basePolygon(sides,75,170,105);
  const drag=(e:ReactPointerEvent<SVGSVGElement>)=>{
    if(!rect)return;
    const b=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-b.left)*340/b.width;
    const y=(e.clientY-b.top)*210/b.height;
    setWidth(bound(Math.round((x-70)/21),2,9));
    setHeight(bound(Math.round((y-30)/21),2,7));
    setTouched(true);
  };
  return <div className="lab-body">
    <svg viewBox="0 0 340 210" className="lab-geometry-svg" role="img"
      aria-label="도형을 회전·뒤집거나 꼭짓점을 움직여 보세요"
      onPointerDown={e=>{if(rect){e.currentTarget.setPointerCapture(e.pointerId);drag(e);}}}
      onPointerMove={e=>{if(rect&&e.buttons>0)drag(e);}}>
      <defs><pattern id="grid-lab" width="21" height="21" patternUnits="userSpaceOnUse"><path d="M21 0 H0 V21" stroke="#dfe7f7" strokeWidth="1" fill="none"/></pattern></defs>
      <rect width="340" height="210" rx="12" fill="url(#grid-lab)"/>
      {rect?<g>
        <rect x="70" y="30" width={width*21} height={height*21} rx="3"
          fill="#bdcaff" stroke="#5c72d4" strokeWidth="3"/>
        {Array.from({length:width-1},(_,i)=><line key={'x'+i} x1={70+(i+1)*21} x2={70+(i+1)*21}
          y1="30" y2={30+height*21} stroke="#788cdc" strokeDasharray="5 4"/>)}
        {Array.from({length:height-1},(_,i)=><line key={'y'+i} y1={30+(i+1)*21} y2={30+(i+1)*21}
          x1="70" x2={70+width*21} stroke="#788cdc" strokeDasharray="5 4"/>)}
        <circle cx={70+width*21} cy={30+height*21} r="10" fill="#f6b364" stroke="#fff" strokeWidth="3"/>
        <text x={70+width*10.5} y="23" textAnchor="middle" fill="#5265b9" fontSize="13">{width}cm</text>
        <text x="60" y={30+height*10.5} textAnchor="end" fill="#5265b9" fontSize="13">{height}cm</text>
      </g>:isCircle?<g transform={'rotate('+angle+' 170 105)'}>
        <circle cx="170" cy="105" r="68" fill="#c1d0ff" stroke="#6b7dde" strokeWidth="4"/>
        <path d="M170 105 L170 37" stroke="#ecad65" strokeWidth="5"/>
        <circle cx="170" cy="105" r="5" fill="#5063be"/>
      </g>:isLine?<g transform={rotate}>
        <path d="M55 105 H288" stroke="#6177de" strokeWidth="6" strokeLinecap="round"/>
        {(p.a!==0)&&<circle cx="55" cy="105" r="8" fill="#f6b566"/>}
        {(p.a===1)&&<circle cx="288" cy="105" r="8" fill="#f6b566"/>}
        {p.a!==1&&<path d="M273 94 L289 105 L273 116" stroke="#4d62c0" strokeWidth="4" fill="none"/>}
        {p.a===0&&<path d="M70 94 L54 105 L70 116" stroke="#4d62c0" strokeWidth="4" fill="none"/>}
      </g>:<g>
        {p.topic==='transform'&&<polygon points={shapePoints} fill="#e1e5ef" stroke="#acb9d4" strokeWidth="2" />}
        <g transform={rotate}>
          <polygon points={shapePoints} fill="#b4c6ff" stroke="#5c75d8" strokeWidth="4" strokeLinejoin="round"/>
          <circle cx="170" cy="105" r="4.5" fill="#3c55b9"/>
        </g>
      </g>}
      {rect&&<text x="170" y="195" textAnchor="middle" fontSize="11" fill="#7083ae">
        주황 꼭짓점을 드래그해 크기를 변경하세요</text>}
    </svg>
    <div className="lab-math-feedback">
      <strong>{rect?'둘레 '+(2*(width+height))+'cm · 넓이 '+(width*height)+'cm²':
        isLine?'끝점을 확인해 보세요':isCircle?'원: 둥근 도형':
        p.topic==='anglesum'?sides+'각형 · 내각의 합 '+((sides-2)*180)+'°':
        p.topic==='transform'?'밀기 '+shift+'px · '+angle+'° 회전'+(flip?' · 뒤집음':''):
        p.topic==='symmetry'?(p.a===0?'선대칭':'점대칭')+' 모양을 움직여 보세요':
        sides+'각형 · '+angle+'° 회전'+(flip?' · 뒤집음':'')}</strong>
    </div>
    <LabTools>
      {rect?<><SmallControl label="가로" value={width} change={setWidth} min={2} max={9}/>
        <SmallControl label="세로" value={height} change={setHeight} min={2} max={7}/></>:
        <>
          <button type="button" className="lab-action" onClick={()=>{setAngle(a=>(a+45)%360);setTouched(true);}}>↻ 45° 회전</button>
          <button type="button" className="lab-action" aria-pressed={flip}
            onClick={()=>{setFlip(v=>!v);setTouched(true);}}>⇄ 좌우 뒤집기</button>
          {p.topic==='transform'&&<button type="button" className="lab-action"
            onClick={()=>{setShift(v=>v===0?32:0);setTouched(true);}}>→ 밀어 보기</button>}
          {['polygons','anglesum'].includes(p.topic)&&<SmallControl label="변의 수" value={sides}
            change={setSides} min={3} max={9}/>}
        </>}
      <button type="button" className="lab-action" onClick={()=>{setAngle(p.topic==='transform'&&p.a===2?90:0);setFlip(p.topic==='transform'&&p.a===1);setShift(p.topic==='transform'&&p.a===0?28:0);setSides(bound(fixed,3,9));setWidth(p.a);setHeight(p.b);setTouched(false);}}>
        ↺ 원래 도형</button>
    </LabTools>
    <LabHint>{rect?'꼭짓점을 손으로 드래그하거나 가로·세로를 바꾸면 둘레와 넓이가 즉시 변해요.':
      '회전·뒤집기 버튼을 눌러 도형의 위치와 방향 변화를 관찰해 보세요.'}
      {touched?' 방금 조작한 결과를 문제의 도형과 비교해 보세요.':''}</LabHint>
  </div>;
}

export function AnglesLab({problem:p}:LabProps) {
  const [angle,setAngle]=useState(p.a);
  const svg=useRef<SVGSVGElement>(null);
  const center={x:135,y:165};
  const rad=angle*Math.PI/180;
  const x=center.x+105*Math.cos(rad),y=center.y-105*Math.sin(rad);
  const control=(e:ReactPointerEvent<SVGSVGElement>)=>{
    const rect=svg.current?.getBoundingClientRect();if(!rect)return;
    const localX=(e.clientX-rect.left)*320/rect.width;
    const localY=(e.clientY-rect.top)*205/rect.height;
    const deg=Math.atan2(center.y-localY,localX-center.x)*180/Math.PI;
    setAngle(bound(Math.round(deg/5)*5,0,180));
  };
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{angle}°</strong><span> 두 선 사이의 각도</span></div>
    <svg ref={svg} viewBox="0 0 320 205" className="lab-geometry-svg lab-geometry-svg--drag" role="img"
      aria-label="파란 선을 드래그하여 각도를 조절하세요"
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);control(e);}}
      onPointerMove={e=>{if(e.buttons>0)control(e);}}>
      <path d="M30 165 A105 105 0 0 1 240 165" fill="none" stroke="#d5dff6" strokeWidth="2"/>
      {Array.from({length:13},(_,i)=>{
        const t=i*Math.PI/12, a=97, b=108;
        return <line key={i} x1={center.x+a*Math.cos(t)} y1={center.y-a*Math.sin(t)}
          x2={center.x+b*Math.cos(t)} y2={center.y-b*Math.sin(t)} stroke="#8fa4d6" strokeWidth={i%3===0?2.5:1}/>;
      })}
      <line x1={center.x} y1={center.y} x2="250" y2={center.y} stroke="#6177df" strokeWidth="6" strokeLinecap="round"/>
      <line x1={center.x} y1={center.y} x2={x} y2={y} stroke="#6177df" strokeWidth="6" strokeLinecap="round"/>
      <circle cx={center.x} cy={center.y} r="7" fill="#475ec5"/>
      <circle cx={x} cy={y} r="12" fill="#f6b66e" stroke="#fff" strokeWidth="3"/>
      <text x="150" y="195" fontSize="12" fill="#7485b8">주황 점을 움직이세요</text>
    </svg>
    <LabTools>
      <label className="lab-slider-label">각도 {angle}°
        <input type="range" min="0" max="180" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))}/></label>
      <button type="button" className="lab-action" onClick={()=>setAngle(90)}>직각 만들기</button>
      <button type="button" className="lab-action" onClick={()=>setAngle(p.a)}>↺ 문제의 각도</button>
    </LabTools>
    <LabHint>{angle===90?'✨ 직각이에요!':angle<90?'예각: 90°보다 작아요.':'둔각: 90°보다 커요.'} 기준선과 움직이는 선 사이를 관찰해요.</LabHint>
  </div>;
}

export function CircleLab({problem:p}:LabProps) {
  const [radius,setRadius]=useState(p.a);
  const length=radius*2*3.14, area=radius*radius*3.14;
  const svg=useRef<SVGSVGElement>(null);
  const control=(e:ReactPointerEvent<SVGSVGElement>)=>{
    const r=svg.current?.getBoundingClientRect();if(!r)return;
    const x=(e.clientX-r.left)*300/r.width-150;
    const y=(e.clientY-r.top)*196/r.height-98;
    setRadius(bound(Math.round(Math.hypot(x,y)/9),1,10));
  };
  return <div className="lab-body">
    <svg ref={svg} viewBox="0 0 300 196" className="lab-geometry-svg lab-geometry-svg--drag" role="img"
      aria-label="반지름 끝점을 드래그하여 원 크기를 바꾸세요"
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);control(e);}}
      onPointerMove={e=>{if(e.buttons>0)control(e);}}>
      <circle cx="150" cy="98" r={radius*9} fill="#c9d6ff" stroke="#5e77d4" strokeWidth="4"
        className="lab-circle-animated"/>
      <line x1="150" y1="98" x2={150+radius*9} y2="98" stroke="#efad66" strokeWidth="5"/>
      <circle cx="150" cy="98" r="6" fill="#455bbb"/>
      <circle cx={150+radius*9} cy="98" r="10" fill="#f4b263" stroke="#fff" strokeWidth="3"/>
      <text x="150" y="187" textAnchor="middle" fontSize="12" fill="#7688b5">원주율 π ≈ 3.14</text>
    </svg>
    <div className="lab-circle-stats">
      <span>반지름 <b>{radius}cm</b></span><span>지름 <b>{2*radius}cm</b></span>
      <span>원주 <b>{Number(length.toFixed(2))}cm</b></span>
      <span>넓이 <b>{Number(area.toFixed(2))}cm²</b></span>
    </div>
    <LabTools><SmallControl label="반지름" value={radius} change={setRadius} min={1} max={10}/>
      <button type="button" className="lab-action" onClick={()=>setRadius(p.a)}>↺ 원래 원</button></LabTools>
    <LabHint>주황 점을 드래그하거나 반지름을 늘려 보세요. 원주와 넓이가 서로 다른 속도로 커져요.</LabHint>
  </div>;
}

export function ClockLab({problem:p}:LabProps) {
  const initialHour=p.topic==='clock'?p.a:3;
  const initialMinute=p.topic==='clock'?p.b:p.topic==='timecalc'?p.b:30;
  const [hour,setHour]=useState(initialHour),[minute,setMinute]=useState(initialMinute);
  const svg=useRef<SVGSVGElement>(null);
  const minuteAngle=(minute/60)*Math.PI*2;
  const hourAngle=((hour%12+minute/60)/12)*Math.PI*2;
  const pointer=(e:ReactPointerEvent<SVGSVGElement>)=>{
    const rect=svg.current?.getBoundingClientRect();if(!rect)return;
    const x=(e.clientX-rect.left)*240/rect.width-120;
    const y=(e.clientY-rect.top)*240/rect.height-120;
    const deg=(Math.atan2(x,-y)*180/Math.PI+360)%360;
    setMinute(Math.round(deg/6)%60);
  };
  return <div className="lab-body">
    <div className="lab-hero-count"><strong>{hour}시 {String(minute).padStart(2,'0')}분</strong></div>
    <svg ref={svg} viewBox="0 0 240 240" className="lab-clock-svg lab-geometry-svg--drag" role="img"
      aria-label="긴 바늘을 드래그하면 분이 바뀌는 시계"
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);pointer(e);}}
      onPointerMove={e=>{if(e.buttons>0)pointer(e);}}>
      <circle cx="120" cy="120" r="109" fill="#fff" stroke="#aac0ee" strokeWidth="5"/>
      {Array.from({length:12},(_,i)=>{
        const a=i*Math.PI/6;
        return <text key={i} x={120+87*Math.sin(a)} y={125-87*Math.cos(a)}
          textAnchor="middle" fill="#7584aa" fontWeight="800" fontSize="13">{i===0?12:i}</text>;
      })}
      <line x1="120" y1="120" x2={120+59*Math.sin(hourAngle)} y2={120-59*Math.cos(hourAngle)}
        stroke="#f5b16c" strokeWidth="9" strokeLinecap="round"/>
      <line x1="120" y1="120" x2={120+76*Math.sin(minuteAngle)} y2={120-76*Math.cos(minuteAngle)}
        stroke="#6379dc" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="120" cy="120" r="7" fill="#405aba"/>
      <circle cx={120+76*Math.sin(minuteAngle)} cy={120-76*Math.cos(minuteAngle)}
        r="10" fill="#667ded" stroke="#fff" strokeWidth="3"/>
    </svg>
    <LabTools>
      <SmallControl label="시" value={hour} change={setHour} min={1} max={12}/>
      <label className="lab-slider-label">분 {minute}
        <input type="range" min="0" max="59" step="1" value={minute} onChange={e=>setMinute(Number(e.target.value))}/></label>
      <button type="button" className="lab-action" onClick={()=>{setHour(initialHour);setMinute(initialMinute);}}>↺ 문제 시계</button>
    </LabTools>
    <LabHint>파란 분침을 손가락으로 옮겨 보세요. 분침이 움직이면 주황 시침도 조금씩 움직여요.</LabHint>
  </div>;
}

function SolidShape({kind,sides,rotation}: {kind:string;sides:number;rotation:number}) {
  const regular=(cx:number,cy:number,rx:number,ry:number)=>Array.from({length:sides},(_,i)=>{
    const a=-Math.PI/2+i*2*Math.PI/sides;
    return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)] as const;
  });
  const prismFront=regular(122,120,60,30), prismBack=regular(172,72,60,30);
  return <div className="lab-solid-model" style={{transform:'rotateY('+rotation+'deg)'}}>
    <svg viewBox="0 0 295 190" role="img" aria-label={kind+' 입체도형을 회전해 관찰하세요'}>
      <defs><radialGradient id="lab-solid-ball"><stop stopColor="#f3f6ff"/><stop offset=".8" stopColor="#9aafea"/>
        <stop offset="1" stopColor="#5874cc"/></radialGradient></defs>
      {kind==='sphere'?<g>
        <circle cx="145" cy="96" r="75" fill="url(#lab-solid-ball)" stroke="#6880d9" strokeWidth="3"/>
        <ellipse cx="145" cy="96" rx="75" ry="23" fill="none" stroke="#8ca3df" strokeWidth="2" strokeDasharray="5 5"/>
      </g>:kind==='cylinder'?<g>
        <path d="M75 55 V138 Q145 179 215 138 V55" fill="#b0c4f5" stroke="#607bda" strokeWidth="3"/>
        <ellipse cx="145" cy="55" rx="70" ry="27" fill="#dbe5ff" stroke="#607bda" strokeWidth="3"/>
        <path d="M75 138 Q145 179 215 138" fill="none" stroke="#607bda" strokeWidth="3"/>
      </g>:kind==='cone'?<g>
        <path d="M145 17 L66 143 Q145 190 224 143 Z" fill="#bccbfa" stroke="#647cda" strokeWidth="3"/>
        <ellipse cx="145" cy="143" rx="79" ry="30" fill="#d6e0fe" stroke="#647cda" strokeWidth="3"/>
      </g>:kind==='prism'?<g>
        <polygon points={prismBack.map(x=>x.join(',')).join(' ')} fill="#dbe4ff" stroke="#7d92d5" strokeWidth="2"/>
        {prismFront.map((point,i)=><line key={i} x1={point[0]} y1={point[1]} x2={prismBack[i][0]}
          y2={prismBack[i][1]} stroke="#7189da" strokeWidth="2.4"/>)}
        <polygon points={prismFront.map(x=>x.join(',')).join(' ')} fill="#a8bdf6" stroke="#5d76d6" strokeWidth="3"/>
      </g>:kind==='pyramid'?<g>
        <polygon points={prismFront.map(x=>x.join(',')).join(' ')} fill="#d5defe" stroke="#7389d5" strokeWidth="3"/>
        {prismFront.map((point,i)=><line key={i} x1="148" y1="24" x2={point[0]} y2={point[1]}
          stroke="#6680dd" strokeWidth={i%2?2:3}/>)}
        <circle cx="148" cy="24" r="5" fill="#4862c8"/>
      </g>:<g>
        <path d="M74 55 L193 55 L239 25 L122 25 Z" fill="#dce4ff" stroke="#6880d7" strokeWidth="3"/>
        <path d="M193 55 L239 25 V138 L193 166 Z" fill="#879fe7" stroke="#6880d7" strokeWidth="3"/>
        <path d="M74 55 H193 V166 H74 Z" fill="#b4c8ff" stroke="#6880d7" strokeWidth="3"/>
      </g>}
    </svg>
  </div>;
}

export function SolidsLab({problem:p}:LabProps) {
  const initialLayers=Math.max(1,Math.min(6,p.c??3));
  const [layers,setLayers]=useState(initialLayers);
  const [rotation,setRotation]=useState(22);
  const [unfold,setUnfold]=useState(false);
  const [sides,setSides]=useState(Math.max(3,Math.min(8,p.a)));
  const isNet=p.topic==='nets';
  const stack=['volume','surface','stacking','solidviews'].includes(p.topic);
  const kind=p.topic==='shapes3d'?['box','cylinder','sphere'][p.a]:
    p.topic==='curvedsolids'?['cylinder','cone','sphere'][p.a]:
    p.topic==='polyhedra'?'prism':p.topic==='pyramid'?'pyramid':'box';
  const boxes=p.a*Math.max(1,p.b);
  const actual=boxes*layers;
  const typeName:Record<string,string>={box:'직육면체',cylinder:'원기둥',cone:'원뿔',
    sphere:'구',prism:sides+'각기둥',pyramid:sides+'각뿔'};
  return <div className="lab-body">
    <div className="lab-solid-stage" role="group" aria-label="입체도형 회전·쌓기·펼치기">
      {isNet?<div className={'lab-net'+(unfold?' lab-net--unfolded':'')}>
        {Array.from({length:6},(_,i)=><span key={i}>{i+1}</span>)}
      </div>:stack?<div className="lab-solid-stack" style={{transform:'rotateY('+rotation+'deg) rotateX(12deg)'}}>
        {Array.from({length:layers},(_,i)=>
          <div key={i} className="lab-solid-layer" style={{transform:'translateY('+(-i*14)+'px) translateX('+(i*3)+'px)'}}>
            {Array.from({length:Math.min(12,boxes)},(_,j)=><span key={j}/>)}
          </div>)}
      </div>:<SolidShape kind={kind} sides={sides} rotation={rotation}/>}
    </div>
    <div className="lab-math-feedback"><strong>{isNet?(unfold?'여섯 면으로 펼친 전개도':'입체도형의 면을 접는 실험'):
      stack?layers+'층 × 층당 '+boxes+'개 = '+actual+'개':
      typeName[kind]+(['polyhedra','pyramid'].includes(p.topic)?
        ' · 꼭짓점 '+(kind==='prism'?2*sides:sides+1)+'개':'')}</strong></div>
    <LabTools>
      {isNet?<button type="button" className="lab-action" onClick={()=>setUnfold(v=>!v)}>
        {unfold?'▣ 다시 접기':'▤ 전개도 펼치기'}</button>:<>
        {stack&&<SmallControl label="층" value={layers} change={setLayers} min={1} max={6}/>}
        <label className="lab-slider-label">회전 {rotation}°
          <input type="range" min="-80" max="80" value={rotation} onChange={e=>setRotation(Number(e.target.value))}/></label>
        {['polyhedra','pyramid'].includes(p.topic)&&<SmallControl label="밑면 변 수" value={sides}
          change={setSides} min={3} max={8}/>}
      </>}
      <button type="button" className="lab-action" onClick={()=>{
        setLayers(initialLayers);setRotation(22);setUnfold(false);setSides(Math.max(3,Math.min(8,p.a)));
      }}>↺ 원래 도형</button>
    </LabTools>
    <LabHint>{isNet?'면을 접었다 펼치면 맞닿는 모서리를 찾아볼 수 있어요.':
      stack?'층을 추가하면 전체 블록이 늘어요. 회전하여 앞·뒤 모습도 비교해 보세요.':
      typeName[kind]+'을 회전시켜 평평한 면과 둥근 면의 차이를 찾아보세요.'}</LabHint>
  </div>;
}
