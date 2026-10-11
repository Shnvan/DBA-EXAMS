# DBMS practice page — clearer labs and dark default

## Changes in this update

- Removed the answer-revealing **Required structure** panel. The seven table questions describe records, required capacities, permitted NULL values and relationships. Students select the SQL data types, keys and constraints.
- Rewrote all twelve guided questions. Exact sample records and attempted operations are supplied for the later questions. Hints start closed; **Show solution** reveals one possible solution only when requested.
- Changed **Check structure** to **Check answer**, and **Sandbox** to **Free practice**. Student-created structures, data previews and actual foreign-key diagrams remain visible.
- Replaced exact type/column-order comparison with explicit question rules. Accepted alternatives include reordered columns and combined keys, larger text lengths, compatible integer types/signedness, alternate constraint names and larger exact decimal scales. Required relationships and constraints still apply. TEXT capacity is checked in bytes for the utf8mb4 configuration.
- Reference INSERT statements specify column names. Sample records are compared by column name and exact numeric value, so column order and decimal scale do not cause false failures.
- Error challenges now verify the specific requested record change as well as the operation, native error number/SQLSTATE and unchanged database. Wrong duplicate records, nonexistent student 998 instead of 999, and deletion of the wrong student cannot pass.
- Simplified wording across all SQL lab tracks, including the 30 Module queries. Questions no longer depend on an unspecified previous question. Corrected the AND/OR instructions to request nine columns in one row; supplied previously implicit example values. SQL statements, page numbers, keywords and database error messages are preserved.
- Dark mode is the initial default, including when storage is blocked or the preference is invalid. Valid saved light/dark preferences remain honored. The theme is applied before CSS/first rendering and the keyboard-accessible toggle still saves the choice.

