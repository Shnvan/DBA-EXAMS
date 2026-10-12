# DBMS practice: descriptive SQL lab tasks

## Changes

- Structured contracts cover all 183 regular exercises, 109 Intermediate/Advanced lessons, and 12 previous builder challenges. Tasks describe required columns, capacities, values, relationships, output and error behavior; reference SQL appears only after Show solution.
- Removed the MariaDB/user/task session strip, direct syntax panels, and worked-answer blocks. Optional notes/hints remain collapsed; reading-only notes use review controls.
- Added compact level navigation while solving, aligned actions, visible selected states, disabled prerequisite controls, focus restoration, and 44px navigation targets.
- Fixed drafts crossing levels, stale completion, and applying a checked result without rerunning SQL. Corrected prerequisite checkpoints can rebuild later tasks with confirmation, preserving earlier branches for recovery.
- Grading accepts equivalent methods while enforcing clearly described requirements. It validates foreign-key actions, exact error attempts, query relationships, varied records, and reads inside mutation batches. Reference child definitions adapt to accepted parent types and composite-key order.
- Versioned migration preserves exam progress, drafts, databases, transactions, savepoints and compatible checks; only invalidated checks reopen. Restore uses structured data and escaping.

The written bank remains 508 questions (237 Identification, 271 Multiple Choice), with five independent module parts. SQL practice remains Easy, Intermediate and Advanced, with separate Free practice and legacy builder sessions. The original PDF bytes are unchanged.

## Current verification

**2779 checks passed across 18 suites.** Counts come from the completed test run.

| Suite | Passed |
|---|---:|
| smoke | 39 |
| clearerLabs | 121 |
| followup | 43 |
| reliability | 456 |
| progressShuffle | 27 |
| regularSqlAudit | 205 |
| curriculum | 10 |
| engineExtensions | 198 |
| fullTermExam | 11 |
| extraBuilder | 5 |
| labContent | 328 |
| labControls | 30 |
| labAssessment | 127 |
| queryContracts | 277 |
| examBrowser | 20 |
| threeLevelBrowser | 84 |
| reliabilityBrowser | 350 |
| labBrowser | 448 |

Browser checks used the actual HTML in Chrome at desktop, tablet and narrow-mobile widths in both themes, from 320 to 1440 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks cover action overlap, page overflow, touch-target size, keyboard focus, disabled/selected states, exam restoration, independent drafts, reset cancellation, checked-result application, branch rebuilding/restoration, and browser reopening. Selected desktop and mobile screenshots were visually inspected. Earlier native-engine comparisons are historical; this release reruns the offline engine and regression suites.

The learner task/requirement inventory is in verification/lab-task-inventory.json. Existing PDF concept and Module 2-3 curriculum inventories remain synchronized. The offline engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration.

## Artifacts

Content version: descriptive-lab-contracts-v5

HTML SHA-256: 7128804facf09f52ac36f7b026e09a4ac2d6f1d83b4ddb8a8b802ec3acef77c6

PDF SHA-256: bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c

HTML bytes: 2,974,805

Root/output HTML and report copies match. The evidence ZIP includes current test results, verification sources, browser screenshots, task inventories, and the unchanged source PDF.
