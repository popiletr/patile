const test=require('node:test'),assert=require('node:assert/strict');
const {create,DURATIONS}=require('../sprite_preview/patilife_v2/care-session.js');
function fixture(){
 let now=0,hidden=false,nextId=0;const queue=new Map(),phases=[],completed=[],cancelled=[];
 const runner=create({schedule:(fn,ms)=>{queue.set(++nextId,{at:now+ms,fn});return nextId;},clear:id=>queue.delete(id),onPhase:p=>phases.push(p),onComplete:t=>completed.push(t),onCancel:r=>cancelled.push(r),isHidden:()=>hidden});
 function tick(ms){const end=now+ms;while(true){const due=[...queue].sort((a,b)=>a[1].at-b[1].at).find(([,v])=>v.at<=end);if(!due)break;now=due[1].at;queue.delete(due[0]);due[1].fn();}now=end;}
 return {runner,tick,phases,completed,cancelled,hide:()=>{hidden=true;},queue};
}
test('care commits only after approach and eating finish, once',()=>{
 const f=fixture();assert.equal(f.runner.start('food'),true);assert.equal(f.runner.start('water'),false);
 f.tick(1099);assert.equal(f.phases.length,1);assert.deepEqual(f.completed,[]);
 f.tick(1);assert.equal(f.phases[1].motion,'eat');assert.deepEqual(f.completed,[]);
 f.tick(DURATIONS.food-1);assert.deepEqual(f.completed,[]);f.tick(1);assert.deepEqual(f.completed,['food']);
 f.tick(10000);assert.deepEqual(f.completed,['food']);
});
test('cancelling during care drops completion and timer',()=>{
 const f=fixture();f.runner.start('water');f.tick(1100);assert.equal(f.runner.cancel(),true);f.tick(10000);
 assert.deepEqual(f.completed,[]);assert.equal(f.queue.size,0);assert.equal(f.runner.isRunning(),false);
});
test('backgrounded scene cannot silently earn a care action',()=>{
 const f=fixture();f.runner.start('rest');f.tick(1100);f.hide();f.tick(10000);
 assert.deepEqual(f.completed,[]);assert.deepEqual(f.cancelled,['hidden']);
});
test('cancelled action can restart and uses its own motion',()=>{
 const f=fixture();f.runner.start('food');f.runner.cancel();f.runner.start('rest',500);f.tick(500);
 assert.equal(f.phases.at(-1).motion,'sleep');f.tick(DURATIONS.rest);assert.deepEqual(f.completed,['rest']);
});
