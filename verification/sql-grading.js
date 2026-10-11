/* Task-aware SQL assessment. The visible database is never touched by grading. */
function gradingStatements(sql){return splitStatements(sql).filter(p=>tok(p.sql).length).map(p=>({part:p,ast:parse(tok(p.sql))}))}
function gradingNodes(value){const all=[];const visit=v=>{if(!v||typeof v!=='object')return;if(!Array.isArray(v))all.push(v);for(const child of Object.values(v))if(child&&typeof child==='object')visit(child)};visit(value);return all}
function sqlTechniqueProblems(sql,q){
 const prompt=q[1].replace(/<[^>]*>/g,' '),problems=[];
 let actual,expected;try{actual=gradingStatements(sql);expected=gradingStatements(q[2])}catch(e){return ['Use the SQL operation described in the task.']}
 const an=gradingNodes(actual.map(x=>x.ast)),en=gradingNodes(expected.map(x=>x.ast));
 const requireNode=(pattern,test,label)=>{if(pattern.test(prompt)&&en.some(test)&&!an.some(test))problems.push('Use '+label+' as requested.')};
 requireNode(/\bBETWEEN\b/i,n=>n.kind==='between','BETWEEN');
 requireNode(/\bLIKE\b/i,n=>n.kind==='like','LIKE');
 requireNode(/\bUse NOT\b/i,n=>n.kind==='unary'&&n.op==='NOT','NOT');
 requireNode(/\bDISTINCT\b/i,n=>n.kind==='select'&&n.distinct,'DISTINCT');
 requireNode(/\bLIMIT\b/i,n=>n.kind==='select'&&n.limit!=null,'LIMIT');
 requireNode(/\bGROUP BY\b/i,n=>n.kind==='select'&&n.group.length,'GROUP BY');
 requireNode(/\bHAVING\b/i,n=>n.kind==='select'&&n.having,'HAVING');
 if(/\bsort|\bORDER BY\b/i.test(prompt)&&en.some(n=>n.kind==='select'&&n.order.length)&&!an.some(n=>n.kind==='select'&&n.order.length))problems.push('Include the requested ORDER BY.');
 if(/using parentheses/i.test(prompt)&&!actual.some(x=>/\([^)]*\bOR\b[^)]*\)/i.test(x.part.sql)))problems.push('Group the country conditions using parentheses as requested.');
 for(const [pattern,kind,label] of [[/\bStart a transaction\b/i,'begin','START TRANSACTION'],[/\bSAVEPOINT\b/i,'savepoint','SAVEPOINT'],[/\broll back\b/i,'rollback','ROLLBACK'],[/\bcommit\b/i,'commit','COMMIT'],[/\bTRUNCATE\b/i,'truncate','TRUNCATE']])if(pattern.test(prompt)&&expected.some(x=>x.ast.kind===kind)&&!actual.some(x=>x.ast.kind===kind))problems.push('Use '+label+' as requested.');
 for(const type of ['INNER','LEFT','RIGHT'])if(new RegExp('\\b'+type+' JOIN\\b','i').test(prompt)&&en.some(n=>n.type===type&&n.table)&&!an.some(n=>n.type===type&&n.table))problems.push('Use the requested '+type+' JOIN.');
 if(/\bUSING\s*\(/i.test(prompt))for(const n of en.filter(n=>n.using))if(!an.some(a=>a.using&&JSON.stringify(a.using.slice().sort())===JSON.stringify(n.using.slice().sort())))problems.push('Use USING with the requested columns.');
 if(/\bUNION\b/i.test(prompt)&&expected.some(x=>x.ast.unions?.length)&&!actual.some(x=>x.ast.unions?.length))problems.push('Combine the joins with UNION.');
 for(const table of en.filter(n=>n.n&&n.alias&&n.alias!==n.n))if(new RegExp('\\b(?:alias\\s+|'+table.n+'\\s+)'+table.alias+'\\b','i').test(prompt)&&!an.some(n=>n.n===table.n&&n.alias===table.alias))problems.push('Use alias '+table.alias+' for '+table.n+'.');
 if(/\bvertically\b/i.test(prompt)&&!actual.some(x=>x.part.vertical))problems.push('End the statement with \\G for vertical display.');
 return problems;
}
function gradingResultShape(results,ordered){return JSON.stringify(results.map(r=>({cols:(r.cols||[]).map(c=>c.includes('(')?c.replace(/\s+/g,'').toLowerCase():c.toLowerCase()),rows:ordered?r.rows:(r.rows||[]).slice().sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))})))}
function gradingSelectMatches(sql,reference,session,ordered){try{return gradingResultShape(exec(sql,clone(session)),ordered)===gradingResultShape(exec(reference,clone(session)),ordered)}catch(e){return false}}
/* Boundary probes distinguish correct predicates from queries matching only the small sample. */
function gradingProbeSessions(reference,base){
 const statements=gradingStatements(reference);if(statements.length!==1||statements[0].ast.kind!=='query')return[];
 const ast=statements[0].ast,nodes=gradingNodes(ast),tables=nodes.filter(n=>n.n&&n.alias),probes=[],seen=new Set();
 const probe=(column,values)=>{if(column?.kind!=='column')return;const candidates=tables.filter(t=>(!column.qualifier||t.alias===column.qualifier||t.n===column.qualifier)&&base.databases[t.d||base.current]?.[t.n]?.cols.some(c=>K(c)===column.column));if(candidates.length!==1)return;const table=candidates[0],db=table.d||base.current,source=base.databases[db][table.n],definition=source.cols.find(c=>K(c)===column.column);if(definition.pk||(source.primary||[]).includes(column.column)||(source.indexes||[]).some(k=>!k.nonUnique&&k.cols.includes(column.column)))return;
  for(const value of values){const key=JSON.stringify([db,table.n,column.column,value]);if(seen.has(key))continue;seen.add(key);const s=clone(base);for(const row of s.databases[db][table.n].rows)row[column.column]=value;probes.push(s)}
 };
 for(const n of nodes){
  if(n.kind==='binary'&&['=','!=','<>','>','>=','<','<='].includes(n.op)){const column=n.a?.kind==='column'?n.a:n.b?.kind==='column'?n.b:null,literal=n.a?.kind==='literal'?n.a:n.b?.kind==='literal'?n.b:null;if(column&&literal){const v=literal.value;if(typeof v==='number')probe(column,[v-1,v,v+1]);else if(typeof v==='string')probe(column,[v,'__other__']);}}
  if(n.kind==='between'){for(const bound of [n.lo,n.hi])if(bound?.kind==='literal'&&typeof bound.value==='number')probe(n.a,[bound.value-1,bound.value,bound.value+1])}
  if(n.kind==='like'&&n.b?.kind==='literal'&&typeof n.b.value==='string'){const pattern=n.b.value.replace(/_/g,'x').replace(/%/g,'audit');probe(n.a,[pattern,'no_match'])}
 }
 // Change projected values too: hardcoded sample answers must not pass.
 for(const table of tables){const definition=base.databases[table.d||base.current]?.[table.n];if(!definition)continue;for(const col of definition.cols){const first=definition.rows.find(r=>r[K(col)]!=null)?.[K(col)];if(typeof first==='number')probe({kind:'column',column:K(col),qualifier:table.alias},[first+17]);else if(typeof first==='string'&&!/DATE|TIME|YEAR|ENUM|SET|BINARY|BLOB/i.test(col.t))probe({kind:'column',column:K(col),qualifier:table.alias},['Audit varied value'])}}
 return probes;
}
function gradeSqlTask(sql,q){
 try{
  if(q[3]){
   if(!errHas(sql,q[3],q[2]))return false;
   // An error code alone does not prove that the requested operation was attempted.
   if(q[3].includes('1068')){
    const expected=gradingStatements(q[2]).at(-1).ast,actual=gradingStatements(sql).at(-1).ast;
    if(expected.kind==='createTable'){
     const shape=st=>st.defs.filter(d=>d.n).map(d=>[d.n.toLowerCase(),d.t.toLowerCase(),!!d.pk,!!d.nn]).sort((a,b)=>a[0].localeCompare(b[0]));
     if(JSON.stringify(shape(actual))!==JSON.stringify(shape(expected)))return false;
    }
    if(expected.kind==='alter'&&!actual.actions.some(a=>a.op==='add'&&a.def?.key==='PRIMARY'))return false;
   }
   return true;
  }
  if(!same(sql,q[2])||sqlTechniqueProblems(sql,q).length)return false;
  const statements=gradingStatements(q[2]);if(statements.length===1&&statements[0].ast.kind==='query'){
   const ordered=!!statements[0].ast.query.order.length;
   for(const session of gradingProbeSessions(q[2],newSession()))if(!gradingSelectMatches(sql,q[2],session,ordered))return false;
  }
  return true;
 }catch(e){return false}
}
function gradeBuilderQuery(sql,reference,before){
 try{
  const statements=gradingStatements(sql);if(statements.length!==1||statements[0].ast.kind!=='query')return false;
  const query=statements[0].ast.query,names=[query.from?.n,...query.joins.map(j=>j.table.n)];
  if(!['students','enrollments','course_offerings','courses'].every(n=>names.includes(n))||query.order.length<2)return false;
  if(!gradingSelectMatches(sql,reference,before,true))return false;
  const probe=clone(before),tables=activeTables(probe),offerings=tables.course_offerings;
  for(const row of [...offerings.rows]){let term='audit-term',n=0;while(offerings.rows.some(r=>r.course_code===row.course_code&&r.term===term))term='audit'+(++n);offerings.rows.push({...row,term})}
  if(!gradingSelectMatches(sql,reference,probe,true))return false;
  const orderProbe=clone(before),ot=activeTables(orderProbe);
  for(const [i,row] of ot.students.rows.entries())row.full_name=i===0?'Zoe Audit':'Ana Audit';
  const first=ot.students.rows[0];if(first)for(const row of [...ot.enrollments.rows])if(!ot.enrollments.rows.some(r=>r.student_id===first.student_id&&r.course_code===row.course_code&&r.term===row.term))ot.enrollments.rows.push({...row,student_id:first.student_id});
  return gradingSelectMatches(sql,reference,orderProbe,true);
 }catch(e){return false}
}
