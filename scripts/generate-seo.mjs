import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { curriculumUnits } from '../src/curriculum.ts';
import {middleGrades as middleCourses,middleUnits} from '../src/middle/curriculum.ts';

const outDir = resolve(process.env.SEO_DIST_DIR || 'dist');
const contents = JSON.parse(readFileSync(new URL('./seo-content.json', import.meta.url), 'utf8'));
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
})[char]);
const metaTag = (kind,name,content) =>
  '<meta '+kind+'="'+escapeHtml(name)+'" content="'+escapeHtml(content)+'">';
const ldJson = object => '<script type="application/ld+json">' +
  JSON.stringify(object).replace(/</g,'\\u003c') + '</script>';

function normalizeSiteUrl(raw) {
  if(!raw?.trim())return null;
  const u = new URL(raw.trim());
  if ((u.protocol !== 'https:' && !(u.protocol==='http:' &&
       ['localhost','127.0.0.1'].includes(u.hostname))) ||
      u.search || u.hash || u.username || u.password) {
    throw new Error('SITE_URL must be HTTPS without query, fragment or credentials');
  }
  u.pathname=u.pathname.replace(/\/+$/,'')+'/';
  return u.href;
}
// Cloudflare Pages automatically sets CF_PAGES, CF_PAGES_BRANCH and CF_PAGES_URL.
// Keep production canonicals stable rather than pointing at an ephemeral deployment URL.
// SITE_URL overrides this value when a purchased custom domain is ready.
const siteUrl=normalizeSiteUrl(
  process.env.SITE_URL ||
  (process.env.CF_PAGES === '1' ?
    (process.env.CF_PAGES_BRANCH === 'source' ?
      'https://mathgenius-b0c.pages.dev/' :
      (process.env.CF_PAGES_URL || 'https://mathgenius-b0c.pages.dev/')) :
    null)
);

// The original Web Analytics token belongs to tajogood.github.io. Cloudflare
// validates the hostname, so it must never be silently reused for pages.dev.
const defaultGithubAnalyticsToken='d88a528d03094ff5894095a38b1792b8';
// mathgenius-b0c.pages.dev 용 별도 Web Analytics 사이트 토큰 (Cloudflare Pages 빌드 기본값)
const defaultPagesAnalyticsToken='ef4f06e8eea14dd48885684291e55231';
const trackingToken=(process.env.WEB_ANALYTICS_TOKEN ||
  (process.env.CF_PAGES === '1' ? defaultPagesAnalyticsToken : defaultGithubAnalyticsToken)).trim();
if(trackingToken && !/^[a-f0-9]{32}$/i.test(trackingToken)) {
  throw new Error('WEB_ANALYTICS_TOKEN must be a 32-character Cloudflare Web Analytics site token');
}
const trackerTag=trackingToken?
  '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='+
  "'"+JSON.stringify({token:trackingToken})+"'"+'></script>':'';
