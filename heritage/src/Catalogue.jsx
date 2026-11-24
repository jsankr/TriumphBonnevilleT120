import {useState} from 'react';
import {useFiles,Intro,Filter,External,within,Empty} from './Bench.jsx';
export default function Catalogue(){
 const [data,status]=useFiles(['data/catalogue-categories.json','data/exploded-2018.json']);const [q,setQ]=useState(''),[list,setList]=useState('Categories'),[assembly,setAssembly]=useState('');
 if(!data)return status;const [index,parts]=data;const all=parts.assemblies.flatMap(a=>a.parts.map(p=>({...p,assembly:a.title,aid:a.id})));
 const cats=index.categories.filter(c=>within(q,c));const rows=all.filter(p=>(!assembly||p.aid===assembly)&&within(q,p.name,p.partNumber,p.assembly,p.callout));
 return <><Intro group="PARTS LIBRARY" title="Parts catalogue" icon="box">Search {index.categories.length} catalogue categories or {all.length} candidate part records across {parts.assemblies.length} mapped assemblies.</Intro>
 <div className="bench-note">Catalogue alternatives can depend on production sequence and market. Confirm fitted parts and supersessions before ordering. Prices and availability are held by the supplier.</div>
 <div className="bench-panel"><div className="bench-controls"><div className="chips">{['Categories','Part numbers'].map(t=><button key={t} aria-pressed={list===t} onClick={()=>setList(t)}>{t}</button>)}</div><Filter id="categorySearch" label="Search catalogue" value={q} change={setQ}/>{list==='Part numbers'&&<label>Assembly <select value={assembly} onChange={e=>setAssembly(e.target.value)}><option value="">All assemblies</option>{parts.assemblies.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></label>}</div>
 <p className="bench-count" role="status">{list==='Categories'?cats.length+' categories':rows.length+' candidate records'}</p>
 {list==='Categories'?<div className="category-list" id="categoryList">{cats.map(c=><div className="unit" key={c}>{c}</div>)}{!cats.length&&<Empty/>}</div>:<div className="part-rows">{rows.map((p,i)=><article key={p.aid+p.partNumber+i}><div><small>{p.assembly} · Callout {p.callout??'unverified'}</small><h3>{p.name}</h3><p>{p.fitmentNote}</p></div><span><code>{p.partNumber}</code><a href={'exploded.html?model=t120-2018&assembly='+encodeURIComponent(p.aid)+'&part='+encodeURIComponent(p.partNumber)}>Inspect in teardown</a></span></article>)}{!rows.length&&<Empty/>}</div>}</div>
 <div className="bench-links"><External href={index.source}>2018 supplier catalogue</External><a href="exploded.html?model=t120-2018">Photo teardown</a><a href="electrical.html">Electrical references</a><a href="docs/SOURCE-AUDIT.md">Source provenance</a></div></>
}
