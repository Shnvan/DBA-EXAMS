const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'curriculum.js'),'utf8');const box={};vm.createContext(box);vm.runInContext(src+';globalThis.__curricula=SQL_CURRICULA',box);const courses=box.__curricula;
const all=[...courses.intermediate,...courses.advanced];const checks=[];let engineApi=null;const check=(name,fn)=>{fn();checks.push(name)};
check('guided curricula are present for intermediate and advanced',()=>assert.deepEqual(Object.keys(courses).sort(),['advanced','intermediate']));
check('intermediate has cumulative setup and module tracks remain separate',()=>{assert(courses.intermediate.length>=30);assert(courses.intermediate.some(q=>q.id==='int-create'));assert(courses.intermediate.some(q=>q.id==='int-load-data'));});
check('advanced covers campus project and extension lessons',()=>{for(const id of ['campus-create','campus-records','campus-types-json','campus-types-spatial','campus-tcl','campus-grant','campus-revoke'])assert(all.some(q=>q.id===id));});
check('lesson IDs are stable and unique',()=>assert.equal(new Set(all.map(q=>q.id)).size,all.length));
check('every lesson has explicit learning fields',()=>all.forEach(q=>{assert(q.id&&q.title&&q.objective&&q.prompt);assert(Array.isArray(q.pages)&&q.pages.length);assert(Array.isArray(q.topics)&&q.topics.length);assert(typeof q.explanation==='string'&&q.explanation.length>10);assert(typeof q.syntax==='string');assert(typeof q.sql==='string');assert(['read','query','mutation','error'].includes(q.kind));if(q.kind==='error')assert(Number.isInteger(q.errorCode));}));
check('executable lesson SQL parses against the practice engine',()=>{
 const html=fs.readFileSync(path.join(__dirname,'..','DBMS_midterm_practice.html'),'utf8');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const start=script.indexOf('/* ---------- mini MySQL-style engine ---------- */');
 const dataStart=script.indexOf('/* ---------- data ---------- */',start), marker=script.indexOf('/* supplemental module content and task grading */',start);
 const engine=['engine-core.js','engine-parser.js','engine-query.js','engine-write.js'].map(n=>fs.readFileSync(path.join(__dirname,n),'utf8')).join('\n');
 const context={document:{},localStorage:{getItem:()=>null},unescape,encodeURIComponent,Date};vm.createContext(context);
 vm.runInContext(engine+'\n'+script.slice(dataStart,marker)+';globalThis.__parse={parse,tok,exec,newSession,clone}',context);
 const excluded=new Set(['campus-status','int-monitor']);const parseApi=context.__parse;engineApi=parseApi;
 for(const q of all){if(!q.sql||q.kind==='read'||excluded.has(q.id))continue;for(const stmt of q.sql.split(';').map(x=>x.trim()).filter(Boolean)){try{parseApi.parse(parseApi.tok(stmt))}catch(e){throw new Error(`${q.id}: ${e.message}`)}}}
});
check('complete SQL type coverage is connected to lessons',()=>{const t=all.flatMap(q=>q.topics).join('|').toUpperCase();for(const q of all.filter(q=>q.id.startsWith('campus-types-')))assert(/REFERENCES courses/i.test(q.sql),q.id+' must connect its type table to courses');['INT','INTEGER','SMALLINT','TINYINT','BIGINT','DECIMAL','NUMERIC','FLOAT','REAL','DOUBLE','CHAR','VARCHAR','TEXT','BINARY','VARBINARY','BLOB','MEDIUMTEXT','MEDIUMBLOB','DATE','TIME','DATETIME','TIMESTAMP','YEAR','BOOLEAN','ENUM','SET','JSON','SPATIAL','POINT','GEOMETRY'].forEach(x=>assert(t.includes(x),x));});
check('command family and SELECT variant coverage is explicit',()=>{const t=all.flatMap(q=>q.topics).join('|').toUpperCase();['DDL','DQL','DML','DCL','TCL','SELECT','WHERE','DISTINCT','BETWEEN','IN','LIKE','ORDER BY','LIMIT','GROUP BY','HAVING','INNER JOIN','LEFT JOIN','RIGHT JOIN','CROSS JOIN','UNION','GRANT','REVOKE','SAVEPOINT','ROLLBACK'].forEach(x=>assert(t.includes(x),x));});
check('relationship and expected-error coverage is explicit',()=>{const t=all.flatMap(q=>q.topics).join('|').toUpperCase();['ONE-TO-ONE','ONE-TO-MANY','MANY-TO-MANY','COMPOSITE PRIMARY KEY','COMPOSITE FOREIGN KEY','SELF-REFERENCING FOREIGN KEY','MULTIPLE FOREIGN KEYS','PRIMARY KEY FOREIGN KEY','ON DELETE CASCADE','ON DELETE SET NULL','RESTRICT','UNIQUE REFERENCE','INCOMPATIBLE TYPES','INVALID COMPOSITE REFERENCE'].forEach(x=>assert(t.includes(x),x));for(const id of ['campus-error-duplicate-key','campus-error-missing-parent','campus-error-two-primary','campus-error-composite-missing','campus-error-incompatible-fk','campus-error-invalid-composite'])assert(all.some(q=>q.id===id));});
check('connected campus setup executes for both guided levels',()=>{
 const runSetup=(level,ids)=>{const session=engineApi.newSession();for(const id of ids){const q=courses[level].find(x=>x.id===id);assert(q,`${level} missing ${id}`);for(const stmt of q.sql.split(';').map(x=>x.trim()).filter(Boolean))engineApi.exec(stmt,session);}};
 runSetup('intermediate',['int-create','int-inspect',...courses.intermediate.filter(q=>q.id.startsWith('int-table-')).map(q=>q.id),'int-inspect-schema','int-load-data']);
 runSetup('advanced',['campus-create','campus-inspect',...courses.advanced.filter(q=>q.id.startsWith('campus-table-')).map(q=>q.id),'campus-columns','campus-records']);
 const base=engineApi.newSession();for(const id of ['campus-create','campus-inspect',...courses.advanced.filter(q=>q.id.startsWith('campus-table-')).map(q=>q.id),'campus-columns','campus-records']){const q=courses.advanced.find(x=>x.id===id);for(const stmt of q.sql.split(';').map(x=>x.trim()).filter(Boolean))engineApi.exec(stmt,base);}
 for(const id of ['campus-error-duplicate-key','campus-error-missing-parent','campus-error-composite-missing','campus-error-two-primary','campus-error-null-required','campus-error-incompatible-fk','campus-error-invalid-composite']){const q=courses.advanced.find(x=>x.id===id),trial=engineApi.clone(base);let got=null;try{for(const stmt of q.sql.split(';').map(x=>x.trim()).filter(Boolean))engineApi.exec(stmt,trial)}catch(e){got=e.code}assert.equal(got,q.errorCode,`${id} error code`);}
});
const knownIds=new Set(all.map(q=>q.id));
const topicRows=[
 ['SQL definition, purpose, procedural distinction','28-30',['sql-foundations','campus-client']],
 ['Numeric types and precision/scale','31-34',['campus-types-numeric','campus-table-staff']],
 ['Character string types','34-36',['campus-types-character','campus-table-departments']],
 ['Binary types and large objects','36-37',['campus-types-binary','campus-table-resources']],
 ['Date/time types and dialect differences','37-40',['campus-types-temporal','campus-dialects']],
 ['BOOLEAN, ENUM and SET','40-42',['campus-table-students','campus-table-enrollments','campus-types-choices']],
 ['JSON and spatial types','40-42',['campus-types-json','campus-types-spatial']],
 ['NULL values and NULL-safe querying','42-43',['campus-null','campus-null-replacement']],
 ['MySQL monitor and inspection commands','44-46',['campus-inspect','campus-columns','campus-status']],
 ['CRUD and SELECT fundamentals','47-51',['int-crud','int-query-select-all']],
 ['DDL CREATE and schema design','52-55',['int-create','campus-alter-add','campus-drop-table']],
 ['JOIN families','55-56',['int-query-inner-join','campus-right-join','campus-cross-join']],
 ['Access/SQL View workflow and client login (non-executable)','57-59',['campus-client']],
 ['Database/table creation and verification','60-61',['int-create','int-inspect-schema']],
 ['DDL, DQL, DML, DCL command categories','61-66',['int-dcl','campus-tcl']],
 ['Transactions and savepoints','61,66',['int-transaction','campus-rollback']],
 ['Constraints, invalid values, referential integrity','31-43,60-62',['int-constraints','campus-error-composite-missing']],
 ['Candidate keys, composite references, and relationship actions','32,42,60-62',['campus-unique-reference','campus-error-incompatible-fk','campus-error-invalid-composite','campus-cascade','campus-set-null']],
 ['Schema comments and ALTER variants','53-54,62',['campus-comment','campus-alter-add','campus-alter-modify','campus-alter-drop']],
];
for(const [topic,pages,lessons] of topicRows)for(const id of lessons)assert(knownIds.has(id),`coverage row ${topic} references missing ${id}`);
const pageDispositions={};for(let p=28;p<=66;p++)pageDispositions[p]={pages:String(p),disposition:'covered',linkedLessons:[]};for(const q of all)for(const p of q.pages||[])if(p>=28&&p<=66)pageDispositions[p].linkedLessons.push(q.id);
const output={version:'module-coverage-task-sessions-v4',generated:'curriculum-tests',lessonCounts:{intermediate:courses.intermediate.length,advanced:courses.advanced.length,total:all.length},topicRows:topicRows.map(([topic,pages,lessons])=>({topic,pages,lessons})),pages:pageDispositions,exclusions:[{topic:'Access GUI clicks, terminal login credentials, and physical server administration',reason:'Teaching explanation only; this offline browser cannot launch an external client or create accounts.'},{topic:'Full GIS analysis and optimizer/backup internals',reason:'Outside Modules 2–3 executable scope; spatial storage/WKT and inspection are included.'}],engineLimits:['No subqueries, procedures, triggers, views, full outer join syntax, or full GIS analysis; lessons label these as unsupported or dialect-specific.','SHOW TABLE STATUS \\G is represented as a documented client terminator, not a shell command.']};
for(const row of Object.values(pageDispositions))row.linkedLessons=[...new Set(row.linkedLessons)];
for(let p=28;p<=66;p++)assert(pageDispositions[p].linkedLessons.length,`PDF page ${p} has no linked lesson`);
fs.writeFileSync(path.join(__dirname,'curriculum-coverage.json'),JSON.stringify(output,null,2)+'\n');let md='# Module 2–3 curriculum coverage\n\n';md+=`Lessons: ${all.length} (${courses.intermediate.length} intermediate, ${courses.advanced.length} advanced).\n\n`;md+='| Topic | PDF pages | Linked lessons |\n|---|---:|---|\n';for(const r of output.topicRows)md+=`| ${r.topic} | ${r.pages} | ${r.lessons.join(', ')} |\n`;md+='\n## Page disposition (pages 28–66)\n\n| Page | Disposition | Linked lessons |\n|---:|---|---|\n';for(const [p,r] of Object.entries(output.pages))md+=`| ${p} | ${r.disposition} | ${r.linkedLessons.join(', ')||'Explanation mapped in topic rows'} |\n`;md+='\n## Exclusions and engine boundaries\n\n';for(const x of output.exclusions)md+=`- **${x.topic}:** ${x.reason}\n`;for(const x of output.engineLimits)md+=`- ${x}\n`;fs.writeFileSync(path.join(__dirname,'curriculum-coverage.md'),md);
console.log(JSON.stringify({passed:checks.length,lessons:output.lessonCounts,coverage:path.join(__dirname,'curriculum-coverage.json')},null,2));
