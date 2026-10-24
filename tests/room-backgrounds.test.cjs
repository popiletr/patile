'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('chapter backgrounds crop their actual unequal atlas bands without showing the next room',()=>{
 const node=()=>({style:{},dataset:{},children:[],setAttribute(){},appendChild(n){this.children.push(n);},querySelector(){return this.children[0];}});const nodes=Object.fromEntries(['sunroom','attic','reading'].map(id=>['bg-'+id,node()]));
 const root={document:{getElementById:id=>nodes[id],createElement:node}};root.window=root;vm.createContext(root);
 for(const file of ['chapters','runtime'])vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/'+file+'.js','utf8'),root);
 const bands={sunroom:[0,417],attic:[417,821],reading:[821,1254]};
 for(const room of root.PatiLifeChapters.ROOMS){root.PatiLifeRuntime.room(room.id);const style=nodes['bg-'+room.id].children[0].style,size=parseFloat(style.backgroundSize.split(' ')[1])/100,pos=parseFloat(style.backgroundPosition.split(' ')[1])/100;
  // Recover source crop for short and tall WebViews; it must stay inside this room.
  for(const viewportHeight of [430,768,1100]){const scale=size*viewportHeight/1254,top=(size*viewportHeight-viewportHeight)*pos/scale,bottom=top+viewportHeight/scale;assert.ok(top>=bands[room.id][0]-.001);assert.ok(bottom<=bands[room.id][1]+.001);}
 }
});
test('all eight rooms accept suitable owned furniture without achievements, including legacy homes',()=>{
 const M=require('../sprite_preview/patilife_v2/model'),E=require('../sprite_preview/patilife_v2/inventory'),H=require('../sprite_preview/patilife_v2/home-systems');
 for(const oldFlag of [undefined,true,false]){
  const life=E.ensure(M.adopt(M.createSave(),'calico','Çakıl'));life.story={step:'settled',completed:true};life.progressiveRooms=oldFlag;life.achievements.claimed=[];
  for(const room of Object.keys(E.ROOMS)){
   const item=E.CATALOG.find(d=>life.inventory.owned.includes(d.id)&&d.rooms.includes(room));assert.ok(item,room);
   assert.ok(H.rooms({lifeV2:life},'cozy_'+item.id).includes(room));assert.equal(E.place(life,item.id,room).inventory.placements[item.id].room,room);
  }
 }
});
test('eight painted extensions preserve the original center framing without scaling the stage height',()=>{
 const node=()=>({style:{},dataset:{},children:[],setAttribute(){},appendChild(n){this.children.push(n);},querySelector(){return this.children[0];}}),nodes={};const ids={kitchen:'bgKitchen',living:'bgLiving',bedroom:'bgBedroom',bathroom:'bgBathroom',garden:'bgGarden',sunroom:'bg-sunroom',attic:'bg-attic',reading:'bg-reading'};for(const id of Object.values(ids))nodes[id]=node();const root={document:{getElementById:id=>nodes[id],createElement:node}};root.window=root;vm.createContext(root);for(const name of ['chapters','runtime'])vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/'+name+'.js','utf8'),root);
 for(const [id,key]of Object.entries(ids)){root.PatiLifeRuntime.room(id);root.PatiLifeRuntime.room(id);const bg=nodes[key],center=bg.children[0];assert.equal(bg.children.length,1);assert.match(bg.style.backgroundImage,new RegExp('rooms-expanded/'+id+'\\.png'));assert.ok(fs.existsSync('sprite_preview/patilife_v2/assets/rooms-expanded/'+id+'.png'));const top=parseFloat(bg.style.top)/100,child=parseFloat(center.style.top)/100;assert.ok(Math.abs(top+2*child)<1e-10);assert.ok(top<=-.43&&top+2>=1.43);}
 const css=fs.readFileSync('sprite_preview/patilife_v2/classic-shell.css','utf8');assert.match(css,/\.room-bg[\s\S]*?height: 200%/);assert.match(css,/\.room-bg-original[^}]*height:50%/);
});
test('scene zoom waits for the painted image to finish loading and reuses it on room visits',()=>{
 let loaded;const bg={style:{},querySelector:()=>({style:{},dataset:{}})},root={document:{getElementById:()=>bg},Image:class{constructor(){loaded=this;this.complete=false;this.naturalWidth=0;}}};root.window=root;vm.createContext(root);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/runtime.js','utf8'),root);root.PatiLifeRuntime.room('living');assert.equal(root.PatiLifeRuntime.sceneReady('living'),false);const first=loaded;loaded.complete=true;loaded.naturalWidth=1509;assert.equal(root.PatiLifeRuntime.sceneReady('living'),true);root.PatiLifeRuntime.room('living');assert.equal(loaded,first);assert.equal(root.PatiLifeRuntime.sceneReady('garden'),false);
});
