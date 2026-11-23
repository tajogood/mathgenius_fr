/** Six actual faces of an axis-aligned cuboid. The same IDs are used on its net. */
export const SOLID_FACE_IDS=['front','back','top','bottom','left','right'] as const;
export type SolidFace=typeof SOLID_FACE_IDS[number];
export const SOLID_FACE_NAMES:Record<SolidFace,string>={
  front:'앞면',back:'뒷면',top:'윗면',bottom:'아랫면',left:'왼쪽면',right:'오른쪽면'
};
export type CuboidDimensions={width:number;height:number;depth:number};
export const cuboidFaceEdges:Record<SolidFace,readonly string[]>={
  front:['x-top-front','x-bottom-front','y-front-left','y-front-right'],
  back:['x-top-back','x-bottom-back','y-back-left','y-back-right'],
  top:['x-top-front','x-top-back','z-top-left','z-top-right'],
  bottom:['x-bottom-front','x-bottom-back','z-bottom-left','z-bottom-right'],
  left:['y-front-left','y-back-left','z-top-left','z-bottom-left'],
  right:['y-front-right','y-back-right','z-top-right','z-bottom-right']
};
export const SOLID_EDGE_IDS=[
  'x-top-front','x-top-back','x-bottom-front','x-bottom-back',
  'y-front-left','y-front-right','y-back-left','y-back-right',
  'z-top-left','z-top-right','z-bottom-left','z-bottom-right'
] as const;
export type SolidEdge=typeof SOLID_EDGE_IDS[number];
export const SOLID_VERTEX_IDS=['ftl','ftr','fbl','fbr','btl','btr','bbl','bbr'] as const;
export type SolidVertex=typeof SOLID_VERTEX_IDS[number];
export const cuboidFaceVertices:Record<SolidFace,readonly SolidVertex[]>={
  front:['ftl','ftr','fbr','fbl'],back:['btr','btl','bbl','bbr'],
  top:['btl','btr','ftr','ftl'],bottom:['fbl','fbr','bbr','bbl'],
  left:['btl','ftl','fbl','bbl'],right:['ftr','btr','bbr','fbr']
};
export function faceDimensions(face:SolidFace,size:CuboidDimensions):[number,number] {
  switch(face){
    case 'front':case 'back':return [size.width,size.height];
    case 'left':case 'right':return [size.depth,size.height];
    case 'top':case 'bottom':return [size.width,size.depth];
  }
}
export function cuboidSurfaceArea({width,height,depth}:CuboidDimensions):number{
  return 2*(width*height + width*depth + height*depth);
}
export function cuboidVolume({width,height,depth}:CuboidDimensions):number{
  return width*height*depth;
}
export const facesForEdge=(id:SolidEdge):SolidFace[]=>
  SOLID_FACE_IDS.filter(face=>cuboidFaceEdges[face].includes(id));
export const facesForVertex=(id:SolidVertex):SolidFace[]=>
  SOLID_FACE_IDS.filter(face=>cuboidFaceVertices[face].includes(id));
