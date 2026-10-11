const fs=require('fs'),path=require('path');
const file=path.resolve(__dirname,'..','DBMS_midterm_practice.html');let html=fs.readFileSync(file,'utf8');
const start=html.indexOf('/* ---------- mini MySQL-style engine ---------- */'),end=html.indexOf('/* ---------- data ---------- */',start);
if(start<0||end<0)throw Error('Engine patch anchors missing');
const engine=['engine-core.js','engine-parser.js','engine-query.js','engine-write.js'].map(n=>fs.readFileSync(path.join(__dirname,n),'utf8')).join('\n');
html=html.slice(0,start)+'/* ---------- mini MySQL-style engine ---------- */\n'+engine+'\n'+html.slice(end);fs.writeFileSync(file,html);
console.log('Patched engine block only:',engine.length,'bytes');
