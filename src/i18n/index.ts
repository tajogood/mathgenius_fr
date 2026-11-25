import {EN as EN_BASE} from './en.ts';

// Interface and unit names are bundled; lesson text (en-elementary.ts) is loaded
// only for English visitors via loadEnglish(), so Korean visitors don't download it.
const EN:Record<string,string>={...EN_BASE};
let lessonsLoaded=false;
export async function loadEnglish(){
  if(lessonsLoaded)return;
  const {EN_ELEMENTARY}=await import('./en-elementary.ts');
  for(const [k,v] of Object.entries(EN_ELEMENTARY))if(!(k in EN))EN[k]=v;
  lessonsLoaded=true;
}

/**
 * Site language (한국어 / English).
 *
 * Order of precedence:
 *   1. ?lang=ko|en in the URL (also saved, so links can force a language)
 *   2. the visitor's saved choice from the 한/EN switch
 *   3. the browser language: Korean browsers get Korean, everyone else English
 *
 * Search-engine crawlers and automated browsers always get Korean unless the URL
 * asks for English, so the Korean canonical pages are indexed in Korean.
 *
 * Translations are keyed by the original Korean text. A string with no English
 * entry falls back to Korean, so lessons can be translated step by step.
 */
export type Lang='ko'|'en';
const STORAGE_KEY='mathgenius.lang.v1';
const BOT_PATTERN=/bot|crawl|spider|slurp|yeti|daum|bingpreview|facebookexternalhit|headless|lighthouse/i;

function isLang(v:unknown):v is Lang{return v==='ko'||v==='en';}

export function detectLang():Lang{
  if(typeof window==='undefined')return 'ko';
  try{
    const fromUrl=new URLSearchParams(window.location.search).get('lang');
    if(isLang(fromUrl)){
      try{window.localStorage.setItem(STORAGE_KEY,fromUrl);}catch{/* storage blocked */}
      return fromUrl;
    }
  }catch{/* malformed URL: ignore */}
  try{
    const saved=window.localStorage.getItem(STORAGE_KEY);
    if(isLang(saved))return saved;
  }catch{/* storage blocked */}
  const nav=typeof navigator!=='undefined'?navigator:undefined;
  if(!nav||nav.webdriver||BOT_PATTERN.test(nav.userAgent||''))return 'ko';
  const prefs=(nav.languages&&nav.languages.length?nav.languages:[nav.language||'ko']);
  return String(prefs[0]||'ko').toLowerCase().startsWith('ko')?'ko':'en';
}

let current:Lang=detectLang();

export function lang():Lang{return current;}
export const isEn=()=>current==='en';

/** Test hook and in-memory override (does not reload the page). */
export function setLangForTest(next:Lang){current=next;applyDocumentLang();}

/** Switch language from the 한/EN button: remember it and reload in place. */
export function switchLang(next:Lang){
  try{window.localStorage.setItem(STORAGE_KEY,next);}catch{/* storage blocked */}
  const url=new URL(window.location.href);
  url.searchParams.set('lang',next);
  window.location.assign(url.pathname+url.search+url.hash);
}

const HANGUL=/[가-힣]/;
const NUM=/\d+(?:,\d{3})*(?:\.\d+)?/g; // 1,000 is one number; "100, 10" is two
/** Placeholder for numbers in template keys, e.g. '⟨0⟩개의 사과' → '⟨0⟩ apples'. */
export const slot=(i:number)=>'⟨'+i+'⟩';
export function templateOf(ko:string):{key:string;nums:string[]}{
  const nums:string[]=[];
  const key=ko.replace(NUM,m=>{nums.push(m);return slot(nums.length-1);});
  return {key,nums};
}
let collector:Set<string>|null=null;
/** Harvest mode (scripts only): record every Korean string that reaches tr(). */
export function startCollect(set:Set<string>){collector=set;}
export function stopCollect(){collector=null;}

/** Look up English for a Korean string; null when there is no entry. */
export function lookup(ko:string):string|null{
  if(!HANGUL.test(ko))return null;
  const lead=ko.match(/^\s*/)![0],trail=ko.match(/\s*$/)![0];
  const core=ko.trim();
  if(collector)collector.add(templateOf(core).key);
  const exact=EN[core];
  if(exact!==undefined)return lead+exact+trail;
  const {key,nums}=templateOf(core);
  const t=EN[key];
  if(t===undefined)return null;
  return lead+t.replace(/⟨(\d+)⟩/g,(_,i)=>nums[Number(i)]??'')+trail;
}
/** Harvest helper: is there an English entry for this exact key or template? */
export const hasEntry=(key:string)=>EN[key]!==undefined;
export const hasHangul=(s:string)=>HANGUL.test(s);

/** Translate a Korean source string (falls back to Korean when untranslated). */
export function tr(ko:string):string{
  if(current!=='en'){if(collector)lookup(ko);return ko;}
  return lookup(ko)??ko;
}
/** Inline pair for interface text that is built with values. */
export function L(ko:string,en:string):string{
  if(collector)handledByL.add(templateOf(ko.trim()).key);
  return current==='en'?en:ko;
}
/** Harvest helper: Korean strings that already have an inline L() English pair. */
export const handledByL=new Set<string>();

export function applyDocumentLang(){
  if(typeof document==='undefined')return;
  document.documentElement.lang=current;
}
applyDocumentLang();
