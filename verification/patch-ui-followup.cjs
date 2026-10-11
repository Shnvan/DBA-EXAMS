const fs=require('fs');let s=fs.readFileSync('verification/ui.js','utf8');function replace(a,b){if(!s.includes(a))throw Error('UI anchor missing: '+a.slice(0,80));s=s.replace(a,b)}
replace("remember();['home','exam','lab'].forEach", "remember();rememberBuild();['home','exam','lab','builder'].forEach");
replace("if(v=='lab')lab();scrollTo", "if(v=='lab')lab();if(v=='builder')builder();scrollTo");
replace("${[...CFG.map(c=>c.t),'Module queries','Module essentials'].map", "${[...CFG.map(c=>c.t),'Module queries','Module essentials'].map");
replace("}).join('')}</div><div id=\"ws\"", "}).join('')}<button class=\"card\" onclick=\"go('builder')\"><b>Build tables &amp; relationships</b><p class=\"mu sm\">12 guided challenges + your own sandbox</p></button></div><div id=\"ws\"");
replace("or Module essentials for the remaining command categories and NULL truth tables.", "Module essentials for the remaining command categories and NULL truth tables, or build your own connected tables.");
replace(" · offline practice</span><label class=\"sm\" for=\"practice-user\">Practice account</label><select id=\"practice-user\" onchange=\"switchPracticeAccount(this.value)\">${Object.keys(live.accounts).map(n=>`<option value=\"${h(n)}\"${n==live.user?' selected':''}>${h(n)}</option>`).join('')}</select>", " · root · offline practice</span>");
replace("function switchPracticeAccount(name){remember();if(live.transaction)exec('ROLLBACK',live);live.user=name;ws()}", "");
replace("Run submits your text; a final semicolon is optional here. Separate multiple statements with semicolons. Names, syntax, types and permissions are checked against this practice session.", "End each SQL statement with a semicolon; \\G is the supported vertical-output alternative. An unfinished batch executes nothing. Names, syntax, types and constraints are checked in the root session.");
replace("function runQ(){remember();const key=taskKey();let out='';", "function runQ(){remember();const key=taskKey(),pending=submissionProblem(draft[key]||'');if(pending){outputs[key]=`<div class=\"fb no\">${h(pending)}</div>`;ws();$('#sql').focus({preventScroll:true});return}live.user='root';let out='';");
replace("sql=draft[taskKey()],ok=sql.trim()&&", "sql=draft[taskKey()]||'',pending=submissionProblem(sql),ok=!pending&&sql.trim()&&");
replace("Not yet. Run the SQL to inspect its result, warning or error, then review the task’s names and clauses.", "${pending?h(pending):'Not yet. Run the SQL to inspect its result, warning or error, then review the task’s names and clauses.'}");
replace("h(TS(cur)[ti][2])", "h(terminatedSolution(TS(cur)[ti][2]))");
s+='\n'+fs.readFileSync('verification/build-lab.js','utf8')+'\n';fs.writeFileSync('verification/ui.js',s);
let e=fs.readFileSync('verification/essentials.js','utf8');e=e.replace('Then switch practice account to test those permissions.','Use SHOW GRANTS FOR user_name; to inspect those permissions.').replace("[x.name,x.cols]", "[x.name,x.cols,+!!x.nonUnique]");fs.writeFileSync('verification/essentials.js',e);
let w=fs.readFileSync('verification/engine-write.js','utf8');w=w.replace("sql:sql.slice(start,i),pos:start,vertical", "sql:sql.slice(start,i),pos:start,vertical,terminated:true");fs.writeFileSync('verification/engine-write.js',w);
const helpers=`
/* The Run/Check submission boundary models a client terminator, not server SQL syntax. */
function submissionProblem(sql){const parts=splitStatements(String(sql)),last=parts.at(-1);let count=0;for(const p of parts){let tokens;try{tokens=tok(p.sql)}catch(e){tokens=[1]}if(tokens.length){count++;if(!p.terminated)return 'Statement '+count+' is incomplete; add a semicolon.'}}return count?null:'Type a query first.'}
function terminatedSolution(sql){const p=splitStatements(sql).at(-1);try{return tok(p.sql).length?sql.trimEnd()+';':sql}catch(e){return sql.trimEnd()+';'}}
`;
let core=fs.readFileSync('verification/engine-core.js','utf8');core+=helpers;fs.writeFileSync('verification/engine-core.js',core);
