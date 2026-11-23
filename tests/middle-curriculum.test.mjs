import test from 'node:test';
import assert from 'node:assert/strict';
import {middleGrades,middleUnits,MIDDLE_TOTAL_UNITS,MIDDLE_TOPICS} from '../src/middle/curriculum.ts';
import {createMiddleProblem} from '../src/middle/problems.ts';

test('middle 1–3 has 34 unique topic lessons grouped into six semesters',()=>{
  assert.equal(MIDDLE_TOTAL_UNITS,34);
  assert.equal(middleGrades.length,3);
  assert.equal(new Set(middleUnits.map(u=>u.id)).size,middleUnits.length);
  assert.equal(new Set(middleUnits.map(u=>u.topic)).size,MIDDLE_TOPICS.length);
  for(const grade of middleGrades){
    assert.ok(grade.chapters.length>=10);
    for(const semester of [1,2]){
      assert.ok(grade.chapters.some(u=>u.semester===semester));
    }
  }
});
test('all 34 middle grade topics have distinct valid answer choices and worked solutions',()=>{
  for(const topic of MIDDLE_TOPICS){
    for(let trial=0;trial<100;trial++){
      const problem=createMiddleProblem(topic);
      assert.equal(problem.topic,topic);
      assert.equal(problem.choices.length,4,topic);
      assert.equal(new Set(problem.choices).size,4,topic+': '+JSON.stringify(problem));
      assert.equal(problem.choices.filter(v=>v===problem.answer).length,1,topic);
      assert.ok(problem.prompt.length>7,topic);
      assert.ok(problem.solution.length>=25,topic);
    }
  }
});
test('middle curriculum teaches correct foundational mathematical statements',()=>{
  const find=(topic)=>middleUnits.find(u=>u.topic===topic);
  assert.match(find('pythagoras').concept.join(' '),/a²\+b²=c²/);
  assert.match(find('angles').concept.join(' '),/180°/);
  assert.match(find('quadraticFunction').concept.join(' '),/꼭짓점/);
  assert.match(find('trigonometry').concept.join(' '),/sinθ/);
  assert.match(find('boxplot').concept.join(' '),/사분위/);
});
