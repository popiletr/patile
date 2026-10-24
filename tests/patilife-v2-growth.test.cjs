const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../sprite_preview/patilife_v2/model.js'),G=require('../sprite_preview/patilife_v2/growth.js');
const start=new Date(2026,9,23,12).getTime(),day=86400000;
function cat(){const save=M.adopt(M.createSave(start),'tekir','Boncuk',start);save.story={step:'settled',completed:true};return save;}
test('time alone never skips kitten life',()=>{const save=cat();assert.equal(G.progress(save,start+100*day).ready,false);assert.throws(()=>G.grow(save,start+100*day));});
test('three days, active visits and bond are all required; transition is explicit',()=>{
 const save=cat();save.bond.points=24;save.growth.activeDays=['2026-10-23','2026-10-24','2026-10-26'];
 assert.equal(G.progress(save,start+3*day-1).ready,false);assert.equal(G.progress(save,start+3*day).ready,true);
 assert.equal(save.growth.stage,'kitten');const next=G.grow(save,start+3*day);assert.equal(next.growth.stage,'young');assert.equal(next.memories.length,1);
 assert.equal(next.cat.name,'Boncuk');assert.equal(next.cat.id,'tekir');assert.equal(next.cat.personality,'curious');
});
test('long absence cannot instantly apply both transitions on return',()=>{
 let save=cat();save.bond.points=100;save.growth.activeDays=Array.from({length:7},(_,i)=>'2026-10-'+(23+i));
 save=G.grow(save,start+30*day);assert.equal(G.progress(save,start+30*day).ready,false);
 assert.throws(()=>G.grow(save,start+30*day));save=G.grow(save,start+31*day);assert.equal(save.growth.stage,'adult');
 assert.equal(save.memories.length,2);assert.throws(()=>G.grow(save,start+32*day));
});
