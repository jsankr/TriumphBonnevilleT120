import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const parts=JSON.parse(readFileSync(new URL('../parts.json',import.meta.url),'utf8'));
assert(parts.length===30,'Expected 30 audited assembly-level records');
assert.equal(new Set(parts.map(p=>p.id)).size,parts.length,'Duplicate IDs');
for(const p of parts){
 assert(p.id&&p.name&&p.group,`Incomplete record: ${p.id}`);
 assert(p.torqueEvidence?.status,`Missing evidence state: ${p.id}`);
 if(p.fastenerTorqueNm!==null&&p.fastenerTorqueNm!==undefined)assert.fail(`Fastener torque not independently vetted: ${p.id}`);
}
assert(parts.find(p=>p.id==='front-brake')?.name.includes('Nissin'));
assert(parts.find(p=>p.id==='rear-brake')?.name.includes('Nissin'));
assert(parts.some(p=>p.id==='forks')&&parts.some(p=>p.id==='rear-shocks'));
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert(!/three\.js|GLTFLoader|blender/i.test(html.replace(/no blender/ig,'')),'Unexpected 3D dependencies in page');
console.log('PASS: 30 unique parts; Nissin brake and fork/shock records; tool/torque guard; no Blender/Three.js dependencies.');
