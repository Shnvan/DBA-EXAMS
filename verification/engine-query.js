function walk(e,fn){if(!e)return;fn(e);for(const k of ['a','b','lo','hi'])if(e[k])walk(e[k],fn);(e.args||[]).forEach(x=>walk(x,fn))}
function hasAggregate(e){let result=false;walk(e,x=>{if(x.aggregate)result=true});return result}
function bind(expr,scope,clause,aliases={},allowAggregate=true){
 if(!expr)return expr;
 const e={...expr};
 if(e.kind=='column'){
  if(!e.qualifier&&own(aliases,e.column))return{kind:'output',index:aliases[e.column],pos:e.pos};
  const candidates=(e.qualifier?scope.all.filter(c=>c.alias==e.qualifier):scope.visible).filter(c=>c.name.toLowerCase()==e.column);
  if(!candidates.length)throw E(1054,'42S22',`Unknown column '${e.spelling}' in '${clause}'`,e.pos);
  if(candidates.length>1)throw E(1052,'23000',`Column '${e.spelling}' in ${clause} is ambiguous`,e.pos);
  const c=candidates[0];return{kind:'bound',keys:c.keys||[c.alias+'.'+e.column],spec:c.spec,pos:e.pos};
 }
 if(e.aggregate&&!allowAggregate)throw E(1111,'HY000','Invalid use of group function',e.pos);
 if(e.aggregate&&e.args.some(hasAggregate))throw E(1111,'HY000','Invalid use of group function',e.pos);
 for(const k of ['a','b','lo','hi'])if(e[k])e[k]=bind(e[k],scope,clause,aliases,allowAggregate);
 if(e.args)e.args=e.args.map(x=>bind(x,scope,clause,aliases,allowAggregate));return e;
}
function evaluate(e,row={},group=[],output=[]){
 if(!e)return null;const ev=x=>evaluate(x,row,group,output);
 if(e.kind=='literal')return e.value;if(e.kind=='default')return undefined;
 if(e.kind=='bound'){for(const key of e.keys)if(row[key]!=null)return row[key];return null}
 if(e.kind=='output')return output[e.index];
 if(e.kind=='variable')return e.name=='sql_mode'?SESSION.sqlMode:SESSION.autocommit??1;
 if(e.kind=='unary'){const a=ev(e.a);if(a==null)return null;return e.op=='NOT'?1-tv(a):e.op=='-'?arithmetic('-',0,a):numeric(a)?a:number(a)}
 if(e.kind=='binary'){
  const a=ev(e.a);if(e.op=='AND'&&tv(a)===0)return 0;if(e.op=='OR'&&tv(a)===1)return 1;const b=ev(e.b);
  if(e.op=='AND')return tv(b)===0?0:a==null||b==null?null:1;if(e.op=='OR')return tv(b)===1?1:a==null||b==null?null:0;
  if(['+','-','*','/','%','DIV'].includes(e.op))return arithmetic(e.op,a,b);
  if(e.op=='<=>')return a==null||b==null?+(a==null&&b==null):+(cmp(a,b)==0);
  if(a==null||b==null)return null;const c=cmp(a,b);return +(e.op=='='?c==0:e.op=='<'?c<0:e.op=='>'?c>0:e.op=='<='?c<=0:e.op=='>='?c>=0:c!=0);
 }
 if(e.kind=='between'){const v=ev(e.a),l=ev(e.lo),h=ev(e.hi);let result;if(v==null)result=null;else{const lo=l==null?null:+(cmp(v,l)>=0),hi=h==null?null:+(cmp(v,h)<=0);result=lo===0||hi===0?0:lo==null||hi==null?null:1}return result==null?null:e.neg?1-result:result}
 if(e.kind=='in'){const a=ev(e.a);if(a==null)return null;let unknown=false,result=0;for(const x of e.args){const b=ev(x);if(b==null)unknown=true;else if(cmp(a,b)==0){result=1;break}}if(!result&&unknown)return null;return e.neg?1-result:result}
 if(e.kind=='is'){const a=ev(e.a),result=e.test==null?+(a==null):+(a!=null&&tv(a)==e.test);return e.neg?1-result:result}
 if(e.kind=='like'){const a=ev(e.a),b=ev(e.b);if(a==null||b==null)return null;let regex='^',pattern=sqlString(b);for(let i=0;i<pattern.length;i++){let c=pattern[i];if(c=='\\'&&i+1<pattern.length)c=pattern[++i];else if(c=='%'){regex+='[\\s\\S]*';continue}else if(c=='_'){regex+='[\\s\\S]';continue}regex+=c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}regex+='$';const result=+new RegExp(regex,'iu').test(sqlString(a));return e.neg?1-result:result}
 if(e.kind=='function'){
  if(e.aggregate){let values=e.star?group.map(()=>1):group.map(r=>evaluate(e.args[0],r,group)).filter(x=>x!=null);if(e.distinct){const seen=new Set();values=values.filter(x=>{const k=rowKey([x]);if(seen.has(k))return false;seen.add(k);return true})}if(e.name=='COUNT')return values.length;if(!values.length)return null;if(e.name=='SUM'||e.name=='AVG'){const sum=values.reduce((a,b)=>arithmetic('+',a,b),0);if(e.name=='SUM')return sum;return arithmetic('/',sum,values.length)}return values.reduce((a,b)=>(e.name=='MIN'?cmp(a,b)<=0:cmp(a,b)>=0)?a:b)}
  if(e.name=='COALESCE'||e.name=='IFNULL'){const string=e.args.some(a=>! /^(?:null|int|smallint|tinyint|mediumint|bigint|decimal|float|double|year)/.test(expressionType(a)));for(const a of e.args){const v=ev(a);if(v!=null)return string?sqlString(v):v}return null}
  if(e.name=='DATABASE')return SESSION.current;if(e.name=='USER')return SESSION.user+'@localhost';if(e.name=='VERSION')return'10.4.32-MariaDB (offline practice)';
  const args=e.args.map(ev),a=args[0];if(e.name=='CONCAT')return args.some(x=>x==null)?null:args.map(sqlString).join('');if(a==null)return null;
  if(e.name=='JSON_VALID'){try{parseJsonDocument(a);return 1}catch(error){return 0}}
  if(e.name=='JSON_UNQUOTE'){const text=sqlString(a);if(!text.startsWith('"'))return text;try{return JSON.parse(text)}catch(error){throw E(4038,'HY000','Syntax error in JSON text')}}
  if(e.name=='JSON_EXTRACT'){if(args.some(x=>x==null))return null;let document;try{document=parseJsonDocument(a)}catch(error){throw E(4038,'HY000','Syntax error in JSON text')};const matches=args.slice(1).map(p=>extractJsonPath(document,p)),values=matches.flatMap(x=>x.values);return !values.length?null:JSON.stringify(args.length>2||matches.some(x=>x.multi)?values:values[0])}
  if(['ST_GEOMFROMTEXT','ST_GEOMETRYFROMTEXT','GEOMFROMTEXT','GEOMETRYFROMTEXT','ST_POINTFROMTEXT','ST_LINESTRINGFROMTEXT','ST_POLYGONFROMTEXT'].includes(e.name)){const g=geometryFromText(a,args.length>1?args[1]:0),expected={ST_POINTFROMTEXT:'POINT',ST_LINESTRINGFROMTEXT:'LINESTRING',ST_POLYGONFROMTEXT:'POLYGON'}[e.name];return expected&&g?.geometry!==expected?null:g}
  if(e.name=='POINT'){if(args[1]==null)return null;return geometryFromText('POINT('+number(a)+' '+number(args[1])+')')}
  if(['ST_ASTEXT','ASTEXT','ST_SRID'].includes(e.name)){if(!a?.geometry)throw E(3037,'22023','Invalid GIS data provided to function');return e.name=='ST_SRID'?a.srid:a.wkt}
  if(e.name=='UPPER')return sqlString(a).toUpperCase();if(e.name=='LOWER')return sqlString(a).toLowerCase();if(e.name=='LENGTH')return unescape(encodeURIComponent(sqlString(a))).length;
  if(e.name=='ROUND'){const scale=args.length==1?0:Math.trunc(number(args[1]));if(scale>=0)return exact(numeric(a)?a:number(a),Math.min(scale,30));const d=dec(a),div=10n**BigInt(d.s-scale),negative=d.n<0n;let n=negative?-d.n:d.n;n=((n+div/2n)/div)*10n**BigInt(-scale);return exact({num:String(negative?-n:n)},0)}
 }throw unsupported('Expression is outside the practice engine.',e.pos);
}
const project=(ref,table,row)=>Object.fromEntries(table.cols.map(c=>[ref.alias+'.'+K(c),row[K(c)]??null]));
function tableScope(ref){const table=tbl0(ref);permit('SELECT',ref);const all=table.cols.map(c=>({alias:ref.alias,name:c.n,spec:c.spec}));return{table,all,visible:all.slice()}}
function prepareQuery(q){
 let scope={all:[],visible:[]},rows=[{}],aliasesSeen=new Set();
 if(q.from){scope=tableScope(q.from);rows=scope.table.rows.map(r=>project(q.from,scope.table,r));aliasesSeen.add(q.from.alias)}
 for(const j of q.joins){if(aliasesSeen.has(j.table.alias))throw E(1066,'42000',`Not unique table/alias: '${j.table.alias}'`,j.table.pos);aliasesSeen.add(j.table.alias);const right=tableScope(j.table),merged={all:scope.all.concat(right.all),visible:scope.visible.concat(right.visible)};
  let on=j.on?bind(j.on,merged,'on clause',{},false):null;
  if(j.using){if(new Set(j.using).size!=j.using.length)throw E(1060,'42S21',`Duplicate column name '${j.using.find((x,i,a)=>a.indexOf(x)!=i)}'`);const common=[];for(const name of j.using){const l=scope.visible.filter(c=>c.name.toLowerCase()==name),r=right.visible.filter(c=>c.name.toLowerCase()==name);if(!l.length||!r.length)throw E(1054,'42S22',`Unknown column '${name}' in 'from clause'`,j.table.pos);if(l.length>1)throw E(1052,'23000',`Column '${name}' in from clause is ambiguous`,j.table.pos);const left={kind:'bound',keys:l[0].keys||[l[0].alias+'.'+name]},rgt={kind:'bound',keys:[r[0].alias+'.'+name]},eq={kind:'binary',op:'=',a:left,b:rgt};on=on?{kind:'binary',op:'AND',a:on,b:eq}:eq;common.push({...l[0],keys:left.keys.concat(rgt.keys)})}merged.visible=common.concat(scope.visible.filter(c=>!j.using.includes(c.name.toLowerCase())),right.visible.filter(c=>!j.using.includes(c.name.toLowerCase())))}
  const rightRows=right.table.rows.map(r=>project(j.table,right.table,r)),nullRight=project(j.table,right.table,{}),nullLeft=Object.fromEntries(scope.all.map(c=>[c.alias+'.'+c.name.toLowerCase(),null])),joined=[],used=new Set();
  for(const left of rows){let matched=false;rightRows.forEach((r,n)=>{const combined={...left,...r};if(!on||tv(evaluate(on,combined))===1){joined.push(combined);matched=true;used.add(n)}});if(!matched&&j.type=='LEFT')joined.push({...left,...nullRight})}
  if(j.type=='RIGHT')rightRows.forEach((r,n)=>{if(!used.has(n))joined.push({...nullLeft,...r})});rows=joined;scope=merged;
 }
 const items=[];for(const x of q.items){if(x.star!=null){const cols=x.star?scope.all.filter(c=>c.alias==x.star):scope.visible;if(x.star&&!cols.length)throw E(1051,'42S02',`Unknown table '${x.star}'`,x.pos);if(!q.from)throw E(1096,'HY000','No tables used',x.pos);cols.forEach(c=>items.push({label:c.name,expr:{kind:'bound',keys:c.keys||[c.alias+'.'+c.name.toLowerCase()],spec:c.spec}}))}else items.push({...x,expr:bind(x.expr,scope,'field list')})}
 const outputAliases=Object.create(null);items.forEach((x,k)=>outputAliases[x.label.toLowerCase()]=k);
 const where=bind(q.where,scope,'where clause',{},false);
 const group=q.group.map(e=>{if(e.kind=='literal'&&typeof e.value=='number'&&Number.isInteger(e.value)){if(e.value<1||e.value>items.length)throw E(1054,'42S22',`Unknown column '${e.value}' in 'group statement'`,e.pos);return items[e.value-1].expr}if(e.kind=='column'&&!e.qualifier&&own(outputAliases,e.column))return items[outputAliases[e.column]].expr;return bind(e,scope,'group statement',{},false)});
 const having=bind(q.having,scope,'having clause',outputAliases),order=q.order.map(o=>{let expr=o.expr;if(expr.kind=='literal'&&typeof expr.value=='number'&&Number.isInteger(expr.value)){if(expr.value<1||expr.value>items.length)throw E(1054,'42S22',`Unknown column '${expr.value}' in 'order clause'`,expr.pos);expr={kind:'output',index:expr.value-1}}else expr=bind(expr,scope,'order clause',outputAliases);return{expr,dir:o.dir}});
 const aggregate=items.some(x=>hasAggregate(x.expr))||hasAggregate(having)||order.some(x=>hasAggregate(x.expr));
 return{q,rows,items,where,group,having,order,aggregate};
}
function expressionType(e){if(e.spec)return typeLabel(e.spec);if(e.kind=='literal')return e.value==null?'null':numeric(e.value)?e.value?.num?.includes('.')?'decimal':'bigint':e.value?.hex?'varbinary':'varchar';if(e.kind=='unary')return e.op=='NOT'?'bigint':expressionType(e.a);if(e.kind=='binary')return ['+','-','*','/','%','DIV'].includes(e.op)?e.op=='/'||expressionType(e.a).startsWith('decimal')||expressionType(e.b).startsWith('decimal')?'decimal':'bigint':'bigint';if(['in','is','like','between','variable'].includes(e.kind))return e.kind=='variable'&&e.name=='sql_mode'?'varchar':'bigint';if(e.kind=='function'){if(['SUM','AVG','ROUND'].includes(e.name))return'decimal';if(['COUNT','LENGTH'].includes(e.name))return'bigint';if(['MIN','MAX'].includes(e.name))return expressionType(e.args[0]);if(['IFNULL','COALESCE'].includes(e.name)){const t=e.args.map(expressionType).filter(t=>t!='null');return t.some(t=>! /^(?:int|smallint|tinyint|mediumint|bigint|decimal|float|double|year)/.test(t))?'varchar':t.some(t=>t.startsWith('decimal'))?'decimal':t[0]||'null'}return'varchar'}return'expression'}
function runPrepared(p){
 let rows=p.where?p.rows.filter(r=>tv(evaluate(p.where,r))===1):p.rows,groups;
 if(p.aggregate||p.group.length){const map=new Map();rows.forEach(r=>{const k=rowKey(p.group.map(e=>evaluate(e,r)));if(!map.has(k))map.set(k,[]);map.get(k).push(r)});if(!map.size&&!p.group.length)map.set('',[]);groups=[...map.values()]}else groups=rows.map(r=>[r]);
 let output=groups.map(g=>{const row=g[0]||{};const values=p.items.map(x=>evaluate(x.expr,row,g));return{values,row,group:g}});
 if(p.having)output=output.filter(o=>tv(evaluate(p.having,o.row,o.group,o.values))===1);
 if(p.q.distinct){const seen=new Set();output=output.filter(o=>{const key=rowKey(o.values);if(seen.has(key))return false;seen.add(key);return true})}
 if(p.order.length)output.sort((a,b)=>{for(const o of p.order){const c=cmp(evaluate(o.expr,a.row,a.group,a.values),evaluate(o.expr,b.row,b.group,b.values));if(c)return c*o.dir}return 0});
 if(p.q.limit!=null)output=output.slice(p.q.offset,p.q.offset+p.q.limit);
 return{cols:p.items.map(x=>x.label),rows:output.map(o=>o.values.map(resultValue)),types:p.items.map(x=>expressionType(x.expr))};
}
function runQuery(st){const prepared=[st.query,...st.unions.map(x=>x.query)].map(prepareQuery);const length=prepared[0].items.length;if(prepared.some(p=>p.items.length!=length))throw E(1222,'21000','The used SELECT statements have a different number of columns',st.pos);const all=prepared.map(runPrepared),r=all[0];if(!st.unions.length)return r;const numericType=t=>/^(?:bigint|int|smallint|tinyint|mediumint|decimal|float|double|year)/.test(t);r.types=r.types.map((t,k)=>all.some(x=>x.types[k]!='null'&&!numericType(x.types[k]))?'varchar':all.some(x=>x.types[k].startsWith('decimal'))?'decimal':'bigint');const convert=rows=>rows.map(row=>row.map((v,k)=>v==null?null:r.types[k]=='varchar'?sqlString(v):v));r.rows=convert(r.rows);st.unions.forEach((u,i)=>{r.rows=r.rows.concat(convert(all[i+1].rows));if(!u.all){const seen=new Set();r.rows=r.rows.filter(row=>{const key=JSON.stringify(row.map(v=>typeof v=='string'?collate(v):v));if(seen.has(key))return false;seen.add(key);return true})}});const aliases=Object.fromEntries(r.cols.map((c,i)=>[c.toLowerCase(),i])),scope={all:[],visible:[]};const order=(st.order||[]).map(o=>{let e=o.expr;if(e.kind=='column'&&e.qualifier)throw E(1250,'42000',`Table '${e.qualifier}' from one of the SELECTs cannot be used in ORDER clause`,e.pos);if(e.kind=='literal'&&Number.isInteger(e.value)){if(e.value<1||e.value>r.cols.length)throw E(1054,'42S22',`Unknown column '${e.value}' in 'order clause'`,e.pos);e={kind:'output',index:e.value-1}}else e=bind(e,scope,'order clause',aliases);return{expr:e,dir:o.dir}});if(order.length)r.rows.sort((a,b)=>{for(const o of order){const c=cmp(evaluate(o.expr,{},[],a),evaluate(o.expr,{},[],b));if(c)return c*o.dir}return 0});if(st.limit!=null)r.rows=r.rows.slice(st.offset||0,(st.offset||0)+st.limit);return r}
