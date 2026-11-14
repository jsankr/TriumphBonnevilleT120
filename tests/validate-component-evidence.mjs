import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMPONENT_REFERENCE_IDS, relatedComponentEvidence, renderComponentEvidence} from '../component-evidence.js';
const p=JSON.parse(readFileSync(new URL('../parts.json',import.meta.url),'utf8'));
const d=JSON.parse(readFileSync(new URL('../data/source-reference.json',import.meta.url),'utf8'));
assert.deepEqual(p.map(x=>x.id).sort(), Object.keys(COMPONENT_REFERENCE_IDS).sort(), 'Every assembly must be mapped explicitly');
for(const part of p){
 const r=relatedComponentEvidence(part.id,d);
 assert(r.available, 'Reference database missing');
 assert.deepEqual(r.missing,[],part.id+': missing referenced ID');
 for(const t of r.torques) {
  assert.equal(t.sourceId,'service2016');
  assert(!d.quarantinedTorquePage70.some(q=>q.id===t.id),'Quarantined row reused');
  assert(Number.isInteger(t.page)&&t.page>=1&&t.page<=728);
 }
}
assert.match(renderComponentEvidence({id:'front-wheel'},d),/65 Nm/);
assert.match(renderComponentEvidence({id:'front-wheel'},d),/23 Nm/);
assert.match(renderComponentEvidence({id:'front-brake'},d),/21 Nm/);
assert.match(renderComponentEvidence({id:'rear-shocks'},d),/28 Nm/);
assert.match(renderComponentEvidence({id:'front-master'},d),/quarantined/);
assert.match(renderComponentEvidence({id:'oil-filter'},d),/T3880313/);
assert.match(renderComponentEvidence({id:'front-brake'},d),/NOT confirmed/);
console.log('PASS: '+p.length+' assemblies, source-linked torques, tools and quarantine rules');
