const fs=require('fs'),assert=require('assert/strict');
const files=['DBMS_midterm_practice.html','verification/essentials.js','verification/ui.js','verification/build-lab.js','verification/clearer-builder-view.js','verification/engine-write.js'];
const replacements=[
 ['Inspect the indexes defined on employees. The number of different indexed values is not measured by this offline lab.','Show the indexes defined on employees.'],
 ['Inspect the status of employees with vertical monitor output. This offline lab does not measure server storage statistics.','Show the status of employees, with the result displayed vertically.'],
 ['the offline user_name account','the user_name account'],
 [' · root · offline practice',' · root'],
 ['Original module · 105 pages · works offline','Original module · 105 pages'],
 ['The lab runs offline in your browser and sends no SQL to a server. It uses the module’s SQL commands and the MariaDB version included in XAMPP 10.4. Open the notes for MariaDB differences and the commands available in this lab.','SQL practice runs in your browser and follows MariaDB 10.4 syntax. See the module notes for SQL differences and available commands.'],
 ['This offline lab does not measure the number of different values in an index.','Cardinality is not calculated here; NULL means unavailable for this result.'],
 ['Disk sizes, estimated row counts, index cardinality and timestamps are server statistics, unavailable in offline practice. NULL here means unavailable; preview tables show actual practice rows.','Storage estimates and server timestamps are unavailable. NULL in these fields means unavailable; the table preview shows your records.'],
 [",notice:'These grants describe simulated offline accounts.'",''],
 ["r.notice?'<p class=\"module-note\">'+h(r.notice)+'</p>':''", "r.notice?'<details class=\"module-note\"><summary>About this result</summary><p>'+h(r.notice)+'</p></details>':''"]
];
let counts=replacements.map(()=>0);
for(const file of files){let s=fs.readFileSync(file,'utf8');replacements.forEach(([a,b],i)=>{if(s.includes(a)){counts[i]++;s=s.replaceAll(a,b)}});fs.writeFileSync(file,s)}
assert(counts.every(n=>n>0),JSON.stringify(counts));console.log('Removed repeated offline explanations; result notes are collapsed and grants have no extra notice.');
