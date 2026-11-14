import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const db=JSON.parse(readFileSync(new URL('../data/source-reference.json',import.meta.url),'utf8'));
const by=(part,page)=>db.torqueSettings.find(x=>x.part===part&&x.page===page);
assert.equal(db.sources.service2016.pages,728);
assert.equal(db.sources.owner2016.pages,162);
assert.equal(db.sources.sheet2012.pages,3);
assert.equal(db.sources.checklist2006.pages,1);
assert.equal(db.torqueSettings.length,230);
assert.equal(db.quarantinedTorquePage70.length,13);
assert(db.torqueSettings.every(x=>x.page!==70),'p70 erratum cannot leak into active dataset');
assert.equal(db.scheduledMaintenance.length,44);
assert.equal(db.t120OwnerSpecs.length,32);
assert.equal(db.specialServiceTools.length,37);
assert.equal(by('Front wheel spindle/axle bolt',69).torqueNm,65);
assert.equal(by('Fork to wheel spindle pinch bolts',69).torqueNm,23);
assert.equal(by('Rear suspension unit upper mounting bolt',68).torqueNm,28);
assert.equal(by('Rear suspension unit lower mounting bolt',68).torqueNm,28);
assert.equal(by('Brake caliper to carrier',71).torqueNm,40);
assert(db.specialServiceTools.every(x=>x.matchingFastener===null),'Cannot invent specific fastener-to-tool mappings');
assert(db.torqueSettings.every(x=>x.sourceId==='service2016'));
assert(db.scheduledMaintenance.every(x=>x.sourceId==='service2016'));
assert(db.t120OwnerSpecs.every(x=>x.sourceId==='owner2016'));
assert(db.sources.sheet2012.applicability==='historical_not_t120');
assert(db.sources.checklist2006.applicability==='historical_not_t120');
for(const [key,sections] of [['service2016',db.serviceChapters],['owner2016',db.ownerChapters]]){
 let n=0;for(const s of sections){assert.equal(s.start,n+1);assert(s.end>=s.start);n=s.end}
 assert.equal(n,db.sources[key].pages);
}
console.log(`PASS: ${db.torqueSettings.length} active torque rows, ${db.quarantinedTorquePage70.length} quarantined, ${db.scheduledMaintenance.length} maintenance rows, ${db.t120OwnerSpecs.length} owner specs, ${db.specialServiceTools.length} special tools; all original pages indexed by chapter.`);
