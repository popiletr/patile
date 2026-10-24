(function () {
 'use strict';
 const L=window.PatiLifeDailyLife,E=window.PatiLifeInventory,G=window.PatiLifeGrowth,B=window.PatiLifeBehavior,A=window.PatiLifeAchievements;
 const M = window.PatiLifeV2, app = document.getElementById('app');
 const scenes = [
  { id:'rain', title:'Yağmurun getirdiği karşılaşma', text:'Dört arkadaş, yağmurlu bir akşam eve doğru yürüyoruz. Bir dükkânın saçağına yaklaşırken ince bir ses duyuyoruz.' },
  { id:'box', title:'Saçağın altında dört küçük hayat', text:'Kuru bir kutunun içinde dört yavru var. Çevreyi kontrol edip yardıma ihtiyaçları olduğunu anlıyoruz. Onları burada bırakmayacağız.' },
  { id:'promise', title:'Hepsine bir yuva', text:'Her birimiz bir yavruya yuva açmaya karar veriyoruz. Hangisi seninle gelirse gelsin, diğer üçü de arkadaşlarınla güvenli evlerine gidecek.' }
 ];
 const home = [
  {id:'home_arrival', title:'Önce biraz zaman', text:'Taşıma çantasını sessiz bir köşeye bırak. Kapısını açıp biraz uzaklaş. Yeni arkadaşın dışarı çıkmak için acele etmek zorunda değil.', action:'Kapıyı aç ve bekle'},
  {id:'home_water', title:'İlk güvenli köşe', text:'Taze suyu kolay ulaşabileceği bir yere bırak. Mama ve suyu kum alanından uzakta tut.', action:'Suyunu hazırla'},
  {id:'home_food', title:'Küçük bir ilk öğün', text:'Yavruya uygun küçük bir öğün hazırla. Yemek yerken onu rahat bırak; yaklaşmayı kendisi seçsin.', action:'İlk öğünü hazırla'},
  {id:'home_rest', title:'Kendine ait bir yer', text:'Yumuşak bir yatak ve ulaşabileceği temiz bir kum alanı hazırla. Saklanabileceği güvenli bir köşesi de olsun.', action:'Dinlenme köşesini hazırla'},
  {id:'home_play', title:'İlk küçük oyun', text:'Oyuncağı küçük hareketlerle yönlendir. Üç sakin takip yeterli; yorulduğunda dinlenmesine izin ver.', action:'Birlikte oyna'},
  {id:'home_memory', title:'Birlikte ilk gün', text:'Bugün ilk adımı attınız. Güven, birlikte geçireceğiniz küçük ve sakin anlarla büyüyecek.', action:'İlk gün hatırasını kaydet'}
 ];
 let save, selected = null, busy = false, dailyOpen=false, memoriesOpen=false, houseOpen=false, profileOpen=false, editMode=false, currentRoom='living', shopCategory='Beslenme', playItemId='yarn';
 let careOpen=false,gameOpen=false,sheetReturnFocus=null;
 let achievementCategory=A.CATEGORIES[0],ambientTimer=null,ambientActive=false,ambientGeneration=0,travelActor=null;
 const movement=B.createMovement({onSegment:(point,ms)=>{if(travelActor)moveKitten(travelActor,point.x,point.y,ms,false);}});
 let playCount = 0, lastPlayTap = 0, playSession = 0, careContext = null;
 const careRunner=window.PatiLifeCareSession.create({onPhase:carePhase,onComplete:finishCare,onCancel:cancelCare,isHidden:()=>!!document.hidden});
 const el = (tag, text, cls) => { const n=document.createElement(tag); if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n; };
 function button(text, callback, cls='action'){const n=el('button',text,cls);n.type='button';n.onclick=event=>{stopAmbient();callback(event);};return n;}
 function commit(next){try{next=E.ensure(next);if(next.cat&&!next.requiresLegacyIdentity&&next.story.step==='settled')next=L.visit(next);M.persist(localStorage,next);window.CloudManager?.saveToCloud();save=next;render();return true;}catch(error){showError(error.message);return false;}}
 function portrait(id,cls='portrait',stage=save?.cat?.id===id?save.growth.stage:'kitten'){const n=el('canvas',undefined,cls+' coat-'+id);n.setAttribute('role','img');n.setAttribute('aria-label',M.CATS.find(c=>c.id===id).coat+' '+G.STAGES[stage]);window.PatiLifeSpritePlayer?.mount(n,id,cls==='home-cat',stage);return n;}
 function showError(text){let n=document.getElementById('error');if(!n){n=el('p','','error');n.id='error';n.setAttribute('role','alert');app.append(n);}n.textContent=text;}
 function shell(){stopAmbient();stopMovement();careRunner.cancel('scene');window.PatiLifeSpritePlayer?.stopAll();app.replaceChildren();app.className='app '+(save&&(save.story.step==='settled'||save.story.step.startsWith('home_'))?'is-game':'is-story');const header=el('header');header.append(el('div','PatiLife','brand'));const link=el('a','Mevcut oyun');link.href='../patilife_app.html';link.onclick=()=>pauseActivities();header.append(link);app.append(header);const main=el('section',undefined,'body');app.append(main);return main;}
 function title(main,kicker,heading,text){main.append(el('div',kicker,'eyebrow'),el('h1',heading));if(text)main.append(el('p',text));}
 function render(){
  if(save.story.step==='settled'&&window.location?.replace){window.location.replace('../patilife_app.html');return;}
  const main=shell(), step=save.story.step;
  if(save.requiresLegacyIdentity){
   title(main,'MEVCUT ARKADAŞIN','Kedinin görünüşünü tamamlayalım','Adı, cinsiyeti, huyu ve birikimi korunacak. Eşyaların ve Patile kaydın korunur. Görünüşünü seçince evine döneceksin.');
   const grid=el('div',undefined,'cats');for(const cat of M.CATS){const b=button('',()=>{try{commit(M.migrateIdentity(save,cat.id));}catch(error){showError(error.message);}},'cat');b.append(portrait(cat.id),el('strong',cat.coat));grid.append(b);}main.append(grid);return;
  }
  const index=scenes.findIndex(s=>s.id===step);
  if(index>=0){
   const image=el('div',undefined,'scene comic-scene');image.style.backgroundImage='url(assets/comic-chapters.png)';image.style.backgroundSize='200% 300%';image.style.backgroundPosition=(index%2?100:0)+'% '+(Math.floor(index/2)*50)+'%';image.setAttribute('role','img');image.setAttribute('aria-label',scenes[index].title);main.append(image);title(main,'YENİ BİR YUVA · '+(index+1)+'/3',scenes[index].title,scenes[index].text);
   app.append(button(index===2?'Yavrularla tanış':'Devam et',()=>commit({...save,story:{step:index===2?'selection':scenes[index+1].id,completed:false}})));return;
  }
  if(step==='selection'){
   title(main,'DÖRT YAVRU, DÖRT YUVA','Kim seninle gelsin?','Karakterleri farklı, hepsinin sevgiye ihtiyacı var. Diğer üç yavru arkadaşlarınla gidecek.');const grid=el('div',undefined,'cats');
   for(const cat of M.CATS){const b=button('',()=>{selected=cat.id;render();},'cat');b.setAttribute('aria-pressed',String(selected===cat.id));b.append(portrait(cat.id),el('strong',cat.coat),el('small',cat.gender+' · '+cat.temperament),el('p',cat.description));grid.append(b);}main.append(grid);
   const next=button('Birlikte eve gidelim',()=>commit({...save,draftCatId:selected,story:{step:'name',completed:false}}));next.disabled=!selected;app.append(next);return;
  }
  if(step==='name'){
   const cat=M.CATS.find(c=>c.id===save.draftCatId);if(!cat){commit({...save,story:{step:'selection',completed:false}});return;}
   title(main,'TANIŞMA VAKTİ',cat.coat+' sana bakıyor',cat.gender+' · '+cat.temperament+'. Artık ona bir isim verebilirsin.');
   const form=el('form'),label=el('label','Ona ne diye sesleneceksin?'),input=el('input');label.htmlFor='cat-name';input.id='cat-name';input.name='catName';input.autocomplete='off';input.required=true;input.maxLength=40;input.placeholder='Kedinin adı';form.append(label,input,el('small','1–20 karakter. Daha sonra değiştirebilirsin.'));
   const submit=el('button','Eve hoş geldin','action');submit.type='submit';submit.style.marginTop='24px';form.append(submit);form.onsubmit=e=>{e.preventDefault();try{const adopted=M.adopt(save,cat.id,input.value);adopted.story.step='farewell';adopted.friends=M.CATS.filter(c=>c.id!==cat.id).map(c=>({catId:c.id,adopted:true}));delete adopted.draftCatId;commit(adopted);}catch(error){showError(error.message);}};main.append(form,button('Kedilere geri dön',()=>commit({...save,story:{step:'selection',completed:false}}),'quiet'));return;
  }
  if(step==='farewell'){const picture=el('div',undefined,'scene comic-scene');picture.style.backgroundImage='url(assets/comic-chapters.png)';picture.style.backgroundSize='200% 300%';picture.style.backgroundPosition='0% 50%';picture.setAttribute('role','img');picture.setAttribute('aria-label','Dört arkadaş dört yavruyu da sahipleniyor');main.append(picture);title(main,'HEPSİ SAHİPLENİLDİ','Dört ayrı ev, aynı güzel başlangıç',save.cat.name+' seninle geliyor. '+save.friends.map(f=>M.CATS.find(c=>c.id===f.catId).coat).join(', ')+' yavrular da arkadaşlarınla yola çıktı.');app.append(button('Evimize gidelim',()=>commit({...save,care:{...save.care,tutorial:{step:0,active:true,completed:false}},story:{step:'settled',completed:true}})));return;}
  const hi=home.findIndex(s=>s.id===step);
  if(hi>=0||step==='settled'){renderHome(main,hi);return;}
  showError('Bu hikâye adımı henüz desteklenmiyor. Kayıt korundu.');
 }
 function renderHome(main,hi){
  const intro=hi>=0, info=home[hi];
  const hud=el('section',undefined,'game-hud');hud.setAttribute('aria-label','Kedinin durumu');
  const top=el('div',undefined,'hud-top'),profile=button('',()=>{if(busy)return;openPanel('profile');},'profile-button');profile.id='profile-button';profile.disabled=intro;profile.setAttribute('aria-label','Kedim');profile.setAttribute('title',save.cat.name+' profili');profile.append(portrait(save.cat.id),el('strong',save.cat.name),el('small',G.STAGES[save.growth.stage]+' · '+save.cat.temperament));top.append(profile);
  const coins=el('div',undefined,'coin-pill');coins.setAttribute('aria-label','Birikim: '+save.economy.coins);coins.append(el('small','Pati'),el('strong',String(save.economy.coins)));top.append(coins);hud.append(top);
  const stats=el('div',undefined,'needs');for(const [key,label] of [['hunger','Tokluk'],['thirst','Su'],['happy','Keyif'],['energy','Enerji'],['cleanliness','Temizlik']]){const labelEl=el('label',label);const meter=el('meter');meter.min=0;meter.max=100;meter.value=save.needs[key];meter.setAttribute('aria-label',label);labelEl.append(meter);stats.append(labelEl);}hud.append(stats);main.append(hud);
  if(!intro){const picker=el('select',undefined,'room-picker');picker.id='room-picker';picker.setAttribute('aria-label','Oda seç');for(const [id,label] of Object.entries(E.ROOMS)){const option=el('option',label);option.value=id;option.selected=id===currentRoom;picker.append(option);}picker.value=currentRoom;picker.disabled=busy;picker.onchange=()=>{if(busy)return;stopAmbient();currentRoom=picker.value;editMode=false;render();};main.append(picker);}
  const room=el('div',undefined,'home-room room-'+(intro?'living':currentRoom)),actor=portrait(save.cat.id,'home-cat');actor.id='home-cat';actor.setAttribute('data-motion','idle');const position=save.care.position&&(!save.care.position.room||save.care.position.room===currentRoom)?save.care.position:{x:46,y:30};actor.style.left=position.x+'%';actor.style.bottom=position.y+'%';room.append(actor);
  const status=el('p',save.care.carrierOpen?save.cat.name+' etrafı izliyor.':'Taşıma çantasının kapısı kapalı.','cat-status');status.setAttribute('role','status');
  const expected={home_arrival:'open',home_water:'water',home_food:'food',home_rest:'rest',home_play:'play',home_memory:'memory'}[save.story.step];
  let objects=[
   {type:'open',label:'Taşıma çantası',detail:save.care.carrierOpen?'Kapısı açık':'Kapısını aç',prop:'carrier',x:17,y:43,target:{x:31,y:43,facing:-1}},
   {type:'water',label:'Su kabı',detail:save.care.waterReady?'Suyu tazele':'Taze su koy',prop:'water',x:78,y:36,target:{x:62,y:36,facing:1}},
   {type:'food',label:'Mama kabı',detail:save.care.foodReady?'Küçük öğün ver':'İlk öğünü ver',prop:'food',x:77,y:13,target:{x:61,y:13,facing:1}},
   {type:'rest',label:'Dinlenme köşesi',detail:save.care.bedReady?'Biraz dinlen':'Yatak ve kum alanı hazırla',prop:'bed',x:23,y:14,target:{x:23,y:14,facing:1}}
  ];
  if(!intro){objects=Object.entries(save.inventory.placements).filter(([,p])=>p.room===currentRoom).map(([id,p])=>{const def=E.item(id),action=def.id==='carrier'?'hide':def.action;return {id,type:action,label:def.name,detail:'Kullan',prop:id,x:p.x,y:p.y,target:{x:Math.min(85,Math.max(15,['food','water'].includes(action)?p.x-14:p.x)),y:def.mount==='wall'?25:p.y,facing:1}};});}
  for(const object of objects){let dragged=false;const b=button('',()=>{if(dragged){dragged=false;return;}if(editMode||busy)return;
   if(object.type==='memory'){openPanel('memories');return;}
   if(object.type==='play'){playItemId=object.id;startPlay(room,actor,status);return;}
   runCare(object.type,object.target,status,object.id);
  },'room-object object-'+object.type+(editMode?' movable':''));
   const art=el('canvas',undefined,'prop-art');art.setAttribute('aria-hidden','true');window.PatiLifeSpritePlayer?.mountProp(art,object.prop);b.append(art,el('strong',object.label),el('small',object.detail));b.style.left=object.x+'%';b.style.bottom=object.y+'%';b.disabled=intro&&object.type!==expected;b.setAttribute('aria-label',object.label+': '+object.detail);
   if(!intro){b.onpointerdown=event=>{if(!editMode||busy)return;event.preventDefault();b.setPointerCapture(event.pointerId);const bounds=room.getBoundingClientRect();let moved=false;
    b.onpointermove=e=>{moved=true;const x=Math.min(85,Math.max(15,(e.clientX-bounds.left)/bounds.width*100)),y=Math.min(E.item(object.id).mount==='wall'?80:52,Math.max(E.item(object.id).mount==='wall'?65:12,(bounds.bottom-e.clientY)/bounds.height*100));b.style.left=x+'%';b.style.bottom=y+'%';};
    b.onpointerup=()=>{b.onpointermove=null;b.onpointerup=null;if(!moved)return;dragged=true;try{commit(E.place(save,object.id,currentRoom,{x:parseFloat(b.style.left),y:parseFloat(b.style.bottom)}));}catch(error){b.style.left=object.x+'%';b.style.bottom=object.y+'%';showError(error.message);}};
    b.onpointercancel=()=>{b.onpointermove=null;b.onpointerup=null;b.style.left=object.x+'%';b.style.bottom=object.y+'%';};
   };}room.append(b);
  }
  main.append(room,status);
  const dock=el('nav',undefined,'game-nav');dock.setAttribute('aria-label','Oyun menüsü');
  if(intro){
   const guide=el('section',undefined,'first-day-guide');guide.append(el('small','İLK GÜN · '+(hi+1)+' / '+home.length),el('h1',info.title),el('p',info.text));
   if(expected==='play')guide.append(button('Oyuncağı takip et',()=>{playItemId='yarn';startPlay(room,actor,status);}));
   else if(expected==='memory')guide.append(button('İlk gün hatırasını kaydet',()=>{try{commit(M.action(save,'memory'));}catch(error){showError(error.message);}}));
   else guide.append(el('small','Devam etmek için odadaki işaretli eşyaya dokun.','guide-hint'));
   main.append(guide);room.className+=' tutorial-room';
  }else{
   for(const [id,label] of [['care','Bakım'],['game','Oyun'],['house','Ev'],['daily','Günlük']]){const b=button(label,()=>{if(busy)return;const opened={care:careOpen,game:gameOpen,house:houseOpen,daily:dailyOpen}[id];openPanel(opened?null:id);},'nav-button');b.id='nav-'+id;b.setAttribute('aria-pressed',String({care:careOpen,game:gameOpen,house:houseOpen,daily:dailyOpen}[id]));dock.append(b);}main.append(dock);
   if(G.progress(save).ready){const growth=button('Yeni bir dönem hazır',()=>{if(!busy)openPanel('profile');},'growth-badge');main.append(growth);}
   if(editMode){const done=button('Düzenlemeyi bitir',()=>{editMode=false;openPanel('house');},'edit-done');main.append(done);}
   const kind=careOpen?'care':gameOpen?'game':houseOpen&&!editMode?'house':profileOpen?'profile':memoriesOpen?'memories':dailyOpen?'daily':null;
   if(kind){const body=renderSheet(main,kind);if(kind==='care')renderCareMenu(body,status);if(kind==='game')renderGameMenu(body,room,actor,status);if(kind==='house')renderHouse(body);if(kind==='profile')renderProfile(body);if(kind==='memories')renderMemories(body);if(kind==='daily')renderDaily(body);}
   scheduleAmbient(actor,status);
  }
 }
 function openPanel(kind){
  if(busy)return;stopAmbient();sheetReturnFocus=document.activeElement?.id||sheetReturnFocus;careOpen=kind==='care';gameOpen=kind==='game';houseOpen=kind==='house';profileOpen=kind==='profile';memoriesOpen=kind==='memories';dailyOpen=kind==='daily';
  if(kind!=='house')editMode=false;render();if(!kind&&sheetReturnFocus)document.getElementById(sheetReturnFocus)?.focus?.();
 }
 function renderSheet(main,kind){
  const names={care:'Bakım zamanı',game:'Birlikte oyun',house:'Ev ve eşyalar',profile:'Kedim',memories:'Hatıralar',daily:'Günlük'},layer=el('div',undefined,'sheet-layer'),backdrop=button('',()=>openPanel(null),'sheet-backdrop');backdrop.setAttribute('aria-label','Pencereyi kapat');backdrop.tabIndex=-1;layer.append(backdrop);
  const sheet=el('section',undefined,'bottom-sheet');sheet.id='active-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','sheet-title');sheet.tabIndex=-1;
  const header=el('div',undefined,'sheet-header'),heading=el('h2',names[kind]);heading.id='sheet-title';const close=button('Kapat',()=>openPanel(null),'sheet-close');close.id='sheet-close';header.append(heading,close);sheet.append(header);const body=el('div',undefined,'sheet-body');sheet.append(body);layer.append(sheet);for(const child of main.children)child.inert=true;main.append(layer);sheet.focus?.();
  sheet.onkeydown=event=>{if(event.key==='Escape'){event.preventDefault();openPanel(null);}if(event.key==='Tab'&&sheet.querySelectorAll){const list=[...sheet.querySelectorAll('button:not(:disabled),select,input,a[href]')];if(!list.length){event.preventDefault();return;}const first=list[0],last=list.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===sheet)){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===sheet)){event.preventDefault();first.focus();}}};return body;
 }
 function propButton(label,id,callback){const b=button('',callback,'care-button'),art=el('canvas',undefined,'prop-art');art.setAttribute('aria-hidden','true');window.PatiLifeSpritePlayer?.mountProp(art,id);b.setAttribute('aria-label',label);b.append(art,el('strong',label));return b;}
 function renderCareMenu(main,status){
  const grid=el('div',undefined,'care-grid');
  for(const [action,label,id] of [['food','Mama','food'],['water','Su','water'],['rest','Uyku','bed'],['scratch','Tırmala','scratch'],['clean','Temizlik','litter']]){
   const owned=save.inventory.owned.filter(key=>E.item(key).action===action&&save.inventory.placements[key]);const selected=owned.find(key=>save.inventory.placements[key].room===currentRoom)||owned[0];const b=propButton(label,id,()=>{if(!selected)return;const p=save.inventory.placements[selected],def=E.item(selected);currentRoom=p.room;openPanel(null);runCare(action,{x:Math.max(15,Math.min(85,['food','water'].includes(action)?p.x-14:p.x)),y:def.mount==='wall'?25:p.y,facing:1},document.querySelector('.cat-status'),selected);});b.disabled=!selected;grid.append(b);
  }
  const pet=button('Yanında sakin vakit geçir',()=>{openPanel(null);runCare('pet',{x:50,y:27,facing:1},document.querySelector('.cat-status'));},'quiet');main.append(grid,pet,el('p','Odadaki eşyalara dokunarak da bakım yapabilirsin.','menu-hint'));
 }
 function renderGameMenu(main,room,actor,status){
  main.append(propButton('Oyuncağı takip et','yarn',()=>{openPanel(null);playItemId='yarn';startPlay(document.querySelector('.home-room'),document.getElementById('home-cat'),document.querySelector('.cat-status'));}),el('p','Üç sakin hareketle birlikte kısa bir oyun.','menu-hint'));
 }
 function renderProfile(main){
  const panel=el('section',undefined,'daily-panel'),progress=G.progress(save);panel.append(el('h2',save.cat.name),portrait(save.cat.id));
  panel.append(el('p',G.STAGES[save.growth.stage]+' · '+save.cat.gender+' · '+save.cat.temperament),el('h3',G.bondTitle(save.bond.points)),el('p','Birlikte '+progress.activeDays+' farklı günde zaman geçirdiniz. Bağınız: '+save.bond.points));
  for(const [action,id] of Object.entries(save.bond.preferences)){panel.append(el('p','Sevdiği eşyalardan biri: '+E.item(id).name));}
  if(progress.next){panel.append(el('h3','Sıradaki dönem: '+G.STAGES[progress.next]),el('p','Birlikte geçen gün: '+progress.days+'/'+progress.rule.days+' · Aktif gün: '+progress.activeDays+'/'+progress.rule.activeDays+' · Bağ: '+progress.bond+'/'+progress.rule.bond));
   if(progress.ready){panel.append(portrait(save.cat.id,'portrait',progress.next));const ready=!!window.PatiLifeSpriteAtlases?.[save.cat.id]?.ages?.[progress.next];const grow=button(ready?'Yeni dönemi birlikte karşıla':'Büyüme görselleri hazırlanıyor',()=>{if(busy)return;try{commit(G.grow(save));}catch(error){showError(error.message);}});grow.disabled=!ready;panel.append(grow);}
   else panel.append(el('small','Her dönem birlikte yaşanır. Uzun süre ayrı kalmak büyüme sahnesini atlatmaz; gençlikten sonra en az bir gün birlikte kalırsınız.'));
  }else panel.append(el('p','Büyüme tamamlandı; dostluğunuz, keşifleriniz ve hatıralarınız devam ediyor.'));
  panel.append(button('Hatıralar',()=>openPanel('memories'),'quiet'));main.append(panel);renderAchievements(main);
 }
 function renderAchievements(main){
  const panel=el('section',undefined,'daily-panel'),all=A.progress(save);panel.append(el('h2','Birlikte başardıklarınız'),el('p',all.filter(a=>a.claimed).length+' / '+all.length+' ödül alındı. Ara verdiğiniz günler ilerlemenizi silmez.'));
  const filter=el('select');filter.id='achievement-category';filter.setAttribute('aria-label','Başarım kategorisi');for(const category of A.CATEGORIES){const option=el('option',category);option.value=category;filter.append(option);}filter.value=achievementCategory;filter.onchange=()=>{if(busy)return;achievementCategory=filter.value;render();};panel.append(filter);
  for(const item of all.filter(a=>a.category===achievementCategory)){const row=el('article',undefined,'daily-task');row.append(el('h3',item.title),el('p',item.value+' / '+item.target));const claim=button(item.claimed?'Ödül alındı':item.ready?'Başarım ödülünü al (+'+item.reward+')':'Birlikte zamanla tamamlanır',()=>{if(busy)return;try{commit(A.claim(save,item.id));}catch(error){showError(error.message);}},'quiet');claim.id='achievement-'+item.id;claim.disabled=!item.ready||item.claimed;row.append(claim);panel.append(row);}main.append(panel);
 }
 function renderHouse(main){
  const panel=el('section',undefined,'daily-panel');panel.append(el('h2','Birlikte kurduğunuz ev'),el('p','Birikim: '+save.economy.coins+' · '+save.inventory.owned.length+' / '+E.CATALOG.length+' eşya'));
  panel.append(button(editMode?'Düzenlemeyi bitir':'Yerleşimi düzenle',()=>{if(busy)return;editMode=!editMode;render();},'quiet'));
  if(editMode)panel.append(el('p','Odadaki eşyayı basılı tutup sürükle. Dolu bir yere veya uygun olmayan alana bırakılamaz.'));
  const categories=el('select');categories.id='shop-category';categories.setAttribute('aria-label','Eşya kategorisi');for(const category of [...new Set(E.CATALOG.map(i=>i.category))]){const option=el('option',category);option.value=category;option.selected=category===shopCategory;categories.append(option);}categories.value=shopCategory;categories.onchange=()=>{if(busy)return;shopCategory=categories.value;render();};panel.append(categories);
  const descriptions={food:'Öğünün doyuruculuğunu destekler.',water:'Su ihtiyacının karşılanmasına katkı sağlar.',rest:'Dinlenirken enerji toplamasına yardımcı olur.',scratch:'Kendi keşif alanı keyfini artırır.',hide:'Güvenli bir köşeyi keşfederek rahatlar.',play:'Birlikte kısa oyunun mutluluk katkısını artırır.',clean:'Bakım alanının temizliğini destekler.',watch:'Sakin bir gözlem molası sağlar.',memory:'Biriktirdiğiniz hatıraları açar.',pet:'Birlikte sakin zaman geçirmenizi sağlar.'};
  const cards=el('div',undefined,'shop-grid');
  for(const def of E.CATALOG.filter(i=>i.category===shopCategory)){
   const card=el('article',undefined,'shop-card'),art=el('canvas',undefined,'prop-art');art.setAttribute('aria-hidden','true');window.PatiLifeSpritePlayer?.mountProp(art,def.id);card.append(art,el('h3',def.name),el('p',def.detail||descriptions[def.action]));
   const owned=save.inventory.owned.includes(def.id),placement=save.inventory.placements[def.id],unlocked=['kitten','young','adult'].indexOf(save.growth.stage)>=['kitten','young','adult'].indexOf(def.stage);
   if(!owned){const buy=button(unlocked?def.name+' al ('+def.price+')':G.STAGES[def.stage]+' döneminde açılır',()=>{if(busy)return;try{commit(E.buy(save,def.id));}catch(error){showError(error.message);}},'quiet');buy.id='buy-'+def.id;buy.disabled=!unlocked||save.economy.coins<def.price;card.append(buy);}
   else{
    card.append(el('small',placement?E.ROOMS[placement.room]+' içinde':'Envanterinde'));
    const room=el('select');room.id='room-'+def.id;room.setAttribute('aria-label',def.name+' için oda');for(const id of def.rooms){const option=el('option',E.ROOMS[id]);option.value=id;room.append(option);}room.value=def.rooms.includes(currentRoom)?currentRoom:def.rooms[0];
    const place=button(def.name+' yerleştir',()=>{if(busy)return;try{const next=E.place(save,def.id,room.value);currentRoom=room.value;commit(next);}catch(error){showError(error.message);}},'quiet');place.id='place-'+def.id;card.append(room,place);
    if(placement){const remove=button('Envantere kaldır',()=>{if(busy)return;try{commit(E.remove(save,def.id));}catch(error){showError(error.message);}},'quiet');remove.id='remove-'+def.id;card.append(remove);}
   }cards.append(card);
  }panel.append(cards);main.append(panel);
 }

 function renderMemories(main){
  const panel=el('section',undefined,'daily-panel');panel.append(el('h2',save.cat.name+' ile hatıralar'));
  if(!save.memories.length)panel.append(el('p','Birlikte ilk gününüz ve günlük keşifleriniz burada birikecek.'));
  for(const memory of [...save.memories].reverse()){
   const item=el('article',undefined,'daily-task'),event=L.EVENTS.find(e=>e.id===memory.eventId);
   const date=Number.isFinite(memory.at)?new Date(memory.at).toLocaleDateString('tr-TR'):'Tarih kaydedilmedi';
   item.append(el('small',date),el('h3',memory.id==='first_day'?'Birlikte ilk gün':memory.id.startsWith('growth:')?G.STAGES[memory.id.split(':')[1]]+' dönemine geçiş':event?.title||'Birlikte bir an'),el('p',memory.id==='first_day'?(memory.name||save.cat.name)+' evine alışmak için ilk adımlarını attı.':event?.body||(memory.id.startsWith('growth:')?'Birlikte büyüdüğünüz yeni bir dönem başladı.':'Küçük bir keşfi birlikte paylaştınız.')));panel.append(item);
  }main.append(panel);
 }
 function renderDaily(main){
  const day=L.dayKey(Date.now()),entry=save.daily.events[day],panel=el('section',undefined,'daily-panel');panel.append(el('h2','Bugün evde'));
  if(entry){const event=L.EVENTS.find(e=>e.id===entry.id);panel.append(el('h3',event.title),el('p',save.cat.name+': '+event.body));
   const claim=button(entry.claimed?'Keşif hatıralara eklendi':'Günün keşfini kaydet (+5)',()=>{if(busy)return;try{commit(L.claimEvent(save));}catch(error){showError(error.message);}},'quiet');claim.disabled=entry.claimed;panel.append(claim);
   const friend=M.CATS.find(c=>c.id===entry.friendCatId);if(friend)panel.append(el('p','Arkadaşından haber: '+friend.coat+' yavru da yeni evindeki güvenli köşeyi keşfetmiş.','daily-news'));
  }
  for(const task of L.TASKS){const item=el('div',undefined,'daily-task'),done=!!save.daily.tasks?.[day]?.[task.id],claimed=save.daily.claimed.includes('task:'+day+':'+task.id);item.append(el('h3',task.title),el('p',task.detail));
   const label=claimed?'Ödül alındı':done?task.title+' ödülünü al (+6)':'Henüz tamamlanmadı';const claim=button(label,()=>{if(busy)return;try{commit(L.claimTask(save,task.id));}catch(error){showError(error.message);}},'quiet');claim.disabled=!done||claimed;item.append(claim);panel.append(item);
  }main.append(panel);
 }

 function actorPosition(actor){return {x:parseFloat(actor.style.left)||46,y:parseFloat(actor.style.bottom)||30};}
 function stopMovement(){const point=movement.cancel();if(point&&travelActor){travelActor.style.transitionDuration='0ms';travelActor.style.left=point.x+'%';travelActor.style.bottom=point.y+'%';}travelActor=null;return point;}
 function stopAmbient(){ambientGeneration++;if(ambientTimer!==null)window.clearTimeout(ambientTimer);ambientTimer=null;if(ambientActive){stopMovement();const actor=document.getElementById('home-cat');if(actor)actor.setAttribute('data-motion','idle');}ambientActive=false;}
 function scheduleAmbient(actor,status){
  if(busy||editMode||careOpen||gameOpen||dailyOpen||memoriesOpen||houseOpen||profileOpen||document.hidden||save.story.step!=='settled')return;
  const token=ambientGeneration;
  ambientTimer=window.setTimeout(()=>{
   ambientTimer=null;if(token!==ambientGeneration||busy||document.hidden)return;
   const moment=B.choose(save,currentRoom,actorPosition(actor));if(!moment){scheduleAmbient(actor,status);return;}
   ambientActive=true;travelActor=actor;status.textContent=save.cat.name+' evde sakin bir tur atıyor.';
   movement.start(moment.path,Math.max(650,Math.min(3600,B.length(moment.path)*35)),()=>{if(token!==ambientGeneration)return;actor.setAttribute('data-motion',moment.motion);status.textContent=save.cat.name+' '+moment.text;scheduleAmbient(actor,status);});
  },7000+Math.floor(Math.random()*5000));
 }
 function moveKitten(actor,x,y,duration=1100,returnToIdle=true){
  const previous=parseFloat(actor.style.left)||46;
  actor.style.transitionDuration=duration+'ms';
  actor.style.transform='translate(-50%,10%) scaleX('+(x<previous?-1:1)+')';
  actor.style.left=x+'%';if(y!==undefined)actor.style.bottom=y+'%';actor.setAttribute('data-motion','walk');
  const generation=(actor.motionGeneration||0)+1;actor.motionGeneration=generation;
  if(returnToIdle)window.setTimeout(()=>{if(actor.motionGeneration===generation)actor.setAttribute('data-motion','idle');},duration);
 }
 function carePhase(phase){
  if(!careContext)return;const {actor,target,status,type}=careContext;
  if(phase.phase==='approach'){travelActor=actor;movement.start(careContext.path,phase.duration);status.textContent=save.cat.name+' yaklaşıyor…';}
  else{actor.style.transform='translate(-50%,10%) scaleX('+target.facing+')';actor.setAttribute('data-motion',phase.motion);
   status.textContent=save.cat.name+({food:' öğününü yiyor.',water:' suyunu içiyor.',rest:' güvenli köşesinde uyukluyor.',open:' çantanın kapısını kokluyor.',pet:' yanında dinleniyor.',scratch:' tırmalama alanını keşfediyor.',hide:' güvenli köşesini kokluyor.',clean:' temizlenen bakım alanını izliyor.',watch:' sakin bir gözlem molası veriyor.'})[type];}
 }
 function cancelCare(reason){
  stopMovement();
  if(careContext){careContext.actor.motionGeneration=(careContext.actor.motionGeneration||0)+1;careContext.actor.setAttribute('data-motion','idle');careContext.status.textContent=reason==='hidden'?'Döndüğünde birlikte devam edebilirsiniz.':'Etkileşime ara verildi.';}
  careContext=null;busy=false;
 }
 function completeAction(type,itemId){const current=save.story.step==='settled'?L.advanceNeeds(save):save,next=L.recordAction(itemId&&current.story.step==='settled'?E.use(current,itemId):M.action(current,type),type);if(!next.statistics.rooms.includes(currentRoom))next.statistics.rooms.push(currentRoom);return next;}
 function finishCare(type){
  const context=careContext;careContext=null;busy=false;
  if(!context)return;
  try{const next=completeAction(type,context.itemId);next.care.position={x:context.target.x,y:context.target.y,room:currentRoom};const ok=commit(next);
   if(ok){const status=document.querySelector('.cat-status');if(status)status.textContent=({open:'Kapı açık. İstediği zaman çıkabilir.',water:'Taze suyundan içti.',food:'Küçük öğününü yedi.',rest:'Güvenli köşesinde dinlendi. Kum alanı ayrı bir köşede hazır.',pet:'Yanında huzurlu bir an geçirdi.',scratch:'Yeni tırmalama alanını keşfetti.',hide:'Güvenli köşesine alışıyor.',clean:'Bakım alanı temizlendi.',watch:'Sakin gözlem molası iyi geldi.'})[type];}
  }catch(error){context.actor.setAttribute('data-motion','idle');showError(error.message);}
 }
 function runCare(type,target,status,itemId){
  if(busy)return;
  try{M.action(save,type);}catch(error){showError(error.message);return;}
  stopAmbient();const actor=document.getElementById('home-cat'),start=actorPosition(actor),route=save.story.step==='settled'?B.path(save,currentRoom,start,target,itemId):[start,target];
  if(!route){showError('Bu köşeye ulaşacak boş bir yol yok. Ev bölümünden eşyaları biraz açabilirsin.');return;}
  busy=true;careContext={type,target,status,itemId,actor,path:route};
  const duration=save.story.step==='settled'?Math.max(650,Math.min(3600,Math.round(B.length(route)*26))):Math.max(650,Math.min(1800,Math.round(Math.abs(target.x-start.x)*26)));
  careRunner.start(type,duration);
 }
 function pauseActivities(){
  stopAmbient();stopMovement();const wasBusy=busy;careRunner.cancel('hidden');playSession++;busy=false;
  if(wasBusy&&save){render();const status=document.querySelector('.cat-status');if(status)status.textContent='Ara verdik. Hazır olduğunda birlikte devam edebilirsiniz.';}
 }
 if(typeof document.addEventListener==='function')document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseActivities();else if(save?.story.step==='settled')render();});
 if(typeof window.addEventListener==='function')window.addEventListener('pagehide',pauseActivities);
 function startPlay(room,actor,status){
  if(busy)return;stopAmbient();try{M.action(save,'play');}catch(error){showError(error.message);return;}
  busy=true;playCount=0;lastPlayTap=0;const session=++playSession;status.textContent='Oyuncak düğmesine üç kez dokun. Her hareket arasında biraz bekle.';
  const toy=button('Oyuncağı hareket ettir',()=>{
   const now=Date.now();if(now-lastPlayTap<800)return;
   const start=stopMovement()||actorPosition(actor),x=(playCount+1)%2?72:30,target={x,y:27},route=save.story.step==='settled'?B.path(save,currentRoom,start,target):[start,target];
   if(!route){status.textContent='Bu tarafta yol kapalı. Eşyalar arasında biraz boşluk açabilirsin.';return;}
   lastPlayTap=now;playCount++;travelActor=actor;const duration=Math.max(650,Math.min(3600,B.length(route)*26));movement.start(route,duration,()=>actor.setAttribute('data-motion','idle'));toy.style.left=(playCount%2?20:60)+'%';status.textContent='Takip: '+playCount+' / 3';
   if(playCount===3){toy.disabled=true;window.setTimeout(()=>{if(session!==playSession)return;busy=false;try{commit(completeAction('play',playItemId));}catch(error){toy.remove();showError(error.message);}},duration);}
  },'toy-target');toy.setAttribute('aria-label','Oyuncağı hareket ettir');const yarn=el('canvas',undefined,'prop-art');yarn.setAttribute('aria-hidden','true');window.PatiLifeSpritePlayer?.mountProp(yarn,['yarn','mouse_toy','soft_ball'].includes(playItemId)?playItemId:'soft_ball');toy.append(yarn);room.append(toy);
  const cancel=button('Oyuna ara ver',()=>{playSession++;stopMovement();busy=false;actor.motionGeneration=(actor.motionGeneration||0)+1;actor.setAttribute('data-motion','idle');toy.remove();cancel.remove();status.textContent='Biraz dinlenebilirsiniz.';},'quiet');cancel.className+=' play-cancel';room.parent.append(cancel);
 }
 async function startAfterCloud(){if(window.CloudManager?.isNative()){await CloudManager.bootstrap();await CloudManager.whenResolved();}window.CloudManager?.bindGame();
 try{save=E.ensure(M.load(localStorage));if(save.cat&&!save.requiresLegacyIdentity&&save.story.step==='settled'){save=L.visit(save);M.persist(localStorage,save);}selected=save.draftCatId||null;render();window.PatiLifeLaunch?.finish();}catch(error){shell();showError(error.message);}}
 startAfterCloud();
})();
