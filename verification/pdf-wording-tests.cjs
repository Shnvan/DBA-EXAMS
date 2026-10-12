const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{spawnSync}=require('child_process');
const {X}=require('./load.cjs')(),audit=require('./exam-wording-audit.json'),source=require('./pdf-source-pages.json'),before=require('./fixtures/exam-v6-bank.json'),checks=[];
function check(name,fn){fn();checks.push(name)}
const normalize=s=>String(s).replace(/\s+/g,' ').trim(),pages=new Map(source.pages.map(p=>[p.page,normalize(p.text)]));
check('All 105 source pages retained with the unchanged source PDF fingerprint',()=>{
 assert.equal(source.pages.length,105);assert.equal(audit.pdfSHA256,source.sha256);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync('C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf')).digest('hex'),source.sha256);
 for(let p=1;p<=105;p++)assert(pages.has(p));
});
check('Audit contains each original stable identity exactly once',()=>{
 const expected=before.ID.map((_,i)=>'id-'+i).concat(before.MC.map((_,i)=>'mc-'+i));
 assert.equal(audit.items.length,508);assert.deepEqual(new Set(audit.items.map(r=>r.id)),new Set(expected));
 assert.deepEqual(audit.statusCounts,{unchanged:448,revised:42,replaced:5,retired:13});
});
for(const row of audit.items)check(row.id+' source, wording, answer, choices and disposition',()=>{
 const [kind,index]=row.id.split('-'),old=before[kind==='id'?'ID':'MC'][+index],current=JSON.parse(JSON.stringify((kind==='id'?X.ID:X.MC)[+index]));
 assert.deepEqual(row.before,old);assert(['unchanged','revised','replaced','retired'].includes(row.status));assert(row.reason&&row.evidence.length);
 for(const evidence of row.evidence){assert(pages.has(evidence.page));assert(evidence.excerpt.trim());assert(pages.get(evidence.page).includes(normalize(evidence.excerpt))||/table|figure|diagram/i.test(evidence.source||''),row.id+' unsupported excerpt')}
 if(row.status==='retired'){assert.equal(row.after,null);assert(X.EXAM_RETIRED[kind].includes(+index));return}
 assert(!X.EXAM_RETIRED[kind].includes(+index));assert.deepEqual(current,row.after);
 assert.equal(current[kind==='id'?2:3],row.page);assert.equal(X.EXAM_MODULES[X.examIndices(kind,row.module-1).includes(+index)?row.module-1:-1]?.id,row.module);
 if(row.status==='unchanged')assert.deepEqual(current,old);else assert.notDeepEqual(current,old);
 if(kind==='mc'){assert.equal(new Set(current[1].map(normalize)).size,4);assert.equal(current[1].length,4);assert(current[2]>=0&&current[2]<4)}
});
check('Active questions exclude retired flat-file labels, alias-label questions and outside workaround',()=>{
 for(const [kind,bank]of [['id',X.ID],['mc',X.MC]])for(let i=0;i<bank.length;i++)if(!X.EXAM_RETIRED[kind].includes(i))assert(!/flat[ -]file|\bflat system\b/i.test(JSON.stringify(bank[i])),kind+'-'+i);
 assert.equal(X.examTotal('id'),231);assert.equal(X.examTotal('mc'),264);
 assert(!/workaround|emulat/i.test(X.MC[35][0]));assert.equal(X.MC[35][3],56);
 assert.equal(X.ID[86][1],'m');assert.equal(X.MC[119][1][X.MC[119][2]],'m');
});
check('Schema retains the recognizable PDF sentence and stays distinct from Schema Definition',()=>{
 for(const q of [X.ID[99],X.MC[132]])assert(/actual design.*theoretical view or legitimate view.*metadata/.test(q[0]));
 assert(X.identificationMatches('Schema',X.ID[99]));assert(!X.identificationMatches('Schema Definition',X.ID[99]));
});
check('Syntax, complete terms and revised answer precision are preserved',()=>{
 assert(X.identificationMatches('\\G',X.ID[163]));assert(!X.identificationMatches('\\g',X.ID[163]));assert(!X.identificationMatches('\\\\G',X.ID[163]));
 assert.equal(X.MC[196][1][X.MC[196][2]],'\\G');
 assert(X.identificationMatches('Locking Mechanisms',X.ID[128]));assert(!X.identificationMatches('Locking',X.ID[128]));
 assert(X.identificationMatches('Data Items',X.ID[12]));assert(!X.identificationMatches('Cell',X.ID[12]));
 assert(X.identificationMatches('DESC',X.ID[51]));assert(!X.identificationMatches('Descending',X.ID[51]));
 assert(X.identificationMatches('Graph Database',X.ID[20]));assert(!X.identificationMatches('Graph',X.ID[20]));
});
check('All 17 DBMS functions and subfunctions keep the prior supported questions unchanged',()=>{
 const terms=['Data Definition','Schema Definition','Data Types','Data Manipulation','Query Processing','Data Update','Transaction Management','Data Security and Integrity','Access Control','Integrity Constraints','Data Storage and Retrieval','Storage Management','Indexing','Backup and Recovery','Data Administration','Database Tuning','Monitoring and Maintenance'];
 for(const term of terms){const i=X.ID.findIndex(q=>q[1].split('|')[0].toLowerCase()===term.toLowerCase());assert(i>=0,term);assert.equal(audit.items.find(r=>r.id==='id-'+i).status,'unchanged')}
});
check('Regenerated reusable content and coverage inventories are byte-identical',()=>{
 const files=['exam-content.js','module-coverage.json','module-coverage.md','exam-identities.json'],saved=files.map(f=>fs.readFileSync(path.join(__dirname,f)));
 const run=spawnSync(process.execPath,[path.join(__dirname,'build-coverage.cjs')],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
 files.forEach((f,i)=>assert.deepEqual(fs.readFileSync(path.join(__dirname,f)),saved[i],f));
});
fs.mkdirSync('verification-artifacts/pdf-wording',{recursive:true});fs.writeFileSync('verification-artifacts/pdf-wording/tests.json',JSON.stringify({passed:checks.length,checks},null,2));console.log(JSON.stringify({passed:checks.length}));
