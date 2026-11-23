import type { Problem } from '../../math.ts';

export type LabPhase = 'concept' | 'question' | 'solution';
export type LabProps = {
  problem: Problem;
  phase: LabPhase;
  step: number;
  standardId?: string;
};

export const bound = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function LabHint({ children }: { children: React.ReactNode }) {
  return <div className="lab-hint" aria-live="polite">{children}</div>;
}
export function LabTools({ children }: { children: React.ReactNode }) {
  return <div className="lab-tools">{children}</div>;
}
export function SmallControl({ label, value, change, min, max }: {
  label: string; value: number; change: (next: number) => void; min: number; max: number;
}) {
  return <div className="lab-small-control" role="group" aria-label={label}>
    <button type="button" aria-label={label+' 줄이기'} onClick={() => change(bound(value-1,min,max))} disabled={value<=min}>−</button>
    <span>{label} <strong>{value}</strong></span>
    <button type="button" aria-label={label+' 늘리기'} onClick={() => change(bound(value+1,min,max))} disabled={value>=max}>+</button>
  </div>;
}
