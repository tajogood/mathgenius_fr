/** An average is an equal share of a fixed total, even when a final unit must be divided. */
export type MeanTransfer={from:number;to:number};
export const totalOf=(values:readonly number[])=>values.reduce((sum,value)=>sum+value,0);
export const meanOf=(values:readonly number[])=>values.length?totalOf(values)/values.length:0;
export function nextEqualizingTransfer(values:readonly number[]):MeanTransfer|null{
  if(values.length<2)return null;
  const greatest=Math.max(...values),least=Math.min(...values);
  if(greatest-least<=1)return null;
  return {from:values.indexOf(greatest),to:values.indexOf(least)};
}
export function transferOne(values:readonly number[],from:number,to:number):number[]{
  if(from===to||from<0||to<0||from>=values.length||to>=values.length||values[from]<1)return [...values];
  return values.map((value,index)=>index===from?value-1:index===to?value+1:value);
}
export function equalShares(values:readonly number[]):{whole:number;remainder:number;count:number}{
  const count=values.length;
  const sum=totalOf(values);
  return {whole:count?Math.floor(sum/count):0,remainder:count?sum%count:0,count};
}
