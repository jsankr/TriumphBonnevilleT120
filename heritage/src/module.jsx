import {useLayoutEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Header,pageNames} from './Header.jsx';
import Catalogue from './Catalogue.jsx';
import Electrical from './Electrical.jsx';
import Manual from './Manual.jsx';
import Atlas from './Atlas.jsx';

const pages={'catalogue.html':Catalogue,'manual-index.html':Manual,'electrical.html':Electrical,'real-photo-gallery.html':Atlas};
const sections={
 'index.html':[['Overview','overview'],['Service planner','servicePlanner'],['Garage checklist','maintenance'],['Assembly inspector','inspector'],['Manual data','referenceDesk'],['My PDFs','manualLibrary']],
 'exploded.html':[['Assemblies','assemblies'],['Photo viewer','stage'],['Part list','partsHeading'],['Selected part','inspector'],['Fastener operations','opsHeading'],['Tools','toolsHeading']],
 'photo-teardown.html':[['Bike views','viewOptions'],['Photo canvas','photoStage'],['Assemblies','catalogueHeading'],['Manual references','evidenceHeading'],['Part inspector','selectedPart']],
 'electrical.html':[['Fuse positions','fusePanel'],['Wiring drawings','drawingPanel'],['Harness legend','harnessPanel'],['Part candidates','partsPanel'],['Local manual','localManual']]
};
function LocalNav({page}){
 const name=pageNames[page], links=sections[page]||[];const model=window.BonnevilleModel;
 const filtered=page==='index.html'&&model&&!model.isDefault?[['Overview','overview'],['Service planner','servicePlanner'],['Torque by source','modelTorque']]:links;
 return <div className="hb-local"><nav aria-label="Breadcrumb"><a href="../index.html#modules">Workshop modules</a><span aria-hidden="true"> / </span><b>{name}</b></nav>
 {filtered.length>0&&<label><span>Jump to</span><select value="" aria-label={'Jump within '+name} onChange={e=>{const id=e.target.value;if(id){location.hash=id;document.getElementById(id)?.scrollIntoView({block:'start'})}}}><option value="">Choose section</option>{filtered.map(([l,id])=><option key={id} value={id}>{l}</option>)}</select></label>}</div>
}
function InstrumentSurface({template,page}){
 const mount=useRef(null);
 // This DOM boundary is owned by the drawing, PDF and evidence engines. Keep
 // their event listeners, SVG nodes, local-file inputs and WebGL context stable.
 useLayoutEffect(()=>{const el=mount.current;el.append(document.importNode(template.content,true));return()=>el.replaceChildren()},[template]);
 return <div ref={mount} className={'instrument-surface instrument-'+page.split('.')[0]}/>
}
function Module({page,template}){
 const Native=pages[page];const compact=page==='engine-xray.html';
 return <><a href="#module-content" className="hb-skip">Skip to module</a><Header inside page={page}/>{!compact&&<LocalNav page={page}/>}
 <div id="module-content" tabIndex="-1">{Native?<main className="bench"><Native/></main>:<InstrumentSurface page={page} template={template}/>}</div>
 {!compact&&<footer className="hb-footer"><span>Bonneville Workshop · Independent owner’s reference</span><a href="../index.html#modules">All modules</a><a href="index.html?model=t120-2018#references">Sources &amp; credits</a></footer>}</>
}
const page=document.body.dataset.module;
flushSync(()=>createRoot(document.getElementById('module-root')).render(<Module page={page} template={document.getElementById('instrument-template')}/>));

// The multi-model registry resolves source editions and interval keys. React
// renders the same selected model's task list and comparison matrix.
if(page==='index.html'){
 let plannerRoot;
 document.addEventListener('workshop:planner',async e=>{
  const {Planner}=await import('./Planner.jsx');
  const holder=document.getElementById('heritage-planner');
  if(holder){plannerRoot??=createRoot(holder);plannerRoot.render(<Planner {...e.detail}/>)}
 });
}
