import {useId,useState,type ReactNode} from 'react';
import {MathLine} from '../components/MathLine.tsx';
import {mathTokens,textWidth} from '../motion/mathTokens.ts';
import type {HighTopic} from './curriculum.ts';
import {labs,type PlotScene,type Scene,type Vals} from './labs.ts';
import {num,nCr} from './format.ts';

const W=440,H=300,M=16;
const INK='#33415f',SOFT='#8c98b3',GRID='#e6eaf5';

/** SVG 글자: 2/3, (x−1)/2, {{a|b}} 같은 분수를 분자 위·분모 아래로 쌓아 그린다 */
export function SvgMath({x,y,s,size=13,color=INK,anchor='middle',weight=700}:{
  x:number;y:number;s:string;size?:number;color?:string;anchor?:'start'|'middle'|'end';weight?:number;
}){
  const text=s.replace(/\{\{([^|}]*)\|([^}]*)\}\}/g,'($1)/($2)');
  const toks=mathTokens(text);
  if(!toks.some(t=>t.t==='frac'))return <text x={x} y={y} fontSize={size} fill={color} fontWeight={weight}
    textAnchor={anchor} dominantBaseline="central">{text}</text>;
  const fz=size*.78,pad=size*.18;
  const parts=toks.map(t=>t.t==='text'?{...t,w:textWidth(t.s,size)}:{...t,w:Math.max(textWidth(t.n,fz),textWidth(t.d,fz))+pad*2});
  const total=parts.reduce((a,p)=>a+p.w,0);
  let cx=anchor==='start'?x:anchor==='end'?x-total:x-total/2;
  const out:ReactNode[]=[];
  parts.forEach((p,i)=>{
    if(p.t==='text'){out.push(<text key={i} x={cx} y={y} fontSize={size} fill={color} fontWeight={weight} dominantBaseline="central" xmlSpace="preserve">{p.s}</text>);}
    else{
      const m=cx+p.w/2;
      out.push(<g key={i}>
        <text x={m} y={y-fz*.62} fontSize={fz} fill={color} fontWeight={weight} textAnchor="middle" dominantBaseline="central">{p.n}</text>
        <line x1={cx+pad*.6} y1={y} x2={cx+p.w-pad*.6} y2={y} stroke={color} strokeWidth={1.4}/>
        <text x={m} y={y+fz*.66} fontSize={fz} fill={color} fontWeight={weight} textAnchor="middle" dominantBaseline="central">{p.d}</text>
      </g>);
    }
    cx+=p.w;
  });
  return <g role="img" aria-label={s}>{out}</g>;
}

