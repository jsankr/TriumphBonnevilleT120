// Rider tricks for the 2018 T120, from data/rider-tips.json. Each card names its source and page.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:'#'}catch{return '#'}};
if(!$('tipList'))return;
if(window.BonnevilleModel&&window.BonnevilleModel.id!=='t120-2018')return;
let data=null,group='all';
function badge(key,pages){
 const s=data.sources[key];if(!s)return '';
 const cls=s.tier==='triumph'?'manual':'owner';
 return `<a class="ev ${cls}" href="${esc(safe(s.url))}" target="_blank" rel="noopener noreferrer" title="${esc(s.title)}">${esc(s.short)}${pages?`, p. ${esc(pages)}`:''}</a>`;
}
function render(){
 $('tipFilters').innerHTML=[{id:'all',title:'All'}].concat(data.groups).map(g=>{const n=g.id==='all'?data.tips.length:data.tips.filter(t=>t.group===g.id).length;
  return `<button type="button" data-group="${esc(g.id)}" aria-pressed="${g.id===group}" class="${g.id===group?'active':''}">${esc(g.title)} <span class="tnum">${n}</span></button>`}).join('');
 $('tipFilters').querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.group;render()}));
 const list=data.tips.filter(t=>group==='all'||t.group===group);
 const gname=id=>(data.groups.find(g=>g.id===id)||{}).title||'';
 $('tipList').innerHTML=list.map(t=>`<details class="tip" id="tip-${esc(t.id)}">
  <summary><span class="tip-group">${esc(gname(t.group))}${t.ifFitted?'<span class="tip-flag">If fitted</span>':''}</span><span class="tip-title">${esc(t.title)}</span></summary>
  <div class="tip-body"><p>${esc(t.why)}</p>
  ${t.steps&&t.steps.length?`<ol class="tip-steps">${t.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:''}
  ${t.caution?`<p class="tip-caution"><strong>Watch out.</strong> ${esc(t.caution)}</p>`:''}
  <p class="tip-src">${badge(t.source,t.pages)}${t.alsoSource?' '+badge(t.alsoSource,null):''}</p></div></details>`).join('');
}
fetch('data/rider-tips.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{
 data=d;render();
 $('tipSource').textContent="Page numbers refer to Triumph's owner's handbook 3855663-EN, which Triumph's handbook service lists for the 2018 T120. Check your own handbook if your motorcycle's equipment differs.";
}).catch(e=>{$('tipList').textContent='Rider tricks unavailable: '+e.message});
})();
