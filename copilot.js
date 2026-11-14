// Local evidence retrieval only. Not an LLM, web-search agent, or service procedure generator.
const defaultSource = "https://github.com/jsankr/TriumphBonnevilleT120/blob/main/SOURCES.md";
const brakeSource = "https://triumph.euwest01.umbraco.io/media/1615/gamma-bonneville-t100.pdf";
const stop = new Set(["what","are","the","for","with","how","does","this","that","from","need","size","required","which","and","my","i","of","to","is","a","in","on","at","all","parts","part","2018","t120","triumph","bonneville"]);
function terms(s){return [...new Set((s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>w.length>2&&!stop.has(w)))];}
function candidate(part,query){const text=[part.name,part.group,part.id,part.function,part.maintenance,part.tool].join(" ").toLowerCase();const toks=terms(query);return toks.reduce((score,t)=>score+(text.includes(t)?(part.name.toLowerCase().includes(t)?4:1):0),0);}
export function answerEvidenceQuery(query,parts){
 const q=query.toLowerCase();
 const safetyProcedure=/\b(remove|removal|install|installation|fit|refit|tighten|procedure|unlock|lock)\b/.test(q);
 const wantsTool=/\b(tool|tools|socket|hex|allen|wrench|spanner|drive|size)\b/.test(q);
 const wantsTorque=/\b(torque|nm|tighten)\b/.test(q);
 const isFork=/\b(fork|front suspension|pinch)\b/.test(q);
 const isWheel=/\b(wheel|axle|spindle)\b/.test(q);
 const isBrake=/\b(brake|nissin|brembo|caliper|disc)\b/.test(q);
 const isShock=/\b(rear suspension|shock|shocks)\b/.test(q);
 const items=[];
 if(isBrake){items.push({title:"Factory MY18 brake configuration",summary:"The MY18 T120 specification lists TWO front 310 mm discs with TWO Nissin 2-piston floating calipers, and ONE rear 255 mm disc with ONE Nissin 2-piston floating caliper; ABS. No Brembo fitted as the specified 2018 T120 factory caliper in this reference.",status:"MY18 manufacturer-range brochure (model/market applicability still to verify)",url:brakeSource});}
 if(isFork){items.push({title:"Front suspension quantity",summary:"Two fork legs (left and right). The 2018 catalogue lists VIN-dependent alternative part numbers; alternatives are not extra installed legs.",status:"Independent 2018 parts fiche; VIN confirmation required",url:"https://oem-bike-parts.cz/en/parts/triumph/2018/bonneville-t120-2018/front-forks-lower-yoke"});}
 if(isShock){items.push({title:"Rear suspension quantity",summary:"Two rear shock units fitted in the stock assembly. Illustrated explosion vectors are not workshop disassembly instructions.",status:"Independent 2018 parts fiche; VIN confirmation required",url:"https://oem-bike-parts.pl/en/parts/triumph/2018/bonneville-t120-2018/rear-suspension-unit"});}
 if(safetyProcedure || wantsTorque || wantsTool){
  items.push({title:"Service specification verification",summary:"The repository does not establish a complete fastener-specific 2018 VIN/market removal-and-installation procedure. Front axle, fork pinch and brake caliper/tool-drive values are deliberately not supplied as repair specifications. Do not substitute a later-model torque or a fastener thread size for a tool-drive size.",status:"NOT VERIFIED — consult correct workshop manual and authorised dealer",url:defaultSource});
 }
 const scored=parts.map(p=>({p,score:candidate(p,query)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
 for(const {p} of scored){
  const e=p.torqueEvidence;const torqueStatus=e?.value==null?"Fastener torque NOT VERIFIED":`Handbook reference: ${e.value} Nm — check 2018 applicability`;
  const toolStatus=p.removalToolSize==null?"tool drive NOT VERIFIED":`tool: ${p.removalToolSize}`;
  items.push({title:p.name,summary:`${p.function} ${torqueStatus}; ${toolStatus}. ${p.maintenance}`,status:e?.status||"Reference-only assembly record",url:p.catalogueUrl||defaultSource});
 }
 if(!items.length)items.push({title:"No verified match found",summary:"No source-backed answer is available in this limited local index. Search the parts catalogue or use the official handbook and the VIN-specific parts/workshop documentation.",status:"NOT VERIFIED / NO RESULT",url:defaultSource});
 return {headline:"Evidence search results",intro:`Search terms: ${query || "(empty)"}. Found ${items.length} source-labelled record(s). Local deterministic retrieval; no connected AI model.`,items,caveat:"Safety gate: never use search output or illustrative 3D geometry as a tightening specification, teardown sequence, or confirmation of compatibility. Verify the actual motorcycle's VIN and aftermarket equipment."};
}
