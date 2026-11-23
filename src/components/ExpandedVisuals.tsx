import type { Problem } from '../math';

type Props = { problem: Problem; phase: 'concept' | 'question' | 'solution'; step: number };
const BLUE = '#6c83ee';
const GOLD = '#f5b36c';
const TEAL = '#52bfae';

function Label({ children }: { children: React.ReactNode }) {
  return <span className="expanded-label">{children}</span>;
}

/** Uniform whole length across all fractions; dashed dividers overlay the fill. */
function Bar({ numerator, denominator, color = BLUE, caption }: {
  numerator: number; denominator: number; color?: string; caption?: string;
}) {
  const n = Math.max(0, numerator), d = Math.max(1, denominator);
  const blocks = Math.ceil(n / d);
  return <div className="expanded-bar-group">
    {caption && <Label>{caption}</Label>}
    {Array.from({ length: blocks || 1 }, (_, block) =>
      <svg key={block} className="expanded-fraction-bar" viewBox="0 0 420 54" preserveAspectRatio="none"
        role="img" aria-label={d+'칸 중 '+Math.min(d,Math.max(0,n-block*d))+'칸이 색칠된 분수 막대'}>
        <rect x="2" y="2" width="416" height="50" rx="8" fill="#fff" />
        <rect x="2" y="2" width={416*Math.min(1,Math.max(0,n-block*d)/d)} height="50"
          fill={color} className="expanded-fill" />
        {Array.from({length:d-1},(_,i)=><line key={i} x1={2+416*(i+1)/d} x2={2+416*(i+1)/d}
          y1="2" y2="52" stroke="#465985" strokeDasharray="5 4" strokeWidth="2" opacity=".8" />)}
        <rect x="2" y="2" width="416" height="50" rx="8" fill="none" stroke="#9bacd3" strokeWidth="2" />
      </svg>)}
  </div>;
}

function Blocks({ count, color = BLUE }: { count: number; color?: string }) {
  return <div className="expanded-blocks" role="img" aria-label={count+'개의 블록'}>
    {Array.from({length:Math.min(count,120)},(_,i)=>
      <span key={i} className="expanded-block" style={{background:color,animationDelay:(i%16)*30+'ms'}} />)}
    {count>120&&<Label>… 총 {count}개</Label>}
  </div>;
}

function PlaceValue({ value }: { value: number }) {
  const digits=String(value).split('');
  const labels=['일','십','백','천','만','십만','백만'];
  return <div className="expanded-places">
    {digits.map((digit,i)=>{
      const power=digits.length-i-1;
      return <div key={i} className="expanded-place">
        <small>{labels[power] || '큰 수'}의 자리</small>
        <strong>{digit}</strong>
        <span>{Number(digit)*10**power}</span>
      </div>;
    })}
  </div>;
}

