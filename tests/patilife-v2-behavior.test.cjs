const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../sprite_preview/patilife_v2/model.js'),E=require('../sprite_preview/patilife_v2/inventory.js'),B=require('../sprite_preview/patilife_v2/behavior.js');
function home(){const s=E.ensure(M.adopt(M.createSave(0),'tekir','Boncuk',0));s.story={step:'settled',completed:true};s.inventory.placements={};return s;}
test('route detours around furniture and every whole segment clears its footprint',()=>{
 const s=home();s.inventory.placements.bed={room:'living',x:50,y:30};const route=B.path(s,'living',{x:15,y:30},{x:85,y:30});assert.ok(route.length>2);
 for(let i=1;i<route.length;i++)for(const box of B.obstacles(s,'living'))assert.equal(B.blocked(route[i-1],route[i],box),false);
 assert.ok(B.length(route)>70);assert.deepEqual(route.at(-1),{x:85,y:30});
});
test('solid furniture wall yields no route; target object can still be approached',()=>{
 const s=home();for(const [id,y] of [['bed',12],['carrier',30],['hideout',48]])s.inventory.placements[id]={room:'living',x:50,y};
 assert.equal(B.path(s,'living',{x:15,y:30},{x:85,y:30}),null);
 assert.ok(B.path(s,'living',{x:15,y:30},{x:50,y:30},'carrier'));
 assert.equal(B.path(s,'living',{x:15,y:30},{x:50,y:30}),null);
});
test('wall furniture and other rooms do not block the floor, resting cat can leave bed',()=>{
 const s=home();s.inventory.placements.wall_scratch={room:'living',x:50,y:73};s.inventory.placements.carrier={room:'bedroom',x:50,y:30};assert.equal(B.path(s,'living',{x:15,y:30},{x:85,y:30}).length,2);
 s.inventory.placements.bed={room:'living',x:50,y:30};assert.ok(B.path(s,'living',{x:50,y:30},{x:85,y:30}));
 assert.equal(B.path(s,'living',{x:50,y:30},{x:100,y:30}),null);
});
test('personality changes choices; autonomous choice does not mutate progression',()=>{
 const s=home();s.inventory.placements.carrier={room:'living',x:20,y:40};s.inventory.placements.bed={room:'living',x:75,y:20};const original=JSON.stringify(s);
 const choices=Array.from({length:100},(_,i)=>B.choose(s,'living',{x:50,y:30},()=>i/100));assert.equal(JSON.stringify(s),original);
 const cautious=JSON.parse(original);cautious.cat.personality='timid';
 const cautiousChoices=Array.from({length:100},(_,i)=>B.choose(cautious,'living',{x:50,y:30},()=>i/100));
 assert.ok(cautiousChoices.filter(c=>c.id==='carrier').length>choices.filter(c=>c.id==='carrier').length);
 s.needs.energy=15;assert.ok(Array.from({length:100},(_,i)=>B.choose(s,'living',{x:50,y:30},()=>i/100)).filter(c=>c.id==='bed').length>choices.filter(c=>c.id==='bed').length);
});
test('cancelling travel freezes interpolated position and prevents following segments',()=>{
 let now=0,id=0;const timers=new Map(),segments=[];let completed=0;
 const travel=B.createMovement({now:()=>now,schedule:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clear:id=>timers.delete(id),onSegment:(p,ms)=>segments.push({p,ms})});
 travel.start([{x:10,y:20},{x:30,y:20},{x:30,y:40}],2000,()=>completed++);now=500;assert.deepEqual(travel.cancel(),{x:20,y:20});assert.equal(timers.size,0);assert.equal(completed,0);assert.equal(segments.length,1);
 travel.start([{x:20,y:20},{x:30,y:20}],1000,()=>completed++);const due=[...timers.values()][0];now=1500;due.fn();assert.equal(completed,1);assert.equal(travel.position(),null);
});
