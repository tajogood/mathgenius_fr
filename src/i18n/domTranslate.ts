import {lookup,hasHangul,isEn} from './index.ts';

/**
 * English mode: translate Korean text that components render directly
 * (labels inside the interactive labs, SVG captions, aria-labels…).
 * Works on the live DOM so lesson components need no changes; React keeps
 * rendering Korean and this layer swaps it for the dictionary entry.
 *
 * An element whose children are all text nodes is translated as one string,
 * so React's split nodes like "5" + "학년" become the single key "⟨0⟩학년".
 */
type Seen={orig:string;shown:string};
const textSeen=new WeakMap<Text,Seen>();
const attrSeen=new WeakMap<Element,Record<string,Seen>>();
const ATTRS=['aria-label','title','placeholder','alt','aria-description'];
const SKIP='script,style,textarea,[data-i18n-skip]';

export type Translator=(ko:string)=>string|null;

function original(t:Text):string{
  const seen=textSeen.get(t);
  return seen&&t.nodeValue===seen.shown?seen.orig:(t.nodeValue??'');
}
function show(t:Text,orig:string,value:string){
  if(t.nodeValue!==value)t.nodeValue=value;
  textSeen.set(t,{orig,shown:value});
}
function skipped(el:Element|null):boolean{
  return !!el&&!!el.closest(SKIP);
}

export function translateElement(el:Element,translate:Translator){
  if(skipped(el))return;
  for(const name of ATTRS){
    const cur=el.getAttribute(name);
    if(cur===null)continue;
    const seen=attrSeen.get(el)?.[name];
    const orig=seen&&cur===seen.shown?seen.orig:cur;
    if(!hasHangul(orig))continue;
    const out=translate(orig);
    if(out===null)continue;
    if(cur!==out)el.setAttribute(name,out);
    attrSeen.set(el,{...(attrSeen.get(el)??{}),[name]:{orig,shown:out}});
  }
  const kids=Array.from(el.childNodes);
  const texts=kids.filter((n):n is Text=>n.nodeType===3);
  if(!texts.length)return;
  if(texts.length===kids.length&&texts.length>1){
    const origs=texts.map(original);
    const joined=origs.join('');
    if(!hasHangul(joined))return;
    const out=translate(joined);
    if(out===null)return;
    texts.forEach((t,i)=>show(t,origs[i],i===0?out:''));
    return;
  }
  for(const t of texts){
    const orig=original(t);
    if(!hasHangul(orig))continue;
    const out=translate(orig);
    if(out!==null)show(t,orig,out);
  }
}

export function translateTree(root:Element,translate:Translator){
  translateElement(root,translate);
  root.querySelectorAll('*').forEach(el=>translateElement(el,translate));
}

const englishLookup:Translator=ko=>lookup(ko);

export function startDomTranslation(root:Element){
  if(!isEn()||typeof MutationObserver==='undefined')return ()=>{};
  translateTree(root,englishLookup);
  const observer=new MutationObserver(records=>{
    const els=new Set<Element>();
    for(const r of records){
      if(r.type==='characterData'){if(r.target.parentElement)els.add(r.target.parentElement);}
      else if(r.type==='attributes'){els.add(r.target as Element);}
      else{
        if(r.target.nodeType===1)els.add(r.target as Element);
        r.addedNodes.forEach(n=>{
          if(n.nodeType===1){els.add(n as Element);(n as Element).querySelectorAll('*').forEach(c=>els.add(c));}
          else if(n.parentElement)els.add(n.parentElement);
        });
      }
    }
    els.forEach(el=>{if(el.isConnected)translateElement(el,englishLookup);});
  });
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  return ()=>observer.disconnect();
}
