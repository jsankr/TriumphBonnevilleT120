// Teardown on real, openly licensed photographs of the T120.
// Data: data/exploded-2018.json (2018 catalogue callouts, 2016 manual torques),
// data/teardown-map.json (where each assembly and callout sits on the photos, and which torque row belongs to which callout),
// data/tool-size-reports.json (owner-reported hand-tool sizes), data/source-reference.json (manual torque table).
// Other models (data/models.json) load one file, data/models/<id>.json, with the same assembly and map schema;
// each torque operation there names its source in M.sources.
// Nothing here invents a value: a field without a source is shown as not published.
'use strict';
const MODEL=(window.BonnevilleModel&&window.BonnevilleModel.id)||'t120-2018';
let M=null; // model file for non-T120 models
const isT120=()=>!M;
const catLabel=()=>M?M.catalogueLabel:'2018 Bonneville T120';
const TABS=[['tabExploded'],['tabLeft'],['tabBike']];
let tabViews=['cranberry','left','right'];
const TIER={triumph:['manual','Triumph'],aftermarket:['aftermarket','Aftermarket'],forum:['owner','Owner forum']};
function srcBadge(key,page){
 if(!M){return `<span class="ev manual">Service manual 2016, page ${esc(page)}</span>`}
 const s=M.sources?.[key];if(!s)return '<span class="ev none">Source missing</span>';
 const [cls]=TIER[s.tier]||['none'];
 return `<a class="ev ${cls}" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer" title="${esc(s.title)}">${esc(s.short)}${page?`, page ${esc(page)}`:''}</a>`;
}
function altLines(o){return (o.alternatives||[]).map(a=>`<span class="src-alt">Also ${esc(a.torqueNm)} Nm, ${esc(M?.sources?.[a.source]?.short||a.source)}${a.note?': '+esc(a.note):''}</span>`).join('')}
const $=id=>document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const safeUrl=input=>{try{const u=new URL(String(input));return u.protocol==='https:'?u.href:'catalogue.html'}catch{return 'catalogue.html'}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const zones={front:['front-forks','front-wheel','front-brakes'],rear:['rear-shocks','rear-brakes','rear-wheel'],engine:['cooling','engine-covers']};
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

let source=null,map=null,tools={reports:[]},manual={torqueSettings:[]};
let assembly=null,selectedCallout=null,query='',zone='all',view='left',t=0,focus=false,anim=null,vbAnim=null;
let currentVB=null;

const groups=a=>{const o=new Map();for(const p of a.parts){if(!o.has(p.callout))o.set(p.callout,[]);o.get(p.callout).push(p)}return [...o.entries()].map(([number,variants])=>({number,variants,primary:variants[0]}))};
const displayed=()=>!assembly?[]:groups(assembly).filter(g=>!query||g.variants.some(p=>[p.name,p.partNumber,p.fitmentNote,g.number].join(' ').toLowerCase().includes(query.toLowerCase())));
const pinsFor=(id,callout)=>(map?.pins||[]).filter(p=>p.assembly===id&&(callout==null||p.callout===callout));
const linksFor=(id,callout)=>(map?.calloutLinks?.[id]?.[callout])||[];
const reportsFor=(id,callout)=>(tools.reports||[]).filter(r=>r.assembly===id&&r.callout===callout);
const placement=(id,v)=>(map?.placements||[]).find(p=>p.assembly===id&&p.view===v);
const threadFrom=name=>(String(name).match(/M\d+(?:\.\d+)?(?:[×x]\d+(?:\.\d+)?)*/i)||[])[0]||null;
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const el=(tag,attrs={},parent)=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(parent)parent.append(n);return n};

