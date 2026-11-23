import type { Topic } from '../math.ts';
export type StandardLesson={
 id:string; title:string; topic:Topic; discover:string; principle:string;
 check:{prompt:string;answer:string;choices:[string,string,string,string]}; explanation:string;
};
/** Compact authored rows: id|short goal|interactive topic|hands-on invitation|principle|concept question|answer|three plausible errors separated by ~|feedback */
export function parseLessonRows(source:string):StandardLesson[]{
  return source.trim().split('\n').filter(Boolean).map((row,index)=>{
    const p=row.split('|').map(x=>x.trim());
    if(p.length!==9)throw new Error('Invalid achievement lesson row '+(index+1)+': '+p.length);
    const [id,title,topic,discover,principle,prompt,answer,distractors,explanation]=p;
    const wrong=distractors.split('~').map(x=>x.trim());
    if(wrong.length!==3 || new Set([answer,...wrong]).size!==4)throw new Error('Invalid options for '+id);
    if(!/^([246])수0[1-4]-\d\d$/.test(id))throw new Error('Invalid ID '+id);
    return {id,title,topic:topic as Topic,discover,principle,
      check:{prompt,answer,choices:[answer,wrong[0],wrong[1],wrong[2]]},explanation};
  });
}
