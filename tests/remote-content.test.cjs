'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const R=require('../sprite_preview/patilife_v2/remote-content.js');
const pair=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'}),now=Date.now(),config={endpoint:'https://nazmi.tr/oyun/content/live.json',publicKey:pair.publicKey.export({format:'jwk'})};
function payload(version=1){return {schema:1,channel:'store-data-v1',version,issuedAt:now-1000,expiresAt:now+86400000,food:{basic:{cost:7,detail:'Dengeli günlük öğün.'}},water:{tap:{detail:'Ücretsiz taze su.'}}};}
function sign(p){const data=Buffer.from(JSON.stringify(p));return {payload:data.toString('base64'),signature:crypto.sign('sha256',data,{key:pair.privateKey,dsaEncoding:'ieee-p1363'}).toString('base64')};}
function storage(initial=null){let value=initial&&JSON.stringify(initial);return {getItem:()=>value,setItem:(k,v)=>{value=v;}};}
function response(e){return new Response(JSON.stringify(e),{headers:{'content-type':'application/json'}});}
test('signed content verifies, forgery/expired/unknown code fields fail',async()=>{
 await R.verify(sign(payload()),config,now);
 const forged=sign(payload());forged.payload=Buffer.from(JSON.stringify(payload(2))).toString('base64');await assert.rejects(R.verify(forged,config,now));
 for(const patch of [{expiresAt:now-1},{script:'evil.js'},{channel:'beta'},{schema:2}])assert.throws(()=>R.validate({...payload(),...patch},now));
});
test('only bounded existing prices and plain descriptions; tap remains free',()=>{
 for(const entry of [{cost:10000},{cost:-1},{cost:NaN},{detail:'<script>alert(1)</script>'},{detail:'hello & goodbye'},{detail:'\u{1F431}'},{fill:999},{url:'https://evil.test'}])assert.throws(()=>R.validate({...payload(),food:{basic:entry}},now));
 assert.throws(()=>R.validate({...payload(),water:{tap:{cost:1}}},now));
 assert.throws(()=>R.validate({...payload(),food:{newFood:{cost:2}}},now));
 assert.throws(()=>R.validate({...payload(),food:JSON.parse('{"__proto__":{}}')},now));
});
test('cached verified content applies offline without changing needs or save data',async()=>{
 const app=R.create({config,storage:storage(sign(payload())),clock:()=>now,fetcher:async()=>{throw Error('offline');}});
 await app.load();const rules={FOOD:{basic:{cost:8,fill:60}},WATER:{tap:{cost:0}}};app.apply(rules);assert.equal(rules.FOOD.basic.cost,7);assert.equal(rules.FOOD.basic.fill,60);assert.equal(rules.WATER.tap.cost,0);await app.check();assert.equal(app.status().version,1);
});
test('downloads are staged and never change the active game; next launch activates',async()=>{
 const store=storage(sign(payload())),app=R.create({config,storage:store,clock:()=>now,fetcher:async()=>response(sign(payload(2)))});await app.load();await app.check();assert.deepEqual(app.status(),{state:'pending',version:1,nextVersion:2});const next=R.create({config,storage:store,clock:()=>now});await next.load();assert.equal(next.status().version,2);
});
test('older versions, invalid signatures, redirects, HTML and oversized streams preserve cache',async()=>{
 for(const fetcher of [async()=>response(sign(payload())),async()=>response({...sign(payload(3)),signature:'AAAA'}),async()=>new Response('<html>bad</html>',{headers:{'content-type':'text/html'}}),async()=>new Response(' '.repeat(24001),{headers:{'content-type':'application/json'}}),async()=>({ok:true,redirected:true,headers:new Headers()})]){
 const app=R.create({config,storage:storage(sign(payload(2))),clock:()=>now,fetcher});await app.load();await app.check();assert.equal(app.status().version,2);assert.equal(app.status().nextVersion,0);
 }
});
test('failed disk write and malformed cache fall back without stopping startup',async()=>{
 const store={getItem:()=>'{bad',setItem:()=>{throw Error('quota');}},app=R.create({config,storage:store,clock:()=>now,fetcher:async()=>response(sign(payload()))});await app.load();await app.check();assert.equal(app.status().state,'bundled');
});
test('HTTPS only, anonymous single-flight downloads',async()=>{
 let calls=0;const app=R.create({config,storage:storage(),clock:()=>now,fetcher:async(url,opts)=>{calls++;assert.equal(opts.credentials,'omit');assert.equal(opts.redirect,'error');return response(sign(payload()));}});await Promise.all([app.check(),app.check()]);assert.equal(calls,1);
 const bad=R.create({config:{...config,endpoint:'http://nazmi.tr/live.json'},storage:storage(),fetcher:()=>{throw Error('must not request');}});assert.equal((await bad.check()).error,'update-unavailable');
});
