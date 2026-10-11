const mysql=require('../.cache/test-runtime/node_modules/mysql2/promise');
const probes=[
 ['missing parent','CREATE TABLE c(id INT, FOREIGN KEY(id) REFERENCES p(id))'],
 ['missing parent column','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT, FOREIGN KEY(id) REFERENCES p(nope))'],
 ['unindexed parent','CREATE TABLE p(id INT); CREATE TABLE c(id INT, FOREIGN KEY(id) REFERENCES p(id))'],
 ['signed mismatch','CREATE TABLE p(id INT UNSIGNED PRIMARY KEY); CREATE TABLE c(id INT, FOREIGN KEY(id) REFERENCES p(id))'],
 ['type mismatch','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id BIGINT, FOREIGN KEY(id) REFERENCES p(id))'],
 ['different string length','CREATE TABLE p(id VARCHAR(10) PRIMARY KEY); CREATE TABLE c(id VARCHAR(20), FOREIGN KEY(id) REFERENCES p(id))'],
 ['self reference','CREATE TABLE staff(id INT PRIMARY KEY,manager INT, CONSTRAINT fk_manager FOREIGN KEY(manager) REFERENCES staff(id))'],
 ['key defined after foreign','CREATE TABLE staff(id INT,manager INT, FOREIGN KEY(manager) REFERENCES staff(id), PRIMARY KEY(id))'],
 ['duplicate constraint','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT, CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)); CREATE TABLE c2(id INT,CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id))'],
 ['alter orphan','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT); INSERT INTO c VALUES(9); ALTER TABLE c ADD CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)'],
 ['modify child type','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT,CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)); ALTER TABLE c MODIFY id BIGINT'],
 ['modify parent type','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT,CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)); ALTER TABLE p MODIFY id BIGINT'],
 ['drop parent key','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT,CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)); ALTER TABLE p DROP PRIMARY KEY'],
 ['drop child column','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT,x INT,CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)); ALTER TABLE c DROP id'],
 ['drop parent column','CREATE TABLE p(id INT PRIMARY KEY,x INT); CREATE TABLE c(id INT,CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)); ALTER TABLE p DROP id'],
 ['drop parent table','CREATE TABLE p(id INT PRIMARY KEY); CREATE TABLE c(id INT,CONSTRAINT fk FOREIGN KEY(id) REFERENCES p(id)); DROP TABLE p'],
 ['inline ignored','CREATE TABLE c(id INT REFERENCES missing(id)); SHOW CREATE TABLE c'],
 ['foreign composite index','CREATE TABLE p(a INT,b INT,PRIMARY KEY(a,b)); CREATE TABLE c(a INT,b INT,PRIMARY KEY(a),FOREIGN KEY(a,b) REFERENCES p(a,b)); SHOW INDEX FROM c'],
];
(async()=>{const c=await mysql.createConnection({host:'127.0.0.1',port:13307,user:'root',rowsAsArray:true});const [v]=await c.query('SELECT @@datadir');if(!v[0][0].replace(/\\/g,'/').toLowerCase().includes('/.cache/maria104-data/'))throw Error('Wrong datadir');const out=[];for(const[name,sql]of probes){await c.query('DROP DATABASE IF EXISTS fk_probe');await c.query('CREATE DATABASE fk_probe COLLATE utf8mb4_general_ci');await c.query('USE fk_probe');let error=null,rows=null;for(const s of sql.split(';').filter(x=>x.trim()))try{[rows]=await c.query(s)}catch(e){error={code:e.errno,state:e.sqlState,message:e.sqlMessage};break}out.push({name,error,rows});}await c.query('DROP DATABASE fk_probe');await c.end();require('fs').writeFileSync('verification-artifacts/fk-native-probe.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))})().catch(e=>{console.error(e);process.exitCode=1});
