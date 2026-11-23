import {useEffect,useState} from 'react';
import {grades,curriculumUnits} from '../curriculum.ts';
import App from '../App.tsx';
import './free.css';

function urlGrade(){
  const params=new URLSearchParams(window.location.search);
  if(params.get('guest')!=='1')return null;
  const grade=Number(params.get('grade'));
  return Number.isInteger(grade)&&grade>=1&&grade<=6?grade:1;
}
export default function FreeSite(){
  const [selectedGrade,setSelectedGrade]=useState<number|null>(urlGrade);
  useEffect(()=>{
    const sync=()=>setSelectedGrade(urlGrade());
    window.addEventListener('popstate',sync);
    return ()=>window.removeEventListener('popstate',sync);
  },[]);
  function setStudyGrade(grade:number|null){
    const u=new URL(window.location.href);
    if(grade===null){u.searchParams.delete('guest');u.searchParams.delete('grade');}
    else{u.searchParams.set('guest','1');u.searchParams.set('grade',String(grade));}
    window.history.pushState({grade},'',u.pathname+u.search);
    setSelectedGrade(grade);
    try{window.scrollTo({top:0,behavior:'auto'});}catch{/* no scroll API in tests */}
  }
  if(selectedGrade!==null)return <div className="free-app">
    <header className="free-study-banner">
      <strong>✦ 수학천재 <span>FREE</span></strong>
      <p>로그인 없이 무료 학습 · 진도는 현재 기기에만 저장</p>
      <button type="button" onClick={()=>setStudyGrade(null)}>← 무료판 첫 화면</button>
    </header>
    <App key={selectedGrade} initialGrade={selectedGrade}/>
  </div>;
  return <div className="free-page">
    <header className="free-top">
      <a className="free-logo" href="./">✦ 수학<span>천재</span> <small>FREE</small></a>
      <nav aria-label="서비스 안내">
        <a href="./curriculum/">학년별 단원</a>
        <a href="./for-parents/">학부모</a>
        <a href="./for-teachers/">선생님</a>
      </nav>
      <button type="button" onClick={()=>setStudyGrade(1)}>무료 학습 시작 →</button>
    </header>
    <main>
      <section className="free-hero">
        <div className="free-hero-copy">
          <span className="free-eyebrow">INTERACTIVE MATH · 100% FREE</span>
          <h1>초등 수학,<br/><em>직접 움직이며 이해해요.</em></h1>
          <p>초등 1~6학년의 수학 개념을 블록·도형·분수·입체 교구로 직접 만지며 발견해요.
            로그인이나 결제 없이 모든 학년을 체험할 수 있습니다.</p>
          <div className="free-hero-actions">
            <button type="button" onClick={()=>setStudyGrade(1)}>1학년부터 시작하기 <span>→</span></button>
            <a href="#free-grades">학년 선택하기 ↓</a>
          </div>
          <div className="free-trust"><span>✓ 회원가입 불필요</span><span>✓ 전 학년 무료</span><span>✓ 기기 내 진도 저장</span></div>
        </div>
        <div className="free-hero-art" aria-hidden="true">
          <div className="free-art-header"><span>● ● ●</span> 직접 움직이는 수학 실험실</div>
          <div className="free-fraction"><span>½</span><span>¼</span><span>¾</span></div>
          <div className="free-tiles">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
          <div className="free-art-footer">그림을 만지고 원리를 발견해요 ✨</div>
        </div>
      </section>
      <section className="free-content" id="free-grades">
        <div className="free-heading">
          <span className="free-eyebrow">CHOOSE YOUR GRADE</span>
          <h2>어느 학년 수학을 배울까요?</h2>
          <p>1~6학년의 단원별 수업과 수학 교구를 모두 무료로 이용할 수 있습니다.</p>
        </div>
        <div className="free-grade-grid">
          {grades.map(info=><article key={info.grade} className="free-grade">
            <div className="free-grade-head"><span>{info.grade}</span>
              <div><strong>초등 {info.grade}학년</strong><small>{info.chapters.length}개 단원 · 1·2학기</small></div>
            </div>
            <p>{curriculumUnits.filter(u=>u.grade===info.grade).slice(0,4).map(u=>u.title).join(' · ')}</p>
            <button type="button" onClick={()=>setStudyGrade(info.grade)}>
              {info.grade}학년 수학 시작하기 <span>→</span></button>
          </article>)}
        </div>
      </section>
      <section className="free-features">
        <article><span>🖐️</span><h3>직접 만지는 수학 교구</h3>
          <p>도형을 옮기고 분수 막대를 나누며 원리를 눈으로 확인해요.</p></article>
        <article><span>🧠</span><h3>개념 → 문제 → 풀이</h3>
          <p>개념을 이해한 뒤 문제를 풀고 풀이 과정을 확인해요.</p></article>
        <article><span>🎯</span><h3>성취기준 기반 참고 학습</h3>
          <p>2022 개정 교육과정을 참고한 자체 성취기준 수업 콘텐츠입니다.</p></article>
      </section>
      <section className="free-educator">
        <div><span className="free-eyebrow">FOR PARENTS & TEACHERS</span>
          <h2>집에서도, 교실에서도.</h2>
          <p>부모님은 아이의 개념 이해를 돕고, 초등 선생님은 전자칠판에서 교구를 시연할 수 있어요.</p>
          <nav aria-label="대상별 활용 안내">
            <a href="./for-parents/">학부모 활용법 →</a>
            <a href="./for-teachers/">교사 수업 활용법 →</a>
            <a href="./curriculum/">전체 단원 보기 →</a>
          </nav>
        </div>
        <button type="button" onClick={()=>setStudyGrade(5)}>교구 직접 체험하기 ↗</button>
      </section>
      <p className="free-privacy">이 무료판에는 학생 계정·PASS 인증·서버 학습기록 수집 기능이 없습니다.
        진도는 현재 브라우저에만 저장되며, 브라우저 데이터를 삭제하면 사라질 수 있습니다.</p>
    </main>
    <footer className="free-footer">
      <div><strong>✦ 수학천재 FREE</strong><p>수학의 원리를 직접 움직이며 이해하는 무료 학습실</p></div>
      <div><span>운영사: 주식회사 라릭 (Larix Inc.)</span><span>대표이사: 김영상</span>
        <span>사업자등록번호: 336-88-03923</span>
        <span>경기도 성남시 분당구 미금일로 7, A동 102호 (구미동, 힐스빌8차)</span>
        <a href="https://larix.kr" target="_blank" rel="noopener noreferrer">운영사 홈페이지 ↗</a>
      </div>
      <small>© {new Date().getFullYear()} Larix Inc. · 교육부·교육청이 공식 운영하거나 인증한 서비스가 아닙니다.</small>
    </footer>
  </div>;
}
