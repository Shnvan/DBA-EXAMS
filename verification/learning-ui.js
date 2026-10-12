/* Three levels, explicit editor ownership, cumulative checkpoints, isolated assessment. */
function emptyCourseSession(){const s=newSession();s.databases=Object.create(null);s.current=null;s.transaction=null;s.savepoints=Object.create(null);return s}
function makeCourseState(){return{session:emptyCourseSession(),lesson:0,style:'walkthrough',drafts:{},done:[],entries:{},work:{},checked:{},outputs:{},feedback:{},preview:'',previewExpanded:false,finished:false,archives:[]}}
let labLevel=null;
const courseStates={intermediate:makeCourseState(),advanced:makeCourseState()};
const courseLessons=level=>SQL_CURRICULA[level];
const courseState=()=>courseStates[labLevel];
const courseLesson=()=>courseLessons(labLevel)[courseState().lesson];
function courseContent(q){return typeof courseTaskContent==='function'?courseTaskContent(q.id):q.task||{title:'Practice task',prompt:'Complete the requirements for this task.',blocks:[],hint:'Review the current tables and the task requirements.',explanation:''}}
/* The editor carries its owner: changing the selected level cannot capture its draft into another course. */
function rememberCourse(){
 const editor=$('#course-sql');if(!editor)return;
 const level=editor.dataset.courseLevel,id=editor.dataset.courseId,b=courseStates[level];
 if(!b||!courseLessons(level).some(q=>q.id===id))return;
 b.drafts[id]=editor.value;
 if(courseLessons(level)[b.lesson]?.id===id)b.work[id]=b.session;
 const preview=$('#course-preview-details');
 if(preview&&preview.dataset.courseLevel===level)b.previewExpanded=preview.open;
}
function chooseLabLevel(level){
 if(!['easy','intermediate','advanced'].includes(level))return;
 remember();rememberCourse();labLevel=level;
 if(level==='easy'&&(cur==null||cur>=CFG.length)){cur=0;ti=trackTasks[cur]||0}
 if(level==='easy')activateTask();
 lab();$('#level-heading')?.focus({preventScroll:true});saveProgressNow();
}
function renderLabLevels(){
 const descriptions={easy:['Easy','Prepared database','Practice with existing tables and sample rows. Each exercise has an independent database.'],intermediate:['Intermediate','Module practice','Build a database, then work through the module exercises.'],advanced:['Advanced','Complete database project','Complete the connected campus project and its challenges.']};
 return '<div class="level-pick'+(labLevel?' compact':'')+'" aria-label="SQL practice levels">'+Object.entries(descriptions).map(([id,[title,subtitle,text]])=>'<button class="card'+(labLevel===id?' on':'')+'" onclick="chooseLabLevel(\''+id+'\')" aria-pressed="'+(labLevel===id)+'"><b>'+title+'</b>'+(labLevel?'':'<span>'+subtitle+'</span><span class="mu sm">'+text+'</span>')+'</button>').join('')+'</div>';
}
function renderThreeLevelLab(){
 /* Rendering never captures a textarea: callers capture outgoing state before navigation. */
 $('#lab').innerHTML='<h2>SQL lab</h2><p class="mu'+(labLevel?' sm':'')+'">'+(labLevel?'Practice level':'Choose your starting point. Your progress is saved separately for each level.')+'</p>'+renderLabLevels()+'<div id="level-content"></div>'+(legacySession?'<details class="fb"><summary>Previous shared database</summary><p>Your earlier database is preserved.</p><button class="btn l" onclick="recoverLegacySession()">Open previous database in Free practice</button></details>':'');
 if(!labLevel)return;
 const content=$('#level-content');
 if(labLevel==='easy'){
  content.innerHTML='<h3 id="level-heading" tabindex="-1">Easy: prepared database</h3><p class="mu sm">Each task uses its own database. Checking your answer leaves your working database unchanged.</p><div class="track-pick">'+CFG.map((c,i)=>trackButton(c.t,i)).join('')+'</div><div id="ws"></div>';
  if(cur==null||cur>=CFG.length){cur=0;ti=trackTasks[cur]||0}activateTask();ws();return;
 }
 const advanced=labLevel==='advanced';
 content.innerHTML='<div class="row level-heading-row"><h3 id="level-heading" tabindex="-1">'+(advanced?'Advanced: complete database project':'Intermediate: module practice')+'</h3>'+(advanced?'<button class="btn l" onclick="openFreePractice()">Free practice</button>':'')+'</div>'+
 (!advanced?'<div class="row level-actions"><button class="btn l" onclick="openSetup()" aria-pressed="'+(cur==null||cur<CFG.length)+'">Database setup walkthrough</button>'+trackButton('Module queries',CFG.length)+trackButton('Module essentials',CFG.length+1)+'</div>':'<div class="row level-actions" aria-label="Learning style"><button class="btn l" data-course-style="walkthrough" onclick="setCourseStyle(\'walkthrough\')">Walkthrough</button><button class="btn l" data-course-style="challenge" onclick="setCourseStyle(\'challenge\')">Challenges</button></div>')+
 '<div id="course-workspace"></div><div id="ws"></div>'+(advanced?'<details class="legacy-build"><summary>Previous table-building challenges</summary><p class="mu sm">Your earlier database and completion history are preserved.</p><button class="btn l" onclick="openPreviousChallenges()">Open previous challenges</button></details>':'');
 if(!advanced&&cur>=CFG.length){activateTask();ws()}else renderCourse();
 updateCourseStyleControls();
}
function trackButton(title,i){return'<button class="btn l'+(cur===i?' on':'')+'" data-track="'+i+'" onclick="pick('+i+')" aria-pressed="'+(cur===i)+'">'+h(title)+' <span class="mu sm track-count">'+TS(i).filter((_,k)=>done.has(NM(i)+':'+k)).length+'/'+TS(i).length+'</span></button>'}
function refreshTrackCounts(){document.querySelectorAll('[data-track]').forEach(button=>{const i=Number(button.dataset.track),span=button.querySelector('.track-count');if(span&&Number.isInteger(i)&&i>=0&&i<CFG.length+2)span.textContent=TS(i).filter((_,k)=>done.has(NM(i)+':'+k)).length+'/'+TS(i).length})}
function openSetup(){remember();rememberCourse();cur=null;lab();$('#course-title')?.focus({preventScroll:true});saveProgressNow()}
function openFreePractice(){rememberCourse();buildMode='sandbox';go('builder');$('#build-sql')?.focus({preventScroll:true})}
function openPreviousChallenges(){rememberCourse();buildMode='guided';go('builder');$('#build-sql')?.focus({preventScroll:true})}
function updateCourseStyleControls(){
 if(!['intermediate','advanced'].includes(labLevel))return;
 document.querySelectorAll('[data-course-style]').forEach(el=>{const selected=el.dataset.courseStyle===courseState().style;el.classList.toggle('on',selected);el.setAttribute('aria-pressed',String(selected))});
}
function setCourseStyle(style){
 if(!['walkthrough','challenge'].includes(style)||!['intermediate','advanced'].includes(labLevel))return;
 rememberCourse();courseState().style=style;renderCourse();updateCourseStyleControls();
 document.querySelector('[data-course-style="'+style+'"]')?.focus({preventScroll:true});saveProgressNow();
}
function ensureCourseEntry(b,q){if(!b.entries[q.id])b.entries[q.id]=plain(b.session)}
function courseUnlocked(index){const list=courseLessons(labLevel);return Number.isInteger(index)&&index>=0&&index<list.length&&(index===0||!!courseState().entries[list[index].id])}
function openCourseLesson(index){
 const list=courseLessons(labLevel);if(!courseUnlocked(index))return;
 rememberCourse();const b=courseState();b.lesson=index;b.finished=false;const q=list[index];
 b.session=restoreSession(b.work[q.id]||b.entries[q.id]||emptyCourseSession());ensureCourseEntry(b,q);
 renderCourse();$('#course-title')?.focus({preventScroll:true});saveProgressNow();
}
function courseListHtml(){
 const b=courseState(),list=courseLessons(labLevel);
 return '<p id="course-prerequisite-help" class="mu sm">Complete the current task and continue to unlock the next task.</p>'+list.map((q,i)=>{
  const available=courseUnlocked(i),task=courseContent(q);
  return '<button class="tk'+(i===b.lesson?' on':'')+'" onclick="openCourseLesson('+i+')"'+(available?'':' disabled')+(i===b.lesson?' aria-current="step"':'')+'>'+(b.done.includes(q.id)?'<span aria-label="Completed">&#10003;</span> ':'' )+(i+1)+'. '+h(task.title)+(available?'':'<span class="sr-only"> (locked)</span>')+'</button>';
 }).join('')+'<p class="mu sm course-progress">'+b.done.length+' of '+list.length+' completed</p>';
}
function courseArchiveHtml(){
 const b=courseState();if(!b.archives?.length)return '';
 return '<details class="course-archives"><summary>Previous course progress ('+b.archives.length+')</summary><p class="mu sm">Earlier branches are saved here. Restoring one also saves your current branch for recovery.</p>'+b.archives.map((archive,index)=>'<div class="course-archive"><p><b>'+h(archive.label)+'</b><br><span class="mu sm">'+h(archive.createdAt)+'</span></p><button class="btn l" onclick="restoreCourseArchive('+index+')">Restore branch</button></div>').join('')+'</details>';
}
function archiveCurrentCourse(label){
 const b=courseState(),createdAt=new Date().toISOString(),id='branch-'+Date.now()+'-'+(b.archives.length+1);
 return{id,label,createdAt,snapshot:courseSnapshot(b,false)};
}
function restoreCourseArchive(index){
 const b=courseState();if(!Number.isInteger(index)||index<0||index>=b.archives.length)return;
 rememberCourse();const branch=b.archives[index];
 if(!confirm('Restore this previous course branch? Your current branch will be saved for recovery before it is replaced.'))return;
 const archives=b.archives.slice(),current=archiveCurrentCourse('Before restoring '+branch.label),level=labLevel;
 restoreCourse(level,branch.snapshot);courseState().archives=[...archives,current];
 renderCourse();$('#course-title')?.focus({preventScroll:true});$('#course-summary')?.focus({preventScroll:true});saveProgressNow();
}
function courseFreshCheck(b,q){const checked=b.checked[q.id];return checked&&checked.sql===(b.drafts[q.id]||'')?checked:null}
function courseNavigationHtml(){
 const b=courseState(),q=courseLesson(),checked=courseFreshCheck(b,q),last=b.lesson===courseLessons(labLevel).length-1;
 const unapplied=checked&&q.kind!=='read'&&!q.sandbox&&JSON.stringify(canonicalSession(b.session))!==JSON.stringify(canonicalSession(checked.session));
 return '<button class="btn l" onclick="openCourseLesson('+(b.lesson-1)+')"'+(b.lesson?'':' disabled')+'>Back</button><button class="btn a" onclick="continueCourse()"'+(checked?'':' disabled')+'>'+((unapplied?'Apply checked result and ':'')+(last?'finish':'continue')).replace(/^./,c=>c.toUpperCase())+'</button>'+(!checked?'<p class="mu sm course-nav-help">Check your answer successfully before continuing.</p>':'');
}
function courseFeedbackHtml(b,q){
 const feedback=b.feedback[q.id];if(!feedback||feedback.sql!==undefined&&feedback.sql!==(b.drafts[q.id]||''))return'';
 if(feedback.solution)return'<div class="fb"><p>One possible solution. Use it to review your answer.</p><pre>'+h(courseReferenceSql(q,b.entries[q.id])||'')+'</pre></div>';
 return'<div class="fb '+(feedback.ok?'ok':'no')+'">'+h(feedback.message)+'</div>';
}
function courseOutputHtml(b,q){
 const out=b.outputs[q.id];if(!out)return'';
 const stale=out.sql!==(b.drafts[q.id]||'')||out.stateSignature&&out.stateSignature!==JSON.stringify(canonicalSession(b.session));
 return(stale?'<p class="mu sm">Previous run output. Run again to update it for your current answer and database.</p>':'')+outputHtml(out);
}
function renderCourse(){
 const host=$('#course-workspace');if(!host)return;
 const b=courseState(),list=courseLessons(labLevel),q=list[b.lesson],task=courseContent(q);
 ensureCourseEntry(b,q);
 if(b.finished){
  const all=b.done.length===list.length;
  host.innerHTML='<div class="course-summary pane" id="course-summary" tabindex="-1"><h3>'+(all?'Course complete':'You reached the end of this course')+'</h3><p>'+b.done.length+' of '+list.length+' tasks are complete. '+(all?'You can review your work or choose another level.':'Revisit unfinished tasks to complete the course.')+'</p><div class="row"><button class="btn l" onclick="reviewCourse()">Review tasks</button>'+(labLevel==='advanced'?'<button class="btn a" onclick="openFreePractice()">Free practice</button>':'')+'</div></div>'+courseArchiveHtml();return;
 }
 const feedback=b.feedback[q.id],tables=activeTables(b.session),names=Object.keys(tables);
 if(!names.includes(b.preview))b.preview=names[0]||'';const table=tables[b.preview];
 const notes=task.explanation&&b.style!=='challenge'?'<details class="course-notes"><summary>Task notes</summary><p>'+h(task.explanation)+'</p></details>':'';
 const body=typeof labContentHtml==='function'?labContentHtml(task):'<p>'+h(task.prompt)+'</p>';
 const preview='<details id="course-preview-details" data-course-level="'+labLevel+'"'+(b.previewExpanded?' open':'')+'><summary>Database preview'+(table?' ('+Math.min(8,table.rows.length)+' of '+table.rows.length+' rows)':'')+'</summary>'+(names.length?'<label for="course-preview">Table</label><select id="course-preview" onchange="coursePreview(this.value)">'+names.map(n=>'<option value="'+h(n)+'"'+(n===b.preview?' selected':'')+'>'+h(n)+'</option>').join('')+'</select>'+grid({cols:table.cols.map(c=>c.n),rows:table.rows.slice(0,8).map(r=>table.cols.map(c=>resultValue(r[K(c)])))}):'<p class="mu sm">'+(b.session.current?'No tables yet.':'Create and select the database described in this task.')+'</p>')+'</details>';
 const editor=q.kind==='read'?'<button class="btn a" onclick="completeReading()">Mark reviewed</button>':preview+'<label for="course-sql" class="sql-label sm">Your SQL answer</label><textarea id="course-sql" data-course-level="'+labLevel+'" data-course-id="'+h(q.id)+'" spellcheck="false" aria-describedby="course-help" placeholder="Write your answer here." oninput="courseInput()" onkeydown="if((event.ctrlKey||event.metaKey)&&event.key===\'Enter\'){event.preventDefault();runCourse()}">'+h(b.drafts[q.id]||'')+'</textarea><p id="course-help" class="mu sm">End each statement with a semicolon. Ctrl+Enter or Command+Enter runs your answer. Checking your answer leaves the working database unchanged.</p><div class="row lab-actions"><button class="btn" onclick="runCourse()">Run query</button><button class="btn a" onclick="checkCourse()">Check answer</button><button class="btn l" onclick="showCourseSolution()" aria-controls="course-feedback" aria-expanded="'+!!feedback?.solution+'">Show solution</button><button class="btn l" onclick="resetCourseLesson()">Reset lesson database</button></div>';
 host.innerHTML='<div class="lab course-layout"><nav class="tl" id="course-list" aria-label="Course tasks" aria-describedby="course-prerequisite-help">'+courseListHtml()+'</nav><div class="pane"><p class="mu sm course-reference">'+(q.pages?.length?'PDF pages '+q.pages.join(', '):'Practical extension')+(q.extension?' · Practical extension':'')+(q.sandbox?' · Practice copy':'')+'</p><h3 id="course-title" tabindex="-1">'+h(task.title)+'</h3><div class="course-task">'+body+'</div>'+notes+(task.hint?'<details class="course-hint"><summary>Hint</summary><p>'+h(task.hint)+'</p></details>':'')+(q.sandbox?'<p class="mu sm">This task uses a practice copy. Continuing keeps the main project unchanged.</p>':'')+editor+'<div id="course-feedback" tabindex="-1" role="status" aria-live="polite">'+courseFeedbackHtml(b,q)+'</div><div id="course-output" aria-live="polite">'+courseOutputHtml(b,q)+'</div><div class="row course-navigation">'+courseNavigationHtml()+'</div></div></div>'+courseArchiveHtml();
}
function reviewCourse(){courseState().finished=false;renderCourse();$('#course-title')?.focus({preventScroll:true});saveProgressNow()}
function coursePreview(name){rememberCourse();courseState().preview=name;renderCourse();$('#course-preview')?.focus({preventScroll:true});saveProgressNow()}
function invalidateCourseAnswer(b,q){delete b.checked[q.id];delete b.feedback[q.id];b.done=b.done.filter(id=>id!==q.id);b.finished=false}
function courseInput(){
 rememberCourse();const b=courseState(),q=courseLesson();invalidateCourseAnswer(b,q);
 $('#course-feedback').innerHTML='';$('#course-output').innerHTML=courseOutputHtml(b,q);
 $('#course-list').innerHTML=courseListHtml();document.querySelector('.course-navigation').innerHTML=courseNavigationHtml();saveProgressSoon();
}
function runCourse(){
 rememberCourse();const b=courseState(),q=courseLesson(),sql=b.drafts[q.id]||'',pending=submissionProblem(sql);
 invalidateCourseAnswer(b,q);
 if(pending)b.outputs[q.id]={kind:'message',message:pending,sql};
 else{let results=[],error=null;try{results=exec(sql,b.session)}catch(e){results=e.R||[];error=errorRecord(e)}b.outputs[q.id]={kind:'results',results:plain(results),error,sql,stateSignature:JSON.stringify(canonicalSession(b.session))};b.work[q.id]=b.session}
 renderCourse();$('#course-sql')?.focus({preventScroll:true});saveProgressNow();
}
function courseAttempt(sql,start){const session=restoreSession(start);session.clock='2026-10-12T00:00:00.000Z';let results=[],error=null;try{results=exec(sql,session)}catch(e){results=e.R||[];error=errorRecord(e)}return{session,results:plain(results),error}}
function courseTechniqueProblems(sql,q){
 try{
  const actual=gradingStatements(sql),reference=gradingStatements(q.sql),contract=courseContent(q).requirements;
  const errors=typeof taskTechniqueProblems==='function'?taskTechniqueProblems(actual.map(x=>x.ast),contract):[];
  if(reference.some(x=>x.part.vertical)&&!actual.some(x=>x.part.vertical))errors.push('Use the vertical result layout described in this task.');
  return errors;
 }catch(e){return []}
}
function courseResultsMatch(a,b,q,actualSql){
 let statements=[];try{statements=gradingStatements(q.sql)}catch(e){}
 const mixed=statements.some(x=>!['query','describe','showTables','showDatabases','showIndex','showTableStatus','showGrants'].includes(x.ast.kind)),indices=b.map((r,i)=>r.rows?i:-1).filter(i=>i>=0);
 if(mixed){a=a.filter(r=>r.rows);b=b.filter(r=>r.rows)}
 if(a.length!==b.length)return false;
 let actualQueries=null;try{if(actualSql)actualQueries=gradingStatements(actualSql).filter(x=>x.ast.kind==='query').map(x=>x.ast.query)}catch(e){}let queryIndex=0;
 const numericType=t=>/^(?:bigint|int|smallint|tinyint|mediumint|decimal|float|double|year)/i.test(t||'');
 const numericCell=value=>{if(value==null)return null;const {n,s}=dec(value);return decimalText(n,s).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'')};
 return b.every((expected,index)=>{
  let actual=a[index];const statement=statements[mixed?indices[index]:index],query=statement?.ast?.query;
  if(!!actual.rows!==!!expected.rows)return false;
  if(!expected.rows)return(actual.affectedRows||0)===(expected.affectedRows||0)&&(actual.msg==='Database changed')===(expected.msg==='Database changed');
  if(actual.cols.length!==expected.cols.length)return false;
  const contract=statements.length===1&&query?courseContent(q)?.requirements?.output:null,items=query?.items||[];
  const star=items.some(item=>Object.hasOwn(item,'star')),actualQuery=query?actualQueries?.[queryIndex++]:null;
  if(star&&items.length===1&&(!actualQueries||actualQuery?.items.length===1&&Object.hasOwn(actualQuery.items[0],'star'))&&new Set(expected.cols).size===expected.cols.length&&new Set(actual.cols.map(c=>c.toLowerCase())).size===expected.cols.length){const mapping=expected.cols.map(c=>actual.cols.findIndex(n=>n.toLowerCase()===c.toLowerCase()));if(mapping.every(i=>i>=0))actual={...actual,cols:expected.cols,rows:actual.rows.map(row=>mapping.map(i=>row[i])),types:actual.types?mapping.map(i=>actual.types[i]):actual.types}}
  for(let column=0;column<expected.cols.length;column++){
   const rule=!star?(contract?.find(r=>r.position===column)||{aliasRequired:!!items[column]?.alias,expression:items[column]?.expr}):{expression:{kind:'star'}};
   if(rule?.aliasRequired){if(actual.cols[column]!==expected.cols[column])return false}
   else if(!rule?.expression||['column','star'].includes(rule.expression.kind)){if(String(actual.cols[column]).toLowerCase()!==String(expected.cols[column]).toLowerCase())return false}
  }
  const cells=rows=>rows.map(row=>row.map((value,column)=>numericType(expected.types?.[column])&&numericType(actual.types?.[column])?numericCell(value):value));
  let x=cells(actual.rows),y=cells(expected.rows);
  const ordered=!!(query?.order?.length||statement?.ast?.order?.length);
  if(!ordered){const sort=rows=>rows.sort((u,v)=>JSON.stringify(u).localeCompare(JSON.stringify(v)));x=sort(x);y=sort(y)}
  return JSON.stringify(x)===JSON.stringify(y)&&!!actual.vertical===!!expected.vertical;
 });
}
function assessCourse(sql,q,start){
 const pending=submissionProblem(sql);if(pending||!sql.trim())return{ok:false,message:pending||'Write SQL before checking.'};
 const candidate=courseAttempt(sql,start),reference=courseAttempt(courseReferenceSql(q,start),start),techniques=courseTechniqueProblems(sql,q);let ok;
 if(q.kind==='error')ok=!!candidate.error&&candidate.error.code===(q.errorCode||reference.error?.code)&&JSON.stringify(canonicalSession(candidate.session))===JSON.stringify(canonicalSession(reference.session))&&(typeof courseErrorMatches!=='function'||courseErrorMatches(sql,q,start));
 else ok=!candidate.error&&!reference.error&&courseResultsMatch(candidate.results,reference.results,q,sql)&&(typeof courseStateMatches==='function'?courseStateMatches(candidate.session,reference.session,q):JSON.stringify(canonicalSession(candidate.session))===JSON.stringify(canonicalSession(reference.session)))&&(typeof courseQueryMatches!=='function'||courseQueryMatches(sql,q,start));
 const warnings=rs=>rs.flatMap(r=>(r.warnings||[]).map(w=>w.code)).sort((a,b)=>a-b).join(',');if(warnings(candidate.results)!==warnings(reference.results))ok=false;
 return{ok:ok&&!techniques.length,message:techniques.join(' ')||(ok?'Correct. Review your result, then continue when ready.':candidate.error&&q.kind!=='error'?candidate.error.message:'Not yet. Check the required columns, values, conditions and constraints.'),session:candidate.session};
}
function checkCourse(){
 rememberCourse();const b=courseState(),q=courseLesson(),sql=b.drafts[q.id]||'',assessment=assessCourse(sql,q,b.entries[q.id]);
 b.feedback[q.id]={ok:assessment.ok,message:assessment.message,sql};
 if(assessment.ok){b.checked[q.id]={sql,session:assessment.session};if(!b.done.includes(q.id))b.done.push(q.id)}
 else{delete b.checked[q.id];b.done=b.done.filter(id=>id!==q.id)}
 renderCourse();$('#course-feedback')?.focus({preventScroll:true});$('#course-feedback')?.scrollIntoView({block:'nearest'});saveProgressNow();
}
function completeReading(){
 const b=courseState(),q=courseLesson();b.drafts[q.id]='';b.checked[q.id]={sql:'',session:plain(b.entries[q.id])};b.feedback[q.id]={ok:true,message:'Reviewed. Continue when ready.'};
 if(!b.done.includes(q.id))b.done.push(q.id);renderCourse();$('#course-feedback')?.focus({preventScroll:true});saveProgressNow();
}
function continueCourse(){
 rememberCourse();const b=courseState(),q=courseLesson(),checked=courseFreshCheck(b,q);if(!checked)return;
 const list=courseLessons(labLevel),next=list[b.lesson+1],after=q.sandbox?b.entries[q.id]:checked.session;
 const differs=next&&b.entries[next.id]&&JSON.stringify(canonicalSession(after))!==JSON.stringify(canonicalSession(b.entries[next.id]));
 if(differs){
  if(!confirm('Your corrected answer changes the starting database for later tasks. Rebuild the remaining tasks from this result? Their previous progress will be saved as a recoverable branch, and every SQL draft will be kept.'))return;
  b.archives.push(archiveCurrentCourse('Before rebuilding from task '+(b.lesson+2)+': '+courseContent(next).title));
  const downstream=new Set(list.slice(b.lesson+1).map(task=>task.id));
  for(const id of downstream){delete b.entries[id];delete b.work[id];delete b.checked[id];delete b.outputs[id];delete b.feedback[id]}
  b.done=b.done.filter(id=>!downstream.has(id));b.finished=false;
 }
 /* Applying an already evaluated checkpoint never executes SQL again. */
 if(!q.sandbox){b.session=restoreSession(after);b.work[q.id]=b.session}
 if(!next){b.finished=true;renderCourse();$('#course-summary')?.focus({preventScroll:true});saveProgressNow();return}
 if(!b.entries[next.id]){b.entries[next.id]=plain(after);b.work[next.id]=plain(after)}
 openCourseLesson(b.lesson+1);
}
function showCourseSolution(){
 rememberCourse();const b=courseState(),q=courseLesson();b.feedback[q.id]={solution:true};
 renderCourse();$('#course-feedback')?.focus({preventScroll:true});$('#course-feedback')?.scrollIntoView({block:'nearest'});saveProgressNow();
}
function resetCourseLesson(){
 rememberCourse();const b=courseState(),q=courseLesson();
 if(JSON.stringify(canonicalSession(b.session))!==JSON.stringify(canonicalSession(b.entries[q.id]))&&!confirm('Reset this lesson database to its starting checkpoint? Its results will be cleared. Your draft and other lessons are kept.'))return;
 b.session=restoreSession(b.entries[q.id]);b.work[q.id]=b.session;invalidateCourseAnswer(b,q);delete b.outputs[q.id];
 renderCourse();$('#course-sql')?.focus({preventScroll:true});saveProgressNow();
}
function courseSnapshot(b,includeArchives=true){
 const pool=[],map=new Map(),intern=s=>{const key=JSON.stringify(s);if(!map.has(key)){map.set(key,pool.length);pool.push(plain(s))}return map.get(key)},refs=o=>Object.fromEntries(Object.entries(o).map(([id,s])=>[id,intern(s)]));
 return{pool,session:intern(b.session),lesson:b.lesson,style:b.style,drafts:plain(b.drafts),done:[...b.done],entries:refs(b.entries),work:refs(b.work),checked:Object.fromEntries(Object.entries(b.checked).map(([id,c])=>[id,{sql:c.sql,session:intern(c.session)}])),outputs:plain(b.outputs),feedback:plain(b.feedback),preview:b.preview,previewExpanded:!!b.previewExpanded,finished:!!b.finished,...(includeArchives?{archives:plain(b.archives||[])}:{})};
}
function restoreCourse(level,s){
 const b=courseStates[level],unpack=i=>restoreSession(s.pool[i]);b.session=unpack(s.session);b.lesson=s.lesson;b.style=s.style;b.drafts=plain(s.drafts);b.done=s.done.slice();b.entries=Object.fromEntries(Object.entries(s.entries).map(([id,i])=>[id,unpack(i)]));b.work=Object.fromEntries(Object.entries(s.work).map(([id,i])=>[id,unpack(i)]));b.checked=Object.fromEntries(Object.entries(s.checked).map(([id,c])=>[id,{sql:c.sql,session:unpack(c.session)}]));b.outputs=plain(s.outputs);b.feedback=plain(s.feedback);b.preview=s.preview||'';b.previewExpanded=!!s.previewExpanded;b.finished=!!s.finished;b.archives=plain(s.archives||[]);
}
function validCourse(level,s,allowArchives=true){
 const ids=courseLessons(level).map(q=>q.id),known=id=>ids.includes(id),ref=i=>Number.isInteger(i)&&i>=0&&i<s.pool.length,mapping=(o,fn)=>isRecord(o)&&Object.entries(o).every(([id,v])=>known(id)&&fn(v));
 return isRecord(s)&&Array.isArray(s.pool)&&s.pool.length>0&&s.pool.every(validSession)&&ref(s.session)&&Number.isInteger(s.lesson)&&s.lesson>=0&&s.lesson<ids.length&&['walkthrough','challenge'].includes(s.style)&&Array.isArray(s.done)&&new Set(s.done).size===s.done.length&&s.done.every(known)&&mapping(s.entries,ref)&&mapping(s.work,ref)&&mapping(s.drafts,v=>typeof v==='string')&&mapping(s.checked,c=>isRecord(c)&&typeof c.sql==='string'&&ref(c.session))&&mapping(s.outputs,validOutput)&&mapping(s.feedback,v=>isRecord(v)&&(v.solution===true||typeof v.ok==='boolean'&&typeof v.message==='string'))&&(s.lesson===0||Object.hasOwn(s.entries,ids[s.lesson]))&&(s.previewExpanded===undefined||typeof s.previewExpanded==='boolean')&&(s.finished===undefined||typeof s.finished==='boolean')&&(allowArchives?(s.archives===undefined||Array.isArray(s.archives)&&s.archives.every(a=>isRecord(a)&&typeof a.id==='string'&&typeof a.label==='string'&&typeof a.createdAt==='string'&&Number.isFinite(Date.parse(a.createdAt))&&validCourse(level,a.snapshot,false))&&new Set(s.archives.map(a=>a.id)).size===s.archives.length):!Object.hasOwn(s,'archives'));
}