/* ---------- Photo stage ---------- */
function frameOf(v){const f=map.views[v].frame;return {x:f[0],y:f[1],w:f[2]-f[0],h:f[3]-f[1]}}
function buildStage(){
 const svg=$('photo');svg.replaceChildren();
 if(!map||!map.views[view]){svg.innerHTML='';$('stageHint').textContent='Photograph map unavailable. The parts list and torque data still work.';return}
 const V=map.views[view],F=frameOf(view);
 $('stage').style.aspectRatio=`${F.w} / ${F.h}`;
 currentVB=focus?focusBox():F;setVB(currentVB);
 svg.setAttribute('preserveAspectRatio','xMidYMid meet');
 const defs=el('defs',{},svg);
 const sh=el('filter',{id:'lift',x:'-20%',y:'-20%',width:'140%',height:'150%'},defs);
 el('feDropShadow',{dx:'0',dy:'26',stdDeviation:'20','flood-color':'#000','flood-opacity':'.6'},sh);
 const place=(map.placements||[]).map((p,i)=>({...p,i})).filter(p=>p.view===view).sort((a,b)=>a.layer-b.layer);
 const base=el('image',{href:V.image,x:0,y:0,width:V.width,height:V.height,class:'base',preserveAspectRatio:'none'},svg);
 base.setAttribute('aria-hidden','true');
 const sockets=el('g',{class:'sockets','aria-hidden':'true'},svg);
 for(const p of place){if(p.lift[0]||p.lift[1])el('path',{d:p.shape,class:'socket','data-socket':p.i,opacity:0},sockets)}
 for(const p of place){
  const m=el('mask',{id:'m'+p.i,maskUnits:'userSpaceOnUse',x:F.x-400,y:F.y-400,width:F.w+800,height:F.h+800},defs);
  el('path',{d:p.shape,fill:'#fff'},m);
  for(const q of place)if(q.layer>p.layer)el('path',{d:q.shape,fill:'#000'},m);
  const a=source.assemblies.find(x=>x.id===p.assembly);
  const g=el('g',{class:'piece','data-assembly':p.assembly,'data-i':p.i,tabindex:'0',role:'button','aria-label':`${a?.title||p.assembly}${p.label?', '+p.label:''}`},svg);
  el('title',{},g).textContent=(a?.title||p.assembly)+(p.label?' — '+p.label:'');
  el('image',{href:V.image,x:0,y:0,width:V.width,height:V.height,mask:`url(#m${p.i})`,preserveAspectRatio:'none'},g);
  el('path',{d:p.shape,class:'edge'},g);
  g.addEventListener('click',e=>{if(e.target.closest('.pin'))return;pickAssembly(p.assembly,false)});
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickAssembly(p.assembly,false)}});
 }
 drawPins();applyLift();markActive();sizePins();
 const c=V.credit;
 $('credit').innerHTML=`Photo: ${esc(V.subject)}, by ${esc(c.author)} (${esc(c.taken)}), <a href="${esc(safeUrl(c.source))}" target="_blank" rel="noopener noreferrer">source</a>, licence <a href="${esc(safeUrl(c.licenceUrl))}" target="_blank" rel="noopener noreferrer">${esc(c.licence)}</a>. ${esc(V.changes)} ${esc(V.relevance)} Outlines and markers are placed by eye and are approximate.`;
}
function drawPins(){
 const svg=$('photo');svg.querySelectorAll('.pin').forEach(n=>n.remove());
 if(!assembly)return;
 const g=svg.querySelector(`.piece[data-assembly="${CSS.escape(assembly.id)}"]`);if(!g)return;
 const names=new Map(groups(assembly).map(x=>[x.number,x.primary.name]));
 for(const p of pinsFor(assembly.id).filter(p=>p.view===view)){
  const pin=el('g',{class:'pin'+(p.callout===selectedCallout?' selected':''),'data-callout':p.callout,tabindex:'0',role:'button','aria-label':`Callout ${p.callout}, ${names.get(p.callout)||''}`},g);
  el('title',{},pin).textContent=`${p.callout} — ${names.get(p.callout)||''}${p.note?'. '+p.note:''}`;
  el('circle',{cx:p.x,cy:p.y,r:30,class:'halo'},pin);
  el('circle',{cx:p.x,cy:p.y,r:30,class:'dot'},pin);
  const tx=el('text',{x:p.x,y:p.y},pin);tx.textContent=p.callout;
  pin.addEventListener('click',e=>{e.stopPropagation();selectCallout(p.callout)});
  pin.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();selectCallout(p.callout)}});
 }
 sizePins();
}
function sizePins(){
 const svg=$('photo');if(!currentVB||!svg.clientWidth)return;
 const k=Math.max(currentVB.w/svg.clientWidth,currentVB.h/svg.clientHeight);
 const r=Math.max(11,Math.min(15,svg.clientWidth/60))*k;
 svg.querySelectorAll('.pin .dot').forEach(c=>c.setAttribute('r',r));
 svg.querySelectorAll('.pin .halo').forEach(c=>c.setAttribute('r',r*1.55));
 svg.querySelectorAll('.pin text').forEach(x=>{x.style.fontSize=(r*1.05)+'px'});
 svg.querySelectorAll('.pin circle').forEach(c=>{c.style.strokeWidth=(r*.16)+'px'});
 svg.querySelectorAll('.piece .edge').forEach(p=>{p.style.strokeWidth=(2.2*k)+'px'});
}
function applyLift(){
 const svg=$('photo');
 svg.querySelectorAll('.piece').forEach(g=>{
  const p=map.placements[Number(g.dataset.i)];
  g.setAttribute('transform',`translate(${(p.lift[0]*t).toFixed(1)} ${(p.lift[1]*t).toFixed(1)})`);
  if(t>.02&&(p.lift[0]||p.lift[1]))g.setAttribute('filter','url(#lift)');else g.removeAttribute('filter');
 });
 svg.querySelectorAll('[data-socket]').forEach(s=>s.setAttribute('opacity',(.82*Math.min(1,t*2.2)).toFixed(3)));
 $('explodeRange').value=String(Math.round(t*100));
 $('explodeValue').textContent=Math.round(t*100)+'%';
 $('playBtn').textContent=t>=.5?'Put it back together':'Take it apart';
 if(focus&&!vbAnim){currentVB=focusBox();setVB(currentVB)}
}
function markActive(){
 const svg=$('photo');
 svg.classList.toggle('has-active',Boolean(assembly&&placement(assembly.id,view)));
 svg.querySelectorAll('.piece').forEach(g=>{const on=g.dataset.assembly===assembly?.id;g.classList.toggle('active',on);g.setAttribute('aria-pressed',String(on));if(on)svg.append(g)});
}
function setVB(b){$('photo').setAttribute('viewBox',`${b.x.toFixed(1)} ${b.y.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}`)}
function focusBox(){
 const F=frameOf(view);const p=assembly&&placement(assembly.id,view);if(!p)return F;
 const path=$('photo').querySelector(`.piece[data-i="${map.placements.indexOf(p)}"] .edge`);if(!path)return F;
 const b=path.getBBox();const pad=Math.max(b.width,b.height)*.28+60;
 let x=b.x+p.lift[0]*t-pad,y=b.y+p.lift[1]*t-pad,w=b.width+pad*2,h=b.height+pad*2;
 const ar=F.w/F.h;if(w/h>ar){const nh=w/ar;y-=(nh-h)/2;h=nh}else{const nw=h*ar;x-=(nw-w)/2;w=nw}
 return {x,y,w,h};
}
function animateVB(to){
 if(vbAnim)cancelAnimationFrame(vbAnim);
 const from=currentVB||to;if(reduceMotion){currentVB=to;setVB(to);sizePins();return}
 const start=performance.now(),dur=650;
 const step=now=>{const k=ease(Math.min(1,(now-start)/dur));currentVB={x:from.x+(to.x-from.x)*k,y:from.y+(to.y-from.y)*k,w:from.w+(to.w-from.w)*k,h:from.h+(to.h-from.h)*k};setVB(currentVB);sizePins();vbAnim=k<1?requestAnimationFrame(step):null};
 vbAnim=requestAnimationFrame(step);
}
function animateTo(target,dur=1300){
 if(anim)cancelAnimationFrame(anim);
 if(reduceMotion){t=target;applyLift();return}
 const from=t,start=performance.now();
 const step=now=>{const k=ease(Math.min(1,(now-start)/dur));t=from+(target-from)*k;applyLift();anim=k<1?requestAnimationFrame(step):null};
 anim=requestAnimationFrame(step);
}

