/* Slow readable waves first; completion, not account age, raises difficulty. */
(function(root){
 'use strict';
 function plan(completed=0,caught=0){const level=Math.min(5,Math.floor(Math.max(0,completed)/3)),wave=Math.min(4,Math.floor(Math.max(0,caught)/4));return {level:level+1,wave:wave+1,count:Math.min(3,1+Math.floor((level+wave)/2)),delay:Math.max(.75,2.2-level*.18-wave*.18),speed:.42+level*.13+wave*.1,radius:Math.max(20,32-level*1.4-wave),lock:.36+level*.025,lifetime:Math.max(5,10-level*.6-wave*.5)};}
 function lock(value,inside,held,dt,required){return inside&&held?Math.min(required,value+Math.min(.05,dt)):0;}
 function distance(a,b,scaleY=1){return Math.hypot(a.x-b.x,(a.bottom-b.bottom)*scaleY);}
 function pick(preys,x,bottom,scaleY=1,radius=44){let chosen=null,best=radius;for(const p of preys){if(p.reserved||p.caught||p.timer<=0)continue;const d=distance({x,bottom},p,scaleY);if(d<best){best=d;chosen=p;}}return chosen;}
 function canCatch(preys,target){return !!target&&preys.includes(target)&&target.reserved===true&&!target.caught;}
 const api={plan,lock,distance,pick,canCatch};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeHuntRules=api;
})(typeof window!=='undefined'?window:globalThis);
