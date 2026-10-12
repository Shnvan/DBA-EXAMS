/* Relationship contracts compare referenced columns, not displayed SQL spellings. */
function relationshipQueries(sql){const statements=gradingStatements(sql).filter(x=>x.ast.kind==='query');return statements.flatMap(x=>[x.ast.query,...(x.ast.unions||[]).map(u=>u.query)]);}
function relationshipTables(query){return[query.from,...query.joins.map(j=>j.table)].filter(Boolean);}
function relationshipColumns(expression,tableList){if(!expression||expression.kind!=='column')return null;const candidates=expression.qualifier?tableList.filter(t=>t.alias===expression.qualifier||t.n===expression.qualifier):tableList;if(candidates.length!==1)return null;return{alias:candidates[0].alias,column:expression.column.toLowerCase()};}
function relationshipRequiredEdges(query){
 const tables=relationshipTables(query),edges=[];
 const add=(expression,preserved=[])=>{if(!expression)return;if(expression.kind==='binary'&&expression.op==='AND'){add(expression.a,preserved);add(expression.b,preserved);return}if(expression.kind!=='binary'||!['=','<=>'].includes(expression.op))return;const a=relationshipColumns(expression.a,tables),b=relationshipColumns(expression.b,tables);if(a&&b&&a.alias!==b.alias)edges.push({a,b,preserved:preserved.filter(alias=>alias===a.alias||alias===b.alias)});};
 let left=query.from?[query.from.alias]:[];
 for(const join of query.joins){const preserve=join.type==='LEFT'?left.slice():join.type==='RIGHT'?[join.table.alias]:[];if(join.using?.length){for(const column of join.using){const alias=left.find(a=>a!==join.table.alias);if(alias)edges.push({a:{alias,column},b:{alias:join.table.alias,column},preserved:preserve.filter(a=>a===alias||a===join.table.alias)});}}else add(join.on,preserve);left.push(join.table.alias);}
 add(query.where);return edges;
}
function relationshipRoleMappings(reference,actual,base){
 const refs=relationshipTables(reference),acts=relationshipTables(actual),mappings=[];
 if(refs.length!==acts.length)return mappings;
 const same=(r,a)=>r.n===a.n&&(!r.d&&!base||!a.d&&!base||(r.d||base?.current)===(a.d||base?.current));
 const assign=(index,map,used)=>{if(mappings.length>=32)return;if(index===refs.length){mappings.push({...map});return}const r=refs[index];for(const a of acts)if(!used.has(a.alias)&&same(r,a)){map[r.alias]=a.alias;used.add(a.alias);assign(index+1,map,used);used.delete(a.alias);delete map[r.alias];}};
 assign(0,{},new Set());return mappings;
}
function relationshipQueryMatches(reference,actual,base){
 const expected=relationshipRequiredEdges(reference),found=relationshipRequiredEdges(actual),maps=relationshipRoleMappings(reference,actual,base);
 if(!maps.length)return false;
 return maps.some(mapping=>{
  const parent=new Map(),key=column=>column.alias+'.'+column.column,find=k=>{if(!parent.has(k))parent.set(k,k);const p=parent.get(k);if(p!==k)parent.set(k,find(p));return parent.get(k)},connect=(a,b)=>parent.set(find(a),find(b));
  for(const edge of found)connect(key(edge.a),key(edge.b));
  return expected.every(edge=>{
   const a={...edge.a,alias:mapping[edge.a.alias]},b={...edge.b,alias:mapping[edge.b.alias]};
   if(find(key(a))!==find(key(b)))return false;
   /* An outer relationship must keep its specified role. LEFT and reversed RIGHT are equivalent. */
   for(const role of edge.preserved){const alias=mapping[role];if(!found.some(f=>f.preserved.includes(alias)&&find(key(f.a))===find(key(a))&&find(key(f.b))===find(key(b))))return false;}
   return true;
  });
 });
}
function queryConnectionsMatch(sql,reference,base){
 try{const expected=relationshipQueries(reference),actual=relationshipQueries(sql);if(expected.length!==actual.length)return false;
  /* UNION branch order may change without changing the combined relation. */
  const used=new Set();return expected.every(q=>{const i=actual.findIndex((a,i)=>!used.has(i)&&relationshipQueryMatches(q,a,base));if(i<0)return false;used.add(i);return true;});
 }catch(e){return false;}
}
function relationshipProbeValid(session){const previousSession=SESSION,previousDatabase=DB;try{SESSION=session;DB=activeTables(session);validateAllTables();validateReferences();return true}catch(e){return false}finally{SESSION=previousSession;DB=previousDatabase;}}
function relationshipProbeSessions(reference,base){
 const probes=[],seen=new Set();let queries;try{queries=relationshipQueries(reference)}catch(e){return probes}
 const put=probe=>{if(probes.length>=24||!relationshipProbeValid(probe))return;const shape=JSON.stringify(canonicalSession(probe));if(shape===JSON.stringify(canonicalSession(base))||seen.has(shape))return;seen.add(shape);probes.push(probe);};
 for(const query of queries){const refs=relationshipTables(query),byAlias=Object.fromEntries(refs.map(t=>[t.alias,t]));
  /* Reassign complete child references to another existing parent, keeping every constraint valid. */
  for(const ref of refs){const db=ref.d||base.current,child=base.databases[db]?.[ref.n];if(!child)continue;for(const fk of child.foreign||[]){const parentDb=fk.target.d||db,parent=base.databases[parentDb]?.[fk.target.n];if(!parent||!refs.some(t=>t.n===fk.target.n&&(t.d||base.current)===parentDb))continue;
    for(let i=0;i<Math.min(child.rows.length,3);i++)for(const row of parent.rows.slice(0,4)){const s=clone(base),target=s.databases[db][ref.n].rows[i];for(let k=0;k<fk.cols.length;k++)target[fk.cols[k]]=clone(row[fk.refCols[k]]);put(s);}
    if(fk.cols.every(c=>!child.cols.find(x=>K(x)===c)?.nn))for(let i=0;i<Math.min(child.rows.length,2);i++){const s=clone(base);for(const c of fk.cols)s.databases[db][ref.n].rows[i][c]=null;put(s);}
   }}
  /* Prepared tables also teach joins without declaring physical foreign keys. */
  for(const edge of relationshipRequiredEdges(query)){for(const[a,b]of[[edge.a,edge.b],[edge.b,edge.a]]){const ra=byAlias[a.alias],rb=byAlias[b.alias],db=ra?.d||base.current,parentDb=rb?.d||base.current,table=base.databases[db]?.[ra?.n],other=base.databases[parentDb]?.[rb?.n];if(!table||!other)continue;
    const column=table.cols.find(c=>K(c)===a.column);if(!column)continue;for(let i=0;i<Math.min(table.rows.length,2);i++)for(const row of other.rows.slice(0,4)){if(row[b.column]==null)continue;const s=clone(base);s.databases[db][ra.n].rows[i][a.column]=clone(row[b.column]);put(s);}
    if(!column.nn)for(let i=0;i<Math.min(table.rows.length,2);i++){const s=clone(base);s.databases[db][ra.n].rows[i][a.column]=null;put(s);}
   }}
 }
 return probes;
}
