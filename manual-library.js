const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let index,audit,current='service2016',tab='pages',page=0;
const pageSize=40,localPdfs={};
const matching=(record,query)=>!query||JSON.stringify(record).toLowerCase().includes(query);
const selectedDoc=()=>index.documents.find(d=>d.id===current);
let pendingPage=null;
function openPage(number){
 const n=Number(number);if(!Number.isInteger(n)||n<1||n>selectedDoc().pages){$('#manualNotice').textContent='Invalid source page.';return}
 const link=localPdfs[current];
 if(!link){pendingPage={doc:current,page:n};$('#manualNotice').textContent=`Select your original ${selectedDoc().name} PDF to open page ${n} privately.`;$('#manualUpload').click();return}
 let open=$('#manualOpenLink');
 if(!open){open=document.createElement('a');open.id='manualOpenLink';open.target='_blank';open.rel='noopener noreferrer';open.style.marginLeft='12px';$('#manualUpload').insertAdjacentElement('afterend',open)}
 open.href=link+'#page='+n;open.textContent=`Open selected PDF at page ${n} ↗`;
 $('#manualNotice').textContent=`Source page ${n} is ready. Click the Open PDF link beside the file chooser. PDF viewers may ignore #page; use the viewer page control.`;
}
function row(title,subtitle,details,pageNumber){const safePage=Number.isInteger(Number(pageNumber))?Number(pageNumber):1;return `<div class="record"><div><h3>${esc(title)}</h3><p class="subtitle">${esc(subtitle)}</p><p>${esc(details)}</p></div><button data-page="${safePage}">PDF page ${safePage} ↗</button></div>`;}
function render(){if(!index||!audit)return;
const query=$('#manualSearch').value.trim().toLowerCase();let matches=[];
if(tab==='pages')matches=index.pageIndex.filter(r=>r.document===current&&matching(r,query)).map(r=>({page:r.page,html:row(r.section||'Page '+r.page,(r.topics||[]).join(' • '),selectedDoc().edition,r.page)}));
if(tab==='torques'&&current==='service2016')matches=audit.torqueSettings.filter(r=>matching(r,query)).map(r=>({page:r.page,html:row(r.part,r.category,`${r.valueText} · April 2016 T120 only · 2018 VIN not verified · tool size unverified${r.notes?' · '+r.notes:''}`,r.page)}));
if(tab==='tools'&&current==='service2016')matches=audit.specialServiceTools.filter(r=>matching(r,query)).map(r=>({page:r.page,html:row(r.partNumber,r.description,'2016 special-service-tool identification; socket/bit size not inferred',r.page)}));
if(tab==='schedule'&&current==='service2016')matches=audit.scheduledMaintenance.filter(r=>matching(r,query)).map(r=>({page:r.page,html:row(r.task,r.category,`${r.frequencyText||'2016 service schedule'} · verify your 2018 VIN/manual`,r.page)}));
const pg=Math.max(1,Math.ceil(matches.length/pageSize));page=Math.min(page,pg-1);
$('#manualCount').textContent=`${matches.length} matching entries · ${selectedDoc().pages} source pages · ${selectedDoc().edition}`;
let warning=current.startsWith('older')?'<p class="unsafe">HISTORICAL DOCUMENT — Do not transfer these specifications to a 2018 T120.</p>':'';
if(tab==='torques'&&current==='service2016')warning+='<p class="unsafe">13 page-70 rows have been excluded from the active torque register because the source table is inconsistently labelled. Refer to the original for context. The applicable 2018 VIN has not been checked.</p>';
const start=page*pageSize;
$('#manualResults').innerHTML=warning+matches.slice(start,start+pageSize).map(r=>r.html).join('')+(matches.length?'':'<p class="empty">No matching entries. Try another search or switch to All pages.</p>')+`<div class="pager"><button id="prev" ${page===0?'disabled':''}>← Previous</button><span>${page+1} / ${pg}</span><button id="next" ${page>=pg-1?'disabled':''}>Next →</button></div>`;
$('#manualResults').querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>openPage(+b.dataset.page)));
$('#prev').onclick=()=>{page--;render()};$('#next').onclick=()=>{page++;render()};
}
async function init(){try{const [i,a]=await Promise.all([fetch('./manual-page-index.json'),fetch('./data/source-reference.json')]);if(!i.ok||!a.ok)throw Error('Cannot load source data');index=await i.json();audit=await a.json();if(index.pageIndex.length!==894||audit.torqueSettings.length!==230||audit.quarantinedTorquePage70.length!==13||audit.scheduledMaintenance.length!==44||audit.specialServiceTools.length!==37)throw Error('Evidence counts do not match the source audit');}catch(e){$('#manualNotice').textContent='ERROR: '+e.message;return;}
$('#manualDoc').onchange=e=>{current=e.target.value;page=0;render()};$('#manualSearch').oninput=()=>{page=0;render()};
document.querySelectorAll('[data-manual-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.manualTab;page=0;document.querySelectorAll('[data-manual-tab]').forEach(x=>x.classList.toggle('active',x===b));render()});
$('#manualUpload').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){$('#manualNotice').textContent='Choose a PDF file.';return;}if(file.size>75*1024*1024){$('#manualNotice').textContent='Document exceeds 75 MB local file limit.';return;}
 const signature=new Uint8Array(await file.slice(0,5).arrayBuffer());
 if(String.fromCharCode(...signature)!=='%PDF-'){$('#manualNotice').textContent='Invalid PDF signature.';return;}
 if(localPdfs[current])URL.revokeObjectURL(localPdfs[current]);localPdfs[current]=URL.createObjectURL(file);
 $('#manualNotice').textContent=`Loaded ${file.name} locally for ${selectedDoc().name}. Verify this is the correct edition.`;
 if(pendingPage?.doc===current){const pg=pendingPage.page;pendingPage=null;openPage(pg)};};
window.addEventListener('beforeunload',()=>Object.values(localPdfs).forEach(url=>URL.revokeObjectURL(url)));render();}
init();