function niceStep(span:number){
  const raw=span/10,p=10**Math.floor(Math.log10(raw)),m=raw/p;
  return (m<=1?1:m<=2?2:m<=5?5:10)*p;
}
function Plot({s}:{s:PlotScene}){
  let [x0,x1]=s.xr,[y0,y1]=s.yr;
  let sx=(W-2*M)/(x1-x0),sy=(H-2*M)/(y1-y0);
  if(s.equal){
    const k=Math.min(sx,sy);
    const cxm=(x0+x1)/2,cym=(y0+y1)/2;
    x0=cxm-(W-2*M)/k/2;x1=cxm+(W-2*M)/k/2;y0=cym-(H-2*M)/k/2;y1=cym+(H-2*M)/k/2;sx=sy=k;
  }
  const X=(x:number)=>M+(x-x0)*sx,Y=(y:number)=>H-M-(y-y0)*sy;
  const dy=y1-y0;
  const path=(f:(x:number)=>number,dom?:[number,number])=>{
    const a=Math.max(x0,dom?.[0]??x0),b=Math.min(x1,dom?.[1]??x1);
    let d='',pen=false,prev=NaN;
    for(let i=0;i<=420;i++){
      const x=a+(b-a)*i/420,y=f(x);
      const ok=Number.isFinite(y)&&y>y0-dy*1.5&&y<y1+dy*1.5&&!(pen&&Math.abs(y-prev)>dy*.9);
      if(ok){d+=(pen?'L':'M')+X(x).toFixed(1)+','+Y(y).toFixed(1);pen=true;prev=y;}
      else{pen=false;prev=NaN;}
    }
    return d;
  };
  const stepX=niceStep(x1-x0),stepY=niceStep(y1-y0);
  const xt=s.xticks??Array.from({length:Math.floor(x1/stepX)-Math.ceil(x0/stepX)+1},(_,i)=>(Math.ceil(x0/stepX)+i)*stepX)
    .filter(v=>Math.abs(v)>1e-9).map(v=>({v,label:num(v)}));
  const yt=s.hideYTicks?[]:Array.from({length:Math.floor(y1/stepY)-Math.ceil(y0/stepY)+1},(_,i)=>(Math.ceil(y0/stepY)+i)*stepY).filter(v=>Math.abs(v)>1e-9);
  const ax=Math.min(Math.max(0,y0),y1),ay=Math.min(Math.max(0,x0),x1);
  const clip='hclip'+useId().replace(/[^a-zA-Z0-9]/g,'');
  return <g>
    <defs><clipPath id={clip}><rect x={M} y={M} width={W-2*M} height={H-2*M}/></clipPath>
      <marker id={clip+'a'} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10Z" fill="context-stroke"/></marker></defs>
    {xt.map(t=><line key={'gx'+t.v} x1={X(t.v)} x2={X(t.v)} y1={M} y2={H-M} stroke={GRID}/>)}
    {yt.map(v=><line key={'gy'+v} y1={Y(v)} y2={Y(v)} x1={M} x2={W-M} stroke={GRID}/>)}
    <line x1={M} x2={W-M} y1={Y(ax)} y2={Y(ax)} stroke={SOFT} strokeWidth="1.6"/>
    {x0<=0&&x1>=0&&<line y1={M} y2={H-M} x1={X(ay)} x2={X(ay)} stroke={SOFT} strokeWidth="1.6"/>}
    {xt.map(t=><SvgMath key={'tx'+t.v} x={X(t.v)} y={Y(ax)+11} s={t.label} size={9.5} color={SOFT} weight={600}/>)}
    {yt.map(v=><text key={'ty'+v} x={X(ay)-4} y={Y(v)} fontSize="9.5" fill={SOFT} textAnchor="end" dominantBaseline="central">{num(v)}</text>)}
    <g clipPath={`url(#${clip})`}>
      {s.shade?.map((sh,i)=>{
        const n=80,a=Math.max(sh.from,x0),b=Math.min(sh.to,x1);if(b<=a)return null;
        const top=Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return X(x)+','+Y(Math.min(Math.max(sh.top(x),y0-dy),y1+dy));});
        const bot=Array.from({length:n+1},(_,k)=>{const x=b-(b-a)*k/n;return X(x)+','+Y(Math.min(Math.max(sh.bottom(x),y0-dy),y1+dy));});
        return <polygon key={'sh'+i} points={[...top,...bot].join(' ')} fill={sh.color??'rgba(77,99,216,.2)'}/>;
      })}
      {s.rects?.map((r,i)=><rect key={'r'+i} x={X(r.x)} width={Math.max(0,r.w*sx)} y={Y(Math.max(r.y0,r.y1))} height={Math.abs(r.y1-r.y0)*sy}
        fill={r.color??'rgba(232,137,74,.3)'} stroke="#e8894a" strokeWidth=".8"/>)}
      {s.vlines?.map((v,i)=><line key={'v'+i} x1={X(v.x)} x2={X(v.x)} y1={M} y2={H-M} stroke={v.color??SOFT} strokeDasharray="6 4" strokeWidth="1.6"/>)}
      {s.hlines?.map((v,i)=><line key={'h'+i} y1={Y(v.y)} y2={Y(v.y)} x1={M} x2={W-M} stroke={v.color??SOFT} strokeDasharray="6 4" strokeWidth="1.6"/>)}
      {s.curves?.map((c,i)=><path key={'c'+i} d={'M'+c.pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join('L')+(c.closed?'Z':'')}
        fill={c.fill??'none'} stroke={c.color??INK} strokeWidth={c.width??2.4} strokeDasharray={c.dash?'6 4':undefined} strokeLinejoin="round"/>)}
      {s.fns?.map((f,i)=><path key={'f'+i} d={path(f.f,f.domain)} fill="none" stroke={f.color??INK} strokeWidth={f.width??(f.faint?1.6:2.8)}
        opacity={f.faint?.55:1} strokeDasharray={f.dash?'7 5':undefined} strokeLinecap="round"/>)}
      {s.intervals?.map((iv,i)=>{
        const a=Math.max(iv.from,x0),b=Math.min(iv.to,x1),yy=Y(ax);
        return <g key={'iv'+i}>
          {b>a?<line x1={X(a)} x2={X(b)} y1={yy} y2={yy} stroke={iv.color??'#e8894a'} strokeWidth="7" strokeLinecap="butt" opacity=".85"/>:null}
          {iv.from>x0&&<circle cx={X(iv.from)} cy={yy} r="5.5" fill={iv.closedL?iv.color:'#fff'} stroke={iv.color} strokeWidth="2.5"/>}
          {iv.to<x1&&<circle cx={X(iv.to)} cy={yy} r="5.5" fill={iv.closedR?iv.color:'#fff'} stroke={iv.color} strokeWidth="2.5"/>}
        </g>;})}
      {s.segments?.map((g,i)=><line key={'s'+i} x1={X(g.x1)} y1={Y(g.y1)} x2={X(g.x2)} y2={Y(g.y2)} stroke={g.color??INK}
        strokeWidth={g.width??2.2} strokeDasharray={g.dash?'5 4':undefined} markerEnd={g.arrow?`url(#${clip}a)`:undefined}/>)}
    </g>
    {s.points?.map((p,i)=>(p.x>=x0&&p.x<=x1&&p.y>=y0&&p.y<=y1)?<g key={'p'+i}>
      <circle cx={X(p.x)} cy={Y(p.y)} r="5.5" fill={p.open?'#fff':p.color??INK} stroke={p.color??INK} strokeWidth="2.4"/>
      {p.label&&<SvgMath x={X(p.x)+(X(p.x)>W-70?-8:8)} y={Y(p.y)-12} s={p.label} size={11.5} color={p.color??INK} anchor={X(p.x)>W-70?'end':'start'}/>}
    </g>:null)}
    {s.labels?.map((l,i)=><SvgMath key={'l'+i} x={X(l.x)} y={Y(l.y)} s={l.s} size={12} color={l.color??INK} anchor={l.anchor??'middle'}/>)}
  </g>;
}

