/* Active question identities and source-aware saved-attempt migration. */
function examActive(kind,index){return !(EXAM_RETIRED[kind]||[]).includes(index)}
function examTotal(kind){return(kind==='id'?ID:MC).reduce((n,_,i)=>n+Number(examActive(kind,i)),0)}
function savedQuestionCorrect(mode,index,answers,bank){const q=bank[index];return mode==='id'?identificationMatches(answers.id[index]||'',q,bank):answers.mc[index]===q[2]}
function readExamCatalog(catalog){
 if(!validCatalog(catalog))return null;
 const banks={};
 for(const mode of ['id','mc']){
  try{banks[mode]=catalog[mode].map(x=>JSON.parse(x.signature))}catch(e){return null}
  if(!banks[mode].every(q=>Array.isArray(q)&&typeof q[0]==='string'&&(mode==='id'?typeof q[1]==='string':Array.isArray(q[1])&&q[1].length===4&&q[1].every(x=>typeof x==='string')&&Number.isInteger(q[2])&&q[2]>=0&&q[2]<4)&&Number.isInteger(q[mode==='id'?2:3])&&EXAM_MODULES.some(m=>q[mode==='id'?2:3]>=m.from&&q[mode==='id'?2:3]<=m.to)))return null;
 }
 return banks;
}
function validLegacyBlankReviews(s,banks){
 if(s.legacyBlank===undefined)return true;
 return isRecord(s.legacyBlank)&&['id','mc'].every(mode=>isRecord(s.legacyBlank[mode])&&Object.entries(s.legacyBlank[mode]).every(([k,v])=>String(+k)===k&&Number.isInteger(+k)&&+k>=0&&+k<banks[mode].length&&v===true&&s.checked?.[mode]?.[k]===true&&(mode==='id'?!String(s.answers[mode][k]||'').trim():s.answers[mode][k]===undefined)));
}
function validSavedExam(s,catalog,banks){
 if(!isRecord(s)||![null,'id','mc'].includes(s.mode)||!Number.isInteger(s.currentModule)||s.currentModule<0||s.currentModule>=EXAM_MODULES.length||!isRecord(s.orders)||!isRecord(s.answers)||!isRecord(s.submitted)||!isRecord(s.scores)||!isRecord(s.reviews))return false;
 const perQuestion=s.checked!==undefined;if(!validLegacyBlankReviews(s,banks))return false;
 if(perQuestion&&(!isRecord(s.checked)||!isRecord(s.positions)||!isRecord(s.continuationDismissed)))return false;
 for(const mode of ['id','mc']){
  const bank=banks[mode],active=i=>catalog[mode][i]?.active!==false;
  if(!validAnswerMap(s.answers[mode],mode,bank.length)||Object.keys(s.answers[mode]).some(k=>!active(+k)))return false;
  if(![s.orders[mode],s.submitted[mode],s.scores[mode],s.reviews[mode]].every(a=>Array.isArray(a)&&a.length===EXAM_MODULES.length))return false;
  if(perQuestion&&(!isRecord(s.checked[mode])||!Object.entries(s.checked[mode]).every(([k,v])=>String(+k)===k&&Number.isInteger(+k)&&+k>=0&&+k<bank.length&&active(+k)&&v===true)||![s.positions[mode],s.continuationDismissed[mode]].every(a=>Array.isArray(a)&&a.length===EXAM_MODULES.length)))return false;
  for(let m=0;m<EXAM_MODULES.length;m++){
   const expected=bank.map((q,i)=>i).filter(i=>active(i)&&bank[i][mode==='id'?2:3]>=EXAM_MODULES[m].from&&bank[i][mode==='id'?2:3]<=EXAM_MODULES[m].to),list=s.orders[mode][m],complete=s.submitted[mode][m],review=s.reviews[mode][m];
   if(!validPartOrder(list,expected)||typeof complete!=='boolean')return false;
   if(perQuestion){
    if(!Number.isInteger(s.positions[mode][m])||s.positions[mode][m]<0||s.positions[mode][m]>=list.length||typeof s.continuationDismissed[mode][m]!=='boolean'||s.continuationDismissed[mode][m]&&!complete||complete!==list.every(i=>s.checked[mode][i]===true))return false;
    if(!complete&&list.some(i=>s.checked[mode][i]&&!s.legacyBlank?.[mode]?.[i]&&(mode==='id'?!String(s.answers.id[i]||'').trim():!Number.isInteger(s.answers.mc[i]))))return false;
   }
   if(!complete){if(s.scores[mode][m]!==null||review!==null)return false;continue}
   if(!Array.isArray(review)||!validPartOrder(review.map(x=>x?.sourceIndex),list)||!review.every(x=>isRecord(x)&&typeof x.correct==='boolean'&&x.correct===savedQuestionCorrect(mode,x.sourceIndex,s.answers,bank)))return false;
   if(s.scores[mode][m]!==review.filter(x=>x.correct).length)return false;
  }
 }
 return true;
}
function examRuleCompatible(mode,index,oldQuestion,newQuestion,value,oldBank){
 if(mode==='id'){
  // Wording, page references, and additional legitimate variants do not invalidate attempts.
  if(norm(oldQuestion[1].split('|')[0])!==norm(newQuestion[1].split('|')[0])&&!EXAM_EQUIVALENT_ANSWERS.includes('id-'+index))return false;
  return identificationMatches(value||'',oldQuestion,oldBank)===identificationMatches(value||'',newQuestion);
 }
 const same=(a,b,option)=>{
  if(norm(a)===norm(b))return true;
  const equivalents=EXAM_EQUIVALENT_OPTIONS['mc-'+index]?.[option];
  return !!equivalents&&equivalents.some(x=>norm(x)===norm(a))&&equivalents.some(x=>norm(x)===norm(b));
 };
 if(oldQuestion[2]!==newQuestion[2]||!same(oldQuestion[1][oldQuestion[2]],newQuestion[1][newQuestion[2]],oldQuestion[2]))return false;
 if(value===undefined)return true;
 return Number.isInteger(value)&&value>=0&&value<4&&same(oldQuestion[1][value],newQuestion[1][value],value)&&(value===oldQuestion[2])===(value===newQuestion[2]);
}
function migrateExamCatalog(saved,catalog){
 const banks=readExamCatalog(catalog);if(!banks||!validSavedExam(saved,catalog,banks))return null;
 const next=makeExamState();next.mode=saved.mode;next.currentModule=saved.currentModule;let reopened=0,removed=0;
 for(const mode of ['id','mc']){
  const bank=mode==='id'?ID:MC,oldOrder=saved.orders[mode].flat(),active=oldOrder.filter(i=>i<bank.length&&examActive(mode,i));
  removed+=oldOrder.length-active.length;
  for(let m=0;m<EXAM_MODULES.length;m++){
   const expected=examIndices(mode,m);next.orders[mode][m]=[...active.filter(i=>expected.includes(i)),...expected.filter(i=>!active.includes(i))];
  }
  for(const i of active){
   const value=saved.answers[mode][i],wasChecked=saved.checked?!!saved.checked[mode][i]:saved.submitted[mode][EXAM_MODULES.findIndex(m=>banks[mode][i][mode==='id'?2:3]>=m.from&&banks[mode][i][mode==='id'?2:3]<=m.to)];
   if(examRuleCompatible(mode,i,banks[mode][i],bank[i],value,banks[mode])){
    if(value!==undefined)next.answers[mode][i]=value;
    if(wasChecked){next.checked[mode][i]=true;if(mode==='id'?!String(value||'').trim():value===undefined)next.legacyBlank[mode][i]=true}
   }else if(wasChecked||value!==undefined)reopened++;
  }
  for(let m=0;m<EXAM_MODULES.length;m++){
   const list=next.orders[mode][m],oldPosition=saved.positions?.[mode]?.[m]||0,oldIdentity=saved.orders[mode][m][oldPosition],mapped=list.indexOf(oldIdentity);
   next.positions[mode][m]=mapped>=0?mapped:Math.min(oldPosition,list.length-1);
   const stats=examPartStats(mode,m,next),complete=stats.checked===stats.total;
   next.submitted[mode][m]=complete;
   if(complete){next.scores[mode][m]=stats.correct;next.reviews[mode][m]=list.map(sourceIndex=>({sourceIndex,correct:examCorrect(mode,sourceIndex,next)}));next.continuationDismissed[mode][m]=!!saved.continuationDismissed?.[mode]?.[m]}
  }
 }
 return validExam(next)?{exam:next,reopened,removed}:null;
}
