import {useState} from 'react';
export function Planner({rows,services,initial,pageLabel}){
 const [active,setActive]=useState(initial),[layout,setLayout]=useState('Tasks');
 const included=(r,k)=>k==='day'?r.frequencyText==='Day':r[k]===true;
 const due=rows.filter(r=>included(r,active)),selected=services.find(s=>s.key===active);
 const groups=[...new Set(rows.map(r=>r.category))],columns=services.filter(s=>s.key!=='day');
 return <><div className="planner-tabs" id="plannerTabs" role="tablist" aria-label="Service interval">{services.map(s=><button key={s.key} type="button" role="tab" aria-selected={s.key===active} className={s.key===active?'active':''} data-service={s.key} onClick={()=>setActive(s.key)}><b>{s.label}</b><small>{s.sub} · {rows.filter(r=>included(r,s.key)).length} tasks</small></button>)}</div>
 <div className="hp-controls"><h3>{selected?.label} <small>{due.length} of {rows.length} tasks</small></h3><div>{['Tasks','Service matrix'].map(l=><button key={l} aria-pressed={layout===l} onClick={()=>setLayout(l)}>{l}</button>)}</div></div>
 <div id="plannerList" className="hp-tasks" hidden={layout!=='Tasks'} aria-live="polite">{groups.filter(g=>due.some(r=>r.category===g)).map(g=><article key={g}><h4>{g}</h4><ul>{due.filter(r=>r.category===g).map((r,i)=><li key={i}>{r.task}<small>{r.frequencyText&&!['Day','-'].includes(r.frequencyText)?r.frequencyText+' · ':''}{pageLabel}{r.page}</small></li>)}</ul></article>)}</div>
 <div className="matrix" id="plannerMatrix" tabIndex="0" aria-label="Service schedule comparison" hidden={layout!=='Service matrix'}><table className="matrix-table"><caption>Tasks by service interval</caption><thead><tr><th>Task</th>{columns.map(c=><th key={c.key}><button data-service={c.key} onClick={()=>setActive(c.key)}>{c.label}</button></th>)}</tr></thead>{groups.map(g=><tbody key={g}><tr className="cat"><th colSpan={columns.length+1}>{g}</th></tr>{rows.filter(r=>r.category===g).map((r,i)=><tr key={i}><th scope="row">{r.task}</th>{columns.map(c=><td key={c.key} className={active===c.key?'on':''}><span aria-label={r[c.key]?'Included':'Not included'}>{r[c.key]?'✓':'—'}</span></td>)}</tr>)}</tbody>)}</table></div></>
}
