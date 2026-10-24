/* Same fixed 60 Hz simulation, independent of display refresh rate. No background catch-up. */
(function(root){'use strict';
 function create(){const step=1000/60;let last=null,accumulator=0;return {reset(){last=null;accumulator=0;},tick(now,update){if(!Number.isFinite(now))return 0;if(last===null){last=now;return 0;}const elapsed=Math.max(0,Math.min(100,now-last));last=now;accumulator=Math.min(accumulator+elapsed,step*6);let count=0;while(accumulator+1e-6>=step&&count<6){update(step);accumulator=Math.max(0,accumulator-step);count++;}return count;}};}
 const api={create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifePhysicsClock=api;
})(typeof window!=='undefined'?window:globalThis);
