import {useEffect,useRef,useState} from 'react';
import {tools,workshop} from './catalog.js';
import {Icon} from './Icons.jsx';

export const pageNames={'index.html':'Workshop dashboard','exploded.html':'Photo teardown','engine-xray.html':'Engine X-ray','electrical.html':'Electrical navigator','catalogue.html':'Parts catalogue','manual-index.html':'Manual index','photo-teardown.html':'Photo annotation','real-photo-gallery.html':'Real-photo atlas'};
function QuickFind({inside,close}){
 const [query,setQuery]=useState(''),[records,setRecords]=useState(null),[failed,setFailed]=useState(false);
 const dialog=useRef(null),field=useRef(null);
 const route=(r,p)=> (inside?'../':'')+workshop(r,p);
 useEffect(()=>{
  const modal=dialog.current;
  if(modal.showModal)modal.showModal();else modal.setAttribute('open','');
  field.current.focus();let alive=true;
  const base=inside?'':'workshop/';
  Promise.all(['parts.json','data/source-reference.json'].map(async path=>{const r=await fetch(base+path);if(!r.ok)throw Error();return r.json()})).then(([parts,ref])=>{
   if(alive)setRecords([...parts.map(p=>({name:p.name,group:p.group,kind:'Assembly',link:route('index.html#inspector',{part:p.id})})),...ref.torqueSettings.map(p=>({name:p.part,group:p.category,kind:'2016 manual · p. '+p.page,link:route('index.html#referenceDesk',{record:p.id})}))]);
  }).catch(()=>{if(alive)setFailed(true)});
  return ()=>{alive=false;if(modal.open&&modal.close)modal.close()};
 },[inside]);
 const q=query.trim().toLowerCase();const library=tools.map(([name,,group,,url])=>({name,group,kind:'Tool',link:route(url)}));
 const matches=[...library,...(q&&records?records:[])].filter(r=>q.split(/\s+/).every(w=>(r.name+' '+r.group).toLowerCase().includes(w)));
 return <dialog ref={dialog} className="hk-dialog" onCancel={close} onClick={e=>{if(e.target===dialog.current)close()}} aria-labelledby="find-title"><div className="hk-dialog-body"><div className="hk-dialog-head"><h2 id="find-title">Find in the workshop</h2><button onClick={close} aria-label="Close search">×</button></div><label className="hk-find"><Icon name="search"/><input ref={field} type="search" aria-label="Search modules and records" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try front forks, fuse or camshaft"/></label><p role="status">{q&&records===null&&!failed?'Searching workshop records…':q?matches.length+' matches':'Workshop tools'}{matches.length>18?' · showing first 18':''}{failed?' · record search unavailable':''}</p><div className="hk-results">{matches.slice(0,18).map((r,i)=><a key={r.link+i} href={r.link} onClick={close}><span>{r.name}</span><small>{r.kind}</small></a>)}{!matches.length&&<p>Try the component name or its system.</p>}</div></div></dialog>
}
export function Header({inside=false,view='overview',page=''}){
 const [search,setSearch]=useState(false),[menu,setMenu]=useState(false),[theme,setTheme]=useState(()=>document.documentElement.dataset.theme||'light');
 const opener=useRef(null),menuButton=useRef(null),nav=useRef(null);
 const home=inside?'../index.html':'';
 useEffect(()=>{
  function keyboard(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setMenu(false);setSearch(v=>!v)}if(e.key==='Escape'&&menu){setMenu(false);menuButton.current?.focus()}}
  function outside(e){if(!nav.current?.contains(e.target))setMenu(false)}
  document.addEventListener('keydown',keyboard);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',keyboard);document.removeEventListener('pointerdown',outside)};
 },[menu]);
 function toggle(){const v=theme==='light'?'dark':'light';document.documentElement.dataset.theme=v;setTheme(v);try{localStorage.setItem('t120-theme',v)}catch{}}
 function close(){setSearch(false);opener.current?.focus()}
 const here=inside?pageNames[page]:'';
 return <header className="hk-header" ref={nav}><div className="hk-bar"><a href={home+'#overview'} className="hk-brand" aria-label="Bonneville Workshop home"><span className="hk-crest" aria-hidden="true"><i/><i/><i/></span><span>Bonneville <b>Workshop</b></span></a>
 <nav className="hk-nav" aria-label="Main navigation">{[['overview','Overview'],['modules','Modules'],['analytics','Analytics'],['lookup','Records']].map(([id,label])=><a href={home+'#'+id} key={id} aria-current={!inside&&view===id?'page':undefined}>{label}</a>)}</nav>
 <div className="hk-actions"><button className="hk-find-btn" ref={opener} onClick={()=>{setMenu(false);setSearch(true)}} aria-label="Search workshop"><Icon name="search" size={18}/><span>Find</span><kbd>⌘/Ctrl K</kbd></button><button className="hk-theme" aria-label={theme==='dark'?'Use light theme':'Use dark theme'} onClick={toggle}><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">{theme==='dark'?<><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>:<path d="M20.7 14a8.9 8.9 0 0 1-10.6-10.7A9 9 0 1 0 20.7 14z"/>}</svg></button>
 <button ref={menuButton} aria-label="Workshop menu" aria-expanded={menu} aria-controls="hk-menu" onClick={()=>setMenu(!menu)}><Icon name="menu" size={19}/></button></div></div>
 {menu&&<nav id="hk-menu" className="hk-menu" aria-label="All workshop destinations"><div className="hk-menu-primary">{[['overview','Overview'],['modules','All modules'],['analytics','Service analytics'],['lookup','Record lookup']].map(([key,label])=><a href={home+'#'+key} key={key} onClick={()=>setMenu(false)}>{label}</a>)}</div><h2>Workshop modules</h2><div>{tools.map(([name,icon,,,path])=><a key={name} aria-current={here===name?'page':undefined} href={(inside?'../':'')+workshop(path)} onClick={()=>setMenu(false)}><Icon name={icon} size={17}/>{name}</a>)}</div></nav>}
 {search&&<QuickFind inside={inside} close={close}/>}</header>
}
