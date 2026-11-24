import test from 'node:test';
import assert from 'node:assert/strict';
import {HIGH_TOPICS,highCourses,highUnits,HIGH_TOTAL_UNITS} from '../src/high/curriculum.ts';
import {createHighProblem} from '../src/high/problems.ts';
import {labs} from '../src/high/labs.ts';
import {frac,nCr,nPr,piFrac,poly,root,ineqSolution,cx} from '../src/high/format.ts';

const N=s=>{ // '−3/4', '2√3', '0.0228' → number
  s=s.replace(/−/g,'-').trim();
  let m=s.match(/^(-?)(\d*)√(\d+)$/);if(m)return (m[1]?-1:1)*(m[2]?+m[2]:1)*Math.sqrt(+m[3]);
  m=s.match(/^(-?)(\d*)√(\d+)\/(\d+)$/);if(m)return (m[1]?-1:1)*(m[2]?+m[2]:1)*Math.sqrt(+m[3])/(+m[4]);
  m=s.match(/^(-?\d+)\/(\d+)$/);if(m)return +m[1]/+m[2];
  return Number(s);
};
const many=(topic,n,fn)=>{for(let i=0;i<n;i++)fn(createHighProblem(topic));};

test('5 high-school subjects cover 46 interactive units under the 2022 revision',()=>{
  assert.deepEqual(highCourses.map(c=>c.name),['공통수학1','공통수학2','대수','미적분Ⅰ','확률과 통계']);
  assert.equal(HIGH_TOTAL_UNITS,46);
  assert.equal(new Set(highUnits.map(u=>u.topic)).size,HIGH_TOPICS.length);
  for(const u of highUnits){
    assert.ok(u.concept.every(c=>c.length>15),u.id);
    assert.ok(u.action.length>15&&u.notice.length>10&&u.reason.length>10,u.id);
  }
});
test('every high-school topic generates 4 distinct choices containing exactly one answer',()=>{
  for(const topic of HIGH_TOPICS){
    for(let i=0;i<300;i++){
      const p=createHighProblem(topic);
      assert.equal(p.choices.length,4,topic);
      assert.equal(new Set(p.choices).size,4,topic+' '+JSON.stringify(p));
      assert.equal(p.choices.filter(c=>c===p.answer).length,1,topic);
      const all=[p.prompt,p.solution,...p.choices].join(' ');
      assert.ok(!/NaN|undefined|Infinity|null/.test(all),topic+': '+all);
      assert.ok(!/\b1x\b|\(x\+0\)|x−0\b/.test(all),topic+': '+all);
      assert.ok(p.solution.length>12,topic);
    }
  }
});
test('formatting helpers produce textbook notation',()=>{
  assert.equal(poly([1,-2,0,5]),'x³−2x²+5');
  assert.equal(poly([-1,1]),'−x+1');
  assert.equal(frac(6,-8),'−3/4');
  assert.equal(root(12),'2√3');assert.equal(root(49),'7');
  assert.equal(piFrac(7,6),'(7π)/6');assert.equal(piFrac(2,1),'2π');assert.equal(piFrac(1,2),'(π)/2');
  assert.equal(cx(0,-1),'−i');assert.equal(cx(3,-2),'3−2i');
  assert.equal(ineqSolution(5,-1,'<'),'−1<x<5');assert.equal(ineqSolution(2,2,'<'),'해가 없음');
});
test('independent re-computation of generated answers',()=>{
  many('permComb',200,p=>{
    let m=p.prompt.match(/_\{(\d+)\}P_\{(\d+)\}/);if(m)assert.equal(N(p.answer),nPr(+m[1],+m[2]));
    m=p.prompt.match(/_\{(\d+)\}C_\{(\d+)\}/);if(m)assert.equal(N(p.answer),nCr(+m[1],+m[2]));
  });
  many('polyOps',200,p=>{
    const m=p.prompt.match(/a\+b=(\d+), ab=(\d+)/);if(m)assert.equal(N(p.answer),(+m[1])**2-2*(+m[2]));
  });
  many('complex',200,p=>{
    const m=p.prompt.match(/^i\^\{(\d+)\}/);if(m)assert.equal(p.answer,['1','i','−1','−i'][+m[1]%4]);
  });
  many('trigFunc',300,p=>{
    const m=p.prompt.match(/^(sin|cos|tan) (?:\((\d+)π\)\/(\d+)|π)/);assert.ok(m,p.prompt);
    const t=m[2]?+m[2]*Math.PI/+m[3]:Math.PI;
    assert.ok(Math.abs(Math[m[1]](t)-N(p.answer))<1e-9,p.prompt+' '+p.answer);
  });
  many('sigma',200,p=>{
    let m=p.prompt.match(/^∑\{k=1\}\{(\d+)\} k의/);if(m){const n=+m[1];assert.equal(N(p.answer),n*(n+1)/2);}
    m=p.prompt.match(/^∑\{k=1\}\{(\d+)\} k\^\{2\}/);if(m){const n=+m[1];assert.equal(N(p.answer),n*(n+1)*(2*n+1)/6);}
  });
  many('quadIneq',300,p=>{
    const m=p.prompt.match(/^이차부등식 (.+) ([<>≤≥]) 0의 해는\?$/);if(!m)return;
    const expr=m[1].replace(/−/g,'-').replace(/x²/g,'x*x').replace(/(\d)x/g,'$1*x');
    const f=new Function('x','return '+expr),op=m[2];
    const holds=x=>{const v=f(x);return op==='<'?v<0:op==='>'?v>0:op==='≤'?v<=0:v>=0;};
    const sol=p.answer.replace(/−/g,'-');
    const inSol=x=>{let r=sol.match(/^(-?\d+)(<|≤)x(<|≤)(-?\d+)$/);
      if(r)return (r[2]==='<'?x>+r[1]:x>=+r[1])&&(r[3]==='<'?x<+r[4]:x<=+r[4]);
      r=sol.match(/^x(<|≤)(-?\d+) 또는 x(>|≥)(-?\d+)$/);
      return (r[1]==='<'?x<+r[2]:x<=+r[2])||(r[3]==='>'?x>+r[4]:x>=+r[4]);};
    for(let x=-8;x<=8;x+=.5)assert.equal(holds(x),inSol(x),p.prompt+' x='+x);
  });
  many('derivative',200,p=>{
    const m=p.prompt.match(/f′\((−?\d+)\)/);const k=N(m[1]);
    const f=new Function('x','return '+p.prompt.match(/f\(x\)=(.+)일 때/)[1].replace(/−/g,'-').replace(/x³/g,'x**3').replace(/x²/g,'x**2').replace(/(\d)x/g,'$1*x'));
    const h=1e-5,d=(f(k+h)-f(k-h))/(2*h);assert.ok(Math.abs(d-N(p.answer))<1e-4,p.prompt);
  });
  many('definiteIntegral',200,p=>{
    const m=p.prompt.match(/^∫\{(−?\d+)\}\{(\d+)\} (.+)dx의/);assert.ok(m,p.prompt);
    const a=N(m[1]),b=N(m[2]);
    const body=m[3].replace(/^\(|\)$/g,'').replace(/−/g,'-').replace(/x\^\{3\}/g,'x**3').replace(/x\^\{2\}/g,'x**2').replace(/(\d)x/g,'$1*x');
    const f=new Function('x','return '+body);let s=0;const n=2000;for(let i=0;i<n;i++){const x=a+(b-a)*(i+.5)/n;s+=f(x)*(b-a)/n;}
    assert.ok(Math.abs(s-N(p.answer))<1e-3,p.prompt+' '+s);
  });
  many('binomialThm',200,p=>{
    const m=p.prompt.match(/\(x\+(\d)\)\^\{(\d)\}의 전개식에서 (?:x\^\{(\d)\}|x)의/);const c=+m[1],n=+m[2],k=m[3]?+m[3]:1;
    assert.equal(N(p.answer),nCr(n,k)*c**(n-k));
  });
  many('repeatComb',200,p=>{
    let m=p.prompt.match(/(\d)종류의 과일 중에서 중복을 허락하여 (\d)개/);if(m)assert.equal(N(p.answer),nCr(+m[1]+ +m[2]-1,+m[2]));
    m=p.prompt.match(/x\+y\+z=(\d)/);if(m)assert.equal(N(p.answer),nCr(+m[1]+2,2));
  });
  many('extrema',200,p=>{
    const f=new Function('x','return '+p.prompt.match(/f\(x\)=(.+)의 극/)[1].replace(/−/g,'-').replace(/x³/g,'x**3').replace(/x²/g,'x**2').replace(/(\d)x/g,'$1*x'));
    const xs=[];for(let x=-6;x<=6;x+=.001){const l=f(x-.001),c=f(x),r=f(x+.001);if(p.prompt.includes('극댓값')?c>l&&c>r:c<l&&c<r)xs.push(c);}
    assert.ok(xs.some(v=>Math.abs(v-N(p.answer))<1e-3),p.prompt+' '+p.answer);
  });
});
test('every interactive high-school lab responds to its controls without NaN',()=>{
  for(const topic of HIGH_TOPICS){
    const def=labs[topic];
    const base={a:0,b:0,c:0,t:0,u:0,...Object.fromEntries(def.controls.map(c=>[c.key,c.initial]))};
    const first=JSON.stringify(def.model(base));
    let changed=false;
    for(const c of def.controls){
      const st=c.step??1,values=c.options??[c.min,c.max,+(c.min+Math.round((c.max-c.min)/2/st)*st).toFixed(4)];
      for(const v of values){
        for(const t of (def.toggles?.[0]?.options.map((_,i)=>i)??[0])){
          const m=def.model({...base,[c.key]:v,t});
          const text=[m.formula,m.value,m.detail,m.aria].join(' ');
          assert.ok(!/NaN|undefined|Infinity/.test(text),topic+' '+c.key+'='+v+': '+text);
          if(JSON.stringify(m)!==first)changed=true;
        }
      }
    }
    assert.ok(changed,topic+' lab must react to its controls');
  }
});
