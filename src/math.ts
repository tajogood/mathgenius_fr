import { EXTRA_TOPICS, createExpandedProblem, type ExtraTopic } from './expandedMath.ts';

export const BASE_TOPICS = [
  'split', 'addsub', 'shapes',
  'carry', 'multiply', 'clock',
  'divide', 'fractionintro', 'lengthtime',
  'angles', 'transform', 'decimaladd',
  'fraction', 'reduce', 'area',
  'ratio', 'proportion', 'volume',
] as const;
export const TOPICS = [...BASE_TOPICS, ...EXTRA_TOPICS] as const;

export type Topic = (typeof TOPICS)[number];

export type Problem = {
  topic: Topic;
  a: number;
  b: number;
  c?: number;
  d?: number;
  mode?: string;
  prompt: string;
  answer: string;
  choices: string[];
  steps?: [string, string, string];
};

export function gcd(a: number, b: number): number {
  let x = Math.abs(a), y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
}
export const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
export const fractionText = (n: number, d: number) => {
  const factor = gcd(n, d);
  return String(n / factor) + '/' + String(d / factor);
};
export const percentage = (a: number, total: number) => {
  const value = (a / total) * 100;
  return (Number.isInteger(value) ? String(value) : value.toFixed(1)) + '%';
};

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/** 한 문제의 네 보기에는 정답이 반드시 한 번만 나옵니다. */
export function makeChoices(correct: string, distractors: string[]): string[] {
  const distinct = [...new Set([correct, ...distractors.filter(x => x !== correct)])];
  if (distinct.length < 4) throw new Error('보기 4개를 구성할 수 없습니다: ' + correct);
  return shuffle(distinct.slice(0, 4));
}
const numericChoices = (correct: number, unit = '', increments = [-1, 1, -2, 2, 3, -3, 10, -10]) =>
  makeChoices(String(correct) + unit, increments.map(delta => correct + delta).filter(x => x >= 0).map(x => String(x) + unit));
const decChoices = (correct: number) => makeChoices(correct.toFixed(1),
  [0.1, -0.1, 1, -1, 0.2, -0.2].map(n => (correct + n).toFixed(1)).filter(v => Number(v) >= 0));
const fCandidates = (n: number, d: number, correct: string) => {
  const attempts = [
    fractionText(n + 1, d), fractionText(Math.max(1, n - 1), d),
    fractionText(n, d + 1), fractionText(n + 2, d),
    fractionText(n + 3, d), fractionText(n, d + 2),
    fractionText(n + 4, d), fractionText(n + 5, d),
  ];
  return makeChoices(correct, attempts);
};
const fractionSamples: ReadonlyArray<readonly [number, number, number, number]> = [
  [1, 2, 1, 4], [1, 3, 1, 6], [1, 2, 1, 6],
  [1, 4, 1, 2], [1, 3, 1, 3], [1, 4, 1, 8],
  [3, 8, 1, 4], [1, 6, 1, 3], [1, 8, 3, 8],
];
const reduceSamples: ReadonlyArray<readonly [number, number]> = [
  [2, 4], [3, 6], [4, 6], [6, 8], [6, 9], [8, 12], [9, 12], [10, 15],
];
const ratioSamples: ReadonlyArray<readonly [number, number]> = [
  [2, 3], [3, 2], [1, 4], [4, 1], [1, 3],
  [3, 1], [2, 6], [3, 5], [1, 7], [5, 3],
];
const shapeNames = ['원', '세모', '네모', '직사각형'] as const;
const moveNames = ['밀기', '뒤집기', '돌리기', '크기 늘리기'] as const;
const clockText = (h: number, m: number) => String(h) + '시' + (m ? ' ' + String(m) + '분' : '');

