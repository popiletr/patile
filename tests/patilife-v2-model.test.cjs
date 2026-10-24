const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../sprite_preview/patilife_v2/model.js');
function storage(initial = {}) { const values = new Map(Object.entries(initial)); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }
test('legacy data backed up verbatim, source preserved and no invented identity', () => {
 const original = JSON.stringify({ coins: 71, catName: 'Pamuk' });
 const s = storage({ pet_state: original }); const save = model.load(s, 100);
 assert.equal(s.getItem('pet_state'), original);
 assert.equal(JSON.parse(s.getItem('patilife_pre_v2_backup')).values.pet_state, original);
 assert.equal(save.legacy.pet_state.coins, 71); assert.equal(save.cat, null);
 assert.equal(save.requiresLegacyIdentity, true);
});
test('corrupt legacy is preserved and migration stops', () => {
 const s = storage({ pet_state: '{bad' }); assert.throws(() => model.load(s));
 assert.equal(s.getItem('pet_state'), '{bad'); assert.ok(s.getItem('patilife_pre_v2_backup'));
 assert.equal(s.getItem(model.KEY), null);
});
test('unknown version cannot overwrite existing save', () => {
 const s = storage({ [model.KEY]: '{"version":99}' }); assert.throws(() => model.load(s));
 assert.equal(s.getItem(model.KEY), '{"version":99}');
});
test('adoption persists fixed identity and Turkish name, cannot replace cat', () => {
 const s = storage(); const save = model.adopt(model.load(s), 'calico', '  Çiğdem  ', 120);
 model.persist(s, save); const restored = model.load(s);
 assert.equal(restored.cat.name, 'Çiğdem'); assert.equal(restored.cat.gender, 'Dişi');
 assert.equal(restored.story.step, 'home_arrival'); assert.equal(restored.growth.adoptedAt, 120);
 assert.throws(() => model.adopt(restored, 'sarman', 'Başka'));
 assert.throws(() => model.adopt(model.createSave(), 'sarman', ' '));
});
test('Suika-only player still sees adoption story', () => {
 const save=model.load(storage({cat_suika_save_v2:'{"level":8}'}));
 assert.equal(save.story.step,'rain');assert.equal(save.requiresLegacyIdentity,undefined);
});
test('legacy identity migration preserves name, gender, personality, balances and source', () => {
 const old={catName:'Pofuduk',catGender:'Dişi',personality:'sleepy',coins:71,hunger:22,energy:45,level:9};
 const s=storage({pet_state:JSON.stringify(old),pati_placed_decor:'[{"id":"bed"}]'});
 const migrated=model.migrateIdentity(model.load(s),'tekir',200);
 assert.equal(migrated.cat.name,'Pofuduk');assert.equal(migrated.cat.personality,'sleepy');
 assert.equal(migrated.cat.gender,'Dişi');assert.equal(migrated.economy.coins,71);
 assert.equal(migrated.needs.hunger,22);assert.equal(migrated.story.step,'settled');
 model.persist(s,migrated);assert.equal(model.load(s).legacy.pet_state.level,9);
 assert.equal(JSON.parse(s.getItem('pet_state')).coins,71);
 assert.equal(migrated.legacy.pati_placed_decor[0].id,'bed');
});
test('first home requires real care actions in order and saves the memory once', () => {
 let save=model.adopt(model.createSave(0),'smokin','Minik',0);
 assert.throws(()=>model.action(save,'food',100));
 for(const [index,action] of ['open','water','food','rest','play','memory'].entries()){
  save=model.action(save,action,1000*(index+1));
 }
 assert.equal(save.story.step,'settled');assert.equal(save.memories.length,1);
 assert.equal(save.needs.thirst,85);assert.equal(save.needs.hunger,90);
 assert.equal(save.care.bedReady,true);assert.equal(save.care.litterReady,true);
 assert.equal(save.bond.points,15);
 save=model.action(save,'memory',30000);assert.equal(save.memories.length,1);
});
test('repeated actions cannot farm bond points', () => {
 let save=model.adopt(model.createSave(0),'sarman','Tarçın',0);
 save.story={step:'settled',completed:true};
 save=model.action(save,'pet',1000);assert.throws(()=>model.action(save,'pet',2000));
 for(let i=1;i<20;i++)save=model.action(save,'pet',1000+i*16000);
 assert.equal(save.bond.points,15);
});
test('insufficient energy never grants play rewards',()=>{
 const save=model.adopt(model.createSave(0),'sarman','Tarçın',0);
 save.story={step:'settled',completed:true};save.needs.energy=2;
 assert.throws(()=>model.action(save,'play',1000));assert.equal(save.bond.points,0);
});
test('corrupt numeric state cannot silently reset needs',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.needs.hunger='bad';
 const original=JSON.stringify(save),s=storage({[model.KEY]:original});
 assert.throws(()=>model.load(s));assert.equal(s.getItem(model.KEY),original);
});
