/* Room paths use furniture footprints; autonomous moments never award care progress. */
(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports,E=node?require('./inventory.js'):root.PatiLifeInventory;
 const BOUNDS={left:8,right:92,bottom:8,top:58};
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function obstacles(save,room,ignoreId){return Object.entries(save.inventory.placements).filter(([id,p])=>id!==ignoreId&&p.room===room&&E.item(id).mount!=='wall').map(([id,p])=>{const d=E.item(id);return {id,left:p.x-d.width/2-2,right:p.x+d.width/2+2,bottom:p.y-d.depth/2-2,top:p.y+d.depth/2+2};});}
 const inside=(p,r)=>p.x>=r.left&&p.x<=r.right&&p.y>=r.bottom&&p.y<=r.top;
 function blocked(a,b,r){
  let low=0,high=1;
  for(const [key,min,max] of [['x',r.left,r.right],['y',r.bottom,r.top]]){
   const delta=b[key]-a[key];if(Math.abs(delta)<1e-9){if(a[key]<min||a[key]>max)return false;continue;}
   let t1=(min-a[key])/delta,t2=(max-a[key])/delta;if(t1>t2)[t1,t2]=[t2,t1];low=Math.max(low,t1);high=Math.min(high,t2);if(low>high)return false;
  }return true;
 }
 function path(save,room,start,target,ignoreId){
  const inBounds=p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=BOUNDS.left&&p.x<=BOUNDS.right&&p.y>=BOUNDS.bottom&&p.y<=BOUNDS.top;
  if(!inBounds(start)||!inBounds(target))return null;
  // A cat resting inside its bed must be able to leave that footprint.
  const boxes=obstacles(save,room,ignoreId).filter(r=>!inside(start,r));if(boxes.some(r=>inside(target,r)))return null;
  const points=[{x:start.x,y:start.y},{x:target.x,y:target.y}];
  for(const r of boxes)for(const x of [r.left-.15,r.right+.15])for(const y of [r.bottom-.15,r.top+.15]){const p={x,y};if(inBounds(p)&&!boxes.some(q=>inside(p,q)))points.push(p);}
  const cost=points.map(()=>Infinity),previous=[],visited=new Set();cost[0]=0;
  while(visited.size<points.length){let at=-1;for(let i=0;i<points.length;i++)if(!visited.has(i)&&(at===-1||cost[i]<cost[at]))at=i;if(at===-1||!Number.isFinite(cost[at]))return null;if(at===1)break;visited.add(at);
   for(let i=0;i<points.length;i++){if(visited.has(i)||boxes.some(r=>blocked(points[at],points[i],r)))continue;const value=cost[at]+distance(points[at],points[i]);if(value<cost[i]){cost[i]=value;previous[i]=at;}}
  }
  if(!Number.isFinite(cost[1]))return null;const result=[];for(let i=1;i!==undefined;i=previous[i])result.unshift(points[i]);return result;
 }
 const length=points=>points.slice(1).reduce((total,p,i)=>total+distance(points[i],p),0);
 function choose(save,room,start,random=Math.random){
  const personality=save.cat.personality,choices=[{target:{x:50,y:30},motion:'idle',text:'etrafı sessizce izliyor.',weight:2}];
  if(personality==='friendly')choices.push({target:{x:50,y:23},motion:'idle',text:'yakınına gelip sana bakıyor.',weight:7});
  for(const [id,p] of Object.entries(save.inventory.placements)){
   if(p.room!==room)continue;const d=E.item(id),action=d.id==='carrier'?'hide':d.action;
   if(!['rest','hide','watch','play','scratch'].includes(action))continue;
   const weight=action==='rest'?(save.needs.energy<35?18:personality==='sleepy'?12:3):action==='hide'?(personality==='timid'?12:personality==='curious'?8:2):action==='play'?(personality==='playful'||personality==='feisty'?12:3):personality==='curious'?9:3;
   choices.push({id,target:{x:p.x,y:d.mount==='wall'?25:p.y},motion:action==='rest'?'sleep':'idle',text:action==='rest'?'kendi köşesinde kıvrılıp dinleniyor.':action==='hide'?'güvenli köşesini kokluyor.':action==='play'?'oyuncağının çevresini merakla inceliyor.':action==='scratch'?'tırmalama köşesini inceliyor.':'çevredeki küçük hareketleri izliyor.',weight});
  }
  const reachable=choices.map(c=>({...c,path:path(save,room,start,c.target,c.id)})).filter(c=>c.path);if(!reachable.length)return null;
  let roll=Math.max(0,Math.min(.999999,random()))*reachable.reduce((n,c)=>n+c.weight,0);for(const c of reachable){roll-=c.weight;if(roll<0)return c;}return reachable.at(-1);
 }
 function createMovement(options){
  const schedule=options.schedule||root.setTimeout.bind(root),clear=options.clear||root.clearTimeout.bind(root),now=options.now||Date.now;let timer=null,generation=0,segment=null;
  function position(){if(!segment)return null;const fraction=Math.max(0,Math.min(1,(now()-segment.at)/Math.max(1,segment.ms)));return {x:segment.a.x+(segment.b.x-segment.a.x)*fraction,y:segment.a.y+(segment.b.y-segment.a.y)*fraction};}
  function cancel(){const p=position();generation++;if(timer!==null)clear(timer);timer=null;segment=null;return p;}
  function start(points,duration,onDone){cancel();const token=generation,total=length(points);let index=1;
   function next(){if(token!==generation)return;if(index>=points.length){segment=null;timer=null;onDone?.();return;}const a=points[index-1],b=points[index++],ms=total?duration*distance(a,b)/total:duration;segment={a,b,ms,at:now()};options.onSegment(b,ms);timer=schedule(next,ms);}
   next();
  }return {start,cancel,position};
 }
 const api={BOUNDS,obstacles,inside,blocked,path,length,choose,createMovement};if(node)module.exports=api;else root.PatiLifeBehavior=api;
})(typeof window!=='undefined'?window:globalThis);
