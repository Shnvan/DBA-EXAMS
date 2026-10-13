# PDF syntax reference inventory

Content version: reviewer-v9. PDF SHA-256: bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c

Templates are constructed from taught forms and named syntax-bearing concepts; they are not PDF quotations. Visual evidence refers to image tables, diagrams or the client screenshot. Lesson notes retain conceptual teaching and Access procedures.

## Data types

- **INT / INTEGER** (`int`) — pages 31; m2-int
- **SMALLINT** (`smallint`) — pages 31, 32; m2-smallint
- **TINYINT** (`tinyint`) — pages 32; m2-tinyint
- **BIGINT** (`bigint`) — pages 32; m2-bigint
- **DECIMAL / NUMERIC** (`decimal`) — pages 32, 43; m2-decimal
- **FLOAT** (`float`) — pages 33; m2-float
- **REAL** (`real`) — pages 33, 34; m2-real
- **DOUBLE** (`double`) — pages 34; m2-double
- **CHAR / CHARACTER** (`char`) — pages 34, 35; m2-char
- **VARCHAR / CHARACTER VARYING** (`varchar`) — pages 35; m2-varchar
- **TEXT** (`text`) — pages 35, 36; m2-text
- **MEDIUMTEXT** (`mediumtext`) — pages 62; m3-mediumtext
- **BINARY** (`binary`) — pages 36; m2-binary
- **VARBINARY / BINARY VARYING** (`varbinary`) — pages 36; m2-varbinary
- **BLOB** (`blob`) — pages 36, 37; m2-blob
- **MEDIUMBLOB** (`mediumblob`) — pages 62; m3-mediumblob
- **DATE** (`date`) — pages 37, 38; m2-date
- **TIME** (`time`) — pages 38; m2-time
- **DATETIME** (`datetime`) — pages 38, 39; m2-datetime
- **TIMESTAMP** (`timestamp`) — pages 39; m2-timestamp
- **YEAR** (`year`) — pages 39, 40; m2-year
- **BOOLEAN / BOOL** (`boolean`) — pages 40; m2-boolean
- **ENUM** (`enum`) — pages 41; m2-enum
- **SET** (`set`) — pages 41, 42; m2-set-type
- **JSON** (`json`) — pages 40; m2-json
- **Spatial types** (`spatial`) — pages 40; m2-spatial — dialect note only

## Select and inspect

- **USE** (`use`) — pages 45; m2-use
- **SHOW DATABASES** (`show-databases`) — pages 45; m2-show-databases
- **SHOW TABLES** (`show-tables`) — pages 45; m2-show-tables
- **SHOW COLUMNS** (`show-columns`) — pages 45; m2-show-columns
- **SHOW INDEX** (`show-index`) — pages 45; m2-show-index
- **SHOW TABLE STATUS** (`show-status`) — pages 45; m2-show-table-status
- **DESCRIBE** (`describe`) — pages 61; m3-describe

## Data definition

- **CREATE DATABASE** (`create-database`) — pages 52; m3-create-database
- **CREATE TABLE** (`create-table`) — pages 52, 53, 58, 59; m3-create-table, m3-create-table-workflow
- **ALTER TABLE ... ADD COLUMN** (`alter-add`) — pages 53; m3-add-column
- **ALTER TABLE ... DROP COLUMN** (`alter-drop`) — pages 53, 54; m3-drop-column
- **ALTER TABLE ... MODIFY COLUMN** (`alter-modify`) — pages 53, 54; m3-modify-column
- **Table comment** (`comment`) — pages 62; m3-comment
- **RENAME TABLE** (`rename`) — pages 62; m3-rename
- **TRUNCATE TABLE** (`truncate`) — pages 62; m3-truncate
- **DROP TABLE** (`drop-table`) — pages 54, 55; m3-drop
- **DROP DATABASE** (`drop-database`) — pages 54, 55; m3-drop
- **Column attributes** (`column-attributes`) — pages 60, 62; m3-not-null, m3-unique, m3-default
- **PRIMARY KEY** (`primary-key`) — pages 15, 62, 93; m1-primary-key, m5-l1-order-key
- **FOREIGN KEY** (`foreign-key`) — pages 15, 91, 92; m1-foreign-key, m5-l1-product-line
- **AUTO_INCREMENT primary-key column** (`auto-increment`) — pages 60; m3-auto-increment

