const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('C:/Users/Ivan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const input=process.argv[2]||path.resolve(__dirname,'..','DBMS_midterm_practice.html');
const dir=path.resolve(__dirname,'..','verification-artifacts','reliability-browser');fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),checks=[];
 try {for(const width of [1440,768,360,320,720])for(const themeName of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.goto('file:///'+input.replace(/\\/g,'/'));await page.evaluate(t=>theme(t),themeName);
  const check=(name,ok)=>{checks.push({width,theme:themeName,name,passed:!!ok});assert.ok(ok,`${width}/${themeName}: ${name}`)};
  const layout=async name=>{check(name+' no page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(dir,`${width}-${themeName}-${name}.png`)});};
  await layout('home');
  check('header controls do not overlap',await page.evaluate(()=>{const items=[...document.querySelectorAll('header button,header a')].filter(e=>e.getBoundingClientRect().width).map(e=>e.getBoundingClientRect());return items.every((a,i)=>items.every((b,j)=>i===j||Math.min(a.right,b.right)-Math.max(a.left,b.left)<=1||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<=1))}));
  await page.getByRole('button',{name:'Exam',exact:true}).click();
  for(const mode of ['Identification','Multiple Choice']){
   await page.getByRole('button',{name:mode,exact:true}).click();check(mode+' one part rendered',await page.locator('.exam-part').count()===1);
   const first=page.locator('.exam-part input').first();if(mode==='Identification')await first.fill('DBMS');else await first.check();
   await page.getByRole('button',{name:'Part 2',exact:true}).click();check(mode+' switches single part',await page.locator('#exam-part-1').count()===1&&await page.locator('.exam-part').count()===1);
   if(mode==='Identification')await page.locator('.exam-part input').first().fill('draft in another part');else await page.locator('.exam-part input').first().check();
   await page.getByRole('button',{name:'Part 1',exact:true}).click();
   check(mode+' answer retained across parts',mode==='Identification'?await page.locator('.exam-part input').first().inputValue()==='DBMS':await page.locator('.exam-part input').first().isChecked());
   await page.reload();check(mode+' answer retained after reload',mode==='Identification'?await page.locator('.exam-part input').first().inputValue()==='DBMS':await page.locator('.exam-part input').first().isChecked());
   await page.locator('#exam-check').click();check(mode+' checked controls locked',await page.locator('.exam-part input:enabled').count()===0);
   await layout(mode==='Identification'?'id-review':'mc-review');
   await page.evaluate(()=>{const save=saveProgressNow;saveProgressNow=()=>{};try{while(true){const c=currentExamQuestion();if(!c.checked){if(c.mode==='id')document.getElementById('i'+c.sourceIndex).value=c.question[1].split('|')[0];else document.querySelector(`input[name=m${c.sourceIndex}][value="${c.question[2]}"]`).checked=true;examInput();checkExamAnswer()}if(c.position===c.list.length-1)break;nextExamQuestion()}}finally{saveProgressNow=save;saveProgressNow()}});await page.getByRole('button',{name:'Stay on review',exact:true}).click();check(mode+' stay retains review',await page.locator('#exam-result-0').count()===1);
   await page.getByRole('button',{name:'Part 2',exact:true}).click();await page.evaluate(()=>{const save=saveProgressNow;saveProgressNow=()=>{};try{while(true){const c=currentExamQuestion();if(!c.checked){if(c.mode==='id')document.getElementById('i'+c.sourceIndex).value=c.question[1].split('|')[0];else document.querySelector(`input[name=m${c.sourceIndex}][value="${c.question[2]}"]`).checked=true;examInput();checkExamAnswer()}if(c.position===c.list.length-1)break;nextExamQuestion()}}finally{saveProgressNow=save;saveProgressNow()}});
   await page.getByRole('button',{name:'Continue to Part 3',exact:true}).click();check(mode+' inline continue opens next only',await page.locator('#exam-part-2').count()===1&&await page.locator('.exam-part').count()===1);
   await page.getByRole('button',{name:'Change exam type',exact:true}).click();
  }
  await page.getByRole('button',{name:'SQL lab',exact:true}).click();await page.locator('.level-pick .card').filter({hasText:'Easy'}).click();await page.locator('.track-pick .btn').first().click();
  await page.locator('#sql').fill('CREATE TABLE reliability_probe (id INT);');await page.getByRole('button',{name:'Run query',exact:true}).click();
  check('task mutation succeeded',await page.evaluate(()=>!!activeTables(live).reliability_probe));
  await page.locator('#tl .tk').nth(1).click();check('next task database isolated',await page.evaluate(()=>!activeTables(live).reliability_probe));
  await page.locator('#sql').fill('SELECT 2;');await page.locator('#tl .tk').first().click();check('task database and draft restored',await page.evaluate(()=>!!activeTables(live).reliability_probe)&&await page.locator('#sql').inputValue()==='CREATE TABLE reliability_probe (id INT);');
  page.removeAllListeners('dialog');page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Reset task database',exact:true}).click();check('reset cancellation retains changes',await page.evaluate(()=>!!activeTables(live).reliability_probe));page.on('dialog',d=>d.accept());
  const reference=await page.evaluate(()=>terminatedSolution(TS(cur)[ti][2]));await page.locator('#sql').fill(reference);await page.getByRole('button',{name:'Check answer',exact:true}).click();check('reference checks correctly',await page.locator('#fb .ok').count()===1);check('check leaves mutated session untouched',await page.evaluate(()=>!!activeTables(live).reliability_probe));
  await page.locator('#sql').fill('SELECT 999;');check('editing clears stale success',await page.locator('#fb .ok').count()===0);
  await page.locator('#sql').focus();await page.keyboard.press('Tab');check('keyboard reaches run action',await page.evaluate(()=>document.activeElement.textContent==='Run query'));
  await layout('sql-lab');await page.reload();check('SQL mutation restored after reload',await page.evaluate(()=>!!activeTables(live).reliability_probe));
  await page.locator('.level-pick .card').filter({hasText:'Advanced'}).click();await page.locator('.legacy-build summary').click();await page.getByRole('button',{name:'Open previous challenges',exact:true}).click();
  const buildReference=await page.evaluate(()=>BUILD_TASKS[0].sql);await page.locator('#build-sql').fill(buildReference);await page.getByRole('button',{name:'Run query',exact:true}).click();await page.getByRole('button',{name:'Check answer',exact:true}).click();check('guided schema checked',await page.locator('#build-feedback .ok').count()===1);
  await page.locator('#build-sql').fill('SELECT 999;');check('builder editing clears stale success',await page.locator('#build-feedback .ok').count()===0);await layout('guided-builder');
  await page.getByRole('button',{name:'Free practice',exact:true}).click();await page.locator('#build-sql').fill("CREATE TABLE safe_values (id INT, value VARCHAR(100)); INSERT INTO safe_values VALUES (1, '<img src=x onerror=alert(1)>'); SELECT * FROM safe_values;");await page.getByRole('button',{name:'Run query',exact:true}).click();check('HTML SQL value escaped',await page.locator('#build-output img').count()===0&&(await page.locator('#build-output').innerText()).includes('<img src=x onerror=alert(1)>'));await layout('free-practice');
  await page.getByRole('button',{name:'Guided challenges',exact:true}).click();check('guided DB isolated from free practice',await page.evaluate(()=>!!activeTables(buildState().session).departments&&!activeTables(buildState().session).safe_values));
  check('no browser script errors',errors.length===0);await context.close();
 }}finally{await browser.close();fs.writeFileSync(path.join(dir,'checks.json'),JSON.stringify(checks,null,2));}
 console.log(JSON.stringify({passed:checks.filter(x=>x.passed).length,total:checks.length,configurations:10,reflowNote:'720px viewport models the CSS layout available at 200% zoom on a 1440px viewport.'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
