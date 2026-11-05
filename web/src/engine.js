export const TABS=['problems','startups','capabilities'];
export const AXES=['industry_customer','problem_workflow','solution'];
const QUERY={industry_customer:'industry',problem_workflow:'work',solution:'solution'};
export function tabForKind(kind){return {problem:'problems',guide:'problems',startup:'startups',capability:'capabilities',resource:'capabilities',trend:'capabilities'}[kind]||'problems';}
export function readRoute(search,preferred='zh',hash=''){
 const p=new URLSearchParams(search),kind=p.get('kind')||null,view=['domain','library','detail','showcase'].includes(p.get('view'))?p.get('view'):'home';
 const candidate=p.get('tab')||hash.replace(/^#/,'');
 return {view,lang:['zh','en'].includes(p.get('lang'))?p.get('lang'):preferred==='en'?'en':'zh',domain:p.get('domain')||null,kind,id:p.get('id')||null,
 tab:view==='detail'?tabForKind(kind):TABS.includes(candidate)?candidate:'problems',origin:['library','showcase'].includes(p.get('origin'))?p.get('origin'):'domain',
 page:Math.max(1,Math.min(100000,Number.parseInt(p.get('page'),10)||1)),group:p.get('group')||'all',category:p.get('category')||'',
 capview:['concepts','resources','trending'].includes(p.get('capview'))?p.get('capview'):kind==='resource'?'resources':kind==='trend'?'trending':'concepts',topic:p.get('topic')||'',resourceWork:p.get('resourceWork')||'',
 filters:Object.fromEntries(AXES.map(a=>[a,[...new Set(p.getAll(QUERY[a]))]]))};
}
export function routeUrl(r,hash=''){
 const p=new URLSearchParams({lang:r.lang});if(r.view!=='home')p.set('view',r.view);
 if(['domain','detail'].includes(r.view)&&r.domain)p.set('domain',r.domain);
 if(['domain','library','detail'].includes(r.view)){
  const tab=r.view==='detail'?tabForKind(r.kind):TABS.includes(r.tab)?r.tab:'problems';p.set('tab',tab);
  if(r.page>1)p.set('page',r.page);
  if(tab==='problems'){if(r.group&&r.group!=='all')p.set('group',r.group);if(r.category)p.set('category',r.category);}
  if(tab==='capabilities'){if(r.capview&&r.capview!=='concepts')p.set('capview',r.capview);if(r.topic)p.set('topic',r.topic);if(r.resourceWork)p.set('resourceWork',r.resourceWork);}
  if(tab==='startups')for(const a of AXES)for(const id of [...r.filters?.[a]||[]].sort())p.append(QUERY[a],id);
 }
 if(r.view==='detail'){if(r.kind)p.set('kind',r.kind);if(r.id)p.set('id',r.id);if(r.origin&&r.origin!=='domain')p.set('origin',r.origin);}
 return '?'+p.toString()+hash;
}
export function routeKey(r){const q={...r,lang:'zh'};return routeUrl(q);}
export function inDomain(x,domain){return x.domain===domain||x.domains?.includes(domain);}
export function domainItems(data,domain){return {problems:data.problems.filter(x=>inDomain(x,domain)),startups:data.startups.filter(x=>inDomain(x,domain)),capabilities:data.capabilities.filter(x=>inDomain(x,domain))};}
export function detailItem(data,r){const key={problem:'problems',startup:'startups',capability:'capabilities',resource:'resources',trend:'trending',guide:'guides'}[r.kind];return key?data[key]?.find(x=>x.id===r.id&&(r.origin==='library'||r.origin==='showcase'||!r.domain||inDomain(x,r.domain))):null;}
export function rawStartupMatches(records,r,omit){
 const scope=r.view==='domain'||(r.view==='detail'&&r.origin==='domain');
 return records.filter(x=>(!scope||!r.domain||inDomain(x,r.domain))&&AXES.every(a=>a===omit||!r.filters?.[a]?.length||r.filters[a].some(id=>x.categories[a].includes(id))));
}
export function collapseStartups(records){const seen=new Set();return records.filter(x=>{const key=x.canonical||x.id;if(seen.has(key))return false;seen.add(key);return true;});}
export function startupMatches(records,r){return collapseStartups(rawStartupMatches(records,r));}
export function candidateCounts(records,r){return Object.fromEntries(AXES.map(a=>{const sets={};for(const x of rawStartupMatches(records,r,a))for(const c of x.categories[a]){(sets[c]??=new Set()).add(x.canonical||x.id);}return[a,Object.fromEntries(Object.entries(sets).map(([c,s])=>[c,s.size]))];}));}
export function paginate(items,requested=1,size=20){const pages=Math.max(1,Math.ceil(items.length/size)),page=Math.min(Math.max(1,requested),pages);return {items:items.slice((page-1)*size,page*size),page,pages,total:items.length,first:items.length?(page-1)*size+1:0,last:Math.min(page*size,items.length)};}
export function libraryItems(data,r){
 if(r.tab==='problems')return {kind:'problem',items:data.problems.filter(x=>(r.group==='all'||x.group===r.group)&&(!r.category||x.category===r.category))};
 if(r.tab==='startups')return {kind:'startup',items:startupMatches(data.startups,r)};
 if(r.capview==='trending')return {kind:'trend',items:data.trending};
 if(r.capview==='resources'){
  const theme=data.themes.find(x=>x.id===r.topic);return {kind:'resource',items:data.resources.filter(x=>(!r.topic||theme?.resource_ids.includes(x.id))&&(!r.resourceWork||x.domains.includes(r.resourceWork)))};
 }
 return {kind:'capability',items:data.capabilities.filter(x=>!r.category||x.domain===r.category)};
}
export function validate(data,startup){
 const bi=x=>x&&['zh','en'].every(l=>typeof x[l]==='string'&&x[l].trim());
 const domains=new Set(data.domains.map(x=>x.id));if(domains.size!==10||data.domains.some(x=>!bi(x.label)))throw Error('Invalid domain index');
 if(data.matching_status!=='not_implemented'||data.case_status!=='original_synthetic_cases_only')throw Error('Scope changed');
 for(const [key,total] of [['problems',99],['capabilities',60],['resources',84],['trending',15]]){if(data[key].length!==total||new Set(data[key].map(x=>x.id)).size!==total)throw Error('Invalid total: '+key);}
 for(const x of data.problems)if(!x.zh?.['Plain Language']||!x.en?.['Plain Language']||!x.source.commit)throw Error('Problem language/source missing');
 for(const c of data.capabilities)if(!domains.has(c.domain)||!bi(c.name)||c.status!=='concept_only'||c.implementation!==null||c.detail.example.status!=='illustrative_not_executed'||!bi(c.detail.example.input)||!bi(c.detail.example.output)||c.detail.related_ids.some(id=>!data.capabilities.some(x=>x.id===id)))throw Error('Invalid concept detail');
 if(startup){const records=startup.records;if(records.length!==4085||new Set(records.map(x=>x.id)).size!==4085||collapseStartups(records).length!==4000)throw Error('Startup totals changed');for(const r of records)if(!r.detail_file||!r.categories||!r.duplicate_ids.includes(r.id))throw Error('Startup detail references missing');}
}
