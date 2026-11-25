import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root='dist';
test('middle school grade guides are static-indexable and have live course entry',()=>{
  const sitemap=readFileSync(root+'/sitemap.xml','utf8');
  for(const grade of [1,2,3]){
    const uri='/curriculum/middle-'+grade+'/';
    assert.ok(sitemap.includes(uri),'sitemap must include '+uri);
    const html=readFileSync(root+'/curriculum/middle-'+grade+'/index.html','utf8');
    assert.match(html,new RegExp('중학교 '+grade+'학년'));
    assert.ok(html.includes('level=middle&amp;grade='+grade));
    assert.ok(html.includes('canonical'));
    assert.ok(html.includes('수학'));
    assert.ok(html.includes('수학천재'));
  }
  assert.ok(sitemap.includes('/curriculum/middle/'));
});
