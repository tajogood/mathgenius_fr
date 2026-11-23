// @ts-nocheck — 초등 애니메이션용 그림 도구 (블록, 10묶음, 분수 막대, 시계 등). 출력은 tests/elementary-motion.test.tsx 에서 검증.
import { C, f, L, P, R, Ci, T, G, Poly, PL, pt, arcD, wedgeD, Pie, RA, axes, nline, eqs, S, chip, box } from '../svg.ts';

/** 낱개 블록 (한 변 s) */
export const blk = (x, y, o = {}, col = C.b, lt = C.bl, s = 20) =>
  G(R(x, y, s - 2, s - 2, { f: lt, s: col, w: 1.6, rx: 4, c: '' }), o);
/** 10개짜리 막대 (세로) */
export function rod(x, y, o = {}, col = C.g, lt = C.gl, s = 14) {
  let g = R(x, y, s, s * 10, { f: lt, s: col, w: 1.6, rx: 3, c: '' });
  for (let i = 1; i < 10; i++) g += `<line x1="${x}" y1="${y + i * s}" x2="${x + s}" y2="${y + i * s}" stroke="${col}" stroke-width="1"/>`;
  return G(g, o);
}
/** 100판 (10×10) */
export function flat(x, y, o = {}, col = C.p, lt = C.pl, s = 9) {
  let g = R(x, y, s * 10, s * 10, { f: lt, s: col, w: 1.6, rx: 3, c: '' });
  for (let i = 1; i < 10; i++) g += `<line x1="${x + i * s}" y1="${y}" x2="${x + i * s}" y2="${y + s * 10}" stroke="${col}" stroke-width=".8"/><line x1="${x}" y1="${y + i * s}" x2="${x + s * 10}" y2="${y + i * s}" stroke="${col}" stroke-width=".8"/>`;
  return G(g, o);
}
/** 분수 막대: n등분, 앞에서 k칸 색칠 */
export function fbar(x, y, w, h, n, k, o = {}, col = C.b, lt = C.bl, dStep = 0) {
  let g = '';
  for (let i = 0; i < n; i++) {
    const filled = i < k;
    g += R(x + i * w / n, y, w / n, h, { f: filled ? lt : '#fff', s: col, w: 1.6, c: dStep && filled ? 'fade' : '', d: dStep ? (o.d ?? 0) + i * dStep : undefined });
  }
  return G(g, dStep ? { ...o, c: '', d: undefined } : o);
}
/** 시계 판 (바늘 제외) */
export function clockFace(cx, cy, r, o = {}) {
  let g = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${C.k}" stroke-width="3"/>`;
  for (let i = 1; i <= 12; i++) {
    const [x, y] = pt(cx, cy, r - 16, 90 - i * 30);
    g += `<text x="${f(x)}" y="${f(y)}" text-anchor="middle" dominant-baseline="central" font-size="${r > 70 ? 14 : 11}" font-weight="800" fill="${C.k}">${i}</text>`;
  }
  for (let i = 0; i < 60; i++) {
    const [x1, y1] = pt(cx, cy, r - 3, 90 - i * 6), [x2, y2] = pt(cx, cy, r - (i % 5 ? 6 : 9), 90 - i * 6);
    g += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${C.m}" stroke-width="${i % 5 ? 1 : 2}"/>`;
  }
  return G(g, { c: 'fade', ...o });
}
/** 시계 바늘: 12시 방향으로 그린 뒤 deg0 → deg1 (시계 방향) 회전 */
export const hand = (cx, cy, len, w, col, deg0, deg1, o = {}) =>
  G(L(cx, cy + 8, cx, cy - len, { s: col, w, c: '' }), { c: 'mv', ox: cx, oy: cy, fr: deg0, tr: deg1 ?? deg0, ...o });
/** 이모지 물건 */
export const emo = (x, y, e, o = {}, z = 26) => T(x, y, e, { z, wt: 400, ...o });
/** 아래로 떨어지는 등장 */
export const drop = (o) => ({ c: 'mv', fy: -40, t: .5, ...o });

export { C, f, L, P, R, Ci, T, G, Poly, PL, pt, arcD, wedgeD, Pie, RA, axes, nline, eqs, S, chip, box };
