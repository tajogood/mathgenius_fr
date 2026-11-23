import { TOPICS, type Topic } from './math.ts';

/**
 * 2022 revised elementary mathematics, organized by grade and semester.
 * This is a textbook-style chapter plan, not a claim of 121/121 achievement-standard mastery.
 * Source: MOE 2022-33 annex 8 + crosschecked grade/semester chapter index.
 */
export type Chapter = {
  id: string;
  grade: number;
  semester: 1 | 2;
  number: number;
  title: string;
  topic: Topic;
  topics: Topic[];
  label: '수와 연산' | '변화와 관계' | '도형과 측정' | '자료와 가능성';
  subtitle: string;
  tag: string;
  concept: [string,string,string];
};
export type Grade = { grade: number; title: string; chapters: Chapter[] };

const COURSE: Record<number, Record<1 | 2, string[]>> = {
  1: {
    1: [
      '9까지의 수|count9,split|9까지의 수를 읽고 블록을 세어 봐요.',
      '여러 가지 모양|shapes3d|주변의 물건을 모양에 따라 구별해요.',
      '덧셈과 뺄셈|addsub,split|수를 모으고 가르면서 덧셈과 뺄셈을 이해해요.',
      '비교하기|compare|어느 쪽이 더 큰 수인지 블록으로 비교해요.',
      '50까지의 수|count50|10개 묶음으로 50까지 수를 세어 봐요.',
    ],
    2: [
      '100까지의 수|count100|10개 묶음으로 두 자리 수를 알아봐요.',
      '덧셈과 뺄셈(1)|addsub|하나씩 더하고 빼는 방법을 연습해요.',
      '여러 가지 모양|shapes|원·세모·네모의 특징을 비교해요.',
      '덧셈과 뺄셈(2)|addsub,split|계산식을 블록으로 나타내 봐요.',
      '시계 보기와 규칙 찾기|clock,patterns|시계를 읽고 수의 규칙을 찾아요.',
      '덧셈과 뺄셈(3)|carry,addsub|10을 만들어 덧셈을 더 쉽게 해요.',
    ],
  },
  2: {
    1: [
      '세 자리 수|place3|백·십·일의 자리에서 숫자가 뜻하는 값을 알아봐요.',
      '여러 가지 도형|shapes,lines|도형의 모습과 선의 특징을 살펴봐요.',
      '덧셈과 뺄셈|carry,addsub|자릿값과 받아올림으로 계산해요.',
      '길이 재기|measurelength|1m와 1cm 관계를 눈금으로 이해해요.',
      '분류하기|classify|색과 모양 같은 기준으로 자료를 모아 봐요.',
      '곱셈|multiply|같은 수가 반복되는 상황을 곱셈으로 나타내요.',
    ],
    2: [
      '네 자리 수|place4|천·백·십·일의 자릿값을 읽어요.',
      '곱셈구구|multiply|묶음을 세어 곱셈구구를 이해해요.',
      '길이 재기|measurelength|m와 cm를 함께 사용해 길이를 나타내요.',
      '시각과 시간|clock,lengthtime|시침과 분침으로 시간을 읽어요.',
      '표와 그래프|datagraph|자료를 세어 표와 간단한 그래프로 나타내요.',
      '규칙 찾기|patterns|수와 도형에서 반복되는 규칙을 찾아요.',
    ],
  },
  3: {
    1: [
      '덧셈과 뺄셈|column3|세 자리 수를 자릿값에 맞춰 계산해요.',
      '평면도형|lines,shapes|직선·선분·반직선의 차이를 알아봐요.',
      '나눗셈|divide|똑같이 나누는 활동으로 몫을 구해요.',
      '곱셈|longmultiply|두 자리 수의 곱셈을 자릿값으로 이해해요.',
      '길이와 시간|lengthtime,timecalc,measurelength|길이와 시간의 단위를 바꿔 봐요.',
      '분수와 소수|fractionintro,decimalintro,decimalcompare|전체를 나눠 분수와 소수를 나타내요.',
    ],
    2: [
      '곱셈|longmultiply|몇십·몇백을 곱하는 방법을 탐구해요.',
      '나눗셈|divremainder,longdivide|나눗셈의 몫과 나머지를 이해해요.',
      '원|circle|원의 반지름과 지름을 비교해요.',
      '분수|fractionintro,fractiontypes|전체를 똑같이 나눈 크기를 분수로 써요.',
      '들이와 무게|measureweight,capacity|kg과 g, L과 mL의 관계를 살펴봐요.',
      '자료의 정리|organize|표와 그림그래프로 자료를 읽어요.',
    ],
  },
  4: {
    1: [
      '큰 수|bigplace|만·십만·백만 등 큰 수의 자릿값을 이해해요.',
      '각도|angles,anglesum|각의 벌어진 크기를 측정해요.',
      '곱셈과 나눗셈|longmultiply,longdivide|여러 자리 수의 곱셈과 나눗셈을 계산해요.',
      '평면도형의 이동|transform|도형의 밀기·뒤집기·돌리기를 비교해요.',
      '막대그래프|bargraph|막대의 길이로 자료의 크기를 읽어요.',
      '규칙 찾기|patterns|수의 변화 규칙을 식으로 표현해요.',
    ],
    2: [
      '분수의 덧셈과 뺄셈|samefraction|분모가 같은 분수를 더하고 빼요.',
      '삼각형|triangletypes|세 변과 각의 특징으로 삼각형을 분류해요.',
      '소수의 덧셈과 뺄셈|decimaladd,decimalsub|소수점을 맞춰 소수를 더하고 빼요.',
      '사각형|quadtypes|여러 사각형의 평행한 변과 각을 찾아요.',
      '꺾은선그래프|linegraph|자료의 변화량을 선으로 이어 읽어요.',
      '다각형|polygons|변과 꼭짓점의 수로 다각형을 구별해요.',
    ],
  },
  5: {
    1: [
      '자연수의 혼합 계산|mixedcalc|곱셈과 나눗셈을 먼저 계산하는 이유를 알아봐요.',
      '약수와 배수|factors,multiples,gcdlcm|나누어떨어지는 수와 수의 배수를 찾아요.',
      '규칙과 대응|correspond|서로 변하는 두 수의 대응 관계를 식으로 나타내요.',
      '약분과 통분|reduce,fractioncompare|크기가 같은 분수로 바꿔 계산을 준비해요.',
      '분수의 덧셈과 뺄셈|fraction,fractionsub,samefraction|분모를 같게 바꾸어 분수를 더하고 빼요.',
      '다각형의 둘레와 넓이|perimeter,area|경계의 길이와 내부의 넓이를 비교해요.',
    ],
    2: [
      '수의 범위와 어림하기|range,rounding,roundup,rounddown|이상·이하를 살펴보고 수를 어림해요.',
      '분수의 곱셈|fractionmul|분수끼리 곱할 때 부분의 부분을 구해요.',
      '합동과 대칭|symmetry|접거나 돌려 겹치는 도형을 찾아요.',
      '소수의 곱셈|decimalmul|소수의 자릿값을 생각하며 곱해요.',
      '직육면체|nets|직육면체의 면·모서리·꼭짓점과 전개도를 알아봐요.',
      '평균과 가능성|average,probability|평균을 구하고 사건이 일어날 가능성을 비교해요.',
    ],
  },
  6: {
    1: [
      '분수의 나눗셈|fractiondiv,naturalfraction|분수의 나눗셈을 곱셈으로 바꿔 계산해요.',
      '각기둥과 각뿔|polyhedra,pyramid|밑면과 옆면의 모습으로 각기둥과 각뿔을 비교해요.',
      '소수의 나눗셈|decimaldiv|자릿값을 이용하여 소수의 나눗셈을 이해해요.',
      '비와 비율|ratio|두 양의 크기를 비교하고 백분율로 나타내요.',
      '여러 가지 그래프|circlegraph,bandgraph,bargraph|띠그래프·원그래프가 나타내는 비율을 읽어요.',
      '직육면체의 부피와 겉넓이|volume,surface|쌓기나무의 개수와 모든 면의 넓이를 계산해요.',
    ],
    2: [
      '분수의 나눗셈|fractiondiv|나누는 분수를 뒤집어 곱하는 원리를 확인해요.',
      '소수의 나눗셈|decimaldiv|소수점 위치를 바르게 정해 몫을 구해요.',
      '공간과 입체|stacking,solidviews|쌓기나무를 위·앞·옆에서 보고 개수를 세어요.',
      '비례식과 비례배분|proportion,proportionshare|같은 비를 만들고 전체를 비율대로 나눠요.',
      '원의 넓이|circlearea,circumference,circle|원주율을 이용하여 원의 넓이를 구해요.',
      '원기둥, 원뿔, 구|curvedsolids|곡면을 가진 입체도형의 특징을 비교해요.',
    ],
  },
};

