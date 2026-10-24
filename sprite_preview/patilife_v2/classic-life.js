/* One active ledger: modern life data is embedded in the original pet_state save. */
(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports,M=node?require('./model.js'):root.PatiLifeV2,E=node?require('./inventory.js'):root.PatiLifeInventory,G=node?require('./growth.js'):root.PatiLifeGrowth,L=node?require('./life.js'):root.PatiLifeDailyLife,A=node?require('./achievements.js'):root.PatiLifeAchievements;
 const TYPES={food:'food',rest:'rest',clean:'clean',hide:'hide',watch:'watch',feed:'food',water:'water',pet:'pet',scratch:'scratch',yarn:'play',sleep:'rest',bath:'clean',play:'play'};
 function snapshot(state){const save=JSON.parse(JSON.stringify(state.lifeV2));save.economy.coins=state.coins;save.cat.name=state.catName;for(const key of Object.keys(save.needs))if(Number.isFinite(state[key]))save.needs[key]=state[key];save.lastTick=Date.now();return save;}
 function record(state,type,now=Date.now()){
  type=TYPES[type];if(!type||!state.lifeV2)return false;
  const before=snapshot(state), actualNeeds={...before.needs};if(type==='play')before.needs.energy=Math.max(10,before.needs.energy);let next;try{next=M.action(before,type,now);}catch(_){const last=before.care.lastActionAt[type];if(last!==undefined&&now-last<15000)root.PatiLifeJourney?.record(type,state);return false;}
  next.needs=actualNeeds;next=L.recordAction(next,type,now);next.needs=actualNeeds;next.economy.coins=state.coins;
  if(!next.statistics.rooms.includes(state.currentRoom))next.statistics.rooms.push(state.currentRoom);
  const used=state.lastCareItemId;state.lastCareItemId=null;const def=E.CATALOG.find(d=>'cozy_'+d.id===used&&d.action===type);
  if(def){for(const [key,value] of Object.entries(def.bonus)){state[key]=Math.min(100,state[key]+value);next.needs[key]=state[key];}next.inventory.uses[def.id]=(next.inventory.uses[def.id]||0)+1;if(next.inventory.uses[def.id]>=3&&!next.bond.preferences[type])next.bond.preferences[type]=def.id;}
  state.lifeV2=next;root.PatiLifeJourney?.record(type,state);return true;
 }
 function initState(storage,state,now=Date.now()){
  if(state.lifeV2){state.lifeV2=E.ensure(M.load({getItem:key=>key===M.KEY?JSON.stringify(state.lifeV2):null},now));return;}
  const adoption=M.load(storage,now);if(!adoption.cat||adoption.requiresLegacyIdentity)return;
  state.lifeV2=E.ensure(adoption);state.lifeV2.story={step:'settled',completed:true};state.lifeV2.economy.coins=state.coins;
 }
 function shouldOnboard(storage){try{const raw=storage.getItem(M.KEY);if(raw){const s=JSON.parse(raw);return s.version===2&&s.story?.step!=='settled';}const old=JSON.parse(storage.getItem('pet_state')||'null');return !old?.lifeV2?.cat;}catch(_){return false;}}
 let state,api,view='profile',achievementCategory='Tümü',achievementPage=0;
 const element=(tag,text,cls)=>{const n=root.document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function button(text,fn){const b=element('button',text,'classic-life-button');b.type='button';b.onclick=()=>{try{fn();}catch(e){api.notice(e.message);}};return b;}
 function save(){api.save();api.hud();}
 function apply(next){state.lifeV2=next;state.coins=next.economy.coins;root.PatiLifeChapters?.sync(state);save();open(view);}
 function open(which='profile'){
  if(['profile','daily','album'].includes(which)&&root.PatiLifeRuntime)root.PatiLifeRuntime.style('patilife_v2/life-pages.css');
  if(['profile','daily','album'].includes(which)&&!root.PatiLifeLifePages&&root.PatiLifeRuntime){root.PatiLifeRuntime.style('patilife_v2/life-pages.css');root.PatiLifeRuntime.script('patilife_v2/life-pages.js').then(()=>open(which)).catch(e=>api.notice(e.message));return;}
  if(which==='story'&&root.PatiLifeRuntime){root.document.getElementById('classic-life-panel')?.remove();root.PatiLifeRuntime.journey().then(j=>j.story(state));return;}
  if(!state.lifeV2){api.notice('Kedinin görünüşünü sahiplenme ekranında tamamlamalısın.');return;}
  if(state.isBusy){api.notice('Önce arkadaşının şu anki etkinliğini tamamlamasını bekle.');return;}
  if(which==='daily'){state.lifeV2=L.visit(snapshot(state));save();}
  const counts=rewardCounts(state);
  view=which;root.document.getElementById('classic-life-panel')?.remove();api.close();const layer=element('div',undefined,'classic-life-layer');layer.id='classic-life-panel';
  const box=element('section',undefined,'classic-life-sheet');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Birlikte yaşam');
  const header=element('header',undefined,'classic-life-header'),top=element('div',undefined,'classic-life-top');top.append(element('strong','Birlikte yaşam'),button('Kapat',()=>layer.remove()));header.append(top);
  const bar=element('nav',undefined,'classic-life-tabs');bar.setAttribute('aria-label','Kedinin günlüğü');
  for(const [id,label] of [['profile','Kedim'],['daily','Günlük'],['album','Albüm'],['achievements','Başarımlar']]){const tab=button(label,()=>open(id));tab.setAttribute('aria-current',which===id?'page':'false');rewardBadge(tab,counts[id],label);bar.append(tab);}header.append(bar);box.append(header);layer.append(box);layer.onclick=e=>{if(e.target===layer)layer.remove();};root.document.body.append(layer);root.PatiLifeRuntime?.prepareDialog(layer,box);
  const s=snapshot(state);
  if(['profile','daily','album'].includes(which)&&root.PatiLifeLifePages){
   root.PatiLifeLifePages.render(which,box,snapshot(state),{el:element,button,game:state,G,L,api,apply,snapshot,open,story:()=>open('story'),tutorial:startTutorial});
  }else if(which==='achievements'){
   renderAchievements(box,s);
  }else if(which==='story'){
   const img=element('img');img.src='patilife_v2/assets/opening-cartoon.png';img.alt='Yağmurda dört arkadaş ve dört yavru';img.style.width='100%';box.append(img,element('h2','Yağmurun getirdiği dört yuva'),element('p','Dört arkadaş kutudaki dört yavruyu bulduk. Sarman, tekir, smokin ve calico: hepsine bir yuva açtık. '+state.catName+' seninle geldi; diğerleri arkadaşlarınla güvenli evlerine gitti.'));
  }
 }
 function renderAchievements(box,s){
  const goals=A.progress(s),collected=goals.filter(g=>g.claimed).length,waiting=goals.filter(g=>g.ready&&!g.claimed).length;
  const intro=element('div',undefined,'keepsake-intro');intro.append(element('span','KÜÇÜK ZAFERLERİMİZ','keepsake-eyebrow'),element('h2','Birlikte başardık'),element('p',waiting?waiting+' küçük ödül seni bekliyor.':'Her güzel alışkanlık yeni bir hatıra.'),element('span',collected+' / '+goals.length+' hatıra','keepsake-count'));box.append(intro);
  const tabs=element('nav',undefined,'keepsake-categories');tabs.setAttribute('aria-label','Başarım koleksiyonları');
  for(const category of ['Tümü',...A.CATEGORIES]){const tab=button(category,()=>{achievementCategory=category;achievementPage=0;open('achievements');});tab.setAttribute('aria-pressed',String(category===achievementCategory));rewardBadge(tab,goals.filter(g=>(category==='Tümü'||g.category===category)&&g.ready&&!g.claimed).length,category);tabs.append(tab);}box.append(tabs);root.requestAnimationFrame?.(()=>{const active=[...tabs.children].find(t=>t.getAttribute('aria-pressed')==='true');if(active)tabs.scrollLeft=Math.max(0,active.offsetLeft-tabs.clientWidth/2+active.offsetWidth/2);});
  const selected=goals.filter(g=>achievementCategory==='Tümü'||g.category===achievementCategory).sort((a,b)=>((b.ready&&!b.claimed)?2:b.claimed?-1:0)-((a.ready&&!a.claimed)?2:a.claimed?-1:0)||a.minDays-b.minDays),pages=Math.ceil(selected.length/4);achievementPage=Math.min(achievementPage,pages-1);
  const grid=element('div',undefined,'keepsake-grid');
  const props={'Dostluk':'memory_box','İlkler ve büyüme':'carrier','Keşifler':'window_cushion','Ev ve tercihler':'nest_bed','Birlikte oyun':'yarn','Birlikte yaşam':'photo_board'};
  for(const [index,goal] of selected.slice(achievementPage*4,achievementPage*4+4).entries()){
   const card=element('article',undefined,'keepsake-card '+(goal.claimed?'is-collected':goal.ready?'is-ready':'is-growing'));card.setAttribute('aria-label',goal.title);
   const art=element('div',undefined,'keepsake-art'),canvas=element('canvas');canvas.setAttribute('aria-hidden','true');art.append(canvas,element('span',String(achievementPage*4+index+1).padStart(2,'0'),'keepsake-number'));card.append(art,element('h3',goal.title));
   root.PatiLifeSpritePlayer.mountProp(canvas,props[goal.category]);
   const progress=element('meter',undefined,'keepsake-progress');progress.min=0;progress.max=goal.target;progress.value=goal.value;progress.setAttribute('aria-label',goal.title+' ilerlemesi');
   card.append(progress,element('span',goal.value+' / '+goal.target,'keepsake-fraction'));if(!goal.claimed&&goal.activeDays<goal.minDays)card.append(element('small','Birlikte '+Math.min(goal.activeDays,goal.minDays)+' / '+goal.minDays+' farklı gün','keepsake-day-gate'));
   if(goal.ready&&!goal.claimed){const reward=button('Ödülü al · '+goal.reward+' altın',()=>{apply(A.claim(snapshot(state),goal.id));api.notice(goal.title+' albümüne eklendi. +'+goal.reward+' altın.');});reward.className+=' keepsake-claim reward-ready';reward.setAttribute('aria-label',goal.title+': ödülü al');card.append(reward);}
   else card.append(element('span',goal.claimed?'Albümünde':'Ödül · '+goal.reward+' altın','keepsake-status'));
   grid.append(card);
  }box.append(grid);
  const footer=element('div',undefined,'keepsake-pager'),prev=button('Önceki',()=>{achievementPage--;open('achievements');}),next=button('Sonraki',()=>{achievementPage++;open('achievements');});prev.disabled=achievementPage===0;next.disabled=achievementPage===pages-1;footer.append(prev,element('span',(achievementPage+1)+' / '+pages),next);box.append(footer);
 }
 function decorate(container,id){const def=E.CATALOG.find(d=>'cozy_'+d.id===id);if(!def)return;const canvas=element('canvas');canvas.style.cssText='width:100%;height:100%;object-fit:contain';container.replaceChildren(canvas);root.PatiLifeSpritePlayer.mountProp(canvas,def.id);}
 function installCatalog(manager){
  const categories={Beslenme:'furniture',Dinlenme:'beds',Tırmalama:'furniture',Oyun:'toys',Keşif:'furniture',Temizlik:'furniture',Gözlem:'furniture','Ortak yaşam':'furniture'};
  for(const def of E.CATALOG)manager.CATALOG['cozy_'+def.id]={id:'cozy_'+def.id,name:def.name,desc:def.detail||'Kedinin '+def.category.toLocaleLowerCase('tr-TR')+' alanı. Dokunarak etkileş.',price:def.price,width:['bed','rest','hide'].includes(def.action)?170:120,height:140,type:def.mount==='wall'?'wall':'floor',category:categories[def.category]||'furniture',interaction:def.action==='rest'?'sleep':def.action==='play'?'play':def.action==='scratch'?'scratch':'sniff',svg:'',cozy:def};
 }
 function syncInventory(manager){if(!state?.lifeV2)return;const s=state.lifeV2;for(const id of manager.ownedDecor||[]){if(E.CATALOG.some(d=>'cozy_'+d.id===id)&&!s.inventory.owned.includes(id.slice(5)))s.inventory.owned.push(id.slice(5));}s.inventory.placements={};for(const d of manager.placedDecor||[]){if(E.CATALOG.some(def=>'cozy_'+def.id===d.itemId))s.inventory.placements[d.itemId.slice(5)]={room:d.room,x:Math.max(10,Math.min(90,d.x/22)),y:Math.max(10,Math.min(85,d.bottom/3))};}}
 function completeItem(game,id,now=Date.now()){const next=L.recordAction(E.use(snapshot(game),id,now),E.item(id).action,now);if(!next.statistics.rooms.includes(game.currentRoom))next.statistics.rooms.push(game.currentRoom);for(const key of Object.keys(next.needs))game[key]=next.needs[key];game.lifeV2=next;root.PatiLifeJourney?.record(E.item(id).action,game);return next;}
 function use(item){
  const def=E.CATALOG.find(d=>'cozy_'+d.id===item.itemId);if(!def||state.isBusy)return;
  if(def.action==='memory'){open('album');return;}if(api.toilet&&['litter','wide_litter','private_litter'].includes(def.id)){api.toilet(item);return;}
  if(def.action==='food'){api.food(item);return;}if(def.action==='water'){api.water(item);return;}if(def.action==='rest'&&api.rest){api.rest(item);return;}
  if(!state.lifeV2){api.notice('Önce kedinin sahiplenme bilgilerini tamamla.');return;}
  try{M.action(snapshot(state),def.action);}catch(e){api.notice(e.message);return;}
  api.use(item,def,()=>{
   let next;try{next=completeItem(state,def.id);}catch(e){api.notice(e.message);return;}
   for(const key of Object.keys(next.needs))state[key]=next.needs[key];
   if(!next.statistics.rooms.includes(state.currentRoom))next.statistics.rooms.push(state.currentRoom);
   state.lifeV2=next;save();
  });
 }
 function importDecor(manager){
  if(!state?.lifeV2)return;const s=state.lifeV2;
  for(const id of s.inventory.owned){const key='cozy_'+id;if(!manager.ownedDecor.includes(key))manager.ownedDecor.push(key);}
  if(!s.classicDecorImported){for(const [id,p] of Object.entries(s.inventory.placements)){if(E.STARTER.includes(id)||manager.placedDecor.some(d=>d.itemId==='cozy_'+id))continue;manager.placedDecor.push({id:'cozy_import_'+id,itemId:'cozy_'+id,room:p.room,x:Math.round(p.x*22),bottom:E.item(id).mount==='wall'?310:Math.round(30+(p.y-12)*1.5),scale:1});}s.classicDecorImported=true;}
  syncInventory(manager);manager.saveOwnedDecor();manager.saveDecorState();manager.renderRoomDecor(state.currentRoom);manager.renderShopDecorList();
 }
 function startTutorial(replay=false){if(!state.lifeV2)return;if(!state.lifeV2.care.tutorial)state.lifeV2.care.tutorial={step:0,active:true,completed:false};if(replay){if(state.lifeV2.care.tutorial.completed)state.lifeV2.care.tutorial={step:0,active:true,completed:false};else state.lifeV2.care.tutorial.active=true;}if(state.lifeV2.care.tutorial.completed||!state.lifeV2.care.tutorial.active)return;save();api.close();root.PatiLifeRuntime.journey().then(j=>j.tutorial(state,{...api,save,onDone:()=>{state.lifeV2.memories=state.lifeV2.memories||[];if(!state.lifeV2.memories.some(m=>m.id==='first_day'))state.lifeV2.memories.push({id:'first_day',at:Date.now(),catId:state.lifeV2.cat.id,name:state.catName});save();}}));}
 function rewardCounts(game,now=Date.now()){const counts={daily:0,achievements:0,categories:{},total:0};if(!game.lifeV2)return counts;const s=game.lifeV2,day=L.dayKey(now);counts.daily=(s.daily.events[day]&&!s.daily.events[day].claimed?1:0)+L.TASKS.filter(t=>s.daily.tasks?.[day]?.[t.id]&&!s.daily.claimed.includes('task:'+day+':'+t.id)).length;for(const goal of A.progress(snapshot(game)))if(goal.ready&&!goal.claimed){counts.achievements++;counts.categories[goal.category]=(counts.categories[goal.category]||0)+1;}counts.total=counts.daily+counts.achievements;return counts;}
 function claimable(game,now=Date.now()){return rewardCounts(game,now).total;}
 function rewardBadge(tab,count,label){if(!count)return;tab.append(element('span',String(count),'reward-count-badge'));tab.setAttribute('aria-label',label+', '+count+' ödül alınabilir');}

 function passive(key){if(!state?.lifeV2)return 1;const placed=Object.keys(state.lifeV2.inventory.placements);if(key==='restRate')return Math.max(6,...placed.map(id=>E.item(id).passive?.restRate||6))/6;if(key==='playRefund')return Math.max(0,...placed.map(id=>E.item(id).passive?.playRefund||0));return Math.min(1,...placed.map(id=>E.item(id).passive?.[key]||1));}
 function init(game,callbacks){state=game;api=callbacks;initState(root.localStorage,state);installCatalog(api.decor);if(state.lifeV2){root.PatiLifeClassicBridge.setStage(state.lifeV2.growth.stage);state.lifeV2=L.visit(snapshot(state));state.hunger=state.lifeV2.needs.hunger;save();const avatar=root.document.querySelector('.pet-profile-capsule');if(avatar)avatar.onclick=()=>open('profile');}
  root.PatiLifePropAtlas.src='patilife_v2/'+root.PatiLifePropAtlas.src;for(const f of Object.values(root.PatiLifePropAtlas.items))if(f.src)f.src='patilife_v2/'+f.src;
 }
 const exports={startTutorial,claimable,rewardCounts,completeItem,snapshot,record,initState,shouldOnboard,open,decorate,syncInventory,importDecor,use,passive,init};if(node)module.exports=exports;else root.PatiLifeClassicLife=exports;
})(typeof window!=='undefined'?window:globalThis);
