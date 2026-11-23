import {useState} from 'react';
import PrimeFactorLab from './PrimeFactorLab.tsx';
import FoundationLab,{isFoundationTopic} from './FoundationLabs.tsx';
import {type MiddleTopic} from './curriculum.ts';

type Control={label:string;min:number;max:number;step?:number;initial:number};
type LabConfig={a:Control;b?:Control};
const C=(label:string,min:number,max:number,initial:number,step=1):Control=>({label,min,max,initial,step});
const controls:Record<MiddleTopic,LabConfig>={
  primes:{a:C('소인수분해할 자연수',12,96,36),b:C('나눠볼 소수',2,7,2)},
  integers:{a:C('수직선 시작점',-9,9,-3),b:C('이동할 정수',-9,9,5)},
  expressions:{a:C('x의 계수',1,8,3),b:C('상수항',-6,8,2)},
  equations:{a:C('x의 계수',1,8,3),b:C('상수항',-5,10,2)},
  coordinates:{a:C('x좌표',-8,8,3),b:C('y좌표',-8,8,4)},
  proportion:{a:C('비례상수',-5,6,2),b:C('x값',-6,6,3)},
  angles:{a:C('한 각의 크기',10,170,65,5)},
  polygons:{a:C('다각형의 변 개수',3,12,5)},
  sectors:{a:C('원의 반지름 (cm)',2,9,5),b:C('부채꼴 중심각 (°)',15,345,90,15)},
  solids:{a:C('원기둥 반지름 (cm)',1,8,4),b:C('높이 (cm)',1,12,6)},
  statistics:{a:C('첫 계급의 도수',1,12,4),b:C('둘째 계급의 도수',1,12,8)},
  recurring:{a:C('분모',2,15,7),b:C('분자',1,8,1)},
  exponents:{a:C('밑 (자연수)',2,6,2),b:C('지수',1,6,4)},
  inequalities:{a:C('부등식 경계값',-9,9,3),b:C('방향: 음수/양수',-1,1,1,2)},
  systems:{a:C('첫 직선 기울기',-4,5,2),b:C('첫 직선 절편',-6,6,1)},
  linearFunction:{a:C('기울기 a',-5,5,2),b:C('y절편 b',-8,8,3)},
  functionIntersection:{a:C('첫 번째 직선 기울기',-4,5,2),b:C('첫 번째 직선 절편',-6,6,1)},
  triangles:{a:C('두 밑각 크기 (°)',15,70,55,5),b:C('삼각형 크기',3,9,5)},
  quadrilaterals:{a:C('한 내각 크기 (°)',20,160,65,5),b:C('평행사변형 밑변',2,10,6)},
  similarity:{a:C('닮음비 (배)',1,4,2,0.5),b:C('원래 길이 (cm)',2,9,5)},
  pythagoras:{a:C('첫 직각변 (cm)',1,12,3),b:C('둘째 직각변 (cm)',1,12,4)},
  counting:{a:C('첫 번째 선택 개수',2,8,3),b:C('두 번째 선택 개수',2,8,4)},
  probability:{a:C('빨간 구슬 수',1,12,3),b:C('파란 구슬 수',1,12,5)},
  roots:{a:C('정사각형 한 변',1,12,5)},
  radicals:{a:C('근호 밖에 나올 수',1,8,3),b:C('근호 안 남을 수',2,7,2)},
  polynomial:{a:C('첫 번째 증가량 a',1,8,2),b:C('두 번째 증가량 b',1,8,3)},
  factoring:{a:C('첫 번째 인수의 상수',1,8,2),b:C('두 번째 인수의 상수',1,8,3)},
  quadraticEquation:{a:C('첫 번째 근',-7,7,2),b:C('두 번째 근',-7,7,5)},
  quadraticFunction:{a:C('포물선의 열림과 폭 a',-4,4,1),b:C('꼭짓점의 x좌표 p',-5,5,2)},
  trigonometry:{a:C('각 θ (°)',10,80,30,5),b:C('빗변의 길이',2,10,6)},
  circleTheorem:{a:C('중심각 (°)',20,160,120,10),b:C('반지름 (cm)',2,8,5)},
  dispersion:{a:C('값들의 퍼짐 간격',1,9,3),b:C('자료의 평균',-4,12,6)},
  boxplot:{a:C('자료들의 간격',1,8,2),b:C('시작 값',0,15,2)},
  scatter:{a:C('변화 방향과 기울기',-5,5,2),b:C('전체 위치 이동',-5,5,1)},
};
const format=(n:number,precision=2)=>Math.round(n*10**precision)/10**precision;
const signed=(n:number)=>n<0?' − '+(-n):' + '+n;
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);
const primeFactors=(n:number)=>{
  let x=n;const factors:number[]=[];
  for(let k=2;k*k<=x;k++)while(x%k===0){factors.push(k);x/=k;}
  if(x>1)factors.push(x);
  return factors.join('×');
};
function repeating(n:number,d:number):string{
  let integer=Math.floor(n/d),r=n%d,digits='';
  const seen=new Map<number,number>();
  while(r&&digits.length<25){
    if(seen.has(r)){
      const at=seen.get(r)!;
      return integer+'.'+digits.slice(0,at)+'('+digits.slice(at)+')';
    }
    seen.set(r,digits.length);r*=10;
    digits+=Math.floor(r/d);r%=d;
  }
  return integer+'.'+(digits||'0');
}
type Visual='line'|'polygon'|'sector'|'triangle'|'bars'|'grid'|'parabola'|'number'|'scatter'|'circle'|'balance'|
  'isosceles'|'parallelogram'|'similar'|'area'|'cylinder'|'boxplot'|'rightTriangle';
