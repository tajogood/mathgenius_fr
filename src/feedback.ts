import type { Problem, Topic } from './math.ts';
import {isEn,tr} from './i18n/index.ts';
import { interactionForProblem, interactionForTopic, type LabKind } from './interactions.ts';

const LAB_HINTS: Record<LabKind,string> = {
  blocks:'블록을 터치할 때마다 세는 수가 하나씩 변하는지 확인해 보세요. 빼는 문제는 남은 블록을 세어요.',
  placevalue:'숫자가 같은 모양이어도 자리마다 뜻하는 값이 달라요. 일·십·백의 자리를 차례로 눌러 보세요.',
  numberline:'수직선에서 오른쪽에 있는 수가 더 커요. 기준점과 비교점의 위치를 확인해 보세요.',
  fractions:'막대의 전체 길이는 같아요. 한 조각의 크기를 뜻하는 분모와 칠한 조각 수인 분자를 구별해 보세요.',
  geometry:'변의 수, 서로 평행한 변, 직각의 유무를 관찰해 보세요. 도형을 돌려도 길이와 각도는 변하지 않아요.',
  angles:'각도는 선의 길이가 아니라 두 선이 벌어진 크기예요. 기준선에서부터 눈금을 읽어 보세요.',
  clock:'긴 바늘은 분, 짧은 바늘은 시를 나타내요. 긴 바늘이 숫자 하나를 움직이면 5분이에요.',
  measures:'큰 단위가 작은 단위 몇 개에 해당하는지 먼저 확인해 보세요. 분→초는 60, m→cm는 100이에요.',
  charts:'그래프의 항목 이름과 눈금 단위를 먼저 확인해요. 두 자료의 크기를 비교할 때는 같은 눈금을 사용해요.',
  arrays:'행과 열 중 하나를 고정하고 몇 묶음인지 확인해 보세요. 나눗셈에서는 몫과 나머지를 구별해요.',
  ratios:'비율은 부분을 전체로 나눈 값이에요. 파란 구슬 수와 전체 구슬 수를 함께 확인해 보세요.',
  solids:'입체도형의 밑면, 옆면, 높이를 구분해요. 쌓기나무는 한 층의 개수에 층수를 곱해요.',
  patterns:'연속한 두 수가 얼마나 변하는지 확인해 보세요. 찾은 규칙을 다음 수에도 적용해 봐요.',
  equations:'연산 순서를 확인하고, 곱셈과 나눗셈의 관계를 이용해 계산 결과를 검산해 보세요.',
  chance:'전체 구슬 수 중 원하는 색이 몇 개인지 세어 보세요. 가능성은 해당 개수 ÷ 전체 개수예요.',
  circle:'원의 반지름은 중심에서 원 위의 점까지의 거리예요. 지름은 반지름의 2배예요.',
};

const OVERRIDES: Partial<Record<Problem['topic'],string>> = {
  split:'전체 블록에서 한 묶음을 옮겼다면, 남아 있는 블록의 개수를 세어 보세요.',
  addsub:'덧셈이면 두 묶음을 합치고, 뺄셈이면 원래 수에서 뺀 수만큼 제거한 뒤 남은 수를 세어요.',
  carry:'10개를 하나의 묶음으로 만든 뒤, 남은 낱개를 더하면 받아올림을 쉽게 이해할 수 있어요.',
  multiply:'같은 수가 몇 묶음 있는지 확인해요. 한 묶음의 수 × 묶음의 수를 계산해 보세요.',
  divremainder:'나누는 수만큼 묶음을 만들어요. 남은 수는 반드시 나누는 수보다 작아야 해요.',
  fraction:'서로 다른 분모를 같은 수로 통분해야 같은 크기의 조각을 더할 수 있어요.',
  reduce:'분자와 분모를 같은 자연수로 나누어도 분수의 크기는 변하지 않아요.',
  fractionmul:'분수끼리 곱할 때는 분자끼리, 분모끼리 곱하고 약분해요. 부분의 부분을 생각해 보세요.',
  fractiondiv:'나누는 분수의 역수를 곱하는 식으로 바꾸어 계산한 다음 약분해요.',
  fractionsub:'분모를 똑같이 만든 다음 분자만 빼야 해요. 막대의 한 칸 크기가 같아야 빼기가 가능해요.',
  fractioncompare:'다른 분모를 가진 두 분수는 통분한 뒤 분자를 비교해 보세요.',
  rounding:'반올림하려는 자리 바로 아래 숫자를 확인해요. 5 이상이면 올리고 4 이하면 버려요.',
  roundup:'올림은 버리는 자리에 0이 아닌 숫자가 있으면 지정한 자리 숫자를 1 올려요.',
  rounddown:'버림은 지정한 자리보다 아래에 있는 수를 모두 없애요. 원래 수보다 커지지 않아요.',
  decimaladd:'소수점을 맞춰 같은 자릿값끼리 더해요. 0.1과 0.01의 단위는 달라요.',
  decimalsub:'소수점을 세로로 맞추고 같은 자릿값끼리 빼요.',
  measurelength:'1m는 100cm예요. m를 cm로 바꾼 뒤 남은 cm를 더해요.',
  capacity:'1L는 1000mL예요. 큰 단위부터 환산한 다음 작은 단위와 합쳐요.',
  measureweight:'1kg은 1000g예요. kg를 g으로 바꾼 다음 더해요.',
  circlearea:'원의 넓이는 반지름 × 반지름 × 원주율(3.14)로 구해요.',
  circumference:'원주는 지름 × 원주율(3.14)이에요. 넓이를 구하는 공식과 구분해 보세요.',
  perimeter:'직사각형의 둘레는 (가로 + 세로) × 2예요. 넓이인 가로 × 세로와 달라요.',
  surface:'겉넓이는 직육면체의 모든 면 6개의 넓이를 합한 값이에요. 부피와는 다른 단위예요.',
  volume:'부피는 가로 × 세로 × 높이예요. 1cm³ 쌓기나무가 몇 개 들어가는지 생각해요.',
  proportion:'앞항과 뒤항에 똑같은 수를 곱해야 같은 비를 만들 수 있어요.',
  proportionshare:'전체를 비의 두 항의 합만큼 나눈 후 해당하는 비의 크기만큼 다시 곱해요.',
  average:'모든 자료의 합을 자료의 개수로 나누어 평균을 구해요.',
  probability:'분자는 원하는 색 구슬의 수, 분모는 전체 구슬의 수예요.',
};

export function diagnosticHint(problem:Problem,selected:string):string {
  if(selected===problem.answer) return '정답이에요. 같은 개념을 다른 문제에도 적용해 보세요.';
  const topicHint=OVERRIDES[problem.topic]??LAB_HINTS[interactionForProblem(problem)];
  if(isEn()) return 'Look again at your answer, '+tr(selected)+'. '+tr(topicHint);
  return '선택한 답 '+selected+'을 다시 살펴봐요. '+topicHint;
}

/** This principle is safe to display before a new practice problem: no generated answers are exposed. */
export function conceptTipForTopic(topic:Topic):string {
  return OVERRIDES[topic]??LAB_HINTS[interactionForTopic[topic]];
}

export function diagnosticCoverage():number {
  return Object.keys(LAB_HINTS).length;
}
