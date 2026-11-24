import {sourceRoot} from './source-root.mjs';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {tools,workshop} from './src/catalog.js';
for(const [name,,, ,route] of tools){
 const url=new URL(workshop(route),'https://example.invalid/');
 const html=await readFile('dist'+url.pathname,'utf8');
 if(url.hash)assert.ok(html.includes('id="'+url.hash.slice(1)+'"'),name+' target missing');
}
for(const dir of ['data','assets']){
 const files=await readdir(sourceRoot+'/' +dir,{recursive:true});
 for(const file of files){
  const path=dir+'/'+file;if(!(await stat(sourceRoot+'/' +path)).isFile())continue;
  assert.deepEqual(await readFile(sourceRoot+'/' +path),await readFile('dist/workshop/'+path),path);
 }
}
const entries=(await readdir(sourceRoot)).filter(n=>n.endsWith('.html'));
for(const file of entries){
 const html=await readFile('dist/workshop/'+file,'utf8');
 assert.ok(html.includes('data-module="'+file+'"')&&html.includes('src="../module.js"'),file+' is missing its React entry point');
 assert.ok(html.includes('Content-Security-Policy'),file+' is missing its source policy');
}
for(const file of ['parts.json','manual-page-index.json'])assert.deepEqual(await readFile(sourceRoot+'/'+file),await readFile('dist/workshop/'+file));
console.log('All '+tools.length+' destinations resolve; all '+entries.length+' pages use the shared React entry point. All source data and assets match byte for byte.');
