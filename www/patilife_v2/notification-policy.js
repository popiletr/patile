/* Device-local one-shot reminders; pure planning, independent from permission and delivery. */
(function(root){
 'use strict';
 const R=typeof module!=='undefined'&&module.exports?require('./household-rules'):root.PatiLifeHouseholdRules;
 const DEFAULTS=Object.freeze({version:1,enabled:true,care:true,daily:true,social:true,maxDaily:3,gapHours:3,quietEnabled:true,quietStart:22,quietEnd:9,dailyTime:'09:30'});
 const OWNED_IDS=[1001,1002,1003,1004,1005,...Array.from({length:48},(_,i)=>2000+i)];
 function preferences(raw={}){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Bildirim tercihleri geçersiz; kayıt korundu.');const p={...DEFAULTS,...raw};if(p.version!==1||!['enabled','care','daily','social','quietEnabled'].every(k=>typeof p[k]==='boolean')||!Number.isInteger(p.maxDaily)||p.maxDaily<1||p.maxDaily>3||!Number.isFinite(p.gapHours)||p.gapHours<1||p.gapHours>12||!Number.isInteger(p.quietStart)||!Number.isInteger(p.quietEnd)||p.quietStart<0||p.quietStart>23||p.quietEnd<0||p.quietEnd>23||p.quietStart===p.quietEnd||!/^([01]\d|2[0-3]):[0-5]\d$/.test(p.dailyTime))throw new Error('Bildirim saatlerini kontrol et.');return p;}
 function day(at){const d=new Date(at);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function awake(at,p){const d=new Date(at),h=d.getHours(),quiet=p.quietStart>p.quietEnd?h>=p.quietStart||h<p.quietEnd:h>=p.quietStart&&h<p.quietEnd;if(!p.quietEnabled||!quiet)return at;if(h>=p.quietStart&&p.quietStart>p.quietEnd)d.setDate(d.getDate()+1);d.setHours(p.quietEnd,0,0,0);return d.getTime();}
 function plan(game,prefs={},ledger=[],now=Date.now()){
  const p=preferences(prefs),past=ledger.filter(n=>Number.isFinite(n.at)&&n.at<=now&&n.at>now-8*86400000),result=[];if(!p.enabled)return result;
  const end=new Date(now);end.setDate(end.getDate()+7);const name=game.catName||'Kedin',candidates=[],add=(kind,at,title,body,key)=>{if(Number.isFinite(at)&&at>now)candidates.push({kind,at,title,body,key});};
  if(p.care){for(const type of ['food','water']){
   const n=type==='food'?game.hunger:game.thirst,hours=(type==='food'?game.foodDurationHours:game.waterDurationHours)||(type==='food'?6:4),decay=game.notificationDecay?.[type]||1;
   const wait=(Number.isFinite(n)&&n>30)?Math.max(900,(n-30)/100*hours*3600/decay):5400;
   let at=now+wait*1000,title=type==='food'?name+' için mama vakti':name+' için taze su',body=type==='food'?'Mama kabını kontrol edip küçük bir öğün hazırlayabilirsin.':'Su kabını kontrol edip suyunu tazeleyebilirsin.';
   const stock=game.lifeV2?.household?.[type];if(game.notificationRanks?.[type]>=3&&stock?.portions>0){const period=(stock.quality==='gourmet'?24:stock.quality==='premium'?(type==='food'?12:16):stock.quality==='filtered'?8:stock.quality==='budget'?4:type==='food'?6:4)*3600000*.5;const until50=Number.isFinite(n)?Math.max(0,(n-50)/100*hours*3600000/decay):0;at=Math.max(now+until50,stock.nextAt||now)+(stock.portions-1)*period+900000;title=type==='food'?'Mama haznesini kontrol et':'Su haznesini kontrol et';body='Otomatik kabın stoğu azalmış olabilir. '+name+' için hazneyi yenileyebilirsin.';}
   add(type,at,title,body);
  }
  const litter=game.lifeV2?.household?.litter;
  if(litter&&R){
   const t=R.toiletStatus(game.lifeV2,game.toiletNeed,{placed:game.notificationToiletPlaced!==false,level:game.notificationRanks?.litter??R.litterLevel(game.lifeV2)});
   if(['place','refill'].includes(t.action)||t.action==='clean'&&t.dirty>=4)add('litter',now+7200000,t.heading,'Bakım → Tuvalet: '+t.button+'. '+(t.action==='refill'?'Yeni kum kirli kumu da yeniler.':t.action==='clean'?'Kalan kumu harcamadan temizleyebilirsin.':'Önce kabı bir odaya yerleştir.'));
   else if(Number.isFinite(game.toiletNeed)&&t.placed&&t.remaining>0&&(t.automatic||t.dirty<4)){const delay=Math.max(5400,(80-t.need)/100*3.5*3600);add('toilet-need',now+delay*1000,(game.catName||'Kedin')+' için tuvalet kontrolü','Kabı hazırsa Bakım → Tuvalet → Tuvalete götür. Kirlilik ve kum durumu aynı ekranda görünür.');}
  }else if(!litter&&(game.toiletFullness||0)>=100)add('litter',now+7200000,'Önce topakları temizle','Bakım → Tuvalet → Kürekle temizle.');}

  if(p.daily){const [hh,mm]=p.dailyTime.split(':').map(Number);for(let i=0;i<7;i++){const d=new Date(now);d.setDate(d.getDate()+i);d.setHours(hh,mm,0,0);if(d.getTime()>now)add('daily',d.getTime(),'Evimizde yeni bir gün',name+' ile kısa bir oyun ve günlük buluşmalar seni bekliyor.');}}
  // Future Petsgram integration supplies real persisted events; no invented cargo or likes.
  if(p.social)for(const e of game.lifeV2?.petsgram?.notifications||[]){if(e&&['post-ready','parcel'].includes(e.kind)&&typeof e.id==='string'&&typeof e.title==='string'&&typeof e.body==='string')add(e.kind,e.at,e.title,e.body,'social:'+e.id);}
  const ordered=candidates.sort((a,b)=>a.at-b.at),gap=p.gapHours*3600000,keys=new Set(past.map(n=>n.key));let last=Math.max(now-gap,...past.map(n=>n.at));
  for(const c of ordered){let at=awake(Math.max(c.at,last+gap),p);for(let tries=0;tries<10;tries++){const key=c.key||c.kind+':'+day(at),used=[...past,...result].filter(n=>day(n.at)===day(at)).length;if(keys.has(key))break;if(used>=p.maxDaily){const d=new Date(at);d.setDate(d.getDate()+1);d.setHours(p.quietEnabled?p.quietEnd:9,0,0,0);at=awake(Math.max(d.getTime(),last+gap),p);continue;}if(at<end.getTime()){const event={...c,id:2000+result.length,key,at};result.push(event);keys.add(key);last=at;}break;}}
  return result;
 }
 const api={DEFAULTS,OWNED_IDS,preferences,day,awake,plan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeNotificationPolicy=api;
})(typeof window!=='undefined'?window:globalThis);
