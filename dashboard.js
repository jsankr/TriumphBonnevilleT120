// Dashboard widgets built only from data/source-reference.json:
// handbook figures (t120OwnerSpecs) and Triumph's scheduled maintenance table (scheduledMaintenance).
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MODEL=(window.BonnevilleModel&&window.BonnevilleModel.id)||'t120-2018';
let SERVICES=[
 {key:'day',label:'Daily',sub:'Before riding',test:r=>r.frequencyText==='Day'},
 {key:'service800km',label:'First service',sub:'800 km or 1 month'},
 {key:'annual',label:'Annual',sub:'Every year'},
 {key:'service16000_48000km',label:'16,000 and 48,000 km',sub:'Mileage service'},
 {key:'service32000km',label:'32,000 km',sub:'Mileage service'},
 {key:'service64000km',label:'64,000 km',sub:'Mileage service'}
];
let COLS=SERVICES.slice(1);
let GROUPS=[
 {title:'Engine oil',names:['Engine oil grade','Engine oil/filter change','Engine oil change only','Engine oil dry fill']},
 {title:'Cooling',names:['Coolant type','Coolant capacity','Thermostat opens']},
 {title:'Ignition and fuel',names:['Spark plug','Spark plug gap','Fuel grade','Fuel tank capacity']},
 {title:'Tyres',names:['Front tyre size','Rear tyre size','Front cold tyre pressure','Rear cold tyre pressure']},
 {title:'Chain, brakes and battery',names:['Factory chain','Final drive ratio','Brake fluid','Battery type']}
];
const HERO=['Displacement','Bore × stroke','Compression ratio','Fuel tank capacity'];
let rows=[],active='service16000_48000km';
const includes=(r,s)=>s.test?s.test(r):r[s.key]===true;
let pageLabel='Manual p.';

