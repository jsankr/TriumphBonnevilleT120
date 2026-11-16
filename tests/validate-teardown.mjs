// Guards the real-photo teardown data against drift from the parts catalogue and the manual torque table.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const parts=read('data/exploded-2018.json'),map=read('data/teardown-map.json'),tools=read('data/tool-size-reports.json'),manual=read('data/source-reference.json');
const A=new Map(parts.assemblies.map(a=>[a.id,a]));
const callouts=id=>new Set(A.get(id).parts.map(p=>p.callout));
const rows=new Set(manual.torqueSettings.map(r=>r.id)),cats=new Set(manual.torqueSettings.map(r=>r.category));

for(const [k,v] of Object.entries(map.views)){
 assert(existsSync(new URL(v.image,root)),`${k}: photo file missing`);
 assert(/^CC BY/.test(v.credit.licence)&&v.credit.licenceUrl.startsWith('https://creativecommons.org/'),`${k}: photo must carry an open licence`);
 assert(v.credit.author&&(v.credit.source.startsWith('https://commons.wikimedia.org/')||v.credit.source.startsWith('https://www.flickr.com/')),`${k}: photo needs author and source`);
 assert.equal(v.frame.length,4);
}
for(const p of map.placements){assert(A.has(p.assembly),'unknown assembly '+p.assembly);assert(map.views[p.view]);assert(/^M[-\d.]/.test(p.shape))}
for(const id of A.keys())assert(map.placements.some(p=>p.assembly===id),`${id} not placed on any photo`);
for(const p of map.pins){assert(callouts(p.assembly).has(p.callout),`pin ${p.assembly}#${p.callout} not in catalogue`);assert(map.placements.some(q=>q.assembly===p.assembly&&q.view===p.view),`pin ${p.assembly}#${p.callout} has no outline on ${p.view}`)}
let links=0;
for(const [id,byCallout] of Object.entries(map.calloutLinks)){if(id.startsWith('_'))continue;
 for(const [c,list] of Object.entries(byCallout)){assert(callouts(id).has(c),`${id}#${c} not in catalogue`);
  for(const l of list){links++;assert(['named','inferred'].includes(l.kind),`${id}#${c} link kind`);assert(l.basis&&l.basis.length>8,`${id}#${c} link needs a basis`);
   if('op' in l)assert(A.get(id).operations[l.op],`${id}#${c} op ${l.op} missing`);else assert(rows.has(l.ref),`${id}#${c} ref ${l.ref} missing`)}}}
for(const [id,list] of Object.entries(map.systemCategories)){if(id.startsWith('_'))continue;for(const c of list)assert(cats.has(c),`unknown manual category ${c}`)}
for(const r of tools.reports){
 assert(A.has(r.assembly),r.id);if(r.callout!=null)assert(callouts(r.assembly).has(r.callout),r.id+' callout');
 if(r.op!=null)assert(A.get(r.assembly).operations[r.op],r.id+' op');
 assert(r.url.startsWith('https://')&&r.sourceTitle&&r.tool&&r.fits,r.id+' incomplete');
 assert(['forum','vendor-guide'].includes(r.kind),r.id+' kind');
}
// Tool sizes must never leak into the Triumph-sourced parts file
for(const a of parts.assemblies)for(const o of a.operations)assert.equal(o.toolDriveSize,null);
console.log(`Teardown PASS: ${Object.keys(map.views).length} licensed photos, ${map.placements.length} outlines, ${map.pins.length} markers, ${links} callout-to-torque links, ${tools.reports.length} sourced tool sizes.`);
