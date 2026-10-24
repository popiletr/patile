(function(root){
 'use strict';
 const STAGES=Object.freeze({kitten:'Yavru',young:'Genç',adult:'Yetişkin'});
 const RULES=Object.freeze({young:{days:3,activeDays:3,bond:24},adult:{days:14,activeDays:7,bond:80}});
 function bondTitle(points){return points>=80?'Ailenin bir parçası':points>=40?'Güvenli dostluk':points>=15?'Sana alışıyor':'Yeni tanışıyoruz';}
 function progress(save,now=Date.now()){
  const stage=save.growth.stage,next=stage==='kitten'?'young':stage==='young'?'adult':null;
  const days=Number.isFinite(save.growth.adoptedAt)?Math.max(0,Math.floor((now-save.growth.adoptedAt)/86400000)):0;
  const activeDays=new Set(save.growth.activeDays).size;
  if(!next)return {stage,next:null,days,activeDays,bond:save.bond.points,ready:false};
  const rule=RULES[next],stageWait=stage!=='young'||(Number.isFinite(save.growth.changedAt)&&now-save.growth.changedAt>=86400000);
  return {stage,next,days,activeDays,bond:save.bond.points,rule,ready:save.story.step==='settled'&&days>=rule.days&&activeDays>=rule.activeDays&&save.bond.points>=rule.bond&&stageWait};
 }
 function grow(save,now=Date.now()){
  const status=progress(save,now);if(!status.ready)throw new Error('Bu büyüme adımı için birlikte biraz daha zaman geçirmelisiniz.');
  const next=JSON.parse(JSON.stringify(save));next.growth.stage=status.next;next.growth.changedAt=now;
  const id='growth:'+status.next;if(!next.memories.some(m=>m.id===id))next.memories.push({id,catId:next.cat.id,name:next.cat.name,at:now});
  return next;
 }
 const api={STAGES,RULES,bondTitle,progress,grow};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeGrowth=api;
})(typeof window!=='undefined'?window:globalThis);
