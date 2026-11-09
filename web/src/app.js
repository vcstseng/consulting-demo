import {readRoute,routeUrl,routeKey,domainItems,detailItem,TABS,tabForKind,AXES,startupMatches,candidateCounts,paginate,libraryItems} from './engine.js';
const app=document.querySelector('#app');
let preferred='zh';try{preferred=localStorage.getItem('consulting-demo-lang')||'zh';}catch{}
let state=readRoute(location.search,preferred,location.hash),data=null,error=false;
let positions={};try{positions=JSON.parse(sessionStorage.getItem('consulting-demo-scroll')||'{}');}catch{}
let pending={top:history.state?.top||0,hash:location.hash};
history.scrollRestoration='manual';
const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=(zh,en)=>state.lang==='zh'?zh:en;
const v=x=>e(x?.[state.lang]||'');
const url=(patch={},hash='')=>routeUrl({...state,...patch},hash);
const link=(text,patch={},cls='',hash='',extra='')=>`<a class="${cls}" data-route href="${e(url(patch,hash))}" ${extra}>${text}</a>`;
function external(href,text){let safe;try{safe=new URL(href);if(!['http:','https:'].includes(safe.protocol))return '';}catch{return '';}return `<a href="${e(safe.href)}" target="_blank" rel="noopener noreferrer">${e(text)} <span aria-hidden="true">↗</span><span class="sr-only">${t('（新分頁）',' (new tab)')}</span></a>`;}
const kindName=kind=>({problem:t('企業問題','Business problem'),startup:t('外部做法','External approach'),capability:t('能力構想','Capability concept'),resource:t('資源參考','Resource reference'),trend:t('熱門快照','Trending snapshot'),guide:t('方法與治理','Methods & governance')})[kind];
const tabLabel=tab=>({problems:t('企業問題','Business problems'),startups:t('新創參考','Startup references'),capabilities:t('能力構想','Capability concepts')})[tab];
const currentDomain=()=>data?.domains.find(d=>d.id===state.domain);
const tabRoutes=new Map();
const tabKey=(route,tab=route.tab)=>`${route.view}:${route.view==='domain'?route.domain:''}:${tab}`;
function switchTab(tab){
 if(tab===state.tab)return;
 tabRoutes.set(tabKey(state),state);
 const next=tabRoutes.get(tabKey(state,tab))??{...state,tab,page:1,group:'all',category:'',capview:'concepts',topic:'',resourceWork:'',filters:emptyFilters()};
 navigate({...next,lang:state.lang},{tabFocus:true});
}
function save(){positions[routeKey(state)]=scrollY;try{sessionStorage.setItem('consulting-demo-scroll',JSON.stringify(positions));}catch{}history.replaceState({...history.state,top:scrollY},'',location.href);}
function navigate(next,{back=false,hash='',tabFocus=false,keepTop=false,filterFocus=null}={}){
 save();const from=state;state=next;const top=back?positions[routeKey(state)]||0:keepTop?scrollY:0;
 history.pushState({top},'',routeUrl(state,hash));pending={top,hash,focus:!back&&!tabFocus&&!keepTop,filterFocus,focusTab:tabFocus?next.tab:null,focusId:back&&from.view==='detail'?from.id:null};render();
}
function sectionHead(n,title,description){return `<header class="section-head"><div><p class="eyebrow">${n}</p><h2>${title}</h2></div>${description?`<p>${description}</p>`:''}</header>`;}
function home(){
 return `<section class="home-intro"><div><p class="eyebrow">BUSINESS PROBLEM EXPLORER · PROTOTYPE</p><h1 id="page-title" tabindex="-1">${t('依領域查看企業問題、<br>做法與能力','From business problems<br>to possible solutions.')}</h1><p class="lead">${t('從銷售、財務等領域選一個，看看常見問題、新創公司怎麼做，以及可能用到哪些工具或流程。','Explore business problems, external approaches and capabilities together—and see how a problem could become a proposal.')}</p><div class="actions">${link(t('從銷售開始探索','Start with sales')+' <span aria-hidden="true">→</span>',{view:'domain',domain:'business-sales'},'button primary')}${link(t('選擇其他領域','Choose another domain'),{view:'home'},'text-link','#domains')}</div><p class="intro-note">${t('資料取自三個原專案的固定版本。','Existing content is integrated as a fixed snapshot; no automated matching or execution.')}</p></div><aside class="concept-map" aria-label="${t('整體概念','How it fits together')}"><p class="eyebrow">${t('從問題到方案','ONE JOURNEY, THREE PERSPECTIVES')}</p><ol class="journey-flow"><li><span>01</span><div><strong>${t('企業問題','Business problems')}</strong><small>99 Problems</small></div></li><li class="analysis-node"><span>02</span><div><strong>${t('分析情境與選項','Understand context & options')}</strong><small>Consulting Agents</small><div class="supporting"><span>${t('參考外部做法','External approaches')}<b>Startup Radar</b></span><span>${t('探索所需能力','Capability options')}<b>Capability Store</b></span></div></div></li><li><span>03</span><div><strong>${t('候選方案與驗證方式','Proposal & validation plan')}</strong><small>${t('示範案例','Future proposal demonstration')}</small></div></li></ol><p class="map-note">${t('顧問提出建議，由企業決定是否採用與測試。','People retain judgment and approval; security and governance span the journey.')}</p></aside></section>
 <section class="domains-section" id="domains">${sectionHead('',t('按工作領域瀏覽','Browse by business domain'),t('選一個領域，再切換查看企業問題、新創做法和能力構想。','Choose a domain, then switch between business problems, startup approaches and capability concepts.'))}<div class="domain-grid">${data.domains.map((d,i)=>link(`<span class="domain-num">${String(i+1).padStart(2,'0')}</span><span><strong>${v(d.label)}</strong><small>${data.problems.filter(x=>x.domain===d.id).length} ${t('個問題','problems')} · ${data.capabilities.filter(x=>x.domain===d.id).length} ${t('個能力','concepts')}</small></span><span aria-hidden="true">→</span>`,{view:'domain',domain:d.id},'domain-card')).join('')}</div></section>
 <section class="full-module-entry" id="source-libraries">${sectionHead('',t('按資料庫瀏覽','Browse by source library'),t('直接瀏覽任一資料庫的完整內容。','Choose a library to explore its content.'))}<div class="full-module-grid">${[['problems','99 Problems',data.counts.problems,t('個問題','problems')],['startups','Startup Radar',data.counts.startup_display,t('筆展示紀錄','display records')],['capabilities','Capability Store',data.counts.capabilities,t('個能力構想','capability concepts')]].map(([tab,title,count,unit])=>link(`<strong>${title}</strong><span>${count.toLocaleString()} ${unit}</span><small>${t('完整探索','Explore all')} →</small>`,{view:'library',tab,domain:null,page:1,group:'all',category:'',capview:'concepts',filters:emptyFilters()},'full-module-card')).join('')}${link(`<strong>${t('AI 方法庫','AI Methodology Library')}</strong><span>${t('6 個導入主題','6 adoption topics')}</span><small>${t('查看主題與原站方法','View topics & source methods')} →</small>`,{view:'methodology'},'full-module-card')}</div><p class="mini-note">${t('AI 與治理、系統性問題、原有資源與熱門快照均保留在完整入口。','Full exploration also retains AI/governance, systemic problems, original resources and Trending snapshots.')}</p></section>
 <section class="about-section" id="about">${sectionHead(t('這個展示在做什麼','ABOUT THIS PROTOTYPE'),t('本站資料來源','About the source projects'),'')}<div class="about-columns"><p>${t('99 Problems 從企業工作需求整理問題；Startup Radar 觀察外部新創的產品做法；Capability Store 描述可能需要的 Skills、Tools、Agents 與 Workflows。','99 Problems frames enterprise issues from work requirements. Startup Radar observes startup approaches. Capability Store describes potential Skills, Tools, Agents and Workflows.')}</p><div><p>${t('領域頁把三個專案的資料按工作類別整理在一起。原始資料和出處可從各筆詳情查看。','Domain pages bring together material from all three projects. Open a record to see its details and source.')}</p>${link(t('查看示範案例','View sample cases')+' →',{view:'showcase'},'text-link')}</div></div></section>`;
}
const methodologyUrl='https://vcstseng.github.io/ai-methodology-library/';
function methodologyPage(){
 const title=t('AI 方法庫','AI Methodology Library');
 const topics=[
  ['feasibility',t('選題與可行性','Use case selection and feasibility')],
  ['workflow',t('流程與分工','Workflow and responsibilities')],
  ['pilot',t('試行與交付','Pilots and delivery')],
  ['measurement',t('驗證與衡量','Validation and measurement')],
  ['operations',t('營運與演進','Operations and evolution')],
  ['governance',t('治理與管理','Governance and management')],
 ];
 return `${crumbs(null,title)}
 <article class="detail-page">
  <header class="detail-intro">
   <p class="eyebrow">AI METHODOLOGY LIBRARY</p>
   <h1 id="page-title" tabindex="-1">${title}</h1>
   <p class="lead">${t('按企業導入問題查閱做法、適用情境與原始來源。','Find approaches, when they apply, and their original sources by AI adoption question.')}</p>
  </header>
  ${section(t('六個導入主題','Six adoption topics'),`<p class="mini-note">${t('各主題連到方法庫原站。','Topic links open the source library in Traditional Chinese.')}</p><ul>${topics.map(([slug,title])=>`<li>${external(methodologyUrl+'topics/'+slug+'.html',title)}</li>`).join('')}</ul>`)}
  <section class="source-section">
   <h2>${t('完整方法庫','Full methodology library')}</h2>
   ${external(methodologyUrl,t('查看原站完整內容','Browse the full library (Traditional Chinese)'))}
  </section>
 </article>`;
}
function crumbs(domain,last){
 const parts=[link(t('首頁','Home'),{view:'home'})];
 if(domain)parts.push(link(v(domain.label),{view:'domain',domain:domain.id,tab:tabForKind(state.kind)},'', '', 'data-return'));
 if(last)parts.push(`<span aria-current="page">${last}</span>`);
 return `<nav class="breadcrumbs" aria-label="${t('探索路徑','Exploration path')}">${parts.join('<span aria-hidden="true">/</span>')}</nav>`;
}

