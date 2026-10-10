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