const oldTrackerPattern=/<script type="module" src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js" data-cf-beacon='[^']*'><\/script>/g;
const absolute=slug=>siteUrl?new URL(slug?slug+'/':'',siteUrl).href:null;
const siteName='수학천재 MathGenius';
const gradeDescriptions={
  1:'수의 뜻을 블록으로 세어 보고, 같은 수를 가르고 모으며 주변의 여러 가지 모양을 관찰하는 출발 단계입니다.',
  2:'세 자리 수와 네 자리 수, 덧셈·뺄셈, 곱셈구구 등 수의 구조를 살펴보고 측정과 표·그래프로 확장합니다.',
  3:'나눗셈과 곱셈, 분수·소수의 첫 개념, 평면도형과 측정 개념을 조작 활동으로 살펴봅니다.',
  4:'분수·소수의 연산을 이어 가고, 각도와 평면도형의 성질, 그래프와 자료 표현을 구체적으로 다룹니다.',
  5:'약수·배수, 분수·소수의 계산, 도형의 합동과 넓이, 평균 등 추상적인 개념을 시각적으로 이해합니다.',
  6:'비와 비율, 비례식, 원, 입체도형의 부피·겉넓이, 자료 분석 등 중학교 학습과 연결되는 개념을 탐색합니다.',
};
const gradeInfo=grade=>{
  const units=curriculumUnits.filter(unit=>unit.grade===grade);
  const names=[...new Set(units.map(unit=>unit.title))].slice(0,5).join('·');
  return {
    slug:'curriculum/grade-'+grade,
    title:'초등학교 '+grade+'학년 수학 단원·개념 체험 | 수학천재',
    description:'초등 '+grade+'학년 수학 학습 가이드. '+names+
      ' 등 1·2학기 단원을 살펴보고, 그림과 조작 교구로 개념을 체험해 보세요.',
    eyebrow:'초등 '+grade+'학년 수학',
    headline:'초등학교 '+grade+'학년 수학 1·2학기 단원과 개념',
    intro:gradeDescriptions[grade],
  };
};
const grades=Array.from({length:6},(_,i)=>gradeInfo(i+1));
const curriculumPage={
  slug:'curriculum',
  title:'초등 1~6학년 수학 단원 목록 | 수학천재',
  description:'초등학교 1~6학년 1·2학기 수학 단원과 개념을 살펴보세요. 분수·도형·넓이·평균·비율·부피 등 인터랙티브 교구 학습을 체험할 수 있습니다.',
  eyebrow:'초등 수학 1~6학년 교육과정 참고 안내',
  headline:'초등 1~6학년 수학, 학년별 단원과 학습 내용',
  intro:'수학천재는 2022 개정 수학과 교육과정을 참고해 1~6학년 교재형 단원들을 구성합니다. 단원명과 배열은 학교와 교과서 출판사에 따라 다를 수 있으며, 공식 교과서 목차를 그대로 재현한 자료는 아닙니다.',
};
const middleOverview={
  slug:'curriculum/middle',
  title:'중학교 1~3학년 수학 직접 탐구·문제 풀이 | 수학천재',
  description:'중1·중2·중3 수학: 소인수분해·일차방정식·함수·도형·확률·이차함수·삼각비까지 회원가입 없이 수학 개념을 직접 움직이며 배워요.',
  eyebrow:'중등 수학 1~3학년',
  headline:'중학교 1·2·3학년 수학 개념과 실험 학습',
  intro:'2022 개정 수학과 교육과정을 참고한 자체 편제로 구성했습니다. 2026년에는 중1·중2에 적용되고 중3에는 2027학년도부터 적용되며 교과서별 배열은 다를 수 있습니다.',
};
const middlePages=([1,2,3]).map(grade=>({
  slug:'curriculum/middle-'+grade,
  title:'중학교 '+grade+'학년 수학 단원·개념 실험 | 수학천재',
  description:'중'+grade+' 수학 1·2학기 단원을 직접 탐구합니다. '+
    middleUnits.filter(u=>u.grade===grade).slice(0,5).map(u=>u.title).join('·')+
    ' 등 그래프와 도형을 직접 조절하고 문제를 풀어보세요.',
  eyebrow:'중학교 '+grade+'학년 수학',
  headline:'중'+grade+' 수학 1·2학기 그래프·도형 탐구와 문제 풀이',
  intro:'중'+grade+' 학생을 위한 자체 개념 수업과 문제 풀이입니다. '+
    (grade===3?'2022 개정 중3 과정은 2027학년도부터 적용됩니다. ':'')+
    '단원 배치와 학교·교과서 진도는 다를 수 있습니다.',
}));
const routes=[
  {slug:''},
  ...contents.pages,
  curriculumPage,
  ...grades,
  middleOverview,
  ...middlePages,
];

