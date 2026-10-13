const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,name),'utf8'));
const data=read('reviewer-syntax-content.json'),pdf=read('pdf-source-pages.json'),reviewer=read('reviewer-coverage.json');
const topics=['123','45'].flatMap(part=>read('reviewer-content-'+part+'.json').modules).flatMap(m=>m.lessons.flatMap(l=>l.topics));
const norm=x=>String(x).replace(/\s+/g,' ').trim(),ids=[];
assert.equal(data.version,'syntax-v1');assert.equal(data.categories.length,9);
for(const c of data.categories){
 assert(/^[a-z0-9-]+$/.test(c.id)&&c.title&&c.description&&c.entries.length);
 for(const e of c.entries){
  assert(/^[a-z0-9-]+$/.test(e.id),e.id);assert(e.title&&e.pages.length,e.id);
  assert(e.syntax===null||typeof e.syntax==='string'&&e.syntax.trim(),e.id);
  assert(e.syntax!==null||e.notes.length,e.id);assert(e.pages.every(p=>Number.isInteger(p)&&p>=1&&p<=105),e.id);
  assert(Array.isArray(e.notes)&&e.notes.every(n=>typeof n==='string'&&n.trim()),e.id);
  assert(e.sourceTopicIds.length&&e.sourceTopicIds.every(id=>topics.some(t=>t.id===id)),e.id);
  assert(e.sourceEvidence.length,e.id);
  for(const ev of e.sourceEvidence){assert(e.pages.includes(ev.page)&&ev.excerpt,e.id+' evidence');if(!ev.visual)assert(norm(pdf.pages[ev.page-1].text).includes(norm(ev.excerpt)),e.id+' exact excerpt on page '+ev.page)}
  for(const note of e.corrections||[]){const u=new URL(note.url);assert(u.protocol==='https:'&&note.text&&note.label,e.id);assert(/(^|\.)(mariadb\.com|mysql\.com|postgresql\.org)$/.test(u.hostname),e.id)}
  if(e.otherDialect)assert(e.otherDialect.label&&e.otherDialect.syntax&&new URL(e.otherDialect.url).protocol==='https:',e.id);
  ids.push(e.id);
 }
}
assert.equal(new Set(ids).size,ids.length);assert.equal(new Set(data.categories.map(c=>c.id)).size,9);
fs.writeFileSync(path.join(__dirname,'reviewer-syntax.js'),'/* PDF-scoped syntax reference: authored templates, not quotations. */\nconst REVIEWER_SYNTAX='+JSON.stringify(data).replace(/</g,'\\u003c')+';\n');
const entries=data.categories.flatMap(c=>c.entries);
const coverage={version:'syntax-v1',contentVersion:'reviewer-v9',pdfSHA256:pdf.sha256,categories:data.categories.map(c=>({id:c.id,title:c.title,entries:c.entries.map(e=>({id:e.id,title:e.title,pages:e.pages,sourceTopicIds:e.sourceTopicIds,sourceEvidence:e.sourceEvidence,kind:e.syntax?'generalized-template':'dialect-note',correctionLinks:(e.corrections||[]).map(n=>n.url)}))})),exclusions:data.exclusions,pageReview:pdf.pages.map(p=>{
 const entryIds=entries.filter(e=>e.pages.includes(p.page)).map(e=>e.id),source=reviewer.pageReview.find(r=>r.page===p.page);
 return{page:p.page,entryIds,lessonTopicIds:source?.topicIds||[],reason:entryIds.length?'Templates or source notes linked below.':source?.topicIds?.length?'Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page.':source?.reason||'Administrative material; no syntax instruction.'};
})};
fs.writeFileSync(path.join(__dirname,'reviewer-syntax-coverage.json'),JSON.stringify(coverage,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'reviewer-syntax-coverage.md'),'# PDF syntax reference inventory\n\nContent version: reviewer-v9. PDF SHA-256: '+pdf.sha256+'\n\nTemplates are constructed from taught forms and named syntax-bearing concepts; they are not PDF quotations. Visual evidence refers to image tables, diagrams or the client screenshot. Lesson notes retain conceptual teaching and Access procedures.\n\n'+data.categories.map(c=>'## '+c.title+'\n\n'+c.entries.map(e=>'- **'+e.title+'** (`'+e.id+'`) — pages '+e.pages.join(', ')+'; '+e.sourceTopicIds.join(', ')+(e.syntax?'':' — dialect note only')).join('\n')).join('\n\n')+'\n\n## Exclusions\n\n'+data.exclusions.map(e=>'- '+e.topic+' — '+e.reason+(e.pages.length?' (pages '+e.pages.join(', ')+')':'')).join('\n')+'\n\n## All-page review\n\n| PDF page | Syntax entries or reason |\n|---|---|\n'+coverage.pageReview.map(p=>'| '+p.page+' | '+(p.entryIds.length?p.entryIds.join(', '):p.reason)+' |').join('\n')+'\n');
console.log(JSON.stringify({categories:data.categories.length,entries:ids.length,pages:coverage.pageReview.length}));
