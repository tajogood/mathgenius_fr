// @ts-nocheck — 장면 생성용 SVG 문자열 빌더 (타입 안전한 공개 API는 index.ts). 모든 장면은 tests/middle-motion.test.tsx 에서 렌더링 검증.
/* 수학천재 중등 · 직접 탐구 애니메이션 장면 데이터. 좌표계: viewBox 0 0 520 260 */
const C = { b:'#586bde', bl:'#e3e9ff', o:'#f29a38', ol:'#ffeacc', g:'#2fae7b', gl:'#d8f3e7', r:'#e55d6b', rl:'#fde0e3',
  p:'#9a6ad8', pl:'#eee3fb', k:'#263759', m:'#8592ad', l:'#e4e9f6', w:'#ffffff' };
const f = n => Math.round(n * 10) / 10;
const UNIT = { d:'s', o:'s', t:'s', fr:'deg', tr:'deg', r0:'deg', r1:'deg', r2:'deg', r3:'deg', fs:'', ts:'', p:'' };
function sv(o) {
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

const M = {};

// ===== grade1 =====
{


/* ───────── 중1-1 소인수분해 ───────── */
M.primes = [
  S('12를 나누어떨어지게 하는 <strong>소수</strong>로 계속 쪼개 가지를 뻗어요. 더 이상 쪼갤 수 없는 소수(초록)에 닿으면 멈춰요.', 7, () => {
    const node = (x, y, n, pr, d) => G(chip(x, y, n, pr ? C.g : C.b, pr ? C.gl : C.bl, 22, 18), { c: 'pop', d });
    return G(Ci(40, 36, 8, { f: C.gl, s: C.g, c: '' }) + T(54, 36, '소수', { an: 'start', z: 13, c: '' }) +
        Ci(40, 60, 8, { f: C.bl, s: C.b, c: '' }) + T(54, 60, '합성수', { an: 'start', z: 13, c: '' }), { c: 'fade', d: .1 }) +
      node(260, 40, 12, 0, .2) +
      L(244, 58, 210, 92, { d: .9, t: .5, s: C.m }) + L(276, 58, 310, 92, { d: .9, t: .5, s: C.m }) +
      T(208, 66, '÷ 2', { z: 13, f: C.m, d: .9 }) +
      node(196, 112, 2, 1, 1.4) + node(324, 112, 6, 0, 1.4) +
      L(310, 130, 282, 160, { d: 2.3, t: .5, s: C.m }) + L(338, 130, 366, 160, { d: 2.3, t: .5, s: C.m }) +
      T(278, 138, '÷ 2', { z: 13, f: C.m, d: 2.3 }) +
      node(272, 180, 2, 1, 2.8) + node(378, 180, 3, 1, 2.8) +
      T(260, 236, '12 = 2 × 2 × 3', { z: 22, d: 3.8 });
  }),
  S('흩어진 소인수를 한 줄로 모아요. 같은 소수가 여러 번 곱해지면 <strong>거듭제곱</strong>으로 묶어서 12 = 2² × 3 으로 써요.', 6.5, () =>
    T(95, 100, '12 =', { z: 22, d: .1 }) +
    G(chip(170, 100, 2, C.g, C.gl, 22, 18), { c: 'mv', fx: 26, fy: 12, d: .4, t: 1.1 }) +
    G(chip(250, 100, 2, C.g, C.gl, 22, 18), { c: 'mv', fx: 22, fy: 80, d: .55, t: 1.1 }) +
    G(chip(330, 100, 3, C.g, C.gl, 22, 18), { c: 'mv', fx: 48, fy: 80, d: .7, t: 1.1 }) +
    T(210, 100, '×', { z: 22, d: 1.7 }) + T(290, 100, '×', { z: 22, d: 1.7 }) +
    P('M150 132Q150 144 162 144L198 144Q210 144 210 156Q210 144 222 144L258 144Q270 144 270 132', { d: 2.2, s: C.o, w: 2.5 }) +
    T(210, 174, '2가 2번 곱해짐 → 2²', { z: 15, f: C.o, d: 2.7 }) +
    T(260, 226, '12 = 2² × 3', { z: 26, d: 3.5, pulse: 1 })),
  S('12와 18을 소인수분해해서 <strong>공통 소인수</strong>를 찾아요. 공통인 것만 곱하면 최대공약수, 모두 모아 한 번씩 곱하면 최소공배수예요.', 8, () => {
    const c = (x, y, n, d) => G(chip(x, y, n, C.g, C.gl, 19, 16), { c: 'pop', d });
    const ring = (x, y, d) => Ci(x, y, 26, { f: 'none', s: C.o, w: 3, d, pulse: 1 });
    return T(70, 60, '12 =', { z: 19, d: .1 }) + c(130, 60, 2, .3) + c(185, 60, 2, .45) + c(240, 60, 3, .6) +
      T(70, 140, '18 =', { z: 19, d: .8 }) + c(130, 140, 2, 1) + c(185, 140, 3, 1.15) + c(240, 140, 3, 1.3) +
      ring(130, 60, 2) + ring(130, 140, 2) + L(130, 86, 130, 114, { s: C.o, w: 3, d: 2.2, t: .4 }) +
      ring(240, 60, 2.6) + ring(185, 140, 2.6) + L(232, 84, 193, 116, { s: C.o, w: 3, d: 2.8, t: .4 }) +
      R(290, 34, 210, 82, { f: C.ol, s: C.o, rx: 12, d: 3.6 }) +
      T(395, 56, '최대공약수 (공통만)', { z: 13, f: '#b0661a', d: 3.8 }) + T(395, 88, '2 × 3 = 6', { z: 22, d: 4.1 }) +
      R(290, 130, 210, 82, { f: C.bl, s: C.b, rx: 12, d: 5 }) +
      T(395, 152, '최소공배수 (모두 한 번씩)', { z: 13, f: C.b, d: 5.2 }) + T(395, 184, '2 × 2 × 3 × 3 = 36', { z: 19, d: 5.5 }) +
      T(160, 222, '같은 색 원 = 두 수에 모두 들어 있는 소인수', { z: 13, f: C.o, d: 3 });
  })
];

/* ───────── 중1-1 정수와 유리수 ───────── */
M.integers = [
  S('+3과 −3은 0에서 <strong>같은 거리 3</strong>만큼 떨어져 있어요. 0으로부터의 거리를 절댓값이라고 하고 |+3| = |−3| = 3 이에요.', 6.5, () => {
    const n = nline(50, 470, 170, -6, 6, { d: .1 });
    return n.s + Ci(n.X(0), 170, 7, { f: C.k, d: .5 }) +
      Ci(n.X(3), 170, 10, { f: C.b, d: 1 }) + Ci(n.X(-3), 170, 10, { f: C.r, d: 1.3 }) +
      T(n.X(3) + 24, 150, '+3', { z: 18, f: C.b, d: 1 }) + T(n.X(-3) - 24, 150, '−3', { z: 18, f: C.r, d: 1.3 }) +
      P(`M${n.X(0)} 155Q${(n.X(0) + n.X(3)) / 2} 80 ${n.X(3)} 155`, { s: C.b, w: 2.5, d: 2, t: .9 }) +
      P(`M${n.X(0)} 155Q${(n.X(0) + n.X(-3)) / 2} 80 ${n.X(-3)} 155`, { s: C.r, w: 2.5, d: 2, t: .9 }) +
      T((n.X(0) + n.X(3)) / 2, 100, '거리 3', { z: 14, f: C.b, d: 2.8 }) + T((n.X(0) + n.X(-3)) / 2, 100, '거리 3', { z: 14, f: C.r, d: 2.8 }) +
      T(260, 40, '|+3| = |−3| = 3', { z: 24, d: 3.6, pulse: 1 });
  }),
  S('(+2) + (−5): 음수를 <strong>더하면 왼쪽으로</strong> 이동해요. 2에서 왼쪽으로 5칸 가면 −3 이에요.', 6, () => {
    const n = nline(50, 470, 180, -6, 6, { d: .1 });
    return n.s + T(260, 40, '(+2) + (−5) = ?', { z: 22, d: .2 }) +
      P(`M${n.X(2)} 160Q${(n.X(2) + n.X(-3)) / 2} 70 ${n.X(-3)} 160`, { s: C.r, w: 3, d: 1.1, t: 1.4 }) +
      P(`M${n.X(-3) + 9} 150L${n.X(-3)} 160L${n.X(-3) + 13} 160`, { s: C.r, w: 3, d: 2.4, t: .3 }) +
      T((n.X(2) + n.X(-3)) / 2, 100, '−5 : 왼쪽으로 5칸', { z: 14, f: C.r, d: 1.5 }) +
      G(P(`M${n.X(-3)} 174l-9 -16h18z`, { f: C.o, s: C.o, c: '' }), { c: 'mv', fx: n.X(2) - n.X(-3), d: 1.1, t: 1.4 }) +
      T(260, 236, '(+2) + (−5) = −3', { z: 24, d: 3, f: C.b, pulse: 1 });
  }),
  S('(−1) − (−4): 음수를 <strong>빼는 것은 반대 방향(오른쪽)</strong>으로 가는 것과 같아요. −(−4) = +4 이므로 답은 +3 이에요.', 6.5, () => {
    const n = nline(50, 470, 180, -6, 6, { d: .1 });
    return n.s + T(260, 34, '(−1) − (−4) = (−1) + (+4)', { z: 20, d: .2 }) +
      P(`M${n.X(-1)} 160Q${(n.X(-1) + n.X(3)) / 2} 70 ${n.X(3)} 160`, { s: C.b, w: 3, d: 1.2, t: 1.4 }) +
      P(`M${n.X(3) - 9} 150L${n.X(3)} 160L${n.X(3) - 13} 160`, { s: C.b, w: 3, d: 2.5, t: .3 }) +
      T((n.X(-1) + n.X(3)) / 2, 100, '−(−4) → 오른쪽으로 4칸', { z: 14, f: C.b, d: 1.6 }) +
      G(P(`M${n.X(3)} 174l-9 -16h18z`, { f: C.o, s: C.o, c: '' }), { c: 'mv', fx: n.X(-1) - n.X(3), d: 1.2, t: 1.4 }) +
      T(260, 236, '= +3', { z: 24, d: 3.1, f: C.b, pulse: 1 });
  }),
  S('×(−1)은 수직선을 <strong>0을 중심으로 뒤집는</strong> 것과 같아요. 한 번 뒤집으면 음수, 두 번 뒤집으면 다시 양수 → (−)×(−) = (+)', 7.5, () => {
    const n = nline(50, 470, 140, -6, 6, { d: .1 });
    const arr = (y, to) => `M${n.X(0)} ${y}H${n.X(to)}M${n.X(to) - 10 * Math.sign(to)} ${y - 8}L${n.X(to)} ${y}L${n.X(to) - 10 * Math.sign(to)} ${y + 8}`;
    return n.s + T(260, 30, '×(−1) = 0을 기준으로 뒤집기', { z: 18, d: .1 }) +
      P(arr(112, 3), { s: C.m, w: 3, dash: '5 4', d: .5, op: .8 }) + T(n.X(3) + 30, 112, '+3', { z: 15, f: C.m, d: .6 }) +
      G(P(arr(112, 3), { s: C.r, w: 4, c: '' }), { c: 'flip', ox: n.X(0), oy: 0, d: 1.3, t: 1.1 }) +
      T(n.X(-3) - 10, 88, '(+3)×(−1) = −3', { z: 15, f: C.r, d: 2.4 }) +
      G(P(arr(200, -3), { s: C.b, w: 4, c: '' }), { c: 'fade', d: 3.3, o: 3.95 }) +
      G(P(arr(200, -3), { s: C.b, w: 4, c: '' }), { c: 'flip', ox: n.X(0), oy: 0, d: 3.9, t: 1.1 }) +
      T(n.X(3) + 10, 224, '(−3)×(−1) = +3', { z: 15, f: C.b, d: 5 }) +
      T(130, 224, '다시 뒤집으면', { z: 13, f: C.m, d: 3.4 }) +
      T(260, 252, '부호가 같으면 +, 다르면 −', { z: 16, d: 5.8, f: C.k });
  })
];

/* ───────── 중1-1 문자의 사용과 식 ───────── */
M.expressions = [
  S('값을 모르는 수를 <strong>상자 x</strong>로 나타내요. x가 3개, 1이 2개 있으면 3 × x + 2 이고, 곱셈 기호를 생략해 <strong>3x + 2</strong>로 써요.', 6, () =>
    G(box(70, 70, 64, 50, 'x', C.b, C.bl, 22), { c: 'pop', d: .2 }) + G(box(150, 70, 64, 50, 'x', C.b, C.bl, 22), { c: 'pop', d: .45 }) +
    G(box(230, 70, 64, 50, 'x', C.b, C.bl, 22), { c: 'pop', d: .7 }) +
    G(box(330, 83, 26, 26, '1', C.o, C.ol, 14), { c: 'pop', d: 1.2 }) + G(box(366, 83, 26, 26, '1', C.o, C.ol, 14), { c: 'pop', d: 1.35 }) +
    T(182, 150, 'x가 3개', { z: 14, f: C.b, d: 1.6 }) + T(361, 150, '1이 2개', { z: 14, f: C.o, d: 1.8 }) +
    T(260, 200, '3 × x + 2', { z: 22, d: 2.4, o: 3.4, f: C.m }) + T(260, 200, '3x + 2', { z: 28, d: 3.6, pulse: 1 })),
  S('x에 실제 수를 넣는 것을 <strong>대입</strong>이라고 해요. x = 4 를 넣으면 상자마다 4가 들어가서 3 × 4 + 2 = <strong>14</strong>예요.', 6.5, () => {
    const bx = (x, d) => R(x, 70, 64, 50, { f: C.bl, s: C.b, rx: 6, d }) + T(x + 32, 95, 'x', { z: 22, f: C.b, d, o: 1.6 + (x - 70) / 400 }) +
      T(x + 32, 95, '4', { z: 24, f: C.g, d: 1.9 + (x - 70) / 400 });
    return T(430, 40, 'x = 4', { z: 22, f: C.g, d: .3, pulse: 1 }) +
      bx(70, .1) + bx(150, .1) + bx(230, .1) +
      G(box(330, 83, 26, 26, '1', C.o, C.ol, 14), { c: 'pop', d: .1 }) + G(box(366, 83, 26, 26, '1', C.o, C.ol, 14), { c: 'pop', d: .1 }) +
      L(430, 58, 100, 70, { s: C.g, w: 1.5, dash: '4 4', d: 1, o: 2.4 }) +
      T(260, 175, '3x + 2  →  3 × 4 + 2', { z: 20, d: 2.7 }) + T(260, 220, '= 12 + 2 = 14', { z: 24, d: 3.6, f: C.b, pulse: 1 });
  }),
  S('같은 문자끼리 묶인 <strong>동류항</strong>만 합칠 수 있어요. 2x + 3x = 5x 이지만, 2x + 3 은 종류가 달라 더 이상 줄일 수 없어요.', 7.5, () => {
    const b = (x, y, col, lt, o) => G(box(x, y, 50, 40, 'x', col, lt, 18), o);
    return T(110, 30, '2x', { z: 18, f: C.g, d: .1, o: 1 }) + T(330, 30, '3x', { z: 18, f: C.b, d: .1, o: 1 }) +
      b(60, 120, C.g, C.gl, { c: 'mv', fx: 0, fy: -70, d: .3, t: 1 }) + b(118, 120, C.g, C.gl, { c: 'mv', fx: 0, fy: -70, d: .3, t: 1 }) +
      b(176, 120, C.b, C.bl, { c: 'mv', fx: 104, fy: -70, d: .3, t: 1 }) + b(234, 120, C.b, C.bl, { c: 'mv', fx: 104, fy: -70, d: .3, t: 1 }) +
      b(292, 120, C.b, C.bl, { c: 'mv', fx: 104, fy: -70, d: .3, t: 1 }) +
      T(260, 30, '+', { z: 20, d: .1, o: 1 }) + T(400, 140, '= 5x', { z: 24, f: C.b, d: 1.6, pulse: 1 }) +
      L(30, 185, 490, 185, { s: C.l, w: 1, d: 2.6 }) +
      G(box(60, 200, 50, 40, 'x', C.g, C.gl, 18) + box(116, 200, 50, 40, 'x', C.g, C.gl, 18), { c: 'fade', d: 3 }) +
      G(box(206, 207, 26, 26, '1', C.o, C.ol, 14) + box(236, 207, 26, 26, '1', C.o, C.ol, 14) + box(266, 207, 26, 26, '1', C.o, C.ol, 14), { c: 'fade', d: 3 }) +
      T(186, 220, '+', { z: 20, d: 3 }) +
      P('M172 204L200 236M200 204L172 236', { s: C.r, w: 3.5, d: 4, t: .5 }) +
      T(400, 220, '2x + 3 (그대로)', { z: 16, f: C.r, d: 4.4 });
  })
];

/* ───────── 중1-1 일차방정식 ───────── */
function balance(left, right, beamOpts) {
  const beam = L(90, 120, 430, 120, { s: C.k, w: 5, c: '' }) +
    L(150, 120, 150, 160, { s: C.m, w: 1.5, c: '' }) + L(370, 120, 370, 160, { s: C.m, w: 1.5, c: '' }) +
    P('M80 160H220Q210 176 150 176Q90 176 80 160Z', { f: '#f1f4fc', s: C.m, w: 1.5, c: '' }) +
    P('M300 160H440Q430 176 370 176Q310 176 300 160Z', { f: '#f1f4fc', s: C.m, w: 1.5, c: '' }) + left + right;
  return P('M260 122L232 214H288Z', { f: '#d7deef', s: C.m, w: 1.5, c: 'fade' }) + Ci(260, 120, 6, { f: C.k, c: '' }) +
    G(beam, beamOpts || {});
}
const xbox = (x, y, o) => G(box(x, y, 30, 28, 'x', C.b, C.bl, 15), o || { c: '' });
const unit = (x, y, o) => G(R(x, y, 14, 14, { f: C.o, s: '#c96f12', w: 1, rx: 3, c: '' }), o || { c: '' });
M.equations = [
  S('3x + 2 = 14 는 <strong>저울</strong>과 같아요. 왼쪽(x 상자 3개 + 1 두 개)과 오른쪽(1 열네 개)의 무게가 같아서 수평을 이뤄요.', 5.5, () => {
    let r = '';
    for (let i = 0; i < 14; i++) r += unit(322 + (i % 7) * 15, 130 + Math.floor(i / 7) * 15, { c: 'pop', d: .8 + i * .05 });
    const l = xbox(86, 131, { c: 'pop', d: .3 }) + xbox(119, 131, { c: 'pop', d: .4 }) + xbox(152, 131, { c: 'pop', d: .5 }) +
      unit(186, 145, { c: 'pop', d: .6 }) + unit(202, 145, { c: 'pop', d: .65 });
    return balance(l, r) + T(150, 40, '3x + 2', { z: 22, f: C.b, d: 1.8 }) + T(260, 40, '=', { z: 22, d: 2 }) + T(370, 40, '14', { z: 22, f: C.o, d: 2 }) +
      T(260, 244, '양쪽 무게가 같다 = 등식', { z: 14, f: C.m, d: 2.6 });
  }),
  S('왼쪽에서만 1을 2개 빼면 저울이 기울어요. <strong>양쪽에서 똑같이</strong> 2를 빼야 다시 수평 → 3x = 12', 6.5, () => {
    let r = '';
    for (let i = 0; i < 14; i++) {
      const fly = i >= 12;
      r += unit(322 + (i % 7) * 15, 130 + Math.floor(i / 7) * 15, fly ? { c: 'mv', tx: 30, ty: -110, d: 2.45, t: .7, o: 2.9 } : { c: '' });
    }
    const l = xbox(86, 131) + xbox(119, 131) + xbox(152, 131) +
      unit(186, 145, { c: 'mv', tx: -40, ty: -110, d: .7, t: .7, o: 1.1 }) + unit(202, 145, { c: 'mv', tx: -20, ty: -100, d: .75, t: .7, o: 1.15 });
    return balance(l, r, { c: 'tilt', ox: 260, oy: 120, r1: 7, d: .9, t: 2.8 }) +
      T(120, 40, '−2', { z: 22, f: C.r, d: .7 }) + T(410, 40, '−2', { z: 22, f: C.r, d: 2.4 }) +
      T(260, 70, '기울어짐!', { z: 15, f: C.r, d: 1.3, o: 2.5 }) +
      T(260, 244, '3x + 2 − 2 = 14 − 2  →  3x = 12', { z: 17, d: 3.6, f: C.b });
  }),
  S('오른쪽 12를 <strong>3묶음으로 똑같이</strong> 나누면 상자 하나에 4씩 대응해요. 양쪽을 3으로 나누면 x = 4', 7, () => {
    let r = '';
    for (let i = 0; i < 12; i++) {
      const gI = Math.floor(i / 4), k = i % 4;
      r += unit(312 + gI * 42 + (k % 2) * 16, 128 + Math.floor(k / 2) * 16, { c: 'mv', fx: (i % 6) * 15 + 322 - (312 + gI * 42 + (k % 2) * 16), fy: (Math.floor(i / 6) * 15 + 130) - (128 + Math.floor(k / 2) * 16), d: .3, t: 1 });
    }
    const groups = [0, 1, 2].map(gI => R(308 + gI * 42, 124, 38, 38, { f: 'none', s: C.g, w: 2, rx: 7, d: 1.5 + gI * .2 })).join('');
    const l = xbox(86, 131) + xbox(119, 131) + xbox(152, 131) +
      [0, 1, 2].map(k => T(101 + k * 33, 112, '4', { z: 15, f: C.g, d: 2.6 + k * .3 })).join('');
    const links = [0, 1, 2].map(gI => T(327 + gI * 42, 108, '4', { z: 15, f: C.g, d: 2.4 + gI * .3 })).join('') +
      T(150, 70, 'x 하나 ↔ 4', { z: 16, f: C.g, d: 3.4 });
    return balance(l, r + groups) + links +
      T(260, 214, '3x = 12  →  x = 12 ÷ 3 = 4', { z: 18, d: 3.6 }) +
      T(260, 244, '검산: 3 × 4 + 2 = 14 ✓', { z: 16, f: C.g, d: 4.6, pulse: 1 });
  })
];

/* ───────── 중1-1 좌표평면과 그래프 ───────── */
M.coordinates = [
  S('점 (3, 2)는 원점에서 <strong>x축 방향으로 3</strong>만큼, 그다음 <strong>y축 방향으로 2</strong>만큼 이동한 위치예요. 순서가 바뀌면 다른 점이 돼요.', 6, () => {
    const a = axes(260, 140, 30, { x0: -7, x1: 7, y0: -3.6, y1: 3.6, nums: [['x', 3], ['x', -3], ['y', 2], ['y', -2]] });
    return a.s + L(a.X(0), a.Y(0), a.X(3), a.Y(0), { s: C.b, w: 4, d: .6, t: 1 }) + T(a.X(1.5), a.Y(0) + 18, '오른쪽 3', { z: 13, f: C.b, d: 1 }) +
      L(a.X(3), a.Y(0), a.X(3), a.Y(2), { s: C.o, w: 4, d: 1.8, t: .8 }) + T(a.X(3) + 40, a.Y(1), '위로 2', { z: 13, f: C.o, d: 2.1 }) +
      G(G(Ci(a.X(3), a.Y(2), 9, { f: C.r, c: '' }), { c: 'mv', fy: 60, d: 1.8, t: .8 }), { c: 'mv', fx: -90, d: .6, t: 1 }) +
      T(a.X(3) + 8, a.Y(2) - 22, '(3, 2)', { z: 20, f: C.r, d: 2.8, pulse: 1 }) +
      T(100, 30, '(x좌표, y좌표)', { z: 15, f: C.m, d: 3.4 });
  }),
  S('두 축은 평면을 네 부분으로 나눠요. 오른쪽 위부터 <strong>시계 반대 방향</strong>으로 제1, 2, 3, 4사분면이고, 좌표의 부호로 구별해요.', 7, () => {
    const a = axes(260, 130, 30, { x0: -7, x1: 7, y0: -3.8, y1: 3.8, grid: false });
    const q = [[260, 16, C.bl, '제1사분면', '(+, +)', C.b, 380], [50, 16, C.gl, '제2사분면', '(−, +)', C.g, 140],
      [50, 130, C.ol, '제3사분면', '(−, −)', '#c27417', 140], [260, 130, C.pl, '제4사분면', '(+, −)', C.p, 380]];
    return q.map((v, i) => R(v[0], v[1], 210, 114, { f: v[2], s: 'none', d: .3 + i * .8, c: 'fade' })).join('') + a.s +
      q.map((v, i) => T(v[6], v[1] + 45, v[3], { z: 17, f: v[5], d: .5 + i * .8 }) + T(v[6], v[1] + 72, v[4], { z: 20, f: v[5], d: .7 + i * .8 })).join('') +
      P(arcD(260, 130, 60, 30, 300), { s: C.k, w: 2, d: 3.6, t: 1.6, dash: undefined }) +
      P(`M${pt(260, 130, 60, 300)[0] - 10} ${pt(260, 130, 60, 300)[1] - 6}L${pt(260, 130, 60, 300)[0]} ${pt(260, 130, 60, 300)[1]}L${pt(260, 130, 60, 300)[0] - 3} ${pt(260, 130, 60, 300)[1] - 12}`, { s: C.k, w: 2, d: 5.1, t: .2 });
  }),
  S('축 위에 있는 점, 예를 들어 (0, 2)나 (−3, 0)은 <strong>어느 사분면에도 속하지 않아요.</strong> 원점 (0, 0)도 마찬가지예요.', 6, () => {
    const a = axes(260, 140, 30, { x0: -7, x1: 7, y0: -3.6, y1: 3.6, nums: [['x', -3], ['y', 2]] });
    return a.s + L(a.X(-7), a.Y(0), a.X(7), a.Y(0), { s: C.o, w: 5, d: .6, t: 1, op: .5 }) + L(a.X(0), a.Y(-3.6), a.X(0), a.Y(3.6), { s: C.o, w: 5, d: .9, t: 1, op: .5 }) +
      Ci(a.X(0), a.Y(2), 9, { f: C.r, d: 1.8, pulse: 1 }) + T(a.X(0) + 46, a.Y(2) - 4, '(0, 2)', { z: 17, f: C.r, d: 2 }) +
      Ci(a.X(-3), a.Y(0), 9, { f: C.r, d: 2.5, pulse: 1 }) + T(a.X(-3), a.Y(0) - 24, '(−3, 0)', { z: 17, f: C.r, d: 2.7 }) +
      Ci(a.X(0), a.Y(0), 7, { f: C.k, d: 3.2 }) + T(a.X(0) + 30, a.Y(0) + 20, '원점 O', { z: 14, d: 3.3 }) +
      R(330, 186, 180, 60, { f: C.w, s: C.o, rx: 10, d: 3.8 }) + T(420, 206, '축 위의 점', { z: 14, f: C.o, d: 4 }) + T(420, 228, '→ 사분면 아님', { z: 16, d: 4.2 });
  })
];

/* ───────── 중1-2 정비례와 반비례 ───────── */
M.proportion = [
  S('정비례 y = 2x: x가 2배, 3배가 되면 y도 <strong>2배, 3배</strong>가 돼요. 점들을 이으면 <strong>원점을 지나는 직선</strong>이 돼요.', 7, () => {
    const a = axes(60, 225, 27, { x0: 0, x1: 6.5, y0: 0, y1: 7.4, nums: [['x', 1], ['x', 2], ['x', 3], ['y', 2], ['y', 4], ['y', 6]] });
    let s = a.s;
    [[1, 2], [2, 4], [3, 6]].forEach(([x, y], i) => {
      s += L(a.X(x), a.Y(0), a.X(x), a.Y(y), { s: C.m, w: 1.2, dash: '3 3', d: .6 + i * .7 }) + L(a.X(0), a.Y(y), a.X(x), a.Y(y), { s: C.m, w: 1.2, dash: '3 3', d: .6 + i * .7 }) +
        Ci(a.X(x), a.Y(y), 7, { f: C.b, d: .7 + i * .7 });
    });
    s += L(a.X(0), a.Y(0), a.X(3.6), a.Y(7.2), { s: C.b, w: 3.5, d: 2.8, t: 1 }) + T(a.X(3.6) + 34, a.Y(7.2) + 4, 'y = 2x', { z: 17, f: C.b, d: 3.6 });
    const tx = 330;
    s += G(R(tx - 20, 52, 190, 110, { f: '#f7f9ff', s: C.l, rx: 10, c: '' }) +
      T(tx, 80, 'x', { z: 15, f: C.m, c: '' }) + T(tx, 130, 'y', { z: 15, f: C.m, c: '' }) +
      [1, 2, 3].map((v, i) => T(tx + 45 + i * 45, 80, v, { z: 18, c: '' }) + T(tx + 45 + i * 45, 130, 2 * v, { z: 18, f: C.b, c: '' })).join(''), { c: 'fade', d: .4 });
    s += P(`M${tx + 45} 64Q${tx + 90} 40 ${tx + 135} 64`, { s: C.o, w: 2, d: 3.8 }) + T(tx + 90, 38, '×3', { z: 14, f: C.o, d: 4 }) +
      P(`M${tx + 45} 146Q${tx + 90} 170 ${tx + 135} 146`, { s: C.o, w: 2, d: 4.2 }) + T(tx + 90, 174, '×3', { z: 14, f: C.o, d: 4.4 }) +
      T(tx + 75, 215, 'y ÷ x = 2 (일정)', { z: 16, d: 5 });
    return s;
  }),
  S('반비례 y = 12/x: 가로 x × 세로 y 인 직사각형의 <strong>넓이가 항상 12</strong>예요. x가 2배가 되면 y는 <strong>절반</strong>이 되고, 꼭짓점을 이으면 곡선이 돼요.', 8, () => {
    const a = axes(50, 235, 16.5, { x0: 0, x1: 13, y0: 0, y1: 12.6, grid: false, nums: [['x', 2], ['x', 3], ['x', 4], ['x', 6], ['x', 12], ['y', 2], ['y', 4], ['y', 6], ['y', 12]] });
    const cols = [C.b, C.g, C.o, C.p, C.r];
    let s = a.s;
    [[2, 6], [3, 4], [4, 3], [6, 2], [12, 1]].forEach(([x, y], i) => {
      const d = .5 + i * .9;
      s += R(a.X(0), a.Y(y), x * 16.5, y * 16.5, { f: cols[i], s: cols[i], op: .16, w: 1.5, d, o: d + .85, c: 'fade' }) +
        R(a.X(0), a.Y(y), x * 16.5, y * 16.5, { f: 'none', s: cols[i], w: 1.4, d, op: .55, c: 'fade' }) +
        Ci(a.X(x), a.Y(y), 6, { f: cols[i], d: d + .2 });
    });
    let path = '';
    for (let x = 1; x <= 12.5; x += .25) path += (path ? 'L' : 'M') + f(a.X(x)) + ' ' + f(a.Y(12 / x));
    s += P(path, { s: C.r, w: 3.2, d: 5, t: 1.4 }) + T(a.X(9), a.Y(4), 'y = 12 / x', { z: 17, f: C.r, d: 6 });
    s += R(330, 30, 175, 74, { f: '#f7f9ff', s: C.l, rx: 10, d: .3, c: 'fade' }) + T(417, 54, '가로 × 세로 = 12', { z: 15, d: .6 }) +
      T(417, 82, '2×6, 3×4, 4×3, 6×2', { z: 13, f: C.m, d: 1.2 });
    return s;
  }),
  S('한눈에 비교: 정비례는 <strong>원점을 지나는 직선</strong>, 반비례는 <strong>축에 점점 가까워지는 곡선</strong>(쌍곡선)이에요.', 5.5, () => {
    const a = axes(40, 220, 20, { x0: 0, x1: 9.5, y0: 0, y1: 9.5, grid: false });
    const b = axes(290, 220, 20, { x0: 0, x1: 9.5, y0: 0, y1: 9.5, grid: false });
    let path = '';
    for (let x = .9; x <= 9.4; x += .2) path += (path ? 'L' : 'M') + f(b.X(x)) + ' ' + f(b.Y(8 / x));
    return a.s + b.s + L(a.X(0), a.Y(0), a.X(4.5), a.Y(9), { s: C.b, w: 3.5, d: .6, t: 1 }) + T(a.X(6.5), a.Y(8), '정비례', { z: 17, f: C.b, d: 1.4 }) +
      T(a.X(6.5), a.Y(6.6), 'y = ax', { z: 15, f: C.b, d: 1.6 }) +
      P(path, { s: C.r, w: 3.5, d: 1.8, t: 1.3 }) + T(b.X(6.2), b.Y(6.5), '반비례', { z: 17, f: C.r, d: 2.8 }) + T(b.X(6.2), b.Y(5.1), 'y = a / x', { z: 15, f: C.r, d: 3 });
  })
];

/* ───────── 중1-2 기본도형과 작도 ───────── */
M.angles = [
  S('한 직선 위의 점에서 반직선을 돌려 보세요. 두 각 a, b는 늘 함께 변하지만 <strong>합은 언제나 180°</strong>예요.', 6, () => {
    const O = [260, 180];
    return L(60, 180, 460, 180, { s: C.k, w: 3, d: .1 }) + Ci(O[0], O[1], 5, { f: C.k, d: .3 }) +
      G(L(O[0], O[1], O[0] + 170, O[1], { s: C.o, w: 4, c: '' }) + Ci(O[0] + 170, O[1], 5, { f: C.o, c: '' }), { c: 'mv', ox: O[0], oy: O[1], fr: 0, tr: -125, d: .6, t: 1.6 }) +
      P(wedgeD(O[0], O[1], 48, 0, 125), { f: C.b, s: 'none', op: .25, d: 2.3 }) + P(arcD(O[0], O[1], 48, 0, 125), { s: C.b, w: 2.5, d: 2.3, t: .6 }) +
      P(wedgeD(O[0], O[1], 36, 125, 180), { f: C.g, s: 'none', op: .3, d: 2.8 }) + P(arcD(O[0], O[1], 36, 125, 180), { s: C.g, w: 2.5, d: 2.8, t: .4 }) +
      T(...pt(O[0], O[1], 72, 62), 'a = 125°', { z: 17, f: C.b, d: 2.6 }) + T(...pt(O[0], O[1], 76, 158), 'b = 55°', { z: 17, f: C.g, d: 3.1 }) +
      T(260, 236, 'a + b = 180°', { z: 22, d: 3.8, pulse: 1 });
  }),
  S('두 직선이 만나면 마주 보는 <strong>맞꼭지각</strong>이 생겨요. 위쪽 각을 교점을 중심으로 <strong>180° 돌리면</strong> 아래쪽 각과 정확히 겹쳐요.', 6, () => {
    const O = [260, 130], a1 = 28, a2 = 145;
    const ln = a => L(...pt(O[0], O[1], -200, a), ...pt(O[0], O[1], 200, a), { s: C.k, w: 3, d: .1 });
    return ln(a1) + ln(a2) +
      P(wedgeD(O[0], O[1], 50, a1, a2), { f: C.b, s: C.b, op: .35, d: .7 }) + P(wedgeD(O[0], O[1], 50, a1 + 180, a2 + 180), { f: 'none', s: C.b, w: 2, dash: '5 4', d: .9 }) +
      G(P(wedgeD(O[0], O[1], 50, a1, a2), { f: C.o, s: C.o, op: .7, c: '' }), { c: 'mv', ox: O[0], oy: O[1], fr: 0, tr: 180, d: 1.6, t: 1.6 }) +
      T(O[0], O[1] - 72, '∠a', { z: 18, f: C.b, d: .8 }) + T(O[0], O[1] + 74, '∠c', { z: 18, f: C.o, d: 3.3 }) +
      T(260, 244, '맞꼭지각의 크기는 같다: ∠a = ∠c', { z: 17, d: 3.6 });
  }),
  S('평행한 두 직선에 한 직선이 지나가면, 위쪽 각을 선을 따라 <strong>미끄러뜨리면 동위각</strong>, <strong>180° 돌리면 엇각</strong>과 겹쳐요. 그래서 크기가 같아요.', 8, () => {
    const A = [230, 80], B = [300, 190], ang = Math.atan2(-(B[1] - A[1]), B[0] - A[0]) * 180 / Math.PI; // 약 -57.5°
    const dir = ang + 180; // 위쪽 방향 각
    const w = (p, a0, a1, o) => P(wedgeD(p[0], p[1], 34, a0, a1), o);
    const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    return L(50, 80, 470, 80, { s: C.k, w: 3, d: .1 }) + L(50, 190, 470, 190, { s: C.k, w: 3, d: .2 }) +
      T(480, 80, 'l', { z: 16, f: C.m, d: .3, an: 'start' }) + T(480, 190, 'm', { z: 16, f: C.m, d: .3, an: 'start' }) +
      L(...pt(A[0], A[1], -60, ang), ...pt(B[0], B[1], 60, ang), { s: C.m, w: 2.5, d: .4 }) +
      T(70, 135, 'l ∥ m', { z: 16, f: C.m, d: .5 }) +
      w(A, 0, dir, { f: C.b, s: C.b, op: .4, d: .9 }) +
      w(B, 0, dir, { f: 'none', s: C.b, w: 2, dash: '4 3', d: 1 }) +
      G(w(A, 0, dir, { f: C.b, s: C.b, op: .75, c: '' }), { c: 'mv', tx: B[0] - A[0], ty: B[1] - A[1], d: 1.5, t: 1.3, o: 3.6 }) +
      T(400, 140, '동위각: 미끄러뜨리기', { z: 15, f: C.b, d: 2.6 }) +
      w(A, 180, dir + 180, { f: C.o, s: C.o, op: .4, d: 3.6 }) +
      G(w(A, 180, dir + 180, { f: C.o, s: C.o, op: .8, c: '' }), { c: 'mv', ox: mid[0], oy: mid[1], fr: 0, tr: 180, d: 4.1, t: 1.4 }) +
      T(400, 168, '엇각: 180° 돌리기', { z: 15, f: C.o, d: 5.4 });
  })
];

/* ───────── 중1-2 평면도형과 다각형 ───────── */
function regPoly(cx, cy, r, n, rot = 90) { return Array.from({ length: n }, (_, i) => pt(cx, cy, r, rot + 360 * i / n)); }
function polyScene(n, cap) {
  const v = regPoly(150, 135, 100, n);
  const cols = [C.b, C.g, C.o, C.p, C.r, '#38a3c9'];
  return S(cap, 6.5 + (n - 5) * .8, () => {
    let s = Poly(v, { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 });
    for (let i = 2; i < n - 1; i++) s += L(...v[0], ...v[i], { s: C.k, w: 2, d: .5 + (i - 2) * .35, t: .5 });
    for (let i = 1; i < n - 1; i++) s += Poly([v[0], v[i], v[i + 1]], { f: cols[i - 1], s: 'none', op: .35, d: 1.4 + i * .5 }) +
      T((v[0][0] + v[i][0] + v[i + 1][0]) / 3, (v[0][1] + v[i][1] + v[i + 1][1]) / 3, '180°', { z: 13, f: cols[i - 1], d: 1.5 + i * .5 });
    const dd = 1.6 + (n - 1) * .5;
    s += Ci(...v[0], 7, { f: C.r, d: .3, pulse: 1 });
    s += T(390, 70, `${n}각형 → 삼각형 ${n - 2}개`, { z: 18, d: dd }) +
      T(390, 120, `${n - 2} × 180° = ${(n - 2) * 180}°`, { z: 22, f: C.b, d: dd + .7 }) +
      T(390, 180, '내각의 합 = (n − 2) × 180°', { z: 16, d: dd + 1.5, pulse: 1 });
    return s;
  });
}
M.polygons = [
  polyScene(5, '오각형의 한 꼭짓점(빨강)에서 대각선을 그으면 <strong>삼각형 3개</strong>로 나뉘어요. 삼각형 내각의 합이 180°이므로 3 × 180° = 540°'),
  polyScene(6, '육각형은 삼각형 <strong>4개</strong> → 720°. n각형은 언제나 (n − 2)개의 삼각형으로 나뉘므로 <strong>내각의 합 = (n − 2) × 180°</strong>'),
  S('각 꼭짓점의 <strong>외각</strong>을 그대로 한 점으로 모아 보세요. 다섯 조각이 빈틈없이 <strong>한 바퀴(360°)</strong>를 채워요. 변이 몇 개든 외각의 합은 360°예요.', 7, () => {
    const v = regPoly(140, 130, 78, 5, 90);
    const cols = [C.b, C.g, C.o, C.p, C.r];
    const center = [400, 130];
    let s = Poly(v, { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 });
    for (let i = 0; i < 5; i++) {
      const a = v[i], b = v[(i + 1) % 5];
      const hd = Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180 / Math.PI;
      s += L(...b, ...pt(b[0], b[1], 40, hd), { s: C.m, w: 1.5, dash: '4 3', d: .4 + i * .1 });
    }
    for (let i = 0; i < 5; i++) {
      const p = v[(i + 1) % 5], a = v[i], b = v[(i + 2) % 5];
      const h0 = Math.atan2(-(p[1] - a[1]), p[0] - a[0]) * 180 / Math.PI;
      const h1 = Math.atan2(-(b[1] - p[1]), b[0] - p[0]) * 180 / Math.PI;
      s += P(wedgeD(p[0], p[1], 34, h0, h1), { f: cols[i], s: C.w, w: 1, op: .85, d: 1 + i * .25 });
      s += G(P(wedgeD(p[0], p[1], 34, h0, h1), { f: cols[i], s: C.w, w: 1, c: '' }), { c: 'mv', tx: center[0] - p[0], ty: center[1] - p[1], d: 2.6 + i * .35, t: 1.1 });
    }
    s += Ci(center[0], center[1], 34, { f: 'none', s: C.k, w: 1.5, dash: '4 3', d: 2.4, c: 'fade' }) +
      T(center[0], 205, '외각의 합 = 360°', { z: 20, d: 4.9, pulse: 1 }) + T(center[0], 40, '모으면 한 바퀴!', { z: 15, f: C.m, d: 4.6 });
    return s;
  })
];

/* ───────── 중1-2 부채꼴 ───────── */
M.sectors = [
  S('원 전체의 중심각은 360°예요. 중심각이 90°인 부채꼴은 <strong>원의 90/360 = 1/4</strong> 이므로 넓이 = πr² × 90/360', 6, () => {
    const c = [150, 130], r = 95;
    return Ci(c[0], c[1], r, { f: '#f7f9ff', s: C.k, w: 2.5, c: 'fade', d: .1 }) +
      Pie(c[0], c[1], r, 90, { f: C.b, op: .45, d: .7, t: 1.3 }) +
      L(c[0], c[1], c[0] + r, c[1], { s: C.k, w: 2.5, d: .4 }) + L(c[0], c[1], c[0], c[1] - r, { s: C.k, w: 2.5, d: 1.9, t: .4 }) +
      T(c[0] + 48, c[1] + 14, 'r', { z: 15, f: C.m, d: .6 }) + RA(c, [1, 0], [0, -1], 14, { d: 2.2 }) +
      T(c[0] + 34, c[1] - 30, '90°', { z: 15, f: C.b, d: 2.3 }) +
      T(380, 70, '중심각 90° = 360°의', { z: 16, d: 2.6 }) + T(380, 104, '1 / 4', { z: 30, f: C.b, d: 3 }) +
      T(380, 170, '넓이 = πr² × 90/360', { z: 18, d: 3.8, pulse: 1 });
  }),
  S('호의 길이도 같은 원리예요. 원 둘레 2πr을 펼친 길이 중 <strong>중심각 비율(90/360)</strong>만큼이 호의 길이예요.', 6.5, () => {
    const c = [130, 125], r = 80;
    return Ci(c[0], c[1], r, { f: 'none', s: C.l, w: 6, c: 'fade', d: .1 }) +
      P(arcD(c[0], c[1], r, 0, 90), { s: C.o, w: 7, d: .5, t: 1 }) +
      L(c[0], c[1], c[0] + r, c[1], { s: C.k, w: 2, d: .2 }) + L(c[0], c[1], c[0], c[1] - r, { s: C.k, w: 2, d: .2 }) +
      T(c[0] + 70, c[1] - 70, '호', { z: 16, f: C.o, d: 1.4 }) +
      R(250, 170, 252, 14, { f: C.l, s: 'none', rx: 7, c: 'gx', d: 1.6, t: 1 }) + T(376, 200, '원 둘레 2πr (360°)', { z: 13, f: C.m, d: 2.2 }) +
      R(250, 170, 63, 14, { f: C.o, s: 'none', rx: 7, c: 'gx', d: 2.8, t: .8 }) + T(281, 152, '호 (90°)', { z: 13, f: C.o, d: 3.2 }) +
      T(375, 80, '호 길이 = 2πr × 90/360', { z: 18, d: 3.8, pulse: 1 });
  }),
  S('중심각이 <strong>2배</strong>가 되면 호의 길이와 넓이도 <strong>2배</strong>가 돼요. 같은 원에서 둘 다 중심각에 정비례해요.', 6, () => {
    const p1 = [130, 120], p2 = [390, 120], r = 76;
    return Ci(...p1, r, { f: '#f7f9ff', s: C.k, w: 2, c: 'fade', d: .1 }) + Ci(...p2, r, { f: '#f7f9ff', s: C.k, w: 2, c: 'fade', d: .1 }) +
      Pie(...p1, r, 60, { f: C.g, op: .5, d: .5, t: 1 }) + Pie(...p2, r, 120, { f: C.g, op: .5, d: 1.7, t: 1.6 }) +
      T(p1[0], 228, '60°', { z: 20, f: C.g, d: 1.2 }) + T(p2[0], 228, '120°', { z: 20, f: C.g, d: 3.1 }) +
      T(260, 120, '×2', { z: 24, f: C.o, d: 3.5, pulse: 1 }) + T(260, 150, '호·넓이도 ×2', { z: 13, f: C.o, d: 3.8 });
  })
];

/* ───────── 중1-2 입체도형 ───────── */
function cyl(cx, by, rx, ry, h, col, lt, o = {}) {
  return G(`<path d="M${cx - rx} ${by}V${by - h}A${rx} ${ry} 0 0 1 ${cx + rx} ${by - h}V${by}A${rx} ${ry} 0 0 1 ${cx - rx} ${by}Z" fill="${lt}" stroke="${col}" stroke-width="2"/>` +
    `<ellipse cx="${cx}" cy="${by - h}" rx="${rx}" ry="${ry}" fill="${col}" fill-opacity=".35" stroke="${col}" stroke-width="2"/>` +
    `<path d="M${cx - rx} ${by}A${rx} ${ry} 0 0 0 ${cx + rx} ${by}" fill="none" stroke="${col}" stroke-width="2"/>`, o);
}
M.solids = [
  S('원기둥은 밑면(원)을 <strong>높이만큼 차곡차곡 쌓은</strong> 입체예요. 그래서 부피 = 밑넓이 × 높이 = <strong>πr² × h</strong>', 6.5, () => {
    let s = '';
    for (let i = 0; i < 7; i++) s += G(`<ellipse cx="150" cy="${215 - i * 22}" rx="80" ry="20" fill="${C.b}" fill-opacity="${.18 + i * .05}" stroke="${C.b}" stroke-width="2"/>`, { c: 'mv', fy: -60, d: .4 + i * .3, t: .5, a: '' }) ;
    s = `<g>${s}</g>`;
    return T(150, 245, '밑넓이 πr²', { z: 14, f: C.b, d: .5 }) + s +
      L(70, 215, 70, 83, { s: C.b, w: 2, d: 2.8, t: .5 }) + L(230, 215, 230, 83, { s: C.b, w: 2, d: 2.8, t: .5 }) +
      L(260, 215, 260, 83, { s: C.o, w: 2.5, d: 3.2, t: .6 }) + T(276, 150, 'h', { z: 18, f: C.o, d: 3.4 }) +
      T(400, 90, '부피', { z: 16, f: C.m, d: 3.8 }) + T(400, 125, '= 밑넓이 × 높이', { z: 18, d: 4 }) + T(400, 165, '= πr² × h', { z: 24, f: C.b, d: 4.5, pulse: 1 });
  }),
  S('높이만 <strong>2배</strong>로 하면 쌓는 층이 2배 → 부피도 <strong>2배</strong>예요.', 5, () =>
    cyl(140, 210, 55, 14, 70, C.b, C.bl, { c: 'gy', d: .3 }) + T(140, 240, 'h', { z: 16, d: .6 }) +
    cyl(340, 210, 55, 14, 140, C.g, C.gl, { c: 'gy', d: 1.3, t: 1.2 }) + T(340, 240, '2h', { z: 16, d: 1.6 }) +
    T(240, 130, '→', { z: 30, f: C.m, d: 1 }) + T(450, 120, '부피 ×2', { z: 20, f: C.g, d: 2.8, pulse: 1 })),
  S('반지름을 <strong>2배</strong>로 하면 밑넓이 πr²에서 r이 두 번 곱해지므로 <strong>4배</strong>, 부피도 4배가 돼요. (r×r 정사각형 4칸이 들어가요)', 6.5, () =>
    Ci(120, 130, 45, { f: C.bl, s: C.b, w: 2, d: .2 }) + R(120, 85, 45, 45, { f: C.b, s: C.b, op: .45, d: .8, c: 'fade' }) +
    L(120, 130, 165, 130, { s: C.k, w: 2, d: .5 }) + T(142, 142, 'r', { z: 14, d: .6 }) +
    Ci(350, 130, 90, { f: C.gl, s: C.g, w: 2, d: 1.6 }) +
    [0, 1, 2, 3].map(i => R(350 + (i % 2) * 45, 40 + Math.floor(i / 2) * 45, 45, 45, { f: C.g, s: C.w, w: 1.5, op: .55, d: 2.4 + i * .35, c: 'fade' })).join('') +
    L(350, 130, 440, 130, { s: C.k, w: 2, d: 1.9 }) + T(395, 142, '2r', { z: 14, d: 2 }) +
    T(240, 130, '→', { z: 30, f: C.m, d: 1.3 }) + T(260, 240, '(2r)² = 4r² → 밑넓이·부피 ×4', { z: 18, f: C.g, d: 4, pulse: 1 }))
];

/* ───────── 중1-2 자료의 정리와 해석 ───────── */
M.statistics = (() => {
  const bins = ['50~60', '60~70', '70~80', '80~90', '90~100'], cnt = [2, 4, 6, 3, 1];
  const bx = i => 95 + i * 72, base = 205, cell = 22;
  const frame = (d = 0) => L(50, base, 470, base, { s: C.k, w: 2, d }) +
    bins.map((b, i) => T(bx(i), base + 16, b, { z: 12, f: C.m, d: d + .2, c: 'fade' })).join('') + T(470, base + 36, '(점)', { z: 11, f: C.m, d, c: 'fade', an: 'end' });
  return [
    S('수학 점수 16개를 <strong>계급(구간)</strong>별로 나눠 담아요. 각 계급에 들어간 자료의 개수가 <strong>도수</strong>예요.', 7.5, () => {
      let s = frame(.1), k = 0;
      cnt.forEach((c, i) => {
        for (let j = 0; j < c; j++) {
          const sx = 60 + ((k * 97) % 400);
          s += G(Ci(bx(i), base - 12 - j * cell, 9, { f: C.b, c: '' }), { c: 'mv', fx: sx - bx(i), fy: -(base - 12 - j * cell) + 20, d: .3 + k * .22, t: .7 });
          k++;
        }
        s += T(bx(i), base - 12 - c * cell - 6, `${c}명`, { z: 14, f: C.o, d: .3 + k * .22 + .3 });
      });
      return s;
    }),
    S('도수만큼 막대를 세우면 <strong>히스토그램</strong>이에요. 막대 높이 = 도수이고, 도수를 모두 더하면 전체 자료 수 16이에요.', 6, () => {
      let s = frame(0);
      cnt.forEach((c, i) => {
        s += R(bx(i) - 36, base - c * cell, 72, c * cell, { f: C.bl, s: C.b, w: 1.5, c: 'gy', d: .3 + i * .3 }) + T(bx(i), base - c * cell - 12, c, { z: 16, f: C.b, d: .8 + i * .3 });
      });
      return s + T(390, 40, '2 + 4 + 6 + 3 + 1 = 16', { z: 17, d: 2.6, pulse: 1 });
    }),
    S('막대 윗변의 <strong>가운데 점</strong>을 이으면 도수분포다각형이에요. <strong>상대도수</strong> = 그 계급의 도수 ÷ 전체 도수 (예: 6 ÷ 16 = 0.375)', 6.5, () => {
      let s = frame(0);
      cnt.forEach((c, i) => { s += R(bx(i) - 36, base - c * cell, 72, c * cell, { f: C.bl, s: C.b, w: 1, op: .5, c: '' }); });
      const pts = [[bx(-1) + 36, base], ...cnt.map((c, i) => [bx(i), base - c * cell]), [bx(5) - 36, base]];
      pts.slice(1, -1).forEach((p, i) => { s += Ci(p[0], p[1], 6, { f: C.r, d: .4 + i * .2 }); });
      s += PL(pts, { s: C.r, w: 3, d: 1.6, t: 1.5 });
      return s + R(bx(2) - 36, base - 6 * cell, 72, 6 * cell, { f: 'none', s: C.o, w: 3, d: 3.4, c: 'fade' }) +
        T(400, 50, '상대도수 = 6 ÷ 16 = 0.375', { z: 16, f: C.o, d: 3.6 }) + T(400, 78, '상대도수의 합 = 1', { z: 14, f: C.m, d: 4.2 });
    })
  ];
})();

}
// ===== grade2 =====
{

const mono = { mono: true };

/* ───────── 중2-1 유리수와 순환소수 ───────── */
M.recurring = [
  S('1 ÷ 3 을 계속 나누면 <strong>나머지가 다시 1</strong>이 돼요. 같은 계산이 되풀이되니 몫에도 3이 끝없이 반복돼요 → 0.333…', 7, () => {
    let s = T(110, 36, '1 ÷ 3', { z: 22, d: .1 });
    for (let i = 0; i < 3; i++) {
      const y = 80 + i * 46, d = .6 + i * 1.1;
      s += T(40, y, '10 ÷ 3 = 3', { z: 18, an: 'start', d, ...mono }) + T(170, y, '… 나머지', { z: 14, an: 'start', f: C.m, d }) +
        G(chip(250, y, 1, C.o, C.ol, 15, 15), { c: 'pop', d: d + .3 });
      if (i < 2) s += P(`M266 ${y + 6}Q300 ${y + 23} 266 ${y + 40}`, { s: C.o, w: 2, d: d + .6, t: .4 });
    }
    s += T(330, 60, '몫', { z: 14, f: C.m, d: .5, an: 'start' });
    ['0', '.', '3', '3', '3', '…'].forEach((ch, i) => { s += T(340 + i * 22, 100, ch, { z: 30, f: i >= 2 && i < 5 ? C.b : C.k, d: i < 2 ? .4 : i < 5 ? .9 + (i - 2) * 1.1 : 4, an: 'start', ...mono }); });
    s += T(410, 170, '나머지가 반복', { z: 15, f: C.o, d: 4.2 }) + T(410, 196, '→ 몫도 반복', { z: 15, f: C.b, d: 4.5 }) +
      T(260, 240, '1/3 = 0.333… (순환소수)', { z: 18, d: 5, pulse: 1 });
    return s;
  }),
  S('2/11 = 0.181818… 처럼 <strong>되풀이되는 마디</strong>를 찾아요. 마디의 처음과 끝 숫자 위에 점을 찍어 0.1̇8̇ 로 간단히 써요.', 6.5, () => {
    const digs = '0.18181818'.split('');
    let s = T(260, 40, '2 ÷ 11 =', { z: 20, d: .1 });
    digs.forEach((ch, i) => { s += T(110 + i * 30, 110, ch, { z: 30, d: .3 + i * .12, ...mono }); });
    s += T(110 + digs.length * 30, 110, '…', { z: 30, d: 1.5, ...mono });
    [0, 1, 2, 3].forEach(k => { s += R(110 + (2 + k * 2) * 30 - 15, 88, 60, 46, { f: C.o, s: C.o, op: .18, rx: 8, d: 1.8 + k * .45, c: 'fade' }) +
      T(110 + (2 + k * 2) * 30 + 15, 150, '마디', { z: 12, f: C.o, d: 1.8 + k * .45 }); });
    s += ['0', '.', '1', '8'].map((ch, i) => T(180 + i * 24, 215, ch, { z: 34, d: 4, ...mono })).join('') +
      Ci(228, 188, 3.5, { f: C.r, d: 4.6 }) + Ci(252, 188, 3.5, { f: C.r, d: 4.8 }) +
      T(320, 215, '처음·끝 위에 점', { z: 14, f: C.r, d: 5, an: 'start' });
    return s;
  }),
  S('x = 0.777… 에 10을 곱하면 10x = 7.777… 이에요. 두 식을 <strong>빼면 끝없는 꼬리가 사라져서</strong> 9x = 7, 즉 x = 7/9', 7.5, () => {
    const row = (y, l, r, d) => T(230, y, l, { z: 24, an: 'end', d, ...mono }) + T(250, y, r, { z: 24, an: 'start', d, ...mono });
    return row(50, '10x =', '7.777…', .2) + row(100, 'x =', '0.777…', .7) +
      T(160, 100, '−', { z: 26, f: C.r, d: 1.4 }) + L(140, 128, 380, 128, { s: C.k, w: 2.5, d: 1.6, t: .5 }) +
      R(262, 30, 106, 88, { f: C.o, s: C.o, op: .15, rx: 8, d: 2.2, c: 'fade' }) +
      T(430, 74, '꼬리가 똑같다', { z: 14, f: C.o, d: 2.4 }) +
      L(262, 50, 368, 50, { s: C.r, w: 3, d: 3, t: .5 }) + L(262, 100, 368, 100, { s: C.r, w: 3, d: 3.2, t: .5 }) +
      row(160, '9x =', '7', 3.8) + T(260, 222, 'x = 7/9', { z: 30, f: C.b, d: 4.8, pulse: 1 });
  })
];

/* ───────── 중2-1 식의 계산 (지수법칙) ───────── */
const ach = (x, y, col = C.b, lt = C.bl) => chip(x, y, 'a', col, lt, 17, 16);
M.exponents = [
  S('a² × a³ 은 a를 2개, 3개 곱한 것을 이어 붙인 것이에요. 모두 <strong>a가 5개</strong> 곱해졌으므로 a⁵ — 지수끼리 <strong>더해요</strong>.', 6.5, () => {
    let s = T(100, 40, 'a²', { z: 24, f: C.b, d: .1 }) + T(260, 40, '×', { z: 22, d: .1 }) + T(380, 40, 'a³', { z: 24, f: C.g, d: .1 });
    const tgt = [90, 175, 260, 345, 430];
    [[75, C.b, C.bl], [125, C.b, C.bl], [330, C.g, C.gl], [380, C.g, C.gl], [430, C.g, C.gl]].forEach(([x, c1, c2], i) => {
      s += G(ach(x, 100, c1, c2), { c: 'pop', d: .3 + i * .15, o: 1.6 }) +
        G(ach(tgt[i], 175, c1, c2), { c: 'mv', fx: x - tgt[i], fy: -75, d: 1.6 + i * .1, t: 1 });
    });
    for (let i = 0; i < 4; i++) s += T((tgt[i] + tgt[i + 1]) / 2, 175, '×', { z: 15, f: C.m, d: 2.8 });
    return s + T(260, 232, 'a² × a³ = a²⁺³ = a⁵', { z: 22, d: 3.4, pulse: 1 });
  }),
  S('(a²)³ 은 a² 묶음을 <strong>3번</strong> 곱한 것이에요. a가 2개씩 3묶음 → 6개이므로 a⁶ — 지수끼리 <strong>곱해요</strong>.', 6.5, () => {
    let s = T(260, 34, '(a²)³ = a² × a² × a²', { z: 22, d: .1 });
    [0, 1, 2].forEach(k => {
      const x = 90 + k * 170;
      s += R(x - 55, 80, 110, 52, { f: 'none', s: [C.b, C.g, C.o][k], w: 2.5, rx: 14, d: .6 + k * .4 }) +
        G(ach(x - 25, 106, [C.b, C.g, C.o][k], [C.bl, C.gl, C.ol][k]) + ach(x + 25, 106, [C.b, C.g, C.o][k], [C.bl, C.gl, C.ol][k]), { c: 'pop', d: .8 + k * .4 });
    });
    s += T(260, 170, '2 + 2 + 2 = 2 × 3 = 6', { z: 20, f: C.m, d: 2.6 }) + T(260, 222, '(a²)³ = a⁶', { z: 28, f: C.b, d: 3.4, pulse: 1 });
    return s;
  }),
  S('a⁵ ÷ a² 을 분수로 쓰면 위아래의 a를 <strong>2개씩 약분</strong>할 수 있어요. a가 3개 남으므로 a³ — 지수끼리 <strong>빼요</strong>.', 6.5, () => {
    let s = '';
    [0, 1, 2, 3, 4].forEach(i => { s += G(ach(130 + i * 50, 70), { c: 'pop', d: .2 + i * .1 }); });
    s += L(100, 108, 360, 108, { s: C.k, w: 3, d: .8, t: .4 });
    [0, 1].forEach(i => { s += G(ach(130 + i * 50, 146, C.r, C.rl), { c: 'pop', d: 1 + i * .1 }); });
    [0, 1].forEach(i => {
      s += L(116 + i * 50, 160, 144 + i * 50, 56, { s: C.r, w: 3, d: 1.8 + i * .4, t: .4 });
    });
    s += T(420, 70, 'a 5개', { z: 15, f: C.b, d: .5 }) + T(420, 146, 'a 2개', { z: 15, f: C.r, d: 1 }) +
      R(205, 48, 150, 44, { f: 'none', s: C.g, w: 3, rx: 22, d: 2.9 }) + T(420, 104, '3개 남음', { z: 15, f: C.g, d: 3.1 }) +
      T(260, 220, 'a⁵ ÷ a² = a⁵⁻² = a³', { z: 24, d: 3.6, pulse: 1 });
    return s;
  })
];

/* ───────── 중2-1 일차부등식 ───────── */
M.inequalities = [
  S('부등식의 해는 <strong>범위</strong>예요. x > 2는 2보다 큰 모든 수 — 2는 포함하지 않으므로 <strong>빈 점 ○</strong>, x ≤ −1은 −1을 포함하므로 <strong>채운 점 ●</strong>', 6.5, () => {
    const a = nline(50, 470, 100, -5, 5, { d: .1 }), b = nline(50, 470, 200, -5, 5, { d: .1 });
    return T(40, 50, 'x > 2', { z: 20, f: C.b, d: .3, an: 'start' }) + T(40, 150, 'x ≤ −1', { z: 20, f: C.r, d: 2.3, an: 'start' }) + a.s + b.s +
      R(a.X(2), 92, a.X(5) + 14 - a.X(2), 16, { f: C.b, s: 'none', op: .35, rx: 8, c: 'gx', d: 1, t: .8 }) +
      Ci(a.X(2), 100, 8, { f: C.w, s: C.b, w: 3, d: .7 }) +
      R(b.X(-5) - 14, 192, b.X(-1) - b.X(-5) + 14, 16, { f: C.r, s: 'none', op: .35, rx: 8, c: 'gxr', d: 3, t: .8 }) +
      Ci(b.X(-1), 200, 8, { f: C.r, s: C.r, w: 3, d: 2.7 }) +
      T(400, 50, '○ 경계 미포함', { z: 14, f: C.b, d: 1.6 }) + T(400, 150, '● 경계 포함', { z: 14, f: C.r, d: 3.6 });
  }),
  S('2 < 4 인 두 수에 <strong>−1을 곱하면</strong> 수직선에서 0을 중심으로 뒤집혀 −2와 −4가 돼요. 이제 −2 > −4 이므로 <strong>부등호 방향이 바뀌어요.</strong>', 7, () => {
    const n = nline(50, 470, 150, -5, 5, { d: .1 });
    return n.s + G(Ci(n.X(2), 150, 10, { f: C.b, c: '' }) + T(n.X(2), 122, '2', { z: 16, f: C.b, c: '' }), { c: 'pop', d: .4 }) +
      G(Ci(n.X(4), 150, 10, { f: C.g, c: '' }) + T(n.X(4), 122, '4', { z: 16, f: C.g, c: '' }), { c: 'pop', d: .6 }) +
      G(Ci(n.X(-2), 150, 10, { f: C.b, c: '' }) + T(n.X(-2), 122, '−2', { z: 16, f: C.b, c: '' }), { c: 'mv', fx: n.X(2) - n.X(-2), d: 2, t: 1.3 }) +
      G(Ci(n.X(-4), 150, 10, { f: C.g, c: '' }) + T(n.X(-4), 122, '−4', { z: 16, f: C.g, c: '' }), { c: 'mv', fx: n.X(4) - n.X(-4), d: 2, t: 1.3 }) +
      T(260, 44, '2 < 4', { z: 26, d: .9, o: 2.1 }) + T(260, 80, '× (−1)', { z: 18, f: C.r, d: 1.6, o: 3.6 }) +
      T(205, 44, '−2', { z: 26, d: 3.4 }) + T(260, 44, '>', { z: 30, f: C.r, d: 3.7, pulse: 1 }) + T(315, 44, '−4', { z: 26, d: 3.4 }) +
      T(260, 222, '음수를 곱하거나 나누면 부등호 방향이 반대!', { z: 16, f: C.r, d: 4.4 });
  }),
  S('부등식도 방정식처럼 풀어요. 단, <strong>음수로 나누는 순간</strong>에만 부등호를 뒤집어요.', 7.5, () =>
    eqs([['2x − 1 > 5'], ['2x > 6', '양변 + 1'], ['x > 3', '양변 ÷ 2 (양수 → 그대로)', C.b]], { x: 140, y: 50, dy: 46, d: .2, gap: 1, z: 22, nx: 210 }) +
    L(30, 175, 490, 175, { s: C.l, w: 1, d: 3 }) +
    T(140, 214, '−3x < 6', { z: 22, d: 3.3 }) + T(260, 214, '→', { z: 22, f: C.m, d: 4 }) +
    T(360, 214, 'x > −2', { z: 22, f: C.r, d: 4.3, pulse: 1 }) + T(260, 244, '양변 ÷ (−3) → 방향 반대', { z: 13, f: C.r, d: 4.6 }))
];

/* ───────── 중2-1 연립일차방정식 (x + y = 7, x − y = 1) ───────── */
M.systems = [
  S('x + y = 7 의 해들은 한 직선, x − y = 1 의 해들은 또 다른 직선이 돼요. <strong>두 직선이 만나는 점 (4, 3)</strong>이 두 식을 동시에 만족하는 해예요.', 6.5, () => {
    const a = axes(60, 225, 24, { x0: 0, x1: 8.5, y0: 0, y1: 8.5, nums: [['x', 4], ['y', 3]] });
    return a.s + L(a.X(0), a.Y(7), a.X(7), a.Y(0), { s: C.b, w: 3.5, d: .5, t: 1.2 }) + L(a.X(1), a.Y(0), a.X(8.5), a.Y(7.5), { s: C.o, w: 3.5, d: 1.6, t: 1.2 }) +
      L(a.X(4), a.Y(0), a.X(4), a.Y(3), { s: C.m, w: 1.3, dash: '3 3', d: 3 }) + L(a.X(0), a.Y(3), a.X(4), a.Y(3), { s: C.m, w: 1.3, dash: '3 3', d: 3 }) +
      Ci(a.X(4), a.Y(3), 9, { f: C.r, d: 2.9, pulse: 1 }) + T(a.X(4) + 34, a.Y(3) - 16, '(4, 3)', { z: 18, f: C.r, d: 3.1 }) +
      T(400, 60, 'x + y = 7', { z: 20, f: C.b, d: .6 }) + T(400, 95, 'x − y = 1', { z: 20, f: C.o, d: 1.7 }) +
      T(400, 160, '교점 = 공통 해', { z: 18, d: 3.6 }) + T(400, 190, 'x = 4, y = 3', { z: 18, f: C.r, d: 3.9 });
  }),
  S('<strong>가감법</strong>: 두 식을 더하면 +y와 −y가 서로 지워져 2x = 8 → x = 4. 이것을 대입하면 y = 3', 7, () =>
    T(200, 50, 'x + y = 7', { z: 24, d: .2, ...mono }) + T(200, 95, 'x − y = 1', { z: 24, d: .5, ...mono }) +
    T(110, 95, '+', { z: 26, f: C.b, d: 1 }) + L(100, 122, 320, 122, { s: C.k, w: 2.5, d: 1.2, t: .4 }) +
    Ci(186, 50, 22, { f: 'none', s: C.r, w: 2.5, d: 1.8, c: 'pop' }) + Ci(186, 95, 22, { f: 'none', s: C.r, w: 2.5, d: 1.9 }) +
    L(168, 64, 204, 36, { s: C.r, w: 3, d: 2.4, t: .3 }) + L(168, 109, 204, 81, { s: C.r, w: 3, d: 2.5, t: .3 }) +
    T(400, 72, '+y와 −y 소거', { z: 15, f: C.r, d: 2.3 }) +
    T(200, 155, '2x = 8', { z: 24, d: 3, ...mono }) + T(380, 155, 'x = 4', { z: 24, f: C.b, d: 3.6, ...mono }) +
    T(260, 220, '4 + y = 7  →  y = 3', { z: 22, f: C.g, d: 4.4, pulse: 1 })),
  S('<strong>대입법</strong>: x − y = 1 을 y = x − 1 로 바꿔, 첫 식의 y 자리에 통째로 넣어요. 그러면 x만 남는 일차방정식이 돼요.', 7, () =>
    T(130, 44, 'y = x − 1', { z: 22, f: C.o, d: .2, ...mono }) +
    T(330, 44, 'x +', { z: 22, d: .5, an: 'end', ...mono }) + T(346, 44, 'y', { z: 22, d: .5, f: C.b, ...mono }) + Ci(346, 44, 15, { f: 'none', s: C.b, w: 2, d: 1, pulse: 1 }) + T(362, 44, '= 7', { z: 22, d: .5, an: 'start', ...mono }) +
    G(R(160, 120, 98, 34, { f: C.ol, s: C.o, rx: 10, c: '' }) + T(209, 137, '(x − 1)', { z: 18, f: '#b0661a', c: '' }), { c: 'mv', fx: -60, fy: -93, d: 1.2, t: 1.3 }) +
    T(140, 137, 'x +', { z: 22, d: 2.5, an: 'end', ...mono }) + T(274, 137, '= 7', { z: 22, d: 2.5, an: 'start', ...mono }) +
    T(260, 190, '2x − 1 = 7  →  x = 4', { z: 22, d: 3.4 }) + T(260, 232, 'y = 4 − 1 = 3', { z: 22, f: C.g, d: 4.3, pulse: 1 }))
];

/* ───────── 중2-1 일차함수와 그래프 ───────── */
M.linearFunction = [
  S('y = 2x + 1 의 그래프는 y축의 <strong>1</strong>에서 출발해요. x가 1 증가할 때마다 y가 <strong>2</strong>씩 증가하는 계단을 이으면 직선이 돼요.', 7, () => {
    const a = axes(200, 155, 25, { x0: -6, x1: 12, y0: -4, y1: 5.6, nums: [['y', 1], ['x', 1], ['x', 2]] });
    let s = a.s + Ci(a.X(0), a.Y(1), 8, { f: C.r, d: .5, pulse: 1 }) + T(a.X(0) - 52, a.Y(1), 'y절편 1', { z: 14, f: C.r, d: .6 });
    for (let k = 0; k < 2; k++) {
      const d = 1.2 + k * 1.2;
      s += L(a.X(k), a.Y(1 + 2 * k), a.X(k + 1), a.Y(1 + 2 * k), { s: C.o, w: 4, d, t: .5 }) +
        L(a.X(k + 1), a.Y(1 + 2 * k), a.X(k + 1), a.Y(3 + 2 * k), { s: C.g, w: 4, d: d + .5, t: .5 }) + Ci(a.X(k + 1), a.Y(3 + 2 * k), 6, { f: C.b, d: d + .9 });
    }
    s += T(a.X(.5), a.Y(1) + 16, '+1', { z: 13, f: C.o, d: 1.3 }) + T(a.X(1) + 18, a.Y(2), '+2', { z: 13, f: C.g, d: 1.8 }) +
      L(a.X(-2.2), a.Y(-3.4), a.X(2.3), a.Y(5.6), { s: C.b, w: 3.5, d: 3.8, t: 1 }) +
      T(400, 60, 'y = 2x + 1', { z: 22, f: C.b, d: 4.4 }) + T(400, 100, '기울기 = (y 증가량)/(x 증가량)', { z: 13, f: C.m, d: 4.8 }) + T(400, 126, '= 2/1 = 2', { z: 18, d: 5.1 });
    return s;
  }),
  S('<strong>기울기 a</strong>를 바꾸면 직선이 y절편을 중심으로 <strong>회전</strong>해요. a가 클수록 가파르고, a가 음수면 오른쪽 아래로 내려가요.', 8, () => {
    const a = axes(220, 140, 25, { x0: -8, x1: 11, y0: -4.4, y1: 4.6 });
    const ox = a.X(0), oy = a.Y(1);
    const deg = m => -Math.atan(m) * 180 / Math.PI;
    return a.s + G(L(ox - 260, oy, ox + 260, oy, { s: C.b, w: 4, c: '' }), { c: 'rot3', ox, oy, r0: deg(.5), r1: deg(.5), r2: deg(2), r3: deg(-1), d: .6, t: 6 }) +
      Ci(ox, oy, 7, { f: C.r, d: .3 }) +
      T(430, 40, 'a = 1/2', { z: 20, f: C.b, d: .6, o: 2.8 }) + T(430, 40, 'a = 2  (가파름)', { z: 20, f: C.g, d: 2.9, o: 4.9 }) +
      T(430, 40, 'a = −1  (내려감)', { z: 20, f: C.r, d: 5, }) + T(430, 225, '중심: y절편 (0, 1)', { z: 13, f: C.m, d: .5 });
  }),
  S('<strong>y절편 b</strong>를 바꾸면 기울기는 그대로인 채 직선이 위아래로 <strong>평행이동</strong>해요.', 7.5, () => {
    const a = axes(220, 140, 25, { x0: -8, x1: 11, y0: -4.4, y1: 4.6 });
    const line = L(a.X(-3), a.Y(-5), a.X(2.2), a.Y(5.4), { s: C.b, w: 4, c: '' }) + Ci(a.X(0), a.Y(1), 6, { f: C.r, c: '' });
    return a.s + G(L(a.X(-3), a.Y(-5), a.X(2.2), a.Y(5.4), { s: C.m, w: 2, dash: '5 4', c: '' }), { c: 'fade', d: .2 }) +
      G(line, { c: 'shift3', y1: -50, y2: 75, y3: 0, d: .6, t: 6 }) +
      T(430, 40, 'y = 2x + 3', { z: 20, f: C.g, d: 1.4, o: 2.8 }) + T(430, 40, 'y = 2x − 2', { z: 20, f: C.o, d: 2.9, o: 4.9 }) +
      T(430, 40, 'y = 2x + 1', { z: 20, f: C.b, d: 5 }) + T(430, 225, '기울기 2는 그대로', { z: 13, f: C.m, d: .5 });
  })
];

/* ───────── 중2-1 일차함수와 일차방정식 (2x + 1 = x + 4) ───────── */
M.functionIntersection = [
  S('2x + 1 = x + 4 의 양변을 각각 함수 y = 2x + 1, y = x + 4 로 보면, 두 그래프가 <strong>만나는 x좌표</strong>가 바로 방정식의 해 x = 3 이에요.', 7, () => {
    const a = axes(60, 236, 21, { x0: 0, x1: 9, y0: 0, y1: 10.2, nums: [['x', 3], ['y', 7]] });
    return T(330, 34, '2x + 1 = x + 4', { z: 22, d: .1, o: 1.3 }) +
      T(270, 34, 'y = 2x + 1', { z: 18, f: C.b, d: 1.4 }) + T(420, 34, 'y = x + 4', { z: 18, f: C.o, d: 1.4 }) + a.s +
      L(a.X(0), a.Y(1), a.X(4.6), a.Y(10.2), { s: C.b, w: 3.5, d: 1.8, t: 1.1 }) + L(a.X(0), a.Y(4), a.X(6.2), a.Y(10.2), { s: C.o, w: 3.5, d: 2.6, t: 1.1 }) +
      L(a.X(3), a.Y(0), a.X(3), a.Y(7), { s: C.r, w: 2, dash: '4 3', d: 3.8 }) + Ci(a.X(3), a.Y(7), 9, { f: C.r, d: 3.7, pulse: 1 }) +
      T(a.X(3) + 40, a.Y(7) + 6, '(3, 7)', { z: 17, f: C.r, d: 3.9 }) + T(380, 150, '같은 y값이 되는 x', { z: 15, d: 4.4 }) + T(380, 180, 'x = 3', { z: 24, f: C.r, d: 4.7 });
  }),
  S('일차방정식 2x − y + 1 = 0 을 만족하는 (x, y)를 모두 찍으면 <strong>직선</strong>이 돼요. y에 대해 풀면 y = 2x + 1 — 일차함수의 그래프와 같아요.', 6.5, () => {
    const a = axes(80, 225, 24, { x0: -1, x1: 5, y0: -1, y1: 8.4, nums: [['x', 1], ['x', 2], ['x', 3]] });
    let s = a.s + T(380, 50, '2x − y + 1 = 0', { z: 20, d: .2 });
    [[0, 1], [1, 3], [2, 5], [3, 7]].forEach(([x, y], i) => { s += Ci(a.X(x), a.Y(y), 7, { f: C.b, d: .7 + i * .4 }) + T(a.X(x) + 32, a.Y(y) + 2, `(${x}, ${y})`, { z: 12, f: C.m, d: .8 + i * .4 }); });
    return s + L(a.X(-.9), a.Y(-.8), a.X(3.6), a.Y(8.2), { s: C.b, w: 3, d: 2.6, t: 1 }) +
      T(380, 110, '⇔', { z: 22, f: C.m, d: 3.4 }) + T(380, 160, 'y = 2x + 1', { z: 24, f: C.b, d: 3.7, pulse: 1 });
  }),
  S('두 직선이 <strong>평행</strong>하면 만나지 않으니 해가 없고, 완전히 <strong>겹치면</strong> 모든 점이 교점이라 해가 무수히 많아요.', 6.5, () => {
    const a = axes(40, 210, 18, { x0: 0, x1: 10, y0: 0, y1: 9.5, grid: false });
    const b = axes(290, 210, 18, { x0: 0, x1: 10, y0: 0, y1: 9.5, grid: false });
    return a.s + b.s + L(a.X(0), a.Y(1), a.X(8), a.Y(9), { s: C.b, w: 3.5, d: .4 }) + L(a.X(2), a.Y(0), a.X(10), a.Y(8), { s: C.o, w: 3.5, d: 1 }) +
      T(a.X(5), 240, '평행 → 해 없음', { z: 16, f: C.r, d: 1.8 }) +
      L(b.X(0), b.Y(1), b.X(8), b.Y(9), { s: C.b, w: 6, d: 2.4 }) + L(b.X(0), b.Y(1), b.X(8), b.Y(9), { s: C.o, w: 3, dash: '8 6', d: 3.2 }) +
      T(b.X(5), 240, '일치 → 해가 무수히 많음', { z: 16, f: C.g, d: 3.8 });
  })
];

/* ───────── 중2-2 삼각형의 성질 ───────── */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = a => Math.hypot(a[0], a[1]), mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
function circumcenter(A, B, Cc) {
  const d = 2 * (A[0] * (B[1] - Cc[1]) + B[0] * (Cc[1] - A[1]) + Cc[0] * (A[1] - B[1]));
  const s2 = p => p[0] * p[0] + p[1] * p[1];
  return [(s2(A) * (B[1] - Cc[1]) + s2(B) * (Cc[1] - A[1]) + s2(Cc) * (A[1] - B[1])) / d,
    (s2(A) * (Cc[0] - B[0]) + s2(B) * (A[0] - Cc[0]) + s2(Cc) * (B[0] - A[0])) / d];
}
M.triangles = [
  S('이등변삼각형을 꼭지각에서 밑변의 중점으로 <strong>반 접어</strong> 보세요. 양쪽이 꼭 겹치므로 <strong>두 밑각의 크기가 같고</strong>, 접는 선은 밑변과 수직이에요.', 6.5, () => {
    const A = [260, 36], B = [150, 214], Cc = [370, 214], Mm = [260, 214];
    return Poly([A, B, Cc], { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 }) + L(...A, ...Mm, { s: C.m, w: 2, dash: '5 4', d: .6 }) +
      L(...A, ...B, { s: C.b, w: 4, d: .4 }) + L(...A, ...Cc, { s: C.b, w: 4, d: .4 }) +
      G(Poly([A, Mm, Cc], { f: C.o, s: C.o, op: .35, c: '' }), { c: 'flip', ox: 260, oy: 0, d: 1.3, t: 1.4 }) +
      P(wedgeD(...B, 30, 0, 58.3), { f: C.g, s: C.g, op: .5, d: 2.9 }) + P(wedgeD(...Cc, 30, 180 - 58.3, 180), { f: C.g, s: C.g, op: .5, d: 2.9 }) +
      T(B[0] + 46, B[1] - 14, '●', { z: 10, f: C.g, d: 3.1 }) + T(Cc[0] - 46, Cc[1] - 14, '●', { z: 10, f: C.g, d: 3.1 }) +
      RA(Mm, [1, 0], [0, -1], 12, { d: 3.4 }) +
      T(440, 90, '밑각 크기가 같다', { z: 16, f: C.g, d: 3.6 }) + T(440, 120, '접는 선 ⊥ 밑변', { z: 16, d: 4 });
  }),
  S('세 변의 <strong>수직이등분선</strong>은 한 점에서 만나요. 이 점 O(<strong>외심</strong>)에서 세 꼭짓점까지 거리가 같아서, O를 중심으로 세 꼭짓점을 지나는 원을 그릴 수 있어요.', 7.5, () => {
    const A = [140, 198], B = [325, 190], Cc = [211, 27];
    const O = circumcenter(A, B, Cc), r = len(sub(A, O));
    let s = Poly([A, B, Cc], { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 });
    [[A, B], [B, Cc], [Cc, A]].forEach(([p, q], i) => {
      const m = mid(p, q), dir = sub(O, m), n = mul(dir, 1 / len(dir)), e = add(O, mul(n, 30));
      const st = sub(m, mul(n, 26));
      s += L(...st, ...e, { s: C.b, w: 2, d: .5 + i * .6, t: .7 }) + Ci(...m, 4, { f: C.b, d: .5 + i * .6 });
    });
    s += Ci(...O, 7, { f: C.r, d: 2.4, pulse: 1 }) + T(O[0] + 16, O[1] - 14, 'O', { z: 17, f: C.r, d: 2.5 }) +
      [A, B, Cc].map((p, i) => L(...O, ...p, { s: C.r, w: 2, dash: '5 4', d: 3 + i * .2 })).join('') +
      Ci(...O, r, { f: 'none', s: C.r, w: 2.5, c: 'draw', d: 3.8, t: 1.4 }) +
      T(440, 60, 'OA = OB = OC', { z: 17, f: C.r, d: 4.4 });
    return s;
  }),
  S('세 각의 <strong>이등분선</strong>은 한 점 I(<strong>내심</strong>)에서 만나요. I에서 세 변까지 거리가 같아서, 세 변에 모두 닿는 원(내접원)을 그릴 수 있어요.', 7.5, () => {
    const A = [100, 215], B = [420, 215], Cc = [250, 40];
    const a = len(sub(B, Cc)), b = len(sub(A, Cc)), c = len(sub(A, B)), p = a + b + c;
    const I = [(a * A[0] + b * B[0] + c * Cc[0]) / p, (a * A[1] + b * B[1] + c * Cc[1]) / p];
    const area = Math.abs((B[0] - A[0]) * (Cc[1] - A[1]) - (Cc[0] - A[0]) * (B[1] - A[1])) / 2, r = 2 * area / p;
    let s = Poly([A, B, Cc], { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 });
    [A, B, Cc].forEach((v, i) => { s += L(...v, ...add(I, mul(sub(I, v), .25)), { s: C.g, w: 2, d: .5 + i * .6, t: .7 }); });
    const foot = (P1, P2) => { const d = sub(P2, P1), t = ((I[0] - P1[0]) * d[0] + (I[1] - P1[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2); return add(P1, mul(d, t)); };
    s += Ci(...I, 7, { f: C.g, d: 2.4, pulse: 1 }) + T(I[0] + 16, I[1] - 14, 'I', { z: 17, f: C.g, d: 2.5 }) +
      [[A, B], [B, Cc], [Cc, A]].map(([p1, p2], i) => L(...I, ...foot(p1, p2), { s: C.o, w: 2, dash: '5 4', d: 3 + i * .2 })).join('') +
      Ci(...I, r, { f: 'none', s: C.g, w: 2.5, c: 'draw', d: 3.8, t: 1.4 }) +
      T(440, 40, '세 변까지 거리 같음', { z: 14, f: C.g, d: 4.4 });
    return s;
  })
];

/* ───────── 중2-2 사각형의 성질 ───────── */
M.quadrilaterals = [
  S('평행사변형은 마주 보는 <strong>두 쌍의 변이 각각 평행</strong>해요. 그래서 마주 보는 변의 길이가 같고, 마주 보는 각의 크기도 같아요.', 6, () => {
    const A = [120, 200], B = [330, 200], Cc = [410, 70], D = [200, 70];
    return Poly([A, B, Cc, D], { f: '#f7f9ff', s: 'none', d: .1 }) +
      L(...A, ...B, { s: C.b, w: 4, d: .3 }) + L(...D, ...Cc, { s: C.b, w: 4, d: .6 }) +
      L(...A, ...D, { s: C.o, w: 4, d: 1.1 }) + L(...B, ...Cc, { s: C.o, w: 4, d: 1.4 }) +
      T(225, 200, '›', { z: 22, f: C.b, d: 1 }) + T(305, 70, '›', { z: 22, f: C.b, d: 1 }) +
      T(160, 135, '»', { z: 20, f: C.o, d: 1.8, a: 'transform="rotate(-58 160 135)"' }) + T(370, 135, '»', { z: 20, f: C.o, d: 1.8, a: 'transform="rotate(-58 370 135)"' }) +
      P(wedgeD(...A, 28, 0, 58.4), { f: C.g, s: 'none', op: .5, d: 2.4 }) + P(wedgeD(...Cc, 28, 180, 238.4), { f: C.g, s: 'none', op: .5, d: 2.6 }) +
      P(wedgeD(...B, 24, 58.4, 180), { f: C.p, s: 'none', op: .45, d: 3 }) + P(wedgeD(...D, 24, 238.4, 360), { f: C.p, s: 'none', op: .45, d: 3.2 }) +
      T(260, 242, '대변의 길이 같음 · 대각의 크기 같음', { z: 15, d: 3.6 });
  }),
  S('대각선을 그어 교점을 중심으로 평행사변형을 <strong>180° 돌리면</strong> 원래 모양과 정확히 겹쳐요. 그래서 <strong>두 대각선은 서로를 이등분</strong>해요.', 7, () => {
    const A = [120, 200], B = [330, 200], Cc = [410, 70], D = [200, 70], O = [265, 135];
    return Poly([A, B, Cc, D], { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 }) + L(...A, ...Cc, { s: C.b, w: 2.5, d: .4 }) + L(...B, ...D, { s: C.g, w: 2.5, d: .8 }) +
      Ci(...O, 6, { f: C.r, d: 1.3 }) +
      G(Poly([A, B, Cc, D], { f: C.o, s: C.o, op: .25, w: 2, c: '' }) + Ci(...A, 6, { f: C.o, c: '' }), { c: 'mv', ox: O[0], oy: O[1], fr: 0, tr: 180, d: 1.8, t: 2 }) +
      T(A[0] - 12, A[1] + 12, 'A', { z: 14, d: .2 }) + T(Cc[0] + 12, Cc[1] - 10, 'C', { z: 14, d: .2 }) +
      T(192, 180, '|', { z: 18, f: C.b, d: 4, a: 'transform="rotate(-30 192 180)"' }) + T(338, 92, '|', { z: 18, f: C.b, d: 4, a: 'transform="rotate(-30 338 92)"' }) +
      T(298, 168, '||', { z: 16, f: C.g, d: 4.3, a: 'transform="rotate(48 298 168)"' }) + T(232, 102, '||', { z: 16, f: C.g, d: 4.3, a: 'transform="rotate(48 232 102)"' }) +
      T(460, 230, 'A가 C 자리로!', { z: 14, f: C.o, d: 3.6 });
  }),
  S('평행사변형에 조건이 더해지면 특별한 사각형이 돼요. <strong>직사각형</strong>은 대각선 길이가 같고, <strong>마름모</strong>는 대각선이 수직, <strong>정사각형</strong>은 둘 다예요.', 7, () => {
    const fig = (cx, pts, d, col, lab, note, perp, eq, rd) => {
      const P0 = pts.map(p => [cx + p[0], 125 + p[1]]);
      let s = Poly(P0, { f: '#f7f9ff', s: C.k, w: 2.5, d }) + L(...P0[0], ...P0[2], { s: col, w: 3, d: d + .4 }) + L(...P0[1], ...P0[3], { s: eq ? col : C.m, w: 3, d: d + .6 });
      if (perp) s += RA([cx, 125], rd[0], rd[1], 9, { d: d + 1 });
      return s + T(cx, 220, lab, { z: 17, f: col, d: d + .3 }) + T(cx, 244, note, { z: 12, f: C.m, d: d + .8 });
    };
    return fig(90, [[-65, 50], [65, 50], [65, -50], [-65, -50]], .2, C.b, '직사각형', '대각선 길이 같음', 0, 1) +
      fig(260, [[0, 70], [55, 0], [0, -70], [-55, 0]], 1.8, C.g, '마름모', '대각선 ⊥', 1, 0, [[1, 0], [0, -1]]) +
      fig(430, [[-55, 55], [55, 55], [55, -55], [-55, -55]], 3.4, C.o, '정사각형', '같고 + 수직', 1, 1, [[1, -1], [1, 1]]);
  })
];

/* ───────── 중2-2 도형의 닮음 (2 : 3) ───────── */
function iso(ox, oy, s, i, j, k) {
  const X = (x, y) => ox + (x - y) * s * .866, Y = (x, y, z) => oy + (x + y) * s * .5 - z * s;
  const p = (x, y, z) => f(X(x, y)) + ',' + f(Y(x, y, z));
  return `<polygon points="${p(i, j, k + 1)} ${p(i + 1, j, k + 1)} ${p(i + 1, j + 1, k + 1)} ${p(i, j + 1, k + 1)}" fill="#c9d3fb"/>` +
    `<polygon points="${p(i + 1, j, k)} ${p(i + 1, j + 1, k)} ${p(i + 1, j + 1, k + 1)} ${p(i + 1, j, k + 1)}" fill="#8e9ef0"/>` +
    `<polygon points="${p(i, j + 1, k)} ${p(i + 1, j + 1, k)} ${p(i + 1, j + 1, k + 1)} ${p(i, j + 1, k + 1)}" fill="#6a7de4"/>`;
}
function cubeBlock(ox, oy, s, n, d0) {
  const list = [];
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) list.push([i, j, k]);
  list.sort((a, b) => (a[2] - b[2]) || ((a[0] + a[1]) - (b[0] + b[1])));
  return list.map((c, idx) => G(iso(ox, oy, s, ...c), { c: 'fade', d: d0 + idx * (n > 2 ? .07 : .18), a: `stroke="#fff" stroke-width="1"` })).join('');
}
M.similarity = [
  S('한 점 O에서 각 꼭짓점까지의 거리를 똑같이 <strong>1.5배</strong> 늘리면, 모양은 같고 크기만 다른 <strong>닮은 도형</strong>이 생겨요. 대응변의 길이 비 = 닮음비 2 : 3', 7, () => {
    const O = [50, 225], tri = [[130, 200], [210, 200], [150, 135]];
    const big = tri.map(v => add(O, mul(sub(v, O), 1.5)));
    let s = Ci(...O, 6, { f: C.k, d: .1 }) + T(O[0] - 12, O[1] + 12, 'O', { z: 15, d: .1 });
    big.forEach((v, i) => { s += L(...O, ...add(O, mul(sub(v, O), 1.12)), { s: C.m, w: 1.3, dash: '4 4', d: .3 + i * .1 }); });
    s += Poly(tri, { f: C.bl, s: C.b, w: 2.5, d: .6 }) +
      G(Poly(tri, { f: C.o, s: C.o, w: 2, op: .3, c: '' }), { c: 'mv', ox: O[0], oy: O[1], fs: 1, ts: 1.5, d: 1.5, t: 1.6, st: 'stroke-width:1.4' }) +
      T(170, 212, '2', { z: 15, f: C.b, d: .9 }) + T(250, 228, '3', { z: 17, f: C.o, d: 3.3 }) +
      T(410, 70, '닮음비', { z: 15, f: C.m, d: 3.6 }) + T(410, 105, '2 : 3', { z: 30, d: 3.8, pulse: 1 }) +
      T(410, 160, '각의 크기는 그대로', { z: 14, f: C.m, d: 4.4 }) + T(410, 184, '변의 길이는 모두 ×1.5', { z: 14, f: C.m, d: 4.7 });
    return s;
  }),
  S('닮음비가 2 : 3 이면 넓이는 가로·세로가 모두 커지므로 <strong>2² : 3² = 4 : 9</strong> 예요. 같은 크기의 칸을 세어 보세요.', 6.5, () => {
    let s = '';
    for (let i = 0; i < 4; i++) s += R(70 + (i % 2) * 40, 90 + Math.floor(i / 2) * 40, 40, 40, { f: C.bl, s: C.b, w: 1.5, d: .3 + i * .2 });
    for (let i = 0; i < 9; i++) s += R(290 + (i % 3) * 40, 50 + Math.floor(i / 3) * 40, 40, 40, { f: C.ol, s: C.o, w: 1.5, d: 1.4 + i * .15 });
    return s + T(110, 200, '변 2 → 넓이 4', { z: 16, f: C.b, d: 1 }) + T(350, 200, '변 3 → 넓이 9', { z: 16, f: C.o, d: 2.9 }) +
      T(260, 240, '넓이의 비 = 4 : 9', { z: 22, d: 3.6, pulse: 1 });
  }),
  S('입체도형은 가로·세로·높이가 모두 커지므로 부피의 비는 <strong>2³ : 3³ = 8 : 27</strong> 이에요.', 7.5, () =>
    cubeBlock(130, 120, 26, 2, .2) + cubeBlock(360, 100, 26, 3, 1.6) +
    T(130, 205, '8개', { z: 18, f: C.b, d: 1.4 }) + T(360, 205, '27개', { z: 18, f: C.b, d: 3.8 }) +
    T(240, 130, ':', { z: 30, d: 1.4 }) + T(260, 242, '부피의 비 = 8 : 27', { z: 20, d: 4.4, pulse: 1 }))
];

/* ───────── 중2-2 피타고라스 정리 ───────── */
M.pythagoras = [
  S('직각삼각형의 세 변 위에 정사각형을 세워요. 짧은 두 변의 정사각형 넓이 <strong>9 + 16</strong>이 빗변 정사각형 넓이 <strong>25</strong>와 같아요.', 7, () => {
    const u = 18, Rt = [200, 160], A = [200, 160 - 3 * u], B = [200 + 4 * u, 160];
    const n = [3 * u, -4 * u]; // 바깥 방향
    const P3 = add(B, n), P4 = add(A, n);
    const grid = (p0, ex, ey, cnt, col) => { let g = ''; for (let i = 1; i < cnt; i++) { const a = add(p0, mul(ex, i / cnt)), b = add(a, ey), c = add(p0, mul(ey, i / cnt)), d = add(c, ex); g += `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}"/><line x1="${f(c[0])}" y1="${f(c[1])}" x2="${f(d[0])}" y2="${f(d[1])}"/>`; } return `<g stroke="${col}" stroke-opacity=".45" stroke-width="1">${g}</g>`; };
    return Poly([Rt, A, B], { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 }) + RA(Rt, [0, -1], [1, 0], 10, { d: .3 }) +
      G(Poly([A, Rt, [Rt[0] - 3 * u, Rt[1]], [A[0] - 3 * u, A[1]]], { f: C.bl, s: C.b, w: 2, c: '' }) + grid([A[0] - 3 * u, A[1]], [3 * u, 0], [0, 3 * u], 3, C.b), { c: 'pop', d: .6 }) +
      G(Poly([Rt, B, [B[0], B[1] + 4 * u], [Rt[0], Rt[1] + 4 * u]], { f: C.gl, s: C.g, w: 2, c: '' }) + grid(Rt, [4 * u, 0], [0, 4 * u], 4, C.g), { c: 'pop', d: 1.2 }) +
      G(Poly([A, B, P3, P4], { f: C.ol, s: C.o, w: 2, c: '' }) + grid(A, sub(B, A), n, 5, C.o), { c: 'pop', d: 1.8 }) +
      T(A[0] - 27, A[1] + 27, '9', { z: 20, f: C.b, d: 2.4 }) + T(Rt[0] + 36, Rt[1] + 36, '16', { z: 20, f: C.g, d: 2.6 }) +
      T((A[0] + P3[0]) / 2, (A[1] + P3[1]) / 2, '25', { z: 22, f: '#b0661a', d: 2.8 }) +
      T(430, 120, '9 + 16 = 25', { z: 22, d: 3.4 }) + T(430, 165, 'a² + b² = c²', { z: 22, f: C.b, d: 4, pulse: 1 });
  }),
  S('같은 크기의 큰 정사각형 안에 같은 직각삼각형 4개를 놓아요. <strong>삼각형만 옮겨도</strong> 남는 넓이는 변하지 않으니 <strong>c² = a² + b²</strong> 이에요.', 8, () => {
    const s0 = 26, x0 = 60, y0 = 36, P0 = (x, y) => [x0 + x * s0, y0 + y * s0];
    const tris = [[[0, 0], [4, 0], [0, 3], [3, 0]], [[4, 0], [7, 0], [7, 4], [-4, 3]], [[7, 4], [7, 7], [3, 7], [0, -4]], [[3, 7], [0, 7], [0, 3], [0, 0]]];
    const cols = [C.b, C.g, C.p, C.r];
    let s = Poly([P0(0, 0), P0(7, 0), P0(7, 7), P0(0, 7)], { f: '#fff8ea', s: C.k, w: 2.5, d: .1 }) +
      T(...P0(3.5, 3.5), 'c²', { z: 28, f: '#b0661a', d: .6, o: 2.4 });
    tris.forEach((tr, i) => {
      const [p, q, r, mv] = tr;
      s += G(Poly([P0(...p), P0(...q), P0(...r)], { f: cols[i], s: C.w, w: 2, op: .75, c: '' }), { c: 'mv', tx: mv[0] * s0, ty: mv[1] * s0, d: 2.6 + i * .3, t: 1.3 });
    });
    s += T(...P0(1.5, 1.5), 'a²', { z: 24, f: '#b0661a', d: 4.4 }) + T(...P0(5, 5), 'b²', { z: 28, f: '#b0661a', d: 4.6 }) +
      T(400, 70, '처음: 가운데 c²', { z: 16, d: 1 }) + T(400, 110, '삼각형을 옮기면', { z: 16, f: C.m, d: 2.6 }) +
      T(400, 150, 'a² 와 b² 로!', { z: 16, d: 4.6 }) + T(400, 205, 'c² = a² + b²', { z: 24, f: C.b, d: 5.2, pulse: 1 });
    return s;
  })
];

/* ───────── 중2-2 경우의 수 ───────── */
M.counting = [
  S('셔츠 3벌과 바지 2벌로 옷을 입는 방법을 <strong>나뭇가지 그림</strong>으로 그려요. 셔츠마다 바지가 2갈래씩 → <strong>3 × 2 = 6가지</strong> (곱의 법칙)', 7, () => {
    const shirts = [[C.r, '빨강'], [C.b, '파랑'], [C.g, '초록']], pants = ['청바지', '반바지'];
    let s = Ci(55, 130, 8, { f: C.k, d: .1 });
    shirts.forEach(([col, nm], i) => {
      const y = 40 + i * 80, d = .3 + i * .3;
      s += L(63, 130, 150, y, { s: C.m, w: 2, d, t: .4 }) + G(chip(170, y, '👕', col, col === C.r ? C.rl : col === C.b ? C.bl : C.gl, 20, 17), { c: 'pop', d: d + .3 }) +
        T(170, y + 30, nm, { z: 11, f: col, d: d + .3 });
      pants.forEach((pn, j) => {
        const y2 = y - 18 + j * 36, d2 = 1.4 + i * .6 + j * .25;
        s += L(190, y, 280, y2, { s: C.m, w: 1.6, d: d2, t: .35 }) + T(290, y2, pn, { z: 13, an: 'start', d: d2 + .2 }) +
          T(400, y2, `${nm}+${pn}`, { z: 12, an: 'start', f: C.m, d: d2 + .3 });
      });
    });
    return s + T(260, 248, '3 × 2 = 6가지', { z: 18, f: C.b, d: 4.4, pulse: 1 });
  }),
  S('A, B, C 세 명을 한 줄로 세워요. 첫째 자리 3명 중 하나, 둘째 자리는 남은 2명, 셋째는 1명 → <strong>3 × 2 × 1 = 6가지</strong>', 7, () => {
    let s = '';
    ['첫째', '둘째', '셋째'].forEach((nm, i) => { s += R(70 + i * 140, 70, 100, 70, { f: '#f7f9ff', s: C.b, w: 2, rx: 12, d: .1 }) + T(120 + i * 140, 55, nm, { z: 14, f: C.m, d: .1 }); });
    const lets = [['A', C.r, C.rl], ['B', C.b, C.bl], ['C', C.g, C.gl]];
    lets.forEach(([l, c, lt], i) => { s += G(chip(130 + i * 130, 205, l, c, lt, 18, 16), { c: 'pop', d: .3 }); });
    s += G(chip(120, 105, 'A', C.r, C.rl, 22, 18), { c: 'mv', fx: 10, fy: 100, d: 1, t: .8 }) + T(120, 160, '3가지', { z: 15, f: C.o, d: 1.6 }) +
      G(chip(260, 105, 'B', C.b, C.bl, 22, 18), { c: 'mv', fx: 0, fy: 100, d: 2.2, t: .8 }) + T(260, 160, '2가지', { z: 15, f: C.o, d: 2.8 }) +
      G(chip(400, 105, 'C', C.g, C.gl, 22, 18), { c: 'mv', fx: -10, fy: 100, d: 3.4, t: .8 }) + T(400, 160, '1가지', { z: 15, f: C.o, d: 4 }) +
      T(190, 105, '×', { z: 22, f: C.m, d: 4.3 }) + T(330, 105, '×', { z: 22, f: C.m, d: 4.3 }) +
      T(260, 247, '3 × 2 × 1 = 6가지', { z: 18, f: C.b, d: 4.6, pulse: 1 });
    return s;
  }),
  S('버스 3노선 <strong>또는</strong> 지하철 2노선 중 하나를 고를 때는 두 경우가 동시에 일어나지 않으므로 <strong>더해요</strong>: 3 + 2 = 5가지 (합의 법칙)', 6, () => {
    let s = R(40, 50, 190, 120, { f: C.bl, s: C.b, rx: 14, d: .1, op: .7 }) + R(290, 50, 190, 120, { f: C.gl, s: C.g, rx: 14, d: .3, op: .7 }) +
      T(135, 72, '버스', { z: 16, f: C.b, d: .2 }) + T(385, 72, '지하철', { z: 16, f: C.g, d: .4 });
    [0, 1, 2].forEach(i => { s += T(80 + i * 55, 120, '🚌', { z: 30, d: .6 + i * .2 }); });
    [0, 1].forEach(i => { s += T(355 + i * 60, 120, '🚇', { z: 30, d: 1.3 + i * .2 }); });
    return s + T(260, 115, '또는', { z: 18, f: C.o, d: 1.8 }) + T(260, 215, '3 + 2 = 5가지', { z: 26, d: 2.6, pulse: 1 }) +
      T(260, 248, '“그리고(연달아)” → 곱 · “또는” → 합', { z: 14, f: C.m, d: 3.2 });
  })
];

/* ───────── 중2-2 확률 (빨강 2, 파랑 3) ───────── */
M.probability = [
  S('주머니에 빨간 구슬 2개, 파란 구슬 3개가 있어요. 하나를 뽑을 때 모든 구슬이 똑같이 뽑힐 수 있으므로 빨강일 확률 = <strong>2/5</strong>', 6.5, () => {
    let s = P('M60 70Q60 50 80 50H220Q240 50 240 70V200Q240 225 215 225H85Q60 225 60 200Z', { f: '#f4f1ea', s: '#b49a72', w: 2.5, d: .1 }) +
      P('M95 50Q150 30 205 50', { s: '#b49a72', w: 3, d: .2 });
    const cols = [C.r, C.r, C.b, C.b, C.b], pos = [[100, 120], [160, 170], [130, 90], [200, 120], [110, 180]];
    cols.forEach((c, i) => {
      s += G(Ci(...pos[i], 17, { f: c, c: '', s: C.w, w: 2 }), { c: 'pop', d: .3 + i * .12, o: 1.4 + i * .2 });
      s += G(Ci(310 + i * 40, 110, 16, { f: c, c: '', s: C.w, w: 2 }), { c: 'mv', fx: pos[i][0] - 310 - i * 40, fy: pos[i][1] - 110, d: 1.4 + i * .2, t: .9 });
    });
    s += Ci(310, 110, 22, { f: 'none', s: C.o, w: 3, d: 3, pulse: 1 }) + Ci(350, 110, 22, { f: 'none', s: C.o, w: 3, d: 3.1, pulse: 1 }) +
      T(330, 160, '빨강 2개', { z: 14, f: C.r, d: 3.2 }) + T(390, 70, '전체 5개', { z: 14, f: C.m, d: 2.6 }) +
      T(390, 215, 'P(빨강) = 2 / 5', { z: 24, d: 3.8 });
    return s;
  }),
  S('실제로 여러 번 뽑아 보면 처음엔 들쭉날쭉하지만, <strong>시행 횟수가 많아질수록</strong> 빨강이 나온 비율이 <strong>0.4</strong>에 가까워져요.', 7, () => {
    const a = axes(60, 210, 1, { x0: 0, x1: 420, y0: 0, y1: 180, grid: false, lx: '횟수', ly: '비율', uy: 1 });
    const Yr = v => 210 - v * 170;
    const vals = [1, .5, .67, .5, .4, .5, .29, .38, .44, .3, .45, .36, .43, .38, .42, .39, .41, .4, .41, .4, .4];
    const pts = vals.map((v, i) => [60 + i * 20, Yr(v)]);
    return a.s + L(60, Yr(.4), 480, Yr(.4), { s: C.o, w: 2, dash: '6 4', d: .4 }) + T(500, Yr(.4), '0.4', { z: 14, f: C.o, d: .5 }) +
      T(52, Yr(1), '1', { z: 11, f: C.m, d: .3, an: 'end' }) + T(52, Yr(.5), '0.5', { z: 11, f: C.m, d: .3, an: 'end' }) +
      PL(pts, { s: C.r, w: 2.5, d: .8, t: 3.6 }) +
      T(330, 40, '실험 확률 → 이론 확률', { z: 16, d: 4.6, pulse: 1 });
  }),
  S('빨강이 나오거나, 빨강이 아니거나 — 둘 중 하나는 반드시 일어나요. 그래서 <strong>P(빨강) + P(빨강 아님) = 1</strong> 이에요.', 6, () =>
    R(60, 90, 160, 50, { f: C.r, s: C.w, w: 2, c: 'gx', d: .3, t: .7 }) + R(220, 90, 240, 50, { f: C.b, s: C.w, w: 2, c: 'gx', d: 1, t: .8 }) +
    T(140, 115, '2/5', { z: 20, f: C.w, d: 1 }) + T(340, 115, '3/5', { z: 20, f: C.w, d: 1.8 }) +
    T(140, 165, '빨강', { z: 14, f: C.r, d: 1 }) + T(340, 165, '빨강 아님 (파랑)', { z: 14, f: C.b, d: 1.8 }) +
    P('M60 70Q60 60 70 60H450Q460 60 460 70', { s: C.k, w: 2, d: 2.4 }) + T(260, 44, '전체 = 1', { z: 16, d: 2.6 }) +
    T(260, 220, '2/5 + 3/5 = 1', { z: 26, d: 3.2, pulse: 1 }))
];

}
// ===== grade3 =====
{


/* ───────── 중3-1 제곱근과 실수 ───────── */
M.roots = [
  S('넓이가 9인 정사각형의 한 변은 3, 넓이가 2인 정사각형의 한 변은 제곱해서 2가 되는 수 <strong>√2 ≈ 1.414…</strong> 예요. 제곱근은 "넓이 → 한 변"을 찾는 것이에요.', 6.5, () => {
    let s = '';
    for (let i = 0; i < 9; i++) s += R(50 + (i % 3) * 40, 50 + Math.floor(i / 3) * 40, 40, 40, { f: C.bl, s: C.b, w: 1.5, d: .2 + i * .1 });
    const u = 40, k = Math.SQRT2 * u;
    s += T(110, 190, '넓이 9', { z: 15, f: C.b, d: 1.2 }) + T(110, 218, '한 변 = √9 = 3', { z: 17, d: 1.6 }) +
      R(330, 170 - k, k, k, { f: C.ol, s: C.o, w: 2, c: 'pop', d: 2.4 }) + T(330 + k / 2, 170 - k / 2, '2', { z: 18, f: '#b0661a', d: 2.6 }) +
      L(330, 180, 330 + k, 180, { s: C.o, w: 3, d: 3.1, t: .5 }) + T(330 + k / 2, 198, '√2', { z: 17, f: C.o, d: 3.4 }) +
      T(400, 60, '한 변 × 한 변 = 2', { z: 15, d: 3.8 }) + T(400, 230, '√2 = 1.41421356…', { z: 17, f: C.o, d: 4.3, pulse: 1 });
    return s;
  }),
  S('한 변이 1인 정사각형의 대각선 길이는 피타고라스 정리로 √(1² + 1²) = √2 예요. 이 대각선을 <strong>컴퍼스처럼 돌려</strong> 수직선에 내리면 √2의 위치가 정확히 찍혀요.', 7, () => {
    const n = nline(80, 470, 200, -1, 3, { d: .1 }), u = n.X(1) - n.X(0), O = [n.X(0), 200];
    return n.s + R(O[0], 200 - u, u, u, { f: C.bl, s: C.b, w: 2, d: .5, op: .7 }) +
      T(O[0] + u / 2, 215 - u - 30, '1', { z: 14, f: C.b, d: .7 }) +
      L(...O, O[0] + u, 200 - u, { s: C.m, w: 2, dash: '4 3', d: 1.2 }) +
      G(L(...O, O[0] + u, 200 - u, { s: C.r, w: 4, c: '' }) + Ci(O[0] + u, 200 - u, 6, { f: C.r, c: '' }), { c: 'mv', ox: O[0], oy: 200, fr: 0, tr: 45, d: 2.2, t: 1.6 }) +
      P(arcD(...O, u * Math.SQRT2, 0, 45), { s: C.r, w: 1.6, dash: '4 3', d: 2.2 }) +
      T(O[0] + 40, 200 - u / 2 - 20, '√2', { z: 16, f: C.r, d: 1.4, o: 2.2 }) +
      Ci(O[0] + u * Math.SQRT2, 200, 8, { f: C.r, d: 3.9, pulse: 1 }) + T(O[0] + u * Math.SQRT2, 168, '√2', { z: 20, f: C.r, d: 4 }) +
      T(390, 50, '분수로 나타낼 수 없는', { z: 14, f: C.m, d: 4.6 }) + T(390, 76, '무리수도 수직선 위에!', { z: 16, d: 4.9 });
  }),
  S('제곱해서 9가 되는 수는 3과 −3 <strong>두 개</strong>예요. 양수 쪽을 √9 = 3, 음수 쪽을 −√9 = −3 으로 써요.', 6, () => {
    const n = nline(60, 460, 160, -4, 4, { d: .1 });
    return n.s + Ci(n.X(3), 160, 10, { f: C.b, d: .6 }) + Ci(n.X(-3), 160, 10, { f: C.r, d: 1 }) +
      T(n.X(3), 120, '3² = 9', { z: 17, f: C.b, d: .8 }) + T(n.X(-3), 120, '(−3)² = 9', { z: 17, f: C.r, d: 1.2 }) +
      T(260, 45, '9의 제곱근 = ±3', { z: 24, d: 2, pulse: 1 }) +
      T(n.X(3), 205, '√9', { z: 17, f: C.b, d: 2.8 }) + T(n.X(-3), 205, '−√9', { z: 17, f: C.r, d: 3 }) +
      T(260, 240, '√ 기호는 양의 제곱근만 뜻해요', { z: 14, f: C.m, d: 3.6 });
  })
];

/* ───────── 중3-1 근호를 포함한 식의 계산 ───────── */
M.radicals = [
  S('넓이가 2인 작은 정사각형 9개를 3 × 3 으로 붙이면 넓이 18인 큰 정사각형이 돼요. 한 변은 √2가 3개 → <strong>√18 = √(9 × 2) = 3√2</strong>', 7, () => {
    const k = 42, x0 = 50, y0 = 40;
    let s = '';
    for (let i = 0; i < 9; i++) s += G(R(x0 + (i % 3) * k, y0 + Math.floor(i / 3) * k, k, k, { f: C.pl, s: C.p, w: 1.5, c: '' }) + T(x0 + (i % 3) * k + k / 2, y0 + Math.floor(i / 3) * k + k / 2, '2', { z: 13, f: C.p, c: '' }), { c: 'pop', d: .2 + i * .15 });
    for (let i = 0; i < 3; i++) s += T(x0 + i * k + k / 2, y0 + 3 * k + 16, '√2', { z: 13, f: C.o, d: 1.8 + i * .2 });
    s += L(x0, y0 + 3 * k + 32, x0 + 3 * k, y0 + 3 * k + 32, { s: C.o, w: 2.5, d: 2.6, t: .5 }) + T(x0 + 1.5 * k, y0 + 3 * k + 48, '3√2', { z: 16, f: C.o, d: 2.9 });
    return s + eqs(['√18', '= √(9 × 2)', '= √9 × √2', ['= 3√2', '', C.b]], { x: 370, y: 50, dy: 42, d: 3.2, gap: .7, z: 22 });
  }),
  S('근호 안의 수가 같으면 문자처럼 묶어요: 3√2 + 2√2 = <strong>5√2</strong>. 하지만 √2 + √3 은 서로 다른 종류라 √5가 <strong>아니에요</strong>.', 6.5, () => {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const col = i < 3 ? C.b : C.g, lt = i < 3 ? C.bl : C.gl, x = 60 + i * 66;
      s += G(box(x + (i < 3 ? 0 : 20), 50, 60, 40, '√2', col, lt, 15), { c: 'pop', d: .2 + i * .15, o: 1.6 });
      s += G(box(x, 50, 60, 40, '√2', col, lt, 15), { c: 'mv', fx: i < 3 ? 0 : 20, fy: 0, d: 1.6, t: .8 });
    }
    s += T(450, 70, '= 5√2', { z: 22, f: C.b, d: 2.5 }) +
      L(30, 125, 490, 125, { s: C.l, w: 1, d: 3 }) +
      T(260, 180, '√2 + √3  ≠  √5', { z: 26, d: 3.4 }) + T(260, 228, '1.41 + 1.73 = 3.14  vs  √5 ≈ 2.24', { z: 14, f: C.r, d: 4.2 });
    return s;
  }),
  S('분모에 √2가 있으면 분자·분모에 똑같이 √2를 곱해요. √2 × √2 = 2 이므로 <strong>분모가 유리수</strong>가 돼요 (분모의 유리화).', 6, () =>
    T(110, 120, '1', { z: 28, d: .2 }) + L(85, 140, 135, 140, { s: C.k, w: 2.5, d: .2 }) + T(110, 162, '√2', { z: 28, f: C.r, d: .2 }) +
    T(165, 140, '×', { z: 24, d: .8 }) +
    G(T(220, 120, '√2', { z: 28, f: C.o, c: '' }) + L(192, 140, 248, 140, { s: C.o, w: 2.5, c: '' }) + T(220, 162, '√2', { z: 28, f: C.o, c: '' }), { c: 'pop', d: 1 }) +
    T(220, 200, '(= 1)', { z: 13, f: C.o, d: 1.4 }) + T(280, 140, '=', { z: 24, d: 2 }) +
    T(340, 120, '√2', { z: 28, d: 2.4 }) + L(312, 140, 368, 140, { s: C.k, w: 2.5, d: 2.4 }) + T(340, 162, '2', { z: 28, f: C.g, d: 2.4, pulse: 1 }) +
    T(450, 162, '← 유리수!', { z: 15, f: C.g, d: 3.2 }))
];

/* ───────── 중3-1 다항식의 곱셈 ───────── */
function areaModel(x0, y0, X, k, a, b, d0, opts = {}) {
  // (x + a)(x + b) : 가로 x + b, 세로 x + a
  let s = '';
  const cell = (x, y, w, h, fill, st, lab, d) => G(R(x, y, w, h, { f: fill, s: st, w: 1.5, c: '' }) + (lab ? T(x + w / 2, y + h / 2, lab, { z: 15, f: st, c: '' }) : ''), { c: 'pop', d });
  s += cell(x0, y0, X, X, C.bl, C.b, 'x²', d0);
  for (let j = 0; j < b; j++) s += cell(x0 + X + j * k, y0, k, X, C.gl, C.g, j === Math.floor(b / 2) ? '' : '', d0 + .5 + j * .12);
  for (let i = 0; i < a; i++) s += cell(x0, y0 + X + i * k, X, k, C.gl, C.g, '', d0 + 1 + i * .12);
  for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) s += cell(x0 + X + j * k, y0 + X + i * k, k, k, C.ol, C.o, '', d0 + 1.6 + (i * b + j) * .07);
  s += T(x0 + X + b * k / 2, y0 + X / 2, `${b}x`, { z: 16, f: C.g, d: d0 + .9 }) + T(x0 + X / 2, y0 + X + a * k / 2, `${a}x`, { z: 16, f: C.g, d: d0 + 1.4 }) +
    T(x0 + X + b * k / 2, y0 + X + a * k / 2, `${a * b}`, { z: 16, f: '#b0661a', d: d0 + 2.3 });
  if (!opts.noSides) s += T(x0 + X / 2, y0 - 14, 'x', { z: 15, d: d0 }) + T(x0 + X + b * k / 2, y0 - 14, `${b}`, { z: 15, d: d0 }) +
    T(x0 - 14, y0 + X / 2, 'x', { z: 15, d: d0 }) + T(x0 - 14, y0 + X + a * k / 2, `${a}`, { z: 15, d: d0 });
  return s;
}
M.polynomial = [
  S('(x + 2)(x + 3)을 가로 x + 3, 세로 x + 2 인 직사각형의 넓이로 보세요. 네 조각 <strong>x², 3x, 2x, 6</strong>을 모두 더하면 x² + 5x + 6', 7, () =>
    areaModel(60, 40, 100, 26, 2, 3, .2) +
    eqs(['(x + 2)(x + 3)', '= x² + 3x + 2x + 6', ['= x² + 5x + 6', '', C.b]], { x: 380, y: 70, dy: 50, d: 3, gap: .9, z: 19 })),
  S('(a + b)² 은 한 변이 a + b인 정사각형이에요. a², b² 그리고 같은 직사각형 <strong>ab가 2개</strong> → a² + 2ab + b²', 6.5, () => {
    const x0 = 70, y0 = 35, A = 110, B = 60;
    return G(R(x0, y0, A, A, { f: C.bl, s: C.b, w: 1.5, c: '' }) + T(x0 + A / 2, y0 + A / 2, 'a²', { z: 18, f: C.b, c: '' }), { c: 'pop', d: .2 }) +
      G(R(x0 + A, y0, B, A, { f: C.gl, s: C.g, w: 1.5, c: '' }) + T(x0 + A + B / 2, y0 + A / 2, 'ab', { z: 16, f: C.g, c: '' }), { c: 'pop', d: .8 }) +
      G(R(x0, y0 + A, A, B, { f: C.gl, s: C.g, w: 1.5, c: '' }) + T(x0 + A / 2, y0 + A + B / 2, 'ab', { z: 16, f: C.g, c: '' }), { c: 'pop', d: 1.2 }) +
      G(R(x0 + A, y0 + A, B, B, { f: C.ol, s: C.o, w: 1.5, c: '' }) + T(x0 + A + B / 2, y0 + A + B / 2, 'b²', { z: 16, f: '#b0661a', c: '' }), { c: 'pop', d: 1.8 }) +
      T(x0 + A / 2, y0 - 13, 'a', { z: 14, d: .2 }) + T(x0 + A + B / 2, y0 - 13, 'b', { z: 14, d: .2 }) +
      T(x0 - 13, y0 + A / 2, 'a', { z: 14, d: .2 }) + T(x0 - 13, y0 + A + B / 2, 'b', { z: 14, d: .2 }) +
      T(390, 100, '(a + b)²', { z: 22, d: 2.4 }) + T(390, 150, '= a² + 2ab + b²', { z: 22, f: C.b, d: 3, pulse: 1 });
  }),
  S('a² 정사각형에서 b² 모서리를 잘라내고, 남은 아래 조각을 <strong>돌려서 옆에 붙이면</strong> 가로 a + b, 세로 a − b 인 직사각형 → a² − b² = (a + b)(a − b)', 8, () => {
    const x0 = 60, y0 = 40, A = 140, B = 60;
    return R(x0, y0, A, A - B, { f: C.bl, s: C.b, w: 1.5, d: .1 }) +
      G(R(x0, y0 + A - B, A - B, B, { f: C.gl, s: C.g, w: 1.5, c: '' }), { c: 'pop', d: .1 }) +
      R(x0 + A - B, y0 + A - B, B, B, { f: C.rl, s: C.r, w: 1.5, dash: '5 4', d: .3, o: 1.8, c: 'fade' }) +
      T(x0 + A - B / 2, y0 + A - B / 2, 'b²', { z: 16, f: C.r, d: .5, o: 1.8 }) +
      T(x0 + A / 2, y0 - 13, 'a', { z: 14, d: .2 }) + T(x0 - 13, y0 + A / 2, 'a', { z: 14, d: .2, o: 2 }) +
      G(G(R(x0, y0 + A - B, A - B, B, { f: C.gl, s: C.g, w: 1.5, c: '' }), { c: '' }),
        { c: 'mv', ox: x0 + (A - B) / 2, oy: y0 + A - B / 2, fr: 0, tr: 90, tx: x0 + A + B / 2 - (x0 + (A - B) / 2), ty: y0 + (A - B) / 2 - (y0 + A - B / 2), d: 2.2, t: 1.6 }) +
      R(x0, y0 + A - B, A - B, B, { f: '#fff', s: '#fff', w: 2, d: 2.2, c: 'fade' }) +
      R(x0, y0, A + B, A - B, { f: 'none', s: C.k, w: 3, d: 4, c: 'fade' }) +
      T(x0 + (A + B) / 2, y0 + A - B + 20, 'a + b', { z: 16, f: C.k, d: 4.2 }) + T(x0 - 26, y0 + (A - B) / 2, 'a − b', { z: 14, d: 4.2 }) +
      T(400, 190, 'a² − b²', { z: 22, d: 4.6 }) + T(400, 230, '= (a + b)(a − b)', { z: 22, f: C.b, d: 5, pulse: 1 });
  })
];

/* ───────── 중3-1 인수분해 ───────── */
M.factoring = [
  S('x² + 5x + 6 의 조각(x² 1개, x 막대 5개, 1 칸 6개)을 <strong>빈틈없는 직사각형</strong>으로 맞춰 보세요. 가로 x + 3, 세로 x + 2 → (x + 2)(x + 3)', 8, () => {
    const x0 = 300, y0 = 50, X = 90, k = 24;
    let s = '', n = 0;
    const tile = (fx, fy, w, h, fill, st, tx, ty, lab) => {
      const d = .4 + (n++) * .18;
      return G(R(tx, ty, w, h, { f: fill, s: st, w: 1.5, c: '' }) + (lab ? T(tx + w / 2, ty + h / 2, lab, { z: 14, f: st, c: '' }) : ''), { c: 'mv', fx: fx - tx, fy: fy - ty, d: 2 + d * .6, t: 1.1 });
    };
    s += tile(30, 40, X, X, C.bl, C.b, x0, y0, 'x²');
    for (let j = 0; j < 3; j++) s += tile(140 + j * 30, 30, k, X, C.gl, C.g, x0 + X + j * k, y0, 'x');
    for (let i = 0; i < 2; i++) s += tile(150, 140 + i * 34, X, k, C.gl, C.g, x0, y0 + X + i * k, 'x');
    for (let i = 0; i < 6; i++) s += tile(30 + (i % 3) * 32, 150 + Math.floor(i / 3) * 32, k, k, C.ol, C.o, x0 + X + (i % 3) * k, y0 + X + Math.floor(i / 3) * k, '');
    return T(130, 240, 'x² + 5x + 6', { z: 18, d: .2, o: 2 }) + s +
      T(x0 + (X + 3 * k) / 2, y0 - 16, 'x + 3', { z: 16, f: C.b, d: 4.4 }) + T(x0 - 30, y0 + (X + 2 * k) / 2, 'x + 2', { z: 16, f: C.b, d: 4.4 }) +
      T(160, 236, 'x² + 5x + 6 = (x + 2)(x + 3)', { z: 18, f: C.b, d: 4.9, pulse: 1 });
  }),
  S('x² + 5x + 6 = (x + □)(x + △) 라면 <strong>□ + △ = 5</strong>, <strong>□ × △ = 6</strong> 이에요. 곱이 6인 짝을 하나씩 확인해 보세요.', 7, () =>
    T(260, 36, '곱이 6이고 합이 5인 두 수는?', { z: 18, d: .2 }) +
    [['1 × 6', '합 7', 0], ['2 × 3', '합 5', 1], ['(−2) × (−3)', '합 −5', 0], ['(−1) × (−6)', '합 −7', 0]].map(([p, sum, ok], i) => {
      const y = 82 + i * 38, d = .8 + i * .7;
      return T(170, y, p, { z: 18, d }) + T(300, y, sum, { z: 16, f: C.m, d: d + .2 }) + T(380, y, ok ? '✓' : '✕', { z: 20, f: ok ? C.g : C.r, d: d + .4, pulse: ok ? 1 : undefined }) +
        (ok ? R(100, y - 17, 310, 34, { f: 'none', s: C.g, w: 2.5, rx: 10, d: d + .5, c: 'fade' }) : '');
    }).join('') + T(260, 240, 'x² + 5x + 6 = (x + 2)(x + 3)', { z: 19, f: C.b, d: 4.2 })),
  S('모든 항에 공통으로 들어 있는 인수를 <strong>앞으로 꺼내요</strong>. 2x² + 4x 는 두 항 모두 2x를 가지므로 2x(x + 2)', 6.5, () =>
    T(80, 60, '2x²', { z: 22, f: C.k, d: .1 }) + T(190, 60, '=', { z: 20, d: .1 }) + T(300, 60, '2 · x · x', { z: 22, d: .5 }) +
    T(80, 120, '4x', { z: 22, d: .1 }) + T(190, 120, '=', { z: 20, d: .1 }) + T(300, 120, '2 · 2 · x', { z: 22, d: .8 }) +
    R(258, 42, 54, 36, { f: C.o, s: 'none', op: .25, rx: 8, d: 1.5, c: 'fade' }) +
    R(258, 102, 22, 36, { f: C.o, s: 'none', op: .25, rx: 8, d: 1.6, c: 'fade' }) + R(320, 102, 22, 36, { f: C.o, s: 'none', op: .25, rx: 8, d: 1.7, c: 'fade' }) +
    T(440, 90, '공통: 2x', { z: 17, f: C.o, d: 2.2 }) +
    T(170, 205, '2x² + 4x =', { z: 20, d: 2.6, an: 'end' }) +
    G(R(190, 182, 60, 46, { f: C.ol, s: C.o, rx: 10, c: '' }) + T(220, 205, '2x', { z: 22, f: '#b0661a', c: '' }), { c: 'mv', fx: 220, fy: -120, d: 2.9, t: 1.2 }) +
    T(310, 205, '(x + 2)', { z: 24, d: 4.1, f: C.b, pulse: 1 }))
];

/* ───────── 중3-1 이차방정식 ───────── */
M.quadraticEquation = [
  S('x² − 5x + 6 = 0 을 인수분해하면 (x − 2)(x − 3) = 0. <strong>두 수의 곱이 0이면 둘 중 하나는 반드시 0</strong>이므로 x = 2 또는 x = 3', 7, () =>
    T(260, 36, 'x² − 5x + 6 = 0', { z: 22, d: .2 }) + T(260, 84, '(x − 2)(x − 3) = 0', { z: 22, f: C.b, d: 1 }) +
    T(260, 124, 'A × B = 0 → A = 0 또는 B = 0', { z: 14, f: C.m, d: 1.8 }) +
    L(230, 140, 140, 170, { s: C.m, w: 2, d: 2.4, t: .4 }) + L(290, 140, 380, 170, { s: C.m, w: 2, d: 2.4, t: .4 }) +
    R(70, 172, 140, 40, { f: C.bl, s: C.b, rx: 10, d: 2.8 }) + T(140, 192, 'x − 2 = 0', { z: 18, d: 2.9 }) +
    R(310, 172, 140, 40, { f: C.gl, s: C.g, rx: 10, d: 3.1 }) + T(380, 192, 'x − 3 = 0', { z: 18, d: 3.2 }) +
    T(140, 238, 'x = 2', { z: 22, f: C.b, d: 3.8, pulse: 1 }) + T(260, 238, '또는', { z: 15, f: C.m, d: 3.9 }) + T(380, 238, 'x = 3', { z: 22, f: C.g, d: 4, pulse: 1 })),
  S('그래프로 보면 y = x² − 5x + 6 이 <strong>x축과 만나는 점</strong>(y = 0)의 x좌표가 바로 근 2와 3이에요.', 6.5, () => {
    const a = axes(110, 200, 50, { x0: -.6, x1: 5.2, y0: -.8, y1: 3.5, uy: 40, nums: [['x', 1], ['x', 2], ['x', 3], ['x', 4]] });
    let path = '';
    for (let x = .4; x <= 4.61; x += .1) path += (path ? 'L' : 'M') + f(a.X(x)) + ' ' + f(a.Y(x * x - 5 * x + 6));
    return a.s + P(path, { s: C.b, w: 3.5, d: .5, t: 1.6 }) +
      Ci(a.X(2), a.Y(0), 9, { f: C.r, d: 2.3, pulse: 1 }) + Ci(a.X(3), a.Y(0), 9, { f: C.r, d: 2.5, pulse: 1 }) +
      T(a.X(2) - 18, a.Y(0) + 26, 'x = 2', { z: 14, f: C.r, d: 2.6 }) + T(a.X(3) + 18, a.Y(0) + 26, 'x = 3', { z: 14, f: C.r, d: 2.7 }) +
      T(420, 50, 'y = x² − 5x + 6', { z: 16, f: C.b, d: 1.8 }) + T(420, 90, 'y = 0 인 곳 = 근', { z: 16, d: 3.2 });
  }),
  S('<strong>완전제곱식</strong>: x² + 6x 에서 6x 막대를 반으로 나눠 정사각형 양옆에 붙이면, 모서리 <strong>3 × 3 = 9</strong>만 채우면 (x + 3)² 이 완성돼요.', 8, () => {
    const x0 = 70, y0 = 40, X = 110, k = 60;
    return G(R(x0, y0, X, X, { f: C.bl, s: C.b, w: 1.5, c: '' }) + T(x0 + X / 2, y0 + X / 2, 'x²', { z: 20, f: C.b, c: '' }), { c: 'pop', d: .1 }) +
      G(R(x0 + X, y0, k, X, { f: C.gl, s: C.g, w: 1.5, c: '' }) + T(x0 + X + k / 2, y0 + X / 2, '3x', { z: 16, f: C.g, c: '' }), { c: 'pop', d: .4 }) +
      G(G(R(x0 + X + k, y0, k, X, { f: C.gl, s: C.g, w: 1.5, c: '' }) + T(x0 + X + 1.5 * k, y0 + X / 2, '3x', { z: 16, f: C.g, c: '' }), { c: '' }),
        { c: 'mv', ox: x0 + X + 1.5 * k, oy: y0 + X / 2, fr: 0, tr: -90, tx: x0 + X / 2 - (x0 + X + 1.5 * k), ty: y0 + X + k / 2 - (y0 + X / 2), d: 1.4, t: 1.6 }) +
      T(x0 + X / 2, y0 - 13, 'x', { z: 14, d: .2 }) + T(x0 + X + k / 2, y0 - 13, '3', { z: 14, d: .2 }) +
      R(x0 + X, y0 + X, k, k, { f: C.ol, s: C.o, w: 2, dash: '5 4', d: 3.3, c: 'fade' }) +
      G(R(x0 + X, y0 + X, k, k, { f: C.ol, s: C.o, w: 1.5, c: '' }) + T(x0 + X + k / 2, y0 + X + k / 2, '+9', { z: 16, f: '#b0661a', c: '' }), { c: 'pop', d: 4 }) +
      T(400, 100, 'x² + 6x + 9', { z: 22, d: 4.6 }) + T(400, 150, '= (x + 3)²', { z: 24, f: C.b, d: 5.1, pulse: 1 });
  })
];

/* ───────── 중3-1 이차함수와 그래프 ───────── */
const parab = (a, X, Y, x0, x1, p = 0, q = 0) => { let d = ''; for (let x = x0; x <= x1 + 1e-9; x += .1) d += (d ? 'L' : 'M') + f(X(x)) + ' ' + f(Y(a * (x - p) ** 2 + q)); return d; };
M.quadraticFunction = [
  S('y = x² 의 그래프는 꼭짓점 (0, 0)에서 시작해 양쪽으로 올라가는 <strong>포물선</strong>이에요. y축을 접는 선으로 접으면 양쪽이 꼭 겹쳐요 (대칭축 x = 0).', 6.5, () => {
    const a = axes(260, 215, 30, { x0: -7, x1: 7, y0: -.5, y1: 6.4, nums: [['x', -2], ['x', 2], ['y', 4]] });
    return a.s + P(parab(1, a.X, a.Y, -2.5, 2.5), { s: C.b, w: 3.5, d: .4, t: 1.6 }) +
      L(a.X(0), a.Y(-.4), a.X(0), a.Y(6.4), { s: C.o, w: 2.5, dash: '6 4', d: 2.2 }) +
      Ci(a.X(-2), a.Y(4), 7, { f: C.r, d: 2.8 }) + Ci(a.X(2), a.Y(4), 7, { f: C.r, d: 2.8 }) +
      L(a.X(-2), a.Y(4), a.X(2), a.Y(4), { s: C.r, w: 1.6, dash: '4 3', d: 3.1 }) +
      T(a.X(-2) - 34, a.Y(4), '(−2, 4)', { z: 13, f: C.r, d: 3 }) + T(a.X(2) + 34, a.Y(4), '(2, 4)', { z: 13, f: C.r, d: 3 }) +
      Ci(a.X(0), a.Y(0), 7, { f: C.k, d: 3.5 }) + T(a.X(0) + 34, a.Y(0) - 12, '꼭짓점', { z: 13, d: 3.6 }) +
      T(430, 40, '대칭축 x = 0', { z: 16, f: C.o, d: 2.4 });
  }),
  S('<strong>a</strong>의 절댓값이 클수록 폭이 좁아지고, 작을수록 넓어져요. a가 <strong>음수</strong>이면 아래로 볼록한 모양으로 뒤집혀요.', 7, () => {
    const a = axes(260, 130, 28, { x0: -7, x1: 7, y0: -4.3, y1: 4.3, grid: false });
    return a.s + P(parab(2, a.X, a.Y, -1.45, 1.45), { s: C.b, w: 3.2, d: .4, t: 1 }) + T(185, 22, 'y = 2x²', { z: 15, f: C.b, d: 1.2 }) +
      P(parab(.5, a.X, a.Y, -2.9, 2.9), { s: C.g, w: 3.2, d: 1.8, t: 1 }) + T(a.X(3.1) + 30, a.Y(4.1), 'y = ½x²', { z: 15, f: C.g, d: 2.6 }) +
      P(parab(-1, a.X, a.Y, -2.05, 2.05), { s: C.r, w: 3.2, d: 3.2, t: 1 }) + T(a.X(2.3) + 34, a.Y(-4), 'y = −x²', { z: 15, f: C.r, d: 4 }) +
      T(100, 40, '|a| 크면 좁게', { z: 14, f: C.b, d: 1.4 }) + T(100, 64, '|a| 작으면 넓게', { z: 14, f: C.g, d: 2.8 }) + T(100, 220, 'a < 0 → 아래로', { z: 14, f: C.r, d: 4.2 });
  }),
  S('y = (x − 2)² + 1 은 y = x² 을 <strong>오른쪽으로 2, 위로 1</strong> 평행이동한 그래프예요. 꼭짓점이 (0, 0) → <strong>(2, 1)</strong>로 옮겨가요.', 7, () => {
    const a = axes(160, 215, 30, { x0: -4, x1: 11, y0: -.5, y1: 6.5, nums: [['x', 2], ['y', 1]] });
    return a.s + P(parab(1, a.X, a.Y, -2.5, 2.5), { s: C.m, w: 2.5, dash: '6 4', d: .3 }) + T(a.X(-2.6) - 6, a.Y(6) , 'y = x²', { z: 14, f: C.m, d: .4, an: 'end' }) +
      G(P(parab(1, a.X, a.Y, -2.5, 2.5), { s: C.b, w: 3.8, c: '' }) + Ci(a.X(0), a.Y(0), 7, { f: C.r, c: '' }), { c: 'mv', tx: 60, ty: -30, d: 1.2, t: 1.8 }) +
      P(`M${a.X(0)} ${a.Y(0)}L${a.X(2)} ${a.Y(0)}L${a.X(2)} ${a.Y(1)}`, { s: C.o, w: 2.5, d: 1.2, t: 1.8 }) +
      T(a.X(1), a.Y(0) + 16, '→ 2', { z: 13, f: C.o, d: 2 }) + T(a.X(2) + 22, a.Y(.5), '↑ 1', { z: 13, f: C.o, d: 2.6 }) +
      T(a.X(2) + 40, a.Y(1) + 2, '(2, 1)', { z: 16, f: C.r, d: 3.2, pulse: 1 }) +
      T(410, 40, 'y = (x − 2)² + 1', { z: 18, f: C.b, d: 3.6 }) + T(410, 70, '꼭짓점 (p, q) = (2, 1)', { z: 14, d: 4 });
  })
];

/* ───────── 중3-2 삼각비 ───────── */
M.trigonometry = [
  S('각 A가 같은 직각삼각형은 크기가 달라도 모두 <strong>닮음</strong>이에요. 그래서 (높이 ÷ 빗변)의 값이 크기와 상관없이 <strong>항상 같아요</strong> — 이 비가 삼각비예요.', 7, () => {
    const A = [50, 220], ang = 35, tn = Math.tan(ang * Math.PI / 180);
    let s = '';
    [110, 190, 270].forEach((b, i) => {
      const top = [A[0] + b, A[1] - b * tn], col = [C.b, C.g, C.o][i];
      s += Poly([A, [A[0] + b, A[1]], top], { f: col, s: col, w: 2.5, op: .15, d: .3 + i * 1.1 }) +
        L(A[0] + b, A[1], ...top, { s: col, w: 4, d: .6 + i * 1.1, t: .5 }) + L(...A, ...top, { s: col, w: 2.5, d: .5 + i * 1.1, t: .6 }) +
        RA([A[0] + b, A[1]], [-1, 0], [0, -1], 9, { d: .7 + i * 1.1 });
    });
    return s + P(wedgeD(...A, 36, 0, ang), { f: C.r, s: 'none', op: .4, d: .2 }) + T(A[0] + 50, A[1] - 14, '35°', { z: 14, f: C.r, d: .3 }) +
      T(430, 60, '높이 ÷ 빗변', { z: 16, d: 3.6 }) + T(430, 100, '0.57 · 0.57 · 0.57', { z: 16, f: C.m, d: 4 }) +
      T(430, 140, '= sin 35°', { z: 22, f: C.b, d: 4.5, pulse: 1 });
  }),
  S('각 A를 기준으로 변 이름을 정해요: <strong>빗변</strong>(가장 긴 변), A의 <strong>맞은편 변</strong>(높이), A에 <strong>이웃한 변</strong>(밑변). sin·cos·tan은 이들 중 두 변의 비예요.', 7.5, () => {
    const A = [60, 210], B = [300, 210], Cc = [300, 50];
    return Poly([A, B, Cc], { f: '#f7f9ff', s: C.k, w: 2, d: .1 }) + RA(B, [-1, 0], [0, -1], 12, { d: .2 }) +
      P(wedgeD(...A, 40, 0, 33.7), { f: C.r, s: 'none', op: .4, d: .3 }) + T(A[0] + 56, A[1] - 12, 'A', { z: 15, f: C.r, d: .3 }) +
      L(...A, ...Cc, { s: C.r, w: 5, d: .8 }) + T(165, 115, '빗변', { z: 16, f: C.r, d: 1.2 }) +
      L(...B, ...Cc, { s: C.b, w: 5, d: 1.7 }) + T(340, 130, '높이', { z: 16, f: C.b, d: 2 }) +
      L(...A, ...B, { s: C.g, w: 5, d: 2.5 }) + T(180, 232, '밑변', { z: 16, f: C.g, d: 2.8 }) +
      T(440, 70, 'sin A = 높이/빗변', { z: 15, d: 3.4 }) + T(440, 120, 'cos A = 밑변/빗변', { z: 15, d: 4.1 }) + T(440, 170, 'tan A = 높이/밑변', { z: 15, d: 4.8 });
  }),
  S('정삼각형(한 변 2)을 반으로 나누면 30°·60°·90° 삼각형이 생겨요. 빗변 2, 밑변 1, 높이 √3 이므로 <strong>sin 30° = 1/2</strong>, cos 30° = √3/2', 7.5, () => {
    const A = [120, 215], B = [320, 215], Cc = [220, 42], Mm = [220, 215];
    return Poly([A, B, Cc], { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 }) + T(270, 125, '2', { z: 16, d: .3 }) + T(170, 125, '2', { z: 16, d: .3, o: 2.2 }) +
      L(...Cc, ...Mm, { s: C.o, w: 3, d: .9, t: .6 }) + RA(Mm, [1, 0], [0, -1], 10, { d: 1.4 }) +
      Poly([A, Mm, Cc], { f: '#fff', s: C.m, w: 1.5, dash: '4 4', d: 2.2 }) +
      Poly([Mm, B, Cc], { f: C.bl, s: C.b, w: 2.5, d: 2.6, op: .6 }) +
      T(270, 232, '1', { z: 16, f: C.g, d: 3 }) + T(204, 140, '√3', { z: 16, f: C.o, d: 3.2 }) +
      P(wedgeD(...Cc, 30, 270, 300), { f: C.r, s: 'none', op: .5, d: 3.4 }) + T(Cc[0] + 14, Cc[1] + 42, '30°', { z: 12, f: C.r, d: 3.5 }) +
      T(440, 70, 'sin 30° = 1/2', { z: 18, d: 4 }) + T(440, 110, 'cos 30° = √3/2', { z: 18, d: 4.6 }) + T(440, 150, 'tan 30° = 1/√3', { z: 18, d: 5.2 });
  })
];

/* ───────── 중3-2 원의 성질 ───────── */
M.circleTheorem = [
  S('같은 호 AB에 대한 <strong>원주각</strong>은 점 P를 원 위 어디로 옮겨도 크기가 같고, <strong>중심각의 절반</strong>이에요 (80° → 40°).', 8, () => {
    const O = [170, 130], r = 100, A = pt(...O, r, 230), B = pt(...O, r, 310);
    let s = Ci(...O, r, { f: 'none', s: C.k, w: 2.5, c: 'draw', d: .1, t: .8 }) + P(arcD(...O, r, 230, 310), { s: C.o, w: 6, d: .8 }) +
      T(A[0] - 14, A[1] + 10, 'A', { z: 14, d: .8 }) + T(B[0] + 14, B[1] + 10, 'B', { z: 14, d: .8 }) +
      L(...O, ...A, { s: C.b, w: 2.5, d: 1.2 }) + L(...O, ...B, { s: C.b, w: 2.5, d: 1.2 }) +
      P(wedgeD(...O, 26, 230, 310), { f: C.b, s: 'none', op: .4, d: 1.6 }) + T(O[0], O[1] + 40, '80°', { z: 13, f: C.b, d: 1.7 }) + Ci(...O, 4, { f: C.k, d: .2 });
    [70, 130, 20].forEach((ang, i) => {
      const Pp = pt(...O, r, ang), d = 2.4 + i * 1.3, last = i === 2;
      const a1 = Math.atan2(-(A[1] - Pp[1]), A[0] - Pp[0]) * 180 / Math.PI, a2 = Math.atan2(-(B[1] - Pp[1]), B[0] - Pp[0]) * 180 / Math.PI;
      const o = last ? {} : { o: d + 1.2 };
      s += G(L(...Pp, ...A, { s: C.r, w: 2.5, c: '' }) + L(...Pp, ...B, { s: C.r, w: 2.5, c: '' }) + P(wedgeD(...Pp, 24, Math.min(a1, a2), Math.max(a1, a2)), { f: C.r, s: 'none', op: .4, c: '' }) +
        Ci(...Pp, 6, { f: C.r, c: '' }) + T(Pp[0] + (Pp[0] > O[0] ? 16 : -16), Pp[1] - 12, 'P', { z: 14, f: C.r, c: '' }), { c: 'fade', d, ...o });
    });
    return s + T(410, 60, '중심각 80°', { z: 18, f: C.b, d: 1.9 }) + T(410, 105, '원주각 40°', { z: 18, f: C.r, d: 2.8 }) +
      T(410, 160, '원주각 = 중심각 ÷ 2', { z: 16, d: 6.2, pulse: 1 });
  }),
  S('호가 반원이면 중심각이 180°이므로, <strong>지름을 바라보는 원주각은 항상 90°</strong>예요. 점 P가 어디에 있든 직각이에요.', 7, () => {
    const O = [180, 130], r = 100, A = [O[0] - r, O[1]], B = [O[0] + r, O[1]];
    let s = Ci(...O, r, { f: 'none', s: C.k, w: 2.5, c: 'draw', d: .1, t: .8 }) + L(...A, ...B, { s: C.b, w: 3.5, d: .8 }) + T(O[0], O[1] + 16, '지름', { z: 13, f: C.b, d: 1 });
    [120, 60, 155].forEach((ang, i) => {
      const Pp = pt(...O, r, ang), d = 1.6 + i * 1.4, last = i === 2;
      s += G(L(...Pp, ...A, { s: C.r, w: 2.5, c: '' }) + L(...Pp, ...B, { s: C.r, w: 2.5, c: '' }) + RA(Pp, [A[0] - Pp[0], A[1] - Pp[1]], [B[0] - Pp[0], B[1] - Pp[1]], 13, { c: '', s: C.r }) +
        Ci(...Pp, 6, { f: C.r, c: '' }), { c: 'fade', d, ...(last ? {} : { o: d + 1.2 }) });
    });
    return s + T(410, 90, '중심각 180°', { z: 17, f: C.b, d: 1 }) + T(410, 135, '→ 원주각 90°', { z: 20, f: C.r, d: 2.2, pulse: 1 });
  }),
  S('원 위의 한 점에서 원에 닿기만 하는 직선이 <strong>접선</strong>이에요. 접선은 그 점을 지나는 <strong>반지름과 항상 수직</strong>이에요.', 6.5, () => {
    const O = [180, 135], r = 95, Tt = pt(...O, r, 40), tAng = 40 + 90;
    return Ci(...O, r, { f: '#f7f9ff', s: C.k, w: 2.5, d: .1 }) + Ci(...O, 4, { f: C.k, d: .2 }) + T(O[0] - 14, O[1] + 12, 'O', { z: 14, d: .2 }) +
      L(...O, ...Tt, { s: C.b, w: 3, d: .6 }) + T((O[0] + Tt[0]) / 2 - 12, (O[1] + Tt[1]) / 2 - 10, 'r', { z: 15, f: C.b, d: .8 }) +
      G(L(...pt(...Tt, -140, tAng), ...pt(...Tt, 140, tAng), { s: C.r, w: 3.5, c: '' }), { c: 'mv', ox: Tt[0], oy: Tt[1], fr: 40, tr: 0, d: 1.3, t: 1.5 }) +
      Ci(...Tt, 6, { f: C.r, d: 1.2 }) +
      RA(Tt, [O[0] - Tt[0], O[1] - Tt[1]], pt(0, 0, 1, tAng), 13, { d: 3 }) +
      T(420, 90, '접선 ⊥ 반지름', { z: 20, f: C.r, d: 3.3, pulse: 1 });
  })
];

/* ───────── 중3-2 산포도 (자료 2, 5, 6, 7, 10 / 평균 6) ───────── */
M.dispersion = (() => {
  const data = [2, 5, 6, 7, 10];
  return [
    S('자료 2, 5, 6, 7, 10의 평균은 6이에요. 평균은 수직선의 <strong>균형점</strong>이고, 각 자료 − 평균 = <strong>편차</strong>. 왼쪽과 오른쪽 편차가 상쇄되어 합은 항상 0이에요.', 7.5, () => {
      const n = nline(40, 480, 200, 0, 12, { d: .1, z: 11 });
      let s = n.s;
      data.forEach((v, i) => { s += Ci(n.X(v), 186, 9, { f: C.b, d: .3 + i * .15 }); });
      s += P(`M${n.X(6)} 212l-12 22h24z`, { f: C.o, s: C.o, d: 1.3 }) + T(n.X(6), 246, '평균 6', { z: 13, f: C.o, d: 1.4 });
      data.forEach((v, i) => {
        const y = 60 + i * 24, dv = v - 6, col = dv < 0 ? C.r : dv > 0 ? C.g : C.m, d = 2 + i * .4;
        if (dv) s += L(n.X(6), y, n.X(v), y, { s: col, w: 4, d, t: .4 }) + Ci(n.X(v), y, 4, { f: col, d: d + .3 });
        s += T(dv < 0 ? n.X(v) - 26 : n.X(Math.max(v, 6)) + 26, y, dv > 0 ? '+' + dv : dv < 0 ? '−' + (-dv) : '0', { z: 14, f: col, d: d + .2 });
      });
      s += L(n.X(6), 44, n.X(6), 176, { s: C.o, w: 1.5, dash: '4 3', d: 1.8 }) +
        T(260, 24, '(−4) + (−1) + 0 + 1 + 4 = 0', { z: 16, d: 4.4, pulse: 1 });
      return s;
    }),
    S('편차의 합은 항상 0이라 퍼진 정도를 알 수 없어요. 그래서 편차를 <strong>제곱(정사각형 넓이)</strong>해 평균 낸 것이 <strong>분산</strong>, 그 제곱근이 <strong>표준편차</strong>예요.', 8, () => {
      let s = '', x = 40;
      const k = 13;
      data.forEach((v, i) => {
        const dv = Math.abs(v - 6), side = Math.max(dv * k, 2), col = v < 6 ? C.r : v > 6 ? C.g : C.m;
        s += R(x, 150 - side, side, side, { f: col, s: col, op: .3, w: 1.5, c: 'pop', d: .4 + i * .4 }) +
          T(x + Math.max(side, 10) / 2, 170, `${dv * dv}`, { z: 15, f: col, d: .6 + i * .4 }) + T(x + Math.max(side, 10) / 2, 192, `(${v - 6 < 0 ? '−' : ''}${dv})²`, { z: 11, f: C.m, d: .6 + i * .4 });
        x += Math.max(side, 12) + 22;
      });
      return s + eqs([['분산 = (16 + 1 + 0 + 1 + 16) ÷ 5'], ['= 34 ÷ 5 = 6.8', '', C.b], ['표준편차 = √6.8 ≈ 2.6', '', C.p]], { x: 390, y: 70, dy: 46, d: 2.6, gap: 1, z: 16 });
    }),
    S('평균이 같아도 퍼진 정도는 다를 수 있어요. 자료가 평균 가까이 모이면 표준편차가 작고, 멀리 흩어지면 커요.', 6.5, () => {
      const a = nline(60, 460, 90, 0, 12, { d: .1, z: 10 }), b = nline(60, 460, 200, 0, 12, { d: .1, z: 10 });
      let s = a.s + b.s + T(40, 60, 'A', { z: 18, f: C.b, d: .2 }) + T(40, 170, 'B', { z: 18, f: C.r, d: .2 });
      [5, 6, 6, 6, 7].forEach((v, i) => { s += Ci(a.X(v), 76 - (v === 6 ? (i - 1) * 14 : 0), 7, { f: C.b, d: .5 + i * .12 }); });
      [1, 3, 6, 9, 11].forEach((v, i) => { s += Ci(b.X(v), 186, 7, { f: C.r, d: 1.4 + i * .12 }); });
      s += P(`M${a.X(5)} 40V34H${a.X(7)}V40`, { s: C.b, w: 2, d: 2.4 }) + T(a.X(9.3), 34, '좁게 모임 → 표준편차 작음', { z: 13, f: C.b, d: 2.6 }) +
        P(`M${b.X(1)} 160V154H${b.X(11)}V160`, { s: C.r, w: 2, d: 3.2 }) + T(b.X(6), 140, '넓게 퍼짐 → 표준편차 큼', { z: 13, f: C.r, d: 3.4 }) +
        T(a.X(6), 118, '평균 6', { z: 11, f: C.o, d: 1 }) + T(b.X(6), 228, '평균 6', { z: 11, f: C.o, d: 1.8 });
      return s;
    })
  ];
})();

/* ───────── 중3-2 상자그림 ───────── */
M.boxplot = (() => {
  const data = [2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 16];
  const X = v => 50 + v * 25;
  return [
    S('자료 11개를 크기순으로 놓고 <strong>한가운데 값(중앙값 8)</strong>을 찾아요. 아래쪽 절반의 가운데가 <strong>Q1 = 5</strong>, 위쪽 절반의 가운데가 <strong>Q3 = 12</strong>예요.', 7, () => {
      const n = nline(X(0), X(17), 200, 0, 17, { d: .1, z: 10, step: 1 });
      let s = n.s;
      data.forEach((v, i) => {
        const col = v === 8 ? C.o : (v === 5 || v === 12) ? C.g : C.b;
        s += Ci(X(v), 182, 8, { f: C.b, d: .3 + i * .1 });
        if (col !== C.b) s += Ci(X(v), 182, 8, { f: col, d: v === 8 ? 1.8 : 3, pulse: 1 });
      });
      s += T(X(8), 150, '중앙값 8', { z: 15, f: C.o, d: 2 }) +
        P(`M${X(2)} 130V124H${X(7)}V130`, { s: C.g, w: 2, d: 2.6 }) + P(`M${X(9)} 130V124H${X(16)}V130`, { s: C.g, w: 2, d: 2.6 }) +
        T(X(4.5), 108, '아래 절반', { z: 12, f: C.m, d: 2.7 }) + T(X(12.5), 108, '위 절반', { z: 12, f: C.m, d: 2.7 }) +
        T(X(5), 150, 'Q1 = 5', { z: 14, f: C.g, d: 3.2 }) + T(X(12), 150, 'Q3 = 12', { z: 14, f: C.g, d: 3.2 });
      return s;
    }),
    S('다섯 값(최솟값 2, Q1, 중앙값, Q3, 최댓값 16)으로 <strong>상자그림</strong>을 그려요. 상자 안에 가운데 50%의 자료가 들어 있고, 상자 길이 Q3 − Q1 = 7 이 <strong>사분위범위</strong>예요.', 7.5, () => {
      const n = nline(X(0), X(17), 210, 0, 17, { d: .1, z: 10 });
      let s = n.s;
      data.forEach(v => { s += Ci(X(v), 192, 6, { f: C.b, op: .5, d: .2 }); });
      [2, 5, 8, 12, 16].forEach((v, i) => { s += L(X(v), 186, X(v), 135, { s: C.m, w: 1.2, dash: '3 3', d: .6 + i * .15 }); });
      s += R(X(5), 80, X(12) - X(5), 60, { f: C.bl, s: C.b, w: 2.5, c: 'gx', d: 1.6, t: .8 }) +
        L(X(8), 80, X(8), 140, { s: C.o, w: 4, d: 2.5, t: .3 }) +
        L(X(5), 110, X(2), 110, { s: C.k, w: 2.5, d: 2.9, t: .5 }) + L(X(12), 110, X(16), 110, { s: C.k, w: 2.5, d: 2.9, t: .5 }) +
        L(X(2), 98, X(2), 122, { s: C.k, w: 2.5, d: 3.3, t: .2 }) + L(X(16), 98, X(16), 122, { s: C.k, w: 2.5, d: 3.3, t: .2 }) +
        P(`M${X(5)} 70V62H${X(12)}V70`, { s: C.p, w: 2, d: 3.8 }) + T(X(8.5), 44, '사분위범위 = 12 − 5 = 7', { z: 15, f: C.p, d: 4 }) +
        T(X(2), 152, '최솟값', { z: 11, f: C.m, d: 3.4 }) + T(X(16), 152, '최댓값', { z: 11, f: C.m, d: 3.4 });
      return s;
    }),
    S('두 반의 상자그림을 겹쳐 보면 한눈에 비교돼요. 중앙값이 어디 있는지, 상자가 얼마나 긴지(퍼진 정도)를 비교하세요.', 6.5, () => {
      const n = nline(X(0), X(17), 225, 0, 17, { d: .1, z: 10 });
      const bp = (y, mn, q1, md, q3, mx, col, lt, d, lab) =>
        L(X(mn), y, X(q1), y, { s: col, w: 2.5, d: d + .5 }) + L(X(q3), y, X(mx), y, { s: col, w: 2.5, d: d + .5 }) +
        R(X(q1), y - 22, X(q3) - X(q1), 44, { f: lt, s: col, w: 2.5, c: 'gx', d, t: .7 }) + L(X(md), y - 22, X(md), y + 22, { s: C.o, w: 4, d: d + .7, t: .3 }) +
        T(25, y, lab, { z: 15, f: col, d });
      return n.s + bp(70, 2, 5, 8, 12, 16, C.b, C.bl, .3, '1반') + bp(160, 6, 8, 10, 11, 14, C.g, C.gl, 1.6, '2반') +
        T(X(13.5), 120, '2반: 중앙값↑, 상자 짧음 → 고르게 모임', { z: 13, d: 3, f: C.k });
    })
  ];
})();

/* ───────── 중3-2 산점도와 상관관계 ───────── */
const scatterScene = (cap, pts, line, lx, ly, verdict, col) => S(cap, 6.5, () => {
  const a = axes(60, 220, 1, { x0: 0, x1: 300, y0: 0, y1: 190, grid: false, lx, ly });
  let s = a.s;
  pts.forEach(([x, y], i) => { s += Ci(60 + x, 220 - y, 6, { f: col, d: .3 + i * .1 }); });
  if (line) s += L(60 + line[0], 220 - line[1], 60 + line[2], 220 - line[3], { s: C.o, w: 2.5, dash: '7 5', d: .5 + pts.length * .1 });
  return s + T(430, 110, verdict, { z: 20, f: col, d: 1 + pts.length * .1, pulse: 1 });
});
M.scatter = [
  scatterScene('키(x)가 클수록 몸무게(y)도 대체로 큰 경향이 있어요. 점들이 <strong>오른쪽 위로</strong> 모이면 <strong>양의 상관관계</strong>예요.',
    [[20, 30], [40, 52], [55, 40], [70, 75], [90, 70], [110, 95], [125, 88], [140, 120], [160, 115], [180, 140], [200, 150], [215, 138], [240, 170], [260, 165]],
    [10, 25, 280, 180], '키', '몸무게', '양의 상관관계', C.b),
  scatterScene('기온(x)이 높을수록 난방비(y)는 대체로 줄어요. 점들이 <strong>오른쪽 아래로</strong> 모이면 <strong>음의 상관관계</strong>예요.',
    [[20, 170], [40, 160], [55, 165], [75, 135], [90, 140], [110, 115], [130, 110], [150, 85], [165, 90], [185, 70], [205, 60], [225, 50], [245, 35], [265, 30]],
    [10, 180, 280, 20], '기온', '난방비', '음의 상관관계', C.r),
  scatterScene('키와 수학 점수처럼 점들이 <strong>고르게 흩어져</strong> 있으면 상관관계가 없어요. 또, 상관관계가 있어도 <strong>원인과 결과라는 뜻은 아니에요.</strong>',
    [[20, 120], [35, 40], [60, 160], [70, 80], [95, 30], [110, 140], [130, 70], [150, 170], [165, 110], [185, 45], [200, 150], [220, 90], [245, 130], [265, 60]],
    null, '키', '수학 점수', '상관관계 없음', C.m)
];

}
export const SCENES = M;
