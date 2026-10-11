# Module 2–3 curriculum coverage

Lessons: 109 (34 intermediate, 75 advanced).

| Topic | PDF pages | Linked lessons |
|---|---:|---|
| SQL definition, purpose, procedural distinction | 28-30 | sql-foundations, campus-client |
| Numeric types and precision/scale | 31-34 | campus-types-numeric, campus-table-staff |
| Character string types | 34-36 | campus-types-character, campus-table-departments |
| Binary types and large objects | 36-37 | campus-types-binary, campus-table-resources |
| Date/time types and dialect differences | 37-40 | campus-types-temporal, campus-dialects |
| BOOLEAN, ENUM and SET | 40-42 | campus-table-students, campus-table-enrollments, campus-types-choices |
| JSON and spatial types | 40-42 | campus-types-json, campus-types-spatial |
| NULL values and NULL-safe querying | 42-43 | campus-null, campus-null-replacement |
| MySQL monitor and inspection commands | 44-46 | campus-inspect, campus-columns, campus-status |
| CRUD and SELECT fundamentals | 47-51 | int-crud, int-query-select-all |
| DDL CREATE and schema design | 52-55 | int-create, campus-alter-add, campus-drop-table |
| JOIN families | 55-56 | int-query-inner-join, campus-right-join, campus-cross-join |
| Access/SQL View workflow and client login (non-executable) | 57-59 | campus-client |
| Database/table creation and verification | 60-61 | int-create, int-inspect-schema |
| DDL, DQL, DML, DCL command categories | 61-66 | int-dcl, campus-tcl |
| Transactions and savepoints | 61,66 | int-transaction, campus-rollback |
| Constraints, invalid values, referential integrity | 31-43,60-62 | int-constraints, campus-error-composite-missing |
| Candidate keys, composite references, and relationship actions | 32,42,60-62 | campus-unique-reference, campus-error-incompatible-fk, campus-error-invalid-composite, campus-cascade, campus-set-null |
| Schema comments and ALTER variants | 53-54,62 | campus-comment, campus-alter-add, campus-alter-modify, campus-alter-drop |

## Page disposition (pages 28–66)

| Page | Disposition | Linked lessons |
|---:|---|---|
| 28 | covered | sql-foundations |
| 29 | covered | sql-foundations |
| 30 | covered | int-query-where-logic, campus-where |
| 31 | covered | int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-dialects, campus-types-numeric, campus-type-aliases |
| 32 | covered | int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, int-constraints, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-error-duplicate-key, campus-error-missing-parent, campus-error-composite-missing, campus-error-restrict, campus-error-two-primary, campus-error-null-required, campus-error-tiny-range, campus-types-numeric, campus-unique-reference, campus-error-incompatible-fk, campus-error-invalid-composite |
| 33 | covered | campus-dialects, campus-types-numeric |
| 34 | covered | campus-types-numeric, campus-types-character |
| 35 | covered | int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-dialects, campus-types-character |
| 36 | covered | campus-dialects, campus-types-character, campus-types-binary, campus-type-aliases |
| 37 | covered | campus-types-binary, campus-types-temporal, campus-type-aliases |
| 38 | covered | campus-dialects, campus-types-temporal |
| 39 | covered | campus-dialects, campus-types-temporal |
| 40 | covered | int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-spatial-read, campus-types-temporal, campus-types-choices, campus-types-json, campus-types-spatial |
| 41 | covered | int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-types-choices |
| 42 | covered | int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, int-query-null, int-query-null-functions, int-constraints, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-null, campus-null-replacement, campus-error-duplicate-key, campus-error-missing-parent, campus-error-composite-missing, campus-error-restrict, campus-error-two-primary, campus-error-null-required, campus-error-tiny-range, campus-types-defaults, campus-types-choices, campus-error-incompatible-fk |
| 43 | covered | int-query-null, campus-null, campus-dialects, campus-types-defaults |
| 44 | covered | campus-client |
| 45 | covered | int-inspect, int-inspect-schema, int-monitor, campus-inspect, campus-columns, campus-status, campus-client |
| 46 | covered | sql-module2-summary |
| 47 | covered | sql-module3-foundations |
| 48 | covered | int-crud, int-query-select-all, int-query-projection, int-query-where-logic, int-query-expressions, campus-select-all, campus-projection, campus-where |
| 49 | covered | int-load-data, int-crud, campus-records |
| 50 | covered | int-load-data, int-crud, campus-records, campus-update |
| 51 | covered | int-crud, campus-delete |
| 52 | covered | campus-index |
| 53 | covered | campus-alter-add, campus-alter-modify, campus-alter-drop, campus-comment |
| 54 | covered | campus-alter-modify, campus-alter-drop, campus-index-drop, campus-drop-table, campus-drop-database, campus-comment |
| 55 | covered | int-query-inner-join, int-query-left-join, int-query-using-join, campus-inner-join, campus-left-join, campus-self-join, campus-composite-join, campus-drop-table, campus-drop-database |
| 56 | covered | int-query-left-join, int-query-cross-join, int-query-union, campus-left-join, campus-right-join, campus-cross-join, campus-full-join |
| 57 | covered | campus-client |
| 58 | covered | campus-client |
| 59 | covered | int-create, campus-create, campus-client |
| 60 | covered | int-create, int-inspect, int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, int-constraints, campus-create, campus-inspect, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-error-duplicate-key, campus-error-missing-parent, campus-error-composite-missing, campus-error-restrict, campus-error-two-primary, campus-error-null-required, campus-error-tiny-range, campus-cascade, campus-set-null |
| 61 | covered | int-inspect-schema, int-transaction, int-monitor, campus-columns, campus-tcl, campus-rollback, campus-release, campus-unique-reference |
| 62 | covered | int-table-departments, int-table-students, int-table-profiles, int-table-staff, int-table-courses, int-table-course_offerings, int-table-enrollments, int-table-resources, int-table-campus_locations, int-constraints, campus-table-departments, campus-table-students, campus-table-profiles, campus-table-staff, campus-table-courses, campus-table-course_offerings, campus-table-enrollments, campus-table-resources, campus-table-campus_locations, campus-error-duplicate-key, campus-error-missing-parent, campus-error-composite-missing, campus-error-restrict, campus-error-two-primary, campus-error-null-required, campus-error-tiny-range, campus-index, campus-index-drop, campus-rename, campus-truncate, campus-types-binary, campus-types-defaults, campus-unique-reference, campus-error-incompatible-fk, campus-error-invalid-composite, campus-comment |
| 63 | covered | int-query-select-all, int-query-projection, int-query-where-logic, int-query-distinct, int-query-sort-limit, int-query-in-like, int-query-aggregate-group, int-query-expressions, campus-select-all, campus-projection, campus-where, campus-distinct, campus-sort-limit, campus-in-like, campus-aggregate |
| 64 | covered | int-load-data, int-query-between, campus-records, campus-between |
| 65 | covered | int-dcl, campus-grant, campus-revoke |
| 66 | covered | int-crud, int-transaction, campus-tcl, campus-rollback, campus-release |

## Exclusions and engine boundaries

- **Access GUI clicks, terminal login credentials, and physical server administration:** Teaching explanation only; this offline browser cannot launch an external client or create accounts.
- **Full GIS analysis and optimizer/backup internals:** Outside Modules 2–3 executable scope; spatial storage/WKT and inspection are included.
- No subqueries, procedures, triggers, views, full outer join syntax, or full GIS analysis; lessons label these as unsupported or dialect-specific.
- SHOW TABLE STATUS \G is represented as a documented client terminator, not a shell command.
