const test=require('node:test');const assert=require('node:assert/strict');
const player=require('../sprite_preview/patilife_v2/sprite-player.js');
test('walking cycles through four walk frames and returns to first cleanly',()=>{
 assert.deepEqual([0,150,300,450,600].map(t=>player.frameIndex('walk',t)),[4,5,6,7,4]);
});
test('idle blink stays in first row and leaves most time with eyes open',()=>{
 assert.equal(player.frameIndex('idle',0),0);assert.equal(player.frameIndex('idle',1500),0);
 assert.equal(player.frameIndex('idle',1850),2);assert.equal(player.frameIndex('idle',2800),0);
});
test('unequal source bounds share scale, floor baseline and horizontal center',()=>{
 const a=player.placement({width:200,height:280},350,512,512);
 const b=player.placement({width:330,height:250},350,512,512);
 assert.equal(a.y+a.height,b.y+b.height);assert.equal(a.x+a.width/2,256);assert.equal(b.x+b.width/2,256);
 assert.equal(a.width/200,b.width/330);
});
test('canvas player changes rows on movement and cancels work when detached',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const tasks=new Map(),draws=[];let nextId=0,motion='idle';
 const frames=Array.from({length:8},(_,i)=>({x:i*20,y:0,width:18,height:18}));
 const root={PatiLifeSpriteAtlases:{sarman:{src:'test.png',unit:18,frames,care:{src:'care.png',unit:18,frames:Array.from({length:12},(_,i)=>({x:1000+i*20,y:0,width:18,height:18}))}}},Image:class{constructor(){this.complete=true;this.naturalWidth=100;}addEventListener(){}},requestAnimationFrame:fn=>{tasks.set(++nextId,fn);return nextId;},cancelAnimationFrame:id=>tasks.delete(id)};
 const context={window:root};vm.createContext(context);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/sprite-player.js','utf8'),context);
 const canvas={style:{},isConnected:true,getAttribute:()=>motion,getContext:()=>({clearRect(){},drawImage(...args){draws.push(args);}})};
 const tick=time=>{const callbacks=[...tasks.values()];tasks.clear();callbacks.forEach(fn=>fn(time));};
 root.PatiLifeSpritePlayer.mount(canvas,'sarman',true);tick(0);assert.equal(draws.at(-1)[1],0);
 motion='walk';tick(100);assert.equal(draws.at(-1)[1],80);
 tick(250);assert.equal(draws.at(-1)[1],100);
 motion='eat';tick(300);assert.equal(draws.at(-1)[0].src,'care.png');assert.equal(draws.at(-1)[1],1000);
 motion='drink';tick(350);assert.equal(draws.at(-1)[1],1080);
 motion='sleep';tick(400);assert.equal(draws.at(-1)[1],1160);
 motion='idle';tick(450);assert.equal(draws.at(-1)[0].src,'test.png');assert.equal(draws.at(-1)[1],0);
 canvas.isConnected=false;tick(500);assert.equal(tasks.size,0);
 root.PatiLifeSpritePlayer.stopAll();assert.equal(tasks.size,0);
});
test('all coat atlases reference existing alpha PNGs with eight valid frame rectangles',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/sprite-atlases.js','utf8'),context);
 for(const id of ['sarman','tekir','smokin','calico']){
  const atlas=context.window.PatiLifeSpriteAtlases[id];assert.equal(atlas.frames.length,8);
  const png=fs.readFileSync(path.join('sprite_preview/patilife_v2',atlas.src));
  assert.equal(png.readUInt32BE(16),atlas.imageWidth);assert.equal(png.readUInt32BE(20),atlas.imageHeight);assert.equal(png[25],6);
  for(const f of atlas.frames){assert.ok(f.x>=0&&f.y>=0&&f.width>0&&f.height>0);assert.ok(f.x+f.width<=atlas.imageWidth&&f.y+f.height<=atlas.imageHeight);}
 }
});

