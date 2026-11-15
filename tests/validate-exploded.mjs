import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const obj=JSON.parse(readFileSync(new URL('data/exploded-2018.json',root),'utf8'));
const sources=JSON.parse(readFileSync(new URL('data/source-reference.json',root),'utf8'));
assert.equal(obj.assemblies.length,8,'Only curated sourced assemblies may be counted');
let count=0,torque=0;
for(const a of obj.assemblies){
 assert(a.oemFicheUrl.startsWith('https://'),a.id+' lacks OEM source');
 const numbered=new Map();
 for(const part of a.parts){
  assert(/^(T|A)\d{7}$/.test(part.partNumber),'Invalid part number '+part.partNumber);
  assert(part.name.trim(),a.id+' blank part name');
  assert(part.sizeVerified===false,'Unsupported tool bit size');
  (numbered.get(part.callout)||numbered.set(part.callout,[]).get(part.callout)).push(part);
  count++;
 }
 for(const op of a.operations){
  assert(op.source.includes('2016')&&op.applicability.includes('not confirmed'),'2018 misrepresented');
  assert(op.toolDriveSize===null,'Fabricated tool size');
  if(op.referenceId.startsWith('SM2016')){
    const row=sources.torqueSettings.find(r=>r.id===op.referenceId);
    assert(row,'Missing original torque reference '+op.referenceId);
    assert.equal(row.torqueNm,op.torqueNm);
    assert.equal(row.page,op.page);
  }else assert(['manual-procedure-535','manual-procedure-611'].includes(op.referenceId),'Unverified procedure');
  torque++;
 }
 if(a.id==='rear-shocks')assert.equal(numbered.get('1')[0].quantity,2,'Two rear shocks required');
 if(a.id==='front-forks')assert.equal(numbered.get('1').length,2,'Fork production alternatives must group');
}
assert.equal(count,171);
assert.equal(torque,27);
assert(!/[A-HJ-NPR-Z0-9]{17}/.test(JSON.stringify(obj)),'VIN-like private value present');
console.log('Validated 8 assemblies, 171 real catalogue entries, 27 source-labelled torque references.');
