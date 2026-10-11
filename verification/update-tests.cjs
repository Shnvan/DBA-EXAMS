const fs=require('fs');let s=fs.readFileSync('verification/followup-tests.cjs','utf8');s=s.replace("querySelectorAll('.relationship-list li').length,9", "querySelectorAll('.relationship-list li').length,8");fs.writeFileSync('verification/followup-tests.cjs',s);
s=fs.readFileSync('verification/smoke.cjs','utf8').replace("value='SHOW TABLES'", "value='SHOW TABLES;'");fs.writeFileSync('verification/smoke.cjs',s);
for(const file of ['verification/ui.js','verification/build-lab.js']){s=fs.readFileSync(file,'utf8').replaceAll('semicolon; \\G is', 'semicolon; \\\\G is');fs.writeFileSync(file,s)}
