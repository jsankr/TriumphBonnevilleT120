import {parse,serialize,serializeOuter} from 'parse5';
import {readFile,writeFile} from 'node:fs/promises';
const native=new Set(['catalogue.html','electrical.html','manual-index.html','real-photo-gallery.html']);
function walk(n,fn){fn(n);for(const c of n.childNodes||[])walk(c,fn)}
function attr(n,k){return n.attrs?.find(a=>a.name===k)?.value}
function remove(n){const list=n.parentNode.childNodes;list.splice(list.indexOf(n),1)}
export async function compilePage(name){
 const path='dist/workshop/'+name;const ast=parse(await readFile(path,'utf8'));let head,body,oldHead;const scripts=[];
 walk(ast,n=>{if(n.tagName==='head')head=n;if(n.tagName==='body')body=n;if(n.tagName==='header'&&attr(n,'class')?.includes('site-top'))oldHead=n});
 walk(body,n=>{if(n.tagName==='script')scripts.push(n)});
 const instrument=!native.has(name);let runtime='';
 if(instrument){runtime=scripts.map(n=>serializeOuter(n)).join('\n');for(const n of scripts)remove(n);}
 if(oldHead)remove(oldHead);
 const headNodes=head.childNodes.filter(n=>!(n.tagName==='script'&&attr(n,'src')==='theme.js') && (instrument||n.tagName!=='style'&&!(n.tagName==='link'&&attr(n,'rel')==='stylesheet'&&attr(n,'href')!=='theme.css')));
 let contents=instrument?serialize(body):'';
 if(name==='exploded.html')contents='<p class="hb-model-caption"><b id="wordName">Bonneville T120</b> · <span id="wordSub">2018 workshop explorer</span></p>'+contents;
 if(name==='index.html'){
  // Integration controls used by the upstream dashboard search and section list.
  contents='<div class="hb-dash-tools"><label>Find an assembly <input id="globalSearch" type="search" placeholder="Search assemblies"/></label><button type="button" id="menuToggle" aria-expanded="false" aria-controls="sidebar">Dashboard sections</button></div>'+contents;
  contents=contents.replace(/<div class="planner-tabs" id="plannerTabs"[\s\S]*?<p class="fine" id="plannerNotes">/,'<div id="heritage-planner">Loading service schedule…</div><p class="fine" id="plannerNotes">');
 }
 const bodyClass=attr(body,'class')||'';
 // Keep source-page CSP and original graphics. Only shipped, same-origin JS executes.
 const result='<!doctype html><html lang="en"><head>'+headNodes.map(n=>serializeOuter(n)).join('')+'<script src="../boot-theme.js"></script><link rel="stylesheet" href="../header.css"><link rel="stylesheet" href="../bench.css"></head><body class="'+bodyClass+'" data-module="'+name+'"><div id="module-root"></div>'+(instrument?'<template id="instrument-template">'+contents+'</template>':'')+'<noscript>Enable JavaScript to use the interactive workshop.</noscript><script src="../module.js"></script>'+runtime+'</body></html>';
 await writeFile(path,result);
}
