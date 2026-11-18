import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','exploded.html','catalogue.html','electrical.html','real-photo-gallery.html','photo-teardown.html','manual-index.html','engine-xray.html'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let internal=0,external=0,fragments=0,scripts=0,checkedAnchors=0;
const ids=new Map(pages.map(p=>[p,new Set([...read(p).matchAll(/\bid\s*=\s*['"]([^'"]+)['"]/g)].map(m=>m[1]))]));
for (const page of pages){
 const html=read(page);
 assert.match(html,/<meta\s+http-equiv="Content-Security-Policy"/i,`${page} must declare a CSP`);
 assert.match(html,/<meta\s+name="referrer" content="no-referrer"/i,`${page} must suppress sensitive referrers`);
 assert.doesNotMatch(html,/<(?:img|body|a|button|input)\b[^>]*\son(?:error|load|click|mouseover)\s*=/i,`${page}: inline event handler`);
 assert.doesNotMatch(html,/<iframe\b[^>]*src\s*=\s*['"]https?:/i,`${page}: external iframe`);
 const policy=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"\s*\/>/i)?.[1]||'';
 assert.match(policy,/object-src &#x27;none&#x27;/,`${page}: no object restriction`);
 assert.doesNotMatch(policy,/script-src[^;]*unsafe-inline/,`${page}: unsafe inline JS`);
 for (const [,attrs,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(/\bsrc\s*=/.test(attrs)||!body.trim())continue;
   scripts++;
   const sha=crypto.createHash('sha256').update(body).digest('base64');
   assert(policy.includes(`sha256-${sha}`),`${page}: missing CSP hash for inline JS`);
 }
 // The static navigation inventory. JSON-controlled dynamic destinations are separately validated.
 for (const [,tag,attrs] of html.matchAll(/<(a|img|link|script|iframe)\b([^>]*)>/gi)){
   const attr=(tag==='img'||tag==='iframe'||tag==='script')?'src':'href';
   const href=attrs.match(new RegExp(`\\b${attr}\\s*=\\s*(['"])(.*?)\\1`,'i'))?.[2];
   if(!href || href.includes('${'))continue; // dynamic template URL audited by application tests
   assert(!/^javascript:/i.test(href),`${page}: javascript: URL`);
   if (/^https:\/\//.test(href)){ external++; continue }
   if (/^https?:/.test(href))throw new Error(`${page}: non-HTTPS external link`);
   if (href.startsWith('#')){
     fragments++;if(href.length>1)assert(ids.get(page).has(href.slice(1)),`${page} missing fragment ${href}`);
     continue;
   }
   if(/^(data:|blob:|mailto:|tel:)/.test(href))continue;
   const [file,fragment]=href.split('#');
   const absolute=path.resolve(root,file||page);
   assert(absolute.startsWith(root+path.sep),`${page}: path traversal in ${href}`);
   assert(fs.existsSync(absolute),`${page}: missing local destination ${href}`);
   if(fragment&&ids.has(file))assert(ids.get(file).has(fragment),`${page}: ${href} missing anchor`);
   internal++;
 }
 for(const [,tag] of html.matchAll(/<a\b([^>]*)>/gi)){
   if(!/target\s*=\s*['"]_blank['"]/.test(tag))continue;
   assert(/rel\s*=\s*['"][^'"]*noopener/.test(tag),`${page}: target=_blank missing noopener`);
 }
 checkedAnchors+=ids.get(page).size;
}
for (const src of ['app.js','exploded.js','electrical.js','photo-teardown.js','manual-library.js','source-library.js','component-evidence.js','copilot.js','engine-xray.js']){
 const js=read(src);
 assert(!/\beval\s*\(|\bnew\s+Function\s*\(|document\.write\s*\(/.test(js),`${src}: dynamic code execution`);
}
for(const [file,rootKeys] of Object.entries({
 'parts.json':['0'],'data/source-reference.json':['schemaVersion'],'data/exploded-2018.json':['assemblies'],'data/real-reference-index.json':['photos'],'data/electrical-reference.json':['fuses'],'data/catalogue-categories.json':['categories'],'data/engine-xray.json':['parts'],
})){const data=JSON.parse(read(file));assert(data&&typeof data==='object',`Invalid ${file}`);}
const references=JSON.parse(read('data/exploded-2018.json'));
for(const a of references.assemblies){
 for(const key of ['oemFicheUrl','alternateCatalogueUrl'])if(a[key]){
   const url=new URL(a[key]);assert.equal(url.protocol,'https:',`${a.id}: non-HTTPS source URL`);
 }
}
const allPublic=fs.readdirSync(root,{recursive:true}).filter(s=>/\.(?:js|html|json|css|md|yml)$/.test(s)).map(s=>path.join(root,s));
for (const file of allPublic){
 const contents=fs.readFileSync(file,'utf8');
 assert(!/\bSMT[A-HJ-NPR-Z0-9]{14}\b/.test(contents),'Private vehicle identifier must never appear in published project');
 assert(!/\bgh[pousr]_[A-Za-z0-9]{25,}/.test(contents),`GitHub token pattern in ${file}`);
 assert(!/\bsk-[A-Za-z0-9_-]{32,}/.test(contents),`API key pattern in ${file}`);
}
console.log(`Security/routes PASS: ${pages.length} pages, ${internal} internal static resources, ${fragments} fragments, ${external} external static references, ${scripts} inline script hashes, ${checkedAnchors} anchors, no detected embedded secrets.`);
