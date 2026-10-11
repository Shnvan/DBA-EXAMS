const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/Ivan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const input=process.argv[2]||'C:/Projects/DBA MIDTERM/DBMS_midterm_practice.html';
const label=process.argv[3]||'final';
const dir=path.resolve(__dirname,'..','verification-artifacts',label);fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const checks=[];
 for(const width of [1440,380])for(const themeName of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto('file:///'+input.replace(/\\/g,'/'));await page.evaluate(t=>theme(t),themeName);
  const capture=async name=>{await page.screenshot({path:path.join(dir,`${width}-${themeName}-${name}.png`),fullPage:true});checks.push({width,theme:themeName,view:name,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,focusColor:getComputedStyle(document.documentElement).getPropertyValue('--focus').trim()}))})};
  await capture('home');await page.evaluate(()=>go('exam'));await capture('exam-before');
  await page.evaluate(()=>{ID.forEach((q,i)=>document.querySelector('#i'+i).value=q[1].split('|')[0]);TF.forEach((q,i)=>document.querySelector(`input[name=t${i}][value="${q[1]}"]`).checked=true);MC.forEach((q,i)=>document.querySelector(`input[name=m${i}][value="${q[2]}"]`).checked=true);grade()});
  await capture('exam-after');checks.push({width,theme:themeName,score:await page.locator('#res h3').innerText()});
  for(const part of ['Part I.','Part II.','Part III.']){await page.getByRole('heading',{name:new RegExp(part.replace('.','\\.'))}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,`${width}-${themeName}-exam-${part.slice(5,8).replace(/\W/g,'')}.png`)})}
  await page.evaluate(()=>{go('lab');cur=null;lab()});await capture('lab-chooser');
  const count=await page.evaluate(()=>CFG.length+2);
  for(let i=0;i<count;i++){
   await page.evaluate(i=>{pick(i);document.querySelector('details').open=true;document.querySelector('#sql').value=terminatedSolution(TS(i)[0][2]);runQ();show()},i);
   await capture(`lab-${i}`);
   await page.evaluate(()=>{document.querySelector('#sql').value='SELECT nonexistent FROM employees;';runQ();chk()});
   await page.locator('#out').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,`${width}-${themeName}-lab-${i}-error.png`)});
  }
  await page.evaluate(()=>go('home'));await page.keyboard.press('Tab');await page.screenshot({path:path.join(dir,`${width}-${themeName}-focus.png`)});
  checks.push({width,theme:themeName,pageErrors:errors});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(dir,'browser-checks.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify({dir,captures:checks.filter(x=>x.view).length,overflows:checks.filter(x=>x.overflow),errors:checks.filter(x=>x.pageErrors?.length),scores:checks.filter(x=>x.score)},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
