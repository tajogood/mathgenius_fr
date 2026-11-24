import type {HighTopic} from './curriculum.ts';
import {MINUS,cx,fact,frac,ineqSolution,linFactor,nCr,nPr,num,piFrac,poly,term} from './format.ts';
import {trigValues} from './labs.ts';

export type HighProblem={topic:HighTopic;prompt:string;answer:string;choices:string[];solution:string};
const rand=(min:number,max:number)=>min+Math.floor(Math.random()*(max-min+1));
const pick=<T,>(items:readonly T[]):T=>items[rand(0,items.length-1)];
const paren=(n:number)=>n<0?'('+num(n)+')':num(n);
const sgn=(n:number)=>n<0?MINUS+num(-n):'+'+num(n);
const toNumber=(s:string)=>Number(s.replace(/−/g,'-'));

/** 정답 + 서로 다른 오답 3개, 무작위 순서. 오답이 부족하면 수치 정답 주변 값으로 채운다. */
function P(topic:HighTopic,prompt:string,answer:string,wrong:(string|number)[],solution:string):HighProblem{
  const pool=[...new Set(wrong.map(w=>typeof w==='number'?num(w):w).filter(w=>w!==answer&&w!==''))];
  const v=toNumber(answer);
  if(Number.isFinite(v)&&pool.length<3){
    for(let k=1;pool.length<3&&k<40;k++)for(const c of [v+k,v-k]){
      const s=num(c);if(s!==answer&&!pool.includes(s)&&pool.length<3)pool.push(s);
    }
  }
  if(pool.length<3)throw new Error('High problem needs 3 distinct distractors: '+topic+' '+prompt);
  const choices=[answer,...pool.slice(0,3)];
  for(let i=choices.length-1;i>0;i--){const j=rand(0,i);[choices[i],choices[j]]=[choices[j],choices[i]];}
  return {topic,prompt,answer,choices,solution};
}

