/* Original guided lessons: module references identify concepts, not copied exercises. */
const SQL_CURRICULA={intermediate:[],advanced:[]};
function curriculumLesson(level,id,title,pages,explanation,sql,topics,extra={}){
 SQL_CURRICULA[level].push({id,title,pages,explanation,objective:extra.objective||`Use ${topics.join(', ')} to achieve: ${title}.`,prompt:extra.prompt||`Complete ${title} using ${topics.join(', ')} and verify the requested result before continuing.`,syntax:extra.syntax||sql,example:sql,sql,hint:extra.hint||'Read the table and column names, then follow the example structure using the current database.',topics,tableColumns:extra.tableColumns||[],kind:extra.kind||(/^\s*(SELECT|SHOW|DESCRIBE|DESC)\b/i.test(sql)?'query':'mutation'),sandbox:false,...extra});
}
const campusTables=[
 ['departments','CREATE TABLE departments (dept_code CHAR(4) PRIMARY KEY, dept_name VARCHAR(80) NOT NULL UNIQUE);','One department can have many students and courses. CHAR holds fixed-length codes; VARCHAR stores variable-length names. Primary keys identify rows; UNIQUE also forbids duplicate department names.',['CHAR','VARCHAR','PRIMARY KEY','UNIQUE','one-to-many']],
 ['students','CREATE TABLE students (student_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(80) NOT NULL, email VARCHAR(100) UNIQUE, dept_code CHAR(4) NULL, enrolled_on DATE, active BOOLEAN DEFAULT TRUE, FOREIGN KEY (dept_code) REFERENCES departments(dept_code));','A nullable department allows an unassigned student. AUTO_INCREMENT supplies omitted identifiers. UNIQUE email still permits NULL in this dialect. BOOLEAN is a TINYINT synonym, not a constraint limiting values to 0 and 1.',['INT','UNSIGNED','AUTO_INCREMENT','NOT NULL','NULL','DATE','BOOLEAN','DEFAULT','nullable foreign key']],
 ['profiles','CREATE TABLE profiles (student_id INT UNSIGNED PRIMARY KEY, biography TEXT, phone CHAR(15), FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE);','The same column is both the profile primary key and its student foreign key. This gives at most one profile per student. CASCADE removes the profile when its student is deleted. A student may have no profile.',['TEXT','one-to-one','primary key foreign key','ON DELETE CASCADE']],
 ['staff','CREATE TABLE staff (staff_id INTEGER PRIMARY KEY, full_name VARCHAR(80) NOT NULL, manager_id INTEGER NULL, dept_code CHAR(4), salary DECIMAL(10,2) DEFAULT 0, FOREIGN KEY (manager_id) REFERENCES staff(staff_id), FOREIGN KEY (dept_code) REFERENCES departments(dept_code));','Staff refer to departments and optionally to another staff row as their manager. Insert the manager before subordinates. DECIMAL precision counts all digits; scale counts fractional digits.',['INTEGER','DECIMAL','precision','scale','self-referencing foreign key','multiple foreign keys']],
 ['courses','CREATE TABLE courses (course_code VARCHAR(12) PRIMARY KEY, title VARCHAR(100) NOT NULL, dept_code CHAR(4) NOT NULL, units TINYINT UNSIGNED DEFAULT 3, FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON UPDATE CASCADE);','Each course belongs to one department. TINYINT UNSIGNED permits 0 through 255; signed TINYINT permits -128 through 127. Updating a department key propagates to this child key, subject to other references.',['TINYINT','integer limits','DEFAULT','ON UPDATE CASCADE']],
 ['course_offerings','CREATE TABLE course_offerings (course_code VARCHAR(12), term CHAR(6), section SMALLINT UNSIGNED, instructor_id INTEGER NULL, room VARCHAR(20), starts_at TIME(3), PRIMARY KEY (course_code,term,section), FOREIGN KEY (course_code) REFERENCES courses(course_code), FOREIGN KEY (instructor_id) REFERENCES staff(staff_id) ON DELETE SET NULL);','One PRIMARY KEY may contain several columns. These three columns identify an offering together. A nullable instructor permits SET NULL on deletion. SMALLINT is distinct from INT: its signed range is -32768 to 32767.',['SMALLINT','composite primary key','TIME','fractional seconds','ON DELETE SET NULL']],
 ['enrollments','CREATE TABLE enrollments (student_id INT UNSIGNED, course_code VARCHAR(12), term CHAR(6), section SMALLINT UNSIGNED, grade NUMERIC(5,2) NULL, status ENUM(\'enrolled\',\'passed\',\'withdrawn\') DEFAULT \'enrolled\', PRIMARY KEY (student_id,course_code,term,section), FOREIGN KEY (student_id) REFERENCES students(student_id), FOREIGN KEY (course_code,term,section) REFERENCES course_offerings(course_code,term,section));','An enrollment joins students to offerings in a many-to-many relationship. The composite foreign key must match all three offering columns. NUMERIC is a DECIMAL synonym. ENUM chooses one label; an unknown grade is NULL, not zero.',['NUMERIC','ENUM','many-to-many','composite foreign key','NULL versus zero']],
 ['resources','CREATE TABLE resources (resource_id BIGINT PRIMARY KEY, course_code VARCHAR(12), label VARCHAR(80), tags SET(\'video\',\'text\',\'lab\'), summary MEDIUMTEXT, attachment MEDIUMBLOB, metadata JSON, FOREIGN KEY (course_code) REFERENCES courses(course_code));','Resources connect to courses. BIGINT holds large integer identifiers. SET allows several permitted labels. MEDIUMTEXT and MEDIUMBLOB store larger text and binary values than TEXT/BLOB. JSON requires valid JSON text in this lab.',['BIGINT','SET','MEDIUMTEXT','MEDIUMBLOB','JSON']],
 ['campus_locations','CREATE TABLE campus_locations (location_id INT PRIMARY KEY, dept_code CHAR(4), label VARCHAR(80), position POINT, boundary GEOMETRY, FOREIGN KEY (dept_code) REFERENCES departments(dept_code));','Spatial columns store shapes. POINT stores a single position; GEOMETRY is the general spatial family. WKT constructors turn textual coordinate descriptions into spatial values. These extensions implement the spatial topic mentioned on module page 40.',['spatial','POINT','GEOMETRY','WKT']]
];
curriculumLesson('advanced','campus-create','Create and select the campus database',[59,60],'Begin with an empty practice server. CREATE DATABASE creates the container; USE chooses where unqualified table names are resolved. These are separate operations.','CREATE DATABASE campus_project; USE campus_project;',['CREATE DATABASE','USE']);
curriculumLesson('advanced','campus-inspect','Inspect your empty database',[45,60],'SHOW DATABASES lists databases; SHOW TABLES lists tables in the selected database. An empty table list is correct before creating tables.','SHOW DATABASES; SHOW TABLES;',['SHOW DATABASES','SHOW TABLES']);
for(const [name,sql,explanation,topics] of campusTables)curriculumLesson('advanced','campus-table-'+name,'Create '+name,[31,32,35,40,41,42,60,62],explanation,sql,topics,{tableColumns:[name],hint:'Create the table exactly once. Check the parent tables first; referenced columns must have compatible types and an index.'});
curriculumLesson('advanced','campus-columns','Inspect columns, keys and indexes',[45,61],'DESCRIBE and SHOW COLUMNS reveal types, defaults and nullability. SHOW INDEX shows each column of an index, including composite keys.','DESCRIBE students; SHOW COLUMNS FROM enrollments; SHOW INDEX FROM course_offerings;',['DESCRIBE','SHOW COLUMNS','SHOW INDEX']);
curriculumLesson('advanced','campus-records','Insert the campus sample records',[49,50,64],'Insert parent rows first, then dependent rows. Every VALUES tuple follows the listed column order. These records are visibly created by your SQL; no sample tables are loaded behind the scenes.',`INSERT INTO departments VALUES ('COMP','Computing'),('BUS','Business'),('ART','Arts');
INSERT INTO students (student_id,full_name,email,dept_code,enrolled_on) VALUES (1,'Ana Cruz','ana@example.test','COMP','2026-08-01'),(2,'Ben Santos','ben@example.test','COMP','2026-08-02'),(3,'Cara Lim',NULL,NULL,'2026-08-03');
INSERT INTO profiles VALUES (1,'Enjoys databases','09170000001');
INSERT INTO staff VALUES (10,'Dean Reyes',NULL,'COMP',85000.00),(11,'Mia Tan',10,'COMP',52000.00),(12,'Leo Uy',NULL,'BUS',48000.00);
INSERT INTO courses VALUES ('DB101','Database Basics','COMP',3),('WEB101','Web Development','COMP',3),('BUS101','Business Intro','BUS',3);
INSERT INTO course_offerings VALUES ('DB101','2026A',1,11,'R101','09:00:00.000'),('WEB101','2026A',1,11,'R102','13:30:00.000'),('BUS101','2026A',1,12,'B101','10:00:00.000');
INSERT INTO enrollments (student_id,course_code,term,section,grade) VALUES (1,'DB101','2026A',1,91.00),(2,'DB101','2026A',1,NULL),(1,'WEB101','2026A',1,88.50);
INSERT INTO resources VALUES (10000000001,'DB101','SQL handout','text,lab','Practice SQL commands',NULL,'{"format":"pdf","pages":4}');
INSERT INTO campus_locations VALUES (1,'COMP','Computing building',ST_GeomFromText('POINT(121 14)'),ST_GeomFromText('POLYGON((0 0,0 2,2 2,2 0,0 0))'));`,['INSERT','column list','multiple rows','parent-before-child','JSON value','spatial value']);
const advancedQueries=[
 ['select-all','Read complete student rows','SELECT * FROM students;',['SELECT','FROM'],[48,63]],
 ['projection','Select and rename output columns','SELECT full_name AS student, email AS contact FROM students;',['projection','AS'],[48,63]],
 ['where','Filter with comparisons and Boolean logic',"SELECT full_name FROM staff WHERE salary > 50000 AND dept_code = 'COMP';",['WHERE','AND','comparison'],[30,48,63]],
 ['null','Find students with no department','SELECT full_name FROM students WHERE dept_code IS NULL;',['IS NULL'],[42,43]],
 ['null-replacement','Display a replacement for missing data',"SELECT full_name, COALESCE(email,'No email') AS contact, IFNULL(dept_code,'NONE') AS department FROM students;",['COALESCE','IFNULL'],[42]],
 ['distinct','List distinct department assignments','SELECT DISTINCT dept_code FROM students WHERE dept_code IS NOT NULL;',['DISTINCT','IS NOT NULL'],[63]],
 ['sort-limit','Order results and take a subset','SELECT full_name,salary FROM staff ORDER BY salary DESC LIMIT 2;',['ORDER BY','DESC','LIMIT'],[63]],
 ['between','Find grades in an inclusive interval','SELECT student_id,grade FROM enrollments WHERE grade BETWEEN 85 AND 95;',['BETWEEN'],[64]],
 ['in-like','Combine a list filter and text pattern',"SELECT full_name FROM students WHERE dept_code IN ('COMP','BUS') AND full_name LIKE 'A%';",['IN','LIKE'],[63,69]],
 ['inner-join','Match students to departments','SELECT s.full_name,d.dept_name FROM students s INNER JOIN departments d ON s.dept_code=d.dept_code;',['INNER JOIN','table alias'],[55]],
 ['left-join','Keep students without departments','SELECT s.full_name,d.dept_name FROM students s LEFT JOIN departments d ON s.dept_code=d.dept_code;',['LEFT JOIN','outer join'],[55,56]],
 ['right-join','Keep departments without students','SELECT s.full_name,d.dept_name FROM students s RIGHT JOIN departments d ON s.dept_code=d.dept_code;',['RIGHT JOIN'],[56]],
 ['cross-join','Generate every student-course pair','SELECT s.full_name,c.course_code FROM students s CROSS JOIN courses c;',['CROSS JOIN','Cartesian product'],[56]],
 ['self-join','Find each staff member and manager','SELECT s.full_name,m.full_name AS manager FROM staff s LEFT JOIN staff m ON s.manager_id=m.staff_id;',['self join','extension'],[55,97]],
 ['composite-join','Join every component of an offering key','SELECT e.student_id,e.course_code,o.room FROM enrollments e JOIN course_offerings o ON e.course_code=o.course_code AND e.term=o.term AND e.section=o.section;',['composite join','extension'],[55,97]],
 ['aggregate','Group enrollments and filter groups','SELECT course_code,COUNT(*) AS students,AVG(grade) AS average_grade FROM enrollments GROUP BY course_code HAVING COUNT(*) >= 2;',['GROUP BY','HAVING','COUNT','AVG'],[63]],
 ['full-join','Simulate a full outer join',"SELECT s.full_name,d.dept_name FROM students s LEFT JOIN departments d ON s.dept_code=d.dept_code UNION SELECT s.full_name,d.dept_name FROM students s RIGHT JOIN departments d ON s.dept_code=d.dept_code;",['FULL OUTER JOIN concept','UNION','dialect correction'],[56]],
 ['spatial-read','Display spatial coordinates as WKT','SELECT label,ST_AsText(position) AS point_wkt FROM campus_locations;',['ST_AsText','spatial extension'],[40]]
];
for(const [id,title,sql,topics,pages] of advancedQueries)curriculumLesson('advanced','campus-'+id,title,pages,id==='full-join'?'The module presents FULL JOIN, which MariaDB/MySQL do not implement directly. UNION combines left and right joins here; DISTINCT UNION also removes duplicate result rows. This example has unique displayed student names.':id==='aggregate'?'WHERE filters individual rows before grouping; HAVING filters groups. COUNT(*) counts rows, while AVG(grade) ignores NULL grades.':`Use the current campus records to practice ${topics.join(', ')}. Related examples from later modules are labeled extensions where applicable.`,sql,topics,{tableColumns:['students','departments','staff','enrollments','course_offerings','campus_locations']});
curriculumLesson('advanced','campus-update','Update a targeted record',[50],'WHERE limits which rows change. This exercise modifies only student 3 and makes their department known.',"UPDATE students SET dept_code='ART' WHERE student_id=3;",['UPDATE','SET','WHERE']);
curriculumLesson('advanced','campus-delete','Delete rows while retaining the table',[51],'DELETE removes data, not the table definition. This isolated demonstration deletes an unreferenced student. Continue restores the entry checkpoint.',"DELETE FROM students WHERE student_id=3;",['DELETE','WHERE'],{sandbox:true});
const campusErrors=[
 ['duplicate-key','Reject a duplicate student identifier',"INSERT INTO students (student_id,full_name) VALUES (1,'Duplicate');",1062,['primary key uniqueness']],
 ['missing-parent','Reject a missing department',"INSERT INTO students (student_id,full_name,dept_code) VALUES (99,'Invalid','NONE');",1452,['referential integrity','foreign key']],
 ['composite-missing','Reject an incomplete offering reference',"INSERT INTO enrollments (student_id,course_code,term,section) VALUES (1,'DB101','2026A',9);",1452,['composite foreign key']],
 ['restrict','Protect a referenced student','DELETE FROM students WHERE student_id=1;',1451,['RESTRICT']],
 ['two-primary','Reject two independent primary keys','CREATE TABLE wrong_keys (a INT PRIMARY KEY,b INT PRIMARY KEY);',1068,['one primary key per table']],
 ['null-required','Reject a missing required name','INSERT INTO students (student_id,full_name) VALUES (99,NULL);',1048,['NOT NULL']],
 ['tiny-range','Reject an out-of-range integer',"INSERT INTO courses VALUES ('BAD','Invalid','COMP',256);",1264,['TINYINT UNSIGNED limits']]
];
for(const [id,title,sql,errorCode,topics] of campusErrors){const isWarning=id==='tiny-range';curriculumLesson('advanced','campus-error-'+id,title,[32,42,60,62],isWarning?`This out-of-range value is a warning in the permissive SQL mode used by the lab. Inspect warning ${errorCode} and the coerced value; do not call a warning an exception.`:`Attempt the stated invalid operation. Success means receiving error ${errorCode} while preserving the database. Read the error instead of replacing the requested attempt with another failure.`,sql,topics,isWarning?{kind:'query',sandbox:true,objective:'Recognize an out-of-range warning and inspect the resulting value.',prompt:'Run the insert and identify warning 1264 in the result before continuing.'}:{kind:'error',errorCode,sandbox:true});}
curriculumLesson('advanced','campus-cascade','Observe cascading profile deletion',[60],'Remove dependent enrollments first, then delete student 1. The profile disappears through ON DELETE CASCADE. Continue restores the checkpoint. This relationship action is an extension beyond the printed module SQL.','DELETE FROM enrollments WHERE student_id=1; DELETE FROM students WHERE student_id=1; SELECT * FROM profiles;',['ON DELETE CASCADE','relationship extension'],{sandbox:true});
curriculumLesson('advanced','campus-set-null','Observe SET NULL on an optional instructor',[60],'Staff member 12 has no subordinate staff reference. Deleting this instructor sets the associated offering instructor_id to NULL. Continue restores the checkpoint.','DELETE FROM staff WHERE staff_id=12; SELECT instructor_id FROM course_offerings WHERE course_code=\'BUS101\';',['ON DELETE SET NULL','relationship extension'],{sandbox:true});
curriculumLesson('advanced','campus-alter-add','Add an optional field',[53],'ALTER changes structure; UPDATE changes values. Add a nullable contact field without rebuilding student rows.','ALTER TABLE students ADD COLUMN contact_note VARCHAR(60);',['ALTER ADD']);
curriculumLesson('advanced','campus-alter-modify','Increase a field capacity',[53,54],'MODIFY supplies the complete new column definition. Omitted constraints may change, so restate the intended type and constraints.','ALTER TABLE students MODIFY COLUMN contact_note VARCHAR(120);',['ALTER MODIFY']);
curriculumLesson('advanced','campus-alter-drop','Remove a field',[53,54],'DROP COLUMN removes the field and its values; other fields remain.','ALTER TABLE students DROP COLUMN contact_note;',['ALTER DROP COLUMN']);
curriculumLesson('advanced','campus-index','Create and inspect an index',[52,62],'An index is a separate access structure. Creating it does not change rows or grant permissions.','CREATE INDEX student_name_idx ON students (full_name); SHOW INDEX FROM students;',['CREATE INDEX','SHOW INDEX']);
curriculumLesson('advanced','campus-index-drop','Remove an index',[54,62],'DROP INDEX removes the optional index while leaving the table and rows intact.','DROP INDEX student_name_idx ON students;',['DROP INDEX']);
curriculumLesson('advanced','campus-rename','Rename a table and restore its name',[62],'RENAME changes the object name. This demonstration returns the table to its original name before continuing.','RENAME TABLE campus_locations TO campus_places; RENAME TABLE campus_places TO campus_locations;',['RENAME TABLE']);
curriculumLesson('advanced','campus-truncate','Empty a table with TRUNCATE',[62],'TRUNCATE removes all rows, keeps the definition and resets AUTO_INCREMENT where present. It is DDL with an implicit commit; it is not equivalent to a rollback-safe DELETE. Continue restores the checkpoint.','TRUNCATE TABLE resources;',['TRUNCATE','implicit commit'],{sandbox:true});
curriculumLesson('advanced','campus-drop-table','Drop a table structure',[54,55],'DROP TABLE removes both the table definition and rows. Use the isolated demonstration; Continue restores the checkpoint.','DROP TABLE campus_locations;',['DROP TABLE'],{sandbox:true});
curriculumLesson('advanced','campus-drop-database','Drop a database',[54,55],'DROP DATABASE removes its tables and data. The checkpoint is restored before the next lesson, so this demonstration cannot erase later work.','DROP DATABASE campus_project;',['DROP DATABASE'],{sandbox:true});
curriculumLesson('advanced','campus-tcl','Use transactions and a savepoint',[61,66],'START TRANSACTION begins a unit of work; SAVEPOINT names an intermediate state. ROLLBACK TO restores that state, and COMMIT retains the earlier change. DDL is excluded from this transaction example.','START TRANSACTION; UPDATE staff SET salary=53000 WHERE staff_id=11; SAVEPOINT salary_set; UPDATE staff SET salary=1 WHERE staff_id=11; ROLLBACK TO salary_set; COMMIT;',['TCL','START TRANSACTION','SAVEPOINT','ROLLBACK TO','COMMIT']);
curriculumLesson('advanced','campus-rollback','Discard an uncommitted change',[61,66],'A full ROLLBACK cancels changes since START TRANSACTION. It also ends the transaction.','START TRANSACTION; UPDATE staff SET salary=0 WHERE staff_id=11; ROLLBACK;',['ROLLBACK']);
curriculumLesson('advanced','campus-release','Release a savepoint',[61,66],'RELEASE SAVEPOINT removes the named rollback point, not the changes. COMMIT finishes the transaction.','START TRANSACTION; SAVEPOINT checkpoint; RELEASE SAVEPOINT checkpoint; COMMIT;',['RELEASE SAVEPOINT']);
curriculumLesson('advanced','campus-grant','Grant a reader access',[65],'This local simulator models account grants without creating a real server account. GRANT gives SELECT on the named table; it does not give UPDATE or access to every table.','GRANT SELECT ON students TO campus_reader; SHOW GRANTS FOR campus_reader;',['DCL','GRANT','SHOW GRANTS']);
curriculumLesson('advanced','campus-revoke','Revoke a permission',[65],'REVOKE removes a previously granted permission. It does not delete the account or table.','REVOKE SELECT ON students FROM campus_reader; SHOW GRANTS FOR campus_reader;',['REVOKE']);
curriculumLesson('advanced','campus-status','Inspect table status vertically',[45],"The printed phrase 'SHOW TABLE standing' is a translation error. Use SHOW TABLE STATUS. Backslash G is a client vertical-output terminator; do not append a semicolon to it.","SHOW TABLE STATUS LIKE 'students' \\G",['SHOW TABLE STATUS','vertical output'],{kind:'read'});
curriculumLesson('advanced','campus-client','Distinguish client commands and SQL',[44,45,57,58,59],'mysql -u username -p starts an external client from a terminal; it is not SQL and cannot run in this browser. Access Query Design and SQL View are desktop application interfaces. The incomplete printed SELECT FROM example requires a projection such as SELECT *. SQL dialects and client terminators differ.','',['MySQL monitor','terminal credentials','Access Query Design','Access SQL View','statement terminator'],{kind:'read',syntax:'Terminal: mysql -u username -p\nSQL: SELECT * FROM students;',example:'Open the client, authenticate, choose a database, then issue SQL.'});
curriculumLesson('advanced','campus-dialects','Read the module with dialect awareness',[31,33,35,36,38,39,43],'MariaDB REAL defaults to DOUBLE; FLOAT is approximate and DECIMAL is exact. CHAR defaults to length 1, while VARCHAR requires a maximum length. Binary lengths and TEXT/BLOB limits are bytes, not guaranteed character counts. TIME(3) is the MariaDB fractional-seconds form, not TIME WITHOUT TIME ZONE(3). DATE/DATETIME ranges and TIMESTAMP time-zone conversion vary by engine. DECIMAL(8,2) can store 999999.99; overflow is not automatically converted to NULL. This browser does not model server time-zone conversion, physical storage size, optimizer cost or backup files.','',['dialect differences','REAL','precision defaults','CHAR default','VARCHAR length','binary limits','temporal limits','decimal correction'],{kind:'read',syntax:'DECIMAL(8,2)\nCHAR\nVARCHAR(80)\nTIME(3)',example:'Treat an unknown value as NULL; treat an invalid range as an error.'});
/* Supplemental type work is isolated so it cannot damage the connected project. */
const typeLabs=[
 ['numeric','Compare numeric types',`CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, i INT, j INTEGER, small SMALLINT, tiny TINYINT, large BIGINT, exact_value DECIMAL(10,2), numeric_value NUMERIC(10,2), f FLOAT, r REAL, d DOUBLE, FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog VALUES ('DB101',123,-456,32767,-128,9223372036854775807,12345.67,12345.67,1.25,1.25,1.25); SELECT * FROM type_catalog;`,[31,32,33,34],['INT','INTEGER','SMALLINT','TINYINT','BIGINT','DECIMAL','NUMERIC','FLOAT','REAL','DOUBLE']],
 ['character','Compare character aliases',`CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, fixed CHARACTER(5), changing CHARACTER VARYING(40), notes TEXT, FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog VALUES ('DB101','Hi','Hello World','Longer notes'); SELECT * FROM type_catalog;`,[34,35,36],['CHARACTER','CHARACTER VARYING','TEXT']],
 ['binary','Compare binary families',`CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, fixed BINARY(5), changing VARBINARY(20), attachment BLOB, medium_attachment MEDIUMBLOB, FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog VALUES ('DB101','ab','abc','file bytes','larger file bytes'); SELECT * FROM type_catalog;`,[36,37,62],['BINARY','VARBINARY','BLOB','MEDIUMBLOB']],
 ['temporal','Store dates and times',`CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, day DATE, clock TIME(3), moment DATETIME(3), stamp TIMESTAMP(3), school_year YEAR, FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog VALUES ('DB101','2026-10-12','13:45:30.123','2026-10-12 13:45:30.123','2026-10-12 13:45:30.123',2026); SELECT * FROM type_catalog;`,[37,38,39,40],['DATE','TIME','DATETIME','TIMESTAMP','YEAR']],
 ['defaults','Separate defaults, NULL, zero and empty string',"CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, amount INT DEFAULT 0, label VARCHAR(20) DEFAULT 'pending', FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog (course_code) VALUES ('DB101'); INSERT INTO type_catalog VALUES ('WEB101',NULL,NULL),('BUS101',0,''); SELECT * FROM type_catalog;",[42,43,62],['DEFAULT','omitted value','NULL','empty string','zero']],
 ['choices','Use ENUM and SET values',"CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, size ENUM('small','medium','large'), features SET('red','green','blue'), FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog VALUES ('DB101','medium','red,blue'); SELECT * FROM type_catalog;",[40,41,42],['ENUM','SET']],
 ['json','Store and inspect structured JSON',"CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, details JSON, FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog VALUES ('DB101','{\"course\":\"DB101\",\"active\":true}'); SELECT * FROM type_catalog;",[40],['JSON']],
 ['spatial','Store spatial shapes',"CREATE TABLE type_catalog (course_code VARCHAR(12) PRIMARY KEY, shape GEOMETRY, FOREIGN KEY (course_code) REFERENCES courses(course_code)); INSERT INTO type_catalog VALUES ('DB101',ST_GeomFromText('POINT(1 2)')); SELECT ST_AsText(shape) AS wkt FROM type_catalog;",[40],['GEOMETRY','WKT']]
];
for(const [id,title,sql,pages,topics] of typeLabs)curriculumLesson('advanced','campus-types-'+id,title,pages,'Create a temporary teaching table within this isolated checkpoint. Inspect the returned values and types. Continue restores the previous campus state; the table is not silently retained.',sql,topics,{sandbox:true});
curriculumLesson('advanced','campus-type-aliases','Understand names that vary by SQL implementation',[31,36,37],'The module uses BINARY VARYING and BINARY LARGE OBJECT as descriptive or standard names. The executable MariaDB spellings here are VARBINARY and BLOB. User-defined types and TIME WITH/WITHOUT TIME ZONE are outside this simulator. BOOLEAN/BOOL are TINYINT aliases. REAL behavior depends on SQL mode; this lab uses the default DOUBLE meaning.','',['BINARY VARYING','BINARY LARGE OBJECT','BOOL','user-defined types','TIME WITH TIME ZONE'],{kind:'read',syntax:'VARBINARY(20)\nBLOB\nBOOLEAN',example:'Use a dialect-supported spelling instead of pasting every descriptive heading as SQL.'});


