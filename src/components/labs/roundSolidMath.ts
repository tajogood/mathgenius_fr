/** Exact elementary-school classification of circular cylinders, cones, and spheres. */
export type RoundSolid='cylinder'|'cone'|'sphere';
export const ROUND_SOLID_LABELS:Record<RoundSolid,string>={
  cylinder:'원기둥',cone:'원뿔',sphere:'구'
};
export const ROUND_SOLID_PARTS:Record<RoundSolid,{
  flatBases:number;curvedSurfaces:number;apices:number;circularEdges:number;
}>={
 cylinder:{flatBases:2,curvedSurfaces:1,apices:0,circularEdges:2},
 cone:{flatBases:1,curvedSurfaces:1,apices:1,circularEdges:1},
 sphere:{flatBases:0,curvedSurfaces:1,apices:0,circularEdges:0}
};
export function coneNetSectorAngle(radius:number,height:number):number{
 const slant=Math.hypot(radius,height);
 return 2*Math.PI*radius/slant;
}
export function cylinderLateralDimensions(radius:number,height:number):[number,number]{
 return [2*Math.PI*radius,height];
}
export function roundSurfaceExplanation(shape:RoundSolid,part:'base'|'curve'|'apex'):string{
 if(part==='base')return shape==='cylinder'?'위아래에 원 모양의 평평한 밑면이 2개 있어요.':
   shape==='cone'?'원뿔에는 평평한 원 모양 밑면이 1개 있어요.':'구에는 평평한 밑면이 없어요.';
 if(part==='apex')return shape==='cone'?'원뿔의 뾰족한 꼭짓점은 1개예요.':'이 도형에는 뾰족한 꼭짓점이 없어요.';
 return shape==='sphere'?'구 전체는 한 덩어리의 둥근 곡면이에요.':
   shape==='cylinder'?'원기둥의 옆면은 둥글지만 펼치면 직사각형이 돼요.':
   '원뿔의 옆면은 둥글지만 펼치면 부채꼴이 돼요.';
}
