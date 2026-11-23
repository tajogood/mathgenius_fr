export type GeometryPoint={x:number;y:number};
export type SymmetryMode='congruence'|'line'|'point';
export type SymmetryShape='house'|'butterfly'|'parallelogram'|'rectangle'|'ell';
export const shapeSamples:Record<SymmetryShape,{name:string;vertices:GeometryPoint[]}>={
 house:{name:'집 모양',vertices:[[-42,-5],[0,-54],[42,-5],[42,48],[-42,48]].map(([x,y])=>({x,y}))},
 butterfly:{name:'나비',vertices:[
  [0,-24],[-18,-42],[-63,-54],[-57,-15],[-37,-2],[-59,26],
  [-47,50],[-8,29],[0,18],[8,29],[47,50],[59,26],
  [37,-2],[57,-15],[63,-54],[18,-42],
 ].map(([x,y])=>({x,y}))},
 parallelogram:{name:'평행사변형',vertices:[[-58,-35],[21,-35],[58,35],[-21,35]].map(([x,y])=>({x,y}))},
 rectangle:{name:'직사각형',vertices:[[-51,-39],[51,-39],[51,39],[-51,39]].map(([x,y])=>({x,y}))},
 ell:{name:'ㄱ자',vertices:[[-50,-45],[50,-45],[50,-16],[-12,-16],[-12,47],[-50,47]].map(([x,y])=>({x,y}))},
};
export function reflectAcrossVertical(p:GeometryPoint,axisX:number):GeometryPoint{
 return {x:2*axisX-p.x,y:p.y};
}
export function rotateHalfTurn(p:GeometryPoint,center:GeometryPoint):GeometryPoint{
 return {x:2*center.x-p.x,y:2*center.y-p.y};
}
const samePoint=(a:GeometryPoint,b:GeometryPoint)=>Math.abs(a.x-b.x)<.00001&&Math.abs(a.y-b.y)<.00001;
export function isLineSymmetric(vertices:GeometryPoint[]):boolean{
 return vertices.every(v=>vertices.some(candidate=>samePoint(candidate,reflectAcrossVertical(v,0))));
}
export function isPointSymmetric(vertices:GeometryPoint[]):boolean{
 return vertices.every(v=>vertices.some(candidate=>samePoint(candidate,rotateHalfTurn(v,{x:0,y:0}))));
}
export function expectedShape(mode:SymmetryMode):SymmetryShape{
 return mode==='line'?'butterfly':mode==='point'?'parallelogram':'house';
}