/* Intermediate follows the same connected campus schema, with a cumulative setup before the
   existing Module query and essentials tracks.  Every lesson has an explicit objective/prompt
   (the helper supplies readable defaults when a short source note is enough). */
curriculumLesson('intermediate','int-create','Create and select the module-practice database',[59,60],
 'Create the database container, select it, and verify that the next statements will use it.',
 'CREATE DATABASE module_practice; USE module_practice;',
 ['CREATE DATABASE','USE'], {objective:'Create and select one database for the Intermediate walkthrough.',prompt:'Run CREATE DATABASE and USE, then verify the selected database before continuing.'});
curriculumLesson('intermediate','int-inspect','Inspect the empty database',[45,60],
 'SHOW DATABASES confirms the container; SHOW TABLES confirms that no tables exist yet.',
 'SHOW DATABASES; SHOW TABLES;', ['SHOW DATABASES','SHOW TABLES'],
 {objective:'Use inspection commands before creating tables.',prompt:'Run both inspection statements and identify the selected database and current table list.',kind:'query'});
for(const [name,sql,explanation,topics] of campusTables){
 curriculumLesson('intermediate','int-table-'+name,'Create '+name,[31,32,35,40,41,42,60,62],explanation,sql,topics,
  {tableColumns:[name],objective:`Define the ${name} table with its data types, keys, and relationships.`,prompt:`Create ${name} exactly once, preserving every listed column, constraint, and relationship.`,hint:'Create referenced parent tables first; verify the definition with DESCRIBE before inserting dependent rows.'});
}
curriculumLesson('intermediate','int-inspect-schema','Inspect columns, keys and indexes',[45,61],
 'Use the three inspection statements to distinguish column definitions, composite key members, and indexes.',
 'DESCRIBE students; SHOW COLUMNS FROM enrollments; SHOW INDEX FROM course_offerings;',
 ['DESCRIBE','SHOW COLUMNS','SHOW INDEX'], {kind:'query',objective:'Read the schema you created before writing data queries.',prompt:'Run all three inspection statements and use the output to name the primary and foreign-key columns.'});
