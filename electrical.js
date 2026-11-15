"use strict";
const $ = id => document.getElementById(id);
const clean = s => String(s ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const servicePage = n => Number.isInteger(Number(n)) && Number(n)>=1 && Number(n)<=728 ? Number(n):null;
const srcButton=(page,label) => `<button type="button" class="source-button inline" data-page="${servicePage(page)}" aria-label="Open T120 2016 service manual page ${servicePage(page)}">${clean(label||`Manual p.${page} ↗`)}</button>`;
const catalogueUrl = 'https://www.bike-parts-triumph.com/triumph-motorcycle/Bonneville/Liquid-Cooled/bonneville-t120/ELECTRICAL-EQUIPMENT/9/10008035737/0/9';
let data=null;
let pdfUrl=null;
let pendingPage=null;
let lastPage=null;
const picker=$('localPdf');
const pdfStatus=$('pdfStatus');
function requestPage(page){
 const n=servicePage(page);
 if(n===null){pdfStatus.textContent='Invalid source page. The source manual has 728 pages.';return}
 pendingPage=n;
 if(!pdfUrl){
  pdfStatus.textContent=`Source page ${n} is in the copyrighted 2016 Triumph manual. Select your own copy once to open the correct page privately.`;
  $('localManual').scrollIntoView({block:'center'});
  // This executes synchronously during the user's click, allowing Safari/Firefox/Chrome to open the native picker.
  picker.click();return;
 }
 openLocal(n);
}
function openLocal(page){
 if(!pdfUrl){requestPage(page);return}
 const n=servicePage(page);if(n===null)return;
 pendingPage=null;lastPage=n;
 const url=pdfUrl+'#page='+n;
 const frame=$('localPdfViewer');frame.src=url;frame.hidden=false;
 const open=$('openPdfTab');open.hidden=false;open.href=url;
 pdfStatus.textContent=`Opening 2016 T120 Service Manual p.${n} from this device only. Your browser's PDF viewer may ignore the #page fragment; use the PDF page selector if necessary.`;
 $('localManual').scrollIntoView({block:'start'});
}
picker.addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(!file.name.toLowerCase().endsWith('.pdf')&&file.type!=='application/pdf') {pdfStatus.textContent='Please choose a PDF document.';return}
 if(file.size>75*1024*1024){pdfStatus.textContent='PDF is larger than the 75 MB local limit.';return}
 const sig=new Uint8Array(await file.slice(0,5).arrayBuffer());
 if(String.fromCharCode(...sig)!=='%PDF-'){pdfStatus.textContent='The selected file is not a valid PDF.';return}
 if(pdfUrl){URL.revokeObjectURL(pdfUrl);pdfUrl=null}
 pdfUrl=URL.createObjectURL(file);
 pdfStatus.textContent='Local PDF selected; ensure it is the April 2016 T120, 728-page edition. It stays on this device.';
 if(pendingPage!==null)openLocal(pendingPage);
});
window.addEventListener('pagehide',()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl)});
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-page]');if(el){e.preventDefault();requestPage(Number(el.dataset.page));return}
 const part=e.target.closest('[data-part]');if(part){e.preventDefault();showPart(part.dataset.part);return}
});
function showPart(partNumber){
 const item=data?.candidateParts.find(p=>p.partNumber===partNumber);
 if(!item)return;
 const panel=$('selectedPart');panel.hidden=false;
 const isElectrical=item.assembly==='Electrical Equipment';
 panel.innerHTML=`<h3 class="detail-title">${clean(item.name)}</h3><dl><dt>Catalogue part number</dt><dd><b>${clean(item.partNumber)}</b></dd><dt>Assembly</dt><dd>${clean(item.assembly)}</dd><dt>Catalogue quantity</dt><dd>${item.quantityOnFiche==null?'Not verified':clean(Number(item.quantityOnFiche))}</dd><dt>2018 fitment</dt><dd>${clean(item.applicability)}</dd><dt>Verified price</dt><dd>Not available; check seller checkout</dd></dl><div class="catalogue-links">${isElectrical?`<a href="${catalogueUrl}" target="_blank" rel="noopener noreferrer">Open supplier electrical fiche ↗</a>`:`<a href="exploded.html">Open front-fork parts explorer ↗</a>`}<a href="catalogue.html">In-app 2018 catalogue ↗</a></div><p class="hint">External suppliers may be inaccessible. This is a candidate part number; confirm model, market, supersession and fitment before ordering. No individual product link is claimed without verification.</p>`;
 panel.scrollIntoView({block:'nearest'});
}
function render(){
 $('fuseCount').textContent=data.fuses.length;
 $('fuses').innerHTML=data.fuses.map(f=>`<tr><td><span class="pill">${f.position}</span></td><td>${clean(f.circuit)}</td><td><strong>${clean(f.amp)} A</strong></td><td>${srcButton(f.page,'p.'+f.page+' ↗')}</td></tr>`).join('');
 $('drawings').innerHTML=data.diagrams.map(d=>`<div class="diagram"><b>${clean(d.name)}</b><small>Triumph 2016 T120 service manual p.${clean(d.page)}</small><p>${clean(d.note)}</p><div class="actions">${srcButton(d.page,'Open original source p.'+d.page+' ↗')}</div></div>`).join('');
 $('harnessCount').textContent=data.harnessItems.length;
 const viewHarness=()=>{
  const q=$('harnessSearch').value.trim().toLowerCase();
  const hits=data.harnessItems.filter(x=>(x.label+' '+x.category+' '+x.callout).toLowerCase().includes(q));
  $('harness').innerHTML=hits.length?hits.map(x=>`<div class="unit"><div><b>${clean(x.label)}</b><br/><small>${clean(x.category)} · original harness legend p.${x.page}</small></div><div class="unit-actions"><span class="part-code">#${x.callout}</span>${srcButton(x.page,'View legend ↗')}</div></div>`).join(''):'<p class="empty">No matching harness references.</p>';
 };
 $('harnessSearch').addEventListener('input',viewHarness);viewHarness();
 const electricalParts=data.candidateParts.filter(x=>x.assembly==='Electrical Equipment');
 $('partCount').textContent=electricalParts.length;
 const viewParts=()=>{
  const q=$('partsSearch').value.trim().toLowerCase();
  const hits=electricalParts.filter(x=>(x.name+' '+x.partNumber+' '+x.assembly).toLowerCase().includes(q));
  $('electricalParts').innerHTML=hits.length?hits.map(x=>`<div class="unit"><div><button class="part-select" type="button" data-part="${clean(x.partNumber)}">${clean(x.name)}</button><br/><small>${clean(x.assembly)} · confirm exact variant</small></div><div class="unit-actions"><span class="part-code">${clean(x.partNumber)}</span><button class="source-button inline" type="button" data-part="${clean(x.partNumber)}">Part details ↗</button></div></div>`).join(''):'<p class="empty">No matching electrical parts.</p>';
 };
 $('partsSearch').addEventListener('input',viewParts);viewParts();
 // Fork stanchion variants are kept in the source database but moved out of the Electrical Equipment UI.
 $('status').textContent=`${data.fuses.length} fuse references · ${data.diagrams.length} wiring source pages · ${data.harnessItems.length} harness components · ${electricalParts.length} electrical catalogue candidates. No private identifiers stored.`;
}
async function boot(){
 try{
  const res=await fetch('./data/electrical-reference.json',{cache:'no-cache'});
  if(!res.ok)throw new Error('HTTP '+res.status);
  data=await res.json();
  if(!Array.isArray(data.fuses)||!Array.isArray(data.harnessItems)||!Array.isArray(data.diagrams)||!Array.isArray(data.candidateParts))throw new Error('Invalid reference data');
  render();
 }catch(e){$('status').textContent='Electrical data did not load: '+e.message+' — open this site from a web server rather than file://.'}
}
boot();
