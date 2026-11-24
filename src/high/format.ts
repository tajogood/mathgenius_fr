/** 고등 수학 문자열 조판 도우미. 음수는 모두 '−'(U+2212)로 씁니다. */
export const MINUS='−';
export const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);
/** 정수 또는 소수 둘째 자리까지 */
export function num(x:number,dp=2):string{
  const r=Math.round(x*10**dp)/10**dp;
  const s=String(Math.abs(r));
  return (r<0?MINUS:'')+s;
}
/** 기약분수 문자열: 3/4, −2/5, 정수면 정수 */
export function frac(n:number,d:number):string{
  if(d===0)throw Error('zero denominator');
  if(d<0){n=-n;d=-d;}
  const g=gcd(Math.abs(n),d)||1;n/=g;d/=g;
  return (n<0?MINUS:'')+(d===1?String(Math.abs(n)):Math.abs(n)+'/'+d);
}
/** 계수 c와 문자 v로 된 항, 첫 항이면 + 생략 */
export function term(c:number,v:string,first=false):string{
  if(c===0)return '';
  const sign=c<0?MINUS:(first?'':'+');
  const a=Math.abs(c);
  const coef=v&&a===1?'':num(a);
  return sign+coef+v;
}
/** 내림차순 계수 배열 → 다항식 (예: [1,−2,0,5] → x³−2x²+5) */
export function poly(coefs:number[],v='x'):string{
  const deg=coefs.length-1;
  const powers=['','','²','³','⁴','⁵','⁶'];
  let out='';
  coefs.forEach((c,i)=>{
    const p=deg-i;
    const vv=p===0?'':p===1?v:v+powers[p];
    const t=term(c,vv,out==='');
    out+=t;
  });
  return out||'0';
}
/** x−r 꼴 일차식 (r=0이면 x) */
export const linFactor=(r:number,v='x')=>r===0?v:r>0?v+MINUS+num(r):v+'+'+num(-r);
/** 복소수 a+bi */
export function cx(a:number,b:number):string{
  if(b===0)return num(a);
  const bi=(Math.abs(b)===1?'':num(Math.abs(b)))+'i';
  if(a===0)return (b<0?MINUS:'')+bi;
  return num(a)+(b<0?MINUS:'+')+bi;
}
/** √n 간단히: 12 → 2√3, 9 → 3 */
export function root(n:number):string{
  if(n<0)throw Error('negative root');
  let out=1,inside=n;
  for(let k=2;k*k<=inside;k++)while(inside%(k*k)===0){inside/=k*k;out*=k;}
  if(inside===1)return String(out);
  return (out===1?'':out)+'√'+inside;
}
/** (p/q)π → '(3π)/2', 'π', '2π', '−(π)/3' (MathLine이 분수로 쌓음) */
export function piFrac(p:number,q:number):string{
  if(p===0)return '0';
  if(q<0){p=-p;q=-q;}
  const g=gcd(Math.abs(p),q);p/=g;q/=g;
  const sign=p<0?MINUS:'';const a=Math.abs(p);
  const top=(a===1?'':a)+'π';
  return sign+(q===1?top:'('+top+')/'+q);
}
const SUB='₀₁₂₃₄₅₆₇₈₉',SUP='⁰¹²³⁴⁵⁶⁷⁸⁹';
export const sub=(n:number|string)=>String(n).replace(/\d/g,d=>SUB[Number(d)]);
export const sup=(n:number|string)=>String(n).replace(/\d/g,d=>SUP[Number(d)]).replace(/[-−]/g,'⁻');
export const fact=(n:number):number=>n<=1?1:n*fact(n-1);
export function nPr(n:number,r:number){let v=1;for(let i=0;i<r;i++)v*=n-i;return v;}
export function nCr(n:number,r:number){if(r<0||r>n)return 0;r=Math.min(r,n-r);let v=1;for(let i=1;i<=r;i++)v=v*(n-r+i)/i;return Math.round(v);}
/** 좌표 (a, b) */
export const pt=(a:number|string,b:number|string)=>'('+(typeof a==='number'?num(a):a)+', '+(typeof b==='number'?num(b):b)+')';
/** 이차부등식 (x−α)(x−β) op 0 의 해 */
export function ineqSolution(alpha:number,beta:number,op:'<'|'>'|'≤'|'≥'):string{
  const lo=Math.min(alpha,beta),hi=Math.max(alpha,beta);
  if(lo===hi){
    if(op==='<')return '해가 없음';
    if(op==='≤')return 'x='+num(lo);
    if(op==='>')return 'x≠'+num(lo)+'인 모든 실수';
    return '모든 실수';
  }
  if(op==='<')return num(lo)+'<x<'+num(hi);
  if(op==='≤')return num(lo)+'≤x≤'+num(hi);
  if(op==='>')return 'x<'+num(lo)+' 또는 x>'+num(hi);
  return 'x≤'+num(lo)+' 또는 x≥'+num(hi);
}
/** 표준정규분포 누적확률 Φ(z) (오차 < 1e-7) */
export function phi(z:number){
  const t=1/(1+0.2316419*Math.abs(z));
  const d=0.3989422804*Math.exp(-z*z/2);
  const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  return z>0?1-p:p;
}
