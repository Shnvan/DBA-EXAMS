# DBMS practice: targeted PDF corrections and home-first startup

## Changes

- Reviewed all 508 previous stable question identities against the PDF's 105 pages: 448 unchanged, 42 revised, 5 replaced, and 13 retired. The active bank has 231 Identification and 264 Multiple Choice questions. Unchanged questions are byte-identical to the previous bank.
- Schema uses the recognizable page 20 actual-design/theoretical-view/legitimate-view/metadata description. It remains distinct from Schema Definition. Complete conceptual terms and literal SQL/product names remain required.
- Unsupported flat-file questions id-9/mc-67 are retired, and the mc-129 distractor is replaced. Unsupported NULL-function semantics, transaction-command definitions, alias labels, and an unprinted sales formula are retired or replaced with supported examples. The FULL JOIN workaround question now tests the module's missing-side NULL behavior. Module dialect discrepancies appear after checking.
- Every initial load, refresh, and browser reopening shows Home at the top. Saved screen, scroll and focus are ignored; restored answers, exam mode/part/question, locked reviews, SQL tasks, sessions, transactions, drafts, results, builder work and completion are retained. Normal navigation resumes each area's logical position.
- Content-aware migration filters retired identities, preserves compatible answers and shuffled order, recalculates completed scores, and reopens only affected answers. Explicit equivalence preserves complete answers and expanded MC labels when their meaning is unchanged. Storage-failure notices take priority over migration notices.
- Single-question feedback, five module parts, independent completion, within-part shuffling, autosave, themes and Clear saved progress retain their existing behavior.

The source audit records every question's disposition, reason, exact before/after content and PDF evidence in verification/exam-wording-audit.json. The readable inventory is verification/exam-wording-audit.md. Source excerpts and image-only figure/table evidence are included; no inferred labels are required. Original PDF bytes remain unchanged.

## Current verification

**4409 checks passed across 25 suites.** Counts come from the completed run against the actual HTML.

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
| singleQuestionBrowser | 586 |
| homeStartupBrowser | 230 |
| pdfWordingBrowser | 200 |
| examBrowser | 24 |
| threeLevelBrowser | 90 |
| reliabilityBrowser | 380 |
| labBrowser | 464 |

Targeted tests exercise all 495 active questions with perfect, incorrect, and mixed answers after shuffling. They cover blank prevention, full terms versus abbreviations, immutable first attempts, arbitrary part order, counters, saved drafts, review/navigation, automatic completion, prompt dismissal, migration of completed and partial old exams, retirement score recalculation, selective answer reopening, preservation of legacy blank locked reviews within reopened parts, Home-first startup, normal navigation resumption, escaped HTML-looking answers, malformed saves, and blocked/full storage. Existing SQL regression suites also pass.

Chrome checks cover long PDF descriptions, Home-first refresh/reopening, and both exam types and themes at 1440, 768, 360, 320, and 720 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks include actual Enter and button interactions, disabled/selected states, focus, answer locks, continuation, restoration, overlap, touch targets, and horizontal overflow. Desktop and narrow-mobile screenshots were visually inspected. Native browser zoom itself is not claimed by the reflow model.

The offline SQL engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration. PDF coverage and SQL task inventories remain included as release references.

## Artifacts

Content version: pdf-wording-home-v7

HTML SHA-256: dee4b44a0ee8b2f3c28d7688efc2fb41508f23306a63966b83560f6ccb3bdb32

PDF SHA-256: bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c

HTML bytes: 2,993,798

Root/output HTML and report copies match. The evidence ZIP includes current test results, reusable sources, browser screenshots, inventories, and the unchanged source PDF.

## Production verification

586 live automated Chrome exam checks passed at https://dbmsmidtermexam-3-4.vercel.app/ on 2026-10-12T04:25:38.385798+00:00. Production returned HTTP 200 and the same HTML SHA-256 as the local verified release. Deployed source commit: be3441dcbe2fad94625d34223427fe097aafdd20.

Normal-browser verification also confirmed Home-first refresh and tab reopening; retained exam drafts and locked feedback; all three SQL level controls; restored SQL results, transactions and savepoints; explicit Intermediate checkpoint application; and independent Free practice with escaped HTML-looking values. These checks used the Codex in-app Chromium browser, with DOM observations and a screenshot retained as evidence.

The remaining headless live suites were interrupted by Vercel Security Checkpoint (HTTP 403). They are not counted as passing live checks. All 4,409 local checks passed; normal-browser production workflows passed. Security settings were not changed.

Live logs, results and screenshots are included in the evidence ZIP.
