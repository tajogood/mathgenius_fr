// Harvest the "121 learning standards" mode.
import {it} from 'vitest';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {writeFileSync} from 'node:fs';
import {startCollect,lookup,handledByL,hasEntry,loadEnglish} from '../../src/i18n/index.ts';
import {translateTree} from '../../src/i18n/domTranslate.ts';
import {standardLessons,standardAssessments} from '../../src/standards/lessons.ts';
import {extraChecksFor} from '../../src/standards/extraChecks.ts';
import StandardStudio from '../../src/components/StandardStudio.tsx';

const found=new Map<string,string>();
let group='std';
const set={add:(k:string)=>{if(!found.has(k))found.set(k,group);}} as unknown as Set<string>;
startCollect(set);
const see=(s:string)=>{lookup(s);};
const walk=(el:Element)=>translateTree(el,ko=>{see(ko);return null;});
const click=(root:Element,re:RegExp)=>{const b=Array.from(root.querySelectorAll('button')).find(x=>re.test(x.textContent||''));if(b){fireEvent.click(b);return true;}return false;};

it('harvests standards',async()=>{
  await loadEnglish();
  for(const l of standardLessons){
    group='stddata:'+l.id;
    [l.title,l.discover,l.principle,l.check.prompt,l.explanation,...l.check.choices].forEach(see);
    for(const x of extraChecksFor(l.id)){[x.label,x.prompt,x.explanation,...x.choices].forEach(see);}
    for(let r=0;r<3;r++){const [,app]=standardAssessments(l);[app.question,app.explanation,...app.choices].forEach(see);}
  }
  for(const l of standardLessons){
    group='stdui:'+l.id;
    const r=render(<StandardStudio initialId={l.id} onExit={()=>{}}/>);
    walk(r.container);
    for(let s=0;s<3;s++){click(r.container,/다음 장면|개념 확인 시작/);walk(r.container);}
    for(let c=0;c<6;c++){
      const opt=r.container.querySelector('.studio-options button') as HTMLButtonElement|null;
      if(!opt)break;
      fireEvent.click(opt);walk(r.container);
      click(r.container,/확인|제출|채점/);walk(r.container);
      click(r.container,/다음|계속/);walk(r.container);
    }
    cleanup();
  }
  const out=[...found].filter(([k])=>!handledByL.has(k)&&!hasEntry(k));
  writeFileSync('/tmp/harvest-std.json',JSON.stringify(out));
  writeFileSync('/tmp/allkeys-std.json',JSON.stringify([...found.keys()]));
},600000);
