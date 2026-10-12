/* Single-question exam: locked first attempts and independently completed parts. */
function currentExamQuestion(){
 if(!examState.mode)return null;
 const mode=examState.mode,module=examState.currentModule,list=examState.orders[mode][module],position=examState.positions[mode][module];
 const sourceIndex=list[position],question=(mode==='id'?ID:MC)[sourceIndex];
 return{mode,module,list,position,sourceIndex,question,checked:examState.checked[mode][sourceIndex]===true};
}
function examCorrect(mode,index,state=examState){const q=(mode==='id'?ID:MC)[index];return mode==='id'?identificationMatches(state.answers.id[index]||'',q):state.answers.mc[index]===q[2]}
function examPartStats(mode,module,state=examState){
 const list=state.orders[mode][module],checked=list.filter(i=>state.checked[mode][i]===true);
 return{total:list.length,checked:checked.length,correct:checked.filter(i=>examCorrect(mode,i,state)).length,remaining:list.length-checked.length};
}
function examHasProgress(){collectExamAnswers();return!!examState.mode&&(Object.keys(examState.answers[examState.mode]).length>0||Object.keys(examState.checked[examState.mode]).length>0)}
function collectExamAnswers(){
 const current=currentExamQuestion();if(!current||current.checked)return;
 const {mode,sourceIndex}=current;
 if(mode==='id'){const el=$('#i'+sourceIndex);if(!el||el.disabled)return;if(el.value)examState.answers.id[sourceIndex]=el.value;else delete examState.answers.id[sourceIndex]}
 else{const controls=document.querySelectorAll(`input[name="m${sourceIndex}"]`);if(!controls.length||controls[0].disabled)return;const el=[...controls].find(x=>x.checked);if(el)examState.answers.mc[sourceIndex]=+el.value;else delete examState.answers.mc[sourceIndex]}
}
function examAnswerPresent(current=currentExamQuestion()){return!!current&&(current.mode==='id'?!!String(examState.answers.id[current.sourceIndex]||'').trim():Number.isInteger(examState.answers.mc[current.sourceIndex]))}
function examInput(immediate=false){collectExamAnswers();const current=currentExamQuestion(),button=$('#exam-check');if(button)button.disabled=!current||current.checked||!examAnswerPresent(current);immediate?saveProgressNow():saveProgressSoon()}
function resetExamAttempt(){
 examState.answers=emptyExamAnswers();examState.checked=emptyExamAnswers();examState.submitted=emptyExamParts();examState.scores=emptyExamScores();
 examState.reviews={id:EXAM_MODULES.map(()=>null),mc:EXAM_MODULES.map(()=>null)};
 examState.positions={id:EXAM_MODULES.map(()=>0),mc:EXAM_MODULES.map(()=>0)};examState.continuationDismissed=emptyExamParts();
}
function chooseExamMode(mode){
 if(![null,'id','mc'].includes(mode)||mode===examState.mode)return;
 if(examHasProgress()&&!confirm('Change exam type and clear the current exam answers and results?'))return;
 resetExamAttempt();examState.mode=mode;examState.currentModule=0;exam();$('#exam-part-title')?.focus({preventScroll:true});saveProgressNow();
}
function examSummary(){const mode=examState.mode;return mode?`<p class="mu sm">${mode==='id'?'Identification':'Multiple Choice'} · ${mode==='id'?ID.length:MC.length} questions · ${examState.submitted[mode].filter(Boolean).length} of ${EXAM_MODULES.length} parts complete.</p>`:''}
function examFeedbackHtml(current){
 if(!current.checked)return'';
 const {mode,sourceIndex,question:q}=current,correct=examCorrect(mode,sourceIndex),value=examState.answers[mode][sourceIndex];
 const answer=mode==='id'?(value||'No answer'):Number.isInteger(value)?q[1][value]:'No answer';
 const expected=mode==='id'?q[1].split('|')[0].toUpperCase():q[1][q[2]],page=q[mode==='id'?2:3],note=q[mode==='id'?3:4];
 return`<div class="ans fb ${correct?'ok':'no'}"><strong>${correct?'Correct':'Incorrect'}.</strong><p><b>Your answer:</b> <span>${h(answer)}</span></p><p><b>Correct answer:</b> <span>${h(expected)}</span></p><p class="mu sm">Module PDF, page ${page}</p>${note?`<p class="module-note">${h(note)}</p>`:''}</div>`;
}
function examContinuationHtml(mode,module){
 if(!examState.submitted[mode][module]||examState.continuationDismissed[mode][module])return'';
 const next=Array.from({length:EXAM_MODULES.length},(_,i)=>(module+i+1)%EXAM_MODULES.length).find(i=>!examState.submitted[mode][i]);
 return`<div class="continue-panel"><strong>Part ${module+1} complete.</strong>${next===undefined?'<p>All five parts are complete. Review your answers or start over.</p>':`<p>Continue to Part ${next+1}?</p><div class="row"><button class="btn a" onclick="openExamPart(${next})">Continue to Part ${next+1}</button><button class="btn l" onclick="dismissExamContinue()">Stay on review</button></div>`}</div>`;
}
function exam(){
 if(!examState.mode){$('#exam').innerHTML='<h2>Written exam</h2><p class="mu">Choose your exam type. Answer one question at a time and check it for immediate feedback. Each type has five module parts.</p><div class="row"><button class="btn a" onclick="chooseExamMode(\'id\')">Identification</button><button class="btn a" onclick="chooseExamMode(\'mc\')">Multiple Choice</button></div>';return}
 const current=currentExamQuestion(),{mode,module,position,sourceIndex,question:q,list,checked}=current,m=EXAM_MODULES[module],stats=examPartStats(mode,module),value=examState.answers[mode][sourceIndex],n=position+1;
 const nav=EXAM_MODULES.map((_,i)=>`<button class="btn l${i===module?' on':''}" aria-current="${i===module?'step':'false'}" onclick="openExamPart(${i})">Part ${i+1}${examState.submitted[mode][i]?' - Done':''}</button>`).join('');
 const control=mode==='id'?`<label for="i${sourceIndex}" class="exam-answer-label">Write your answer</label><input type="text" id="i${sourceIndex}" value="${h(value||'')}" autocomplete="off" spellcheck="false" placeholder="Enter your answer" aria-describedby="exam-answer-help" oninput="examInput()" onkeydown="if(event.key==='Enter'&&!event.isComposing){event.preventDefault();checkExamAnswer()}"${checked?' disabled':''}>`:`<fieldset class="exam-options"><legend>Choose your answer</legend>${q[1].map((option,i)=>`<label class="o"><input type="radio" name="m${sourceIndex}" value="${i}"${value===i?' checked':''} onchange="examInput(true)"${checked?' disabled':''}>${h(option)}</label>`).join('')}</fieldset>`;
 const complete=examState.submitted[mode][module],allComplete=examState.submitted[mode].every(Boolean),overall=allComplete?examState.orders[mode].flat().filter(i=>examCorrect(mode,i)).length:0;
 $('#exam').innerHTML=`<h2>Written exam</h2>${examSummary()}<div class="row exam-actions"><button class="btn l" onclick="shuffleExam()">Shuffle questions</button><button class="btn l" onclick="startOverExam()">Start over</button><button class="btn l" onclick="chooseExamMode(null)">Change exam type</button></div><nav class="exam-parts-nav" aria-label="Exam parts">${nav}</nav><section class="exam-part exam-single" id="exam-part-${module}" aria-labelledby="exam-part-title"><div class="exam-part-heading"><p class="mu sm">Part ${module+1} of ${EXAM_MODULES.length}</p><h3 id="exam-part-title" tabindex="-1">${h(m.title)}</h3></div><div class="exam-card"><div class="exam-card-heading"><div><p class="exam-mode-label">${mode==='id'?'Identification':'Multiple Choice'}</p><p class="exam-position" id="exam-position">Question ${n} of ${list.length}</p></div><div class="exam-correct-count"><strong>${stats.correct} / ${stats.total}</strong><span>Correct answers</span></div></div><progress class="exam-progress" max="${stats.total}" value="${stats.checked}" aria-label="Questions checked in this part">${stats.checked} of ${stats.total}</progress><div class="q${checked?(examCorrect(mode,sourceIndex)?' ok':' no'):''}" id="q${n}"><h4 id="exam-question-title" tabindex="-1">${h(q[0])}</h4>${control}<p id="exam-answer-help" class="mu sm">${checked?'Your first answer is saved and locked.':'Check your answer to see the result and correct answer.'}</p><button id="exam-check" class="btn a" onclick="checkExamAnswer()"${checked||!examAnswerPresent(current)?' disabled':''}>${checked?'Answer checked':'Check Answer'}</button><div id="exam-feedback" tabindex="-1" role="status" aria-live="polite">${examFeedbackHtml(current)}</div></div><div class="exam-question-nav"><button id="exam-previous" class="btn l" onclick="previousExamQuestion()"${position===0?' disabled':''}><span aria-hidden="true">‹</span> Previous</button><button id="exam-next" class="btn l" onclick="nextExamQuestion()"${!checked||position===list.length-1?' disabled':''}>Next <span aria-hidden="true">›</span></button></div><div class="exam-counts"><span>${stats.checked} of ${stats.total} checked</span><span>${stats.remaining} remaining</span></div></div>${complete?`<div id="exam-result-${module}" class="score exam-part-result"><p>Part ${module+1} complete</p><h3>${stats.correct} out of ${stats.total}</h3><p class="mu sm">Use Previous and Next to review this part.</p></div>`:''}${examContinuationHtml(mode,module)}${allComplete?`<div id="exam-overall-result" class="score"><h3>${overall} out of ${examState.orders[mode].flat().length}</h3><p>All five parts complete.</p></div>`:''}</section>`;
}
function submitExamPart(module){
 const mode=examState.mode;if(!mode||!Number.isInteger(module)||module<0||module>=EXAM_MODULES.length||examState.submitted[mode][module])return false;
 const stats=examPartStats(mode,module);if(stats.checked!==stats.total)return false;
 examState.submitted[mode][module]=true;examState.scores[mode][module]=stats.correct;
 examState.reviews[mode][module]=examState.orders[mode][module].map(sourceIndex=>({sourceIndex,correct:examCorrect(mode,sourceIndex)}));
 examState.continuationDismissed[mode][module]=false;return true;
}
function checkExamAnswer(){
 collectExamAnswers();const current=currentExamQuestion();if(!current||current.checked||!examAnswerPresent(current))return;
 examState.checked[current.mode][current.sourceIndex]=true;submitExamPart(current.module);exam();
 $('#exam-feedback')?.focus({preventScroll:true});$('#exam-feedback')?.scrollIntoView({block:'nearest'});saveProgressNow();
}
function moveExamQuestion(direction){
 const current=currentExamQuestion();if(!current||![1,-1].includes(direction)||direction===1&&!current.checked)return;
 const next=current.position+direction;if(next<0||next>=current.list.length)return;
 collectExamAnswers();examState.positions[current.mode][current.module]=next;exam();$('#exam-question-title')?.focus({preventScroll:true});$('#exam-position')?.scrollIntoView({block:'nearest'});saveProgressNow();
}
function previousExamQuestion(){moveExamQuestion(-1)}
function nextExamQuestion(){moveExamQuestion(1)}
function openExamPart(module){
 if(!examState.mode||!Number.isInteger(module)||module<0||module>=EXAM_MODULES.length)return;
 collectExamAnswers();examState.currentModule=module;exam();$('#exam-part-title')?.focus({preventScroll:true});$('#exam-part-'+module)?.scrollIntoView({block:'start'});saveProgressNow();
}
function dismissExamContinue(){if(!examState.mode||!examState.submitted[examState.mode][examState.currentModule])return;examState.continuationDismissed[examState.mode][examState.currentModule]=true;exam();$('#exam-feedback')?.focus({preventScroll:true});saveProgressNow()}
function startOverExam(){if(!examState.mode)return;resetExamAttempt();examState.currentModule=0;exam();$('#exam-part-title')?.focus({preventScroll:true});saveProgressNow()}
function shuffleExam(){if(!examState.mode)return;if(examHasProgress()&&!confirm('Shuffle questions and start a new exam attempt? Current answers and results will be cleared.'))return;examState.orders[examState.mode]=examState.orders[examState.mode].map(shuffleList);resetExamAttempt();examState.currentModule=0;exam();$('#exam-part-title')?.focus({preventScroll:true});saveProgressNow()}
function upgradeLegacyExam(saved){
 const next=plain(saved);next.checked=emptyExamAnswers();next.positions={id:EXAM_MODULES.map(()=>0),mc:EXAM_MODULES.map(()=>0)};next.continuationDismissed=emptyExamParts();
 for(const mode of ['id','mc'])for(let m=0;m<EXAM_MODULES.length;m++)if(next.submitted[mode][m])for(const i of next.orders[mode][m])next.checked[mode][i]=true;
 return next;
}
function validExam(s){
 if(!validLegacyExam(s)||!isRecord(s.checked)||!isRecord(s.positions)||!isRecord(s.continuationDismissed))return false;
 for(const mode of ['id','mc']){
  const count=mode==='id'?ID.length:MC.length;
  if(!isRecord(s.checked[mode])||!Object.entries(s.checked[mode]).every(([key,v])=>String(+key)===key&&Number.isInteger(+key)&&+key>=0&&+key<count&&v===true))return false;
  if(!Array.isArray(s.positions[mode])||s.positions[mode].length!==EXAM_MODULES.length||!Array.isArray(s.continuationDismissed[mode])||s.continuationDismissed[mode].length!==EXAM_MODULES.length)return false;
  for(let m=0;m<EXAM_MODULES.length;m++){
   if(!Number.isInteger(s.positions[mode][m])||s.positions[mode][m]<0||s.positions[mode][m]>=s.orders[mode][m].length||typeof s.continuationDismissed[mode][m]!=='boolean')return false;
   const stats=examPartStats(mode,m,s);
   if(s.submitted[mode][m]!== (stats.checked===stats.total)||s.continuationDismissed[mode][m]&&!s.submitted[mode][m])return false;
   if(!s.submitted[mode][m]&&s.orders[mode][m].some(i=>s.checked[mode][i]===true&&(mode==='id'?!String(s.answers.id[i]||'').trim():!Number.isInteger(s.answers.mc[i]))))return false;
  }
 }
 return true;
}
