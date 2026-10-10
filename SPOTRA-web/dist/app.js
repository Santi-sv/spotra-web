(() => {
 'use strict';
 const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
 const sceneIds = {map:'app-map',community:'app-community',profile:'app-profile'};
 document.querySelectorAll('a[href="#"]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  if(window.SPOTRI_GUIDE?.navigate(document.querySelector('.hero')))return;
  document.getElementById('site-shell').scrollTo({top:0,behavior:motionPreference.matches||document.body.classList.contains('motion-paused')?'instant':'smooth'});
  history.replaceState(null,'',location.pathname+location.search);
 }));
 function showScene(view) {
  const scene = document.getElementById(sceneIds[view]);
  if(window.SPOTRI_GUIDE?.navigate(scene))return;
  if (scene) scene.scrollIntoView({behavior:motionPreference.matches||document.body.classList.contains('motion-paused')?'instant':'smooth',block:'start'});
 }
 document.querySelectorAll('[data-show]').forEach(button => button.addEventListener('click', () => showScene(button.dataset.show)));
 const menu = document.querySelector('.menu-toggle');
 const navigation = document.getElementById('navigation');
 function closeMenu() {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label',window.SPOTRA_I18N.t('menu.open'));
 }
 menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? window.SPOTRA_I18N.t('menu.close') : window.SPOTRA_I18N.t('menu.open'));
 });
 navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
 document.addEventListener('keydown', event => {if(event.key === 'Escape') closeMenu();});
})();
