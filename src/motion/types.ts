export type MotionScene={cap:string; dur:number; svg:string|(()=>string)};
export const renderMotionScene=(scene:MotionScene)=>typeof scene.svg==='function'?scene.svg():scene.svg;
