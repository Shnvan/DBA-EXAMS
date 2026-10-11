# SQL reliability audit

All 183 regular tasks were checked against their prompt, fresh starting data, reference statements, expected rows/state/errors and assessment. All 12 guided challenges were checked in their cumulative school database. `sql-task-audit.json` in the evidence ZIP records each task's prompt, SQL and reference outcome.

| Defect | Reproduction | Resolution |
|---|---|---|
| Shared regular database breaks later tasks | Drop employees in one task, then open another employees task | Save a separate database/session for every regular task. Each starts with the module seed. |
| Hidden answers become blank | Answer Part 1, switch to Part 2, return or submit | Collect only rendered, editable questions. Preserve stable identities and answers in other parts. |
| Predicate passes only on small seed | Replace `>` with `>=` when the seed has no boundary value | Test reference and candidate on boundary and varied-value copies in addition to comparing the original result/state. |
| Requested technique omitted | Replace BETWEEN with inequalities; NOT with `<>`; omit requested alias; omit vertical `\\G` | Inspect parsed operations for the explicitly requested technique. Accept equivalent forms within the supported dialect. |
| Wrong operation gives the same expected error | Create two DATE primary-key columns where the task explicitly asks for INT | Validate required column definitions as well as the code, failed statement and post-error state. INTEGER remains accepted as INT. |
| Final guided join misses composite relationship | Join offerings only by course_code; omit term; omit requested sorting | Compare on alternate terms and order-sensitive data. Require the four tables and requested order. |
| DISTINCT/LIMIT task has no deterministic order | A correct ORDER BY variation returns another three countries | Wording and reference now request the first three countries alphabetically. |
| Incorrect module labels | SHOW commands on p45 labeled Module 3 | Correct to Module 2. |
| Check mutates or repeats visible mutations | Run an INSERT twice, or Check after deleting a table | Check against a fresh isolated task state; Run alone changes the visible task session. |
| Stale Correct feedback | Edit after Check, or change a cumulative builder database in another challenge | Remove feedback when SQL changes. Builder output/check feedback also carries a database-state signature. |
| Reset loses unrelated work | Reset a regular task or free practice | Reset only the selected database; retain drafts. Confirm changes, including changes in inactive builder databases. Cancellation retains state. |
| Previous sessions lost during update | Load a pre-update shared database | Archive it and offer recovery into Free practice. Keep drafts, solved history and both builder sessions. Old regular results/check feedback are cleared because they belong to a different starting state. |
| Last task loops silently | Check the last task and click Next | Replace Next with an explicit end-of-track message. |
| Partial batch feedback is unclear | CREATE and INSERT succeed, SELECT fails, later INSERT is skipped | Show completed statement results, the failed statement number and an explanation that earlier changes may remain. |
| Pending typing lost on normal close | Type and immediately close the page | Flush saves on hidden, pagehide and beforeunload. Reopening was tested in a persistent Chrome profile with file URLs. |

The engine remains a supported subset of MariaDB 10.4 for module practice. Features outside that subset produce explicit limitation diagnostics. Physical server statistics, account logins and server timezone configuration are not simulated. The footer explains these limits and module/dialect differences.
