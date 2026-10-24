'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('sponsor cards show exact reward, lock during loading, and close care panel only after a verified reward',async()=>{
 let closes=0,resolve;
 class El{constructor(tag){this.tagName=tag;this.children=[];this.disabled=false;}append(...n){this.children.push(...n);}setAttribute(){}closest(){return {remove:()=>closes++};}}
 const root={document:{createElement:t=>new El(t)},PatiLifeGameIcons:{make:()=>new El('span')},GameState:{isBusy:false},startNativeServices:async()=>{},AdManager:{watchAdForFreeFood:()=>new Promise(r=>resolve=r)}};root.window=root;vm.createContext(root);vm.runInContext(fs.readFileSync('sprite_preview/patilife_v2/runtime.js','utf8'),root);
 const box=new El('section');root.PatiLifeRuntime.sponsorOffers(box,['food']);const card=box.children[0].children[1],button=card.children.find(n=>n.tagName==='button'),words=card.children.find(n=>n.tagName==='div');assert.match(words.children[1].textContent,/30 altın/);assert.equal(button.textContent,'Reklam izle · Kazan');
 const first=button.onclick();assert.equal(button.disabled,true);await new Promise(r=>setImmediate(r));resolve({rewarded:false});await first;assert.equal(closes,0);assert.equal(button.disabled,false);
 const second=button.onclick();await new Promise(r=>setImmediate(r));resolve({rewarded:true});await second;assert.equal(closes,1);assert.equal(button.textContent,'Reklam izle · Kazan');
});