## Data manipulation

- **INSERT INTO** (`insert`) — pages 49, 50; m3-insert
- **UPDATE ... SET** (`update`) — pages 50, 51; m3-update
- **DELETE FROM** (`delete`) — pages 51; m3-delete

## Queries and conditions

- **SELECT** (`select`) — pages 48, 49, 68, 69, 70; m3-select, m3-asterisk, m4-l1-select-list
- **Column alias with AS** (`select-alias`) — pages 90; m5-l1-aliases
- **WHERE** (`where`) — pages 63, 74, 75; m3-where, m4-l3-where
- **DISTINCT** (`distinct`) — pages 63; m3-distinct
- **GROUP BY** (`group-by`) — pages 63, 93; m3-group-by, m5-l1-grouping
- **HAVING** (`having`) — pages 63; m3-having
- **ORDER BY** (`order-by`) — pages 63, 72, 73, 74; m3-order-by, m4-l2-multiple-sort
- **LIMIT** (`limit`) — pages 63; m3-limit
- **Comparison operators** (`comparison`) — pages 42, 76, 83; m4-l3-equal, m4-l4-many-conditions
- **BETWEEN** (`between`) — pages 78, 79; m4-l3-between
- **COALESCE / IFNULL** (`null-functions`) — pages 42; m2-null-defaults
- **LIKE** (`like`) — pages 79, 80; m4-l3-like
- **AND, OR, and NOT** (`and-or-not`) — pages 75, 80, 81, 83, 84, 85, 86; m4-l3-not, m4-l4-and, m4-l5-or, m4-l5-precedence, m4-l5-parentheses
- **NULL tests** (`null-tests`) — pages 42; m2-null-tests
- **AVG — Aggregate function** (`aggregates`) — pages 63; m3-group-by

## Joins

- **INNER JOIN** (`inner-join`) — pages 55, 89, 90; m3-inner-join, m5-l1-inner
- **LEFT JOIN** (`left-join`) — pages 55, 94, 95; m3-left-join, m5-l2-left
- **RIGHT JOIN** (`right-join`) — pages 56, 100, 101; m3-right-join, m5-l3-right
- **FULL OUTER JOIN** (`full-join`) — pages 56; m3-full-join
- **CROSS JOIN** (`cross-join`) — pages 56; m3-cross-join
- **ON join condition** (`on`) — pages 89; m5-l1-on
- **USING** (`using`) — pages 91, 92, 93; m5-l1-using
- **Joining more than two tables** (`multi-join`) — pages 89, 90; m5-l1-multiple-tables
- **Find unmatched rows** (`unmatched-join`) — pages 96, 97, 99, 104; m5-l2-left-missing, m5-l2-customers-no-orders, m5-l3-right-missing

## Permissions

- **GRANT** (`grant`) — pages 65; m3-grant
- **REVOKE** (`revoke`) — pages 65; m3-revoke

## Transactions

- **COMMIT** (`commit`) — pages 61; m3-commit
- **SAVEPOINT** (`savepoint`) — pages 61; m3-savepoint
- **ROLLBACK** (`rollback`) — pages 61; m3-rollback

## Terminal and MySQL client

- **Open the client’s folder** (`terminal-directory`) — pages 44; m2-mysql-monitor
- **MySQL client login** (`login`) — pages 59; m3-client-login
- **Client statement terminators** (`client-terminator`) — pages 44, 45; m2-vertical-output
- **MySQL client help and input control** (`client-help`) — pages 44; m2-mysql-monitor

## Exclusions