curriculumLesson('intermediate','int-load-data','Load parent rows before child rows',[49,50,64],
 'Insert a compact campus dataset in dependency order. Column lists make the intended values unambiguous.',
 `INSERT INTO departments VALUES ('COMP','Computing'),('BUS','Business'),('ART','Arts');
INSERT INTO students (student_id,full_name,email,dept_code,enrolled_on) VALUES (1,'Ana Cruz','ana@example.test','COMP','2026-08-01'),(2,'Ben Santos','ben@example.test','COMP','2026-08-02'),(3,'Cara Lim',NULL,NULL,'2026-08-03');
INSERT INTO staff VALUES (10,'Dean Reyes',NULL,'COMP',85000.00),(11,'Mia Tan',10,'COMP',52000.00),(12,'Leo Uy',NULL,'BUS',48000.00);
INSERT INTO courses VALUES ('DB101','Database Basics','COMP',3),('WEB101','Web Development','COMP',3),('BUS101','Business Intro','BUS',3);
INSERT INTO course_offerings VALUES ('DB101','2026A',1,11,'R101','09:00:00.000'),('WEB101','2026A',1,11,'R102','13:30:00.000'),('BUS101','2026A',1,12,'B101','10:00:00.000');
INSERT INTO enrollments (student_id,course_code,term,section,grade) VALUES (1,'DB101','2026A',1,91.00),(2,'DB101','2026A',1,NULL),(1,'WEB101','2026A',1,88.50);`,
 ['INSERT','column list','multiple rows','parent-before-child'], {objective:'Insert rows in parent-to-child order while preserving nullable and composite values.',prompt:'Run the inserts and confirm that rows exist in every table before querying them.'});
