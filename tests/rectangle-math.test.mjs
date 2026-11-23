import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
 RECTANGLE_EDGES,rectangleArea,rectanglePerimeter,
 rectangleEdgeLength,selectedArea,selectedPerimeter
} from '../src/components/labs/rectangleMath.ts';

test('5cm x 3cm에서 각 1cm² 칸을 세면 5+5+5=15cm²',()=>{
 assert.equal(rectangleArea(5,3),15);
 const rows=new Set([0,1]);
 assert.equal(selectedArea(5,rows),10);
 rows.add(2);
 assert.equal(selectedArea(5,rows),15);
 assert.equal(5+5+5,rectangleArea(5,3));
});

test('바깥 네 변 5cm+3cm+5cm+3cm는 16cm이고 면적과 단위가 다르다',()=>{
 assert.deepEqual(RECTANGLE_EDGES.map(edge=>rectangleEdgeLength(5,3,edge)),[5,3,5,3]);
 assert.equal(rectanglePerimeter(5,3),16);
 assert.equal(selectedPerimeter(5,3,new Set(['top','right'])),8);
 assert.equal(selectedPerimeter(5,3,new Set(RECTANGLE_EDGES)),16);
 assert.notEqual(rectanglePerimeter(5,3),rectangleArea(5,3));
});

test('넓이는 cm², 둘레는 cm로 측정하며 크기 변경에도 계산이 올바르다',()=>{
 for(let width=2;width<=9;width++){
   for(let height=2;height<=7;height++){
     assert.equal(rectangleArea(width,height),width*height);
     assert.equal(rectanglePerimeter(width,height),2*(width+height));
     assert.equal(RECTANGLE_EDGES.reduce((sum,edge)=>sum+rectangleEdgeLength(width,height,edge),0),
       rectanglePerimeter(width,height));
   }
 }
});
