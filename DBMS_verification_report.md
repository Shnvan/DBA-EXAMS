# DBMS Reviewer: categorized SQL syntax reference

## Changes

- Reviewer now has **Lesson notes** and **Syntax reference** tabs. The syntax section contains 83 entries across 9 categories: data types, database selection/inspection, data definition, data manipulation, queries/conditions, joins, permissions, transactions, and terminal/client commands.
- Templates remain visible and are labeled as constructed syntax templates. Placeholders, optional parts, type families, prerequisites and SQL/client contexts are explained briefly. Correct forms appear first; PDF mistakes and alternate dialects have short notices with official links. Spatial storage has a note because the PDF does not specify a concrete type declaration or constructor.
- Syntax content has stable identities and is separate from the 221 existing lesson topics across five modules and eighteen actual lessons. The new source inventory accounts for all 105 pages, including image tables and the SQL command diagram, with source-topic links, exact excerpts or reviewed visual evidence, and explicit exclusions. Access interface procedures remain in Lesson notes; outside-lab extensions and a FULL OUTER JOIN workaround are excluded.
- One syntax category is displayed at a time. Search spans only the selected tab; results name the category or lesson and open the exact entry. Search stays temporary. Tabs support arrow keys, Home and End, visible focus and responsive controls. A compact sticky tab bar allows switching without scrolling away from the current reading position.
- Content version **reviewer-v9** saves the selected tab and independent lesson/syntax anchors and offsets. v8 snapshots retain compatible exam/SQL progress and the existing lesson position, defaulting to Lesson notes. Invalid reading data resets only the affected reading section. Clear saved progress resets both sections and retains theme preferences. Initial loading and refresh still start at Home.
- Existing 495 exam questions and SQL exercises retain their content, identities and grading in this release. Migration tests compare the preserved state directly, including mutated SQL sessions, transactions and savepoints.

## Current verification

**6366 checks passed across 32 suites.** Counts come from the completed run against the actual HTML.

| Suite | Passed |
|---|---:|
| smoke | 39 |
| clearerLabs | 121 |
| followup | 43 |
| reliability | 456 |
| progressShuffle | 19 |
| regularSqlAudit | 205 |
| curriculum | 10 |
| engineExtensions | 198 |
| fullTermExam | 11 |
| extraBuilder | 5 |
| labContent | 328 |
| labControls | 30 |
| labAssessment | 127 |
| queryContracts | 277 |
| pdfWording | 515 |
| homeStartup | 16 |
| migrationEdges | 4 |
| singleQuestion | 31 |
| reviewer | 21 |
| reviewerExamples | 87 |
| syntax | 15 |
| syntaxExamples | 96 |
| syntaxOfficial | 34 |
| syntaxBrowser | 731 |
| reviewerBrowser | 973 |
| singleQuestionBrowser | 586 |
| homeStartupBrowser | 230 |
| pdfWordingBrowser | 200 |
| examBrowser | 24 |
| threeLevelBrowser | 90 |
| reliabilityBrowser | 380 |
| labBrowser | 464 |

Targeted tests exercise all 495 active questions with perfect, incorrect, and mixed answers after shuffling. They cover blank prevention, full terms versus abbreviations, immutable first attempts, arbitrary part order, counters, saved drafts, review/navigation, automatic completion, prompt dismissal, migration of completed and partial old exams, retirement score recalculation, selective answer reopening, preservation of legacy blank locked reviews within reopened parts, Home-first startup, normal navigation resumption, escaped HTML-looking answers, malformed saves, and blocked/full storage. Existing SQL regression suites also pass.

Reviewer-specific tests cover all eighteen lesson views, source and correction evidence, every active coverage identity, search/results/clear, reading anchors, migration, reset/cancellation, escaped structured content, blocked and full storage, and normal Chrome reopening. All 77 executable SQL and column-definition examples run in isolated offline sessions; additional behavior checks verify NULL, grouping, sorting, joins, constraints, deletion and savepoints. These are offline-engine checks rather than a claim of full server conformance. All 34 distinct official correction links returned HTTP 200. Chrome checks cover Reviewer, long PDF descriptions, Home-first refresh/reopening, and both exam types and themes at 1440, 768, 360, 320, and 720 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks include actual Enter and button interactions, disabled/selected states, focus, answer locks, continuation, restoration, overlap, touch targets, and horizontal overflow. Desktop and narrow-mobile screenshots were visually inspected. Native browser zoom itself is not claimed by the reflow model.

Syntax-specific checks cover all categories, PDF evidence, visible templates, corrected forms, scoped search and clearing, keyboard tabs, independent positions, v8 migration, Home-first refresh/reopening, invalid navigation, escaping and blocked/full storage. 94 template forms execute against declared isolated fixtures; two additional behavior checks verify transaction recovery and joins against matched and unmatched rows. These verify the offline implementation, not full server conformance. Terminal/client and PostgreSQL forms are separately checked against official documentation; the spatial entry has no executable declaration. All 29 syntax-related official links returned HTTP 200. Syntax Chrome checks cover the nine category controls, source references, long code wrapping, selected states, focus, sticky-header clearance, touch targets, independent reading restoration, refresh and normal profile reopening at desktop, tablet, narrow-mobile and 200% reflow widths in both themes. Desktop and narrow-mobile screenshots were visually inspected.

The offline SQL engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration. PDF coverage and SQL task inventories remain included as release references.

## Artifacts

Content version: reviewer-v9

HTML SHA-256: a4720f5dd29846b56ea3f876c7d0d515235df688eee2702c1cfc49759ded3f19

PDF SHA-256: bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c

HTML bytes: 3,234,339

Root/output HTML and report copies match. The evidence ZIP includes current test results, reusable sources, browser screenshots, inventories, and the unchanged source PDF.
