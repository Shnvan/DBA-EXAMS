# DBMS practice: one-question written exam

## Changes

- Identification and Multiple Choice show one question at a time within the existing five module parts. The 508-question bank and full-term grading rules are unchanged.
- Check Answer immediately reveals Correct/Incorrect, the learner's answer, the complete expected term, PDF page, and applicable module notes. Answers lock after the first check. Enter checks Identification answers; checking never advances automatically.
- Previous and Next preserve review and drafts. Part selectors restore each part's question position. Live correct/checked/remaining counters and the completion bar derive from checked identities.
- Parts finish automatically when every question is checked. The last feedback stays visible, with the part score and explicit Continue/Stay choices. Completing five parts shows the overall score.
- No Hint button, pre-check answer preview, or Submit part control. Layout follows the reference card while retaining the app's two themes, 44px controls, responsive navigation, and accessible feedback/focus.
- Versioned migration preserves prior answers, orders, completed scores, and SQL work. Submitted parts become checked locked reviews; unsubmitted drafts remain editable. Positions, checks, and continuation dismissal save automatically.

Easy, Intermediate, Advanced, Free practice, and previous builder sessions retain their existing behavior. Original PDF bytes are unchanged.

## Current verification

**3346 checks passed across 20 suites.** Counts come from the completed run against the actual HTML.

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
| singleQuestion | 31 |
| singleQuestionBrowser | 544 |
| examBrowser | 20 |
| threeLevelBrowser | 84 |
| reliabilityBrowser | 350 |
| labBrowser | 448 |

Targeted tests exercise all 508 questions with perfect, incorrect, and mixed answers after shuffling. They cover blank prevention, full terms versus abbreviations, immutable first attempts, arbitrary part order, counters, saved drafts, review/navigation, automatic completion, prompt dismissal, migration of completed and partial old exams, escaped HTML-looking answers, malformed saves, and blocked/full storage. Existing SQL regression suites also pass.

Chrome checks cover both exam types and themes at 1440, 768, 360, 320, and 720 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks include actual Enter and button interactions, disabled/selected states, focus, answer locks, continuation, restoration, overlap, touch targets, and horizontal overflow. Desktop and narrow-mobile screenshots were visually inspected. Native browser zoom itself is not claimed by the reflow model.

The offline SQL engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration. PDF coverage and SQL task inventories remain included as release references.

## Artifacts

Content version: single-question-exam-v6

HTML SHA-256: 16c470d8794c774a4a8a7dcb0fa5e97cd66f75f8a9d9a1472d1fe18e25942447

PDF SHA-256: bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c

HTML bytes: 2,983,715

Root/output HTML and report copies match. The evidence ZIP includes current test results, reusable sources, browser screenshots, inventories, and the unchanged source PDF.