function orgSchema(){
  return {
    '@type':'Organization',name:'주식회사 라릭',url:'https://larix.kr',
    '@id':siteUrl?new URL('#organization',siteUrl).href:undefined,
    brand:{'@type':'Brand',name:siteName},
  };
}
function homeSchema(){
  const org=siteUrl?{'@id':new URL('#organization',siteUrl).href}:orgSchema();
  return {'@context':'https://schema.org','@graph':[
    orgSchema(),
    {'@type':'WebSite',name:siteName,url:siteUrl||undefined,
      inLanguage:'ko-KR',publisher:org},
    {'@type':['WebApplication','EducationalApplication'],
      name:'수학천재',url:siteUrl||undefined,inLanguage:'ko-KR',
      description:'초등학교 1~6학년 및 중학교 1~3학년 수학을 직접 조작하는 시각 교구로 학습하는 한국어 웹앱',
      operatingSystem:'Web',applicationCategory:'EducationalApplication',
      educationalLevel:'초등학교 1~6학년 및 중학교 1~3학년',isAccessibleForFree:true,
      offers:{'@type':'Offer',price:'0',priceCurrency:'KRW',description:'수학천재 수학 학습'},
      provider:org,
      audience:[
        {'@type':'EducationalAudience',educationalRole:'student'},
        {'@type':'EducationalAudience',educationalRole:'parent'},
        {'@type':'EducationalAudience',educationalRole:'teacher'},
      ],
    },
  ]};
}
function pageSchema(page){
  const u=absolute(page.slug);
  return {'@context':'https://schema.org','@graph':[
    {'@type':'WebPage',name:page.title,description:page.description,
      inLanguage:'ko-KR',url:u||undefined,
      isPartOf:{'@type':'WebSite',name:siteName,url:siteUrl||undefined}},
    {'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'수학천재',item:siteUrl||undefined},
      {'@type':'ListItem',position:2,name:page.title,item:u||undefined},
    ]},
  ]};
}
function homepageTags(){
  const url=absolute('');
  const tags=[
    url?'<link rel="canonical" href="'+escapeHtml(url)+'">':'',
    url?metaTag('property','og:url',url):'',
    process.env.GOOGLE_SITE_VERIFICATION?metaTag('name','google-site-verification',process.env.GOOGLE_SITE_VERIFICATION):'',
    process.env.NAVER_SITE_VERIFICATION?metaTag('name','naver-site-verification',process.env.NAVER_SITE_VERIFICATION):'',
  ];
  return tags.filter(Boolean).join('\n    ');
}
function relativeRoot(slug) {
  return '../'.repeat(slug.split('/').length);
}
function navHtml(prefix) {
  const nav=[
    ['학부모','for-parents'],['초등 교사','for-teachers'],
    ['교육 관계자','for-education'],['초등 단원','curriculum'],['중등 수학','curriculum/middle'],
  ];
  return '<nav aria-label="학습 정보">' + nav.map(([name,slug])=>
    '<a href="'+prefix+slug+'/">'+escapeHtml(name)+'</a>').join(' ')+'</nav>';
}
function pageHtml(page,body){
  const prefix=relativeRoot(page.slug);
  const middleGrade=page.slug.match(/^curriculum\/middle-([123])$/)?.[1];
  const studyQuery=middleGrade?'?level=middle&amp;grade='+middleGrade:
    '?guest=1'+(page.slug.startsWith('curriculum/grade-')?'&amp;grade='+page.slug.slice(-1):'');
  const url=absolute(page.slug);
  const head=[
    '<!doctype html><html lang="ko"><head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    '<meta name="theme-color" content="#f7f8ff">',
    '<title>'+escapeHtml(page.title)+'</title>',
    metaTag('name','description',page.description),
    metaTag('property','og:type','website'),
    metaTag('property','og:locale','ko_KR'),
    metaTag('property','og:site_name',siteName),
    metaTag('property','og:title',page.title),
    metaTag('property','og:description',page.description),
    metaTag('name','twitter:card','summary'),
    url?'<link rel="canonical" href="'+escapeHtml(url)+'">':'',
    url?metaTag('property','og:url',url):'',
    ldJson(pageSchema(page)),
    '<link rel="icon" href="'+prefix+'icon.svg" type="image/svg+xml">',
    '<link rel="stylesheet" href="'+prefix+'seo-guide.css">',
    trackerTag,
    '</head><body>',
  ].filter(Boolean).join('\n');
  return head +
    '<header><a class="brand" aria-label="수학천재 홈" href="'+prefix+'">✦ 수학천재</a>'+
    navHtml(prefix)+'</header>'+
    '<main><p><a href="'+prefix+'">수학천재 홈</a> / 학습 안내</p>'+
    '<p class="eyebrow">'+escapeHtml(page.eyebrow)+'</p>'+
    '<h1>'+escapeHtml(page.headline)+'</h1>'+
    '<p class="intro">'+escapeHtml(page.intro)+'</p>'+body+
    '<div class="actions"><a href="'+prefix+studyQuery+'">회원가입 없이 수학 시작하기</a>'+
    '<a class="secondary" href="'+prefix+'curriculum/">전체 학년 단원 보기</a></div>'+
    '<p class="callout">안내된 수업 자료는 수학천재의 자체 콘텐츠입니다. 교육부·교육청 공식 운영 또는 인증을 뜻하지 않으며, 학교 성취평가를 대체하지 않습니다.</p>'+
    '</main><footer>© '+new Date().getUTCFullYear()+
    ' Larix Inc. · 운영사 <a href="https://larix.kr">주식회사 라릭</a></footer></body></html>';
}
function audienceBody(page){
  const sections=page.sections.map(s=>
    '<section class="panel"><h2>'+escapeHtml(s.title)+'</h2><p>'+escapeHtml(s.paragraph)+'</p>'+
    '<ul>'+s.points.map(point=>'<li>'+escapeHtml(point)+'</li>').join('')+'</ul></section>'
  ).join('');
  const faq='<section class="panel"><h2>자주 묻는 질문</h2>'+
    page.faq.map(([q,a])=>'<h3>'+escapeHtml(q)+'</h3><p>'+escapeHtml(a)+'</p>').join('')+
    '</section>';
  return sections+faq;
}
function gradeBody(grade){
  return [1,2].map(semester=>{
    const units=curriculumUnits.filter(u=>u.grade===grade&&u.semester===semester);
    return '<section class="panel"><h2>'+grade+'학년 '+semester+'학기 단원</h2>'+
      '<div class="unit-list">'+units.map(u=>'<article><h3>'+
        escapeHtml(u.number+'. '+u.title)+'</h3><p>'+escapeHtml(u.subtitle)+
        '</p><span class="quiet">'+escapeHtml(u.label)+'</span></article>').join('')+
      '</div></section>';
  }).join('')+
  '<section class="panel"><h2>이 학년의 학습 활동</h2>'+
  '<p>위 단원 목록은 교재형 편제로서 출판사와 학교별 단원 순서가 다를 수 있습니다. 수학천재에서는 관련 개념 교구를 직접 움직이고 문제를 확인해 볼 수 있습니다.</p>'+
  '<p><a href="../">1~6학년 전체 단원 목차</a></p></section>';
}
function curriculumBody(){
  return Array.from({length:6},(_,i)=>{
    const grade=i+1;
    const semesterRows=[1,2].map(s=>{
      const items=curriculumUnits.filter(u=>u.grade===grade&&u.semester===s);
      return '<p><strong>'+grade+'학년 '+s+'학기:</strong> '+
        items.map(u=>escapeHtml(u.title)).join(' · ')+'</p>';
    }).join('');
    return '<section class="panel"><h2>'+grade+'학년 수학</h2>'+
      '<p>'+escapeHtml(gradeDescriptions[grade])+'</p>'+semesterRows+
      '<a class="grade-link" href="./grade-'+grade+'/">'+grade+
      '학년 단원·개념 상세 안내 →</a></section>';
  }).join('');
}