function Histogram({ values, line = false }: { values: number[]; line?: boolean }) {
  const height=140,max=Math.max(1,...values),unit=320/(values.length*2);
  const pts=values.map((v,i)=>[(i+.5)*320/values.length+20, height-(v/max)*110+16] as const);
  return <svg className="expanded-chart" viewBox="0 0 360 175" role="img" aria-label="높이에 따른 수치를 나타낸 그래프">
    {Array.from({length:4},(_,i)=><line key={i} x1="16" y1={20+i*35} x2="345" y2={20+i*35}
      stroke="#d8e1f4" strokeDasharray="4 5" />)}
    {line ? <polyline points={pts.map(point=>point.join(',')).join(' ')} fill="none"
      stroke={BLUE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" /> : null}
    {pts.map(([x,y],i)=><g key={i}>
      {line ? <circle cx={x} cy={y} r="6" fill={i===0?GOLD:BLUE} /> :
        <rect x={x-unit/1.4} y={y} width={unit*1.4} height={140-y}
          fill={i===0?BLUE:i===1?GOLD:TEAL} rx="4" className="expanded-fill" />}
      <text x={x} y={y-8} textAnchor="middle" fontSize="15" fill="#455b98" fontWeight="800">{values[i]}</text>
      <text x={x} y="162" textAnchor="middle" fontSize="13" fill="#7f8ead">{'가나다라마바'[i]}</text>
    </g>)}
  </svg>;
}

function AnglePolygon({ sides = 5, special }: { sides?: number; special?: string }) {
  const cx=150,cy=95,rx=90,ry=75;
  const pts=Array.from({length:sides},(_,i)=>{
    const a=(i/sides)*2*Math.PI-Math.PI/2;
    return (cx+rx*Math.cos(a)).toFixed(1)+','+(cy+ry*Math.sin(a)).toFixed(1);
  }).join(' ');
  return <svg className="expanded-geometry" viewBox="0 0 300 190" role="img" aria-label={sides+'각형'}>
    <polygon points={special==='square'?'65,25 235,25 235,165 65,165':pts}
      fill="#b9c8ff" stroke="#6075d8" strokeWidth="4" strokeLinejoin="round"
      className="expanded-shape"/>
    {Array.from({length:sides},(_,i)=>{
      const a=(i/sides)*2*Math.PI-Math.PI/2;
      return <circle key={i} cx={cx+rx*Math.cos(a)} cy={cy+ry*Math.sin(a)} r="3.7" fill="#354caa" />;
    })}
  </svg>;
}

function Geometry({ topic, a, b }: {topic:string;a:number;b:number}) {
  if (topic==='circle' || topic==='circlearea' || topic==='circumference') return <svg viewBox="0 0 320 180" className="expanded-geometry"
    role="img" aria-label="중심과 반지름과 지름이 있는 원">
    <circle cx="150" cy="90" r="70" fill="#e8eeff" stroke={BLUE} strokeWidth="4"/>
    <line x1="80" y1="90" x2="220" y2="90" stroke={GOLD} strokeWidth="4" strokeDasharray="6 4"/>
    <line x1="150" y1="90" x2="150" y2="20" stroke={BLUE} strokeWidth="4"/>
    <circle cx="150" cy="90" r="5" fill="#4058bc"/>
    <text x="157" y="50" fontSize="14" fill="#596ec8">반지름 {a}cm</text>
    <text x="150" y="112" textAnchor="middle" fontSize="12" fill="#b17b41">지름 = 2 × 반지름</text>
  </svg>;
  if (topic==='shapes3d'||topic==='curvedsolids'||topic==='nets'||topic==='polyhedra'||topic==='pyramid') {
    const name=topic==='shapes3d' ? ['직육면체','원기둥','구'][a%3]
      : topic==='curvedsolids' ? ['원기둥','원뿔','구'][a%3]
      : topic==='polyhedra'?a+'각기둥':topic==='pyramid'?a+'각뿔':'직육면체';
    if (topic==='nets') return <svg className="expanded-geometry" viewBox="0 0 330 200" role="img" aria-label="직육면체 전개도 여섯 면">
      {[[15,63],[85,63],[155,63],[225,63],[85,0],[85,126]].map(([x,y],i)=>
        <rect key={i} x={x} y={y} width="70" height="63" rx="2" fill={i%2?'#c6d2ff':'#a3b6f6'}
          stroke="#5b75d5" strokeWidth="2" strokeDasharray={i%2?'0':'4 3'}/>)}
      <text x="160" y="197" textAnchor="middle" fontSize="12" fill="#6072be">접으면 직육면체가 되는 전개도</text>
    </svg>;
    if (topic==='pyramid') {
      const points=Array.from({length:a},(_,i)=>{
        const theta=2*Math.PI*i/a-Math.PI/2;
        return [150+78*Math.cos(theta),135+30*Math.sin(theta)];
      });
      return <svg className="expanded-geometry" viewBox="0 0 310 190" role="img" aria-label={a+'각뿔'}>
        <polygon points={points.map(p=>p.join(',')).join(' ')} fill="#cad8fa" stroke="#7085d6" strokeWidth="2"/>
        {points.map((p,i)=><line key={i} x1={150} y1={26} x2={p[0]} y2={p[1]} stroke="#6077d9"
          strokeWidth="2.8" strokeDasharray={i>Math.ceil(a/2)?'4 3':undefined}/>)}
        <circle cx="150" cy="26" r="4" fill="#4e62bd"/>
        <text x="150" y="183" textAnchor="middle" fontSize="12" fill="#566ab8">{a}각뿔</text>
      </svg>;
    }
    if (topic==='polyhedra') {
      const vertices=(cx:number,cy:number)=>Array.from({length:a},(_,i)=>{
        const theta=2*Math.PI*i/a-Math.PI/2;
        return [cx+48*Math.cos(theta),cy+42*Math.sin(theta)];
      });
      const back=vertices(195,69),front=vertices(128,113);
      return <svg className="expanded-geometry" viewBox="0 0 310 190" role="img" aria-label={a+'각기둥'}>
        <polygon points={back.map(p=>p.join(',')).join(' ')} fill="#d4ddff" stroke="#7891e1" strokeWidth="2"/>
        {front.map((p,i)=><line key={i} x1={p[0]} y1={p[1]} x2={back[i][0]} y2={back[i][1]}
          stroke="#7288d8" strokeWidth="2"/>)}
        <polygon points={front.map(p=>p.join(',')).join(' ')} fill="#b0c2fa" stroke="#596fd3" strokeWidth="3"/>
        <text x="155" y="184" textAnchor="middle" fontSize="12" fill="#5366b8">{a}각기둥</text>
      </svg>;
    }
    return <svg className="expanded-geometry" viewBox="0 0 310 190" role="img" aria-label={name}>
      {name==='구'?<><circle cx="150" cy="95" r="73" fill="#d0dcff" stroke={BLUE} strokeWidth="3"/>
        <ellipse cx="150" cy="95" rx="73" ry="25" fill="none" stroke="#7185ca" strokeDasharray="5 5"/></>:
        name==='원뿔'?<><path d="M150 20 L76 150 Q150 194 224 150 Z" fill="#b9c9fa" stroke={BLUE} strokeWidth="3"/>
          <ellipse cx="150" cy="150" rx="74" ry="25" fill="#c2d0fb" stroke={BLUE} strokeWidth="3"/></>:
        name==='원기둥'?<><path d="M80 45 V145 Q150 187 220 145 V45" fill="#dce4ff" stroke={BLUE} strokeWidth="3"/>
          <ellipse cx="150" cy="45" rx="70" ry="25" fill="#a7b9f4" stroke={BLUE} strokeWidth="3"/>
          <path d="M80 145 Q150 185 220 145" fill="none" stroke={BLUE} strokeWidth="3"/></>:
        <><path d="M78 55 L190 55 L233 27 L121 27 Z" fill="#b0c4f7" stroke={BLUE} strokeWidth="3"/>
          <path d="M190 55 L233 27 L233 130 L190 157 Z" fill="#829de9" stroke={BLUE} strokeWidth="3"/>
          <rect x="78" y="55" width="112" height="102" fill="#d1dcff" stroke={BLUE} strokeWidth="3"/></>}
      <text x="150" y="184" textAnchor="middle" fontSize="13" fontWeight="800" fill="#5265b4">{name}</text>
    </svg>;
  }
  if (topic==='anglesum') return <AnglePolygon sides={a} />;
  if (topic==='triangletypes') {
    const points=['150,28 75,158 225,158','150,26 105,163 195,163','75,160 75,28 225,160'][a%3];
    return <svg className="expanded-geometry" viewBox="0 0 300 190" role="img" aria-label={['정삼각형','이등변삼각형','직각삼각형'][a%3]}>
      <polygon points={points} fill="#b8c7ff" stroke="#667de3" strokeWidth="4"/>
      {a===2&&<path d="M75 140 H95 V160" stroke="#5269c7" strokeWidth="2" fill="none"/>}
      {a===0&&<text x="150" y="182" textAnchor="middle" fill="#576bbd" fontSize="12">세 변의 길이가 같아요</text>}
    </svg>;
  }
  if (topic==='lines') return <svg viewBox="0 0 320 135" className="expanded-geometry" role="img" aria-label="선의 양 끝이 나타난 그림">
    <line x1="40" y1="67" x2="280" y2="67" stroke={BLUE} strokeWidth="5" strokeLinecap="round" />
    {a!==0&&<circle cx="40" cy="67" r="7" fill={GOLD}/>}
    {a===1&&<circle cx="280" cy="67" r="7" fill={GOLD}/>}
    {a!==1&&<path d="M268 57 L282 67 L268 77" fill="none" stroke={BLUE} strokeWidth="4" />}
    {a===0&&<path d="M52 57 L38 67 L52 77" fill="none" stroke={BLUE} strokeWidth="4"/>}
  </svg>;
  if(topic==='symmetry')return <svg viewBox="0 0 300 200" className="expanded-geometry"
    role="img" aria-label={a===0?'대칭축을 따라 양쪽이 반사된 선대칭 도형':'중심을 기준으로 180도 돌리면 겹치는 점대칭 도형'}>
    {a===0?<><path d="M150 18 V184" stroke="#8091b9" strokeWidth="2" strokeDasharray="6 5"/>
      <polygon points="130,40 55,72 113,113 80,150 130,155" fill="#b7c7ff" stroke={BLUE} strokeWidth="3"/>
      <polygon points="170,40 245,72 187,113 220,150 170,155" fill="#ffd4a3" stroke={GOLD} strokeWidth="3"/>
    </>:<>
      <polygon points="45,68 130,43 130,112 75,108" fill="#b7c7ff" stroke={BLUE} strokeWidth="3"/>
      <polygon points="255,132 170,157 170,88 225,92" fill="#ffd4a3" stroke={GOLD} strokeWidth="3"/>
      <circle cx="150" cy="100" r="5" fill="#5262bd"/>
      <path d="M145 100 L155 100 M150 95 L150 105" stroke="#fff" strokeWidth="1"/>
    </>}
  </svg>;
  if(topic==='quadtypes')return <svg viewBox="0 0 300 180" className="expanded-geometry" role="img" aria-label="사각형">
    <polygon points={['65,26 235,26 235,156 65,156','55,45 245,45 245,137 55,137','100,25 245,25 197,153 52,153','100,30 208,30 251,149 55,149'][a%4]}
      fill="#b9c8ff" stroke={BLUE} strokeWidth="4" />
  </svg>;
  return <AnglePolygon sides={topic==='triangletypes'?3:topic==='polygons'?a:Math.max(3,a||5)} />;
}

function NumericScene({ p, caption }: {p:Problem;caption:string}) {
  const a=p.a,b=p.b;
  return <div className="expanded-center">
    <div className="expanded-equation">{p.prompt.replace(/ = \?$/,'')}</div>
    <div className="expanded-math-strip">
      <div className="expanded-number-card"><strong>{a}</strong><small>첫 번째 수</small></div>
      <div className="expanded-operation" aria-hidden="true">✦</div>
      <div className="expanded-number-card expanded-number-card--secondary"><strong>{b}</strong><small>두 번째 수</small></div>
    </div>
    <Label>{caption}</Label>
  </div>;
}

export default function ExpandedVisuals({problem:p,phase,step}:Props) {
  const active=phase==='solution' || (phase==='concept' && step===2);
  const t=p.topic;
  const numeric=['longmultiply','longdivide','column3','mixedcalc','correspond','decimalsub',
    'capacity','multiples','roundup','rounddown','gcdlcm','timecalc',
    'decimalmul','decimaldiv','rounding','factors','measureweight','measurelength','perimeter','surface',
    'proportionshare'];
  let body:React.ReactNode;

  if (['count9','count50','count100','place3','place4','bigplace'].includes(t)) {
    body=<div className="expanded-center">
      <div className="expanded-equation">{p.prompt}</div>
      {t==='count9'?<Blocks count={p.a}/>:<PlaceValue value={p.a}/>}
      <Label>한 묶음은 10개 · 자릿값을 확인하세요</Label>
    </div>;
  } else if(['classify','compare'].includes(t)) {
    body=<div className="expanded-center">
      <div className="expanded-two-batches">
        <div><Blocks count={p.a}/><Label>{p.a}개</Label></div>
        <div><Blocks count={p.b} color={GOLD}/><Label>{p.b}개</Label></div>
      </div><Label>{t==='compare'?'두 수 중 어느 쪽이 클까요?':'색을 기준으로 묶어 보세요.'}</Label>
    </div>;
  } else if(['datagraph','bargraph','organize','linegraph','circlegraph'].includes(t)) {
    const isPie=t==='circlegraph';
    body=<div className="expanded-center">
      {isPie?<div className="expanded-pie" role="img" aria-label={'파란 부분 '+p.a*10+'%'}
        style={{background:'conic-gradient('+BLUE+' 0% '+p.a*10+'%, '+GOLD+' '+p.a*10+'% 100%)'}}>
        <span>전체 100%</span></div>:
        <Histogram values={t==='linegraph'?[p.a,p.c??p.a+p.b,p.c??p.a+p.b]:[p.a,p.b,p.c??2]} line={t==='linegraph'}/>}
      <Label>그래프의 크기와 수치를 비교하세요.</Label>
    </div>;
  } else if(['bandgraph'].includes(t)) {
    body=<div className="expanded-center">
      <div className="expanded-equation">전체 100% 중 파란 부분은?</div>
      <div className="expanded-band" role="img" aria-label={'파란색 '+p.a+'%, 주황색 '+p.b+'%의 띠그래프'}>
        <span style={{width:p.a+'%',backgroundColor:BLUE}}>{p.a}%</span>
        <span style={{width:p.b+'%',backgroundColor:GOLD}}>{p.b}%</span>
      </div>
      <Label>전체가 100%인 띠를 두 부분으로 나누었어요.</Label>
    </div>;
  } else if(['range','decimalcompare'].includes(t)) {
    body=<div className="expanded-center">
      <div className="expanded-equation">{p.prompt}</div>
      <div className="expanded-sequence">
        <span>{t==='decimalcompare'?(p.a/100).toFixed(2):p.a}</span>
        <span>{active?p.answer:'?'}</span>
        <span>{t==='decimalcompare'?(p.b/100).toFixed(2):p.a+1}</span>
      </div>
      <Label>{t==='range'?'●는 경계 포함, ○는 경계 제외라는 뜻이에요.':'소수점부터 자릿값을 맞춰요.'}</Label>
    </div>;
  } else if(['patterns','rounding'].includes(t)) {
    body=<div className="expanded-center">
      <div className="expanded-equation">{p.prompt}</div>
      {t==='patterns' ? <div className="expanded-sequence">
        {[0,1,2,3].map(i=><span key={i}>{i===3?'?':p.a+p.b*i}</span>)}
      </div> : <div className="expanded-sequence">
        <span>{p.a}</span><span>≈</span><span>{active?p.answer:'?'}</span>
      </div>}
      <Label>{t==='patterns'?'화살표를 따라 다음 수를 찾아요.':'어느 자리에서 반올림하는지 살펴봐요.'}</Label>
    </div>;
  } else if (['fractionmul','fractiondiv','samefraction','fractioncompare','fractionsub','naturalfraction',
    'fractiontypes','decimalintro','fractionintro','probability'].includes(t)) {
    const twoFractions=['fractionmul','fractiondiv','samefraction','fractioncompare','fractionsub'].includes(t);
    const denominator=t==='samefraction'?p.c!:t==='probability'?10:p.b;
    const firstNumerator=t==='fractiontypes'?p.c!:p.a;
    const otherDenom=['fractionmul','fractiondiv','fractioncompare','fractionsub'].includes(t)?p.d!:denominator;
    const otherNumerator=['fractionmul','fractiondiv','fractioncompare','fractionsub'].includes(t)?p.c!:p.b;
    body=<div className="expanded-center">
      <div className="expanded-equation">{p.prompt}</div>
      <div className="expanded-bars">
        <Bar numerator={firstNumerator} denominator={denominator} caption="첫 번째 전체 · 1" />
        {twoFractions&&<Bar numerator={otherNumerator} denominator={otherDenom} color={GOLD} caption="두 번째 전체 · 1" />}
      </div>
      <Label>막대 전체 길이는 같고 점선으로 나눈 칸 수가 달라요.</Label>
    </div>;
  } else if(['shapes3d','curvedsolids','nets','polyhedra','circle','circlearea','lines',
    'symmetry','quadtypes','triangletypes','polygons','pyramid','circumference','anglesum'].includes(t)) {
    body=<div className="expanded-center">
      <Geometry topic={t} a={p.a} b={p.b} />
      <Label>{t==='circlearea'?'원을 작은 조각으로 나누면 넓이를 계산할 수 있어요.':'점·선·면의 특징을 살펴보세요.'}</Label>
    </div>;
  } else if (t==='stacking'||t==='solidviews') {
    body=<div className="expanded-center">
      <div className="expanded-stacks">
        {Array.from({length:p.c??2},(_,i)=><div className="expanded-stack-layer" key={i}>
          {Array.from({length:p.a*p.b},(_,j)=><span key={j}/>)}</div>)}
      </div><Label>같은 수의 블록이 여러 층 쌓여 있어요.</Label>
    </div>;
  } else if(['average','probability'].includes(t)) {
    body=<div className="expanded-center">
      {t==='average' ? <Histogram values={[p.a,p.b,p.c??3]} />:
        <div className="expanded-two-batches"><Blocks count={p.a}/><Blocks count={p.b} color={GOLD}/></div>}
      <Label>{t==='average'?'그래프의 평균 높이는 얼마일까요?':'전체에서 원하는 색이 차지하는 몫을 생각해요.'}</Label>
    </div>;
  } else if (numeric.includes(t)) {
    body=<NumericScene p={p} caption={
      t==='factors'?'곱셈과 나눗셈의 관계를 확인해요.':
      t==='surface'?'입체도형의 여섯 면을 모두 더해요.':'숫자와 계산 순서를 잘 확인하세요.'}/>;
  } else {
    body=<NumericScene p={p} caption="주어진 수와 조건을 그림처럼 비교하세요."/>;
  }
  return <div className="scene-inner scene-inner--expanded" key={t+'-'+p.prompt+'-'+phase+'-'+step}>
    {body}
    {phase==='solution'&&step===2&&<div className="expanded-answer">정답: {p.answer}</div>}
  </div>;
}
