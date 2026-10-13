(() => {
 'use strict';
 // Mobile has its own chapter composition. The full editorial copy remains in
 // the document and is opened on demand, rather than clipped or scaled down.
 const media=matchMedia('(max-width:700px), (max-width:1000px) and (max-height:500px) and (orientation:landscape)'),i18n=window.SPOTRA_I18N;
 const words={
  more:['Más información','Mais informações','More information'],close:['Cerrar','Fechar','Close'],
  map:['Spots, skateparks y tiendas cerca de ti.','Spots, pistas e lojas perto de você.','Spots, skateparks and shops near you.'],
  forum:['Comparte tus clips y conecta con tu crew.','Compartilhe seus vídeos e conecte sua crew.','Share your clips and connect with your crew.'],
  profile:['Tu disciplina, tus redes y tu historia.','Sua modalidade, suas redes e sua história.','Your discipline, your socials and your story.'],
  spots:['Descubre lugares y arma una sesión con otros riders.','Descubra lugares e organize uma sessão com outros riders.','Discover places and set up a session with other riders.'],
  events:['Encuentra juntadas, competencias y tu próximo desafío.','Encontre encontros, competições e seu próximo desafio.','Find meetups, competitions and your next challenge.'],
  identity:['Tu recorrido y tu comunidad, en tu SPOTRA ID.','Sua trajetória e sua comunidade no seu SPOTRA ID.','Your journey and your community, in your SPOTRA ID.'],
  nextForum:['Foro →','Fórum →','Forum →'],nextProfile:['Perfil →','Perfil →','Profile →'],nextSpots:['Spots →','Spots →','Spots →'],
  tabForum:['Foro','Fórum','Forum'],tabMarket:['Market','Market','Marketplace'],tabs:['Foro y Market','Fórum e Market','Forum and marketplace'],
  zoom:['Ampliar captura','Ampliar captura','Enlarge screenshot'],
  replay:['Volver a presentar esta pantalla','Apresentar esta tela novamente','Present this screen again']
 };
 const t=key=>words[key][{es:0,pt:1,en:2}[i18n.locale]??0];
 // Shared vector chrome follows the supplied phone reference on both layouts.
 const svgNS='http://www.w3.org/2000/svg';
 function statusIcon(viewBox,markup,className){
  const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox',viewBox);svg.setAttribute('aria-hidden','true');svg.classList.add(className);svg.innerHTML=markup;return svg;
 }
 document.querySelectorAll('.device-status').forEach(status=>{
  const muted=statusIcon('0 0 20 20','<path d="M7 4a5 5 0 0 1 8 4v3l2 3H7M8 17h4M3 2l15 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>','mobile-status-mute');
  status.querySelector(':scope>span:first-child').after(muted);
  const indicators=status.querySelector('.device-indicators');
  indicators.append(
   statusIcon('0 0 22 20','<rect x="1" y="13" width="4" height="6" rx="2" fill="currentColor"/><rect x="6.5" y="9" width="4" height="10" rx="2" fill="currentColor"/><rect x="12" y="5" width="4" height="14" rx="2" fill="currentColor"/><rect x="17.5" y="1" width="4" height="18" rx="2" fill="currentColor" opacity=".35"/>','mobile-status-signal'),
   statusIcon('0 0 24 20','<path d="M2 6a17 17 0 0 1 20 0M6 10a10 10 0 0 1 12 0M10 14a4 4 0 0 1 4 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/>','mobile-status-wifi'),
   statusIcon('0 0 34 20','<rect x="1" y="2" width="29" height="16" rx="5" fill="currentColor" opacity=".45"/><path d="M6 2h8v16H6a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5" fill="currentColor"/><path d="M31 7h1a2 2 0 0 1 0 6h-1" fill="currentColor" opacity=".45"/><text x="15.5" y="14.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" class="mobile-battery-number">36</text>','mobile-status-battery')
  );
 });
 // Section photography is part of index.html, independent of mobile controls.
 function label(element,key){element.dataset.mobileText=key;return element;}
 function button(key,fn){const e=label(document.createElement('button'),key);e.type='button';e.className='mobile-more';e.addEventListener('click',fn);return e;}
 const dialog=document.createElement('dialog');dialog.id='mobile-detail';dialog.className='mobile-detail-dialog';dialog.setAttribute('aria-labelledby','mobile-detail-title');
 const bar=document.createElement('div');bar.className='mobile-detail-bar';
 const title=document.createElement('h2');title.id='mobile-detail-title';
 const close=button('close',()=>dialog.close());close.className='mobile-detail-close';
 bar.append(title,close);const content=document.createElement('div');content.className='mobile-detail-content';dialog.append(bar,content);document.body.append(dialog);
 let opener=null,detailSource=null;
 function renderDetail(){
  if(!detailSource)return;
  title.textContent=detailSource.title.innerText.replace(/\s+/g,' ').trim();
  content.replaceChildren(...detailSource.nodes.map(node=>{
   const clone=node.cloneNode(true);clone.removeAttribute('id');clone.className='';
   clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
   return clone;
  }));
 }
 function showDetail(heading,nodes,source){opener=source;detailSource={title:heading,nodes};renderDetail();dialog.showModal();content.scrollTop=0;}
 dialog.addEventListener('close',()=>{detailSource=null;opener?.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 document.querySelectorAll('.product-scene').forEach((scene,index)=>{
  const message=scene.querySelector('.presenter-message'),text=message.querySelector('.scene-description'),heading=message.querySelector('h3');
  const summary=label(document.createElement('div'),['map','forum','profile'][index]);summary.className='mobile-summary';text.after(summary);text.classList.add('mobile-full-copy');
  const actions=scene.querySelector('.presenter-actions'),original=actions.querySelector('[data-present-next]');
  original.classList.add('desktop-next');
  const next=button(['nextForum','nextProfile','nextSpots'][index],()=>original.click());next.className='mobile-next';
  const more=button('more',()=>showDetail(heading,[text],more));actions.prepend(next,more);
  const link=scene.querySelector('.product-device>a');link.addEventListener('click',event=>{if(media.matches){event.preventDefault();showDetail(heading,[link.querySelector('.device-capture img')],link);}});
  const hint=button('zoom',()=>showDetail(heading,[link.querySelector('.device-capture img')],hint));hint.className='mobile-zoom';scene.querySelector('figcaption').append(hint);
 });
 [
  ['.spot-copy','spots',['p:not(.eyebrow)','.feature-lines']],
  ['.event-copy','events',['p:not(.eyebrow)','.event-words']],
  ['.identity-copy','identity',['p:not(.eyebrow)']]
 ].forEach(([selector,key,selectors])=>{
  const copy=document.querySelector(selector),nodes=selectors.map(s=>copy.querySelector(':scope>'+s)),heading=copy.querySelector('h2');
  nodes.forEach(n=>n.classList.add('mobile-full-copy'));
  const summary=label(document.createElement('div'),key);summary.className='mobile-summary';heading.after(summary);
  const actions=document.createElement('div');actions.className='mobile-chapter-actions';
  const cta=copy.querySelector(':scope>[data-show],:scope>[data-launch]');cta.before(actions);actions.append(cta);
  const more=button('more',()=>showDetail(heading,nodes,more));actions.append(more);
 });
 const community=document.querySelector('#comunidad'),panels=[...community.querySelectorAll('.editorial-item')];
 const tabs=document.createElement('div');tabs.className='mobile-community-tabs';tabs.setAttribute('role','tablist');label(tabs,'tabs');
 let selected=0;
 panels.forEach((panel,index)=>{
  panel.id='community-panel-'+index;
  const tab=button(index?'tabMarket':'tabForum',()=>selectPanel(index));tab.className='mobile-community-tab';tab.id='community-tab-'+index;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);tabs.append(tab);
 });
 community.querySelector('.editorial-grid').before(tabs);
 function selectPanel(index){selected=index;panels.forEach((p,i)=>{p.dataset.mobileActive=String(i===index);if(media.matches){p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby','community-tab-'+i);}else{p.removeAttribute('role');p.removeAttribute('aria-labelledby');}});[...tabs.children].forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});}
 tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();selectPanel(event.key==='Home'?0:event.key==='End'?1:1-selected);tabs.children[selected].focus({preventScroll:true});});
 document.querySelectorAll('.faq-list details').forEach(item=>{
  item.querySelector('summary').addEventListener('click',event=>{if(media.matches){event.preventDefault();showDetail(item.querySelector('summary'),[item.querySelector('p')],item.querySelector('summary'));}});
 });
 const replayLabels=[...document.querySelectorAll('.replay-scene')].map(e=>[e,e.getAttribute('aria-label')]);
 function translate(){document.querySelectorAll('[data-mobile-text]').forEach(e=>{if(e===tabs)e.setAttribute('aria-label',t(e.dataset.mobileText));else e.textContent=t(e.dataset.mobileText);});replayLabels.forEach(([e,original])=>e.setAttribute('aria-label',media.matches?t('replay'):original));renderDetail();}
 media.addEventListener('change',()=>{selectPanel(selected);translate();if(dialog.open)dialog.close();document.querySelectorAll('.faq-list details').forEach(e=>e.open=false);});
 window.addEventListener('spotra:languagechange',translate);selectPanel(0);translate();
})();