/* ---------- Assemblies and parts ---------- */
function showAssemblyList(){
 const present=source.assemblies.filter(a=>zone==='all'||zones[zone].includes(a.id));
 $('assemblies').innerHTML=present.map(a=>{const n=groups(a).length,pinned=new Set(pinsFor(a.id).map(p=>p.callout)).size;
  return `<button type="button" data-assembly="${esc(a.id)}" class="assembly-btn ${assembly?.id===a.id?'active':''}" aria-pressed="${assembly?.id===a.id}"><span><b>${esc(a.title)}</b><small>${n} parts, ${pinned} marked, ${a.operations.length} torques</small></span></button>`}).join('');
 $('assemblies').querySelectorAll('[data-assembly]').forEach(b=>b.addEventListener('click',()=>pickAssembly(b.dataset.assembly,true)));
}
function pickAssembly(id,fromRail){
 const a=source?.assemblies.find(a=>a.id===id);if(!a)return;
 const changed=assembly?.id!==id;assembly=a;
 if(changed){query='';$('partSearch').value=''}
 const want=map?.primaryView?.[id];
 const viewChanged=(fromRail||!placement(id,view))&&want&&want!==view&&map.views[want];
 if(viewChanged)view=want;
 const vis=pinsFor(id).filter(p=>p.view===view);
 if(changed)selectedCallout=(vis[0]||pinsFor(id)[0])?.callout||groups(a)[0]?.number||null;
 $('assemblyTitle').textContent=a.title;
 $('assemblyContext').textContent=`${a.system}. ${groups(a).length} catalogue positions, ${a.parts.length} part numbers in the ${catLabel()} catalogue.`;
 $('hubTitle').textContent=a.title.toLowerCase();
 $('ficheLink').href=safeUrl(a.oemFicheUrl);$('ficheAltLink').href=safeUrl(a.alternateCatalogueUrl);$('sideSourceLink').href=safeUrl(a.oemFicheUrl);
 $('supplierAdvice').textContent=`Catalogue: ${a.catalogueDestination||'2018 model catalogue'}. If it refuses your browser, use ${M?'the model index link':'the dealer catalogue'} or the list on this page.`;
 if(viewChanged&&mode!=='fiche'){setTabs(view);buildStage()}else if(map){drawPins();markActive()}
 showAssemblyList();render();
 if(focus&&map)animateVB(focusBox());
 $('liveMsg').textContent=`${a.title} selected`;
}
function render(){
 if(!assembly)return;const matches=displayed();
 $('partCount').textContent=`${matches.length} of ${groups(assembly).length} positions`;
 $('inventory').innerHTML=matches.map(g=>{
  const tags=[];if(pinsFor(assembly.id,g.number).length)tags.push('On photo');if(linksFor(assembly.id,g.number).length)tags.push('Torque');if(reportsFor(assembly.id,g.number).length)tags.push('Tool size');
  return `<button type="button" role="listitem" class="item-row ${selectedCallout===g.number?'active':''}" data-callout="${esc(g.number)}" aria-current="${selectedCallout===g.number}"><span class="item-num tnum">${esc(g.number)}</span><span class="item-copy"><b>${esc(g.primary.name)}</b><small>${esc(g.variants.map(p=>p.partNumber).join(', '))}</small>${tags.length?`<span class="item-tags">${tags.map(x=>`<span>${x}</span>`).join('')}</span>`:''}</span></button>`}).join('')||'<p class="empty">No part in this assembly matches that filter.</p>';
 $('inventory').querySelectorAll('[data-callout]').forEach(b=>b.addEventListener('click',()=>selectCallout(b.dataset.callout)));
 renderInspector();renderOperations();renderTools();renderSystem();
}
function selectCallout(n){
 selectedCallout=n;
 const here=pinsFor(assembly.id,n).some(p=>p.view===view);
 render();if(map&&mode!=='fiche'){drawPins();markActive()}
 if(!here)$('stageHint').textContent='This part is not marked on this photograph.';else $('stageHint').textContent='Select a highlighted area or a numbered marker.';
 $('liveMsg').textContent=`Callout ${n} selected`;
}

