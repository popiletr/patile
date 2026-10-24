(function(root){
 'use strict';
 function create({scale:initialScale=.55}={}){
  let scale=initialScale,y=0,manual=false,gesture=null,framed=false;
  function frame(height){if(!framed){y=(1-scale)*height/2;framed=true;}}
  const stageHeight=height=>height;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function constrain(camera,width,height){frame(height);y=clamp(y,height-height*1.43*scale,height*.43*scale);return clamp(camera,0,Math.max(0,2200-width/scale));}
  return {
   get scale(){return scale;},get manual(){return manual;},
   reset(){scale=initialScale;y=0;manual=false;gesture=null;framed=false;},
   width(width){return width/scale;},
   height(height){return stageHeight(height);},
   transform(camera,width,height){camera=constrain(camera,width,height);return `translate3d(${-camera*scale}px, ${y}px, 0) scale(${scale})`;},
   point(x,py,camera,height){frame(height);return {x:camera+x/scale,bottom:(stageHeight(height)-(py-y)/scale)/(height/768)};},
   screen(x,bottom,camera,height){frame(height);return {x:(x-camera)*scale,y:y+(stageHeight(height)-bottom*height/768)*scale};},
   begin(a,b,camera,width,height){const x=(a.x+b.x)/2,py=(a.y+b.y)/2;gesture={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale,worldX:camera+x/scale,bottom:this.point(x,py,camera,height).bottom};manual=true;},
   move(a,b,width,height){if(!gesture)return null;const distance=Math.hypot(a.x-b.x,a.y-b.y);scale=clamp(gesture.scale*distance/gesture.distance,.55,1.8);if(Math.abs(scale-1)<.025)scale=1;const x=(a.x+b.x)/2,py=(a.y+b.y)/2;y=py-(stageHeight(height)-gesture.bottom*height/768)*scale;return constrain(gesture.worldX-x/scale,width,height);},
   end(){gesture=null;}
  };
 }
 function bind(viewport,view,api){
  const pointers=new Map();let blocked=false,suppressClickUntil=0;
  const pair=()=>[...pointers.values()].slice(0,2).map(p=>({x:p.x-viewport.getBoundingClientRect().left,y:p.y-viewport.getBoundingClientRect().top}));
  viewport.addEventListener('pointerdown',e=>{
   if(e.pointerType!=='touch'||e.target.closest('button, .modal-overlay, .game-modal-overlay, .ingame-top-hud, .ingame-room-tabs, .ingame-bottom-dock-row'))return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,target:e.target});
   if(blocked){e.preventDefault();e.stopImmediatePropagation();}
   if(pointers.size===2){blocked=true;suppressClickUntil=Date.now()+700;api.cancel();for(const [id,p]of pointers){p.target.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:id,pointerType:'touch'}));}if(api.ready&&!api.ready()){api.wait?.();e.preventDefault();e.stopImmediatePropagation();return;}const [a,b]=pair();view.begin(a,b,api.camera(),viewport.clientWidth,viewport.clientHeight);e.preventDefault();e.stopImmediatePropagation();}
  },{capture:true,passive:false});
  window.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;const previous=pointers.get(e.pointerId);pointers.set(e.pointerId,{...previous,x:e.clientX,y:e.clientY});if(!blocked)return;
   e.preventDefault();e.stopImmediatePropagation();if(pointers.size>=2){const [a,b]=pair(),camera=view.move(a,b,viewport.clientWidth,viewport.clientHeight);if(camera!==null)api.apply(camera);}
  },{capture:true,passive:false});
  const end=e=>{if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(blocked){suppressClickUntil=Date.now()+450;e.stopImmediatePropagation();api.cancel();if(pointers.size<2)view.end();if(!pointers.size)blocked=false;}};
  window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',e=>{if(e.isTrusted)end(e);},true);
  for(const name of ['touchstart','touchmove','touchend'])viewport.addEventListener(name,e=>{if(blocked||e.touches.length>1){if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();}},{capture:true,passive:false});
  viewport.addEventListener('click',e=>{if(blocked||Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  window.addEventListener('blur',()=>{pointers.clear();blocked=false;view.end();api.cancel();});
 }
 const api={create,bind};if(typeof module==='object'&&module.exports)module.exports=api;else root.PatiLifeSceneView=api;
})(typeof window!=='undefined'?window:globalThis);
