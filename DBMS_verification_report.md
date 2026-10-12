# DBMS practice: concise module Reviewer

## Changes

- Reviewer is available in navigation and on Home. It contains 221 authored topic entries across five modules and the PDF's eighteen actual lessons, independent of the exam question bank.
- Each entry names the term directly, gives a short definition and behavior bullets, cites its source pages, and uses a small constructed example or comparison where useful. DBMS parent functions and subfunctions are separate entries. Definitions, types, aliases, NULL, commands, clauses, operators, joins, client and Access workflows are covered.
- Accurate behavior appears first. PDF errors and dialect differences have brief correction notices linking official documentation. All source evidence, diagram notes, existing 265 source-concept mappings, and explicit exclusions are recorded in reviewer-coverage.json and the authored content files.
- Module/lesson contents, topic links, previous/next navigation and search are ungated reading controls. Search spans all modules and does not persist; selecting a result opens its lesson and topic. Examples are reading material, with no scoring or answer gates.
- The selected reviewer lesson and topic/offset are saved automatically. Refresh and browser reopening still show Home at the top; opening Reviewer resumes reading. Invalid reviewer navigation resets only that position. Clear saved progress includes the reading position and retains the theme.
- Version reviewer-v8 preserves prior v7 exam state and SQL data exactly. The existing 495 active questions, keys, answers, checks and SQL exercise content are unchanged in this release.

The Reviewer source inventory records all 105 PDF pages, links each instructional concept to its notes, and explains consolidation or exclusions. Earlier exam audit inventories remain included. Original PDF bytes remain unchanged.

## Current verification

**5490 checks passed across 28 suites.** Counts come from the completed run against the actual HTML.

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

The offline SQL engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration. PDF coverage and SQL task inventories remain included as release references.

## Artifacts

Content version: reviewer-v8

HTML SHA-256: 4f499b1462143f3ada959b502ca9d9cdb1eea26b3bb2859d506c96616a923ee1

PDF SHA-256: bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c

HTML bytes: 3,178,580

Root/output HTML and report copies match. The evidence ZIP includes current test results, reusable sources, browser screenshots, inventories, and the unchanged source PDF.

## Production verification

1603 live automated Chrome checks passed at https://dbmsmidtermexam-3-4.vercel.app/ on 2026-10-12T19:19:36.574Z. Production returned HTTP 200 and the same HTML SHA-256 as the local verified release. Deployed source commit: f20e538a23177043da527975856aa8d16fee6ada.

Normal-browser verification additionally confirmed the deployed Reviewer, module/lesson navigation, search, visible examples and corrections, Home-first refresh and saved reading resumption. Observations and a screenshot are retained as evidence.

Live logs, results and screenshots are included in the evidence ZIP.
