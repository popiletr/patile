// DOM contract fixture: runs application event handlers without a browser or user data.
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const model=require('../sprite_preview/patilife_v2/model.js');
function fixture(initial={},options={}){
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.style={};this.textContent='';this.className='';this.classList={add:()=>{}};}
  append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
  replaceChildren(...children){this.children=[];this.append(...children);}
  setAttribute(key,value){this.attributes[key]=value;}
  setPointerCapture(){}
  getBoundingClientRect(){return {left:0,bottom:400,width:400,height:400};}
  after(node){this.parent?.append(node);}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
 }
 const app=new Element('main');app.id='app';
 const walk=(node,predicate)=>{if(predicate(node))return node;for(const child of node.children){const found=walk(child,predicate);if(found)return found;}return null;};
 const listeners={};const document={hidden:false,addEventListener:(event,fn)=>{listeners[event]=fn;},createElement:tag=>new Element(tag),getElementById:id=>walk(app,n=>n.id===id),querySelector:selector=>walk(app,n=>n.className.split(' ').includes(selector.slice(1)))};
 const values=new Map(Object.entries(initial)),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const timers=new Map();let timerId=0,now=1700000000000;
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const context={window:{},document,localStorage:storage,Date:Clock,console};context.window=context;if(options.location)context.location=options.location;context.setTimeout=(fn,delay)=>{timers.set(++timerId,{fn,at:now+delay});return timerId;};context.clearTimeout=id=>timers.delete(id);
 vm.createContext(context);
 for(const file of ['model.js','catalog-data.js','inventory.js','growth.js','sprite-atlases.js','life.js','care-session.js','behavior.js','achievements.js','onboarding.js'])vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/'+file,'utf8'),context);
 function click(text){const button=walk(app,n=>n.tagName==='button'&&(n.textContent===text||n.attributes['aria-label']===text));assert.ok(button,'Button exists: '+text);assert.ok(!button.disabled,'Button enabled: '+text);button.onclick();}
 function clickCard(name){const button=walk(app,n=>n.tagName==='button'&&n.children.some(c=>c.tagName==='strong'&&c.textContent===name));assert.ok(button,'Card exists: '+name);button.onclick();}
 function tick(ms){const end=now+ms;while(true){const due=[...timers].sort((a,b)=>a[1].at-b[1].at).find(([,t])=>t.at<=end);if(!due)break;timers.delete(due[0]);now=due[1].at;due[1].fn();}now=end;}
 return {app,document,click,clickCard,storage,walk,tick,flush:()=>tick(20000),advance:()=>tick(1000),hide:()=>{document.hidden=true;listeners.visibilitychange?.();},save:()=>JSON.parse(storage.getItem(model.KEY))};
}
test('illustrated adoption hands selected cat to original house with a real first-day tutorial pending',()=>{
 const routes=[],f=fixture({}, {location:{replace:url=>routes.push(url)}});f.click('Devam et');f.click('Devam et');f.click('Yavrularla tanış');
 f.clickCard('Calico');f.click('Birlikte eve gidelim');
 f.document.getElementById('cat-name').value='Çakıl';f.walk(f.app,n=>n.tagName==='form').onsubmit({preventDefault(){}});
 assert.equal(f.save().cat.id,'calico');assert.equal(f.save().friends.length,3);f.click('Evimize gidelim');
 assert.equal(f.save().story.step,'settled');assert.equal(f.save().cat.name,'Çakıl');assert.equal(f.save().care.tutorial.step,0);assert.equal(f.save().care.tutorial.completed,false);assert.deepEqual(routes,['../patilife_app.html']);assert.equal(f.save().needs.hunger,55);
});
test('cancelled toy session cannot award delayed play reward',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.story={step:'settled',completed:true};
 const f=fixture({[model.KEY]:JSON.stringify(save)}),before=f.storage.getItem(model.KEY);f.click('Oyun');f.click('Oyuncağı takip et');
 for(let i=0;i<3;i++){f.advance();f.click('Oyuncağı hareket ettir');}
 f.click('Oyuna ara ver');f.flush();assert.equal(f.storage.getItem(model.KEY),before);
});
test('legacy selection keeps old cat name and balance without changing source',()=>{
 const old=JSON.stringify({catName:'Boncuk',coins:93,personality:'sleepy',catGender:'Dişi'});
 const f=fixture({pet_state:old});f.clickCard('Tekir');
 assert.equal(f.save().cat.name,'Boncuk');assert.equal(f.save().economy.coins,93);
 assert.equal(f.storage.getItem('pet_state'),old);
});

