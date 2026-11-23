import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASE_TOPICS, createProblem, solutionSteps, fractionText, percentage } from '../src/math.ts';

const shapes = ['원', '세모', '네모', '직사각형'];
const movements = ['밀기', '뒤집기', '돌리기'];

function expectedAnswer(p) {
  switch (p.topic) {
    case 'split': return String(p.a - p.b);
    case 'addsub': return String(p.mode === 'subtract' ? p.a - p.b : p.a + p.b);
    case 'shapes': return shapes[p.a];
    case 'carry': return String(p.a + p.b);
    case 'multiply': return String(p.a * p.b);
    case 'clock': return String(p.a) + '시' + (p.b === 0 ? '' : ' ' + String(p.b) + '분');
    case 'divide': return String(p.b);
    case 'fractionintro': return fractionText(p.a, p.b);
    case 'lengthtime': return String(p.mode === 'length' ? p.a * 100 + p.b : p.a * 60)
      + (p.mode === 'length' ? 'cm' : '초');
    case 'angles': return p.a + '°';
    case 'transform': return movements[p.a];
    case 'decimaladd': return ((p.a + p.b) / 10).toFixed(1);
    case 'fraction': return fractionText(p.a * p.d + p.c * p.b, p.b * p.d);
    case 'reduce': return fractionText(p.a, p.b);
    case 'area': return p.a * p.b + 'cm²';
    case 'ratio': return percentage(p.a, p.a + p.b);
    case 'proportion': return String(p.b * p.c);
    case 'volume': return p.a * p.b * p.c + 'cm³';
    default: throw new Error('누락된 단원: ' + p.topic);
  }
}

test('18개 단원 모두 문제를 생성한다', () => {
  assert.equal(BASE_TOPICS.length, 18);
  assert.equal(new Set(BASE_TOPICS).size, 18);
});

for (const topic of BASE_TOPICS) {
  test(topic + ': 문제, 보기, 답, 3단계 해설이 일치한다 (150회)', () => {
    for (let i = 0; i < 150; i++) {
      const p = createProblem(topic);
      assert.equal(p.topic, topic);
      assert.ok(p.prompt.length > 0);
      assert.equal(p.answer, expectedAnswer(p), JSON.stringify(p));
      assert.equal(p.choices.length, 4, JSON.stringify(p));
      assert.equal(new Set(p.choices).size, 4, JSON.stringify(p));
      assert.equal(p.choices.filter(choice => choice === p.answer).length, 1);
      const steps = solutionSteps(p);
      assert.equal(steps.length, 3);
      assert.ok(steps.every(step => step.length > 4));
      if (topic === 'addsub' && p.mode === 'subtract') assert.ok(p.a >= p.b);
    }
  });
}
