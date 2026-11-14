// Copyright-safe, evidence-bound component lookups. Source values are 2016 T120 references,
// NEVER verified 2018 VIN-specific repair instructions. No vehicle identifier is stored.
const pairs=[
  ['fuel-tank','65:1,65:2',''],
  ['seat','73:21',''],
  ['headlight','74:13,74:31',''],
  ['front-wheel','69:1,69:2,72:2','T3880053,T3880075'],
  ['front-brake','72:2,72:10',''],
  ['forks','67:1,67:2,67:3,67:5,67:6,67:16,69:2','3880160-T0301,T3880184,T3880171,T3880633'],
  ['radiator','64:1,64:8','T3880147,T3880176'],
  ['engine','57:1,60:1,73:7,73:8','T3880377'],
  ['exhaust','65:7,65:9,65:10,65:12,65:17,65:18',''],
  ['rear-wheel','69:3,69:4,69:5','T3880053,T3880075'],
  ['rear-brake','71:1,71:8,71:9,71:11',''],
  ['chain','68:3,68:4,68:5,69:4,61:1','T3880635'],
  ['swingarm','68:1,68:2','T3880104'],
  ['battery','',''],
  ['airbox','65:19,65:20,65:36','T3880207'],
  ['throttle','65:29,66:6','T3880001'],
  ['clutch','58:1,58:2,58:3,60:1','T3880307'],
  ['gearbox','61:1,61:10',''],
  ['instruments','74:20,74:21,74:22',''],
  ['front-indicators','74:16',''],
  ['rear-light','74:14,74:15',''],
  ['frame','73:13,73:14','T3880377'],
  ['side-stand','73:5,73:6',''],
  ['oil-filter','62:4','T3880313'],
  ['spark-plugs','57:9',''],
  ['sump-plug','60:12',''],
  ['coolant-tank','64:3',''],
  ['rear-shocks','68:6,68:7',''],
  ['front-master','',''],
  ['abs','72:1,72:2,72:3,72:7,72:9,72:10','']
];
export const COMPONENT_REFERENCE_IDS=Object.fromEntries(pairs.map(([id,torques,tools])=>[id,{
 torques:torques?torques.split(',').map(x=>{const [p,r]=x.split(':');return 'SM2016-P'+p+'-R'+r}):[],
 tools:tools?tools.split(','):[]
}]));
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openPage(page,source='service2016'){
 return '<button type="button" class="source-open ce-page" data-source="'+clean(source)+'" data-page="'+Number(page)+'">Read original p.'+Number(page)+' ↗</button>';
}
export function relatedComponentEvidence(id,data){
 const spec=COMPONENT_REFERENCE_IDS[id]||{torques:[],tools:[]};
 if(!data||!Array.isArray(data.torqueSettings)||!Array.isArray(data.specialServiceTools))return {available:false,torques:[],tools:[],missing:[],procedures:[]};
 const tq=new Map(data.torqueSettings.map(r=>[r.id,r]));
 const st=new Map(data.specialServiceTools.map(r=>[r.partNumber,r]));
 return {available:true,torques:spec.torques.map(k=>tq.get(k)).filter(Boolean),
   tools:spec.tools.map(k=>st.get(k)).filter(Boolean),
   missing:spec.torques.filter(k=>!tq.has(k)).concat(spec.tools.filter(k=>!st.has(k))),
   procedures:id==='front-brake'?[{part:'Front caliper mounting bolts',valueText:'21 Nm',sourceId:'service2016',page:611,notes:'2016 T120 front-wheel installation procedure, not independently verified for 2018.'}]:[]};
}
export function renderComponentEvidence(part,data){
 const r=relatedComponentEvidence(part.id,data);
 if(!r.available)return '<div class="ce-alert">Source database unavailable. No torque or tool size can be inferred.</div>';
 let html='<section class="ce-details"><h4>DOCUMENTED 2016 T120 REFERENCES ('+(r.torques.length+r.procedures.length)+')</h4>';
 html+='<p class="ce-alert"><strong>2018 fitment is NOT confirmed.</strong> These values apply to separate named fasteners in a 2016 T120 manual and must be checked against the correct market, revision, and fitted aftermarket equipment before use.</p>';
 for(const v of r.torques.concat(r.procedures)){
  const val=v.torqueNm===null?'Procedure required':(v.valueText||'See procedure');
  html+='<div class="ce-record"><div><strong>'+clean(v.part)+'</strong><small>'+clean(v.notes||'2016 T120 manual reference')+'</small></div><div class="ce-right"><b>'+clean(val)+'</b>'+openPage(v.page,v.sourceId)+'</div></div>';
 }
 if(!r.torques.length&&!r.procedures.length)html+='<p class="ce-empty">No matched torque has been established for this assembly.</p>';
 html+='<h4>SPECIAL SERVICE TOOLS ('+r.tools.length+')</h4>';
 for(const t of r.tools){
  html+='<div class="ce-record"><div><strong>'+clean(t.description)+'</strong><small>Triumph tool '+clean(t.partNumber)+' · Special-tools register, not proof of a removal socket size</small></div><div class="ce-right">'+openPage(t.page,t.sourceId)+'</div></div>';
 }
 if(!r.tools.length)html+='<p class="ce-empty">No specialist tool assigned from the indexed tools list.</p>';
 html+='<p class="ce-alert"><strong>Hex / socket / driver size: NOT VERIFIED.</strong> The torque table and special-tool list do not establish which bit fits each fastener. Examine the applicable repair procedure and actual fastener; do not infer from a photo or torque value.</p>';
 if(part.id==='front-master')html+='<p class="ce-alert">The p.70 “Front Brakes” table has unrelated engine-cover rows; those figures remain quarantined, not front-master-cylinder torques.</p>';
 if(part.id==='front-wheel'||part.id==='rear-wheel')html+='<p class="ce-empty">Wheel-bearing service tools shown above are not spindle removal sockets.</p>';
 if(r.missing.length)html+='<p class="ce-alert">Unresolved indexed reference: '+clean(r.missing.join(', '))+'</p>';
 html+='<p class="ce-empty">Use “My PDF library” to load your own manual locally and open the cited original page. <a href="#referenceDesk">Browse the complete reference desk</a>.</p></section>';
 return html;
}