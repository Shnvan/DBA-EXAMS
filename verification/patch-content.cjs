const fs=require('fs'),path=require('path');const file=path.resolve(__dirname,'..','DBMS_midterm_practice.html');const {X}=require('./load.cjs')();
const ID=JSON.parse(JSON.stringify(X.ID)),TF=JSON.parse(JSON.stringify(X.TF)),MC=JSON.parse(JSON.stringify(X.MC));
const extraID=[
 ['Which integer type is intended for smaller whole numbers, with examples -32768 and 32767?','smallint',32],
 ['Which integer type stores very large whole numbers, such as 9223372036854775807?','bigint',32],
 ['Which type is introduced as single-precision floating-point storage?','float',33],
 ['Which type is introduced as double-precision floating-point storage?','double|double precision',34],
 ['Which floating-point type is described in the module as another term for single precision?','real',33,'Module wording. In the XAMPP lab, REAL is a DOUBLE synonym unless REAL_AS_FLOAT is enabled.'],
 ['Which type stores binary data of variable length, up to a declared byte limit?','varbinary|binary varying',36],
 ['Which temporal type stores a time such as 13:45:30 without a calendar date?','time',38],
 ['Which temporal type combines a calendar date and clock time? Give the type named in section c.','datetime',39,'The module gives a 1753 minimum, which comes from SQL Server; MariaDB/MySQL DATETIME starts at 1000.'],
 ['Which temporal type is introduced in section d with the example 2023-07-06 13:45:30.123456?','timestamp',39,'The module uses general SQL time-zone wording. MariaDB TIMESTAMP converts between the session time zone and UTC; it does not retain a time-zone name in each value.'],
 ['Which text type is used for htmlDescription in the CREATE TABLE productlines example?','mediumtext',62],
 ['Which binary type is used for image in that CREATE TABLE productlines example?','mediumblob',62],
 ['Which column attribute generates a new employee_id when it is omitted during insertion?','auto_increment|auto increment|autoincrement',60],
 ['Which SQL statement creates a new database? Give both keywords.','create database|create schema',52],
 ['Which SQL statement removes an entire database? Give both keywords.','drop database|drop schema',54],
 ['Which DBMS security feature records who accessed or changed data?','audit trail|audit trails|auditing',24],
 ['Which DBMS security feature protects data by encoding it?','encryption|data encryption',24],
 ['Which Amazon database is listed as a key-value NoSQL example?','dynamodb|amazon dynamodb',21],
 ['Which NoSQL type includes CouchDB?','document oriented|document database|document databases|document oriented database|document oriented databases',21],
 ['Which NoSQL type includes HBase?','column family|column family store|column family stores|column family database|column family databases',21],
 ['Which DBMS type includes db4o?','oodbms|object oriented|object oriented dbms|object oriented database management system|object oriented database',22],
 ['A Boolean expression that evaluates to TRUE, FALSE, or UNKNOWN is called a ____.','predicate|predicates',75],
 ['Which logical operator negates a condition?','not',75],
 ['What is the command-line monitoring program introduced in Lesson 3 called?','mysql|mysql monitor|mariadb|mariadb monitor',44,'The module calls it MySQL. XAMPP uses the mysql executable with a MariaDB server.'],
 ['In FROM members AS m, what is m called?','alias|table alias|aliases|table aliases',90],
 ['Which DDL statement changes a table name, using old_table_name TO new_table_name?','rename|rename table',62]
];ID.push(...extraID);
ID.find(q=>q[0].includes('inheritance, encapsulation'))[1]+='|object oriented database management system|object oriented database';
const variants={'tuple':'tuples','foreign key':'foreign keys','primary key':'primary keys','data dictionary':'data dictionaries','expression':'expressions','query':'queries','semicolon':'semi colon'};
ID.forEach(q=>{for(const[a,b]of Object.entries(variants))if(q[1].split('|').includes(a))q[1]+='|'+b});
const rewrites=[
 ['Normalization splits','Normalization merges redundant tables into one larger table.',17],
 ['Indexes are created','Indexes are created primarily to make data retrieval slower.',18],
 ['The first database models','The first database models were graph databases.',19],
 ['In a relational table','In the relational model described in the module, each cell contains a list of values.',19],
 ['A domain is','A domain is a collection of invalid values for an attribute.',20],
 ['Cassandra is','Cassandra is listed as a graph database.',21],
 ['An OODBMS stores','An OODBMS stores data only as flat files instead of objects.',22],
 ['A network DBMS allows','A network DBMS restricts each record to exactly one parent.',22],
 ['If you do not give CHAR','If you omit the length of CHAR, its default is ten characters.',35],
 ['GRANT and REVOKE are','GRANT and REVOKE are DML commands.',65],
 ['RIGHT OUTER JOIN is','RIGHT OUTER JOIN and RIGHT JOIN are different join types.',101]
];for(const[prefix,text,page]of rewrites){const q=TF.find(q=>q[0].startsWith(prefix));if(!q||q[1]!=1)throw Error('Rewrite mismatch '+prefix);q[0]=text;q[1]=0;q[2]=page}
TF.push(
 ['TRUE AND NULL evaluates to NULL.',1,80],['FALSE AND NULL evaluates to NULL.',0,80],['NULL AND NULL evaluates to NULL.',1,80],
 ['TRUE OR NULL evaluates to TRUE.',1,83],['FALSE OR NULL evaluates to FALSE.',0,83],['NULL OR NULL evaluates to TRUE.',0,83],
 ['WHERE includes a row only when its predicate evaluates to TRUE.',1,75],['The NOT operator can be used in a WHERE search condition.',1,75],
 ['FLOAT and DOUBLE are fixed-point types with the same role as DECIMAL.',0,33],['VARBINARY is a fixed-length character type.',0,36],
 ['Audit trails and encryption are DBMS security features.',1,24],['CREATE DATABASE removes a database and its tables.',0,52],
 ['In the p.102 relationship diagram, a sales representative may serve zero or more customers.',1,102],['The p.97 relationship states that every customer must have at least one order.',0,97]
);
MC.push(
 ['Which type is suitable for a whole number larger than the INT range?',['BIGINT','TIME','CHAR','ENUM'],0,32],
 ['Which type is associated with smaller whole-number examples such as -32768?',['SMALLINT','DOUBLE','BLOB','SET'],0,32],
 ['Which pair represents floating-point types in the module?',['FLOAT and DOUBLE','CHAR and VARCHAR','DATE and TIME','ENUM and SET'],0,34],
 ['Which type stores variable-length binary data?',['VARBINARY','CHAR','DATE','INT'],0,36],
 ['Which temporal type stores a clock-time value without a date?',['TIME','DATE','YEAR','VARCHAR'],0,38],
 ['Which type combines calendar date and clock time?',['DATETIME','TIME','YEAR','SMALLINT'],0,39],
 ['Which type is introduced with the fractional date-time example on page 39?',['TIMESTAMP','YEAR','DATE','BINARY'],0,39],
 ['Which type is assigned to htmlDescription in the page 62 table example?',['MEDIUMTEXT','MEDIUMBLOB','SMALLINT','TIME'],0,62],
 ['Which type is assigned to image in the page 62 table example?',['MEDIUMBLOB','MEDIUMTEXT','CHAR','YEAR'],0,62],
 ['What is AUTO_INCREMENT used for in the page 60 example?',['Generating successive employee_id values','Sorting employee names','Making every column unique','Encrypting employee records'],0,60],
 ['Which statement creates a database named practice2?',['CREATE DATABASE practice2','CREATE TABLE practice2','USE practice2','SHOW DATABASES'],0,52],
 ['Which statement removes a database named practice2?',['DROP DATABASE practice2','DELETE DATABASE practice2','TRUNCATE DATABASE practice2','DROP COLUMN practice2'],0,54],
 ['Which feature helps track access and changes to database data?',['Audit trails','Floating-point precision','Table aliases','Cartesian products'],0,24],
 ['Which security feature encodes data to protect it?',['Encryption','Normalization','ORDER BY','AUTO_INCREMENT'],0,24],
 ['DynamoDB is listed under which NoSQL type?',['Key-value','Graph','Object-oriented','Relational'],0,21],
 ['CouchDB is listed under which NoSQL type?',['Document-oriented','Graph','Hierarchical','Network'],0,21],
 ['HBase is listed under which NoSQL type?',['Column-family','Key-value','Graph','Object-oriented'],0,21],
 ['db4o is an example of which DBMS type?',['Object-oriented','Hierarchical','Network','Column-family'],0,22],
 ['What is a predicate in a WHERE condition?',['A Boolean expression that can be TRUE, FALSE, or UNKNOWN','The name of a database server','A fixed-length binary column','A command that creates a table'],0,75],
 ['What does TRUE AND NULL evaluate to?',['NULL','TRUE','FALSE','A syntax error'],0,80],
 ['What does FALSE OR NULL evaluate to?',['NULL','TRUE','FALSE','A syntax error'],0,83],
 ['In FROM members AS m, what does m represent?',['A table alias','A new column','A new database','A primary-key constraint'],0,90],
 ['Which condition selects employees without customers after the RIGHT JOIN shown on page 104?',['WHERE customerNumber IS NULL','WHERE employeeNumber IS NULL','WHERE customerNumber = NULL','WHERE employeeNumber = 0'],0,104]
);
MC.find(q=>q[0].startsWith('How can you emulate'))[4]='Beyond module: the UNION workaround is not printed in the module. Page 56 describes FULL JOIN, which is not a native MariaDB/MySQL join type.';
const targets=MC.map((_,i)=>i%4);let rng=902103;for(let i=targets.length-1;i>0;i--){rng=(Math.imul(rng,1664525)+1013904223)>>>0;const j=rng%(i+1);[targets[i],targets[j]]=[targets[j],targets[i]]}MC.forEach((q,i)=>{const target=targets[i];[q[1][q[2]],q[1][target]]=[q[1][target],q[1][q[2]]];q[2]=target});
let html=fs.readFileSync(file,'utf8');for(const[name,value]of Object.entries({ID,TF,MC})){const regex=new RegExp('const '+name+'=\\[[^\\n]*;');if(!regex.test(html))throw Error('Content anchor missing '+name);html=html.replace(regex,'const '+name+'='+JSON.stringify(value)+';')}
fs.writeFileSync(file,html);fs.writeFileSync(path.join(__dirname,'..','verification-artifacts','exam-bank.json'),JSON.stringify({ID,TF,MC},null,2));console.log({ID:ID.length,TF:TF.length,MC:MC.length,true:TF.filter(x=>x[1]).length,letters:[0,1,2,3].map(k=>MC.filter(x=>x[2]==k).length)});
