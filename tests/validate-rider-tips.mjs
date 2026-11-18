// Every rider trick must name a source from its own source list; handbook items must give pages.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/rider-tips.json',import.meta.url),'utf8'));
const groups=new Set(d.groups.map(g=>g.id)),ids=new Set();
for(const [k,s] of Object.entries(d.sources))assert(s.url.startsWith('https://')&&s.title&&s.short&&['triumph','press'].includes(s.tier),`source ${k}`);
for(const t of d.tips){
 assert(!ids.has(t.id),'duplicate '+t.id);ids.add(t.id);
 assert(groups.has(t.group),t.id+' group');assert(t.title&&t.why,t.id+' text');
 assert(d.sources[t.source],t.id+' source');if(t.alsoSource)assert(d.sources[t.alsoSource],t.id+' alsoSource');
 if(t.source==='ohb')assert(/^\d+(–\d+)?(, \d+(–\d+)?)*$/.test(t.pages||''),t.id+' needs handbook pages');
 assert(Array.isArray(t.steps));
}
for(const g of groups)assert(d.tips.some(t=>t.group===g),'empty group '+g);
console.log(`Rider tricks PASS: ${d.tips.length} tricks in ${groups.size} groups, every one sourced.`);
