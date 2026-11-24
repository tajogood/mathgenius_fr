import type {HighTopic} from './curriculum.ts';
import {MINUS,cx,frac,ineqSolution,linFactor,nCr,nPr,num,phi,piFrac,poly,root,sub,term} from './format.ts';

/* ───────── 장면(그림) 정의 ───────── */
export type Fn={f:(x:number)=>number;color?:string;dash?:boolean;width?:number;domain?:[number,number];faint?:boolean};
export type PlotScene={kind:'plot';xr:[number,number];yr:[number,number];equal?:boolean;
  xticks?:{v:number;label:string}[];hideYTicks?:boolean;
  fns?:Fn[];
  curves?:{pts:[number,number][];color?:string;dash?:boolean;fill?:string;closed?:boolean;width?:number}[];
  shade?:{top:(x:number)=>number;bottom:(x:number)=>number;from:number;to:number;color?:string}[];
  rects?:{x:number;w:number;y0:number;y1:number;color?:string}[];
  points?:{x:number;y:number;label?:string;color?:string;open?:boolean}[];
  segments?:{x1:number;y1:number;x2:number;y2:number;color?:string;dash?:boolean;arrow?:boolean;width?:number}[];
  vlines?:{x:number;color?:string}[];hlines?:{y:number;color?:string}[];
  intervals?:{from:number;to:number;closedL?:boolean;closedR?:boolean;color?:string}[];
  labels?:{x:number;y:number;s:string;color?:string;anchor?:'start'|'middle'|'end'}[];
};
export type Scene=PlotScene
  |{kind:'area';a:number;b:number}
  |{kind:'bars';bars:{label:string;value:number;color?:string}[];caption?:string}
  |{kind:'venn';a:number;b:number;both:number;labels:[string,string];prob?:boolean}
  |{kind:'matrix';A:number[][];B:number[][];C:number[][];hi:[number,number]}
  |{kind:'slots';slots:{top:string;bottom?:string}[];caption:string}
  |{kind:'stars';groups:number[]}
  |{kind:'pascal';n:number;r:number}
  |{kind:'dominoes';n:number;fallen:number;gapAt?:number}
  |{kind:'staircase';n:number}
  |{kind:'intervals1d';range:[number,number];rows:{label:string;from:number;to:number;color:string}[]}
  |{kind:'areaModel';pA:number;pBA:number;pBnA:number};
export type LabModel={formula:string;value:string;detail:string;scene:Scene;aria:string};
export type Vals={a:number;b:number;c:number;t:number;u:number};
type Ctl={key:'a'|'b'|'c';label:string;min:number;max:number;step?:number;initial:number;
  options?:number[];fmt?:(v:number)=>string};
type Toggle={key:'t'|'u';label:string;options:string[]};
export type LabDef={controls:Ctl[];toggles?:Toggle[];model:(v:Vals)=>LabModel};

const C=(key:'a'|'b'|'c',label:string,min:number,max:number,initial:number,step=1,extra:Partial<Ctl>={}):Ctl=>
  ({key,label,min,max,initial,step,...extra});
const BLUE='#4d63d8',ORANGE='#e8894a',GREEN='#2f9e72',PURPLE='#8b5cf6',RED='#d9534f',GRAY='#98a3bd';
const sgn=(n:number)=>n<0?MINUS+num(-n):'+'+num(n);
const paren=(n:number)=>n<0?'('+num(n)+')':num(n);
const deg=(d:number)=>d*Math.PI/180;
const linspace=(a:number,b:number,n:number)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
const circle=(cx0:number,cy0:number,r:number):[number,number][]=>linspace(0,2*Math.PI,96).map(t=>[cx0+r*Math.cos(t),cy0+r*Math.sin(t)]);
function realRootsCubic(f:(x:number)=>number,lo:number,hi:number):number[]{
  const roots:number[]=[];const N=1200;let px=lo,py=f(lo);
  for(let i=1;i<=N;i++){
    const x=lo+(hi-lo)*i/N,y=f(x);
    if(Math.abs(py)<1e-9){roots.push(px);}
    else if(py*y<0){let a=px,b=x;for(let k=0;k<50;k++){const m=(a+b)/2;if(f(a)*f(m)<=0)b=m;else a=m;}roots.push((a+b)/2);}
    px=x;py=y;
  }
  const out:number[]=[];for(const r of roots)if(!out.some(o=>Math.abs(o-r)<1e-3))out.push(r);
  return out;
}
const piTicks=(lim:number)=>{
  const t:{v:number;label:string}[]=[];
  for(let k=-Math.floor(lim/(Math.PI/2));k*Math.PI/2<=lim;k++)if(k!==0)t.push({v:k*Math.PI/2,label:k%2===0?piFrac(k,2):''});
  return t;
};
const trigExact:Record<number,[string,string,string]>={
  0:['0','1','0'],30:['1/2','√3/2','√3/3'],45:['√2/2','√2/2','1'],60:['√3/2','1/2','√3'],90:['1','0','정의되지 않음'],
};
export function trigValues(d:number):[string,string,string]|null{
  const r=((d%360)+360)%360;
  const q=Math.floor(r/90),ref=[r,180-r,r-180,360-r][q]%360;
  const base=trigExact[ref===360?0:ref];if(!base)return null;
  const neg=(s:string)=>s==='0'||s==='정의되지 않음'?s:s.startsWith(MINUS)?s.slice(1):MINUS+s;
  const sinPos=r<180||r===0,cosPos=r<=90||r>270;
  let [s,c,t]=base;
  if(r===180){return ['0',MINUS+'1','0'];}
  if(r===270){return [MINUS+'1','0','정의되지 않음'];}
  if(!sinPos)s=neg(s);if(!cosPos)c=neg(c);
  if(t!=='정의되지 않음'&&(sinPos!==cosPos))t=neg(t);
  return [s,c,t];
}

