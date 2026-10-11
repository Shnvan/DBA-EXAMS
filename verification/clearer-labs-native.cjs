const fs=require('fs'),assert=require('assert/strict');
const {X,mysql,seedServer,actual,simulated,databaseState,engineState,equalResults,verifyServer}=require('./compare.cjs');
const designs=JSON.parse(fs.readFileSync('verification-artifacts/clearer-labs-tests.json')).designs;
const cases=Object.entries(designs).flatMap(([name,defs])=>X.BUILD_TASKS.map((q,i)=>({name:`${name}: challenge ${i+1}`,sql:(i<7?defs.slice(0,i):defs).join('\n')+(i>=8?'\n'+X.BUILD_INSERT:'')+'\n'+(i<7?defs[i]:q.sql)})));
(async()=>{const report={cases:cases.length,engines:[]};for(const port of [13307,13311,13308]){
 const c=await mysql.createConnection({host:'127.0.0.1',port,user:'root',rowsAsArray:true,dateStrings:true,supportBigNumbers:true,bigNumberStrings:true,flags:'-FOUND_ROWS,-IGNORE_SPACE'});await verifyServer(c,port);
 const[v]=await c.query('SELECT VERSION(),@@sql_mode,@@collation_server');const engine={port,version:v[0][0],sqlMode:v[0][1],collation:v[0][2],passed:0,total:cases.length,mismatches:[]};
 for(const q of cases){await seedServer(c);const a=await actual(c,q.sql),s=simulated(q.sql),db=await databaseState(c),state=engineState(s.s),reasons=[];
 if(s.error?.code!=a.error?.code||s.error?.sqlState!=a.error?.sqlState)reasons.push('error');if(!equalResults(s.results,a.results,q.sql))reasons.push('results');if(JSON.stringify(state)!=JSON.stringify(db))reasons.push('state');
 if(reasons.length)engine.mismatches.push({name:q.name,reasons,actual:a,simulated:{results:s.results,error:s.error},states:reasons.includes('state')?{actual:db,simulated:state}:undefined});else engine.passed++;
 }report.engines.push(engine);console.log(JSON.stringify({port,version:engine.version,passed:engine.passed,total:engine.total,mismatches:engine.mismatches.map(m=>({name:m.name,reasons:m.reasons}))}));await c.end();}
 fs.writeFileSync('verification-artifacts/clearer-labs-native.json',JSON.stringify(report,null,2));assert(report.engines[0].passed==cases.length,'MariaDB target comparison failed');
})().catch(e=>{console.error(e);process.exitCode=1});
