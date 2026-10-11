function parse(T,typeOnly=false){
 let i=0;const peek=()=>T[i]||{pos:T.length?T[T.length-1].end:0},isk=k=>peek().k=='w'&&!peek().quoted&&peek().up==k,isp=p=>peek().k=='p'&&peek().v==p;
 const ek=k=>isk(k)&&!!(++i),ep=p=>isp(p)&&!!(++i),bad=()=>{throw syn(T.slice(i,i+5).map(t=>t.raw).join(' '),peek().pos)},nk=k=>ek(k)||bad(),np=p=>ep(p)||bad();
 const word=(allowReserved=false)=>{const t=peek();if(t.k!='w'||!allowReserved&&!t.quoted&&RES.has(t.up))bad();i++;return t.v};
 const ident=()=>{const pos=peek().pos;let n=word().toLowerCase(),d;if(ep('.')){d=n;n=word().toLowerCase()}return{n,d,pos}};
 const list=fn=>{const a=[fn()];while(ep(','))a.push(fn());return a};
 const literal=()=>{let sign=1;if(ep('-'))sign=-1;else ep('+');const t=peek();if(t.k=='n'){i++;return sign==-1?arithmetic('-',0,t.v):t.v}if(t.k=='s'){i++;return t.v}if(ek('NULL'))return null;if(ek('TRUE'))return 1;if(ek('FALSE'))return 0;bad()};
 function type(){
  const pos=peek().pos;let base=word(true).toUpperCase();if(!TYPE_NAMES.has(base))throw syn(base,pos);
  if(base=='DOUBLE')ek('PRECISION');if(base=='CHARACTER')base=ek('VARYING')?'VARCHAR':'CHAR';
  base=({INTEGER:'INT',NUMERIC:'DECIMAL',REAL:'DOUBLE',BOOLEAN:'TINYINT',BOOL:'TINYINT'})[base]||base;
  const s={base,args:[],unsigned:false};
  if(ep('(')){if(['ENUM','SET'].includes(base)){s.args=list(()=>{if(peek().k!='s')bad();return T[i++].v})}else{s.args=list(()=>{const t=peek();if(t.k!='n'||typeof t.v!='number'||!Number.isInteger(t.v)||t.v<0)bad();i++;return t.v})}np(')')}
  if(ek('UNSIGNED'))s.unsigned=true;else ek('SIGNED');
  if(['BOOLEAN','BOOL'].includes((T.find(x=>x.pos==pos)||{}).up))s.args=[1];
  if(base=='DECIMAL'){if(!s.args.length)s.args=[10,0];else if(s.args.length==1)s.args.push(0);if(s.args.length!=2||s.args[0]<1||s.args[0]>65||s.args[1]>30||s.args[1]>s.args[0])throw E(1426,'42000',`Too big precision or scale specified for column`,pos)}
  else if(['CHAR','BINARY'].includes(base)){if(!s.args.length)s.args=[1];if(s.args.length!=1||s.args[0]>255)throw E(1074,'42000',`Column length too big for column (max = 255)`,pos)}
  else if(['VARCHAR','VARBINARY'].includes(base)){if(s.args.length!=1)bad();if(s.args[0]>65535)throw E(1074,'42000','Column length too big (max = 65535)',pos)}
  else if(['ENUM','SET'].includes(base)){if(!s.args.length)bad();if(base=='SET'&&s.args.length>64)throw E(1097,'HY000','Too many strings for column',pos);if(new Set(s.args.map(collate)).size!=s.args.length)throw E(1291,'HY000','Column has duplicated value in ENUM/SET',pos)}
  else if(['TIME','DATETIME','TIMESTAMP'].includes(base)){if(s.args.length>1||s.args[0]>6)throw E(1426,'42000','Too big precision specified. Maximum is 6',pos)}
  else if(INT_RANGE[base]||base=='YEAR'){if(s.args.length>1)bad();if(base=='YEAR'&&s.args.length&&s.args[0]!=4)throw unsupported('Only four-digit YEAR is supported in this practice engine.',pos)}
  else if(['FLOAT','DOUBLE'].includes(base)){if(s.args.length>2)bad();if(s.args.length==1){if(s.args[0]>53)throw E(1439,'42000','Display width out of range for column',pos);if(base=='FLOAT'&&s.args[0]>24)s.base='DOUBLE';s.args=[]}}
  else if(s.args.length)bad();return s;
 }
 if(typeOnly){const result=type();if(i<T.length)bad();return result}
 const node=(kind,props,pos)=>({kind,...props,pos});
 const binary=(op,a,b,pos)=>node('binary',{op,a,b},pos);
 function or(){let a=and();while(isk('OR')||isp('||')){const p=peek().pos;i++;a=binary('OR',a,and(),p)}return a}
 function and(){let a=not();while(isk('AND')||isp('&&')){const p=peek().pos;i++;a=binary('AND',a,not(),p)}return a}
 function not(){if(ek('NOT'))return node('unary',{op:'NOT',a:not()},T[i-1].pos);return comparison()}
 function comparison(){let a=add();for(;;){if(['REGEXP','RLIKE','XOR'].includes(peek().up))throw unsupported(`${peek().up} is outside the supported module operators.`,peek().pos);let neg=false;const p=peek().pos;if(isk('NOT')&&['BETWEEN','IN','LIKE'].includes(T[i+1]?.up)){i++;neg=true}
   if(ek('BETWEEN')){const lo=add();nk('AND');a=node('between',{a,lo,hi:add(),neg},p)}
   else if(ek('IN')){np('(');if(isk('SELECT'))throw unsupported('Subqueries are outside this module practice engine.',peek().pos);const args=list(or);np(')');a=node('in',{a,args,neg},p)}
   else if(ek('LIKE'))a=node('like',{a,b:add(),neg},p);
   else if(ek('IS')){const negate=ek('NOT');if(ek('NULL'))a=node('is',{a,test:null,neg:negate},p);else if(ek('TRUE'))a=node('is',{a,test:1,neg:negate},p);else if(ek('FALSE'))a=node('is',{a,test:0,neg:negate},p);else bad()}
   else if(peek().k=='p'&&['=','<','>','<=','>=','<>','!=','<=>'].includes(peek().v)){const op=T[i++].v;a=binary(op,a,add(),p)}else break;
  }return a}
 function add(){let a=mul();while(isp('+')||isp('-')){const t=T[i++];a=binary(t.v,a,mul(),t.pos)}return a}
 function mul(){let a=primary();while(isp('*')||isp('/')||isp('%')||isk('DIV')||isk('MOD')){const t=T[i++];a=binary(t.up=='MOD'?'%':t.up||t.v,a,primary(),t.pos)}return a}
 function primary(){const t=peek();if(t.k=='n'||t.k=='s'){i++;return node('literal',{value:t.v},t.pos)}if(ep('(')){if(isk('SELECT'))throw unsupported('Subqueries are outside this practice engine.',peek().pos);const a=or();np(')');return a}
  if(ep('-'))return node('unary',{op:'-',a:primary()},t.pos);if(ep('+'))return node('unary',{op:'+',a:primary()},t.pos);if(ep('!'))return node('unary',{op:'NOT',a:primary()},t.pos);
  if(ek('NULL'))return node('literal',{value:null},t.pos);if(ek('TRUE'))return node('literal',{value:1},t.pos);if(ek('FALSE'))return node('literal',{value:0},t.pos);
  if(ep('@')){if(ep('@')){const name=word(true).toLowerCase();if(!['sql_mode','autocommit'].includes(name))throw unsupported('Only @@sql_mode and @@autocommit are available.',t.pos);return node('variable',{name},t.pos)}throw unsupported('User variables are outside the module. Use table and column identifiers in the exercises.',t.pos)}
  if(['CASE','EXISTS'].includes(t.up)&&!t.quoted)throw unsupported(`${t.up} expressions are outside the supported module forms.`,t.pos);
  const name=word();if(ep('(')){const f=name.toUpperCase();if(['CAST','CONVERT'].includes(f))throw unsupported(`${f} expressions are outside the supported module forms.`,t.pos);const distinct=ek('DISTINCT');let star=ep('*'),args=[];if(!star&&!isp(')'))args=list(or);np(')');const aggregate=['COUNT','SUM','AVG','MIN','MAX'].includes(f);
   const arity={COALESCE:[1,Infinity],IFNULL:[2,2],UPPER:[1,1],LOWER:[1,1],CONCAT:[1,Infinity],ROUND:[1,2],LENGTH:[1,1],DATABASE:[0,0],USER:[0,0],VERSION:[0,0],JSON_VALID:[1,1],JSON_EXTRACT:[2,99],JSON_UNQUOTE:[1,1],ST_GEOMFROMTEXT:[1,2],ST_GEOMETRYFROMTEXT:[1,2],GEOMFROMTEXT:[1,2],GEOMETRYFROMTEXT:[1,2],ST_POINTFROMTEXT:[1,2],ST_LINESTRINGFROMTEXT:[1,2],ST_POLYGONFROMTEXT:[1,2],ST_ASTEXT:[1,1],ASTEXT:[1,1],POINT:[2,2],ST_SRID:[1,1]};
   if(!aggregate&&!arity[f]){if(['ABS','CAST','CONVERT','CURDATE','CURTIME','NOW','CURRENT_TIMESTAMP','DATE','DATEDIFF','DATE_FORMAT','SUBSTRING','SUBSTR','TRIM','REPLACE','IF','NULLIF','CEIL','CEILING','FLOOR','RAND','CHAR_LENGTH','YEAR','MONTH','DAY','JSON_EXTRACT'].includes(f))throw unsupported(`Native function ${f} is outside the supported module forms.`,t.pos);throw E(1305,'42000',`FUNCTION ${SESSION?.current||'practice'}.${name} does not exist`,t.pos)}
   if(star&&f!='COUNT'||distinct&&!aggregate)throw syn(name,t.pos);
   if(aggregate&&!star&&args.length!=1)throw E(1582,'42000',`Incorrect parameter count in the call to native function '${f}'`,t.pos);
   if(!aggregate&&(args.length<arity[f][0]||args.length>arity[f][1]))throw E(1582,'42000',`Incorrect parameter count in the call to native function '${f}'`,t.pos);
   return node('function',{name:f,args,star,distinct,aggregate},t.pos);
  }
  let qualifier=null,column=name;if(ep('.')){qualifier=column;column=word()}return node('column',{qualifier:qualifier?.toLowerCase(),column:column.toLowerCase(),spelling:qualifier?qualifier+'.'+column:column},t.pos);
 }
 function tableRef(){if(isp('('))throw unsupported('Derived tables and subqueries are outside the supported module forms.',peek().pos);const r=ident();r.alias=r.n;if(ek('AS'))r.alias=word().toLowerCase();else if(peek().k=='w'&&(peek().quoted||!RES.has(peek().up)))r.alias=word().toLowerCase();return r}
 function select(){const q={kind:'select',distinct:ek('DISTINCT'),items:[],joins:[],group:[],order:[],pos:peek().pos};
  q.items=list(()=>{if(ep('*'))return{star:'',pos:T[i-1].pos};if(peek().k=='w'&&T[i+1]?.v=='.'&&T[i+2]?.v=='*'){const t=T[i];i+=3;return{star:t.v.toLowerCase(),pos:t.pos}}
   const start=i,expr=or();let alias;if(ek('AS'))alias=peek().k=='s'?T[i++].v:word();else if(peek().k=='w'&&(peek().quoted||!RES.has(peek().up)))alias=word();
   const expressionEnd=alias?(T[i-2]?.up=='AS'?T[i-3]?.end:T[i-2]?.end):T[i-1]?.end;
   let label=alias|| (expr.kind=='column'?expr.spelling.split('.').pop():expr.kind=='literal'?T[start]?.k=='s'?sqlString(expr.value):T[start]?.raw:T.sql?.slice(T[start].pos,expressionEnd)||T.slice(start,i).map(x=>x.raw).join(' '));return{expr,label,alias,pos:expr.pos};
  });
  if(ek('FROM')){q.from=tableRef();for(;;){if(['NATURAL','STRAIGHT_JOIN'].includes(peek().up))throw unsupported(`${peek().up} joins are outside the supported module forms.`,peek().pos);let joinType='INNER',had=false;if(ek('INNER'))had=true;else if(ek('LEFT')){joinType='LEFT';had=true;ek('OUTER')}else if(ek('RIGHT')){joinType='RIGHT';had=true;ek('OUTER')}else if(ek('CROSS')){joinType='CROSS';had=true}else if(isk('FULL'))bad();if(!ek('JOIN')){if(had)bad();if(ep(',')){q.joins.push({type:'CROSS',table:tableRef()});continue}break}
   const j={type:joinType,table:tableRef()};if(ek('ON'))j.on=or();else if(ek('USING')){np('(');j.using=list(()=>word().toLowerCase());np(')')}else if(['LEFT','RIGHT'].includes(joinType))bad();q.joins.push(j);
  }}
  if(ek('WHERE'))q.where=or();if(ek('GROUP')){nk('BY');q.group=list(or)}if(ek('HAVING'))q.having=or();if(ek('ORDER')){nk('BY');q.order=list(()=>{const expr=or();let dir=1;if(ek('DESC'))dir=-1;else ek('ASC');return{expr,dir}})}
  if(ek('LIMIT')){const n=()=>{const t=peek();if(t.k!='n'||typeof t.v!='number'||!Number.isInteger(t.v)||t.v<0)bad();i++;return t.v};q.limit=n();q.offset=0;if(ep(',')){q.offset=q.limit;q.limit=n()}else if(ek('OFFSET'))q.offset=n()}
  return q;
 }
 function colDef(){const pos=peek().pos,n=word(),spec=type(),c={n,spec,t:typeLabel(spec),pk:0,nn:0,ai:0,uq:0,pos};
  const currentTime=()=>{if(!ek('CURRENT_TIMESTAMP'))return false;let precision=0;if(ep('(')){if(!ep(')')){precision=literal();np(')')}}return{currentTimestamp:true,precision}};
  for(;;){if(ek('PRIMARY')){nk('KEY');c.pk=1;c.nn=1}else if(ek('NOT')){nk('NULL');c.nn=1;c.nullDeclared='NOT NULL'}else if(ek('NULL')){c.nn=0;c.nullDeclared='NULL'}else if(ek('AUTO_INCREMENT'))c.ai=1;else if(ek('UNIQUE')){ek('KEY');c.uq=1}else if(ek('DEFAULT')){c.hasDefault=true;c.default=currentTime()||literal()}else if(ek('ON')){nk('UPDATE');c.onUpdate=currentTime();if(!c.onUpdate)bad()}else if(ek('COMMENT')){if(peek().k!='s')bad();c.comment=T[i++].v}else if(ek('REFERENCES')){c.reference=ident();np('(');c.refCols=list(()=>word().toLowerCase());np(')')}else break}return c;
 }
 function keyCols(){np('(');const cols=list(()=>word().toLowerCase());np(')');return cols}
 function definition(){let constraint;if(ek('CONSTRAINT'))constraint=word();if(ek('PRIMARY')){nk('KEY');return{key:'PRIMARY',cols:keyCols()}}if(ek('UNIQUE')){ek('KEY')||ek('INDEX');let name;if(!isp('('))name=word();return{key:name||constraint||'',unique:true,cols:keyCols()}}if(ek('KEY')||ek('INDEX')){const name=isp('(')?'':word();return{key:name,nonUnique:1,cols:keyCols()}}if(ek('FOREIGN')){nk('KEY');let indexName;if(!isp('('))indexName=word();const cols=keyCols();nk('REFERENCES');const target=ident(),refCols=keyCols();let onDelete='RESTRICT',onUpdate='RESTRICT';const used=new Set();while(ek('ON')){const event=ek('DELETE')?'DELETE':ek('UPDATE')?'UPDATE':bad();if(used.has(event))bad();used.add(event);let action;if(ek('RESTRICT'))action='RESTRICT';else if(ek('CASCADE'))action='CASCADE';else if(ek('SET')){nk('NULL');action='SET NULL'}else if(ek('NO')){nk('ACTION');action='RESTRICT'}else bad();if(event=='DELETE')onDelete=action;else onUpdate=action}if(isk('MATCH'))throw unsupported('MATCH clauses are outside this lab.',peek().pos);return{foreign:true,name:constraint,indexName:constraint||indexName,cols,target,refCols,onDelete,onUpdate}}if(constraint)bad();return colDef()}
 function ifExists(neg=false){if(!ek('IF'))return false;if(neg)nk('NOT');nk('EXISTS');return true}
 function account(){const t=peek();let name=peek().k=='s'?T[i++].v:word(),host='localhost';if(ep('@'))host=peek().k=='s'?T[i++].v:word();if(host!='localhost'&&host!='%')throw unsupported('Practice accounts use localhost.',t.pos);return name}
 function scope(){if(ep('*')){if(ep('.'))np('*');return{d:'*',n:'*'}}const a=word().toLowerCase();if(ep('.'))return{d:a,n:ep('*')?'*':word().toLowerCase()};return{n:a}}
 function top(){const pos=peek().pos;
  if(ek('SELECT')){const query=select(),unions=[];let previous=query;while(ek('UNION')){if(previous.order.length||previous.limit!=null)throw syn('UNION',T[i-1].pos);const all=ek('ALL');if(!all)ek('DISTINCT');nk('SELECT');previous=select();unions.push({all,query:previous})}const statement={kind:'query',query,unions,pos};if(unions.length){statement.order=previous.order;statement.limit=previous.limit;statement.offset=previous.offset;previous.order=[];delete previous.limit}return statement}
  if(ek('INSERT')){ek('INTO');const table=ident();let cols;if(ep('(')){cols=list(()=>word().toLowerCase());np(')')}nk('VALUES');const values=list(()=>{np('(');const v=isp(')')?[]:list(()=>ek('DEFAULT')?node('default',{},peek().pos):or());np(')');return v});return{kind:'insert',table,cols,values,pos}}
  if(ek('UPDATE')){const table=tableRef();nk('SET');const assignments=list(()=>{const t=peek(),r=ident();np('=');return{column:r.n,qualifier:r.d,value:ek('DEFAULT')?node('default',{},t.pos):or(),pos:t.pos}});const where=ek('WHERE')?or():null;return{kind:'update',table,assignments,where,pos}}
  if(ek('DELETE')){nk('FROM');const table=tableRef(),where=ek('WHERE')?or():null;return{kind:'delete',table,where,pos}}
  if(ek('CREATE')){if(ek('DATABASE')||ek('SCHEMA'))return{kind:'createDatabase',ifNotExists:ifExists(true),name:word().toLowerCase(),pos};const unique=ek('UNIQUE');if(ek('INDEX')||ek('KEY')){const name=word(),table=(nk('ON'),ident()),cols=keyCols();return{kind:'createIndex',table,name,cols,unique,pos}}if(!ek('TABLE'))throw unsupported('CREATE is supported for DATABASE, TABLE and INDEX; other object forms are outside this module lab.',pos);const ifNotExists=ifExists(true),table=ident();np('(');const defs=list(definition);np(')');let engine='InnoDB',comment='';while(i<T.length){if(ek('ENGINE')){ep('=');engine=word()}else if(ek('COMMENT')){ep('=');if(peek().k!='s')bad();comment=T[i++].v}else bad()}if(engine.toLowerCase()!='innodb')throw unsupported('The practice engine models InnoDB tables only.',pos);return{kind:'createTable',table,defs,ifNotExists,comment,pos}}
  if(ek('ALTER')){nk('TABLE');const table=ident(),actions=list(()=>{if(ek('ADD')){ek('COLUMN');return{op:'add',def:definition()}}if(['CHANGE','CONVERT','ENGINE','DISABLE','ENABLE','ALTER'].includes(peek().up))throw unsupported('This ALTER extension is outside the supported module forms.',peek().pos);if(ek('DROP')){if(ek('FOREIGN')){nk('KEY');return{op:'dropForeign',name:word()}}if(ek('PRIMARY')){nk('KEY');return{op:'dropPrimary'}}if(ek('INDEX')||ek('KEY'))return{op:'dropIndex',name:word()};ek('COLUMN');return{op:'drop',name:word().toLowerCase()}}if(ek('MODIFY')){ek('COLUMN');return{op:'modify',def:colDef()}}if(ek('RENAME')){ek('TO')||ek('AS');return{op:'rename',target:ident()}}if(ek('COMMENT')){ep('=');if(peek().k!='s')bad();return{op:'comment',value:T[i++].v}}bad()});return{kind:'alter',table,actions,pos}}
  if(ek('DROP')){if(ek('DATABASE')||ek('SCHEMA'))return{kind:'dropDatabase',ifExists:ifExists(),name:word().toLowerCase(),pos};if(ek('INDEX')||ek('KEY')){const name=word();nk('ON');return{kind:'dropIndex',name,table:ident(),pos}}if(['VIEW','FUNCTION','PROCEDURE','TRIGGER','USER'].includes(peek().up))throw unsupported('This DROP object form is outside the supported module forms.',peek().pos);nk('TABLE');const exists=ifExists(),tables=list(ident);return{kind:'dropTable',tables,ifExists:exists,pos}}
  if(ek('RENAME')){nk('TABLE');const pairs=list(()=>{const table=ident();nk('TO');return{table,target:ident()}});return{kind:'rename',pairs,pos}}
  if(ek('TRUNCATE')){ek('TABLE');return{kind:'truncate',table:ident(),pos}}
  if(ek('USE'))return{kind:'use',name:word().toLowerCase(),pos};
  if(ek('DESCRIBE')||ek('DESC'))return{kind:'describe',table:ident(),pos};
  if(ek('SHOW')){if(ek('DATABASES'))return{kind:'showDatabases',pos};if(ek('TABLES')){const database=ek('FROM')||ek('IN')?word().toLowerCase():null;return{kind:'showTables',database,pos}}if(ek('TABLE')){nk('STATUS');const database=ek('FROM')||ek('IN')?word().toLowerCase():null;let pattern=null;if(ek('LIKE')){if(peek().k!='s')bad();pattern=T[i++].v}return{kind:'showTableStatus',database,pattern,pos}}if(ek('INDEX')||ek('INDEXES')||ek('KEYS')){if(!ek('FROM')&&!ek('IN'))bad();const table=ident();if(ek('FROM')||ek('IN'))table.d=word().toLowerCase();return{kind:'showIndex',table,pos}}if(ek('COLUMNS')||ek('FIELDS')){nk('FROM');const table=ident();if(ek('FROM')||ek('IN'))table.d=word().toLowerCase();return{kind:'describe',table,pos}}if(ek('WARNINGS'))return{kind:'showWarnings',pos};if(ek('GRANTS'))return{kind:'showGrants',account:ek('FOR')?account():null,pos};bad()}
  if(ek('START')){nk('TRANSACTION');return{kind:'begin',pos}}if(ek('BEGIN')){ek('WORK');return{kind:'begin',pos}}if(ek('COMMIT')){ek('WORK');return{kind:'commit',pos}}if(ek('ROLLBACK')){ek('WORK');if(ek('TO')){ek('SAVEPOINT');return{kind:'rollbackTo',name:word().toLowerCase(),pos}}return{kind:'rollback',pos}}if(ek('SAVEPOINT'))return{kind:'savepoint',name:word().toLowerCase(),pos};if(ek('RELEASE')){nk('SAVEPOINT');return{kind:'release',name:word().toLowerCase(),pos}}
  if(ek('SET')){nk('AUTOCOMMIT');np('=');const value=literal();if(![0,1].includes(value))throw E(1231,'42000',"Variable 'autocommit' can't be set to that value",pos);return{kind:'autocommit',value,pos}}
  if(isk('GRANT')||isk('REVOKE')){const grant=ek('GRANT');if(!grant)nk('REVOKE');const privileges=list(()=>{const name=word(true).toUpperCase();if(name=='ALL')ek('PRIVILEGES');if(!['ALL','SELECT','UPDATE','INSERT','DELETE','CREATE','DROP','ALTER','INDEX','REFERENCES'].includes(name))throw unsupported('This privilege is outside the module lab.',peek().pos);return name});nk('ON');const target=scope();nk(grant?'TO':'FROM');const name=account();if(name=='root')throw unsupported('root is the fixed offline administrator. Practice privilege changes on user_name or another local practice account.',pos);return{kind:grant?'grant':'revoke',privileges,target,account:name,pos}}
  if(isk('COMMENT'))bad();if(['WITH','EXPLAIN','CALL','DELIMITER','LOCK','UNLOCK','REPLACE'].includes(peek().up))throw unsupported('This SQL/monitor command is outside the module lab.',pos);bad();
 }
 const statement=top();if(i<T.length){if(['COLLATE','OVER','RETURNING','FOR','LOCK','ESCAPE','INTERSECT','EXCEPT','XOR','CHARSET','CHARACTER'].includes(peek().up))throw unsupported('This SQL extension is outside the module lab.',peek().pos);bad()}return statement;
}