export const labs:Record<HighTopic,LabDef>={
  /* ───── 공통수학1 ───── */
  polyOps:{controls:[C('a','a의 길이',1,6,3),C('b','b의 길이',1,6,2)],
    model:({a,b})=>({formula:`(${a}+${b})^{2}=${a*a}+2×${a}×${b}+${b*b}`,value:`${(a+b)**2}`,
      detail:`정사각형 ${a*a}, 직사각형 ${a*b} 두 개, 정사각형 ${b*b}을 합치면 한 변이 ${a+b}인 정사각형 ${(a+b)**2}이 돼요.`,
      scene:{kind:'area',a,b},aria:`한 변 ${a+b}인 정사각형을 네 조각으로 나눈 넓이 모형`})},
  remainder:{controls:[C('a','나누는 식 x−a의 a',-3,4,2),C('b','f(x)의 상수항',-4,10,6)],
    model:({a,b})=>{const f=(x:number)=>x**3-2*x*x-5*x+b,R=f(a);
      return {formula:`f(x)=${poly([1,-2,-5,b])} 를 ${linFactor(a)} 로 나눈 나머지 = f(${num(a)})`,
        value:`R = ${num(R)}`,detail:R===0?`f(${num(a)})=0이므로 ${linFactor(a)}는 f(x)의 인수예요(인수정리).`:`그래프 위 점 (${num(a)}, ${num(R)})의 높이가 나머지예요.`,
        scene:{kind:'plot',xr:[-3.6,4.6],yr:[-16,16],fns:[{f,color:BLUE}],
          segments:[{x1:a,y1:0,x2:a,y2:R,color:ORANGE,dash:true}],points:[{x:a,y:R,label:`(${num(a)}, ${num(R)})`,color:ORANGE}]},
        aria:`삼차함수 그래프와 x=${a}에서의 함숫값 ${R}`};}},
  factorCubic:{controls:[C('a','첫째 근 r₁',-3,3,-2),C('b','둘째 근 r₂',-3,3,1),C('c','셋째 근 r₃',-3,3,3)],
    model:({a,b,c})=>{const f=(x:number)=>(x-a)*(x-b)*(x-c);
      return {formula:`(${linFactor(a)})(${linFactor(b)})(${linFactor(c)})`,value:poly([1,-(a+b+c),a*b+b*c+c*a,-a*b*c]),
        detail:`x²의 계수 ${num(-(a+b+c))}는 −(근의 합), 상수항 ${num(-a*b*c)}는 −(근의 곱)이에요.`,
        scene:{kind:'plot',xr:[-4.2,4.2],yr:[-14,14],fns:[{f,color:BLUE}],
          points:[...new Set([a,b,c])].map(r=>({x:r,y:0,label:String(num(r)),color:ORANGE}))},
        aria:`세 근 ${a}, ${b}, ${c}에서 x축과 만나는 삼차함수`};}},
  complex:{controls:[C('a','실수부 a',-4,4,3),C('b','허수부 b',-4,4,2)],
    model:({a,b})=>({formula:`z=${cx(a,b)},  z̄=${cx(a,-b)},  iz=${cx(-b,a)}`,value:`z·z̄ = ${a*a+b*b}`,
      detail:`켤레복소수는 실수축 대칭, i를 곱하면 원점 중심 90° 회전이에요.`,
      scene:{kind:'plot',xr:[-5.5,5.5],yr:[-5.5,5.5],equal:true,
        segments:[{x1:0,y1:0,x2:a,y2:b,color:BLUE,arrow:true},{x1:0,y1:0,x2:-b,y2:a,color:GREEN,arrow:true,dash:true},
          {x1:a,y1:b,x2:a,y2:-b,color:GRAY,dash:true}],
        points:[{x:a,y:b,label:'z',color:BLUE},{x:a,y:-b,label:'z̄',color:ORANGE},{x:-b,y:a,label:'iz',color:GREEN}],
        labels:[{x:5.2,y:-.5,s:'실수축',anchor:'end'},{x:.25,y:5.1,s:'허수축',anchor:'start'}]},
      aria:`복소평면 위의 점 ${cx(a,b)}와 켤레복소수`})},
  discriminant:{controls:[C('b','일차항 계수 b',-6,6,-2),C('c','상수항 c',-6,9,-3)],
    model:({b,c})=>{const D=b*b-4*c,f=(x:number)=>x*x+b*x+c;
      const roots=D>=0?[(-b-Math.sqrt(D))/2,(-b+Math.sqrt(D))/2]:[];
      return {formula:`x^{2}${term(b,'x')}${c?sgn(c):''}=0,  D=${paren(b)}^{2}−4×${paren(c)}=${num(D)}`,
        value:D>0?'서로 다른 두 실근':D===0?'중근':'서로 다른 두 허근',
        detail:`근과 계수의 관계: α+β=${num(-b)}, αβ=${num(c)}`+(D>=0?` · 근 ≈ ${[...new Set(roots.map(r=>num(r)))].join(', ')}`:''),
        scene:{kind:'plot',xr:[-8,8],yr:[-9,10],fns:[{f,color:BLUE}],points:[...new Set(roots.map(r=>Math.round(r*1000)/1000))].map(r=>({x:r,y:0,color:ORANGE}))},
        aria:`판별식 ${D}인 포물선`};}},
  quadGraph:{controls:[C('a','직선의 기울기 m',-4,4,1),C('b','직선의 y절편 n',-4,4,2,.25)],
    model:({a:m,b:n})=>{const D=m*m+4*n,xs=D>=0?[...new Set([(m-Math.sqrt(D))/2,(m+Math.sqrt(D))/2].map(v=>Math.round(v*1e6)/1e6))]:[];
      return {formula:`x^{2}=${term(m,'x',true)||'0'}${n?sgn(n):''} ⇔ x^{2}${term(-m,'x')}${n?sgn(-n):''}=0,  D=${num(D)}`,
        value:D>0?'두 점에서 만남':D===0?'접함(한 점)':'만나지 않음',detail:D===0?`판별식이 0이 되어 직선이 포물선에 접해요.`:`판별식 D=m²+4n의 부호가 교점의 개수를 정해요.`,
        scene:{kind:'plot',xr:[-5,5],yr:[-4,10],fns:[{f:x=>x*x,color:BLUE},{f:x=>m*x+n,color:ORANGE}],points:xs.map(x=>({x,y:x*x,color:PURPLE}))},
        aria:`포물선 y=x²과 직선, 교점 ${xs.length}개`};}},
  higherEq:{controls:[C('a','직선 y=k의 k',-4,4,1,.5)],
    model:({a:k})=>{const f=(x:number)=>x**3-3*x;const rs=realRootsCubic(x=>f(x)-k,-3.5,3.5);
      return {formula:`x^{3}−3x=${num(k)}`,value:`실근 ${rs.length}개`,detail:`곡선 y=x³−3x와 직선 y=${num(k)}의 교점 ${rs.length}개 · 극댓값 2, 극솟값 −2`,
        scene:{kind:'plot',xr:[-3,3],yr:[-5,5],fns:[{f,color:BLUE},{f:()=>k,color:ORANGE}],points:rs.map(x=>({x,y:k,color:PURPLE}))},
        aria:`삼차함수와 직선 y=${k}의 교점 ${rs.length}개`};}},
  quadIneq:{controls:[C('a','근 α',-5,5,-1),C('b','근 β',-5,5,3)],toggles:[{key:'t',label:'부등호',options:['<','>','≤','≥']}],
    model:({a,b,t})=>{const op=(['<','>','≤','≥'] as const)[t];const lo=Math.min(a,b),hi=Math.max(a,b);
      const sol=ineqSolution(a,b,op);const inside=op==='<'||op==='≤',closed=op==='≤'||op==='≥';
      const ints=lo===hi?(op==='>'?[{from:-99,to:lo},{from:lo,to:99}]:op==='≥'?[{from:-99,to:99,closedL:true,closedR:true}]:op==='≤'?[{from:lo,to:lo,closedL:true,closedR:true}]:[]):
        inside?[{from:lo,to:hi,closedL:closed,closedR:closed}]:[{from:-99,to:lo,closedR:closed},{from:hi,to:99,closedL:closed}];
      return {formula:`(${linFactor(a)})(${linFactor(b)}) ${op} 0`,value:sol,
        detail:inside?'포물선이 x축 아래(또는 위에 닿는) 부분의 x 범위예요.':'포물선이 x축 위(또는 닿는) 부분의 x 범위예요.',
        scene:{kind:'plot',xr:[-7,7],yr:[-8,9],fns:[{f:x=>(x-a)*(x-b),color:BLUE}],intervals:ints.map(i=>({...i,color:ORANGE})),
          points:[...new Set([a,b])].map(r=>({x:r,y:0,open:!closed,color:ORANGE}))},
        aria:`이차부등식의 해 ${sol}`};}},
  permComb:{controls:[C('a','전체 개수 n',1,9,5),C('b','고르는 개수 r',0,9,3)],
    model:({a:n,b})=>{const r=Math.min(b,n);const P=nPr(n,r),Cv=nCr(n,r);
      return {formula:`_{${n}}P_{${r}}=${r?Array.from({length:r},(_,i)=>n-i).join('×'):'1'}=${P},  _{${n}}C_{${r}}={{${P}|${r}!}}=${Cv}`,
        value:`순열 ${P} · 조합 ${Cv}`,detail:`같은 ${r}개를 줄 세우는 방법이 ${r}!=${nPr(r,r)}가지이므로 순열은 조합의 ${nPr(r,r)}배예요.`+(b>n?` (r은 n보다 클 수 없어서 r=${n}으로 맞췄어요.)`:''),
        scene:{kind:'slots',slots:Array.from({length:r},(_,i)=>({top:String(n-i),bottom:(i+1)+'번째'})),caption:r?`${n}개 중 ${r}개를 차례로 고르기`:'아무것도 고르지 않는 방법 1가지'},
        aria:`${n}개 중 ${r}개를 고르는 순열 ${P}가지, 조합 ${Cv}가지`};}},
  matrix:{controls:[C('a','A의 1행 1열',-3,4,1),C('b','A의 1행 2열',-3,4,2),C('c','A의 2행 1열',-3,4,0)],
    toggles:[{key:'t',label:'AB에서 볼 성분',options:['(1, 1)','(1, 2)','(2, 1)','(2, 2)']}],
    model:({a,b,c,t})=>{const A=[[a,b],[c,1]],B=[[2,1],[1,3]];
      const Cm=[[0,1].map(j=>A[0][0]*B[0][j]+A[0][1]*B[1][j]),[0,1].map(j=>A[1][0]*B[0][j]+A[1][1]*B[1][j])];
      const i=t>>1,j=t&1;
      return {formula:`AB의 (${i+1}, ${j+1}) 성분 = ${paren(A[i][0])}×${B[0][j]}+${paren(A[i][1])}×${B[1][j]}`,value:num(Cm[i][j]),
        detail:`A의 ${i+1}행과 B의 ${j+1}열을 차례로 곱해 더해요.`,
        scene:{kind:'matrix',A,B,C:Cm,hi:[i,j]},aria:`행렬 곱 AB의 (${i+1}, ${j+1}) 성분 ${Cm[i][j]}`};}},
  /* ───── 공통수학2 ───── */
  distance:{controls:[C('a','점 B의 x좌표',-5,6,5),C('b','점 B의 y좌표',-5,6,2)],toggles:[{key:'t',label:'내분 비 m:n',options:['1:1','1:2','2:1','1:3','3:1','2:3']}],
    model:({a,b,t})=>{const A=[-3,-2],[m,n]=['1:1','1:2','2:1','1:3','3:1','2:3'][t].split(':').map(Number);
      const dx=a-A[0],dy=b-A[1],d2=dx*dx+dy*dy;const P=[(m*a+n*A[0])/(m+n),(m*b+n*A[1])/(m+n)];
      return {formula:`AB=√(${paren(dx)}^{2}+${paren(dy)}^{2})=√${d2}${root(d2)!=='√'+d2?'='+root(d2):''}`,
        value:`P(${frac(m*a+n*A[0],m+n)}, ${frac(m*b+n*A[1],m+n)})`,
        detail:`A(−3, −2)와 B(${num(a)}, ${num(b)})를 ${m}:${n}으로 내분하는 점이 P예요.`,
        scene:{kind:'plot',xr:[-6,7],yr:[-6,7],equal:true,segments:[{x1:A[0],y1:A[1],x2:a,y2:b,color:BLUE,width:3}],
          points:[{x:A[0],y:A[1],label:'A',color:BLUE},{x:a,y:b,label:'B',color:BLUE},{x:P[0],y:P[1],label:'P',color:ORANGE}]},
        aria:`선분 AB와 ${m}:${n} 내분점 P`};}},
  lineEq:{controls:[C('a','기울기 m',-3,3,1,.5),C('b','y절편 n',-5,5,3)],
    model:({a:m,b:n})=>{const foot=[-m*n/(m*m+1),n/(m*m+1)];const d=Math.abs(n)/Math.sqrt(m*m+1);
      return {formula:`y=${term(m,'x',true)||''}${n?(m?sgn(n):num(n)):(m?'':'0')}`,value:`원점과의 거리 ≈ ${num(d)}`,
        detail:m===0?'수평선에 수직인 직선은 y축 방향(x=0)이에요.':`수선의 기울기는 −1/m=${frac(-2,Math.round(2*m))}이에요. 두 기울기의 곱은 −1이에요.`,
        scene:{kind:'plot',xr:[-7,7],yr:[-7,7],equal:true,fns:[{f:x=>m*x+n,color:BLUE}],
          segments:[{x1:0,y1:0,x2:foot[0],y2:foot[1],color:ORANGE,dash:true}],points:[{x:foot[0],y:foot[1],label:'H',color:ORANGE},{x:0,y:0,label:'O',color:GRAY}]},
        aria:`기울기 ${m}, y절편 ${n}인 직선과 원점에서 내린 수선`};}},
  circleEq:{controls:[C('a','중심의 x좌표 a',-4,4,1),C('b','중심의 y좌표 b',-4,4,2),C('c','반지름 r',1,5,3)],
    model:({a,b,c:r})=>{const db=Math.abs(b);const rel=db<r?'두 점에서 만남':db===r?'접함':'만나지 않음';
      const xs=db<=r?[...new Set([a-Math.sqrt(r*r-b*b),a+Math.sqrt(r*r-b*b)])]:[];
      return {formula:`(${linFactor(a)})^{2}+(${linFactor(b,'y')})^{2}=${r*r}`,value:`x축과 ${rel}`,
        detail:`중심에서 x축까지 거리 d=|b|=${db}, 반지름 r=${r} → d ${db<r?'<':db===r?'=':'>'} r`,
        scene:{kind:'plot',xr:[-9,9],yr:[-9,9],equal:true,curves:[{pts:circle(a,b,r),color:BLUE,fill:'rgba(77,99,216,.08)'}],
          segments:[{x1:a,y1:b,x2:a,y2:0,color:ORANGE,dash:true}],points:[{x:a,y:b,label:'중심',color:BLUE},...xs.map(x=>({x,y:0,color:PURPLE}))]},
        aria:`중심 (${a}, ${b}), 반지름 ${r}인 원과 x축`};}},
  transform:{controls:[C('a','점 P의 x좌표',-5,5,3),C('b','점 P의 y좌표',-5,5,1)],
    model:({a,b})=>({formula:`P(${num(a)}, ${num(b)})`,value:`x축 (${num(a)}, ${num(-b)}) · y축 (${num(-a)}, ${num(b)}) · 원점 (${num(-a)}, ${num(-b)}) · y=x (${num(b)}, ${num(a)})`,
      detail:'부호를 바꾸거나 두 좌표를 서로 바꾸면 대칭이동이 돼요.',
      scene:{kind:'plot',xr:[-6.5,6.5],yr:[-6.5,6.5],equal:true,fns:[{f:x=>x,color:GRAY,dash:true}],
        points:[{x:a,y:b,label:'P',color:BLUE},{x:a,y:-b,label:'x축',color:ORANGE},{x:-a,y:b,label:'y축',color:GREEN},{x:-a,y:-b,label:'원점',color:PURPLE},{x:b,y:a,label:'y=x',color:RED}]},
      aria:`점 P(${a}, ${b})와 네 가지 대칭점`})},
  sets:{controls:[C('a','n(A)',1,15,8),C('b','n(B)',1,15,6),C('c','n(A∩B)',0,15,3)],
    model:({a,b,c})=>{const both=Math.min(c,a,b);
      return {formula:`n(A∪B)=${a}+${b}−${both}`,value:`n(A∪B) = ${a+b-both}`,
        detail:`A에만 ${a-both}개, B에만 ${b-both}개, 둘 다 ${both}개`+(c>both?` (교집합은 ${Math.min(a,b)}개를 넘을 수 없어요)`:''),
        scene:{kind:'venn',a,b,both,labels:['A','B']},aria:`벤 다이어그램 n(A)=${a}, n(B)=${b}, n(A∩B)=${both}`};}},
  propositions:{controls:[C('a','P = {x | −a ≤ x ≤ a}의 a',1,6,2),C('b','Q = {x | −b ≤ x ≤ b}의 b',1,6,4)],
    model:({a,b})=>({formula:`p: |x|≤${a},  q: |x|≤${b}`,
      value:a<b?'p는 q이기 위한 충분조건':a>b?'p는 q이기 위한 필요조건':'p는 q이기 위한 필요충분조건',
      detail:a<b?'P⊂Q이므로 p→q는 참, q→p는 거짓이에요.':a>b?'Q⊂P이므로 q→p는 참, p→q는 거짓이에요.':'P=Q이므로 p↔q예요.',
      scene:{kind:'intervals1d',range:[-7,7],rows:[{label:'P',from:-a,to:a,color:BLUE},{label:'Q',from:-b,to:b,color:ORANGE}]},
      aria:`진리집합 P와 Q의 포함 관계`})},
  functions:{controls:[C('a','기울기 a (0 제외)',-3,3,2),C('b','y절편 b',-4,4,1)],
    model:({a,b})=>{if(a===0)return {formula:`f(x)=${num(b)}`,value:'역함수가 없음',detail:'상수함수는 일대일대응이 아니어서 역함수가 없어요.',
        scene:{kind:'plot',xr:[-7,7],yr:[-7,7],equal:true,fns:[{f:()=>b,color:BLUE},{f:x=>x,color:GRAY,dash:true}]},aria:'상수함수'};
      const inv=a===1?`x${sgn(-b)}`:a===-1?`${MINUS}x${sgn(b)}`:`{{x${b?sgn(-b):''}|${num(a)}}}`;
      return {formula:`f(x)=${term(a,'x',true)}${b?sgn(b):''}  →  f^{−1}(x)=${b===0&&Math.abs(a)===1?(a===1?'x':MINUS+'x'):inv}`,
        value:`f(1)=${num(a+b)} ⇔ f^{−1}(${num(a+b)})=1`,detail:'두 그래프는 직선 y=x에 대하여 대칭이에요.',
        scene:{kind:'plot',xr:[-7,7],yr:[-7,7],equal:true,fns:[{f:x=>a*x+b,color:BLUE},{f:x=>(x-b)/a,color:ORANGE},{f:x=>x,color:GRAY,dash:true}],
          points:[{x:1,y:a+b,color:BLUE},{x:a+b,y:1,color:ORANGE}]},aria:'일차함수와 역함수의 그래프'};}},
  rational:{controls:[C('a','k (0 제외)',-4,4,2),C('b','p',-3,3,1),C('c','q',-3,3,1)],
    model:({a:k,b:p,c:q})=>{const kk=k||1;
      return {formula:`y={{${num(kk)}|${linFactor(p)}}}${q?sgn(q):''}`,value:`점근선 x=${num(p)}, y=${num(q)}`,
        detail:(k===0?'k=0이면 상수함수가 되므로 k=1로 그렸어요. ':'')+`그래프는 점 (${num(p)}, ${num(q)})에 대하여 대칭이에요.`,
        scene:{kind:'plot',xr:[-7,7],yr:[-7,7],equal:true,fns:[{f:x=>kk/(x-p)+q,color:BLUE}],vlines:[{x:p,color:ORANGE}],hlines:[{y:q,color:ORANGE}],
          points:[{x:p,y:q,open:true,color:ORANGE}]},aria:`유리함수, 점근선 x=${p}, y=${q}`};}},
  irrational:{controls:[C('b','시작점 p',-4,4,-2),C('c','시작점 q',-4,4,1)],toggles:[{key:'t',label:'a 값',options:['a = 1','a = 2','a = −1','a = −2']}],
    model:({b:p,c:q,t})=>{const a=[1,2,-1,-2][t];
      const inside=a===1?linFactor(p):a===-1?`${MINUS}(${linFactor(p)})`:`${num(a)}(${linFactor(p)})`;
      return {formula:`y=√(${p===0&&Math.abs(a)===1?(a>0?'x':MINUS+'x'):inside})${q?sgn(q):''}`,
        value:a>0?`정의역 x≥${num(p)} · 치역 y≥${num(q)}`:`정의역 x≤${num(p)} · 치역 y≥${num(q)}`,
        detail:`근호 안이 0 이상이어야 하므로 그래프는 점 (${num(p)}, ${num(q)})에서 시작해 ${a>0?'오른쪽':'왼쪽'}으로 뻗어요.`,
        scene:{kind:'plot',xr:[-7,7],yr:[-6,8],equal:true,fns:[{f:x=>{const v=a*(x-p);return v<0?NaN:Math.sqrt(v)+q;},color:BLUE}],points:[{x:p,y:q,label:'시작점',color:ORANGE}]},
        aria:`무리함수, 시작점 (${p}, ${q})`};}},
  /* ───── 대수 ───── */
  expLaw:{controls:[C('a','밑 a',2,9,8),C('b','지수의 분자 m',-2,3,2),C('c','지수의 분모 n',1,3,3)],
    model:({a,b:m,c:n})=>{const v=a**(m/n),exactInt=Math.abs(v-Math.round(v))<1e-9;
      const g=Math.abs(m)%n===0;
      const e=g?num(m/n):`${m<0?MINUS:''}${Math.abs(m)}/${n}`;
      return {formula:`${a}^{${e}}`+(n>1&&!g?`=${n===2?'√':n===3?'∛':''}(${a}^{${num(m)}})`:''),
        value:exactInt?num(Math.round(v)):(Math.abs(1/v-Math.round(1/v))<1e-9?`1/${Math.round(1/v)}`:`≈ ${num(v,3)}`),
        detail:n===1||g?`지수가 정수 ${e}이므로 ${a}를 ${e}번 곱한(음수면 역수) 값이에요.`:`지수 ${e}는 "${n}제곱근을 구한 뒤 ${num(m)}제곱"한다는 뜻이에요.`,
        scene:{kind:'plot',xr:[-2.5,3.5],yr:[-1,12],fns:[{f:x=>a**x,color:BLUE}],points:[{x:m/n,y:v,label:`(${frac(m,n)}, ${exactInt?num(v):num(v,2)})`,color:ORANGE}],
          segments:[{x1:m/n,y1:0,x2:m/n,y2:Math.min(v,12),color:ORANGE,dash:true}]},aria:`y=${a}^x 위의 점`};}},
  logarithm:{controls:[C('a','밑 a',2,5,2),C('b','진수 N',1,16,8)],
    model:({a,b:N})=>{const v=Math.log(N)/Math.log(a),exact=Math.abs(v-Math.round(v))<1e-9;
      return {formula:`log_{${a}} ${N}`+(exact?`=log_{${a}} ${a}^{${Math.round(v)}}`:''),value:exact?num(Math.round(v)):`≈ ${num(v,3)}`,
        detail:exact?`${a}를 ${Math.round(v)}번 곱하면 ${N}이 돼요.`:`${a}^${Math.floor(v)}=${a**Math.floor(v)} < ${N} < ${a**(Math.floor(v)+1)}=${a}^${Math.floor(v)+1}이므로 로그값은 ${Math.floor(v)}와 ${Math.floor(v)+1} 사이예요.`,
        scene:{kind:'plot',xr:[-1,17],yr:[-3,5],fns:[{f:x=>x>0?Math.log(x)/Math.log(a):NaN,color:BLUE}],points:[{x:N,y:v,color:ORANGE,label:exact?`(${N}, ${Math.round(v)})`:undefined}]},
        aria:`y=log_${a} x 그래프 위 x=${N}인 점`};}},
  expLogGraph:{controls:[C('a','밑 a',.3,4,2,.1)],
    model:({a})=>{const ok=Math.abs(a-1)>1e-9;
      return {formula:ok?`y=${num(a,1)}^{x}  ↔  y=log_{${num(a,1)}} x`:'a=1이면 y=1ˣ=1(상수함수)',
        value:!ok?'지수함수의 밑으로 쓸 수 없음':a>1?'두 함수 모두 증가':'두 함수 모두 감소',
        detail:'두 그래프는 직선 y=x에 대하여 대칭이고, 각각 (0, 1), (1, 0)을 지나요.',
        scene:{kind:'plot',xr:[-4,6],yr:[-4,6],equal:true,fns:ok?[{f:x=>a**x,color:BLUE},{f:x=>x>0?Math.log(x)/Math.log(a):NaN,color:ORANGE},{f:x=>x,color:GRAY,dash:true}]:[{f:()=>1,color:BLUE}],
          points:ok?[{x:0,y:1,label:'(0, 1)',color:BLUE},{x:1,y:0,label:'(1, 0)',color:ORANGE}]:[]},aria:`밑이 ${a}인 지수함수와 로그함수`};}},
  trigFunc:{controls:[C('a','각 θ (°)',0,360,210,15)],
    model:({a})=>{const ex=trigValues(a);const rad=piFrac(a,180);const s=Math.sin(deg(a)),c=Math.cos(deg(a));
      const qd=a%90===0?'좌표축 위':`제${Math.floor(a/90)+1}사분면`;
      return {formula:`θ=${a}°=${rad}`,value:ex?`sinθ=${ex[0]} · cosθ=${ex[1]} · tanθ=${ex[2]}`:`sinθ≈${num(s,3)} · cosθ≈${num(c,3)}`,
        detail:`점 P는 ${qd}에 있어요. sin²θ+cos²θ=1`,
        scene:{kind:'plot',xr:[-1.5,1.5],yr:[-1.5,1.5],equal:true,hideYTicks:true,xticks:[{v:-1,label:'−1'},{v:1,label:'1'}],
          curves:[{pts:circle(0,0,1),color:GRAY},{pts:linspace(0,deg(a),40).map(t=>[.25*Math.cos(t),.25*Math.sin(t)]),color:PURPLE}],
          segments:[{x1:0,y1:0,x2:c,y2:s,color:BLUE,width:3},{x1:c,y1:0,x2:c,y2:s,color:ORANGE,width:3},{x1:0,y1:0,x2:c,y2:0,color:GREEN,width:3}],
          points:[{x:c,y:s,label:'P',color:BLUE}],labels:[{x:c,y:s/2,s:'sin',color:ORANGE,anchor:c>=0?'start':'end'},{x:c/2,y:-.12,s:'cos',color:GREEN}]},
        aria:`단위원 위의 각 ${a}도`};}},
  trigGraph:{controls:[C('a','a (진폭)',-3,3,2,.5),C('b','b (주기 조절)',.5,3,1,.5),C('c','c (위아래 이동)',-2,2,0,.5)],toggles:[{key:'t',label:'함수',options:['sin','cos']}],
    model:({a,b,c,t})=>{const fn=t?Math.cos:Math.sin,name=t?'cos':'sin',aa=a||1;
      const period=piFrac(4,Math.round(2*b));
      return {formula:`y=${aa===1?'':aa===-1?MINUS:num(aa)}${name} ${b===1?'':num(b)}x${c?sgn(c):''}`,
        value:`주기 ${period} · 최댓값 ${num(Math.abs(aa)+c)} · 최솟값 ${num(-Math.abs(aa)+c)}`,detail:(a===0?'a=0이면 상수함수라 a=1로 그렸어요. ':'')+(b===1?'b=1이면 주기는 2π예요. b를 키우면 그래프가 좁아져요.':`주기는 {{2π|${num(b)}}}=${period}이에요.`),
        scene:{kind:'plot',xr:[-6.6,6.6],yr:[-5.5,5.5],xticks:piTicks(6.5),fns:[{f:x=>aa*fn(b*x)+c,color:BLUE},{f:x=>fn(x),color:GRAY,dash:true,faint:true}],
          hlines:[{y:Math.abs(aa)+c,color:ORANGE},{y:-Math.abs(aa)+c,color:ORANGE}]},aria:`삼각함수 그래프, 주기 ${period}`};}},
  sineCosineLaw:{controls:[C('a','변 a = BC',2,9,5),C('b','변 b = CA',2,9,8),C('c','끼인각 C (°)',20,160,60,5)],
    model:({a,b,c})=>{const cc=a*a+b*b-2*a*b*Math.cos(deg(c)),side=Math.sqrt(cc),S=a*b*Math.sin(deg(c))/2;
      const Cp=[0,0],Bp=[a,0],Ap=[b*Math.cos(deg(c)),b*Math.sin(deg(c))];
      const xs=[Cp[0],Bp[0],Ap[0]],ys=[Cp[1],Bp[1],Ap[1]];const pad=1.5;
      const ex=c===60?`${a*a+b*b-a*b}`:c===120?`${a*a+b*b+a*b}`:c===90?`${a*a+b*b}`:null;
      return {formula:`c^{2}=${a}^{2}+${b}^{2}−2×${a}×${b}×cos ${c}°`+(ex?`=${ex}`:''),
        value:`c ${ex?'= '+root(Number(ex)):'≈ '+num(side)} · 넓이 ≈ ${num(S)}`,
        detail:c===90?'C=90°이면 피타고라스 정리와 같아요.':`넓이 = {{1|2}}×${a}×${b}×sin ${c}°`,
        scene:{kind:'plot',xr:[Math.min(...xs)-pad,Math.max(...xs)+pad],yr:[-pad,Math.max(...ys)+pad],equal:true,hideYTicks:true,xticks:[],
          curves:[{pts:[Cp,Bp,Ap] as [number,number][],closed:true,color:BLUE,fill:'rgba(77,99,216,.1)'}],
          points:[{x:Cp[0],y:Cp[1],label:'C',color:PURPLE},{x:Bp[0],y:Bp[1],label:'B',color:BLUE},{x:Ap[0],y:Ap[1],label:'A',color:BLUE}],
          labels:[{x:a/2,y:-.6,s:`a=${a}`},{x:Ap[0]/2-.4,y:Ap[1]/2,s:`b=${b}`,anchor:'end'},{x:(Ap[0]+a)/2+.3,y:Ap[1]/2,s:'c',color:ORANGE,anchor:'start'}]},
        aria:`두 변 ${a}, ${b}와 끼인각 ${c}도인 삼각형`};}},
  arithmetic:{controls:[C('a','첫째항 a',-5,10,2),C('b','공차 d',-3,4,3)],
    model:({a,b:d})=>{const terms=Array.from({length:10},(_,i)=>a+i*d);
      return {formula:`a_{n}=${num(a)}+(n−1)×${paren(d)}`,value:`a${sub(10)} = ${num(terms[9])} · S${sub(10)} = ${num(5*(2*a+9*d))}`,
        detail:`S${sub(10)}={{10×(${num(a)}+${paren(terms[9])})|2}}=${num(5*(2*a+9*d))}`,
        scene:{kind:'bars',bars:terms.map((v,i)=>({label:'a'+sub(i+1),value:v,color:BLUE}))},aria:'등차수열 첫 10개 항의 막대그래프'};}},
  geometric:{controls:[C('a','첫째항 a',1,4,1),C('b','공비 r',-2,3,2,.5)],
    model:({a,b:r})=>{const rr=r||.5;const terms=Array.from({length:7},(_,i)=>a*rr**i);
      const S=rr===1?7*a:a*(rr**7-1)/(rr-1);
      return {formula:`a_{n}=${num(a)}×${paren(rr)}^{n−1}`,value:`a${sub(7)} = ${num(terms[6])} · S${sub(7)} = ${num(S)}`,
        detail:(r===0?'공비는 0이 될 수 없어서 r=0.5로 그렸어요. ':'')+(rr<0?'공비가 음수라 부호가 번갈아 바뀌어요.':Math.abs(rr)<1?'공비의 절댓값이 1보다 작아 항이 점점 작아져요.':'항마다 '+num(rr)+'배가 돼요.'),
        scene:{kind:'bars',bars:terms.map((v,i)=>({label:'a'+sub(i+1),value:v,color:ORANGE}))},aria:'등비수열 첫 7개 항의 막대그래프'};}},
  sigma:{controls:[C('a','n',1,12,6)],
    model:({a:n})=>({formula:`∑{k=1}{${n}} k={{${n}×${n+1}|2}}`,value:`${n*(n+1)/2}`,
      detail:`같은 계단 두 개로 ${n}×${n+1} 직사각형을 만들면 넓이 ${n*(n+1)}, 그 절반이 합이에요. 참고: ∑{k=1}{${n}} k^{2}=${n*(n+1)*(2*n+1)/6}`,
      scene:{kind:'staircase',n},aria:`1부터 ${n}까지의 합을 계단 두 개로 나타낸 그림`})},
  induction:{controls:[C('a','도미노 수',5,14,10)],toggles:[{key:'t',label:'(i) n=1',options:['첫 도미노를 넘어뜨림','넘어뜨리지 않음']},{key:'u',label:'(ii) k→k+1',options:['모든 k에서 이어짐','k=4 다음이 끊김']}],
    model:({a:n,t,u})=>{const fallen=t===1?0:u===1?Math.min(4,n):n;
      return {formula:'(i) n=1에서 성립 + (ii) n=k이면 n=k+1에서 성립',value:fallen===n?`${n}개 모두 쓰러짐`:`${fallen}개만 쓰러짐`,
        detail:t===1?'출발점(i)이 없으면 아무것도 시작되지 않아요.':u===1?'(ii)가 한 곳이라도 깨지면 거기서 멈춰요.':'두 단계가 모두 성립하면 모든 자연수에서 성립해요.',
        scene:{kind:'dominoes',n,fallen,gapAt:u===1?4:undefined},aria:`도미노 ${n}개 중 ${fallen}개가 쓰러짐`};}},
  /* ───── 미적분Ⅰ ───── */
  limit:{controls:[C('a','다가가는 값 a',-3,3,1),C('b','거리 h',.05,2,1,.05)],
    model:({a,b:h})=>({formula:`f(x)={{x^{2}−${paren(a)}^{2}|${linFactor(a)}}}`,value:`f(${num(a-h)})=${num(2*a-h)},  f(${num(a+h)})=${num(2*a+h)}`,
      detail:`h가 0에 가까워질수록 두 값이 모두 ${num(2*a)}에 가까워져요. lim{x→${num(a)}} f(x)=${num(2*a)}`,
      scene:{kind:'plot',xr:[-5,5],yr:[-7,8],fns:[{f:x=>x+a,color:BLUE}],
        points:[{x:a,y:2*a,open:true,color:BLUE},{x:a-h,y:2*a-h,color:ORANGE},{x:a+h,y:2*a+h,color:GREEN}],
        segments:[{x1:a-h,y1:0,x2:a-h,y2:2*a-h,color:ORANGE,dash:true},{x1:a+h,y1:0,x2:a+h,y2:2*a+h,color:GREEN,dash:true}]},
      aria:`x=${a}에 구멍이 있는 직선 그래프`})},
  continuity:{controls:[C('a','왼쪽 식의 상수 k',-3,5,-1,.5)],
    model:({a:k})=>{const L=2+k,R=3;const cont=L===R;
      return {formula:`f(x)=x${sgn(k)} (x<2),  f(x)=x^{2}−1 (x≥2)`,value:cont?'x=2에서 연속':'x=2에서 불연속',
        detail:`좌극한 ${num(L)}, 우극한·함숫값 f(2)=${R}`+(cont?' → 모두 같아요.':' → 같지 않아 그래프가 끊어져요.'),
        scene:{kind:'plot',xr:[-2,5],yr:[-4,10],fns:[{f:x=>x+k,color:BLUE,domain:[-2,2]},{f:x=>x*x-1,color:BLUE,domain:[2,5]}],
          points:[{x:2,y:R,color:BLUE},...(cont?[]:[{x:2,y:L,open:true,color:BLUE}])]},aria:`조각 함수, x=2에서 ${cont?'연속':'불연속'}`};}},
  derivativeCoef:{controls:[C('a','접점 a',-2,2,1,.5),C('b','h',.1,2,1.5,.1)],
    model:({a,b:h})=>{const f=(x:number)=>x*x,s=2*a+h;
      return {formula:`{{f(${num(a)}+${num(h)})−f(${num(a)})|${num(h)}}}=${num(s)}`,value:`할선 기울기 ${num(s)} → 접선 기울기 f′(${num(a)})=${num(2*a)}`,
        detail:`f(x)=x²의 평균변화율은 2a+h예요. h→0이면 2a가 돼요.`,
        scene:{kind:'plot',xr:[-4,4],yr:[-2,10],fns:[{f,color:BLUE},{f:x=>f(a)+s*(x-a),color:ORANGE},{f:x=>f(a)+2*a*(x-a),color:GREEN,dash:true}],
          points:[{x:a,y:f(a),label:'A',color:BLUE},{x:a+h,y:f(a+h),label:'B',color:ORANGE}]},aria:'포물선과 할선, 접선'};}},
  derivative:{controls:[C('b','x²의 계수 b',-3,3,0),C('c','x의 계수 c',-3,3,-3)],
    model:({b,c})=>{const f=(x:number)=>x**3+b*x*x+c*x,d=(x:number)=>3*x*x+2*b*x+c;
      return {formula:`f(x)=${poly([1,b,c,0])}  →  f′(x)=${poly([3,2*b,c])}`,value:`f′(1)=${num(d(1))}`,
        detail:'파란 곡선이 올라가는 곳에서 주황 곡선 f′(x)는 x축 위에 있어요.',
        scene:{kind:'plot',xr:[-4,4],yr:[-9,9],fns:[{f,color:BLUE},{f:d,color:ORANGE}],labels:[{x:3.8,y:8.3,s:'— f(x)',color:BLUE,anchor:'end'},{x:3.8,y:7,s:'— f′(x)',color:ORANGE,anchor:'end'}]},
        aria:'삼차함수와 그 도함수의 그래프'};}},
  tangentLine:{controls:[C('a','접점의 x좌표 a',-2.5,2.5,1.5,.5)],
    model:({a})=>{const f=(x:number)=>x**3-3*x,m=3*a*a-3,k=-2*a**3;
      return {formula:`y=x^{3}−3x,  f′(${num(a)})=3×${paren(a)}^{2}−3=${num(m)}`,value:`접선 y=${term(m,'x',true)||''}${k?(m?sgn(k):num(k)):(m?'':'0')}`,
        detail:m===0?'기울기가 0이라 접선이 x축과 평행해요.':`접점 (${num(a)}, ${num(f(a))})에서 기울기 ${num(m)}`,
        scene:{kind:'plot',xr:[-3,3],yr:[-6,6],fns:[{f,color:BLUE},{f:x=>m*x+k,color:ORANGE}],points:[{x:a,y:f(a),color:ORANGE}]},aria:'삼차함수와 접선'};}},
  extrema:{controls:[C('b','x²의 계수 b',-3,3,0),C('c','x의 계수 c',-6,3,-3)],
    model:({b,c})=>{const f=(x:number)=>x**3+b*x*x+c*x,D=b*b-3*c;
      if(D<=0)return {formula:`f′(x)=${poly([3,2*b,c])}`,value:'극값 없음',detail:'f′(x)=0이 서로 다른 두 실근을 갖지 않아서 f(x)는 계속 증가해요.',
        scene:{kind:'plot',xr:[-4,4],yr:[-10,10],fns:[{f,color:BLUE}]},aria:'극값이 없는 삼차함수'};
      const x1=(-b-Math.sqrt(D))/3,x2=(-b+Math.sqrt(D))/3;
      return {formula:`f′(x)=${poly([3,2*b,c])}=0 → x≈${num(x1)}, ${num(x2)}`,value:`극댓값 ≈ ${num(f(x1))} · 극솟값 ≈ ${num(f(x2))}`,
        detail:'f′의 부호가 +→−인 곳이 극대, −→+인 곳이 극소예요.',
        scene:{kind:'plot',xr:[-4,4],yr:[-10,10],fns:[{f,color:BLUE},{f:x=>3*x*x+2*b*x+c,color:ORANGE,dash:true,faint:true}],
          points:[{x:x1,y:f(x1),label:'극대',color:RED},{x:x2,y:f(x2),label:'극소',color:GREEN}]},aria:'극대와 극소가 있는 삼차함수'};}},
  antiderivative:{controls:[C('a','적분상수 C',-4,4,0)],toggles:[{key:'t',label:'f(x)',options:['f(x)=2x','f(x)=3x²','f(x)=x²−1']}],
    model:({a:Cc,t})=>{const F=[(x:number)=>x*x,(x:number)=>x**3,(x:number)=>x**3/3-x][t];
      const names=['x^{2}','x^{3}','{{1|3}}x^{3}−x'];
      return {formula:`∫${['2x','3x^{2}','(x^{2}−1)'][t]}dx=${names[t]}+C`,value:`F(x)=${names[t]}${Cc?sgn(Cc):''}`,
        detail:'C만 다른 곡선들은 위아래로 평행이동한 모양이고, 같은 x에서 기울기가 같아요.',
        scene:{kind:'plot',xr:[-3,3],yr:[-7,8],fns:[...[-4,-2,0,2,4].filter(v=>v!==Cc).map(v=>({f:(x:number)=>F(x)+v,color:GRAY,faint:true})),{f:(x:number)=>F(x)+Cc,color:BLUE,width:3}]},
        aria:'부정적분 곡선의 모임'};}},
  definiteIntegral:{controls:[C('a','위끝 b',1,3,3,.5),C('b','직사각형 개수 n',1,40,6)],
    model:({a:B,b:n})=>{const w=B/n;let s=0;const rects=[];for(let i=1;i<=n;i++){const x=i*w;s+=x*x*w;rects.push({x:x-w,w,y0:0,y1:x*x,color:'rgba(232,137,74,.35)'});}
      const exact=B**3/3;
      return {formula:`∫{0}{${num(B)}} x^{2}dx={{${num(B)}^{3}|3}}=${Number.isInteger(B**3/3)?num(exact):frac(Math.round(B**3*8),24)}`,
        value:`직사각형 합 ≈ ${num(s,3)} · 정적분 ≈ ${num(exact,3)}`,detail:`n=${n}일 때 오차 ≈ ${num(s-exact,3)}. n을 늘리면 0에 가까워져요.`,
        scene:{kind:'plot',xr:[-.4,3.4],yr:[-.8,10],rects,fns:[{f:x=>x*x,color:BLUE}]},aria:`y=x² 아래 직사각형 ${n}개`};}},
  integralArea:{controls:[C('a','직선 기울기 m',.5,4,3,.5)],
    model:({a:m})=>({formula:`∫{0}{${num(m)}} (${num(m)}x−x^{2})dx={{${num(m)}^{3}|6}}`,value:`넓이 = ${frac(Math.round(m**3*8),48)}`,
      detail:'포물선 y=x²과 직선 y=mx는 x=0, x=m에서 만나요.',
      scene:{kind:'plot',xr:[-1,4.5],yr:[-1,16],fns:[{f:x=>x*x,color:BLUE},{f:x=>m*x,color:ORANGE}],shade:[{top:x=>m*x,bottom:x=>x*x,from:0,to:m,color:'rgba(139,92,246,.25)'}],
        points:[{x:0,y:0,color:PURPLE},{x:m,y:m*m,color:PURPLE}]},aria:'포물선과 직선 사이의 넓이'})},
  /* ───── 확률과 통계 ───── */
  repeatPerm:{controls:[C('a','고를 수 있는 종류 n',1,6,3),C('b','자리 수 r',1,6,4)],
    model:({a:n,b:r})=>({formula:`_{${n}}Π_{${r}}=${n}^{${r}}`,value:`${n**r}가지`,detail:`칸마다 ${n}가지씩, ${r}칸이므로 ${Array(r).fill(n).join('×')}`,
      scene:{kind:'slots',slots:Array.from({length:r},(_,i)=>({top:String(n),bottom:(i+1)+'번째'})),caption:`중복을 허락하여 ${r}자리 채우기`},aria:`${n}의 ${r}제곱`})},
  repeatComb:{controls:[C('a','종류 n',2,5,3),C('b','고르는 개수 r',1,8,5)],
    model:({a:n,b:r})=>{const groups=Array.from({length:n},(_,i)=>Math.floor(r/n)+(i<r%n?1:0));
      return {formula:`_{${n}}H_{${r}}=_{${n+r-1}}C_{${r}}`,value:`${nCr(n+r-1,r)}가지`,detail:`별 ${r}개와 칸막이 ${n-1}개, 모두 ${n+r-1}자리에서 칸막이 자리를 고르면 돼요. 예: ${groups.join('+')}`,
        scene:{kind:'stars',groups},aria:`별 ${r}개와 칸막이 ${n-1}개`};}},
  binomialThm:{controls:[C('a','n',1,10,5),C('b','r',0,10,2)],
    model:({a:n,b})=>{const r=Math.min(b,n);
      return {formula:`(a+b)^{${n}}의 a^{${n-r}}b^{${r}} 항`,value:`계수 _{${n}}C_{${r}} = ${nCr(n,r)}`,detail:`${n}번째 행의 수를 모두 더하면 2^{${n}}=${2**n}`,
        scene:{kind:'pascal',n,r},aria:`파스칼의 삼각형 ${n}행 ${r}번째`};}},
  probAdd:{controls:[C('a','P(A) (%)',0,100,50,5),C('b','P(B) (%)',0,100,40,5),C('c','P(A∩B) (%)',0,100,20,5)],
    model:({a,b,c})=>{const bb=Math.max(Math.max(0,a+b-100),Math.min(c,a,b));
      return {formula:`P(A∪B)=${num(a/100)}+${num(b/100)}−${num(bb/100)}`,value:`P(A∪B) = ${num((a+b-bb)/100)}`,
        detail:(c!==bb?'가능한 범위에 맞도록 P(A∩B)를 '+num(bb/100)+'(으)로 맞췄어요. ':'')+`여사건: P((A∪B)^{C})=${num(1-(a+b-bb)/100)}`,
        scene:{kind:'venn',a,b,both:bb,labels:['A','B'],prob:true},aria:'확률 벤 다이어그램'};}},
  conditional:{controls:[C('a','P(A) (%)',10,90,40,5),C('b','P(B|A) (%)',0,100,75,5),C('c','P(B|Aᶜ) (%)',0,100,25,5)],
    model:({a,b,c})=>{const pA=a/100,pAB=pA*b/100,pB=pAB+(1-pA)*c/100;
      return {formula:`P(A∩B)=P(A)P(B|A)=${num(pA)}×${num(b/100)}=${num(pAB,3)}`,value:`P(B)=${num(pB,3)} · P(A|B)=${pB?num(pAB/pB,3):'—'}`,
        detail:b===c?'P(B|A)=P(B|Aᶜ)이면 A와 B는 서로 독립이에요.':'P(A|B)는 B 전체 중 A∩B가 차지하는 비율이에요.',
        scene:{kind:'areaModel',pA,pBA:b/100,pBnA:c/100},aria:'조건부확률 넓이 모형'};}},
  binomialDist:{controls:[C('a','시행 횟수 n',1,20,10),C('b','성공 확률 p',.1,.9,.3,.1)],
    model:({a:n,b:p})=>{const bars=Array.from({length:n+1},(_,k)=>({label:String(k),value:nCr(n,k)*p**k*(1-p)**(n-k),color:BLUE}));
      return {formula:`X~B(${n}, ${num(p,1)}),  P(X=r)=_{${n}}C_{r}(${num(p,1)})^{r}(${num(1-p,1)})^{${n}−r}`,value:`E(X)=${num(n*p)} · V(X)=${num(n*p*(1-p))}`,
        detail:`σ(X)=√${num(n*p*(1-p))}≈${num(Math.sqrt(n*p*(1-p)))}`,scene:{kind:'bars',bars,caption:'성공 횟수 X의 확률'},aria:`이항분포 B(${n}, ${p})`};}},
  normalDist:{controls:[C('a','평균 m',30,70,50,5),C('b','표준편차 σ',2,10,5),C('c','기준값 (m+kσ)의 k',-3,3,1,.5)],
    model:({a:m,b:s,c:k})=>{const x=m+k*s,pdf=(t:number)=>Math.exp(-(((t-m)/s)**2)/2)/(s*Math.sqrt(2*Math.PI));
      return {formula:`P(X≤${num(x)})=P(Z≤{{${num(x)}−${m}|${s}}})=P(Z≤${num(k)})`,value:`≈ ${num(phi(k),4)}`,
        detail:`Z={{X−m|σ}}로 표준화하면 m, σ와 상관없이 같은 표준정규분포표를 쓸 수 있어요.`,
        scene:{kind:'plot',xr:[0,100],yr:[-.01,Math.max(.06,1.2/(s*Math.sqrt(2*Math.PI)))],hideYTicks:true,xticks:[0,20,40,60,80,100].map(v=>({v,label:String(v)})),
          fns:[{f:pdf,color:BLUE}],shade:[{top:pdf,bottom:()=>0,from:0,to:x,color:'rgba(77,99,216,.22)'}],vlines:[{x,color:ORANGE}]},aria:`정규분포 N(${m}, ${s}²) 곡선`};}},
  estimation:{controls:[C('a','표본 크기 n',4,400,100,1,{options:[4,9,16,25,36,49,64,100,144,196,256,400]}),C('b','모표준편차 σ',2,20,10)],
    toggles:[{key:'t',label:'신뢰도',options:['95%','99%']}],
    model:({a:n,b:s,t})=>{const z=t?2.58:1.96,se=s/Math.sqrt(n),xb=50,lo=xb-z*se,hi=xb+z*se;
      const pdf=(x:number)=>Math.exp(-(((x-xb)/se)**2)/2)/(se*Math.sqrt(2*Math.PI));
      return {formula:`x̄=50,  σ(X̄)={{${s}|√${n}}}=${num(se,3)}`,value:`${num(lo,2)} ≤ m ≤ ${num(hi,2)}`,
        detail:`구간의 길이 2×${z}×{{σ|√n}}≈${num(2*z*se,2)} · n을 4배로 하면 절반이 돼요.`,
        scene:{kind:'plot',xr:[30,70],yr:[-.02,Math.max(.25,pdf(xb)*1.1)],hideYTicks:true,xticks:[30,40,50,60,70].map(v=>({v,label:String(v)})),
          fns:[{f:pdf,color:BLUE}],intervals:[{from:lo,to:hi,closedL:true,closedR:true,color:ORANGE}]},aria:`신뢰구간 ${lo}부터 ${hi}`};}},
};
