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
const link=(text,patch={},cls='',hash='',extra='')=>`<a class="${cls}" data-route href="${e(extra.includes('data-return-route')?routeUrl({...patch,lang:state.lang},hash):url(patch,hash))}" ${extra}>${text}</a>`;
function external(href,text){let safe;try{safe=new URL(href);if(!['http:','https:'].includes(safe.protocol))return '';}catch{return '';}return `<a href="${e(safe.href)}" target="_blank" rel="noopener noreferrer">${e(text)} <span aria-hidden="true">↗</span><span class="sr-only">${t('（新分頁）',' (new tab)')}</span></a>`;}
const kindName=kind=>({problem:t('企業問題','Business problem'),startup:t('外部做法','External approach'),capability:t('能力構想','Capability concept'),resource:t('資源參考','Resource reference'),trend:t('熱門快照','Trending snapshot'),guide:t('方法與治理','Methods & governance')})[kind];
const tabLabel=tab=>({problems:t('企業問題','Business problems'),methods:t('導入方法','Adoption methods'),startups:t('新創參考','Startup references'),capabilities:t('能力構想','Capability concepts')})[tab];
const currentDomain=()=>data?.domains.find(d=>d.id===state.domain);
const tabRoutes=new Map();
const tabKey=(route,tab=route.tab)=>`${route.view}:${route.view==='domain'?route.domain:''}:${route.context||''}:${tab}`;
function switchTab(tab){
 if(tab===state.tab)return;
 tabRoutes.set(tabKey(state),state);
 const next=tabRoutes.get(tabKey(state,tab))??{...state,tab,page:1,group:'all',category:'',capview:'concepts',topic:'',resourceWork:'',filters:emptyFilters()};
 navigate({...next,lang:state.lang},{tabFocus:true});
}
function save(){positions[routeKey(state)]=scrollY;try{sessionStorage.setItem('consulting-demo-scroll',JSON.stringify(positions));}catch{}history.replaceState({...history.state,top:scrollY},'',location.href);}
function navigate(next,{back=false,hash='',tabFocus=false,keepTop=false,filterFocus=null}={}){
 save();const from=state;
 if(!back&&next.view==='detail'&&!next.from&&(['domain','library'].includes(state.view)||state.view==='showcase')){
  next={...next,from:routeUrl({...state,from:null,returnTo:next.kind==='problem'?null:state.returnTo})};
 }
 state=next;const top=back?positions[routeKey(state)]||0:keepTop?scrollY:0;
 history.pushState({top},'',routeUrl(state,hash));pending={top,hash,focus:!back&&!tabFocus&&!keepTop,filterFocus,focusTab:tabFocus?next.tab:null,focusId:back&&from.view==='detail'?from.id:null};render();
}
function sectionHead(n,title,description){return `<header class="section-head"><div><p class="eyebrow">${n}</p><h2>${title}</h2></div>${description?`<p>${description}</p>`:''}</header>`;}
const methodologyUrl='https://vcstseng.github.io/ai-methodology-library/';
function home(){
 const libraries=[
  ['99 Problems',t('找出值得處理的工作問題','Identify a business problem worth solving'),t('99 個企業與 AI 問題','99 business and AI questions'),{view:'library',tab:'problems'}],
  [t('AI 方法庫','AI Methodology Library'),t('查找導入、試行、驗收與治理的做法','Find approaches to adoption, pilots, validation and governance'),t('6 個主題 · 35 個問題','6 topics · 35 questions'),{view:'library',tab:'methods'}],
  ['Capability Store',t('找出流程需要的技能、工具、Agent 與工作方式','Explore the skills, tools, agents and workflows a solution needs'),t('60 個能力構想','60 capability concepts'),{view:'library',tab:'capabilities'}],
  ['Startup Radar',t('查看市場上有哪些解法可以比較','Compare approaches and products in the market'),t('4,000 筆展示紀錄','4,000 displayed records'),{view:'library',tab:'startups'}],
 ];
 return `<section class="home-intro">
  <div>
   <p class="eyebrow">${t('WHO MANAGES THE AI THAT MANAGES AI?','ENTERPRISE AI ADOPTION')}</p>
   <h1 id="page-title" tabindex="-1">${t('當 AI 開始管理工作，<wbr><span class="hero-question-tail">誰來管理 AI？</span>','Who Manages the AI That Manages AI?')}</h1>
   <p class="lead">${t('從一個企業問題出發，查怎麼試用 AI、需要哪些工具與人力，以及市面上有哪些方案。四個庫各有用途，也可以單獨查閱。','Start with a business problem. Find ways to test AI, the tools and people you would need, and the options available in the market. Each of the four libraries is also available to browse on its own.')}</p>
   <div class="actions">
    ${link(t('看客訴分流示例','See the complaint routing example'),{view:'detail',kind:'problem',id:'CS02',domain:null,origin:'showcase'},'button primary')}
    ${link(t('直接瀏覽四個庫','Browse the four libraries'),{view:'home'},'text-link','#source-libraries')}
   </div>
  </div>
  <aside class="concept-map" aria-label="${t('四個庫怎麼一起用','How the four libraries work together')}">
   <p class="eyebrow">${t('同一個問題，四個查找方向','FOUR WAYS TO EXPLORE ONE PROBLEM')}</p>
   <ol class="journey-flow">
    <li><span>01</span><div><strong>${t('先看工作卡在哪裡','Find where the work gets stuck')}</strong><small>99 Problems</small></div></li>
    <li><span>02</span><div><strong>${t('查怎麼試、怎麼驗收','Find ways to run and evaluate a pilot')}</strong><small>${t('AI 方法庫','AI Methodology Library')}</small></div></li>
    <li><span>03</span><div><strong>${t('看需要哪些工具、技能和流程','Identify the tools, skills and workflows needed')}</strong><small>Capability Store</small></div></li>
    <li><span>04</span><div><strong>${t('需要外部方案時，比較市場選項','Compare market options when you need an outside solution')}</strong><small>Startup Radar</small></div></li>
   </ol>
   <p class="map-note">${t('用下面的四個入口查資料，也可以先看一個用模擬工單做驗證的案例。','Explore the libraries below or start with a case that uses simulated tickets to test a workflow.')}</p>
  </aside>
 </section>
 <section class="full-module-entry" id="source-libraries">
  ${sectionHead('',t('四個研究庫','Four research libraries'),t('選一個入口，查你現在需要的資料。','Choose the library that answers your current question.'))}
  <div class="full-module-grid">${libraries.map(([title,purpose,meta,route])=>link(`<strong>${title}</strong><span>${purpose}</span><small>${meta} · ${t('開啟','Explore')} →</small>`,{domain:null,page:1,group:'all',category:'',capview:'concepts',filters:emptyFilters(),...route},'full-module-card')).join('')}</div>
 </section>
 <section class="domains-section" id="domains">
  ${sectionHead('',t('按工作領域瀏覽','Browse by business domain'),t('在銷售、財務、客服等十個領域中，切換查閱企業問題、導入方法、能力構想與新創參考。','Across ten domains, including sales, finance and customer service, switch between business problems, adoption methods, capability concepts and startup references.'))}
  <div class="domain-grid">${data.domains.map((d,i)=>link(`<span class="domain-num">${String(i+1).padStart(2,'0')}</span><span><strong>${v(d.label)}</strong><small>${data.problems.filter(x=>x.domain===d.id).length} ${t('個問題','problems')} · ${data.capabilities.filter(x=>x.domain===d.id).length} ${t('個能力','concepts')}</small></span><span aria-hidden="true">→</span>`,{view:'domain',domain:d.id},'domain-card')).join('')}</div>
 </section>
 <section class="about-section" id="about">
  ${sectionHead('',t('資料與案例說明','About the data and cases'),'')}
  <div class="about-columns">
   <p>${t('企業問題、能力與新創紀錄採原專案的固定版本。AI 方法庫的六個主題與 35 個問題可在站內中英文查閱，完整方法與來源由原站維護。','Business problems, capability concepts and startup records come from versioned source snapshots. The six methodology topics and 35 questions are available here in both languages. The original library maintains full approaches and references in Traditional Chinese.')}</p>
   <p>${t('顧問案例使用模擬資料，提供原始案例與驗證紀錄供查閱。','Consulting cases use simulated data and include the original case write-ups and validation records.')}</p>
  </div>
 </section>`;
}
function methodologyContent(){
 const catalog=data.methodology;
 if(!catalog)return partBlock('methodology.json');
 return `<div class="methods-directory">
  <p class="mini-note">${t('這些導入問題適用於不同工作領域。展開主題查看問題與簡介，完整方法及來源可回查原站。','These adoption questions apply across business domains. Expand a topic to read the questions and summaries. Full approaches and references are available on the source site in Traditional Chinese.')}</p>
  <p class="source-label">${catalog.topics.length} ${t('個主題','topics')} · ${catalog.questions.length} ${t('個問題','questions')}</p>
  ${catalog.topics.map(topic=>`<details class="method-topic" data-method-topic="${e(topic.id)}" ${openMethodTopics.has(topic.id)?'open':''}>
   <summary><span>${v(topic.title)}</span><small>${topic.question_ids.length} ${t('個問題','questions')}</small></summary>
   <p>${v(topic.summary)}</p>
   <div class="item-list">${catalog.questions.filter(question=>question.topic_id===topic.id).map(question=>`<article class="method-question" id="method-${e(question.id)}">
    <h3>${v(question.title)}</h3>
    <p>${v(question.summary)}</p>
    <p>${external(question.source_url,t('查看可參考方法與來源','Read approaches and sources (Traditional Chinese)'))}</p>
   </article>`).join('')}</div>
  </details>`).join('')}
 </div>`;
}
function methodologyPage(){
 return `${crumbs(null,t('AI 方法庫','AI Methodology Library'))}<section class="detail-intro"><h1 id="page-title" tabindex="-1">${t('AI 方法庫','AI Methodology Library')}</h1><p class="lead">${t('從選題到日常營運，查怎麼試、怎麼驗收，以及誰負責。','From selecting a use case to everyday operations, find how to run a pilot, evaluate results and assign responsibility.')}</p></section>${methodologyContent()}`;
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

function managedEvolution(){
 const principles=[
  [t('可承受','Affordable'),t('先訂風險預算，再決定是否試行。','Set the risk budget before authorizing a trial.'),t('以採購助手為例，限制支出、token、執行頻次和工具權限。超出可承受損失的操作，例如對外下單，可排除在試行之外。','For a purchasing assistant, cap spend, tokens, run frequency and tool permissions. Keep actions outside the loss budget, such as placing supplier orders, out of the trial.')],
  [t('可觀測','Observable'),t('把操作、判斷、結果與成本留在同一份可回查的紀錄。','Keep actions, decisions, outcomes and costs in a traceable record.'),t('分流 Agent 可記錄分類理由、被退回的案件與單件成本。用這些紀錄找異常，並讓獨立覆核者重查。','Log a routing agent’s reasons, returned tickets and cost per case. Use the trace to detect anomalies and support independent review.')],
  [t('可學習','Learnable'),t('把失敗轉成可以重跑的案例，對照新舊做法。','Turn failures into repeatable cases and compare versions.'),t('修改分流規則後，重跑原本的失敗案例，再用另一批未參與調整的工單確認改善。保留驗證結果和成立條件。','After changing a routing rule, replay the original failures and check a separate set of tickets that was held out during tuning. Record the verified result and its conditions.')],
  [t('可修復','Recoverable'),t('預先定義誰能介入、何時回退，以及如何處理已發生的影響。','Define who can intervene, when to roll back and how to address effects that already occurred.'),t('保留穩定版本。若 Agent 誤寫工單，由負責人暫停寫入、切回原流程，並更正已受影響的紀錄。','Keep a stable version. If an agent writes incorrect ticket data, the designated owner can suspend writes, restore the prior workflow and correct affected records.')],
 ];
 const stages=[
  [t('沙盒','Sandbox'),t('使用模擬任務和受限工具。','Use simulated tasks and restricted tools.')],
  [t('人工輔助','Assisted'),t('處理真實任務，操作生效前由人核准。','Work on real tasks with human approval before actions take effect.')],
  [t('有限自主','Bounded Autonomy'),t('在明確的權限和風險預算內獨立執行。','Act independently within explicit permissions and risk budgets.')],
  [t('有條件的自主','Conditional Autonomy'),t('經核准後擴大權限，並持續評估及監控。','Use broader, approved permissions with continuous evaluation and monitoring.')],
 ];
 const capabilities=[
  ['Decision Intelligence',t('決策分析',''),t('比較品質、工時、返工與每件合格成果的成本，找出有改善空間的工作。','Compare quality, time, rework and cost per accepted outcome to identify opportunities for improvement.'),'topics/measurement.html'],
  ['Decision Integrity',t('決策證據查核',''),t('用代表性案例、獨立覆核和未參與調整的樣本，確認成效可重現。','Use representative cases, independent review and held-out examples to check whether gains repeat.'),'questions/independent-acceptance-review.html'],
  ['Decision-to-Action',t('決策落地',''),t('把決定變成有範圍的試驗與版本更新，事前訂好回退條件。','Turn decisions into scoped experiments and version changes, with rollback criteria agreed in advance.'),'topics/pilot.html'],
  ['Security & Governance',t('安全與治理',''),t('用風險預算、最小權限、人工核准和停用權維持試行界線。','Use risk budgets, least privilege, human approvals and suspension authority to enforce trial boundaries.'),'topics/governance.html'],
 ];
 const questions=[
  [t('哪些 AI Agent 真的創造價值？','Which AI agents actually create value?'),t('拿合格成果、工時、返工和總成本對照原流程，再檢查不同案例是否有相近結果。','Compare accepted outcomes, time, rework and total cost with the prior workflow, then check whether results hold across cases.')],
  [t('怎麼提高品質、同時降低成本？','How can we improve quality while reducing cost?'),t('固定驗收標準，用同一組案例比較策略或版本，把失敗、重試與人工覆核都算進去。','Compare strategies or versions on the same cases and acceptance criteria, counting failures, retries and human review.')],
  [t('什麼時候該升級、更換、限制或停用 Agent？','When should agents be upgraded, replaced, restricted or retired?'),t('用同一標準比較替代方案。品質下滑、違反政策或風險條件改變時，重新評估權限與是否繼續使用。','Compare alternatives using the same criteria. Reassess permissions and continued use when quality declines, policy is breached or risk conditions change.')],
 ];
 return `<section id="managed-evolution" tabindex="-1" class="module-section managed-evolution" aria-labelledby="evolution-title">
  <header class="evolution-intro">
   <p class="eyebrow">${t('AI 管理研究','AI MANAGEMENT RESEARCH')}</p>
   <h2 id="evolution-title">${t('可控演進','Managed Evolution')}</h2>
   <p><strong>${t('從防止失敗到管理安全試驗','From Preventing Failure to Managing Safe Experimentation')}</strong></p>
   <p>${t('有效的 AI 治理靠的是能察覺失敗、限制後果、從證據學習並安全恢復的系統。','Effective AI governance depends on systems that can detect failures, contain their consequences, learn from evidence and recover safely.')}</p>
   <p class="mini-note">${t('以下是研究框架。例子用來說明設計方式。','This is a research framework. The examples illustrate design choices.')}</p>
  </header>
  <section class="detail-section" aria-labelledby="evolution-principles">
   <h3 id="evolution-principles">${t('安全試驗的四個原則','Four principles for safe experimentation')}</h3>
   <ol class="evolution-grid">${principles.map(([name,mechanism,example],i)=>`<li><span class="eyebrow">0${i+1}</span><h4>${name}</h4><p><strong>${mechanism}</strong></p><p>${example}</p></li>`).join('')}</ol>
  </section>
  <section class="detail-section" aria-labelledby="earned-autonomy">
   <h3 id="earned-autonomy">${t('以證據取得自主權','Earned Autonomy')}</h3>
   <p>${t('四種模式示範可以給 Agent 多少自主權。擴大權限須重新檢查目前的風險與驗證結果，並由負責人核准。','These four modes illustrate levels of autonomy. Any increase requires current evidence, an acceptable risk assessment and approval by the accountable owner.')}</p>
   <ol class="evolution-grid autonomy-grid">${stages.map(([name,scope],i)=>`<li><span class="eyebrow">0${i+1}</span><h4>${name}</h4><p>${scope}</p></li>`).join('')}</ol>
   <dl class="autonomy-paths">
    <div><dt>${t('→ 擴大權限','→ Expand permissions')}</dt><dd>${t('用代表性任務重驗成果、例外處理與風險，再由人決定是否升級。','Retest outcomes, exceptions and risk on representative tasks before a person approves a move.')}</dd></div>
    <div><dt>${t('← 收緊或暫停','← Restrict or suspend')}</dt><dd>${t('品質下滑、違反政策或風險改變時，可退回較受限的模式或暫停。過往通過紀錄只是重新審查的其中一項證據。','Quality degradation, policy breaches or changes in risk can trigger a return to a more restricted mode or suspension. Past results are one input to reassessment.')}</dd></div>
   </dl>
  </section>
  <section class="detail-section" aria-labelledby="evolution-capabilities">
   <h3 id="evolution-capabilities">${t('對照既有 AI 管理做法','How this connects to existing AI management practices')}</h3>
   <ul class="evolution-grid">${capabilities.map(([name,label,description,path])=>`<li><h4>${label||e(name)}</h4>${label?`<p class="mini-note" lang="en">${e(name)}</p>`:''}<p>${description}</p><p>${external(methodologyUrl+path,t('查看方法庫','Read the methodology reference (Traditional Chinese)'))}</p></li>`).join('')}</ul>
  </section>
  <section class="detail-section" aria-labelledby="evolution-questions">
   <h3 id="evolution-questions">${t('企業要做的三個決定','Three enterprise decisions')}</h3>
   <dl class="evolution-decisions">${questions.map(([question,answer])=>`<div><dt>${question}</dt><dd>${answer}</dd></div>`).join('')}</dl>
  </section>
 </section>`;
}
function showcase(cases){return `${crumbs(null,t('顧問方法與案例','Consulting methods and cases'))}<section class="detail-intro"><p class="eyebrow">CONSULTING AGENTS</p><h1 id="page-title" tabindex="-1">${t('顧問方法與案例','Consulting methods and cases')}</h1><p class="lead">${t('先看既有的顧問方法與模擬案例，再看未來如何用三個資料庫規劃方案。','Explore existing consulting methods and simulated cases, then see how the three libraries could inform a future proposal.')}</p></section>${cases}${managedEvolution()}<h2 class="proposal-heading">${t('整合構想','Integration concept')}</h2><p>${t('以下是未來的規劃流程。目前網站可查閱三個資料庫，逐題配對與測試留待後續。','This is a proposed process. The three libraries are available to browse today. Problem-level matching and testing are future work.')}</p><ol class="proposal-steps">${[[t('框定問題與情境','Frame the problem & context'),t('從 99 Problems 出發，確認這次的決策、資料與限制。','Start with 99 Problems and establish the decision, evidence and constraints.')],[t('評估方向與參考','Assess directions & references'),t('Consulting Agents 比較選項；Startup Radar 提供可參考做法。','Consulting Agents compare options; Startup Radar provides approaches to consider.')],[t('選擇與組合能力','Select & combine capabilities'),t('從 Capability Store 確認能力用途、交接與人工判斷；不要求每種能力都出現。','Use Capability Store to examine purpose, handoffs and human judgment; not every capability type is required.')],[t('提出方案與驗證方式','Present a proposal & validation plan'),t('說明選擇理由、需要補的資訊、責任與驗收方式。','Explain rationale, information gaps, responsibilities and acceptance criteria.')]].map(([h,p],i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol><section class="governance">${sectionHead(t('貫穿流程的責任','RESPONSIBILITY THROUGHOUT'),t('誰負責核准與驗收？','Who approves the proposal and checks the results?'),'')}<div class="about-columns"><div><h3>${t('方案層','At proposal level')}</h3><p>${t('確認資料使用、決策責任、風險與核准要求，由人決定是否採納。','Confirm data use, decision ownership, risks and approvals; a person decides whether to adopt the proposal.')}</p></div><div><h3>${t('能力層','At capability level')}</h3><p>${t('每個能力說明所需資料、權限、人工確認與停止條件。','Each capability specifies data needs, permissions, human checks and stop conditions.')}</p></div></div></section><div class="actions">${link(t('探索銷售領域','Explore the sales domain')+' →',{view:'domain',domain:'business-sales'},'button primary')}${link(t('回首頁','Back home'),{view:'home'},'text-link')}</div>`;}
function missing(){return `<section class="detail-intro"><p class="eyebrow">${t('尚未提供','NOT AVAILABLE')}</p><h1 id="page-title" tabindex="-1">${t('找不到這個展示頁面','This demonstration page is unavailable')}</h1><p class="lead">${t('連結可能不完整，或內容尚未接入。','The link may be incomplete, or its content is not connected yet.')}</p><div class="actions">${link(t('回到領域入口','Back to domains'),{view:'home'},'button','#domains')}</div></section>`;}
let startupLoaded=false,filterOpen=false;
const openFilterAxes=new Set();
const parts=new Map(),partErrors=new Set(),loadingParts=new Set();
const openMethodTopics=new Set();
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
 if((['domain','library'].includes(state.view)&&state.tab==='methods')||state.view==='methodology')loadPart('methodology.json',body=>{data.methodology=body;});
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
function explorationContext(problem=null){
 problem=problem||data.problems.find(item=>item.id===state.context&&(!state.domain||item.domain===state.domain));
 if(!problem)return '';
 const isProblem=state.view==='detail'&&state.kind==='problem'&&state.id===problem.id;
 const saved=state.returnTo?readRoute(state.returnTo,state.lang):null;
 const problemRoute=saved?.view==='detail'&&saved.kind==='problem'&&saved.id===problem.id
  ?{...saved,lang:state.lang,returnTo:null}
  :{...state,view:'detail',kind:'problem',id:problem.id,context:problem.id,returnTo:null,origin:state.origin||'domain'};
 const route={view:problem.domain?'domain':'library',domain:problem.domain||null,context:problem.id,returnTo:routeUrl(problemRoute),from:null,kind:null,id:null,origin:'domain',page:1,category:'',group:'all',capview:'concepts',topic:'',resourceWork:'',filters:emptyFilters()};
 if(!isProblem)return `<aside class="exploration-context context-compact" aria-label="${t('目前參考的問題','Current problem context')}">
  <details><summary>${t('目前問題','Problem')} <strong>${e(problem.id)}</strong></summary>
   <p class="context-title">${e(fullTitle(problem,'problem'))}</p>
   <p class="mini-note">${t('各分頁提供可查閱的資料，適合這題的項目仍需逐一確認。','The tabs provide material to explore. Check each item before using it for this problem.')}</p>
  </details>
  ${link(t('回到問題','Return to problem'),problemRoute,'text-link','','data-return data-return-route')}
 </aside>`;
 return `<aside class="exploration-context" aria-label="${t('繼續查閱','Continue exploring')}">
  <p class="eyebrow">${t('接著查什麼？','WHERE TO LOOK NEXT')}</p>
  <nav class="context-links" aria-label="${t('繼續查閱','Continue exploring')}">${TABS.map(tab=>link(tabLabel(tab)+' →',{...route,tab},'text-link')).join('')}</nav>
  <p class="mini-note">${t('各分頁提供可查閱的資料，適合這題的項目仍需逐一確認。','The tabs provide material to explore. Check each item before using it for this problem.')}</p>
 </aside>`;
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
 if(state.tab==='methods')return `${crumbs(null,t('完整探索','Full exploration'))}<section class="detail-intro library-intro"><p class="eyebrow">AI METHODOLOGY LIBRARY</p><h1 id="page-title" tabindex="-1">${t('AI 導入方法','AI adoption methods')}</h1><p class="lead">${t('從選題到日常營運，查怎麼試、怎麼驗收，以及誰負責。','From selecting a use case to everyday operations, find how to run a pilot, evaluate results and assign responsibility.')}</p></section>${explorationContext()}${contentTabs()}<section role="tabpanel" id="panel-methods" aria-labelledby="tab-methods" class="domain-results">${methodologyContent()}</section>`;
 const titles={problems:t('全部企業問題與研究','All problems & research'),startups:t('探索完整新創資料','Explore all startup records'),capabilities:t('探索完整能力與資源','Explore all capabilities & resources')};
 const descriptions={problems:t('保留企業工作、AI 風險與治理、系統性影響的原分類。','Original categories cover business work, AI risks and governance, and systemic effects.'),startups:t('沿用產業／工作／解法交叉篩選；先篩選原始紀錄，再展示去重。','Filter by industry, work and solution. Source records are filtered before display deduplication.'),capabilities:t('能力構想、原有資源與熱門快照分開呈現，不混成已驗證能力。','Concepts, resource references and Trending snapshots are distinct from validated implementations.')};
 const result=state.tab==='startups'&&!startupLoaded?null:libraryItems(data,state);
 return `${crumbs(null,t('完整探索','Full exploration'))}<section class="detail-intro library-intro"><p class="eyebrow">${t('研究庫完整內容','COMPLETE LIBRARY CONTENT')}</p><h1 id="page-title" tabindex="-1">${titles[state.tab]}</h1><p class="lead">${descriptions[state.tab]}</p></section>${explorationContext()}${contentTabs()}<section role="tabpanel" id="panel-${state.tab}" aria-labelledby="tab-${state.tab}" class="domain-results">${result?listing(result.items,result.kind,libraryControls()):libraryControls()}</section>${state.tab==='startups'?`<p class="mini-note">${t('4,085 筆原始紀錄，合併明確重複後全體展示 4,000 筆；這不是經全面驗證的唯一公司數。','4,085 source records yield 4,000 display records after exact-duplicate grouping; these are not fully verified unique companies.')}</p>`:''}`;
}
function fullDomainPage(){
 const d=currentDomain();if(!d)return missing();const tab=state.tab;
 if(tab==='methods')return `${crumbs(null,v(d.label))}<section class="domain-intro compact-intro"><div><p class="eyebrow">${t('企業領域','BUSINESS DOMAIN')}</p><h1 id="page-title" tabindex="-1">${v(d.label)}</h1></div><label class="domain-picker">${t('切換領域','Change domain')}<select id="domain-picker">${data.domains.map(x=>`<option value="${e(x.id)}" ${x.id===d.id?'selected':''}>${v(x.label)}</option>`).join('')}</select></label></section>${explorationContext()}${contentTabs()}<section class="domain-results" role="tabpanel" id="panel-methods" aria-labelledby="tab-methods"><div class="results-heading"><p class="source-label">${t('AI 方法庫','AI Methodology Library')}</p>${link(t('探索完整資料','Explore the full module')+' →',{view:'library',domain:null,page:1,tab:'methods'},'text-link')}</div>${methodologyContent()}</section>`;
 const blocks={problems:{kind:'problem',source:'99 Problems'},startups:{kind:'startup',source:'Startup Radar'},capabilities:{kind:'capability',source:'Capability Store'}};
 const items=tab==='startups'?startupLoaded?startupMatches(data.startups,state):null:domainItems(data,d.id)[tab];
 const workLabels=tab==='startups'&&startupLoaded?data.startupData.taxonomy.dimensions.problem_workflow.categories
  .filter(c=>data.startupData.domain_mapping[d.id]?.includes(c.id))
  .map(c=>e(state.lang==='zh'?c.label_zh:c.label_en)).join(t('、',', ')):'';
 const scope=workLabels?`<p class="mini-note">${t('Startup Radar 工作分類：','Startup Radar work categories: ')}${workLabels}</p>`:'';
 return `${crumbs(null,v(d.label))}<section class="domain-intro compact-intro"><div><p class="eyebrow">${t('企業領域','BUSINESS DOMAIN')}</p><h1 id="page-title" tabindex="-1">${v(d.label)}</h1></div><label class="domain-picker">${t('切換領域','Change domain')}<select id="domain-picker">${data.domains.map(x=>`<option value="${e(x.id)}" ${x.id===d.id?'selected':''}>${v(x.label)}</option>`).join('')}</select></label></section>${explorationContext()}${contentTabs()}<section class="domain-results" role="tabpanel" id="panel-${tab}" aria-labelledby="tab-${tab}"><div class="results-heading"><p class="source-label">${blocks[tab].source}</p>${link(t('探索完整資料','Explore the full module')+' →',{view:'library',domain:null,page:1,category:'',group:'all',filters:emptyFilters()},'text-link')}</div>${scope}${items?listing(items,blocks[tab].kind,tab==='startups'?startupControls():''):partBlock('startups.json')}</section><details class="scope-disclosure"><summary>${t('分類與資料口徑','Categories & data scope')}</summary><p>${tab==='startups'?t('依既有工作大類提供領域參考；銷售／行銷、採購／供應鏈等領域可能共用較廣的原分類。未進行逐題 matching。全部資料仍可由完整新創入口探索。','Domain references use existing work categories. Sales/marketing and procurement/supply chain may share broader original categories. No problem-level matching is performed; every record remains available in full exploration.'):t('沿用原問題與能力的企業分類；同領域不代表已驗證可互相解決。','Original problem and capability business categories are retained. A shared domain does not establish a validated solution match.')}</p></details>`;
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
 const savedBack=state.from?readRoute(state.from,state.lang):null;
 const back=savedBack&&['domain','library','showcase'].includes(savedBack.view)
  ?{...savedBack,lang:state.lang}
  :{...state,view:returnView(),tab:tabForKind(state.kind),domain:d?.id||null,kind:null,id:null,from:null,returnTo:state.kind==='problem'?null:state.returnTo,context:state.kind==='problem'?null:state.context};
 const fromShowcase=back.view==='showcase';
 const showcaseLabel=t('顧問案例','Consulting cases');
 const summary=state.kind==='capability'?v(x.purpose):['startup','resource','trend'].includes(state.kind)?v(x.summary):'';
 return `${crumbs(null,`${link(fromShowcase?showcaseLabel:fromLibrary()?t('完整探索','Full exploration'):d?v(d.label):t('顧問方法','Consulting methods'),back,'','','data-return data-return-route')} / ${e(fullTitle(x,state.kind))}`)}<article class="detail-page"><header class="detail-intro"><p class="eyebrow">${kindName(state.kind)}${state.kind==='problem'?' · '+e(x.id):state.kind==='capability'?' · '+e(capabilityType(x.kind)):''}</p><h1 id="page-title" tabindex="-1">${e(fullTitle(x,state.kind))}</h1>${summary?`<p class="lead">${summary}</p>`:''}${state.kind==='capability'?`<p class="detail-status">${t('能力構想，尚未實作；例子為虛構示範。','Capability concept, not implemented; examples are fictional illustrations.')}</p>`:''}</header>${state.kind==='problem'?explorationContext(x):explorationContext()}${body()}<section class="source-section"><h2>${t('回查原模組','View original module')}</h2>${original?external(original,t('查看原站','View original site')):''}<p class="mini-note">${t('固定來源版本','Pinned version')} · ${e(commit?.slice(0,8))}</p></section></article><nav class="detail-return" aria-label="${t('返回探索','Return to exploration')}">${link('← '+t('返回','Back to')+' '+(fromShowcase?showcaseLabel:tabLabel(tabForKind(state.kind))),back,'button','','data-return data-return-route')}${!fromShowcase&&state.kind!=='guide'?`<div><span>${d?v(d.label):t('完整探索','Full exploration')}</span>${TABS.filter(tab=>tab!==tabForKind(state.kind)).map(tab=>link(tabLabel(tab),{...back,tab,page:1,group:'all',category:'',topic:'',resourceWork:'',filters:emptyFilters()},'text-link','','data-return')).join('')}</div>`:''}</nav>`;
}
function completeShowcase(){return showcase(`<section class="module-section" id="source-methods">${sectionHead(t('既有顧問方法與實踐','EXISTING METHODS & PRACTICE'),t('原有顧問方法與案例','Original frameworks & validation content'),t('案例使用模擬資料，可從問題詳情查看原始案例與驗證紀錄。','These cases use simulated data. Open a case to see the original write-up and validation records.'))}<ul class="case-links">${data.problems.filter(p=>data.evidence_ids.includes(p.id)).map(p=>`<li>${link(e(p.id+' · '+fullTitle(p,'problem')),{view:'detail',kind:'problem',id:p.id,domain:null,origin:'showcase'},'text-link')}</li>`).join('')}</ul><div class="item-list">${data.guides.map(g=>`<article class="item-card"><a class="item-main" data-route href="${e(url({view:'detail',domain:null,kind:'guide',id:g.id,origin:'showcase'}))}"><h3>${v(g.name)}</h3><span>${t('閱讀原文件','Read original document')} →</span></a></article>`).join('')}</div></section>`);}

function detailDataReady(){
 if(!data)return false;
 if((['domain','library'].includes(state.view)&&state.tab==='methods')||state.view==='methodology')if(!data.methodology&&!partErrors.has('methodology.json'))return false;
 if((['domain','library'].includes(state.view)&&state.tab==='startups')||(state.view==='detail'&&state.kind==='startup'))if(!startupLoaded&&!partErrors.has('startups.json'))return false;
 if(state.view==='detail'){
  const x=detailItem(data,state);if(!x)return true;
  const files=state.kind==='startup'?x.duplicate_ids.map(id=>'startup/'+data.startups.find(r=>r.id===id).detail_file):state.kind==='guide'?[x.files[state.lang]]:state.kind==='problem'&&data.evidence_ids.includes(x.id)?['evidence/'+x.id+'.json','case-pages/'+x.id+'-'+state.lang+'.json']:[];
  return files.every(f=>parts.has(f)||partErrors.has(f));
 }
 return true;
}

function render(){const d=currentDomain();const x=data&&state.view==='detail'?detailItem(data,state):null;const pageTitle=x?fullTitle(x,state.kind):state.view==='library'?t('完整探索','Full exploration'):state.view==='domain'?d?.label[state.lang]:state.view==='showcase'?t('顧問方法與案例','Consulting methods and cases'):state.view==='methodology'?t('AI 方法庫','AI Methodology Library'):t('企業 AI 導入與治理','Enterprise AI Adoption & Governance');document.title=(pageTitle||t('頁面未提供','Page unavailable'))+' · Consulting Demo';document.documentElement.lang=state.lang==='zh'?'zh-Hant':'en';app.innerHTML=`<div class="shell"><a class="skip" href="#page-title">${t('跳到主要內容','Skip to main content')}</a><header class="masthead">${link(`<span class="brand-dot" aria-hidden="true"></span>${t('企業 AI 導入與治理','Enterprise AI Adoption & Governance')}`,{view:'home'},'brand')}<nav class="primary-nav" aria-label="${t('主要導覽','Main navigation')}">${link(t('四個研究庫','Research libraries'),{view:'home'},'','#source-libraries',['library','methodology'].includes(state.view)?'aria-current="page"':'')}${link(t('按工作領域瀏覽','By business domain'),{view:'home'},'','#domains',state.view==='domain'?'aria-current="page"':'')}${link(t('顧問案例','Consulting cases'),{view:'showcase'},'','',state.view==='showcase'?'aria-current="page"':'')}</nav><div class="language" role="group" aria-label="Language"><button data-lang="zh" lang="zh-Hant" aria-pressed="${state.lang==='zh'}">中文</button><button data-lang="en" lang="en" aria-pressed="${state.lang==='en'}">EN<span class="sr-only"> English</span></button></div></header><main>${!data?`<section class="detail-intro"><h1 id="page-title" tabindex="-1">${error?t('資料暫時無法載入','Unable to load content'):t('正在讀取展示內容…','Loading the demonstration…')}</h1>${error?`<button class="button" data-retry>${t('重新載入','Retry')}</button>`:''}</section>`:state.view==='domain'?domainPage():state.view==='library'?libraryPage():state.view==='detail'?detailPage():state.view==='showcase'?completeShowcase():state.view==='methodology'?methodologyPage():home()}</main><footer><p>CONSULTING DEMO · ${t('概念展示，非已實作服務','Concept prototype, not an implemented service')}</p><span>${t('資料來源與驗證紀錄可查','Source references and validation records available')}</span></footer></div>`;
 if(data&&pending&&detailDataReady()){const p=pending;pending=null;const anchor=p.hash?document.getElementById(p.hash.slice(1)):null;if(anchor)anchor.scrollIntoView();else window.scrollTo(0,p.top);if(p.filterFocus)document.querySelector(`input[data-axis="${p.filterFocus.axis}"][value="${p.filterFocus.id}"]`)?.focus({preventScroll:true});else if(p.focusTab)document.querySelector(`[data-tab="${p.focusTab}"]`)?.focus({preventScroll:true});else if(p.focusId)document.querySelector(`[data-item="${p.focusId}"]`)?.focus({preventScroll:true});else if(p.focus)(anchor?.hasAttribute('tabindex')?anchor:document.querySelector('#page-title'))?.focus({preventScroll:true});}
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
 event.preventDefault();const i=TABS.indexOf(tab.dataset.tab);const next=event.key==='Home'?0:event.key==='End'?TABS.length-1:(i+(event.key==='ArrowRight'?1:TABS.length-1))%TABS.length;
 switchTab(TABS[next]);
});
app.addEventListener('change',event=>{
 const target=event.target;
 if(target.id==='domain-picker')navigate({...state,view:'domain',domain:target.value,context:null,page:1,filters:emptyFilters()});
 const fields={'problem-group':'group','problem-category':'category','concept-domain':'category','capview':'capview','resource-topic':'topic','resource-work':'resourceWork'};
 if(fields[target.id])navigate({...state,page:1,[fields[target.id]]:target.value,...(target.id==='problem-group'?{category:''}:{}),...(target.id==='capview'?{category:'',topic:'',resourceWork:''}:{})});
 if(target.dataset.axis){const axis=target.dataset.axis,id=target.value;filterOpen=true;openFilterAxes.add(axis);const selected=state.filters[axis];navigate({...state,page:1,filters:{...state.filters,[axis]:selected.includes(id)?selected.filter(x=>x!==id):[...selected,id]}},{keepTop:true,filterFocus:{axis,id}});}
});
app.addEventListener('toggle',event=>{if(!event.target.isConnected)return;
 const methodTopic=event.target.dataset?.methodTopic;
 if(methodTopic){if(event.target.open)openMethodTopics.add(methodTopic);else openMethodTopics.delete(methodTopic);}
 if(event.target.matches?.('.startup-filters'))filterOpen=event.target.open;
 const axis=event.target.dataset?.filterAxis;
 if(axis){if(event.target.open)openFilterAxes.add(axis);else openFilterAxes.delete(axis);}},true);
window.addEventListener('popstate',()=>{positions[routeKey(state)]=scrollY;state=readRoute(location.search,state.lang,location.hash);pending={top:history.state?.top??positions[routeKey(state)]??0,hash:location.hash};render();});
window.addEventListener('pagehide',save);
async function load(){error=false;render();try{const res=await fetch(new URL('../data/catalog.json',import.meta.url));if(!res.ok)throw Error('load');data=await res.json();}catch{error=true;}render();}
load();
