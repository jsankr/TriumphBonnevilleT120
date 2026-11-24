import {build} from 'esbuild';
import {cp, mkdir, readFile, writeFile, readdir, rm} from 'node:fs/promises';
import {sourceRoot} from './source-root.mjs';
import {compilePage} from './compile-pages.mjs';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/workshop',{recursive:true});
for(const entry of await readdir(sourceRoot,{withFileTypes:true})){
  if(entry.isDirectory() ? !['assets','data','docs'].includes(entry.name) : !/\.(html|css|js|json|md|txt)$/i.test(entry.name)||entry.name==='AGENTS.md')continue;
  await cp(sourceRoot+'/'+entry.name,'dist/workshop/'+entry.name,{recursive:true});
}
await cp('src/home.template','dist/index.html');
await Promise.all(['studio.css','header.css','bench.css','boot-theme.js','media'].map(f=>cp('src/'+f,'dist/'+f,{recursive:true})));
await build({entryPoints:{studio:'src/app.jsx',module:'src/module.jsx'},outdir:'dist',bundle:true,minify:true,jsx:'automatic',target:['safari15','firefox100','chrome100'],legalComments:'eof'});
for(const name of (await readdir('dist/workshop')).filter(f=>f.endsWith('.html')))await compilePage(name);
// Validate allowed deep links against the loaded module's own records.
const bindings=[
 ['exploded.js',"pickAssembly('front-forks',true);",`const params=new URLSearchParams(location.search);const first=source.assemblies.find(a=>a.id===params.get('assembly'))||source.assemblies[0];pickAssembly(first.id,true);const candidate=first.parts.find(p=>p.partNumber===params.get('part'));if(candidate)selectCallout(candidate.callout);`],
 ['dashboard.js','function render(){renderTabs();renderMatrix();renderList()}',"function render(){document.dispatchEvent(new CustomEvent('workshop:planner',{detail:{rows,services:SERVICES.map(({key,label,sub})=>({key,label,sub})),initial:active,pageLabel}}))}"],
 ['app.js','renderParts();renderInspector();renderTorques();','const requestedPart=new URLSearchParams(location.search).get("part");if(parts.some(p=>p.id===requestedPart))selected=requestedPart;\nrenderParts();renderInspector();renderTorques();'],
 ['dashboard.js',"'plannerList').textContent='Schedule unavailable.'","'heritage-planner').textContent='Schedule unavailable.'"],
 ['dashboard.js','if(rows.length)render();','const requestedInterval=new URLSearchParams(location.search).get("interval");if(SERVICES.some(s=>s.key===requestedInterval))active=requestedInterval;\n if(rows.length)render();'],
 ['source-library.js','return data.filter(item=>{','const exact=data.find(item=>typeof item.id==="string" && item.id.toLowerCase()===q);if(exact)return [exact];\n return data.filter(item=>{'],
 ['source-library.js','renderCounts();docsList();renderRows();renderChapters();','const params=new URLSearchParams(location.search);if(params.get("dataset")==="tools")selectedDataset="tools";const record=params.get("record");if(library.torqueSettings.some(r=>r.id===record))$("referenceQuery").value=record;\n   renderCounts();docsList();renderRows();renderChapters();']
];
for(const [name,match,replacement] of bindings){
 const path='dist/workshop/'+name;const source=await readFile(path,'utf8');
 if(source.split(match).length!==2)throw new Error('Review source integration in '+name);
 await writeFile(path,source.replace(match,replacement));
}
await cp('src/route-alias.js','dist/route-alias.js');
for(const name of (await readdir('dist/workshop')).filter(n=>n.endsWith('.html')&&n!=='index.html')){
 await writeFile('dist/'+name,'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bonneville Workshop</title><script defer src="route-alias.js"></script></head><body><a href="workshop/'+name+'">Open workshop module</a></body></html>');
}
// Preserve inbound asset, documentation and JSON links from the original Pages site.
for(const file of ['assets','data','docs','parts.json','manual-page-index.json','SOURCES.md','README.md']){
 await cp('dist/workshop/'+file,'dist/'+file,{recursive:true});
}
