/* Full-screen ads are explicit, single-flight sessions; only verified rewards pay out. */
(function(root){'use strict';
 const TEST={ios:{rewarded:'ca-app-pub-3940256099942544/1712485313',interstitial:'ca-app-pub-3940256099942544/4411468910',banner:'ca-app-pub-3940256099942544/2934735716'},android:{rewarded:'ca-app-pub-3940256099942544/5224354917',interstitial:'ca-app-pub-3940256099942544/1033173712',banner:'ca-app-pub-3940256099942544/6300978111'}};
 const FREQUENCY='patilife_ad_frequency_v1';
 function create(){let init=null,active=null,interstitialReady=false,preparing=null,completed=0,activities=0;const started=Date.now();
  const sdk=()=>root.Capacitor?.Plugins?.AdMob,platform=()=>root.Capacitor?.getPlatform?.()||'ios',config=()=>root.PatiLifeNativeConfig||{},test=()=>config().environment!=='production';
  const notice=text=>root.showBubble?.(text),valid=r=>!!r&&Number.isFinite(Number(r.amount))&&Number(r.amount)>0;
  const api={isAdShowing:false,isNativeAdMobReady:false,get IS_TEST_MODE(){return test();},get TEST_ADMOB_IDS(){return TEST[platform()]||TEST.ios;},get PROD_ADMOB_IDS(){return config().ads?.[platform()]||{};},getAdId:type=>test()?(TEST[platform()]||TEST.ios)[type]:config().ads?.[platform()]?.[type],onSuccessCallback:null};
  function bound(p,ms){return new Promise((resolve,reject)=>{const id=root.setTimeout(()=>reject(Error('Reklam hazırlanamadı.')),ms);Promise.resolve(p).then(x=>{root.clearTimeout(id);resolve(x);},e=>{root.clearTimeout(id);reject(e);});});}
  async function initialize(){if(init)return init;if(!sdk())return false;init=(async()=>{const ads=sdk();if(!ads.requestConsentInfo)throw Error('Gizlilik ayarları hazırlanamadı.');let consent=await bound(ads.requestConsentInfo(),12000);if(consent.isConsentFormAvailable&&consent.status==='REQUIRED')consent=await ads.showConsentForm();if(!consent.canRequestAds)throw Error('Reklam izni hazır değil.');await bound(ads.initialize({initializeForTesting:test(),maxAdContentRating:'General'}),12000);api.isNativeAdMobReady=true;return true;})().catch(e=>{init=null;api.isNativeAdMobReady=false;root.console?.warn('PatiLife reklam hazırlığı tamamlanamadı.',e);throw e;});return init;}
  api.initNativeAdMob=initialize;
  function frequency(){let f;try{f=JSON.parse(root.localStorage.getItem(FREQUENCY)||'null');}catch(_){}const d=new Date(),day=[d.getFullYear(),d.getMonth(),d.getDate()].join('-');return f?.day===day?f:{day,count:0,last:0};}
  function counted(){const f=frequency();f.count++;f.last=Date.now();try{root.localStorage.setItem(FREQUENCY,JSON.stringify(f));}catch(_){}}
  function blockGameplay(on){api.isAdShowing=on;root.PatiLifeAdPaused=on;const p=root.PatiLifePatileServices;if(p?.engine){if(on){p.pauseForAd?.();}else p.resumeAfterAd?.();}if(on){root.BgmEngine?.stop?.();}else if(root.document?.getElementById('screen-home')?.classList.contains('active'))root.BgmEngine?.start?.();}
  function naturalBreak(){const g=root.GameState,policy=config().interstitial||{},f=frequency();return !root.document?.hidden&&!active&&!g?.isBusy&&!g?.isSleeping&&(!g?.lifeV2||g.lifeV2.story?.step==='settled')&&Date.now()-started>=(policy.minimumSessionSeconds||300)*1000&&Date.now()-f.last>=(policy.cooldownSeconds||240)*1000&&f.count<(policy.dailyCap||6);}
  async function session(kind,{onReward,onDone}={}){if(active){onDone?.();return {shown:false,reason:'busy'};}if(!sdk()){if(kind==='rewarded')notice('Reklamlar telefon uygulamasında kullanılabilir.');onDone?.();return {shown:false,reason:'unavailable'};}const id=api.getAdId(kind);if(!id){if(kind==='rewarded')notice('Bu sürümde reklam henüz hazır değil.');onDone?.();return {shown:false,reason:'configuration'};}
   let finish,resolveOutcome;const outcome=new Promise(resolve=>resolveOutcome=resolve),flight={kind,handles:[],earned:false,paid:false,closed:false,shown:false};active=flight;api.isAdShowing=true;
   finish=async(reason)=>{if(flight.closed)return;flight.closed=true;for(const h of flight.handles)try{await h.remove();}catch(_){}let rewarded=false;try{if(kind==='rewarded'&&flight.earned&&!flight.paid){flight.paid=true;await onReward?.();rewarded=true;root.CloudManager?.saveToCloud();}}catch(e){notice('Reklam ödülü kaydedilemedi; cihazındaki oyunu kapatmadan tekrar kontrol et.');}finally{active=null;blockGameplay(false);const p=root.PatiLifePatileServices;if(p?.pendingVictoryAfterAd){p.pendingVictoryAfterAd=false;try{p.triggerVictory?.();}catch(error){root.console?.warn('Bölüm sonucu açılamadı.',error);}}try{onDone?.();}catch(error){root.console?.warn('Reklam sonrası devam işlemi tamamlanamadı.',error);}resolveOutcome({shown:flight.shown,rewarded,reason});}};
   try{if(!await initialize()){await finish('unavailable');return outcome;}blockGameplay(true);const events=kind==='rewarded'?{reward:'onRewardedVideoAdReward',shown:'onRewardedVideoAdShowed',dismissed:'onRewardedVideoAdDismissed',failed:'onRewardedVideoAdFailedToShow'}:{shown:'interstitialAdShowed',dismissed:'interstitialAdDismissed',failed:'interstitialAdFailedToShow'};
    const listen=async(name,fn)=>flight.handles.push(await sdk().addListener(name,fn));
    if(events.reward)await listen(events.reward,r=>{if(!flight.closed&&valid(r))flight.earned=true;});
    await listen(events.shown,()=>{flight.shown=true;if(kind==='interstitial')counted();});
    await listen(events.dismissed,()=>{root.setTimeout(()=>finish('dismissed'),200);});
    await listen(events.failed,()=>finish('failed'));
    const options={adId:id,isTesting:test(),npa:true,immersiveMode:true};if(kind==='rewarded')await bound(sdk().prepareRewardVideoAd(options),20000);else if(!interstitialReady)await bound(sdk().prepareInterstitial(options),20000);
    if(flight.closed)return outcome;interstitialReady=false;
    const showing=kind==='rewarded'?sdk().showRewardVideoAd({adId:id}):sdk().showInterstitial({adId:id});Promise.resolve(showing).then(result=>{if(!flight.closed&&kind==='rewarded'&&valid(result))flight.earned=true;},()=>finish('failed'));
   }catch(e){notice('Reklam şu an yüklenemiyor. Oyuna devam edebilirsin.');await finish('failed');}return outcome;
  }
  api.showRewardedAd=({onReward}={})=>session('rewarded',{onReward});
  api.showInterstitialAd=onDone=>naturalBreak()?session('interstitial',{onDone}):(onDone?.(),Promise.resolve({shown:false,reason:'frequency'}));
  api.preloadInterstitial=async()=>{if(preparing||interstitialReady||!sdk()||!api.isNativeAdMobReady)return;const id=api.getAdId('interstitial');if(!id)return;preparing=bound(sdk().prepareInterstitial({adId:id,isTesting:test(),npa:true}),20000).then(()=>{interstitialReady=true;}).catch(()=>{interstitialReady=false;}).finally(()=>{preparing=null;});return preparing;};
  api.triggerSmartInterstitial=(source,onDone)=>/^(Suika Seviye|Patile Cikis|GameOver Retry|GameOver Map|Lazer Avi Bitisi|Mini Oyun Bitisi|Tamamlanan Bakim)/.test(source)?api.showInterstitialAd(onDone):(onDone?.(),Promise.resolve({shown:false,reason:'not_a_break'}));
  api.trackSuikaLevelComplete=(level,onContinue)=>{completed++;if(completed>=(config().interstitial?.levelsBetween||4)){completed=0;return api.triggerSmartInterstitial('Suika Seviye '+level,onContinue);}onContinue?.();return Promise.resolve({shown:false});};
  api.trackRoomChange=()=>{};api.trackPatiLifeActivity=()=>{activities++;if(activities<4)return Promise.resolve({shown:false,reason:'frequency'});return api.triggerSmartInterstitial('Tamamlanan Bakim').then(result=>{if(result.shown)activities=0;return result;});};
  api.showBannerAd=async()=>false;api.hideBannerAd=async()=>{try{await sdk()?.hideBanner();}catch(_){}};
  api.showPrivacyOptions=async()=>{if(!sdk())return notice('Gizlilik seçenekleri telefon uygulamasında kullanılabilir.');try{await sdk().showPrivacyOptionsForm();init=null;api.isNativeAdMobReady=false;}catch(error){notice('Gizlilik tercihleri şu an açılamıyor. Daha sonra yeniden deneyebilirsin.');}};
  api.onAdCompleted=()=>{};
  api._naturalBreak=naturalBreak;
  return api;
 }
 root.PatiLifeAds={create};
})(window);