test('care loops use separate rows with slow sleeping breathing',()=>{
 assert.deepEqual([0,220,440,660,880].map(t=>player.frameIndex('eat',t)),[0,1,2,3,0]);
 assert.deepEqual([0,180,360,540,720].map(t=>player.frameIndex('drink',t)),[4,5,6,7,4]);
 assert.deepEqual([0,700,1400,2100,2800].map(t=>player.frameIndex('sleep',t)),[8,9,10,11,8]);
});
test('all characters have twelve care frames and starter props are complete PNG regions',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),context={window:{}};vm.createContext(context);
 for(const file of ['sprite-atlases.js','prop-atlas.js'])vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/'+file,'utf8'),context);
 for(const id of ['sarman','tekir','smokin','calico']){
  const care=context.window.PatiLifeSpriteAtlases[id].care;assert.equal(care.frames.length,12);assert.ok(care.unit>0);
  const png=fs.readFileSync(path.join('sprite_preview/patilife_v2',care.src));assert.equal(png[25],6);
  assert.equal(png.readUInt32BE(16),care.imageWidth);assert.equal(png.readUInt32BE(20),care.imageHeight);
  for(const frame of care.frames){assert.ok(frame.x+frame.width<=care.imageWidth);assert.ok(frame.y+frame.height<=care.imageHeight);}
 }
 const props=context.window.PatiLifePropAtlas;assert.equal(Object.keys(props.items).length,48);for(const id of ['carrier','water','food','bed','litter','yarn','scratch','hideout'])assert.ok(props.items[id]);
 const png=fs.readFileSync(path.join('sprite_preview/patilife_v2',props.src));assert.equal(png[25],6);
 for(const frame of Object.values(props.items)){assert.ok(frame.x>=0&&frame.y>=0&&frame.width>0&&frame.height>0);const source=fs.readFileSync(path.join('sprite_preview/patilife_v2',frame.src||props.src));assert.ok(frame.x+frame.width<=source.readUInt32BE(16)&&frame.y+frame.height<=source.readUInt32BE(20));}
});
test('every coat has complete young and adult animations with preserved source bounds',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),context={window:{}};vm.createContext(context);
 vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/sprite-atlases.js','utf8'),context);
 for(const coat of ['sarman','tekir','smokin','calico'])for(const stage of ['young','adult']){
  const atlas=context.window.PatiLifeSpriteAtlases[coat].ages[stage];assert.equal(atlas.frames.length,8);assert.equal(atlas.care.frames.length,12);
  const png=fs.readFileSync(path.join('sprite_preview/patilife_v2',atlas.src));assert.equal(png[25],6);
  for(const frame of [...atlas.frames,...atlas.care.frames]){assert.ok(frame.width>0&&frame.height>0);assert.ok(frame.x+frame.width<=png.readUInt32BE(16));assert.ok(frame.y+frame.height<=png.readUInt32BE(20));}
 }
});
test('reduced-motion redraws action poses even when a grown atlas uses the same image for idle and care',()=>{
 const fs=require('node:fs'),vm=require('node:vm');let state='idle',next=0;const queue=new Map(),calls=[];
 const frames=Array.from({length:8},(_,i)=>({x:i*20,y:0,width:18,height:18}));
 const care=Array.from({length:12},(_,i)=>({x:i*20,y:100,width:18,height:18}));
 const root={PatiLifeSpriteAtlases:{sarman:{ages:{adult:{src:'grown.png',unit:18,frames,care:{src:'grown.png',unit:18,frames:care}}}}},Image:class{constructor(){this.complete=true;this.naturalWidth=100;}addEventListener(){}},matchMedia:()=>({matches:true}),requestAnimationFrame:fn=>{queue.set(++next,fn);return next;},cancelAnimationFrame:id=>queue.delete(id)};
 const ctx={window:root};vm.createContext(ctx);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/sprite-player.js','utf8'),ctx);
 const canvas={isConnected:true,style:{},getAttribute:()=>state,getContext:()=>({clearRect(){},drawImage(...args){calls.push(args);}})};
 function tick(t){const pending=[...queue.values()];queue.clear();pending.forEach(fn=>fn(t));}
 root.PatiLifeSpritePlayer.mount(canvas,'sarman',true,'adult');tick(0);assert.equal(calls.at(-1)[2],0);
 state='eat';tick(20);assert.equal(calls.at(-1)[2],100);assert.equal(calls.length,2);root.PatiLifeSpritePlayer.stopAll();
});

test('petting and scratching loop distinct poses; jump progresses once and holds landing',()=>{
 assert.deepEqual([0,240,480,720,960].map(t=>player.frameIndex('happy',t)),[0,1,2,3,0]);
 assert.deepEqual([0,180,360,540,720].map(t=>player.frameIndex('scratch',t)),[0,1,2,3,0]);
 assert.deepEqual([0,160,320,480,960].map(t=>player.frameIndex('jump',t)),[0,1,2,3,3]);
 assert.equal(player.specialMotion('pounce'),'jump');assert.equal(player.specialMotion('jump_joy'),'jump');
});
test('every coat and age has four valid independent frames for each requested special animation',()=>{
 const fs=require('node:fs'),vm=require('node:vm');const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/sprite-atlases.js','utf8'),context);
 let frames=0;for(const coat of Object.values(context.window.PatiLifeSpriteAtlases))for(const atlas of [coat,...Object.values(coat.ages)])for(const motion of ['pet','jump','scratch','bath']){
  const special=atlas.special[motion];assert.equal(special.frames.length,4);const file=fs.readFileSync('sprite_preview/patilife_v2/'+special.src);assert.equal(file[25],6);assert.equal(file.readUInt32BE(16),special.imageWidth);assert.equal(file.readUInt32BE(20),special.imageHeight);
  assert.equal(new Set(special.frames.map(f=>f.x+':'+f.y)).size,4);
  for(const f of special.frames){assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=special.imageWidth&&f.y+f.height<=special.imageHeight);const dest=player.placement(f,special.unit,512,512);assert.ok(dest.x>=0&&dest.y>=0&&dest.x+dest.width<=512&&dest.y+dest.height<=512);frames++;}
 }assert.equal(frames,192);
});
