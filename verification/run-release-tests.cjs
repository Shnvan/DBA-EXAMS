const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'verification-artifacts','current-release');fs.mkdirSync(dir,{recursive:true});
const suites=[
 ['smoke','smoke.cjs'],['clearerLabs','clearer-labs-tests.cjs'],['followup','followup-tests.cjs'],['reliability','reliability-tests.cjs'],
 ['progressShuffle','progress-shuffle-tests.cjs'],['regularSqlAudit','sql-audit-tests.cjs'],['curriculum','curriculum-tests.cjs'],
 ['engineExtensions','engine-extension-tests.cjs'],['fullTermExam','full-term-tests.cjs'],['extraBuilder','extra-builder-tests.cjs'],
 ['labContent','lab-content-tests.cjs'],['labControls','lab-controls-tests.cjs'],['labAssessment','lab-assessment-tests.cjs'],['queryContracts','lab-query-contract-tests.cjs'],
 ['examBrowser','browser-behavior.cjs'],['threeLevelBrowser','three-level-browser.cjs'],['reliabilityBrowser','reliability-browser.cjs'],['labBrowser','lab-controls-browser.cjs','--actual']
];
const results=[];
for(const [name,file,...args]of suites){
 const run=spawnSync(process.execPath,[path.join(__dirname,file),...args],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,timeout:180000});
 fs.writeFileSync(path.join(dir,name+'.log'),run.stdout+'\n'+run.stderr);
 if(run.status!==0){console.error(name+' failed:\n'+run.stderr+'\n'+run.stdout.slice(-4000));process.exit(1)}
 let summary;for(let i=run.stdout.indexOf('{');i>=0;i=run.stdout.indexOf('{',i+1)){try{summary=JSON.parse(run.stdout.slice(i));break}catch{}}
 const passed=summary?.passed??summary?.checks?.length;
 if(!Number.isInteger(passed)||passed<=0)throw Error('Missing result count: '+name);
 if(summary.checks?.some(c=>typeof c==='object'&&(c.passed===false||c.errors?.length||c.overflow||c.chooserOnly===false||c.restored===false)))throw Error('Failed browser check: '+name);
 fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(summary,null,2));results.push({name,file,passed});console.log(name+': '+passed+' passed');
}
const release={contentVersion:'descriptive-lab-contracts-v5',suites:results,total:results.reduce((n,s)=>n+s.passed,0),htmlSHA256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'DBMS_midterm_practice.html'))).digest('hex'),executedAt:new Date().toISOString()};
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(release,null,2));
const {context}=require('./load.cjs')();require('vm').runInContext('globalThis.Inventory={CFG,TS,NM,SQL_CURRICULA,BUILD_TASKS,labTaskContent,courseTaskContent,builderTaskContent}',context);const A=context.Inventory;
const inventory={version:release.contentVersion,regular:[],courses:[],builder:[]};
for(let t=0;t<A.CFG.length+2;t++)for(let i=0;i<A.TS(t).length;i++)inventory.regular.push({id:A.NM(t)+':'+i,...A.labTaskContent(t,i)});
for(const [level,list]of Object.entries(A.SQL_CURRICULA))for(const q of list)inventory.courses.push({id:q.id,level,pages:q.pages,...A.courseTaskContent(q.id)});
for(let i=0;i<A.BUILD_TASKS.length;i++)inventory.builder.push({id:'builder:'+i,...A.builderTaskContent(i)});
fs.writeFileSync(path.join(__dirname,'lab-task-inventory.json'),JSON.stringify(inventory,null,2)+'\n');
const evidence=path.join(root,'verification-artifacts','lab-ui-browser');fs.mkdirSync(evidence,{recursive:true});
for(const name of fs.readdirSync(path.join(root,'.cache','lab-ui-audit')))if(name.endsWith('.png')||name.endsWith('.json'))fs.copyFileSync(path.join(root,'.cache','lab-ui-audit',name),path.join(evidence,name));
console.log(JSON.stringify({passed:release.total,suites:results.length}));
