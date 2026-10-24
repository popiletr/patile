/* All rooms share the original panoramic camera and placement system. */
(function(root){
 'use strict';
 const ROOMS=Object.freeze([
  {id:'sunroom',name:'Kış bahçesi',position:0,background:{top:0,height:416}},
  {id:'attic',name:'Oyun tavanı',position:50,background:{top:418,height:402}},
  {id:'reading',name:'Kütüphane',position:100,background:{top:822,height:432}}
 ]);
 function sync(){for(const r of ROOMS){const tab=root.document?.getElementById('room-tab-'+r.id);if(tab){tab.title=r.name;tab.setAttribute('aria-label',r.name);}}}
 function init(game,mapping,order,switcher){
  const stage=root.document.getElementById('roomStage'),tabs=root.document.querySelector('.ingame-room-tabs');
  for(const r of ROOMS){if(!mapping[r.id])mapping[r.id]=[{type:'polygon',category:'floor',name:r.name+' zemini',points:[{x:0,y:768},{x:2200,y:768},{x:2200,y:548},{x:0,y:548}],minBottom:15,maxBottom:210,avgBottom:38}];if(!order.includes(r.id))order.push(r.id);
   if(!root.document.getElementById('bg-'+r.id)){const bg=root.document.createElement('div');bg.id='bg-'+r.id;bg.className='room-bg';stage.prepend(bg);}
   if(!root.document.getElementById('room-tab-'+r.id)){const tab=root.document.createElement('button');tab.className='room-btn chapter-room-tab';tab.id='room-tab-'+r.id;tab.type='button';tab.setAttribute('onclick',"switchRoom('"+r.id+"')");const name=root.document.createElement('span');name.className='room-btn-title';name.textContent=r.name;const icon=root.document.createElement('span');icon.className='room-icon-img chapter-room-icon';icon.style.backgroundPosition=r.position+'% center';icon.setAttribute('aria-hidden','true');tab.append(icon,name);tabs.append(tab);}
  }sync(game);
 }
 function visit(game,id,save){if(!ROOMS.some(r=>r.id===id)||!game.lifeV2)return;const record=game.lifeV2.homeChapters||(game.lifeV2.homeChapters={seen:[]});if(!Array.isArray(record.seen))record.seen=[];if(record.seen.includes(id))return;record.seen.push(id);game.lifeV2.memories.push({id:'room:'+id,at:Date.now(),catId:game.lifeV2.cat.id,name:game.catName});save();}
 const api={ROOMS,sync,init,visit};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeChapters=api;
})(typeof window!=='undefined'?window:globalThis);