type Model={formula:string;detail:string;value:string;visual:Visual;
  graphA?:number;graphB?:number;graphC?:number};
function describe(topic:MiddleTopic,a:number,b:number,inverse=false):Model{
  const m=(formula:string,value:string,detail:string,visual:Visual,graphA?:number,graphB?:number,graphC?:number)=>
    ({formula,value,detail,visual,graphA,graphB,graphC});
  switch(topic){
    case 'primes':return m(a+' = '+primeFactors(a),'소인수 '+primeFactors(a),
      a+'을 '+b+'로 나눈 나머지는 '+(a%b)+'입니다. 나머지가 0이면 '+b+'는 약수입니다.','grid');
    case 'integers':return m(a+' + ('+b+') = '+(a+b),'결과 '+(a+b),
      '수직선에서 시작점 '+a+'에서 '+(b>=0?'오른쪽':'왼쪽')+'으로 '+Math.abs(b)+'칸 이동해 보세요.','number',a,b);
    case 'expressions':return m(a+'x'+signed(b)+' (x=3) = '+(a*3+b),
      '식의 값 '+(a*3+b),'x에 3을 넣어 대입하면 '+a+'×3'+signed(b)+'가 됩니다.','balance',a,b);
    case 'equations':return m(a+'x'+signed(b)+' = 24','x = '+format((24-b)/a),
      '양쪽에서 '+b+'를 빼고 '+a+'로 나누면 x=(24−'+b+')/'+a+'입니다.','balance',a,b);
    case 'coordinates':return m('P = ('+a+', '+b+')','x='+a+' · y='+b,
      '점은 x축으로 '+a+', y축으로 '+b+'에 있으며 축 위의 점은 사분면에 포함되지 않습니다.','line',a,b);
    case 'proportion':return inverse?
      m('y='+a+'/x · x='+b,b===0?'x=0에서 정의되지 않음':'y='+format(a/b),
        '반비례에서 두 값의 곱 xy는 '+a+'로 일정하며 x=0은 정의역에서 제외됩니다.','line',a,b):
      m('y='+a+'x · x='+b,'y='+(a*b),
        '정비례 그래프는 원점을 지나며 x가 1 늘 때 y는 '+a+'만큼 변합니다.','line',a,0);
    case 'angles':return m(a+'° + '+(180-a)+'° = 180°','나머지 각 '+(180-a)+'°',
      '직선 위 이웃한 두 각의 합은 항상 180°예요.','sector',a,1);
    case 'polygons':return m('('+a+'−2)×180° = '+((a-2)*180)+'°','내각의 합 '+((a-2)*180)+'°',
      '한 꼭짓점에서 삼각형 '+(a-2)+'개로 나누어 보세요.','polygon',a);
    case 'sectors':return m('π×'+a+'²×'+b+'/360','넓이 ≈ '+format(Math.PI*a*a*b/360)+' cm²',
      '전체 원 넓이의 '+format(b/360*100,1)+'%입니다.','sector',b,a);
    case 'solids':return m('π×'+a+'²×'+b,'부피 ≈ '+format(Math.PI*a*a*b)+' cm³',
      '반지름을 두 배 늘리면 밑넓이와 부피는 네 배가 돼요.','cylinder',a,b);
    case 'statistics':return m(a+' + '+b+' + 5 = '+(a+b+5),'전체 도수 '+(a+b+5),
      '전체 도수로 나누면 첫 계급의 상대도수는 '+format(a/(a+b+5),3)+'입니다.','bars',a,b);
    case 'recurring':return m(b+'/'+a+' = '+repeating(b,a),repeating(b,a),
      '나눗셈의 나머지가 다시 나타나면 그때부터 같은 소수 자리가 반복됩니다.','number',a,b);
    case 'exponents':return m(a+'^'+b+' = '+Math.pow(a,b),String(Math.pow(a,b)),
      '밑 '+a+'를 '+b+'번 곱한 값입니다. 지수법칙에서는 곱할 때 지수를 더해요.','grid',a,b);
    case 'inequalities':return m(b<0?'−x > '+(-a):'x > '+a,b<0?'x < '+a:'x > '+a,
      '음수로 곱하거나 나눌 때 부등호 방향이 뒤집히며 경계점은 제외해요.','number',a,b);
    case 'systems':{
      const x=format((2-b)/(a+1));return m('y='+a+'x'+signed(b)+' · y=−x+2',
        a===-1?(b===2?'두 직선이 일치':'교점 없음'):'교점 x≈'+x,
        '두 식의 y값을 같게 놓고 풀면 '+(a+1)+'x='+(2-b)+'입니다.','line',a,b,2);
    }
    case 'linearFunction':return m('y = '+a+'x'+signed(b),'기울기 '+a+' · y절편 '+b,
      'a가 기울기, b가 y절편이에요. a=0이면 상수함수가 됩니다.','line',a,b);
    case 'functionIntersection':return m('y='+a+'x'+signed(b)+' · y=−x+4',
      a===-1?(b===4?'모든 점이 공통':'교점 없음'):'교점 x≈'+format((4-b)/(a+1)),
      '두 직선의 y를 같게 하여 ('+(a+1)+')x='+(4-b)+'를 풀어보세요.','line',a,b,4);
    case 'triangles':return m('180° − 2×'+a+'°','꼭지각 '+(180-2*a)+'°',
      '이등변삼각형은 밑각이 같으므로 남은 꼭지각을 구할 수 있어요.','isosceles',a,b);
    case 'quadrilaterals':return m(a+'° + '+(180-a)+'° = 180°','이웃각 '+(180-a)+'°',
      '평행사변형에서 이웃각은 합이 180°이며 마주 보는 각이 같아요.','parallelogram',a,b);
    case 'similarity':return m(b+'×'+a+' = '+(b*a),'큰 도형의 변 '+(b*a)+' cm',
      '닮음비 '+a+':1이면 넓이비는 '+(a*a)+':1입니다.','similar',a,b);
    case 'pythagoras':return m(a+'² + '+b+'² = '+(a*a+b*b),
      '빗변 ≈ '+format(Math.hypot(a,b))+' cm',
      '두 직각변 위 정사각형 넓이의 합은 빗변 위 정사각형 넓이와 같아요.','rightTriangle',a,b);
    case 'counting':return m(a+' × '+b+' = '+(a*b),'조합 '+(a*b)+'가지',
      '첫 선택마다 두 번째 선택의 '+b+'가지가 있어 모든 경우를 곱해요.','grid',a,b);
    case 'probability':return m(a+'/'+(a+b),'빨강 확률 '+format(a/(a+b)*100,1)+'%',
      '전체 '+(a+b)+'개 중 빨강 '+a+'개입니다. 반복 시행 결과와 비교해 보세요.','bars',a,b);
    case 'roots':return m('√'+(a*a)+' = '+a,'제곱근 ±'+a,
      '정사각형의 넓이가 '+(a*a)+'일 때 한 변은 '+a+'이고, '+(a*a)+'의 제곱근은 ±'+a+'입니다.','grid',a,a);
    case 'radicals':return m('√('+a+'²×'+b+') = '+a+'√'+b,a+'√'+b,
      '완전제곱수 '+a*a+'를 근호 밖으로 꺼내세요.','grid',a,b);
    case 'polynomial':return m('(x+'+a+')(x+'+b+') = x²+'+(a+b)+'x+'+(a*b),
      'x의 계수 '+(a+b)+' · 상수항 '+(a*b),
      '직사각형을 x², '+a+'x, '+b+'x, '+(a*b)+'로 나누면 분배법칙이 보입니다.','area',a,b);
    case 'factoring':return m('x²+'+(a+b)+'x+'+(a*b)+' = (x+'+a+')(x+'+b+')',
      '합 '+(a+b)+' · 곱 '+(a*b),
      '합이 '+(a+b)+', 곱이 '+(a*b)+'인 두 수를 이용해 인수분해해요.','area',a,b);
    case 'quadraticEquation':return m('(x−'+a+')(x−'+b+') = 0',
      '해 x='+a+' 또는 '+b,
      '곱이 0이 되는 조건으로 두 일차식 중 하나가 0이면 됩니다.','parabola',a+b,-a*b,1);
    case 'quadraticFunction':return m('y='+a+'(x−'+b+')²+2',
      '꼭짓점 ('+b+', 2)',
      a>0?'위로 열리고 최솟값이 2예요.':a<0?'아래로 열리고 최댓값이 2예요.':'a=0인 경우 이차함수가 아니므로 계수를 조절하세요.',
      'parabola',a,b,2);
    case 'trigonometry':return m('sin'+a+'° ≈ '+format(Math.sin(a*Math.PI/180),3),
      '맞은편 변 ≈ '+format(b*Math.sin(a*Math.PI/180))+' cm',
      '같은 각에서는 직각삼각형의 크기와 관계없이 sin값이 같습니다.','triangle',a,b);
    case 'circleTheorem':return m('중심각 '+a+'° → 원주각 '+format(a/2)+'°',
      '원주각 '+format(a/2)+'°',
      '같은 호에 대한 원주각은 중심각의 절반이에요.','circle',a,b);
    case 'dispersion':return m('자료: '+(b-a)+', '+b+', '+(b+a),
      '평균 '+b+' · 분산 '+format(2*a*a/3),
      '편차는 −'+a+', 0, +'+a+'로 합이 0이고 분산은 편차 제곱의 평균이에요.','bars',a,b);
    case 'boxplot':return m('자료: '+Array.from({length:8},(_,i)=>b+i*a).join(', '),
      '중앙값 '+format(b+3.5*a)+' · 사분위범위 '+format(4*a),
      '작은 쪽 네 값과 큰 쪽 네 값의 중앙값으로 Q1, Q3를 정해요.','boxplot',a,b);
    case 'scatter':return m('y = '+a+'x'+signed(b),
      a>0?'양의 상관관계':a<0?'음의 상관관계':'선형 상관관계 없음',
      '기울기가 양수면 오른쪽으로 갈수록 점이 올라가고 음수면 내려가요.','scatter',a,b);
  }
}
const toGraph=(x:number,y:number)=>({x:206+x*12,y:136-y*12});
const pointsToLine=(f:(x:number)=>number)=>{
  const pts:string[]=[];let inSegment=false;
  for(let x=-11;x<=11;x+=.2){
    const y=f(x);
    if(Number.isFinite(y)&&Math.abs(y)<=80){
      const p=toGraph(x,y);
      pts.push((inSegment?'L':'M')+p.x.toFixed(1)+','+p.y.toFixed(1));
      inSegment=true;
    }else inSegment=false;
  }
  return pts.join(' ');
};
function Visual({topic,model,a,b,inverse=false}:{topic:MiddleTopic;model:Model;a:number;b:number;inverse?:boolean}){
  const axes=<>
    <line x1="12" y1="136" x2="400" y2="136" stroke="#9baaca" strokeWidth="1.8"/>
    <line x1="206" y1="12" x2="206" y2="264" stroke="#9baaca" strokeWidth="1.8"/>
    {[-10,-8,-6,-4,-2,2,4,6,8,10].map(x=><line key={'x'+x} x1={206+x*12} y1="133" x2={206+x*12} y2="139" stroke="#aebad3"/>)}
    {[-10,-8,-6,-4,-2,2,4,6,8,10].map(y=><line key={'y'+y} x1="203" y1={136-y*12} x2="209" y2={136-y*12} stroke="#aebad3"/>)}
    <text x="387" y="153" fontSize="11" fill="#6f7899">x</text><text x="215" y="22" fontSize="11" fill="#6f7899">y</text>
  </>;
  if(model.visual==='line'||model.visual==='parabola'||model.visual==='scatter'){
    const p=toGraph(a,b);
    let fn:(x:number)=>number;
    if(topic==='coordinates')fn=()=>NaN;
    else if(topic==='systems'||topic==='functionIntersection')fn=x=>a*x+b;
    else if(topic==='proportion')fn=inverse?(x=>x===0?NaN:a/x):(x=>a*x);
    else if(topic==='quadraticFunction')fn=x=>a*(x-b)*(x-b)+2;
    else if(topic==='quadraticEquation')fn=x=>(x-a)*(x-b);
    else fn=x=>a*x+b;
    return <svg viewBox="0 0 412 272" role="img" aria-label="계수를 조절하면 즉시 변화하는 좌표평면과 수학 그래프" className="middle-svg">
      {axes}
      {topic==='coordinates'?<circle cx={p.x} cy={p.y} r="8" fill="#5368e8" stroke="#fff" strokeWidth="3"/>:topic==='scatter'?<>
        {Array.from({length:9},(_,i)=>i-4).map((x,i)=>{
          const point=toGraph(x,(a*x+b)+Math.sin(i*3)*.6);
          return <circle key={i} cx={point.x} cy={point.y} r="6" fill="#5368e8" fillOpacity=".88"/>;
        })}
      </>:<>
        <path d={pointsToLine(fn)} stroke="#5267e8" strokeWidth="3.5" fill="none" clipPath="url(#middle-graph-clip)"/>
        {(topic==='systems'||topic==='functionIntersection')&&<path d={pointsToLine(x=>-x+(topic==='systems'?2:4))} stroke="#ef9958" strokeWidth="3" fill="none" strokeDasharray="7 4"/>}
      </>}
      <defs><clipPath id="middle-graph-clip"><rect x="8" y="8" width="396" height="255"/></clipPath></defs>
      <text x="15" y="23" fill="#5969aa" fontSize="12" fontWeight="700">{model.value}</text>
    </svg>;
  }
  if(topic==='angles'){
    const radius=89,cx=205,cy=157,t=(180-a)*Math.PI/180;
    const endX=cx-radius*Math.cos(t),endY=cy-radius*Math.sin(t);
    return <svg viewBox="0 0 412 272" role="img" aria-label="직선 위에 이웃한 두 각을 나타내는 동적인 도형" className="middle-svg">
      <line x1="40" y1={cy} x2="374" y2={cy} stroke="#6272a0" strokeWidth="3"/>
      <line x1={cx} y1={cy} x2={endX} y2={endY} stroke="#5369d7" strokeWidth="4"/>
      <circle cx={cx} cy={cy} r="5" fill="#293f9b"/>
      <text x="79" y="185" fontSize="15" fill="#566b9c">180°</text>
      <text x="212" y="112" fontSize="17" fill="#435aba" fontWeight="850">{a}° + {180-a}°</text>
      <text x="212" y="232" fontSize="13" fill="#7386a6">두 각을 합하면 직선각 180°</text>
    </svg>;
  }
  if(model.visual==='sector'||model.visual==='circle'){
    const degree=topic==='circleTheorem'?a:b;
    const r=topic==='sectors'?45+a*7:45+b*7,center=205,cy=138;
    const t=degree*Math.PI/180;
    const endX=center+r*Math.cos(-t),endY=cy+r*Math.sin(-t);
    const path='M'+center+' '+cy+' L'+(center+r)+' '+cy+' A'+r+' '+r+' 0 '+(degree>180?1:0)+' 0 '+endX+' '+endY+' Z';
    return <svg viewBox="0 0 412 272" role="img" aria-label="중심각 크기에 따라 움직이는 부채꼴" className="middle-svg">
      <circle cx={center} cy={cy} r={r} fill="#f5f8ff" stroke="#8c9bdd" strokeWidth="2"/>
      <path d={path} fill="#91a2f0" fillOpacity=".72" stroke="#465fca" strokeWidth="2"/>
      <circle cx={center} cy={cy} r="4" fill="#273b85"/>
      {topic==='circleTheorem'&&(()=>{
        const px=center-r,py=cy;
        return <g><line x1={px} y1={py} x2={center+r} y2={cy} stroke="#e88a55" strokeWidth="2.5"/>
          <line x1={px} y1={py} x2={endX} y2={endY} stroke="#e88a55" strokeWidth="2.5"/>
          <circle cx={px} cy={py} r="5" fill="#e88a55"/>
          <text x="40" y="235" fill="#bc724d" fontSize="13">원주각 {format(degree/2)}°</text></g>;
      })()}
      <text x="220" y="155" fontSize="18" fill="#30428b" fontWeight="800">{degree}°</text>
      <text x="122" y="260" fontSize="12" fill="#7885a3">반지름 {topic==='sectors'?a:b}cm · 중심각 {degree}°</text>
    </svg>;
  }
  if(model.visual==='polygon'){
    const sides=topic==='quadrilaterals'||topic==='similarity'?4:a;
    const r=Math.min(100,65+(topic==='similarity'?a*9:0));
    const polygon=Array.from({length:sides},(_,i)=>{
      const t=2*Math.PI*i/sides-Math.PI/2;
      return (205+r*Math.cos(t)).toFixed(1)+','+(138+r*Math.sin(t)).toFixed(1);
    }).join(' ');
    return <svg viewBox="0 0 412 272" role="img" aria-label="변의 수와 크기가 조절되는 다각형" className="middle-svg">
      <polygon points={polygon} fill="#dce3ff" stroke="#566dde" strokeWidth="3" strokeLinejoin="round"/>
      {sides>=4&&Array.from({length:sides-3},(_,i)=>{
        const t=2*Math.PI*(i+2)/sides-Math.PI/2;
        return <line key={i} x1={205+r*Math.cos(-Math.PI/2)}
          y1={138+r*Math.sin(-Math.PI/2)} x2={205+r*Math.cos(t)}
          y2={138+r*Math.sin(t)} stroke="#eaa365" strokeDasharray="5 4" strokeWidth="1.5"/>;
      })}
      <circle cx="205" cy="138" r="4" fill="#364eaf"/>
      <text x="163" y="143" fontSize="16" fontWeight="800" fill="#4c60ba">{sides-2}개 삼각형</text>
    </svg>;
  }


  if(model.visual==='balance'){
    const left=topic==='equations'?a:3*a;
    return <svg viewBox="0 0 412 272" role="img" aria-label="문자를 대입하고 양변을 같은 연산으로 다루는 수식 저울" className="middle-svg">
      <rect x="48" y="90" width="145" height="115" rx="12" fill="#e4eaff" stroke="#586fdc" strokeWidth="2"/>
      <rect x="219" y="90" width="145" height="115" rx="12" fill="#e4f3ed" stroke="#40a48a" strokeWidth="2"/>
      <line x1="205" y1="40" x2="205" y2="236" stroke="#b8c2dd" strokeWidth="3"/>
      <text x="120" y="130" textAnchor="middle" fontSize="22" fill="#4157b7">{topic==='equations'?a+'x':a+'×3'}</text>
      <text x="120" y="171" textAnchor="middle" fontSize="18" fill="#4157b7">{b>=0?'+':'−'} {Math.abs(b)}</text>
      <text x="291" y="149" textAnchor="middle" fontSize="17" fill="#258771" fontWeight="800">
        {topic==='equations'?'24':3*a+b}</text>
      <text x="206" y="261" textAnchor="middle" fontSize="13" fill="#7785a5">{model.value}</text>
    </svg>;
  }
  if(topic==='roots'){
    const size=Math.min(20,185/a),left=110,top=32;
    return <svg viewBox="0 0 412 272" role="img" aria-label="한 변의 길이에 따라 격자 넓이가 제곱으로 증가하는 정사각형" className="middle-svg">
      {Array.from({length:a*a},(_,i)=><rect key={i} x={left+(i%a)*size}
        y={top+Math.floor(i/a)*size} width={size} height={size} fill={i%2?'#f6ddb1':'#b8c7f8'}
        stroke="#fff" strokeWidth="1"/>)}
      <text x="205" y="250" textAnchor="middle" fontSize="16" fill="#5267b7" fontWeight="800">
        {a} × {a} = {a*a}칸
      </text>
    </svg>;
  }

  if(model.visual==='isosceles'){
    const halfWidth=40+b*5,height=halfWidth*Math.tan(a*Math.PI/180);
    return <svg viewBox="0 0 412 272" role="img" aria-label="두 밑각이 같은 이등변삼각형" className="middle-svg">
      <polygon points={(205-halfWidth)+',238 '+(205+halfWidth)+',238 205,'+(238-height)} fill="#ddf2f0" stroke="#349982" strokeWidth="3"/>
      <line x1="205" y1="238" x2="205" y2={238-height} stroke="#7bbcaf" strokeDasharray="6 5"/>
      <text x="109" y="219" fill="#257e71" fontWeight="750">{a}°</text>
      <text x="273" y="219" fill="#257e71" fontWeight="750">{a}°</text>
      <text x="182" y={258-height} fill="#257e71" fontWeight="900">{180-2*a}°</text>
    </svg>;
  }
  if(model.visual==='parallelogram'){
    const base=40+b*16,theta=a*Math.PI/180;
    const dx=75*Math.cos(theta),dy=100*Math.sin(theta);
    const x=110,y=230;
    const pts=[x+','+y,(x+base)+','+y,(x+base+dx)+','+(y-dy),(x+dx)+','+(y-dy)].join(' ');
    return <svg viewBox="0 0 412 272" role="img" aria-label="이웃각과 길이가 변하는 평행사변형" className="middle-svg">
      <polygon points={pts} fill="#e1e8ff" stroke="#536cdb" strokeWidth="3"/>
      <path d={'M'+(x+22)+' '+y+' A22 22 0 0 0 '+(x+22*Math.cos(theta))+' '+(y-22*Math.sin(theta))}
        stroke="#f1a462" strokeWidth="3" fill="none"/>
      <text x={x+32} y={y-16} fill="#5565b0" fontWeight="800">{a}°</text>
      <text x={x+base-42} y={y-16} fill="#5565b0" fontWeight="800">{180-a}°</text>
    </svg>;
  }
  if(model.visual==='similar'){
    const base=39,large=base*a;
    return <svg viewBox="0 0 412 272" role="img" aria-label="닮음비에 따라 동시에 변하는 두 정사각형" className="middle-svg">
      <rect x="42" y={223-base} width={base} height={base} stroke="#3e9c82" strokeWidth="3" fill="#dcf5eb"/>
      <rect x="160" y={223-large} width={large} height={large} stroke="#556ddd" strokeWidth="3" fill="#e1e7ff"/>
      <text x="43" y="245" fontSize="13" fill="#3e9c82">1배</text>
      <text x="165" y="245" fontSize="13" fill="#4b5db3">{a}배 · 넓이 {a*a}배</text>
      <text x="26" y="36" fontSize="14" fill="#71809e">길이비 1 : {a}</text>
    </svg>;
  }
  if(model.visual==='area'){
    const x=110,y=38,base=110,wb=b*13,ha=a*13;
    return <svg viewBox="0 0 412 272" role="img" aria-label="곱셈공식과 인수분해를 네 영역으로 나누는 넓이 모형" className="middle-svg">
      <rect x={x} y={y} width={base} height={base} fill="#dce5ff" stroke="#5971e0" strokeWidth="2"/>
      <rect x={x+base} y={y} width={wb} height={base} fill="#fce8ce" stroke="#edb568" strokeWidth="2"/>
      <rect x={x} y={y+base} width={base} height={ha} fill="#dbf3e9" stroke="#60bb9b" strokeWidth="2"/>
      <rect x={x+base} y={y+base} width={wb} height={ha} fill="#f7dff0" stroke="#d78cb7" strokeWidth="2"/>
      <text x={x+base/2} y={y+base/2} textAnchor="middle" fontSize="18" fill="#4b5fb2">x²</text>
      <text x={x+base+wb/2} y={y+base/2} textAnchor="middle" fontSize="15" fill="#946d38">{b}x</text>
      <text x={x+base/2} y={y+base+ha/2} textAnchor="middle" fontSize="15" fill="#2e8f73">{a}x</text>
      <text x={x+base+wb/2} y={y+base+ha/2} textAnchor="middle" fontSize="14" fill="#99517e">{a*b}</text>
      <text x={x+base/2} y="26" fontSize="12" fill="#4b59aa">x</text>
      <text x={x+base+wb/2} y="26" fontSize="12" fill="#9a6d31">{b}</text>
    </svg>;
  }
  if(model.visual==='cylinder'){
    const r=25+a*5,height=70+b*8,cx=205,topY=230-height;
    return <svg viewBox="0 0 412 272" role="img" aria-label="반지름과 높이에 따라 부피가 변하는 원기둥" className="middle-svg">
      <path d={'M'+(cx-r)+' '+topY+' V230 A'+r+' '+(r/3)+' 0 0 0 '+(cx+r)+' 230 V'+topY}
        fill="#e0e8ff" stroke="#5268d5" strokeWidth="2.5"/>
      <ellipse cx={cx} cy={topY} rx={r} ry={r/3} fill="#bcc9f8" stroke="#5368d5" strokeWidth="2.5"/>
      <ellipse cx={cx} cy="230" rx={r} ry={r/3} fill="#8499e6" stroke="#5368d5" strokeWidth="2.5"/>
      <line x1={cx} y1={topY} x2={cx+r} y2={topY} stroke="#f5a967" strokeWidth="2.5" strokeDasharray="5 3"/>
      <text x={cx+15} y={topY-7} fill="#b36a38" fontSize="13">r={a}</text>
      <text x={cx+r+6} y={(topY+230)/2} fontSize="12" fill="#5265b7">h={b}</text>
    </svg>;
  }
  if(model.visual==='boxplot'){
    const values=Array.from({length:8},(_,i)=>b+i*a);
    const at=(n:number)=>40+n/80*330;
    const left=at(values[0]),right=at(values[7]);
    const q1=(values[1]+values[2])/2,median=(values[3]+values[4])/2,q3=(values[5]+values[6])/2;
    return <svg viewBox="0 0 412 272" role="img" aria-label="최솟값 사분위수 중앙값 최댓값을 표시한 상자그림" className="middle-svg">
      <line x1={left} y1="140" x2={right} y2="140" stroke="#536cdd" strokeWidth="3"/>
      <line x1={left} y1="113" x2={left} y2="167" stroke="#536cdd" strokeWidth="3"/>
      <line x1={right} y1="113" x2={right} y2="167" stroke="#536cdd" strokeWidth="3"/>
      <rect x={at(q1)} y="94" width={at(q3)-at(q1)} height="92" fill="#e4eaff" stroke="#536cdd" strokeWidth="3"/>
      <line x1={at(median)} y1="94" x2={at(median)} y2="186" stroke="#f19d57" strokeWidth="4"/>
      {[[left,'최솟값'],[at(q1),'Q1'],[at(median),'중앙값'],[at(q3),'Q3'],[right,'최댓값']].map(([x,label],i)=>
        <text key={i} x={Number(x)} y={i%2===0?82:206} textAnchor="middle" fontSize="11" fill="#52619d">{label}</text>)}
      <text x="206" y="245" textAnchor="middle" fontSize="12" fill="#7282a8">상자 너비는 사분위범위 (Q3 − Q1)</text>
    </svg>;
  }
  if(model.visual==='rightTriangle'){
    const scale=4.5,px=170,py=173;
    const ax=a*scale,by=b*scale;
    const p=[px,py],q=[px+ax,py],r=[px,py-by],offset=[by,-ax];
    const poly=(pts:number[][])=>pts.map(pt=>pt.join(',')).join(' ');
    const center=(pts:number[][])=>[pts.reduce((v,pt)=>v+pt[0],0)/pts.length,
      pts.reduce((v,pt)=>v+pt[1],0)/pts.length];
    const aSquare=[p,q,[q[0],q[1]+ax],[p[0],p[1]+ax]];
    const bSquare=[p,r,[r[0]-by,r[1]],[p[0]-by,p[1]]];
    const cSquare=[q,r,[r[0]+offset[0],r[1]+offset[1]],[q[0]+offset[0],q[1]+offset[1]]];
    const sc=[aSquare,bSquare,cSquare];
    return <svg viewBox="0 0 412 272" role="img" aria-label="직각삼각형 각 변에 정사각형을 연결한 피타고라스 넓이 비교" className="middle-svg">
      {sc.map((square,i)=>{
        const [cx,cy]=center(square);
        return <g key={i}><polygon points={poly(square)} fill={['#dce7ff','#e1f6ea','#fde3c4'][i]}
          stroke={['#6682d8','#48a587','#e7a35e'][i]} strokeWidth="2.3"/>
          <text x={cx} y={cy+4} textAnchor="middle" fontSize="14" fontWeight="850"
            fill={['#4363ac','#288a6c','#9d6a32'][i]}>{[a*a,b*b,a*a+b*b][i]}</text></g>;
      })}
      <polygon points={poly([p,q,r])} fill="#fff" stroke="#4b5e90" strokeWidth="2.5"/>
      <path d={'M'+(px+11)+' '+py+'v-11h-11'} stroke="#586e9a" fill="none" strokeWidth="2"/>
      <text x="90" y="29" fill="#435cae" fontSize="15" fontWeight="850">{a*a} + {b*b} = {a*a+b*b}</text>
      <text x="202" y="255" fill="#7383a0" fontSize="12">세 정사각형의 실제 넓이를 비교해요</text>
    </svg>;
  }
  if(model.visual==='triangle'){
    const radians=a*Math.PI/180;
    const length=40+b*17;
    const width=length*Math.cos(radians),height=length*Math.sin(radians);
    const sx=94,by=226,px=sx+width,topY=by-height;
    return <svg viewBox="0 0 412 272" role="img" aria-label="변 길이와 각도를 조절하는 삼각형" className="middle-svg">
      <polygon points={sx+','+by+' '+px+','+by+' '+px+','+topY} fill="#e1f3ed" stroke="#309982" strokeWidth="3" strokeLinejoin="round"/>
      <path d={'M'+(px-16)+' '+by+' v-16 h16'} stroke="#309982" fill="none" strokeWidth="2"/>
      <text x="175" y="246" fill="#547e79" fontSize="13">밑변 {format(b*Math.cos(radians))}cm</text>
      <text x={sx+19} y={by-12} fill="#257e71" fontWeight="850">{a}°</text>
      <text x={Math.min(352,(sx+px)/2)} y={(by+topY)/2} fontSize="12" fill="#277d6d">빗변 {b}cm</text>
      <text x={(px+sx)/2} y={(topY+by)/2} fill="#226e62" fontWeight="750" fontSize="14">{model.value}</text>
    </svg>;
  }
  if(model.visual==='bars'){
    const values=topic==='probability'?[a,b]:topic==='statistics'?[a,b,5]:
      topic==='boxplot'?[b,b+a,b+2*a,b+3*a,b+4*a,b+5*a,b+6*a,b+7*a]:
      [b-a,b,b+a];
    const max=Math.max(1,...values.map(Math.abs));
    return <svg viewBox="0 0 412 272" role="img" aria-label="값을 움직이면 막대 길이가 변하는 자료 그래프" className="middle-svg">
      <line x1="20" y1="242" x2="395" y2="242" stroke="#a7b6d4" strokeWidth="2"/>
      {values.map((v,i)=>{
        const space=360/values.length;
        const x=30+space*i,w=Math.min(48,space-12),h=Math.max(3,Math.abs(v)/max*174);
        return <g key={i}><rect x={x} y={242-h} width={w} height={h} rx="6" fill={i%2?'#f1af70':'#7189ea'}/>
          <text x={x+w/2} y={236-h} textAnchor="middle" fontSize="13" fill="#4d5d8b">{v}</text></g>;
      })}
    </svg>;
  }
  if(model.visual==='number'){
    const first=topic==='integers'?a:topic==='inequalities'?a:topic==='recurring'?a:0;
    const second=topic==='integers'?a+b:topic==='inequalities'?a+4:topic==='recurring'?b:a;
    const calc=(value:number)=>206+value*17;
    return <svg viewBox="0 0 412 272" role="img" aria-label="수가 변화하는 수직선" className="middle-svg">
      <line x1="15" y1="155" x2="395" y2="155" stroke="#9baaca" strokeWidth="3"/>
      {Array.from({length:21},(_,i)=>i-10).map(x=><g key={x}>
        <line x1={calc(x)} y1="149" x2={calc(x)} y2="161" stroke="#aebad3"/>
        {x%2===0&&<text x={calc(x)} y="177" fontSize="10" fill="#8c98af" textAnchor="middle">{x}</text>}</g>)}
      <circle cx={Math.max(15,Math.min(395,calc(first)))} cy="155" r="7" fill="#e7a16a" stroke="#fff" strokeWidth="2"/>
      <circle cx={Math.max(15,Math.min(395,calc(second)))} cy="155" r="8" fill="#5368e8" stroke="#fff" strokeWidth="2"/>
      <text x="206" y="90" fontSize="19" textAnchor="middle" fill="#4a5fa9" fontWeight="800">{model.value}</text>
    </svg>;
  }
  return <svg viewBox="0 0 412 272" role="img" aria-label="숫자 변경에 따라 수량과 구성이 바뀌는 수학 그림" className="middle-svg">
    <rect x="28" y="36" width="356" height="195" rx="17" fill="#f5f7ff" stroke="#e4e8f8" strokeWidth="2"/>
    {Array.from({length:Math.min(40,Math.max(1,Math.abs(Math.round(a*b)||a)))},(_,i)=>{
      const col=i%10,row=Math.floor(i/10);
      return <rect key={i} x={44+col*32} y={66+row*33} width="26" height="27" rx="5"
        fill={i%2?'#f1b267':'#7287e9'} opacity=".85"/>;
    })}
    <text x="205" y="205" textAnchor="middle" fill="#3d54ab" fontSize="17" fontWeight="800">{model.value}</text>
  </svg>;
}