export function createHighProblem(topic:HighTopic):HighProblem{
  switch(topic){
    /* ───── 공통수학1 ───── */
    case 'polyOps':{
      if(Math.random()<.5){
        const a=rand(1,6),b=rand(1,6),s=a+b,p=a*b,ans=s*s-2*p;
        return P(topic,`a+b=${s}, ab=${p}일 때 a^{2}+b^{2}의 값은?`,num(ans),[s*s+2*p,s*s-p,s*s-4*p,s*s],
          `a^{2}+b^{2}=(a+b)^{2}−2ab=${s}^{2}−2×${p}=${s*s}−${2*p}=${ans}`);
      }
      const k=pick([2,4,5]),ans=3*k*k;
      return P(topic,`(x+${k})^{3}을 전개했을 때 x의 계수는?`,num(ans),[3*k,k**3,k*k,6*k],
        `(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3}에서 x의 항은 3×x×${k}^{2}=${ans}x예요.`);
    }
    case 'remainder':{
      if(Math.random()<.5){
        const p=rand(-5,5),q=rand(-6,6),c=pick([-2,-1,1,2,3]),R=c**3+p*c+q;
        return P(topic,`f(x)=${poly([1,0,p,q])}를 ${linFactor(c)}로 나눈 나머지는?`,num(R),[(-c)**3+p*(-c)+q,q,c**3+q,R+2*c],
          `나머지정리에 의해 나머지는 f(${num(c)})=${paren(c)}^{3}${p?term(p,'×'+paren(c)):''}${q?sgn(q):''}=${num(R)}예요.`);
      }
      const c=pick([1,2,3]),k=rand(-6,4),m=-(c**3)-k*c;
      return P(topic,`다항식 x^{3}+kx${m?sgn(m):''}가 ${linFactor(c)}로 나누어떨어질 때 상수 k의 값은?`,num(k),[k+1,k-1,-k||1,m],
        `인수정리에 의해 f(${c})=0이므로 ${c**3}+${c}k${m?sgn(m):''}=0, k=${num(k)}예요.`);
    }
    case 'factorCubic':{
      if(Math.random()<.4){
        const a=pick([1,2,3,4]),s=Math.random()<.5?1:-1;
        const ans=s>0?`(x+${a})(x^{2}−${a===1?'':a}x+${a*a})`:`(x−${a})(x^{2}+${a===1?'':a}x+${a*a})`;
        const w1=s>0?`(x+${a})(x^{2}+${a===1?'':a}x+${a*a})`:`(x−${a})(x^{2}−${a===1?'':a}x+${a*a})`;
        const w2=s>0?`(x−${a})(x^{2}+${a===1?'':a}x+${a*a})`:`(x+${a})(x^{2}−${a===1?'':a}x+${a*a})`;
        const w3=s>0?`(x+${a})(x^{2}−${2*a}x+${a*a})`:`(x−${a})(x^{2}+${2*a}x+${a*a})`;
        return P(topic,`x^{3}${s>0?'+':MINUS}${a**3}을 인수분해하면?`,ans,[w1,w2,w3],
          `a^{3}${s>0?'+':'−'}b^{3}=(a${s>0?'+':'−'}b)(a^{2}${s>0?'−':'+'}ab+b^{2})에 a=x, b=${a}를 넣어요.`);
      }
      const pool=[-3,-2,-1,1,2,3];const rs:number[]=[];
      while(rs.length<3){const r=pick(pool);if(!rs.includes(r))rs.push(r);}
      rs.sort((x,y)=>x-y);const [a,b,c]=rs;
      const f=(roots:number[])=>roots.slice().sort((x,y)=>x-y).map(r=>'('+linFactor(r)+')').join('');
      return P(topic,`${poly([1,-(a+b+c),a*b+b*c+c*a,-a*b*c])}를 인수분해하면?`,f(rs),
        [f([-a,b,c]),f([a,-b,c]),f([a,b,-c]),f([-a,-b,-c])],
        `f(${num(a)})=0이므로 x−(${num(a)})가 인수예요. 조립제법으로 나누고 남은 이차식을 인수분해하면 ${f(rs)}예요.`);
    }
    case 'complex':{
      const r=Math.random();
      if(r<.35){
        const n=rand(5,40),k=n%4,ans=['1','i',MINUS+'1',MINUS+'i'][k];
        return P(topic,`i^{${n}}의 값은?`,ans,['1','i',MINUS+'1',MINUS+'i'],`i^{4}=1이므로 ${n}=4×${Math.floor(n/4)}+${k}, i^{${n}}=${k===0?'(i^{4})^{'+n/4+'}':k===1?(n<8?'i^{4}×i':'(i^{4})^{'+Math.floor(n/4)+'}×i'):'i^{'+k+'}'}=${ans}예요.`);
      }
      const a=rand(-4,4)||1,b=rand(-4,4)||2,c=rand(-4,4)||1,d=rand(-4,4)||-1;
      const re=a*c-b*d,im=a*d+b*c;
      return P(topic,`(${cx(a,b)})(${cx(c,d)})를 계산하면?`,cx(re,im),[cx(a*c+b*d,im),cx(re,a*d-b*c),cx(a*c,b*d),cx(re,-im)],
        `전개하면 ${num(a*c)}${term(a*d,'i')}${term(b*c,'i')}${term(b*d,'i^{2}')}이고, i^{2}=−1이므로 ${cx(re,im)}예요.`);
    }
    case 'discriminant':{
      if(Math.random()<.5){
        const p=rand(-6,6)||3,q=rand(-6,6)||-2,ans=p*p-2*q;
        return P(topic,`이차방정식 x^{2}${term(p,'x')}${sgn(q)}=0의 두 근을 α, β라 할 때 α^{2}+β^{2}의 값은?`,num(ans),[p*p+2*q,q*q-2*p,p*p-q,-p*p+2*q],
          `α+β=${num(-p)}, αβ=${num(q)}이므로 α^{2}+β^{2}=(α+β)^{2}−2αβ=${p*p}${sgn(-2*q)}=${ans}예요.`);
      }
      const m=pick([-5,-4,-3,-2,2,3,4,5]),k=m*m;
      return P(topic,`이차방정식 x^{2}${term(2*m,'x')}+k=0이 중근을 가질 때 상수 k의 값은?`,num(k),[2*m,Math.abs(m),-k,4*k],
        `판별식 D=(${num(2*m)})^{2}−4k=0이므로 4k=${4*k}, k=${k}예요.`);
    }
    case 'quadGraph':{
      if(Math.random()<.5){
        const m=pick([1,2,3,4]),ans=m*m-1;
        return P(topic,`이차함수 y=x^{2}${term(-2*m,'x')}+k의 그래프가 x축과 서로 다른 두 점에서 만나도록 하는 정수 k의 최댓값은?`,num(ans),[m*m,m*m+1,ans-1,2*m],
          `x^{2}${term(-2*m,'x')}+k=0의 판별식 ${4*m*m}−4k>0에서 k<${m*m}이므로 정수 k의 최댓값은 ${ans}예요.`);
      }
      const m=pick([-6,-4,-2,2,4,6]),n=-(m*m)/4;
      return P(topic,`직선 y=${term(m,'x',true)}+n이 포물선 y=x^{2}에 접할 때 n의 값은?`,num(n),[-n,m*m/2,-(m*m)/2,m],
        `x^{2}${term(-m,'x')}−n=0의 판별식 ${m*m}+4n=0이므로 n=${num(n)}예요.`);
    }
    case 'higherEq':{
      if(Math.random()<.5){
        const a=pick([1,2]),b=pick([3,4,5].filter(v=>v!==a));
        const A=a*a+b*b,B=a*a*b*b;
        const ans=`x=±${a} 또는 x=±${b}`;
        return P(topic,`사차방정식 x^{4}−${A}x^{2}+${B}=0의 해는?`,ans,[`x=${a} 또는 x=${b}`,`x=±${a*a} 또는 x=±${b*b}`,`x=±${a} 또는 x=±${b}i`,`x=±${a}i 또는 x=±${b}i`],
          `x^{2}=t로 놓으면 t^{2}−${A}t+${B}=0, (t−${a*a})(t−${b*b})=0이므로 x^{2}=${a*a} 또는 x^{2}=${b*b}예요.`);
      }
      const k=pick([-3,-2.5,-1,0,1,1.5,2,3]);const n=Math.abs(k)<2?3:Math.abs(k)===2?2:1;
      return P(topic,`방정식 x^{3}−3x=${num(k)}의 서로 다른 실근의 개수는?`,`${n}개`,['0개','1개','2개','3개'],
        `y=x^{3}−3x의 극댓값은 2, 극솟값은 −2예요. 직선 y=${num(k)}과의 교점이 ${n}개이므로 실근은 ${n}개예요.`);
    }
    case 'quadIneq':{
      if(Math.random()<.65){
        const a=rand(-5,3),b=a+rand(1,5),op=pick(['<','>','≤','≥'] as const);
        const ans=ineqSolution(a,b,op);
        const ops=['<','>','≤','≥'] as const;
        return P(topic,`이차부등식 ${poly([1,-(a+b),a*b])} ${op} 0의 해는?`,ans,[...ops.filter(o=>o!==op).map(o=>ineqSolution(a,b,o)),ineqSolution(-a,-b,op)],
          `${poly([1,-(a+b),a*b])}=(${linFactor(a)})(${linFactor(b)})이므로 ${op==='<'||op==='≤'?'두 근 사이':'두 근의 바깥쪽'}: ${ans}`);
      }
      const a=pick([-4,-3,-2,-1,1,2,3,4]),b=rand(1,5);
      return P(topic,`부등식 |x${sgn(-a)}|<${b}의 해는?`,`${num(a-b)}<x<${num(a+b)}`,
        [`x<${num(a-b)} 또는 x>${num(a+b)}`,`${num(-a-b)}<x<${num(-a+b)}`,`${num(a-b)}≤x≤${num(a+b)}`,`${num(-b)}<x<${num(b)}`],
        `−${b}<x${sgn(-a)}<${b}에서 각 변에 ${num(a)}를 더하면 ${num(a-b)}<x<${num(a+b)}예요.`);
    }
    case 'permComb':{
      const r=Math.random();
      if(r<.35){const n=rand(4,8),k=rand(2,3),v=nPr(n,k);
        return P(topic,`_{${n}}P_{${k}}의 값은?`,num(v),[nCr(n,k),n**k,nPr(n,k-1),v+n],`_{${n}}P_{${k}}=${Array.from({length:k},(_,i)=>n-i).join('×')}=${v}`);}
      if(r<.7){const n=rand(5,10),k=rand(2,4),v=nCr(n,k);
        return P(topic,`_{${n}}C_{${k}}의 값은?`,num(v),[nPr(n,k),nCr(n,k-1),nCr(n,k+1),v*2],`_{${n}}C_{${k}}={{_{${n}}P_{${k}}|${k}!}}={{${nPr(n,k)}|${fact(k)}}}=${v}`);}
      const b=rand(3,6),g=rand(2,5),v=nCr(b,2)*nCr(g,1);
      return P(topic,`남학생 ${b}명, 여학생 ${g}명 중에서 남학생 2명과 여학생 1명을 뽑는 경우의 수는?`,num(v),[nCr(b+g,3),nPr(b,2)*g,nCr(b,2)+g,b*g],
        `_{${b}}C_{2}×_{${g}}C_{1}=${nCr(b,2)}×${g}=${v}`);
    }
    case 'matrix':{
      const A=[[rand(-2,4),rand(-2,4)],[rand(-2,4),rand(-2,4)]],B=[[rand(-2,4),rand(-2,4)],[rand(-2,4),rand(-2,4)]];
      const i=rand(0,1),j=rand(0,1),v=A[i][0]*B[0][j]+A[i][1]*B[1][j];
      const m=(X:number[][])=>'⟦'+X.map(r=>r.map(n=>num(n)).join(',')).join(';')+'⟧';
      const wrong=[A[i][0]*B[j][0]+A[i][1]*B[j][1],A[0][j]*B[i][0]+A[1][j]*B[i][1],A[i][j]*B[i][j],A[i][j]+B[i][j]];
      return P(topic,`A=${m(A)}, B=${m(B)}일 때 행렬 AB의 (${i+1}, ${j+1}) 성분은?`,num(v),wrong,
        `A의 ${i+1}행 (${A[i].map(n=>num(n)).join(', ')})과 B의 ${j+1}열 (${num(B[0][j])}, ${num(B[1][j])})을 곱해 더하면 ${paren(A[i][0])}×${paren(B[0][j])}+${paren(A[i][1])}×${paren(B[1][j])}=${num(v)}`);
    }
    /* ───── 공통수학2 ───── */
    case 'distance':{
      if(Math.random()<.5){
        const [p,q,r]=pick([[3,4,5],[6,8,10],[5,12,13],[8,6,10],[4,3,5]] as const);
        const x1=rand(-4,3),y1=rand(-4,3),sx=pick([1,-1]),sy=pick([1,-1]);
        return P(topic,`두 점 A(${num(x1)}, ${num(y1)}), B(${num(x1+sx*p)}, ${num(y1+sy*q)}) 사이의 거리는?`,num(r),[p+q,r*r,Math.abs(p-q)+r,r+1],
          `AB=√(${p}^{2}+${q}^{2})=√${r*r}=${r}`);
      }
      const [m,n]=pick([[1,2],[2,1],[1,3],[3,1],[2,3],[3,2]] as const),x1=rand(-4,2),y1=rand(-4,2),k=rand(1,2);
      const x2=x1+(m+n)*k*pick([1,-1]),y2=y1+(m+n)*rand(-1,2);
      const P1=`(${num((m*x2+n*x1)/(m+n))}, ${num((m*y2+n*y1)/(m+n))})`;
      return P(topic,`두 점 A(${num(x1)}, ${num(y1)}), B(${num(x2)}, ${num(y2)})에 대하여 선분 AB를 ${m}:${n}으로 내분하는 점의 좌표는?`,P1,
        [`(${num((n*x2+m*x1)/(m+n))}, ${num((n*y2+m*y1)/(m+n))})`,`(${num((x1+x2)/2)}, ${num((y1+y2)/2)})`,`(${num(x1+x2)}, ${num(y1+y2)})`,`(${num((m*x2-n*x1)/(m-n||1))}, ${num((m*y2-n*y1)/(m-n||1))})`],
        `({{${m}×${paren(x2)}+${n}×${paren(x1)}|${m+n}}}, {{${m}×${paren(y2)}+${n}×${paren(y1)}|${m+n}}})=${P1}`);
    }
    case 'lineEq':{
      const r=Math.random();
      if(r<.4){
        const m=pick([-3,-2,-1,1,2,3,4]),x1=pick([-3,-2,-1,1,2,3]),y1=rand(-3,3),b=y1-m*x1;
        const line=(s:number,c:number)=>`y=${term(s,'x',true)}${c?sgn(c):''}`;
        return P(topic,`기울기가 ${num(m)}이고 점 (${num(x1)}, ${num(y1)})을 지나는 직선의 방정식은?`,line(m,b),[line(m,y1+m*x1),line(-m,b),line(m,-b),line(-m,y1+m*x1),line(m,b+m),line(m,b-m)],
          `y−${paren(y1)}=${num(m)}(x−${paren(x1)})를 정리하면 ${line(m,b)}`);
      }
      if(r<.7){
        const p=pick([1,2,3]),q=pick([1,2,3,4]),s=pick([1,-1]);const m=frac(s*p,q),perp=frac(-s*q,p);
        return P(topic,`직선 y=${m==='1'?'':m===MINUS+'1'?MINUS:m}x+1에 수직인 직선의 기울기는?`,perp,[frac(s*q,p),frac(-s*p,q),m===perp?'0':m,frac(s*p*2,q)],
          `수직인 두 직선의 기울기의 곱은 −1이므로 ${m}×(기울기)=−1, 기울기는 ${perp}예요.`);
      }
      const [a,b,c5]=pick([[3,4,5],[4,3,5],[5,12,13],[12,5,13],[6,8,10]] as const);const k=rand(1,3),c=c5*k*pick([1,-1]);
      return P(topic,`원점과 직선 ${a}x+${b}y${sgn(c)}=0 사이의 거리는?`,num(Math.abs(c)/c5),[Math.abs(c),frac(Math.abs(c),a+b),c5,Math.abs(c)/c5+1],
        `{{∣${num(c)}∣|√(${a}^{2}+${b}^{2})}}={{${Math.abs(c)}|${c5}}}=${num(Math.abs(c)/c5)}`);
    }
    case 'circleEq':{
      if(Math.random()<.6){
        const a=rand(-4,4),b=rand(-4,4),r=rand(2,5),D=-2*a,E=-2*b,F=a*a+b*b-r*r;
        const eq=`x^{2}+y^{2}${term(D,'x')}${term(E,'y')}${F?sgn(F):''}=0`;
        return P(topic,`원 ${eq}의 중심의 좌표와 반지름의 길이는?`,`중심 (${num(a)}, ${num(b)}), 반지름 ${r}`,
          [`중심 (${num(-a)}, ${num(-b)}), 반지름 ${r}`,`중심 (${num(a)}, ${num(b)}), 반지름 ${r*r}`,`중심 (${num(D)}, ${num(E)}), 반지름 ${r}`,`중심 (${num(-a)}, ${num(-b)}), 반지름 ${r*r}`,`중심 (${num(b)}, ${num(a)}), 반지름 ${r+1}`,`중심 (${num(a)}, ${num(b)}), 반지름 ${r+1}`,`중심 (${num(a)}, ${num(b)}), 반지름 ${2*r}`,`중심 (${num(a+1)}, ${num(b)}), 반지름 ${r}`],
          `완전제곱식으로 바꾸면 (${linFactor(a)})^{2}+(${linFactor(b,'y')})^{2}=${r*r}`);
      }
      const b=rand(-5,5),r=rand(1,5),a=rand(-3,3);
      const ans=Math.abs(b)<r?'서로 다른 두 점에서 만난다':Math.abs(b)===r?'한 점에서 만난다(접한다)':'만나지 않는다';
      return P(topic,`원 (${linFactor(a)})^{2}+(${linFactor(b,'y')})^{2}=${r*r}과 x축의 위치 관계는?`,ans,
        ['서로 다른 두 점에서 만난다','한 점에서 만난다(접한다)','만나지 않는다','원이 x축을 포함한다'],
        `중심 (${num(a)}, ${num(b)})에서 x축까지의 거리 ${Math.abs(b)}와 반지름 ${r}을 비교하면 ${ans}.`);
    }
    case 'transform':{
      const x=rand(-5,5)||2,y=rand(-5,5)||-3,mode=rand(0,4);
      if(mode===4){const m=rand(-3,3)||1,n=rand(-3,3)||2;
        return P(topic,`포물선 y=x^{2}을 x축 방향으로 ${num(m)}, y축 방향으로 ${num(n)}만큼 평행이동한 그래프의 꼭짓점은?`,`(${num(m)}, ${num(n)})`,
          [`(${num(-m)}, ${num(n)})`,`(${num(m)}, ${num(-n)})`,`(${num(n)}, ${num(m)})`,`(${num(-m)}, ${num(-n)})`],`y−${paren(n)}=(x−${paren(m)})^{2}이므로 꼭짓점은 (${num(m)}, ${num(n)})예요.`);}
      const names=['x축','y축','원점','직선 y=x'],imgs=[[x,-y],[-x,y],[-x,-y],[y,x]];
      const ans=`(${num(imgs[mode][0])}, ${num(imgs[mode][1])})`;
      return P(topic,`점 (${num(x)}, ${num(y)})을 ${names[mode]}에 대하여 대칭이동한 점의 좌표는?`,ans,
        imgs.filter((_,i)=>i!==mode).map(p=>`(${num(p[0])}, ${num(p[1])})`).concat([`(${num(-y)}, ${num(-x)})`]),
        `${names[mode]} 대칭: ${['(x, −y)','(−x, y)','(−x, −y)','(y, x)'][mode]}이므로 ${ans}`);
    }
    case 'sets':{
      if(Math.random()<.6){const a=rand(8,20),b=rand(5,18),c=rand(1,Math.min(a,b)-1),u=a+b-c;
        return P(topic,`n(A)=${a}, n(B)=${b}, n(A∩B)=${c}일 때 n(A∪B)는?`,num(u),[a+b,a+b+c,a-c,u-1],`n(A∪B)=${a}+${b}−${c}=${u}`);}
      const n=rand(4,6),k=rand(1,2);
      return P(topic,`집합 {${Array.from({length:n},(_,i)=>i+1).join(', ')}}의 부분집합 중 ${Array.from({length:k},(_,i)=>i+1).join(', ')}을(를) 반드시 원소로 갖는 것의 개수는?`,num(2**(n-k)),[2**n,2**(n-k)-1,2**(n-1),n-k],
        `${k}개의 원소를 먼저 넣고 나머지 ${n-k}개의 원소로 부분집합을 만들면 2^{${n-k}}=${2**(n-k)}개예요.`);
    }
    case 'propositions':{
      const opts=['충분조건이지만 필요조건은 아니다','필요조건이지만 충분조건은 아니다','필요충분조건이다','필요조건도 충분조건도 아니다'];
      const mode=rand(0,3);
      if(mode===0){const a=rand(1,5),b=a+rand(1,4);
        return P(topic,`p: x>${b}, q: x>${a}일 때 p는 q이기 위한 무엇인가?`,opts[0],opts.slice(1),`P={x|x>${b}}⊂Q={x|x>${a}}이므로 p→q는 참, q→p는 거짓이에요.`);}
      if(mode===1){const a=rand(2,6);
        return P(topic,`p: x^{2}=${a*a}, q: x=${a}일 때 p는 q이기 위한 무엇인가?`,opts[1],[opts[0],opts[2],opts[3]],`P={−${a}, ${a}}, Q={${a}}이고 Q⊂P이므로 q→p만 참이에요.`);}
      if(mode===2){const a=rand(1,4),b=rand(1,4);
        return P(topic,`p: |x${a?sgn(-a):''}|<${b}, q: ${num(a-b)}<x<${num(a+b)}일 때 p는 q이기 위한 무엇인가?`,opts[2],[opts[0],opts[1],opts[3]],`|x−${a}|<${b}를 풀면 ${num(a-b)}<x<${num(a+b)}이므로 P=Q예요.`);}
      const a=rand(2,5);
      return P(topic,`명제 "x=${a}이면 x^{2}=${a*a}이다"의 대우는?`,`x^{2}≠${a*a}이면 x≠${a}이다`,
        [`x≠${a}이면 x^{2}≠${a*a}이다`,`x^{2}=${a*a}이면 x=${a}이다`,`x^{2}≠${a*a}이면 x=${a}이다`],
        `"p이면 q"의 대우는 "~q이면 ~p"예요. 명제가 참이므로 대우도 참이에요. (역 "x^{2}=${a*a}이면 x=${a}"는 x=−${a}라는 반례가 있어 거짓)`);
    }
    case 'functions':{
      const a=pick([2,3,-2]),b=rand(-4,4),c=pick([1,2,-1,3]),d=rand(-3,3),k=rand(-2,3);
      if(Math.random()<.5){const v=c*(a*k+b)+d;
        return P(topic,`f(x)=${term(a,'x',true)}${b?sgn(b):''}, g(x)=${term(c,'x',true)}${d?sgn(d):''}일 때 (g∘f)(${num(k)})의 값은?`,num(v),[a*(c*k+d)+b,c*k+d+a*k+b,(a*k+b)*(c*k+d),v+1],
          `f(${num(k)})=${num(a*k+b)}이고 g(${num(a*k+b)})=${num(v)}예요.`);}
      const y=a*k+b;
      return P(topic,`f(x)=${term(a,'x',true)}${b?sgn(b):''}일 때 f^{−1}(${num(y)})의 값은?`,num(k),[a*y+b,y,-k,k+1],
        `f^{−1}(${num(y)})=t라 하면 f(t)=${num(y)}, ${term(a,'t',true)}${b?sgn(b):''}=${num(y)}에서 t=${num(k)}예요.`);
    }
    case 'rational':{
      const p=pick([-3,-2,-1,1,2,3]),q=pick([-3,-2,-1,1,2,3].filter(v=>v!==p&&v!==-p)),k=pick([-3,-2,-1,1,2,3]);
      const numerator=`${term(q,'x',true)||''}${(k-p*q)?(q?sgn(k-p*q):num(k-p*q)):(q?'':'0')}`;
      if(Math.random()<.5)
        return P(topic,`유리함수 y={{${numerator}|${linFactor(p)}}}의 그래프의 두 점근선의 교점의 좌표는?`,`(${num(p)}, ${num(q)})`,
          [`(${num(-p)}, ${num(q)})`,`(${num(p)}, ${num(-q)})`,`(${num(q)}, ${num(p)})`,`(${num(-p)}, ${num(-q)})`],
          `y={{${num(k)}|${linFactor(p)}}}${q?sgn(q):''}로 바꾸면 점근선은 x=${num(p)}, y=${num(q)}예요.`);
      return P(topic,`유리함수 y={{${num(k)}|${linFactor(p)}}}${q?sgn(q):''}의 점근선의 방정식은?`,`x=${num(p)}, y=${num(q)}`,
        [`x=${num(-p)}, y=${num(q)}`,`x=${num(p)}, y=${num(-q)}`,`x=${num(q)}, y=${num(p)}`,`x=${num(-p)}, y=${num(-q)}`],`분모가 0이 되는 x=${num(p)}와 y=${num(q)}가 점근선이에요.`);
    }
    case 'irrational':{
      const p=pick([-4,-3,-2,-1,1,2,3,4]),q=pick([-4,-3,-2,-1,1,2,3,4].filter(v=>Math.abs(v)!==Math.abs(p))),neg=Math.random()<.4;
      const inside=neg?(p===0?`${MINUS}x`:`${MINUS}x${sgn(p)}`):linFactor(p);
      return P(topic,`무리함수 y=√(${inside})${q?sgn(q):''}의 정의역은?`,neg?`x≤${num(p)}`:`x≥${num(p)}`,
        [neg?`x≥${num(p)}`:`x≤${num(p)}`,`x≥${num(-p)}`,`x≥${num(q)}`,`x≤${num(-p)}`],
        `근호 안이 0 이상이어야 하므로 ${inside}≥0, ${neg?'x≤':'x≥'}${num(p)}예요. 치역은 y≥${num(q)}예요.`);
    }
    /* ───── 대수 ───── */
    case 'expLaw':{
      const [a,m,n,v]=pick([[8,2,3,4],[27,2,3,9],[16,3,4,8],[4,3,2,8],[9,3,2,27],[32,2,5,4],[27,4,3,81],[125,2,3,25]] as const);
      const rt=Math.round(a**(1/n));
      return P(topic,`${a}^{{{${m}|${n}}}}의 값은?`,num(v),[rt*m,rt**(m+1),rt**(m-1),v*rt],
        `${a}=${Math.round(a**(1/n))}^{${n}}이므로 ${a}^{{{${m}|${n}}}}=${Math.round(a**(1/n))}^{${m}}=${v}`);
    }
    case 'logarithm':{
      const r=Math.random();
      if(r<.4){const a=pick([2,3,5]),k=rand(2,5);
        return P(topic,`log_{${a}} ${a**k}의 값은?`,num(k),[a**k/a,k+1,a*k,a],`${a}^{${k}}=${a**k}이므로 log_{${a}} ${a**k}=${k}`);}
      if(r<.75){const a=pick([2,3]),k=rand(1,3),m=pick([3,5,6,7].filter(v=>v!==a));
        return P(topic,`log_{${a}} ${m*a**k}−log_{${a}} ${m}의 값은?`,num(k),[k+1,k>1?k-1:k+2,m,a*k],
          `log_{${a}} {{${m*a**k}|${m}}}=log_{${a}} ${a**k}=${k}`);}
      const a=pick([2,3]),p=rand(2,4),q=rand(1,3);
      return P(topic,`log_{${a**p}} ${a**q}의 값은?`,frac(q,p),[frac(p,q),num(q-p),num(p*q),frac(q,p+1)],`밑 변환: {{log_{${a}} ${a**q}|log_{${a}} ${a**p}}}={{${q}|${p}}}=${frac(q,p)}`);
    }
    case 'expLogGraph':{
      const r=Math.random();
      if(r<.35){const a=pick([2,3]),k=rand(2,5);
        return P(topic,`방정식 ${a}^{x−1}=${a**k}의 해는?`,num(k+1),[k,k-1,a**k,k+2],`${a}^{x−1}=${a}^{${k}}이므로 x−1=${k}, x=${k+1}`);}
      if(r<.7){const a=2,k=rand(2,4),c=rand(1,4);
        return P(topic,`방정식 log_{${a}}(x${sgn(-c)})=${k}의 해는?`,num(a**k+c),[a**k,a**k-c,k+c,a*k+c],`로그의 정의에 의해 x${sgn(-c)}=${a}^{${k}}=${a**k}, x=${a**k+c} (진수 조건 x>${c} 만족)`);}
      const m=rand(-3,3)||1,n=rand(-3,3)||-2;
      return P(topic,`함수 y=2^{x${sgn(-m)}}${sgn(n)}의 그래프의 점근선의 방정식은?`,`y=${num(n)}`,[`y=${num(-n)}`,`x=${num(m)}`,`y=0`,`x=${num(-m)}`],
        `y=2^{x}을 x축 방향으로 ${num(m)}, y축 방향으로 ${num(n)}만큼 평행이동했으므로 점근선은 y=${num(n)}예요.`);
    }
    case 'trigFunc':{
      const d=pick([120,135,150,210,225,240,300,315,330]),fn=rand(0,2);
      const vals=trigValues(d)!;const names=['sin','cos','tan'];
      const ans=vals[fn];
      const pool=['1/2','√3/2','√2/2','√3/3','√3','1'];
      const wrong=[...pool,...pool.map(v=>MINUS+v)].filter(v=>v!==ans);
      const near=[ans.startsWith(MINUS)?ans.slice(1):MINUS+ans,...wrong.sort(()=>Math.random()-.5)];
      return P(topic,`${names[fn]} ${piFrac(d,180)}의 값은?`,ans,near,
        `${piFrac(d,180)}=${d}°는 제${Math.floor(d/90)+1}사분면의 각이고 기준각은 ${[d,180-d,d-180,360-d][Math.floor(d/90)]}°예요. 부호를 정하면 ${names[fn]} ${piFrac(d,180)}=${ans}`);
    }
    case 'trigGraph':{
      const a=pick([1,2,3,4]),b=pick([1,2,3,4]),c=rand(-3,3),fn=pick(['sin','cos','tan'] as const);
      const per=fn==='tan'?piFrac(1,b):piFrac(2,b);
      if(Math.random()<.55||fn==='tan')
        return P(topic,`함수 y=${a===1?'':a}${fn} ${b===1?'':b}x${c?sgn(c):''}의 주기는?`,per,
          [fn==='tan'?piFrac(2,b):piFrac(1,b),piFrac(2*b,1),piFrac(4,b),piFrac(b,2)].filter(v=>v!==per),
          `${fn==='tan'?'y=tan bx의 주기는 {{π||b|}}':'y=a '+fn+' bx+c의 주기는 {{2π||b|}}'}이므로 ${per}`);
      return P(topic,`함수 y=${a===1?'':a}${fn} ${b===1?'':b}x${c?sgn(c):''}의 최댓값은?`,num(a+c),[a,c,-a+c,a*b+c],`${fn}의 값이 1일 때 최대이므로 ${a}+${paren(c)}=${num(a+c)}`);
    }
    case 'sineCosineLaw':{
      if(Math.random()<.55){
        const [a,b,c,C]=pick([[3,8,7,60],[5,8,7,60],[8,15,13,60],[7,15,13,60],[5,21,19,60],[3,5,7,120],[7,8,13,120],[5,16,19,120]] as const);
        const sign=C===60?'−':'+';
        return P(topic,`삼각형 ABC에서 a=${a}, b=${b}, C=${C}°일 때 c의 값은?`,num(c),[c+1,c-1,a+b,Math.abs(a-b)],
          `코사인법칙 c^{2}=${a}^{2}+${b}^{2}−2×${a}×${b}×cos ${C}°=${a*a}+${b*b}${sign}${a*b}=${c*c}이므로 c=${c}`);
      }
      const A=pick([30,45,60,90]),kk=rand(2,7);
      const a=A===30?String(kk):A===45?kk+'√2':A===60?kk+'√3':String(2*kk);
      const sinA=A===30?'1/2':A===45?'√2/2':A===60?'√3/2':'1';
      return P(topic,`삼각형 ABC에서 A=${A}°, a=${a}일 때 외접원의 반지름의 길이 R은?`,num(kk),[2*kk,kk+1,kk-1,kk*3],
        `사인법칙 {{a|sin A}}=2R에서 sin ${A}°=${sinA}이므로 2R={{${a}|${sinA}}}=${2*kk}, R=${kk}`);
    }
    case 'arithmetic':{
      if(Math.random()<.5){const a=rand(-5,8),d=pick([-3,-2,2,3,4,5]),n=rand(8,20),v=a+(n-1)*d;
        return P(topic,`첫째항이 ${num(a)}, 공차가 ${num(d)}인 등차수열의 제${n}항은?`,num(v),[a+n*d,a*(n-1)+d,v+d,n*d],`a_{${n}}=${num(a)}+(${n}−1)×${paren(d)}=${num(v)}`);}
      const a=rand(1,6),d=rand(1,4),n=pick([10,12,15,20]),S=n*(2*a+(n-1)*d)/2;
      return P(topic,`첫째항이 ${a}, 공차가 ${d}인 등차수열의 첫째항부터 제${n}항까지의 합은?`,num(S),[n*(a+n*d)/2,n*(2*a+n*d)/2,S-d*n,(n-1)*(2*a+(n-2)*d)/2],
        `S_{${n}}={{${n}(2×${a}+${n-1}×${d})|2}}=${S}`);
    }
    case 'geometric':{
      if(Math.random()<.55){const a=pick([1,2,3]),r=pick([2,3,-2]),n=rand(4,6),v=a*r**(n-1);
        return P(topic,`첫째항이 ${a}, 공비가 ${num(r)}인 등비수열의 제${n}항은?`,num(v),[a*r**n,a*r*(n-1),a+r*(n-1),-v],`a_{${n}}=${a}×${paren(r)}^{${n-1}}=${num(v)}`);}
      const a=pick([1,2,3]),r=pick([2,3]),n=rand(4,6),S=a*(r**n-1)/(r-1);
      return P(topic,`첫째항이 ${a}, 공비가 ${r}인 등비수열의 첫째항부터 제${n}항까지의 합은?`,num(S),[a*r**n,a*(r**(n+1)-1)/(r-1),a*(r**n-1),S-a],`S_{${n}}={{${a}(${r}^{${n}}−1)|${r}−1}}=${S}`);
    }
    case 'sigma':{
      const r=Math.random(),n=rand(5,15);
      if(r<.4)return P(topic,`∑{k=1}{${n}} k의 값은?`,num(n*(n+1)/2),[n*n,n*(n-1)/2,n*(n+1),n*(n+1)/2+n],`∑{k=1}{n} k={{n(n+1)|2}}이므로 {{${n}×${n+1}|2}}=${n*(n+1)/2}`);
      if(r<.7){const m=rand(4,8);return P(topic,`∑{k=1}{${m}} k^{2}의 값은?`,num(m*(m+1)*(2*m+1)/6),[(m*(m+1)/2)**2,m*m*(m+1)/2,m*(m+1)*(2*m+1)/3,m**3],`∑{k=1}{n} k^{2}={{n(n+1)(2n+1)|6}}이므로 {{${m}×${m+1}×${2*m+1}|6}}=${m*(m+1)*(2*m+1)/6}`);}
      const a=rand(2,4),b=rand(-3,3);const v=a*n*(n+1)/2+b*n;
      return P(topic,`∑{k=1}{${n}} (${a}k${b?sgn(b):''})의 값은?`,num(v),[a*n*(n+1)/2+b,a*n*(n+1)+b*n,a*n*n+b*n,v+a],`∑(ak+b)=a∑k+b∑1이므로 ${a}×${n*(n+1)/2}${b?sgn(b)+'×'+n:''}=${v}`);
    }
    case 'induction':{
      const forms=[
        {lhs:'1+2+3+⋯+n={{n(n+1)|2}}',add:'k+1',wrong:['k','k+2','2k+1']},
        {lhs:'1+3+5+⋯+(2n−1)=n^{2}',add:'2k+1',wrong:['2k−1','2k+3','k+1']},
        {lhs:'1^{2}+2^{2}+⋯+n^{2}={{n(n+1)(2n+1)|6}}',add:'(k+1)^{2}',wrong:['k^{2}','k^{2}+1','2k+1']},
        {lhs:'1+2+2^{2}+⋯+2^{n−1}=2^{n}−1',add:'2^{k}',wrong:['2^{k+1}','2^{k−1}','2k']},
      ];
      const f=pick(forms);
      return P(topic,`수학적 귀납법으로 ${f.lhs}를 증명할 때, n=k일 때 성립한다고 가정하고 n=k+1일 때를 보이려면 양변에 더해야 하는 항은?`,f.add,f.wrong,
        `n=k일 때의 좌변에 다음 항, 즉 n=k+1번째 항 ${f.add}를 더하면 n=k+1일 때의 좌변이 돼요.`);
    }
    /* ───── 미적분Ⅰ ───── */
    case 'limit':{
      if(Math.random()<.6){const p=rand(-4,4)||2,q=rand(-4,4);const v=p-q;
        return P(topic,`lim{x→${num(p)}} {{${poly([1,-(p+q),p*q])}|${linFactor(p)}}}의 값은?`,num(v),[p+q,0,-v,q-2*p||1],
          `분자를 인수분해하면 (${linFactor(p)})(${linFactor(q)})이므로 약분 후 x=${num(p)}을 대입: ${num(p)}${sgn(-q)}=${num(v)}`);}
      const a=rand(1,5),b=rand(1,5),c=rand(-4,4);
      return P(topic,`lim{x→∞} {{${poly([a,c,1])}|${poly([b,0,-2])}}}의 값은?`,frac(a,b),[frac(b,a),'0','∞',frac(a+c,b)],`분모·분자를 x^{2}으로 나누면 최고차항의 계수의 비 {{${a}|${b}}}에 수렴해요.`);
    }
    case 'continuity':{
      if(Math.random()<.5){const a=rand(-3,4)||2;
        return P(topic,`함수 f(x)={{x^{2}−${a*a}|${linFactor(a)}}} (x≠${num(a)}), f(${num(a)})=k가 x=${num(a)}에서 연속일 때 k의 값은?`,num(2*a),[a,a*a,0,-2*a],
          `lim{x→${num(a)}} f(x)=lim (x${sgn(a)})=${num(2*a)}=f(${num(a)})이어야 하므로 k=${num(2*a)}`);}
      const a=rand(1,3),m=rand(2,4),c=rand(-3,3),k=a*a+c-m*a;
      return P(topic,`f(x)=${term(m,'x',true)}+k (x<${a}), f(x)=x^{2}${c?sgn(c):''} (x≥${a})가 실수 전체에서 연속일 때 k의 값은?`,num(k),[a*a+c,k+m,-k,a*a+c+m*a],
        `x=${a}에서 좌극한 ${m*a}+k와 f(${a})=${a*a+c}가 같아야 하므로 k=${num(k)}`);
    }
    case 'derivativeCoef':{
      if(Math.random()<.5){const b=rand(-4,4),a=rand(-3,3);const v=2*a+b;
        return P(topic,`f(x)=x^{2}${term(b,'x')}일 때 lim{h→0} {{f(${num(a)}+h)−f(${num(a)})|h}}의 값은?`,num(v),[a*a+b*a,2*a,v+1,a+b],`이 극한은 f′(${num(a)})이고 f′(x)=2x${b?sgn(b):''}이므로 ${num(v)}`);}
      const p=rand(-3,2),q=p+rand(1,4);
      return P(topic,`함수 f(x)=x^{2}에서 x의 값이 ${num(p)}에서 ${num(q)}까지 변할 때의 평균변화율은?`,num(p+q),[q-p,q*q-p*p,2*q,p*q],`{{${q*q}−${p*p}|${num(q)}−${paren(p)}}}=${num(p)}+${paren(q)}=${num(p+q)}`);
    }
    case 'derivative':{
      const a=rand(1,3),b=rand(-4,4),c=rand(-5,5),d=rand(-5,5),k=rand(-2,2);const v=3*a*k*k+2*b*k+c;
      return P(topic,`f(x)=${poly([a,b,c,d])}일 때 f′(${num(k)})의 값은?`,num(v),[a*k**3+b*k*k+c*k+d,3*a*k*k+b*k+c,a*k*k+2*b*k+c,v+d],
        `f′(x)=${poly([3*a,2*b,c])}이므로 f′(${num(k)})=${num(v)}`);
    }
    case 'tangentLine':{
      const a=rand(-2,2)||1,m=3*a*a,k=-2*a**3;
      const line=(s:number,c:number)=>`y=${term(s,'x',true)||''}${c?(s?sgn(c):num(c)):(s?'':'0')}`;
      return P(topic,`곡선 y=x^{3} 위의 점 (${num(a)}, ${num(a**3)})에서의 접선의 방정식은?`,line(m,k),[line(m,-k),line(2*a*a,-(a**3)),line(3*a,k),line(m,a**3)],
        `y′=3x^{2}이므로 기울기 ${m}. y−${paren(a**3)}=${m}(x−${paren(a)})를 정리하면 ${line(m,k)}`);
    }
    case 'extrema':{
      const p=rand(-2,1),q=p+rand(1,3),k=rand(-3,3);
      const f=(x:number)=>2*x**3-3*(p+q)*x*x+6*p*q*x+k;
      if(Math.random()<.5)
        return P(topic,`f(x)=${poly([2,-3*(p+q),6*p*q,k])}의 극댓값은?`,num(f(p)),[f(q),p,f(p)+1,f(0)===f(p)?f(p)-2:f(0)],
          `f′(x)=6${p===0?'x':'('+linFactor(p)+')'}${q===0?'x':'('+linFactor(q)+')'}이고 x=${num(p)}의 좌우에서 f′의 부호가 +에서 −로 바뀌므로 극댓값은 f(${num(p)})=${num(f(p))}`);
      return P(topic,`f(x)=${poly([2,-3*(p+q),6*p*q,k])}의 극솟값은?`,num(f(q)),[f(p),q,f(q)-1,f(0)===f(q)?f(q)+2:f(0)],
        `f′(x)=6${p===0?'x':'('+linFactor(p)+')'}${q===0?'x':'('+linFactor(q)+')'}이고 x=${num(q)}의 좌우에서 f′의 부호가 −에서 +로 바뀌므로 극솟값은 f(${num(q)})=${num(f(q))}`);
    }
    case 'antiderivative':{
      const a=pick([3,6,9]),b=pick([2,4,-2,-4]),c=rand(-3,3),C0=rand(-4,4),t=rand(1,2);
      const F=(x:number)=>a/3*x**3+b/2*x*x+c*x+C0;
      return P(topic,`F′(x)=${poly([a,b,c])}이고 F(0)=${num(C0)}일 때 F(${t})의 값은?`,num(F(t)),[F(t)-C0,a*t*t+b*t+c+C0,F(t)+1,a*t**3+b*t*t+c*t+C0],
        `F(x)=${poly([a/3,b/2,c])}+C이고 F(0)=C=${num(C0)}이므로 F(${t})=${num(F(t))}`);
    }
    case 'definiteIntegral':{
      const r=Math.random();
      if(r<.4){const k=rand(2,4);return P(topic,`∫{0}{${k}} 3x^{2}dx의 값은?`,num(k**3),[3*k**3,k**2,k**3/3,3*k*k],`[x^{3}]_{0}^{${k}}=${k**3}−0=${k**3}`);}
      if(r<.75){const p=rand(1,4)*2,q=rand(-3,3),a=rand(0,2),b=a+rand(1,3);const v=p/2*(b*b-a*a)+q*(b-a);
        return P(topic,`∫{${a}}{${b}} (${term(p,'x',true)}${q?sgn(q):''})dx의 값은?`,num(v),[p*(b*b-a*a)+q*(b-a),p/2*b*b+q*b,v+q,p*(b-a)],
          `[${p/2===1?'':p/2}x^{2}${q?term(q,'x'):''}]_{${a}}^{${b}}=${num(p/2*b*b+q*b)}−${paren(p/2*a*a+q*a)}=${num(v)}`);}
      const k=rand(1,4),c=rand(1,5);
      return P(topic,`∫{${MINUS}${k}}{${k}} (x^{3}+${c})dx의 값은?`,num(2*k*c),[0,k*c,2*k**4/4+2*k*c,c],`x^{3}은 기함수라 대칭 구간에서 적분하면 0이고, 상수 ${c}의 정적분은 ${c}×${2*k}=${2*k*c}`);
    }
    case 'integralArea':{
      if(Math.random()<.6){const k=pick([1,2,3,6]);
        return P(topic,`곡선 y=x^{2}${term(-k,'x')}와 x축으로 둘러싸인 부분의 넓이는?`,frac(k**3,6),[frac(k**3,3),frac(k**3,2),frac(k*k,6),frac(k**3,12)],
          `x=0, x=${k}에서 만나고 넓이는 ∫{0}{${k}} (${term(k,'x',true)}−x^{2})dx={{${k}^{3}|6}}=${frac(k**3,6)}`);}
      const a=rand(1,3),b=rand(1,4),T=rand(1,3);const v=frac(a*T*T+2*b*T,2);
      return P(topic,`수직선 위를 움직이는 점의 시각 t에서의 속도가 v(t)=${term(a,'t',true)}${sgn(b)}일 때, t=0에서 t=${T}까지 위치의 변화량은?`,v,
        [num(a*T+b),num(a*T*T+b*T),frac(a*T*T+2*b*T+2*b,2),frac(a*T*T,2),frac(a*T*T+2*b*T+2,2)],
        `∫{0}{${T}} (${term(a,'t',true)}${sgn(b)})dt=[${a===2?'':frac(a,2)}t^{2}+${b}t]_{0}^{${T}}=${v}`);
    }
    /* ───── 확률과 통계 ───── */
    case 'repeatPerm':{
      if(Math.random()<.5){const n=rand(2,5),r=rand(2,4);
        return P(topic,`_{${n}}Π_{${r}}의 값은?`,num(n**r),[r**n,nPr(n,Math.min(r,n)),n*r,nCr(n+r-1,r)],`_{${n}}Π_{${r}}=${n}^{${r}}=${n**r}`);}
      const words=[['AABB',2,2,0],['AAABB',3,2,0],['AABBC',2,2,1],['AAABBC',3,2,1],['AABBCC',2,2,2]] as const;
      const [w,p,q,s]=pick(words);const n=w.length,v=fact(n)/(fact(p)*fact(q)*fact(s));
      return P(topic,`문자 ${w.split('').join(', ')}를 모두 일렬로 나열하는 경우의 수는?`,num(v),[fact(n),fact(n)/fact(p),v*2,nCr(n,p)],
        `{{${n}!|${p}!${q}!${s>1?s+'!':''}}}=${v}`);
    }
    case 'repeatComb':{
      if(Math.random()<.5){const n=rand(2,4),r=rand(3,6);
        return P(topic,`서로 다른 ${n}종류의 과일 중에서 중복을 허락하여 ${r}개를 고르는 경우의 수는?`,num(nCr(n+r-1,r)),[nCr(n+r,r),n**r,nCr(n+r-1,r-1)===nCr(n+r-1,r)?nCr(n+r-2,r):nCr(n+r-1,r-1),nCr(n,Math.min(r,n))+r],
          `_{${n}}H_{${r}}=_{${n+r-1}}C_{${r}}=${nCr(n+r-1,r)}`);}
      const r=rand(3,8);
      return P(topic,`x+y+z=${r}를 만족하는 음이 아닌 정수 x, y, z의 순서쌍의 개수는?`,num(nCr(r+2,2)),[nCr(r+2,3),nCr(r-1,2),3**r>500?r*3:3**r,nCr(r+1,2)],
        `_{3}H_{${r}}=_{${r+2}}C_{${r}}=${nCr(r+2,2)}`);
    }
    case 'binomialThm':{
      const n=rand(4,7),k=rand(1,n-1),c=pick([2,3]);const v=nCr(n,k)*c**(n-k);
      return P(topic,`(x+${c})^{${n}}의 전개식에서 ${k===1?'x':'x^{'+k+'}'}의 계수는?`,num(v),[nCr(n,k),nCr(n,k)*c**k,nCr(n,k-1)*c**(n-k+1),v+c],
        `일반항 _{${n}}C_{r} x^{r} ${c}^{${n}−r}에서 r=${k}: _{${n}}C_{${k}}×${c}^{${n-k}}=${nCr(n,k)}×${c**(n-k)}=${v}`);
    }
    case 'probAdd':{
      if(Math.random()<.55){const N=12,a=rand(3,8),b=rand(2,7),c=rand(1,Math.min(a,b)-1);
        return P(topic,`두 사건 A, B에 대하여 P(A)=${frac(a,N)}, P(B)=${frac(b,N)}, P(A∩B)=${frac(c,N)}일 때 P(A∪B)는?`,frac(a+b-c,N),[frac(a+b,N),frac(a+b-2*c,N),frac(c,N),frac(a+b-c+1,N)],
          `P(A∪B)=P(A)+P(B)−P(A∩B)=${frac(a,N)}+${frac(b,N)}−${frac(c,N)}=${frac(a+b-c,N)}`);}
      const n=rand(3,5);
      return P(topic,`동전 한 개를 ${n}번 던질 때 앞면이 적어도 한 번 나올 확률은?`,frac(2**n-1,2**n),[frac(1,2**n),frac(n,2**n),'1/2',frac(2**n-2,2**n)],
        `여사건(모두 뒷면)의 확률은 {{1|${2**n}}}이므로 1−{{1|${2**n}}}=${frac(2**n-1,2**n)}`);
    }
    case 'conditional':{
      const g=rand(8,15),gG=rand(2,g-2),b=rand(8,15),bG=rand(2,b-2);
      if(Math.random()<.5)
        return P(topic,`어느 반 학생 중 여학생 ${g}명 가운데 ${gG}명, 남학생 ${b}명 가운데 ${bG}명이 안경을 썼다. 한 학생을 뽑았더니 여학생이었을 때 안경을 쓴 학생일 확률은?`,frac(gG,g),
          [frac(gG,g+b),frac(gG,gG+bG),frac(g-gG,g),frac(bG,b),frac(gG+bG,g+b),frac(gG,g+1),frac(gG+1,g+1),frac(gG,g+2)],`P(안경|여학생)={{${gG}|${g}}}${frac(gG,g)!==gG+'/'+g?'='+frac(gG,g):''}`);
      return P(topic,`어느 반 학생 중 여학생 ${g}명 가운데 ${gG}명, 남학생 ${b}명 가운데 ${bG}명이 안경을 썼다. 한 학생을 뽑았더니 안경을 쓴 학생이었을 때 여학생일 확률은?`,frac(gG,gG+bG),
        [frac(gG,g),frac(gG,g+b),frac(bG,gG+bG),frac(g,g+b),frac(gG+bG,g+b),frac(gG,gG+bG+1),frac(gG+1,gG+bG+1),frac(gG,gG+bG+2)],
        `안경 쓴 학생 ${gG+bG}명 중 여학생은 ${gG}명이므로 {{${gG}|${gG+bG}}}${frac(gG,gG+bG)!==gG+'/'+(gG+bG)?'='+frac(gG,gG+bG):''}`);
    }
    case 'binomialDist':{
      const [n,p,q]=pick([[36,1,3],[50,1,5],[100,1,2],[72,1,6],[48,1,4],[45,2,3],[80,1,4]] as const);
      const E=n*p/q,V=n*p*(q-p)/(q*q);
      if(Math.random()<.5)return P(topic,`확률변수 X가 이항분포 B(${n}, ${p}/${q})를 따를 때 E(X)는?`,num(E),[V,E/2,n*(q-p)/q,E+p],`E(X)=np=${n}×{{${p}|${q}}}=${num(E)}`);
      return P(topic,`확률변수 X가 이항분포 B(${n}, ${p}/${q})를 따를 때 V(X)는?`,num(V),[E,Math.sqrt(V)===Math.round(Math.sqrt(V))?Math.sqrt(V):V+2,n*p*p/(q*q),V*2],
        `V(X)=np(1−p)=${n}×{{${p}|${q}}}×{{${q-p}|${q}}}=${num(V)}`);
    }
    case 'normalDist':{
      const m=pick([50,60,70]),s=pick([2,4,5,10]),k=pick([1,2]),up=Math.random()<.5;
      const tbl={1:.3413,2:.4772} as Record<number,number>;
      const ans=num(.5-tbl[k],4),x=up?m+k*s:m-k*s;
      return P(topic,`확률변수 X가 정규분포 N(${m}, ${s}^{2})을 따를 때 P(X${up?'≥':'≤'}${x})의 값은? (단, P(0≤Z≤1)=0.3413, P(0≤Z≤2)=0.4772)`,ans,
        [num(.5+tbl[k],4),num(tbl[k],4),num(.5-tbl[3-k],4),num(1-tbl[k],4)],`Z={{X−${m}|${s}}}로 표준화하면 P(Z${up?'≥':'≤−'}${k})=0.5−${tbl[k]}=${ans}`);
    }
    case 'estimation':{
      const [n,s]=pick([[100,10],[64,8],[36,6],[25,10],[400,20],[16,4]] as const);const se=s/Math.sqrt(n);
      if(Math.random()<.5)return P(topic,`모표준편차가 ${s}인 모집단에서 크기 ${n}인 표본을 임의추출할 때 표본평균 X̄의 표준편차는?`,num(se),[s/n,s,se*se,se*2],`σ(X̄)={{σ|√n}}={{${s}|√${n}}}=${num(se)}`);
      const xb=pick([50,60,100]),lo=num(xb-1.96*se),hi=num(xb+1.96*se);
      return P(topic,`모표준편차가 ${s}인 모집단에서 크기 ${n}인 표본의 표본평균이 ${xb}일 때, 모평균 m에 대한 신뢰도 95%의 신뢰구간은? (Z=1.96 사용)`,`${lo}≤m≤${hi}`,
        [`${num(xb-2.58*se)}≤m≤${num(xb+2.58*se)}`,`${num(xb-1.96*s)}≤m≤${num(xb+1.96*s)}`,`${num(xb-se)}≤m≤${num(xb+se)}`,`${num(xb-1.96*s/n)}≤m≤${num(xb+1.96*s/n)}`],
        `${xb}±1.96×{{${s}|√${n}}}=${xb}±${num(1.96*se)}`);
    }
  }
}
