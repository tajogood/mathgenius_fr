// Harvest every Korean sentence the English translator will meet in the elementary lessons.
// Run: npx vitest run --config scripts/i18n/vitest.harvest.config.ts
import {it} from 'vitest';
import {render,cleanup,fireEvent} from '@testing-library/react';
import {writeFileSync} from 'node:fs';
import {startCollect,lookup,handledByL,hasEntry,loadEnglish} from '../../src/i18n/index.ts';
import {translateTree} from '../../src/i18n/domTranslate.ts';
import {TOPICS,createProblem,solutionSteps} from '../../src/math.ts';
import {diagnosticHint,conceptTipForTopic} from '../../src/feedback.ts';
import {TOPIC_CHALLENGES} from '../../src/interactions.ts';
import {curriculumUnits} from '../../src/curriculum.ts';
import Visuals from '../../src/components/Visuals.tsx';
import App from '../../src/App.tsx';
import {ELEMENTARY_SCENES} from '../../src/motion/elementary/index.ts';
import {renderMotionScene} from '../../src/motion/types.ts';

const found=new Map<string,string>(); // key -> source group (sentences passed to tr())
const dom=new Map<string,string>();
const dropped:string[]=[]; // particle-led DOM text skipped as a fragment (printed for review)
let group='misc';
let target=found;
const set={add:(k:string)=>{if(!target.has(k))target.set(k,group);}} as unknown as Set<string>;
startCollect(set);
const see=(s:string)=>{lookup(s);};
const walk=(el:Element)=>{target=dom;translateTree(el,ko=>{lookup(ko);return null;});target=found;};

it('harvests',async()=>{
  await loadEnglish();
  for(const topic of TOPICS){
    group='problem:'+topic;
    see(TOPIC_CHALLENGES[topic]);see(conceptTipForTopic(topic));
    for(let i=0;i<60;i++){
      const p=createProblem(topic);
      see(p.prompt);p.choices.forEach(see);solutionSteps(p).forEach(see);
      see(diagnosticHint(p,p.answer));
    }
  }
  for(const u of curriculumUnits){group='concept:'+u.id;u.concept.forEach(see);}
  for(const [topic,scenes] of Object.entries(ELEMENTARY_SCENES)){
    group='motion:'+topic;
    for(const sc of scenes!){
      see(sc.cap);
      const div=document.createElement('div');div.innerHTML=renderMotionScene(sc);walk(div);
    }
  }
  for(const topic of TOPICS){
    group='lab:'+topic;
    for(let k=0;k<3;k++){
      const p=createProblem(topic);
      for(const [phase,step] of [['concept',0],['concept',1],['concept',2],['question',0],['solution',0],['solution',1],['solution',2]] as const){
        const r=render(<Visuals problem={p} phase={phase} step={step} onEngage={()=>{}}/>);
        walk(r.container);
        // poke every button once to reach more states
        const btns=Array.from(r.container.querySelectorAll('button')).slice(0,25);
        for(const b of btns){try{fireEvent.click(b);walk(r.container);}catch{/* ignore */}}
        cleanup();
      }
    }
  }
  for(const u of curriculumUnits){
    group='app:'+u.id;
    const r=render(<App initialUnitId={u.id}/>);
    walk(r.container);
    for(let s=0;s<3;s++){
      const next=Array.from(r.container.querySelectorAll('button')).find(b=>/다음 단계|Next step/.test(b.textContent||''));
      if(next){fireEvent.click(next);walk(r.container);}
    }
    cleanup();
  }
  const trKeys=[...found.keys()];
  for(const [k,g] of dom){
    const bare=k.replace(/⟨\d+⟩/g,'').trim();
    // Drop only particle-led pieces of sentences that tr() already translates whole.
    const fragment=/^(을|를|이|가|은|는|와|과|에|으로|로|처럼|,|이므로|이에요|예요)/.test(bare);
    if(!found.has(k)&&!(fragment&&trKeys.some(t=>t.replace(/⟨\d+⟩/g,'').includes(bare))))found.set(k,g);
    else if(!found.has(k)&&!hasEntry(k))dropped.push(k);
  }
  const missing=[...found].filter(([k])=>!handledByL.has(k)&&!hasEntry(k)&&!/^선택한 답/.test(k));
  writeFileSync('/tmp/harvest.json',JSON.stringify(missing,null,0));
  writeFileSync('/tmp/dropped.json',JSON.stringify(dropped));
  writeFileSync('/tmp/allkeys.json',JSON.stringify([...found.keys(),...dom.keys()]));
  console.log('keys',found.size);
},600000);
