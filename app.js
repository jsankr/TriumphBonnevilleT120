import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const $ = s => document.querySelector(s);
const parts = await fetch("./parts.json").then(r=>r.json());
const mount=$("#threeMount"), loading=$("#loading"), fallback=$("#webglFallback");
let scene,camera,renderer,controls,modelRoot,exploded=0,selectedId=null,raycaster,mouse,interactive=[];
const partById=Object.fromEntries(parts.map(p=>[p.id,p]));
// Parts list describes assemblies, not a complete bill of materials. No inferred tool or torque values.

const groups={};
const mat=(color,metalness=.35,roughness=.42)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const mats={black:mat("#171a1b",.65,.35),frame:mat("#202628",.75,.3),chrome:mat("#b9c0c1",.9,.2),silver:mat("#aeb6b7",.8,.24),red:mat("#9f2630",.55,.28),rubber:mat("#101112",.05,.9),engine:mat("#777e7e",.78,.35),gold:mat("#bd9a5d",.75,.28),light:mat("#d8d8cb",.2,.16),dark:mat("#333839",.55,.5)};
function mesh(geo,material,parent,pos=[0,0,0],rot=[0,0,0]){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.rotation.set(...rot);parent.add(m);return m}
function cyl(r1,r2,len,material,parent,pos,rot=[Math.PI/2,0,0],seg=32){return mesh(new THREE.CylinderGeometry(r1,r2,len,seg),material,parent,pos,rot)}
function box(w,h,d,material,parent,pos,rot=[0,0,0]){return mesh(new THREE.BoxGeometry(w,h,d),material,parent,pos,rot)}
function torus(r,t,material,parent,pos,rot=[Math.PI/2,0,0]){return mesh(new THREE.TorusGeometry(r,t,10,72),material,parent,pos,rot)}
function tube(points,r,material,parent){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,48,r,8,false),material,parent)}
function makePart(id){const p=partById[id],g=new THREE.Group();g.name=id;g.userData.partId=id;modelRoot.add(g);groups[id]=g;interactive.push(g);return g}
function addWheel(id,x){const g=makePart(id);torus(.48,.075,mats.rubber,g,[x,.55,0]);torus(.385,.025,mats.chrome,g,[x,.55,0]);cyl(.12,.12,.18,mats.dark,g,[x,.55,0]);for(let i=0;i<18;i++){let a=i*Math.PI/9;let s=box(.012,.76,.012,mats.chrome,g,[x,.55,0],[0,0,a]);s.position.x=x+Math.cos(a)*.0;s.position.y=.55+Math.sin(a)*.0; s.rotation.set(0,0,a); // radial spokes are represented as slim bars
 s.scale.set(1,1,1);s.position.set(x,.55,0);s.rotation.z=a;
 }for(let i=0;i<6;i++){let a=i*Math.PI/3;cyl(.018,.018,.21,mats.chrome,g,[x+Math.cos(a)*.09,.55+Math.sin(a)*.09,0],[Math.PI/2,0,0],8)}}
