/* Local-only photo annotations. Never collect, render, log, or transmit a vehicle identifier. */
const angles = [
  {id:'left',name:'Left side'}, {id:'right',name:'Right side'},
  {id:'front34',name:'Front ¾'}, {id:'rear34',name:'Rear ¾'},
  {id:'front',name:'Front'}, {id:'rear',name:'Rear'},
  {id:'frontbrake',name:'Front wheel & brakes'}, {id:'rearsusp',name:'Rear suspension'},
  {id:'engineleft',name:'Engine · left'}, {id:'engineright',name:'Engine · right'},
  {id:'cockpit',name:'Cockpit'}, {id:'rearbrake',name:'Rear wheel & brakes'}
];
const stages = [
  {id:'assembled',name:'Assembled'}, {id:'exposed',name:'Panels removed'},
  {id:'disassembled',name:'Parts removed'}, {id:'exploded',name:'Exploded / laid out'}
];
const $ = id => document.getElementById(id);
const state = {angle:'left',stage:'assembled',partId:null,placing:false,parts:[],manual:null,images:new Map(),markers:new Map(),references:[]};
const key=()=>`${state.angle}:${state.stage}`;
const escapeHtml = s => String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const closeObjects=()=>{ for(const u of state.images.values()) URL.revokeObjectURL(u); };
window.addEventListener('pagehide', closeObjects, {once:true});
function buttons(container,data,field){
  $(container).replaceChildren();
  for(const item of data){
    const b=document.createElement('button');b.type='button';b.textContent=item.name;
    b.dataset.id=item.id;b.className=item.id===state[field]?'active':'';
    b.setAttribute('aria-pressed',String(item.id===state[field]));
    b.addEventListener('click',()=>{state[field]=item.id;state.placing=false;renderAll();});
    $(container).append(b);
  }
}
function imageChange(file){
  if(!file||!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)){$('photoStatus').textContent='Choose a PNG, JPEG, WebP or GIF photo (SVG is not accepted).';return;}
  if(file.size>18*1024*1024){$('photoStatus').textContent='Image exceeds the 18 MB per-photo limit.';return;}
  const k=key(),prev=state.images.get(k);if(prev)URL.revokeObjectURL(prev);
  state.images.set(k,URL.createObjectURL(file));
  state.placing=false;renderAll();
  $('photoInput').value='';$('emptyPhotoInput').value='';
}
function renderImage(){
  const localUri=state.images.get(key());
  const ref=state.stage==='assembled' ? state.references.find(x=>x.angle===state.angle && x.confidence!=='Older reference') : null;
  const trustedRef = ref && /^https:\/\//i.test(ref.image||'') && /^https:\/\//i.test(ref.page||'');
  const uri=localUri || (trustedRef ? ref.image : null);
  const sourceLink=$('referenceSourceLink');
  sourceLink.hidden=!(trustedRef&&!localUri);
  if(trustedRef&&!localUri){sourceLink.href=ref.page;sourceLink.textContent=`Source: ${ref.publisher} ↗`;}
  const im=$('photoImage');
  const empty=$('photoEmpty');
  if(uri){im.src=uri;im.hidden=false;empty.hidden=true;
    $('photoStatus').textContent=localUri ? 'Your local photo is loaded. You may place its real part markers.' : `External 2018 model reference (${ref.publisher}); not your own motorcycle. Open original source for licence and details.`;
  } else {im.removeAttribute('src');im.hidden=true;empty.hidden=false;
    $('photoStatus').textContent='No photo loaded for this camera angle and teardown stage.';
  }
  const view=angles.find(v=>v.id===state.angle),stage=stages.find(v=>v.id===state.stage);
  $('angleTitle').textContent=view.name;$('stageTitle').textContent=`· ${stage.name}`;
  $('photoStage').classList.toggle('placing',state.placing&&!!uri);
  $('editHotspot').setAttribute('aria-pressed',String(state.placing));
  $('editHotspot').textContent=state.placing?'Tap part location (cancel)':'Place part marker';
  renderMarkers();
}
function markerPosition(photo,ev){
  const r=photo.getBoundingClientRect();
  const naturalWidth=photo.naturalWidth,naturalHeight=photo.naturalHeight;
  if(!naturalWidth||!naturalHeight)return null;
  const scale=Math.min(r.width/naturalWidth,r.height/naturalHeight);
  const drawnW=naturalWidth*scale,drawnH=naturalHeight*scale;
  const left=r.left+(r.width-drawnW)/2,top=r.top+(r.height-drawnH)/2;
  const x=(ev.clientX-left)/drawnW,y=(ev.clientY-top)/drawnH;
  if(x<0||x>1||y<0||y>1)return null;
  const stageRect=$('photoStage').getBoundingClientRect();
  return {x:Math.round(x*10000)/10000,y:Math.round(y*10000)/10000};
}
function drawPointCoordinate(marker,img){
 const r=img.getBoundingClientRect(),wrap=$('photoStage').getBoundingClientRect();
 const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return null;
 const scale=Math.min(r.width/w,r.height/h),dw=w*scale,dh=h*scale;
 const left=r.left+(r.width-dw)/2,top=r.top+(r.height-dh)/2;
 return {left:left-wrap.left+marker.x*dw,top:top-wrap.top+marker.y*dh};
}
function renderMarkers(){
 const layer=$('markers');layer.replaceChildren();const current=state.markers.get(key())||[];
 const image=$('photoImage');if(image.hidden||!image.complete||!image.naturalWidth)return;
 current.forEach((m,i)=>{
  const pos=drawPointCoordinate(m,image);if(!pos)return;
  const b=document.createElement('button');b.type='button';b.className='marker'+(m.partId===state.partId?' selected':'');
  b.textContent=String(i+1);b.style.left=`${pos.left}px`;b.style.top=`${pos.top}px`;
  b.title=state.parts.find(p=>p.id===m.partId)?.name||'Part';
  b.setAttribute('aria-label',`Select ${b.title}`);
  b.addEventListener('click',e=>{e.stopPropagation();state.partId=m.partId;state.placing=false;renderAll();});
  layer.append(b);
 });
}
function renderPartList(){
 const filter=$('partSearch').value.trim().toLowerCase(),group=$('groupSelect').value;
 const found=state.parts.filter(p=>(!group||p.group===group)&&(!filter||[p.name,p.id,p.group,p.function].some(t=>String(t||'').toLowerCase().includes(filter))));
 $('partCount').textContent=`${found.length} / ${state.parts.length}`;
 const el=$('partList');el.replaceChildren();
 for(const p of found){
  const b=document.createElement('button');b.className='part-item'+(state.partId===p.id?' active':'');b.type='button';
  const span=document.createElement('span');span.textContent=p.name;
  const small=document.createElement('small');small.textContent=p.group;
  b.append(span,small);b.addEventListener('click',()=>{state.partId=p.id;renderAll();});el.append(b);
 }
 if(!found.length){const p=document.createElement('p');p.className='muted';p.textContent='No assemblies match that search.';el.append(p);}
}
function renderDetails(){
 const p=state.parts.find(p=>p.id===state.partId),el=$('selectedPart');
 if(!p){el.innerHTML='<p class="muted">Choose a component from the searchable index. Then upload a photo and mark its real location.</p>';return;}
 const torque=p.torqueEvidence||{};
 const actualTorque=torque.status==='verified-2018-for-vin'&&Number.isFinite(torque.value)?`${torque.value} Nm`:'NOT VERIFIED for 2018 fitment';
 const size=p.toolSizeStatus==='verified-2018-for-vin'&&p.removalToolSize?String(p.removalToolSize):'NOT VERIFIED';
 const blocks=[
  ['Function',p.function],['Inspection / maintenance note',p.maintenance],['Interval reference',p.interval],
  ['Factory part number',p.partNo],['Required removal tool size',size],['Installation torque',actualTorque],
  ['Tool note (not verified)',p.tool||'No evidence'],['Torque source status',torque.status||'not verified'],
  ['Evidence note',torque.sourceNote||'No exact record linked to this component']
 ];
 el.innerHTML=`<h3>${escapeHtml(p.name)}</h3><div class="part-notice">Reference only. Verify exact installed component, fastener, source edition and service procedure before any repair. A 2016 torque search match is NOT automatically valid for your motorcycle.</div>${blocks.map(([label,value])=>`<div class="detail-block"><p class="label">${escapeHtml(label)}</p><p class="detail-value">${escapeHtml(value??'Unverified')}</p></div>`).join('')}`;
}
function searchTorques(){
 const q=$('torqueSearch').value.trim().toLowerCase(),out=$('torqueResults');
 out.replaceChildren();if(q.length<3){out.innerHTML='<p class="muted">Enter at least three characters from the exact fastener name.</p>';return;}
 const records=(state.manual?.torqueSettings||[]).filter(v=>v.part.toLowerCase().includes(q)).slice(0,40);
 if(!records.length){out.innerHTML='<p class="muted">No matching indexed fastener. This is not evidence that a torque requirement does not exist.</p>';return;}
 for(const t of records){
  const div=document.createElement('div');div.className='torque-record';
  div.innerHTML=`<strong>${escapeHtml(t.part)}</strong><span class="value">${escapeHtml(t.valueText)}</span><small>${escapeHtml(t.category)} · 2016 T120 Service Manual, PDF page ${Number(t.page)}</small><small class="caution">Reference only: applicability to 2018 motorcycle is unverified. No tool size is inferred.</small>`;
  out.append(div);
 }
 const foot=document.createElement('p');foot.className='muted';foot.textContent=`${records.length} indexed references shown (max 40). Any quarantined or conflicting values are excluded.`;out.append(foot);
}
function renderAll(){buttons('viewOptions',angles,'angle');buttons('stageOptions',stages,'stage');renderImage();renderPartList();renderDetails();}
function exportMarkers(){const m=[...state.markers.entries()].flatMap(([viewStage,markers])=>markers.map(({partId,x,y})=>({view: viewStage.split(':')[0],stage:viewStage.split(':')[1],partId,x,y})));
 const blob=new Blob([JSON.stringify({schemaVersion:1,markers:m},null,2)],{type:'application/json'});
 const uri=URL.createObjectURL(blob);const a=document.createElement('a');a.href=uri;a.download='t120-photo-markers.json';a.click();setTimeout(()=>URL.revokeObjectURL(uri),1000);
}
function attachHandlers(){
 for(const id of ['photoInput','emptyPhotoInput']) $(id).addEventListener('change',e=>imageChange(e.target.files?.[0]));
 $('photoImage').addEventListener('load',renderMarkers);
 $('photoImage').addEventListener('error',()=>{if(!state.images.has(key())){ $('photoImage').hidden=true;$('photoEmpty').hidden=false;$('photoStatus').textContent='Publisher image unavailable in this browser. Use the original source link above or upload a photo.'; }});
 window.addEventListener('resize',renderMarkers);
 $('editHotspot').addEventListener('click',()=>{if(!state.images.has(key())){$('photoStatus').textContent='Upload a photo before adding a marker.';return;}
   if(!state.partId){$('photoStatus').textContent='Select a component before placing its location marker.';return;}
   state.placing=!state.placing;renderImage();
 });
 $('photoStage').addEventListener('click',e=>{if(!state.placing||!state.partId||state.images.has(key())===false||e.target.closest('.marker'))return;
  const pos=markerPosition($('photoImage'),e);if(!pos)return;
  const current=state.markers.get(key())||[];
  const existing=current.findIndex(m=>m.partId===state.partId);
  if(existing>=0)current.splice(existing,1);
  current.push({partId:state.partId,...pos});state.markers.set(key(),current);state.placing=false;renderAll();
 });
 $('clearMarkers').addEventListener('click',()=>{state.markers.delete(key());renderMarkers();});
 $('exportAnnotations').addEventListener('click',exportMarkers);
 $('partSearch').addEventListener('input',renderPartList);
 $('groupSelect').addEventListener('change',renderPartList);
 $('torqueButton').addEventListener('click',searchTorques);
 $('torqueSearch').addEventListener('keydown',e=>{if(e.key==='Enter')searchTorques();});
}
async function init(){attachHandlers();
 try{
  const [partsResp,manualResp,refsResp]=await Promise.all([fetch('./parts.json'),fetch('./data/source-reference.json'),fetch('./data/real-reference-index.json').catch(()=>null)]);
  if(!partsResp.ok||!manualResp.ok)throw new Error('Source files unavailable');
  state.parts=await partsResp.json();state.manual=await manualResp.json();
  if(refsResp?.ok){const refs=await refsResp.json();state.references=refs.photos||[];}
  for(const g of [...new Set(state.parts.map(p=>p.group))].sort()){const opt=document.createElement('option');opt.value=g;opt.textContent=g;$('groupSelect').append(opt);}
  state.partId=state.parts.find(p=>p.id==='front-brake')?.id||state.parts[0]?.id;
  renderAll();
 }catch(e){$('partCount').textContent='Data unavailable';$('partList').innerHTML='<p class="muted">Unable to load parts or evidence data. Serve the project through HTTP or GitHub Pages.</p>';renderImage();}
}
init();