const capabilityType=kind=>({skill:t('技能','Skill'),tool:t('工具','Tool'),agent:'Agent',workflow:t('工作流程','Workflow')})[kind]??kind;
function card(item,kind){
 const name=fullTitle(item,kind),summary=kind==='problem'?item[state.lang]['Business Problem']:kind==='capability'?item.purpose[state.lang]:item.summary?.[state.lang];
 const domain=state.view==='domain'?state.domain:null,origin=state.view==='library'?'library':'domain';
 const meta=kind==='problem'?item.id:kind==='capability'?(domain?capabilityType(item.kind):`${data.domains.find(d=>d.id===item.domain)?.label[state.lang]||''} · ${capabilityType(item.kind)}`):kind==='resource'?item.types.join(' · '):kind==='trend'?item.observed_at.slice(0,10):item.source;
 return `<article class="item-card" id="item-${e(item.id)}"><div class="item-meta"><span>${e(meta)}</span></div>${link(`<h3>${e(name)}</h3><p>${e(summary||t('原始介紹不足。','Insufficient source description.'))}</p><span class="read-more">${t('閱讀詳情','Read details')} →</span>`,{view:'detail',kind,id:item.id,domain,origin},'item-main','',`data-item="${e(item.id)}"`)}</article>`;
}

function domainPage(){return fullDomainPage();}

