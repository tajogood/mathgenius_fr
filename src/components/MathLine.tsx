import type {ReactNode} from 'react';
import {mathTokens} from '../motion/mathTokens.ts';
import {Fraction} from './MathText.tsx';
import './math-line.css';
import {tr} from '../i18n/index.ts';

/**
 * 중·고등 수식 문장 조판.
 *  - 2/5, √3/2, (x−1)/(x+2) 같은 빗금 분수 → 분자 위·분모 아래
 *  - {{분자|분모}}             → 명시적 분수 (괄호·문자가 섞인 복잡한 분수)
 *  - a^{2/3}, a_{n}            → 위첨자·아래첨자
 *  - ⟦1,2;3,4⟧                 → 2×2 등 행렬
 *  - ∑{k=1}{10}, lim{x→2}, ∫{0}{2} → 큰 연산자와 범위
 * 채점은 원래 문자열로 하고, 이 컴포넌트는 보이는 모양만 바꾼다.
 */
function readGroup(s:string,start:number,open='{',close='}'):[string,number]{
  let depth=0;
  for(let i=start;i<s.length;i++){
    if(s[i]===open)depth++;
    else if(s[i]===close){depth--;if(depth===0)return [s.slice(start+1,i),i+1];}
  }
  return [s.slice(start+1),s.length];
}
function plain(text:string,key:string):ReactNode[]{
  return mathTokens(text).map((t,i)=>t.t==='text'?
    <span key={key+'t'+i}>{t.s}</span>:
    <Fraction key={key+'f'+i} numerator={t.n} denominator={t.d}/>);
}
function render(s:string,prefix='m'):ReactNode[]{
  const out:ReactNode[]=[];
  let buf='',i=0,k=0;
  const flush=()=>{if(buf){out.push(...plain(buf,prefix+'p'+(k++)));buf='';}};
  while(i<s.length){
    const key=prefix+'-'+(k++);
    if(s.startsWith('{{',i)){
      const end=s.indexOf('}}',i+2);
      if(end>0){
        flush();
        const inner=s.slice(i+2,end),bar=inner.indexOf('|');
        const top=bar<0?inner:inner.slice(0,bar),bottom=bar<0?'':inner.slice(bar+1);
        out.push(<span key={key} className="math-fraction" role="math" aria-label={bottom+'분의 '+top}>
          <span className="math-fraction__top" aria-hidden="true">{render(top,key+'n')}</span>
          <span className="math-fraction__bar" aria-hidden="true"/>
          <span className="math-fraction__bottom" aria-hidden="true">{render(bottom,key+'d')}</span>
        </span>);
        i=end+2;continue;
      }
    }
    if((s[i]==='^'||s[i]==='_')&&s[i+1]==='{'){
      flush();
      const [inner,next]=readGroup(s,i+1);
      out.push(s[i]==='^'?<sup key={key} className="math-sup">{render(inner,key)}</sup>:
        <sub key={key} className="math-sub">{render(inner,key)}</sub>);
      i=next;continue;
    }
    if(s[i]==='⟦'){
      const end=s.indexOf('⟧',i);
      if(end>0){
        flush();
        const rows=s.slice(i+1,end).split(';').map(r=>r.split(',').map(c=>c.trim()));
        out.push(<span key={key} className="math-matrix" role="math" aria-label={'행렬 '+rows.map(r=>r.join(' ')).join(', ')}>
          <span className="math-matrix__grid" style={{gridTemplateColumns:`repeat(${rows[0].length},auto)`}} aria-hidden="true">
            {rows.flatMap((r,ri)=>r.map((c,ci)=><span key={ri+'-'+ci}>{render(c,key+ri+ci)}</span>))}
          </span></span>);
        i=end+1;continue;
      }
    }
    const op=['∑','lim','∫'].find(o=>s.startsWith(o+'{',i));
    if(op){
      flush();
      const [lower,afterLower]=readGroup(s,i+op.length);
      let upper='',next=afterLower;
      if(op!=='lim'&&s[afterLower]==='{'){[upper,next]=readGroup(s,afterLower);}
      out.push(op==='∫'?
        <span key={key} className="math-int" role="math" aria-label={lower+'부터 '+upper+'까지 적분'}>
          <span className="math-int__sym" aria-hidden="true">∫</span>
          <span className="math-int__lim" aria-hidden="true"><span>{render(upper,key+'u')}</span><span>{render(lower,key+'l')}</span></span>
        </span>:
        <span key={key} className={'math-op math-op--'+(op==='∑'?'sum':'lim')} role="math"
          aria-label={op==='∑'?lower+'부터 '+upper+'까지의 합':lower+' 극한'}>
          {upper&&<span className="math-op__upper" aria-hidden="true">{render(upper,key+'u')}</span>}
          <span className="math-op__sym" aria-hidden="true">{op}</span>
          <span className="math-op__lower" aria-hidden="true">{render(lower,key+'l')}</span>
        </span>);
      i=next;continue;
    }
    buf+=s[i];i++;
  }
  flush();
  return out;
}
export function MathLine({text}:{text:string}){
  return <>{render(tr(text))}</>;
}
/** SVG·문서 제목 등 HTML 조판을 쓸 수 없는 곳에서 읽을 수 있는 텍스트 */
export function mathPlain(text:string){
  return text.replace(/\{\{([^|}]*)\|([^}]*)\}\}/g,'($1)/($2)')
    .replace(/[\^_]\{([^{}]*)\}/g,'$1').replace(/⟦[^⟧]*⟧/g,'행렬')
    .replace(/(∑|∫)\{([^{}]*)\}\{([^{}]*)\}/g,'$1').replace(/lim\{([^{}]*)\}/g,'lim');
}
