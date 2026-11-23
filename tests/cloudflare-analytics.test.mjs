import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const token='d88a528d03094ff5894095a38b1792b8';
const beacon='https://static.cloudflareinsights.com/beacon.min.js';
test('Cloudflare Web Analytics loads once on the main free math app',()=>{
 const html=readFileSync('dist/index.html','utf8');
 assert.equal(html.split(beacon).length-1,1);
 assert.ok(html.includes(token));
 assert.ok(html.includes('data-cf-beacon'));
});
test('All public static SEO pages include the same analytics beacon',()=>{
 for(const route of ['for-parents','for-teachers','for-education','curriculum',
  ...Array.from({length:6},(_,i)=>'curriculum/grade-'+(i+1)),
  'curriculum/middle',
  ...Array.from({length:3},(_,i)=>'curriculum/middle-'+(i+1))]){
  const html=readFileSync('dist/'+route+'/index.html','utf8');
  assert.equal(html.split(beacon).length-1,1,route+' should have one tracker');
  assert.ok(html.includes(token),route+' should use production token');
 }
});
test('Cloudflare Pages build uses its own pages.dev analytics token',()=>{
 const src=readFileSync('scripts/generate-seo.mjs','utf8');
 assert.match(src,/defaultPagesAnalyticsToken='ef4f06e8eea14dd48885684291e55231'/);
 assert.match(src,/CF_PAGES === '1' \? defaultPagesAnalyticsToken : defaultGithubAnalyticsToken/);
});
