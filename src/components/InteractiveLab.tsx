import { interactionForProblem, TOPIC_CHALLENGES, type LabKind } from '../interactions.ts';
import type { Problem } from '../math.ts';
import type { LabPhase } from './labs/types';
import { BlocksLab, PlaceLab, ArraysLab, EquationLab } from './labs/CountingLabs';
import { FractionsLab, NumberlineLab, RatiosLab, MeasuresLab } from './labs/RepresentLabs';
import { GeometryLab, AnglesLab, ClockLab, CircleLab, SolidsLab } from './labs/GeometryLabs';
import { ChartsLab, PatternsLab, ChanceLab } from './labs/DataLabs';
import { AreaShapesLab,ProjectionLab,NetLab } from './labs/SpecialLabs';
import { DecimalMultiplyLab } from './labs/DecimalMultiplyLab';
import { DecimalDivisionLab } from './labs/DecimalDivisionLab';
import { SymmetryLab } from './labs/SymmetryLab';
import { RectangleConceptLab } from './labs/RectangleConceptLab';
import { SolidExplorerLab } from './labs/SolidExplorerLab';
import { AverageBalanceLab } from './labs/AverageBalanceLab';
import { PolyhedronExplorerLab } from './labs/PolyhedronExplorerLab';
import { UnitCubesLab } from './labs/UnitCubesLab';
import { RoundSolidsExplorerLab } from './labs/RoundSolidsExplorerLab';
import { ShapePlayLab, LinePlayLab } from './labs/ShapePlayLab';
import { CirclePiLab } from './labs/CirclePiLab';

export type InteractiveLabProps = {
  problem: Problem;
  phase: LabPhase;
  step: number;
  standardId?: string;
  onEngage?: () => void;
};

const LAB_LABELS: Record<LabKind, [string, string]> = {
  blocks: ['직접 세는 블록', '블록을 눌러 한 개씩 세어 보세요'],
  placevalue: ['자릿값 만들기', '자릿값 카드를 고르고 수를 만들어 보세요'],
  numberline: ['움직이는 수직선', '파란 점을 드래그해 숫자를 비교해 보세요'],
  fractions: ['색칠하는 분수 막대', '등분된 칸을 터치해 분수의 크기를 바꿔 보세요'],
  geometry: ['도형 실험실', '도형을 회전·뒤집고 꼭짓점을 움직여 보세요'],
  angles: ['손으로 움직이는 각도기', '각의 끝점을 드래그해 각도를 바꿔 보세요'],
  clock: ['돌아가는 시계', '시곗바늘을 손으로 움직여 보세요'],
  measures: ['단위 환산 실험', '수를 움직이면 단위 변환 값이 달라져요'],
  charts: ['내 손으로 만드는 그래프', '막대를 터치하거나 슬라이더를 움직여 보세요'],
  arrays: ['묶음과 배열 실험', '묶음을 눌러 선택하고 줄 수를 바꿔 보세요'],
  ratios: ['색으로 보는 비율', '두 색의 수를 바꾸면 비율이 달라져요'],
  solids: ['입체도형 연구실', '쌓기·회전·펼치기를 해 보세요'],
  patterns: ['규칙 찾아보기', '시작 수와 규칙을 바꿔 보세요'],
  equations: ['움직이는 계산판', '묶음의 크기나 곱하는 수를 바꿔 보세요'],
  chance: ['확률 실험실', '구슬 색을 바꾸고 무작위로 뽑아 보세요'],
  circle: ['커졌다 작아지는 원', '반지름을 조절해 원주와 넓이를 비교해 보세요'],
};

/** All 83 topic IDs resolve to one of 16 interactive lab families. */
function ActiveLab({problem,phase,step,standardId}:InteractiveLabProps) {
  const props={problem,phase,step,standardId};
  const kind=interactionForProblem(problem);
  switch(kind) {
    case 'blocks':return <BlocksLab {...props}/>;
    case 'placevalue':return <PlaceLab {...props}/>;
    case 'numberline':return <NumberlineLab {...props}/>;
    case 'fractions':return <FractionsLab {...props}/>;
    case 'geometry':return problem.topic==='shapes'?<ShapePlayLab {...props}/>:problem.topic==='lines'?<LinePlayLab {...props}/>:problem.topic==='symmetry'?<SymmetryLab {...props}/>:problem.topic==='perimeter'?<RectangleConceptLab {...props}/>:<GeometryLab {...props}/>;
    case 'angles':return <AnglesLab {...props}/>;
    case 'clock':return <ClockLab {...props}/>;
    case 'measures':return <MeasuresLab {...props}/>;
    case 'charts':return problem.topic==='average'?<AverageBalanceLab {...props}/>:<ChartsLab {...props}/>;
    case 'arrays':return standardId==='6수03-14'&&phase!=='question'?<AreaShapesLab {...props}/>:problem.topic==='area'?<RectangleConceptLab {...props}/>:<ArraysLab {...props}/>;
    case 'ratios':return <RatiosLab {...props}/>;
    case 'solids':
      if(problem.topic==='curvedsolids'||(problem.topic==='shapes3d'&&problem.a!==0))
        return <RoundSolidsExplorerLab {...props}/>;
      if(problem.topic==='polyhedra'||problem.topic==='pyramid')return <PolyhedronExplorerLab {...props}/>;
      if(problem.topic==='volume'||problem.topic==='stacking')return <UnitCubesLab {...props}/>;
      if(problem.topic==='solidviews')return <ProjectionLab {...props}/>;
      if(problem.topic==='nets'||problem.topic==='surface'||
        (problem.topic==='shapes3d'&&problem.a===0))return <SolidExplorerLab {...props}/>;
      if(phase!=='question'){
        if(standardId==='6수03-10')return <ProjectionLab {...props}/>;
        if(standardId==='6수03-06'||standardId==='6수03-08')return <NetLab {...props}/>;
      }
      return <SolidsLab {...props}/>;
    case 'patterns':return <PatternsLab {...props}/>;
    case 'equations':return problem.topic==='decimalmul'?<DecimalMultiplyLab {...props}/>:problem.topic==='decimaldiv'?<DecimalDivisionLab {...props}/>:<EquationLab {...props}/>;
    case 'chance':return <ChanceLab {...props}/>;
    case 'circle':return <CirclePiLab {...props}/>;
  }
}

