/* Daily life is saved data: visits never reroll events or multiply rewards. */
(function(root){
 'use strict';
 const CATALOG=typeof module!=='undefined'&&module.exports?require('./catalog.json'):root.PatiLifeCatalogData;
 const EVENTS=Object.freeze([
  {id:'paper',title:'Küçük bir keşif',body:'Koltuğun yanında küçük bir kâğıt parçası bulmuş. Yanına taşıyıp seni beklemiş.',reward:5},
  {id:'window',title:'Yağmur nöbeti',body:'Pencereden geçen damlaları izleyerek sakin bir zaman geçirmiş.',reward:5},
  {id:'bed',title:'Burası benim köşem',body:'Yumuşak yatağına kendi isteğiyle uzanmış. Evinde daha güvende hissetmeye başlıyor.',requires:'bedReady',reward:5},
  {id:'water',title:'Bir pati, birkaç damla',body:'Su kabındaki yansımaya pati uzatmış. Birkaç damla etrafa sıçramış; önemli bir şey olmamış.',requires:'waterReady',reward:5},
  {id:'toy',title:'Oyuncağı kapıya getirmiş',body:'Birlikte oynadığınız yumağı kapının yanına taşımış. Belki sana göstermek istiyordur.',played:true,reward:5}
 ]);
 const TASKS=Object.freeze([
  {id:'water',title:'Taze su',detail:'Su kabını tazele ve kedine zaman tanı.',action:'water',reward:6},
  {id:'connection',title:'Sakin bir an',detail:'Yanında sakin vakit geçir; yaklaşmayı o seçsin.',action:'pet',reward:6},
  {id:'play',title:'Birlikte oyun',detail:'Kısa oyuncak takibini tamamla.',action:'play',reward:6}
 ]);
 function dayKey(now){const d=new Date(now);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
 function hash(text){let n=2166136261;for(const char of text)n=Math.imul(n^char.charCodeAt(0),16777619);return n>>>0;}
 function copy(save){return JSON.parse(JSON.stringify(save));}
 function ready(save){if(!save.cat||save.requiresLegacyIdentity||save.story.step!=='settled')throw new Error('Önce birlikte ilk gününüzü tamamlayın.');}
 function state(save){
  if(!save.daily||!save.daily.events||!Array.isArray(save.daily.claimed))throw new Error('Günlük kaydı geçersiz; veri korundu.');
  if(!save.daily.tasks)save.daily.tasks={};return save;
 }
 function advanceNeeds(save,now=Date.now()){
  ready(save);const next=copy(save),last=next.lastTick;
  if(typeof last!=='number'||!Number.isFinite(last))throw new Error('Zaman kaydı geçersiz; veri korundu.');
  if(now<=last)return next;
  const hours=Math.min(12,(now-last)/3600000),limit=n=>Math.min(100,Math.max(20,n));
  const effects=[];
  if(next.inventory&&CATALOG){for(const id of Object.keys(next.inventory.placements||{})){const def=CATALOG.find(i=>i.id===id);if(def?.passive)effects.push(def.passive);}}
  const thirstRate=Math.min(1,...effects.map(e=>e.thirstDecay||1)),cleanRate=Math.min(1,...effects.map(e=>e.cleanDecay||1)),happyRate=Math.min(1,...effects.map(e=>e.happyDecay||1)),restRate=Math.max(6,...effects.map(e=>e.restRate||6));
  next.needs.hunger=limit(next.needs.hunger-hours*8);
  next.needs.thirst=limit(next.needs.thirst-hours*10*thirstRate);
  next.needs.happy=limit(next.needs.happy-hours*2*happyRate);
  next.needs.cleanliness=limit(next.needs.cleanliness-hours*3*cleanRate);
  next.needs.energy=Math.min(100,next.needs.energy+hours*restRate);
  next.lastTick=now;return next;
 }
 function visit(save,now=Date.now()){
  ready(save);const next=state(advanceNeeds(save,now)),day=dayKey(now);
  if(!next.daily.events[day]){
   const eligible=EVENTS.filter(e=>(!e.requires||next.care[e.requires])&&(!e.played||next.care.lastActionAt.play!==undefined));
   const event=eligible[hash(next.cat.id+day)%eligible.length];
   const friends=(next.friends||[]).filter(f=>f.catId!==next.cat.id);
   const friend=friends.length?friends[hash(day)%friends.length].catId:null;
   next.daily.events[day]={id:event.id,at:now,claimed:false,friendCatId:friend};
  }
  const existing=next.daily.events[day];
  if(!existing||!EVENTS.some(e=>e.id===existing.id)||typeof existing.claimed!=='boolean')throw new Error('Günün olay kaydı geçersiz; veri korundu.');
  if(next.inventory&&CATALOG){
   next.inventory.passiveClaims=next.inventory.passiveClaims||{};
   const feeder=CATALOG.find(i=>i.passive?.autoFeed&&next.inventory.placements?.[i.id]);
   if(feeder&&next.needs.hunger<feeder.passive.autoFeed&&!next.inventory.passiveClaims['feed:'+day]){next.needs.hunger=feeder.passive.autoFeed;next.inventory.passiveClaims['feed:'+day]=true;}
  }
  if(!next.daily.tasks[day])next.daily.tasks[day]={water:false,connection:false,play:false};
  return next;
 }
 function recordAction(save,type,now=Date.now()){
  if(save.story.step!=='settled')return save;
  const next=visit(save,now),day=dayKey(now),task=TASKS.find(t=>t.action===type);
  if(task)next.daily.tasks[day][task.id]=true;
  return next;
 }
 function claimEvent(save,now=Date.now()){
  const next=visit(save,now),day=dayKey(now),entry=next.daily.events[day],key='event:'+day;
  if(entry.claimed||next.daily.claimed.includes(key))throw new Error('Bu keşif zaten kaydedildi.');
  const definition=EVENTS.find(e=>e.id===entry.id);
  next.economy.coins+=definition.reward;entry.claimed=true;next.daily.claimed.push(key);
  next.memories.push({id:key,catId:next.cat.id,name:next.cat.name,eventId:entry.id,at:now});return next;
 }
 function claimTask(save,id,now=Date.now()){
  const next=visit(save,now),day=dayKey(now),task=TASKS.find(t=>t.id===id),key='task:'+day+':'+id;
  if(!task||!next.daily.tasks[day][id])throw new Error('Bu öneri henüz tamamlanmadı.');
  if(next.daily.claimed.includes(key))throw new Error('Bu ödül zaten alındı.');
  next.daily.claimed.push(key);next.economy.coins+=task.reward;return next;
 }
 const api={EVENTS,TASKS,dayKey,advanceNeeds,visit,recordAction,claimEvent,claimTask};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeDailyLife=api;
})(typeof window!=='undefined'?window:globalThis);
