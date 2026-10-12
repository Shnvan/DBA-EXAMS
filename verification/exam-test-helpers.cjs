const fs=require('fs'),path=require('path'),{JSDOM}=require('../.cache/test-runtime/node_modules/jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','DBMS_midterm_practice.html'),'utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function dom(raw,extra=''){const d=new JSDOM(html,{runScripts:'outside-only',url:'https://dbms.test/'}),w=d.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.confirm=()=>true;if(raw)w.localStorage.setItem('dbms-progress-v1',raw);w.eval(source+';window.examApi={ID,MC,EXAM_RETIRED,examTotal,examIndices,get:()=>examState,validExam,currentExamQuestion,examPartStats,progressSnapshot,migrateSnapshot};'+extra);return d}
function answer(w,correct=true){const c=w.examApi.currentExamQuestion();if(c.mode==='id')w.document.querySelector('#i'+c.sourceIndex).value=correct?c.question[1].split('|')[0]:'not a valid concept';else w.document.querySelector(`input[name=m${c.sourceIndex}][value="${correct?c.question[2]:(c.question[2]+1)%4}"]`).checked=true;w.examInput();}
function complete(w,module,variant='perfect'){w.openExamPart(module);const c=w.examApi.currentExamQuestion();for(let n=0;n<c.list.length;n++){answer(w,variant==='perfect'||variant==='mixed'&&n%2===0);w.checkExamAnswer();if(n<c.list.length-1)w.nextExamQuestion()}}
function legacy(w,completed=[]){
 const oldHtml=require('./legacy-exam-fixture.cjs')(),oldSource=oldHtml.match(/<script>([\s\S]*?)<\/script>/)[1],d=new JSDOM(oldHtml,{runScripts:'outside-only',url:'https://legacy.test/'}),ow=d.window;
 ow.scrollTo=()=>{};ow.HTMLElement.prototype.scrollIntoView=function(){};ow.confirm=()=>true;ow.eval(oldSource+';window.legacyApi={progressSnapshot,ID,MC,get:()=>examState};');
 const s=JSON.parse(JSON.stringify(w.examApi.progressSnapshot())),old=JSON.parse(JSON.stringify(ow.legacyApi.progressSnapshot()));s.content='descriptive-lab-contracts-v5';s.catalog=old.catalog;s.exam=old.exam;s.exam.mode=w.examApi.get().mode;s.exam.currentModule=w.examApi.get().currentModule;
 for(const mode of ['id','mc']){
  const source=w.examApi.get(),globalOrder=source.orders[mode].flat();s.exam.answers[mode]=JSON.parse(JSON.stringify(source.answers[mode]));
  for(let m=0;m<5;m++){const expected=old.exam.orders[mode][m];s.exam.orders[mode][m]=[...globalOrder.filter(i=>expected.includes(i)),...expected.filter(i=>!globalOrder.includes(i))]}
 }
 delete s.exam.checked;delete s.exam.positions;delete s.exam.continuationDismissed;
 for(const m of completed){const mode=s.exam.mode,list=s.exam.orders[mode][m],bank=mode==='id'?ow.legacyApi.ID:ow.legacyApi.MC;for(const i of list)s.exam.answers[mode][i]=mode==='id'?bank[i][1].split('|')[0]:bank[i][2];s.exam.submitted[mode][m]=true;s.exam.scores[mode][m]=list.length;s.exam.reviews[mode][m]=list.map(sourceIndex=>({sourceIndex,correct:true}))}
 ow.close();return s;
}
module.exports={dom,answer,complete,legacy};
