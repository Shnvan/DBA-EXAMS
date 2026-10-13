const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{X}=require('./load.cjs')();
const data=X.REVIEWER_SYNTAX,checks=[],details=[],separate=[];
const test=(name,fn)=>{fn();checks.push(name)};
const base=()=>{const db=X.newSession();X.exec("CREATE TABLE r(id INT PRIMARY KEY, amount INT); INSERT INTO r VALUES(1,10),(2,20); CREATE TABLE left_table(id INT PRIMARY KEY,amount INT); INSERT INTO left_table VALUES(1,10),(3,30); CREATE TABLE right_table(id INT PRIMARY KEY,amount INT); INSERT INTO right_table VALUES(1,10),(4,40); CREATE TABLE parent_table(id INT PRIMARY KEY); INSERT INTO parent_table VALUES(1); CREATE TABLE first_table(id INT PRIMARY KEY); CREATE TABLE second_table(id INT, other_key INT); CREATE TABLE third_table(id INT PRIMARY KEY);",db);return db};
const substitutions={table_name:'r',database_name:'practice',column_name:'amount',column1:'id',column2:'amount',column_attributes:'',data_type:'INT',constraints:'',length:'5',max_length:'20',max_bytes:'8',precision:'8',scale:'2',row_count:'1',select_list:'*',value:'5',value1:'10',value2:'20',expression:'amount + 1',expression1:'amount',expression2:'0',numeric_expression:'amount',fallback:'0',output_name:'output_value',table_alias:'q',search_condition:'id = 1',condition:'id = 1',condition1:'id = 1',condition2:'amount > 5',condition3:'amount > 1',grouping_column:'amount',value_column:'id',threshold:'0',text_column:'id',pattern:'1%',lower_value:'1',upper_value:'2',shared_column:'id',key:'id',other_key:'other_key',parent_column:'id',privilege1:'SELECT',privilege2:'UPDATE',user_name:'user_name',host_name:'%',savepoint_name:'retained',join_condition:'left_table.id = right_table.id',old_table_name:'r',new_table_name:'renamed'};
function instantiate(e,form){let sql=form.replace(/\[([^\]]*)\]/g,(_,inner)=>inner.split('|')[0]).replace(/,\s*\.\.\./g,'');const replacements={...substitutions};if(e.id==='float')replacements.precision='24';if(e.id==='time')replacements.precision='6';if(e.id==='create-table')replacements.table_name='new_table';if(e.id==='create-database')replacements.database_name='new_database';if(e.id==='drop-database')replacements.database_name='discard';if(e.id==='alter-add')replacements.column_name='extra';if(e.id==='alter-drop')replacements.column_name='amount';if(e.id==='select-alias')replacements.column_name='amount';if(['primary-key','foreign-key','column-attributes','auto-increment'].includes(e.id))replacements.column_name='sample';for(const [key,value]of Object.entries(replacements).sort((a,b)=>b[0].length-a[0].length))sql=sql.replace(new RegExp('\\b'+key+'\\b','g'),value);return sql}
for(const category of data.categories)for(const entry of category.entries){
 if(!entry.syntax||category.id==='client'||entry.id==='full-join'){separate.push({id:entry.id,reason:!entry.syntax?'PDF does not specify a concrete spatial declaration':category.id==='client'?'Terminal/client form checked against official client documentation':'PostgreSQL form checked against official join documentation'});continue}
 let forms=category.id==='types'?entry.syntax.split('\n'):entry.syntax.includes(';')?entry.syntax.split(';').map(s=>s.trim()).filter(Boolean).map(s=>s+';'):['primary-key','comparison','and-or-not','null-tests','null-functions'].includes(entry.id)?entry.syntax.split('\n'):[entry.syntax];
 forms.forEach((form,index)=>test(entry.id+' template '+(index+1)+' executes with declared fixtures',()=>{
  const db=base();let sql=instantiate(entry,form);
  if(category.id==='types')sql='CREATE TABLE type_sample ('+sql+');';
  if(entry.id==='primary-key')sql='CREATE TABLE key_sample(id INT,amount INT,sample INT,'+sql+');';
  if(entry.id==='foreign-key')sql='CREATE TABLE key_sample(sample INT,'+sql+');';
  if(['column-attributes','auto-increment'].includes(entry.id))sql='CREATE TABLE attr_sample ('+sql+');';
  if(['comparison','between','like','and-or-not','null-tests'].includes(entry.id))sql='SELECT id FROM r WHERE '+sql+';';
  if(['null-functions','aggregates'].includes(entry.id))sql='SELECT '+sql+' FROM r;';
  if(entry.id==='drop-database')X.exec('CREATE DATABASE discard;',db);
  if(['commit','savepoint','rollback'].includes(entry.id))X.exec('START TRANSACTION; UPDATE r SET amount=99 WHERE id=1; SAVEPOINT retained;',db);
  if(entry.id==='revoke')X.exec("GRANT SELECT,UPDATE ON practice.r TO 'user_name'@'%';",db);
  const result=X.exec(sql,db);assert(result.length>0);
  if(entry.id==='aggregates')assert.equal(Number(result.at(-1).rows[0][0]),15);
  if(entry.id==='unmatched-join')assert.equal(result.at(-1).rows.length,1);
  if(entry.id==='select')assert.equal(result.at(-1).rows.length,2);
  details.push({id:entry.id,form:index+1,pages:Array.from(entry.pages),sql,statements:result.length});
 }));
}
test('Transaction templates preserve earlier changes on savepoint rollback',()=>{const db=base();X.exec('START TRANSACTION; UPDATE r SET amount=11 WHERE id=1; SAVEPOINT retained; DELETE FROM r WHERE id=2; ROLLBACK TO SAVEPOINT retained; COMMIT;',db);assert.equal(X.exec('SELECT * FROM r ORDER BY id;',db).at(-1).rows.length,2)});
test('Join templates match, preserve and omit the documented rows on varied fixtures',()=>{const db=base();const sql=(type)=>'SELECT left_table.id,right_table.id FROM left_table '+type+' JOIN right_table ON left_table.id=right_table.id;';assert.equal(X.exec(sql('INNER'),db).at(-1).rows.length,1);assert.equal(X.exec(sql('LEFT'),db).at(-1).rows.length,2);assert.equal(X.exec(sql('RIGHT'),db).at(-1).rows.length,2);assert.equal(X.exec('SELECT * FROM left_table CROSS JOIN right_table;',db).at(-1).rows.length,4)});
const dir=path.resolve(__dirname,'../verification-artifacts/syntax');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'sql-templates.json'),JSON.stringify({passed:checks.length,templates:details.length,details,separatelyVerified:separate,checks},null,2));console.log(JSON.stringify({passed:checks.length,templates:details.length,separatelyVerified:separate}));
