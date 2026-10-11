# DBMS midterm verification report

Release reviewed on 12 October 2026. The written exam now contains **237 identification questions and 271 multiple-choice questions** across the five actual PDF modules. Regular SQL tasks have independent saved sessions; guided challenges remain cumulative and Free practice remains separate.

## PDF coverage

All 105 pages were extracted and visually reviewed, with enlarged inspection of table, command, diagram and truth-table pages. The inventory in `verification/module-coverage.json` and `verification/module-coverage.md` links questions to their source pages, records every page's disposition, and explains exclusions. The seven full-PDF contact sheets and larger table/diagram sheets are included in the evidence ZIP.

All 17 supplied key-function questions are represented as separate parent/subfunction concepts in both modes. Added material includes database/table elements, size categories, schemas/domains, NoSQL types/products, eight DBMS benefits and their mechanisms, numeric/string/binary/temporal/other types, precision/scale, NULL handling, monitor commands, CRUD and command families, SQL clauses, logical operators/truth tables, matching patterns, aliases, joins and relationship/example behavior. Individual illustrative names, every repeated sample row, administrative pages and unelaborated future-topic definitions are excluded with reasons.

Original question identities and answer keys remain at their original indices. An append-only semantic registry fixes the new question identities and MC option order independently of source inventory order. A regression test reverses the concept inventory and verifies identical generated question content. Identification accepts curated variants, case and punctuation, singular/plural forms and symbols. Parent functions, subfunctions, SQL categories and different technical types are distinguished in their prompts and grading. MC correct options use the same formatting as distractors.

| Part | PDF pages | Identification | Multiple choice |
|---|---|---:|---:|
| 1 ? Database Management System | 10?27 | 77 | 89 |
| 2 ? SQL Basics | 28?46 | 50 | 56 |
| 3 ? Creation of Own Database | 47?66 | 54 | 59 |
| 4 ? A Revisit in MySQL Query | 67?87 | 37 | 42 |
| 5 ? Understanding SQL Joins with MySQL | 88?105 | 19 | 25 |

Only the selected part is rendered. Any part may be submitted independently, then locks and shows its score, answers and references. Continue/Stay choices retain review or open the next unsubmitted part. Fisher?Yates shuffles inside each module only. Start over retains mode, part categories and order. Hidden/unrendered answers are preserved during navigation and submission.

## SQL audit and fixes

The evidence ZIP includes `sql-task-audit.json`: prompt, reference SQL, starting-state hash and results/error for all **183 regular tasks**, plus cumulative validation of all **12 guided challenges**. Findings and reproduction cases are in `verification/sql-audit-findings.md`.

Run executes in the selected task's saved session. Check evaluates the current draft on an isolated fresh starting database. The grader compares required results/state and explicitly requested techniques, and tests numeric boundaries and varied values to catch accidental matches on the small seed. It rejects omitted BETWEEN, NOT, aliases, vertical display and requested join forms. Multiple-primary-key error tasks must still use the requested columns and types. The final builder join is checked with alternate course terms and ordering data to catch incomplete composite matching.

Edited SQL removes stale Correct feedback and labels prior output. Builder output/check feedback also records the database state that produced it. Task reset retains drafts and affects only that task; changed databases require confirmation, including inactive databases in the builder. Completed-history markers remain historical. Last-task navigation ends explicitly. Partial batches explain which earlier statements succeeded and that their changes can remain. The DISTINCT/LIMIT country task now specifies alphabetical order. SHOW-command p45 labels are corrected to Module 2.

## Saved progress

Versioned localStorage key: `dbms-progress-v1`; current content version: `module-coverage-task-sessions-v3`. Theme remains separate. Typed input saves after 250 ms; selections/actions save immediately. Hidden, pagehide and beforeunload flush pending changes.

Snapshots store selected mode/part, stable orders/answers, submitted scores/structured reviews, focus/scroll, task drafts/completion, per-task databases, transactions/savepoints, outputs/feedback, and both builder modes with previews/latest attempts. No saved HTML is restored. SQL values and feedback are escaped during rendering.

Known legacy versions preserve compatible answers by identity/signature and reopen changed/expanded exam parts. Old shared SQL databases are archived with a recovery button into Free practice; drafts, solved history and builder databases are retained. Old regular run/check feedback is cleared because it belongs to the previous shared starting state. Malformed saves and unknown versions are rejected with a notice. Blocked/full storage retains the previous successful snapshot and keeps the app usable.

Chrome persistent-profile tests verified file-page reopening of partial/submitted identification, partial MC, transactions/savepoints, and expected-error attempts without rerunning SQL. Storage remains specific to browser profile and location; other browsers' file-URL behavior can differ.

## Current verification

**1,075 checks passed** for the current implementation:

| Suite | Passed |
|---|---:|
| Existing smoke/engine checks | 39 |
| Existing lab/design checks | 121 |
| Existing follow-up checks | 43 |
| Existing extra builder checks | 5 |
| Exam/progress/shuffle checks | 27 |
| New coverage, task assessment, migration and realistic workflow checks | 456 |
| Whole-app browser workflows across ten width/theme configurations | 350 |
| Persistent Chrome reopening, expected errors, real 200% CSS zoom and resets | 22 |
| Contrast checks | 12 |

Browser layouts: 1440, 768, 720, 360 and 320 CSS pixels, each in light/dark themes. Actual CSS 200% zoom was also checked at a 1440px viewport. Captures cover home, both exam reviews, SQL lab, guided builder and Free practice. Checks cover keyboard focus, single-part navigation, cancellation, stale feedback, escaping HTML-valued SQL, database isolation, restoration and page overflow. No script errors or overlapping header controls were detected. Visual review of desktop, narrow mobile and zoom captures found no layout overlaps. Result tables and relationship diagrams use deliberate internal scrolling for wide data. Minimum checked text contrast was 4.67:1; focus contrast was 3.18:1.

Existing native MariaDB comparison evidence is retained as historical evidence; it was not rerun for this release. The offline engine's supported SQL scope and limitations remain documented in the app footer. Current checks independently test all reference statements and the newly discovered grading/state defects.

## Integrity and reproducibility

HTML bytes: 2,818,890; SHA-256: `7167ba2a11b546af0be9452e5bc10703acc90692654e638ca35b78ffe2786b55`.

Embedded PDF bytes: 1,896,645; SHA-256: `bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c`. Embedded bytes equal the supplied PDF exactly. Root and packaged HTML/report copies are verified byte for byte; supplemental content, grading, identification and UI fragments match the embedded source. The ZIP is checked for matching copies and readable entries.

Build/sync: `node verification/build-coverage.cjs` then `node verification/sync-app.cjs`. Run the suite scripts listed above with isolated JSDOM/browser storage. Scripts use the installed Chrome/Playwright environment; see their source for local runtime paths.

## Primary sources for module errata

The module remains the teaching source. Its erroneous or dialect-dependent claims are explicitly qualified rather than silently presented as universal behavior. Corrections were checked against [MariaDB YEAR](https://mariadb.com/docs/server/reference/data-types/date-and-time-data-types/year-data-type), [DATETIME](https://mariadb.com/docs/server/reference/data-types/date-and-time-data-types/datetime), [implicit-commit statements](https://mariadb.com/docs/server/reference/sql-statements/transactions/sql-statements-that-cause-an-implicit-commit), and [ENUM non-strict behavior](https://mariadb.com/docs/server/reference/data-types/string-data-types/enum). A fuller errata list is in the coverage inventory.
