import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ROUND_SOLID_PARTS,coneNetSectorAngle,cylinderLateralDimensions,roundSurfaceExplanation} from '../src/components/labs/roundSolidMath.ts';

test('원기둥, 원뿔, 구의 밑면·곡면·꼭짓점 구분이 수학적으로 정확하다',()=>{
 assert.deepEqual(ROUND_SOLID_PARTS.cylinder,
   {flatBases:2,curvedSurfaces:1,apices:0,circularEdges:2});
 assert.deepEqual(ROUND_SOLID_PARTS.cone,
   {flatBases:1,curvedSurfaces:1,apices:1,circularEdges:1});
 assert.deepEqual(ROUND_SOLID_PARTS.sphere,
   {flatBases:0,curvedSurfaces:1,apices:0,circularEdges:0});
});
test('원기둥 펼친 직사각형 너비는 원의 둘레이고 높이는 원기둥의 높이다',()=>{
 const [width,height]=cylinderLateralDimensions(3,5);
 assert.ok(Math.abs(width-6*Math.PI)<1e-8);
 assert.equal(height,5);
});
test('원뿔 부채꼴의 호 길이는 밑면 원의 둘레와 같아야 한다',()=>{
 for(const r of [1,2,3])for(const h of [2,4,7]){
  const sectorAngle=coneNetSectorAngle(r,h);
  const slant=Math.hypot(r,h);
  assert.ok(Math.abs(slant*sectorAngle-2*Math.PI*r)<1e-8);
 }
});
test('구는 평평한 밑면이 없으며 원뿔에는 뾰족한 꼭짓점이 하나다',()=>{
 assert.match(roundSurfaceExplanation('sphere','base'),/없어요/);
 assert.match(roundSurfaceExplanation('cone','apex'),/1개/);
 assert.match(roundSurfaceExplanation('cylinder','curve'),/직사각형/);
});
