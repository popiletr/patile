/* Shared branded launch, never an input-blocking or indefinite loading screen. */
(function(root){'use strict';const started=Date.now();let layer,finished=false;
function mount(){if(layer||finished)return;layer=root.document.createElement('div');layer.className='patilife-launch';layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');const sprite=root.document.createElement('div');sprite.className='patilife-launch-sprite';sprite.setAttribute('aria-hidden','true');const title=root.document.createElement('h1');title.textContent='PatiLife';const caption=root.document.createElement('p');caption.textContent='Küçük patiler, sıcacık bir yuva.';layer.append(sprite,title,caption);root.document.body.append(layer);}
function finish(){if(finished)return;finished=true;root.setTimeout(()=>{layer?.classList.add('is-done');root.setTimeout(()=>layer?.remove(),260);},Math.max(0,650-(Date.now()-started)));}
root.PatiLifeLaunch={finish};if(root.document.body)mount();else root.document.addEventListener('DOMContentLoaded',mount,{once:true});root.setTimeout(finish,8000);
})(window);