The question format was informed by [Swarthmore’s SQL assignment](https://www.cs.swarthmore.edu/courses/CS44/F20/WeeklyLabs/wlab09/sqlite_hw.html) and this [registration database exercise](https://drcs.codes/databases/exercises/registration-database.html). The table-design questions remain explicitly marked as constructed additional practice rather than printed module exercises.

## Verification retained from the table-design update

- **208 Node VM/jsdom checks passed.** These cover seven valid designs through all twelve challenges, deliberately incorrect designs, constraints, exact error attempts, unchanged-state checks, terminators, root-only controls, hints, solutions, previews, diagrams, isolation, resets, drafts, exams and text-answer matching. A test-only disabled primary-key checker was detected by a negative control.
- **398 Playwright checks passed**, plus 44 existing-view captures/checks and 12 contrast checks. Chrome was exercised at 1440px and 380px in both themes. New/saved/invalid/blocked-storage theme cases were checked on the first animation frame. Keyboard hints, Run, Check focus, PDF downloads and valid/invalid designs were exercised.
- **265 PNG screenshots from that update** are included: home, exam before/after, all existing tracks and errors, all guided challenges, free practice, default-theme cases, hints, alternate/incorrect designs and revised Module essentials questions. No document overflow, overlapping header buttons, external requests or JavaScript errors were observed. Selected desktop/mobile and light/dark views were visually inspected. Text contrast is at least 4.67:1 and focus contrast at least 3.19:1 in the measured views. Perfect exams remain 216/216.
- **84 new native comparison cases per server**, covering all twelve challenges under seven designs:

| Isolated server | Passed | Port |
|---|---:|---:|
| 10.4.32-MariaDB | 84/84 | 13307 |
| 10.11.14-MariaDB-0ubuntu0.24.04.1 | 84/84 | 13311 |
| 8.0.46-0ubuntu0.24.04.4 | 84/84 | 13308 |

Native comparison checks result columns and records, affected rows, warning codes, error number/SQLSTATE, table metadata, indexes, foreign keys, automatic-number counters and final state. Error-message wording across server versions is not claimed to be identical. The MariaDB 10.4 target used SQL mode NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION and utf8mb4_general_ci.

The original 125 generated, 30 Module-query and 28 Module-essentials reference SQL statements are unchanged and all still pass the browser engine’s checks. Their previous native audit is preserved as historical comparison evidence; this update did not repeat the completed module-answer/page-reference audit.

## Preserved content and limits

The audited exam bank and seeded tables are unchanged. Required semicolons, the supported vertical terminator \G, root-only execution, separate guided/free-practice sessions and drafts remain intact. Draft/session retention is within the open page, not across reloads. All data remains offline.

The PDF is still the exact supplied UPDATED-DBMS_MIDTERM_MODULE.pdf, embedded in the single HTML. Both download controls produce the original filename and bytes. PDF SHA-256: bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c.

Retained module notes include FULL JOIN/FULL OUTER JOIN behavior, the beyond-module UNION workaround, missing DESC on p.72, the SQL Server DATETIME minimum attributed to p.39, and the earlier REAL, temporal, COMMENT, ENUM, RIGHT JOIN and diagnostic caveats. The page still marks additional commands and foreign-key SQL beyond the printed examples.

This update does not implement a complete MariaDB server. Existing unsupported features such as views, stored programs, window functions, subqueries, arbitrary server settings and CASCADE/SET NULL remain outside the offline engine. Real-world schema design is broader than these guided questions: they require their named columns and stated relationships; Free practice accepts custom designs without scoring. The permissive key comparison does not waive the database engine’s required referenced-index order or compatible foreign-key types.

Only verified isolated datadirs on ports 13307, 13311 and 13308 were used and all were shut down. Existing XAMPP databases on port 3307 and the original Downloads files were untouched. Identical deliverables are placed in Windows outputs and /mnt/user-data/outputs.

## Files

- DBMS_midterm_practice.html — 2,710,128 bytes; SHA-256 460d8f3fc39583a795a1e08a414cd7ea1f32c49fc27d826a78aab36d10b77dc7.
- DBMS_verification_evidence.zip — current screenshots, verification scripts, current results and retained native comparison evidence.

## Follow-up: shorter lab messages

Removed repeated offline explanations from questions, root status headers, the PDF badge and GRANT output. SHOW INDEX and SHOW TABLE STATUS retain a short explanation of unavailable fields inside a closed, keyboard-accessible About this result disclosure. The shared footer explains the browser practice model once; unsupported commands and module caveats remain explicit.

After this cleanup, all 39 existing VM/jsdom smoke checks passed. Twenty additional browser checks/screenshots cover regular queries, indexes, table status, grants and the table builder at 1440px/380px in both themes. The result notes open with the keyboard and start closed. No page overflow or JavaScript errors were observed. The exam, all 183 original reference statements/page labels and embedded PDF bytes are unchanged. No real-server rerun was needed for these presentation-only changes. Earlier screenshots and native comparison evidence are retained with the new cleanup screenshots.
## Exam shuffle and automatic progress saving

The written exam now keeps stable question identities while independently shuffling the 89 identification, 67 true/false, and 60 multiple-choice items with Fisher?Yates. Multiple-choice option order stays fixed. Shuffle confirmation protects an in-progress attempt; shuffle starts a fresh attempt, while Start over clears answers and results and keeps the selected order. Submitted attempts restore their score, feedback, and disabled controls.

The app stores one versioned JSON snapshot at `dbms-progress-v1` in the current browser profile. It restores the last screen, selected task, drafts, structured SQL results and feedback, databases, transactions/savepoints, guided/free-practice sessions, completion markers, previews, latest attempts, exam order and answers, plus the saved scroll anchor. Typing uses a 250 ms debounce; selections, navigation, execution, checking, submission, shuffle and reset save immediately. Visibility/pagehide flushes pending changes. Theme preference remains in its separate `dbms-theme` key.

Malformed or incompatible snapshots are rejected with a brief status message. Storage failures leave the previous successful snapshot intact and keep the page usable. The footer provides **Clear saved progress**, preserving the theme. Restored values are rendered through the existing escaping and result renderers; saved HTML is never trusted.

Verification: 208 existing VM/jsdom checks passed (39 smoke, 121 clearer-lab, 43 follow-up, 5 builder), 11 focused shuffle/persistence checks passed, and 10 Chrome checks passed at 1440px and 380px. The focused checks covered shuffled coverage, reload restoration of SQL drafts and exam order/answers, malformed/incompatible snapshots, blocked storage, and clearing progress while retaining the theme. Final HTML SHA-256: `c2128431b48f1cd29804447c6dc6b22b7ddc4f28bd4282b14634ce9239c4522c`.
