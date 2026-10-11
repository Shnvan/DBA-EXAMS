const fs=require('fs'),path=require('path'),crypto=require('crypto');
const json=n=>JSON.parse(fs.readFileSync(n,'utf8')),hash=n=>crypto.createHash('sha256').update(fs.readFileSync(n)).digest('hex');
const native=json('verification-artifacts/clearer-labs-native.json'),unit=json('verification-artifacts/clearer-labs-tests.json'),legacy=json('verification-artifacts/smoke-checks.json');
const browser=json('verification-artifacts/clearer-labs-browser/browser-checks.json'),theme=json('verification-artifacts/clearer-theme-browser/checks.json'),contrast=json('verification-artifacts/clearer-labs-contrast.json');
const dirs=['clearer-labs-browser','clearer-labs-existing','clearer-theme-browser'];
const screenshots=dirs.reduce((n,d)=>n+fs.readdirSync('verification-artifacts/'+d).filter(x=>x.endsWith('.png')).length,0);
const summary={htmlSHA256:hash('DBMS_midterm_practice.html'),htmlBytes:fs.statSync('DBMS_midterm_practice.html').size,pdfSHA256:hash('C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE.pdf'),unitChecks:unit.passed+legacy.passed+json('verification-artifacts/root-lab-smoke.json').passed+json('verification-artifacts/root-lab-extra.json').passed,browserChecks:browser.passed+theme.passed,screenshots,contrastChecks:contrast.passed,minimumTextContrast:Math.min(...contrast.checks.map(x=>x.min)),minimumFocusContrast:Math.min(...contrast.checks.map(x=>x.focus)),native:native.engines.map(e=>({version:e.version,passed:e.passed,total:e.total,port:e.port})),finished:new Date().toISOString()};
fs.writeFileSync('verification-artifacts/clearer-labs-summary.json',JSON.stringify(summary,null,2));
const report=`# DBMS practice page — clearer labs and dark default

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

## Current verification

- **${summary.unitChecks} Node VM/jsdom checks passed.** These cover seven valid designs through all twelve challenges, deliberately incorrect designs, constraints, exact error attempts, unchanged-state checks, terminators, root-only controls, hints, solutions, previews, diagrams, isolation, resets, drafts, exams and text-answer matching. A test-only disabled primary-key checker was detected by a negative control.
- **${summary.browserChecks} Playwright checks passed**, plus 44 existing-view captures/checks and ${summary.contrastChecks} contrast checks. Chrome was exercised at 1440px and 380px in both themes. New/saved/invalid/blocked-storage theme cases were checked on the first animation frame. Keyboard hints, Run, Check focus, PDF downloads and valid/invalid designs were exercised.
- **${screenshots} current PNG screenshots** are included: home, exam before/after, all existing tracks and errors, all guided challenges, free practice, default-theme cases, hints, alternate/incorrect designs and revised Module essentials questions. No document overflow, overlapping header buttons, external requests or JavaScript errors were observed. Selected desktop/mobile and light/dark views were visually inspected. Text contrast is at least ${summary.minimumTextContrast.toFixed(2)}:1 and focus contrast at least ${summary.minimumFocusContrast.toFixed(2)}:1 in the measured views. Perfect exams remain 216/216.
- **${native.cases} new native comparison cases per server**, covering all twelve challenges under seven designs:

| Isolated server | Passed | Port |
|---|---:|---:|
${summary.native.map(e=>`| ${e.version} | ${e.passed}/${e.total} | ${e.port} |`).join('\n')}

Native comparison checks result columns and records, affected rows, warning codes, error number/SQLSTATE, table metadata, indexes, foreign keys, automatic-number counters and final state. Error-message wording across server versions is not claimed to be identical. The MariaDB 10.4 target used SQL mode NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION and utf8mb4_general_ci.

The original 125 generated, 30 Module-query and 28 Module-essentials reference SQL statements are unchanged and all still pass the browser engine’s checks. Their previous native audit is preserved as historical comparison evidence; this update did not repeat the completed module-answer/page-reference audit.

## Preserved content and limits

The audited exam bank and seeded tables are unchanged. Required semicolons, the supported vertical terminator \\G, root-only execution, separate guided/free-practice sessions and drafts remain intact. Draft/session retention is within the open page, not across reloads. All data remains offline.

The PDF is still the exact supplied UPDATED-DBMS_MIDTERM_MODULE.pdf, embedded in the single HTML. Both download controls produce the original filename and bytes. PDF SHA-256: ${summary.pdfSHA256}.

Retained module notes include FULL JOIN/FULL OUTER JOIN behavior, the beyond-module UNION workaround, missing DESC on p.72, the SQL Server DATETIME minimum attributed to p.39, and the earlier REAL, temporal, COMMENT, ENUM, RIGHT JOIN and diagnostic caveats. The page still marks additional commands and foreign-key SQL beyond the printed examples.

This update does not implement a complete MariaDB server. Existing unsupported features such as views, stored programs, window functions, subqueries, arbitrary server settings and CASCADE/SET NULL remain outside the offline engine. Real-world schema design is broader than these guided questions: they require their named columns and stated relationships; Free practice accepts custom designs without scoring. The permissive key comparison does not waive the database engine’s required referenced-index order or compatible foreign-key types.

Only verified isolated datadirs on ports 13307, 13311 and 13308 were used and all were shut down. Existing XAMPP databases on port 3307 and the original Downloads files were untouched. Identical deliverables are placed in Windows outputs and /mnt/user-data/outputs.

## Files

- DBMS_midterm_practice.html — ${summary.htmlBytes.toLocaleString()} bytes; SHA-256 ${summary.htmlSHA256}.
- DBMS_verification_evidence.zip — current screenshots, verification scripts, current results and retained native comparison evidence.
`;
fs.writeFileSync('DBMS_verification_report.md',report);fs.mkdirSync('outputs',{recursive:true});fs.copyFileSync('DBMS_midterm_practice.html','outputs/DBMS_midterm_practice.html');fs.copyFileSync('DBMS_verification_report.md','outputs/DBMS_verification_report.md');console.log(JSON.stringify(summary,null,2));
