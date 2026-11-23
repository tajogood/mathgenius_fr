import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shapeSamples,isLineSymmetric,isPointSymmetric,reflectAcrossVertical,rotateHalfTurn } from '../src/components/labs/symmetryMath.ts';

test('나비·집 모양은 실제 선대칭이고 ㄱ자는 선대칭이 아니다',()=>{
  assert.equal(isLineSymmetric(shapeSamples.butterfly.vertices),true);
  assert.equal(isLineSymmetric(shapeSamples.house.vertices),true);
  assert.equal(isLineSymmetric(shapeSamples.ell.vertices),false);
});
test('평행사변형·직사각형은 180도 점대칭, 집 모양은 점대칭이 아니다',()=>{
  assert.equal(isPointSymmetric(shapeSamples.parallelogram.vertices),true);
  assert.equal(isPointSymmetric(shapeSamples.rectangle.vertices),true);
  assert.equal(isPointSymmetric(shapeSamples.house.vertices),false);
});
test('선대칭과 점대칭 변환이 교과 개념 그대로 계산된다',()=>{
  assert.deepEqual(reflectAcrossVertical({x:120,y:70},180),{x:240,y:70});
  assert.deepEqual(rotateHalfTurn({x:120,y:70},{x:180,y:110}),{x:240,y:150});
});
