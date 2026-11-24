import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root='dist';
const slugs=['high','high-common-1','high-common-2','high-algebra','high-calculus-1','high-probability-statistics'];
test('high-school guides are static-indexable, in the sitemap and open the live course',{skip:!existsSync(root+'/sitemap.xml')&&'run npm run build with SITE_URL first'},()=>{
  const sitemap=readFileSync(root+'/sitemap.xml','utf8');
  for(const slug of slugs){
    assert.ok(sitemap.includes('/curriculum/'+slug+'/'),'sitemap must include '+slug);
    const html=readFileSync(root+'/curriculum/'+slug+'/index.html','utf8');
    assert.ok(html.includes('canonical'));
    assert.ok(html.includes('level=high&amp;course='));
    assert.match(html,/고등/);
    assert.ok(!/\{\{|\^\{|_\{/.test(html),slug+' must not leak math markup');
  }
  assert.match(readFileSync(root+'/curriculum/high-calculus-1/index.html','utf8'),/미적분Ⅰ/);
  assert.match(readFileSync(root+'/index.html','utf8'),/고등학교/);
});