function SceneView({scene}:{scene:Scene}){
  switch(scene.kind){
    case 'plot':return <Plot s={scene}/>;
    case 'area':{
      const {a,b}=scene,unit=230/(a+b),x=(W-230)/2,y=(H-230)/2+6,A=a*unit,B=b*unit;
      const cell=(px:number,py:number,w:number,h:number,fill:string,label:string)=><g>
        <rect x={px} y={py} width={w} height={h} fill={fill} stroke="#fff" strokeWidth="2.5"/>
        {Math.min(w,h)>22&&<text x={px+w/2} y={py+h/2} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(16,Math.min(w,h)/2.4)} fontWeight="800" fill="#24345e">{label}</text>}
      </g>;
      return <g>
        {cell(x,y,A,A,'#c9d3fb',`${a}²=${a*a}`)}{cell(x+A,y,B,A,'#fde3c8',`${a}×${b}`)}
        {cell(x,y+A,A,B,'#fde3c8',`${a}×${b}`)}{cell(x+A,y+A,B,B,'#cdeedd',`${b}²=${b*b}`)}
        <text x={x+A/2} y={y-9} textAnchor="middle" fontSize="13" fill={INK} fontWeight="700">a={a}</text>
        <text x={x+A+B/2} y={y-9} textAnchor="middle" fontSize="13" fill={INK} fontWeight="700">b={b}</text>
        <text x={x-9} y={y+A/2} textAnchor="end" dominantBaseline="central" fontSize="13" fill={INK} fontWeight="700">a</text>
        <text x={x-9} y={y+A+B/2} textAnchor="end" dominantBaseline="central" fontSize="13" fill={INK} fontWeight="700">b</text>
      </g>;}
    case 'bars':{
      const {bars}=scene,n=bars.length,max=Math.max(1e-9,...bars.map(b=>Math.abs(b.value)));
      const neg=bars.some(b=>b.value<0),zeroY=neg?H/2+4:H-40,hMax=neg?H/2-40:H-80,bw=(W-40)/n;
      return <g>
        <line x1="20" x2={W-20} y1={zeroY} y2={zeroY} stroke={SOFT} strokeWidth="1.5"/>
        {bars.map((b,i)=>{const h=Math.abs(b.value)/max*hMax,x=20+i*bw+bw*.15,yy=b.value>=0?zeroY-h:zeroY;
          return <g key={i}>
            <rect x={x} y={yy} width={bw*.7} height={Math.max(h,.5)} rx="3" fill={b.color??'#4d63d8'} opacity=".85"/>
            {n<=12&&<text x={x+bw*.35} y={b.value>=0?yy-7:yy+h+12} textAnchor="middle" fontSize="10.5" fill={INK} fontWeight="700">{Math.abs(b.value)<1&&b.value!==0?num(b.value,3):num(b.value)}</text>}
            <text x={x+bw*.35} y={neg?(b.value>=0?zeroY+14:zeroY-8):zeroY+14} textAnchor="middle" fontSize={n>14?8.5:10.5} fill={SOFT}>{b.label}</text>
          </g>;})}
        {scene.caption&&<text x={W/2} y={18} textAnchor="middle" fontSize="12" fill={SOFT}>{scene.caption}</text>}
      </g>;}
    case 'venn':{
      const {a,b,both,labels,prob}=scene,f=(v:number)=>prob?num(v/100):String(v);
      return <g>
        <rect x="18" y="22" width={W-36} height={H-44} rx="14" fill="#f7f8fe" stroke="#dfe4f5"/>
        <circle cx="175" cy="152" r="96" fill="rgba(77,99,216,.22)" stroke="#4d63d8" strokeWidth="2.5"/>
        <circle cx="265" cy="152" r="96" fill="rgba(232,137,74,.22)" stroke="#e8894a" strokeWidth="2.5"/>
        <text x="120" y="70" fontSize="17" fontWeight="800" fill="#4d63d8">{labels[0]}</text>
        <text x="312" y="70" fontSize="17" fontWeight="800" fill="#e8894a">{labels[1]}</text>
        <text x="135" y="152" textAnchor="middle" dominantBaseline="central" fontSize="19" fontWeight="800" fill={INK}>{f(a-both)}</text>
        <text x="220" y="152" textAnchor="middle" dominantBaseline="central" fontSize="19" fontWeight="800" fill="#6b3fd1">{f(both)}</text>
        <text x="305" y="152" textAnchor="middle" dominantBaseline="central" fontSize="19" fontWeight="800" fill={INK}>{f(b-both)}</text>
        {prob&&<text x="40" y={H-34} fontSize="12" fill={SOFT}>바깥: {num(1-(a+b-both)/100)}</text>}
      </g>;}
    case 'matrix':{
      const {A,B,C,hi}=scene;
      const grid=(m:number[][],x:number,label:string,hl:(i:number,j:number)=>boolean)=><g>
        <text x={x+40} y={70} textAnchor="middle" fontSize="15" fontWeight="800" fill={SOFT}>{label}</text>
        <path d={`M${x+6},92 h-6 v100 h6 M${x+74},92 h6 v100 h-6`} fill="none" stroke={INK} strokeWidth="2"/>
        {m.map((r,i)=>r.map((v,j)=><g key={i+'-'+j}>
          {hl(i,j)&&<rect x={x+4+j*36} y={98+i*48} width="36" height="40" rx="7" fill="#fde3c8"/>}
          <text x={x+22+j*36} y={118+i*48} textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="800" fill={INK}>{num(v)}</text>
        </g>))}
      </g>;
      return <g>
        {grid(A,18,'A',(i)=>i===hi[0])}
        <text x="120" y="142" fontSize="20" fill={SOFT} textAnchor="middle" dominantBaseline="central">×</text>
        {grid(B,148,'B',(_,j)=>j===hi[1])}
        <text x="250" y="142" fontSize="20" fill={SOFT} textAnchor="middle" dominantBaseline="central">=</text>
        {grid(C,280,'AB',(i,j)=>i===hi[0]&&j===hi[1])}
      </g>;}
    case 'slots':{
      const {slots}=scene,n=slots.length,bw=Math.min(58,(W-40)/Math.max(n,1)-14),total=n*(bw+14)-14,x0=(W-total)/2;
      return <g>
        {slots.map((s,i)=><g key={i}>
          <rect x={x0+i*(bw+14)} y="105" width={bw} height="64" rx="10" fill="#eef1ff" stroke="#4d63d8" strokeWidth="2"/>
          <text x={x0+i*(bw+14)+bw/2} y="137" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="800" fill="#2e3f86">{s.top}</text>
          {s.bottom&&<text x={x0+i*(bw+14)+bw/2} y="186" textAnchor="middle" fontSize="10.5" fill={SOFT}>{s.bottom}</text>}
          {i<n-1&&<text x={x0+i*(bw+14)+bw+7} y="137" textAnchor="middle" dominantBaseline="central" fontSize="15" fill={SOFT}>×</text>}
        </g>)}
        <text x={W/2} y="236" textAnchor="middle" fontSize="13" fill={INK} fontWeight="700">{scene.caption}</text>
      </g>;}
    case 'stars':{
      const seq:string[]=[];scene.groups.forEach((g,i)=>{for(let k=0;k<g;k++)seq.push('★');if(i<scene.groups.length-1)seq.push('|');});
      const step=Math.min(34,(W-40)/seq.length),x0=(W-step*seq.length)/2+step/2;
      return <g>
        {seq.map((c,i)=><text key={i} x={x0+i*step} y="140" textAnchor="middle" dominantBaseline="central" fontSize={c==='|'?34:24}
          fill={c==='|'?'#e8894a':'#f2b705'} fontWeight="800">{c}</text>)}
        {(()=>{let pos=0;return scene.groups.map((g,i)=>{const start=pos;pos+=g+1;const mid=x0+(start+(g-1)/2)*step;
          return <text key={'g'+i} x={g?mid:x0+(start-.5)*step} y="186" textAnchor="middle" fontSize="12" fill={SOFT}>{i+1}번 종류 {g}개</text>;});})()}
        <text x={W/2} y="240" textAnchor="middle" fontSize="12.5" fill={INK} fontWeight="700">별 {scene.groups.reduce((a,b)=>a+b,0)}개와 칸막이 {scene.groups.length-1}개를 늘어놓는 한 가지 예</text>
      </g>;}
    case 'pascal':{
      const {n,r}=scene,rowH=Math.min(26,(H-30)/(n+1)),cw=Math.min(40,(W-20)/(n+1));
      return <g>{Array.from({length:n+1},(_,i)=>Array.from({length:i+1},(_,j)=>{
        const x=W/2+(j-i/2)*cw,y=20+i*rowH+rowH/2,hl=i===n&&j===r;
        return <g key={i+'-'+j}>
          {hl&&<circle cx={x} cy={y} r={Math.min(15,rowH/2+3)} fill="#fde3c8" stroke="#e8894a" strokeWidth="2"/>}
          <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(13,cw/2.6)} fontWeight={i===n?800:500} fill={i===n?INK:SOFT}>{nCr(i,j)}</text>
        </g>;}))}</g>;}
    case 'dominoes':{
      const {n,fallen,gapAt}=scene,step=(W-40)/n;
      return <g>
        <line x1="14" x2={W-14} y1="210" y2="210" stroke={SOFT} strokeWidth="2"/>
        {Array.from({length:n},(_,i)=>{const x=24+i*step,down=i<fallen;
          return <g key={i} transform={down?`rotate(58 ${x+14} 210)`:undefined}>
            <rect x={x} y="130" width="14" height="80" rx="3" fill={down?'#4d63d8':'#c9d3fb'} stroke="#2e3f86" strokeWidth="1.2"/>
            {!down&&<text x={x+7} y="232" textAnchor="middle" fontSize="10" fill={SOFT}>{i+1}</text>}
          </g>;})}
        {gapAt!==undefined&&gapAt<n&&<text x={24+gapAt*step-2} y="110" textAnchor="middle" fontSize="12" fill="#d9534f" fontWeight="800">✕ 끊김</text>}
      </g>;}
    case 'staircase':{
      const {n}=scene,u=Math.min(22,Math.min((W-60)/n,(H-60)/(n+1))),x0=(W-n*u)/2,y0=(H-(n+1)*u)/2;
      const cells:ReactNode[]=[];
      for(let c=0;c<n;c++)for(let r=0;r<=n;r++){
        const blue=r>=n-c;
        cells.push(<rect key={c+'-'+r} x={x0+c*u} y={y0+r*u} width={u-1.5} height={u-1.5} rx="2" fill={blue?'#7d8ef0':'#f6be8e'}/>);
      }
      return <g>{cells}
        <text x={x0+n*u/2} y={y0+(n+1)*u+16} textAnchor="middle" fontSize="12" fill={INK}>가로 {n}</text>
        <text x={x0-8} y={y0+(n+1)*u/2} textAnchor="end" dominantBaseline="central" fontSize="12" fill={INK}>세로 {n+1}</text></g>;}
    case 'intervals1d':{
      const [a,b]=scene.range,X=(v:number)=>30+(v-a)/(b-a)*(W-60);
      return <g>
        <line x1="20" x2={W-20} y1="210" y2="210" stroke={SOFT} strokeWidth="2"/>
        {Array.from({length:b-a+1},(_,i)=>a+i).map(v=><g key={v}><line x1={X(v)} x2={X(v)} y1="205" y2="215" stroke={SOFT}/>
          <text x={X(v)} y="230" textAnchor="middle" fontSize="10" fill={SOFT}>{num(v)}</text></g>)}
        {scene.rows.map((r,i)=>{const y=90+i*55;return <g key={r.label}>
          <text x="20" y={y} dominantBaseline="central" fontSize="15" fontWeight="800" fill={r.color}>{r.label}</text>
          <line x1={X(r.from)} x2={X(r.to)} y1={y} y2={y} stroke={r.color} strokeWidth="10" strokeLinecap="round" opacity=".8"/>
          <line x1={X(r.from)} x2={X(r.from)} y1={y} y2="210" stroke={r.color} strokeDasharray="3 4"/>
          <line x1={X(r.to)} x2={X(r.to)} y1={y} y2="210" stroke={r.color} strokeDasharray="3 4"/>
        </g>;})}
      </g>;}
    case 'areaModel':{
      const {pA,pBA,pBnA}=scene,x=60,y=40,w=320,h=210,wa=w*pA;
      return <g>
        <rect x={x} y={y} width={w} height={h} fill="#f7f8fe" stroke="#cbd3ec"/>
        <rect x={x} y={y+h*(1-pBA)} width={wa} height={h*pBA} fill="rgba(77,99,216,.55)"/>
        <rect x={x+wa} y={y+h*(1-pBnA)} width={w-wa} height={h*pBnA} fill="rgba(77,99,216,.25)"/>
        <line x1={x+wa} x2={x+wa} y1={y} y2={y+h} stroke={INK} strokeWidth="2"/>
        <text x={x+wa/2} y={y-10} textAnchor="middle" fontSize="13" fontWeight="800" fill={INK}>A ({num(pA)})</text>
        <text x={x+wa+(w-wa)/2} y={y-10} textAnchor="middle" fontSize="13" fontWeight="800" fill={SOFT}>Aᶜ ({num(1-pA)})</text>
        {pBA>.12&&<text x={x+wa/2} y={y+h*(1-pBA/2)} textAnchor="middle" dominantBaseline="central" fontSize="12.5" fontWeight="800" fill="#fff">A∩B</text>}
        {pBnA>.12&&<text x={x+wa+(w-wa)/2} y={y+h*(1-pBnA/2)} textAnchor="middle" dominantBaseline="central" fontSize="12.5" fontWeight="800" fill="#2e3f86">Aᶜ∩B</text>}
        <text x={x+w+8} y={y+h/2} fontSize="11" fill={SOFT} dominantBaseline="central">B=파랑</text>
      </g>;}
  }
}

