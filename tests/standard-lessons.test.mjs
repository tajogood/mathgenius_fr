import { test } from 'node:test';
import assert from 'node:assert/strict';
import {achievementStandards} from '../src/standards.ts';
import {TOPICS,createProblem} from '../src/math.ts';
import {standardLessons,standardAssessments,standardLessonMap,standardSections} from '../src/standards/lessons.ts';

test('국가 성취기준 121개 각각에 독립된 학습 목표·조작 활동·개념 확인 문제·해설이 있다',()=>{
  assert.equal(standardLessons.length,121);
  assert.equal(new Set(standardLessons.map(item=>item.id)).size,121);
  assert.equal(achievementStandards.length,121);
  assert.deepEqual(standardSections().map(x=>x.lessons.length),[29,47,45]);
  const codes=new Set(achievementStandards.map(item=>item.id));
  const checks=new Set();
  for(const lesson of standardLessons){
    assert.ok(codes.has(lesson.id),lesson.id);
    assert.ok(standardLessonMap.has(lesson.id),lesson.id);
    assert.ok(TOPICS.includes(lesson.topic),lesson.id);
    for(const key of ['title','discover','principle','explanation']){
      assert.ok(lesson[key].length>(key==='title'?4:12),lesson.id+' '+key);
    }
    assert.ok(lesson.check.prompt.length>5,lesson.id);
    assert.equal(lesson.check.choices.length,4,lesson.id);
    assert.equal(new Set(lesson.check.choices).size,4,lesson.id);
    assert.ok(lesson.check.choices.includes(lesson.check.answer),lesson.id);
    assert.ok(!checks.has(lesson.check.prompt),lesson.id+' reused a conceptual check');
    checks.add(lesson.check.prompt);
    const [concept,application]=standardAssessments(lesson);
    for(const item of [concept,application]){
      assert.ok(item.choices.includes(item.answer),lesson.id);
      assert.equal(item.choices.length,4,lesson.id);
      assert.equal(new Set(item.choices).size,4,lesson.id);
      assert.ok(item.question.length>=5,lesson.id);
    }
  }
  for(const code of codes)assert.ok(standardLessonMap.has(code),code);
});

test('121개 성취기준마다 자동 변형 평가를 20회 생성해도 채점 보기가 유효하다',()=>{
  for(const lesson of standardLessons){
    for(let n=0;n<20;n++){
      const p=createProblem(lesson.topic);
      assert.ok(p.choices.includes(p.answer),lesson.id);
      assert.equal(p.choices.length,4,lesson.id);
      assert.equal(new Set(p.choices).size,4,lesson.id);
      assert.ok(!p.choices.includes('undefined'),lesson.id);
      assert.ok(!p.choices.includes('NaN'),lesson.id);
    }
  }
});