export default function MiddleLab({topic}:{topic:MiddleTopic}){
  const config=controls[topic];
  const [a,setA]=useState(config.a.initial);
  const [b,setB]=useState(config.b?.initial??0);
  const [attempts,setAttempts]=useState(0);
  const [successes,setSuccesses]=useState(0);
  const [inverse,setInverse]=useState(false);
  const model=describe(topic,a,b,inverse);
  const sample=()=>{
    setAttempts(prev=>prev+1);
    if(Math.random()<a/(a+b))setSuccesses(prev=>prev+1);
  };
  // Topic-specific exploratory experience: do not substitute generic dots
  // for actual prime decomposition.
  if(topic==='primes')return <PrimeFactorLab/>;
  if(isFoundationTopic(topic))return <FoundationLab topic={topic}/>
  return <section className="middle-lab" aria-label="직접 탐구하는 수학 실험">
    <div className="middle-lab-head"><span>🖐️ TRY IT YOURSELF</span><h3>값을 바꾸며 변화를 살펴보세요</h3></div>
    <div className="middle-lab-grid">
      <div className="middle-controls">
        <label htmlFor="middle-control-a">{config.a.label} <strong>{a}</strong></label>
        <input id="middle-control-a" type="range" min={config.a.min} max={config.a.max}
          step={config.a.step??1} value={a} onChange={e=>setA(Number(e.target.value))}/>
        <div className="middle-range"><span>{config.a.min}</span><span>{config.a.max}</span></div>
        {config.b&&<>
          <label htmlFor="middle-control-b">{config.b.label} <strong>{b}</strong></label>
          <input id="middle-control-b" type="range" min={config.b.min} max={config.b.max}
            step={config.b.step??1} value={b} onChange={e=>setB(Number(e.target.value))}/>
          <div className="middle-range"><span>{config.b.min}</span><span>{config.b.max}</span></div>
        </>}
        {topic==='proportion'&&<div className="middle-proportion-toggle" role="group" aria-label="비례 관계 방식">
          <button type="button" aria-pressed={!inverse} onClick={()=>setInverse(false)}>정비례</button>
          <button type="button" aria-pressed={inverse} onClick={()=>setInverse(true)}>반비례</button>
        </div>}
        <button type="button" className="middle-reset" onClick={()=>{
          setA(config.a.initial);setB(config.b?.initial??0);setAttempts(0);setSuccesses(0);setInverse(false);
        }}>↻ 처음 값으로 되돌리기</button>
        {topic==='probability'&&<div className="middle-probability-experiment">
          <button type="button" onClick={sample}>🎲 구슬 한 개 뽑기</button>
          <p>시도 {attempts}회 · 빨강 {successes}회 · 실험 확률 {attempts?Math.round(successes/attempts*100)+'%':'—'}</p>
        </div>}
      </div>
      <div className="middle-lab-canvas">
        <Visual topic={topic} model={model} a={a} b={b} inverse={inverse}/>
      </div>
    </div>
    <div className="middle-live-result" aria-live="polite">
      <div><small>수학적 관계</small><strong>{model.formula}</strong></div>
      <div><small>조작 결과</small><strong>{model.value}</strong></div>
      <p>{model.detail}</p>
    </div>
  </section>;
}
