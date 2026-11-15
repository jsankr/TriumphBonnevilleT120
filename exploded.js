// Source-grounded 2018 T120 fiche callouts; references and legal notices in data/exploded-2018.json.
// No VIN input, persistence, inference or tracking. No invented hex-drive sizes.
'use strict';
const $=id=>document.getElementById(id);
const safeUrl=(input)=>{try{const u=new URL(String(input));return u.protocol==='https:'?u.href:'catalogue.html'}catch{return 'catalogue.html'}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;'}[c]));
const zones={front:['front-forks','front-wheel','front-brakes'],rear:['rear-shocks','rear-brakes','rear-wheel'],engine:['cooling','engine-covers']};
const icons={'front-forks':'⚙','front-wheel':'◎','front-brakes':'◉','rear-shocks':'⌁','rear-brakes':'◉','rear-wheel':'◎','cooling':'◈','engine-covers':'▣'};
let source=null,assembly=null,selectedCallout=null,query='',zone='all',mode='exploded',explode=65;
// Explicit operation-to-catalogue-callout associations only; these are 2016 service-manual references, NOT 2018 certified values.
const calloutOperations={'front-wheel':{'11':[0]},'front-brakes':{'15':[1]},'rear-shocks':{'2':[0,1]},'rear-brakes':{'3':[1],'12':[0]},'rear-wheel':{'18':[2],'24':[1]},'engine-covers':{'1':[0],'18':[1],'24':[2]}};
function groups(a){
 const o=new Map();for(const p of a.parts){if(!o.has(p.callout))o.set(p.callout,[]);o.get(p.callout).push(p)}
 return [...o.entries()].map(([number,variants])=>({number,variants,primary:variants[0]}));
}
function displayed(){return !assembly?[]:groups(assembly).filter(g=> !query || g.variants.some(p=>[p.name,p.partNumber,p.fitmentNote,g.number].join(' ').toLowerCase().includes(query.toLowerCase())))}
function chooseAssembly(id){
 const a=source?.assemblies.find(a=>a.id===id);if(!a)return;
 assembly=a;selectedCallout=groups(a)[0]?.number||null;query='';$('partSearch').value='';
 $('assemblyTitle').textContent=a.title;$('assemblyContext').textContent=`${a.system} · original 2018 OEM fiche numbered spares · ${a.parts.length} catalogue candidates`;
 $('hubTitle').textContent=a.title;$('ficheLink').href=safeUrl(a.oemFicheUrl);$('ficheAltLink').href=safeUrl(a.alternateCatalogueUrl);$('sideSourceLink').href=safeUrl(a.oemFicheUrl);
 $('supplierAdvice').textContent='External provider: '+(a.catalogueDestination||'2018 model catalogue')+'. If this site blocks your browser, try the authorized dealer alternative or use local callouts.';
 showAssemblyList();render();$('liveMsg').textContent=`Now exploring ${a.title}`;
}
function showAssemblyList(){
 const present=source.assemblies.filter(a=>zone==='all'||zones[zone].includes(a.id));
 $('assemblies').innerHTML=present.map(a=>`<button type="button" data-assembly="${esc(a.id)}" class="assembly-btn ${assembly?.id===a.id?'active':''}" aria-pressed="${assembly?.id===a.id}"><i>${esc(icons[a.id]||'◇')}</i><span><b>${esc(a.title)}</b><small>${a.parts.length} catalogue alternatives · ${groups(a).length} callouts</small></span></button>`).join('');
 $('assemblies').querySelectorAll('[data-assembly]').forEach(btn=>btn.addEventListener('click',()=>chooseAssembly(btn.dataset.assembly)));
}
function render(){if(!assembly)return;const matches=displayed();
 $('partCount').textContent=`${matches.length} callouts / ${assembly.parts.length} entries`;
 const stage=$('explodedMatrix');stage.style.setProperty('--explode',String(explode));
 if(matches.length===0){stage.innerHTML='<p>No matching OEM callouts.</p>';}
 else stage.innerHTML=matches.map((g,i)=>{
  const main=g.primary;const xx=i%2===0?-1:1,yy=i%3===0?-1:1;
  const label=g.variants.length>1?`${g.variants.length} catalogue variants`:(main.partNumber||'Source list');
  return `<button type="button" class="node ${selectedCallout===g.number?'active':''}" data-callout="${esc(g.number)}" style="--dx:${xx};--dy:${yy}" aria-pressed="${selectedCallout===g.number}"><span class="callout">#${esc(g.number)}</span><b>${esc(main.name)}</b><small>${esc(label)}</small>${g.variants.length>1?'<span class="node-meta">Grouped alternatives — not extra fitted parts</span>':''}</button>`;
 }).join('');
 stage.querySelectorAll('[data-callout]').forEach(btn=>btn.addEventListener('click',()=>selectCallout(btn.dataset.callout)));
 $('inventory').innerHTML=matches.map(g=>`<button type="button" role="listitem" class="item-row ${selectedCallout===g.number?'active':''}" data-callout="${esc(g.number)}"><span class="item-num">${esc(g.number)}</span><span class="item-copy"><b>${esc(g.primary.name)}</b><small>${esc(g.variants.map(p=>p.partNumber).join(' · '))}</small>${g.variants.length>1?'<small>VIN-dependent / supply alternatives grouped</small>':''}</span></button>`).join('')||'<p class="subtle">No matches.</p>';
 $('inventory').querySelectorAll('[data-callout]').forEach(btn=>btn.addEventListener('click',()=>selectCallout(btn.dataset.callout)));
 renderInspector();renderOperations();renderTools();
}
function selectCallout(number){selectedCallout=number;render();$('liveMsg').textContent=`Selected OEM diagram callout ${number}`;}
function renderInspector(){
 const g=groups(assembly).find(x=>x.number===selectedCallout);if(!g)return;
 const main=g.primary,one=g.variants.length===1;
 const related=(calloutOperations[assembly.id]?.[g.number]||[]).map(i=>assembly.operations[i]).filter(Boolean);
 const header=`<div class="eyebrow">FICHE CALLOUT ${esc(g.number)} · ${esc(assembly.system)}</div><h2>${esc(main.name)}</h2>`;
 const details=one?`<span class="part-number">${esc(main.partNumber)}</span>`:`<span class="part-number">${g.variants.length} catalogue variants</span><div class="variants">${g.variants.map(p=>`<div class="variant"><b>${esc(p.partNumber)}</b><small>${esc(p.name)}</small>${p.fitmentNote?`<small>${esc(p.fitmentNote)}</small>`:''}</div>`).join('')}</div>`;
 const qty=one&&main.quantity?String(main.quantity):'See OEM fiche — may vary';
 $('inspector').innerHTML=`<div class="inspection-card">${header}${details}<div class="field"><span>Quantity</span><b>${esc(qty)}</b></div><div class="field"><span>Part / assembly fitment</span><b class="unknown">Catalogue candidate</b></div><div class="field"><span>Fastener thread or dimensions</span><b>${esc(main.name.match(/(?:M\d+(?:[×x]\d+)?|\d+×\d+(?:×\d+)?)/i)?.[0]||'Not specified here')}</b></div><div class="field"><span>Tool type / driver size</span><b class="unknown">Not verified for this spare</b></div><div class="field"><span>Related mounting operation</span><b class="${related.length?'':'unknown'}">${related.length?related.map(r=>esc(r.label)+': '+esc(r.torqueNm)+' Nm (2016, p.'+esc(r.page)+')').join('; '):'No explicit operation-to-callout match established'}</b></div><div class="field"><span>Model</span><b>Bonneville T120 LC / 2018</b></div>${(main.fitmentNote||g.variants.length>1)?`<div class="fitnote">${g.variants.length>1?'Multiple alternative part numbers for the same original diagram callout. They are NOT multiple fitted spares.':''} ${esc(main.fitmentNote||'Check source fiche applicability.')}</div>`:''}<p>All part numbers are from the linked 2018-specific catalogue, not independently verified against an individual motorcycle or modified Kineo/TEC hardware.</p><div class="source-mini"><a href="${esc(safeUrl(assembly.oemFicheUrl))}" target="_blank" rel="noopener noreferrer">Browse 2018 T120 catalogue (select this assembly) ↗</a></div></div>`;
}
function renderOperations(){
 const ops=assembly.operations;
 $('torqueCount').textContent=String(ops.length);
 $('fastenerOperations').innerHTML=ops.length?ops.map(op=>`<div class="operation"><strong>${esc(op.label)}</strong><div class="spec">${esc(op.torqueNm)} Nm</div><small>Triumph T120 Service Manual · <b>April 2016, Issue 1</b> · printed page ${esc(op.page)}</small><small>Required driver size: <b>NOT VERIFIED</b>; thread diameter alone does not define socket/hex size.</small><small>2018 India-market, production changes and aftermarket applicability require confirmation before performing work.</small><a href="index.html#manualLibrary" title="Load and view your copy of this service manual">Open local manual library (p.${op.page}) ↗</a></div>`).join(''):'<p class="subtle">No verified torque operation mapped to this assembly. Search the original manual before servicing.</p>';
}
function renderTools(){
 const tools=assembly.specialTools;
 $('toolCount').textContent=String(tools?.length||0);
 $('toolRecords').innerHTML=tools?.length?tools.map(t=>`<div class="tool"><b>${esc(t.toolNumber)}</b> — ${esc(t.description)}<small>${esc(t.source)} · Reference only, confirm procedure and use.</small></div>`).join(''):'<p class="subtle">No specific Triumph special tool mapped from this assembly reference. Standard hand-tool sizes remain unverified.</p>';
}
function showMode(value){mode=value;for(const [id,button] of [['exploded','tabExploded'],['fiche','tabFiche'],['bike','tabBike']]){
 $(id==='exploded'?'explodedScene':id==='fiche'?'ficheScene':'bikeScene').hidden=id!==mode;
 $(button).classList.toggle('active',id===mode);$(button).setAttribute('aria-selected',String(id===mode));
 }}
async function boot(){
 try{const r=await fetch('data/exploded-2018.json',{cache:'no-store'});if(!r.ok)throw Error(`HTTP ${r.status}`);source=await r.json();if(!Array.isArray(source.assemblies)||source.assemblies.length<2)throw Error('Invalid assembly catalogue');}
 catch(e){$('assemblyTitle').textContent='OEM catalogue unavailable';$('assemblyContext').textContent='Serve the project from an HTTP web server (not file://). '+e.message;return}
 document.querySelectorAll('[data-zone]').forEach(btn=>btn.addEventListener('click',()=>{zone=btn.dataset.zone;document.querySelectorAll('[data-zone]').forEach(x=>x.classList.toggle('active',x===btn));if(zone!=='all'&&!zones[zone].includes(assembly.id)){chooseAssembly(zones[zone][0])}else showAssemblyList()}));
 $('partSearch').addEventListener('input',e=>{query=e.target.value.trim();render()});
 $('explodeRange').addEventListener('input',e=>{explode=Number(e.target.value);$('explodeValue').textContent=explode+'%';$('explodedMatrix').style.setProperty('--explode',String(explode))});
 $('tabExploded').addEventListener('click',()=>showMode('exploded'));$('tabFiche').addEventListener('click',()=>showMode('fiche'));$('tabBike').addEventListener('click',()=>showMode('bike'));
 $('showLocalSpareList').addEventListener('click',()=>{showMode('exploded');$('inventory').scrollIntoView({behavior:'smooth',block:'nearest'})});
 $('resetView').addEventListener('click',()=>{query='';$('partSearch').value='';explode=65;$('explodeValue').textContent='65%';$('explodeRange').value=65;showMode('exploded');selectCallout(groups(assembly)[0].number)});
 function navigate(n){const gg=displayed();const pos=gg.findIndex(g=>g.number===selectedCallout);if(!gg.length)return;selectCallout(gg[(pos+n+gg.length)%gg.length].number)}
 $('prevPart').addEventListener('click',()=>navigate(-1));$('nextPart').addEventListener('click',()=>navigate(1));
 chooseAssembly('front-forks');
}
boot();
