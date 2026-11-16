// Dashboard widgets built only from data/source-reference.json:
// handbook figures (t120OwnerSpecs) and Triumph's scheduled maintenance table (scheduledMaintenance).
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SERVICES=[
 {key:'day',label:'Daily',sub:'Before riding',test:r=>r.frequencyText==='Day'},
 {key:'service800km',label:'First service',sub:'800 km or 1 month'},
 {key:'annual',label:'Annual',sub:'Every year'},
 {key:'service16000_48000km',label:'16,000 and 48,000 km',sub:'Mileage service'},
 {key:'service32000km',label:'32,000 km',sub:'Mileage service'},
 {key:'service64000km',label:'64,000 km',sub:'Mileage service'}
];
const COLS=SERVICES.slice(1);
const GROUPS=[
 {title:'Engine oil',names:['Engine oil grade','Engine oil/filter change','Engine oil change only','Engine oil dry fill']},
 {title:'Cooling',names:['Coolant type','Coolant capacity','Thermostat opens']},
 {title:'Ignition and fuel',names:['Spark plug','Spark plug gap','Fuel grade','Fuel tank capacity']},
 {title:'Tyres',names:['Front tyre size','Rear tyre size','Front cold tyre pressure','Rear cold tyre pressure']},
 {title:'Chain, brakes and battery',names:['Factory chain','Final drive ratio','Brake fluid','Battery type']}
];
const HERO=['Displacement','Bore × stroke','Compression ratio','Fuel tank capacity'];
let rows=[],active='service16000_48000km';
const includes=(r,s)=>s.test?s.test(r):r[s.key]===true;

function renderSpecs(specs){
 const by=new Map(specs.map(s=>[s.name,s]));
 $('heroFacts').innerHTML=HERO.map(n=>by.get(n)).filter(Boolean).map(s=>`<div><dt>${esc(s.name)}</dt><dd>${esc(s.value)}</dd></div>`).join('');
 $('keySpecs').innerHTML=GROUPS.map(g=>{
  const items=g.names.map(n=>by.get(n)).filter(Boolean);if(!items.length)return '';
  return `<article class="spec-card glass"><h3>${esc(g.title)}</h3><dl>${items.map(s=>`<div><dt>${esc(s.name)}</dt><dd>${esc(s.value)}<small>Handbook p.${esc(s.page)}</small></dd></div>`).join('')}</dl></article>`;
 }).join('')||'<p class="muted">No handbook figures found in the data file.</p>';
}
function renderTabs(){
 $('plannerTabs').innerHTML=SERVICES.map(s=>{const n=rows.filter(r=>includes(r,s)).length;const on=s.key===active;
  return `<button type="button" role="tab" aria-selected="${on}" class="${on?'active':''}" data-service="${s.key}"><b>${esc(s.label)}</b><small>${esc(s.sub)}, ${n} tasks</small></button>`}).join('');
 $('plannerTabs').querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.service;render()}));
}
function renderMatrix(){
 const cats=[...new Set(rows.map(r=>r.category))];
 const head=`<thead><tr><th scope="col">Task</th>${COLS.map(c=>`<th scope="col" class="${c.key===active?'on':''}"><button type="button" data-service="${c.key}">${esc(c.label)}</button></th>`).join('')}</tr></thead>`;
 const body=cats.map(cat=>`<tbody><tr class="cat"><th colspan="${COLS.length+1}" scope="rowgroup">${esc(cat)}</th></tr>${rows.filter(r=>r.category===cat).map(r=>`<tr class="${SERVICES.find(s=>s.key===active)&&includes(r,SERVICES.find(s=>s.key===active))?'due':''}"><th scope="row">${esc(r.task)}</th>${COLS.map(c=>`<td class="${c.key===active?'on':''}">${r[c.key]?'<span class="dot yes" title="Included"></span><span class="sr-only">Included</span>':'<span class="dot no" title="Not included"></span><span class="sr-only">Not included</span>'}</td>`).join('')}</tr>`).join('')}</tbody>`).join('');
 $('plannerMatrix').innerHTML=`<table class="matrix-table"><caption class="sr-only">Scheduled maintenance tasks by service. A filled dot means the task is part of that service.</caption>${head}${body}</table>`;
 $('plannerMatrix').querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.service;render()}));
}
function renderList(){
 const s=SERVICES.find(x=>x.key===active);const due=rows.filter(r=>includes(r,s));
 const cats=[...new Set(due.map(r=>r.category))];
 $('plannerList').innerHTML=`<h3>${esc(s.label)}<span>${due.length} of ${rows.length} tasks</span></h3>`+cats.map(c=>`<div class="due-group"><h4>${esc(c)}</h4><ul>${due.filter(r=>r.category===c).map(r=>`<li><span>${esc(r.task)}</span>${r.frequencyText&&r.frequencyText!=='-'&&r.frequencyText!=='Day'?`<small>${esc(r.frequencyText)}</small>`:''}<small>Manual p.${esc(r.page)}</small></li>`).join('')}</ul></div>`).join('');
}
function render(){renderTabs();renderMatrix();renderList()}
fetch('data/source-reference.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{
 renderSpecs(Array.isArray(d.t120OwnerSpecs)?d.t120OwnerSpecs:[]);
 rows=Array.isArray(d.scheduledMaintenance)?d.scheduledMaintenance:[];
 $('plannerNotes').textContent=(d.maintenanceFootnotes||[]).join(' ');
 if(rows.length)render();else $('plannerList').textContent='No schedule rows found in the data file.';
}).catch(e=>{$('keySpecs').innerHTML='<p class="muted">Figures unavailable: serve the site over HTTP. '+esc(e.message)+'</p>';$('plannerList').textContent='Schedule unavailable.'});
})();
