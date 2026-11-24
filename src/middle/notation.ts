/** 순환소수 표기(교과서식): 순환마디의 첫 숫자와 끝 숫자 위에 점을 찍는다.
 *  0.333… → 0.3̇ , 0.1666… → 0.16̇ , 0.0909… → 0.0̇9̇ , 0.142857… → 0.1̇42857̇ */
const DOT='̇';
export function dotRepeat(integer:number|string,head:string,cycle:string):string{
  if(!cycle)return String(integer)+'.'+(head||'0');
  const marked=cycle.length===1?cycle+DOT:cycle[0]+DOT+cycle.slice(1,-1)+cycle.at(-1)+DOT;
  return String(integer)+'.'+head+marked;
}
