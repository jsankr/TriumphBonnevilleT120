import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {intervals,tools,workshop,getData} from './catalog.js';
import {Icon} from './Icons.jsx';

function section(){return ['modules','analytics','lookup'].includes(location.hash.slice(1))?location.hash.slice(1):'overview'}
import {Header} from './Header.jsx';

const pins=[['forks','Front forks',76.6,44.3],['engine','Engine',55.6,52.1],['rear-shocks','Rear shocks',23.9,58],['front-brake','Nissin front brakes',88.6,77.5],['fuel-tank','Fuel tank',56.8,28.7],['seat','Seat',28.3,34.6]];
function Hero({data}){
 const [pin,setPin]=useState(null);
 const credit=data.map.views.cranberry.credit,selected=data.parts.find(p=>p.id===pin);
 return <section className="hero"><div className="hero-copy"><div className="overline"><span className="dash"/>2018 MODEL YEAR · WORKSHOP EXPLORER</div>
 <h1>Bonneville <em>T120</em></h1><p className="hero-sub">1200 cc liquid-cooled parallel twin</p>
 <div className="hero-actions"><a className="primary" href={workshop('exploded.html')}><Icon name="layers" size={18}/>Explore teardown</a><a className="secondary" href={workshop('index.html#servicePlanner')}>Plan a service</a></div>
 </div><div className="photo-stage"><div className="orbit"/><div className="photo"><img src="workshop/assets/photo/t120-cranberry-hero.webp" alt="Right side of a Cranberry Red and Aluminium Silver Triumph Bonneville T120" width="859" height="512"/>
 {pins.map(([id,label,x,y])=><button key={id} className={'pin '+(pin===id?'on':'')} style={{left:x+'%',top:y+'%'}} aria-label={'Inspect '+label} aria-pressed={pin===id} onClick={()=>setPin(pin===id?null:id)}><b>+</b></button>)}</div></div>
 {selected&&<div className="pin-detail"><a href={workshop('index.html#inspector',{part:selected.id})}>{selected.name} · Open record</a><button aria-label="Close part label" onClick={()=>setPin(null)}>×</button></div>}
 <div className="hero-foot"><span><i className="paintdot"/> Cranberry Red / Aluminium Silver</span><details><summary>Photo credit</summary><p>Reference motorcycle photographed by <a href={credit.source}>{credit.author}</a>. Background and bystander removed. <a href={credit.licenceUrl}>{credit.licence}</a>.</p></details></div></section>
}
function Metrics({data}){
 return <div className="metrics">{[[data.parts.length,'Assembly records','layers','index.html#catalogue'],[data.ref.torqueSettings.length,'Active torque references','wrench','index.html#referenceDesk'],[data.ref.scheduledMaintenance.length,'Scheduled tasks','calendar','index.html#servicePlanner'],[data.ref.specialServiceTools.length,'Special tools','box','index.html#referenceDesk']].map(([n,label,icon,path])=><a key={label} href={workshop(path,label==='Special tools'?{dataset:'tools'}:{})}><Icon name={icon}/><span><strong>{n}</strong><small>{label}</small></span></a>)}</div>
}
function ModuleDirectory({data,full=false}){
 const [category,setCategory]=useState('All'),[q,setQ]=useState('');
 const list=(full?tools:tools.slice(0,4)).filter(([name,,group,description])=>(category==='All'||category===group)&&(name+' '+description).toLowerCase().includes(q.trim().toLowerCase()));
 const notes=[data.map.pins.length+' photo markers',data.xray.parts.length+' concept parts',data.catalogue.categories.length+' categories',data.electric.diagrams.length+' diagram references'];
 return <section className="block"><div className="section-head"><div><p className="overline">WORKSHOP DIRECTORY</p><h2>{full?'All modules':'Explore the workshop'}</h2></div>{!full&&<a className="text-link" href="#modules">View all {tools.length} tools</a>}</div>
 {full&&<div className="toolbar"><Search value={q} onChange={setQ} label="Find a workshop tool"/><div className="chips">{['All','Explore','Service','References'].map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>}
 <div className="cards">{list.map(([title,icon,group,description,route])=><a className={'module '+icon} key={title} href={workshop(route)}><div className="card-top"><span className="tile-icon"><Icon name={icon} size={26}/></span><span className="card-meta">{notes[tools.findIndex(t=>t[0]===title)]||group}</span></div><h3>{title}</h3><p>{description}</p></a>)}</div>{list.length===0&&<p role="status">No modules match. <button onClick={()=>{setQ('');setCategory('All')}}>Reset filters</button></p>}</section>
}
function Search({value,onChange,label}){return <label className="search"><Icon name="search" size={19}/><span className="sr">{label}</span><input type="search" placeholder={label} value={value} onChange={e=>onChange(e.target.value)}/></label>}
function Lookup({data}){
 const [kind,setKind]=useState('Assemblies'),[q,setQ]=useState(''),[count,setCount]=useState(8);
 const rows=kind==='Assemblies'?data.parts.map(p=>({id:p.id,name:p.name,group:p.group,info:p.function,route:workshop('index.html#inspector',{part:p.id})})):
 data.ref.torqueSettings.map(p=>({id:p.id,name:p.part,group:p.category,info:'April 2016 service manual · p. '+p.page+(p.notes?' · '+p.notes:''),route:workshop('index.html#referenceDesk',{record:p.id})}));
 const words=q.toLowerCase().trim().split(/\s+/);
 const matches=rows.filter(r=>words.every(w=>(r.name+' '+r.group+' '+r.info).toLowerCase().includes(w)));
 return <section className="block lookup"><div className="section-head"><div><p className="overline">RECORD INDEX</p><h2>Workshop lookup</h2></div><Icon name="search" size={30}/></div>
 <div className="toolbar"><Search value={q} onChange={v=>{setQ(v);setCount(8)}} label="Search by component or system"/><div className="chips">{['Assemblies','Torque references'].map(x=><button key={x} aria-pressed={kind===x} onClick={()=>{setKind(x);setCount(8)}}>{x}</button>)}</div></div>
 <p className="fine" role="status">{matches.length} matching {kind.toLowerCase()}{kind==='Torque references'?' · 2016 manual. Confirm 2018 model and market applicability.':''}</p><div className="record-list">{matches.slice(0,count).map(r=><a href={r.route} key={r.id}><div><small>{r.group}</small><b>{r.name}</b><p>{r.info}</p></div><Icon name={kind==='Assemblies'?'layers':'book'} size={20}/></a>)}</div>
 {matches.length===0&&<p>No matching records. Try a system such as “brakes”.</p>}{matches.length>count&&<button className="plain" onClick={()=>setCount(c=>c+12)}>Show more records</button>}</section>
}
function Analytics({data,expanded=false}){
 const [interval,setIntervalKey]=useState('annual'),[category,setCategory]=useState(null);
 const rows=data.ref.scheduledMaintenance;
 const due=rows.filter(r=>interval==='day'?r.frequencyText==='Day':r[interval]===true);
 const groups=Object.entries(due.reduce((result,r)=>({...result,[r.category]:(result[r.category]||0)+1}),{})).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 const visible=expanded?groups:groups.slice(0,4);
 return <section className="block service"><div className="section-head"><div><p className="overline">SERVICE ANALYTICS</p><h2>Service workload</h2></div><label className="interval">Interval<select value={interval} onChange={e=>{setIntervalKey(e.target.value);setCategory(null)}}>{intervals.map(([k,l])=><option value={k} key={k}>{l}</option>)}</select></label></div>
 <div className="service-grid"><div className="service-total"><span className="big">{due.length}</span><b>tasks in this interval</b><p>Of {rows.length} schedule entries in the April 2016 T120 service manual, pp. 84–85. Confirm applicability to your 2018 motorcycle.</p>
 <a className="text-link" href={workshop('index.html#servicePlanner',{interval})}>Open interval in planner</a></div>
 <div className="bars"><p className="fine">{expanded?'Tasks by system':'Largest task groups'} · Select a system to see its tasks</p>{visible.map(([group,n])=><button className="bar" key={group} aria-expanded={category===group} onClick={()=>setCategory(category===group?null:group)}><span>{group}</span><strong>{n}</strong><i><i style={{width:100*n/groups[0][1]+'%'}}/></i></button>)}</div></div>
 {category&&<div className="task-detail"><h3>{category}</h3><ul>{due.filter(r=>r.category===category).map(r=><li key={r.id}>{r.task}<small>p. {r.page}</small></li>)}</ul></div>}
 {!expanded&&<a className="text-link see" href="#analytics">See all service groups</a>}</section>
}
function Evidence({data}){return <section className="block"><p className="overline">SOURCE COVERAGE</p><h2>Torque reference audit</h2><div className="audit"><div><strong>{data.ref.torqueSettings.length}</strong><b>Active references</b><p>Named operations in the April 2016 T120 manual.</p></div><div><strong>{data.ref.quarantinedTorquePage70.length}</strong><b>Quarantined rows</b><p>Contradictory page 70 entries are excluded from lookup.</p></div></div><a className="text-link" href={workshop('index.html#referenceDesk')}>Inspect source records</a></section>}
function VisualLibrary(){
 return <section className="block"><div className="section-head"><div><p className="overline">VISUAL LIBRARY</p><h2>Inside the motorcycle</h2></div></div><div className="feature-pair">
 <article><a href={workshop('engine-xray.html')}><div className="feature-media xray"><img src="media/engine-concept.webp" width="676" height="420" loading="lazy" alt="Concept rendering of the parallel twin with its internal parts visible"/></div><div><small>Interactive 3D · Concept model</small><h3>Engine X-ray</h3><p>Rotate the twin, isolate components and follow the firing cycle.</p></div></a></article>
 <article><a href={workshop('real-photo-gallery.html')}><div className="feature-media"><img src="media/engine-detail.webp" width="1040" height="646" loading="lazy" alt="Actual T120 engine showing its cylinder fins, exhaust header and 1200 HT badge"/></div><div><small>Photographic reference</small><h3>Real-photo atlas</h3><p>Compare full-bike views and mechanical details against credited sources.</p></div></a><details><summary>Photo credit</summary><p>Reference T120, year unspecified. Cropped from a photograph by <a href="https://commons.wikimedia.org/wiki/File:Triumph_EM1B9077_(49794022932).jpg">Bengt Nyman</a>, <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>.</p></details></article>
 </div></section>
}
function App(){
 const [view,setView]=useState(section),[data,setData]=useState(null),[error,setError]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{function change(){setView(section());window.scrollTo(0,0)}window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 useEffect(()=>{let active=true;setError(false);getData().then(d=>{if(active)setData(d)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[retry]);
 useEffect(()=>{document.title=({overview:'Bonneville T120',modules:'Workshop modules',analytics:'Service analytics',lookup:'Record lookup'})[view]+' · Bonneville Workshop'},[view]);
 return <><a href="#main" className="skip" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus()}}>Skip to content</a><Header view={view}/><main id="main" tabIndex="-1" className="wrap"><div className="crumb"><a href="#overview">Garage</a><i>/</i> 2018 T120<i>/</i><b>{view==='lookup'?'Records':view}</b></div>
 {!data?<p role="status">{error?<><span>Workshop records could not be loaded. </span><button onClick={()=>setRetry(v=>v+1)}>Retry</button></>:'Loading workshop records…'}</p>:view==='overview'?<><Hero data={data}/><Metrics data={data}/><ModuleDirectory data={data}/><VisualLibrary/><Analytics data={data}/></>:view==='modules'?<ModuleDirectory data={data} full/>:view==='analytics'?<><Analytics data={data} expanded/><Evidence data={data}/></>:<Lookup data={data}/>}</main><footer className="wrap footer"><span>Bonneville Workshop · Independent owner’s reference</span><a href={workshop('index.html#references')}>Sources &amp; credits</a></footer></>
}
createRoot(document.getElementById('root')).render(<App/>);
