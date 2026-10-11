const assert=require('assert/strict'),fs=require('fs'),vm=require('vm');
const {X,context}=require('./load.cjs')();
vm.runInContext(fs.readFileSync(__dirname+'/sql-grading.js','utf8')+';globalThis.__grade={gradeSqlTask,gradeBuilderQuery};',context);
const {gradeSqlTask:grade,gradeBuilderQuery:builder}=context.__grade,checks=[];
function test(name,fn){fn();checks.push(name)}
const tasks=X.CFG.flatMap(c=>X.TK(c)).concat(X.MQ,X.ME);
for(const [i,q] of tasks.entries())test('Canonical task '+(i+1),()=>assert(grade(q[2],q),q[1]));
for(const i of [29,30,55,79,80,104,138,139,173])test('Reject wrong inclusive boundary '+i,()=>assert(!grade(tasks[i][2].replaceAll(' > ',' >= '),tasks[i])));
const explicit=[
 ['BETWEEN',X.TK(X.CFG[0])[6],'SELECT * FROM employees WHERE officeCode >= 1 AND officeCode <= 2'],
 ['NOT',X.ME[17],'SELECT * FROM employees WHERE officeCode <> 1'],
 ['alias',X.ME[19],'SELECT name FROM members'],
 ['vertical output',X.ME[1],"SHOW TABLE STATUS LIKE 'employees'"],
 ['USING',X.MQ[16],X.MQ[16][2].replace('USING(name)','ON m.name = c.name')]
];
for(const [name,q,sql] of explicit)test('Enforce explicit '+name,()=>assert(!grade(sql,q)));
test('Accept reversed comparator and alias',()=>assert(grade('SELECT e.* FROM employees e WHERE 1 < e.officeCode AND e.jobTitle = \'Sales Rep\'',X.TK(X.CFG[0])[4])));
test('Accept lowercase formatting and comments',()=>assert(grade('select /* study */ * from employees where officeCode between 1 and 2;',X.TK(X.CFG[0])[6])));
test('Unrelated duplicate error fails',()=>assert(!grade('CREATE TABLE wrong(a INT PRIMARY KEY,b INT PRIMARY KEY)',X.TK(X.CFG[0])[22])));
const session=X.emptyBuildSession('campus_lab');X.exec(X.BUILD_DEFS.map(d=>d[2]).join('\n')+X.BUILD_INSERT,session);
test('Builder reference passes',()=>assert(builder(X.BUILD_JOIN,X.BUILD_JOIN,session)));
test('Builder missing composite term fails',()=>assert(!builder(X.BUILD_JOIN.replace(' AND e.term = o.term',''),X.BUILD_JOIN,session)));
test('Builder missing ORDER BY fails',()=>assert(!builder(X.BUILD_JOIN.replace(/ORDER BY[\s\S]*/,''),X.BUILD_JOIN,session)));
test('Builder sorting by names instead of identifiers fails',()=>assert(!builder(X.BUILD_JOIN.replace('ORDER BY s.student_id, c.course_code','ORDER BY s.full_name, c.course_code'),X.BUILD_JOIN,session)));
test('Builder reverse equality is accepted',()=>assert(builder(X.BUILD_JOIN.replace('e.term = o.term','o.term = e.term'),X.BUILD_JOIN,session)));
console.log(JSON.stringify({passed:checks.length,regularTasks:tasks.length,checks},null,2));
