const fs=require('fs');let s=fs.readFileSync('verification/compare.cjs','utf8');
const a=s.indexOf('const keys=t.indexes.map'),b=s.indexOf('return[keys.flatMap',a);if(a<0||b<0)throw Error('Keys anchor');s=s.slice(0,a)+'const keys=X.tableKeys(t).map(k=>({...k,nonUnique:k.nonUnique||0}));'+s.slice(b);
s=s.replace("t.indexes.some(x=>x.cols[0]==c.n.toLowerCase())?'UNI':t.foreign.some(x=>x.cols[0]==c.n.toLowerCase())?'MUL'", "X.tableKeys(t).some(x=>!x.nonUnique&&x.cols[0]==c.n.toLowerCase())?'UNI':X.tableKeys(t).some(x=>x.nonUnique&&x.cols[0]==c.n.toLowerCase())?'MUL'");
s=s.replace('(async()=>{const ports=', 'module.exports={X,mysql,seedServer,actual,simulated,databaseState,engineState,equalResults,probes,verifyServer};\nif(require.main===module)(async()=>{const ports=');
s=s.replace("const[version]=await c.query('SELECT VERSION()", "await verifyServer(c,port);const[version]=await c.query('SELECT VERSION()");
s=s.replace("'database-comparison.json'", "'root-lab-regression-databases.json'");
s+=`\nasync function verifyServer(c,port){const expected={13307:'/.cache/maria104-data/',13311:'/var/tmp/dbms-midterm-maria11/data/',13308:'/var/tmp/dbms-midterm-mysql8/'};if(!expected[port])throw Error('Unexpected test port');const[r]=await c.query('SELECT @@datadir');if(!r[0][0].replace(/\\\\/g,'/').toLowerCase().endsWith(expected[port]))throw Error('Wrong datadir; refusing database changes');}\n`;
fs.writeFileSync('verification/compare.cjs',s);
