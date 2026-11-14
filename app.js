import {answerEvidenceQuery} from './copilot.js';
import {renderComponentEvidence} from './component-evidence.js';
const $=(s,root=document)=>root.querySelector(s);const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceUrl='https://github.com/jsankr/TriumphBonnevilleT120/blob/main/SOURCES.md';
const safeLink=url=>/^https:\/\//.test(url||'')?url:sourceUrl;
const icons={'Wheels & brakes':'◎','Suspension & steering':'⌁','Engine & transmission':'⚙','Bodywork':'◇','Electrical':'ϟ','Cooling':'◈','Intake & fuel':'▣','Exhaust':'═','Drivetrain':'⛓','Chassis':'⌗','Lubrication':'◉','Ignition':'✳'};
let parts=[];let selected='front-brake';let activeFilter='All';let query='';let tab='overview';
const torqueRefs=[['Front wheel axle bolt','65 Nm · SM 2016 p.69'],['Fork to front axle pinch bolts','23 Nm · SM 2016 p.69'],['Rear suspension upper mount','28 Nm · SM 2016 p.68'],['Rear suspension lower mount','28 Nm · SM 2016 p.68'],['Rear wheel spindle lock nut','110 Nm · SM 2016 p.69'],['Rear brake caliper to carrier','40 Nm · SM 2016 p.71'],['Front brake caliper mounting','See original brake procedures · p.513+']];
let manualRef=null;
const checkTasks=[['Confirm oil-level inspection','Daily check / official handbook'],['Review chain lubrication condition','Consult handbook and chain maker'],['Inspect tyres and tyre pressures','Check cold as prescribed'],['Check lights, horn and indicators','Pre-ride functional check'],['Verify upcoming scheduled service','VIN- and market-specific interval']];
function byId(id){return parts.find(p=>p.id===id)||parts[0]}
function maybe(value){return value===undefined||value===null||value===''?'Not verified':String(value)}
function filtered(){return parts.filter(p=>activeFilter==='All'||p.group===activeFilter).filter(p=>[p.name,p.group,p.function,p.id,p.maintenance].join(' ').toLowerCase().includes(query.toLowerCase()))}
function renderParts(){const matches=filtered();$('#resultCount').textContent=matches.length;$('#catalogueStatus').textContent=`${matches.length} of ${parts.length} assembly records`;$('#partList').innerHTML=matches.length?matches.map(p=>`<button class="part-item ${p.id===selected?'selected':''}" data-id="${escape(p.id)}" role="listitem" aria-current="${p.id===selected?'true':'false'}"><span class="part-icon">${icons[p.group]||'◇'}</span><div><strong>${escape(p.name)}</strong><small>${escape(p.group)}</small></div><span class="part-arrow">›</span></button>`).join(''):'<div style="padding:20px;color:#8aa7bb">No matching components. Try another search.</div>';
 $$('.part-item').forEach(el=>el.addEventListener('click',()=>selectPart(el.dataset.id)));
}
function evidenceName(p){return p.torqueEvidence?.value===null?'NOT VERIFIED':'LATER-HANDBOOK REFERENCE'}
function renderInspector(){const p=byId(selected);if(!p)return;$('#selectedName').textContent=p.name;$('#selectedGroup').textContent=p.group.toUpperCase();$('#evidenceTag').textContent=evidenceName(p);$$('.detail-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
let content='';
if(tab==='overview')content=`<h4>FUNCTION</h4><p>${escape(p.function)}</p><h4>VEHICLE APPLICABILITY</h4><p>2018 Bonneville T120 assembly-level reference. VIN, market and aftermarket configuration remain unconfirmed.</p><div class="field"><span>Identification</span><b>${escape(p.partNo||'Not verified')}</b></div><div class="field"><span>Price</span><b>${escape(p.price||'Dealer quote needed')}</b></div><h4>MAINTENANCE</h4><p>${escape(p.maintenance)}</p>`;
else if(tab==='torque')content=`<div class="field"><span>Fastener torque</span><b class="${p.fastenerTorqueNm==null?'missing':''}">${p.fastenerTorqueNm==null?'NOT VERIFIED':escape(p.fastenerTorqueNm)+' Nm'}</b></div><div class="field"><span>Removal tool size</span><b class="${p.removalToolSize==null?'missing':''}">${escape(maybe(p.removalToolSize))}</b></div><div class="field"><span>Installation tool size</span><b class="${p.installationToolSize==null?'missing':''}">${escape(maybe(p.installationToolSize))}</b></div><div class="callout">${escape(p.torqueEvidence?.sourceNote||'Correct 2018 fastener data not established.')} ${p.torqueEvidence?.value!=null?`Owner-handbook reference: ${escape(p.torqueEvidence.value)}. Do not treat it as certified for a 2018 workshop procedure.`:'Do not infer settings from the interface illustration.'}</div>`;
else content=`<h4>INSPECTION / MAINTENANCE NOTES</h4><p>${escape(p.maintenance)}</p><div class="field"><span>Listed interval</span><b>${escape(p.interval||'VIN-specific schedule')}</b></div><div class="field"><span>Service readiness</span><b class="missing">Reference only</b></div>${p.risk?`<div class="callout">${escape(p.risk)}</div>`:''}<p>Removal and installation sequences require a model-year and market-applicable service manual.</p>`;
 if(tab==='torque') content+=renderComponentEvidence(p, manualRef);
 $('#detailContent').innerHTML=content;$$('.hotspot').forEach(el=>el.classList.toggle('is-selected',el.dataset.part===p.id));
}
function selectPart(id){if(!byId(id))return;selected=id;if(tab!=='torque')tab='overview';renderInspector();renderParts()}
function renderTorques(){$('#torqueTable').innerHTML=torqueRefs.map(([name,value])=>`<div class="torque-row"><span>${escape(name)}</span><b>${escape(value)}</b></div>`).join('')}
function renderMaintenance(){let saved={};try{saved=JSON.parse(localStorage.getItem('t120-photo-checks')||'{}')||{}}catch{}$('#maintenanceList').innerHTML=checkTasks.map(([name,detail],i)=>`<label class="maintenance-item"><input type="checkbox" data-check="${i}" ${saved[i]?'checked':''}/><div>${escape(name)}<span>${escape(detail)}</span></div></label>`).join('');$$('[data-check]').forEach(el=>el.addEventListener('change',()=>{const state={};$$('[data-check]').forEach(a=>{state[a.dataset.check]=a.checked});try{localStorage.setItem('t120-photo-checks',JSON.stringify(state))}catch{}updateMaintenance()}));updateMaintenance()}
function updateMaintenance(){const checked=$$('[data-check]').filter(x=>x.checked).length;$('#maintenanceProgress').textContent=`${checked} of ${checkTasks.length} checked`}
function appendMessage(html,role='assistant'){const node=document.createElement('div');node.className=`chat-msg ${role}`;node.innerHTML=html;$('#chatLog').append(node);$('#chatLog').scrollTop=$('#chatLog').scrollHeight}
function ask(question){const q=String(question||'').trim();if(!q)return;appendMessage(escape(q),'user');const response=answerEvidenceQuery(q,parts);
 const askTorque=/\b(torque|tighten|axle|spindle|shock|pinch|mounting)\b/i.test(q);
 if(askTorque&&manualRef){
  let match=manualRef.torqueSettings.filter(r=>{const phrase=r.part.toLowerCase();const w=q.toLowerCase();
   if(w.includes('front axle')||w.includes('front spindle'))return phrase.includes('front wheel spindle');
   if(w.includes('pinch'))return phrase.includes('fork to wheel spindle pinch');
   if(w.includes('rear shock')||w.includes('rear suspension'))return phrase.includes('rear suspension unit');
   if(w.includes('rear brake'))return phrase.includes('rear')&&phrase.includes('brake');
   const keywords=w.match(/[a-z]{4,}/g)?.filter(x=>!['what','torque','with','this','have','size','required','tighten','front','rear'].includes(x))||[];
   return keywords.length>0&&keywords.every(x=>phrase.includes(x))
  }).slice(0,5);
  if(match.length){const links=match.map(r=>`<div style="border-top:1px solid #32516a;padding:8px 0"><b>${escape(r.part)}: ${r.valueText==='*'?'procedure-specific':escape(r.valueText)}</b><br/><small>2016 T120 Service Manual p.${r.page} · ${escape(r.notes||'No row note')} · <button class="source-open" type="button" data-source="service2016" data-page="${r.page}">Open original PDF ↗</button></small></div>`).join('');appendMessage(`<b>Documented 2016 manual references (NOT confirmed for your 2018 VIN):</b>${links}<small>Never infer tool sizes. Verify the exact model revision and service procedure.</small>`);return}
 }
 const cards=response.items.slice(0,3).map(x=>`<div style="margin-top:9px;border-top:1px solid #264860;padding-top:8px"><b>${escape(x.title)}</b><div>${escape(x.summary)}</div><small>${escape(x.status)} · <a target="_blank" rel="noopener noreferrer" href="${escape(safeLink(x.url))}">Source ↗</a></small></div>`).join('');appendMessage(`<b>${escape(response.headline)}</b>${cards}<small>Local evidence search only. No online AI service or verified repair procedure.</small>`)}
async function boot(){try{const r=await fetch('./parts.json',{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(!Array.isArray(j)||j.length<1)throw new Error('Empty parts index');parts=j}catch(e){$('#partList').innerHTML=`<div style="padding:16px;color:#ffc18a">Cannot load parts.json: ${escape(e.message)}. Serve from a web server instead of opening file:// directly.</div>`;$('#detailContent').textContent='Parts data unavailable';appendMessage('Parts data unavailable; the assistant cannot safely answer without it.');return}
try{const r=await fetch('./data/source-reference.json');if(r.ok)manualRef=await r.json()}catch{};
renderParts();renderInspector();renderTorques();renderMaintenance();appendMessage('I can search the 30 assembly-level records and evidence sources. Ask about MY18 Nissin brakes, twin rear shocks or an unverified torque.');
$$('.filter-row button').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;$$('.filter-row button').forEach(x=>x.classList.toggle('active',x===btn));renderParts()}));
for(const el of [$('#partSearch'),$('#globalSearch')])el.addEventListener('input',()=>{query=el.value;$('#partSearch').value=query;$('#globalSearch').value=query;renderParts()});
$$('.hotspot').forEach(el=>el.addEventListener('click',()=>selectPart(el.dataset.part)));
$$('.detail-tabs button').forEach(el=>el.addEventListener('click',()=>{tab=el.dataset.tab;renderInspector()}));
$('#resetSelection').addEventListener('click',()=>selectPart('front-brake'));
$('#nextPart').addEventListener('click',()=>{const i=parts.findIndex(p=>p.id===selected);selectPart(parts[(i+1)%parts.length].id)});
$('#askForm').addEventListener('submit',ev=>{ev.preventDefault();ask($('#askInput').value);$('#askInput').value=''});
$$('[data-ask]').forEach(btn=>btn.addEventListener('click',()=>ask(btn.dataset.ask)));
$('#clearMaintenance').addEventListener('click',()=>{try{localStorage.removeItem('t120-photo-checks')}catch{}renderMaintenance()});
const sidebar=$('#sidebar');$('#menuToggle').addEventListener('click',()=>{const opened=sidebar.classList.toggle('is-open');$('#menuToggle').setAttribute('aria-expanded',String(opened))});
$$('.nav-link').forEach(btn=>btn.addEventListener('click',()=>{$$('.nav-link').forEach(x=>x.classList.toggle('selected',x===btn));const target=$('#'+btn.dataset.target);if(target)target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});sidebar.classList.remove('is-open');$('#menuToggle').setAttribute('aria-expanded','false')}));
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();const el=window.matchMedia('(max-width:740px)').matches?$('#partSearch'):$('#globalSearch');el.scrollIntoView({block:'center'});el.focus()}if(e.key==='Escape'){sidebar.classList.remove('is-open')}});
}
boot();
