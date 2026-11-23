import {type MiddleTopic} from './curriculum.ts';

export type MiddleProblem={
  topic:MiddleTopic;prompt:string;answer:string;choices:string[];solution:string;
};
const random=(min:number,max:number)=>min+Math.floor(Math.random()*(max-min+1));
const one=<T>(items:readonly T[]):T=>items[random(0,items.length-1)];
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);
const fraction=(a:number,b:number):string=>{
  if(b===0)throw Error('Zero denominator');
  const div=gcd(Math.abs(a),Math.abs(b));
  const n=a/div,d=b/div;
  return d===1?String(n):n+'/'+d;
};
const pnum=(n:number)=>n>=0?'+'+n:String(n);
function P(topic:MiddleTopic,prompt:string,answer:string,wrong:string[],solution:string):MiddleProblem{
  const distinct=[...new Set(wrong.filter(x=>x!==answer&&x!=='').map(String))];
  // A numerical generator may accidentally produce duplicate distractors
  // for symmetric examples (such as 3-4-5 triangles or equal roots).
  // Preserve four distinct choices with mathematically meaningful alternatives.
  const numeric=Number(answer);
  const fillers=Number.isFinite(numeric)?
    Array.from({length:40},(_,i)=>String(numeric+(i%2===0?1:-1)*(Math.floor(i/2)+1))):
    answer.includes('π')?['π cm²','2π cm²','3π cm²','4π cm²','5π cm²','6π cm²','9π cm²','12π cm²','18π cm²','24π cm²','36π cm²']:
    answer.includes('x²')?['x²','x²+x+1','x²+2x+1','x²+3x+2','x²+4x+4','x²+5x+6']:
    answer.startsWith('(x+')?['(x+1)(x+1)','(x+1)(x+2)','(x+2)(x+3)','(x+3)(x+4)','(x+5)(x+6)']:
    answer.startsWith('(')?['(0, 0)','(1, 1)','(2, 2)','(3, 3)','(−1, 1)','(0, 2)','(−2, 2)','(1, −2)']:
    answer.includes('√')?['1/2','√2/2','√3/2','2√2','3√2','2√3','3√3','√5','√7','0']:
    answer.includes('×')?['2×2','2×3','2×2×2','3×3','2×3×5','2×2×3×3','2×2×2×3']:
    answer.startsWith('±')?['±1','±2','±3','±4','±5','±6','±7','±8','±9','±10','±11','±12']:
    answer.startsWith('x')?['x','x²','x³','x⁴','x⁵','x⁶','x⁷','x⁸','x⁹','x¹⁰','x¹¹','x¹²']:
    ['0','1','2','−1','1/2','1/3','2/3','해가 없음','조건이 부족함'];
  for(const candidate of fillers){
    if(distinct.length>=3)break;
    if(candidate!==answer&&!distinct.includes(candidate))distinct.push(candidate);
  }
  if(distinct.length<3)throw Error('Incorrect distractor bank for '+topic);
  const arr=[answer,...distinct.slice(0,3)];
  const offset=random(0,3);
  return {topic,prompt,answer,choices:arr.slice(offset).concat(arr.slice(0,offset)),solution};
}
function numberProblem(topic:MiddleTopic,prompt:string,value:number,wrong:number[],solution:string){
  return P(topic,prompt,String(value),wrong.map(String),solution);
}
function factors(n:number){
  const f:number[]=[];let x=n;
  for(let k=2;k*k<=x;k++)while(x%k===0){f.push(k);x/=k;}
  if(x>1)f.push(x);
  return f.join('×');
}
const pi=(n:number)=>n===1?'π':n+'π';
export function createMiddleProblem(topic:MiddleTopic):MiddleProblem{
  switch(topic){
    case 'primes':{
      const n=one([12,18,20,24,28,30,36,42,45,48,60,72]);
      return P(topic,n+'을 소인수분해한 결과는?',factors(n),
        [factors(n*2),factors(n*3),factors(n*5)],
        n+'을 작은 소수부터 반복해 나누면 '+factors(n)+'이고, 곱하면 다시 '+n+'입니다.');
    }
    case 'integers':{
      const a=random(-10,8),b=random(-8,9),s=a+b;
      return numberProblem(topic,'('+a+') + ('+b+') = ?',s,[a-b,s+2,-s+1],
        '수직선에서 '+a+'에서 시작해 '+b+'만큼 이동하면 '+s+'입니다.');
    }
    case 'expressions':{
      const a=random(2,6),b=random(1,6),x=random(2,5),v=a*x+b;
      return numberProblem(topic,'x='+x+'일 때 '+a+'x+'+b+'의 값은?',v,
        [a+b+x,(a+b)*x,v+2],
        '먼저 '+a+'×'+x+'='+a*x+'을 계산하고 '+b+'를 더하여 '+v+'을 얻습니다.');
    }
    case 'equations':{
      const a=random(2,6),b=random(1,8),x=random(1,6),v=a*x+b;
      return numberProblem(topic,a+'x+'+b+'='+v+'의 해는?',x,
        [v-b,x+a,x+b],
        '양쪽에서 '+b+'를 빼면 '+a+'x='+(v-b)+'이므로 '+a+'로 나누어 x='+x+'를 얻습니다.');
    }
    case 'coordinates':{
      const a=one([-7,-5,-3,2,4,6]),b=one([-6,-4,-2,3,5,7]);
      const q=a>0?(b>0?1:4):(b>0?2:3);
      return P(topic,'점 ('+a+', '+b+')가 위치하는 곳은?','제'+q+'사분면',
        [1,2,3,4].filter(i=>i!==q).map(i=>'제'+i+'사분면'),
        'x는 '+(a>0?'양수':'음수')+', y는 '+(b>0?'양수':'음수')+'이므로 제'+q+'사분면입니다.');
    }
    case 'proportion':{
      const a=random(2,6),x=random(2,6),v=a*x;
      return numberProblem(topic,'y='+a+'x에서 x='+x+'이면 y는?',v,
        [a+x,v+a,v-a],
        '정비례는 y=ax이며 '+a+'×'+x+'='+v+'입니다.');
    }
    case 'angles':{
      const a=one([30,35,45,50,60,70,80,100,120,135]),v=180-a;
      return numberProblem(topic,'한 직선 위의 이웃각 중 한 각이 '+a+'°이면 다른 각은 몇 도인가요?',v,
        [a,180+a,a+90],
        '직선각의 크기는 180°이므로 180°−'+a+'°='+v+'°입니다.');
    }
    case 'polygons':{
      const n=random(4,10),v=(n-2)*180;
      return numberProblem(topic,n+'각형의 내각의 합(도)은?',v,
        [(n-1)*180,n*180,(n-3)*180],
        n+'각형은 삼각형 '+(n-2)+'개로 나뉘므로 ('+n+'−2)×180°='+v+'°입니다.');
    }
    case 'sectors':{
      const r=one([3,6,9,12]),degrees=one([90,120,180]),top=r*r*degrees;
      const ans=fraction(top,360);
      const value=ans==='1'?'π cm²':ans+'π cm²';
      return P(topic,'반지름 '+r+'cm, 중심각 '+degrees+'°인 부채꼴의 넓이는?',value,
        [pi(r*r)+' cm²',fraction(r*r*degrees,180)+'π cm²',
         fraction(r*degrees,360)+'π cm²'],
        '전체 원의 넓이는 '+r*r+'π이고 부채꼴 넓이는 '+r*r+'π×'+degrees+'/360 = '+value+'입니다.');
    }
    case 'solids':{
      const r=random(2,5),h=random(2,7),v=r*r*h;
      return P(topic,'반지름 '+r+'cm, 높이 '+h+'cm인 원기둥의 부피는?',pi(v)+' cm³',
        [pi(r*h)+' cm³',pi(2*r*h)+' cm³',pi(r*r)+' cm³',pi(v*2)+' cm³'],
        '밑넓이 πr²='+r*r+'π에 높이 '+h+'를 곱하면 '+v+'π cm³입니다.');
    }
    case 'statistics':{
      const a=random(2,6),b=random(1,5),c=random(2,7),v=a+b+c;
      return numberProblem(topic,'세 계급의 도수가 '+a+', '+b+', '+c+'일 때 전체 도수는?',v,
        [a+b,a*c,v+2],
        '전체 도수는 세 도수를 모두 더한 '+a+'+'+b+'+'+c+'='+v+'입니다.');
    }
    case 'recurring':{
      const d=one([3,6,9,11]);
      const decimals:Record<number,string>={3:'0.(3)',6:'0.1(6)',9:'0.(1)',11:'0.(09)'};
      const ans=fraction(1,d);
      return P(topic,decimals[d]+'을 분수로 나타내면?',ans,
        [fraction(1,d+1),fraction(2,d),fraction(d-1,d)],
        '순환되는 숫자에 10의 거듭제곱을 곱해 같은 반복 부분을 빼면 '+ans+'입니다.');
    }
    case 'exponents':{
      const a=random(2,6),b=random(2,5),exp=(n:number)=>'x'+String(n).replace(/\d/g,k=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(k)]);
      return P(topic,exp(a)+'×'+exp(b)+'은?',exp(a+b),
        [exp(a*b),exp(Math.abs(a-b)),exp(a+b+1)],
        '같은 밑의 거듭제곱을 곱하면 지수를 더하므로 '+a+'+'+b+'='+(a+b)+'입니다.');
    }
    case 'inequalities':{
      const a=random(2,8),ans='x < −'+a;
      return P(topic,'−2x > '+(2*a)+'의 해는?',ans,
        ['x > −'+a,'x < '+a,'x > '+a],
        '양변을 음수 −2로 나누면 부등호가 반대로 바뀌어 x<−'+a+'입니다.');
    }
    case 'systems':{
      const x=random(2,7),y=random(1,5),sum=x+y,diff=x-y;
      return numberProblem(topic,'x+y='+sum+', x−y='+diff+'을 동시에 만족하는 x는?',x,
        [sum,diff,y],
        '두 등식을 더하면 2x='+(2*x)+'이므로 x='+x+'이고 y='+y+'입니다.');
    }
    case 'linearFunction':{
      const a=one([-3,-2,2,3,4]),b=random(1,6),x=random(2,5),v=a*x+b;
      return numberProblem(topic,'y='+a+'x+'+b+'에서 x='+x+'일 때 y는?',v,
        [a+x+b,a*(x+1)+b,a*x-b],
        '식에 x='+x+'를 대입하면 '+a+'×'+x+'+'+b+'='+v+'입니다.');
    }
    case 'functionIntersection':{
      const x=random(2,6),b=x+1,y=2*x+1;
      return numberProblem(topic,'두 직선 y=2x+1, y=x+'+b+'의 교점 x좌표는?',x,
        [b,y,x+2],
        '교점에서는 y가 같으므로 2x+1=x+'+b+', 따라서 x='+x+'입니다.');
    }
    case 'triangles':{
      const base=one([40,45,50,60,65,70]),top=180-2*base;
      return numberProblem(topic,'이등변삼각형의 두 밑각이 각각 '+base+'°이면 꼭지각은?',top,
        [180-base,base+top,base],
        '두 밑각이 같으므로 꼭지각=180°−2×'+base+'°='+top+'°입니다.');
    }
    case 'quadrilaterals':{
      const a=one([50,65,70,75,105,110,120,130]),v=180-a;
      return numberProblem(topic,'평행사변형의 한 내각이 '+a+'°일 때 이웃한 내각은?',v,
        [a,360-a,180+a],
        '평행사변형의 이웃한 두 내각의 합은 180°이므로 '+v+'°입니다.');
    }
    case 'similarity':{
      const a=random(2,5),b=random(a+1,a+4),k=random(2,6),v=b*k;
      return numberProblem(topic,'두 도형의 닮음비가 '+a+':'+b+'이고 작은 도형의 대응변이 '+(a*k)+'cm이면 큰 도형의 길이는?',v,
        [a*k,b*k+2,(b-a)*k],
        '작은 변 '+(a*k)+'cm를 '+a+'등분하면 한 부분이 '+k+'cm, 큰 변은 '+b+'×'+k+'='+v+'cm입니다.');
    }
    case 'pythagoras':{
      const [a,b,c]=one([[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]] as const);
      return numberProblem(topic,'직각삼각형의 직각변이 '+a+'cm, '+b+'cm일 때 빗변은?',c,
        [a+b,c+2,Math.abs(a-b)],
        '피타고라스 정리로 '+a+'²+'+b+'²='+(c*c)+'=c²이므로 c='+c+'cm입니다.');
    }
    case 'counting':{
      const a=random(3,6),b=random(2,5),v=a*b;
      return numberProblem(topic,'셔츠 '+a+'벌과 바지 '+b+'벌을 한 개씩 고르는 방법은 몇 가지?',v,
        [a+b,a+b+1,v+2],
        '셔츠 하나에 바지 '+b+'가지이므로 '+a+'×'+b+'='+v+'가지입니다.');
    }
    case 'probability':{
      const a=one([2,3,4]),b=one([3,5,7]),ans=fraction(a,a+b);
      return P(topic,'빨강 공 '+a+'개, 파랑 공 '+b+'개에서 무작위로 한 개 뽑을 때 빨강일 확률은?',ans,
        [fraction(b,a+b),fraction(a,b),fraction(a,a+b+1)],
        '전체 '+(a+b)+'개 중 빨강 '+a+'개이므로 '+a+'/'+(a+b)+' = '+ans+'입니다.');
    }
    case 'roots':{
      const a=random(2,12),v=a*a;
      return P(topic,v+'의 제곱근은?', '±'+a,
        [''+a,'−'+a,'±'+v],
        a+'²='+v+'이고 (−'+a+')²='+v+'이므로 제곱근은 ±'+a+'입니다. √'+v+'은 '+a+'만 뜻해요.');
    }
    case 'radicals':{
      const a=random(2,7),b=one([2,3,5,7]),v=a*a*b,ans=a+'√'+b;
      return P(topic,'√'+v+'을 근호 밖으로 꺼내 간단히 나타내면?',ans,
        [a*a+'√'+b,a+'√'+(a*b),'√'+b],
        v+'='+(a*a)+'×'+b+'이므로 √'+v+'='+a+'√'+b+'입니다.');
    }
    case 'polynomial':{
      const a=random(1,6),b=random(1,6),v=a+b;
      return P(topic,'(x+'+a+')(x+'+b+')를 전개하면?',
        'x²+'+v+'x+'+(a*b),
        ['x²+'+(a*b)+'x+'+v,'x²+'+v+'x+'+v,'x²+'+(v+1)+'x+'+(a*b)],
        '넓이 모형으로 x²+'+a+'x+'+b+'x+'+(a*b)+'를 합치면 x²+'+v+'x+'+(a*b)+'입니다.');
    }
    case 'factoring':{
      const a=random(1,6),b=random(1,6),sum=a+b,mul=a*b;
      return P(topic,'x²+'+sum+'x+'+mul+'를 인수분해하면?',
        '(x+'+a+')(x+'+b+')',
        ['(x+'+a+')(x+'+(b+1)+')','(x+'+sum+')(x+1)','(x+'+mul+')(x+1)'],
        '합이 '+sum+'이고 곱이 '+mul+'인 두 수 '+a+', '+b+'를 찾으면 됩니다.');
    }
    case 'quadraticEquation':{
      const a=random(1,4),b=random(a+1,a+5),sum=a+b,mul=a*b;
      return P(topic,'x²−'+sum+'x+'+mul+'=0의 두 근은?',
        a+', '+b,
        [a+', '+(b+1),(a+1)+', '+b,'−'+a+', −'+b],
        '(x−'+a+')(x−'+b+')=0이므로 x='+a+' 또는 x='+b+'입니다.');
    }
    case 'quadraticFunction':{
      const a=one([-3,-2,2,3]),p=random(-3,4),q=random(-5,5);
      const ans='('+p+', '+q+')';
      return P(topic,'y='+a+'(x'+(p<0?'+'+(-p):'−'+p)+')²'+pnum(q)+'의 꼭짓점은?',
        ans,
        ['(' +(-p)+', '+q+')','('+p+', '+(-q)+')','(0, '+q+')'],
        '꼭짓점 형태 y=a(x−p)²+q에서 꼭짓점은 ('+p+', '+q+')이고 대칭축은 x='+p+'입니다.');
    }
    case 'trigonometry':{
      const angle=one([30,45,60]),fn=one(['sin','cos'] as const);
      const map:Record<number,{sin:string;cos:string}>={30:{sin:'1/2',cos:'√3/2'},45:{sin:'√2/2',cos:'√2/2'},60:{sin:'√3/2',cos:'1/2'}};
      const ans=map[angle][fn];
      return P(topic,'직각삼각형에서 '+fn+angle+'°의 값은?',ans,
        ['1','0','√3',...(ans==='1/2'?['√3/2']:['1/2']),...(ans==='√2/2'?['√3/2']:['√2/2'])],
        '특수각 '+angle+'°의 직각삼각형 변의 길이 비를 이용하면 '+fn+angle+'°='+ans+'입니다.');
    }
    case 'circleTheorem':{
      const center=one([60,80,100,120,140]),ans=center/2;
      return numberProblem(topic,'원의 같은 호에 대한 중심각이 '+center+'°일 때 원주각의 크기는?',ans,
        [center,180-center,center+ans],
        '같은 호에 대한 원주각은 중심각의 절반이므로 '+center+'÷2='+ans+'°입니다.');
    }
    case 'dispersion':{
      const a=random(2,10),d=random(2,5),v=2*d;
      return numberProblem(topic,'자료 '+(a-d)+', '+a+', '+(a+d)+'의 범위(최댓값−최솟값)는?',v,
        [d,a,v+2],
        '범위는 '+(a+d)+'−('+(a-d)+')='+v+'입니다. 퍼짐이 클수록 범위가 커집니다.');
    }
    case 'boxplot':{
      const a=random(1,5),d=random(2,4),arr=[a,a+d,a+2*d,a+3*d,a+4*d];
      return numberProblem(topic,'자료 '+arr.join(', ')+'의 중앙값은?',arr[2],
        [arr[0],arr[1],arr[3]],
        '다섯 개를 크기순으로 정렬하면 가운데 세 번째 값 '+arr[2]+'가 중앙값입니다.');
    }
    case 'scatter':{
      const mode=one(['positive','negative'] as const);
      const ans=mode==='positive'?'양의 상관관계':'음의 상관관계';
      return P(topic,'산점도에서 x가 증가할수록 y가 '+(mode==='positive'?'커지는':'작아지는')+' 경향이면?',
        ans,[mode==='positive'?'음의 상관관계':'양의 상관관계','상관관계 없음','인과관계가 반드시 성립함'],
        '두 변수가 '+(mode==='positive'?'같은':'반대')+' 방향으로 움직이면 '+ans+'입니다. 상관관계는 인과관계를 자동으로 뜻하지 않아요.');
    }
  }
}