function middleGradeBody(grade){
  return [1,2].map(semester=>{
    const units=middleUnits.filter(u=>u.grade===grade&&u.semester===semester);
    return '<section class="panel"><h2>중'+grade+' '+semester+'학기 개념 단원</h2>'+
      '<div class="unit-list">'+units.map(u=>'<article><h3>'+
        escapeHtml(u.number+'. '+u.title)+'</h3><p>'+escapeHtml(u.subtitle)+
        '</p><span class="quiet">'+escapeHtml(u.label)+'</span></article>').join('')+
      '</div></section>';
  }).join('')+
  '<section class="panel"><h2>직접 만져보는 중등 수학</h2>'+
    '<p>단원에 들어가면 바로 숫자·그래프·도형을 직접 바꿔 보고, 이어서 연습 문제를 풀고 해설을 확인합니다. 별도 회원가입이 없고 학습 진도는 해당 브라우저에 저장됩니다.</p>'+
    '<p><a href="../middle/">중학교 1~3학년 단원 전체 보기</a></p></section>';
}
function middleOverviewBody(){
  return middleCourses.map(item=>{
    const units=item.chapters;
    return '<section class="panel"><h2>중학교 '+item.grade+'학년</h2>'+
      '<p>'+escapeHtml(item.title)+'</p>'+
      '<ul>'+[1,2].map(semester=>'<li><strong>'+semester+'학기: </strong>'+
        units.filter(u=>u.semester===semester).map(u=>escapeHtml(u.title)).join(' · ')+
        '</li>').join('')+'</ul>'+
      '<p><a class="grade-link" href="../middle-'+item.grade+'/">'+
        '중'+item.grade+' 학습 단원 자세히 보기 →</a></p>'+
      '<p><a class="grade-link" href="../../?level=middle&amp;grade='+item.grade+'">'+
        '중'+item.grade+' 수학 바로 시작하기 →</a></p></section>';
  }).join('');
}

