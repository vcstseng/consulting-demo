import {readFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {validate} from '../src/engine.js';
const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.dirname(web),out=path.join(web,'dist/data');
execFileSync(process.platform==='win32'?'python':'python3',[path.join(root,'scripts/build_integration.py'),'--out',out],{cwd:root,stdio:'inherit'});
const data=JSON.parse(await readFile(path.join(out,'catalog.json'),'utf8'));
const startups=JSON.parse(await readFile(path.join(out,'startups.json'),'utf8'));validate(data,startups);
const methodology=JSON.parse(await readFile(path.join(web,'data/methodology.json'),'utf8'));
const questionIds=new Set(methodology.questions.map(q=>q.id));
const topicIds=new Set(methodology.topics.map(topic=>topic.id));
const methodIds=new Set(methodology.method_ids);
if(questionIds.size!==35||methodIds.size!==55||topicIds.size!==6||methodology.questions.length!==35||methodology.topics.length!==6)throw Error('Invalid methodology totals');
const topicQuestionIds=methodology.topics.flatMap(topic=>topic.question_ids);
if(topicQuestionIds.length!==35||new Set(topicQuestionIds).size!==35)throw Error('Invalid methodology topic membership');
for(const topic of methodology.topics){
 if(!['zh','en'].every(lang=>topic.title[lang]&&topic.summary[lang]))throw Error('Missing topic translation');
 if(topic.question_ids.some(id=>!questionIds.has(id)))throw Error('Unknown methodology question');
}
for(const question of methodology.questions){
 if(!topicIds.has(question.topic_id)||!methodology.topics.find(topic=>topic.id===question.topic_id).question_ids.includes(question.id))throw Error('Invalid question topic');
 if(!['zh','en'].every(lang=>question.title[lang]&&question.summary[lang]))throw Error('Missing question translation');
 if(!question.method_ids.length||question.method_ids.some(id=>!methodIds.has(id)))throw Error('Invalid method reference');
 if(question.source_url!==methodology.source.website+'questions/'+question.id+'.html')throw Error('Invalid question source');
}
if(methodology.methods.length!==55||new Set(methodology.methods.map(method=>method.id)).size!==55)throw Error('Invalid method metadata');
for(const method of methodology.methods){
 if(!methodIds.has(method.id)||!method.title||method.source_url!==methodology.source.website+'methods/'+method.id+'.html')throw Error('Invalid method metadata reference');
}
if(!/^[0-9a-f]{40}$/.test(methodology.source.commit))throw Error('Missing methodology source version');
await copyFile(path.join(web,'data/methodology.json'),path.join(out,'methodology.json'));
for(const folder of ['','src','data'])await mkdir(path.join(web,'dist',folder),{recursive:true});
for(const file of ['index.html','src/app.js','src/styles.css','src/engine.js'])await copyFile(path.join(web,file),path.join(web,'dist',file));
console.log('Built integrated prototype: 99 problems, 4085 startup records / 4000 display groups, 60 concepts, 84 resources, 15 trending entries.');