- Access menu workflow — Kept in Lesson notes because it is a visual workflow, not SQL syntax. (pages 57, 58)
- Unsupported FULL OUTER JOIN workaround — The PDF names FULL JOIN but does not teach a workaround; no invented workaround is added. (pages 56)
- Spatial constructor syntax — The PDF names spatial types without specifying a declaration or constructor. (pages 40, 41)
- Constructed and user-defined types — Named conceptually without a concrete declaration. Their definitions remain in Lesson notes; no CREATE TYPE syntax is invented. (pages 31)
- Indexes, views and procedures as database objects — Mentioned as objects but not taught with their own creation/deletion syntax; no additional commands are introduced. (pages 52, 54)
- IN, UNION, COUNT, MIN, MAX and SUM templates — No named concrete instruction for these forms was found in the 105-page audit. General aggregate behavior and the total-sales example remain in Lesson notes; AVG corrects the AVG_FUNCTION placeholder. (pages 49, 63, 93)
- Additional lab extensions — JSON extraction, WKT constructors, referential actions and other advanced-lab extensions are outside this PDF syntax reference.

## All-page review

| PDF page | Syntax entries or reason |
|---|---|
| 1 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 2 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 3 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 4 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 5 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 6 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 7 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 8 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 9 | Cover, institutional outcomes, unrelated programming-template syllabus, administration, or inconsistent table of contents; not DBMS teaching content. |
| 10 | Module introduction; the four actual lessons cover its outcomes. |
| 11 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 12 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 13 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 14 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 15 | primary-key, foreign-key |
| 16 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 17 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 18 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 19 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 20 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 21 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 22 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 23 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 24 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 25 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 26 | Module summary repeats the four lessons; references are attribution rather than new concepts. |
| 27 | Summary/reference material; no additional instructional concept. |
| 28 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 29 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 30 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 31 | int, smallint |
| 32 | smallint, tinyint, bigint, decimal |
| 33 | float, real |
| 34 | real, double, char |
| 35 | char, varchar, text |
| 36 | text, binary, varbinary, blob |
| 37 | blob, date |
| 38 | date, time, datetime |
| 39 | datetime, timestamp, year |
| 40 | year, boolean, json, spatial |
| 41 | enum, set |
| 42 | set, comparison, null-functions, null-tests |
| 43 | decimal |
| 44 | terminal-directory, client-terminator, client-help |
| 45 | use, show-databases, show-tables, show-columns, show-index, show-status, client-terminator |
| 46 | Summary and references repeat SQL types and monitor commands. |
| 47 | Module introduction; its database and SQL outcomes are covered in the three lessons. |
| 48 | select |
| 49 | insert, select |
| 50 | insert, update |
| 51 | update, delete |
| 52 | create-database, create-table |
| 53 | create-table, alter-add, alter-drop, alter-modify |
| 54 | alter-drop, alter-modify, drop-table, drop-database |
| 55 | drop-table, drop-database, inner-join, left-join |
| 56 | right-join, full-join, cross-join |
| 57 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 58 | create-table |
| 59 | create-table, login |
| 60 | column-attributes, auto-increment |
| 61 | describe, commit, savepoint, rollback |
| 62 | mediumtext, mediumblob, comment, rename, truncate, column-attributes, primary-key |
| 63 | where, distinct, group-by, having, order-by, limit, aggregates |
| 64 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 65 | grant, revoke |
| 66 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 67 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 68 | select |
| 69 | select |
| 70 | select |
| 71 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 72 | order-by |
| 73 | order-by |
| 74 | where, order-by |
| 75 | where, and-or-not |
| 76 | comparison |
| 77 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 78 | between |
| 79 | between, like |
| 80 | like, and-or-not |
| 81 | and-or-not |
| 82 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 83 | comparison, and-or-not |
| 84 | and-or-not |
| 85 | and-or-not |
| 86 | and-or-not |
| 87 | Module summary/reference material repeats filtering and logical operators. |
| 88 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 89 | inner-join, on, multi-join |
| 90 | select-alias, inner-join, multi-join |
| 91 | foreign-key, using |
| 92 | foreign-key, using |
| 93 | primary-key, group-by, using |
| 94 | left-join |
| 95 | left-join |
| 96 | unmatched-join |
| 97 | unmatched-join |
| 98 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 99 | unmatched-join |
| 100 | right-join |
| 101 | right-join |
| 102 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 103 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
| 104 | unmatched-join |
| 105 | Conceptual explanations, repeated examples or interface workflows retained in Lesson notes; no separate syntax-bearing form on this page. |