function writeStaticPage(page,body){
  const dir=join(outDir,page.slug);
  mkdirSync(dir,{recursive:true});
  writeFileSync(join(dir,'index.html'),pageHtml(page,body));
}
function run(){
  if(!existsSync(join(outDir,'index.html')))throw new Error('Run vite build before SEO generation');
  const indexPath=join(outDir,'index.html');
  const initial=readFileSync(indexPath,'utf8');
  if(!initial.includes('<!--SEO_HEAD-->') || !initial.includes('<!--SEO_STRUCTURED_DATA-->')){
    throw new Error('index.html SEO placeholders missing');
  }
  writeFileSync(indexPath,initial.replace(oldTrackerPattern,trackerTag)
    .replace('<!--SEO_HEAD-->',homepageTags())
    .replace('<!--SEO_STRUCTURED_DATA-->',ldJson(homeSchema())));
  for(const page of contents.pages)writeStaticPage(page,audienceBody(page));
  writeStaticPage(curriculumPage,curriculumBody());
  for(let grade=1;grade<=6;grade++)writeStaticPage(gradeInfo(grade),gradeBody(grade));
  writeStaticPage(middleOverview,middleOverviewBody());
  for(let grade=1;grade<=3;grade++)writeStaticPage(middlePages[grade-1],middleGradeBody(grade));
  const robots=['User-agent: *','Allow: /'];
  if(siteUrl){
    const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n'+
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
      routes.map(page=>'  <url><loc>'+escapeHtml(absolute(page.slug))+'</loc></url>').join('\n')+
      '\n</urlset>\n';
    writeFileSync(join(outDir,'sitemap.xml'),sitemap);
    robots.push('Sitemap: '+new URL('sitemap.xml',siteUrl).href);
    console.log('[SEO] '+routes.length+' URL sitemap and canonical tags: '+siteUrl);
  } else {
    console.warn('[SEO] SITE_URL is missing: public pages built, canonical and sitemap skipped.');
  }
  
  writeFileSync(join(outDir,'robots.txt'),robots.join('\n')+'\n');
  console.log('[SEO] Static pages generated: '+(routes.length-1));
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) run();
