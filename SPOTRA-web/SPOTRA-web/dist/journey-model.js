/* Camera geometry and scene-boundary input, independent of the DOM. */
((root)=>{
 'use strict';
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const mix=(a,b,t)=>a+(b-a)*t;
 const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 const focus={skate:{x:.51,y:.45},bmx:{x:.4,y:.45},rollers:{x:.51,y:.45},scooter:{x:.51,y:.45}};
 function closeUp(width,height,vehicle){
  const point=focus[vehicle]||focus.skate;
  // Crop into the solid torso, rather than fit a large full-body image onscreen.
  const size=Math.max(width*6,height*4.5);
  return {x:width/2-size*point.x,y:height/2-size/.75*point.y,width:size};
 }
 function camera(from,to,t,vehicle){
  const point=focus[vehicle]||focus.skate,progress=ease(t);
  const width=from.width*Math.pow(to.width/from.width,progress);
  const x=mix(from.x+from.width*point.x,to.x+to.width*point.x,progress);
  const y=mix(from.y+from.width/.75*point.y,to.y+to.width/.75*point.y,progress);
  return {x:x-width*point.x,y:y-width/.75*point.y,width};
 }
 function cameraPose(from,peak,to,t,vehicle){
  if(t<.4)return camera(from,peak,t/.4,vehicle);
  if(t<=.55)return {...peak};
  return camera(peak,to,(t-.55)/.45,vehicle);
 }
 function detailQuad(pose,vehicle){
  const point=focus[vehicle]||focus.skate;
  // Overscan keeps the feathered texture edges outside the covered viewport.
  const width=pose.width/6*1.1,height=width*4/3;
  return {x:pose.x+pose.width*point.x-width/2,y:pose.y+pose.width/.75*point.y-height/2,width,height};
 }
 function intent(scroll,start,end,delta){
  if(delta>0&&scroll>=end-2)return {navigate:1};
  if(delta<0&&scroll<=start+2)return {navigate:-1};
  return {scroll:clamp(scroll+delta,start,end)};
 }
 function touchAxis(origin,point){
  const x=Math.abs(point.x-origin.x),y=Math.abs(point.y-origin.y);
  if(Math.max(x,y)<8)return 'pending';
  return x>y?'horizontal':'vertical';
 }
 const api={clamp,mix,ease,closeUp,camera,cameraPose,detailQuad,intent,touchAxis};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SPOTRA_ROUTE=api;
})(typeof window!=='undefined'?window:globalThis);