/* ---------- Inspector ---------- */
function torqueRows(links){
 return links.map(l=>{
  if('op' in l){const o=assembly.operations[l.op];if(!o)return null;return {label:o.label,nm:o.torqueNm,text:null,page:o.page,note:M?(o.note||''):'',src:o.source,o,l}}
  const r=(manual.torqueSettings||[]).find(x=>x.id===l.ref);if(!r)return null;
  return {label:r.part.replace(/\s*\*$/,''),nm:r.torqueNm,text:r.valueText,page:r.page,note:r.notes||'',l};
 }).filter(Boolean);
}
function renderInspector(){
 const g=groups(assembly).find(x=>x.number===selectedCallout);if(!g){$('inspector').innerHTML='<p class="subtle">Choose a part.</p>';return}
 const main=g.primary,one=g.variants.length===1;
 const pins=pinsFor(assembly.id,g.number);
 const here=pins.filter(p=>p.view===view),else_=pins.filter(p=>p.view!==view);
 const thread=threadFrom(main.name);
 const rows=torqueRows(linksFor(assembly.id,g.number));
 const reps=reportsFor(assembly.id,g.number);
 const qty=one&&main.quantity?String(main.quantity):(one?'Not stated':'Depends on which part number fits');
 let locate;
 if(here.length)locate=`<span class="ev owner">Marked on this photo</span>${here[0].note?`<span>${esc(here[0].note)}</span>`:''}`;
 else if(else_.length)locate=`<button type="button" class="ghost" id="jumpView">Show on the ${esc(map.views[else_[0].view].title.toLowerCase())} photo</button>`;
 else locate=`<span class="ev none">Not visible in ${map&&Object.keys(map.views).length>1?'these photographs':'this photograph'}</span>${map?.notVisible?.[assembly.id]?`<span>${esc(map.notVisible[assembly.id])}</span>`:''}`;
 const torque=rows.length?rows.map(r=>`<div class="torque-hero"><div class="v tnum">${r.nm!=null?esc(r.nm)+'<small>Nm</small>':esc(r.text==='*'?'See procedure':r.text)}</div><div class="l">${esc(r.label)}</div><div class="m"><span>${srcBadge(r.src,r.page)}</span>${r.note?`<span>${esc(r.note)}</span>`:''}${r.o?altLines(r.o):''}<span>${r.l.kind==='inferred'?'<span class="ev inferred">Inferred link</span> ':''}${esc(r.l.basis)}.</span></div></div>`).join(''):`<p class="none-line">${M?'No sourced torque value is tied to this part.':"No row in the 2016 manual's torque table is tied to this part."}${thread?` Do not torque by thread size (${esc(thread)}) alone.`:''}</p>`;
 const toolsHtml=reps.length?reps.map(r=>`<div class="toolline"><b>${esc(r.tool)}</b><span>${esc(r.fits)}</span><small><span class="ev owner">${r.kind==='vendor-guide'?'Accessory maker\'s guide':'Owner-reported'}</span></small>${r.crossCheck?`<small>${esc(r.crossCheck)}</small>`:''}<a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener noreferrer">${esc(r.sourceTitle)}</a></div>`).join(''):`<p class="none-line">No published tool size was found for this part. Thread size does not fix the socket or hex size.</p>`;
 $('inspector').innerHTML=`<div class="insp"><div class="insp-kicker">Callout ${esc(g.number)} in ${esc(assembly.title.toLowerCase())}</div><h2>${esc(main.name)}</h2>
 ${one?`<div class="pn"><span>${esc(main.partNumber)}</span></div>`:`<div class="variants">${g.variants.map(p=>`<div class="variant"><b>${esc(p.partNumber)}</b><small>${esc(p.name)}</small>${p.fitmentNote?`<small>${esc(p.fitmentNote)}</small>`:''}</div>`).join('')}</div>`}
 <div class="locate">${locate}</div>
 <dl class="facts"><dt>Quantity</dt><dd>${esc(qty)}</dd><dt>Thread, from the part name</dt><dd class="${thread?'':'unknown'}">${esc(thread||'Not in the name')}</dd><dt>Catalogue</dt><dd>${esc(catLabel())}</dd></dl>
 ${(!one)?`<p class="fitnote">${g.variants.length} part numbers for one position. Only one is fitted; which one depends on build date.</p>`:main.fitmentNote?`<p class="fitnote">${esc(main.fitmentNote)}</p>`:''}
 <h3>Torque</h3>${torque}
 <h3>Tool</h3>${toolsHtml}</div>`;
 const j=$('jumpView');if(j)j.addEventListener('click',()=>{switchView(else_[0].view)});
}
function renderOperations(){
 const ops=assembly.operations;$('torqueCount').textContent=String(ops.length);
 $('fastenerOperations').innerHTML=ops.length?ops.map((op,i)=>{const r=(tools.reports||[]).filter(x=>x.assembly===assembly.id&&x.op===i);
  return `<div class="operation"><strong>${esc(op.label)}</strong><span class="spec tnum">${esc(op.torqueNm)} Nm</span><small>${M?srcBadge(op.source,op.page):`Service manual April 2016, page ${esc(op.page)}`}${op.note?(M?' ':'. ')+esc(op.note):''}</small>${M?altLines(op):''}${r.map(x=>`<small class="owner">${x.kind==='vendor-guide'?'Accessory maker\'s guide':'Owner-reported'} tool: ${esc(x.tool)}</small>`).join('')}</div>`}).join(''):'<p class="subtle">No torque row is mapped to this assembly.</p>';
}
function renderTools(){
 const list=assembly.specialTools||[];$('toolCount').textContent=String(list.length);
 const loose=(tools.reports||[]).filter(r=>r.assembly===assembly.id&&r.callout==null);
 $('toolRecords').innerHTML=loose.map(r=>`<div class="tool"><b>${esc(r.tool)}</b> <span class="ev owner">${r.kind==='vendor-guide'?'Accessory maker\'s guide':'Owner-reported'}</span><small>${esc(r.fits)} <a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener noreferrer">${esc(r.sourceTitle)}</a></small></div>`).join('')+(list.length?list.map(x=>`<div class="tool"><b>${esc(x.toolNumber)}</b> ${esc(x.description)}<small>${esc(x.source)}</small></div>`).join(''):(M?'<p class="subtle">No Triumph service tool is published for this assembly in the sources used here.</p>':'<p class="subtle">The manual lists no Triumph service tool for this assembly.</p>'));
}
function renderSystem(){
 const cats=map?.systemCategories?.[assembly.id]||[];
 const rows=(manual.torqueSettings||[]).filter(r=>cats.includes(r.category));
 $('systemCount').textContent=rows.length?String(rows.length):'';
 $('systemRows').hidden=!rows.length;
 $('systemList').innerHTML=rows.map(r=>`<div class="sysrow"><b>${esc(r.part.replace(/\s*\*$/,''))}</b><span class="val">${r.torqueNm!=null?esc(r.torqueNm)+' Nm':esc(r.valueText==='*'?'See procedure':r.valueText)}</span><small>${esc(r.category)}, page ${esc(r.page)}${r.notes?'. '+esc(r.notes):''}</small></div>`).join('');
}

