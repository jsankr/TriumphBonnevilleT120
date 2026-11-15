import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'electrical.html'),'utf8');
const js=readFileSync(resolve(root,'electrical.js'),'utf8');
const data=JSON.parse(readFileSync(resolve(root,'data/electrical-reference.json'),'utf8'));
assert.equal(data.fuses.length,9);
assert.equal(data.diagrams.length,6);
assert.equal(data.harnessItems.length,51);
assert.equal(data.candidateParts.filter(x=>x.assembly==='Electrical Equipment').length,8);
assert(!html.includes('window.fetch=async'), 'no monkey-patched fetch allowed');
assert(html.includes('src="electrical.js"'), 'live page must load maintained controller');
assert(js.includes('data/electrical-reference.json'), 'controller must load curated standalone JSON data');
for(const label of ['fusePanel','partsPanel','drawingPanel','harnessPanel','selectedPart','pdfStatus'])assert(html.includes(`id="${label}"`),`Missing UI ${label}`);
for(const feature of ['requestPage(', 'openLocal(', 'picker.click()', 'srcButton(', 'showPart(', 'unit-actions', 'data-page=', 'data-part='])assert(js.includes(feature),`Missing navigation feature ${feature}`);
assert(html.includes('service manual')&&html.includes('2016'));
const markup=html;
for(const [,href] of markup.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)){
 assert(href && href!=='#'&&!href.startsWith('javascript:'),`Invalid link ${href}`);
 if(href.startsWith('http'))continue;
 const [file,anchor]=href.split('#');
 if(file)assert(existsSync(resolve(root,file)),`Missing local link target ${href}`);
 if(anchor&&(!file||file==='electrical.html'))assert(html.includes(`id="${anchor}"`),`Missing anchor ${href}`);
}
console.log('Electrical links audit passed: 9 fuses, 6 source diagrams, 51 harness components, 8 electrical candidate details; all static internal links valid.');
