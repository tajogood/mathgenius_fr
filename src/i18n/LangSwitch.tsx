import {lang,switchLang,type Lang} from './index.ts';
import './lang-switch.css';

const OPTIONS:{id:Lang;label:string;name:string}[]=[
  {id:'ko',label:'한',name:'한국어'},
  {id:'en',label:'EN',name:'English'},
];

export default function LangSwitch({className=''}:{className?:string}){
  const now=lang();
  return <div className={'lang-switch '+className} role="group" aria-label="Language / 언어">
    {OPTIONS.map(o=><button key={o.id} type="button" lang={o.id} data-i18n-skip=""
      aria-pressed={now===o.id} title={o.name} aria-label={o.name}
      onClick={()=>{if(now!==o.id)switchLang(o.id);}}>{o.label}</button>)}
  </div>;
}

