const assert=require('node:assert/strict');
const {camera,cameraPose,closeUp,detailQuad,intent,touchAxis}=require('../dist/journey-model.js');
assert.equal(touchAxis({x:100,y:200},{x:103,y:197}),'pending','A small finger movement must remain a tap');
assert.equal(touchAxis({x:100,y:200},{x:106,y:165}),'vertical','A swipe across a capture enters chapter reading');
assert.equal(touchAxis({x:100,y:200},{x:130,y:198}),'horizontal','A horizontal gesture must not navigate to another chapter');
assert.deepEqual(intent(0,0,0,720),{navigate:1},'One wheel gesture requests one adjacent scene');
assert.deepEqual(intent(400,400,850,-720),{navigate:-1},'Reverse navigation starts at the current scene boundary');
assert.deepEqual(intent(500,400,850,720),{scroll:850},'A long mobile scene remains readable without skipping its bottom');
assert.deepEqual(intent(500,400,850,-720),{scroll:400},'A large reverse delta cannot skip a scene');
for(const [w,h] of [[1280,720],[900,720],[390,844]]){
 for(const ride of ['skate','bmx','rollers','scooter']){
  const a={x:w*.8,y:80,width:w<=700?82:205},b={x:30,y:150,width:60},peak=closeUp(w,h,ride);
  const detail=detailQuad(peak,ride);
  assert(Math.abs(detail.x+detail.width/2-w/2)<1e-6,'Sharp texture remains registered at the camera center');
  assert(Math.abs(detail.y+detail.height/2-h/2)<1e-6);
  assert.equal(detail.width/detail.height,.75);
  assert(detail.width>=w&&detail.height>=h,'The sharp close-up covers the whole viewport in portrait and landscape');
  assert(peak.width>=w*6,'The camera crops into the character instead of fitting a full-body image');
  for(const [from,to] of [[a,peak],[peak,b],[b,peak],[peak,a]]){
   const first=camera(from,to,0,ride),last=camera(from,to,1,ride);
   for(const key of ['x','y','width']){assert(Math.abs(first[key]-from[key])<1e-6);assert(Math.abs(last[key]-to[key])<1e-6);}
   let previous=from.width;
   for(let i=1;i<=100;i++){
    const p=camera(from,to,i/100,ride);
    assert(Object.values(p).every(Number.isFinite));
    assert((p.width-previous)*Math.sign(to.width-from.width)>=-1e-6);
    previous=p.width;
   }
  }
  for(const t of [.4,.48,.55])assert.deepEqual(cameraPose(a,peak,b,t,ride),peak,'The scene swap occurs during the continuous close-up hold');
  assert(Math.abs(cameraPose(a,peak,b,.400001,ride).width-cameraPose(a,peak,b,.399999,ride).width)<.01);
  assert(Math.abs(cameraPose(a,peak,b,.550001,ride).width-cameraPose(a,peak,b,.549999,ride).width)<.01);
 }
}
console.log('Cinematic route checks passed: one scene per gesture, readable long scenes, reversible camera and continuous covered midpoint.');
