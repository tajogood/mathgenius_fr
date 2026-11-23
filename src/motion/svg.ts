// @ts-nocheck — 애니메이션 장면용 SVG 문자열 빌더 (초등·중등 공용). 출력은 tests/*motion*.test.tsx 에서 전 장면 검증.
/* 좌표계: viewBox 0 0 520 260. 클래스(pop/fade/draw/mv/...)는 src/motion/motion.css 의 키프레임을 사용 */
const C = { b:'#586bde', bl:'#e3e9ff', o:'#f29a38', ol:'#ffeacc', g:'#2fae7b', gl:'#d8f3e7', r:'#e55d6b', rl:'#fde0e3',
  p:'#9a6ad8', pl:'#eee3fb', k:'#263759', m:'#8592ad', l:'#e4e9f6', w:'#ffffff' };
const f = n => Math.round(n * 10) / 10;
const UNIT = { d:'s', o:'s', t:'s', fr:'deg', tr:'deg', r0:'deg', r1:'deg', r2:'deg', r3:'deg', fs:'', ts:'', p:'' };
const TF_KEYS = ['fx', 'fy', 'tx', 'ty', 'fr', 'tr', 'fs', 'ts', 'ox', 'oy'];
const TF_DEFAULT = { fx: 0, fy: 0, tx: 0, ty: 0, fr: 0, tr: 0, fs: 1, ts: 1, ox: 0, oy: 0 };
function sv(o) {
  // CSS 변수는 상속되므로, 이동/회전 변수를 하나라도 쓰면 나머지도 기본값으로 명시해 부모 그룹의 값을 끊는다
  if (TF_KEYS.some(k => o[k] !== undefined)) o = { ...TF_DEFAULT, ...o };
  let s = '';
  for (const k of ['d','o','t','fx','fy','tx','ty','fr','tr','fs','ts','ox','oy','p','r0','r1','r2','r3','y1','y2','y3']) {
    if (o[k] !== undefined) s += `--${k}:${typeof o[k] === 'number' ? f(o[k]) : o[k]}${UNIT[k] ?? 'px'};`;
  }
  if (o.st) s += o.st;
  return s ? ` style="${s}"` : '';
}
function cl(o, def) {
  let c = o.c !== undefined ? o.c : def;
  if (o.o !== undefined) c += ' gone';
  if (o.pulse) c += ' pulse';
  c = c.trim();
  return c ? ` class="${c}"` : '';
}
function pa(o, df, ds) {
  return ` fill="${o.f ?? df}" stroke="${o.s ?? ds}" stroke-width="${o.w ?? 2}"` +
    (o.dash ? ` stroke-dasharray="${o.dash}"` : '') + (o.op !== undefined ? ` fill-opacity="${o.op}" stroke-opacity="${o.op}"` : '') + (o.a ? ' ' + o.a : '');
}
const L = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" pathLength="1" stroke-linecap="round"${pa(o, 'none', C.k)}${cl(o, o.dash ? 'fade' : 'draw')}${sv(o)}/>`;
const P = (d, o = {}) =>
  `<path d="${d}" pathLength="1" stroke-linecap="round" stroke-linejoin="round"${pa(o, 'none', C.k)}${cl(o, o.dash || (o.f && o.f !== 'none') ? 'fade' : 'draw')}${sv(o)}/>`;
const R = (x, y, w, h, o = {}) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${o.rx ?? 0}"${pa(o, C.bl, C.b)}${cl(o, 'pop')}${sv(o)}/>`;
const Ci = (cx, cy, r, o = {}) =>
  `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" pathLength="1"${pa(o, C.b, 'none')}${cl(o, 'pop')}${sv(o)}/>`;
const T = (x, y, s, o = {}) =>
  `<text x="${f(x)}" y="${f(y)}" text-anchor="${o.an ?? 'middle'}" dominant-baseline="central" font-size="${o.z ?? 16}" font-weight="${o.wt ?? 800}" fill="${o.f ?? C.k}"` +
  (o.mono ? ' font-family="ui-monospace,Menlo,Consolas,monospace"' : '') + (o.a ? ' ' + o.a : '') + `${cl(o, 'pop')}${sv(o)}>${String(s).replace(/<(?=[\s\d])/g, '&lt;')}</text>`;
const G = (inner, o = {}) => `<g${cl(o, '')}${sv(o)}${o.tf ? ` transform="${o.tf}"` : ''}${o.a ? ' ' + o.a : ''}>${inner}</g>`;
const Poly = (pts, o = {}) =>
  `<polygon points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}"${pa(o, C.bl, C.b)}${cl(o, 'fade')}${sv(o)}/>`;
const PL = (pts, o = {}) =>
  `<polyline points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" pathLength="1" stroke-linecap="round" stroke-linejoin="round"${pa(o, 'none', C.k)}${cl(o, o.dash ? 'fade' : 'draw')}${sv(o)}/>`;

// 각도(수학 방향, 반시계, 도) → 화면 좌표
const pt = (cx, cy, r, a) => { const t = a * Math.PI / 180; return [cx + r * Math.cos(t), cy - r * Math.sin(t)]; };
function arcD(cx, cy, r, a0, a1) {
  const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1);
  const span = ((a1 - a0) % 360 + 360) % 360;
  return `M${f(x0)} ${f(y0)}A${r} ${r} 0 ${span > 180 ? 1 : 0} 0 ${f(x1)} ${f(y1)}`;
}
const wedgeD = (cx, cy, r, a0, a1) => `M${f(cx)} ${f(cy)}L` + arcD(cx, cy, r, a0, a1).slice(1) + 'Z';
// 부채꼴을 쓸어 그리는 원(반시계 방향, 시작각 a0)
const Pie = (cx, cy, r, deg, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r / 2}" fill="none" stroke="${o.f ?? C.b}" stroke-width="${r}" pathLength="100" opacity="${o.op ?? 1}"` +
  ` transform="matrix(1 0 0 -1 0 ${2 * cy}) rotate(${o.a0 ?? 0} ${cx} ${cy})" class="sweep"${sv({ ...o, p: deg / 3.6 })}/>`;
