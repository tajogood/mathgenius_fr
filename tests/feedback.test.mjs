import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS,createProblem } from '../src/math.ts';
import { diagnosticHint,diagnosticCoverage } from '../src/feedback.ts';

test('모든 83개 문제 유형의 오답에 유효한 수학적 재학습 안내가 있다',()=>{
  assert.equal(diagnosticCoverage(),16);
  for(const topic of TOPICS) {
    const p=createProblem(topic);
    const wrong=p.choices.find(choice=>choice!==p.answer);
    assert.ok(wrong,topic);
    const hint=diagnosticHint(p,wrong);
    assert.ok(hint.length>=25,topic);
    assert.ok(hint.includes(wrong),topic);
    assert.ok(!hint.includes('undefined'),topic);
    assert.ok(!hint.includes('NaN'),topic);
    assert.notEqual(hint,diagnosticHint(p,p.answer),topic);
  }
});
