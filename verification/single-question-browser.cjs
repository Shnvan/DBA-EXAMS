const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('C:/Users/Ivan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const input=process.argv[2]||path.resolve(__dirname,'..','DBMS_midterm_practice.html'),url=/^https?:/.test(input)?input:'file:///'+input.replace(/\\/g,'/'),dir=path.resolve(__dirname,'..','verification-artifacts',process.argv[3]||'single-question-browser');fs.mkdirSync(dir,{recursive:true});
async function finishPart(page,module){await page.evaluate(m=>{const save=saveProgressNow;saveProgressNow=()=>{};try{openExamPart(m);const c=currentExamQuestion();while(true){const q=currentExamQuestion();if(!q.checked){if(q.mode==='id')document.getElementById('i'+q.sourceIndex).value=q.question[1].split('|')[0];else document.querySelector(`input[name=m${q.sourceIndex}][value="${q.question[2]}"]`).checked=true;examInput();checkExamAnswer()}if(q.position===q.list.length-1)break;nextExamQuestion()}}finally{saveProgressNow=save;saveProgressNow()}},module)}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),checks=[];
 try{for(const width of [1440,768,360,320,720])for(const themeName of ['light','dark'])for(const mode of ['id','mc']){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  const check=(name,ok)=>{checks.push({width,theme:themeName,mode,name,passed:!!ok});assert.ok(ok,`${width}/${themeName}/${mode}: ${name}`)};
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());await page.goto(url);await page.evaluate(t=>theme(t),themeName);
  check('home exam card describes immediate question feedback',/Check each question for immediate answer feedback/.test(await page.locator('#home').innerText())&&!/Submit parts independently/.test(await page.locator('#home').innerText()));
  await page.getByRole('button',{name:'Exam',exact:true}).click();await page.getByRole('button',{name:mode==='id'?'Identification':'Multiple Choice',exact:true}).click();
  check('exactly one question and one module rendered',await page.locator('.q').count()===1&&await page.locator('.exam-part').count()===1);
  check('no hints, submit control, or answer preview',await page.locator('#exam-feedback').innerText()===''&&!/\bHint\b|Submit part/.test(await page.locator('#exam').innerText()));
  check('blank check and unchecked Next disabled',await page.locator('#exam-check').isDisabled()&&await page.locator('#exam-next').isDisabled());
  check('first Previous disabled',await page.locator('#exam-previous').isDisabled());
  check('five part selectors available',await page.locator('.exam-parts-nav button').count()===5);
  const firstAnswer=await page.evaluate(()=>{const c=currentExamQuestion();return c.mode==='id'?c.question[1].split('|')[0]:c.question[2]});
  if(mode==='id'){await page.locator('.q input').fill('DBMS');await page.locator('.q input').press('Enter');check('Enter rejects acronym and shows full expected term',await page.locator('#exam-feedback .no').count()===1&&(await page.locator('#exam-feedback').innerText()).includes('DATABASE MANAGEMENT SYSTEM'))}
  else{await page.locator(`.q input[value="${firstAnswer}"]`).check();check('selection enables check without revealing answer',await page.locator('#exam-check').isEnabled()&&await page.locator('#exam-feedback').innerText()==='');await page.locator('#exam-check').click()}
  check('checked answer locks every answer control',await page.locator('.q input:enabled').count()===0&&await page.locator('#exam-check').isDisabled());
  check('feedback includes learner answer and PDF page',/Your answer:/.test(await page.locator('#exam-feedback').innerText())&&/Correct answer:/.test(await page.locator('#exam-feedback').innerText())&&/Module PDF, page/.test(await page.locator('#exam-feedback').innerText()));
  check('checking keeps the question and focuses feedback',await page.evaluate(()=>currentExamQuestion().position===0&&document.activeElement.id==='exam-feedback'));
  const stats=await page.evaluate(()=>examPartStats(examState.mode,0));check('live counters distinguish checked and correct answers',stats.checked===1&&stats.correct===(mode==='id'?0:1)&&await page.locator('.exam-progress').getAttribute('value')==='1');
  await page.locator('#exam-next').click();check('Next opens only the next question with no feedback',await page.evaluate(()=>currentExamQuestion().position===1)&&await page.locator('#exam-feedback').innerText()===''&&await page.locator('.q').count()===1);
  check('navigation focuses the new question',await page.evaluate(()=>document.activeElement.id==='exam-question-title'));
  if(mode==='id')await page.locator('.q input').fill('unfinished draft');else await page.locator('.q input').nth(0).check();
  await page.getByRole('button',{name:'Part 2',exact:true}).click();check('another part starts at its own first question',await page.evaluate(()=>currentExamQuestion().module===1&&currentExamQuestion().position===0));
  await page.getByRole('button',{name:'Part 1',exact:true}).click();check('returning restores per-part question and draft',await page.evaluate(()=>currentExamQuestion().position===1)&&(mode==='id'?await page.locator('.q input').inputValue()==='unfinished draft':await page.locator('.q input').nth(0).isChecked()));
  await page.reload();check('refresh restores question and editable draft',await page.evaluate(()=>currentExamQuestion().position===1)&&await page.locator('.q input:enabled').count()>0);
  await page.locator('#exam-previous').click();check('Previous restores locked review',await page.locator('#exam-feedback .ans').count()===1&&await page.locator('.q input:enabled').count()===0);
  const before=await page.evaluate(()=>JSON.stringify(examState));await page.getByRole('button',{name:'Shuffle questions',exact:true}).click();check('shuffle cancellation retains entire attempt',await page.evaluate(()=>JSON.stringify(examState))===before);
  await page.getByRole('button',{name:'Change exam type',exact:true}).click();check('mode cancellation retains entire attempt',await page.evaluate(()=>JSON.stringify(examState))===before);
  await finishPart(page,4);check('part finishes automatically and keeps last feedback visible',await page.locator('#exam-result-4').count()===1&&await page.locator('#exam-feedback .ok').count()===1&&await page.evaluate(()=>examState.currentModule===4&&currentExamQuestion().position===currentExamQuestion().list.length-1));
  check('final Next disabled and explicit continue offered',await page.locator('#exam-next').isDisabled()&&await page.getByRole('button',{name:'Continue to Part 1',exact:true}).count()===1);
  await page.getByRole('button',{name:'Stay on review',exact:true}).click();await page.reload();check('dismissed continuation and completed review restore',await page.locator('.continue-panel').count()===0&&await page.locator('#exam-result-4').count()===1&&await page.locator('.q input:enabled').count()===0);
  await finishPart(page,1);await page.getByRole('button',{name:'Continue to Part 3',exact:true}).click();check('continue opens next incomplete part without completing it',await page.evaluate(()=>examState.currentModule===2&&!examState.submitted[examState.mode][2])&&await page.locator('.q').count()===1);
  check('controls are aligned without overlap',await page.locator('.exam-actions,.exam-parts-nav,.exam-question-nav').evaluateAll(groups=>groups.every(g=>{const rs=[...g.querySelectorAll('button')].map(e=>e.getBoundingClientRect());return rs.every((a,i)=>rs.every((b,j)=>i===j||a.right<=b.left+.1||b.right<=a.left+.1||a.bottom<=b.top+.1||b.bottom<=a.top+.1))})));
  check('no horizontal page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  check('buttons meet touch target height',await page.locator('#exam button').evaluateAll(els=>els.every(e=>e.getBoundingClientRect().height>=43.9)));
  check('no script errors',errors.length===0);
  await page.screenshot({path:path.join(dir,`${width}-${themeName}-${mode}-question.png`),fullPage:true});
  const answer=await page.evaluate(()=>{const c=currentExamQuestion();return c.mode==='id'?c.question[1].split('|')[0]:c.question[2]});if(mode==='id')await page.locator('.q input').fill(answer);else await page.locator(`.q input[value="${answer}"]`).check();await page.locator('#exam-check').click();
  await page.screenshot({path:path.join(dir,`${width}-${themeName}-${mode}-feedback.png`),fullPage:true});await context.close();
 }}finally{await browser.close()}
 for(const mode of ['id','mc']){
  const profile=path.resolve(__dirname,'..','.cache','exam-reopening',Date.now()+'-'+mode),options={headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',viewport:{width:360,height:900}};
  let context=await chromium.launchPersistentContext(profile,options),page=await context.newPage();
  try{await page.goto(url);await page.getByRole('button',{name:'Exam',exact:true}).click();await page.getByRole('button',{name:mode==='id'?'Identification':'Multiple Choice',exact:true}).click();
   if(mode==='id')await page.locator('.q input').fill('Database Management System');else{const index=await page.evaluate(()=>currentExamQuestion().question[2]);await page.locator(`.q input[value="${index}"]`).check()}
   await page.locator('#exam-check').click();await page.locator('#exam-next').click();if(mode==='id')await page.locator('.q input').fill('draft for reopening');else await page.locator('.q input').nth(2).check();
   // A normal tab close dispatches beforeunload; abruptly killing a test context does not.
   await page.close({runBeforeUnload:true});
  }finally{await context.close()}
  context=await chromium.launchPersistentContext(profile,options);page=await context.newPage();
  try{await page.goto(url);const check=(name,ok)=>{checks.push({width:360,mode,name,passed:!!ok});assert.ok(ok,name)};
   check('browser reopening restores per-part position and draft',await page.evaluate(()=>currentExamQuestion().position===1)&&(mode==='id'?await page.locator('.q input').inputValue()==='draft for reopening':await page.locator('.q input').nth(2).isChecked()));
   await page.locator('#exam-previous').click();check('browser reopening retains locked first-attempt feedback',await page.locator('#exam-feedback .ok').count()===1&&await page.locator('.q input:enabled').count()===0);
  }finally{await context.close()}
 }
 const result={url,passed:checks.length,total:checks.length,checks,reflowNote:'720 CSS pixels models layout at 200% zoom on a 1440px display.'};fs.writeFileSync(path.join(dir,'browser-checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:checks.length,total:checks.length}));
})().catch(e=>{console.error(e);process.exitCode=1});
module.exports={finishPart};