function createModel(){
 scene=new THREE.Scene();scene.background=new THREE.Color("#171a1b");scene.fog=new THREE.Fog("#171a1b",7,16);
 camera=new THREE.PerspectiveCamera(35,mount.clientWidth/mount.clientHeight,.1,100);camera.position.set(3.6,2.35,6.4);
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(mount.clientWidth,mount.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(0,1,0);controls.minDistance=3.2;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.48;
 scene.add(new THREE.HemisphereLight(0xbcc9d2,0x28221c,2.1));const key=new THREE.DirectionalLight(0xffe8d0,3.2);key.position.set(4,7,5);key.castShadow=true;scene.add(key);const rim=new THREE.DirectionalLight(0x7c9aa8,2);rim.position.set(-4,3,-4);scene.add(rim);
 const floor=mesh(new THREE.PlaneGeometry(200,200),mat("#151819",.1,.9),scene,[0,.01,0],[-Math.PI/2,0,0]);floor.receiveShadow=true;
 modelRoot=new THREE.Group();scene.add(modelRoot);
 // Wheels, tyre rings and hubs
 addWheel("front-wheel",1.55);addWheel("rear-wheel",-1.5);
 // Main frame rails
 const frame=makePart("frame");
 tube([[-1.15,1.05,0],[ -.55,1.38,0],[.45,1.32,0],[1.12,1.2,0]],.055,mats.frame,frame);
 tube([[-.65,1.25,0],[-.2,.75,0],[.65,.78,0],[1.15,1.18,0]],.045,mats.frame,frame);
 tube([[-.7,1.2,0],[-1.1,.75,0],[-1.42,.62,0]],.045,mats.frame,frame);
 tube([[.65,.8,0],[1.25,1.1,0],[1.48,1.4,0]],.04,mats.frame,frame);
 // Engine block and two cylinders
 const eng=makePart("engine");
 box(.95,.66,.66,mats.engine,eng,[0,.92,0]);
 for(let z of [-.22,.22]){cyl(.25,.25,.34,mats.engine,eng,[-.08,1.34,z],[0,0,0]);cyl(.19,.19,.08,mats.dark,eng,[-.08,1.53,z],[0,0,0]);}
 cyl(.36,.36,.12,mats.silver,eng,[.45,.9,.35],[Math.PI/2,0,0]);cyl(.28,.28,.1,mats.silver,eng,[-.45,.9,.35],[Math.PI/2,0,0]);
 const gearbox=makePart("gearbox");box(.45,.45,.48,mats.engine,gearbox,[.3,.75,0]);
 // Tank, seat, headlight
 const tank=makePart("fuel-tank");const tankMesh=mesh(new THREE.SphereGeometry(1,32,20),mats.red,tank,[.25,1.62,0]);tankMesh.scale.set(.72,.35,.48);
 box(.65,.025,.35,mats.silver,tank,[.25,1.89,0]);cyl(.1,.1,.06,mats.chrome,tank,[.25,1.99,0],[Math.PI/2,0,0]);
 const seat=makePart("seat");const seatMesh=mesh(new THREE.SphereGeometry(1,24,16),mat("#242323",.12,.8),seat,[-.72,1.59,0]);seatMesh.scale.set(.72,.14,.38);
 const head=makePart("headlight");cyl(.24,.24,.2,mats.chrome,head,[1.58,1.46,0],[0,0,Math.PI/2]);cyl(.2,.2,.02,mats.light,head,[1.7,1.46,0],[0,0,Math.PI/2]);
 // Forks and front suspension
 const fork=makePart("forks");for(let z of [-.25,.25]){cyl(.055,.055,.98,mats.chrome,fork,[1.35,1.02,z],[0,0,-.16]);cyl(.075,.075,.36,mats.dark,fork,[1.35,.7,z],[0,0,-.16]);}
 // Two rear shocks (catalogue quantity 2); front forks are two legs. Both are schematic geometry.
 // Rear shocks and swingarm
 const shocks=makePart("rear-shocks");for(let z of [-.24,.24]){cyl(.055,.055,.78,mats.chrome,shocks,[-.95,1.05,z],[0,0,-.36]);cyl(.085,.085,.36,mats.dark,shocks,[-.95,1.05,z],[0,0,-.36]);}
 const swing=makePart("swingarm");tube([[-.5,.82,-.28],[-1.1,.65,-.28],[-1.5,.55,-.28]],.05,mats.frame,swing);tube([[-.5,.82,.28],[-1.1,.65,.28],[-1.5,.55,.28]],.05,mats.frame,swing);
 // Exhaust
 const ex=makePart("exhaust");for(let z of [-.34,.34]){tube([[.05,.78,z],[.2,.55,z],[.65,.5,z],[.9,.58,z],[1.05,.62,z]],.055,mats.chrome,ex);cyl(.09,.12,.9,mats.chrome,ex,[-.65,.62,z],[0,0,Math.PI/2]);}
 // Radiator and coolant tank
 const rad=makePart("radiator");box(.45,.52,.12,mats.dark,rad,[.82,1.02,0]);for(let i=0;i<9;i++)box(.42,.012,.13,mats.chrome,rad,[.82,.8+i*.05,0]);
 const coolant=makePart("coolant-tank");mesh(new THREE.SphereGeometry(1,16,12),mat("#667c72",.15,.4),coolant,[.7,.8,-.28]).scale.set(.17,.23,.12);
 // Chain and brake assemblies
 const chain=makePart("chain");tube([[-1.45,.55,.3],[-.85,.63,.3],[-.45,.72,.3],[-.35,.72,.3]],.025,mats.gold,chain);
 const frontBrake=makePart("front-brake");torus(.29,.025,mats.chrome,frontBrake,[1.55,.55,.17]);box(.16,.18,.12,mats.gold,frontBrake,[1.48,.65,.23]);
 const rearBrake=makePart("rear-brake");torus(.24,.022,mats.chrome,rearBrake,[-1.5,.55,.17]);box(.14,.14,.12,mats.gold,rearBrake,[-1.42,.65,.23]);
 // Battery, airbox, throttle, clutch, ABS, electrical
 const battery=makePart("battery");box(.28,.32,.25,mats.dark,battery,[-.63,1.15,-.22]);
 const air=makePart("airbox");box(.48,.32,.42,mats.black,air,[-.35,1.25,-.2]);
 const throttle=makePart("throttle");for(let z of [-.18,.18])cyl(.12,.12,.15,mats.gold,throttle,[.1,1.16,z],[Math.PI/2,0,0]);
 const clutch=makePart("clutch");cyl(.25,.25,.12,mats.silver,clutch,[-.12,.9,.4],[Math.PI/2,0,0]);
 const instruments=makePart("instruments");for(let x of [1.05,1.3]){cyl(.12,.12,.09,mats.dark,instruments,[x,1.77,0],[Math.PI/2,0,0]);cyl(.095,.095,.012,mats.light,instruments,[x,1.77,.05],[Math.PI/2,0,0]);}
 const frontInd=makePart("front-indicators");for(let z of [-.42,.42])cyl(.055,.055,.16,mats.gold,frontInd,[1.4,1.25,z],[Math.PI/2,0,0]);
 const rearLight=makePart("rear-light");box(.22,.11,.14,mats.red,rearLight,[-1.48,1.36,0]);
 const stand=makePart("side-stand");tube([[-.4,.62,.25],[-.52,.18,.25],[-.85,.1,.25]],.035,mats.chrome,stand);
 const oil=makePart("oil-filter");cyl(.12,.12,.22,mats.dark,oil,[.45,.57,.42],[Math.PI/2,0,0]);
 const plugs=makePart("spark-plugs");for(let z of [-.2,.2])cyl(.045,.045,.17,mats.chrome,plugs,[-.08,1.55,z],[0,0,0]);
 const sump=makePart("sump-plug");cyl(.045,.045,.12,mats.gold,sump,[0,.52,.2],[Math.PI/2,0,0]);
 const master=makePart("front-master");box(.2,.12,.16,mats.dark,master,[1.3,1.78,.22]);
 const abs=makePart("abs");box(.23,.2,.2,mats.dark,abs,[.42,1.12,-.38]);
 // rear swingarm details / frame accessories
 // ground shadow disc
 const shadow=mesh(new THREE.CircleGeometry(2.5,64),new THREE.MeshBasicMaterial({color:"#080909",transparent:true,opacity:.35}),scene,[0,.015,0],[-Math.PI/2,0,0]);shadow.scale.set(1.35,.5,1);
 modelRoot.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
 renderer.domElement.addEventListener("pointerdown",onPick);
 renderer.domElement.addEventListener("pointermove",onHover);
 window.addEventListener("resize",resize);
 animate();loading.classList.add("done");$("#viewState").innerHTML='<span class="live-dot"></span> MODEL READY';
}
function onPick(e){const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(interactive,true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.partId)o=o.parent;if(o?.userData.partId)selectPart(o.userData.partId)}}
function onHover(e){const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(mouse,camera);const hits=raycaster.intersectObjects(interactive,true);renderer.domElement.style.cursor=hits.length?"pointer":"grab"}
function resize(){if(!renderer)return;const w=mount.clientWidth,h=mount.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}
function setExplosion(v){exploded=v/100;$("#explodePct").textContent=v+"%";for(const p of parts){const g=groups[p.id];if(!g)continue;g.position.set(p.offset[0]*exploded,p.offset[1]*exploded,p.offset[2]*exploded)}}
function selectPart(id){selectedId=id;const p=partById[id];if(!p)return;document.querySelectorAll(".part-item").forEach(el=>el.classList.toggle("selected",el.dataset.id===id));$("#partDetail").innerHTML=`<div class="selected-title"><div><small>${p.group.toUpperCase()} / COMPONENT</small><h3>${p.name}</h3></div><button id="focusPart">FOCUS ↗</button></div><p class="part-function">${p.function}</p><div class="spec-grid"><div class="spec-cell"><span>Torque reference</span><b>${p.torque||"Not published"}</b><small class="evidence-status">${p.torqueEvidence?.status==="handbook-reference-not-2018-workshop-manual-confirmed"?"2019 handbook reference · confirm 2018 VIN/market":"2018 workshop-manual verification required"}</small></div><div class="spec-cell"><span>Tool requirement</span><b>${p.tool||"Verify in workshop manual"}</b></div><div class="spec-cell"><span>OEM / part ID</span><b>${p.partNo||"VIN dependent"}</b></div><div class="spec-cell"><span>Indicative price</span><b>${p.price||"Dealer quote required"}</b></div></div><p class="part-maintenance"><b>Maintenance · ${p.interval||"Scheduled inspection"}</b><br>${p.maintenance}</p>${p.risk?`<div class="risk">${p.risk}</div>`:""}<div class="risk"><b>Fastener-by-fastener service verification</b><br>Removal tool size: ${p.removalToolSize??"NOT VERIFIED"}<br>Installation tool size: ${p.installationToolSize??"NOT VERIFIED"}<br>Applicable fastener torque: ${p.fastenerTorqueNm??"NOT VERIFIED"} Nm (no value supplied).<br>Catalogue fitment must be checked against VIN. ${p.fittedQuantity?`Fitted assembly quantity: ${p.fittedQuantity}.`:""}</div>${p.cataloguePartNumbers?`<p class="part-maintenance"><b>2018 fiche part numbers (VIN restrictions apply)</b><br>${p.cataloguePartNumbers.map(x=>`${x.number} — ${x.description}${x.quantity?` × ${x.quantity}`:""}${x.vinCondition?` (${x.vinCondition})`:""}`).join("<br>")}</p>`:""}${p.catalogueFasteners?`<p class="part-maintenance"><b>2018 fiche fasteners</b><br>${p.catalogueFasteners.map(x=>`${x.number} — ${x.description} × ${x.quantity}; drive size / torque not verified`).join("<br>")}</p>`:""}${p.catalogueUrl?`<p><a href="${p.catalogueUrl}" target="_blank" rel="noopener noreferrer">Open 2018 OEM parts fiche ↗</a></p>`:""}`;
 $("#focusPart").addEventListener("click",()=>focusPart(id));const g=groups[id];if(g){const target=new THREE.Vector3();g.getWorldPosition(target);controls.target.lerp(target,.7)}
}
function focusPart(id){const g=groups[id];if(!g)return;const p=new THREE.Vector3();g.getWorldPosition(p);controls.target.copy(p);const dir=new THREE.Vector3().subVectors(camera.position,controls.target).normalize();camera.position.copy(p.clone().add(dir.multiplyScalar(3.2)).add(new THREE.Vector3(0,.8,0)));controls.update()}
function renderParts(){const q=$("#searchInput").value.toLowerCase();const cat=document.querySelector(".filter.active")?.dataset.filter||"All";const filtered=parts.filter(p=>(cat==="All"||p.group===cat)&&(`${p.name} ${p.group} ${p.function}`).toLowerCase().includes(q));$("#partCount").textContent=filtered.length+" PARTS";$("#partsList").innerHTML=filtered.map((p,i)=>`<button class="part-item ${selectedId===p.id?"selected":""}" data-id="${p.id}"><span class="part-index">${String(i+1).padStart(2,"0")}</span><span class="part-name">${p.name}</span><span class="part-group">${p.group}</span><span class="part-arrow">›</span></button>`).join("")||'<div class="part-maintenance">No matching components.</div>';document.querySelectorAll(".part-item").forEach(b=>b.addEventListener("click",()=>selectPart(b.dataset.id)))}
const serviceItems=[
["Daily safety check","Tyres, lights, brakes, steering, leaks and fasteners"],
["Engine oil & filter","First service, annual service and scheduled mileage intervals"],
["Drive chain slack","Check and adjust daily; wear inspection every 800 km"],
["Drive chain lubrication","Lubricate every 300 km; more often in wet/dusty use"],
["Brake fluid","Renew every 2 years regardless of mileage"],
["Coolant","Renew every 3 years regardless of mileage"],
["Throttle body balance","1200 cc engine: scheduled mileage service"],
["Valve clearance","Scheduled at 32,000 km and 64,000 km columns"]
];
function renderChecklist(){const saved=JSON.parse(localStorage.getItem("t120-checks")||"{}");$("#checklist").innerHTML=serviceItems.map((it,i)=>`<label class="check-row ${saved[i]?"done":""}"><input type="checkbox" data-check="${i}" ${saved[i]?"checked":""}><span><b>${it[0]}</b><br>${it[1]}</span></label>`).join("");document.querySelectorAll("[data-check]").forEach(c=>c.addEventListener("change",()=>{const s=JSON.parse(localStorage.getItem("t120-checks")||"{}");s[c.dataset.check]=c.checked;localStorage.setItem("t120-checks",JSON.stringify(s));c.closest(".check-row").classList.toggle("done",c.checked);updateProgress()}));updateProgress()}
function updateProgress(){const s=JSON.parse(localStorage.getItem("t120-checks")||"{}");const n=Object.values(s).filter(Boolean).length;$("#checkProgress").textContent=`${n} / ${serviceItems.length}`}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderParts()}));
$("#searchInput").addEventListener("input",renderParts);
$("#explodeRange").addEventListener("input",e=>{setExplosion(+e.target.value);$("#explodeBtn").classList.toggle("active",+e.target.value>0)});
$("#explodeBtn").addEventListener("click",()=>{const n=exploded>0?0:100;$("#explodeRange").value=n;setExplosion(n);$("#explodeBtn").classList.toggle("active",n>0)});
$("#resetView").addEventListener("click",()=>{if(!camera)return;$("#explodeRange").value=0;setExplosion(0);controls.target.set(0,1,0);camera.position.set(3.6,2.35,6.4);controls.update()});
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-view]").forEach(x=>x.classList.remove("active"));b.classList.add("active");const views={side:[3.6,2.35,6.4],front:[6,1.8,0],rear:[-6,1.8,0],top:[0,7,.1]};camera.position.set(...views[b.dataset.view]);controls.target.set(0,1,0);controls.update()}));
$("#helpBtn").addEventListener("click",()=>$("#helpDialog").showModal());$("#closeHelp").addEventListener("click",()=>$("#helpDialog").close());$("#helpDialog").addEventListener("click",e=>{if(e.target===$("#helpDialog"))$("#helpDialog").close()});
document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement.tagName!=="INPUT"){e.preventDefault();$("#searchInput").focus()}if(e.key==="Escape"&&$("#helpDialog").open)$("#helpDialog").close()});
renderParts();renderChecklist();
try{createModel()}catch(err){console.error(err);loading.classList.add("done");fallback.classList.remove("hidden");$("#viewState").textContent="3D UNAVAILABLE"}
