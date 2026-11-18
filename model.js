// Model selection shared by the dashboard and the teardown.
// Loads in <head> without defer so data-model is set before first paint.
// The choice comes from ?model= in the address, then from this browser's saved choice, then the default.
// IDs must match data/models.json (checked by tests/validate-models.mjs).
(function(){
'use strict';
var MODELS=[
 {id:'t120-2018',short:'T120',years:'2018',engine:'1200 cc liquid-cooled'},
 {id:'bonneville-a3',short:'Bonneville',years:'2014–2016',engine:'865 cc air-cooled'},
 {id:'bonneville-t100-a3',short:'T100',years:'2014–2016',engine:'865 cc air-cooled'}
];
var KEY='t120-model',DEF='t120-2018';
var valid=function(v){return MODELS.some(function(m){return m.id===v})};
var fromUrl=null;try{fromUrl=new URLSearchParams(location.search).get('model')}catch(e){}
var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
var id=valid(fromUrl)?fromUrl:valid(saved)?saved:DEF;
if(valid(fromUrl)){try{localStorage.setItem(KEY,fromUrl)}catch(e){}}
document.documentElement.setAttribute('data-model',id);

function hrefFor(page,m){return m===DEF?page:page+'?model='+encodeURIComponent(m)}
function choose(m){
 if(!valid(m)||m===id)return;
 try{localStorage.setItem(KEY,m)}catch(e){}
 var u=new URL(location.href);if(m===DEF)u.searchParams.delete('model');else u.searchParams.set('model',m);
 location.assign(u.pathname+u.search+u.hash);
}
function mount(){
 // Keep the choice when moving between the two model-aware pages.
 document.querySelectorAll('a[href="index.html"],a[href="exploded.html"],a[href^="index.html#"]').forEach(function(a){
  var h=a.getAttribute('href'),hash='';var i=h.indexOf('#');if(i>=0){hash=h.slice(i);h=h.slice(0,i)}
  a.setAttribute('href',hrefFor(h,id)+hash);
 });
 var host=document.getElementById('modelSwitch');if(!host)return;
 host.replaceChildren();
 MODELS.forEach(function(m){
  var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');
  b.setAttribute('aria-checked',String(m.id===id));b.tabIndex=m.id===id?0:-1;b.dataset.model=m.id;
  var n=document.createElement('b');n.textContent=m.short;var s=document.createElement('small');
  var y=document.createElement('span');y.textContent=m.years;var e=document.createElement('span');e.className='eng';e.textContent=', '+m.engine;s.append(y,e);
  b.append(n,s);b.addEventListener('click',function(){choose(m.id)});host.append(b);
 });
 host.addEventListener('keydown',function(e){
  if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].indexOf(e.key)<0)return;e.preventDefault();
  var bs=[].slice.call(host.querySelectorAll('button')),i=bs.indexOf(document.activeElement);if(i<0)i=bs.findIndex(function(b){return b.dataset.model===id});
  var n=bs[(i+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+bs.length)%bs.length];n.focus();
 });
}
window.BonnevilleModel={id:id,isDefault:id===DEF,models:MODELS,choose:choose,hrefFor:hrefFor};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
