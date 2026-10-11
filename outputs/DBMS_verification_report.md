# DBMS midterm practice release

This release contains the complete-term written exam and the three-level SQL practice curriculum. The embedded PDF is unchanged.

## Written exam

- 508 stable questions: 237 Identification and 271 Multiple Choice.
- Identification prompts request complete conceptual names; acronym-only or incomplete conceptual answers are rejected. SQL command and data-type tokens remain literal where the prompt asks for syntax.
- Five fixed module parts, within-part shuffling, independent part submission, locked reviews, score/feedback restoration, and saved progress are preserved.

## SQL practice

- **Easy � Prepared database:** 125 existing independent exercises.
- **Intermediate � Module practice:** 34 guided lessons plus the existing 30 Module-query and 28 Module-essentials exercises.
- **Advanced � Complete database project:** 75 guided lessons covering Modules 2�3, connected campus tables, data types, DDL/DQL/DML/DCL/TCL, SELECT variations, relationships, expected errors, JSON, spatial WKT, and Free practice.
- Regular task sessions, Intermediate, Advanced, builder work, and Free practice remain isolated and save independently. Check runs against an isolated lesson/task checkpoint; Run uses the visible session.
- The offline engine now validates JSON, spatial values, inline and table-level foreign keys, CASCADE/SET NULL/RESTRICT actions, CREATE INDEX, and DROP INDEX while retaining transaction and savepoint behavior.

## Verification

The current regression and targeted suite recorded **1219 checks**: engineExtensions 198, fullTermExam 11, smoke 39, clearerLabs 121, followup 43, reliability 456, progressShuffle 27, regularSqlAudit 205, curriculum 10, extraBuilder 5, threeLevelBrowser 84, examBrowser 20. Browser checks covered 1440px, 768px, 360px, and 380px widths in both themes, including single-part exam rendering, saved exam restoration, level selection, lesson checks, challenge/walkthrough visibility, draft restoration, overflow, and page-error checks.

The curriculum coverage inventory is in `verification/curriculum-coverage.json` and `verification/curriculum-coverage.md`; every PDF page 28�66 has a linked Intermediate or Advanced lesson.

HTML SHA-256: `3b0eaf55ea70631b1604d684f3401b209f5777ca964acba01d6478f3a0ce6992`

Embedded PDF SHA-256: `bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c`

HTML bytes: 2,896,591
