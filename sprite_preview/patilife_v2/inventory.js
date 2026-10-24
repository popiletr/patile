(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports;
 const CATALOG=node?require('./catalog.json'):root.PatiLifeCatalogData;
 const M=node?require('./model.js'):root.PatiLifeV2;
 const ROOMS=Object.freeze({living:'Salon',kitchen:'Mutfak',bedroom:'Yatak odası',bathroom:'Banyo',garden:'Bahçe',sunroom:'Kış bahçesi',attic:'Oyun tavanı',reading:'Kütüphane'});
 const STARTER=['food','water','bed','carrier','litter','yarn'];
 const STAGES=['kitten','young','adult'];
 const copy=save=>JSON.parse(JSON.stringify(save));
 function item(id){const found=CATALOG.find(i=>i.id===id);if(!found)throw new Error('Bu eşya katalogda yok.');return found;}
 function initial(){return {version:1,owned:[...STARTER],placements:{carrier:{room:'living',x:17,y:43},bed:{room:'living',x:23,y:14},water:{room:'kitchen',x:78,y:36},food:{room:'kitchen',x:77,y:13},litter:{room:'bathroom',x:25,y:22}},uses:{},passiveClaims:{}};}
 function ensure(save){const next=copy(save);if(next.inventory===undefined)next.inventory=initial();validate(next.inventory);if(next.inventory.passiveClaims===undefined)next.inventory.passiveClaims={};return next;}
 function validate(inv){
  if(!inv||inv.version!==1||!Array.isArray(inv.owned)||new Set(inv.owned).size!==inv.owned.length||!inv.placements||typeof inv.placements!=='object'||Array.isArray(inv.placements)||!inv.uses||typeof inv.uses!=='object')throw new Error('Eşya kaydı geçersiz; özgün veri korundu.');
  for(const id of inv.owned)item(id);
  if(inv.passiveClaims!==undefined&&(!inv.passiveClaims||typeof inv.passiveClaims!=='object'||Array.isArray(inv.passiveClaims)))throw new Error('Eşya günlük etkileri geçersiz.');
  for(const [id,count] of Object.entries(inv.uses)){item(id);if(!Number.isInteger(count)||count<0)throw new Error('Eşya kullanım kaydı geçersiz.');}
  for(const [id,p] of Object.entries(inv.placements)){
   const def=item(id);if(!inv.owned.includes(id)||!p||!def.rooms.includes(p.room)||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<10||p.x>90||p.y<10||p.y>85)throw new Error('Eşya yerleşimi geçersiz; özgün veri korundu.');
  }
 }
 function requireHome(save){if(!save.cat||save.requiresLegacyIdentity||save.story.step!=='settled')throw new Error('Önce birlikte ilk gününüzü tamamlayın.');}
 function buy(save,id){
  requireHome(save);const next=ensure(save),def=item(id);
  if(next.inventory.owned.includes(id))throw new Error('Bu eşya zaten senin.');
  if(STAGES.indexOf(next.growth.stage)<STAGES.indexOf(def.stage))throw new Error('Bu eşya kedinin sonraki büyüme aşamasında açılacak.');
  if(!Number.isFinite(next.economy.coins)||next.economy.coins<def.price)throw new Error('Bu eşya için henüz yeterli birikimin yok.');
  next.economy.coins-=def.price;next.inventory.owned.push(id);return next;
 }
 function place(save,id,room,position){
  requireHome(save);const next=ensure(save),def=item(id);
  if(!next.inventory.owned.includes(id))throw new Error('Önce bu eşyayı edinmelisin.');
  if(!def.rooms.includes(room))throw new Error('Bu eşya bu odaya uygun değil.');
  const positions=Object.entries(next.inventory.placements).filter(([other,p])=>other!==id&&p.room===room);
  if(positions.length>=6)throw new Error('Bu odada en fazla altı eşya olabilir. Birini kaldırabilirsin.');
  const allowed=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=15&&p.x<=85&&(def.mount==='wall'?p.y>=65&&p.y<=80:p.y>=12&&p.y<=52);
  const clear=p=>!positions.some(([other,q])=>{const obj=item(other);return obj.mount===def.mount&&Math.abs(p.x-q.x)<(obj.width+def.width)/2+2&&Math.abs(p.y-q.y)<(obj.depth+def.depth)/2+2;});
  let target=position;
  if(!target){target=(def.mount==='wall'?[{x:22,y:73},{x:50,y:73},{x:78,y:73}]:[15,38].flatMap(y=>[20,50,80].map(x=>({x,y})))).find(p=>allowed(p)&&clear(p));}
  if(!allowed(target))throw new Error('Eşya için güvenli bir yer seç.');if(!clear(target))throw new Error('Burada başka bir eşya var; biraz uzağa taşı.');
  next.inventory.placements[id]={room,x:target.x,y:target.y};return next;
 }
 function remove(save,id){requireHome(save);const next=ensure(save);if(!next.inventory.owned.includes(id))throw new Error('Bu eşya senin değil.');delete next.inventory.placements[id];return next;}
 function use(save,id,now=Date.now()){
  requireHome(save);const next=ensure(save),def=item(id);
  if(!next.inventory.owned.includes(id)||(!next.inventory.placements[id]&&def.action!=='play'))throw new Error('Bu eşyayı önce odaya yerleştir.');
  if(def.action==='memory')return next;
  const result=M.action(next,def.action,now);
  for(const [stat,amount] of Object.entries(def.bonus))result.needs[stat]=Math.min(100,result.needs[stat]+amount);
  if(def.action==='play'){const refund=Math.max(0,...Object.keys(result.inventory.placements).map(key=>item(key).passive?.playRefund||0));result.needs.energy=Math.min(100,result.needs.energy+refund);}
  result.inventory.uses[id]=(result.inventory.uses[id]||0)+1;
  const room=result.inventory.placements[id]?.room;if(room&&!result.statistics.rooms.includes(room))result.statistics.rooms.push(room);
  if(result.inventory.uses[id]>=3&&!result.bond.preferences[def.action])result.bond.preferences[def.action]=id;
  return result;
 }
 const api={CATALOG,ROOMS,STARTER,item,ensure,validate,buy,place,remove,use};if(node)module.exports=api;else root.PatiLifeInventory=api;
})(typeof window!=='undefined'?window:globalThis);
