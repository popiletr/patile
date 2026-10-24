/* Contact is the front lip at the actual foot x, never the polygon's centre height. */
(function(root){
 'use strict';
 function standable(poly){if(!poly?.points?.length||poly.category?.startsWith('hunt'))return false;if(poly.category==='floor')return true;const xs=poly.points.map(p=>p.x),ys=poly.points.map(p=>p.y);return !(Math.max(...ys)-Math.min(...ys)>140&&Math.max(...xs)-Math.min(...xs)<110);}
 function contact(poly,x){if(!standable(poly))return null;const values=[],points=poly.points;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(x<Math.min(a.x,b.x)||x>Math.max(a.x,b.x))continue;if(a.x===b.x){values.push(768-a.y,768-b.y);continue;}const t=(x-a.x)/(b.x-a.x);values.push(768-(a.y+(b.y-a.y)*t));}return values.length?Math.min(...values)+3:null;}
 const api={contact,standable};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatiLifeSurfaces=api;
})(typeof window!=='undefined'?window:globalThis);
