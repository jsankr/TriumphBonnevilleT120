import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=new URL('../',import.meta.url);
const index=JSON.parse(readFileSync(new URL('manual-page-index.json',base),'utf8'));
const audit=JSON.parse(readFileSync(new URL('data/source-reference.json',base),'utf8'));
assert.equal(index.pageIndex.length,894);
assert.deepEqual(index.documents.map(d=>d.pages),[728,162,3,1]);
assert.equal(audit.torqueSettings.length,230);
assert.equal(audit.quarantinedTorquePage70.length,13);
assert.equal(audit.scheduledMaintenance.length,44);
assert.equal(audit.specialServiceTools.length,37);
assert.equal(audit.t120OwnerSpecs.length,32);
for(const d of index.documents){const pages=index.pageIndex.filter(r=>r.document===d.id).map(r=>r.page);assert.equal(pages.length,d.pages);assert.equal(new Set(pages).size,d.pages);}
assert(index.documents.filter(d=>d.id.startsWith('older')).every(d=>d.eligibleForT120References===false));
assert(!('torques' in index),'Manual page index must not contain uncurated torque records');
console.log('PASS: 894 indexed pages, 230 audited torque rows, 13 quarantined, 44 service rows, 37 tools, 32 owner specs');