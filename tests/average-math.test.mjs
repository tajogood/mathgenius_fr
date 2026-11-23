import {test} from 'node:test';
import assert from 'node:assert/strict';
import {totalOf,meanOf,nextEqualizingTransfer,transferOne,equalShares} from '../src/components/labs/averageMath.ts';

test('9, 13, 4의 총합은 26이며 평균은 정확히 8과 3분의 2',()=>{
 const initial=[9,13,4];
 assert.equal(totalOf(initial),26);
 assert.equal(meanOf(initial),26/3);
 assert.deepEqual(equalShares(initial),{whole:8,remainder:2,count:3});
});
test('큰 바구니에서 작은 바구니로 사탕 하나씩 옮겨도 전체 수가 보존된다',()=>{
 let current=[9,13,4];
 const originalTotal=totalOf(current);
 let steps=0;
 while(true){
  const next=nextEqualizingTransfer(current);
  if(!next)break;
  assert.ok(current[next.from]>current[next.to]);
  current=transferOne(current,next.from,next.to);
  assert.equal(totalOf(current),originalTotal);
  steps++;
  assert.ok(steps<30,'과도한 무한 재분배 방지');
 }
 assert.equal(steps,4);
 assert.deepEqual(current,[9,9,8]);
 assert.deepEqual(equalShares(current),{whole:8,remainder:2,count:3});
});
test('나머지 없는 6,12,9는 모두 9개로 평준화된다',()=>{
 let current=[6,12,9];
 for(let i=0;i<3;i++){
  const next=nextEqualizingTransfer(current);
  assert.ok(next);
  current=transferOne(current,next.from,next.to);
  assert.equal(totalOf(current),27);
 }
 assert.deepEqual(current,[9,9,9]);
 assert.equal(nextEqualizingTransfer(current),null);
 assert.deepEqual(equalShares(current),{whole:9,remainder:0,count:3});
});
test('0개 바구니에서 꺼낼 수 없으며 잘못된 이동은 원자료를 보존한다',()=>{
 const values=[0,5,2];
 assert.deepEqual(transferOne(values,0,1),values);
 assert.deepEqual(transferOne(values,1,1),values);
 assert.deepEqual(transferOne(values,-1,2),values);
 assert.deepEqual(values,[0,5,2]);
});
