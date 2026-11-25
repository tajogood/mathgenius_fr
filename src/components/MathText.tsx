import type { ReactNode } from 'react';
import { tr } from '../i18n/index.ts';

/** Visual typesetting only. Answers and grading stay in their original text format. */
export function Fraction({ numerator, denominator }: {
  numerator: number | string;
  denominator: number | string;
}) {
  return <span className="math-fraction" role="math"
    aria-label={String(denominator)+'분의 '+String(numerator)}>
    <span className="math-fraction__top" aria-hidden="true">{numerator}</span>
    <span className="math-fraction__bar" aria-hidden="true" />
    <span className="math-fraction__bottom" aria-hidden="true">{denominator}</span>
  </span>;
}

const splitFractions = /(-?\d+\s*\/\s*\d+)/g;
const exactFraction = /^(-?\d+)\s*\/\s*(\d+)$/;

/** Render embedded 2/5, 3/4, 2와 1/3 in questions, answers, and explanations. */
export function MathText({ text }: { text: string }): ReactNode {
  text = tr(text);
  return <>{text.split(splitFractions).map((part,index)=>{
    const parts=part.match(exactFraction);
    return parts
      ? <Fraction key={index} numerator={parts[1]} denominator={parts[2]}/>
      : part;
  })}</>;
}
