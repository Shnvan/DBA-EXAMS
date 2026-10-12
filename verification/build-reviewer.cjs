/* Authored source notes are kept separate from question banks and SQL exercises. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,name),'utf8'));
const sources=['reviewer-content-123.json','reviewer-content-45.json'].map(read),modules=sources.flatMap(s=>s.modules).sort((a,b)=>a.number-b.number),lessons=modules.flatMap(m=>m.lessons),topics=lessons.flatMap(l=>l.topics),coverage=read('module-coverage.json'),pdf=read('pdf-source-pages.json');
assert.equal(modules.length,5);assert.equal(lessons.length,18);
const unique=list=>assert.equal(new Set(list.map(x=>x.id)).size,list.length);
unique(modules);unique(lessons);unique(topics);
const normalized=value=>String(value).replace(/\s+/g,' ').trim(),pages=new Map(pdf.pages.map(p=>[p.page,normalized(p.text)]));
for(const module of modules){assert.equal(module.id,'module-'+module.number);for(const lesson of module.lessons){assert(lesson.id.startsWith('m'+module.number+'-l'));assert(lesson.title&&lesson.pages.length);for(const topic of lesson.topics){
 assert(/^[a-z0-9-]+$/.test(topic.id));assert(topic.title&&topic.definition&&topic.bullets.length>=2&&topic.bullets.length<=5,topic.id);assert(Array.isArray(topic.aliases));
 assert(topic.pages.length&&topic.pages.every(p=>pages.has(p)&&p>=10),topic.id);assert(topic.sourceEvidence?.length,topic.id);
 for(const evidence of topic.sourceEvidence){assert(topic.pages.includes(evidence.page),topic.id);assert(evidence.excerpt?.trim(),topic.id);assert(evidence.visual||pages.get(evidence.page).includes(normalized(evidence.excerpt)),topic.id+' source excerpt')}
 if(topic.comparison)assert(topic.comparison.rows.every(row=>row.length===topic.comparison.columns.length),topic.id);
 for(const note of topic.corrections||[]){assert(note.text&&note.label,topic.id);const url=new URL(note.url);assert(url.protocol==='https:'&&/(^|\.)(mariadb\.com|mysql\.com|postgresql\.org|microsoft\.com|ibm\.com|oracle\.com|sqlite\.org|apache\.org)$/.test(url.hostname),topic.id)}
}}}
const activeIds=new Set(coverage.concepts.flatMap(c=>[...c.identification,...c.multipleChoice]));
for(const topic of topics)for(const id of topic.coverageIds||[])assert(activeIds.has(id),topic.id+' invalid/retired coverage '+id);
const conceptLinks=coverage.concepts.map((concept,index)=>{
 const questionIds=[...concept.identification,...concept.multipleChoice],topicIds=topics.filter(t=>(t.coverageIds||[]).some(id=>questionIds.includes(id))).map(t=>t.id);
 assert(topicIds.length,'Missing concept '+concept.concept);
 for(const id of questionIds)assert(topics.some(t=>t.coverageIds?.includes(id)),'Missing question support '+id);
 return{id:'source-concept-'+index,concept:concept.concept,page:concept.page,questionIds,topicIds};
});
const repeatReasons={
 10:'Module introduction; the four actual lessons cover its outcomes.',26:'Module summary repeats the four lessons; references are attribution rather than new concepts.',27:'Summary/reference material; no additional instructional concept.',28:'Module introduction and SQL background are covered by Lesson 1.',46:'Summary and references repeat SQL types and monitor commands.',47:'Module introduction; its database and SQL outcomes are covered in the three lessons.',66:'Summary and references repeat the SQL command categories.',67:'Introduction and SELECT instruction are covered by the first lesson.',87:'Module summary/reference material repeats filtering and logical operators.',88:'Module introduction; joins are explained in the three lessons.',105:'Summary, references and future-topic mentions. Subqueries, views and stored procedures are not taught here.'
};
const pageReview=pdf.pages.map(({page})=>{
 const supported=topics.filter(t=>t.pages.includes(page));
 if(supported.length)return{page,status:'covered',topicIds:supported.map(t=>t.id),reason:'Authored concise notes link the definition, subtopic, table, diagram, or demonstrated behavior on this page.'};
 const inherited=topics.filter(t=>t.sourceEvidence.some(e=>e.page===page));
 if(inherited.length)return{page,status:'covered',topicIds:inherited.map(t=>t.id),reason:'Linked source evidence.'};
 if(page<10)return{page,status:'excluded',topicIds:[],reason:'Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content.'};
 if(repeatReasons[page])return{page,status:'excluded',topicIds:[],reason:repeatReasons[page]};
 const lesson=lessons.find(l=>l.pages.includes(page));
 assert(lesson,'PDF page has no lesson or exclusion '+page);
 return{page,status:'covered-by-recurring-topic',topicIds:lesson.topics.map(t=>t.id),reason:'Continuation, worked result, or repeated example in '+lesson.title+'. Concepts are consolidated in this lesson instead of duplicating each sample row.'};
});
const exclusions=sources.flatMap(s=>s.exclusions||[]),inventory={version:'reviewer-v8',pdfSHA256:pdf.sha256,modules:modules.length,lessons:lessons.length,topics:topics.length,conceptLinks,pageReview,exclusions};
fs.writeFileSync(path.join(__dirname,'reviewer-content.js'),'/* Concise PDF reviewer, authored in reviewer-content-123.json and reviewer-content-45.json. */\nconst REVIEWER_MODULES='+JSON.stringify(modules).replace(/</g,'\\u003c')+';\n');
fs.writeFileSync(path.join(__dirname,'reviewer-coverage.json'),JSON.stringify(inventory,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'reviewer-coverage.md'),'# Reviewer source coverage\n\nFive modules, eighteen actual lessons, '+topics.length+' authored topics. Every active exam concept is mapped below; this is a coverage checklist, not an item quota. The original PDF SHA-256 is '+pdf.sha256+'.\n\n| Source concept | PDF page | Reviewer topic identities |\n|---|---:|---|\n'+conceptLinks.map(c=>'| '+c.concept.replace(/\|/g,'/')+' | '+c.page+' | '+c.topicIds.join(', ')+' |').join('\n')+'\n\n## All 105 PDF pages\n\n| Page | Status | Reason |\n|---:|---|---|\n'+pageReview.map(p=>'| '+p.page+' | '+p.status+' | '+p.reason.replace(/\|/g,'/')+' |').join('\n')+'\n\n## Content exclusions\n\n'+exclusions.map(e=>'- Pages '+e.pages.join(', ')+': '+e.reason).join('\n')+'\n');
console.log(JSON.stringify({modules:modules.length,lessons:lessons.length,topics:topics.length,concepts:conceptLinks.length,pages:pageReview.length}));