curriculumLesson('intermediate','int-crud','Perform CRUD changes safely',[48,49,50,51,66],
 'CREATE defines structure; SELECT reads it; INSERT adds rows; UPDATE changes selected rows; DELETE removes selected rows. This lesson uses one targeted change.',
 `INSERT INTO resources (resource_id,course_code,label,tags) VALUES (10000000001,'DB101','SQL handout','text,lab');
UPDATE students SET dept_code='ART' WHERE student_id=3;
SELECT student_id,full_name,dept_code FROM students ORDER BY student_id;
DELETE FROM resources WHERE resource_id=10000000001;`,
 ['CRUD','INSERT','SELECT','UPDATE','DELETE','WHERE','ORDER BY'], {objective:'Apply Create, Read, Update, and Delete to the connected campus data.',prompt:'Run the four statements in order and verify that only the requested student and temporary resource change.'});
const intermediateQueries=[
 ['select-all','Read every column','SELECT * FROM students;',['SELECT','FROM'],[48,63]],
 ['projection','Select columns and aliases','SELECT full_name AS student, email AS contact FROM students;',['SELECT','projection','AS'],[48,63]],
 ['where-logic','Filter with comparisons and logic',"SELECT full_name FROM staff WHERE salary > 50000 AND dept_code = 'COMP';",['WHERE','AND','comparison'],[30,48,63]],
 ['null','Test missing values correctly','SELECT full_name FROM students WHERE dept_code IS NULL;',['IS NULL'],[42,43]],
 ['null-functions','Replace missing output values',"SELECT full_name, COALESCE(email,'No email') AS contact FROM students;",['COALESCE','NULL'],[42]],
 ['distinct','Remove duplicate values','SELECT DISTINCT dept_code FROM students WHERE dept_code IS NOT NULL;',['DISTINCT','IS NOT NULL'],[63]],
 ['sort-limit','Sort and limit rows','SELECT full_name,salary FROM staff ORDER BY salary DESC LIMIT 2;',['ORDER BY','DESC','LIMIT'],[63]],
 ['between','Use an inclusive range','SELECT student_id,grade FROM enrollments WHERE grade BETWEEN 85 AND 95;',['BETWEEN'],[64]],
 ['in-like','Use IN and LIKE filters',"SELECT full_name FROM students WHERE dept_code IN ('COMP','BUS') AND full_name LIKE 'A%';",['IN','LIKE'],[63]],
 ['aggregate-group','Aggregate and filter groups','SELECT course_code,COUNT(*) AS students,AVG(grade) AS average_grade FROM enrollments GROUP BY course_code HAVING COUNT(*) >= 2;',['COUNT','AVG','GROUP BY','HAVING'],[63]],
 ['inner-join','Match related rows','SELECT s.full_name,d.dept_name FROM students s INNER JOIN departments d ON s.dept_code=d.dept_code;',['INNER JOIN','ON','alias'],[55]],
 ['left-join','Keep unmatched left rows','SELECT s.full_name,d.dept_name FROM students s LEFT JOIN departments d ON s.dept_code=d.dept_code;',['LEFT JOIN','NULL'],[55,56]],
 ['using-join','Join with USING','SELECT e.student_id,e.course_code,o.room FROM enrollments e INNER JOIN course_offerings o USING(course_code);',['USING','INNER JOIN'],[55]],
 ['cross-join','Generate pairs','SELECT s.full_name,c.course_code FROM students s CROSS JOIN courses c;',['CROSS JOIN'],[56]],
 ['union','Combine compatible result sets',"SELECT dept_code AS code FROM departments UNION SELECT dept_code FROM students WHERE dept_code IS NOT NULL;",['UNION'],[56]],
 ['expressions','Select calculated expressions','SELECT course_code, grade, grade + 5 AS curve FROM enrollments WHERE grade IS NOT NULL;',['SELECT expression','AS'],[48,63]]
];
for(const [id,title,sql,topics,pages] of intermediateQueries) curriculumLesson('intermediate','int-query-'+id,title,pages,
 `Use the campus tables to practice ${topics.join(', ')}. Check the returned columns, rows, and ordering against the objective.`,sql,topics,
 {kind:'query',objective:`Write and run a ${title.toLowerCase()} query against the campus data.`,prompt:`Run the supplied reference query, then rewrite it once from the objective while preserving the requested technique.`,tableColumns:['students','departments','courses','enrollments','course_offerings']});