export function createProblem(topic: Topic): Problem {
  switch (topic) {
    case 'split': {
      const a = rand(5, 9), b = rand(1, a - 1), answer = a - b;
      return { topic, a, b, prompt: a + '는 ' + b + '와 몇으로 가를 수 있을까요?',
        answer: String(answer), choices: numericChoices(answer) };
    }
    case 'addsub': {
      const a = rand(4, 9), b = rand(1, Math.min(5, a)), subtract = Math.random() > 0.5;
      const result = subtract ? a - b : a + b;
      return { topic, a, b, mode: subtract ? 'subtract' : 'add', prompt: a + (subtract ? ' − ' : ' + ') + b + ' = ?',
        answer: String(result), choices: numericChoices(result) };
    }
    case 'shapes': {
      const a = rand(0, 3);
      return { topic, a, b: 0, prompt: '그림에 보이는 모양의 이름은 무엇인가요?',
        answer: shapeNames[a], choices: makeChoices(shapeNames[a], shapeNames.filter((_, i) => i !== a)) };
    }
    case 'carry': {
      const a = rand(6, 9), need = 10 - a, b = rand(need + 1, 9), result = a + b;
      return { topic, a, b, prompt: a + ' + ' + b + ' = ?',
        answer: String(result), choices: numericChoices(result) };
    }
    case 'multiply': {
      const a = rand(2, 9), b = rand(2, 9), result = a * b;
      return { topic, a, b, prompt: a + ' × ' + b + ' = ?', answer: String(result),
        choices: makeChoices(String(result), [String(result + a), String(Math.max(1, result - a)),
          String(result + b), String(Math.max(1, result - b)), String(result + 1), String(result - 1)]) };
    }
    case 'clock': {
      const a = rand(1, 12), b = pick([0, 15, 30, 45] as const);
      const answer = clockText(a, b);
      return { topic, a, b, prompt: '시계가 가리키는 시각을 골라 보세요.',
        answer, choices: makeChoices(answer, [
          clockText(a === 12 ? 1 : a + 1, b),
          clockText(a === 1 ? 12 : a - 1, b),
          clockText(a, (b + 15) % 60),
          clockText(a, (b + 30) % 60),
        ]) };
    }
    case 'divide': {
      const a = rand(2, 5), b = rand(2, 5);
      return { topic, a, b, prompt: a * b + '개를 ' + a + '명에게 똑같이 나누면 한 명당 몇 개일까요?',
        answer: String(b), choices: numericChoices(b) };
    }
    case 'fractionintro': {
      const b = pick([4, 5, 6, 8] as const), a = rand(1, b - 1), correct = fractionText(a, b);
      return { topic, a, b, prompt: '색칠한 부분을 분수로 나타내면?',
        answer: correct, choices: fCandidates(a, b, correct) };
    }
    case 'lengthtime': {
      const a = rand(2, 5), length = Math.random() > 0.5, b = length ? rand(1, 9) * 10 : 0;
      const result = length ? a * 100 + b : a * 60;
      return { topic, a, b, mode: length ? 'length' : 'time',
        prompt: length ? a + 'm ' + b + 'cm는 모두 몇 cm일까요?' : a + '분은 모두 몇 초일까요?',
        answer: String(result) + (length ? 'cm' : '초'),
        choices: numericChoices(result, length ? 'cm' : '초', [-10,10,-100,100,-20,20]) };
    }
    case 'angles': {
      const a = pick([30, 45, 60, 90, 120, 135] as const);
      return { topic, a, b: 0, prompt: '표시된 각의 크기는 몇 도일까요?',
        answer: a + '°', choices: makeChoices(a + '°', [a - 15, a + 15, a - 30, a + 30, a + 45, 180 - a]
          .filter(n => n > 0 && n < 180 && n !== a).map(n => n + '°')) };
    }
    case 'transform': {
      const a = rand(0, 2);
      return { topic, a, b: 0, prompt: '도형이 어떻게 움직였나요?',
        answer: moveNames[a], choices: makeChoices(moveNames[a], moveNames.filter((_, i) => i !== a)) };
    }
    case 'decimaladd': {
      const a = rand(4, 18), b = rand(2, 9), result = (a + b) / 10;
      return { topic, a, b, prompt: (a / 10).toFixed(1) + ' + ' + (b / 10).toFixed(1) + ' = ?',
        answer: result.toFixed(1), choices: decChoices(result) };
    }
    case 'fraction': {
      const [a, b, c, d] = pick(fractionSamples);
      const common = lcm(b, d), n = a * (common / b) + c * (common / d);
      const answer = fractionText(n, common);
      return { topic, a, b, c, d, prompt: a + '/' + b + ' + ' + c + '/' + d + ' = ?',
        answer, choices: fCandidates(n, common, answer) };
    }
    case 'reduce': {
      const [a, b] = pick(reduceSamples), answer = fractionText(a, b);
      return { topic, a, b, prompt: a + '/' + b + '을 가장 간단한 분수로 나타내면?',
        answer, choices: fCandidates(a / gcd(a, b), b / gcd(a, b), answer) };
    }
    case 'area': {
      const a = rand(3, 8), b = rand(2, 6), total = a * b;
      return { topic, a, b, prompt: '가로 ' + a + 'cm, 세로 ' + b + 'cm인 직사각형의 넓이는?',
        answer: total + 'cm²', choices: numericChoices(total, 'cm²') };
    }
    case 'ratio': {
      const [a, b] = pick(ratioSamples), correct = percentage(a, a + b);
      const value = 100 * a / (a + b);
      const candidates = [-20, -10, -5, 5, 10, 20, 25, -25]
        .map(delta => value + delta).filter(x => x > 0 && x < 100)
        .map(x => (Number.isInteger(x) ? String(x) : x.toFixed(1)) + '%');
      return { topic, a, b, prompt: '파란 구슬은 전체의 몇 %일까요?',
        answer: correct, choices: makeChoices(correct, candidates) };
    }
    case 'proportion': {
      const a = rand(2, 5), b = rand(a + 1, a + 4), c = rand(2, 4), answer = b * c;
      return { topic, a, b, c, prompt: a + ' : ' + b + ' = ' + a * c + ' : ?',
        answer: String(answer), choices: numericChoices(answer) };
    }
    case 'volume': {
      const a = rand(2, 5), b = rand(2, 4), c = rand(2, 4), total = a * b * c;
      return { topic, a, b, c, prompt: '가로 ' + a + 'cm, 세로 ' + b + 'cm, 높이 ' + c + 'cm인 직육면체의 부피는?',
        answer: total + 'cm³', choices: numericChoices(total, 'cm³') };
    }
  }
  return createExpandedProblem(topic as ExtraTopic);
}

