export const TABS=['problems','startups','capabilities'];
export function tabForKind(kind){return {problem:'problems',startup:'startups',capability:'capabilities'}[kind]||'problems';}
export function readRoute(search, preferred='zh', hash='') {
  const p=new URLSearchParams(search);
  const language=p.get('lang');
  const candidate=p.get('tab')||hash.replace(/^#/,'');
  const tab=p.get('view')==='detail'?tabForKind(p.get('kind')):TABS.includes(candidate)?candidate:'problems';
  return {tab,lang:['zh','en'].includes(language)?language:preferred==='en'?'en':'zh',view:['domain','detail','showcase'].includes(p.get('view'))?p.get('view'):'home',domain:p.get('domain')||null,kind:p.get('kind')||null,id:p.get('id')||null};
}
export function routeUrl(r,hash='') {
  const p=new URLSearchParams({lang:r.lang});
  if(r.view!=='home')p.set('view',r.view);
  if(['domain','detail'].includes(r.view)&&r.domain)p.set('domain',r.domain);
  if(['domain','detail'].includes(r.view))p.set('tab',r.view==='detail'?tabForKind(r.kind):TABS.includes(r.tab)?r.tab:'problems');
  if(r.view==='detail'){if(r.kind)p.set('kind',r.kind);if(r.id)p.set('id',r.id);}
  return '?'+p.toString()+hash;
}
export function routeKey(r){return JSON.stringify([r.view,r.domain,r.view==='domain'?(r.tab||'problems'):null,r.view==='detail'?r.kind:null,r.view==='detail'?r.id:null]);}
export function domainItems(data,domain){return {problems:data.problems.filter(x=>x.domain===domain),startups:data.startups.filter(x=>x.domain===domain),capabilities:data.capabilities.filter(x=>x.domain===domain)};}
export function detailItem(data,r){const key={problem:'problems',startup:'startups',capability:'capabilities'}[r.kind];return key?data[key].find(x=>x.id===r.id&&x.domain===r.domain):null;}
export function validate(data){
 const bi=x=>x&&['zh','en'].every(l=>typeof x[l]==='string'&&x[l].trim());
 const ids=new Set(data.domains.map(d=>d.id));
 if(data.domains.some(d=>!bi(d.label)))throw Error('Missing domain translation');
 if(ids.size!==10||data.domains.length!==10)throw Error('Expected ten business domains');
 if(data.matching_status!=='not_implemented'||data.case_status!=='not_authored')throw Error('Unexpected scope');
 for(const key of ['problems','startups','capabilities']){
  const seen=new Set();
  for(const x of data[key]){if(seen.has(x.id)||!ids.has(x.domain))throw Error('Invalid sample identity');seen.add(x.id);}
 }
 for(const p of data.problems)for(const lang of ['zh','en'])if(!p[lang]?.['Plain Language']||!p[lang]?.['Business Problem']||!p.source?.commit)throw Error('Missing problem source text');
 for(const s of data.startups)if(!bi(s.summary)||!s.evidence?.text||!s.source_commit)throw Error('Missing startup evidence');
 for(const c of data.capabilities){if(!bi(c.name)||!bi(c.purpose)||!bi(c.detail.example.input)||!bi(c.detail.example.output))throw Error('Missing capability translation');if(c.status!=='concept_only'||c.implementation!==null||c.detail.example.status!=='illustrative_not_executed')throw Error('Concept status changed');}
}