curriculumLesson('intermediate','int-constraints','Test data integrity constraints',[32,42,60,62],
 'Primary keys, NOT NULL, UNIQUE, ENUM, and foreign keys reject invalid rows. Each attempt is isolated so a failed statement leaves the working data unchanged.',
 `INSERT INTO students (student_id,full_name) VALUES (1,'Duplicate');`,
 ['PRIMARY KEY','NOT NULL','UNIQUE','ENUM','FOREIGN KEY'], {kind:'error',errorCode:1062,sandbox:true,objective:'Predict and verify a primary-key violation without damaging the dataset.',prompt:'Run the duplicate-key attempt and confirm that the engine reports the requested integrity error.'});
curriculumLesson('intermediate','int-transaction','Use a transaction and savepoint',[61,66],
 'START TRANSACTION, SAVEPOINT, ROLLBACK TO, and COMMIT control a group of DML changes. DDL is outside this transaction example.',
 `START TRANSACTION;
UPDATE staff SET salary=53000 WHERE staff_id=11;
SAVEPOINT salary_set;
UPDATE staff SET salary=1 WHERE staff_id=11;
ROLLBACK TO salary_set;
COMMIT;`, ['TCL','START TRANSACTION','SAVEPOINT','ROLLBACK TO','COMMIT'],
 {objective:'Keep the first update and discard the second with a savepoint.',prompt:'Execute the transaction and query staff 11 to verify salary 53000 after COMMIT.'});
