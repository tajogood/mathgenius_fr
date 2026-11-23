/** Polygonal solids: n-gonal prisms and pyramids with actual vertices and face topology. */
export type PolyKind='prism'|'pyramid';
export type P3={x:number;y:number;z:number};
export type PolyFace={id:string;label:string;vertices:number[];kind:'base'|'side'};
export type PolyEdge={id:string;vertices:[number,number]};
export type Polyhedron={kind:PolyKind;sides:number;vertices:P3[];faces:PolyFace[];edges:PolyEdge[]};
export type P2={x:number;y:number;depth:number};
const rad=(deg:number)=>deg*Math.PI/180;
const keyFor=(a:number,b:number)=>[Math.min(a,b),Math.max(a,b)].join('-');
export function buildPolyhedron(kind:PolyKind,sides:number):Polyhedron{
 const n=Math.max(3,Math.min(8,Math.round(sides)));
 const radius=1;
 const base=Array.from({length:n},(_,i)=>{
   const t=2*Math.PI*i/n+Math.PI/2;
   return {x:Math.cos(t)*radius,z:Math.sin(t)*radius};
 });
 const vertices:P3[]=kind==='prism'
   ? [...base.map(p=>({...p,y:.83})),...base.map(p=>({...p,y:-.83}))]
   : [...base.map(p=>({...p,y:-.78})),{x:0,y:1.08,z:0}];
 const faces:PolyFace[]=kind==='prism'?[
   {id:'top',label:'윗면(밑면)',kind:'base',vertices:Array.from({length:n},(_,i)=>i)},
   {id:'bottom',label:'아랫면(밑면)',kind:'base',vertices:Array.from({length:n},(_,i)=>2*n-i-1)},
   ...Array.from({length:n},(_,i)=>({
     id:'side-'+i,label:(i+1)+'번째 옆면',kind:'side' as const,
     vertices:[i,(i+1)%n,n+(i+1)%n,n+i]
   }))
 ]:[
   {id:'base',label:'밑면',kind:'base',vertices:Array.from({length:n},(_,i)=>n-1-i)},
   ...Array.from({length:n},(_,i)=>({
     id:'side-'+i,label:(i+1)+'번째 삼각형 옆면',kind:'side' as const,
     vertices:[i,(i+1)%n,n]
   }))
 ];
 const edgesMap=new Map<string,PolyEdge>();
 for(const face of faces)for(let i=0;i<face.vertices.length;i++){
   const a=face.vertices[i],b=face.vertices[(i+1)%face.vertices.length];
   const id=keyFor(a,b);
   if(!edgesMap.has(id))edgesMap.set(id,{id,vertices:[a,b]});
 }
 return {kind,sides:n,vertices,faces,edges:Array.from(edgesMap.values())};
}
export function projectPoint(p:P3,yawDeg:number,pitchDeg:number):P2{
 const yaw=rad(yawDeg),pitch=rad(pitchDeg);
 const x=p.x*Math.cos(yaw)+p.z*Math.sin(yaw);
 const z=-p.x*Math.sin(yaw)+p.z*Math.cos(yaw);
 const y=p.y*Math.cos(pitch)-z*Math.sin(pitch);
 const d=p.y*Math.sin(pitch)+z*Math.cos(pitch);
 const perspective=4.2/(4.2-d);
 return {x:167+x*66*perspective,y:117-y*66*perspective,depth:d};
}
export function polyhedronCounts(kind:PolyKind,n:number){
 return {faces:kind==='prism'?n+2:n+1,
  edges:kind==='prism'?3*n:2*n,vertices:kind==='prism'?2*n:n+1,
  bases:kind==='prism'?2:1,sideFaces:n};
}
export function facesContainingEdge(model:Polyhedron,edge:PolyEdge):PolyFace[]{
 const [a,b]=edge.vertices;
 return model.faces.filter(f=>f.vertices.includes(a)&&f.vertices.includes(b));
}
export function facesContainingVertex(model:Polyhedron,vertexIndex:number):PolyFace[]{
 return model.faces.filter(f=>f.vertices.includes(vertexIndex));
}
export function netFaces(kind:PolyKind,n:number){
 const counts=polyhedronCounts(kind,n);
 return {total:counts.faces,base:counts.bases,side:counts.sideFaces};
}
