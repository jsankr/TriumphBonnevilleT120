export const intervals=[
  ['day','Daily'],['service800km','First service'],['annual','Annual'],
  ['service16000_48000km','16k / 48k km'],['service32000km','32k km'],['service64000km','64k km']
];
export const tools=[
  ['Photo teardown','layers','Explore','Explore mapped assemblies, catalogue callouts and photo markers.','exploded.html'],
  ['Engine X-ray','cube','Explore','Rotate the concept engine, reveal its layers and follow the firing cycle.','engine-xray.html'],
  ['Parts catalogue','box','Explore','Browse the parts groups and open supplier fiches.','catalogue.html'],
  ['Electrical navigator','bolt','Explore','Find fuses, harness components and wiring diagram references.','electrical.html'],
  ['Service planner','calendar','Service','Compare scheduled tasks across service intervals.','index.html#servicePlanner'],
  ['Garage checklist','check','Service','Keep a local record of your workshop checks.','index.html#maintenance'],
  ['Torque references','wrench','References','Look up named fasteners and their source pages.','index.html#referenceDesk'],
  ['Assembly inspector','disc','Explore','Inspect components, service notes, tool evidence and fitment.','index.html#catalogue'],
  ['Manual page index','book','References','Navigate the indexed pages of the four source documents.','manual-index.html'],
  ['My PDF manuals','file','References','Read and search your own manuals on this device.','index.html#manualLibrary'],
  ['Photo annotation','focus','Explore','Mark a component on a photograph of your motorcycle.','photo-teardown.html'],
  ['Real-photo atlas','image','Explore','Review external motorcycle photographs and catalogue references.','real-photo-gallery.html'],
  ['Ask the records','search','References','Search the workshop evidence using a question.','index.html#assistant'],
  ['Rider tricks','spark','Service','Browse source-linked tips for the T120.','index.html#riderTips'],
  ['Workshop figures','gauge','References','Read handbook specifications and their page references.','index.html#specsTitle'],
  ['Workshop dashboard','grid','Explore','Open the full workshop and switch between its three motorcycles.','index.html#overview']
];
export function workshop(route,params={}){
 const [path,hash]=route.split('#');
 const q=new URLSearchParams({...(['index.html','exploded.html'].includes(path)?{model:'t120-2018'}:{}),...params}).toString();
 return 'workshop/'+path+(q?'?'+q:'')+(hash?'#'+hash:'');
}
export async function getData(){
 const paths=['parts.json','data/source-reference.json','data/teardown-map.json','data/engine-xray.json','data/electrical-reference.json','data/catalogue-categories.json'];
 const [parts,ref,map,xray,electric,catalogue]=await Promise.all(paths.map(async path=>{
  const response=await fetch('workshop/'+path); if(!response.ok)throw Error('Cannot load '+path); return response.json();
 }));
 return {parts,ref,map,xray,electric,catalogue};
}
