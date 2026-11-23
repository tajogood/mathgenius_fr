import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, createProblem } from '../src/math.ts';
import { LAB_KINDS, interactionForTopic, interactionForProblem,
  clampValue, safeFraction, displayNumber, initialBlockCount, blockGroupSize } from '../src/interactions.ts';
import { curriculumUnits } from '../src/curriculum.ts';

test('83개 문제 유형 모두 정적 SVG 대신 인터랙티브 교구를 갖는다', () => {
  assert.equal(TOPICS.length, 83);
  assert.equal(Object.keys(interactionForTopic).length, TOPICS.length);
  assert.equal(new Set(Object.keys(interactionForTopic)).size, TOPICS.length);
  assert.equal(LAB_KINDS.length, 16);
  const used = new Set(TOPICS.map(t => interactionForTopic[t]));
  assert.deepEqual([...used].sort(), [...LAB_KINDS].sort());
  for (const topic of TOPICS) {
    assert.ok(LAB_KINDS.includes(interactionForTopic[topic]), topic);
    const p = createProblem(topic);
    assert.equal(interactionForProblem(p), interactionForTopic[topic]);
  }
  for (const unit of curriculumUnits) {
    assert.ok(unit.topics.every(topic => LAB_KINDS.includes(interactionForTopic[topic])), unit.id);
  }
});

test('조작 모델의 값은 유효 범위로 제한된다', () => {
  assert.equal(clampValue(-3, 0, 100), 0);
  assert.equal(clampValue(120, 0, 100), 100);
  assert.equal(clampValue(34, 0, 100), 34);
  assert.equal(clampValue(Number.NaN, 0, 100), 0);
  assert.equal(safeFraction(3, 4), 0.75);
  assert.equal(safeFraction(1, 0), 0);
  assert.equal(displayNumber(0.3333, 2), '0.33');
});

test('1학년 세기/10개 묶음은 원래 문제의 수를 유지한다', () => {
  const count = { topic:'count9', a:7, b:0 };
  const large = { topic:'count100', a:87, b:0 };
  const split = { topic:'split', a:7, b:3 };
  const addition = { topic:'addsub', a:5, b:2, mode:'add' };
  assert.equal(initialBlockCount(count), 7);
  assert.equal(blockGroupSize(count), 1);
  assert.equal(initialBlockCount(large), 87);
  assert.equal(blockGroupSize(large), 10);
  assert.equal(initialBlockCount(split), 7);
  assert.equal(initialBlockCount(addition), 7);
});
