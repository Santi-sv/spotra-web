const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const route=require('../dist/journey-model.js');

// Exercise the real touch listeners without a browser/device dependency.
async function fixture(mobile=false){
 const listeners={},nodes={},frames=[];
 let firstHeight=600,layoutChanged;
 function node(id=''){
  const classes=new Set();
  return {id,dataset:{},style:{},hidden:false,inert:false,open:false,offsetWidth:160,
   classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),contains:v=>classes.has(v),toggle:(v,on)=>on?classes.add(v):classes.delete(v)},
   setAttribute(){},removeAttribute(){},addEventListener(type,fn){listeners[id+':'+type]=fn;},
   getBoundingClientRect:()=>({left:20,top:60,width:60,height:80}),decode:()=>Promise.resolve()};
 }
 const shell=nodes['site-shell']=node('site-shell');
 Object.assign(shell,{clientWidth:320,clientHeight:568,scrollHeight:7200,scrollTop:0,scrollTo({top}){this.scrollTop=top;}});
 const ids=['hero','app-map','app-community','app-profile','spots','eventos','comunidad','identidad','preguntas','final-cta','footer'];
 const chapters=ids.map((id,index)=>{
  const y=()=>index===0?0:firstHeight+(index-1)*600;
  const e=node(id);e.getBoundingClientRect=()=>({left:0,top:y()-shell.scrollTop,width:320,height:index===0?firstHeight:600});
  e.querySelector=()=>({...node(),getBoundingClientRect:()=>({left:20,top:y()+60-shell.scrollTop,width:60,height:80})});
  return e;
 });
 const i18n={ready:false,t:()=>''},events={},windowEvents={};
 const document={hidden:false,body:node(),fonts:{ready:Promise.resolve()},
  getElementById(id){return nodes[id]||(nodes[id]=node(id));},
  querySelector:selector=>selector==='dialog[open]'?Object.values(nodes).find(e=>e.open)||null:node(),querySelectorAll:s=>s.startsWith('.hero,')?chapters:[],addEventListener(type,fn){events[type]=fn;}};
 const window={SPOTRA_I18N:i18n,SPOTRA_PREFERENCES:{ride:'skate'},SPOTRA_ROUTE:route,SPOTRA_SPRITES:{render(){}},addEventListener(type,fn){windowEvents[type]=fn;},dispatchEvent(){}};
 const sandbox={window,document,innerWidth:320,innerHeight:568,matchMedia:q=>({matches:mobile&&q.startsWith('(max-width:'),addEventListener(){}}),performance:{now:()=>0},requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},cancelAnimationFrame(){},setTimeout,clearTimeout,ResizeObserver:class{constructor(fn){layoutChanged=fn;}observe(){}},MutationObserver:class{observe(){}},Event:class{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../dist/journey.js'),'utf8'),sandbox);
 i18n.ready=true;await Promise.resolve();
 const target=tag=>({closest:selector=>selector.split(',').includes(tag)?{}:null});
 function touch(type,x,y,tag='div',count=1){
  let prevented=false;
  listeners['site-shell:'+type]({target:target(tag),touches:Array.from({length:count},()=>({clientX:x,clientY:y})),preventDefault(){prevented=true;}});
  return prevented;
 }
 return {shell,chapters,layer:nodes['spotri-guide'],touch,replay(){windowEvents['spotra:replay']();},wheel(){let prevented=false;listeners['site-shell:wheel']({deltaX:0,deltaY:100,deltaMode:0,ctrlKey:false,target:target('div'),preventDefault(){prevented=true;}});return prevented;},step(time){frames.splice(0).forEach(fn=>fn(time));},focusScroll(top){shell.scrollTop=top;listeners['site-shell:scroll']();},openDialog(id='mobile-detail'){nodes[id]=node(id);nodes[id].open=true;},resizeFirst(height){firstHeight=height;layoutChanged();frames.pop()(0);}};
}
(async()=>{
 for(const tag of ['div','a','button','summary']){
  const f=await fixture();
  f.touch('touchstart',100,200,tag);
  assert.equal(f.touch('touchmove',103,197,tag),false,'Tiny movement preserves a tap on '+tag);
  assert.equal(f.shell.scrollTop,0);
  assert.equal(f.touch('touchmove',104,120,tag),true,'Vertical swipe is handled on '+tag);
  assert.equal(f.shell.scrollTop,32,'The full reading area is visited before navigating');
  f.touch('touchmove',104,80,tag);
  assert.equal(f.layer.dataset.transitionCount,'1','One gesture requests exactly one adjacent chapter');
  assert.equal(f.layer.dataset.to,'app-map');
  f.touch('touchmove',104,-400,tag);
  assert.equal(f.layer.dataset.transitionCount,'1','Momentum cannot skip a second chapter');
 }
 for(const tag of ['input','select','textarea','[contenteditable="true"]','.ride-settings-panel']){
  const f=await fixture();f.touch('touchstart',100,200,tag);
  assert.equal(f.touch('touchmove',100,80,tag),false,'Form interaction remains native');assert.equal(f.shell.scrollTop,0);
 }
 const f=await fixture();f.touch('touchstart',100,200);
 assert.equal(f.touch('touchmove',140,198),false,'Horizontal swipes are not chapter navigation');
 f.touch('touchend');f.touch('touchstart',100,200);f.touch('touchcancel');
 assert.equal(f.touch('touchmove',100,80),false,'Cancelled gestures cannot resume');
 f.touch('touchstart',100,200);assert.equal(f.touch('touchmove',100,80,'div',2),false,'Pinch gestures remain native');
 assert.equal(f.shell.scrollTop,0);
 const reading=await fixture();reading.touch('touchstart',100,200);reading.touch('touchmove',100,120);
 assert.equal(reading.shell.scrollTop,32);
 reading.resizeFirst(580);
 assert.equal(reading.shell.scrollTop,12,'Collapsing content keeps the next chapter outside the viewport');
 reading.resizeFirst(900);
 assert.equal(reading.shell.scrollTop,12,'Expanding content preserves the reading position');
 const focus=await fixture();focus.focusScroll(400);
 assert.equal(focus.shell.scrollTop,32,'Native focus cannot scroll into the next chapter');
 assert.equal(focus.layer.dataset.transitionCount,undefined,'Focus adjustment does not start a camera transition');
 const modal=await fixture();modal.openDialog();modal.touch('touchstart',100,200);
 assert.equal(modal.touch('touchmove',100,80),false,'An open information dialog suspends chapter navigation');
 assert.equal(modal.shell.scrollTop,0);
 const scenes=await fixture(true);
 scenes.touch('touchstart',100,200);scenes.touch('touchmove',100,120);scenes.touch('touchmove',100,80);
 scenes.step(300);
 assert.equal(scenes.chapters[1].dataset.mobileScene,undefined,'An incoming scene is not revealed during approach');
 scenes.step(400);
 assert.equal(scenes.layer.dataset.phase,'covered');
 assert.equal(scenes.chapters.filter(e=>!e.inert).length,1,'Only the incoming mobile scene is interactive at the covered midpoint');
 assert.equal(scenes.chapters[1].dataset.mobileScene,'current');
 assert.equal(scenes.chapters[0].dataset.mobileScene,'hidden');
 scenes.step(800);scenes.touch('touchend');
 scenes.touch('touchstart',100,100);scenes.touch('touchmove',100,180);
 scenes.step(300);
 assert.equal(scenes.chapters[1].dataset.mobileScene,'current','Reverse approach retains the outgoing scene');
 scenes.step(400);
 assert.equal(scenes.chapters[0].dataset.mobileScene,'current');
 assert.equal(scenes.chapters[1].dataset.mobileScene,'hidden','Reverse cover switches visibility without exposing an adjacent scene');
 assert.equal(scenes.chapters.filter(e=>!e.inert).length,1);
 scenes.step(800);
 for(const id of ['mobile-detail']){
  const dialog=await fixture(true);dialog.openDialog(id);
  assert.equal(dialog.wheel(),false,'An open mobile '+id+' receives its own wheel scroll');
  assert.equal(dialog.layer.dataset.transitionCount,undefined,'Scrolling a dialog does not navigate chapters');
 }
 const replay=await fixture(true);
 replay.touch('touchstart',100,200);replay.touch('touchmove',100,120);replay.touch('touchmove',100,80);replay.step(400);replay.step(800);
 replay.replay();
 assert.equal(replay.layer.dataset.transitionCount,'2','Mobile replay starts the real camera presentation');
 assert.equal(replay.layer.dataset.to,'app-map','Replay keeps the same chapter');
 replay.step(400);assert.equal(replay.layer.dataset.phase,'covered');
 replay.step(800);assert.equal(replay.layer.dataset.section,'app-map');
 const desktopReplay=await fixture();desktopReplay.replay();
 assert.equal(desktopReplay.layer.dataset.transitionCount,undefined,'Desktop replay behavior remains unchanged');
 console.log('Touch regression checks passed: links, buttons, taps, axes, forms, cancellation, pinch and one chapter per gesture.');
})().catch(error=>{console.error(error);process.exitCode=1;});
