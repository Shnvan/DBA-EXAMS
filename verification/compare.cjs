const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const mysql=require('../.cache/test-runtime/node_modules/mysql2/promise');const {X}=require('./load.cjs')();
const qname=s=>'`'+s.replace(/`/g,'``')+'`',cleanType=s=>s.toLowerCase().replace(/\b(tinyint|smallint|mediumint|int|bigint)\(\d+\)/g,'$1');
const normalize=(v,type='')=>v===null?null:Buffer.isBuffer(v)?'0x'+v.toString('hex').toUpperCase():/^(?:decimal|bigint|int|tinyint|smallint|mediumint|year)/i.test(type)?String(v).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,''):typeof v=='number'?Number(v.toPrecision(14)):v;
const json=x=>JSON.stringify(x);
async function seedServer(c){
 const[dbs]=await c.query('SHOW DATABASES');await c.query('SET FOREIGN_KEY_CHECKS=0');try{for(const[d]of dbs)if(!['information_schema','mysql','performance_schema','sys'].includes(d))await c.query('DROP DATABASE '+qname(d))}finally{await c.query('SET FOREIGN_KEY_CHECKS=1')}
 await c.query('CREATE DATABASE practice CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');await c.query('USE practice');
 await c.query("DROP USER IF EXISTS 'user_name'@'%'");await c.query("CREATE USER 'user_name'@'%'");
 const seed=X.seed();for(const[n,t]of Object.entries(seed)){
  const pk=t.cols.filter(x=>x.pk).map(x=>qname(x.n));const defs=t.cols.map(c=>qname(c.n)+' '+c.t+(c.nn||c.pk?' NOT NULL':''));if(pk.length)defs.push('PRIMARY KEY ('+pk.join(',')+')');await c.query('CREATE TABLE '+qname(n)+' ('+defs.join(',')+') ENGINE=InnoDB');
  for(const row of t.rows)await c.query('INSERT INTO '+qname(n)+' VALUES ('+t.cols.map(()=>'?').join(',')+')',t.cols.map(col=>row[col.n.toLowerCase()]));
 }
}

async function nativeConstraints(c,d,n){const[idx]=await c.query('SHOW INDEX FROM '+qname(d)+'.'+qname(n));const[fk]=await c.query('SELECT CONSTRAINT_NAME,COLUMN_NAME,REFERENCED_TABLE_SCHEMA,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME,ORDINAL_POSITION FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND REFERENCED_TABLE_NAME IS NOT NULL',[d,n]);const[ai]=await c.query('SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=?',[d,n]);return[idx.map(r=>[r[2],String(r[1]),String(r[3]),r[4].toLowerCase()]).map(json).sort(),fk.map(r=>[r[0],r[1].toLowerCase(),r[2],r[3],r[4].toLowerCase(),String(r[5])]).map(json).sort(),ai[0][0]==null?null:String(ai[0][0])]}
function engineConstraints(s,d,n,t){const keys=X.tableKeys(t).map(k=>({...k,nonUnique:k.nonUnique||0}));return[keys.flatMap(k=>k.cols.map((col,i)=>[k.name,String(k.nonUnique),String(i+1),col])).map(json).sort(),t.foreign.flatMap(f=>f.cols.map((col,i)=>[f.name,col,f.target.d||d,f.target.n,f.refCols[i],String(i+1)])).map(json).sort(),t.cols.some(c=>c.ai)?t.next:null]}

