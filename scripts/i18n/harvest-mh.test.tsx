// Harvest middle and high school lessons (run in English mode, like harvest.test.tsx).
import {it} from 'vitest';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {writeFileSync} from 'node:fs';
import {startCollect,lookup,handledByL,hasEntry,loadEnglish} from '../../src/i18n/index.ts';
import {translateTree} from '../../src/i18n/domTranslate.ts';
import {MIDDLE_TOPICS,middleUnits} from '../../src/middle/curriculum.ts';
import {createMiddleProblem} from '../../src/middle/problems.ts';
import {activityGuide} from '../../src/middle/activityGuide.ts';
import {MOTION_SCENES,renderMotionScene} from '../../src/middle/motion/index.ts';
import {HIGH_TOPICS,highCourses} from '../../src/high/curriculum.ts';
import {createHighProblem} from '../../src/high/problems.ts';
import MiddleApp from '../../src/middle/MiddleApp.tsx';
import HighApp from '../../src/high/HighApp.tsx';

const found=new Map<string,string>();
const dom=new Map<string,string>();
let group='misc',target=found;
const set={add:(k:string)=>{if(!target.has(k))target.set(k,group);}} as unknown as Set<string>;
startCollect(set,'math');
const see=(s:string)=>{if(s)lookup(s);};
const walk=(el:Element)=>{target=dom;translateTree(el,ko=>{lookup(ko);return null;});target=found;};
const buttons=(root:Element)=>Array.from(root.querySelectorAll('button')) as HTMLButtonElement[];
function poke(root:Element){
  // click lab buttons and nudge sliders to reach more states
  const lab=root.querySelector('.middle-lab,.high-lab,[class*="lab"]')||root;
  for(const b of buttons(lab).slice(0,30)){try{fireEvent.click(b);walk(root);}catch{/* ignore */}}
  for(const r of Array.from(lab.querySelectorAll('input[type=range]')).slice(0,6) as HTMLInputElement[]){
    for(const v of [r.min,r.max]){try{fireEvent.change(r,{target:{value:v}});walk(root);}catch{/* ignore */}}
  }
}
function practice(root:Element){
  const go=buttons(root).find(b=>/Try the problems|Practice/.test(b.textContent||''));
  if(go){fireEvent.click(go);walk(root);}
  for(let n=0;n<3;n++){
    const hint=buttons(root).find(b=>/Show hint/.test(b.textContent||''));if(hint){fireEvent.click(hint);walk(root);}
    const choice=root.querySelector('.middle-choices button,[class*="choice"] button') as HTMLButtonElement|null;
    if(choice){fireEvent.click(choice);walk(root);}
    const again=buttons(root).find(b=>/Another problem/.test(b.textContent||''));if(again){fireEvent.click(again);walk(root);}
  }
}

it('harvests middle and high',async()=>{
  await loadEnglish();
  for(const t of MIDDLE_TOPICS){
    group='mprob:'+t;
    const g=activityGuide[t];Object.values(g).flat().forEach(v=>typeof v==='string'&&see(v));
    for(let i=0;i<40;i++){const p=createMiddleProblem(t);[p.prompt,p.answer,...p.choices,...(Array.isArray((p as any).solution)?(p as any).solution:[(p as any).solution??(p as any).explanation??''])].forEach(see);}
    group='mmotion:'+t;
    for(const sc of MOTION_SCENES[t]??[]){see(sc.cap);const d=document.createElement('div');d.innerHTML=renderMotionScene(sc);walk(d);}
  }
  for(const u of middleUnits){group='mconcept:'+u.id;[u.action,u.notice,u.reason,...u.concept].forEach(see);}
  for(const t of HIGH_TOPICS){group='hprob:'+t;for(let i=0;i<40;i++){const p=createHighProblem(t);[p.prompt,p.answer,p.solution,...p.choices].forEach(see);}}
  for(const c of highCourses)for(const u of c.chapters){group='hconcept:'+u.id;[u.action,u.notice,u.reason,...u.concept].forEach(see);}
  // render every middle unit
  for(const grade of [1,2,3] as const){
    const r=render(<MiddleApp initialGrade={grade} onElementary={()=>{}} onHigh={()=>{}}/>);
    const units=Array.from(r.container.querySelectorAll('.middle-sidebar nav button')) as HTMLButtonElement[];
    for(const sem of buttons(r.container).filter(b=>/Semester/.test(b.textContent||''))){
      fireEvent.click(sem);
      for(const ub of Array.from(r.container.querySelectorAll('.middle-sidebar nav button')) as HTMLButtonElement[]){
        group='mui:'+grade+':'+(ub.textContent||'').slice(0,20);
        fireEvent.click(ub);walk(r.container);poke(r.container);practice(r.container);
        const back=buttons(r.container).find(b=>/Explore again/.test(b.textContent||''));if(back)fireEvent.click(back);
        const step0=buttons(r.container).find(b=>/^\s*Explore/.test(b.textContent||''));if(step0)fireEvent.click(step0);
      }
    }
    void units;cleanup();
  }
  for(const c of highCourses){
    const r=render(<HighApp initialCourse={c.id} onElementary={()=>{}} onMiddle={()=>{}}/>);
    for(const ub of Array.from(r.container.querySelectorAll('.middle-sidebar nav button')) as HTMLButtonElement[]){
      group='hui:'+c.id+':'+(ub.textContent||'').slice(0,20);
      fireEvent.click(ub);walk(r.container);poke(r.container);practice(r.container);
      const step0=buttons(r.container).find(b=>/^\s*Explore/.test(b.textContent||''));if(step0)fireEvent.click(step0);
    }
    cleanup();
  }
  const trKeys=[...found.keys()].map(k=>k.replace(/⟨\d+⟩/g,''));
  for(const [k,g] of dom){
    const bare=k.replace(/⟨\d+⟩/g,'').trim();
    const fragment=/^(을|를|이|가|은|는|와|과|에|으로|로|처럼|,|이므로|이에요|예요)/.test(bare);
    if(!found.has(k)&&!(fragment&&trKeys.some(t=>t.includes(bare))))found.set(k,g);
  }
  const out=[...found].filter(([k])=>!handledByL.has(k)&&!hasEntry(k));
  writeFileSync('/tmp/harvest-mh.json',JSON.stringify(out));
  console.log('keys',out.length);
},900000);
