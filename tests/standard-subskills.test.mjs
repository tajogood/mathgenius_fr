import {test} from 'node:test';
import assert from 'node:assert/strict';
import {achievementStandards} from '../src/standards.ts';
import {standardLessonMap,standardLessons} from '../src/standards/lessons.ts';
import {extraChecks,extraChecksFor} from '../src/standards/extraChecks.ts';
import {answerStandard,normalizeStandardProgress,masteredStandards} from '../src/standards/progress.ts';

test('121개 독립 수업에 88개 복합 세부 개념 평가가 더해져 총 209개 확인 질문이 있다',()=>{
  assert.equal(achievementStandards.length,121);
  assert.equal(standardLessons.length,121);
  assert.equal(extraChecks.length,88);
  assert.equal(121+extraChecks.length,209);
  const seen=new Set(standardLessons.map(x=>x.check.prompt));
  for(const check of extraChecks){
    assert.ok(standardLessonMap.has(check.id),check.id);
    assert.ok(check.label.length>=2,check.id);
    assert.ok(check.prompt.length>=4,check.id);
    assert.equal(check.choices.length,4,check.id);
    assert.equal(new Set(check.choices).size,4,check.id);
    assert.ok(check.choices.includes(check.answer),check.id);
    assert.ok(!seen.has(check.prompt),'Duplicate authored check '+check.id+' '+check.prompt);
    seen.add(check.prompt);
  }
  assert.equal(extraChecksFor('6수03-14').length,3);
  assert.equal(extraChecksFor('4수03-10').length,4);
  assert.equal(extraChecksFor('2수03-06').length,3);
  for(const code of achievementStandards){
    assert.ok(standardLessonMap.has(code.id),code.id);
  }
});

test('한 문항만 맞힌 표준은 학습 완료되지 않는다',()=>{
  const empty=normalizeStandardProgress(null);
  assert.equal(masteredStandards(empty),0);
  const partial=answerStandard(empty,'6수03-14',true,false);
  assert.equal(partial['6수03-14'].mastered,false);
  const complete=answerStandard(partial,'6수03-14',true,true);
  assert.equal(complete['6수03-14'].mastered,true);
  assert.equal(masteredStandards(complete),1);
  assert.equal(complete['6수03-14'].attempts,2);
  const invalid=answerStandard(complete,'garbage',true,true);
  assert.equal(invalid,complete);
});
