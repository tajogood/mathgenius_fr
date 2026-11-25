import {EN} from './en.ts';

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

/** Translate a Korean source string (falls back to Korean when untranslated). */
export function tr(ko:string):string{
  if(current!=='en')return ko;
  return EN[ko]??ko;
}
/** Inline pair for interface text that is built with values. */
export function L(ko:string,en:string):string{return current==='en'?en:ko;}

export function applyDocumentLang(){
  if(typeof document==='undefined')return;
  document.documentElement.lang=current;
}
applyDocumentLang();
