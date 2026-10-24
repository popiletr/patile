/* Keep the original room, mapping, camera, controls and games. Replace only cat art. */
(function(root){
 'use strict';
 const player=typeof module!=='undefined'&&module.exports?require('./sprite-player.js'):root.PatiLifeSpritePlayer;
 const COATS=['sarman','tekir','smokin','calico'],STAGES=['kitten','young','adult'];
 const KEY='patilife_classic_identity_v1',BACKUP='patilife_before_classic_return_v1';
 const SAVE_KEYS=['pet_state','pati_cat_profile','pati_placed_decor','pati_owned_decor','cat_suika_save_v2','cat_suika_active_board_v1','patilife_character_created',KEY];
 function readAdoption(storage){
  const raw=storage.getItem('patilife_v2_save');if(raw===null)return null;
  const save=JSON.parse(raw);if(save.version!==2||save.requiresLegacyIdentity||save.story?.step!=='settled'||!COATS.includes(save.cat?.id)||typeof save.cat.name!=='string'||!save.cat.name.trim()||!STAGES.includes(save.growth?.stage))return null;return save;
 }
 function prepare(storage,state,now=Date.now()){
  const adoption=readAdoption(storage),rawMarker=storage.getItem(KEY);
  if(rawMarker!==null){const marker=JSON.parse(rawMarker);if(!COATS.includes(marker.id)||!STAGES.includes(marker.stage))throw new Error('Kedi görünüş kaydı okunamadı.');return {id:marker.id,stage:marker.stage};}
  if(!adoption)return null;
  const rawState=storage.getItem('pet_state');if(rawState!==null){const parsed=JSON.parse(rawState);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Mevcut oyun kaydı korunuyor.');}
  const seed={catName:adoption.cat.name,catGender:adoption.cat.gender,personality:adoption.cat.personality};
  // Existing classic economy and progress always win. Never reset a Patile board.
  if(rawState===null){for(const key of ['hunger','thirst','energy','happy','cleanliness']){const n=adoption.needs?.[key];if(typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=100)seed[key]=n;}if(Number.isFinite(adoption.economy?.coins)&&adoption.economy.coins>=0)seed.coins=adoption.economy.coins;}
  const values={};for(const key of SAVE_KEYS)values[key]=storage.getItem(key);
  if(storage.getItem(BACKUP)===null)storage.setItem(BACKUP,JSON.stringify({at:now,values}));
  const marker={id:adoption.cat.id,stage:adoption.growth.stage,at:now};
  // Persist the classic state before the handoff marker, so a reload cannot lose identity.
  const classic=rawState===null?{}:JSON.parse(rawState),profile={name:seed.catName,gender:seed.catGender,personality:seed.personality};
  try{
   storage.setItem('pet_state',JSON.stringify({...classic,...seed,lastTick:rawState===null?now:classic.lastTick}));
   storage.setItem('pati_cat_profile',JSON.stringify(profile));
   storage.setItem('patilife_character_created','true');
   storage.setItem(KEY,JSON.stringify(marker));
  }catch(error){for(const key of SAVE_KEYS){try{if(values[key]===null)storage.removeItem(key);else storage.setItem(key,values[key]);}catch(_){/* Raw backup remains available if storage is full. */}}throw error;}
  Object.assign(state,seed);return {id:marker.id,stage:marker.stage};
 }
 function needs(state){
  const low=key=>Number.isFinite(state[key])&&state[key]<=30;
  const hungry=low('hunger'),thirsty=low('thirst'),unhappy=low('happy');
  return {hungry,thirsty,unhappy,motion:hungry||thirsty?'exhausted':unhappy?'unhappy':null,speed:(hungry||thirsty)?0.68:1,label:hungry&&thirsty?'Aç ve susuz · Mama ve su ver':hungry?'Acıktı · Mama ver':thirsty?'Susadı · Su ver':unhappy?'Keyifsiz · Sev veya birlikte oyna':null};
 }
 function effectiveMotion(state){const current=state.currentAnim||'idle';return ['idle','sick','sad','exhausted','unhappy'].includes(current)?needs(state).motion||'idle':current;}
 function selection(metadata,id,stage,motion,elapsed,jumpProgress){
  const base=metadata[id],atlas=stage==='kitten'?base:base?.ages?.[stage];if(!atlas)return null;
  const care=['eat','drink','sleep'].includes(motion),special=atlas.special?.[player.specialMotion(motion)],source=special||(care&&atlas.care?atlas.care:atlas);
  const supported=!!special||care||motion==='walk'||motion==='idle';
  const index=special&&player.specialMotion(motion)==='jump'&&Number.isFinite(jumpProgress)?Math.min(3,Math.floor(Math.max(0,jumpProgress)*4)):player.frameIndex(supported?motion:'idle',elapsed);
  return {src:source.src,frame:source.frames[index]||source.frames[0],unit:Math.max(source.unit,...source.frames.map(f=>Math.max(f.width,f.height)))};
 }
 // Match the warm tabby palette without changing the drawn pose or contact anchors.
 function tabbyToiletColor(r,g,b){if(r<80||r-g>30||g-b>18||b>g+12)return [r,g,b];const lo=r<=160,amount=Math.max(0,Math.min(1,lo?(r-104)/56:(r-160)/95)),a=lo?[46,21,-5]:[32,9,-19],z=lo?[32,9,-19]:[0,0,-12];return [r,g,b].map((v,i)=>Math.max(0,Math.min(255,Math.round(v+a[i]+(z[i]-a[i])*amount))));}
 function tabbyToiletImage(image,canvas){if(!canvas)return image;canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d');if(!ctx?.getImageData||!ctx.putImageData)return image;try{ctx.drawImage(image,0,0);const x=Math.floor(canvas.width/4),w=Math.ceil(canvas.width/4),pixels=ctx.getImageData(x,0,w,canvas.height);for(let i=0;i<pixels.data.length;i+=4){if(!pixels.data[i+3])continue;const rgb=tabbyToiletColor(pixels.data[i],pixels.data[i+1],pixels.data[i+2]);for(let k=0;k<3;k++)pixels.data[i+k]=rgb[k];}ctx.putImageData(pixels,x,0);return canvas;}catch(error){return image;}}
 function createRenderer(options){
  const cache=new Map(),paletteCache=new Map();let motion=null,started=0,lastPetAt=null;
  return function draw(state,skin,time,scaleY,depth,jumpProgress){
   if(!skin)return false;const cv=options.canvas(),ctx=cv?.getContext('2d');if(!ctx)return false;
   const base=options.metadata[skin.id],atlas=skin.stage==='kitten'?base:base?.ages?.[skin.stage];
   for(const source of [atlas,atlas?.care,...Object.values(atlas?.special||{})]){if(source&&!cache.has(source.src)){const image=options.image();image.src='patilife_v2/'+source.src;cache.set(source.src,image);}}
   const requested=effectiveMotion(state);if(requested!==motion||(requested==='happy'&&state.lastPetTime!==lastPetAt)){motion=requested;started=time;lastPetAt=state.lastPetTime;}
   const frame=selection(options.metadata,skin.id,skin.stage,motion,options.reduced?.()?0:time-started,options.reduced?.()?0:jumpProgress);if(!frame)return false;
   let image=cache.get(frame.src);if(!image){image=options.image();image.src='patilife_v2/'+frame.src;cache.set(frame.src,image);}
   if(!image.complete||!image.naturalWidth)return false;
   if(skin.id==='tekir'&&player.specialMotion(motion)==='toilet'){if(!paletteCache.has(frame.src))paletteCache.set(frame.src,tabbyToiletImage(image,options.paletteCanvas?.()||root.document?.createElement('canvas')));image=paletteCache.get(frame.src);}
   // Full canvas floor baseline: host actor's bottom remains the original mapping anchor.
   const size=Math.min(cv.width,cv.height)*.94/frame.unit,w=frame.frame.width*size,h=frame.frame.height*size;
   cv.patigramFrame={...frame,dir:state.catDir};ctx.clearRect(0,0,cv.width,cv.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const contactMotion=state.careContact&&['eat','drink'].includes(motion)&&!options.reduced?.()?Math.sin((time-started)/(motion==='drink'?115:230))*1.2:0;ctx.drawImage(image,frame.frame.x,frame.frame.y,frame.frame.width,frame.frame.height,(cv.width-w)/2,cv.height-h+contactMotion,w,h);
   cv.style.bottom=((state.catBottom+(motion==='sleep'&&!state.sleepingItemId?12:0))*scaleY)+'px';cv.style.transform='scaleX('+state.catDir+') scale('+depth+')';return true;
  };
 }
 let skin=null,renderer=null;
 function init(state){try{skin=prepare(root.localStorage,state);return !!skin;}catch(error){root.console?.warn('PatiLife kedi geçişi uygulanmadı:',error.message);return false;}}
 function draw(state,time,scaleY,depth,jumpProgress){
  if(!skin||!root.PatiLifeSpriteAtlases||!root.PatiLifeSpritePlayer)return false;
  if(!renderer)renderer=createRenderer({metadata:root.PatiLifeSpriteAtlases,canvas:()=>root.document.getElementById('catActor'),image:()=>new root.Image(),reduced:()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches});
  return renderer(state,skin,time,scaleY,depth,jumpProgress);
 }
 function setStage(stage){if(!skin||!STAGES.includes(stage))return;const next={...skin,stage};const old=JSON.parse(root.localStorage.getItem(KEY)||'{}');root.localStorage.setItem(KEY,JSON.stringify({...old,...next}));skin=next;}
 const api={needs,effectiveMotion,isActive:()=>!!skin,setStage,KEY,BACKUP,readAdoption,prepare,selection,tabbyToiletColor,tabbyToiletImage,createRenderer,init,draw};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeClassicBridge=api;
})(typeof window!=='undefined'?window:globalThis);
