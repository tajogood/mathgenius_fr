import {useEffect,useState} from 'react';
import App from '../App.tsx';
import MiddleApp from '../middle/MiddleApp.tsx';
import './level-switch.css';

// Elementary curriculum and its App component are intentionally untouched.
// Middle-school mode has an independent, browser-only lesson engine.
function readMode(){
  const params=new URLSearchParams(window.location.search);
  if(params.get('level')==='middle'){
    const n=Number(params.get('grade'));
    return {level:'middle' as const,grade:(n>=1&&n<=3&&Number.isInteger(n)?n:1) as 1|2|3};
  }
  const n=Number(params.get('grade'));
  return {level:'elementary' as const,grade:Number.isInteger(n)&&n>=1&&n<=6?n:5};
}
export default function FreeSite(){
  const [mode,setMode]=useState(readMode);
  useEffect(()=>{
    const pop=()=>setMode(readMode());
    window.addEventListener('popstate',pop);
    return ()=>window.removeEventListener('popstate',pop);
  },[]);
  const openMiddle=(grade:1|2|3)=>{
    const url=new URL(window.location.href);
    url.searchParams.delete('guest');
    url.searchParams.set('level','middle');
    url.searchParams.set('grade',String(grade));
    window.history.pushState({},'',url.pathname+url.search);
    setMode({level:'middle',grade});
    window.scrollTo?.({top:0,behavior:'auto'});
  };
  const openElementary=()=>{
    const url=new URL(window.location.href);
    url.searchParams.delete('level');
    url.searchParams.delete('grade');
    window.history.pushState({},'',url.pathname+url.search);
    setMode({level:'elementary',grade:5});
    window.scrollTo?.({top:0,behavior:'auto'});
  };
  if(mode.level==='middle')return <MiddleApp key={'middle'+mode.grade}
    initialGrade={mode.grade} onElementary={openElementary}/>;
  return <div className="free-grade-portal">
    <nav className="free-level-nav" aria-label="학교급 선택">
      <strong>✦ 수학천재 FREE</strong>
      <span className="free-current-level">초등 1~6학년</span>
      <span className="free-level-intro">중학교 수학도 직접 움직이며 배워요.</span>
      <div role="group" aria-label="중학교 수학 선택">
        {([1,2,3] as const).map(grade=><button type="button" key={grade}
          onClick={()=>openMiddle(grade)}>중{grade} 수학 →</button>)}
      </div>
    </nav>
    <App initialGrade={mode.grade}/>
  </div>;
}
