(() => {
 'use strict';
 const shell=document.getElementById('site-shell'),welcome=document.getElementById('welcome');
 const layer=document.getElementById('spotri-guide'),character=document.getElementById('guide-character');
 const sprite=document.getElementById('guide-sprite'),speech=document.getElementById('guide-speech');
 const detail=document.getElementById('guide-detail'),greeting=document.getElementById('guide-greeting');
 const i18n=window.SPOTRA_I18N,preferences=window.SPOTRA_PREFERENCES,model=window.SPOTRA_ROUTE;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),pointer=matchMedia('(hover:hover) and (pointer:fine)');
 const mobileScene=matchMedia('(max-width:700px), (max-width:1000px) and (max-height:500px) and (orientation:landscape)');
 const chapters=[...document.querySelectorAll('.hero,#app-map,#app-community,#app-profile,#spots,#eventos,#comunidad,#identidad,#preguntas,.final-cta,.footer')];
 const controls=[document.getElementById('story-pause'),document.getElementById('journey-pause')];
 // All docks are reserved in the existing layout. No search for empty space.
 const spotriPositions={
  hero:{desktop:'.hero-spotri-anchor',tablet:'.hero-spotri-anchor',mobile:'.hero-spotri-anchor'},
  'app-map':{desktop:'.presenter-dock',tablet:'.presenter-dock',mobile:'.presenter-dock'},
  'app-community':{desktop:'.presenter-dock',tablet:'.presenter-dock',mobile:'.presenter-dock'},
  'app-profile':{desktop:'.presenter-dock',tablet:'.presenter-dock',mobile:'.presenter-dock'},
  spots:{desktop:'.chapter-heading .spotri-dock',tablet:'.chapter-heading .spotri-dock',mobile:'.chapter-heading .spotri-dock'},
  eventos:{desktop:'.chapter-heading .spotri-dock',tablet:'.chapter-heading .spotri-dock',mobile:'.chapter-heading .spotri-dock'},
  comunidad:{desktop:'.chapter-heading .spotri-dock',tablet:'.chapter-heading .spotri-dock',mobile:'.chapter-heading .spotri-dock'},
  identidad:{desktop:'.chapter-heading .spotri-dock',tablet:'.chapter-heading .spotri-dock',mobile:'.chapter-heading .spotri-dock'},
  preguntas:{desktop:'.chapter-heading .spotri-dock',tablet:'.chapter-heading .spotri-dock',mobile:'.chapter-heading .spotri-dock'},
  'final-cta':{desktop:'.chapter-heading .spotri-dock',tablet:'.chapter-heading .spotri-dock',mobile:'.chapter-heading .spotri-dock'},
  footer:{desktop:'.chapter-heading .spotri-dock',tablet:'.chapter-heading .spotri-dock',mobile:'.chapter-heading .spotri-dock'}
 };
 const parkedMargins={desktop:{width:48,right:8,y:.42},tablet:{width:25,right:4,y:.42},mobile:{width:18,right:4,y:.42}};
 const base=300,duration=800,lastChapter=chapters.length-1;
 let geometry=[],viewport={width:innerWidth,height:innerHeight},welcomeDock=null;
 let pose={x:0,y:0,width:base},active=0,transition=null,paused=false,frame=0,lastTime=0,count=0,cycle=null;
 let mouse={x:0,y:0},look={x:0,y:0},layoutFrame=0,resizeTimer=0,resizeRead=null,detailReady=false,entering=false,resizing=false;
 let wheelTotal=0,wheelDirection=0,lastWheel=0,wheelBlockedUntil=0,touchOrigin=null,touchY=null,touchDirection='pending',touchConsumed=false;
 function chapterKey(index){return chapters[index].id||(index===0?'hero':chapters[index].classList.contains('footer')?'footer':'launch');}
 function breakpoint(){return viewport.width>1000?'desktop':viewport.width>700?'tablet':'mobile';}
 function measure(){
  viewport={width:shell.clientWidth||innerWidth,height:shell.clientHeight||innerHeight};
  if(i18n.ready){
   const record=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top+shell.scrollTop,width:r.width,height:r.height};};
   geometry=chapters.map((element,index)=>({box:record(element),dock:record(element.querySelector(spotriPositions[chapterKey(index)]?.[breakpoint()]||'.spotri-dock'))}));
  }else{
   const r=document.querySelector('.welcome-spotri-anchor').getBoundingClientRect();welcomeDock={x:r.x,y:r.y,width:r.width};
  }
 }
 function refreshLayout(){if(!layoutFrame)layoutFrame=requestAnimationFrame(()=>{
  layoutFrame=0;measure();
  // An expanding/collapsing answer or a language change must not expose an
  // adjacent chapter before the guide performs its transition.
  if(i18n.ready&&!transition&&!resizing){
   const {start,end}=readingBounds(active),scroll=model.clamp(shell.scrollTop,start,end);
   if(Math.abs(scroll-shell.scrollTop)>.5)shell.scrollTo({top:scroll,behavior:'instant'});
  }
  kick();
 });}
 function sceneScroll(index){return model.clamp(index===0?0:geometry[index].box.y,0,Math.max(0,shell.scrollHeight-viewport.height));}
 function readingBounds(index){
  const start=sceneScroll(index);
  return {start,end:index===lastChapter?Math.max(start,shell.scrollHeight-viewport.height):Math.max(start,geometry[index+1].box.y-viewport.height)};
 }
 function target(index,scroll=shell.scrollTop){
  if(!i18n.ready)return welcomeDock;
  const dock={...geometry[index].dock,y:geometry[index].dock.y-scroll};
  if(dock.y>=16&&dock.y+dock.width/.75<=viewport.height-16)return dock;
  const parked=parkedMargins[breakpoint()];
  return {x:viewport.width-parked.width-parked.right,y:viewport.height*parked.y,width:parked.width};
 }
 function setPose(value,angle=0){
  pose=value;character.style.transform=`translate3d(${value.x}px,${value.y}px,0) scale(${value.width/base}) rotate(${angle}deg)`;
  const detailPose=i18n.ready?value:model.closeUp(viewport.width,viewport.height,preferences.ride);
  const quad=model.detailQuad(detailPose,preferences.ride);
  // Rasterize the detail at its native size, never magnify a small cached layer.
  detail.style.transform=`translate3d(${quad.x}px,${quad.y}px,0) scale(${quad.width/3840})`;
  const threshold=Math.max(viewport.width,viewport.height*.75);
  detail.style.opacity=detailReady?(i18n.ready?String(model.ease((value.width-threshold)/threshold)):'.001'):'0';
  if(!i18n.ready){
   const mobile=viewport.width<=700,max=Math.min(speech.offsetWidth||(mobile?160:220),mobile?160:220);
   const x=model.clamp(value.x+value.width*(mobile?.95:.64),16,viewport.width-max-16);
   speech.style.transform=`translate3d(${x}px,${Math.max(76,value.y+value.width/.75*.14)}px,0)`;
  }
 }
 function poseFrame(index){if(sprite.dataset.frame!==String(index))window.SPOTRA_SPRITES.render(sprite,index);}
 function updateControls(){
  controls.forEach(button=>{button.textContent=i18n.t(paused?'motion.play':'motion.pause');button.setAttribute('aria-pressed',String(paused));});
  document.querySelectorAll('.replay-scene').forEach(button=>button.disabled=paused||motion.matches);
  layer.dataset.paused=String(paused||motion.matches);
 }
 function markSection(index){
  layer.dataset.section=chapterKey(index);
  document.querySelectorAll('.product-nav a').forEach(link=>{if(link.getAttribute('href')==='#'+chapters[index].id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
 function showMobileChapter(index){
  // Preserve measured document geometry, but reveal only the current mobile
  // scene. Visibility changes occur behind the covered camera midpoint.
  chapters.forEach((element,i)=>{
   const inactive=mobileScene.matches&&i!==index;
   element.dataset.mobileScene=inactive?'hidden':'current';
   element.inert=inactive;
   if(inactive)element.setAttribute('aria-hidden','true');else element.removeAttribute('aria-hidden');
  });
 }
 function switchScene(){
  if(!transition||transition.switched)return;
  transition.switched=true;layer.dataset.greeting='false';
  showMobileChapter(transition.to);
  shell.scrollTo({top:transition.scroll,behavior:'instant'});
  if(transition.entry){
   welcome.hidden=true;welcome.style.pointerEvents='';document.body.classList.remove('welcome-open');
  }
  layer.dataset.phase='covered';layer.dataset.sceneChangedAt=String(performance.now()-transition.start);
 }
 function finish(){
  if(!transition)return;
  switchScene();const completed=transition;transition=null;active=completed.to;
  layer.dataset.lastDuration=String(Math.round(performance.now()-completed.start));layer.dataset.maxFrameGap=String(Math.round(completed.maxFrameGap));
  shell.classList.remove('is-cinema-transition');poseFrame(0);setPose(target(active));markSection(active);
  layer.dataset.state=paused?'paused':'idle';layer.dataset.phase='docked';layer.dataset.ready='true';
  wheelBlockedUntil=Math.max(wheelBlockedUntil,performance.now()+140);
  if(completed.entry){window.dispatchEvent(new Event('spotra:entered'));completed.resolve?.();}
 }
 function begin(index,entry=false,resolve){
  if(transition)return;
  const simple=paused||motion.matches,scroll=sceneScroll(index);
  transition={from:{...pose},to:index,scroll,start:performance.now(),duration:simple?120:duration,peak:model.closeUp(viewport.width,viewport.height,preferences.ride),destination:target(index,scroll),entry,resolve,simple,switched:false,maxFrameGap:0};
  count++;layer.dataset.transitionCount=String(count);layer.dataset.state='transition';layer.dataset.phase='approach';
  layer.dataset.from=entry?'welcome':chapterKey(active);layer.dataset.to=chapterKey(index);
  layer.dataset.sceneChangedAt='';shell.classList.add('is-cinema-transition');
  sprite.style.transform='';look={x:0,y:0};cycle=null;poseFrame(0);speech.hidden=true;
  kick();
 }
 function kick(){if(!frame){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
 function tick(now){
  frame=0;const elapsed=Math.max(1,now-lastTime),dt=Math.min(40,elapsed);lastTime=now;let keep=false;
  if(transition){
   transition.maxFrameGap=Math.max(transition.maxFrameGap,elapsed);
   const t=model.clamp((now-transition.start)/transition.duration,0,1);
   if(transition.simple){if(t>=.5)switchScene();setPose(transition.switched?transition.destination:transition.from);}
   else{
    setPose(model.cameraPose(transition.from,transition.peak,transition.destination,t,preferences.ride));
    // Change the world only inside the brief, opaque torso close-up.
    if(t>=.48)switchScene();
    layer.dataset.phase=t<.4?'approach':t<=.55?'covered':'reveal';
   }
   if(t>=1)finish();else keep=true;
  }
  if(!transition){
   // A browser focus/scroll-into-view adjustment is not chapter navigation.
   // Only a completed guide transition changes the active chapter.
   if(i18n.ready&&!resizing)markSection(active);
   const destination=target(active),distance=Math.hypot(pose.x-destination.x,pose.y-destination.y)+Math.abs(pose.width-destination.width);
   if(distance>.25){const blend=paused||motion.matches?1:1-Math.exp(-dt/55);setPose({x:model.mix(pose.x,destination.x,blend),y:model.mix(pose.y,destination.y,blend),width:model.mix(pose.width,destination.width,blend)});keep=true;}else setPose(destination);
   if(cycle){const elapsed=now-cycle;poseFrame(Math.min(7,Math.floor(elapsed/100)));if(elapsed>=800){cycle=null;poseFrame(0);}else keep=true;}
   if(i18n.ready&&viewport.width>700&&pointer.matches&&!paused&&!motion.matches){
    const blend=1-Math.exp(-dt/110);look={x:model.mix(look.x,mouse.x,blend),y:model.mix(look.y,mouse.y,blend)};
    sprite.style.transform=`translate3d(${look.x}px,${look.y}px,0) rotate(${look.x*.12}deg)`;
    if(Math.abs(look.x-mouse.x)+Math.abs(look.y-mouse.y)>.05)keep=true;
   }
  }
  if(keep&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);
 }
 async function enter(){
  if(i18n.ready||entering)return;
  entering=true;
  // The preload runs while preferences are chosen, before the camera begins.
  await Promise.all([detailLoaded,greeting.decode().catch(()=>{})]);
  // Warm the image layer before measuring the first cinematic frame.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  measure();setPose(welcomeDock);paused=welcome.classList.contains('is-paused');updateControls();
  shell.hidden=false;shell.inert=false;shell.scrollTo({top:0,behavior:'instant'});
  i18n.ready=true;welcome.inert=true;welcome.style.pointerEvents='none';measure();
  showMobileChapter(0);
  await new Promise(resolve=>begin(0,true,resolve));
 }
 function setPaused(value){
  paused=value;document.body.classList.toggle('motion-paused',paused);updateControls();
  if(transition)finish();cycle=null;poseFrame(0);sprite.style.transform='';look={x:0,y:0};kick();
 }
 function handleInput(delta){
  if(!i18n.ready||document.querySelector('dialog[open]'))return false;
  if(transition)return true;
  const direction=Math.sign(delta);
  if(active===lastChapter&&direction>0)return false;
  if(active===0&&direction<0)return false;
  const {start,end}=readingBounds(active);
  const action=model.intent(shell.scrollTop,start,end,delta);
  if(action.navigate){const next=active+action.navigate;if(next>=0&&next<=lastChapter)begin(next);else return false;}
  else shell.scrollTo({top:action.scroll,behavior:'instant'});
  return true;
 }
 // Taps on links/buttons remain native. Vertical swipes over them follow the
 // same chapter boundaries as swipes over text; only actual form editing opts out.
 function formTarget(element){return element.closest('input,select,textarea,[contenteditable="true"],.ride-settings-panel');}
 function resetTouch(){touchOrigin=null;touchY=null;touchDirection='pending';touchConsumed=false;}
 shell.addEventListener('wheel',event=>{
  if(mobileScene.matches&&document.querySelector('dialog[open]'))return;
  const now=performance.now();if(Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.ctrlKey||event.target.closest('.ride-settings-panel'))return;
  if(transition||now<wheelBlockedUntil){event.preventDefault();wheelBlockedUntil=now+140;lastWheel=now;return;}
  const direction=Math.sign(event.deltaY),delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.height:1);
  if(now-lastWheel>160||direction!==wheelDirection)wheelTotal=0;
  lastWheel=now;wheelDirection=direction;wheelTotal+=Math.abs(delta);
  if((active!==lastChapter||direction<0)&&(active!==0||direction>0)){
   event.preventDefault();if(wheelTotal>=30){handleInput(delta);wheelTotal=0;}
  }
 },{passive:false});
 shell.addEventListener('touchstart',event=>{
  resetTouch();
  if(event.touches.length!==1||formTarget(event.target))return;
  const point=event.touches[0];touchOrigin={x:point.clientX,y:point.clientY};touchY=point.clientY;
 },{passive:true});
 shell.addEventListener('touchmove',event=>{
  if(event.touches.length!==1){resetTouch();return;}
  if(!touchOrigin||!event.touches[0])return;
  const point=event.touches[0],y=point.clientY;
  if(touchDirection==='pending')touchDirection=model.touchAxis(touchOrigin,{x:point.clientX,y});
  if(touchDirection!=='vertical')return;
  if(transition||touchConsumed){event.preventDefault();return;}
  const delta=touchY-y;
  if(!delta)return;
  if(handleInput(delta)){event.preventDefault();touchY=y;if(transition)touchConsumed=true;}
 },{passive:false});
 shell.addEventListener('touchend',resetTouch,{passive:true});
 shell.addEventListener('touchcancel',resetTouch,{passive:true});
 document.addEventListener('keydown',event=>{
  if(!i18n.ready||event.target.closest('input,select,textarea,[contenteditable="true"]')||event.key===' '&&event.target.closest('button,a,summary'))return;
  const direction=['ArrowDown','PageDown',' '].includes(event.key)?1:['ArrowUp','PageUp'].includes(event.key)?-1:0;
  if(direction&&handleInput(direction*(event.key.startsWith('Arrow')?60:viewport.height*.85)))event.preventDefault();
 });
 function navigate(element){
  const index=element?.id==='app'?1:chapters.indexOf(element);
  if(index<0||!i18n.ready)return false;
  if(!transition&&(index!==active||Math.abs(shell.scrollTop-sceneScroll(index))>2))begin(index);
  return true;
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link)return;
  const href=link.getAttribute('href'),element=href==='#'?chapters[0]:document.getElementById(href.slice(1));
  if(navigate(element)){event.preventDefault();event.stopImmediatePropagation();document.querySelector('#navigation').classList.remove('open');const menu=document.querySelector('.menu-toggle');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',i18n.t('menu.open'));}
 },true);
 controls.forEach(button=>button.addEventListener('click',()=>setPaused(!paused)));
 window.addEventListener('spotra:pausechange',event=>setPaused(event.detail.paused));
 window.addEventListener('spotra:replay',()=>{if(!transition&&!paused&&!motion.matches){if(mobileScene.matches)begin(active);else{cycle=performance.now();kick();}}});
 window.addEventListener('spotra:ridechange',()=>{sprite.dataset.vehicle=preferences.ride;poseFrame(0);kick();});
 window.addEventListener('spotra:languagechange',()=>{updateControls();refreshLayout();});
 shell.addEventListener('scroll',()=>{
  if(i18n.ready&&!transition&&!resizing){
   const {start,end}=readingBounds(active),top=model.clamp(shell.scrollTop,start,end);
   if(Math.abs(top-shell.scrollTop)>.5)shell.scrollTo({top,behavior:'instant'});
  }
  kick();
 },{passive:true});
 welcome.addEventListener('scroll',()=>{if(!i18n.ready){measure();kick();}},{passive:true});
 document.addEventListener('pointermove',event=>{if(!i18n.ready||viewport.width<=700||!pointer.matches||event.pointerType!=='mouse'||paused||motion.matches)return;mouse={x:(event.clientX/viewport.width-.5)*6,y:(event.clientY/viewport.height-.5)*4};kick();},{passive:true});
 document.addEventListener('pointerleave',()=>{mouse={x:0,y:0};kick();});
 window.addEventListener('resize',()=>{
  // Keep the same chapter when rotating a phone or resizing the window.
  // A same-width mobile toolbar resize also keeps the reading position.
  if(!resizing)resizeRead=i18n.ready&&!transition&&mobileScene.matches&&viewport.width===(shell.clientWidth||innerWidth)?Math.max(0,shell.scrollTop-sceneScroll(active)):null;
  resizing=true;clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{measure();if(transition)finish();if(i18n.ready){showMobileChapter(active);const {start,end}=readingBounds(active);shell.scrollTo({top:model.clamp(start+(resizeRead??0),start,end),behavior:'instant'});}resizeRead=null;resizing=false;kick();},100);
 });
 document.fonts.ready.then(()=>{measure();kick();});
 const layoutObserver=new ResizeObserver(refreshLayout);
 [...chapters,...document.querySelectorAll('.spotri-dock,.chapter-heading')].forEach(element=>layoutObserver.observe(element));
 motion.addEventListener('change',()=>{if(transition)finish();cycle=null;poseFrame(0);sprite.style.transform='';updateControls();kick();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;if(transition)finish();}else{measure();kick();}});
 document.querySelectorAll('dialog').forEach(dialog=>new MutationObserver(()=>{layer.dataset.covered=String(!!document.querySelector('dialog[open]'));}).observe(dialog,{attributes:true,attributeFilter:['open']}));
 // Let the visible greeting arrive before downloading the camera texture.
 // Entry still waits for its full-resolution decode before starting the zoom.
 const detailLoaded=greeting.decode().catch(()=>{}).then(()=>{
  const source=detail.parentElement?.querySelector('source[data-srcset]');
  if(source)source.srcset=source.dataset.srcset;
  if(detail.dataset.src)detail.src=detail.dataset.src;
  return detail.decode();
 }).then(()=>{detailReady=true;layer.dataset.detailReady='true';kick();}).catch(()=>{layer.dataset.detailReady='false';});
 layer.dataset.greeting='true';
 window.SPOTRI_GUIDE={enter,navigate};measure();setPose(welcomeDock);updateControls();kick();
})();