test('water animation starts before reward and backgrounding cancels it',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.story={step:'home_water',completed:false};
 const original=JSON.stringify(save),f=fixture({[model.KEY]:original});f.clickCard('Su kabı');
 assert.equal(f.document.getElementById('home-cat').attributes['data-motion'],'walk');
 f.tick(650);assert.equal(f.document.getElementById('home-cat').attributes['data-motion'],'drink');
 assert.equal(f.storage.getItem(model.KEY),original);
 f.hide();f.flush();assert.equal(f.storage.getItem(model.KEY),original);
 assert.equal(f.document.getElementById('home-cat').attributes['data-motion'],'idle');
});
test('rest action waits through sleeping before energy and story update',()=>{
 const save=model.adopt(model.createSave(),'calico','Çakıl');save.story={step:'home_rest',completed:false};
 const f=fixture({[model.KEY]:JSON.stringify(save)});f.clickCard('Dinlenme köşesi');
 f.tick(650);assert.equal(f.document.getElementById('home-cat').attributes['data-motion'],'sleep');
 assert.equal(f.save().needs.energy,65);f.tick(4499);assert.equal(f.save().story.step,'home_rest');
 f.tick(1);assert.equal(f.save().needs.energy,85);assert.equal(f.save().story.step,'home_play');
 assert.equal(f.save().care.position.x,23);
});

test('daily event can be collected once and remains claimed after returning to panel',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.story={step:'settled',completed:true};
 const f=fixture({[model.KEY]:JSON.stringify(save)});f.click('Günlük');f.click('Günün keşfini kaydet (+5)');
 assert.equal(f.save().economy.coins,45);assert.equal(f.save().memories.length,1);
 f.click('Kapat');f.click('Günlük');assert.equal(f.save().economy.coins,45);
 const claimed=f.walk(f.app,n=>n.tagName==='button'&&n.textContent==='Keşif hatıralara eklendi');assert.equal(claimed.disabled,true);
});

test('shop purchase, room placement, functional use and drag share the saved inventory',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.story={step:'settled',completed:true};save.economy.coins=250;
 const f=fixture({[model.KEY]:JSON.stringify(save)});f.click('Ev');
 f.document.getElementById('buy-fountain').onclick();assert.equal(f.save().economy.coins,205);
 f.document.getElementById('room-fountain').value='kitchen';f.document.getElementById('place-fountain').onclick();assert.equal(f.save().inventory.placements.fountain.room,'kitchen');
 assert.equal(f.document.getElementById('room-picker').value,'kitchen');
 f.click('Kapat');f.clickCard('Su pınarı');f.flush();assert.equal(f.save().inventory.uses.fountain,1);
 f.click('Ev');f.click('Yerleşimi düzenle');
 const object=f.walk(f.app,n=>n.tagName==='button'&&n.children.some(c=>c.tagName==='strong'&&c.textContent==='Su pınarı'));
 object.onpointerdown({preventDefault(){},pointerId:1});object.onpointermove({clientX:200,clientY:240});object.onpointerup();
 assert.equal(f.save().inventory.placements.fountain.x,50);assert.equal(f.save().inventory.placements.fountain.y,40);
});
test('ready growth is a user-visible transition and saves one memory',()=>{
 const save=model.adopt(model.createSave(0),'tekir','Boncuk',0);save.story={step:'settled',completed:true};save.bond.points=24;save.growth.activeDays=['2023-11-12','2023-11-13','2023-11-14'];
 const f=fixture({[model.KEY]:JSON.stringify(save)});assert.equal(f.save().growth.stage,'kitten');f.click('Kedim');f.click('Yeni dönemi birlikte karşıla');
 assert.equal(f.save().growth.stage,'young');assert.equal(f.save().cat.id,'tekir');assert.equal(f.save().memories.filter(m=>m.id==='growth:young').length,1);
});

