/* A care action only commits after approach AND its visible action finish. */
(function(root){
 'use strict';
 const DURATIONS=Object.freeze({open:1000,water:2400,food:2800,rest:4500,pet:1800,scratch:2400,hide:2200,clean:2000,watch:2500});
 const MOTIONS=Object.freeze({open:'idle',water:'drink',food:'eat',rest:'sleep',pet:'idle',scratch:'idle',hide:'idle',clean:'idle',watch:'idle'});
 function create(options){
  const schedule=options.schedule||root.setTimeout.bind(root),clear=options.clear||root.clearTimeout.bind(root);
  let timer=null,generation=0,running=false;
  function cancel(reason='cancelled'){
   if(!running)return false;
   generation++;if(timer!==null)clear(timer);timer=null;running=false;
   options.onCancel?.(reason);return true;
  }
  function start(type,approachMs=1100){
   if(running||DURATIONS[type]===undefined)return false;
   running=true;const session=++generation;
   options.onPhase?.({type,phase:'approach',motion:'walk',duration:approachMs});
   timer=schedule(()=>{
    if(!running||session!==generation)return;
    if(options.isHidden?.()){cancel('hidden');return;}
    options.onPhase?.({type,phase:'action',motion:MOTIONS[type],duration:DURATIONS[type]});
    timer=schedule(()=>{
     if(!running||session!==generation)return;
     if(options.isHidden?.()){cancel('hidden');return;}
     timer=null;running=false;options.onComplete?.(type);
    },DURATIONS[type]);
   },Math.max(0,approachMs));
   return true;
  }
  return {start,cancel,isRunning:()=>running};
 }
 const api={create,DURATIONS,MOTIONS};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeCareSession=api;
})(typeof window!=='undefined'?window:globalThis);
