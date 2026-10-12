const norm=s=>{const raw=String(s).trim();const symbols={'%':'symbol percent','_':'symbol underscore','*':'symbol asterisk','=':'symbol equals','>':'symbol greater than','\\G':'vertical delimiter'};if(symbols[raw])return symbols[raw];if(/^-[puhD]$/i.test(raw))return raw.toLowerCase();return raw.replace(/&/g,' and ').replace(/%/g,' percent wildcard ').toLowerCase().replace(/[\u2010-\u2015_-]/g,' ').replace(/[\u2019']/g,'').replace(/[^a-z0-9 ;]/g,'').replace(/\s+/g,' ').trim()};
function editDistanceOne(a,b){if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,errors=0;while(i<a.length&&j<b.length){if(a[i]==b[j]){i++;j++;continue}if(++errors>1)return false;if(a.length>=b.length)i++;if(b.length>=a.length)j++}return errors+(i<a.length||j<b.length?1:0)<=1}
const exactIdentification=new Set(['create table','alter table','add column','drop column','modify column','show table status','show index','show index from','show indexes','show indexes from','show keys','show keys from','is null','is not null','not null','comment','order by','left join','left outer join','left','join','sql join','not only sql','couchdb','hbase','db4o','dbms','dcl','dql','ddl','dml','tcl','sql','null','drop','drop table','where','not','and','or','decimal','numeric','char','character','blob','boolean','bool','enum','set','coalesce','ifnull','show databases','show tables','describe','desc','show columns','show columns from','update','insert','insert into','cross join','cross','grant','revoke','truncate','truncate table','select','asc','ascending','descending','having','distinct','limit','using','full join','full outer join','full','smallint','bigint','float','double','double precision','real','varbinary','binary varying','time','datetime','timestamp','mediumtext','mediumblob','auto increment','autoincrement','create database','create schema','drop database','drop schema','rename','rename table','mysql','mysql monitor','mariadb','mariadb monitor','dynamodb','amazon dynamodb','oodbms','codd','chamberlin','boyce',';']);
function identificationMatches(value,item,bank=ID){
 const answer=norm(value);if(!answer)return false;
 const variants=item[1].split('|').map(norm);if(variants.includes(answer))return true;
 // Typo tolerance applies only to complete multiword concepts. Never repair SQL tokens,
 // names, abbreviations, missing words, or an answer belonging to another concept.
 if(exactIdentification.has(answer))return false;
 const wordCount=x=>x.split(' ').length;
 const candidate=variants.filter(x=>!exactIdentification.has(x)&&wordCount(x)>=2&&wordCount(x)===wordCount(answer)&&x.length>=12&&editDistanceOne(answer,x));
 if(!candidate.length)return false;
 const other=bank.filter((q,i)=>q!==item&&(bank!==ID||typeof examActive!=='function'||examActive('id',i))).flatMap(q=>q[1].split('|').map(norm));
 return !other.some(x=>x===answer||x.length>=12&&wordCount(x)===wordCount(answer)&&editDistanceOne(answer,x)&&!variants.includes(x));
}
