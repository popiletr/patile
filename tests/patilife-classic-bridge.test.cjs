const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../sprite_preview/patilife_v2/model.js'),C=require('../sprite_preview/patilife_v2/classic-bridge.js');
function fixture(extra={}){const save=M.adopt(M.createSave(1000),'calico','Çakıl',1000);save.story={step:'settled',completed:true};const values=new Map(Object.entries({[M.KEY]:JSON.stringify(save),...extra}));return {save,values,storage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}};}
test('classic handoff keeps existing currency, progress, furniture and Patile saves with verbatim backup',()=>{
 const old=JSON.stringify({catName:'Eski isim',coins:212,statsYarnPlays:19,achievements:['first'],lastTick:900}),f=fixture({pet_state:old,cat_suika_active_board_v1:'{"board":[7]}',pati_placed_decor:'[{"id":"bed"}]'}),state={coins:212,statsYarnPlays:19};
 assert.deepEqual(C.prepare(f.storage,state,2000),{id:'calico',stage:'kitten'});assert.equal(state.catName,'Çakıl');assert.equal(state.coins,212);assert.equal(state.statsYarnPlays,19);assert.equal(JSON.parse(f.storage.getItem('pet_state')).statsYarnPlays,19);assert.equal(f.storage.getItem('cat_suika_active_board_v1'),'{"board":[7]}');assert.equal(JSON.parse(f.storage.getItem(C.BACKUP)).values.pet_state,old);
 const adoptedSnapshot=f.storage.getItem(M.KEY);state.catName='Yeni ad';f.storage.setItem('pati_cat_profile',JSON.stringify({name:'Yeni ad'}));C.prepare(f.storage,state,3000);assert.equal(state.catName,'Yeni ad');assert.equal(f.storage.getItem(M.KEY),adoptedSnapshot);
});
test('new adoption seeds name and needs once, subsequent classic gains cannot be overwritten',()=>{
 const f=fixture(),state={coins:0};C.prepare(f.storage,state,2000);assert.equal(state.coins,40);assert.equal(state.thirst,45);assert.equal(JSON.parse(f.storage.getItem('pet_state')).coins,40);assert.equal(f.storage.getItem('patilife_character_created'),'true');
 state.coins=91;C.prepare(f.storage,state,3000);assert.equal(state.coins,91);
});
test('uncompleted story does not alter classic game and malformed records are preserved',()=>{
 const f=fixture();f.save.story.step='home_water';f.storage.setItem(M.KEY,JSON.stringify(f.save));assert.equal(C.prepare(f.storage,{}),null);assert.equal(f.storage.getItem(C.BACKUP),null);
 f.save.story.step='settled';f.storage.setItem(M.KEY,JSON.stringify(f.save));f.storage.setItem('pet_state','broken');assert.throws(()=>C.prepare(f.storage,{}));assert.equal(f.storage.getItem('pet_state'),'broken');
});
test('storage failure rolls back partial handoff and leaves raw backup available',()=>{
 const f=fixture({pet_state:'{"coins":77}',pati_cat_profile:'{"name":"Eski"}'}),set=f.storage.setItem;f.storage.setItem=(key,value)=>{if(key===C.KEY)throw new Error('storage full');set(key,value);};const state={coins:77};assert.throws(()=>C.prepare(f.storage,state));assert.equal(f.storage.getItem('pet_state'),'{"coins":77}');assert.equal(f.storage.getItem('pati_cat_profile'),'{"name":"Eski"}');assert.equal(f.storage.getItem('patilife_character_created'),null);assert.equal(state.catName,undefined);assert.ok(f.storage.getItem(C.BACKUP));
});
test('renderer selects coat, age and care frames while retaining classic floor and depth transform',()=>{
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/sprite-atlases.js','utf8'),context);const metadata=context.window.PatiLifeSpriteAtlases;
 const water=C.selection(metadata,'calico','adult','drink',360);assert.equal(water.frame.x,metadata.calico.ages.adult.care.frames[6].x);assert.ok(water.src.includes('calico-adult'));assert.ok(C.selection(metadata,'tekir','kitten','scratch',0).src.includes('special-kitten'));
 let drawn;const canvas={width:400,height:400,style:{},getContext:()=>({clearRect(){},drawImage(...args){drawn=args;}})};const renderer=C.createRenderer({metadata,canvas:()=>canvas,image:()=>({complete:true,naturalWidth:1024})});
 assert.equal(renderer({currentAnim:'drink',catBottom:38,catDir:-1},{id:'calico',stage:'adult'},1000,1.2,.8),true);assert.equal(canvas.style.bottom,'45.6px');assert.equal(canvas.style.transform,'scaleX(-1) scale(0.8)');assert.ok(Math.abs(drawn[6]+drawn[8]-400)<1e-8);
});
test('classic hooks preserve original map, pan engine, controls and every mini-game implementation',()=>{
 const source=fs.readFileSync('sprite_preview/patilife_app.html','utf8');for(const marker of ['const ROOM_WIDTH = 2200','function onPanMove(','function updateCatMovement(','function initLitterCleaningGame(','function updateCamera(','function startPetAI(','function drawCatSprite(','function showBubble(','window.PatiLifeClassicBridge?.init(GameState)','window.PatiLifeClassicBridge?.draw(GameState'])assert.ok(source.includes(marker),marker);
 const onboard=fs.readFileSync('sprite_preview/patilife_v2/onboarding.js','utf8');assert.ok(onboard.includes("window.location.replace('../patilife_app.html')"));
});


test('every care and special frame fits inside its canvas for all twelve cat-age combinations',()=>{
 const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/sprite-atlases.js','utf8'),context);const metadata=context.window.PatiLifeSpriteAtlases;
 for(const id of ['sarman','tekir','smokin','calico'])for(const stage of ['kitten','young','adult'])for(const motion of ['idle','walk','eat','drink','sleep','happy','jump','scratch']){
  const records=[],canvas={width:400,height:400,style:{},getContext:()=>({clearRect(){},drawImage(...args){records.push(args);}})};const renderer=C.createRenderer({metadata,canvas:()=>canvas,image:()=>({complete:true,naturalWidth:1024})});
  for(let frame=0;frame<4;frame++){renderer({currentAnim:motion,catBottom:38,catDir:1},{id,stage},frame*240,1,1);const a=records.at(-1);assert.ok(a,id+stage+motion);assert.ok(a[5]>=0&&a[6]>=-1e-8,id+stage+motion+' clipped at top/left');assert.ok(a[5]+a[7]<=400+1e-8&&a[6]+a[8]<=400+1e-8,id+stage+motion+' clipped at right/bottom');}
 }
});
