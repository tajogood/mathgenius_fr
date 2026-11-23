import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grades, curriculumUnits, TOTAL_UNITS } from '../src/curriculum.ts';
import { TOPICS, createProblem, solutionSteps, gcd } from '../src/math.ts';

const fraction = (a,b) => { const k=gcd(a,b); return (a/k)+'/'+(b/k); };
const numeric = (n) => String(n);

test('학년별 두 학기 · 71개 단원 · 고유 코드', () => {
  assert.equal(grades.length,6);
  assert.equal(TOTAL_UNITS,71);
  assert.equal(curriculumUnits.length,71);
  assert.equal(new Set(curriculumUnits.map(unit=>unit.id)).size,71);
  for (const g of grades) {
    assert.equal(g.chapters.length,g.grade===1?11:12);
    for(const sem of [1,2]) {
      const units=g.chapters.filter(ch=>ch.semester===sem);
      assert.equal(units.length,g.grade===1&&sem===1?5:6);
      assert.ok(units.every((ch,i)=>ch.grade===g.grade && ch.number===i+1 && ch.topics.length>=1));
    }
    for(const unit of g.chapters) {
      assert.ok(unit.concept.every(line=>line.length>=5));
      assert.ok(unit.topics.every(topic=>TOPICS.includes(topic)));
      assert.ok(unit.label.length>2);
    }
  }
});

function verifyExpanded(p) {
  const a=p.a,b=p.b,c=p.c,d=p.d;
  switch(p.topic) {
    case 'capacity': return (a*1000+b)+'mL';
    case 'multiples': assert.equal(a*b,Number(p.answer)); return String(a*b);
    case 'roundup': return String(Math.ceil(a/b)*b);
    case 'rounddown': return String(Math.floor(a/b)*b);
    case 'fractioncompare': {
      const delta=a*d-c*b; return delta===0?'=':delta>0?'>':'<';
    }
    case 'fractionsub': return fraction(a*d-c*b,b*d);
    case 'bandgraph': return a+'%';
    case 'naturalfraction': return fraction(a,b);
    case 'circumference': return String(Number((a*2*3.14).toFixed(2)))+'cm';
    case 'anglesum': return (a-2)*180+'°';
    case 'timecalc': return (b+c)+'분';
    case 'decimalcompare': return a>b?'>':'<';
    case 'pyramid': return String(a+1);
    case 'range': return p.mode==='이상'?'포함':'포함하지 않음';
    case 'gcdlcm': return String(p.mode==='gcd'?gcd(a,b):a*b/gcd(a,b));
    case 'fractiontypes': return ['진분수','가분수','대분수'][a];
    case 'solidviews': return String(a*b);
    case 'count9': case 'count50': case 'count100': case 'classify':
    case 'datagraph': case 'organize': case 'bargraph': return numeric(a);
    case 'compare': return a>b?'>':'<';
    case 'place3': case 'place4': case 'bigplace': return numeric(Math.floor(a/10**b)%10*10**b);
    case 'measurelength': return (a*100+b)+'cm';
    case 'measureweight': return (a*1000+b)+'g';
    case 'column3': return numeric(a+b);
    case 'longmultiply': return numeric(a*b);
    case 'longdivide': return numeric(a/b);
    case 'circle': return (a*2)+'cm';
    case 'patterns': return numeric(a+3*b);
    case 'linegraph': return numeric(b);
    case 'polygons': return a+'각형';
    case 'mixedcalc': return numeric(a+b*c);
    case 'factors': assert.equal(a%b,0); return numeric(b);
    case 'correspond': return numeric(a*c+b);
    case 'rounding': return numeric(Math.round(a/b)*b);
    case 'decimalmul': return (a*b/100).toFixed(2);
    case 'decimaldiv': return (a/10).toFixed(1);
    case 'decimalsub': return ((a-b)/10).toFixed(1);
    case 'samefraction': return fraction(p.mode==='subtract'?a-b:a+b,c);
    case 'fractionmul': return fraction(a*c,b*d);
    case 'fractiondiv': return fraction(a*d,b*c);
    case 'decimalintro': return (a/10).toFixed(1);
    case 'circlegraph': return (a*10)+'%';
    case 'surface': return 2*(a*b+a*c+b*c)+'cm²';
    case 'stacking': return numeric(a*b*c);
    case 'circlearea': return String(Number((a*a*3.14).toFixed(2)))+'cm²';
    case 'perimeter': return 2*(a+b)+'cm';
    case 'proportionshare': return a*(c/(a+b))+'개';
    case 'polyhedra': return numeric(a*2);
    case 'nets': return '6개';
    case 'probability': return fraction(a,10);
    case 'average': {
      assert.ok(Math.abs(Number(p.answer)-(a+b+c)/3)<0.051);
      return p.answer;
    }
    case 'shapes3d': return ['직육면체','원기둥','구'][a];
    case 'curvedsolids': return ['원기둥','원뿔','구'][a];
    case 'triangletypes': return ['정삼각형','이등변삼각형','직각삼각형'][a];
    case 'quadtypes': return ['정사각형','직사각형','평행사변형','사다리꼴'][a];
    case 'symmetry': return a===0?'선대칭':'점대칭';
    case 'lines': return ['직선','선분','반직선'][a];
    case 'divremainder': return '몫 '+Math.floor(a/b)+', 나머지 '+(a%b);
    default: return null;
  }
}