export default function InteractiveLab({problem,phase,step,standardId,onEngage}:InteractiveLabProps) {
  const kind=interactionForProblem(problem);
  const [title,instructions]=problem.topic==='shapes'?
    ['세모·네모·동그라미 탐험','도형을 직접 끌어 이동하고 주황 꼭짓점을 움직여 변과 꼭짓점을 찾아보세요'] :
    problem.topic==='lines'?
    ['직선·선분·반직선 직접 조작','선의 끝점을 직접 움직이면서 끝점과 뻗는 방향을 관찰해 보세요'] :
    problem.topic==='circumference'||problem.topic==='circlearea'?
    ['원주율 3.14 탐구실','원둘레를 따라 재고 줄자를 펼쳐 지름 3개와 남은 길이를 비교해 보세요'] :
    problem.topic==='decimaldiv'?
    ['같은 양을 고르게 나누는 소수 나눗셈','나누는 수를 바꾸어도 나누어지는 수는 그대로! 한 묶음의 크기를 비교해 보세요'] :
    problem.topic==='decimalmul' ?
    ['소수 100칸 곱셈 실험실','두 소수를 겹쳐서 곱셈의 크기를 직접 찾아보세요'] :
    problem.topic==='symmetry'?
    ['합동·선대칭·점대칭 실험실','도형을 직접 드래그하고 주황 손잡이로 회전시켜 보세요'] :
    problem.topic==='area'||problem.topic==='perimeter'?
    ['둘레와 넓이 탐구실','1cm² 정사각형을 한 줄씩 채우거나 네 변을 따라가며 계산해 보세요'] :
    problem.topic==='nets'||problem.topic==='surface'||(problem.topic==='shapes3d'&&problem.a===0)?
    ['손으로 돌리는 입체도형 실험실','직육면체를 직접 360도 회전하고 면·모서리·꼭짓점을 눌러 보세요'] :
    problem.topic==='average'?
    ['고르게 나누는 평균 실험실','사탕을 친구들에게 옮기며 전체 합은 그대로, 몫은 같게 만들어 보세요'] :
    problem.topic==='polyhedra'||problem.topic==='pyramid'?
    ['손으로 돌리는 각기둥·각뿔 실험실','도형을 직접 회전하고 면·모서리·꼭짓점을 눌러 본 뒤 전개도와 연결해 보세요'] :
    problem.topic==='volume'||problem.topic==='stacking'?
    ['1cm³ 쌓기나무 실험실','한 줄의 정육면체를 세고 한 층씩 쌓아 부피를 스스로 계산해 보세요'] :
    problem.topic==='solidviews'?
    ['세 방향에서 보는 쌓기나무','위에서 본 칸을 터치해 층을 쌓고 앞·옆 모양이 어떻게 바뀌는지 확인해 보세요'] :
    problem.topic==='curvedsolids'||(problem.topic==='shapes3d'&&problem.a!==0)?
    ['직접 돌리는 원기둥·원뿔·구','평평한 원 모양 밑면과 둥근 곡면을 눌러 비교하고 실제 전개도를 탐구해 보세요'] : LAB_LABELS[kind];
  return <div className={'interactive-lab interactive-lab--'+kind}
    onClickCapture={onEngage} onChangeCapture={onEngage}
    onPointerDownCapture={onEngage} onKeyDownCapture={event=>{
      if (event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow')) onEngage?.();
    }}>
    <div className="lab-heading">
      <span className="lab-spark" aria-hidden="true">✦</span>
      <div><strong>{title}</strong><span>{TOPIC_CHALLENGES[problem.topic] || instructions}</span></div>
      <span className="lab-interactive-tag">터치 가능</span>
    </div>
    <ActiveLab key={standardId+'|'+problem.topic+'|'+problem.prompt} problem={problem} phase={phase} step={step} standardId={standardId}/>
  </div>;
}
