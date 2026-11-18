// Guards the multi-model data (data/models.json, data/models/*.json) and keeps it in step with model.js.
// Every torque must name a source in the file's own source list; every photo must be openly licensed;
// no dealer prices may be stored (AGENTS.md: no live price claims).
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const text=p=>readFileSync(new URL(p,root),'utf8');
const read=p=>JSON.parse(text(p));

const reg=read('data/models.json');
const jsIds=[...text('model.js').matchAll(/id:'([a-z0-9-]+)'/g)].map(m=>m[1]);
assert.deepEqual(jsIds,reg.models.map(m=>m.id),'model.js and data/models.json list different models');
assert.equal(reg.default,'t120-2018');
assert.equal(reg.models.find(m=>m.id===reg.default).data,null,'the T120 keeps its own data files');

const TIERS=new Set(['triumph','aftermarket','forum']);
let totalOps=0,totalParts=0,totalPins=0,totalLinks=0;
for(const entry of reg.models.filter(m=>m.data)){
 assert.match(entry.data,/^data\/models\/[a-z0-9-]+\.json$/);
 const raw=text(entry.data);
 assert(!/priceUSD|\$\d/.test(raw),`${entry.id}: dealer prices must not be stored`);
 const m=JSON.parse(raw);
 assert.equal(m.id,entry.id);
 for(const k of ['name','years','catalogueLabel','notice','sources','specs','maintenance','assemblies','map'])assert(m[k],`${m.id}: ${k} missing`);
 for(const [k,s] of Object.entries(m.sources)){assert(TIERS.has(s.tier),`${m.id}: source ${k} tier`);assert(s.url.startsWith('https://')&&s.title&&s.short,`${m.id}: source ${k} incomplete`)}
 // Specs: all from the handbook, each with a page
 for(const s of m.specs){assert.equal(s.source,'handbook');assert(Number.isInteger(s.page)&&s.page>=60&&s.page<=125,`${m.id}: spec ${s.name} page`);assert(s.value&&s.group)}
 for(const g of m.specGroups)assert(m.specs.some(s=>s.group===g),`${m.id}: empty spec group ${g}`);
 // Maintenance chart
 const svc=m.maintenance.services.map(s=>s.key);
 assert.deepEqual(svc,['day','service800km','serviceA','serviceB','serviceC','serviceD']);
 for(const r of m.maintenance.rows){assert([63,64].includes(r.page),`${m.id}: ${r.task} page`);for(const k of svc.slice(1))assert.equal(typeof r[k],'boolean',`${m.id}: ${r.task} ${k}`)}
 assert.equal(m.maintenance.rows.length,36,`${m.id}: handbook chart has 36 rows`);
 // Assemblies and torques
 const A=new Map(m.assemblies.map(a=>[a.id,a]));
 assert.equal(A.size,8);
 for(const a of m.assemblies){
  assert(a.parts.length>5,`${a.id}: parts`);totalParts+=a.parts.length;
  assert(a.oemFicheUrl.startsWith('https://www.triumphestore.com/catalog/assembly/'),`${a.id}: catalogue link`);
  for(const p of a.parts){assert(/^(T\d{7}|\d{7}-T\d{4})$/.test(p.partNumber),`${a.id}: part number ${p.partNumber}`);assert(p.callout&&p.name)}
  for(const o of a.operations){totalOps++;
   assert(m.sources[o.source],`${a.id}: ${o.label} source ${o.source} unknown`);
   assert(typeof o.torqueNm==='number'&&o.torqueNm>0&&o.torqueNm<200,`${a.id}: ${o.label} value`);
   assert.equal(o.toolDriveSize,null);
   if(m.sources[o.source].tier==='triumph')assert(Number.isInteger(o.page),`${a.id}: ${o.label} needs the Triumph page`);
   for(const x of o.alternatives||[])assert(m.sources[x.source]&&typeof x.torqueNm==='number',`${a.id}: ${o.label} alternative`);
  }
 }
 // Values traced to Triumph documents must not drift
 const op=(a,l)=>A.get(a).operations.find(o=>o.label===l);
 assert.equal(op('rear-wheel','Rear wheel spindle nut').torqueNm,85);assert.equal(op('rear-wheel','Rear wheel spindle nut').page,76);
 assert.equal(op('rear-wheel','Chain adjusters').torqueNm,5);
 assert.equal(op('engine-covers','Clutch cover bolts').torqueNm,8);assert.equal(op('engine-covers','Clutch cover bolts').source,'tn162');
 assert.equal(op('engine-covers','Alternator cover bolts').torqueNm,8);
 assert(!m.assemblies.some(a=>a.operations.some(o=>o.torqueNm===7&&/reservoir/i.test(o.label))),'the 7 Nm reservoir cover figure is Scrambler-only');
 // Photo map
 const map=m.map;
 for(const [k,v] of Object.entries(map.views)){
  assert(existsSync(new URL(v.image,root)),`${m.id}/${k}: photo missing`);assert(existsSync(new URL(v.hero,root)),`${m.id}/${k}: hero missing`);
  assert(/^CC BY/.test(v.credit.licence)&&v.credit.licenceUrl.startsWith('https://creativecommons.org/'),`${m.id}/${k}: open licence`);
  assert(v.credit.author&&v.credit.source.startsWith('https://commons.wikimedia.org/wiki/File:'),`${m.id}/${k}: credit`);
  assert(/not the owner's motorcycle/.test(v.relevance),`${m.id}/${k}: must say it is not the owner's motorcycle`);
  assert(v.alt&&v.alt.length>30);
 }
 for(const p of map.placements){assert(A.has(p.assembly));assert(map.views[p.view]);assert(/^M[-\d.]/.test(p.shape));assert(p.lift.length===2)}
 for(const id of A.keys())assert(map.placements.some(p=>p.assembly===id)||map.notVisible?.[id],`${m.id}: ${id} neither placed nor explained`);
 for(const p of map.pins){totalPins++;
  assert(A.get(p.assembly).parts.some(q=>q.callout===p.callout),`${m.id}: pin ${p.assembly}#${p.callout}`);
  assert(map.placements.some(q=>q.assembly===p.assembly&&q.view===p.view),`${m.id}: pin ${p.assembly}#${p.callout} has no outline`);
  const v=map.views[p.view];assert(p.x>=0&&p.x<=v.width&&p.y>=0&&p.y<=v.height,`${m.id}: pin outside photo`);
 }
 for(const [id,byC] of Object.entries(map.calloutLinks))for(const [c,list] of Object.entries(byC)){
  assert(A.get(id).parts.some(q=>q.callout===c),`${m.id}: link ${id}#${c}`);
  for(const l of list){totalLinks++;assert(['named','inferred'].includes(l.kind));assert(l.basis.length>8);assert(A.get(id).operations[l.op],`${m.id}: link ${id}#${c} op`)}
 }
 for(const r of m.toolReports){assert(A.get(r.assembly).parts.some(q=>q.callout===r.callout),r.id);assert(A.get(r.assembly).operations[r.op],r.id);
  assert(['forum','vendor-guide'].includes(r.kind)&&r.url.startsWith('https://')&&r.tool&&r.fits&&r.sourceTitle,r.id)}
}
console.log(`Models PASS: ${reg.models.length} models, ${totalParts} catalogue part rows, ${totalOps} sourced torque values, ${totalLinks} callout links, ${totalPins} photo markers.`);
