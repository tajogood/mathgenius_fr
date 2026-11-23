import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyProgress,parseProgress,recordAnswer,unitMastery,masteryCount,nextPracticeTopic } from '../src/progress.ts';

test('한 문제를 풀었다고 단원 완료로 표시하지 않는다',()=>{
  let p=emptyProgress();
  p=recordAnswer(p,'1-1-1','count9',true);
  assert.equal(p.attempts,1);
  assert.equal(p.correct,1);
  assert.equal(unitMastery(p,'1-1-1').complete,false);
  assert.equal(unitMastery(p,'1-1-1').mastered,0);
  assert.equal(masteryCount(p),0);
});

test('한 개념을 두 번 연속 맞혀야 달성하며 틀리면 연속 횟수가 초기화된다',()=>{
  let p=emptyProgress();
  p=recordAnswer(p,'1-1-1','count9',true);
  p=recordAnswer(p,'1-1-1','count9',false);
  assert.equal(p.records['1-1-1'].count9.streak,0);
  p=recordAnswer(p,'1-1-1','count9',true);
  assert.equal(p.records['1-1-1'].count9.mastered,false);
  p=recordAnswer(p,'1-1-1','count9',true);
  assert.equal(p.records['1-1-1'].count9.mastered,true);
  assert.equal(unitMastery(p,'1-1-1').mastered,1);
  assert.equal(unitMastery(p,'1-1-1').complete,false);
  assert.equal(p.correct,3);
});

test('복합 단원은 모든 문제 유형의 달성이 필요하다',()=>{
  let p=emptyProgress();
  for(let i=0;i<2;i++)p=recordAnswer(p,'1-1-1','count9',true);
  assert.equal(unitMastery(p,'1-1-1').complete,false);
  assert.equal(nextPracticeTopic(p,'1-1-1','count9'),'split');
  for(let i=0;i<2;i++)p=recordAnswer(p,'1-1-1','split',true);
  assert.equal(unitMastery(p,'1-1-1').complete,true);
  assert.equal(masteryCount(p),1);
});

test('옛 버전 체험 기록을 학습 달성으로 오인하지 않는다',()=>{
  const v1={finished:['1-1-1','2-1-3'],attempts:2,correct:1};
  const p=parseProgress(v1);
  assert.equal(p.finished.length,2);
  assert.equal(p.attempts,2);
  assert.equal(masteryCount(p),0);
  assert.equal(unitMastery(p,'1-1-1').complete,false);
});

test('첫 18개 체험판의 topic ID 학습 기록도 보존한다',()=>{
  const parsed=parseProgress({finished:['fraction','ratio'],attempts:14,correct:9});
  assert.ok(parsed.finished.includes('5-1-5'));
  assert.ok(parsed.finished.includes('6-1-4'));
  assert.equal(parsed.attempts,14);
  assert.equal(parsed.correct,9);
  assert.equal(masteryCount(parsed),0);
});

test('기기에 저장된 기록은 유효한 단원·개념만 재구성한다',()=>{
  const p=parseProgress({
    attempts:3.5,correct:2.8,finished:['1-1-1','not-a-unit','1-1-1'],
    records:{'1-1-1':{
      count9:{attempts:3,correct:2,streak:2,mastered:true},
      unknown:{attempts:200,correct:200,streak:200,mastered:true},
      split:{attempts:-7,correct:3,streak:-1},
    },evil:{count9:{attempts:100,correct:100,streak:100,mastered:true}}}
  });
  assert.equal(p.attempts,3);
  assert.deepEqual(p.finished,['1-1-1']);
  assert.equal(p.records['1-1-1'].count9.mastered,true);
  assert.equal(p.records['1-1-1'].split.attempts,0);
  assert.equal(p.records.evil,undefined);
  assert.equal(p.records['1-1-1'].unknown,undefined);
});
