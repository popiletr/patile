const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../sprite_preview/patilife_v2/household-rules'),S=require('../sprite_preview/patilife_v2/surfaces');
const save=()=>({economy:{coins:300},needs:{hunger:0,thirst:0},achievements:{claimed:[]}});
const commit=(s,r)=>({...s,household:r.household||r,economy:{coins:r.coins??s.economy.coins}});
test('finite supplies charge once on filling, free tap water, no rewards from reloading',()=>{
 let s=save(),now=Date.now();s=commit(s,R.refill(s,'food','basic',6,now));assert.equal(s.economy.coins,252);assert.equal(s.household.food.portions,6);
 s=commit(s,R.consume(s,'food',now));s=commit(s,R.meal(s,'food','basic',now));assert.equal(s.household.food.portions,5);assert.equal(s.economy.coins,252);
 s=commit(s,R.refill(s,'water','tap',10,now));assert.equal(s.economy.coins,252);assert.equal(s.household.water.portions,10);
 const first=R.offline(s,{food:3,water:3},now+100*3600000);assert.equal(first.household.food.portions,0);assert.equal(first.household.water.portions,0);
 const again=R.offline({...s,household:first.household,needs:first.needs},{food:3,water:3},now+100*3600000);assert.deepEqual(again,first);assert.equal(s.economy.coins,252);
 assert.throws(()=>R.consume({...s,household:first.household},'food'));assert.throws(()=>R.refill({...s,economy:{coins:0}},'food','gourmet',6));
});
test('offline auto feeder respects finite stock, real time and locked manual stations',()=>{
 const now=Date.now();let s=commit(save(),R.refill(save(),'food','basic',6,now));
 assert.equal(R.offline(s,{food:0,water:0},now+100*3600000).household.food.portions,6);
 const first=R.offline(s,{food:3,water:0},now+6*3600000);assert.equal(first.household.food.portions,3);assert.equal(first.needs.hunger,60);
 const twice=R.offline({...s,...first},{food:3,water:0},now+6*3600000);assert.equal(twice.household.food.portions,3);
 const later=R.offline({...s,...first},{food:3,water:0},now+8*3600000);assert.equal(later.household.food.portions,3);assert.ok(later.needs.hunger<first.needs.hunger||later.needs.hunger===first.needs.hunger);
});
test('food risk needs repeated meals across real dates; treatment costs and recovery takes care',()=>{
 let s=save(),now=new Date(2026,9,23,12).getTime();for(let i=0;i<10;i++)s=commit(s,R.meal(s,'food','budget',now+i*1000));assert.equal(s.household.condition,'well');assert.equal(s.household.poorDays.length,1);
 for(let d=1;d<3;d++)s=commit(s,R.meal(s,'food','budget',now+d*86400000));assert.equal(s.household.condition,'sensitive');assert.ok(R.notices(s,{food:0,water:0}).some(n=>n.id==='health'));
 s=commit(s,R.vet(s));assert.equal(s.economy.coins,265);assert.equal(s.household.condition,'recovering');assert.equal(s.household.poorMeals,0);
 for(let i=0;i<4;i++)s=commit(s,R.meal(s,'food','gourmet',now+i*86400000));assert.equal(s.household.condition,'well');assert.ok(s.household.health>=85);
});
test('manual and electric toilets consume litter, cleaning never creates infinite litter, milestones sequential',()=>{
 let s=save();for(let i=0;i<4;i++)s=commit(s,R.toilet(s,0));assert.equal(s.household.litter.remaining,4);assert.throws(()=>R.toilet(s,0));s=commit(s,R.clean(s));assert.equal(s.household.litter.remaining,4);
 for(let i=0;i<4;i++)s=commit(s,R.toilet(s,3));assert.equal(s.household.litter.remaining,0);assert.equal(s.household.litter.dirty,0);assert.throws(()=>R.toilet(s,3));s=commit(s,R.buyLitter(s,3));assert.equal(s.economy.coins,280);assert.equal(s.household.litter.remaining,12);assert.equal(s.household.litter.totalUses,8);
 s.achievements.claimed=['litter-30'];assert.equal(R.litterLevel(s),0);s.achievements.claimed=['litter-3','litter-12','litter-30'];assert.equal(R.litterLevel(s),3);
});
test('surface contact uses the front lip at actual foot x on a slope, rejects poles and hunt targets',()=>{
 const p={category:'platform',points:[{x:0,y:300},{x:200,y:330},{x:200,y:355},{x:0,y:325}]};assert.equal(S.contact(p,0),446);assert.equal(S.contact(p,100),431);assert.equal(S.contact(p,200),416);assert.equal(S.contact(p,201),null);
 assert.equal(S.contact({...p,category:'hunt_mouse'},100),null);assert.equal(S.standable({category:'climb',points:[{x:0,y:0},{x:50,y:400}]}),false);
});
test('household sprite metadata contains 48 cat action frames, 8 toilet states, 16 toy movements, 4 cleaning states',()=>{
 const root={};root.window=root;vm.runInNewContext(fs.readFileSync('sprite_preview/patilife_v2/household-atlases.js','utf8'),root);let count=0;
 for(const [name,a]of Object.entries(root.PatiLifeHouseholdAtlases)){assert.ok(fs.existsSync('sprite_preview/patilife_v2/'+a.src));assert.equal(a.groups.length,4);for(const g of a.groups){assert.equal(g.frames.length,name==='toilet-upgrades'?2:name==='toilet-cleaning'?1:4);for(const f of g.frames){assert.ok(f.width>0&&f.height>0&&f.x>=0&&f.y>=0);assert.ok(f.x+f.width<=a.imageWidth&&f.y+f.height<=a.imageHeight);assert.ok(g.unit>=Math.max(f.width,f.height));count++;}}}assert.equal(count,76);
});
function householdFixture(level=0){
 const M=require('../sprite_preview/patilife_v2/model'),E=require('../sprite_preview/patilife_v2/inventory');let life=E.ensure(M.adopt(M.createSave(),'sarman','Çakıl'));life.story={step:'settled',completed:true};life.household=R.ensure(life);life.care.litterMigration=true;life.achievements.claimed=level?['litter-3','litter-12','litter-30'].slice(0,level):[];
 const game={lifeV2:life,coins:300,hunger:20,thirst:70,happy:50,toiletNeed:80,currentRoom:'living',isBusy:false},timer=[],calls=[],records=[],actor={style:{opacity:'1'}};const classes=new Set(),node={classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)},querySelector:()=>null};
 class El{constructor(tag){this.tagName=tag;this.children=[];this.style={};this.dataset={};}append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}setAttribute(){}remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}getContext(){return {clearRect(){},drawImage(){}};}querySelector(selector){return this.children.find(n=>n.tagName===selector);}}
 const decorContainer=new El('div');
 const root={PatiLifeHouseholdRules:R,PatiLifeHome:{rank:()=>3,station:()=>({id:'food'})},PatiLifeClassicLife:{snapshot:g=>({...JSON.parse(JSON.stringify(g.lifeV2)),economy:{coins:g.coins},needs:{hunger:g.hunger,thirst:g.thirst}}),syncInventory(){},decorate(){},record:(g,t)=>records.push(t)},PatiLifeSpriteAtlases:Object.fromEntries(['sarman','tekir','smokin','calico'].map(id=>[id,{ages:{young:{},adult:{}}}])),document:{hidden:false,body:{classList:{toggle(){}}},getElementById:id=>id==='catActor'?actor:id==='placed-litter'?node:id==='decorContainer'?decorContainer:decorContainer.children.find(c=>c.id===id)||null,createElement:t=>new El(t),addEventListener(){}},setInterval:()=>1,clearInterval(){},setTimeout:(fn,ms)=>timer.push({fn,ms}),Image:class{constructor(){this.complete=true;this.naturalWidth=1;}}};
 root.window=root;vm.createContext(root);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/household-atlases.js','utf8'),root);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/household.js','utf8'),root);
 const manager={CATALOG:Object.fromEntries(['litter','wide_litter','private_litter'].map(id=>['cozy_'+id,{}])),ownedDecor:['cozy_litter'],placedDecor:[{id:'placed-litter',itemId:'cozy_litter',room:'bathroom',x:900,bottom:40,scale:1}],saveOwnedDecor(){},saveDecorState(){},renderRoomDecor(){}};
 const api={save(){},hud(){},notice:t=>calls.push(['notice',t]),close(){},playing:()=>false,room:r=>{game.currentRoom=r;},focus(){},walk:(x,b,fn)=>{calls.push(['walk',x,b]);fn();},scaleY:()=>1,retreat:(x,b)=>calls.push(['retreat',x,b]),food:(q,stock)=>{calls.push(['food',q,stock]);game.isBusy=true;},water:(q,stock)=>calls.push(['water',q,stock])};
 root.PatiLifeHousehold.init(game,manager,api);return {HH:root.PatiLifeHousehold,game,timer,calls,records,actor,classes,root};
}
test('actual movable open toilet uses its room and coordinates, keeps cat visible and commits on completion only',()=>{
 const f=householdFixture();f.HH.useToilet();assert.equal(f.game.currentRoom,'bathroom');const walk=f.calls.find(c=>c[0]==='walk');assert.ok(walk[1]>880&&walk[1]<930);assert.ok(walk[2]>85&&walk[2]<100);assert.equal(f.game.currentAnim,'toilet');assert.equal(f.game.lifeV2.household.litter.totalUses,0);assert.ok(f.game.toiletContact);assert.equal(f.classes.has('toilet-in-use'),false);assert.ok(f.root.document.getElementById('active-litter-front'));f.timer.find(t=>t.ms===700).fn();assert.equal(f.actor.style.opacity,'1');f.HH.useToilet();assert.equal(f.timer.length,2);f.timer.find(t=>t.ms===5500).fn();assert.equal(f.game.lifeV2.household.litter.totalUses,1);assert.equal(f.game.lifeV2.household.litter.remaining,7);assert.equal(f.game.toiletNeed,0);assert.equal(f.game.isBusy,false);assert.deepEqual(f.records,['clean']);assert.equal(f.game.toiletContact,null);assert.equal(f.root.document.getElementById('active-litter-front'),null);assert.ok(f.calls.some(c=>c[0]==='retreat'));
});
test('covered toilet hides cat during use and restores it when room changes without granting care',()=>{
 const f=householdFixture(1);f.HH.useToilet();f.timer.find(t=>t.ms===700).fn();assert.equal(f.actor.style.opacity,'0');f.game.currentRoom='living';f.timer.find(t=>t.ms===5500).fn();assert.equal(f.actor.style.opacity,'1');assert.equal(f.game.lifeV2.household.litter.totalUses,0);assert.equal(f.game.toiletNeed,80);assert.equal(f.game.isBusy,false);
});
test('household idle tick starts one prepaid feeding, never double consumes while occupied or hidden',()=>{
 const f=householdFixture(),s=f.game.lifeV2;f.game.lifeV2.household=R.refill(s,'food','basic',6,Date.now()-100).household;f.HH.tick();assert.equal(f.game.lifeV2.household.food.portions,5);assert.deepEqual(f.calls.find(c=>c[0]==='food'),['food','basic',true]);f.HH.tick();assert.equal(f.game.lifeV2.household.food.portions,5);f.game.isBusy=false;f.root.document.hidden=true;f.game.lifeV2.household.food.nextAt=0;f.HH.tick();assert.equal(f.game.lifeV2.household.food.portions,5);
});
test('restored manual scooping cancels without cleaning or rewards, completes once without refilling litter',()=>{
 const f=householdFixture();f.game.lifeV2.household.litter.dirty=3;const remaining=f.game.lifeV2.household.litter.remaining;assert.equal(f.HH.beginScoop(),true);assert.equal(f.game.isBusy,true);assert.equal(f.HH.beginScoop(),false);f.HH.cancelScoop();assert.equal(f.game.lifeV2.household.litter.dirty,3);assert.equal(f.game.coins,300);assert.equal(f.HH.finishScoop(),false);
 assert.equal(f.HH.beginScoop(),true);assert.equal(f.HH.finishScoop(),true);assert.equal(f.game.lifeV2.household.litter.dirty,0);assert.equal(f.game.lifeV2.household.litter.remaining,remaining);assert.equal(f.game.coins,305);assert.equal(f.HH.finishScoop(),false);assert.equal(f.game.coins,305);assert.equal(f.HH.beginScoop(),false);
 const auto=householdFixture(3);auto.game.lifeV2.household.litter.dirty=1;assert.equal(auto.HH.beginScoop(),false);assert.equal(auto.game.isBusy,false);
});
test('real scoop collection requires all topaks and ignores stale completion after closing',()=>{
 const source=fs.readFileSync('sprite_preview/patilife_app.html','utf8');function body(name){const a=source.indexOf('function '+name+'(');let at=source.indexOf('{',a),depth=1;while(depth){at++;if(source[at]==='{')depth++;if(source[at]==='}')depth--;}return source.slice(a,at+1);}
 let awards=0;const timers=[],ctx={GameState:{lifeV2:{household:{}}},isLitterGameActive:true,remainingWasteCount:2,PatiLifeHousehold:{finishScoop:()=>{awards++;return true;}},document:{getElementById:()=>({textContent:''})},playBeep(){},triggerVibrate(){},sfxFanfare(){},addXP(){},showBubble(){},closeLitterGame:()=>{ctx.isLitterGameActive=false;},setTimeout:fn=>timers.push(fn)};ctx.window=ctx;vm.createContext(ctx);for(const name of ['collectLitterWaste','finishLitterCleaningGame'])vm.runInContext(body(name),ctx);
 const item=()=>({isCollected:false,el:{classList:{add(){}}}});const a=item(),b=item();ctx.collectLitterWaste(a);ctx.collectLitterWaste(a);assert.equal(ctx.remainingWasteCount,1);assert.equal(awards,0);ctx.finishLitterCleaningGame();assert.equal(awards,0);ctx.collectLitterWaste(b);assert.equal(ctx.remainingWasteCount,0);timers.forEach(fn=>fn());assert.equal(awards,1);ctx.finishLitterCleaningGame();assert.equal(awards,1);
 ctx.isLitterGameActive=true;ctx.remainingWasteCount=1;ctx.collectLitterWaste(item());ctx.closeLitterGame();ctx.finishLitterCleaningGame();assert.equal(awards,1);
});
test('painted modal icons resolve game sections and include a distinct scoop icon without text symbols',()=>{
 const I=require('../sprite_preview/patilife_v2/game-icons');assert.equal(Object.keys(I.ICONS).length,12);for(const [title,id]of [['Kum kabı ve temizlik','litter'],['Kürekle temizle','litter'],['Sağlık ve bakım','health'],['Başarımlar','achievement'],['Günlük','daily'],['Albüm','album'],['Yeni eşya al','home'],['Mama ve hazne','food'],['Su ve hazne','water'],['Oyun ayarları','settings']])assert.equal(I.forText(title),id);
 assert.ok(fs.existsSync('sprite_preview/patilife_v2/assets/modal-icons.png'));
});
test('litter dialog clean button actually opens the scoop game instead of silently clearing dirt',()=>{
 const f=householdFixture();f.game.lifeV2.household.litter.dirty=2;
 class El{constructor(tag,text){this.tagName=tag;this.textContent=text;this.children=[];this.style={};this.dataset={};}append(...nodes){this.children.push(...nodes);}remove(){this.removed=true;}setAttribute(){}getContext(){return {clearRect(){},drawImage(){}};}}
 const box=new El('section'),layer=new El('div');let started=0;f.root.document.createElement=t=>new El(t);f.root.Image=class{constructor(){this.complete=true;this.naturalWidth=1;}};f.root.PatiLifeHome.dialog=()=>({box,layer});f.root.PatiLifeHome.button=(text,fn)=>{const b=new El('button',text);b.onclick=fn;return b;};f.root.openLitterCleaningGame=()=>{started++;f.HH.beginScoop();};f.HH.toiletMenu();
 const all=n=>[n,...n.children.flatMap(all)],button=all(box).find(n=>n.tagName==='button'&&n.textContent==='Kürekle temizle');assert.ok(button);assert.equal(button.disabled,false);button.onclick();assert.equal(started,1);assert.equal(layer.removed,true);assert.equal(f.game.lifeV2.household.litter.dirty,2);assert.equal(f.game.coins,300);
});
test('toilet guidance distinguishes need, dirt and empty litter in the exact required order',()=>{
 const f=householdFixture(),s=f.game.lifeV2,l=s.household.litter;f.game.toiletNeed=80;
 assert.equal(f.HH.status().action,'use');l.dirty=4;assert.equal(f.HH.status().action,'clean');assert.equal(f.HH.status().canUse,false);assert.ok(f.HH.status().steps[1].text.includes('Önce'));
 l.remaining=0;assert.equal(f.HH.status().action,'refill');assert.equal(f.HH.status().canClean,false);assert.ok(f.HH.status().message.includes('20 altın'));
 s.household=R.buyLitter(s,0).household;assert.equal(f.HH.status().action,'use');assert.equal(s.household.litter.dirty,0);
 f.game.toiletNeed=0;assert.equal(f.HH.status().action,'wait');s.household.litter.dirty=2;assert.equal(f.HH.status().action,'clean');assert.equal(f.HH.status().step,3);f.game.isBusy=true;assert.equal(f.HH.status().button,null);assert.ok(!f.HH.status().steps.some(step=>step.state==='current'));
 f.game.isBusy=false;f.HH.cancelScoop();assert.equal(R.toiletStatus(s,80,{placed:false}).action,'place');
 const auto=householdFixture(3);auto.game.toiletNeed=0;assert.equal(auto.HH.status().action,'wait');assert.equal(auto.HH.status().steps[2].state,'automatic');assert.equal(auto.HH.status().canClean,false);auto.game.lifeV2.household.litter.remaining=0;assert.equal(auto.HH.status().action,'refill');
});
function guideFixture(f){
 class El{constructor(tag,text){this.tagName=tag;this.textContent=text;this.children=[];this.style={};this.dataset={};this.className='';}append(...nodes){this.children.push(...nodes);}remove(){this.removed=true;}setAttribute(k,v){this[k]=v;}getContext(){return {clearRect(){},drawImage(){}};}}
 let latest;f.root.document.createElement=t=>new El(t);f.root.PatiLifeHome.dialog=()=>{latest={box:new El('section'),layer:new El('div')};return latest;};f.root.PatiLifeHome.button=(text,fn)=>{const b=new El('button',text);b.onclick=fn;return b;};f.root.openLitterCleaningGame=()=>f.HH.beginScoop();const all=n=>[n,...n.children.flatMap(all)];return ()=>{f.HH.toiletMenu();const nodes=all(latest.box);return {...latest,nodes,primary:nodes.find(n=>n.className?.includes('toilet-primary'))};};
}
test('real guided modal moves from full tray to scoop then ready to use, keeping need and remaining litter',()=>{
 const f=householdFixture(),render=guideFixture(f);f.game.lifeV2.household.litter.dirty=4;let page=render();assert.equal(page.primary.textContent,'Kürekle temizle');assert.ok(page.nodes.some(n=>n.tagName==='ol'&&n.children.length===3));assert.ok(page.nodes.some(n=>n.textContent==='Kedinin ihtiyacı'));assert.ok(page.nodes.some(n=>n.textContent==='Kapta kalan kum'));page.primary.onclick();assert.equal(f.game.isBusy,true);assert.equal(f.game.lifeV2.household.litter.dirty,4);assert.equal(f.HH.finishScoop(),true);assert.equal(f.game.toiletNeed,80);assert.equal(f.game.lifeV2.household.litter.remaining,8);page=render();assert.equal(page.primary.textContent,'Tuvalete götür');page.primary.onclick();assert.equal(f.game.currentAnim,'toilet');f.timer.find(t=>t.ms===5500).fn();assert.equal(f.game.toiletNeed,0);assert.equal(f.game.lifeV2.household.litter.remaining,7);page=render();assert.equal(page.primary.textContent,'Kürekle temizle');
});
test('real guided refill is clearly priced, disabled without funds and followed by use when affordable',()=>{
 const f=householdFixture(),render=guideFixture(f);f.game.lifeV2.household.litter.remaining=0;f.game.lifeV2.household.litter.dirty=4;f.game.coins=19;let page=render();assert.equal(page.primary.disabled,true);assert.ok(page.primary.textContent.includes('20 altın'));assert.ok(page.nodes.some(n=>n.textContent?.includes('şu an 19')));f.game.coins=25;page=render();assert.equal(page.primary.disabled,false);page.primary.onclick();assert.equal(f.game.coins,5);assert.equal(f.game.lifeV2.household.litter.remaining,8);assert.equal(f.game.lifeV2.household.litter.dirty,0);assert.equal(render().primary.textContent,'Tuvalete götür');
});
test('blocked automatic toilet attempts do not announce a trip or force-open the care dialog',()=>{
 const f=householdFixture();f.game.lifeV2.household.litter.dirty=4;f.HH.useToilet(true);assert.equal(f.game.isBusy,false);assert.ok(!f.calls.some(c=>c[0]==='notice'||c[0]==='walk'));assert.equal(f.game.toiletNeed,80);
});
test('side toilet badge explains next action instead of stale legacy dirt or old clean-count',()=>{
 const source=fs.readFileSync('sprite_preview/patilife_app.html','utf8'),a=source.indexOf('function updateToiletUI(');let at=source.indexOf('{',a),depth=1;while(depth){at++;if(source[at]==='{')depth++;if(source[at]==='}')depth--;}
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{style:{},classList:{remove(){},toggle(){}},setAttribute(k,v){this[k]=v;}});return nodes.get(id);};const state={lifeV2:{household:{litter:{remaining:8,dirty:0}}},toiletNeed:90,toiletFullness:100,litterCleanCount:99},root={GameState:state,DecorManager:{placedDecor:[]},PatiLifeHousehold:{status:()=>R.toiletStatus(state.lifeV2,state.toiletNeed)},document:{getElementById:node}};root.window=root;vm.createContext(root);vm.runInContext(source.slice(a,at+1),root);root.updateToiletUI();assert.equal(node('badgeToiletPercent').textContent,'Götür');assert.equal(node('txtToiletNeed').textContent,'90%');assert.equal(state.toiletFullness,0);state.lifeV2.household.litter.dirty=4;root.updateToiletUI();assert.equal(node('badgeToiletPercent').textContent,'Temizle');state.lifeV2.household.litter.remaining=0;root.updateToiletUI();assert.equal(node('badgeToiletPercent').textContent,'Kum ekle');
});
