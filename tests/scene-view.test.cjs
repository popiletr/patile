const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const V=require('../sprite_preview/patilife_v2/scene-view');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('default camera keeps original view, pinch keeps the same scene point under its moving center',()=>{
 const v=V.create({scale:1});assert.equal(v.scale,1);assert.equal(v.manual,false);assert.equal(v.transform(500,400,600),'translate3d(-500px, 0px, 0) scale(1)');
 const point=v.point(200,300,500,600);v.begin({x:100,y:300},{x:300,y:300},500,400,600);
 const camera=v.move({x:170,y:300},{x:270,y:300},400,600);assert.equal(v.scale,.55);const after=v.point(220,300,camera,600);close(after.x,point.x);close(after.bottom,point.bottom);assert.equal(v.manual,true);
});
test('world, screen and pointer coordinates round-trip at every supported scale after a translated pinch',()=>{
 for(const spread of [20,120,200,280,1000]){const v=V.create({scale:1});v.begin({x:100,y:300},{x:300,y:300},500,400,600);const camera=v.move({x:200-spread/2,y:320},{x:200+spread/2,y:320},400,600);for(const p of [{x:750,bottom:38},{x:530,bottom:550}]){const screen=v.screen(p.x,p.bottom,camera,600),world=v.point(screen.x,screen.y,camera,600);close(world.x,p.x);close(world.bottom,p.bottom);}assert.ok(v.scale>=.55&&v.scale<=1.8);close(v.width(400),400/v.scale);}
});
test('pinch cannot pan beyond room bounds and ending a gesture prevents further movement',()=>{
 const v=V.create({scale:1});v.begin({x:100,y:300},{x:300,y:300},0,400,600);assert.equal(v.move({x:900,y:-500},{x:1100,y:-500},400,600),0);v.end();assert.equal(v.move({x:0,y:0},{x:1,y:1},400,600),null);
});
test('all inline scripts parse and the shared view is loaded before its first use',()=>{
 const source=fs.readFileSync('sprite_preview/patilife_app.html','utf8');for(const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);assert.ok(source.indexOf('scene-view.js')<source.indexOf('PatiLifeSceneView.create()'));
 assert.match(source,/dx \/ sceneView.scale/);assert.match(source,/dy \/ \(scaleY\*sceneView.scale\)/);assert.match(source,/scenePoint\(e.clientX,e.clientY\).x/);
});
test('reset restores original scale, vertical framing and automatic camera behavior',()=>{
 const v=V.create({scale:1});v.begin({x:100,y:300},{x:300,y:300},500,400,600);v.move({x:160,y:350},{x:240,y:350},400,600);v.reset();assert.equal(v.scale,1);assert.equal(v.manual,false);assert.equal(v.transform(500,400,600),'translate3d(-500px, 0px, 0) scale(1)');
});
test('two-touch input cancels object dragging, consumes pinch moves and releases cleanly',()=>{
 const windowEvents={},viewportEvents={},canceled=[];let camera=500,applies=0,cancels=0;
 const target={closest:()=>null,dispatchEvent:e=>canceled.push(e.pointerId)},viewport={clientWidth:400,clientHeight:600,getBoundingClientRect:()=>({left:10,top:20}),addEventListener:(n,fn)=>viewportEvents[n]=fn};
 const root={window:{addEventListener:(n,fn)=>windowEvents[n]=fn},PointerEvent:class{constructor(type,options){Object.assign(this,{type},options);}}};root.window.window=root.window;vm.createContext(root);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/scene-view.js','utf8'),root);const view=root.window.PatiLifeSceneView.create({scale:1});root.window.PatiLifeSceneView.bind(viewport,view,{camera:()=>camera,cancel:()=>cancels++,apply:x=>{camera=x;applies++;}});
 const event=(id,x,y)=>({pointerId:id,pointerType:'touch',clientX:x,clientY:y,target,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}});
 viewportEvents.pointerdown(event(1,110,320));const second=event(2,310,320);viewportEvents.pointerdown(second);assert.deepEqual(canceled,[1,2]);assert.equal(second.prevented,true);const move=event(1,160,350);windowEvents.pointermove(move);assert.equal(move.stopped,true);assert.equal(applies,1);assert.ok(view.scale<1);windowEvents.pointerup(event(1,160,350));windowEvents.pointerup(event(2,310,320));const after=event(1,0,0);windowEvents.pointermove(after);assert.equal(applies,1);assert.ok(cancels>=3);const ghost=event(2,310,320);viewportEvents.click(ghost);assert.equal(ghost.prevented,true);
});

test('scene covers the viewport vertically at minimum, default and maximum zoom',()=>{for(const spread of [10,100,200,360,1000]){const v=V.create({scale:1});v.begin({x:100,y:300},{x:300,y:300},500,400,600);const c=v.move({x:200-spread/2,y:30},{x:200+spread/2,y:30},400,600);const top=v.screen(c, 768*1.43,c,600).y,bottom=v.screen(c,-768*.43,c,600).y;assert.ok(top<=1e-8);assert.ok(bottom>=600-1e-8);assert.equal(v.height(600),600);}});

test('launch opens in a centered wide view with correct input mapping and filled background',()=>{
 const v=V.create();assert.equal(v.scale,.55);assert.equal(v.manual,false);
 const transform=v.transform(500,400,600);assert.match(transform,/scale\(0.55\)/);
 const center=v.point(200,300,500,600);close(center.bottom,384);
 const p=v.screen(center.x,center.bottom,500,600);close(p.x,200);close(p.y,300);
 assert.ok(v.screen(500,768*1.43,500,600).y<=0);
 assert.ok(v.screen(500,-768*.43,500,600).y>=600);
});
