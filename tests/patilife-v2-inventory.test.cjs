const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../sprite_preview/patilife_v2/model.js'),E=require('../sprite_preview/patilife_v2/inventory.js');
function cat(){const save=M.adopt(M.createSave(0),'sarman','Tarçın',0);save.story={step:'settled',completed:true};return E.ensure(save);}
test('catalog contains 56 unique functional items in eight groups',()=>{
 assert.equal(E.CATALOG.length,56);assert.equal(new Set(E.CATALOG.map(i=>i.id)).size,56);assert.equal(new Set(E.CATALOG.map(i=>i.category)).size,8);
 assert.ok(E.CATALOG.every(i=>i.rooms.length&&i.action&&i.price>=0));
});
test('purchase charges exactly once and rejects insufficient funds and age locks',()=>{
 const original=cat(),next=E.buy(original,'scratch');assert.equal(next.economy.coins,20);assert.equal(original.economy.coins,40);
 assert.throws(()=>E.buy(next,'scratch'));assert.throws(()=>E.buy(next,'fountain'));assert.throws(()=>E.buy(next,'large_tree'));
 assert.equal(next.economy.coins,20);
});
test('placement requires ownership, proper room and free space',()=>{
 let save=cat();assert.throws(()=>E.place(save,'hideout','living'));
 save=E.buy(save,'hideout');assert.throws(()=>E.place(save,'hideout','bathroom'));
 assert.throws(()=>E.place(save,'hideout','living',{x:23,y:14}));
 const placed=E.place(save,'hideout','living');assert.equal(placed.inventory.placements.hideout.room,'living');assert.equal(placed.economy.coins,25);
 const removed=E.remove(placed,'hideout');assert.equal(removed.inventory.placements.hideout,undefined);assert.ok(removed.inventory.owned.includes('hideout'));
});
test('functional use changes needs and discovers preferences only through completed use',()=>{
 let save=cat();save.needs.hunger=30;save=E.use(save,'food',20000);assert.equal(save.needs.hunger,70);assert.equal(save.inventory.uses.food,1);
 assert.throws(()=>E.use(save,'food',21000));save=E.use(save,'food',40000);save=E.use(save,'food',60000);
 assert.equal(save.bond.preferences.food,'food');assert.equal(save.bond.points,9);
});
test('owned but stored item cannot be used as placed furniture',()=>{
 let save=E.buy(cat(),'hideout');assert.throws(()=>E.use(save,'hideout',20000));save=E.place(save,'hideout','living');save=E.use(save,'hideout',20000);
 assert.equal(save.inventory.uses.hideout,1);
});
test('inventory migration preserves existing fields and rejects corrupt placement',()=>{
 const source=cat();source.legacy={custom:'preserved'};const next=E.ensure(source);assert.equal(next.legacy.custom,'preserved');
 next.inventory.placements.food.x=NaN;assert.throws(()=>E.ensure(next));
});
test('toy basket saves energy only when actually placed',()=>{
 let save=cat();save.economy.coins=500;save=E.buy(save,'toy_basket');
 const stored=E.use(save,'yarn',20000);assert.equal(stored.needs.energy,57);
 save=E.place(save,'toy_basket','living');const placed=E.use(save,'yarn',20000);assert.equal(placed.needs.energy,59);
});