function section(title,body){return `<section class="detail-section"><h2>${title}</h2>${body}</section>`;}
function problemBody(x){const p=x[state.lang];return section(t('先理解問題','Understand the problem'),`<p>${e(p['Business Problem'])}</p>`)+section(t('需要知道什麼？','What do we need to know?'),`<p>${e(p['Context Explanation'])}</p><div class="callout"><h3>${t('資料與既有系統','Data & existing systems')}</h3><p>${e(p['Data Needed / Existing Systems'])}</p></div>`)+section(t('可能的處理方向','A possible approach'),`<p>${e(p['Solution Explanation'])}</p>${p['Solution Core']?`<details><summary>${t('原研究的解法核心','Solution core in the source research')}</summary><p>${e(p['Solution Core'])}</p></details>`:''}<details><summary>${t('AI 可以提供什麼協助？','What might AI contribute?')}</summary><p>${e(p['AI Leverage'])}</p><p>${e(p['How AI Helps'])}</p></details>`)+section(t('人仍需要決定什麼？','What do people still decide?'),`<p>${e(p['Human Role'])}</p>`)+section(t('原研究的預期改善','Expected improvement in the source research'),`<p class="mini-note">${t('以下是研究方向，並非本展示已驗證的成果。','This is an intended direction, not a validated result of this demo.')}</p><p>${e(p['Expected Outcome'])}</p>`);}
function capabilityBody(x){const d=x.detail;const companions=d.related_ids.map(id=>data.capabilities.find(c=>c.id===id)).filter(Boolean);return section(t('什麼時候用？','When to use it'),`<p>${v(d.scenario)}</p>`)+section(t('輸入 → 處理 → 產出','Input → Process → Output'),`<div class="ability-flow"><div><h3>${t('輸入','Input')}</h3><p>${v(x.input)}</p></div><div><h3>${t('處理','Process')}</h3><ol>${d.steps.map(s=>`<li>${v(s)}</li>`).join('')}</ol></div><div><h3>${t('產出','Output')}</h3><p>${v(x.output)}</p></div></div>`)+section(t('看一個示例','An illustrative example'),`<p class="mini-note">${t('虛構編寫 · 非實際執行結果','Authored illustration · Not an execution result')}</p><div class="example-grid"><div><h3>${t('提供的資料','Provided information')}</h3><p>${v(d.example.input)}</p></div><div><h3>${t('示範產出','Illustrative output')}</h3><p>${v(d.example.output)}</p></div></div>`)+section(t('人工判斷與使用界線','Human decisions & boundaries'),`<dl class="facts"><div><dt>${t('人工確認','Human confirmation')}</dt><dd>${v(x.human_decision)}</dd></div><div><dt>${t('資料與權限','Data & permissions')}</dt><dd>${v(d.permissions)}</dd></div><div><dt>${t('停止與交回','Stop & hand back')}</dt><dd>${v(d.stop)}</dd></div></dl>`)+section(t('可搭配的能力','Possible companion capabilities'),`<p class="mini-note">${t('沿用原能力頁的組合構想，並非已建立的整合。','These are combinations suggested by the original capability page, not implemented integrations.')}</p><div class="related-list">${companions.map(c=>link(`${v(c.name)} →`,{view:'detail',kind:'capability',id:c.id,domain:state.domain})).join('')}</div>`)+section(t('實現參考','Implementation references'),d.references.length?d.references.map(r=>`<div class="reference-row">${external(r.url,r.name)}<p class="mini-note">${t('待評估','Unverified reference')}</p><p>${v(r.scope)}</p></div>`).join(''):`<p>${t('此能力尚未指定實作參考。','No implementation reference is assigned to this capability.')}</p>`);}
function detailPage(){return fullDetailPage();}