export function solutionSteps(p: Problem): string[] {
  if (p.steps) return p.steps;
  const { a, b, c, d } = p;
  switch (p.topic) {
    case 'split':
      return [a + '개를 두 묶음으로 가를 거예요.', '한 묶음에 ' + b + '개를 넣었으니 나머지는 ' + a + ' − ' + b + '개예요.',
        a + ' = ' + b + ' + ' + p.answer + '이므로 정답은 ' + p.answer + '이에요.'];
    case 'addsub':
      return p.mode === 'subtract'
        ? [a + '개에서 ' + b + '개를 빼 볼게요.', '남은 개수를 세려면 ' + a + ' − ' + b + '를 계산해요.',
          a + ' − ' + b + ' = ' + p.answer + '이에요.']
        : [a + '개와 ' + b + '개를 모아 볼게요.', '두 묶음을 합쳐서 전체 개수를 세어요.',
          a + ' + ' + b + ' = ' + p.answer + '이에요.'];
    case 'shapes': return [
      '도형의 가장자리와 꼭짓점을 살펴봐요.',
      p.answer === '원' ? '둥글고 꼭짓점이 없어요.' : p.answer === '세모' ? '곧은 변이 3개, 꼭짓점이 3개예요.'
        : p.answer === '네모' ? '네 변의 길이가 같은 사각형이에요.' : '마주 보는 변의 길이가 같은 사각형이에요.',
      '그래서 이 도형의 이름은 ' + p.answer + '이에요.'];
    case 'carry': {
      const need = 10 - a;
      return [a + ' + ' + b + '에서 10개 묶음을 만들어요.',
        b + '개 중 ' + need + '개를 옮기면 ' + a + ' + ' + need + ' = 10이에요.',
        '남은 ' + (b - need) + '개를 더해 10 + ' + (b - need) + ' = ' + p.answer + '이에요.'];
    }
    case 'multiply': return [
      '한 묶음에 ' + b + '개씩, ' + a + '묶음을 만들어요.',
      b + '을 ' + a + '번 더하는 것과 같아요.',
      a + ' × ' + b + ' = ' + p.answer + '이에요.'];
    case 'clock': return [
      '짧은 바늘은 시, 긴 바늘은 분을 가리켜요.',
      '긴 바늘은 12에서 시계 방향으로 1칸(숫자 하나)마다 5분씩 움직여요. 지금은 ' + b + '분이에요.',
      '짧은 바늘이 ' + a + '시를 지나므로 시각은 ' + p.answer + '이에요.'];
    case 'divide': return [
      a * b + '개를 ' + a + '명에게 똑같이 나눠 줄 거예요.',
      '하나씩 나누면 ' + a + '명 모두 같은 수를 받게 돼요.',
      a * b + ' ÷ ' + a + ' = ' + p.answer + '이므로 한 명당 ' + p.answer + '개예요.'];
    case 'fractionintro': return [
      '하나의 전체를 똑같이 ' + b + '칸으로 나누었어요.',
      '그 가운데 ' + a + '칸에 색을 칠했어요.',
      '전체 ' + b + '칸 중 ' + a + '칸이므로 ' + p.answer + '이에요.'];
    case 'lengthtime': return p.mode === 'length'
      ? ['1m는 100cm예요.', a + 'm는 ' + a * 100 + 'cm이고 여기에 ' + b + 'cm를 더해요.',
        a * 100 + ' + ' + b + ' = ' + p.answer + '예요.']
      : ['1분은 60초예요.', a + '분은 60초가 ' + a + '번 있는 거예요.',
        '60 × ' + a + ' = ' + p.answer + '예요.'];
    case 'angles': return [
      '각은 같은 꼭짓점에서 뻗은 두 반직선 사이의 벌어진 크기예요.',
      '기준선에서 반시계 방향으로 얼마나 돌아갔는지 각도기를 생각해 봐요.',
      '두 선 사이의 각은 ' + p.answer + '예요.'];
    case 'transform': return [
      '처음 도형(연한 색)과 움직인 도형(진한 색)을 비교해요.',
      p.answer === '밀기' ? '방향과 모양을 그대로 둔 채 위치만 바뀌었어요.'
        : p.answer === '뒤집기' ? '거울에 비춘 것처럼 왼쪽과 오른쪽이 바뀌었어요.'
        : '한 점을 중심으로 도형의 방향이 바뀌었어요.',
      '이와 같은 움직임은 ' + p.answer + '예요.'];
    case 'decimaladd': return [
      '소수점을 세로로 맞춰 더해요.',
      (a / 10).toFixed(1) + '은 ' + a + '개의 0.1, ' + (b / 10).toFixed(1) + '은 ' + b + '개의 0.1이에요.',
      '0.1이 ' + (a + b) + '개니까 합은 ' + p.answer + '이에요.'];
    case 'fraction': {
      const common = lcm(b, d!);
      const n1 = a * (common / b), n2 = c! * (common / d!);
      const sum = n1 + n2, g = gcd(sum, common);
      return ['조각 크기가 달라서 같은 크기로 바꿔요: ' + a + '/' + b + ' = ' + n1 + '/' + common + ', ' + c + '/' + d + ' = ' + n2 + '/' + common + ' (통분)',
        n1 + '/' + common + ' + ' + n2 + '/' + common + ' = ' + sum + '/' + common + ' : 분자끼리 더해요.',
        g > 1 ? sum + '/' + common + '의 분자와 분모를 ' + g + '로 나누면(약분) ' + p.answer + ' — 크기는 그대로예요. 답은 ' + p.answer + '이에요.'
          : sum + '/' + common + '은 더 간단히 할 수 없어요. 답은 ' + p.answer + '이에요.'];
    }
    case 'reduce': {
      const factor = gcd(a, b);
      return [a + '/' + b + '의 분자와 분모에 모두 나누어지는 수를 찾아요.',
        a + '와 ' + b + '는 둘 다 ' + factor + '로 나눌 수 있어요.',
        '분자와 분모를 각각 ' + factor + '로 나누면 ' + p.answer + '이에요.'];
    }
    case 'area': return [
      '가로 ' + a + '칸, 세로 ' + b + '칸의 직사각형이에요.',
      '1cm² 정사각형이 ' + a + ' × ' + b + '개 들어가요.',
      '넓이 = 가로 × 세로 = ' + p.answer + '예요.'];
    case 'ratio': return [
      '파란 구슬 ' + a + '개와 주황 구슬 ' + b + '개, 전체는 ' + (a + b) + '개예요.',
      '파란 구슬의 비율은 ' + a + ' ÷ ' + (a + b) + '예요.',
      '그 비율에 100을 곱하면 ' + p.answer + '예요.'];
    case 'proportion': return [
      a + ':' + b + '와 ' + (a * c!) + ':? 는 같은 비를 나타내요.',
      '앞의 항을 ' + c + '배 했으니 뒤의 항도 ' + c + '배 해야 해요.',
      b + ' × ' + c + ' = ' + p.answer + '이에요.'];
    case 'volume': return [
      '직육면체의 가로, 세로, 높이를 차례로 확인해요.',
      '밑면에 1cm³ 정육면체가 ' + a + ' × ' + b + '개, 그런 층이 ' + c + '개예요.',
      '부피 = 가로 × 세로 × 높이 = ' + p.answer + '예요.'];
  }
  return ['문제를 읽고 주어진 조건을 찾습니다.', '그림과 수를 대응시켜 계산합니다.', '답을 검산합니다.'];
}
