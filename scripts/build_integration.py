from pathlib import Path
from html.parser import HTMLParser
from html import escape
from urllib.parse import urljoin,urlparse,quote
import json,hashlib,re,shutil,argparse
R=Path(__file__).resolve().parents[1];I=R/'data/imports'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8',newline='\n')
def bi(a,b):return {'zh':a,'en':b}
def array(p):
 s=p.read_text(encoding='utf-8');return json.loads(s[s.index('['):s.rfind(']')+1])
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build(out):
 manifest=read(I/'manifest.json');commits=manifest['commits']
 for f,h in manifest['files'].items():
  if digest(I/f)!=h:raise ValueError('Source snapshot changed: '+f)
 cap=read(I/'capability-store/concepts/business-concepts.json');domains=[{'id':d['work_id'],'label':d['label']} for d in cap['domains']]
 domain_names={d['label']['en']:d['id'] for d in domains};domain_names['Legal / Compliance']='business-legal';domain_names['Customer Service']='business-customer-service';domain_names['HR']='business-hr';domain_names['Supply Chain']='business-supply-chain'
 rawzh=array(I/'99-problems/data/problems.js');rawen=array(I/'99-problems/en/data/problems.js');enby={p['ID']:p for p in rawen}
 assert len(rawzh)==len(rawen)==99 and {x['ID'] for x in rawzh}==set(enby)
 problems=[]
 for z in rawzh:
  pid=z['ID'];problems.append({'id':pid,'domain':domain_names.get(z['Category']),'group':z['group'],'category':z['Category'],'category_label':bi(z.get('categoryZh',z['Category']),enby[pid].get('categoryEn',z['Category'])),'zh':z,'en':enby[pid],'source':{'module':'99-problems','commit':commits['99-problems'],'original_url':{'zh':f'https://vcstseng.github.io/99-problems/pages/problems/{pid}/index.html','en':f'https://vcstseng.github.io/99-problems/en/pages/problems/{pid}/index.html'}}})
 details={}
 for f in ['sales-details.json','business-details.json']:
  for id,d in read(I/'capability-store/concepts'/f)['details'].items():
   assert id not in details;details[id]=d
 assert len(details)==60
 bydomain={id:d['work_id'] for d in cap['domains'] for s in d['stages'] for id in s['concept_ids']}
 capabilities=[{**c,'domain':bydomain[c['id']],'detail':details[c['id']],'original_url':{l:'https://vcstseng.github.io/capability-store/?lang='+l+'&view=resource&id='+c['id'] for l in ['zh','en']},'source_commit':commits['capability-store']} for c in cap['concepts']]
 sourcecat=read(I/'capability-store/catalog/catalog.json');navigation=read(I/'capability-store/config/taxonomy/portal-navigation.json');resource_display=read(I/'capability-store/config/resource-display.json')
 themes=sourcecat['capabilities'];themeby={x['id']:x for x in themes};navmap={n['id']:n for n in navigation['categories']};resource_domains={r['id']:[] for r in sourcecat['resources']}
 for n in navigation['categories']:
  for theme in n['capability_ids']:
   for rid in themeby[theme]['resource_ids']:resource_domains[rid].append(n['id'])
 resources=[{**x,'domains':resource_domains[x['id']],'display':resource_display.get(x['id']),'source_commit':commits['capability-store'],'original_url':{l:'https://vcstseng.github.io/capability-store/?lang='+l+'&view=resource&id='+x['id'] for l in ['zh','en']}} for x in sourcecat['resources']]
 trend=read(I/'capability-store/catalog/trending.json');trending=[]
 for r in trend['repositories']:
  id='github:'+r['repository'].lower();trending.append({**r,'id':id,'name':r['repository'],'source_commit':commits['capability-store'],'observed_at':trend['observed_at'],'original_url':{l:'https://vcstseng.github.io/capability-store/?lang='+l+'&view=resource&source=trending&id='+quote(id,safe='') for l in ['zh','en']}})
 sr=I/'startup-radar';records=read(sr/'catalog/records.json');duplicates=read(sr/'duplicates.json');taxonomy=read(sr/'catalog/taxonomy.json');supplements=read(sr/'supplements.json')
 assert records['record_count']==4085 and duplicates['display_record_count']==4000 and duplicates['dataset_id']==records['dataset_id'] and duplicates['build_id']==read(sr/'catalog/index.json')['build_id']
 canonical={id:key for key,ids in duplicates['groups'].items() for id in ids}
 translations=(sr/'translations.ts').read_text(encoding='utf-8');enlabels=json.loads(translations[translations.index('{'):translations.index('\n};')+2])
 for dimension in taxonomy['dimensions'].values():
  for c in dimension['categories']:c['label_en']=enlabels.get(c['label_zh'],c['label_zh'])
 mapping={'business-sales':['sales-marketing'],'business-marketing':['sales-marketing'],'business-finance':['finance-accounting'],'business-hr':['people-workforce'],'business-procurement':['supplychain-procurement'],'business-operations':['operations-planning','production-quality','facilities-maintenance'],'business-customer-service':['customer-service'],'business-supply-chain':['supplychain-procurement'],'business-legal':['legal-compliance'],'business-management':['operations-planning']}
 index=[];batches={}
 for r in records['records']:
  f=r['detail_file']
  if f not in batches:batches[f]=read(sr/'catalog'/f)
  full=batches[f]['records_by_id'][r['id']];raw=full['evidence']['text'];end=raw.rfind(' ',0,360);excerpt=raw if len(raw)<=360 else raw[:end if end>240 else 360]+'…'
  ds=[d for d,categories in mapping.items() if set(categories)&set(r['categories']['problem_workflow'])]
  index.append({**{k:r[k] for k in ['id','name','summary_zh','source','website','website_status','categories','detail_file']},'domains':ds,'summary':bi(r['summary_zh'],excerpt),'canonical':canonical.get(r['id'],r['id']),'duplicate_ids':duplicates['groups'].get(canonical.get(r['id'],r['id']),[r['id']]),'source_commit':commits['startup-radar'],'original_url':{l:'https://vcstseng.github.io/startup-radar/?lang='+l+'&view=company&id='+r['id'] for l in ['zh','en']}})
 assert len({r['canonical'] for r in index})==4000
 for f,body in batches.items():write(out/'startup'/f,body)
 write(out/'startups.json',{'records':index,'taxonomy':taxonomy,'duplicates':duplicates,'supplements':supplements,'domain_mapping':mapping})
 # Only passive main content is included: no scripts, handlers, forms or embedded apps.
 class MainHTML(HTMLParser):
  allowed={'section','article','div','p','span','strong','b','em','i','ul','ol','li','h1','h2','h3','h4','a','details','summary','table','thead','tbody','tr','th','td','pre','code','blockquote','br','small','figure','figcaption','hr'}
  blocked={'script','style','iframe','form','button','input','select','textarea','noscript','header','nav','footer'}
  def __init__(self,base,lang):super().__init__(convert_charrefs=True);self.base=base;self.lang=lang;self.main=False;self.depth=0;self.hide=0;self.out=[]
  def handle_starttag(self,tag,attrs):
   if tag=='main':self.main=True;return
   if not self.main:return
   if tag in self.blocked:
    if tag!='input':self.hide+=1
    return
   if self.hide:return
   if tag not in self.allowed:return
   attrs=dict(attrs);safe=''
   if tag=='h1':tag='h2'
   if tag=='a':
    href=urljoin(self.base,attrs.get('href',''));u=urlparse(href)
    match=re.search(r'/pages/problems/([^/]+)/',u.path)
    guide=re.search(r'/pages/(practice|methodology|roadmap)/',u.path)
    if match and match[1] in enby:href=f'?lang={self.lang}&view=detail&kind=problem&id={match[1]}&origin=library'
    elif guide:href=f'?lang={self.lang}&view=detail&kind=guide&id={guide[1]}&origin=showcase'+('#'+u.fragment if u.fragment else '')
    if href.startswith('?'):safe=f' data-route href="{escape(href,quote=True)}"'
    elif u.scheme in {'http','https'}:safe=f' href="{escape(href,quote=True)}" target="_blank" rel="noopener noreferrer"'
   if tag in {'th','td'}:
    for key in ['colspan','rowspan']:
     if attrs.get(key,'').isdigit():safe+=f' {key}="{attrs[key]}"'
   if re.fullmatch(r'[a-zA-Z][\w-]*',attrs.get('id','')):safe+=' id="'+escape(attrs['id'],quote=True)+'"'
   self.out.append('<'+tag+safe+'>')
  def handle_endtag(self,tag):
   if tag=='main':self.main=False;return
   if not self.main:return
   if tag in self.blocked:
    if tag!='input':self.hide=max(0,self.hide-1)
    return
   if self.hide or tag not in self.allowed or tag in {'br','hr'}:return
   self.out.append('</'+('h2' if tag=='h1' else tag)+'>')
  def handle_data(self,text):
   if self.main and not self.hide:self.out.append(escape(text))
 guides=[]
 for id,label in [('practice',bi('顧問 Agent 框架與解題實踐','Consulting agent framework & practice')),('methodology',bi('問題研究方法','Problem research methodology')),('roadmap',bi('治理、驗證與研究路線圖','Governance, validation & research roadmap'))]:
  guide={'id':id,'name':label,'source_commit':commits['99-problems'],'original_url':{},'files':{}}
  for lang,prefix in [('zh',''),('en','en/')]:
   p=I/'99-problems'/prefix/'pages'/id/'index.html';base='https://vcstseng.github.io/99-problems/'+prefix+'pages/'+id+'/index.html';parser=MainHTML(base,lang);parser.feed(p.read_text(encoding='utf-8'));file=f'guides/{id}-{lang}.json';write(out/file,{'html':''.join(parser.out)});guide['files'][lang]=file;guide['original_url'][lang]=base
  guides.append(guide)
 evidence={}
 for p in sorted((I/'99-problems/data/consulting').rglob('*')):
  if p.is_file():evidence.setdefault(p.parent.name,[]).append({'name':p.name,'format':p.suffix[1:],'content':p.read_text(encoding='utf-8'),'source_path':str(p.relative_to(I/'99-problems')).replace('\\','/')})
 for id,items in evidence.items():write(out/'evidence'/f'{id}.json',{'files':items})
 # Extended original case pages are kept as passive documents, alongside original case files.
 for id in evidence:
  for lang,prefix in [('zh',''),('en','en/')]:
   p=I/'99-problems'/prefix/'pages/problems'/id/'index.html'
   if p.exists():
    parser=MainHTML('https://vcstseng.github.io/99-problems/'+prefix+'pages/problems/'+id+'/index.html',lang);parser.feed(p.read_text(encoding='utf-8'));write(out/'case-pages'/f'{id}-{lang}.json',{'html':''.join(parser.out)})
 catalog={'schema_version':'1.0-integrated-prototype','domains':domains,'problems':problems,'startups':[],'capabilities':capabilities,'resources':resources,'themes':themes,'resource_navigation':navigation,'trending':trending,'guides':guides,'evidence_ids':list(evidence),'matching_status':'not_implemented','case_status':'original_synthetic_cases_only','counts':{'problems':99,'business_problems':sum(p['group']=='business' for p in problems),'capabilities':60,'resources':len(resources),'trending':len(trending),'startup_records':4085,'startup_display':4000},'commits':commits,'startup_file':'startups.json','domain_mapping':mapping}
 write(out/'catalog.json',catalog)
 report={'counts':catalog['counts'],'problem_ids':len({p['id'] for p in problems}),'startup_ids':len({s['id'] for s in index}),'details_batches':len(batches),'synthetic_evidence_files':sum(len(x) for x in evidence.values()),'source_files_verified':len(manifest['files']),'guide_documents':6,'case_documents':8,'input_commits':commits,'domain_counts':{d['id']:{'problems':sum(p['domain']==d['id'] for p in problems),'capabilities':sum(c['domain']==d['id'] for c in capabilities),'startup_records':sum(d['id'] in s['domains'] for s in index)} for d in domains}}
 write(out/'integration-report.json',report);return report
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True);args=p.parse_args();report=build(args.out);print(json.dumps(report['counts']))
