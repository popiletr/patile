/* Comic scenes and first-day teaching use real main-game actions, never fake rewards. */
(function(root){
 'use strict';
 const STORY=[
  {panel:0,title:'Yağmurun içinden bir ses',dialogue:'Bir ses duydunuz mu?',text:'Dört arkadaş eve doğru yürürken dükkânın saçağından ince bir miyavlama duyuyoruz.'},
  {panel:1,title:'Dört küçük hayat',dialogue:'Burada dört yavru var!',text:'Sarman, tekir, smokin ve calico… Hepsi kuru kutuda birbirine sokulmuş. Onları burada bırakmayacağız.'},
  {panel:2,title:'Hiçbiri geride kalmadı',dialogue:'Hepinize bir yuva var.',text:'Her birimiz bir yavruyu kucağımıza alıyoruz. Dördü de güvenli bir eve gidiyor; bir arkadaşın da seninle geliyor.'},
  {panel:3,title:'İlk kez evimizde',dialogue:'Acele etmene gerek yok.',text:'Taşıma çantasını sessiz bir köşeye koyuyoruz. Kapısını açıp geri çekiliyor, dışarı çıkmayı onun seçmesini bekliyoruz.'},
  {panel:4,title:'Küçük bir öğün, taze su',dialogue:'Burası senin güvenli yerin.',text:'Mama ve suyu temiz, ulaşılabilir bir zemine bırakıyoruz. Birlikte ilgilendikçe hem ihtiyaçlarını hem sevdiklerini öğreneceğiz.'},
  {panel:5,title:'Artık birlikte bir evimiz var',dialogue:'Oyun da var, dinlenmek de.',text:'Bir yatak, tırmalama köşesi ve küçük oyunlar… Güven büyüdükçe evimizde yeni odalar ve yeni anılar açılacak.'}
 ];
 const STEPS=[
  {panel:3,title:'Önce biraz zaman',text:'Taşıma çantasını sessiz bir köşeye bıraktık. Kapısını açıp biraz uzaklaşalım; evini kendi hızında tanısın.',button:'Kapıyı aç ve bekle'},
  {panel:4,title:'Önce taze su',text:'Bakım menüsündeki Su düğmesi ürünleri açar. Normal su ücretsizdir. Birini seç; kedin sebile yürüyüp içsin.',button:'Suyunu hazırlayalım',action:'waterAction'},
  {panel:4,title:'İlk küçük öğün',text:'Mama menüsünde fiyat, doyurma miktarı ve tüketim süresi yazıyor. İlk öğün için normal mama yeterli; kedin kabına gidip yedikten sonra tokluk artar.',button:'Mama kabına geçelim',action:'foodAction'},
  {panel:5,title:'Kendine ait güvenli köşe',text:'Küçük yatağını gösterelim. Uyurken enerji toplar; dinlenmesi bitince yeniden birlikte oynayabiliriz.',button:'Yatağını göster',action:'restAction'},
  {panel:5,title:'Yanında güvende',text:'Sev düğmesiyle sakin bir an paylaş. Gözlerini kapatıp başını uzatması sana alıştığını gösterir. Biraz zaman tanımak da bakımın parçası.',button:'Biraz sevelim',action:'petAction'},
  {panel:5,title:'İlk oyunumuz',text:'Oyun menüsündeki yumağı 30 saniye birlikte takip edin. Yumağı sürükleyebilirsin; en az üç pati dokunuşuyla oyunu tamamlayalım.',button:'Yumağı çıkar',action:'playAction'},
  {panel:5,title:'Evini birlikte keşfet',text:'Odayı sağa ve sola sürükleyerek gez. Üstten oda seçebilir, Bakım ve Oyun kulakçıklarını açıp kapatabilirsin. Başarımlar yeni odalara kapı açacak.',button:'Evimizde keşfe çıkalım'}
 ];
 const EXPECTED=[null,'water','food','rest','pet','play',null];let lesson=null,waiting=null;
 function element(tag,text,cls){const node=root.document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;}
 function close(){root.document.getElementById('journey-overlay')?.remove();}
 function comicArt(panel,game){const art=element('div',undefined,'comic-art');art.style.backgroundPosition=(panel%2?100:0)+'% '+(Math.floor(panel/2)*50)+'%';art.setAttribute('role','img');art.setAttribute('aria-label',STORY[panel].title);if(panel>=4&&game?.lifeV2){const cat=element('canvas',undefined,'comic-cat');art.append(cat);root.requestAnimationFrame?.(()=>root.PatiLifeRuntime.catPortrait(cat,game));}return art;}
 function frame({panel,title,text,dialogue,game,kicker,primary,onPrimary,secondary='Kapat',onSecondary=close}){close();const layer=element('div',undefined,'journey-overlay');layer.id='journey-overlay';const card=element('section',undefined,'comic-page');card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');card.setAttribute('aria-label',title);card.append(element('span',kicker||'BİRLİKTE BİR HİKÂYE','comic-kicker'));const art=comicArt(panel,game);if(dialogue)art.append(element('span',dialogue,'comic-dialogue'));card.append(art,element('h2',title),element('p',text));const controls=element('div',undefined,'comic-controls');for(const [label,fn,cls] of [[secondary,onSecondary,'comic-quiet'],[primary,onPrimary,'comic-next']]){const button=element('button',label,cls);button.type='button';button.onclick=fn;controls.append(button);}card.append(controls);layer.append(card);root.document.body.append(layer);}
 function story(game,index=0){const scene=STORY[index];frame({...scene,game,text:index===2?scene.text.replace('bir arkadaşın da seninle geliyor',game.catName+' seninle geliyor'):scene.text,kicker:'HİKÂYEMİZ · '+(index+1)+' / '+STORY.length,primary:index===5?'Evimize dön':'Sonraki sahne',onPrimary:()=>index===5?close():story(game,index+1),secondary:index?'Önceki sahne':'Kapat',onSecondary:()=>index?story(game,index-1):close()});}
 function hint(text){let box=root.document.getElementById('first-day-hint');if(!box){box=element('div',undefined,'first-day-hint');box.id='first-day-hint';box.setAttribute('role','status');(root.PatiLifeRuntime.notificationHost?.()||root.document.querySelector('.mobile-game-container')).append(box);}box.textContent=text;box.hidden=!!root.document.getElementById('game-toast')&&!root.document.getElementById('game-toast').hidden;}
 function showLesson(){if(!lesson)return;const {game,api}=lesson,t=game.lifeV2.care.tutorial;if(!t.active||t.completed)return;const step=STEPS[t.step];frame({...step,game,kicker:'EVDE İLK GÜN · '+(t.step+1)+' / '+STEPS.length,primary:step.button,onPrimary:()=>{
   const t=game.lifeV2.care.tutorial;close();if(t.step===0){t.step=1;api.save();showLesson();return;}
   if(t.step===6){t.completed=true;t.active=false;api.save();root.document.getElementById('first-day-hint')?.remove();root.PatiLifeRuntime.setDock('closed',false);api.onDone();return;}
   root.PatiLifeRuntime.setDock(t.step===5?'play':'care',true);hint(t.step===3?'Biraz dinlensin; uyanınca devam edeceğiz.':step.title+' · Bakımını birlikte tamamlayalım.');api[step.action]?.();
  },secondary:'Daha sonra',onSecondary:()=>{game.lifeV2.care.tutorial.active=false;api.save();close();root.document.getElementById('first-day-hint')?.remove();}});}
 function tutorial(game,api){if(waiting)root.clearTimeout(waiting);waiting=null;lesson={game,api};showLesson();}
 function advance(t,type){if(!t?.active||t.completed||EXPECTED[t.step]!==type)return null;return {...t,step:t.step+1};}
 function record(type,game){const next=advance(game.lifeV2?.care.tutorial,type);if(!next)return;game.lifeV2.care.tutorial=next;lesson?.api.save();if(waiting)root.clearTimeout(waiting);const show=()=>{if(!lesson||!game.lifeV2.care.tutorial.active)return;if(root.document.hidden||game.isBusy||game.isSleeping){waiting=root.setTimeout(show,800);return;}root.document.getElementById('first-day-hint')?.remove();showLesson();};waiting=root.setTimeout(show,1500);}
 const api={STORY,STEPS,advance,story,tutorial,record};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeJourney=api;
})(typeof window!=='undefined'?window:globalThis);