function showcase(cases){return `${crumbs(null,t('顧問方法與案例','Consulting methods and cases'))}<section class="detail-intro"><p class="eyebrow">CONSULTING AGENTS</p><h1 id="page-title" tabindex="-1">${t('顧問方法與案例','Consulting methods and cases')}</h1><p class="lead">${t('先看既有的顧問方法與模擬案例，再看未來如何用三個資料庫規劃方案。','Explore existing consulting methods and simulated cases, then see how the three libraries could inform a future proposal.')}</p></section>${cases}<h2 class="proposal-heading">${t('整合構想','Integration concept')}</h2><p>${t('以下是未來的規劃流程。目前網站可查閱三個資料庫，逐題配對與測試留待後續。','This is a proposed process. The three libraries are available to browse today. Problem-level matching and testing are future work.')}</p><ol class="proposal-steps">${[[t('框定問題與情境','Frame the problem & context'),t('從 99 Problems 出發，確認這次的決策、資料與限制。','Start with 99 Problems and establish the decision, evidence and constraints.')],[t('評估方向與參考','Assess directions & references'),t('Consulting Agents 比較選項；Startup Radar 提供可參考做法。','Consulting Agents compare options; Startup Radar provides approaches to consider.')],[t('選擇與組合能力','Select & combine capabilities'),t('從 Capability Store 確認能力用途、交接與人工判斷；不要求每種能力都出現。','Use Capability Store to examine purpose, handoffs and human judgment; not every capability type is required.')],[t('提出方案與驗證方式','Present a proposal & validation plan'),t('說明選擇理由、需要補的資訊、責任與驗收方式。','Explain rationale, information gaps, responsibilities and acceptance criteria.')]].map(([h,p],i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol><section class="governance">${sectionHead(t('貫穿流程的責任','RESPONSIBILITY THROUGHOUT'),t('誰負責核准與驗收？','Who approves the proposal and checks the results?'),'')}<div class="about-columns"><div><h3>${t('方案層','At proposal level')}</h3><p>${t('確認資料使用、決策責任、風險與核准要求，由人決定是否採納。','Confirm data use, decision ownership, risks and approvals; a person decides whether to adopt the proposal.')}</p></div><div><h3>${t('能力層','At capability level')}</h3><p>${t('每個能力說明所需資料、權限、人工確認與停止條件。','Each capability specifies data needs, permissions, human checks and stop conditions.')}</p></div></div></section><div class="actions">${link(t('探索銷售領域','Explore the sales domain')+' →',{view:'domain',domain:'business-sales'},'button primary')}${link(t('回首頁','Back home'),{view:'home'},'text-link')}</div>`;}
function missing(){return `<section class="detail-intro"><p class="eyebrow">${t('尚未提供','NOT AVAILABLE')}</p><h1 id="page-title" tabindex="-1">${t('找不到這個展示頁面','This demonstration page is unavailable')}</h1><p class="lead">${t('連結可能不完整，或內容尚未接入。','The link may be incomplete, or its content is not connected yet.')}</p><div class="actions">${link(t('回到領域入口','Back to domains'),{view:'home'},'button','#domains')}</div></section>`;}
let startupLoaded=false,filterOpen=false;
const openFilterAxes=new Set();
const parts=new Map(),partErrors=new Set(),loadingParts=new Set();
const emptyFilters=()=>Object.fromEntries(AXES.map(a=>[a,[]]));
const fromLibrary=()=>state.view==='library'||(state.view==='detail'&&(state.origin==='library'||!state.domain));
const returnView=()=>state.origin==='showcase'?'showcase':fromLibrary()?'library':'domain';
function partBlock(file){return `<div class="load-state" role="status"><p>${partErrors.has(file)?t('這份資料暫時無法載入。','This content could not be loaded.'):t('正在讀取資料…','Loading content…')}</p>${partErrors.has(file)?`<button class="button" data-part-retry="${e(file)}">${t('重試','Retry')}</button>`:''}</div>`;}
async function loadPart(file,assign){
 if(parts.has(file)||loadingParts.has(file)||partErrors.has(file))return;
 loadingParts.add(file);
 try{const res=await fetch(new URL('../data/'+file,import.meta.url));if(!res.ok)throw Error('load');const value=await res.json();parts.set(file,value);assign?.(value);}catch{partErrors.add(file);}finally{loadingParts.delete(file);render();}
}
function ensureData(){
 if(!data)return;
 if((['domain','library'].includes(state.view)&&state.tab==='startups')||(state.view==='detail'&&state.kind==='startup')){
  if(!startupLoaded){loadPart('startups.json',body=>{data.startups=body.records;data.startupData=body;startupLoaded=true;});return;}
 }
 if(state.view==='detail'){
  const x=detailItem(data,state);if(!x)return;
  if(state.kind==='startup')for(const id of x.duplicate_ids){const r=data.startups.find(r=>r.id===id);if(r)loadPart('startup/'+r.detail_file);}
  if(state.kind==='guide')loadPart(x.files[state.lang]);
  if(state.kind==='problem'&&data.evidence_ids.includes(x.id)){loadPart('evidence/'+x.id+'.json');loadPart('case-pages/'+x.id+'-'+state.lang+'.json');}
 }
}
function contentTabs(){return `<div class="explore-tabs" role="tablist" aria-label="${t('探索內容','Explore content')}">${TABS.map(key=>`<button role="tab" type="button" id="tab-${key}" data-tab="${key}" aria-controls="panel-${key}" aria-selected="${state.tab===key}" tabindex="${state.tab===key?0:-1}">${tabLabel(key)}</button>`).join('')}</div>`;}
function selectControl(id,label,options,value){return `<label class="library-select">${label}<select id="${id}">${options.map(([v,l])=>`<option value="${e(v)}" ${v===value?'selected':''}>${e(l)}</option>`).join('')}</select></label>`;}
function libraryControls(){
 if(state.tab==='problems'){
  const categories=[...new Map(data.problems.filter(x=>state.group==='all'||x.group===state.group).map(x=>[x.category,x.category_label[state.lang]])).entries()];
  return `<div class="library-controls">${selectControl('problem-group',t('問題範圍','Problem scope'),[['all',t('全部問題','All problems')],['business',t('企業工作','Business work')],['ai',t('AI 風險與治理','AI risks & governance')],['system',t('系統性影響','Systemic effects')]],state.group)}${selectControl('problem-category',t('分類','Category'),[['',t('全部分類','All categories')],...categories],state.category)}</div>`;
 }
 if(state.tab==='capabilities'){
  const mode=selectControl('capview',t('探索內容','Content'),[['concepts',t('能力構想（60）','Capability concepts (60)')],['resources',t('原有資源參考（84）','Resource references (84)')],['trending',t('GitHub 熱門快照（15）','GitHub Trending snapshot (15)')]],state.capview);
  const detail=state.capview==='concepts'?selectControl('concept-domain',t('企業領域','Business domain'),[['',t('全部領域','All domains')],...data.domains.map(d=>[d.id,d.label[state.lang]])],state.category):state.capview==='resources'?selectControl('resource-work',t('原有導覽分類','Original navigation category'),[['',t('全部資源','All resources')],...data.resource_navigation.categories.map(x=>[x.id,x.label[state.lang]])],state.resourceWork)+selectControl('resource-topic',t('能力主題','Capability theme'),[['',t('全部主題','All themes')],...data.themes.map(x=>[x.id,x.label[state.lang]])],state.topic):'';
  return `<div class="library-controls">${mode}${detail}</div>`;
 }
 return startupLoaded?startupControls():partBlock('startups.json');
}
function startupControls(){
 const counts=candidateCounts(data.startups,state),taxonomy=data.startupData.taxonomy;
 const labels={industry_customer:t('產業／客群','Industry / customer'),problem_workflow:t('問題／工作','Problem / work'),solution:t('解法','Solution')};
 const selected=AXES.flatMap(a=>(state.filters?.[a]||[]).map(id=>({a,id,category:taxonomy.dimensions[a].categories.find(c=>c.id===id)})));
 return `<details class="startup-filters" ${filterOpen?'open':''}><summary>${t('篩選產業、工作與解法','Filter industries, tasks and solutions')}${selected.length?' · '+selected.length:''}</summary><p class="mini-note">${t('同一欄選多項，符合其中一項即可。不同欄的條件須同時符合。結果筆數會隨勾選更新。','Match any selected option within a group and all groups with selections. The result count updates as you choose.')}</p><div class="filter-columns">${AXES.map(a=>`<details class="filter-axis" data-filter-axis="${a}" ${openFilterAxes.has(a)?'open':''}><summary>${labels[a]}${state.filters[a].length?' · '+state.filters[a].length:''}</summary><fieldset aria-label="${labels[a]}">${taxonomy.dimensions[a].categories.filter(c=>(counts[a][c.id]||0)>0||state.filters?.[a]?.includes(c.id)).map(c=>`<label class="filter-option"><input type="checkbox" data-axis="${a}" value="${e(c.id)}" ${state.filters?.[a]?.includes(c.id)?'checked':''}><span>${e(state.lang==='zh'?c.label_zh:c.label_en)}</span></label>`).join('')}</fieldset></details>`).join('')}</div>${selected.length?`<button class="text-link" data-clear-filters>${t('清除篩選','Clear filters')}</button>`:''}</details>${selected.length?`<div class="filter-chips">${selected.map(x=>`<button data-remove-axis="${x.a}" data-remove-value="${e(x.id)}">${e(x.category?(state.lang==='zh'?x.category.label_zh:x.category.label_en):x.id)} <span aria-hidden="true">×</span></button>`).join('')}</div>`:''}`;
}
function listing(items,kind,controls=''){
 const p=paginate(items,state.page);
 const pagination=position=>p.pages>1?`<nav class="pagination ${position}" aria-label="${position==='pagination-top'?t('列表上方頁次','Pagination above results'):t('列表下方頁次','Pagination below results')}">${p.page>1?link('← '+t('上一頁','Previous'),{page:p.page-1},'button'):`<span aria-disabled="true">${t('上一頁','Previous')}</span>`}<span>${p.page} / ${p.pages}</span>${p.page<p.pages?link(t('下一頁','Next')+' →',{page:p.page+1},'button'):`<span aria-disabled="true">${t('下一頁','Next')}</span>`}</nav>`:'';
 return `<div class="results-toolbar"><div class="result-count" role="status">${t('符合條件','Matching results')} · ${p.total.toLocaleString()} ${t('筆','records')}${p.total?` · ${p.first}–${p.last}`:''}</div>${pagination('pagination-top')}</div>${controls}${p.total?`<div class="item-list">${p.items.map(x=>card(x,kind)).join('')}</div>`:`<div class="empty-state"><h3>${t('目前條件沒有紀錄','No records under these conditions')}</h3><p>${t('可以調整分類或篩選；這不代表市場上沒有相關解法。','Adjust categories or filters; absence here does not establish a market gap.')}</p></div>`}${pagination('pagination-bottom')}`;
}
function libraryPage(){
 const titles={problems:t('全部企業問題與研究','All problems & research'),startups:t('探索完整新創資料','Explore all startup records'),capabilities:t('探索完整能力與資源','Explore all capabilities & resources')};
 const descriptions={problems:t('保留企業工作、AI 風險與治理、系統性影響的原分類。','Original categories cover business work, AI risks and governance, and systemic effects.'),startups:t('沿用產業／工作／解法交叉篩選；先篩選原始紀錄，再展示去重。','Filter by industry, work and solution. Source records are filtered before display deduplication.'),capabilities:t('能力構想、原有資源與熱門快照分開呈現，不混成已驗證能力。','Concepts, resource references and Trending snapshots are distinct from validated implementations.')};
 const result=state.tab==='startups'&&!startupLoaded?null:libraryItems(data,state);
 return `${crumbs(null,t('完整探索','Full exploration'))}<section class="detail-intro library-intro"><p class="eyebrow">${t('三個模組的完整內容','COMPLETE MODULE CONTENT')}</p><h1 id="page-title" tabindex="-1">${titles[state.tab]}</h1><p class="lead">${descriptions[state.tab]}</p></section>${contentTabs()}<section role="tabpanel" id="panel-${state.tab}" aria-labelledby="tab-${state.tab}" class="domain-results">${result?listing(result.items,result.kind,libraryControls()):libraryControls()}</section>${state.tab==='startups'?`<p class="mini-note">${t('4,085 筆原始紀錄，合併明確重複後全體展示 4,000 筆；這不是經全面驗證的唯一公司數。','4,085 source records yield 4,000 display records after exact-duplicate grouping; these are not fully verified unique companies.')}</p>`:''}`;
}
function fullDomainPage(){
 const d=currentDomain();if(!d)return missing();const tab=state.tab;
 const blocks={problems:{kind:'problem',source:'99 Problems'},startups:{kind:'startup',source:'Startup Radar'},capabilities:{kind:'capability',source:'Capability Store'}};
 const items=tab==='startups'?startupLoaded?startupMatches(data.startups,state):null:domainItems(data,d.id)[tab];
 const workLabels=tab==='startups'&&startupLoaded?data.startupData.taxonomy.dimensions.problem_workflow.categories
  .filter(c=>data.startupData.domain_mapping[d.id]?.includes(c.id))
  .map(c=>e(state.lang==='zh'?c.label_zh:c.label_en)).join(t('、',', ')):'';
 const scope=workLabels?`<p class="mini-note">${t('Startup Radar 工作分類：','Startup Radar work categories: ')}${workLabels}</p>`:'';
 return `${crumbs(null,v(d.label))}<section class="domain-intro compact-intro"><div><p class="eyebrow">${t('企業領域','BUSINESS DOMAIN')}</p><h1 id="page-title" tabindex="-1">${v(d.label)}</h1></div><label class="domain-picker">${t('切換領域','Change domain')}<select id="domain-picker">${data.domains.map(x=>`<option value="${e(x.id)}" ${x.id===d.id?'selected':''}>${v(x.label)}</option>`).join('')}</select></label></section>${contentTabs()}<section class="domain-results" role="tabpanel" id="panel-${tab}" aria-labelledby="tab-${tab}"><div class="results-heading"><p class="source-label">${blocks[tab].source}</p>${link(t('探索完整資料','Explore the full module')+' →',{view:'library',domain:null,page:1,category:'',group:'all',filters:emptyFilters()},'text-link')}</div>${scope}${items?listing(items,blocks[tab].kind,tab==='startups'?startupControls():''):partBlock('startups.json')}</section><details class="scope-disclosure"><summary>${t('分類與資料口徑','Categories & data scope')}</summary><p>${tab==='startups'?t('依既有工作大類提供領域參考；銷售／行銷、採購／供應鏈等領域可能共用較廣的原分類。未進行逐題 matching。全部資料仍可由完整新創入口探索。','Domain references use existing work categories. Sales/marketing and procurement/supply chain may share broader original categories. No problem-level matching is performed; every record remains available in full exploration.'):t('沿用原問題與能力的企業分類；同領域不代表已驗證可互相解決。','Original problem and capability business categories are retained. A shared domain does not establish a validated solution match.')}</p></details>`;
}
function fullStartupBody(x){
 const file='startup/'+x.detail_file,body=parts.get(file)?.records_by_id[x.id];if(!body)return partBlock(file);
 const taxonomy=data.startupData.taxonomy;
 const tagRows=(r,raw=false)=>AXES.map(a=>`<div><dt>${e(state.lang==='zh'?taxonomy.dimensions[a].label_zh:({industry_customer:'Industry / customer',problem_workflow:'Problem / work',solution:'Solution'})[a])}</dt><dd>${(raw?r.tags[a]:r.categories[a].map(id=>{const c=taxonomy.dimensions[a].categories.find(c=>c.id===id);return state.lang==='zh'?c?.label_zh:c?.label_en;})).map(e).join(' · ')||'—'}</dd></div>`).join('');
 const dup=x.duplicate_ids.length>1?section(t('合併展示的原始紀錄','Source records in this display group'),`<details><summary>${x.duplicate_ids.length} ${t('筆明確重複紀錄；保留各筆摘要與標籤','exact-duplicate records; original summaries and tags retained')}</summary>${x.duplicate_ids.map(id=>{const r=data.startups.find(r=>r.id===id),d=parts.get('startup/'+r.detail_file)?.records_by_id[id];return `<div class="duplicate-record"><h3>${e(id)}</h3><p>${e(state.lang==='zh'?r.summary_zh:d?.evidence.text||'')}</p><dl class="facts">${tagRows(d||{tags:{industry_customer:[],problem_workflow:[],solution:[]}},true)}</dl>${d?.notes?.length?`<ul>${d.notes.map(n=>`<li>${e(n)}</li>`).join('')}</ul>`:''}</div>`;}).join('')}</details>`):'';
 return section(t('原有分類與標籤','Original categories & tags'),`<dl class="facts">${tagRows(x)}</dl><details><summary>${t('逐筆原始細標籤（中文）','Original record-level fine tags (Chinese)')}</summary><dl class="facts">${tagRows(body,true)}</dl></details>`)+section(t('來源原文','Full source text'),`<blockquote>${e(body.evidence.text)}</blockquote><p class="mini-note">${e(x.source)} · ${e(x.id)} · ${e(body.evidence.field)}</p>${x.website?external(x.website,t('名錄提供的網站（未驗證）','Directory-provided website (unverified)')):''}`)+(body.notes.length?section(t('原整理註記','Original review notes'),`<ul>${body.notes.map(n=>`<li>${e(n)}</li>`).join('')}</ul>${state.lang==='en'?'<p class="mini-note">Original review notes retain Chinese wording.</p>':''}`):'')+dup;
}
function resourceBody(x){const themes=data.themes.filter(th=>th.resource_ids.includes(x.id));return section(t('原清單描述','Source directory description'),`<p>${v(x.summary)}</p><p class="mini-note">${t('清單審閱，不代表安裝、測試或適用性驗證。','Directory review is not installation, testing or suitability validation.')}</p>`)+section(t('原有能力主題','Original capability themes'),`<ul>${themes.map(th=>`<li>${v(th.label)}</li>`).join('')}</ul>`)+(x.display?section(t('來源支持的輸入／產出','Source-supported inputs & outputs'),`<dl class="facts">${['input','output'].filter(k=>x.display[k]).map(k=>`<div><dt>${k==='input'?t('輸入','Input'):t('產出','Output')}</dt><dd>${v(x.display[k])}</dd></div>`).join('')}</dl>`):'')+section(t('來源與參考連結','Evidence & reference links'),`<p>${external(x.url,t('查看資源','View resource'))}</p>${x.parent_repository&&x.parent_repository!==x.url?external(x.parent_repository,t('所屬專案','Parent project')):''}<ul>${x.evidence.map(ev=>`<li>${e(ev.source_repo)} · ${e(ev.source_commit.slice(0,8))} · ${e(ev.source_file)}:${ev.source_line}<details><summary>${t('原始清單文字','Original listing text')}</summary><pre>${e(ev.raw_text)}</pre></details></li>`).join('')}</ul>`);}
function trendBody(x){return section(t('榜單快照','Trending snapshot'),`<p>${v(x.summary)||t('原榜單未提供介紹。','No description was provided in the snapshot.')}</p><dl class="facts"><div><dt>${t('觀察日期','Observed at')}</dt><dd>${e(x.observed_at)}</dd></div><div><dt>${t('榜單原順序','Original position')}</dt><dd>${x.rank_in_snapshot}</dd></div><div><dt>${t('當週新增 Stars','Weekly stars in snapshot')}</dt><dd>${x.weekly_stars??'—'}</dd></div></dl><p class="mini-note">${t('這是既有週榜快照，不是即時排行或推薦分數。','This is an existing weekly snapshot, not a live ranking or recommendation score.')}</p>${external(x.url,t('查看 GitHub 專案','View GitHub repository'))}`);}
function evidenceBody(x){
 if(!data.evidence_ids.includes(x.id))return '';
 const file='evidence/'+x.id+'.json',body=parts.get(file),caseFile='case-pages/'+x.id+'-'+state.lang+'.json',casePage=parts.get(caseFile);
 const nextStep=x.id==='CS02'?`<div class="callout">
  <h3>${t('如果要用真實工單試行','Before piloting with real tickets')}</h3>
  <p>${t('用接近實際工作條件的工單重驗分流與升級，特別確認高風險或資訊不全的案件是否會交回人工。','Recheck routing and escalation with tickets representative of actual working conditions. Check whether high-risk or incomplete tickets are handed back to staff.')}</p>
  <p>${external(methodologyUrl+'methods/nist-deployment-context.html',t('AI 方法庫：部署情境重驗','AI Methodology Library: retest in the deployment context (Traditional Chinese)'))}</p>
 </div>`:'';
 return section(t('原有案例與驗證紀錄','Existing synthetic scenarios & validation records'),`<p class="mini-note">${t('以下沿用 99 Problems 既有內容，不是本次整合新增的客戶成果，也不是三個模組的新 matching 結果。','The following comes from the existing 99 Problems prototype. It is not a new client outcome or a new cross-module matching result.')}</p>${casePage?`<details class="original-case"><summary>${t('閱讀原有案例頁的完整內容（靜態）','Read the full original case page (static)')}</summary><div class="source-document">${casePage.html}</div></details>`:partBlock(caseFile)}${body?body.files.map(f=>`<details class="evidence-file"><summary>${e(f.name)}</summary><p class="mini-note">${e(f.source_path)}</p><pre>${e(f.content)}</pre></details>`).join(''):partBlock(file)}${nextStep}`);
}
function guideBody(x){const file=x.files[state.lang],body=parts.get(file);return body?`<p class="mini-note">${t('原文件的靜態閱讀版；原站的互動執行不在此重跑。','A static reading of the original document; original interactive execution is not rerun here.')}</p><div class="source-document">${body.html}</div>`:partBlock(file);}
function fullTitle(x,kind){return kind==='problem'?x[state.lang]['Plain Language']:['startup','resource','trend'].includes(kind)?x.name:x.name[state.lang];}
function fullDetailPage(){
 if(state.kind==='startup'&&!startupLoaded)return partBlock('startups.json');
 const x=detailItem(data,state);if(!x)return missing();const d=currentDomain();
 const body={problem:()=>problemBody(x)+evidenceBody(x),startup:()=>fullStartupBody(x),capability:()=>capabilityBody(x),resource:()=>resourceBody(x),trend:()=>trendBody(x),guide:()=>guideBody(x)}[state.kind];
 const source=state.kind==='problem'?x.source:x,original=source.original_url?.[state.lang],commit=state.kind==='problem'?x.source.commit:x.source_commit;
 const back={view:returnView(),tab:tabForKind(state.kind),domain:d?.id||null};
 const fromShowcase=back.view==='showcase';
 const showcaseLabel=t('顧問案例','Consulting cases');
 const summary=state.kind==='capability'?v(x.purpose):['startup','resource','trend'].includes(state.kind)?v(x.summary):'';
 return `${crumbs(null,`${link(fromShowcase?showcaseLabel:fromLibrary()?t('完整探索','Full exploration'):d?v(d.label):t('顧問方法','Consulting methods'),back,'','','data-return')} / ${e(fullTitle(x,state.kind))}`)}<article class="detail-page"><header class="detail-intro"><p class="eyebrow">${kindName(state.kind)}${state.kind==='problem'?' · '+e(x.id):state.kind==='capability'?' · '+e(capabilityType(x.kind)):''}</p><h1 id="page-title" tabindex="-1">${e(fullTitle(x,state.kind))}</h1>${summary?`<p class="lead">${summary}</p>`:''}${state.kind==='capability'?`<p class="detail-status">${t('能力構想，尚未實作；例子為虛構示範。','Capability concept, not implemented; examples are fictional illustrations.')}</p>`:''}</header>${body()}<section class="source-section"><h2>${t('回查原模組','View original module')}</h2>${original?external(original,t('查看原站','View original site')):''}<p class="mini-note">${t('固定來源版本','Pinned version')} · ${e(commit?.slice(0,8))}</p></section></article><nav class="detail-return" aria-label="${t('返回探索','Return to exploration')}">${link('← '+t('返回','Back to')+' '+(fromShowcase?showcaseLabel:tabLabel(tabForKind(state.kind))),back,'button','','data-return')}${!fromShowcase&&state.kind!=='guide'?`<div><span>${d?v(d.label):t('完整探索','Full exploration')}</span>${TABS.filter(tab=>tab!==tabForKind(state.kind)).map(tab=>link(tabLabel(tab),{...back,tab,page:1,group:'all',category:'',topic:'',resourceWork:'',filters:emptyFilters()},'text-link','','data-return')).join('')}</div>`:''}</nav>`;
}
function completeShowcase(){return showcase(`<section class="module-section" id="source-methods">${sectionHead(t('既有顧問方法與實踐','EXISTING METHODS & PRACTICE'),t('原有顧問方法與案例','Original frameworks & validation content'),t('案例使用模擬資料，可從問題詳情查看原始案例與驗證紀錄。','These cases use simulated data. Open a case to see the original write-up and validation records.'))}<ul class="case-links">${data.problems.filter(p=>data.evidence_ids.includes(p.id)).map(p=>`<li>${link(e(p.id+' · '+fullTitle(p,'problem')),{view:'detail',kind:'problem',id:p.id,domain:null,origin:'showcase'},'text-link')}</li>`).join('')}</ul><div class="item-list">${data.guides.map(g=>`<article class="item-card"><a class="item-main" data-route href="${e(url({view:'detail',domain:null,kind:'guide',id:g.id,origin:'showcase'}))}"><h3>${v(g.name)}</h3><span>${t('閱讀原文件','Read original document')} →</span></a></article>`).join('')}</div></section>`);}