const titles: Record<number,string> = {
  1:'수를 세고 모양을 살펴요', 2:'자릿값과 곱셈을 시작해요', 3:'나눗셈과 분수를 배워요',
  4:'도형과 수의 관계를 찾아요', 5:'분수·넓이·규칙을 넓혀 가요', 6:'비율과 입체도형을 탐구해요',
};

const DOMAIN: Partial<Record<Topic,Chapter['label']>> = {
  shapes:'도형과 측정', shapes3d:'도형과 측정', lines:'도형과 측정',
  measurelength:'도형과 측정', lengthtime:'도형과 측정', clock:'도형과 측정',
  angles:'도형과 측정', circle:'도형과 측정', triangletypes:'도형과 측정',
  quadtypes:'도형과 측정', polygons:'도형과 측정', transform:'도형과 측정',
  area:'도형과 측정', perimeter:'도형과 측정', nets:'도형과 측정',
  symmetry:'도형과 측정', polyhedra:'도형과 측정', stacking:'도형과 측정',
  volume:'도형과 측정', surface:'도형과 측정', circlearea:'도형과 측정',
  curvedsolids:'도형과 측정', measureweight:'도형과 측정',
  patterns:'변화와 관계', correspond:'변화와 관계',
  ratio:'변화와 관계', proportion:'변화와 관계', proportionshare:'변화와 관계',
  datagraph:'자료와 가능성', classify:'자료와 가능성', organize:'자료와 가능성',
  bargraph:'자료와 가능성', linegraph:'자료와 가능성', circlegraph:'자료와 가능성',
  average:'자료와 가능성', probability:'자료와 가능성',
};

