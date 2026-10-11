const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('C:/Users/Ivan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const input=path.resolve(__dirname,'..','DBMS_midterm_practice.html');const dir=path.resolve(__dirname,'..','verification-artifacts','three-level-browser');fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),checks=[];
for(const width of [1440,768,360]) for(const themeName of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());await page.goto('file:///'+input.replace(/\\/g,'/'));await page.evaluate(t=>theme(t),themeName);
 const check=(name,ok)=>{checks.push({width,theme:themeName,name,passed:!!ok});assert.ok(ok,`${width}/${themeName}: ${name}`)};
 await page.getByRole('button',{name:'SQL lab',exact:true}).click();
 check('exactly three level cards',await page.locator('.level-pick .card').count()===3);
 check('level labels',await page.locator('.level-pick').innerText().then(t=>/^Easy[\s\S]*Intermediate[\s\S]*Advanced/.test(t)));
 await page.locator('.level-pick .card').filter({hasText:'Easy'}).click();
 check('easy prepared track appears',await page.locator('.track-pick .btn').count()===5);
 await page.locator('.track-pick .btn').first().click();
 check('easy task editor appears',await page.locator('#sql').count()===1 && await page.getByRole('button',{name:'Run query',exact:true}).count()===1);
 await page.locator('.level-pick .card').filter({hasText:'Intermediate'}).click();
 await page.getByRole('button',{name:'Database setup walkthrough',exact:true}).click();
 check('intermediate first lesson',await page.locator('#course-title').innerText().then(t=>/Create and select/.test(t)));
 const intSql=await page.evaluate(()=>SQL_CURRICULA.intermediate[0].sql);await page.locator('#course-sql').fill(intSql);await page.getByRole('button',{name:'Check answer',exact:true}).click();check('intermediate check succeeds',await page.locator('#course-feedback').innerText().then(t=>/correct/i.test(t)));
 await page.getByRole('button',{name:/continue/i}).click();check('intermediate advances one lesson',await page.locator('#course-title').innerText().then(t=>/Inspect the empty/.test(t)));
 await page.locator('#course-sql').fill('draft survives reload');await page.waitForTimeout(350);await page.reload();await page.getByRole('button',{name:'SQL lab',exact:true}).click();check('SQL level restores after reload',await page.locator('.level-pick .card.on').innerText().then(t=>/Intermediate/.test(t)));await page.getByRole('button',{name:'Database setup walkthrough',exact:true}).click();check('course draft restores after reload',await page.locator('#course-sql').inputValue()==='draft survives reload');
 await page.locator('.level-pick .card').filter({hasText:'Advanced'}).click();check('advanced course appears',await page.locator('#course-title').innerText().then(t=>/Create and select the campus/.test(t)));await page.getByRole('button',{name:'Challenges',exact:true}).click();check('challenge style hides explanation',await page.locator('.course-explanation').count()===0);await page.getByRole('button',{name:'Walkthrough',exact:true}).click();check('walkthrough style restores explanation',await page.locator('.course-explanation').count()===1);
 check('no page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));check('no page errors',errors.length===0);await page.screenshot({path:path.join(dir,`${width}-${themeName}.png`),fullPage:true});await context.close();}
await browser.close();fs.writeFileSync(path.join(dir,'browser-checks.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({passed:checks.filter(x=>x.passed).length,total:checks.length}));
})().catch(e=>{console.error(e);process.exitCode=1});