curriculumLesson('intermediate','int-dcl','Understand permissions as DCL',[65],
 'GRANT and REVOKE control access. The offline simulator records this permission without creating a real server account.',
 'GRANT SELECT ON students TO module_reader; SHOW GRANTS FOR module_reader; REVOKE SELECT ON students FROM module_reader;',
 ['DCL','GRANT','REVOKE'], {objective:'Grant, inspect, and revoke one table permission.',prompt:'Run all three statements and confirm the permission is present only between GRANT and REVOKE.'});
curriculumLesson('intermediate','int-monitor','Inspect the database before finishing',[45,61],
 'Use SHOW TABLE STATUS with the client vertical-output terminator only as a documented command; this browser accepts the statement and explains the client suffix.',
 "SHOW TABLE STATUS LIKE 'students' \\G", ['SHOW TABLE STATUS','monitoring','\\G'],
 {kind:'read',objective:'Use inspection commands to check the resulting campus database.',prompt:'Run SHOW TABLE STATUS for students and identify the table name and row estimate in the result.'});

curriculumLesson('advanced','sql-foundations','Understand SQL as a non-procedural relational language',[28,29],
 'SQL is Structured Query Language for managing relational data. You state the desired result; the database engine chooses an execution approach. It can query, insert, update, delete, and define structures.', '',
 ['SQL','Structured Query Language','relational database','non-procedural language'], {kind:'read',objective:'Explain what SQL is used for and distinguish a query from a procedural program.',prompt:'Review the SQL definition and identify the operation categories described on PDF pages 28?29.'});
