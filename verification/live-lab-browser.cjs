const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {chromium}=require('C:/Users/Ivan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),url=process.argv[2]||'https://dbmsmidtermexam-3-4.vercel.app/',dir=path.join(root,'verification-artifacts','live-lab');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const response=await fetch(url),html=Buffer.from(await response.arrayBuffer());
 assert.equal(response.status,200);
 assert.equal(crypto.createHash('sha256').update(html).digest('hex'),crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'DBMS_midterm_practice.html'))).digest('hex'),'Deployed HTML differs from this release');
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),checks=[];
 try{
  for(const width of [1440,360])for(const themeName of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const check=(name,ok)=>{checks.push({width,theme:themeName,name,passed:!!ok});assert.ok(ok,name)};
   await page.goto(url);await page.evaluate(t=>theme(t),themeName);
   await page.getByRole('button',{name:'SQL lab',exact:true}).click();
   check('three starting levels',await page.locator('.level-pick button').count()===3);
   await page.locator('.level-pick button').filter({hasText:'Intermediate'}).click();
   await page.getByRole('button',{name:'Database setup walkthrough',exact:true}).click();
   check('task-first view hides session metadata and syntax',await page.locator('#course-workspace pre').count()===0&&!/MariaDB \[|\/ root|Task \d+ of|Worked example|\bSyntax\b/.test(await page.locator('#course-workspace').innerText()));
   const sql=await page.evaluate(()=>SQL_CURRICULA.intermediate[0].sql);
   await page.locator('#course-sql').fill(sql);await page.getByRole('button',{name:'Check answer',exact:true}).click();
   check('valid answer checks successfully',await page.locator('#course-feedback .ok').count()===1);
   check('check leaves visible database unchanged',await page.evaluate(()=>courseStates.intermediate.session.current===null));
   await page.getByRole('button',{name:'Apply checked result and continue',exact:true}).click();
   check('checked checkpoint continues without rerunning',await page.evaluate(()=>courseStates.intermediate.session.current==='module_practice'&&courseStates.intermediate.lesson===1));
   await page.reload();check('refresh starts Home',await page.evaluate(()=>currentView==='home'&&scrollY===0));await page.getByRole('button',{name:'SQL lab',exact:true}).click();
   check('progress restores after refresh',await page.evaluate(()=>courseStates.intermediate.session.current==='module_practice'&&courseStates.intermediate.lesson===1));
   await page.locator('.level-pick button').filter({hasText:'Easy'}).click();
   check('prepared tasks use descriptive requirements',await page.locator('#ws .session').count()===0&&/List the tables in the active database/.test(await page.locator('#ws').innerText()));
   await page.locator('#sql').fill(await page.evaluate(()=>terminatedSolution(TS(cur)[ti][2])));
   await page.getByRole('button',{name:'Run query',exact:true}).click();await page.getByRole('button',{name:'Check answer',exact:true}).click();
   check('prepared task Run and Check work',await page.locator('#fb .ok').count()===1);
   check('no horizontal page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   check('no browser errors',errors.length===0);
   await page.screenshot({path:path.join(dir,width+'-'+themeName+'.png'),fullPage:true});await context.close();
  }
 }finally{await browser.close()}
 const result={url,executedAt:new Date().toISOString(),htmlSHA256:crypto.createHash('sha256').update(html).digest('hex'),passed:checks.length,checks};
 fs.writeFileSync(path.join(dir,'browser-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:checks.length,url,htmlSHA256:result.htmlSHA256}));
})().catch(e=>{console.error(e);process.exit(1)});
