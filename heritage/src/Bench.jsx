import {useEffect,useRef,useState} from 'react';
import {Icon} from './Icons.jsx';
export function useFiles(paths){
 const [result,setResult]=useState(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true;setError(false);Promise.all(paths.map(async p=>{const r=await fetch(p);if(!r.ok)throw Error();return r.json()})).then(v=>{if(active)setResult(v)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[attempt]);
 return [result,error?<p role="alert">Workshop data could not load. <button onClick={()=>setAttempt(a=>a+1)}>Retry</button></p>:<p role="status">Loading workshop records…</p>];
}
export function Intro({group,title,children,icon}){return <div className="bench-intro"><span className="bench-icon"><Icon name={icon} size={32}/></span><div><p className="overline">{group}</p><h1>{title}</h1><p>{children}</p></div></div>}
export function Filter({value,change,label,id}){return <label className="bench-search"><Icon name="search" size={18}/><span className="sr">{label}</span><input type="search" id={id} placeholder={label} value={value} onChange={e=>change(e.target.value)}/></label>}
export function External({href,children}){try{const u=new URL(href);if(u.protocol==='https:'&&!/(^|\.)oem-bike-parts\.(cz|hr|pl)$/i.test(u.hostname))return <a href={u.href} target="_blank" rel="noopener noreferrer">{children}</a>}catch{}return <a href="exploded.html">Open in-app catalogue</a>}
export function within(q,...values){const text=values.join(' ').toLowerCase();return q.trim().toLowerCase().split(/\s+/).every(w=>text.includes(w))}
export function useLocalPDF(){
 const urls=useRef(new Map()),pending=useRef(null),revision=useRef(0),picker=useRef(null);
 const [message,setMessage]=useState('Choose the corresponding original PDF from this device.'),[link,setLink]=useState('');
 useEffect(()=>()=>{for(const url of urls.current.values())URL.revokeObjectURL(url)},[]);
 function open(doc,n,max){if(!Number.isInteger(n)||n<1||n>max){setMessage('Page outside this document.');return}
  const url=urls.current.get(doc);if(url){setLink(url+'#page='+n);setMessage('Page '+n+' is ready. Use the PDF viewer’s page control if it opens on a different page.');pending.current=null}
  else{pending.current={doc,n,max};setMessage('Choose the original PDF to open page '+n+' privately.');picker.current?.click()}}
 function switchDoc(){revision.current++;pending.current=null;setLink('');setMessage('Choose or open a page in the selected document.');if(picker.current)picker.current.value=''}
 async function load(e,doc){const file=e.target.files?.[0];if(!file)return;const token=++revision.current;
  if(file.size>75*1024*1024){setMessage('The local PDF limit is 75 MB.');return}
  try{const header=await file.slice(0,5).text();if(token!==revision.current)return;if(header!=='%PDF-'){setMessage('Choose a valid PDF file.');return}
   const url=URL.createObjectURL(file);const previous=urls.current.get(doc);urls.current.set(doc,url);setLink('');if(previous)URL.revokeObjectURL(previous);setMessage('Loaded '+file.name+' on this device. Confirm the edition before using it.');const p=pending.current;if(p?.doc===doc)open(doc,p.n,p.max);
  }catch{setMessage('This file could not be read. Choose it again.')}}
 return {picker,message,link,open,load,switchDoc};
}
export function Empty(){return <p className="bench-empty">No matching records. Try another search.</p>}
