import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  SOLID_FACE_IDS,SOLID_FACE_NAMES,SOLID_EDGE_IDS,SOLID_VERTEX_IDS,
  cuboidFaceEdges,cuboidFaceVertices,faceDimensions,cuboidSurfaceArea,cuboidVolume,
  facesForEdge,facesForVertex
} from '../src/components/labs/solidMath.ts';

test('직육면체는 실제 면 6개, 모서리 12개, 꼭짓점 8개로 연결된다',()=>{
 assert.equal(SOLID_FACE_IDS.length,6);
 assert.equal(SOLID_EDGE_IDS.length,12);
 assert.equal(SOLID_VERTEX_IDS.length,8);
 for(const face of SOLID_FACE_IDS){
  assert.ok(SOLID_FACE_NAMES[face]);
  assert.equal(cuboidFaceEdges[face].length,4,face);
  assert.equal(cuboidFaceVertices[face].length,4,face);
 }
 for(const edge of SOLID_EDGE_IDS)assert.equal(facesForEdge(edge).length,2,edge);
 for(const vertex of SOLID_VERTEX_IDS)assert.equal(facesForVertex(vertex).length,3,vertex);
});
test('5×3×2 직육면체의 각 면 치수는 동일한 전개도에 대응한다',()=>{
 const size={width:5,height:3,depth:2};
 assert.deepEqual(faceDimensions('front',size),[5,3]);
 assert.deepEqual(faceDimensions('back',size),[5,3]);
 assert.deepEqual(faceDimensions('top',size),[5,2]);
 assert.deepEqual(faceDimensions('bottom',size),[5,2]);
 assert.deepEqual(faceDimensions('left',size),[2,3]);
 assert.deepEqual(faceDimensions('right',size),[2,3]);
 assert.equal(cuboidSurfaceArea(size),62);
 assert.equal(cuboidVolume(size),30);
});
test('정육면체 모서리가 모두 같을 때 겉넓이는 6s²이고 부피는 s³',()=>{
 for(let side=2;side<=6;side++){
  const size={width:side,height:side,depth:side};
  assert.equal(cuboidSurfaceArea(size),6*side*side);
  assert.equal(cuboidVolume(size),side*side*side);
  for(const face of SOLID_FACE_IDS)assert.deepEqual(faceDimensions(face,size),[side,side]);
 }
});