async function databaseState(c){const[dbs]=await c.query('SHOW DATABASES');const databases=[];for(const[d]of dbs){if(['information_schema','mysql','performance_schema','sys'].includes(d))continue;const[tables]=await c.query('SHOW TABLES FROM '+qname(d));const state=[];for(const[n]of tables){const[cols]=await c.query('SHOW COLUMNS FROM '+qname(d)+'.'+qname(n));const[rows]=await c.query('SELECT * FROM '+qname(d)+'.'+qname(n));state.push([n,cols.map(r=>[r[0].toLowerCase(),cleanType(r[1]),r[2],r[3],r[4],r[5]]),rows.map(row=>row.map((v,i)=>normalize(v,cols[i][1]))).map(json).sort(),...(await nativeConstraints(c,d,n))])}databases.push([d,state.sort((a,b)=>a[0].localeCompare(b[0]))])}return databases.sort((a,b)=>a[0].localeCompare(b[0]))}
function engineState(s){const sort=(a,b)=>a[0].localeCompare(b[0]);return Object.entries(s.databases).sort(sort).map(([d,db])=>[d,Object.entries(db).sort(sort).map(([n,t])=>[n,t.cols.map(c=>[c.n.toLowerCase(),cleanType(c.t),c.nn?'NO':'YES',c.pk?'PRI':X.tableKeys(t).some(x=>!x.nonUnique&&x.cols[0]==c.n.toLowerCase())?'UNI':X.tableKeys(t).some(x=>x.nonUnique&&x.cols[0]==c.n.toLowerCase())?'MUL':'',c.hasDefault?c.default?.currentTimestamp?'current_timestamp('+(c.default.precision||0)+')':c.default==null?null:X.sqlString(c.default):null,c.ai?'auto_increment':c.onUpdate?'on update current_timestamp('+(c.onUpdate.precision||0)+')':'']),t.rows.map(row=>t.cols.map(c=>normalize(X.resultValue(row[c.n.toLowerCase()]??null),c.t))).map(json).sort(),...engineConstraints(s,d,n,t)])])}
async function actual(c,sql){const results=[];let error=null;const types={0:'decimal',246:'decimal',1:'tinyint',2:'smallint',3:'int',8:'bigint',9:'mediumint',13:'year'};for(const part of X.splitStatements(sql)){if(!X.tok(part.sql).length)continue;try{const[r,fields]=await c.query(part.sql);const[warnings]=await c.query('SHOW WARNINGS');if(Array.isArray(r)){let rows=r;if(/^\s*SHOW\s+DATABASES\b/i.test(part.sql))rows=r.filter(x=>!['information_schema','mysql','performance_schema','sys'].includes(x[0]));results.push({cols:fields.map(f=>f.name.toLowerCase()),rows:rows.map(row=>row.map((v,i)=>normalize(v,types[fields[i].columnType]||''))),warnings:warnings.map(w=>w[1])})}else results.push({affectedRows:r.affectedRows,warnings:warnings.map(w=>w[1])})}catch(e){error={code:e.errno,sqlState:e.sqlState,message:e.sqlMessage};break}}return{results,error}}
function simulated(sql){const s=X.newSession();let results=[],error=null;try{results=X.exec(sql,s)}catch(e){results=e.R||[];error={code:e.code,sqlState:e.sqlState,message:e.message}}return{s,results:results.map(r=>r.rows?{cols:r.cols.map(x=>x.toLowerCase()),rows:r.rows.map(row=>row.map((v,i)=>normalize(v,r.types?.[i]))),warnings:r.warnings.map(w=>w.code)}:{affectedRows:r.affectedRows??0,warnings:r.warnings.map(w=>w.code)}),error}}
function orderRows(rows,sql,cols){if(!/\bORDER\s+BY\b/i.test(sql))return rows.map(json).sort();const part=X.splitStatements(sql).filter(p=>p.sql.trim()).at(-1);let orders;try{orders=X.parse(X.tok(part.sql)).query?.order||[]}catch(e){return rows}const indexes=orders.map(o=>o.expr.kind=='column'?cols.indexOf(o.expr.column):o.expr.kind=='literal'?o.expr.value-1:-1);if(!indexes.length||indexes.includes(-1))return rows;const groups=[];for(const row of rows){const key=json(indexes.map(i=>row[i]));if(groups.at(-1)?.[0]!=key)groups.push([key,[]]);groups.at(-1)[1].push(json(row))}return groups.map(([k,v])=>[k,v.sort()])}
function equalResults(a,b,sql){if(a.length!=b.length)return false;return a.every((r,i)=>{const other=b[i];if(!r.rows||!other.rows)return json(r)==json(other);const omitted=/SHOW\s+INDEX/i.test(sql)?['cardinality']:/SHOW\s+TABLE\s+STATUS/i.test(sql)?['rows','avg_row_length','data_length','max_data_length','index_length','data_free','create_time','update_time','check_time','max_index_length']:[];const strip=(rows,cols)=>rows.map(row=>row.map((v,k)=>omitted.includes(cols[k])?null:v));return json(r.cols)==json(other.cols)&&json(orderRows(strip(r.rows,r.cols),sql,r.cols))==json(orderRows(strip(other.rows,other.cols),sql,other.cols))&&json(r.warnings)==json(other.warnings)})}
const probes=[
 ['composite primary-key order','CREATE TABLE x(a INT,b INT,PRIMARY KEY(b,a)); SHOW INDEX FROM x'],
 ['auto increment must lead a key','CREATE TABLE x(a INT,b INT AUTO_INCREMENT,PRIMARY KEY(a,b))'],
 ['mixed auto increment reservation','CREATE TABLE x(id INT AUTO_INCREMENT PRIMARY KEY); INSERT INTO x VALUES(100),(NULL); SELECT * FROM x'],
 ['mixed auto increment after reservation','CREATE TABLE x(id INT AUTO_INCREMENT PRIMARY KEY); INSERT INTO x VALUES(NULL),(100),(NULL); SELECT * FROM x'],
 ['valid defaults and metadata',"CREATE TABLE x(a INT DEFAULT 2,s VARCHAR(5) DEFAULT 'hi'); INSERT INTO x VALUES(DEFAULT,DEFAULT); DESCRIBE x"],
 ['failed auto increment reservation',"CREATE TABLE x(id INT AUTO_INCREMENT PRIMARY KEY,n INT UNIQUE); INSERT INTO x(n) VALUES(1),(1),(3)"],
 ['invalid numeric default',"CREATE TABLE x(a INT DEFAULT 'abc')"],
 ['invalid text default',"CREATE TABLE x(a VARCHAR(2) DEFAULT 'abcd')"],
 ['invalid auto increment type','CREATE TABLE x(a VARCHAR(5) AUTO_INCREMENT PRIMARY KEY)'],
 ['null fallback type','SELECT COALESCE(NULL,1),IFNULL(NULL,2)'],
 ['mixed fallback type',"SELECT COALESCE(1,'a'),IFNULL(2,'b')"],
 ['global UNION order','SELECT 2 AS x UNION SELECT 1 ORDER BY x'],
 ['global UNION limit','SELECT 2 AS x UNION SELECT 1 LIMIT 1'],
 ['UNION string coercion',"SELECT 1 AS x UNION SELECT 'a'"],
 ['UNION unknown global column','SELECT 2 AS x UNION SELECT 1 AS y ORDER BY y'],
 ['invalid local UNION order','SELECT 2 AS x ORDER BY x UNION SELECT 1'],
 ['auto increment survives rollback','CREATE TABLE x(id INT AUTO_INCREMENT PRIMARY KEY); START TRANSACTION; INSERT INTO x VALUES(NULL); ROLLBACK; INSERT INTO x VALUES(NULL); SELECT * FROM x'],
 ['auto increment survives savepoint rollback','CREATE TABLE x(id INT AUTO_INCREMENT PRIMARY KEY); START TRANSACTION; SAVEPOINT s; INSERT INTO x VALUES(NULL); ROLLBACK TO s; INSERT INTO x VALUES(NULL); COMMIT; SELECT * FROM x'],
 ['index definition output','CREATE TABLE x(a INT PRIMARY KEY,b INT UNIQUE); SHOW INDEX FROM x'],
 ['empty join binding','DELETE FROM members; SELECT m.missing FROM members m LEFT JOIN committees c ON m.name=c.name'],
 ['unknown ON column','SELECT * FROM members m LEFT JOIN committees c ON m.missing=c.name'],
 ['unknown GROUP column','SELECT COUNT(*) FROM members GROUP BY missing'],
 ['unknown HAVING column','SELECT COUNT(*) FROM members HAVING missing=1'],
 ['unknown ORDER column','SELECT name FROM members ORDER BY missing'],
 ['NOT precedence','SELECT NOT 2=1 AND 0, NOT 2 IN(1,NULL), NOT 1 BETWEEN 0 AND 2'],
 ['exact bigint arithmetic','SELECT 9223372036854775806+1'],
 ['decimal arithmetic','SELECT 1.20+2.30, 5.00/2'],
 ['malformed later batch','INSERT INTO members(member_id,name) VALUES(99,\'A\'); SELECT name FROM members; SELEC name FROM members'],
 ['empty aggregation','DELETE FROM members; SELECT COUNT(*),SUM(member_id),AVG(member_id),MIN(member_id),MAX(member_id) FROM members'],
 ['NULL comparison','SELECT NULL=NULL,NULL<=>NULL,1<=>NULL,NOT NULL'],
 ['VARCHAR truncation','CREATE TABLE x(s VARCHAR(2)); INSERT INTO x VALUES(\'abcd\')'],
 ['duplicate UNION rows','SELECT name FROM members UNION SELECT name FROM members'],
 ['UNION ALL rows','SELECT name FROM members UNION ALL SELECT name FROM members'],
 ['LIKE coercion','SELECT 123 LIKE \'12%\', NULL LIKE \'%\''],
 ['integer bounds','CREATE TABLE x(a TINYINT,b SMALLINT,c INT UNSIGNED); INSERT INTO x VALUES(999,40000,-1)'],
 ['invalid temporal warning','CREATE TABLE x(d DATE); INSERT INTO x VALUES(\'2024-02-30\')'],
 ['unknown column, empty result','SELECT missing FROM employees WHERE 1=0'],
 ['ambiguous join column','SELECT name FROM members JOIN committees ON members.name=committees.name'],
 ['unknown database','USE imaginary'],['unknown type','CREATE TABLE x (a MADEUP)'],['unknown schema modifier','CREATE TABLE x (a INT GARBAGE)'],
 ['drop missing column','ALTER TABLE employees DROP COLUMN missing'],['modify missing column','ALTER TABLE employees MODIFY missing INT'],
 ['IN with NULL','SELECT 2 IN (NULL), 0 IN (NULL), 2 IN (1,NULL), 2 NOT IN (1,NULL), 2 IN (NULL,2)'],
 ['wrong qualifier wildcard','SELECT employees.* FROM employees fake'],['union arity','SELECT * FROM employees UNION SELECT name FROM members'],
 ['duplicate columns','CREATE TABLE x (a INT,A INT)'],['duplicate aliases','SELECT * FROM employees e JOIN employees e ON 1=1'],
 ['wrong function arity','SELECT ROUND(1,2,3)'],['missing function','SELECT madeup(1)'],
 ['unknown UPDATE target with no rows','UPDATE employees SET missing=1 WHERE 0'],['unknown WHERE column with no rows','DELETE FROM members; SELECT * FROM members WHERE missing=1'],
 ['comments and quoted names',"CREATE TABLE `odd table` (`odd column` VARCHAR(20)); INSERT INTO `odd table` VALUES ('a;b'); -- note\n SELECT `odd column` FROM `odd table`"],
 ['statement rollback',"UPDATE employees SET employeeNumber=1056 WHERE employeeNumber=1002"],
 ['update NOT NULL warning','UPDATE employees SET firstName=NULL WHERE employeeNumber=1002'],
 ['sequential assignments','UPDATE employees SET officeCode=2, reportsTo=officeCode WHERE employeeNumber=1002'],
 ['short circuit and truth tables','SELECT FALSE AND NULL, TRUE AND NULL, FALSE OR NULL, TRUE OR NULL, NOT NULL, 1=0 AND 1/0, 1=1 OR 1/0'],
 ['USING wildcard coalesces keys','SELECT * FROM members LEFT JOIN committees USING(name)'],
 ['USING right unmatched','SELECT name FROM members RIGHT JOIN committees USING(name)'],
 ['ordinal sort','SELECT lastName,officeCode FROM employees ORDER BY 2 DESC,1 ASC LIMIT 2'],
 ['type warnings',"CREATE TABLE x (id INT PRIMARY KEY,a INT NOT NULL,s VARCHAR(3),d DECIMAL(4,2)); INSERT INTO x VALUES (1,'bad','abcdef',999.12)"],
 ['auto increment after DELETE',"CREATE TABLE x(id INT AUTO_INCREMENT PRIMARY KEY); INSERT INTO x VALUES(NULL),(NULL); DELETE FROM x WHERE id=2; INSERT INTO x VALUES(NULL)"],
 ['UNIQUE NULL allowed',"CREATE TABLE x(id INT UNIQUE); INSERT INTO x VALUES(NULL),(NULL)"],
 ['primary key unknown field','CREATE TABLE x (id INT, PRIMARY KEY(missing))'],
 ['DEFAULT validation','CREATE TABLE x (id INT NOT NULL DEFAULT NULL)'],
 ['DDL implicit commit','START TRANSACTION; UPDATE employees SET officeCode=2 WHERE employeeNumber=1002; CREATE TABLE x(id INT); ROLLBACK'],
 ['savepoint no transaction','SAVEPOINT x; ROLLBACK TO x'],
 ['autocommit rollback','SET AUTOCOMMIT=0; UPDATE employees SET officeCode=2 WHERE employeeNumber=1002; ROLLBACK; SET AUTOCOMMIT=1'],
 ['NULL BETWEEN falsity','SELECT 1 BETWEEN NULL AND 0, 1 BETWEEN 2 AND NULL, 1 BETWEEN NULL AND 2'],
 ['schema qualified database','CREATE DATABASE other; CREATE TABLE other.x (id INT); INSERT INTO other.x VALUES(1); SELECT * FROM other.x'],
 ['foreign key rejects invalid child','CREATE TABLE child (id INT, employee INT, FOREIGN KEY(employee) REFERENCES employees(employeeNumber)); INSERT INTO child VALUES(1,9999)'],
 ['FULL alias trap','SELECT members.name FROM members FULL JOIN committees ON members.name=committees.name'],
 ['FULL is a legal alias for an inner join','SELECT FULL.name FROM members FULL JOIN committees ON FULL.name=committees.name'],
 ['FULL OUTER syntax','SELECT * FROM members FULL OUTER JOIN committees ON members.name=committees.name']
];
module.exports={X,mysql,seedServer,actual,simulated,databaseState,engineState,equalResults,probes,verifyServer};
if(require.main===module)(async()=>{const ports=process.argv.slice(2).map(Number);const report={engines:[],started:new Date().toISOString()};const tasks=X.CFG.flatMap(c=>X.TK(c)).concat(X.MQ,X.ME);for(const port of ports.length?ports:[13307,13308]){
 const c=await mysql.createConnection({host:'127.0.0.1',port,user:'root',rowsAsArray:true,dateStrings:true,supportBigNumbers:true,bigNumberStrings:true,flags:'-FOUND_ROWS,-IGNORE_SPACE'});
 await verifyServer(c,port);const[version]=await c.query('SELECT VERSION(),@@sql_mode,@@collation_server,@@lower_case_table_names');const engine={port,version:version[0],tasks:tasks.length,probes:probes.length,passed:0,mismatches:[],diagnostics:[]};
 for(const [index,name,sql]of [...tasks.map((q,i)=>[i,q[1],q[2]]),...probes.map((q,i)=>[tasks.length+i,q[0],q[1]])]){
  await seedServer(c);const sim=simulated(sql),act=await actual(c,sql),db=await databaseState(c),state=engineState(sim.s),errorEqual=sim.error?.code==act.error?.code&&sim.error?.sqlState==act.error?.sqlState;
  const reasons=[];if(!errorEqual)reasons.push('error');if(!equalResults(sim.results,act.results,sql))reasons.push('results');if(json(state)!=json(db))reasons.push('state');
  if(reasons.length)engine.mismatches.push({index,name,sql,reasons,expected:act,simulated:{results:sim.results,error:sim.error},state:reasons.includes('state')?{expected:db,simulated:state}:undefined});else engine.passed++;
  if(/FULL|DESCRIBE/i.test(sql))engine.diagnostics.push({sql,actual:act});
 }
 report.engines.push(engine);console.log(JSON.stringify({port,version:engine.version,passed:engine.passed,total:tasks.length+probes.length,mismatches:engine.mismatches.map(x=>({index:x.index,name:x.name,reasons:x.reasons}))},null,2));await c.end();
 }
 report.finished=new Date().toISOString();fs.writeFileSync(path.join(__dirname,'..','verification-artifacts','root-lab-regression-databases.json'),JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});

async function verifyServer(c,port){const expected={13307:'/.cache/maria104-data/',13311:'/var/tmp/dbms-midterm-maria11/data/',13308:'/var/tmp/dbms-midterm-mysql8/'};if(!expected[port])throw Error('Unexpected test port');const[r]=await c.query('SELECT @@datadir');if(!r[0][0].replace(/\\/g,'/').toLowerCase().endsWith(expected[port]))throw Error('Wrong datadir; refusing database changes');}
