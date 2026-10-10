(() => {
 'use strict';
 const scenes=[...document.querySelectorAll('.product-scene')];
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 function goTo(element){
  if(!element) return;
  if(window.SPOTRI_GUIDE?.navigate(element))return;
  element.scrollIntoView({behavior:document.body.classList.contains('motion-paused')||motion.matches?'instant':'smooth',block:'start'});
 }
 scenes.forEach(scene=>scene.querySelector('[data-replay]').addEventListener('click',()=>{
  window.dispatchEvent(new CustomEvent('spotra:replay',{detail:{id:scene.id}}));
 }));
 document.querySelectorAll('[data-present-next]').forEach(button=>button.addEventListener('click',()=>goTo(document.getElementById(button.dataset.presentNext))));
 document.querySelectorAll('.product-nav a,[data-spotri-start]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();goTo(document.querySelector(link.getAttribute('href')));}));
})();