curriculumLesson('advanced','sql-module2-summary','Review the Module 2 foundations',[46],
 'Module 2 connects data types, NULL handling, inspection commands, and dialect differences. Read the reference before beginning Module 3 creation work.', '',
 ['Module 2 summary','data types','NULL','inspection'], {kind:'read',objective:'Summarize the Module 2 concepts that the project lessons make executable.',prompt:'Mark this summary reviewed after explaining why NULL is different from zero and an empty string.'});
curriculumLesson('advanced','sql-module3-foundations','Plan the database before writing SQL',[47],
 'Module 3 begins by planning a schema and then using SQL statements to create and manipulate it. The campus project makes that sequence visible.', '',
 ['Module 3','schema planning','database design'], {kind:'read',objective:'Describe the Module 3 workflow from schema design through CRUD.',prompt:'Mark the Module 3 introduction reviewed before creating the campus database.'});

curriculumLesson('advanced','campus-unique-reference','Reference a UNIQUE key instead of a primary key',[32,61,62],
 'A foreign key may reference a candidate key that is UNIQUE. This alias table points to departments.dept_name, whose UNIQUE constraint makes the reference valid.',
 `CREATE TABLE department_aliases (alias VARCHAR(30) PRIMARY KEY, dept_name VARCHAR(80), FOREIGN KEY (dept_name) REFERENCES departments(dept_name));
INSERT INTO department_aliases VALUES ('computing','Computing');
SELECT alias,dept_name FROM department_aliases;`,
 ['FOREIGN KEY','UNIQUE reference','candidate key'], {objective:'Use a UNIQUE candidate key as the target of a foreign key.',prompt:'Create department_aliases, insert the Computing alias, and query the referenced department name.'});
