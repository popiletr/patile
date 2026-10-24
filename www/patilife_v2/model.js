/* PatiLife v2: shared game rules, no browser dependencies. */
(function (root) {
 'use strict';
 const CATS = Object.freeze([
  Object.freeze({id:'sarman',coat:'Sarman',gender:'Erkek',personality:'friendly',temperament:'Cana yakın',description:'Yakınına sokulur; birlikte zaman geçirmekten hoşlanır.'}),
  Object.freeze({id:'tekir',coat:'Tekir',gender:'Dişi',personality:'curious',temperament:'Meraklı',description:'Yeni kokuları ve saklanacak köşeleri araştırır.'}),
  Object.freeze({id:'smokin',coat:'Smokin',gender:'Erkek',personality:'timid',temperament:'Temkinli',description:'Önce uzaktan izler; güvendiğinde yanına gelir.'}),
  Object.freeze({id:'calico',coat:'Calico',gender:'Dişi',personality:'playful',temperament:'Oyuncu',description:'Kıpırdayan oyuncakları fark eder; kısa oyunlara heveslidir.'})
 ]);
 const KEY='patilife_v2_save', STEPS=['home_arrival','home_water','home_food','home_rest','home_play','home_memory'];
 const STORY=['rain','box','promise','selection','name','farewell',...STEPS,'settled','legacy_home'];
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const clamp=n=>Math.min(100,Math.max(0,n));
 const defaults=now=>({needs:{hunger:55,thirst:45,energy:65,happy:60,cleanliness:85},care:{carrierOpen:false,waterReady:false,foodReady:false,bedReady:false,litterReady:false,lastActionAt:{},dailyBond:{}},economy:{coins:40},memories:[],statistics:{actions:{},actionDays:{},rooms:[],playStages:[]},achievements:{claimed:[]},lastTick:now});
 function createSave(now=Date.now()) {return {version:2,updatedAt:now,cat:null,story:{step:'rain',completed:false},growth:{stage:'kitten',adoptedAt:null,activeDays:[]},bond:{points:0,preferences:{}},legacy:{},daily:{events:{},claimed:[]},...defaults(now)};}
 function validSave(v){return plain(v)&&v.version===2&&finite(v.updatedAt)&&plain(v.story)&&STORY.includes(v.story.step)&&typeof v.story.completed==='boolean'&&plain(v.growth)&&['kitten','young','adult'].includes(v.growth.stage)&&Array.isArray(v.growth.activeDays)&&plain(v.bond)&&finite(v.bond.points)&&plain(v.bond.preferences)&&plain(v.daily)&&plain(v.daily.events)&&Array.isArray(v.daily.claimed)&&(v.cat===null||(plain(v.cat)&&CATS.some(c=>c.id===v.cat.id)&&typeof v.cat.name==='string'&&v.cat.name.trim().length>0));}
 function normalize(v,now){const d=defaults(now);return {...d,...v,care:{...d.care,...v.care,lastActionAt:{...v.care?.lastActionAt},dailyBond:{...v.care?.dailyBond}},needs:{...d.needs,...v.needs},economy:{...d.economy,...v.economy}};}
 function assertPlayable(v){if(!validSave(v)||!v.cat||v.requiresLegacyIdentity||!plain(v.needs)||Object.values(v.needs).some(n=>!finite(n)||n<0||n>100)||!finite(v.economy?.coins)||v.economy.coins<0)throw new Error('Oyun kaydı geçersiz; veri korunuyor.');}
 function validateProgress(v){
  const stats=v.statistics;
  if(stats!==undefined&&(!plain(stats)||!plain(stats.actions)||Object.values(stats.actions).some(n=>!Number.isSafeInteger(n)||n<0)||!plain(stats.actionDays)||Object.values(stats.actionDays).some(days=>!Array.isArray(days)||days.some(d=>typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)))||!Array.isArray(stats.rooms)||stats.rooms.some(r=>!['living','kitchen','bedroom','bathroom','garden','sunroom','attic','reading'].includes(r))||!Array.isArray(stats.playStages)||stats.playStages.some(s=>!['kitten','young','adult'].includes(s))))throw new Error('İlerleme kaydı geçersiz; özgün veri korundu.');
  if(v.achievements!==undefined&&(!plain(v.achievements)||!Array.isArray(v.achievements.claimed)||v.achievements.claimed.some(id=>typeof id!=='string')||new Set(v.achievements.claimed).size!==v.achievements.claimed.length))throw new Error('Başarım kaydı geçersiz; özgün veri korundu.');
 }
 function load(storage,now=Date.now()){

  const raw=storage.getItem(KEY);
  if(raw!==null){let v;try{v=JSON.parse(raw);}catch(_){throw new Error('Kayıt okunamadı; özgün veri korundu.');}if(!validSave(v))throw new Error('Desteklenmeyen kayıt; özgün veri korundu.');
   if(v.needs!==undefined&&(!plain(v.needs)||Object.values(v.needs).some(n=>!finite(n)||n<0||n>100)))throw new Error('İhtiyaç kaydı bozuk; özgün veri korundu.');
   if(v.care!==undefined&&(!plain(v.care)||(v.care.lastActionAt!==undefined&&(!plain(v.care.lastActionAt)||Object.values(v.care.lastActionAt).some(n=>!finite(n))))))throw new Error('Bakım kaydı bozuk; özgün veri korundu.');
   if(v.care?.position!==undefined&&(!plain(v.care.position)||!finite(v.care.position.x)||!finite(v.care.position.y)||v.care.position.x<0||v.care.position.x>100||v.care.position.y<0||v.care.position.y>60))throw new Error('Yerleşim kaydı bozuk; özgün veri korundu.');
   if(v.memories!==undefined&&!Array.isArray(v.memories))throw new Error('Hatıra kaydı bozuk; özgün veri korundu.');
   if(v.economy!==undefined&&(!plain(v.economy)||!finite(v.economy.coins)||v.economy.coins<0))throw new Error('Birikim kaydı bozuk; özgün veri korundu.');
   validateProgress(v);return normalize(v,now);}
  const v=createSave(now),keys=['pet_state','pati_cat_profile','pati_placed_decor','pati_owned_decor','cat_suika_save_v2','cat_suika_active_board_v1'],backup={};
  for(const key of keys){const value=storage.getItem(key);if(value!==null)backup[key]=value;}
  if(Object.keys(backup).length){
   if(storage.getItem('patilife_pre_v2_backup')===null)storage.setItem('patilife_pre_v2_backup',JSON.stringify({at:now,values:backup}));
   for(const key of keys){try{v.legacy[key]=backup[key]===undefined?null:JSON.parse(backup[key]);}catch(_){throw new Error('Eski kayıt bozuk; ham yedek korundu, geçiş durduruldu.');}}
   if(v.legacy.pet_state!==null&&!plain(v.legacy.pet_state))throw new Error('Eski oyun kaydı nesne olmalı; yedek korundu.');
   if(v.legacy.pati_cat_profile!==null&&!plain(v.legacy.pati_cat_profile))throw new Error('Eski profil geçersiz; yedek korundu.');
   if(v.legacy.pet_state||v.legacy.pati_cat_profile){v.story={step:'legacy_home',completed:true};v.requiresLegacyIdentity=true;}
  }
  return v;
 }
 function cleanName(name){const clean=typeof name==='string'?name.trim().normalize('NFC'):'';if(!clean||Array.from(clean).length>20||/[\u0000-\u001f\u007f]/.test(clean))throw new Error('1–20 karakterlik bir isim gerekli.');return clean;}
 function adopt(save,id,name,now=Date.now()){
  const cat=CATS.find(c=>c.id===id);if(!cat)throw new Error('Geçerli bir kedi seçmelisin.');if(save.cat)throw new Error('Bu kayıtta zaten sahiplenilmiş bir kedi var.');
  return {...save,updatedAt:now,cat:{...cat,name:cleanName(name)},story:{step:'home_arrival',completed:false},growth:{stage:'kitten',adoptedAt:now,activeDays:[]}};
 }
 function migrateIdentity(save,id,now=Date.now()){
  if(!save.requiresLegacyIdentity||save.cat)throw new Error('Bu kayıtta kimlik eşleme gerekmiyor.');
  const cat=CATS.find(c=>c.id===id);if(!cat)throw new Error('Kedinin görünüşünü seç.');
  const old=save.legacy.pet_state||{},profile=save.legacy.pati_cat_profile||{};
  const next=normalize(save,now);next.cat={...cat,name:cleanName(profile.name||old.catName||cat.coat),gender:profile.gender||old.catGender||cat.gender,personality:profile.personality||old.personality||cat.personality};
  next.cat.temperament=({friendly:'Cana yakın',curious:'Meraklı',timid:'Temkinli',feisty:'Enerjik',sleepy:'Uykucu',playful:'Oyuncu'})[next.cat.personality]||cat.temperament;
  for(const key of Object.keys(next.needs)){if(old[key]!==undefined){if(!finite(old[key]))throw new Error('Eski ihtiyaç kaydı geçersiz; geçiş durduruldu.');next.needs[key]=clamp(old[key]);}}
  if(old.coins!==undefined){if(!finite(old.coins)||old.coins<0)throw new Error('Eski para kaydı geçersiz; geçiş durduruldu.');next.economy={coins:old.coins};}
  next.care={...next.care,carrierOpen:true,waterReady:true,foodReady:true,bedReady:true,litterReady:true};next.story={step:'settled',completed:true};next.growth={...next.growth,adoptedAt:now};next.requiresLegacyIdentity=false;next.updatedAt=now;next.lastTick=now;assertPlayable(next);return next;
 }
 function persist(storage,save,now=Date.now()){validateProgress(save);if(!validSave(save))throw new Error('Geçersiz kayıt yazılmadı.');if(save.cat)assertPlayable(save);storage.setItem(KEY,JSON.stringify({...save,updatedAt:now}));}
 function localDay(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
 function action(save,type,now=Date.now()){
  assertPlayable(save);const expected={home_arrival:'open',home_water:'water',home_food:'food',home_rest:'rest',home_play:'play',home_memory:'memory'};
  if(save.story.step!=='settled'&&expected[save.story.step]!==type)throw new Error('Önce kedinin şu anki ihtiyacına odaklan.');
  if(!['open','water','food','rest','play','memory','pet','scratch','hide','clean','watch'].includes(type))throw new Error('Bilinmeyen etkileşim.');
  const next=JSON.parse(JSON.stringify(save)),previous=next.care.lastActionAt[type];
  if(previous!==undefined&&now-previous<15000)throw new Error('Biraz zaman tanı; arkadaşın hâlâ bu anın tadını çıkarıyor.');
  if(type==='open')next.care.carrierOpen=true;
  if(type==='water'){next.care.waterReady=true;next.needs.thirst=clamp(next.needs.thirst+40);}
  if(type==='food'){next.care.foodReady=true;next.needs.hunger=clamp(next.needs.hunger+35);}
  if(type==='rest'){next.care.bedReady=true;next.care.litterReady=true;next.needs.energy=clamp(next.needs.energy+20);}
  if(type==='play'){if(next.needs.energy<10)throw new Error('Önce biraz dinlenmek iyi gelecek.');next.needs.energy=clamp(next.needs.energy-8);next.needs.happy=clamp(next.needs.happy+12);}
  if(type==='scratch'){next.needs.happy=clamp(next.needs.happy+6);next.needs.energy=clamp(next.needs.energy-2);}
  if(type==='hide'||type==='watch'||type==='pet')next.needs.happy=clamp(next.needs.happy+4);
  if(type==='clean')next.needs.cleanliness=clamp(next.needs.cleanliness+20);
  const day=localDay(new Date(now)),earned=next.care.dailyBond[day]||0;
  const gain=type==='memory'?0:Math.min(3,Math.max(0,15-earned));next.bond.points+=gain;next.care.dailyBond[day]=earned+gain;
  next.care.lastActionAt[type]=now;if(!next.growth.activeDays.includes(day))next.growth.activeDays.push(day);
  if(type==='memory'&&!next.memories.some(m=>m.id==='first_day'))next.memories.push({id:'first_day',catId:next.cat.id,name:next.cat.name,at:now});
  const stepIndex=STEPS.indexOf(save.story.step);if(stepIndex>=0)next.story={step:STEPS[stepIndex+1]||'settled',completed:stepIndex===STEPS.length-1};
  const stats=next.statistics||(next.statistics={actions:{},actionDays:{},rooms:[],playStages:[]});
  stats.actions[type]=(stats.actions[type]||0)+1;const days=stats.actionDays[type]||(stats.actionDays[type]=[]);if(!days.includes(day))days.push(day);
  if(type==='play'&&!stats.playStages.includes(next.growth.stage))stats.playStages.push(next.growth.stage);
  next.lastTick=now;next.updatedAt=now;return next;
 }
 const api={CATS,KEY,STEPS,createSave,validSave,load,adopt,migrateIdentity,persist,localDay,action};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeV2=api;
})(typeof window!=='undefined'?window:globalThis);
