/* Semantic task contracts; learner prose is never parsed as a grading rule. */
function regularTaskContract(q){
 for(let track=0;track<CFG.length+2;track++)for(const [index,task] of TS(track).entries())if(task[2]===q[2]&&task[0]===q[0])return labTaskContent(track,index).requirements;
 return null;
}
function sqlTechniqueProblems(sql,q){
 const contract=regularTaskContract(q);
 if(!contract)return legacySqlTechniqueProblems(sql,q);
 try{
  const statements=gradingStatements(sql),reference=gradingStatements(q[2]);
  if(reference.some(x=>x.part.vertical)&&!statements.some(x=>x.part.vertical))return ['Use the vertical result layout described in the task.'];
  return taskTechniqueProblems(statements.map(x=>x.ast),contract);
 }catch(e){return ['Complete the operation described in the task.'];}
}
function taskTechniqueProblems(asts,contract){
 const nodes=gradingNodes(asts),requirements=contract?.techniques||[],errors=[];
 for(const rule of requirements){
  const kind=typeof rule==='string'?rule:rule.kind;
  const matches={between:()=>nodes.some(n=>n.kind==='between'),like:()=>nodes.some(n=>n.kind==='like'),distinct:()=>nodes.some(n=>n.kind==='select'&&n.distinct),union:()=>nodes.some(n=>n.unions?.length),savepoint:()=>asts.some(n=>n.kind==='savepoint')};
  if(matches[kind]&&!matches[kind]())errors.push('Use the method described in this task.');
 }
 for(const method of contract?.methods||[]){
  if(['module-comment','unsupported-full','unsupported-full-outer'].includes(method))continue;
  if(method==='using'){if(!nodes.some(n=>Array.isArray(n.using)&&n.using.length))errors.push('Use the shared-column-name shortcut described in the task.');}
  else if(method==='tableAlias'){for(const alias of contract.tableAliases||[])if(!nodes.some(n=>n.n===alias.table&&n.alias===alias.alias))errors.push('Use the temporary table name described in the task.');}
  else if(!asts.some(n=>n.kind===method))errors.push('Include the operation described in the task.');
 }
 return errors;
}
/* Keep child definitions compatible with accepted parent schemas. This executes
   only on a grading copy; the user's visible database is never replayed. */
