const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync,execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),url='https://dbmsmidtermexam-3-4.vercel.app/',dir=path.join(root,'verification-artifacts','live-wording-home');fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const response=await fetch(url),html=Buffer.from(await response.arrayBuffer()),hash=crypto.createHash('sha256').update(html).digest('hex'),expected=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'DBMS_midterm_practice.html'))).digest('hex');
 if(response.status!==200||hash!==expected)throw Error('Production does not serve the verified HTML');
 const suites=[];
 for(const [name,file]of [['exam','single-question-browser.cjs'],['home','home-startup-browser.cjs'],['wording','pdf-wording-browser.cjs'],['lab','live-lab-browser.cjs']]){
  const run=spawnSync(process.execPath,[path.join(__dirname,file),url,'live-wording-home/'+name],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,timeout:180000});fs.writeFileSync(path.join(dir,name+'.log'),run.stdout+'\n'+run.stderr);
  if(run.status!==0)throw Error(name+' live check failed: '+run.stderr);
  let result;for(let i=run.stdout.indexOf('{');i>=0;i=run.stdout.indexOf('{',i+1)){try{result=JSON.parse(run.stdout.slice(i));break}catch{}}
  if(!result?.passed||result.checks?.some(c=>!c.passed))throw Error(name+' missing successful results');
  suites.push({name,passed:result.passed});console.log(name+': '+result.passed+' live checks passed');
 }
 const result={url,commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),htmlSHA256:hash,suites,passed:suites.reduce((n,s)=>n+s.passed,0),executedAt:new Date().toISOString()};
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exit(1)});
