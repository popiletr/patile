const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../sprite_preview/patilife_v2/model.js'),E=require('../sprite_preview/patilife_v2/inventory.js'),A=require('../sprite_preview/patilife_v2/achievements.js');
function home(){const s=E.ensure(M.adopt(M.createSave(0),'sarman','Tarçın',0));s.story={step:'settled',completed:true};return s;}
test('64 milestones cover six categories and every metric has recorded progress',()=>{
 assert.equal(A.CATALOG.length,64);assert.equal(new Set(A.CATALOG.map(a=>a.id)).size,64);assert.deepEqual(A.CATEGORIES.map(c=>A.CATALOG.filter(a=>a.category===c).length),[12,9,12,16,9,6]);
 const s=home();const values=A.metrics(s);for(const goal of A.CATALOG){assert.ok(goal.metric.startsWith('action:')||Object.hasOwn(values,goal.metric));assert.ok(goal.target>0&&goal.reward>0);}
});
test('only finished actions count, cooldown failures do not advance and distinct days are durable',()=>{
 const s=home(),first=M.action(s,'play',100000);assert.equal(s.statistics.actions.play,undefined);assert.equal(first.statistics.actions.play,1);assert.equal(first.statistics.actionDays.play.length,1);
 assert.throws(()=>M.action(first,'play',101000));const second=M.action(first,'play',120000);assert.equal(second.statistics.actions.play,2);assert.equal(second.statistics.actionDays.play.length,1);
 const third=M.action(second,'play',86400000+100000);assert.equal(third.statistics.actionDays.play.length,2);assert.equal(A.progress(third).find(a=>a.id==='play-days-3').ready,false);
});
test('achievement reward is single-use across save/load and never granted before milestone',()=>{
 const s=home();assert.throws(()=>A.claim(s,'bond-450'));const rewarded=A.claim(s,'adopt');assert.equal(rewarded.economy.coins,50);assert.equal(s.economy.coins,40);
 let raw;M.persist({setItem:(k,v)=>raw=v},rewarded);const restored=M.load({getItem:()=>raw});assert.throws(()=>A.claim(restored,'adopt'));assert.equal(restored.economy.coins,50);
});
test('missing historical counters start at zero without inventing actions or erasing legacy',()=>{
 const s=home();delete s.statistics;delete s.achievements;s.legacy={pet_state:{totalFeeds:500}};const raw=JSON.stringify(s),loaded=M.load({getItem:()=>raw});assert.deepEqual(loaded.statistics.actions,{});assert.equal(loaded.legacy.pet_state.totalFeeds,500);assert.equal(A.progress(loaded).find(a=>a.id==='first-food').ready,false);
});
test('broken counters and duplicate reward claims are rejected without overwriting raw data',()=>{
 for(const corrupt of [s=>s.statistics.actions.food=-1,s=>s.statistics.actionDays.play=['bad-date'],s=>s.achievements.claimed=['adopt','adopt']]){const s=home();corrupt(s);const raw=JSON.stringify(s);assert.throws(()=>M.load({getItem:()=>raw}));assert.throws(()=>M.persist({setItem:()=>assert.fail('must not write')},s));}
});
test('furniture collection, actual preferences and multi-age toy play use independent metrics',()=>{
 let s=home();s=E.use(s,'yarn',100000);assert.equal(A.metrics(s).toys,1);assert.equal(A.metrics(s).favorites,0);s=E.use(s,'yarn',120000);s=E.use(s,'yarn',140000);assert.equal(A.metrics(s).favorites,1);assert.equal(A.metrics(s).youngPlay,0);s.growth.stage='young';s=M.action(s,'play',160000);assert.equal(A.metrics(s).youngPlay,1);assert.equal(A.metrics(s).adultPlay,0);
});

test('all 64 milestones are reachable through completed play, care, daily discoveries and furniture use',()=>{
 const L=require('../sprite_preview/patilife_v2/life.js'),G=require('../sprite_preview/patilife_v2/growth.js');let s=home(),now=0;s.economy.coins=10000;
 s=M.action(s,'memory',now);
 for(let day=0;day<180;day++){
  now=day*86400000+100000;
  for(const action of ['water','food','rest','play','pet','scratch','hide','clean','watch']){s=M.action(s,action,now);now+=20000;}
  const R=require('../sprite_preview/patilife_v2/household-rules');s.household=R.ensure(s,now);if(s.household.litter.remaining===0){const refill=R.buyLitter(s,0);s.household=refill.household;s.economy.coins=refill.coins;}if(s.household.litter.dirty>=4)s.household=R.clean(s);s.household=R.toilet(s,0,now);
  s=L.claimEvent(s,now);if(G.progress(s,now).ready)s=G.grow(s,now);
 }
 assert.equal(s.growth.stage,'adult');
 for(const id of ['bond-24','play-days-3','active-7'])s=A.claim(s,id);
 for(const item of E.CATALOG){if(!s.inventory.owned.includes(item.id))s=E.buy(s,item.id);}
 // Visit one owned item at a time, exercising actual use and preference discovery.
 for(const item of E.CATALOG){
  s.inventory.placements={};s=E.place(s,item.id,item.rooms[0]);
  for(let i=0;i<3;i++){now+=20000;s=E.use(s,item.id,now);if(s.needs.energy<20){now+=20000;s=M.action(s,'rest',now);}}
 }
 s.inventory.placements={};
 for(const room of Object.keys(E.ROOMS)){let count=0;for(const item of E.CATALOG.filter(i=>i.rooms.includes(room)&&!s.inventory.placements[i.id])){s=E.place(s,item.id,room);if(++count===4)break;}const usable=Object.keys(s.inventory.placements).find(id=>s.inventory.placements[id].room===room&&E.item(id).action!=='memory');now+=20000;s=E.use(s,usable,now);}

 const unfinished=A.progress(s).filter(a=>!a.ready);assert.deepEqual(unfinished.map(a=>({id:a.id,value:a.value,target:a.target})),[]);
});
