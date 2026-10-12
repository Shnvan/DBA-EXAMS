const assert=require('assert/strict'),fs=require('fs'),{dom,legacy}=require('./exam-test-helpers.cjs'),{X}=require('./load.cjs')(),checks=[];
function test(name,fn){fn();checks.push(name)}
for(const mode of ['id','mc']){
 test(mode+' older submitted blank answers survive corrected questions reopening',()=>{
  const d=dom(),w=d.window;w.go('lab');w.pick(0);w.document.querySelector('#sql').value='CREATE TABLE migration_retained(id INT);';w.runQ();w.go('exam');w.chooseExamMode(mode);
  const s=legacy(w,[4]),original=s.exam.orders[mode][4];for(const i of original)delete s.exam.answers[mode][i];s.exam.scores[mode][4]=0;s.exam.reviews[mode][4]=original.map(sourceIndex=>({sourceIndex,correct:false}));
  const r=dom(JSON.stringify(s)),rw=r.window,state=rw.examApi.get();assert.equal(state.mode,mode);assert.equal(state.submitted[mode][4],false);assert(rw.examApi.validExam(state));assert(state.legacyBlank[mode]);
  const reopened=mode==='id'?[86,213]:[119,246];for(const i of reopened){assert.equal(state.checked[mode][i],undefined);assert.equal(state.legacyBlank[mode][i],undefined)}
  for(const i of state.orders[mode][4])if(!reopened.includes(i)){assert.equal(state.checked[mode][i],true);assert.equal(state.legacyBlank[mode][i],true)}
  const saved=rw.examApi.progressSnapshot();assert.deepEqual(JSON.parse(JSON.stringify(saved.taskSessions)),s.taskSessions);assert.deepEqual(JSON.parse(JSON.stringify(saved.draft)),s.draft);
  rw.go('exam');rw.openExamPart(4);const review=state.orders[mode][4].find(i=>state.checked[mode][i]);state.positions[mode][4]=state.orders[mode][4].indexOf(review);rw.exam();assert(rw.document.querySelector('#exam-feedback').textContent.includes('No answer'));assert(rw.document.querySelector('.q input').disabled);
  rw.saveProgressNow();const reload=dom(rw.localStorage.getItem('dbms-progress-v1'));assert.equal(reload.window.examApi.get().legacyBlank[mode][review],true);assert(reload.window.examApi.validExam(reload.window.examApi.get()));
  reload.window.go('exam');reload.window.startOverExam();assert.equal(Object.keys(reload.window.examApi.get().legacyBlank[mode]).length,0);
  reload.window.close();rw.close();w.close();
 });
}
test('Old typo rules validate against the old question bank rather than current vocabulary',()=>{
 const q=['A function description','data definition',18],old=[q,['Distinct prior term','data definitiom',18]];
 assert.equal(X.identificationMatches('data definitiom',q,old),false);assert.equal(X.identificationMatches('data definitiom',q),true);
});
test('Malformed legacy blank markers cannot validate an answered or unchecked question',()=>{
 const d=dom(),w=d.window;w.go('exam');w.chooseExamMode('id');const state=w.examApi.get();state.legacyBlank.id[0]=true;assert.equal(w.examApi.validExam(state),false);state.checked.id[0]=true;state.answers.id[0]='Database Management System';assert.equal(w.examApi.validExam(state),false);w.close();
});
fs.mkdirSync('verification-artifacts/home-startup',{recursive:true});fs.writeFileSync('verification-artifacts/home-startup/migration-edge.json',JSON.stringify({passed:checks.length,checks},null,2));console.log(JSON.stringify({passed:checks.length}));