curriculumLesson('advanced','campus-error-incompatible-fk','Reject incompatible foreign-key column types',[32,42,62],
 'Foreign-key columns must use compatible types with the referenced key. This deliberately mismatches VARCHAR and INT so the table definition is rejected.',
 `CREATE TABLE wrong_parent (id INT PRIMARY KEY);
CREATE TABLE wrong_child (parent_code VARCHAR(12), FOREIGN KEY (parent_code) REFERENCES wrong_parent(id));`,
 ['FOREIGN KEY','incompatible types'], {kind:'error',errorCode:1005,sandbox:true,objective:'Recognize an invalid foreign-key definition before inserting data.',prompt:'Run the two CREATE statements and confirm the incompatible foreign-key definition is rejected.'});
curriculumLesson('advanced','campus-error-invalid-composite','Reject an invalid composite reference',[32,62],
 'A composite foreign key must reference a matching composite primary or UNIQUE key. Referencing only part of the three-column offering key is invalid.',
 `CREATE TABLE bad_composite (course_code VARCHAR(12), term CHAR(6), FOREIGN KEY (course_code,term) REFERENCES course_offerings(course_code));`,
 ['composite foreign key','invalid composite reference'], {kind:'error',errorCode:1239,sandbox:true,objective:'Treat a composite key as one complete multi-column key.',prompt:'Run the invalid two-column reference and confirm the referenced key does not match a candidate key.'});
curriculumLesson('advanced','campus-comment','Document a column with COMMENT',[53,54,62],
 'COMMENT documents a column without changing its values. MODIFY repeats the full definition so NOT NULL remains in place.',
 `ALTER TABLE students MODIFY COLUMN full_name VARCHAR(80) NOT NULL COMMENT 'Student legal name';
SHOW COLUMNS FROM students;`, ['ALTER MODIFY','COMMENT','SHOW COLUMNS'], {objective:'Add a readable schema comment while preserving a column constraint.',prompt:'Apply the column comment and verify it appears in SHOW COLUMNS output.'});

/* Make the command category explicit in metadata as well as in the SQL text. */
for (const level of Object.keys(SQL_CURRICULA)) for (const q of SQL_CURRICULA[level]) {
 const t=q.topics;
 const add=x=>{if(!t.includes(x))t.push(x)};
 if (q.kind==='query') add('DQL');
 if (q.kind==='mutation' || q.kind==='error') add('DML');
 if (/\b(CREATE|ALTER|DROP|TRUNCATE|RENAME)\b/i.test(q.sql)) add('DDL');
 if (/\b(START TRANSACTION|COMMIT|ROLLBACK|SAVEPOINT|RELEASE SAVEPOINT)\b/i.test(q.sql)) add('TCL');
 if (/\b(GRANT|REVOKE)\b/i.test(q.sql)) add('DCL');
}

/* Curriculum coverage is generated into verification/curriculum-coverage.json by the companion
   test; this stable list keeps every Module 2?3 concept traceable to a lesson. */
