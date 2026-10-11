const assert=require('assert/strict');
const {chromium}=require('C:/Users/Ivan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const checks=[];
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  for(const width of [1440,380]){
    const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
    const check=(name,ok)=>{assert(ok,`${width}: ${name}`);checks.push({width,name})};
    await page.goto('file:///C:/Projects/DBA%20MIDTERM/DBMS_midterm_practice.html');
    await page.getByRole('button',{name:'Exam',exact:true}).click();
    const initial=await page.evaluate(()=>({id:examState.orders.id.slice(),tf:examState.orders.tf.slice(),mc:examState.orders.mc.slice()}));
    await page.evaluate(()=>{Math.random=()=>0;});
    await page.getByRole('button',{name:'Shuffle questions',exact:true}).click();
    const shuffled=await page.evaluate(()=>({id:examState.orders.id.slice(),tf:examState.orders.tf.slice(),mc:examState.orders.mc.slice(),answers:examState.answers}));
    check('shuffle changes order',JSON.stringify(initial.id)!==JSON.stringify(shuffled.id));
    check('shuffle preserves coverage',new Set(shuffled.id).size===89&&new Set(shuffled.tf).size===67&&new Set(shuffled.mc).size===60);
    await page.locator('#i0').fill('DBMS');
    await page.getByRole('button',{name:'SQL lab',exact:true}).click();
    await page.locator('.pick button').first().click();
    await page.locator('#sql').fill('SELECT 42');
    await page.reload();
    check('reload restores SQL screen',await page.locator('#sql').inputValue()==='SELECT 42');
    await page.getByRole('button',{name:'Exam',exact:true}).click();
    check('reload restores exam order',await page.evaluate(expected=>JSON.stringify(examState.orders.id)===JSON.stringify(expected),shuffled.id));
    check('reload restores exam answer',await page.locator('#i0').inputValue()==='DBMS');
    await context.close();
  }
  await browser.close();console.log(JSON.stringify({passed:checks.length,checks},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
