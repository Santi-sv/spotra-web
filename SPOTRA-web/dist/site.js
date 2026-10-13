/* SPOTRA web */
if(!window.SPOTRA_BOT){
/* journey-sprites.js */
(() => {
 'use strict';
 const frames={"skate":[{"sourceRect":{"x":49,"y":45,"width":301,"height":464},"centerX":199.5,"groundY":504},{"sourceRect":{"x":430,"y":48,"width":304,"height":461},"centerX":582.0,"groundY":504},{"sourceRect":{"x":812,"y":45,"width":303,"height":464},"centerX":963.5,"groundY":504},{"sourceRect":{"x":1165,"y":52,"width":343,"height":457},"centerX":1336.5,"groundY":504},{"sourceRect":{"x":19,"y":543,"width":376,"height":443},"centerX":207.0,"groundY":981},{"sourceRect":{"x":449,"y":540,"width":306,"height":446},"centerX":602.0,"groundY":981},{"sourceRect":{"x":810,"y":544,"width":300,"height":442},"centerX":960.0,"groundY":981},{"sourceRect":{"x":1199,"y":539,"width":300,"height":447},"centerX":1349.0,"groundY":981}],"bmx":[{"sourceRect":{"x":21,"y":60,"width":363,"height":447},"centerX":202.5,"groundY":502},{"sourceRect":{"x":404,"y":59,"width":365,"height":448},"centerX":586.5,"groundY":502},{"sourceRect":{"x":786,"y":59,"width":369,"height":447},"centerX":970.5,"groundY":501},{"sourceRect":{"x":1180,"y":59,"width":349,"height":447},"centerX":1354.5,"groundY":501},{"sourceRect":{"x":17,"y":541,"width":370,"height":446},"centerX":202.0,"groundY":982},{"sourceRect":{"x":401,"y":541,"width":369,"height":446},"centerX":585.5,"groundY":982},{"sourceRect":{"x":784,"y":540,"width":371,"height":447},"centerX":969.5,"groundY":982},{"sourceRect":{"x":1169,"y":540,"width":361,"height":447},"centerX":1349.5,"groundY":982}],"rollers":[{"sourceRect":{"x":75,"y":47,"width":241,"height":466},"centerX":195.5,"groundY":508},{"sourceRect":{"x":409,"y":45,"width":311,"height":464},"centerX":564.5,"groundY":504},{"sourceRect":{"x":758,"y":43,"width":361,"height":468},"centerX":938.5,"groundY":506},{"sourceRect":{"x":1171,"y":44,"width":301,"height":467},"centerX":1321.5,"groundY":506},{"sourceRect":{"x":50,"y":530,"width":270,"height":457},"centerX":185.0,"groundY":982},{"sourceRect":{"x":374,"y":536,"width":366,"height":451},"centerX":557.0,"groundY":982},{"sourceRect":{"x":765,"y":534,"width":364,"height":453},"centerX":947.0,"groundY":982},{"sourceRect":{"x":1225,"y":533,"width":250,"height":454},"centerX":1350.0,"groundY":982}],"scooter":[{"sourceRect":{"x":56,"y":33,"width":285,"height":467},"centerX":198.5,"groundY":495},{"sourceRect":{"x":443,"y":30,"width":271,"height":471},"centerX":578.5,"groundY":496},{"sourceRect":{"x":814,"y":30,"width":276,"height":471},"centerX":952.0,"groundY":496},{"sourceRect":{"x":1163,"y":39,"width":330,"height":462},"centerX":1328.0,"groundY":496},{"sourceRect":{"x":27,"y":532,"width":365,"height":449},"centerX":209.5,"groundY":976},{"sourceRect":{"x":448,"y":522,"width":313,"height":459},"centerX":604.5,"groundY":976},{"sourceRect":{"x":851,"y":527,"width":256,"height":457},"centerX":979.0,"groundY":979},{"sourceRect":{"x":1203,"y":525,"width":285,"height":458},"centerX":1345.5,"groundY":978}]};
 // Each pose has its own bounds: preserve extended feet and every wheel.
 function render(element,index=0){
  const frame=frames[element.dataset.vehicle]?.[index];
  if(!frame)return;
  const r=frame.sourceRect;
  const values={
   '--frame-width':r.width/384*100+'%',
   '--frame-height':r.height/512*100+'%',
   '--frame-left':(192-frame.centerX+r.x)/384*100+'%',
   '--frame-top':(504-frame.groundY+r.y)/512*100+'%',
   '--frame-size':1536/r.width*100+'% '+1024/r.height*100+'%',
   '--frame-position':r.x/(1536-r.width)*100+'% '+r.y/(1024-r.height)*100+'%'
  };
  Object.entries(values).forEach(([key,value])=>element.style.setProperty(key,value));
  element.dataset.frame=String(index);
 }
 window.SPOTRA_SPRITES={render};
 document.querySelectorAll('.ride-sprite').forEach(element=>render(element));
})();

;
/* journey-model.js */
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

;
/* i18n.js */
(() => {
 'use strict';
 const locales={es:'es-419',pt:'pt-BR',en:'en'};
 let locale='es';
 const translations={};
 const bindings=[];
 function b(key,selector,es,pt,en,kind='text') {translations[key]={es,pt,en};if(selector)bindings.push({key,selector,kind});}
 b('meta.title',null,'SPOTRA — Spots de skate, BMX y rollers en Latinoamérica','SPOTRA — Spots de skate, BMX e patins na América Latina','SPOTRA — Skate, BMX & roller spots across Latin America');
 b('meta.description',null,'Encuentra spots y skateparks cerca, arma sesiones con otros riders, sigue eventos y vende tu equipo usado. Gratis para skate, BMX, rollers y scooter.','Encontre spots e pistas de skate perto de você, combine sessões, acompanhe eventos e venda seu equipamento usado. Grátis para skate, BMX, patins e patinete.','Find skate spots and skateparks near you, set up sessions with other riders, follow events and sell your used gear. Free for skate, BMX, rollers and scooter.');
 b('skip','.skip','Saltar al contenido','Pular para o conteúdo','Skip to content');
 b('nav.app','#navigation a:nth-child(1)','La app','O app','The app');
 b('nav.spots','#navigation a:nth-child(2),.footer-main a[href="#spots"]','Spots y sesiones','Spots e sessões','Spots & sessions');
 b('nav.community','#navigation a:nth-child(3)','Comunidad','Comunidade','Community');
 b('nav.label','#navigation','Navegación principal','Navegação principal','Main navigation','aria-label');
 b('nav.home','.header .brand','SPOTRA, inicio','SPOTRA, início','SPOTRA, home','aria-label');
 b('menu.open',null,'Abrir menú','Abrir menu','Open menu');
 b('menu.close',null,'Cerrar menú','Fechar menu','Close menu');
 b('language.label','#language-label','Cambiar idioma','Mudar idioma','Change language');
 b('launch','[data-launch]','Probar SPOTRA','Experimentar SPOTRA','Try SPOTRA');
 b('hero.eyebrow','.hero-content>.eyebrow','<span class="tiny-mark">S.</span> LA CALLE NOS CONECTA / LATINOAMÉRICA','<span class="tiny-mark">S.</span> A RUA NOS CONECTA / AMÉRICA LATINA','<span class="tiny-mark">S.</span> THE STREETS CONNECT US / LATIN AMERICA','html');
 b('hero.title','#hero-title','TU PRÓXIMA <br>SESIÓN <br><span>EMPIEZA AQUÍ.</span>','SUA PRÓXIMA <br>SESSÃO <br><span>COMEÇA AQUI.</span>','YOUR NEXT <br>SESSION <br><span>STARTS HERE.</span>','html');
 b('hero.body','.hero-bottom>p','Encuentra tu spot. Arma la sesión. <br>Conecta con quienes ruedan como tú.','Encontre seu spot. Organize a sessão. <br>Conecte-se com quem anda como você.','Find your spot. Set up a session. <br>Connect with people who ride like you.','html');
 b('hero.app','.hero-buttons .text-link','Conoce la app','Conheça o app','Meet the app');
 b('riders','.hero-note span:last-child,.welcome-brand>span','HECHO POR LA COMUNIDAD, PARA LA COMUNIDAD.','FEITO PELA COMUNIDADE, PARA A COMUNIDADE.','MADE BY THE COMMUNITY, FOR THE COMMUNITY.');
 b('hero.alt','.hero-image','Skater en el aire sobre un bowl durante una sesión nocturna','Skatista no ar sobre um bowl durante uma sessão noturna','Skater airborne above a bowl during a night session','alt');
 b('ticker.label','.ticker','Mapa, sesiones, eventos, market, foro, SPOTRA ID','Mapa, sessões, eventos, market, fórum, SPOTRA ID','Map, sessions, events, marketplace, forum, SPOTRA ID','aria-label');
 b('ticker.sessions','.ticker-group span:nth-of-type(2)','SESIONES','SESSÕES','SESSIONS');
 b('ticker.events','.ticker-group span:nth-of-type(3)','EVENTOS','EVENTOS','EVENTS');
 b('ticker.forum','.ticker-group span:nth-of-type(5)','FORO','FÓRUM','FORUM');
 b('product.title','#product-title','01 / SPOTRA POR DENTRO','01 / POR DENTRO DA SPOTRA','01 / INSIDE SPOTRA');
 b('product.nav','.product-nav','Conoce las pantallas de SPOTRA','Conheça as telas da SPOTRA','Explore SPOTRA screens','aria-label');
 b('product.map','.product-nav a:nth-child(1)','Mapa','Mapa','Map');
 b('product.forum','.product-nav a:nth-child(2)','Foro','Fórum','Forum');
 b('product.profile','.product-nav a:nth-child(3)','Perfil','Perfil','Profile');
 b('map.label','.scene-map .presenter-message>.eyebrow','MAPA COLABORATIVO','MAPA COLABORATIVO','COMMUNITY SPOT MAP');
 b('forum.label','.scene-community .presenter-message>.eyebrow','CLIPS / FOTOS / TU CREW','VÍDEOS / FOTOS / SUA CREW','CLIPS / PHOTOS / YOUR CREW');
 b('profile.label','.scene-profile .presenter-message>.eyebrow','TU DISCIPLINA / TU HISTORIA','SUA MODALIDADE / SUA HISTÓRIA','YOUR DISCIPLINE / YOUR STORY');
 b('map.title','#map-title','Mapa de spots','Mapa de spots','Spot map');
 b('map.text','.scene-map .scene-description','Te muestro el mapa. Encuentra spots, skateparks y tiendas, mira sus fotos y descubre cómo llegar. Comparte ese lugar que solo tu crew conoce.','Vou te mostrar o mapa. Encontre spots, pistas e lojas, veja fotos e descubra como chegar. Compartilhe aquele lugar que só a sua crew conhece.','Let me show you the map. Find spots, skateparks and shops, check their photos and get directions. Share that place only your crew knows.');
 b('map.next','.scene-map [data-present-next]','Ahora, tu comunidad','Agora, sua comunidade','Next, your community');
 b('map.caption','.scene-map figcaption span:first-child','MAPA DE SPOTS','MAPA DE SPOTS','SPOT MAP');
 b('map.zoom','.scene-map .product-device>a','Ampliar captura real del mapa de SPOTRA','Ampliar captura real do mapa da SPOTRA','Enlarge the real SPOTRA map screenshot','aria-label');
 b('map.alt','.scene-map .device-frame img','Mapa real de SPOTRA con spots, skateparks, filtros y navegación inferior','Mapa real da SPOTRA com spots, pistas, filtros e navegação inferior','Real SPOTRA map with spots, skateparks, filters and bottom navigation','alt');
 b('forum.title','#forum-title','Foro y comunidad','Fórum e comunidade','Forum & community');
 b('forum.text','.scene-community .scene-description','Ese truco que costó cien intentos merece compartirse. Publica clips y fotos, sigue a otros riders y descubre qué está pasando en tu ciudad.','Aquela manobra que levou cem tentativas merece ser compartilhada. Publique vídeos e fotos, siga outros riders e descubra o que acontece na sua cidade.','That trick that took a hundred tries deserves to be shared. Post clips and photos, follow other riders and find out what’s happening in your city.');
 b('forum.next','.scene-community [data-present-next]','Conoce tu perfil','Conheça seu perfil','Meet your profile');
 b('forum.caption','.scene-community figcaption span:first-child','FORO Y COMUNIDAD','FÓRUM E COMUNIDADE','FORUM & COMMUNITY');
 b('forum.zoom','.scene-community .product-device>a','Ampliar captura real del foro de SPOTRA','Ampliar captura real do fórum da SPOTRA','Enlarge the real SPOTRA forum screenshot','aria-label');
 b('forum.alt','.scene-community .device-frame img','Foro real de SPOTRA con una publicación de bienvenida y su navegación inferior','Fórum real da SPOTRA com uma publicação de boas-vindas e navegação inferior','Real SPOTRA forum with a welcome post and bottom navigation','alt');
 b('profile.title','#profile-title','Tu perfil rider','Seu perfil rider','Your rider profile');
 b('profile.text','.scene-profile .scene-description','Tu disciplina, tus redes y tus publicaciones, en un mismo lugar. Muestra tu forma de rodar y conecta con quienes comparten tu pasión.','Sua modalidade, suas redes e suas publicações em um só lugar. Mostre seu jeito de andar e conecte-se com quem compartilha sua paixão.','Your discipline, your socials and your posts, all in one place. Show your riding style and connect with people who share your passion.');
 b('profile.next','.scene-profile [data-present-next]','Salgamos a rodar','Vamos andar','Let’s go ride');
 b('profile.caption','.scene-profile figcaption span:first-child','PERFIL RIDER','PERFIL RIDER','RIDER PROFILE');
 b('profile.zoom','.scene-profile .product-device>a','Ampliar el mockup del perfil de Santiago','Ampliar o mockup do perfil de Santiago','Enlarge the Santiago profile mockup','aria-label');
 b('profile.alt','.scene-profile .device-frame img','Perfil ilustrativo de Santiago en SPOTRA con 3489 seguidores, 1340 seguidos y seis publicaciones','Perfil ilustrativo de Santiago na SPOTRA com 3489 seguidores, 1340 seguindo e seis publicações','Illustrative SPOTRA profile for Santiago with 3489 followers, 1340 following and six posts','alt');
 b('motion.replay','[data-replay]','Animar a SPOTRI','Animar o SPOTRI','Animate SPOTRI','aria-label');
 b('motion.pause',null,'Pausar animación','Pausar animação','Pause animation');
 b('motion.play',null,'Activar animación','Ativar animação','Enable animation');
 b('spots.eyebrow','.spot-copy .eyebrow','02 / SPOTS Y SESIONES','02 / SPOTS E SESSÕES','02 / SPOTS & SESSIONS');
 b('spots.title','.spot-copy h2','LA CIUDAD <br>ES TU <br><span>SPOT.</span>','A CIDADE <br>É SEU <br><span>SPOT.</span>','THE CITY <br>IS YOUR <br><span>SPOT.</span>','html');
 b('spots.text','.spot-copy>p:not(.eyebrow)','No te quedes siempre en el mismo lugar. Explora spots, skateparks y tiendas en el mapa colaborativo. Comparte lo que descubriste y arma una sesión con otros riders.','Não fique sempre no mesmo lugar. Explore spots, pistas e lojas no mapa colaborativo. Compartilhe suas descobertas e organize uma sessão com outros riders.','Don’t always ride the same place. Explore spots, skateparks and shops on the community map. Share your discoveries and set up a session with other riders.');
 b('spots.feature1','.feature-lines li:nth-child(1)','Fotos, información y cómo llegar','Fotos, informações e como chegar','Photos, information and directions');
 b('spots.feature2','.feature-lines li:nth-child(2)','Sesiones y avisos para salir a rodar','Sessões e avisos para sair e andar','Sessions and alerts to get you riding');
 b('spots.feature3','.feature-lines li:nth-child(3)','Presencia de riders y estado del spot','Presença de riders e condições do spot','Rider presence and spot conditions');
 b('spots.explore','.spot-copy [data-show]','Explora el mapa','Explore o mapa','Explore the map');
 b('spots.alt','.spot-photo img','Rider de BMX haciendo un truco sobre un pasamanos','Rider de BMX fazendo uma manobra em um corrimão','BMX rider doing a trick on a handrail','alt');
 b('spots.photo','.photo-top>span:first-child','UN NUEVO LUGAR. <br>UNA NUEVA LÍNEA.','UM NOVO LUGAR. <br>UMA NOVA LINHA.','A NEW PLACE. <br>A NEW LINE.','html');
 b('spots.shops','.photo-tags>span:last-child','TIENDAS','LOJAS','SHOPS');
 b('events.alt','.event-image img','Encuentro de BMX y skate en una plaza al atardecer','Encontro de BMX e skate em uma praça ao pôr do sol','BMX and skate gathering in a plaza at sunset','alt');
 b('events.stamp','.image-stamp','NOS VEMOS <br>EN EL PARK.','A GENTE SE VÊ <br>NA PISTA.','SEE YOU <br>AT THE PARK.','html');
 b('events.eyebrow','.event-copy .eyebrow','03 / EVENTOS Y COMPETENCIAS','03 / EVENTOS E COMPETIÇÕES','03 / EVENTS & COMPETITIONS');
 b('events.title','.event-copy h2','DALE LUGAR <br>A TU <br><span class="green">PROGRESO.</span>','DÊ ESPAÇO <br>À SUA <br><span class="green">EVOLUÇÃO.</span>','MAKE ROOM <br>FOR YOUR <br><span class="green">PROGRESS.</span>','html');
 b('events.text','.event-copy>p:not(.eyebrow)','De una juntada a una competencia. Encuentra eventos por disciplina, fecha y cercanía. Inscríbete, sigue tus eventos y consulta el ranking.','De um encontro a uma competição. Encontre eventos por modalidade, data e proximidade. Inscreva-se, acompanhe seus eventos e confira o ranking.','From a meetup to a competition. Find events by discipline, date and location. Sign up, follow your events and check the rankings.');
 b('events.meetups','.event-words span:nth-child(1)','JUNTADAS','ENCONTROS','MEETUPS');
 b('events.contests','.event-words span:nth-child(2)','COMPETENCIAS','COMPETIÇÕES','COMPETITIONS');
 b('community.eyebrow','.community-section .section-title .eyebrow','04 / LA ESCENA LA HACEMOS ENTRE TODOS','04 / A CENA É FEITA POR TODOS NÓS','04 / WE BUILD THE SCENE TOGETHER');
 b('community.title','.community-section h2','TU CREW. <br><span class="green">TU COMUNIDAD.</span>','SUA CREW. <br><span class="green">SUA COMUNIDADE.</span>','YOUR CREW. <br><span class="green">YOUR COMMUNITY.</span>','html');
 b('community.text','.community-section .section-title>p','Lo que pasa entre una sesión y la siguiente también es parte de rodar.','O que acontece entre uma sessão e outra também faz parte de andar.','What happens between sessions is part of riding, too.');
 b('community.forum','.editorial-item:first-child .eyebrow','01 / FORO','01 / FÓRUM','01 / FORUM');
 b('community.forum.title','.editorial-item:first-child h3','Ese truco merece <br>ser compartido.','Essa manobra merece <br>ser compartilhada.','That trick deserves <br>to be shared.','html');
 b('community.forum.text','.editorial-item:first-child>p','Publica tus clips y fotos, comparte lo que te salió y conecta con otros riders. Sigue perfiles, participa en el foro y entérate de lo que pasa en tu escena.','Publique seus vídeos e fotos, compartilhe suas conquistas e conecte-se com outros riders. Siga perfis, participe do fórum e acompanhe a sua cena.','Post your clips and photos, share what you landed and connect with other riders. Follow profiles, join the forum and stay in touch with your scene.');
 b('community.forum.cta','.editorial-item [data-show]','Explora el foro','Explore o fórum','Explore the forum');
 b('market.title','.editorial-item:last-child h3','Otro rider. <br>Tu próximo setup.','Outro rider. <br>Seu próximo setup.','Another rider. <br>Your next setup.','html');
 b('market.text','.editorial-item:last-child>p','Compra y vende usados entre riders. Tablas, bicis, ruedas, protecciones y lo que necesitas para seguir andando, junto a las propuestas de las tiendas.','Compre e venda usados entre riders. Shapes, bikes, rodas, proteções e tudo para continuar andando, além das ofertas das lojas.','Buy and sell used gear with other riders. Boards, bikes, wheels, protection and everything you need to keep riding, alongside shop offers.');
 b('market.equipment','.market-labels span:last-child','EQUIPAMIENTO','EQUIPAMENTOS','EQUIPMENT');
 b('identity.eyebrow','.identity-copy .eyebrow','05 / PERFIL Y SPOTRA ID','05 / PERFIL E SPOTRA ID','05 / PROFILE & SPOTRA ID');
 b('identity.title','.identity-copy h2','TU MANERA <br>DE RODAR. <br><span class="green">TU IDENTIDAD.</span>','SEU JEITO <br>DE ANDAR. <br><span class="green">SUA IDENTIDADE.</span>','YOUR WAY <br>TO RIDE. <br><span class="green">YOUR IDENTITY.</span>','html');
 b('identity.text','.identity-copy>p:not(.eyebrow)','Tu perfil reúne tu disciplina, tu lugar y tu contenido. Construye tu recorrido, conecta tus redes y preséntate a la comunidad y a las marcas desde tu SPOTRA ID.','Seu perfil reúne sua modalidade, seu lugar e seu conteúdo. Construa sua trajetória, conecte suas redes e apresente-se à comunidade e às marcas com seu SPOTRA ID.','Your profile brings together your discipline, your location and your content. Build your story, link your socials and introduce yourself to the community and brands with your SPOTRA ID.');
 b('identity.cta','.identity-copy [data-show]','Conoce el perfil rider','Conheça o perfil rider','Explore the rider profile');
 b('identity.card.label','.id-card-top>span','IDENTIDAD RIDER','IDENTIDADE RIDER','RIDER IDENTITY');
 b('identity.card.title','.id-card-title','TU NOMBRE. <br>TU HISTORIA.','SEU NOME. <br>SUA HISTÓRIA.','YOUR NAME. <br>YOUR STORY.','html');
 b('identity.card.fields','.id-card-footer>span','DISCIPLINA / CIUDAD / CREW','MODALIDADE / CIDADE / CREW','DISCIPLINE / CITY / CREW');
 b('identity.caption','.identity-visual>p','Un perfil que conecta lo que haces <br>con quienes comparten tu pasión.','Um perfil que conecta o que você faz <br>com quem compartilha sua paixão.','A profile connecting what you do <br>with people who share your passion.','html');
 b('faq.eyebrow','.faq-section .eyebrow','06 / ANTES DE SALIR','06 / ANTES DE SAIR','06 / BEFORE YOU GO');
 b('faq.title','.faq-section h2','¿DUDAS? <br><span class="green">HABLEMOS.</span>','DÚVIDAS? <br><span class="green">VAMOS CONVERSAR.</span>','QUESTIONS? <br><span class="green">LET’S TALK.</span>','html');
 b('faq.contact','.faq-section .text-link','Encuéntranos en @spotra.ok','Encontre a gente em @spotra.ok','Find us at @spotra.ok');
 b('faq.q1','.faq-list details:nth-child(1) summary','¿SPOTRA es solo para skaters?','A SPOTRA é só para skatistas?','Is SPOTRA only for skaters?');
 b('faq.a1','.faq-list details:nth-child(1)>p','SPOTRA reúne a riders de skate, BMX, rollers y scooter. Encuentra lugares, eventos y comunidad para tu disciplina.','A SPOTRA reúne riders de skate, BMX, patins e scooter. Encontre lugares, eventos e uma comunidade para sua modalidade.','SPOTRA brings together skate, BMX, roller and scooter riders. Find places, events and a community for your discipline.');
 b('faq.q2','.faq-list details:nth-child(2) summary','¿Qué puedo encontrar en el mapa?','O que encontro no mapa?','What can I find on the map?');
 b('faq.a2','.faq-list details:nth-child(2)>p','Spots, skateparks y tiendas. Consulta fotos, información y cómo llegar, comparte lugares y descubre sesiones de la comunidad.','Spots, pistas e lojas. Consulte fotos, informações e como chegar, compartilhe lugares e descubra sessões da comunidade.','Spots, skateparks and shops. Check photos, information and directions, share places and discover community sessions.');
 b('faq.q3','.faq-list details:nth-child(3) summary','¿Puedo organizar una sesión o un evento?','Posso organizar uma sessão ou um evento?','Can I organize a session or an event?');
 b('faq.a3','.faq-list details:nth-child(3)>p','La app permite crear sesiones y eventos para reunirte con otros riders. Los eventos cuentan con inscripciones y una sección de ranking.','O app permite criar sessões e eventos para encontrar outros riders. Os eventos têm inscrições e uma seção de ranking.','The app lets you create sessions and events to meet other riders. Events include registration and a rankings section.');
 b('faq.q4','.faq-list details:nth-child(4) summary','¿Qué es mi SPOTRA ID?','O que é meu SPOTRA ID?','What is my SPOTRA ID?');
 b('faq.a4','.faq-list details:nth-child(4)>p','Es tu identidad rider dentro de SPOTRA. Tu perfil, disciplina, ciudad, redes y contenido te ayudan a conectar con la comunidad y las marcas.','É sua identidade rider na SPOTRA. Seu perfil, modalidade, cidade, redes e conteúdo ajudam você a se conectar com a comunidade e as marcas.','It’s your rider identity on SPOTRA. Your profile, discipline, city, socials and content help you connect with the community and brands.');
 b('faq.q5','.faq-list details:nth-child(5) summary','¿Cómo controlo mi privacidad?','Como controlo minha privacidade?','How do I manage my privacy?');
 b('faq.a5','.faq-list details:nth-child(5)>p','SPOTRA tiene controles de privacidad, presencia en el mapa, avisos de sesiones y herramientas para reportar o bloquear usuarios. Revisa tus preferencias desde tu perfil.','A SPOTRA tem controles de privacidade, presença no mapa, avisos de sessões e ferramentas para denunciar ou bloquear usuários. Revise suas preferências no perfil.','SPOTRA has privacy controls, map presence settings, session alerts and tools to report or block users. Review your preferences in your profile.');
 b('final.eyebrow','.final-cta .eyebrow','SPOTRA / LATINOAMÉRICA RUEDA AQUÍ','SPOTRA / A AMÉRICA LATINA ANDA AQUI','SPOTRA / LATIN AMERICA RIDES HERE');
 b('final.title','.final-cta h2','AFUERA HAY <br><span>UNA SESIÓN <br>ESPERÁNDOTE.</span>','LÁ FORA TEM <br><span>UMA SESSÃO <br>ESPERANDO VOCÊ.</span>','OUT THERE, <br><span>A SESSION <br>IS WAITING.</span>','html');
 b('footer.home','.footer .brand','Volver al inicio','Voltar ao início','Back to top','aria-label');
 b('footer.intro','.footer-main>div:first-child>p','Hecho por la comunidad, para la comunidad. <br>Desde Latinoamérica.','Feito pela comunidade, para a comunidade. <br>Da América Latina.','Made by the community, for the community. <br>From Latin America.','html');
 b('footer.explore','.footer-main>div:nth-child(2)>h3','EXPLORA','EXPLORE','EXPLORE');
 b('footer.connect','.footer-main>div:nth-child(3)>h3','CONECTA','CONECTE-SE','CONNECT');
 b('footer.app','.footer-main a[href="#app"]','La app por dentro','O app por dentro','Inside the app');
 b('footer.events','.footer-main a[href="#eventos"]','Eventos y ranking','Eventos e ranking','Events & rankings');
 b('footer.community','.footer-main a[href="#comunidad"]','Foro y market','Fórum e market','Forum & marketplace');
 b('footer.spotri','[data-spotri-start]','Descubre SPOTRA con SPOTRI','Conheça a SPOTRA com SPOTRI','Discover SPOTRA with SPOTRI');
 b('footer.faq','.footer-main a[href="#preguntas"]','Preguntas frecuentes','Perguntas frequentes','Frequently asked questions');
 b('footer.privacy','.footer-bottom>div>a:nth-child(1)','Privacidad','Privacidade','Privacy');
 b('footer.terms','.footer-bottom>div>a:nth-child(2)','Términos','Termos','Terms');
 b('footer.signoff','.footer-bottom>span:last-child','ENCUENTRA. CONECTA. RUEDA.','ENCONTRE. CONECTE-SE. ANDE.','FIND. CONNECT. RIDE.');

 b('welcome.greeting','#guide-speech','Hola, soy Spotri','Oi, eu sou o Spotri','Hi, I’m Spotri');
 b('welcome.title','#welcome-title','SOY <br><span>SPOTRI.</span>','SOU <br><span>SPOTRI.</span>','I’M <br><span>SPOTRI.</span>','html');
 b('welcome.intro','.welcome-intro','¡Bienvenido a SPOTRA! <br>Elige tu idioma y tu disciplina.','Bem-vindo à SPOTRA! <br>Escolha seu idioma e sua modalidade.','Welcome to SPOTRA! <br>Choose your language and your discipline.','html');
 b('welcome.language','.welcome-instruction','01 / Idioma','01 / Idioma','01 / Language');
 b('welcome.ride','#ride-choice-title','02 / ¿Con qué ruedas?','02 / Como você anda?','02 / What do you ride?');
 b('welcome.enter','#welcome-enter .deck-label','Vamos a rodar','Vamos andar','Let’s ride');
 b('welcome.note','.welcome-ride-note','Explora a tu ritmo. SPOTRI te acompaña.','Explore no seu ritmo. SPOTRI acompanha você.','Explore at your own pace. SPOTRI is along for the ride.');
 b('ride.label','#journey-ride-label','Tu disciplina','Sua modalidade','Your discipline');
 b('ride.region',null,'Recorrido con SPOTRI','Percurso com SPOTRI','Your ride with SPOTRI','aria-label');
 b('ride.pause',null,'Pausar animación','Pausar animação','Pause animation');
 b('ride.play',null,'Activar animación','Ativar animação','Play animation');
 b('ride.next',null,'Seguir','Continuar','Next');
 b('ride.backTop','.back-to-top-label','Volver al inicio','Voltar ao início','Back to top');
 b('ride.scroll',null,'Haz scroll. Yo te sigo.','Role a página. Vou com você.','Scroll. I’ll ride with you.');
 b('ride.paused',null,'Recorrido en pausa.','Percurso em pausa.','Ride paused.');
 b('ride.arrived',null,'Llegamos a {section}.','Chegamos a {section}.','We’ve reached {section}.');
 b('route.home',null,'Inicio','Início','Home');
 b('route.map',null,'Mapa de spots','Mapa de spots','Spot map');
 b('route.forum',null,'Foro y comunidad','Fórum e comunidade','Forum & community');
 b('route.profile',null,'Perfil rider','Perfil rider','Rider profile');
 b('route.spots',null,'Spots y sesiones','Spots e sessões','Spots & sessions');
 b('route.events',null,'Eventos y ranking','Eventos e ranking','Events & rankings');
 b('route.community',null,'Comunidad y market','Comunidade e market','Community & marketplace');
 b('route.identity',null,'SPOTRA ID','SPOTRA ID','SPOTRA ID');
 b('route.faq',null,'Preguntas frecuentes','Perguntas frequentes','FAQ');
 b('route.launch',null,'Tu próxima sesión','Sua próxima sessão','Your next session');
 b('route.footer',null,'Nos vemos afuera','A gente se vê lá fora','See you outside');

 const shell=document.getElementById('site-shell');
 const welcome=document.getElementById('welcome');
 const selector=document.getElementById('language-select');
 ['#spots','#eventos','#comunidad','#identidad','#preguntas','.final-cta'].forEach(selector=>{
  const label=document.querySelector(selector+' .eyebrow');
  const header=document.createElement('div');header.className='chapter-heading';
  const dock=document.createElement('span');dock.className='spotri-dock';dock.setAttribute('aria-hidden','true');
  label.before(header);header.append(dock,label);
 });
 const footerBrand=document.querySelector('.footer-main>div:first-child>a');
 const footerHeader=document.createElement('div');footerHeader.className='chapter-heading';
 const footerDock=document.createElement('span');footerDock.className='spotri-dock';footerDock.setAttribute('aria-hidden','true');
 footerBrand.before(footerHeader);footerHeader.append(footerDock,footerBrand);
 function t(key){return translations[key]?.[locale] || translations[key]?.es || key;}
 function applyLanguage(value){
  if(!locales[value]) return;
  locale=value;
  document.documentElement.lang=locales[value];
  selector.value=value;
  bindings.forEach(({key,selector,kind})=>{
   const elements=document.querySelectorAll(selector);
   if(!elements.length) console.warn('Missing translation target: '+key);
   elements.forEach(element=>{
   const value=t(key);
   if(kind==='html') element.innerHTML=value;
   else if(kind==='text') element.textContent=value;
   else element.setAttribute(kind,value);
   element.dataset.translationKey=key;
  });});
  document.title=t('meta.title');
  document.querySelector('meta[name="description"]').content=t('meta.description');
  const menu=document.querySelector('.menu-toggle');
  menu.setAttribute('aria-label',t(menu.getAttribute('aria-expanded')==='true'?'menu.close':'menu.open'));
  // la dirección acompaña al idioma elegido (sin recargar la página)
  const paths={es:'/',pt:'/pt/',en:'/en/'};
  if(/^\/((pt|en)\/?)?(index\.html)?$/.test(location.pathname)&&location.pathname!==paths[value]){try{history.replaceState(null,'',paths[value]+location.search+location.hash);}catch(e){}}
  window.dispatchEvent(new CustomEvent('spotra:languagechange',{detail:{locale}}));
 }
 window.SPOTRA_I18N={t,applyLanguage,get locale(){return locale;},ready:false};
 selector.addEventListener('change',()=>applyLanguage(selector.value));
 const rides=['skate','bmx','rollers','scooter'];
 let ride='skate';
 function setRide(value){
  if(!rides.includes(value)) return;
  ride=value;
  document.querySelectorAll('#guide-sprite').forEach(element=>{element.dataset.vehicle=value;window.SPOTRA_SPRITES.render(element,0);});
  document.querySelectorAll('input[name="ride"]').forEach(input=>{input.checked=input.value===value;});
  document.getElementById('journey-ride').value=value;
  window.dispatchEvent(new CustomEvent('spotra:ridechange',{detail:{ride}}));
 }
 window.SPOTRA_PREFERENCES={setRide,get ride(){return ride;}};
 document.querySelectorAll('input[name="ride"]').forEach(input=>input.addEventListener('change',()=>setRide(input.value)));
 document.querySelectorAll('[data-language-choice]').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.languageChoice)));
 document.getElementById('journey-ride').addEventListener('change',event=>setRide(event.target.value));
 window.addEventListener('spotra:languagechange',()=>document.querySelectorAll('[data-language-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.languageChoice===locale))));
 document.getElementById('welcome-enter').addEventListener('click',async()=>{
  const button=document.getElementById('welcome-enter');
  if(button.disabled)return;
  button.disabled=true;
  applyLanguage(locale);
  setRide(document.querySelector('input[name="ride"]:checked').value);
  await window.SPOTRI_GUIDE.enter();
  button.disabled=false;
  document.querySelector('.header .brand').focus({preventScroll:true});
 });
 const pause=document.getElementById('welcome-pause');
 pause.addEventListener('click',()=>{const paused=welcome.classList.toggle('is-paused');pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'Animar / Play':'Pausar / Pause';window.dispatchEvent(new CustomEvent('spotra:pausechange',{detail:{paused}}));});
 // 13/10/2026: cada idioma tiene su dirección (/, /pt/, /en/); la página arranca en el suyo
 const pageLang=locales[document.documentElement.dataset.pageLang]?document.documentElement.dataset.pageLang:'es';
 applyLanguage(pageLang);
 document.querySelector('[data-language-choice="'+pageLang+'"]').focus({preventScroll:true});
})();

;
/* mobile-story.js */
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

;
/* app.js */
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

;
/* spotri.js */
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

;
/* journey.js */
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

}
