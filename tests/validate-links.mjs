import assert from 'node:assert/strict';
import{readFileSync,existsSync,readdirSync,statSync}from'node:fs';
import path from'node:path';
import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let local=0,files=0;
function walk(dir){for(const name of readdirSync(dir)){const f=path.join(dir,name);
if(statSync(f).isDirectory()){if(name!=='.git')walk(f);continue}
if(!/\.(html|md)$/.test(f))continue;
files++;const content=readFileSync(f,'utf8');
const tokens=[...content.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi),...content.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)];
for(const m of tokens){const u=m[1];if(!u||u.includes('$'+'{'))continue;
if(/^https?:\/\/oem-bike-parts\.(cz|pl|hr)\//i.test(u))throw Error('Blocked supplier URL in '+f);
if(/^(https?:|mailto:|tel:|data:|javascript:|#)/.test(u))continue;
const fn=decodeURI(u.split('#')[0].split('?')[0]);if(!fn)continue;
assert(existsSync(path.resolve(path.dirname(f),fn)),f+' broken local link '+u);local++}
}}
walk(root);
const data=JSON.parse(readFileSync(path.join(root,'data/exploded-2018.json'),'utf8'));
const atlas=JSON.parse(readFileSync(path.join(root,'data/real-reference-index.json'),'utf8'));
for(const a of data.assemblies){assert(a.oemFicheUrl.includes('motorcyclespareparts.eu'));assert(a.alternateCatalogueUrl.includes('triumphestore.com'));assert(a.externalDiagramAvailableInApp===false)}
for(const a of [...atlas.fiches,...atlas.parts])assert(!/^https:\/\/oem-bike-parts\./.test(a.url));
const h=readFileSync(path.join(root,'exploded.html'),'utf8');
assert(h.includes('showLocalSpareList')&&h.includes('ficheAltLink'));
assert(!h.includes('id="ficheFrame"')&&!h.includes('loadEmbedded'));
console.log('Link checks PASS: '+files+' HTML/Markdown sources, '+local+' local links, '+data.assemblies.length+' assembled fallbacks. External HTTP not guaranteed.');