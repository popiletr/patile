/* Shared atlas renderer: consistent scale and floor baseline across action frames. */
(function(root){
 'use strict';
 const cache=new Map(),active=new Set();
 function specialMotion(motion){return ['happy','pet'].includes(motion)?'pet':['jump','pounce','jump_joy'].includes(motion)?'jump':['scratch','yarn'].includes(motion)?'scratch':motion==='bath'?'bath':motion==='toilet'?'toilet':['exhausted','unhappy'].includes(motion)?motion:null;}
 function frameIndex(motion,elapsed){
  const t=Math.max(0,elapsed);
  const special=specialMotion(motion);
  if(['exhausted','unhappy'].includes(special))return Math.floor(t/850)%2;
  if(special==='toilet')return t<600?0:t<2600?1:2+Math.floor((t-2600)/240)%2;
  if(special==='bath')return Math.floor(t/300)%4;
  if(special==='pet')return Math.floor(t/240)%4;
  if(special==='scratch')return Math.floor(t/180)%4;
  if(special==='jump')return Math.min(3,Math.floor(t/160));
  if(motion==='walk')return 4+Math.floor(t/150)%4;
  if(motion==='eat')return Math.floor(t/220)%4;
  if(motion==='drink')return 4+Math.floor(t/180)%4;
  if(motion==='sleep')return 8+Math.floor(t/700)%4;
  const idle=t%2800;return idle<1600?0:idle<1800?1:idle<2000?2:idle<2250?3:0;
 }
 function placement(frame,unit,width,height){
  const scale=Math.min(Math.min(width,height)*.78/unit,width*.94/frame.width,height*.9/frame.height);
  return {x:(width-frame.width*scale)/2,y:height*.9-frame.height*scale,width:frame.width*scale,height:frame.height*scale};
 }
 function getImage(src){
  let image=cache.get(src);
  if(!image){image=new root.Image();image.addEventListener('error',()=>{image.failed=true;},{once:true});image.src=src;cache.set(src,image);}
  return image;
 }
 function mount(element,id,animate,stage='kitten'){
  const base=root.PatiLifeSpriteAtlases?.[id],metadata=stage==='kitten'?base:base?.ages?.[stage];
  if(!metadata||typeof element.getContext!=='function'||typeof root.Image!=='function')return;
  const context=element.getContext('2d');if(!context)return;
  element.width=512;element.height=512;element.style.backgroundImage='none';element.style.animation='none';
  getImage(metadata.src);if(metadata.care)getImage(metadata.care.src);
  let stopped=false,raf=null,start=null,motion='idle',drawn='';
  function stop(){stopped=true;if(raf!==null)root.cancelAnimationFrame(raf);active.delete(stop);}
  active.add(stop);
  function draw(timestamp){
   if(stopped)return;if(!element.isConnected){stop();return;}
   const state=element.getAttribute('data-motion')||'idle';
   if(start===null||state!==motion){start=timestamp;motion=state;}
   const reduce=root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches;
   let atlas=metadata,selected=animate?frameIndex(motion,reduce?0:timestamp-start):0;
   if(metadata.special?.[specialMotion(motion)])atlas=metadata.special[specialMotion(motion)];
   else if(['eat','drink','sleep'].includes(motion)&&metadata.care)atlas=metadata.care;
   else if(['eat','drink','sleep'].includes(motion))selected=0;
   let image=getImage(atlas.src);
   if(image.failed&&atlas!==metadata){atlas=metadata;image=getImage(metadata.src);selected=0;}
   if(image.failed){element.setAttribute('aria-label','Kedi görseli yüklenemedi');stop();return;}
   if(image.complete&&image.naturalWidth){
    const frame=atlas.frames[selected]||atlas.frames[0],signature=atlas.src+':'+frame.x+':'+frame.y+':'+selected;
    if(signature!==drawn){
     const dst=placement(frame,atlas.unit,element.width,element.height);
     context.clearRect(0,0,element.width,element.height);
     context.drawImage(image,frame.x,frame.y,frame.width,frame.height,dst.x,dst.y,dst.width,dst.height);drawn=signature;
    }
    if(!animate){stop();return;}
   }
   raf=root.requestAnimationFrame(draw);
  }
  raf=root.requestAnimationFrame(draw);
 }
 function mountProp(element,id){
  const atlas=root.PatiLifePropAtlas,frame=atlas?.items?.[id];
  if(!frame||typeof element.getContext!=='function'||typeof root.Image!=='function')return;
  const context=element.getContext('2d');if(!context)return;element.width=256;element.height=256;
  const image=getImage(frame.src||atlas.src);
  function draw(){if(!element.isConnected)return;
   if(image.complete&&image.naturalWidth){const dst=placement(frame,Math.max(frame.width,frame.height),256,256);context.clearRect(0,0,256,256);context.drawImage(image,frame.x,frame.y,frame.width,frame.height,dst.x,dst.y,dst.width,dst.height);element.patigramFrame={src:frame.src||atlas.src,frame:{...frame},dst:{x:dst.x/256,y:dst.y/256,w:dst.width/256,h:dst.height/256}};}}
  if(image.complete&&image.naturalWidth)root.requestAnimationFrame(draw);else image.addEventListener('load',draw,{once:true});
 }
 function stopAll(){for(const stop of [...active])stop();}
 const api={mount,mountProp,stopAll,specialMotion,frameIndex,placement};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeSpritePlayer=api;
})(typeof window!=='undefined'?window:globalThis);
