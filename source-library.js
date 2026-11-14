// Private local-PDF reader, factual source index and source-page lookup.
// User-supplied PDFs are processed locally by the browser and NEVER uploaded.
const $ = id => document.getElementById(id);
const clean = input => String(input ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const liveFiles = new Map();
let library = null;
let pdfjs = null;
let selectedDataset = 'torque';
let displayLimit = 30;
let activeSearchToken = 0;
const warning = '2016 T120 reference only. Confirm applicability to your 2018 VIN, market, and fitted aftermarket parts before service.';
const keys = ['service2016','owner2016','sheet2012','checklist2006'];
const datasetKeys = {torque:'torqueSettings',maintenance:'scheduledMaintenance',specs:'t120OwnerSpecs',tools:'specialServiceTools'};
function sourceBadge(id){ return id === 'service2016' ? '2016 SERVICE' : id === 'owner2016' ? '2016 OWNER' : 'HISTORICAL — NOT T120'; }
function makeSourceButton(id,page){
  return `<button type="button" class="source-open" data-source="${clean(id)}" data-page="${Number(page)}">${clean(sourceBadge(id))} · p.${Number(page)} ↗</button>`;
}
function renderCounts(){
  if (!library)return;
  for(const [id,key] of Object.entries(datasetKeys)){
   const el = $(id+'Count'); if(el)el.textContent = String(library[key].length);
  }
  $('libraryStatus').textContent=`${library.torqueSettings.length} active torque entries · ${library.quarantinedTorquePage70.length} quarantined · ${library.scheduledMaintenance.length} schedule entries · 4 source documents`;
}
function renderChapters(){
 const rows=[...library.serviceChapters.map(c=>({...c,id:'service2016'})),...library.ownerChapters.map(c=>({...c,id:'owner2016'}))];
 $('chapterDirectory').innerHTML=rows.map(c=>`<button class="chapter-item source-open" data-source="${c.id}" data-page="${c.start}" type="button"><b>${clean(c.title)}</b><small>${c.id==='service2016'?'Service Manual':'Owner’s Handbook'} · pp.${c.start}–${c.end}</small></button>`).join('');
 $('pageSource').innerHTML=keys.map(id=>`<option value="${id}">${clean(library.sources[id].title)}</option>`).join('');
}
function docsList(){
 if(!library)return;
 $('documentRows').innerHTML=keys.map(id=>{
  const src=library.sources[id], added=liveFiles.has(id);
  const label=added?'LOADED PRIVATELY':'SELECT YOUR PDF';
  return `<div class="doc-row"><div><strong>${clean(src.title)}</strong><small>${clean(src.edition)} · ${src.pages} pages · ${clean(src.scope)}</small></div><span class="doc-status ${added?'ok':id.endsWith('2012')||id.endsWith('2006')?'old':''}">${label}</span>${added?`<button class="source-open" data-source="${id}" data-page="1" type="button">Open ↗</button>`:`<label class="source-open" style="cursor:pointer">Choose PDF<input type="file" accept=".pdf,application/pdf" data-file-for="${id}" style="display:none"/></label>`}</div>`;
 }).join('');
 $('docPicker').innerHTML='<option value="all">All loaded documents</option>'+keys.map(id=>`<option value="${id}" ${liveFiles.has(id)?'':'disabled'}>${clean(library.sources[id].title)}</option>`).join('');
 $('manualSearch').disabled=liveFiles.size===0;
}
function filteredData(){
 if(!library)return [];
 const q=$('referenceQuery').value.trim().toLowerCase();
 const data=library[datasetKeys[selectedDataset]] || [];
 return data.filter(item=>{
  const text=JSON.stringify(item).toLowerCase();
  return !q || q.split(/\s+/).every(w=>text.includes(w));
 });
}
function renderRows(){
 if(!library)return;
 document.querySelectorAll('.reference-tab').forEach(el=>{
   const active=el.dataset.dataset===selectedDataset;
   el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));
 });
 const all=filteredData(); const data=all.slice(0,displayLimit);
 let html='';
 for(const r of data){
  if(selectedDataset==='torque'){
   html+=`<article class="reference-row"><div><b>${clean(r.part)}</b><small>${clean(r.category)} · ${clean(r.notes||'No additional row note')}</small></div><strong class="spec-value ${r.torqueNm===null?'unverified':''}">${r.torqueNm===null?'Refer to procedure':`${r.torqueNm} Nm`}</strong><span>${makeSourceButton(r.sourceId,r.page)}<small>Tool size: not established by torque table</small></span></article>`;
  }else if(selectedDataset==='maintenance'){
   const tags=[r.frequencyText==='Day'?'Daily':r.frequencyText&&r.frequencyText!=='-'?r.frequencyText:null,r.service800km?'First 800 km':null,r.annual?'Annual':null,r.service16000_48000km?'16k/48k km':null,r.service32000km?'32k km':null,r.service64000km?'64k km':null].filter(Boolean).join(' · ');
   html+=`<article class="reference-row"><div><b>${clean(r.task)}</b><small>${clean(r.category)} · ${clean(tags||'See full table')}</small></div><span class="source-status">2016 schedule</span><span>${makeSourceButton(r.sourceId,r.page)}</span></article>`;
  }else if(selectedDataset==='specs'){
   html+=`<article class="reference-row"><div><b>${clean(r.name)}</b><small>T120 column · 2016 owner’s handbook</small></div><strong class="spec-value">${clean(r.value)}</strong><span>${makeSourceButton(r.sourceId,r.page)}</span></article>`;
  }else{
   html+=`<article class="reference-row"><div><b>${clean(r.partNumber)}</b><small>${clean(r.description)} · Exact procedure-to-tool fitment not inferred</small></div><span class="source-status">Special tool</span><span>${makeSourceButton(r.sourceId,r.page)}</span></article>`;
  }
 }
 $('referenceResults').innerHTML=html || '<p class="library-note">No matching source records.</p>';
 $('referenceCount').textContent=`Showing ${data.length} of ${all.length}`;
 $('referenceMore').hidden=all.length<=displayLimit;
}
function showSourceWarning(message){$('manualMessages').textContent=message}
async function getPdfJs(){
 if(pdfjs)return pdfjs;
 pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
 return pdfjs;
}
async function importSingleFile(file,id){
 if(!file)return;
 if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){showSourceWarning('Only PDF documents are supported.');return}
 // The user explicitly assigns this PDF to the document type. Keep source identity clearly labelled.
 const head=new Uint8Array(await file.slice(0,5).arrayBuffer());
 if(String.fromCharCode(...head)!=='%PDF-'){showSourceWarning(`${file.name}: does not have a PDF signature.`);return}
 const prev=liveFiles.get(id);
 if(prev){if(prev.doc)await prev.doc.destroy();URL.revokeObjectURL(prev.url)}
 liveFiles.set(id,{id,doc:null,file,url:URL.createObjectURL(file)});
 showSourceWarning(`Assigned ${file.name} to ${library.sources[id].title}. Pages are viewable offline. For full-text search the optional Mozilla PDF.js library must be available.`);
 docsList();
}
async function pdfForSearch(record){
 if(record.doc)return record.doc;
 const api=await getPdfJs();
 const task=api.getDocument({data:new Uint8Array(await record.file.arrayBuffer())});
 const doc=await task.promise;
 if(doc.numPages!==library.sources[record.id].pages){
   await doc.destroy();throw new Error(`${record.file.name} has ${doc.numPages} pages, expected ${library.sources[record.id].pages}. Check the document assignment to avoid incorrect source-page links.`)
 }
 record.doc=doc;
 return doc;
}
function openReference(id,page){
 const doc=liveFiles.get(id);
 const meta=library?.sources[id];
 if(!meta)return;
 if(!doc){
  $('sourceInstructions').textContent=`The ${meta.title} is not yet loaded. Select your own PDF above to open page ${page}. The file stays on this device.`;
  $('manualLibrary').scrollIntoView({behavior:'smooth',block:'start'});
  return;
 }
 const pg=Math.max(1,Math.min(meta.pages,Number(page)||1));
 $('pdfFrame').src=`${doc.url}#page=${pg}`;
 $('pdfFrame').title=`${meta.title} — page ${pg}`;
 $('pdfFrame').hidden=false;
 $('sourceInstructions').textContent=`Viewing ${meta.title}, page ${pg}. Safari and some mobile PDF viewers may ignore the #page fragment; use the page control in the PDF viewer if needed.`;
 $('manualViewer').hidden=false;
 $('manualViewer').scrollIntoView({behavior:'smooth',block:'nearest'});
 $('openManualTab').href=`${doc.url}#page=${pg}`;
}
window.T120OpenReference=openReference;
async function searchPDFs(){
 if(!liveFiles.size)return;
 const needle=$('manualSearchText').value.trim().toLocaleLowerCase();
 if(needle.length<2){showSourceWarning('Enter at least two characters to search full documents.');return}
 const selected=$('docPicker').value;
 const searchSet=selected==='all'?[...liveFiles.values()]:[liveFiles.get(selected)].filter(Boolean);
 const token=++activeSearchToken;
 $('manualSearch').disabled=true;
 $('cancelManualSearch').hidden=false;
 $('manualResults').innerHTML='';
 const matches=[];
 try{
  for(const item of searchSet){
   const pdf=await pdfForSearch(item);
   for(let pg=1;pg<=pdf.numPages;pg++){
    if(token!==activeSearchToken)return;
    const page=await pdf.getPage(pg);
    const text=(await page.getTextContent()).items.map(x=>x.str).join(' ').replace(/\s+/g,' ');
    const i=text.toLocaleLowerCase().indexOf(needle);
    if(i!==-1){
     const excerpt=text.substring(Math.max(0,i-65),Math.min(text.length,i+needle.length+105));
     matches.push({id:item.id,page:pg,excerpt});
    }
    if(pg%12===0||pg===pdf.numPages){
      showSourceWarning(`Searching locally: ${library.sources[item.id].title}, page ${pg}/${pdf.numPages} — ${matches.length} matching pages`);
      await new Promise(resolve=>setTimeout(resolve,0));
    }
   }
  }
  $('manualResults').innerHTML=matches.length?matches.map(r=>`<article class="manual-hit"><b>${clean(library.sources[r.id].title)}</b> ${makeSourceButton(r.id,r.page)}<p>${clean(r.excerpt)}</p></article>`).join(''):'<p>No matches in loaded PDFs.</p>';
  showSourceWarning(`${matches.length} matching page(s), searched only within this browser. No manual pages or queries were uploaded.`);
 }catch(error){showSourceWarning(`Full-document search unavailable: ${error.message}. PDF viewing may still work.`)}
 finally{if(token===activeSearchToken){$('manualSearch').disabled=false;$('cancelManualSearch').hidden=true}}
}
async function boot(){
 try{
   const r=await fetch('./data/source-reference.json',{cache:'no-cache'});if(!r.ok)throw new Error(`HTTP ${r.status}`);
   library=await r.json();window.T120SourceReference=library;
   renderCounts();docsList();renderRows();renderChapters();
 }catch(e){$('libraryStatus').textContent=`Source database unavailable: ${e.message}`;return}
 document.querySelectorAll('.reference-tab').forEach(b=>b.addEventListener('click',()=>{selectedDataset=b.dataset.dataset;displayLimit=30;renderRows()}));
 $('referenceQuery').addEventListener('input',()=>{displayLimit=30;renderRows()});
 $('referenceMore').addEventListener('click',()=>{displayLimit+=50;renderRows()});
 document.getElementById('documentRows').addEventListener('change',e=>{const input=e.target.closest('[data-file-for]');if(input)importSingleFile(input.files?.[0],input.dataset.fileFor)});
 $('manualSearchForm').addEventListener('submit',e=>{e.preventDefault();searchPDFs()});
 $('manualJumpForm').addEventListener('submit',e=>{e.preventDefault();openReference($('pageSource').value,Number($('pageNumber').value)||1)});
 $('cancelManualSearch').addEventListener('click',()=>{activeSearchToken++;$('manualSearch').disabled=false;$('cancelManualSearch').hidden=true;showSourceWarning('Search cancelled.')});
 document.addEventListener('click',e=>{const btn=e.target.closest('.source-open');if(btn){openReference(btn.dataset.source,btn.dataset.page)}});
 $('libraryGotoTorque').addEventListener('click',()=>{$('referenceQuery').value='front wheel spindle';selectedDataset='torque';renderRows();$('referenceDesk').scrollIntoView({behavior:'smooth'})});
}
boot();
