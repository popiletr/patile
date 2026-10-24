/* Data-only live content. Never loads executable code, HTML, styles, URLs or new features. */
(function(root){
 'use strict';
 const KEY='patilife_content_cache_v1',MAX_BYTES=16384,MAX_AGE=90*86400000;
 const LIMITS={food:{budget:[1,6],basic:[4,12],premium:[12,27],gourmet:[25,50]},water:{filtered:[4,12],premium:[12,30]}};
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 function object(o){return o!==null&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype;}
 function keys(o,allowed){if(!object(o)||Object.keys(o).some(k=>!allowed.includes(k)))throw Error('Unsupported content field');}
 function validate(p,now=Date.now()){
  keys(p,['schema','channel','version','issuedAt','expiresAt','food','water']);
  if(p.schema!==1||p.channel!=='store-data-v1'||!Number.isSafeInteger(p.version)||p.version<1)throw Error('Unsupported content version');
  if(!Number.isSafeInteger(p.issuedAt)||!Number.isSafeInteger(p.expiresAt)||p.issuedAt>now+300000||p.expiresAt<=now||p.expiresAt<=p.issuedAt||p.expiresAt-p.issuedAt>MAX_AGE)throw Error('Content expired');
  for(const group of ['food','water']){
   if(!own(p,group))continue;
   keys(p[group],group==='food'?['budget','basic','premium','gourmet']:['tap','filtered','premium']);
   for(const [id,entry]of Object.entries(p[group])){
    keys(entry,['cost','detail']);
    if(own(entry,'cost')){const range=LIMITS[group][id];if(!range||!Number.isInteger(entry.cost)||entry.cost<range[0]||entry.cost>range[1])throw Error('Price outside bundled limits');}
    if(own(entry,'detail')&&(typeof entry.detail!=='string'||entry.detail.length<1||entry.detail.length>180||/[<>&\u0000-\u001f\u007f]/u.test(entry.detail)||/\p{Extended_Pictographic}/u.test(entry.detail)))throw Error('Invalid plain text');
   }
  }
  return p;
 }
 function bytes(b64){if(typeof b64!=='string'||b64.length>24000||!/^[A-Za-z0-9+/]*={0,2}$/.test(b64))throw Error('Invalid encoding');return Uint8Array.from(root.atob(b64),c=>c.charCodeAt(0));}
 async function verify(envelope,config,now=Date.now()){
  keys(envelope,['payload','signature']);
  const raw=bytes(envelope.payload),sig=bytes(envelope.signature);
  if(raw.length>MAX_BYTES||sig.length!==64||!root.crypto?.subtle||!config.publicKey)throw Error('Content verification unavailable');
  const key=await root.crypto.subtle.importKey('jwk',config.publicKey,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  if(!await root.crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,sig,raw))throw Error('Invalid content signature');
  return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)),now);
 }
 function defaultStorage(){try{return root.localStorage;}catch(_){return null;}}
 function create({config={},storage=defaultStorage(),fetcher=root.fetch?.bind(root),clock=Date.now}={}){
  let current=null,pending=null,state='bundled',flight=null;
  const cached=()=>{try{const raw=storage?.getItem(KEY)||'null';return raw.length<=24000?JSON.parse(raw):null;}catch(_){return null;}};
  async function load(){const e=cached();if(e)try{current=await verify(e,config,clock());state='cached';}catch(_){state='bundled';}return current;}
  function apply(rules){if(!current||!rules)return;for(const group of ['food','water'])for(const [id,patch]of Object.entries(current[group]||{})){const target=rules[group.toUpperCase()]?.[id];if(target)for(const k of ['cost','detail'])if(own(patch,k))target[k]=patch[k];}}
  async function download(response){
   if(!response.ok||response.redirected||!/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type')||'')||Number(response.headers.get('content-length')||0)>24000)throw Error('Invalid content response');
   if(!response.body?.getReader)throw Error('Streaming verification unavailable');
   const reader=response.body.getReader(),chunks=[];let total=0;
   try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>24000)throw Error('Content too large');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
   const all=new Uint8Array(total);let at=0;for(const chunk of chunks){all.set(chunk,at);at+=chunk.length;}
   return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(all));
  }
  async function check(){if(flight)return flight;
   flight=(async()=>{
    if(!config.endpoint||!config.publicKey||!fetcher)return {state};
    const url=new URL(config.endpoint);if(url.protocol!=='https:'||url.username||url.password||url.hash||url.search)throw Error('Invalid content endpoint');
    const controller=new AbortController(),timer=root.setTimeout(()=>controller.abort(),6000);
    try{
     const response=await fetcher(url.href,{method:'GET',mode:'cors',credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal});
     const envelope=await download(response),candidate=await verify(envelope,config,clock());
     const existing=cached();let prior=null;if(existing)try{prior=await verify(existing,config,clock());}catch(_){}
     if(candidate.version<=Math.max(current?.version||0,pending?.version||0,prior?.version||0))return {state};
     // Commit one complete signed document; failed writes retain the previous cache.
     storage.setItem(KEY,JSON.stringify(envelope));pending=candidate;state='pending';return {state,version:candidate.version};
    }finally{root.clearTimeout(timer);}
   })().catch(()=>({state,error:'update-unavailable'})).finally(()=>{flight=null;});return flight;
  }
  return Object.freeze({load,apply,check,status:()=>({state,version:current?.version||0,nextVersion:pending?.version||0})});
 }
 const api={validate,verify,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else{root.PatiLifeRemoteContent=api;root.PatiLifeContent=create({config:root.PatiLifeContentConfig||{}});}
})(typeof window!=='undefined'?window:globalThis);
