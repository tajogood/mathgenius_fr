import type { ReactElement } from 'react';
import { gcd, lcm } from '../../math.ts';
import './fraction-solution.css';

/** 분수 덧셈·뺄셈 풀이 그림: ① 같은 크기 조각(통분) → ② 분자끼리 계산 → ③ 약분 */
export type FractionSolutionInput = { n1:number; d1:number; n2:number; d2:number; subtract:boolean; step:number };

export function fractionSolution({ n1, d1, n2, d2, subtract }: Omit<FractionSolutionInput,'step'>) {
  const D = lcm(d1, d2), a = n1 * (D / d1), b = n2 * (D / d2);
  const n = subtract ? a - b : a + b;
  const g = n === 0 ? 1 : gcd(n, D);
  return { D, a, b, n, g, rn: n / g, rd: D / g, reducible: g > 1 };
}

const W = 320, X0 = 20, H = 30;
/** 막대 하나 (d칸, cells[i] = 색 이름 | null) */
function Bar({ y, d, cells, delay = 0, strike = [] as number[], label }:
  { y:number; d:number; cells:(string|null)[]; delay?:number; strike?:number[]; label?:string }) {
  const w = W / d;
  return <g>
    {Array.from({ length: d }, (_, i) => <rect key={i} x={X0 + i * w} y={y} width={w} height={H}
      className={'fs-cell' + (cells[i] ? ' fs-cell--' + cells[i] : '')}
      style={{ animationDelay: (delay + (cells[i] ? i * .06 : 0)) + 's' }} />)}
    {strike.map(i => <g key={'s' + i} className="fs-strike" style={{ animationDelay: (delay + .6 + i * .05) + 's' }}>
      <line x1={X0 + i * w + 4} y1={y + 4} x2={X0 + (i + 1) * w - 4} y2={y + H - 4} />
      <line x1={X0 + (i + 1) * w - 4} y1={y + 4} x2={X0 + i * w + 4} y2={y + H - 4} /></g>)}
    {label && <text x={X0 + W + 12} y={y + H / 2} className="fs-label" dominantBaseline="central">{label}</text>}
  </g>;
}
const fill = (d:number, ranges:[number, number, string][]) =>
  Array.from({ length: d }, (_, i) => ranges.find(([s, e]) => i >= s && i < e)?.[2] ?? null);

export default function FractionSolutionFigure(props: FractionSolutionInput) {
  const { n1, d1, n2, d2, subtract } = props;
  const step = Math.max(0, Math.min(2, props.step));
  const s = fractionSolution(props);
  const { D, a, b, n, g, rn, rd, reducible } = s;
  const sign = subtract ? '−' : '+';
  const wholes = Math.max(1, Math.ceil(n / D));
  let body: ReactElement, caption: string;

  if (step === 0) {
    const same = d1 === d2;
    body = <>
      <Bar y={14} d={d1} cells={fill(d1, [[0, n1, 'blue']])} label={`${n1}/${d1}`} />
      {!same && <Bar y={54} d={D} cells={fill(D, [[0, a, 'blue']])} delay={.6} label={`= ${a}/${D}`} />}
      <Bar y={same ? 60 : 108} d={d2} cells={fill(d2, [[0, n2, 'amber']])} delay={same ? .3 : 1} label={`${n2}/${d2}`} />
      {!same && <Bar y={148} d={D} cells={fill(D, [[0, b, 'amber']])} delay={1.6} label={`= ${b}/${D}`} />}
    </>;
    caption = same ? `분모가 ${D}로 같아서 한 조각의 크기가 같아요.` : `조각 크기가 달라서 둘 다 ${D}조각으로 나눠요 (통분).`;
  } else if (step === 1) {
    const rows = Array.from({ length: wholes }, (_, r) => {
      const off = r * D;
      const cells = subtract ? fill(D, [[0 - off, a - off, 'blue']]) : fill(D, [[0 - off, a - off, 'blue'], [a - off, a + b - off, 'amber']]);
      const strike = subtract ? Array.from({ length: b }, (_, k) => a - b + k - off).filter(i => i >= 0 && i < D) : [];
      return <Bar key={r} y={30 + r * 44} d={D} cells={cells} strike={strike} delay={.1 + r * .3} label={r === wholes - 1 ? `= ${n}/${D}` : undefined} />;
    });
    body = <>{rows}</>;
    caption = `분자끼리 ${subtract ? '빼요' : '더해요'}: ${a}/${D} ${sign} ${b}/${D} = ${n}/${D}`;
  } else {
    const resultRows = Array.from({ length: wholes }, (_, r) =>
      <Bar key={r} y={14 + r * 40} d={D} cells={fill(D, [[0 - r * D, n - r * D, 'green']])} label={r === wholes - 1 ? `${n}/${D}` : undefined} />);
    const top = 14 + wholes * 40;
    body = <>
      {resultRows}
      {reducible && <>
        {Array.from({ length: wholes }, (_, r) => <Bar key={'r' + r} y={top + 36 + r * 40} d={rd} delay={1.2}
          cells={fill(rd, [[0 - r * rd, rn - r * rd, 'green']])} label={r === wholes - 1 ? `= ${rn}/${rd}` : undefined} />)}
        {Array.from({ length: rd + 1 }, (_, k) => <line key={'g' + k} className="fs-guide" style={{ animationDelay: '.6s' }}
          x1={X0 + k * W / rd} y1={top - 6} x2={X0 + k * W / rd} y2={top + 36} />)}
      </>}
    </>;
    caption = n === 0 ? '남는 양이 없어요: 답은 0이에요.'
      : reducible ? `${n}/${D}의 칸을 ${g}개씩 묶으면 ${rn}/${rd}과 길이가 같아요. 분자·분모를 ${g}로 나누는 것이 약분이에요.`
        : `${n}/${D}은 더 간단히 할 수 없어요. 답은 ${n}/${D}이에요.`;
  }
  const height = step === 2 ? 14 + wholes * 40 + (reducible ? 40 + wholes * 40 : 0) : step === 1 ? 30 + wholes * 44 + 10 : d1 === d2 ? 104 : 190;
  return <figure className="fraction-solution" data-testid="fraction-solution" data-step={step}>
    <svg key={step} viewBox={`0 0 ${X0 + W + 90} ${height}`} role="img" aria-label={caption}>{body}</svg>
    <figcaption>{caption}</figcaption>
  </figure>;
}
