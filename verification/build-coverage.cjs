/* Deterministic, reviewed content generation. No live PDF or network dependency. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),base=JSON.parse(fs.readFileSync(path.join(__dirname,'base-exam.json'),'utf8'));
const ID=structuredClone(base.ID),MC=structuredClone(base.MC),fixes={id:{},mc:{}},concepts=[];
const identityFile=path.join(__dirname,'exam-identities.json'),identities=fs.existsSync(identityFile)?JSON.parse(fs.readFileSync(identityFile,'utf8')):{id:[],mc:[]};
function identityIndex(mode,key){let index=identities[mode].indexOf(key);if(index<0){index=identities[mode].length;identities[mode].push(key)}return base[mode==='id'?'ID':'MC'].length+index}
function fix(mode,index,prompt,note){const bank=mode==='id'?ID:MC;bank[index][0]=prompt;if(note)bank[index][mode==='id'?3:4]=note;fixes[mode][index]=bank[index]}
fix('id',9,'According to the module, which file-system model lacks the database-style data dictionary described on page 11?','Module wording: individual file formats can contain metadata; the comparison is about integrated database metadata.');
fix('id',5,'Which statement removes an entire table, including its structure and data?','MariaDB/MySQL DROP TABLE implicitly commits; recovering a dropped table requires a backup or other recovery mechanism.');
fix('mc',5,'In a hierarchical database, how many parents does a non-root record normally have?');
fix('mc',22,'Apart from the special 0000 value, what four-digit range does MySQL YEAR support?');
fix('mc',26,'Which statement removes a table together with its structure and data?','MariaDB/MySQL DROP TABLE implicitly commits; recovery is a separate backup/recovery operation.');
fix('id',88,'Which DDL command shown in Table 3.1 adds descriptive comments to database objects? Give the command name.','Module terminology: COMMENT ON TABLE belongs to another dialect; MariaDB uses a COMMENT table option.');
fix('id',20,'This NoSQL type models relationships using graph structures; Neo4j and ArangoDB are examples. Identify the type.');
fix('id',22,'This DBMS type organizes records into a tree in which a non-root record has one parent. IBM IMS is an example. Identify the type.');
fix('id',23,'This DBMS type allows multiple parent-child relationships in a graph-like structure. IDMS is an example. Identify the type.');
fix('id',29,'Which SQL data type stores large binary files such as images? Give the SQL type name.');
fix('id',80,'This NoSQL type stores data as documents; MongoDB and CouchDB are examples. Identify the type.');
fix('id',81,'This NoSQL type organizes data in column families; Cassandra and HBase are examples. Identify the type.');
const moduleOf=p=>p<28?1:p<47?2:p<67?3:p<88?4:5;
const norm=s=>s.toLowerCase().replace(/[_-]/g,' ').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
const distractors=Object.fromEntries(fs.readFileSync(path.join(__dirname,'coverage-existing-distractors.txt'),'utf8').trim().split(/\r?\n/).map(l=>{const [i,v]=l.split('|');return[i,v.split(';')]}));
function choiceCase(text){const preserve=new Set(['SQL','DBMS','RDBMS','OODBMS','DDL','DML','DQL','DCL','TCL','CRUD','ACID','INT','INTEGER','SMALLINT','TINYINT','BIGINT','DECIMAL','NUMERIC','FLOAT','REAL','DOUBLE','CHAR','VARCHAR','TEXT','BINARY','VARBINARY','BLOB','MEDIUMBLOB','MEDIUMTEXT','DATE','TIME','DATETIME','TIMESTAMP','YEAR','BOOLEAN','ENUM','SET','JSON','NULL','TRUE','FALSE','SELECT','INSERT','UPDATE','DELETE','CREATE','DROP','TRUNCATE','ALTER','RENAME','GRANT','REVOKE','COMMIT','ROLLBACK','SAVEPOINT','FROM','WHERE','HAVING','ORDER','BY','GROUP','DISTINCT','LIMIT','JOIN','INNER','LEFT','RIGHT','CROSS','FULL','ON','AS','USING','IS','NOT','DEFAULT','UNIQUE','PRIMARY','KEY','TABLE','DATABASE','SHOW','INDEX','COLUMNS','DATABASES','TABLES','STATUS','AUTO_INCREMENT','SUM','COUNT','AVG','MAX','COALESCE','IFNULL','IBM','IMS','IDMS']);return text.split(' ').map(w=>preserve.has(w.toUpperCase())?w.toUpperCase():w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ')}
function addMC(key,prompt,answer,d,page,note){const index=identityIndex('mc',key),options=[answer,...d].map(choiceCase);const correct=index%4;options.splice(correct,0,options.shift());MC[index]=[prompt,options,correct,page,...(note?[note]:[])];return index}
// Existing questions remain at their stable indices. Add missing mode counterparts.
for(let i=0;i<base.ID.length;i++){
 const q=ID[i],variants=q[1].split('|').map(norm),matched=MC.map((x,j)=>variants.includes(norm(x[1][x[2]]))?j:-1).filter(j=>j>=0&&moduleOf(MC[j][3])===moduleOf(q[2]));
 const mc=matched.length?matched:[addMC('id-counterpart-'+i,q[0],q[1].split('|')[0].toUpperCase(),distractors[i],q[2],q[3])];
 concepts.push({concept:q[1].split('|')[0],page:q[2],module:moduleOf(q[2]),identification:['id-'+i],multipleChoice:mc.map(j=>'mc-'+j),source:'Original question and mode counterpart'});
}
const rows=fs.readFileSync(path.join(__dirname,'coverage-concepts.txt'),'utf8').split(/\r?\n/).filter(l=>l.trim()&&!l.startsWith('#')).map(l=>{const [page,concept,prompt,answers,d]=l.split('|');return{page:+page,concept,prompt,answers:answers.split('~'),d:d.split(';')}});
for(const row of rows){
 const plurals={'Data Types':['data type'],'Integrity Constraints':['integrity constraint'],'Column':['columns','field','fields','attribute','attributes'],'Row':['rows','record','records','tuple','tuples'],'Column name':['column names','field name','field names'],'Personal database':['personal databases'],'Group database':['group databases'],'Enterprise database':['enterprise databases'],'Key-value store':['key value stores'],'Database':['databases'],'Table':['tables'],'Domain':['domains'],'Schema':['schemas'],'Data Administration':['database administration'],'Database Tuning':['database performance tuning','performance tuning']};
 row.answers.push(...(plurals[row.concept]||[]));
 let note='';
 if(row.concept==='SHOW TABLE STATUS')note='The PDF prints "SHOW TABLE standing"; the MariaDB/MySQL command is SHOW TABLE STATUS.';
 if(['COMMIT','ROLLBACK','SAVEPOINT'].includes(row.concept))note='TCL commands appear in Figure 3.1 on page 61. Transaction rollback applies to transactional changes; DDL implicitly commits in MariaDB/MySQL.';
 const key='concept-'+moduleOf(row.page)+':'+row.concept,id=identityIndex('id',key);ID[id]=[row.prompt,row.answers.join('|'),row.page,...(note?[note]:[])];
 const mc=addMC(key,row.prompt,row.answers[0].toUpperCase(),row.d,row.page,note);
 concepts.push({concept:row.concept,page:row.page,module:moduleOf(row.page),identification:['id-'+id],multipleChoice:['mc-'+mc],source:'Definition, nested bullet, table, diagram or example in PDF'});
}
// Reasoning outcomes are separately examinable; Identification asks for the result.
const applications=[
 [18,'ACID Atomicity expansion','Which word does A stand for in the ACID transaction properties?','atomicity',['Accuracy','Availability','Administration']],
 [18,'ACID Consistency expansion','Which word does C stand for in the ACID transaction properties?','consistency',['Concurrency','Control','Completeness']],
 [18,'ACID Durability expansion','Which word does D stand for in the ACID transaction properties?','durability',['Definition','Distribution','Deletion']],
 [50,'UPDATE without WHERE','What set of rows is affected by UPDATE when its WHERE clause is omitted?','all rows|every row',['Only the first row','No rows','Only NULL rows']],
 [51,'DELETE without WHERE','What set of rows is removed by DELETE FROM table_name when WHERE is omitted?','all rows|every row',['Only the first row','No rows','The table structure']],
 [68,'Keyword case','Are SQL keywords case-sensitive or case-insensitive?','case insensitive|caseinsensitive',['Case-sensitive','Must be uppercase','Must be lowercase']],
 [68,'FROM before SELECT','Which clause is logically evaluated first in a basic SELECT select_list FROM table_name statement?','from',['SELECT','ORDER BY','HAVING']],
 [75,'WHERE evaluation order','Which clause is logically evaluated between FROM and SELECT in the module\'s filtered SELECT example?','where',['ORDER BY','HAVING','LIMIT']],
 [71,'Unsorted result','Without ORDER BY, is the result row order guaranteed or unspecified?','unspecified|not guaranteed|undefined',['Always insertion order','Always primary-key order','Always alphabetical']],
 [72,'Secondary sort','In ORDER BY lastName DESC, firstName ASC, which column breaks ties between equal lastName values?','firstname|first name',['lastName','Both independently','Neither']],
 [78,'Inclusive BETWEEN','Does BETWEEN 1 AND 3 include both boundary values 1 and 3? Answer inclusive or exclusive.','inclusive',['Exclusive','Lower only','Upper only']],
 [79,'Suffix pattern','Which LIKE pattern matches names ending with son? Give the pattern only.','%son',['son%','%son%','_son']],
 [80,'AND false with NULL','What does FALSE AND NULL evaluate to? Give the Boolean result.','false|0',['TRUE','NULL','An error']],
 [80,'AND true with NULL','What does TRUE AND NULL evaluate to? Give the result.','null|unknown',['TRUE','FALSE','An error']],
 [80,'AND NULL with NULL','What does NULL AND NULL evaluate to? Give the result.','null|unknown',['TRUE','FALSE','An error']],
 [83,'OR true with NULL','What does TRUE OR NULL evaluate to? Give the Boolean result.','true|1',['FALSE','NULL','An error']],
 [83,'OR false with NULL','What does FALSE OR NULL evaluate to? Give the result.','null|unknown',['TRUE','FALSE','An error']],
 [83,'OR NULL with NULL','What does NULL OR NULL evaluate to? Give the result.','null|unknown',['TRUE','FALSE','An error']],
 [85,'AND before OR outcome','What does TRUE OR FALSE AND FALSE return in MySQL? Give the Boolean result.','true|1',['FALSE','NULL','An error']],
 [90,'Unmatched INNER JOIN','What result does INNER JOIN return when no pair of rows satisfies its join condition?','empty result set|empty set|no rows|zero rows',['All left rows','All right rows','A syntax error']],
 [95,'Unmatched LEFT JOIN columns','What value appears in right-table columns for an unmatched LEFT JOIN row?','null',['Zero','Empty string','Previous row value']],
 [100,'Unmatched RIGHT JOIN columns','What value appears in left-table columns for an unmatched RIGHT JOIN row?','null',['Zero','Empty string','Previous row value']],
 [102,'Unassigned sales representative','What does NULL in customers.salesRepEmployeeNumber mean in the module example?','no sales representative|no assigned sales representative|no sales rep',['No customer','Employee number zero','Customer has no orders']]
];
for(const [page,concept,prompt,answers,d] of applications){const key='application-'+moduleOf(page)+':'+concept,i=identityIndex('id',key);ID[i]=[prompt,answers,page];const j=addMC(key,prompt,answers.split('|')[0].toUpperCase(),d,page);concepts.push({concept,page,module:moduleOf(page),identification:['id-'+i],multipleChoice:['mc-'+j],source:'SQL example / truth table / diagram result'})}
const classification=addMC('classification-criteria','Which three criteria are named for classifying DBMSs on page 17?','Data model, database distribution and user numbers',['Font, screen size and theme','Column names, row colors and file icons','Only hardware price, age and vendor'],17);
concepts.push({concept:'DBMS classification criteria',page:17,module:1,identification:[],multipleChoice:['mc-'+classification],source:'DBMS definition paragraph',exclusion:'This asks for a set of classification criteria rather than one unique concept name; the named database types and size categories have separate identification questions.'});
// Every original MC has an inventory link, including application-only questions.
for(let j=0;j<base.MC.length;j++)if(!concepts.some(c=>c.multipleChoice.includes('mc-'+j))){const q=MC[j];concepts.push({concept:q[0],page:q[3],module:moduleOf(q[3]),identification:[],multipleChoice:['mc-'+j],source:'Original multiple-choice application',exclusion:'Identification counterpart is covered by the named concept questions; this item assesses a choice/result rather than a unique concept name.'})}
const exclusions=[
 {pages:'1–9',reason:'Cover, copyright, institutional/program outcomes, references, contents and grading administration. The data-structures preface and ITE112/C-language syllabus are unrelated template material, not taught DBMS lesson content.'},
 {pages:'10,26–28,46–47,66–67,87–88,105',reason:'Introductions, learning outcomes and summaries repeat concepts inventoried in the lessons. Bibliographic author names, examination dates and motivational prose are not DBMS exam concepts.'},
 {pages:'13–15,69–70,73–74,76–86,90–104',reason:'Specific sample people, addresses, employee identifiers and decorative formatting are illustrative values. Structure, relationships, query techniques, result behavior and truth-table outcomes are covered; memorizing each sample row is excluded.'},
 {pages:'18',reason:'ACID expansions are printed; Isolation is quizzed directly and Transaction Management includes all four names. The module does not define each ACID property individually, so no speculative property definitions are introduced.'},
 {pages:'22',reason:'Inheritance, encapsulation and polymorphism name OODBMS capabilities but are not defined here. They appear in the OODBMS question; invented standalone definitions are excluded.'},
 {pages:'30',reason:'Direct ad-hoc queries and SQL embedded in reporting programs are described as approaches; no unique formal subfunction name is given. These uses are included in the SQL/application context rather than inventing a label.'},
 {pages:'31–39,41,43',reason:'Unsupported historical/general claims, implementation-dependent ranges and incorrect NULL-overflow example are documented separately as module errata; accurate named types and explicitly qualified module descriptions remain examinable.'},
 {pages:'105',reason:'Subqueries, views and stored procedures are listed as future topics without instruction. They are not expanded into invented lessons.'}
];
const errata=[
 'p11: The phrase "level document frameworks" does not name or adequately define a flat-file model. The inferred label and its questions have been retired.',
 'p15: A primary key need not be the first column; the sentence "Now two rows" is a typo. Foreign keys may be composite and NULL allowance depends on constraints.',
 'p22: A hierarchical non-root node normally has one parent; the root has none.',
 'p31: MySQL SMALLINT and INT have different storage/ranges. SQL precision and support depend on the implementation.',
 'p33–34: REAL is dialect/SQL-mode dependent; the module single-precision description is explicitly qualified in review.',
 'p35–37: TEXT capacity is measured in bytes in MySQL; BLOB comparison/locator restrictions are not universal. VARCHAR and VARBINARY declare a maximum, not a minimum length.',
 'p38–39: DATE/DATETIME ranges and TIME WITH/WITHOUT TIME ZONE syntax mix dialects. MySQL DATE normally starts at 1000; DATETIME starts at 1000, not 1753. TIMESTAMP conversion uses the session time zone, rather than storing a zone name.',
 'p39: MySQL YEAR also permits 0000; obsolete two-digit YEAR is not taught as current behavior.',
 'p41: Invalid ENUM handling depends on SQL mode; it is not invariably an error.',
 'p43: 999999.99 fits NUMERIC(8,2). Out-of-range numbers do not automatically become NULL.',
 'p45: SHOW TABLE standing is a transcription error for SHOW TABLE STATUS.',
 'p54–56: DDL recovery/rollback differs by engine. FULL OUTER JOIN syntax is not supported natively by MySQL/MariaDB; the concept is taught and the lab explicitly uses the UNION workaround.',
 'p58–59: SELECT FROM INHERITANCE is incomplete; CREATE TABLE INHERITANCESQL is missing a comma after PropositionID INTEGER. Statement terminators are a client/batch requirement, not a universal property of every SQL API.',
 'p62: COMMENT ON TABLE is dialect-specific and not a standalone MySQL command. The question explicitly names the module table.',
 'p72: ORDER BY column1,column2 defaults both columns to ascending; the prose incorrectly describes column2 as descending.',
 'p78: OR is inclusive: either or both conditions may be TRUE, not exactly one.',
 'p101: Unmatched RIGHT JOIN rows have NULL in left-table columns; the prose repeats "right" incorrectly.',
 'Table of contents and p9: module numbers/course labels are inconsistent; the five actual module headings and PDF page ranges define the app categories.'
];
// Full-term review: concepts require their complete names; SQL syntax and product names stay literal.
const fullNames={
 'sql':'Structured Query Language','crud':'Create, Read, Update and Delete','data security':'Data Security and Integrity',
 'dbms':'Database Management System','rdbms':'Relational Database Management System','oodbms':'Object-Oriented Database Management System',
 'relational dbms':'Relational Database Management System','object-oriented dbms':'Object-Oriented Database Management System','hierarchical dbms':'Hierarchical Database Management System','network dbms':'Network Database Management System',
 'nosql dbms':'Not Only SQL Database Management System','nosql':'Not Only SQL Database Management System',
 'ddl':'Data Definition Language','dml':'Data Manipulation Language','dql':'Data Query Language','dcl':'Data Control Language','tcl':'Transaction Control Language',
 'relational':'Relational Database Management System','hierarchical':'Hierarchical Database Management System','network':'Network Database Management System','object-oriented':'Object-Oriented Database Management System','graph':'Graph Database','document':'Document-Oriented Database','document-oriented':'Document-Oriented Database','column-family':'Column-Family Store','key-value':'Key-Value Store'
};
const expandChoice=x=>fullNames[String(x).toLowerCase()]||String(x).replace(/\bDBMS\b/g,'Database Management System');
const review=(i,prompt,answers)=>{ID[i][0]=prompt;ID[i][1]=answers;};
review(0,'This software system stores, retrieves and manages data, serving as the interface between users and a database. Identify it by its full name.','database management system|database management systems');
review(3,'This SQL command category controls access rights and permissions through GRANT and REVOKE. Give its full name.','data control language');
review(17,'Which database size category describes large, complex organization-wide systems requiring dependable equipment? Give the complete category name.','enterprise database|enterprise databases');
review(19,'The module expands the name of this flexible database family as "Not Only SQL". Write SQL in full within that expanded name.','not only structured query language');
review(20,'This database type models relationships using graph structures; Neo4j and ArangoDB are examples. Identify the complete type name.','graph database|graph databases');
review(21,'This database management system stores data as objects and supports inheritance, encapsulation and polymorphism. Give the full system type.','object oriented database management system|object oriented database management systems');
review(22,'This database management system organizes records into a tree in which each non-root record has one parent. IBM IMS is an example. Give the full system type.','hierarchical database management system|hierarchical database management systems');
review(23,'This database management system allows multiple parent-child relationships in a graph-like structure. IDMS is an example. Give the full system type.','network database management system|network database management systems');
review(24,'Which database management advantage coordinates simultaneous access by multiple users to prevent conflicts? Give its complete name.','concurrency control');
review(26,'SQL specifies what result is wanted while the system decides how to obtain it. Identify this complete language classification.','nonprocedural language|non procedural language|nonprocedural programming language|non procedural programming language|declarative language|declarative programming language');
review(41,'This SQL command category defines and changes database structures using commands such as CREATE, ALTER and DROP. Give its full name.','data definition language');
review(42,'This SQL command category fetches data using SELECT. Give its full name.','data query language');
review(43,'This SQL command category manipulates stored records using INSERT, UPDATE and DELETE. Give its full name.','data manipulation language');
review(53,'Which evaluation technique stops evaluating AND or OR operands once the result is determined? Give its complete name.','short circuit evaluation');
review(58,'This SQL command category manages transactions using COMMIT, SAVEPOINT and ROLLBACK. Give its full name.','transaction control language');
review(80,'This database type stores data as documents; MongoDB and CouchDB are examples. Identify the complete type name.','document oriented database|document oriented databases|document database|document databases');
review(81,'This database type organizes data in column families; Cassandra and HBase are examples. Identify the complete type name.','column family store|column family stores|column family database|column family databases');
review(82,'ObjectDB and db4o store data as objects and integrate with object-oriented programming languages. Identify their full database management system type.','object oriented database management system|object oriented database management systems');
const generatedReview={
 'concept-1:Relational DBMS':['This database management system organizes data into relations containing rows and columns, commonly using SQL. Give its full type name.','relational database management system|relational database management systems|relational database|relational databases'],
 'concept-1:NoSQL DBMS':['This database family includes document, key-value, column-family and graph stores with flexible models. Identify it using the expanded family name and the words database management system.','not only structured query language database management system|not only sql database management system'],
 'concept-2:SQL':['This standardized language manages and queries relational databases. Give its full name.','structured query language'],
 'concept-3:CRUD':['Write the full names, in order, of the four fundamental record operations represented by CRUD.','create read update delete|create read update and delete'],
 'concept-3:Query by example':['This visual query method uses an Access grid to specify a query rather than typing the entire SQL statement. Give its complete name.','query by example'],
 'concept-4:Operator precedence':[null,'operator precedence'],
 'concept-5:INNER JOIN':[null,'inner join'],
 'concept-5:RIGHT JOIN':[null,'right join|right outer join'],
 'concept-5:One-to-many relationship':[null,'one to many relationship|one to many relationships'],
};
for(const [key,[prompt,answers]] of Object.entries(generatedReview)){const offset=identities.id.indexOf(key);if(offset<0)throw Error('Missing full-term identity '+key);const q=ID[base.ID.length+offset];if(prompt)q[0]=prompt;q[1]=answers;}
// Remove incomplete conceptual/command fragments, retaining explicitly equivalent complete forms.
for(const [i,answers] of Object.entries({40:'cross join',55:'join|joins|sql join|sql joins',56:'left join|left outer join',62:'full join|full outer join',86:'table alias|table aliases'}))ID[+i][1]=answers;
// Existing counterpart identities retain their index, and use the reviewed definition and complete correct option.
for(let j=base.MC.length;j<MC.length;j++){
 const key=identities.mc[j-base.MC.length];let i=-1;
 if(key.startsWith('id-counterpart-'))i=+key.slice(15);
 else {const offset=identities.id.indexOf(key);if(offset>=0)i=base.ID.length+offset;}
 if(i>=0){MC[j][0]=ID[i][0];MC[j][1][MC[j][2]]=choiceCase(ID[i][1].split('|')[0]);}
}
for(const q of MC)q[1]=q[1].map(expandChoice);
// Full names in options must not contradict an acronym-seeking prompt.
MC[0][0]='Which of these is not one of the nonrelational database types listed in the module?';
MC[5][0]='Which database management system normally gives each non-root record exactly one parent?';
MC[14][0]='Which product is an object-oriented database management system?';
MC[16][0]='Which statement correctly describes a network database management system?';
MC[28][0]='Which of these is a Data Manipulation Language command?';
MC[36][0]='Which full command-category name contains COMMIT and ROLLBACK?';
// Consistent product spelling: these are names, not expandable conceptual acronyms.
const products={mongodb:'MongoDB',couchdb:'CouchDB',redis:'Redis',dynamodb:'DynamoDB','amazon dynamodb':'Amazon DynamoDB',cassandra:'Cassandra',hbase:'HBase',neo4j:'Neo4j',arangodb:'ArangoDB',objectdb:'ObjectDB',db4o:'db4o',mysql:'MySQL',mariadb:'MariaDB',postgresql:'PostgreSQL','mysql workbench':'MySQL Workbench'};
for(const q of MC)q[1]=q[1].map(x=>products[x.toLowerCase()]||x);
// The complete source audit is applied last so regeneration preserves targeted corrections.
const wording=JSON.parse(fs.readFileSync(path.join(__dirname,'exam-wording-overrides.json'),'utf8'));
for(const [key,change] of Object.entries(wording.changes)){
 const [mode,index]=key.split('-'),q=(mode==='id'?ID:MC)[+index];
 if(change.prompt!==undefined)q[0]=change.prompt;
 if(change.answers!==undefined)q[1]=change.answers;
 if(change.options!==undefined)q[1]=change.options;
 if(change.correctIndex!==undefined)q[2]=change.correctIndex;
 if(change.page!==undefined)q[mode==='id'?2:3]=change.page;
 if(change.note!==undefined)q[mode==='id'?3:4]=change.note;
}
const active=key=>{const [kind,index]=key.split('-');return !wording.retired[kind].includes(+index)};
const activeID=ID.length-wording.retired.id.length,activeMC=MC.length-wording.retired.mc.length;
for(const c of concepts){if(c.source==='Original question and mode counterpart')c.concept=ID[+c.identification[0].split('-')[1]][1].split('|')[0];else if(fullNames[c.concept.toLowerCase()])c.concept=expandChoice(c.concept);}
for(let i=0;i<base.ID.length;i++)if(JSON.stringify(ID[i])!==JSON.stringify(base.ID[i]))fixes.id[i]=ID[i];
for(let i=0;i<base.MC.length;i++)if(JSON.stringify(MC[i])!==JSON.stringify(base.MC[i]))fixes.mc[i]=MC[i];
for(const q of MC)if(new Set(q[1].map(x=>x.toLowerCase().trim())).size!==4)throw Error('Ambiguous duplicate options: '+q[0]);

const payload={fixes,identification:ID.slice(base.ID.length),multipleChoice:MC.slice(base.MC.length)};
const baseCatalog=Object.fromEntries(['id','mc'].map(k=>[k,base[k==='id'?'ID':'MC'].map((q,i)=>({id:k+'-'+i,signature:JSON.stringify(q)}))]));
const content='const EXAM_BASE_CATALOG='+JSON.stringify(baseCatalog)+';\n/* Reviewed PDF coverage: append-only stable identities. Generated by build-coverage.cjs. */\nconst EXAM_EXPANSION='+JSON.stringify(payload)+';\nfor(const [i,q] of Object.entries(EXAM_EXPANSION.fixes.id))ID[+i]=q;\nfor(const [i,q] of Object.entries(EXAM_EXPANSION.fixes.mc))MC[+i]=q;\nID.push(...EXAM_EXPANSION.identification);MC.push(...EXAM_EXPANSION.multipleChoice);\nconst EXAM_RETIRED='+JSON.stringify(wording.retired)+';\nconst EXAM_EQUIVALENT_OPTIONS='+JSON.stringify(wording.equivalentOptions)+';\nconst EXAM_EQUIVALENT_ANSWERS='+JSON.stringify(wording.equivalentAnswers)+';\nMQ[29]=[\'Module 3 · p.63\',\'Display the first three different country values from customers in alphabetical order, using DISTINCT, ORDER BY country and LIMIT 3.\',\'SELECT DISTINCT country FROM customers ORDER BY country LIMIT 3\'];\nfor(let i=0;i<3;i++)ME[i][0]=\'Module 2 · p.45\';\n';
fs.writeFileSync(path.join(__dirname,'exam-content.js'),content);
// Retired labels remain in the audit archive only. Split moved source references into their actual modules.
const currentConcepts=[];
for(const c of concepts){
 const links=[...c.identification,...c.multipleChoice].filter(active),groups=new Map();
 for(const key of links){const [kind,i]=key.split('-'),q=(kind==='id'?ID:MC)[+i],page=q[kind==='id'?2:3],module=moduleOf(page);if(!groups.has(module))groups.set(module,[]);groups.get(module).push(key)}
 for(const [module,keys] of groups){const identification=keys.filter(k=>k.startsWith('id-')),multipleChoice=keys.filter(k=>k.startsWith('mc-')),first=keys[0],[kind,i]=first.split('-'),q=(kind==='id'?ID:MC)[+i],page=q[kind==='id'?2:3],changed=keys.some(k=>wording.changes[k]?.answers||wording.changes[k]?.correctIndex!==undefined);currentConcepts.push({...c,concept:changed?(identification.length?ID[+identification[0].split('-')[1]][1].split('|')[0]:q[0]):c.concept,page,module,identification,multipleChoice})}
}
concepts.splice(0,concepts.length,...currentConcepts);
for(const c of concepts)c.questionPages=Object.fromEntries([...c.identification,...c.multipleChoice].map(key=>{const [kind,i]=key.split('-');return[key,(kind==='id'?ID:MC)[+i][kind==='id'?2:3]]}));
const repeated={48:'SELECT retrieval and select list, inventoried at pages 63 and 68.',55:'DROP and JOIN introductions, inventoried at pages 54, 56 and 88.',69:'Single-column SELECT example, covered by SELECT and select list.',70:'Multiple-column SELECT and result diagram, covered by SELECT, asterisk and select list.',73:'ORDER BY examples, covered by sort directions and secondary sorting.',77:'AND filter example, covered by AND and search conditions.',82:'Country/state conjunction example, covered by AND and predicates.',92:'Product/productline INNER JOIN example and result; covered by INNER JOIN, ON and productLine relationship.',98:'Customer/order LEFT JOIN example; covered by LEFT JOIN, unmatched NULLs and one-to-many relationship.',101:'RIGHT OUTER JOIN synonym and result diagram; accepted as RIGHT JOIN variant, with erroneous NULL-side prose documented.',103:'Employee/customer RIGHT JOIN example; covered by RIGHT JOIN, sales representative link and unmatched-row test.'};
const pageReview=Array.from({length:105},(_,i)=>{const page=i+1,links=concepts.filter(c=>c.page===page||Object.values(c.questionPages).includes(page)).flatMap(c=>[...c.identification,...c.multipleChoice]);return{page,status:links.length?'inventoried':page<10?'front matter excluded':repeated[page]?'covered by linked recurring concept':'repeat/administration/erratum excluded',questionIds:[...new Set(links)],reason:links.length?'Lesson concepts, nested bullets, types, diagrams or example behavior are linked above.':repeated[page]||({30:'Ad-hoc SQL and embedded reporting approaches have no formal concept label; contextual use is covered by SQL. No invented identification name.',43:'NULL examples repeat p42; the NUMERIC overflow example is wrong and recorded in errata.'}[page])||'Introduction, summary, reference, administrative material or duplicate teaching content; see exclusions.'}});
const inventory={pdfPages:105,identification:activeID,multipleChoice:activeMC,retired:wording.retired,concepts,pageReview,exclusions,errata};
fs.writeFileSync(path.join(__dirname,'module-coverage.json'),JSON.stringify(inventory,null,2));
fs.writeFileSync(identityFile,JSON.stringify(identities,null,2));
fs.writeFileSync(path.join(__dirname,'module-coverage.md'),'# PDF coverage inventory\n\n'+activeID+' identification and '+activeMC+' multiple-choice questions. Original stable IDs are retained; added identities are appended. Coverage is based on definitions, subtopics and application behavior, not an item quota.\n\n| Concept | PDF page | Module | Identification | Multiple choice |\n|---|---:|---:|---|---|\n'+concepts.map(c=>'| '+c.concept.replace(/\|/g,'/')+' | '+c.page+' | '+c.module+' | '+(c.identification.join(', ')||c.exclusion)+' | '+c.multipleChoice.join(', ')+' |').join('\n')+'\n\n## Exclusions\n\n'+exclusions.map(x=>'- Pages '+x.pages+': '+x.reason).join('\n')+'\n\n## Module errata and dialect notes\n\n'+errata.map(x=>'- '+x).join('\n')+'\n');
console.log(JSON.stringify({identification:activeID,multipleChoice:activeMC,inventoryEntries:concepts.length}));
fs.appendFileSync(path.join(__dirname,'module-coverage.md'),'\n## Page-by-page review\n\n| PDF page | Status | Reason |\n|---:|---|---|\n'+pageReview.map(x=>'| '+x.page+' | '+x.status+' | '+x.reason+' |').join('\n')+'\n');