function renderSpecs(specs){
 const by=new Map(specs.map(s=>[s.name,s]));
 $('heroFacts').innerHTML=HERO.map(n=>by.get(n)).filter(Boolean).map(s=>`<div><dt>${esc(s.name)}</dt><dd>${esc(s.value)}</dd></div>`).join('');
 $('keySpecs').innerHTML=GROUPS.map(g=>{
  const items=g.names.map(n=>by.get(n)).filter(Boolean);if(!items.length)return '';
  return `<article class="spec-card glass"><h3>${esc(g.title)}</h3><dl>${items.map(s=>`<div><dt>${esc(s.name)}</dt><dd>${esc(s.value)}<small>Handbook p.${esc(s.page)}${s.source&&s.source!=='handbook'?' ('+esc(s.source)+')':''}</small></dd></div>`).join('')}</dl></article>`;
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
 $('plannerList').innerHTML=`<h3>${esc(s.label)}<span>${due.length} of ${rows.length} tasks</span></h3>`+cats.map(c=>`<div class="due-group"><h4>${esc(c)}</h4><ul>${due.filter(r=>r.category===c).map(r=>`<li><span>${esc(r.task)}</span>${r.frequencyText&&r.frequencyText!=='-'&&r.frequencyText!=='Day'?`<small>${esc(r.frequencyText)}</small>`:''}<small>${pageLabel}${esc(r.page)}</small></li>`).join('')}</ul></div>`).join('');
}
function render(){renderTabs();renderMatrix();renderList()}
const getJSON=u=>fetch(u,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()});
const TIER={triumph:['manual','Triumph document'],aftermarket:['aftermarket','Aftermarket manual'],forum:['owner','Owner forum']};
function setText(id,t){const n=$(id);if(n)n.textContent=t}
function renderModel(m){
 const v=m.map?.views?.[m.map.viewOrder?.[0]];
 document.title=`${m.name} ${m.years} workshop explorer`;
 const wm=document.querySelector('.site-top .wordmark');if(wm){wm.querySelector('b').textContent=m.name;wm.querySelector('span').textContent=`${m.years} workshop explorer`}
 setText('heroTitle',m.name);
 setText('heroKicker',`${m.years}, ${m.family}`);
 setText('heroLede',`Teardown, torque values, tool sizes and Triumph's service schedule for the ${m.years} ${m.name}, each with its source. Where no source exists, it says so.`);
 if(v){const img=$('heroImg');img.src=v.hero;img.alt=v.alt;img.width=1020;img.height=607;
  const c=v.credit;$('heroCredit').innerHTML=`Photo: ${esc(c.author)}, <a href="${esc(c.source)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>, <a href="${esc(c.licenceUrl)}" target="_blank" rel="noopener noreferrer">${esc(c.licence)}</a>. ${esc(v.subject)}. ${esc(v.relevance)} Cropped.`;}
 setText('specsNote',`From the ${m.handbookColumn} column of Triumph's January 2015 owner's handbook (3851861-IN).`);
 setText('plannerIntro',`Triumph's scheduled maintenance chart, owner's handbook pages ${m.maintenance.pages}. Pick a service to see what it includes.`);
 pageLabel='Handbook p.';
 SERVICES=m.maintenance.services.map(s=>s.daily?{...s,test:r=>r.frequencyText==='Day'}:s);COLS=SERVICES.slice(1);
 active=COLS[1].key;
 const gs=m.specGroups||[];GROUPS=gs.map(g=>({title:g,names:m.specs.filter(x=>x.group===g).map(x=>x.name)}));
 renderTorque(m);
}
function renderTorque(m){
 const rows=[];for(const a of m.assemblies)for(const o of a.operations)rows.push({a,o});
 const order={triumph:0,aftermarket:1,forum:2};
 rows.sort((x,y)=>(order[m.sources[x.o.source]?.tier]??9)-(order[m.sources[y.o.source]?.tier]??9));
 const counts={};rows.forEach(r=>{const t=m.sources[r.o.source]?.tier;counts[t]=(counts[t]||0)+1});
 $('modelTorqueNote').textContent=`${rows.length} values across ${m.assemblies.length} assemblies: ${counts.triumph||0} from Triumph documents, ${counts.aftermarket||0} from the aftermarket Haynes manual${counts.forum?`, ${counts.forum} from owner posts`:''}. ${m.notice}`;
 $('modelTorqueTable').innerHTML=`<table class="mt-table"><caption class="sr-only">Torque values for the ${esc(m.name)}, with source</caption><thead><tr><th scope="col">Fastener</th><th scope="col">Assembly</th><th scope="col" class="num">Nm</th><th scope="col">Source</th></tr></thead><tbody>${rows.map(({a,o})=>{const s=m.sources[o.source]||{};const [cls]=TIER[s.tier]||['none'];
  const alts=(o.alternatives||[]).map(x=>`${esc(x.torqueNm)} Nm, ${esc(m.sources[x.source]?.short||x.source)}${x.note?': '+esc(x.note):''}`).join('; ');
  return `<tr><th scope="row">${esc(o.label)}${o.note?`<small>${esc(o.note)}</small>`:''}${alts?`<small class="alt">Other figures: ${alts}</small>`:''}</th><td>${esc(a.title)}</td><td class="num tnum">${esc(o.torqueNm)}</td><td><span class="ev ${cls}">${esc(s.short||o.source)}${o.page?', p.'+esc(o.page):''}</span></td></tr>`}).join('')}</tbody></table>`;
 $('modelSources').innerHTML=Object.values(m.sources).map(s=>{const [cls,label]=TIER[s.tier]||['none','Source'];return `<li><span class="ev ${cls}">${esc(label)}</span><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`}).join('');
}
(MODEL==='t120-2018'?getJSON('data/source-reference.json'):getJSON('data/models.json').then(reg=>{const e=(reg.models||[]).find(x=>x.id===MODEL);if(!e||!/^data\/models\/[a-z0-9-]+\.json$/.test(e.data||''))throw Error('Unknown model');return getJSON(e.data)}).then(m=>{renderModel(m);return {t120OwnerSpecs:m.specs,scheduledMaintenance:m.maintenance.rows,maintenanceFootnotes:m.maintenance.notes}})).then(d=>{
 renderSpecs(Array.isArray(d.t120OwnerSpecs)?d.t120OwnerSpecs:[]);
 rows=Array.isArray(d.scheduledMaintenance)?d.scheduledMaintenance:[];
 $('plannerNotes').textContent=(d.maintenanceFootnotes||[]).join(' ');
 if(rows.length)render();else $('plannerList').textContent='No schedule rows found in the data file.';
}).catch(e=>{$('keySpecs').innerHTML='<p class="muted">Figures unavailable: serve the site over HTTP. '+esc(e.message)+'</p>';$('plannerList').textContent='Schedule unavailable.'});
})();
