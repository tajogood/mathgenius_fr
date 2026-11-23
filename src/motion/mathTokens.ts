/** 문장 속 분수 표기(2/3, 높이/빗변, 2/(2+3), 1/√3, ⅙ …)를 찾아 분자·분모로 나눈다.
 *  애니메이션 그림(SVG)과 설명 문장(HTML) 모두 분수를 위아래로 쌓아 보여 주기 위해 사용한다. */
export type MathToken = { t: 'text'; s: string } | { t: 'frac'; n: string; d: string };

const OPERAND = String.raw`\([^()]*\)|√?\d+(?:\.\d+)?|[A-Za-z]|[가-힣]+`;
const SLASH = new RegExp(`(${OPERAND})\\s*\\/\\s*(${OPERAND})`, 'g');
const VULGAR: Record<string, [string, string]> = {
  '½': ['1', '2'], '⅓': ['1', '3'], '⅔': ['2', '3'], '¼': ['1', '4'], '¾': ['3', '4'], '⅕': ['1', '5'], '⅖': ['2', '5'],
  '⅗': ['3', '5'], '⅘': ['4', '5'], '⅙': ['1', '6'], '⅚': ['5', '6'], '⅛': ['1', '8'], '⅜': ['3', '8'], '⅝': ['5', '8'], '⅞': ['7', '8'],
};
const VULGAR_RE = new RegExp(`[${Object.keys(VULGAR).join('')}]`, 'g');
// (2+3) 처럼 괄호로 묶인 분자·분모는 쌓아 쓰면 괄호가 필요 없다
const unwrap = (s: string) => /^\(.*\)$/.test(s) ? s.slice(1, -1) : s;

export function mathTokens(text: string): MathToken[] {
  const out: MathToken[] = [];
  const pushText = (s: string) => {
    let last = 0;
    for (const m of s.matchAll(VULGAR_RE)) {
      if (m.index! > last) out.push({ t: 'text', s: s.slice(last, m.index) });
      const [n, d] = VULGAR[m[0]];
      out.push({ t: 'frac', n, d });
      last = m.index! + m[0].length;
    }
    if (last < s.length) out.push({ t: 'text', s: s.slice(last) });
  };
  let last = 0;
  for (const m of text.matchAll(SLASH)) {
    // 한글 낱말 분수(높이/빗변)는 붙여 쓴 경우만 — "자료를 / 표시로" 같은 문장 속 빗금은 그대로 둔다
    if (/[가-힣]/.test(m[1] + m[2]) && /\s\/|\/\s/.test(m[0])) continue;
    if (m.index! > last) pushText(text.slice(last, m.index));
    out.push({ t: 'frac', n: unwrap(m[1]), d: unwrap(m[2]) });
    last = m.index! + m[0].length;
  }
  if (last < text.length) pushText(text.slice(last));
  return out;
}
export const hasFraction = (text: string) => mathTokens(text).some(t => t.t === 'frac');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** HTML 문장(태그 포함)의 분수를 사이트 공통 .math-fraction 마크업으로 바꾼다 */
export function fractionHtml(html: string): string {
  return html.split(/(<[^>]+>)/).map(part => part.startsWith('<') ? part :
    mathTokens(part.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')).map(tok => tok.t === 'text' ? esc(tok.s) :
      `<span class="math-fraction" role="math" aria-label="${esc(tok.d)}분의 ${esc(tok.n)}"><span class="math-fraction__top" aria-hidden="true">${esc(tok.n)}</span>` +
      `<span class="math-fraction__bar" aria-hidden="true"></span><span class="math-fraction__bottom" aria-hidden="true">${esc(tok.d)}</span></span>`).join('')).join('');
}

/** SVG 글자 폭 어림 (글꼴 크기 z 기준) */
export function textWidth(s: string, z: number, mono = false): number {
  let w = 0;
  for (const ch of s) {
    if (mono) { w += .6 * z; continue; }
    if (/[가-힣]/.test(ch)) w += .95 * z;
    else if (/\s/.test(ch)) w += .28 * z;
    else if (/[0-9]/.test(ch)) w += .58 * z;
    else if (/[A-Z]/.test(ch)) w += .66 * z;
    else if (/[a-z]/.test(ch)) w += .54 * z;
    else if (/[.,:;'!|]/.test(ch)) w += .3 * z;
    else if (/[()[\]]/.test(ch)) w += .36 * z;
    else if (/[²³¹⁰-⁹]/.test(ch)) w += .38 * z;
    else if (/[…]/.test(ch)) w += 1 * z;
    else if (/[\u{1F000}-\u{1FFFF}☀-➿]/u.test(ch)) w += 1.1 * z;
    else w += .64 * z;
  }
  return w;
}
