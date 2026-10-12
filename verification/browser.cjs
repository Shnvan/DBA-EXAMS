const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/Ivan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const input=process.argv[2]||path.resolve(__dirname,'..','DBMS_midterm_practice.html');
const label=process.argv[3]||'final';
const dir=path.resolve(__dirname,'..','verification-artifacts',label);fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),checks=[];
for(const width of [1440,380])for(const themeName of ['light','dark']){const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());await page.goto('file:///'+input.replace(/\\/g,'/'));await page.evaluate(t=>theme(t),themeName);
await page.getByRole('button',{name:'Exam',exact:true}).click();await page.screenshot({path:path.join(dir,`${width}-${themeName}-chooser.png`),fullPage:true});
checks.push({width,theme:themeName,chooserOnly:await page.evaluate(()=>{const t=document.querySelector('#exam').textContent;return /Identification/.test(t)&&/Multiple Choice/.test(t)&&!/true.?false/i.test(t)})});
await page.getByRole('button',{name:'Identification',exact:true}).click();checks.push({width,theme:themeName,parts:await page.locator('.exam-part').count(),singlePart:await page.locator('.exam-part').count()===1,noTrueFalse:!(await page.locator('#exam').innerText()).match(/true.?false/i)});
await page.locator('#i0').fill('Database Management System');await page.locator('#exam-check').click();checks.push({width,theme:themeName,checked:await page.evaluate(()=>examState.checked.id[0]===true),feedback:await page.locator('#exam-feedback .ok').count()===1,locked:await page.locator('.q input:disabled').count()>0});
await page.reload();checks.push({width,theme:themeName,restored:await page.evaluate(()=>examState.mode==='id'&&examState.checked.id[0]===true)});await page.screenshot({path:path.join(dir,`${width}-${themeName}-restored.png`),fullPage:true});checks.push({width,theme:themeName,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errors});await context.close()}
await browser.close();fs.writeFileSync(path.join(dir,'browser-checks.json'),JSON.stringify(checks,null,2));if(checks.some(x=>x.overflow||x.errors?.length||x.chooserOnly===false||x.restored===false))process.exitCode=1;console.log(JSON.stringify({checks},null,2))})().catch(e=>{console.error(e);process.exitCode=1});

