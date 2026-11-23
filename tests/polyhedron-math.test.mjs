import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildPolyhedron,polyhedronCounts,facesContainingEdge,facesContainingVertex,netFaces,projectPoint} from '../src/components/labs/polyhedronMath.ts';

test('삼각기둥은 한 덩어리로 연결된 면 5개, 모서리 9개, 꼭짓점 6개다',()=>{
 const solid=buildPolyhedron('prism',3);
 assert.equal(solid.faces.length,5);
 assert.equal(solid.edges.length,9);
 assert.equal(solid.vertices.length,6);
 assert.deepEqual(polyhedronCounts('prism',3),{faces:5,edges:9,vertices:6,bases:2,sideFaces:3});
 assert.equal(netFaces('prism',3).total,5);
 for(const edge of solid.edges)assert.equal(facesContainingEdge(solid,edge).length,2);
 for(let v=0;v<6;v++)assert.equal(facesContainingVertex(solid,v).length,3);
});
test('삼각뿔은 삼각형 4면, 모서리 6개, 꼭짓점 4개다',()=>{
 const solid=buildPolyhedron('pyramid',3);
 assert.equal(solid.faces.length,4);
 assert.equal(solid.edges.length,6);
 assert.equal(solid.vertices.length,4);
 assert.deepEqual(polyhedronCounts('pyramid',3),{faces:4,edges:6,vertices:4,bases:1,sideFaces:3});
 for(const edge of solid.edges)assert.equal(facesContainingEdge(solid,edge).length,2);
 for(let v=0;v<4;v++)assert.equal(facesContainingVertex(solid,v).length,3);
});
test('밑면의 변 수가 3에서 8까지 바뀔 때 입체의 면, 모서리, 꼭짓점도 정확하다',()=>{
 for(let n=3;n<=8;n++)for(const kind of ['prism','pyramid']){
  const solid=buildPolyhedron(kind,n),count=polyhedronCounts(kind,n);
  assert.equal(solid.faces.length,count.faces);
  assert.equal(solid.edges.length,count.edges);
  assert.equal(solid.vertices.length,count.vertices);
  assert.equal(netFaces(kind,n).total,count.faces);
  const faces=solid.faces;
  assert.equal(faces.filter(f=>f.kind==='base').length,count.bases);
  assert.equal(faces.filter(f=>f.kind==='side').length,n);
  for(const edge of solid.edges)assert.equal(facesContainingEdge(solid,edge).length,2);
  for(let i=0;i<solid.vertices.length;i++){
    assert.equal(facesContainingVertex(solid,i).length,kind==='pyramid'&&i===n?n:3);
  }
 }
});
test('마우스로 회전할 때 입체 꼭짓점의 실제 투영 좌표와 원근이 변한다',()=>{
 const v=buildPolyhedron('prism',4).vertices[0];
 const first=projectPoint(v,-29,25);
 const second=projectPoint(v,35,25);
 assert.notEqual(first.x,second.x);
 assert.ok(first.depth!==second.depth);
 for(const p of [first,second])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
});