const GUIDES: Partial<Record<Topic, [string,string]>> = {
  capacity:['1L를 1000mL로 나눌 수 있어요.','들이를 L와 mL 사이에서 바꾸어 보세요.'],
  multiples:['어떤 수를 1배, 2배, 3배 한 수가 그 수의 배수예요.','공배수는 두 수의 배수에 동시에 들어가는 수예요.'],
  roundup:['올림은 지정 자리 아래에 수가 남아 있으면 올려요.','올림한 값이 원래 수보다 작지 않은지 확인해요.'],
  rounddown:['버림은 지정 자리 아래의 숫자를 모두 0으로 바꿔요.','버림한 값이 원래 수보다 크지 않은지 확인해요.'],
  fractioncompare:['서로 다른 분모는 같은 크기의 조각으로 통분해요.','통분한 뒤 분자를 비교하면 크기를 알 수 있어요.'],
  fractionsub:['분모가 다르면 먼저 통분해야 해요.','같은 크기의 조각이 되면 분자끼리 빼요.'],
  bandgraph:['띠 전체가 100%예요.','각 색이 차지하는 길이로 백분율을 읽어요.'],
  naturalfraction:['자연수의 나눗셈 몫을 분수로 나타낼 수 있어요.','나누어지는 수가 분자이고 나누는 수가 분모예요.'],
  circumference:['원주는 원의 둘레 길이예요.','지름에 원주율 3.14를 곱하면 원주를 어림할 수 있어요.'],
  anglesum:['삼각형의 세 내각의 합은 180°예요.','사각형은 두 삼각형으로 나눌 수 있으므로 360°예요.'],
  timecalc:['1시간은 60분이고 1분은 60초예요.','시간 단위를 먼저 같게 바꾼 뒤 더하고 빼요.'],
  decimalcompare:['큰 자릿값부터 차례로 비교해요.','소수점과 같은 자릿값을 맞춰 숫자를 비교해요.'],
  pyramid:['각뿔은 다각형 밑면 하나와 삼각형 옆면으로 이루어져 있어요.','밑면 꼭짓점 외에 꼭짓점 하나가 더 있어요.'],
  range:['이상과 이하는 경계 값을 포함해요.','초과와 미만은 경계 값을 포함하지 않아요.'],
  gcdlcm:['최대공약수는 공약수 중 가장 큰 수예요.','최소공배수는 공배수 중 가장 작은 수예요.'],
  fractiontypes:['분자가 분모보다 작으면 진분수예요.','분자가 크거나 같으면 가분수, 자연수가 함께 있으면 대분수예요.'],
  solidviews:['입체도형을 위에서 보면 겹친 높이는 보이지 않아요.','앞·옆에서 본 모양은 각 방향의 쌓인 높이와 관계있어요.'],
  count9:['블록을 하나씩 손가락으로 짚으면서 세어 보세요.','수를 빠뜨리거나 두 번 세지 않았는지 확인해요.'],
  shapes3d:['직육면체는 평평한 네모 면으로 둘러싸여 있어요.','원기둥과 구는 둥근 표면이 있다는 점이 달라요.'],
  compare:['두 무리의 개수를 비교하거나 수직선에서 위치를 비교해요.','오른쪽에 있는 수가 더 크고, 왼쪽에 있는 수가 더 작아요.'],
  count50:['10개 묶음의 개수부터 세어요.','남은 낱개를 더해 수를 읽고 써요.'],
  count100:['10개 묶음이 10개 모이면 100이 돼요.','십의 자리와 일의 자리를 구별해 보세요.'],
  place3:['백의 자리 하나는 100을 뜻해요.','각 자리의 숫자에 100, 10, 1을 곱해 나타내요.'],
  measurelength:['1m를 100cm로 나눌 수 있어요.','m를 cm로 바꾸고 남은 cm를 더해요.'],
  classify:['분류 기준을 먼저 정해요.','같은 색 또는 같은 모양끼리 모아 개수를 세어요.'],
  place4:['천의 자리 1은 1000을 뜻해요.','각 숫자의 자릿값이 얼마인지 살펴봐요.'],
  datagraph:['그래프에 표시된 항목마다 개수를 세어요.','항목별 개수를 비교해 가장 큰 값을 찾아요.'],
  patterns:['연속된 두 수의 차이를 비교해 봐요.','같은 규칙이 반복되는지 다음 수로 확인해요.'],
  column3:['일·십·백의 자리를 맞춰요.','각 자리끼리 더하며 받아올림을 확인해요.'],
  lines:['선분은 양 끝이 정해져 있어요.','직선은 양쪽으로, 반직선은 한쪽으로 끝없이 뻗어요.'],
  longmultiply:['두 자리 수를 십의 자리와 일의 자리로 나눠요.','부분별로 곱한 값을 더하면 원래 곱셈과 같아요.'],
  divremainder:['나누는 수로 몇 묶음을 만들 수 있는지 세어요.','남은 개수는 나누는 수보다 작아야 해요.'],
  circle:['지름은 중심을 지나는 가장 긴 현이에요.','반지름은 지름의 절반이에요.'],
  measureweight:['1kg은 1000g이에요.','큰 단위를 작은 단위로 바꾼 뒤 합쳐요.'],
  organize:['표의 항목과 각 개수를 확인해요.','자료를 빠짐없이 정리하면 서로 비교하기 쉬워요.'],
  bigplace:['만·십만·백만·천만의 자릿값을 확인해요.','큰 수일수록 네 자리씩 끊어 읽으면 쉬워요.'],
  longdivide:['곱셈과 나눗셈은 서로 반대 관계예요.','나누는 수에 몫을 곱해 원래 수가 나오는지 검산해요.'],
  bargraph:['막대의 길이가 길수록 큰 수를 뜻해요.','막대의 끝과 눈금을 연결해 읽어요.'],
  samefraction:['분모가 같으면 같은 크기의 조각이에요.','분모는 그대로 두고 분자끼리 더하거나 빼요.'],
  triangletypes:['세 변의 길이를 먼저 비교해요.','직각의 유무에 따라 직각삼각형을 구별할 수 있어요.'],
  quadtypes:['마주 보는 변의 평행 여부를 관찰해요.','직각이나 같은 길이의 변을 찾아봐요.'],
  linegraph:['점의 높이가 자료의 값을 나타내요.','두 점의 높이 차이는 변화량이에요.'],
  polygons:['곧은 선분으로 둘러싸인 도형을 살펴봐요.','변의 수와 꼭짓점의 수가 같아요.'],
  mixedcalc:['괄호가 있다면 괄호 속부터 계산해요.','곱셈·나눗셈을 덧셈·뺄셈보다 먼저 계산해요.'],
  factors:['어떤 수를 나누어떨어지게 하는 수가 약수예요.','약수와 배수는 서로 연결된 개념이에요.'],
  correspond:['입력값에 따라 출력값이 어떻게 바뀌는지 관찰해요.','같은 규칙을 □, △ 기호가 있는 식으로 나타낼 수 있어요.'],
  rounding:['반올림할 자리의 바로 아래 자리 숫자를 확인해요.','5 이상이면 올리고 4 이하이면 버려요.'],
  fractionmul:['분수 곱셈은 부분의 부분을 나타낼 수 있어요.','분자끼리, 분모끼리 곱하고 약분해요.'],
  symmetry:['선대칭은 접었을 때 겹치는 모습이에요.','점대칭은 180도 돌렸을 때 겹치는 모습이에요.'],
  decimalmul:['먼저 소수점을 무시하고 자연수처럼 곱해요.','소수 자릿수의 합만큼 답에 소수점을 찍어요.'],
  nets:['직육면체의 면은 모두 여섯 개예요.','전개도를 접었을 때 각 면이 어떻게 맞닿는지 상상해요.'],
  average:['자료의 합을 구한 뒤 자료의 개수로 나눠요.','평균을 구한 뒤 원래 자료의 크기와 비교해요.'],
  probability:['전체 경우에서 원하는 경우가 몇 개인지 세어요.','가능성이 0에 가까우면 드물고 1에 가까우면 자주 일어나요.'],
  fractiondiv:['나누는 분수의 역수를 곱하면 나눗셈을 계산할 수 있어요.','곱셈으로 바꾼 후 약분해요.'],
  polyhedra:['각기둥에는 합동인 다각형 밑면이 두 개 있어요.','각뿔은 밑면 하나와 한 꼭짓점으로 모이는 삼각형 옆면이 있어요.'],
  decimaldiv:['나누는 수를 자연수로 바꾸어 생각해요.','몫의 소수점 위치를 검산하며 정해요.'],
  circlegraph:['전체를 100%로 생각해요.','원 안에서 각 항목이 차지하는 부분을 백분율로 읽어요.'],
  surface:['겉넓이는 여섯 면의 넓이의 합이에요.','서로 같은 두 면씩 세 묶음을 만들어 계산해요.'],
  stacking:['한 층의 쌓기나무 수를 먼저 세어요.','위로 몇 층 쌓였는지 곱해요.'],
  circlearea:['원의 넓이는 반지름 × 반지름 × 원주율이에요.','원주율은 계산할 때 3.14로 어림해 사용할 수 있어요.'],
  curvedsolids:['원기둥은 원 모양 밑면 두 개가 있어요.','원뿔은 원 모양 밑면 하나, 구는 둥근 곡면으로 둘러싸여 있어요.'],
  decimalintro:['전체를 10등분하면 한 칸은 0.1이에요.','소수 첫째 자리는 0.1이 몇 개 있는지 나타내요.'],
  decimalsub:['소수점을 세로로 맞추어 계산해요.','같은 소수 자릿값끼리 빼요.'],
  perimeter:['둘레는 도형의 바깥 경계 길이에요.','직사각형의 둘레는 (가로 + 세로) × 2예요.'],
  proportionshare:['전체를 두 비의 합만큼의 칸으로 나눠요.','각 비에 해당하는 칸 수를 곱해 몫을 구해요.'],
};