/* ---------- Tabs and controls ---------- */
let mode='cranberry';
function setTabs(m){const pairs=TABS.map(([id],i)=>[tabViews[i],id]).concat([['fiche','tabFiche']]);for(const [k,id] of pairs){$(id).classList.toggle('active',k===m);$(id).setAttribute('aria-selected',String(k===m))}}
function setupTabs(){
 if(map?.viewOrder)tabViews=map.viewOrder.slice(0,3);
 TABS.forEach(([id],i)=>{const v=tabViews[i],b=$(id);if(!v||!map?.views?.[v]){b.hidden=true;return}b.hidden=false;if(map.views[v].tab)b.textContent=map.views[v].tab;b.onclick=()=>switchView(v)});
}
function switchView(v){mode=v;setTabs(v);$('explodedScene').hidden=false;$('ficheScene').hidden=true;if(v!==view||!$('photo').firstChild){view=v;buildStage()}selectCallout(selectedCallout)}
function showFiche(){mode='fiche';setTabs('fiche');$('explodedScene').hidden=true;$('ficheScene').hidden=false}

async function getJSON(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json()}
function applyModelText(){
 if(!M)return;
 const name=M.name,years=M.years;
 document.title=`Teardown · ${name} ${years}`;
 $('wordName').textContent=name;$('wordSub').textContent=`${years} workshop explorer`;
 $('safetyNote').innerHTML=`<strong>Check before you torque.</strong> ${esc(M.notice)} Stock values do not apply to aftermarket wheels or brakes.`;
 document.querySelector('.rail-note').textContent=`Assemblies follow the ${catLabel()} parts catalogue at Hermy's Triumph eStore, an authorised dealer. Alternative part numbers for one position are grouped, not counted as extra parts.`;
 $('ficheTitle').textContent=`${catLabel()} parts catalogue`;
 $('ficheIntro').textContent=`Each assembly links to its own diagram page in the ${catLabel()} catalogue at Hermy's Triumph eStore. Diagrams are not copied here.`;
 $('ficheLink').textContent='Open this assembly in the catalogue';$('ficheAltLink').textContent='Open the model index';
 $('sideSourceLink').textContent=`${catLabel()} catalogue`;
 $('photo').setAttribute('aria-label',`Photograph of a ${name} with selectable assemblies`);
}
async function loadT120(){
 source=await getJSON('data/exploded-2018.json');if(!Array.isArray(source.assemblies)||source.assemblies.length<2)throw Error('Invalid assembly data');
 const [m,tl,sr]=await Promise.allSettled([getJSON('data/teardown-map.json'),getJSON('data/tool-size-reports.json'),getJSON('data/source-reference.json')]);
 if(m.status==='fulfilled'&&m.value?.views)map=m.value;
 if(tl.status==='fulfilled'&&Array.isArray(tl.value?.reports))tools=tl.value;
 if(sr.status==='fulfilled'&&Array.isArray(sr.value?.torqueSettings))manual=sr.value;
}
async function loadModel(){
 const reg=await getJSON('data/models.json');const entry=(reg.models||[]).find(x=>x.id===MODEL);
 if(!entry||!entry.data)throw Error('Unknown model '+MODEL);
 if(!/^data\/models\/[a-z0-9-]+\.json$/.test(entry.data))throw Error('Invalid model data path');
 M=await getJSON(entry.data);
 if(!Array.isArray(M.assemblies)||M.assemblies.length<2)throw Error('Invalid assembly data');
 source={assemblies:M.assemblies};map=M.map?.views?M.map:null;tools={reports:Array.isArray(M.toolReports)?M.toolReports:[]};manual={torqueSettings:[]};
}
async function boot(){
 try{if(MODEL==='t120-2018')await loadT120();else await loadModel()}
 catch(e){$('assemblyTitle').textContent='Parts index unavailable';$('assemblyContext').textContent='Serve the project over HTTP, not file://. '+e.message;return}
 applyModelText();setupTabs();
 document.querySelectorAll('[data-zone]').forEach(b=>b.addEventListener('click',()=>{zone=b.dataset.zone;document.querySelectorAll('[data-zone]').forEach(x=>x.classList.toggle('active',x===b));if(zone!=='all'&&!zones[zone].includes(assembly.id))pickAssembly(zones[zone][0],true);else showAssemblyList()}));
 $('partSearch').addEventListener('input',e=>{query=e.target.value.trim();render()});
 $('explodeRange').addEventListener('input',e=>{if(anim)cancelAnimationFrame(anim),anim=null;t=Number(e.target.value)/100;if(map)applyLift()});
 $('playBtn').addEventListener('click',()=>{if(map)animateTo(t>=.5?0:1)});
 $('focusBtn').addEventListener('click',()=>{focus=!focus;$('focusBtn').setAttribute('aria-pressed',String(focus));$('focusBtn').textContent=focus?'Show whole photo':'Zoom to assembly';if(map)animateVB(focus?focusBox():frameOf(view))});
 $('tabFiche').addEventListener('click',showFiche);
 $('showLocalSpareList').addEventListener('click',()=>switchView(view));
 $('resetView').addEventListener('click',()=>{query='';$('partSearch').value='';focus=false;$('focusBtn').setAttribute('aria-pressed','false');$('focusBtn').textContent='Zoom to assembly';t=0;view=map?.primaryView?.[assembly.id]||tabViews[0];switchView(view);if(map)applyLift();selectCallout(groups(assembly)[0].number)});
 const nav=n=>{const gg=displayed();if(!gg.length)return;const pos=gg.findIndex(g=>g.number===selectedCallout);selectCallout(gg[(pos+n+gg.length)%gg.length].number)};
 $('prevPart').addEventListener('click',()=>nav(-1));$('nextPart').addEventListener('click',()=>nav(1));
 addEventListener('resize',()=>{if(map){if(focus&&!vbAnim){currentVB=focusBox();setVB(currentVB)}sizePins()}});
 view=map?.primaryView?.['front-forks']||tabViews[0];mode=view;setTabs(view);
 if(map)buildStage();else $('stageHint').textContent='Photograph map unavailable. The parts list and torque data still work.';
 pickAssembly('front-forks',true);
 if(map&&!reduceMotion)setTimeout(()=>{if(t===0)animateTo(.35,1600)},700);
}
boot();