test('ambient wandering never writes needs, task progress, bond or achievements',()=>{
 const save=model.adopt(model.createSave(),'smokin','Kömür');save.story={step:'settled',completed:true};
 const f=fixture({[model.KEY]:JSON.stringify(save)}),before=f.storage.getItem(model.KEY);f.tick(90000);assert.equal(f.storage.getItem(model.KEY),before);
 f.hide();f.tick(60000);assert.equal(f.storage.getItem(model.KEY),before);assert.equal(f.document.getElementById('home-cat').attributes['data-motion'],'idle');
});
test('profile achievement reward remains collected when the panel is reopened',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.story={step:'settled',completed:true};const f=fixture({[model.KEY]:JSON.stringify(save)});
 f.click('Kedim');let filter=f.document.getElementById('achievement-category');filter.value='İlkler ve büyüme';filter.onchange();f.document.getElementById('achievement-adopt').onclick();assert.equal(f.save().economy.coins,50);
 f.click('Kapat');f.click('Kedim');assert.equal(f.document.getElementById('achievement-adopt').disabled,true);assert.equal(f.save().achievements.claimed.filter(id=>id==='adopt').length,1);
});
test('blocked care does not start an action or award progress',()=>{
 const E=require('../sprite_preview/patilife_v2/inventory.js');const save=E.ensure(model.adopt(model.createSave(),'sarman','Tarçın'));save.story={step:'settled',completed:true};
 save.care.position={x:15,y:30,room:'kitchen'};save.inventory.owned.push('slow_bowl','fountain');save.inventory.placements={food:{room:'kitchen',x:50,y:12},slow_bowl:{room:'kitchen',x:50,y:30},fountain:{room:'kitchen',x:50,y:48},water:{room:'kitchen',x:85,y:30}};
 const f=fixture({[model.KEY]:JSON.stringify(save)}),picker=f.document.getElementById('room-picker');picker.value='kitchen';picker.onchange();const before=f.storage.getItem(model.KEY);f.clickCard('Geniş su kabı');f.tick(6000);assert.equal(f.storage.getItem(model.KEY),before);assert.ok(f.document.getElementById('error').textContent.includes('boş bir yol yok'));
});

test('care drawer switches to the correct room and closes before visible water care',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.story={step:'settled',completed:true};const f=fixture({[model.KEY]:JSON.stringify(save)}),before=f.save().needs.thirst;
 assert.ok(f.walk(f.app,n=>n.className==='game-hud'));assert.ok(f.walk(f.app,n=>n.className==='game-nav'));assert.equal(f.document.getElementById('active-sheet'),null);
 f.click('Bakım');assert.equal(f.document.getElementById('active-sheet').attributes.role,'dialog');f.click('Su');
 assert.equal(f.document.getElementById('active-sheet'),null);assert.equal(f.document.getElementById('room-picker').value,'kitchen');assert.equal(f.save().needs.thirst,before);f.tick(6000);assert.ok(f.save().needs.thirst>before);assert.equal(f.save().inventory.uses.water,1);
});
test('furniture editing dismisses the drawer and finishing restores it',()=>{
 const save=model.adopt(model.createSave(),'tekir','Boncuk');save.story={step:'settled',completed:true};const f=fixture({[model.KEY]:JSON.stringify(save)});
 f.click('Ev');assert.ok(f.document.getElementById('active-sheet'));f.click('Yerleşimi düzenle');assert.equal(f.document.getElementById('active-sheet'),null);assert.ok(f.walk(f.app,n=>n.className.includes('movable')));
 f.click('Düzenlemeyi bitir');assert.ok(f.document.getElementById('active-sheet'));assert.equal(f.walk(f.app,n=>n.className.includes('movable')),null);
});
test('drawer isolates the room and Escape returns to the game without changing the save',()=>{
 const save=model.adopt(model.createSave(),'smokin','Kömür');save.story={step:'settled',completed:true};const f=fixture({[model.KEY]:JSON.stringify(save)}),before=f.storage.getItem(model.KEY);
 f.click('Günlük');const room=f.walk(f.app,n=>n.className.startsWith('home-room'));assert.equal(room.inert,true);let prevented=false;f.document.getElementById('active-sheet').onkeydown({key:'Escape',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(f.document.getElementById('active-sheet'),null);assert.equal(f.storage.getItem(model.KEY),before);
});


test('browser entry returns settled players to the original mobile game',()=>{
 const save=model.adopt(model.createSave(),'sarman','Tarçın');save.story={step:'settled',completed:true};let destination;
 const f=fixture({[model.KEY]:JSON.stringify(save)},{location:{replace:url=>destination=url}});assert.equal(destination,'../patilife_app.html');assert.equal(f.app.children.length,0);assert.equal(f.save().cat.name,'Tarçın');
});
test('new players retain the adoption story before entering the original game',()=>{
 let destination;const f=fixture({},{location:{replace:url=>destination=url}});assert.equal(destination,undefined);assert.ok(f.walk(f.app,n=>n.textContent==='Yağmurun getirdiği karşılaşma'));
});
