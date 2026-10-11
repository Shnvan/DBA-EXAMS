/* Offline MariaDB 10.4 practice engine. No connection to a server. */
let DB,SESSION;
const K=c=>c.n.toLowerCase(),clone=x=>JSON.parse(JSON.stringify(x),(k,v)=>v&&typeof v=='object'&&!Array.isArray(v)?Object.assign(Object.create(null),v):v),own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const sessions=new WeakMap();
function E(code,state,message,pos){const e=new Error(`ERROR ${code} (${state}): ${message}`);Object.assign(e,{code,sqlState:state,pos});return e}
const syn=(token,pos)=>E(1064,'42000',`You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near '${token||''}'`,pos);
function unsupported(message,pos){const e=new Error('Practice limitation: '+message);e.unsupported=true;e.pos=pos;return e}
function warn(code,message){SESSION.warnings.push({level:'Warning',code,message})}
const SQLMODE='NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION';
function newSession(tables=seed()){
 const s={databases:Object.create(null),current:'practice',user:'root',accounts:Object.assign(Object.create(null),{root:{global:['ALL'],grants:{}},user_name:{global:[],grants:{}}}),transaction:null,savepoints:Object.create(null),warnings:[],sqlMode:SQLMODE};
 s.databases.practice=Object.assign(Object.create(null),tables);Object.values(tables).forEach(hydrate);return s;
}
function stateOf(db){if(db&&own(db,'databases')&&own(db,'accounts'))return db;if(!sessions.has(db))sessions.set(db,newSession(db));return sessions.get(db)}
const activeTables=s=>s.current&&s.databases[s.current]||Object.create(null);
const sqlString=v=>v==null?'NULL':typeof v=='object'&&v.num!=null?v.num:typeof v=='object'&&v.hex!=null?'0x'+v.hex:v?.geometry?v.wkt:String(v);
const resultValue=v=>v&&typeof v=='object'&&v.num!=null?v.num:v&&typeof v=='object'&&v.hex!=null?'0x'+v.hex:v?.geometry?v.wkt:v;
const numeric=v=>typeof v=='number'||!!(v&&typeof v=='object'&&v.num!=null);
function dec(v){let s=sqlString(v),m=s.match(/^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/);if(!m||!m[2]&&!m[3])return{n:0n,s:0};let scale=(m[3]||'').length- +(m[4]||0),n=BigInt((m[1]=='-'?'-':'')+(m[2]||'0')+(m[3]||''));if(scale<0){n*=10n**BigInt(-scale);scale=0}return{n,s:scale}}
function decimalText(n,s){const neg=n<0n;n=neg?-n:n;let str=String(n).padStart(s+1,'0');return(neg?'-':'')+(s?str.slice(0,-s)+'.'+str.slice(-s):str)}
function exact(v,scale){let d=dec(v);if(d.s<scale)d.n*=10n**BigInt(scale-d.s);else if(d.s>scale){const div=10n**BigInt(d.s-scale),negative=d.n<0n;let a=negative?-d.n:d.n;a=(a+div/2n)/div;d.n=negative?-a:a}return{num:decimalText(d.n,scale)}}
function number(v){if(v==null)return 0;const str=sqlString(v),m=str.match(/^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);if(!m){if(!numeric(v))warn(1292,`Truncated incorrect DOUBLE value: '${str}'`);return 0}if(!numeric(v)&&str.slice(m[0].length).trim())warn(1292,`Truncated incorrect DOUBLE value: '${str}'`);return Number(m[0])}
const tv=v=>v==null?null:+(number(v)!==0);
const collate=s=>sqlString(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ +$/,'');
function cmp(a,b){if(a==null||b==null)return a==null?(b==null?0:-1):1;if(!numeric(a)&&!numeric(b)){if(a?.hex!=null||b?.hex!=null){a=sqlString(a);b=sqlString(b)}else{a=collate(a);b=collate(b)}return a<b?-1:a>b?1:0}if(!numeric(a))a=number(a);if(!numeric(b))b=number(b);const x=dec(a),y=dec(b),s=Math.max(x.s,y.s),p=x.n*10n**BigInt(s-x.s),q=y.n*10n**BigInt(s-y.s);return p<q?-1:p>q?1:0}
function arithmetic(op,a,b){if(a==null||b==null)return null;if(!numeric(a))a=number(a);if(!numeric(b))b=number(b);const x=dec(a),y=dec(b);if(['/', '%','DIV'].includes(op)&&y.n===0n){return null}if(op=='%')return number(a)%number(b);if(op=='DIV')return Math.trunc(number(a)/number(b));let n,s;if(op=='*'){n=x.n*y.n;s=x.s+y.s}else if(op=='/'){s=x.s+4;n=x.n*10n**BigInt(y.s+4)/y.n}else{s=Math.max(x.s,y.s);n=x.n*10n**BigInt(s-x.s)+(op=='+'?1n:-1n)*y.n*10n**BigInt(s-y.s)}const str=decimalText(n,s);return s||n>BigInt(Number.MAX_SAFE_INTEGER)||n<BigInt(Number.MIN_SAFE_INTEGER)?{num:str}:Number(n)}
const rowKey=r=>JSON.stringify(r.map(v=>v==null?null:numeric(v)?['n',sqlString(v).replace(/\.0+$/,'')]:v?.hex?['b',v.hex]:['s',collate(v)]));
const RES=new Set(('NATURAL STRAIGHT_JOIN INTERSECT EXCEPT XOR REGEXP RLIKE SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET UNION ALL DISTINCT INNER LEFT RIGHT CROSS OUTER JOIN ON USING AS SET VALUES AND OR NOT BETWEEN LIKE IN IS NULL TRUE FALSE ASC DESC INTO TABLE DATABASE SCHEMA PRIMARY KEY UNIQUE FOREIGN REFERENCES DEFAULT AUTO_INCREMENT UNSIGNED SIGNED CREATE ALTER DROP ADD MODIFY RENAME TRUNCATE SHOW DESCRIBE INSERT UPDATE DELETE COMMIT ROLLBACK SAVEPOINT GRANT REVOKE TO START TRANSACTION').split(' '));
function tok(sql){
 const out=[];let i=0;const add=(k,v,start,extra={})=>out.push({k,v,up:k=='w'?v.toUpperCase():undefined,pos:start,end:i,raw:sql.slice(start,i),...extra});
 while(i<sql.length){if(/\s/.test(sql[i])){i++;continue}if(sql[i]=='#'||sql.slice(i,i+2)=='--'&&(/\s/.test(sql[i+2]||' '))){while(i<sql.length&&sql[i]!='\n')i++;continue}
  if(sql.slice(i,i+2)=='/*'){const end=sql.indexOf('*/',i+2);if(end<0)throw syn(sql.slice(i),i);if(sql[i+2]=='!')throw unsupported('Executable version comments are outside this practice engine.',i);i=end+2;continue}
  const start=i,ch=sql[i];
  if(ch=="'"||ch=='"'||ch=='`'){i++;let value='',closed=false;while(i<sql.length){if(sql[i]==ch){if(sql[i+1]==ch){value+=ch;i+=2;continue}i++;closed=true;break}if(sql[i]=='\\'&&ch!='`'){i++;const esc={n:'\n',r:'\r',t:'\t','0':'\0',b:'\b',Z:'\x1a'};const c=sql[i++];value+=c=='%'||c=='_'?'\\'+c:esc[c]??c}else value+=sql[i++]}if(!closed)throw syn(sql.slice(start),start);add(ch=='`'?'w':'s',value,start,{quoted:ch=='`'});continue}
  const hex=sql.slice(i).match(/^0x([0-9a-f]+)/i);if(hex){i+=hex[0].length;add('n',{hex:hex[1].toUpperCase().padStart(Math.ceil(hex[1].length/2)*2,'0')},start);continue}
  const nm=sql.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);if(nm){i+=nm[0].length;const d=dec(nm[0]);add('n',d.s||d.n>BigInt(Number.MAX_SAFE_INTEGER)?{num:nm[0]}:Number(nm[0]),start);continue}
  const w=sql.slice(i).match(/^[A-Za-z_$][A-Za-z0-9_$]*/);if(w){i+=w[0].length;add('w',w[0],start);continue}
  const p=sql.slice(i).match(/^(?:<=>|<=|>=|<>|!=|&&|\|\||[(),.*=<>+\-\/;%!@])/);if(p){i+=p[0].length;add('p',p[0],start);continue}throw syn(sql.slice(i,i+30),i);
 }out.sql=sql;return out;
}
const TYPE_NAMES=new Set(['INT','INTEGER','SMALLINT','TINYINT','MEDIUMINT','BIGINT','DECIMAL','NUMERIC','FLOAT','DOUBLE','REAL','CHAR','CHARACTER','VARCHAR','BINARY','VARBINARY','TEXT','MEDIUMTEXT','LONGTEXT','TINYTEXT','BLOB','MEDIUMBLOB','LONGBLOB','TINYBLOB','DATE','TIME','DATETIME','TIMESTAMP','YEAR','BOOLEAN','BOOL','ENUM','SET','JSON','GEOMETRY','POINT','LINESTRING','POLYGON']);
const INT_RANGE={TINYINT:[-128n,127n,255n,4],SMALLINT:[-32768n,32767n,65535n,6],MEDIUMINT:[-8388608n,8388607n,16777215n,9],INT:[-2147483648n,2147483647n,4294967295n,11],BIGINT:[-9223372036854775808n,9223372036854775807n,18446744073709551615n,20]};
function typeLabel(s){let text=s.base.toLowerCase();if(INT_RANGE[s.base])text+='('+(s.args[0]??(s.unsigned?INT_RANGE[s.base][3]-1:INT_RANGE[s.base][3]))+')';else if(s.args.length)text+='('+s.args.map(x=>typeof x=='string'?"'"+x.replace(/'/g,"''")+"'":x).join(',')+')';if(s.unsigned)text+=' unsigned';return text}
function hydrate(t){if(t.ready)return t;t.indexes=t.indexes||[];t.foreign=t.foreign||[];t.next='1';t.primary=t.cols.filter(c=>c.pk).map(K);t.cols.forEach(c=>{if(!c.spec)c.spec=parse(tok(c.t),true);c.t=typeLabel(c.spec);if(c.pk)c.nn=1;if(c.uq&&!t.indexes.some(x=>x.name==c.n))t.indexes.push({name:c.n,cols:[K(c)]});if(c.ai){t.next=String(t.rows.reduce((m,r)=>{const n=dec(r[K(c)]).n;return n>m?n:m},0n)+1n)}t.rows.forEach(r=>{if(r[K(c)]!=null&&['DECIMAL','BIGINT'].includes(c.spec.base))r[K(c)]=exact(r[K(c)],c.spec.base=='DECIMAL'?c.spec.args[1]:0)})});t.ready=true;return t}
/* JSON keeps its source text. Extraction preserves MariaDB's first duplicate-key value. */
function parseJsonDocument(text){
 text=sqlString(text);JSON.parse(text);let at=0;const ws=()=>{while(/\s/.test(text[at]||'')&&at<text.length)at++};
 const str=()=>{const start=at++;while(at<text.length){if(text[at]=='\\'){at+=2;continue}if(text[at++]=='"')break}return JSON.parse(text.slice(start,at))};
 const value=()=>{ws();if(text[at]=='"')return str();if(text[at]=='{'){at++;const out=Object.create(null);ws();if(text[at]=='}'){at++;return out}for(;;){ws();const k=str();ws();at++;const v=value();if(!own(out,k))out[k]=v;ws();if(text[at++]=='}')return out}}
  if(text[at]=='['){at++;const out=[];ws();if(text[at]==']'){at++;return out}for(;;){out.push(value());ws();if(text[at++]==']')return out}}
  const start=at;while(at<text.length&&!/[\s,\]}]/.test(text[at]))at++;return JSON.parse(text.slice(start,at));};return value();
}
function extractJsonPath(document,path){
 path=sqlString(path);if(path[0]!='$')throw E(4042,'HY000','Syntax error in JSON path');let values=[document],at=1,multi=false;
 while(at<path.length){let key,wild=false;if(path[at]=='.'){at++;if(path[at]=='*'){wild=true;at++}else if(path[at]=='"'){const start=at++;while(at<path.length){if(path[at]=='\\'){at+=2;continue}if(path[at++]=='"')break}try{key=JSON.parse(path.slice(start,at))}catch(e){throw E(4042,'HY000','Syntax error in JSON path')}}else{const m=path.slice(at).match(/^[A-Za-z_$][\w$]*/);if(!m)throw E(4042,'HY000','Syntax error in JSON path');key=m[0];at+=key.length}}
  else if(path[at]=='['){const m=path.slice(at).match(/^\[(\d+|\*)\]/);if(!m)throw unsupported('JSON paths support object members, nonnegative array indexes and single-level wildcards.');wild=m[1]=='*';key=Number(m[1]);at+=m[0].length;values=values.filter(Array.isArray)}else throw unsupported('Recursive and ranged JSON paths are outside this practice lab.');
  multi=multi||wild;values=values.flatMap(v=>v!=null&&typeof v=='object'?wild?Object.values(v):own(v,key)?[v[key]]:[]:[]);
 }return{values,multi};
}
function geometryFromText(text,srid=0){
 if(text==null||srid==null)return null;const m=sqlString(text).trim().match(/^(POINT|LINESTRING|POLYGON)\s*(\([\s\S]*\))$/i);if(!m)return null;
 const kind=m[1].toUpperCase(),pair=s=>{const p=s.trim().split(/\s+/);return p.length===2&&p.every(v=>/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(v)&&Number.isFinite(+v))?p.map(Number).join(' '):null};
 const line=s=>{const p=s.split(',').map(pair);return p.every(Boolean)?p:null};let body;
 if(kind=='POINT'){body=pair(m[2].slice(1,-1));if(!body)return null}
 if(kind=='LINESTRING'){const p=line(m[2].slice(1,-1));if(!p||p.length<2)return null;body=p.join(',')}
 if(kind=='POLYGON'){const interior=m[2].slice(1,-1).trim();if(!/^\([^()]*\)(\s*,\s*\([^()]*\))*$/.test(interior))return null;const rings=[...interior.matchAll(/\(([^()]*)\)/g)].map(x=>line(x[1]));if(rings.some(r=>!r||r.length<4||r[0]!==r[r.length-1]))return null;body=rings.map(r=>'('+r.join(',')+')').join(',')}
 const id=Number(sqlString(srid));if(!Number.isInteger(id)||id<0||id>4294967295)throw E(1411,'HY000','Incorrect SRID value');return{geometry:kind,wkt:kind+'('+body+')',srid:id};
}
function tbl0(ref){const n=typeof ref=='string'?{n:ref}:ref,d=n.d||SESSION.current;if(!d)throw E(1046,'3D000','No database selected');const db=SESSION.databases[d];if(!db||!own(db,n.n))throw E(1146,'42S02',`Table '${d}.${n.n}' doesn't exist`,n.pos);return hydrate(db[n.n])}
function permit(priv,ref){if(SESSION.user=='root')return;const account=SESSION.accounts[SESSION.user],db=ref?.d||SESSION.current,grants=account?.grants||{},list=[...(account?.global||[]),...(grants[db+'.*']||[]),...(grants[db+'.'+ref?.n]||[])];if(!list.includes('ALL')&&!list.includes(priv))throw E(1142,'42000',`${priv} command denied to user '${SESSION.user}'@'localhost' for table '${ref?.n||db}'`,ref?.pos)}
function implicitCommit(){SESSION.transaction=null;SESSION.savepoints=Object.create(null)}
function restoreData(snapshot){const counters=new Map();for(const[d,db]of Object.entries(SESSION.databases))for(const[n,t]of Object.entries(db))if(t.next)counters.set(d+'.'+n,t.next);SESSION.databases=clone(snapshot);for(const[d,db]of Object.entries(SESSION.databases))for(const[n,t]of Object.entries(db)){const next=counters.get(d+'.'+n);if(next&&BigInt(next)>BigInt(t.next||1))t.next=next}}
function tablePrivileges(ref){const a=SESSION.accounts[SESSION.user],d=ref.d||SESSION.current;return SESSION.user=='root'||[...(a?.global||[]),...(a?.grants[d+'.*']||[]),...(a?.grants[d+'.'+ref.n]||[])].length>0}

/* The Run/Check submission boundary models a client terminator, not server SQL syntax. */
function submissionProblem(sql){const parts=splitStatements(String(sql)),last=parts.at(-1);let count=0;for(const p of parts){let tokens;try{tokens=tok(p.sql)}catch(e){tokens=[1]}if(tokens.length){count++;if(!p.terminated)return 'Statement '+count+' is incomplete; add a semicolon.'}}return count?null:'Type a query first.'}
function terminatedSolution(sql){const p=splitStatements(sql).at(-1);try{return tok(p.sql).length?sql.trimEnd()+';':sql}catch(e){return sql.trimEnd()+';'}}