function makeChapter(grade: number, semester: 1 | 2, index: number, row: string): Chapter {
  const [title, typeList, description] = row.split('|');
  const topics = typeList.split(',') as Topic[];
  for (const topic of topics) if (!TOPICS.includes(topic)) throw new Error('Unknown curriculum topic: '+topic);
  const first = topics[0];
  const guide = GUIDES[first] ?? [
    '그림의 수와 도형을 자세히 관찰하고 특징을 찾아보세요.',
    '같은 원리를 다른 문제에 적용하면서 설명해 보세요.',
  ];
  return {
    id: grade + '-' + semester + '-' + (index + 1),
    grade, semester, number:index+1, title, topic:first, topics,
    label: DOMAIN[first] ?? '수와 연산',
    subtitle:description,
    tag:grade+'학년 '+semester+'학기 · '+(index+1)+'단원',
    concept:[description, guide[0], topics.length > 1
      ? (GUIDES[topics[1]]?.[0] ?? guide[1]) : guide[1]],
  };
}

export const grades: Grade[] = Object.entries(COURSE).map(([key, semesters]) => {
  const grade=Number(key);
  return { grade, title:titles[grade], chapters:([1,2] as const).flatMap(semester =>
    semesters[semester].map((row,i)=>makeChapter(grade,semester,i,row))) };
});
export const curriculumUnits = grades.flatMap(grade => grade.chapters);
export const TOTAL_UNITS = curriculumUnits.length;

if (TOTAL_UNITS !== 71) throw new Error('Expected 71 grade-semester chapters, got ' + TOTAL_UNITS);