// 직각 표시
function RA(p, u, v, s = 12, o = {}) {
  const n = a => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; };
  const a = n(u), b = n(v);
  return P(`M${f(p[0] + a[0] * s)} ${f(p[1] + a[1] * s)}L${f(p[0] + (a[0] + b[0]) * s)} ${f(p[1] + (a[1] + b[1]) * s)}L${f(p[0] + b[0] * s)} ${f(p[1] + b[1] * s)}`, { w: 1.8, s: C.k, ...o });
}
function axes(ox, oy, u, o = {}) {
  const { x0 = -5, x1 = 5, y0 = -4, y1 = 4, d = 0, grid = true, lx = 'x', ly = 'y', nums = [], uy = u } = o;
  const X = v => ox + v * u, Y = v => oy - v * uy;
  let s = '';
  if (grid) {
    let g = '';
    for (let i = Math.ceil(x0); i <= x1; i++) if (i) g += `<line x1="${f(X(i))}" y1="${f(Y(y0))}" x2="${f(X(i))}" y2="${f(Y(y1))}"/>`;
    for (let j = Math.ceil(y0); j <= y1; j++) if (j) g += `<line x1="${f(X(x0))}" y1="${f(Y(j))}" x2="${f(X(x1))}" y2="${f(Y(j))}"/>`;
    s += `<g class="fade" stroke="${C.l}" stroke-width="1"${sv({ d })}>${g}</g>`;
  }
  s += L(X(x0), oy, X(x1) + 8, oy, { d, t: .5, s: C.m, w: 1.6 }) + L(ox, Y(y0), ox, Y(y1) - 8, { d, t: .5, s: C.m, w: 1.6 });
  s += T(X(x1) + 14, oy, lx, { z: 13, f: C.m, d: d + .3, c: 'fade' }) + T(ox, Y(y1) - 16, ly, { z: 13, f: C.m, d: d + .3, c: 'fade' });
  let n = '';
  nums.forEach(([axis, v]) => {
    n += axis === 'x' ? `<text x="${f(X(v))}" y="${oy + 14}" text-anchor="middle" dominant-baseline="central">${v < 0 ? '−' + (-v) : v}</text>`
      : `<text x="${ox - 9}" y="${f(Y(v))}" text-anchor="end" dominant-baseline="central">${v < 0 ? '−' + (-v) : v}</text>`;
  });
  if (n) s += `<g class="fade" font-size="11" fill="${C.m}" font-weight="700"${sv({ d: d + .3 })}>${n}</g>`;
  return { s, X, Y };
}
function nline(x0, x1, y, min, max, o = {}) {
  const { d = 0, step = 1, lab = true, z = 12 } = o;
  const X = v => x0 + (v - min) * (x1 - x0) / (max - min);
  let s = L(x0 - 14, y, x1 + 14, y, { d, t: .6, s: C.k, w: 2 });
  let g = '';
  for (let v = min; v <= max + 1e-9; v += step) {
    g += `<line x1="${f(X(v))}" y1="${y - 6}" x2="${f(X(v))}" y2="${y + 6}" stroke="${C.k}" stroke-width="${v === 0 ? 2.4 : 1.4}"/>`;
    if (lab) g += `<text x="${f(X(v))}" y="${y + 20}" text-anchor="middle" dominant-baseline="central" font-size="${z}" font-weight="${v === 0 ? 900 : 700}" fill="${C.m}">${v < 0 ? '−' + (-v) : v}</text>`;
  }
  s += `<g class="fade"${sv({ d: d + .3 })}>${g}</g>`;
  return { s, X };
}
// 순서대로 나타나는 식 줄
function eqs(lines, o = {}) {
  const { x = 260, y = 50, dy = 42, d = .3, gap = 1.1, z = 20, an = 'middle' } = o;
  return lines.map((ln, i) => {
    const [txt, note, col] = Array.isArray(ln) ? ln : [ln];
    let s = T(x, y + i * dy, txt, { z, an, d: d + i * gap, f: col || C.k, mono: o.mono });
    if (note) s += T(o.nx ?? (x + 150), y + i * dy, note, { z: 13, an: 'start', f: C.o, d: d + i * gap + .3 });
    return s;
  }).join('');
}
const S = (cap, dur, svg) => ({ cap, dur, svg });
const chip = (x, y, label, col = C.b, lt = C.bl, r = 20, z = 17) => Ci(x, y, r, { f: lt, s: col, w: 2.5, c: '' }) + T(x, y, label, { z, f: col, c: '' });
const box = (x, y, w, h, label, col = C.b, lt = C.bl, z = 16) => R(x, y, w, h, { f: lt, s: col, w: 2, rx: 6, c: '' }) + T(x + w / 2, y + h / 2, label, { z, f: col, c: '' });


export { C, f, sv, L, P, R, Ci, T, G, Poly, PL, pt, arcD, wedgeD, Pie, RA, axes, nline, eqs, S, chip, box };
