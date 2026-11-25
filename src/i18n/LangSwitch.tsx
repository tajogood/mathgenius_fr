import {lang,switchLang,type Lang} from './index.ts';
import './lang-switch.css';

const OPTIONS:{id:Lang;label:string;name:string}[]=[
  {id:'ko',label:'한',name:'한국어'},
  {id:'en',label:'EN',name:'English'},
];

export default function LangSwitch({className=''}:{className?:string}){
  const now=lang();
  return <div className={'lang-switch '+className} role="group" aria-label="Language / 언어">
    {OPTIONS.map(o=><button key={o.id} type="button" lang={o.id}
      aria-pressed={now===o.id} title={o.name} aria-label={o.name}
      onClick={()=>{if(now!==o.id)switchLang(o.id);}}>{o.label}</button>)}
  </div>;
}

/** Shown in English mode while lesson bodies are still Korean. */
export function TranslationNotice(){
  if(lang()!=='en')return null;
  return <p className="translation-notice" role="note">
    English version (beta): menus and unit names are in English. Some lesson explanations
    and practice problems are still in Korean while we translate them.
  </p>;
}