export default function HighLab({topic}:{topic:HighTopic}){
  const def=labs[topic];
  const init=()=>({a:0,b:0,c:0,t:0,u:0,...Object.fromEntries(def.controls.map(c=>[c.key,c.initial]))}) as Vals;
  const [vals,setVals]=useState<Vals>(init);
  const model=def.model(vals);
  const set=(k:keyof Vals,v:number)=>setVals(p=>({...p,[k]:v}));
  return <section className="middle-lab high-lab" aria-label="직접 탐구하는 수학 실험">
    <div className="middle-lab-head"><span>🖐️ TRY IT YOURSELF</span><h3>값을 바꾸며 변화를 살펴보세요</h3></div>
    <div className="middle-lab-grid">
      <div className="middle-controls">
        {def.controls.map(c=>{
          const opts=c.options;
          const idx=opts?Math.max(0,opts.indexOf(vals[c.key])):0;
          return <div key={c.key} className="high-control">
            <label htmlFor={'high-'+topic+'-'+c.key}>{c.label} <strong>{num(vals[c.key])}</strong></label>
            {opts?<input id={'high-'+topic+'-'+c.key} type="range" min={0} max={opts.length-1} step={1} value={idx}
                onChange={e=>set(c.key,opts[Number(e.target.value)])}/>:
              <input id={'high-'+topic+'-'+c.key} type="range" min={c.min} max={c.max} step={c.step??1} value={vals[c.key]}
                onChange={e=>set(c.key,Number(e.target.value))}/>}
            <div className="middle-range"><span>{num(opts?opts[0]:c.min)}</span><span>{num(opts?opts.at(-1)!:c.max)}</span></div>
          </div>;})}
        {def.toggles?.map(tg=><div key={tg.key} className="high-toggle" role="group" aria-label={tg.label}>
          <small>{tg.label}</small>
          <div>{tg.options.map((o,i)=><button type="button" key={o} aria-pressed={vals[tg.key]===i} onClick={()=>set(tg.key,i)}>{o}</button>)}</div>
        </div>)}
        <button type="button" className="middle-reset" onClick={()=>setVals(init())}>↻ 처음 값으로 되돌리기</button>
      </div>
      <div className="middle-lab-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={model.aria} className="middle-svg high-svg"><SceneView scene={model.scene}/></svg>
      </div>
    </div>
    <div className="middle-live-result" aria-live="polite">
      <div><small>수학적 관계</small><strong><MathLine text={model.formula}/></strong></div>
      <div><small>조작 결과</small><strong><MathLine text={model.value}/></strong></div>
      <p><MathLine text={model.detail}/></p>
    </div>
  </section>;
}