function courseReferenceSql(q,start){
 if(q.kind==='error'||q.kind==='read')return q.sql;
 const schema=restoreSession(start);schema.clock='2026-10-12T00:00:00.000Z';const output=[];
 for(const part of splitStatements(q.sql).filter(p=>tok(p.sql).length)){
  let sql=part.sql;const ast=parse(tok(sql));
  if(ast.kind==='createTable'){
   const tokens=tok(sql),changes=[],fks=ast.defs.filter(d=>d.foreign),adapted=[];
   for(const f of fks){
    const parent=schema.databases[f.target.d||ast.table.d||schema.current]?.[f.target.n];if(!parent)continue;
    for(let i=0;i<f.cols.length;i++){
     const child=ast.defs.find(c=>c.n?.toLowerCase()===f.cols[i]),pc=parent.cols.find(c=>K(c)===f.refCols[i]);
     if(!child||!pc||compatibleFK(child,pc))continue;
     const at=tokens.findIndex(t=>t.pos===child.pos);let end=at+2;
     if(tokens[end]?.v==='('){let depth=0;do{if(tokens[end].v==='(')depth++;if(tokens[end].v===')')depth--;end++}while(depth&&end<tokens.length)}
     if(['UNSIGNED','SIGNED'].includes(tokens[end]?.up))end++;
     changes.push({from:tokens[at+1].pos,to:tokens[end]?.pos??sql.length,text:typeLabel(pc.spec)+' '});
    }
    const key=tableKeys(parent).find(k=>k.cols.length>=f.refCols.length&&JSON.stringify(k.cols.slice(0,f.refCols.length).slice().sort())===JSON.stringify(f.refCols.slice().sort()));
    if(key){const refs=key.cols.slice(0,f.refCols.length);adapted.push({f,cols:refs.map(r=>f.cols[f.refCols.indexOf(r)]),refs})}
   }
   for(const change of changes.sort((a,b)=>b.from-a.from))sql=sql.slice(0,change.from)+change.text+sql.slice(change.to);
   let fkIndex=0;sql=sql.replace(/FOREIGN\s+KEY\s*(?:[`\w]+\s*)?\(([^)]*)\)\s+REFERENCES\s+([^\s(]+)\s*\(([^)]*)\)/gi,(match,_cols,target)=>{const f=fks[fkIndex++],a=adapted.find(x=>x.f===f);return a?'FOREIGN KEY ('+a.cols.map(n=>'`'+n+'`').join(', ')+') REFERENCES '+target+' ('+a.refs.map(n=>'`'+n+'`').join(', ')+')':match});
  }
  output.push(sql.trim()+(part.vertical?' \\G':';'));
  try{exec(sql,schema)}catch(e){break}
 }
 return output.join('\n');
}
function stableAttemptAst(value){
 if(Array.isArray(value))return value.map(stableAttemptAst);
 if(!value||typeof value!=='object')return value;
 const out={};for(const key of Object.keys(value).sort())if(!['pos','spelling','raw','alias','name','indexName','nullDeclared'].includes(key))out[key]=stableAttemptAst(value[key]);
 if(out.defs)out.defs.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return out;
}
function courseErrorMatches(sql,q,start){
 try{
  const actual=gradingStatements(sql).map(x=>x.ast),expected=gradingStatements(q.sql).map(x=>x.ast);
  if(actual.length!==expected.length||actual.some((a,i)=>a.kind!==expected[i].kind||a.table?.n!==expected[i].table?.n||(a.table?.d||start.current)!==(expected[i].table?.d||start.current)))return false;
  if(expected.every(a=>['insert','update','delete'].includes(a.kind))){
   const relax=()=>{const s=restoreSession(start);for(const db of Object.values(s.databases))for(const t of Object.values(db)){t.primary=[];t.foreign=[];t.indexes=(t.indexes||[]).filter(k=>k.nonUnique);for(const c of t.cols){c.pk=0;c.uq=0;c.nn=0}}return s};
   const a=relax(),b=relax();exec(sql,a);exec(q.sql,b);return courseStateMatches(a,b,q);
  }
  return JSON.stringify(stableAttemptAst(actual))===JSON.stringify(stableAttemptAst(expected));
 }catch(e){return false;}
}
function requirementColumnMatches(c,expected,rule){
 if(!rule)return c.t===expected.t;
 const s=c.spec,e=expected.spec;
 if(!!c.nn!==!!expected.nn||!!c.ai!==!!expected.ai||!!c.hasDefault!==!!expected.hasDefault||JSON.stringify(c.default??null)!==JSON.stringify(expected.default??null)||JSON.stringify(c.onUpdate??null)!==JSON.stringify(expected.onUpdate??null))return false;
 if(own(INT_RANGE,e.base)){
  if(!own(INT_RANGE,s.base)||!!s.unsigned!==!!e.unsigned)return false;
  const bounds=spec=>spec.unsigned?[0n,INT_RANGE[spec.base][1]*2n+1n]:INT_RANGE[spec.base];
  const a=bounds(s),b=bounds(e);return a[0]<=b[0]&&a[1]>=b[1];
 }
 if(e.base==='VARCHAR')return s.base==='VARCHAR'&&s.args[0]>=e.args[0];
 if(e.base==='VARBINARY')return s.base==='VARBINARY'&&s.args[0]>=e.args[0];
 if(e.base==='DECIMAL')return s.base==='DECIMAL'&&s.args[1]>=e.args[1]&&s.args[0]-s.args[1]>=e.args[0]-e.args[1]&&!!s.unsigned===!!e.unsigned;
 return typeLabel(s)===typeLabel(e);
}
function semanticSessionShape(session,contract,reference){
 const s=clone(session),expected=reference;
 const cell=v=>v&&typeof v==='object'&&v.num!=null?{num:decimalText(dec(v).n,dec(v).s).replace(/(\.\d*?)0+$/,'$1').replace(/\.$/,'')}:v;
 const dbShape=dbs=>Object.entries(dbs).sort(([a],[b])=>a.localeCompare(b)).map(([d,db])=>[d,Object.entries(db).sort(([a],[b])=>a.localeCompare(b)).map(([name,t])=>{
  const et=expected?.databases[d]?.[name],cols=t.cols.slice().sort((a,b)=>K(a).localeCompare(K(b))),rules=contract?.columns||[];
  const columnShape=cols.map(c=>{const ec=et?.cols.find(x=>K(x)===K(c)),rule=rules.find(r=>r.table===name&&r.name.toLowerCase()===K(c));return[K(c),ec&&requirementColumnMatches(c,ec,rule)?ec.t:c.t,!!c.nn,!!c.ai,!!c.hasDefault,cell(c.default??null),cell(c.onUpdate??null),c.comment||'']});
  const keys=[{cols:t.primary||[],primary:true},...(t.indexes||[]).filter(k=>!k.nonUnique).map(k=>({cols:k.cols,primary:false}))].filter(k=>k.cols.length).map(k=>[!!k.primary,k.cols.slice().sort()]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const indexes=(t.indexes||[]).filter(k=>k.nonUnique).map(k=>[k.name.toLowerCase(),k.cols]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const foreign=(t.foreign||[]).map(f=>[(f.target.d||d),f.target.n,f.cols.map((c,i)=>[c,f.refCols[i]]).sort(([a],[b])=>a.localeCompare(b)),f.onDelete||'RESTRICT',f.onUpdate||'RESTRICT']).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return[name,columnShape,keys,indexes,foreign,t.cols.some(c=>c.ai)?t.next:null,t.comment||'',t.rows.map(row=>cols.map(c=>cell(row[K(c)]??null))).map(r=>JSON.stringify(r)).sort()];
 })]);
 return{current:s.current,databases:dbShape(s.databases),accounts:canonicalSession(s).accounts,autocommit:s.autocommit??1,transaction:s.transaction?dbShape(s.transaction):null,savepoints:Object.entries(s.savepoints).sort(([a],[b])=>a.localeCompare(b)).map(([n,db])=>[n,dbShape(db)])};
}
function courseStateMatches(actual,expected,q){
 const contract=courseTaskContent(q.id)?.requirements||{};
 return JSON.stringify(semanticSessionShape(actual,contract,expected))===JSON.stringify(semanticSessionShape(expected,contract,expected));
}
function queryCardinalityProbes(base,reference){
 const ast=gradingStatements(reference)[0]?.ast;if(ast?.kind!=='query')return[];
 const probes=[];for(const table of gradingNodes(ast).filter(n=>n.n&&n.alias)){const db=table.d||base.current,t=base.databases[db]?.[table.n];if(!t?.rows.length)continue;const s=clone(base);s.databases[db][table.n].rows=[];probes.push(s)}return probes;
}
function courseQueryMatches(sql,q,start){
 try{
  const statements=gradingStatements(q.sql);if(statements.length!==1||statements[0].ast.kind!=='query')return courseReadStepsMatch(sql,courseReferenceSql(q,start),start,q);
  if(typeof queryConnectionsMatch==='function'&&!queryConnectionsMatch(sql,q.sql,start))return false;
  const ordered=!!statements[0].ast.query.order.length;
  for(const probe of [...gradingProbeSessions(q.sql,start),...queryCardinalityProbes(start,q.sql),...(typeof relationshipProbeSessions==='function'?relationshipProbeSessions(q.sql,start):[])]){
   const a=courseAttempt(sql,probe),b=courseAttempt(q.sql,probe);
   if(a.error||b.error||!courseResultsMatch(a.results,b.results,q,sql)||!courseStateMatches(a.session,b.session,q))return false;
  }
  return true;
 }catch(e){return false;}
}
function courseReadStepsMatch(sql,reference,start,q){
 try{
  const reads=text=>{const session=restoreSession(start);session.clock='2026-10-12T00:00:00.000Z';const steps=[];for(const part of splitStatements(text).filter(p=>tok(p.sql).length)){const ast=parse(tok(part.sql)),before=clone(session);const result=exec(part.sql,session);if(result.some(r=>r.rows))steps.push({sql:part.sql,ast,before})}return steps};
  const a=reads(sql),b=reads(reference);if(a.length!==b.length)return false;
  for(let i=0;i<b.length;i++){
   if(b[i].ast.kind==='query'){
    if(a[i].ast.kind!=='query'||typeof queryConnectionsMatch==='function'&&!queryConnectionsMatch(a[i].sql,b[i].sql,b[i].before))return false;
    const query={...q,sql:b[i].sql,kind:'query'};if(!courseQueryMatches(a[i].sql,query,b[i].before))return false;
   }else if(a[i].ast.kind!==b[i].ast.kind)return false;
  }
  return true;
 }catch(e){return false;}
}
function taskResultSetsEquivalent(actual,expected,reference,ordered){
 const asts=gradingStatements(reference).map(x=>x.ast),mixed=asts.some(a=>!['query','describe','showTables','showDatabases','showIndex','showTableStatus','showGrants'].includes(a.kind)),indices=expected.map((r,i)=>r.rows?i:-1).filter(i=>i>=0);
 if(mixed){actual=actual.filter(r=>r.rows);expected=expected.filter(r=>r.rows)}
 if(actual.length!==expected.length)return false;
 for(let i=0;i<expected.length;i++){
  const a=actual[i],b=expected[i];if(!!a.rows!==!!b.rows)return false;
  if(!b.rows){if((a.affectedRows||0)!==(b.affectedRows||0)||(a.msg==='Database changed')!==(b.msg==='Database changed'))return false;continue;}
  if(a.cols.length!==b.cols.length||!!a.vertical!==!!b.vertical)return false;
  const items=asts[mixed?indices[i]:i]?.query?.items;
  for(let k=0;k<b.cols.length;k++){
   const item=items?.[k],normalize=x=>String(x).toLowerCase().replace(/\s+/g,'');
   if(!item||Object.hasOwn(item,'star')||item.alias){if(normalize(a.cols[k])!==normalize(b.cols[k]))return false;}
   else if(item.expr?.kind==='column'&&normalize(a.cols[k]).split('.').pop()!==normalize(b.cols[k]).split('.').pop())return false;
  }
  const rows=r=>ordered?r:r.slice().sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)));
  if(JSON.stringify(rows(a.rows))!==JSON.stringify(rows(b.rows)))return false;
 }
 return true;
}
function taskSelectMatches(sql,reference,session,ordered){try{return taskResultSetsEquivalent(exec(sql,clone(session)),exec(reference,clone(session)),reference,ordered)}catch(e){return false}}
function regularTaskMatches(sql,q){
 const contract=regularTaskContract(q)||{};
 try{
  const clock=new Date().toISOString(),a=newSession(),b=newSession();a.clock=clock;b.clock=clock;
  if(typeof queryConnectionsMatch==='function'&&!queryConnectionsMatch(sql,q[2],newSession()))return false;
  const ar=exec(sql,a),br=exec(q[2],b),ordered=/\bORDER\s+BY\b/i.test(q[2]);
  if(!taskResultSetsEquivalent(ar,br,q[2],ordered))return false;
  const warnings=rs=>rs.flatMap(r=>(r.warnings||[]).map(w=>w.code)).sort((a,b)=>a-b).join(',');if(warnings(ar)!==warnings(br))return false;
  if(!courseReadStepsMatch(sql,q[2],newSession(),{id:'regular-task',sql:q[2],kind:'mutation'}))return false;
  return JSON.stringify(semanticSessionShape(a,contract,b))===JSON.stringify(semanticSessionShape(b,contract,b));
 }catch(e){return false;}
}
