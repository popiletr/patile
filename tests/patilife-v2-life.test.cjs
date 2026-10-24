const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../sprite_preview/patilife_v2/model.js'),L=require('../sprite_preview/patilife_v2/life.js');
const now=new Date(2026,9,23,12).getTime();
function settled(){const save=M.adopt(M.createSave(now),'sarman','Tarçın',now);save.story={step:'settled',completed:true};save.friends=M.CATS.filter(c=>c.id!=='sarman').map(c=>({catId:c.id,adopted:true}));return save;}
test('returning during a day preserves event and friend identity',()=>{
 const once=L.visit(settled(),now),again=L.visit(once,now+60000),day=L.dayKey(now);
 assert.deepEqual(again.daily.events[day],once.daily.events[day]);assert.notEqual(again.daily.events[day].friendCatId,'sarman');
 assert.equal(again.economy.coins,40);
});
test('event reward and memory are single-use across save/load',()=>{
 const once=L.claimEvent(settled(),now);assert.equal(once.economy.coins,45);assert.equal(once.memories.length,1);
 const parsed=JSON.parse(JSON.stringify(once));assert.throws(()=>L.claimEvent(parsed,now+10000));
 assert.equal(parsed.economy.coins,45);assert.equal(parsed.memories.length,1);
});
test('next calendar day has its own event without resetting previous claims',()=>{
 const once=L.claimEvent(settled(),now),next=L.claimEvent(once,now+86400000);
 assert.equal(next.economy.coins,50);assert.equal(Object.keys(next.daily.events).length,2);
 assert.throws(()=>L.claimEvent(next,now));
});
test('care proposals reward actual action types and cannot be collected early or twice',()=>{
 let save=L.visit(settled(),now);assert.throws(()=>L.claimTask(save,'play',now));
 save=L.recordAction(save,'food',now);assert.equal(save.daily.tasks[L.dayKey(now)].water,false);
 save=L.recordAction(save,'water',now);save=L.claimTask(save,'water',now);assert.equal(save.economy.coins,46);
 assert.throws(()=>L.claimTask(save,'water',now));assert.throws(()=>L.claimTask(save,'unknown',now));
});
test('long absence has gentle bounded needs, no coin penalty and time processed once',()=>{
 const save=settled(),after=L.advanceNeeds(save,now+7*86400000),again=L.advanceNeeds(after,now+7*86400000);
 assert.equal(after.needs.hunger,20);assert.equal(after.needs.thirst,20);assert.equal(after.needs.energy,100);
 assert.equal(after.economy.coins,40);assert.deepEqual(after.needs,again.needs);
});
test('clock moving backward cannot grant rest or reverse processed time',()=>{
 const save=settled(),after=L.advanceNeeds(save,now-3600000);
 assert.deepEqual(after.needs,save.needs);assert.equal(after.lastTick,now);
});
test('first day is protected from daily events and passive decay',()=>{
 const save=M.adopt(M.createSave(now),'smokin','Minik',now);
 assert.throws(()=>L.visit(save,now));assert.throws(()=>L.advanceNeeds(save,now+86400000));
 assert.equal(L.recordAction(save,'water',now),save);
});
test('automatic feeder helps once a day without completing manual care tasks',()=>{
 const E=require('../sprite_preview/patilife_v2/inventory.js');let save=E.ensure(settled());save.growth.stage='young';save.economy.coins=500;
 save=E.place(E.buy(save,'timed_feeder'),'timed_feeder','kitchen');save.needs.hunger=25;
 let next=L.visit(save,now);assert.equal(next.needs.hunger,55);assert.equal(next.bond.points,0);assert.equal(next.daily.tasks[L.dayKey(now)].water,false);
 next.needs.hunger=25;next=L.visit(next,now+1000);assert.ok(next.needs.hunger<=25&&next.needs.hunger>24.9);
 next=L.visit(next,now+86400000);assert.equal(next.needs.hunger,55);
});
test('water fountain reduces decay only while placed',()=>{
 const E=require('../sprite_preview/patilife_v2/inventory.js');let save=E.ensure(settled());save.economy.coins=500;save=E.buy(save,'fountain');
 const stored=L.advanceNeeds(save,now+3600000);save=E.place(save,'fountain','kitchen');const placed=L.advanceNeeds(save,now+3600000);
 assert.equal(stored.needs.thirst,35);assert.equal(placed.needs.thirst,37);
});