function detailDataReady(){
 if(!data)return false;
 if((['domain','library'].includes(state.view)&&state.tab==='startups')||(state.view==='detail'&&state.kind==='startup'))if(!startupLoaded&&!partErrors.has('startups.json'))return false;
 if(state.view==='detail'){
  const x=detailItem(data,state);if(!x)return true;
  const files=state.kind==='startup'?x.duplicate_ids.map(id=>'startup/'+data.startups.find(r=>r.id===id).detail_file):state.kind==='guide'?[x.files[state.lang]]:state.kind==='problem'&&data.evidence_ids.includes(x.id)?['evidence/'+x.id+'.json','case-pages/'+x.id+'-'+state.lang+'.json']:[];
  return files.every(f=>parts.has(f)||partErrors.has(f));
 }
 return true;
}

function render(){const d=currentDomain();const x=data&&state.view==='detail'?detailItem(data,state):null;const pageTitle=x?fullTitle(x,state.kind):state.view==='library'?t('完整探索','Full exploration'):state.view==='domain'?d?.label[state.lang]:state.view==='showcase'?t('顧問方法與案例','Consulting methods and cases'):state.view==='methodology'?t('AI 方法庫','AI Methodology Library'):t('企業解題探索','Business Problem Explorer');document.title=(pageTitle||t('頁面未提供','Page unavailable'))+' · Consulting Demo';document.documentElement.lang=state.lang==='zh'?'zh-Hant':'en';app.innerHTML=`<div class="shell"><a class="skip" href="#page-title">${t('跳到主要內容','Skip to main content')}</a><header class="masthead">${link(`<span class="brand-dot" aria-hidden="true"></span>${t('企業解題探索','Problem Explorer')}`,{view:'home'},'brand')}<nav class="primary-nav" aria-label="${t('主要導覽','Main navigation')}">${link(t('按工作領域瀏覽','By business domain'),{view:'home'},'', '#domains',['home','domain'].includes(state.view)?'aria-current="page"':'')}${link(t('按資料庫瀏覽','By source library'),{view:'home'},'','#source-libraries',['library','methodology'].includes(state.view)?'aria-current="page"':'')}${link(t('顧問案例','Consulting cases'),{view:'showcase'},'','',state.view==='showcase'?'aria-current="page"':'')}</nav><div class="language" role="group" aria-label="Language"><button data-lang="zh" lang="zh-Hant" aria-pressed="${state.lang==='zh'}">中文</button><button data-lang="en" lang="en" aria-pressed="${state.lang==='en'}">EN<span class="sr-only"> English</span></button></div></header><main>${!data?`<section class="detail-intro"><h1 id="page-title" tabindex="-1">${error?t('資料暫時無法載入','Unable to load content'):t('正在讀取展示內容…','Loading the demonstration…')}</h1>${error?`<button class="button" data-retry>${t('重新載入','Retry')}</button>`:''}</section>`:state.view==='domain'?domainPage():state.view==='library'?libraryPage():state.view==='detail'?detailPage():state.view==='showcase'?completeShowcase():state.view==='methodology'?methodologyPage():home()}</main><footer><p>CONSULTING DEMO · ${t('概念展示，非已實作服務','Concept prototype, not an implemented service')}</p><span>${t('固定版本 · 完整內容探索','Fixed snapshot · Full-content exploration')}</span></footer></div>`;
 if(data&&pending&&detailDataReady()){const p=pending;pending=null;if(p.hash&&document.getElementById(p.hash.slice(1)))document.getElementById(p.hash.slice(1)).scrollIntoView();else window.scrollTo(0,p.top);if(p.filterFocus)document.querySelector(`input[data-axis="${p.filterFocus.axis}"][value="${p.filterFocus.id}"]`)?.focus({preventScroll:true});else if(p.focusTab)document.querySelector(`[data-tab="${p.focusTab}"]`)?.focus({preventScroll:true});else if(p.focusId)document.querySelector(`[data-item="${p.focusId}"]`)?.focus({preventScroll:true});else if(p.focus)document.querySelector('#page-title')?.focus({preventScroll:true});}
 ensureData();
}
app.addEventListener('click',event=>{const target=event.target.closest('a,button');if(!target)return;
 if(target.hasAttribute('data-tab')){switchTab(target.dataset.tab);}
 else if(target.hasAttribute('data-lang')){save();state={...state,lang:target.dataset.lang};try{localStorage.setItem('consulting-demo-lang',state.lang);}catch{}history.replaceState({...history.state,top:scrollY},'',routeUrl(state,location.hash));pending={top:scrollY};render();document.querySelector(`[data-lang="${state.lang}"]`)?.focus({preventScroll:true});}
 else if(target.hasAttribute('data-route')&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();const nextUrl=new URL(target.href);navigate(readRoute(nextUrl.search,state.lang,nextUrl.hash),{back:target.hasAttribute('data-return'),hash:nextUrl.hash});}
 else if(target.hasAttribute('data-part-retry')){partErrors.delete(target.dataset.partRetry);render();}
 else if(target.hasAttribute('data-clear-filters')){filterOpen=true;navigate({...state,page:1,filters:emptyFilters()},{keepTop:true});}
 else if(target.hasAttribute('data-remove-axis')){const axis=target.dataset.removeAxis;navigate({...state,page:1,filters:{...state.filters,[axis]:state.filters[axis].filter(id=>id!==target.dataset.removeValue)}},{keepTop:true});}
 else if(target.hasAttribute('data-retry'))load();
});
app.addEventListener('keydown',event=>{
 const tab=event.target.closest('[data-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const i=TABS.indexOf(tab.dataset.tab);const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;
 switchTab(TABS[next]);
});
app.addEventListener('change',event=>{
 const target=event.target;
 if(target.id==='domain-picker')navigate({...state,view:'domain',domain:target.value,page:1,filters:emptyFilters()});
 const fields={'problem-group':'group','problem-category':'category','concept-domain':'category','capview':'capview','resource-topic':'topic','resource-work':'resourceWork'};
 if(fields[target.id])navigate({...state,page:1,[fields[target.id]]:target.value,...(target.id==='problem-group'?{category:''}:{}),...(target.id==='capview'?{category:'',topic:'',resourceWork:''}:{})});
 if(target.dataset.axis){const axis=target.dataset.axis,id=target.value;filterOpen=true;openFilterAxes.add(axis);const selected=state.filters[axis];navigate({...state,page:1,filters:{...state.filters,[axis]:selected.includes(id)?selected.filter(x=>x!==id):[...selected,id]}},{keepTop:true,filterFocus:{axis,id}});}
});
app.addEventListener('toggle',event=>{if(!event.target.isConnected)return;
 if(event.target.matches?.('.startup-filters'))filterOpen=event.target.open;
 const axis=event.target.dataset?.filterAxis;
 if(axis){if(event.target.open)openFilterAxes.add(axis);else openFilterAxes.delete(axis);}},true);
window.addEventListener('popstate',()=>{positions[routeKey(state)]=scrollY;state=readRoute(location.search,state.lang,location.hash);pending={top:history.state?.top??positions[routeKey(state)]??0,hash:location.hash};render();});
window.addEventListener('pagehide',save);
async function load(){error=false;render();try{const res=await fetch(new URL('../data/catalog.json',import.meta.url));if(!res.ok)throw Error('load');data=await res.json();}catch{error=true;}render();}
load();
