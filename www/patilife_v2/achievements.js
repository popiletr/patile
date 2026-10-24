/* Persistent, non-streak milestones. Only completed, recorded actions count. */
(function(root){
 'use strict';
 const E=typeof module!=='undefined'&&module.exports?require('./inventory.js'):root.PatiLifeInventory;
 const definitions=[];
 function add(category,id,title,metric,target,reward=10){
  const firstDays={adopt:1,'first-day':1,young:4,adult:10,'first-water':2,'first-food':3,'first-rest':4,'first-pet':2,'first-scratch':5,'first-play':2,'litter-1':1,'litter-3':3,'litter-12':7,'litter-30':14,'young-play':7,'adult-play':14};
  let minDays=firstDays[id];if(minDays===undefined){if(metric==='bond')minDays=[2,3,4,5,7,10,14,21,30,45,60,90][definitions.filter(d=>d.metric==='bond').length];else if(metric==='activeDays'||metric==='playDays')minDays=target;else if(metric==='eventDays')minDays=target;else if(metric==='eventKinds')minDays=target*2;else if(metric==='rooms')minDays=target*2;else if(metric==='owned')minDays=Math.ceil(target/2);else if(metric==='placed')minDays=Math.ceil(target/2);else minDays=Math.max(3,target*2);}
  definitions.push(Object.freeze({category,id,title,metric,target,reward,minDays}));
 }

 [3,9,15,24,40,60,80,100,140,200,300,450].forEach((n,i)=>add('Dostluk','bond-'+n,['İlk yakınlık','Küçük bir güven','Sana alışıyor','Birlikte rahatız','Güvenli dostluk','Tanıdık adımlar','Ailenin bir parçası','Güçlenen bağ','Yan yana mevsimler','Kök salan dostluk','Yıllık bir albüme doğru','Bir ömürlük arkadaş'][i],'bond',n,10+i*2));
 for(const [id,title,metric] of [['adopt','Bir yuva açtın','adopted'],['first-day','Birlikte ilk gün','firstDay'],['young','Gençliğe merhaba','young'],['adult','Birlikte büyüdük','adult'],['first-water','İlk taze su','action:water'],['first-food','İlk küçük öğün','action:food'],['first-rest','Güvenli bir uyku','action:rest'],['first-pet','İlk sakin yakınlık','action:pet'],['first-scratch','Kendine ait köşe','action:scratch']])add('İlkler ve büyüme',id,title,metric,1);
 [1,2,3,4,5].forEach(n=>add('Keşifler','events-'+n,n+' farklı günlük keşif','eventKinds',n));
 [7,14,30].forEach(n=>add('Keşifler','event-days-'+n,n+' güne ait keşif albümü','eventDays',n,20));
 [3,5].forEach(n=>add('Keşifler','rooms-'+n,n+' odada birlikte vakit','rooms',n));
 [6,12].forEach(n=>add('Keşifler','uses-'+n,n+' farklı eşyayı tanıdı','usedItems',n));
 [8,12,20,32,48].forEach(n=>add('Ev ve tercihler','owned-'+n,n+' eşyalık bir ev','owned',n,20));
 [6,12,18].forEach(n=>add('Ev ve tercihler','placed-'+n,n+' işlevsel eşya yerleştir','placed',n));
 [1,3,5].forEach(n=>add('Ev ve tercihler','favorites-'+n,n+' sevdiği eşyayı keşfet','favorites',n,15));
 add('Ev ve tercihler','five-rooms','Beş odada ona ait bir köşe','furnishedRooms',5,20);
 add('Birlikte oyun','first-play','İlk oyuncak takibi','action:play',1);
 [3,7,14,30].forEach(n=>add('Birlikte oyun','play-days-'+n,n+' farklı günde oyun','playDays',n,15));
 [3,5].forEach(n=>add('Birlikte oyun','toys-'+n,n+' farklı oyuncakla tanıştı','toys',n,15));
 add('Birlikte oyun','young-play','Gençlikte de oyun arkadaşı','youngPlay',1);add('Birlikte oyun','adult-play','Büyüdük, oyun bitmedi','adultPlay',1);
 [7,14,30,60,90,180].forEach(n=>add('Birlikte yaşam','active-'+n,n+' farklı günde yan yana','activeDays',n,25));
 [1,3,12,30].forEach((n,i)=>add('Ev ve tercihler','litter-'+n,['İlk kum alışkanlığı','Kendi mahrem köşesi','Ferah bir tuvalet','Akıllı temizlik düzeni'][i],'litterUses',n,15+i*5));
 const CATALOG=Object.freeze(definitions),CATEGORIES=Object.freeze([...new Set(CATALOG.map(d=>d.category))]);
 function metrics(save){
  const events=Object.values(save.daily.events).filter(e=>e.claimed),uses=save.inventory?.uses||{},stats=save.statistics||{},actions=stats.actions||{};
  const value={litterUses:save.household?.litter.totalUses||0,bond:save.bond.points,adopted:save.cat?1:0,firstDay:save.memories.some(m=>m.id==='first_day')?1:0,young:save.growth.stage!=='kitten'?1:0,adult:save.growth.stage==='adult'?1:0,eventKinds:new Set(events.map(e=>e.id)).size,eventDays:events.length,rooms:new Set(stats.rooms||[]).size,usedItems:Object.values(uses).filter(n=>n>0).length,owned:save.inventory?.owned.length||0,placed:Object.keys(save.inventory?.placements||{}).length,favorites:Object.keys(save.bond.preferences).length,furnishedRooms:new Set(Object.values(save.inventory?.placements||{}).map(p=>p.room)).size,playDays:new Set(stats.actionDays?.play||[]).size,toys:Object.entries(uses).filter(([id,n])=>n>0&&E.item(id).action==='play').length,youngPlay:(stats.playStages||[]).includes('young')?1:0,adultPlay:(stats.playStages||[]).includes('adult')?1:0,activeDays:new Set(save.growth.activeDays).size};
  for(const [type,count] of Object.entries(actions))value['action:'+type]=count;return value;
 }
 function progress(save){const values=metrics(save),claimed=save.achievements?.claimed||[],activeDays=Math.max(save.cat?1:0,values.activeDays);return CATALOG.map(d=>({...d,activeDays,value:Math.min(d.target,values[d.metric]||0),ready:(values[d.metric]||0)>=d.target&&activeDays>=d.minDays,claimed:claimed.includes(d.id)}));}
 function claim(save,id){
  if(save.story.step!=='settled')throw new Error('Önce birlikte ilk gününüzü tamamlayın.');
  const status=progress(save).find(d=>d.id===id);if(!status||!status.ready)throw new Error('Bu hatıra için birlikte biraz daha zaman geçirmelisiniz.');if(status.claimed)throw new Error('Bu başarımın ödülü zaten alındı.');
  const next=JSON.parse(JSON.stringify(save));next.achievements=next.achievements||{claimed:[]};next.achievements.claimed.push(id);next.economy.coins+=status.reward;return next;
 }
 const api={CATALOG,CATEGORIES,metrics,progress,claim};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeAchievements=api;
})(typeof window!=='undefined'?window:globalThis);
