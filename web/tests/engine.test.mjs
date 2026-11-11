import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readRoute,routeUrl,routeKey,detailLibraryRoute,domainItems,detailItem,validate,tabForKind,startupMatches,collapseStartups,candidateCounts,paginate,libraryItems} from '../src/engine.js';
const output=new URL('../dist/data/',import.meta.url);
const data=JSON.parse(await readFile(new URL('catalog.json',output)));
const startup=JSON.parse(await readFile(new URL('startups.json',output)));data.startups=startup.records;
test('full integration retains exact source totals and all problem groups',()=>{validate(data,startup);assert.deepEqual(data.counts,{problems:99,business_problems:57,capabilities:60,resources:84,trending:15,startup_records:4085,startup_display:4000});assert.equal(data.problems.filter(p=>p.group==='ai').length,35);assert.equal(data.problems.filter(p=>p.group==='system').length,7);assert.equal(data.domains.length,10);});
test('every problem ID and original bilingual field remains unchanged',async()=>{const base=new URL('../../data/imports/99-problems/',import.meta.url);for(const [lang,path] of [['zh','data/problems.js'],['en','en/data/problems.js']]){const text=await readFile(new URL(path,base),'utf8');const raw=JSON.parse(text.slice(text.indexOf('['),text.lastIndexOf(']')+1));for(const p of raw)assert.deepEqual(data.problems.find(x=>x.id===p.ID)[lang],p);}});
test('all sixty frozen concepts and details retain original content',async()=>{const base=new URL('../../data/imports/capability-store/concepts/',import.meta.url);const raw=JSON.parse(await readFile(new URL('business-concepts.json',base)));const details={...JSON.parse(await readFile(new URL('sales-details.json',base))).details,...JSON.parse(await readFile(new URL('business-details.json',base))).details};for(const c of raw.concepts){const x=data.capabilities.find(x=>x.id===c.id);for(const key of Object.keys(c))assert.deepEqual(x[key],c[key]);assert.deepEqual(x.detail,details[c.id]);}});
test('all startup records resolve to complete original detail batches',async()=>{const files=await readdir(new URL('startup/details/',output));assert.equal(files.length,21);const seen=new Set();for(const f of files){const batch=JSON.parse(await readFile(new URL('startup/details/'+f,output)));for(const [id,x] of Object.entries(batch.records_by_id)){assert.ok(x.evidence.text);assert.equal(id,x.id);assert.ok(!seen.has(id));seen.add(id);}}assert.equal(seen.size,4085);for(const r of startup.records)assert.ok(seen.has(r.id));});
test('filter raw records before collapsing duplicates; never combine tags into a false intersection',()=>{const rows=[{id:'a',canonical:'a',categories:{industry_customer:['health'],problem_workflow:['sales'],solution:['ai']}},{id:'b',canonical:'a',categories:{industry_customer:['finance'],problem_workflow:['accounting'],solution:['ai']}}];const r={view:'library',filters:{industry_customer:['health'],problem_workflow:['accounting'],solution:[]}};assert.deepEqual(startupMatches(rows,r),[]);assert.deepEqual(startupMatches(rows,{...r,filters:{industry_customer:['finance'],problem_workflow:[],solution:[]}}).map(x=>x.id),['b']);assert.equal(collapseStartups(rows).length,1);});
test('startup dimensions use OR within each dimension and AND across them',()=>{const a=startup.records.find(r=>r.id==='upstream-10109');const filters={industry_customer:['healthcare','software-it'],problem_workflow:['sales-marketing'],solution:['agents']};const r={view:'library',filters};assert.ok(startupMatches(startup.records,r).some(r=>r.id===a.id));const counts=candidateCounts(startup.records,r);assert.ok(counts.industry_customer.healthcare>0);});
test('original category schema retains 25/22/28 normal categories and unknown buckets',()=>{for(const [axis,total] of [['industry_customer',25],['problem_workflow',22],['solution',28]]){const categories=startup.taxonomy.dimensions[axis].categories;assert.equal(categories.filter(x=>!x.id.startsWith('__')).length,total);assert.ok(categories.some(x=>x.id==='__missing'));assert.ok(categories.every(c=>c.label_zh&&c.label_en));}});
test('global exploration keeps records outside enterprise domains accessible',()=>{const r={view:'library',tab:'problems',group:'system',category:''};assert.equal(libraryItems(data,r).items.length,7);assert.equal(libraryItems(data,{...r,group:'ai'}).items.length,35);assert.equal(libraryItems(data,{tab:'capabilities',capview:'resources'}).items.length,84);assert.equal(libraryItems(data,{tab:'capabilities',capview:'trending'}).items.length,15);assert.ok(startup.records.some(x=>!x.domains.length));assert.equal(libraryItems(data,{view:'library',tab:'startups',filters:{}}).items.length,4000);});
test('domain exploration only uses documented existing work-category associations',()=>{for(const d of data.domains){const x=domainItems(data,d.id);assert.ok(x.problems.length);assert.equal(x.capabilities.length,6);for(const r of x.startups)assert.ok(data.domain_mapping[d.id].some(c=>r.categories.problem_workflow.includes(c)));}});
test('filters, page, origin, selected tab and language round-trip through detail links',()=>{const r={view:'detail',kind:'startup',id:'upstream-10109',origin:'library',domain:null,lang:'en',page:3,filters:{industry_customer:['healthcare'],problem_workflow:['sales-marketing'],solution:['agents']}};const copy=readRoute(routeUrl(r));assert.equal(copy.origin,'library');assert.equal(copy.page,3);assert.deepEqual(copy.filters,r.filters);assert.equal(copy.tab,'startups');assert.equal(detailItem(data,copy).id,r.id);assert.equal(routeKey(copy),routeKey({...copy,lang:'zh'}));});
test('all problem, capability and resource IDs open from the independent library',()=>{for(const [kind,key] of [['problem','problems'],['capability','capabilities'],['resource','resources'],['trend','trending'],['guide','guides']])for(const item of data[key]){const r=readRoute(routeUrl({view:'detail',kind,id:item.id,origin:'library',lang:'zh'}));assert.equal(detailItem(data,r).id,item.id);}});
test('pagination clamps pages without rendering thousands of rows',()=>{const rows=collapseStartups(startup.records);assert.equal(paginate(rows,1).items.length,20);assert.equal(paginate(rows,999999).page,200);assert.equal(paginate(rows,200).last,4000);assert.equal(paginate([],2).page,1);});
test('legacy domain hashes and detail links retain their return tab',()=>{assert.equal(readRoute('?view=domain','zh','#capabilities').tab,'capabilities');for(const kind of ['problem','startup','capability','resource','trend'])assert.equal(readRoute('?view=detail&kind='+kind).tab,tabForKind(kind));});
test('original documents are passive and synthetic evidence files remain available',async()=>{for(const g of data.guides)for(const file of Object.values(g.files)){const body=JSON.parse(await readFile(new URL(file,output)));assert.ok(body.html.length>100);assert.ok(!/<(script|iframe|form|input|button)\b/i.test(body.html));assert.ok(!/\son[a-z]+\s*=|href="javascript:/i.test(body.html));}let count=0;for(const id of data.evidence_ids){const e=JSON.parse(await readFile(new URL('evidence/'+id+'.json',output)));count+=e.files.length;assert.ok(e.files.every(f=>f.content.length));}assert.equal(count,15);});
test('all imported snapshot hashes remain stable',async()=>{const base=new URL('../../data/imports/',import.meta.url);const manifest=JSON.parse(await readFile(new URL('manifest.json',base)));for(const [f,hash] of Object.entries(manifest.files)){const bytes=await readFile(new URL(f,base));assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,f);}});

test('startup names, categories and full batch content remain unchanged',async()=>{const base=new URL('../../data/imports/startup-radar/catalog/',import.meta.url);const source=JSON.parse(await readFile(new URL('records.json',base)));const byId=new Map(startup.records.map(x=>[x.id,x]));for(const raw of source.records){const x=byId.get(raw.id);for(const k of ['name','summary_zh','website','source','categories','detail_file'])assert.deepEqual(x[k],raw[k]);}for(const f of await readdir(new URL('startup/details/',output))){assert.deepEqual(JSON.parse(await readFile(new URL('startup/details/'+f,output))),JSON.parse(await readFile(new URL('details/'+f,base))));}});

test('cross-library problem returns retain the original filters, page and case origin',()=>{
 for(const query of ['?lang=zh&view=library&tab=problems&group=ai&category=Governance','?lang=zh&view=library&tab=problems&group=ai&page=2']){
 const list=readRoute(query);
 const problem=readRoute(routeUrl({...list,view:'detail',kind:'problem',id:'GOV02',origin:'library',from:routeUrl(list)}));
 const methods=readRoute(routeUrl({...problem,view:'library',kind:null,id:null,tab:'methods',group:'all',category:'',page:1,from:null,returnTo:routeUrl(problem)}));
 const restoredProblem=readRoute(methods.returnTo);
 const restoredList=readRoute(restoredProblem.from);
 assert.equal(restoredList.group,'ai');
 assert.equal(restoredList.category,list.category);
 assert.equal(restoredList.page,list.page);
 assert.equal(restoredProblem.origin,'library');
 }
 const caseRoute=readRoute('?lang=zh&view=detail&kind=problem&id=CS02&origin=showcase');
 const capabilities=readRoute(routeUrl({...caseRoute,view:'domain',domain:'business-customer-service',kind:null,id:null,tab:'capabilities',returnTo:routeUrl(caseRoute)}));
 const caseReturn=readRoute(capabilities.returnTo,'en');
 assert.equal(caseReturn.origin,'showcase');
 assert.equal(caseReturn.id,'CS02');
});

test('native method shells resolve all source IDs and preserve the question return route',async()=>{
 const methodology=JSON.parse(await readFile(new URL('methodology.json',output)));
 const combined={...data,methodology};
 assert.equal(methodology.questions.length,35);
 assert.equal(methodology.methods.length,55);
 for(const question of methodology.questions){
  assert.equal(detailItem(combined,{kind:'methodQuestion',id:question.id})?.id,question.id);
  for(const id of question.method_ids)assert.equal(detailItem(combined,{kind:'method',id})?.id,id);
 }
 assert.equal(tabForKind('methodQuestion'),'methods');
 assert.equal(tabForKind('method'),'methods');
 const question=readRoute('?lang=en&view=detail&tab=methods&kind=methodQuestion&id=acceptance-criteria&origin=library');
 const method=readRoute(routeUrl({...question,kind:'method',id:'anthropic-agent-evals',from:routeUrl(question)}));
 assert.equal(readRoute(method.from).kind,'methodQuestion');
 assert.equal(readRoute(method.from).id,'acceptance-criteria');
});

test('method detail footer opens actual libraries and retains business context',()=>{
 for(const domain of [null,'sales']){
 const current=readRoute('?lang=en&view=detail&kind=method&id=example&context=S02'+(domain?'&domain='+domain:''));
 const parent={...current,kind:'methodQuestion',id:'acceptance-criteria'};
 for(const tab of ['problems','capabilities','startups']){
 const next=readRoute(routeUrl(detailLibraryRoute(current,parent,tab)));
 assert.equal(next.view,domain?'domain':'library');assert.equal(next.tab,tab);assert.equal(next.kind,null);assert.equal(next.id,null);assert.equal(next.context,'S02');assert.equal(next.lang,'en');assert.equal(next.domain,domain);
 }
 }
});