for(const topic of TOPICS) {
  test('전 학년 문제 엔진: '+topic+' (80회)',()=>{
    for(let i=0;i<80;i++){
      const problem=createProblem(topic);
      assert.equal(problem.topic,topic);
      assert.equal(problem.choices.length,4,JSON.stringify(problem));
      assert.equal(new Set(problem.choices).size,4,JSON.stringify(problem));
      assert.equal(problem.choices.filter(x=>x===problem.answer).length,1,JSON.stringify(problem));
      const expected=verifyExpanded(problem);
      if(expected!==null) assert.equal(problem.answer,expected,JSON.stringify(problem));
      const steps=solutionSteps(problem);
      assert.equal(steps.length,3,topic);
      assert.ok(steps.every(v=>typeof v==='string'&&v.length>=8),topic);
    }
  });
}

test('71개 모든 단원 문제 유형이 실제 출제 가능',()=>{
  for (const chapter of curriculumUnits) {
    for (const topic of chapter.topics) {
      const problem=createProblem(topic);
      assert.equal(problem.topic,topic);
      assert.ok(problem.answer.length>0);
      assert.ok(problem.choices.includes(problem.answer));
    }
  }
});

import { achievementStandards, STANDARDS_TOTAL, standardsForChapter } from '../src/standards.ts';

test('2022 개정 국가 수학 성취기준 코드 121개가 단원과 연결됨', () => {
  assert.equal(STANDARDS_TOTAL, 121);
  assert.equal(achievementStandards.length, 121);
  assert.equal(new Set(achievementStandards.map(s => s.id)).size, 121);
  const counts = {
    '1~2학년': achievementStandards.filter(s => s.band === '1~2학년').length,
    '3~4학년': achievementStandards.filter(s => s.band === '3~4학년').length,
    '5~6학년': achievementStandards.filter(s => s.band === '5~6학년').length,
  };
  assert.deepEqual(counts, { '1~2학년': 29, '3~4학년': 47, '5~6학년': 45 });
  const known = new Set(curriculumUnits.map(unit=>unit.id));
  for(const standard of achievementStandards){
    assert.ok(standard.chapterIds.length>=1,standard.id);
    assert.ok(standard.chapterIds.every(id=>known.has(id)),standard.id);
  }
  for(const unit of curriculumUnits){
    assert.ok(standardsForChapter(unit.id).length>=1,unit.id);
  }
});
