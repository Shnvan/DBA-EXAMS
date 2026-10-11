const fs=require('fs'),path=require('path'),crypto=require('crypto');const read=n=>JSON.parse(fs.readFileSync('verification-artifacts/'+n,'utf8'));const old=read('root-lab-regression-databases.json'),added=read('root-lab-native.json'),smoke=read('root-lab-smoke.json'),legacy=read('smoke-checks.json'),extra=read('root-lab-extra.json'),browser=read('root-lab-final/browser-checks.json'),contrast=read('root-lab-contrast.json'),existing=read('root-lab-final-existing/browser-checks.json');const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');const screenshots=dirs=>dirs.reduce((sum,d)=>sum+fs.readdirSync(d).filter(n=>n.endsWith('.png')).length,0);
const engines=old.engines.map(e=>{const n=added.engines.find(x=>x.port==e.port);return{version:e.version[0],port:e.port,existing:e.passed,existingTotal:e.tasks+e.probes,new:n.passed,newTotal:n.total,totalPassed:e.passed+n.passed,total:e.tasks+e.probes+n.total,differences:e.mismatches.length+n.mismatches.length}});const summary={htmlBytes:fs.statSync('DBMS_midterm_practice.html').size,htmlSHA256:hash('DBMS_midterm_practice.html'),pdfSHA256:hash('C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE.pdf'),engines,unitAndJSDOM:smoke.passed+legacy.passed+extra.passed,playwright:browser.passed,contrastChecks:contrast.passed,minTextContrast:Math.min(...contrast.checks.map(x=>x.min)),minFocusContrast:Math.min(...contrast.checks.map(x=>x.focus)),baselineScreenshots:screenshots(['verification-artifacts/root-lab-baseline']),finalScreenshots:screenshots(['verification-artifacts/root-lab-final','verification-artifacts/root-lab-final-existing']),perfectExams:existing.filter(x=>x.score).map(x=>({width:x.width,theme:x.theme,score:x.score})),scope:'MariaDB 10.4.32 non-strict XAMPP baseline; isolated temporary server datadirs only',finished:new Date().toISOString()};fs.writeFileSync('verification-artifacts/root-lab-summary.json',JSON.stringify(summary,null,2));
const report=`# DBMS practice update verification

Updated: ${summary.finished}

## Delivered changes

- Removed the account picker. All website execution uses the fixed offline root session. GRANT/REVOKE target accounts remain simulated; the grant exercise now includes SHOW GRANTS. Its output was compared with MariaDB 10.4.32, including USAGE and quoted identifiers.
- Run, Check and keyboard submission require complete statement terminators. An unfinished batch executes nothing and keeps the draft. Semicolons inside strings, identifiers or comments do not terminate SQL; the module's vertical-output \\G alternative remains supported. Complete batches still retain earlier successful results and changes when a later statement fails.
- Added Build tables & relationships: 12 cumulative guided challenges and an independent empty sandbox. Seven tables demonstrate natural, auto-increment, shared and composite primary keys; nullable, required, self and composite foreign keys; and one-to-one, one-to-many and many-to-many designs. Exact requirements, sample rows, solutions, structure checks, previews and a metadata-driven diagram/list are included.
- Strengthened FK validation for parent indexes, compatible types and signedness, composite order, duplicate names, ALTER ADD CONSTRAINT, invalid rows, protected parent changes, and cross-database references. Self-referencing CREATE and implicit composite indexes work. MariaDB 10.4's unenforced inline REFERENCES shorthand is retained and explained.
- Drafts and database sessions survive navigation and mode changes within the open page. Reset affects only its selected mode and preserves its draft. These database sessions are not saved across page reloads.
- Embedded the original 105-page PDF. Both download controls work offline and produce the original filename and exact bytes. The final single HTML is ${summary.htmlBytes.toLocaleString()} bytes; there are no external runtime dependencies or requests.

## Verification

| Server | Existing tasks + adversarial cases | New guided + FK cases | Total exact comparisons |
|---|---:|---:|---:|
${engines.map(e=>`| ${e.version} | ${e.existing}/${e.existingTotal} | ${e.new}/${e.newTotal} | ${e.totalPassed}/${e.total} |`).join('\n')}

The existing set contains all 125 generated tasks, 30 Module queries, 28 Module essentials and 74 adversarial cases. The new set contains 12 guided challenges and 39 FK cases. Comparisons cover rows, result-column labels, relevant schema/index/FK metadata, final database state, affected rows, success warnings, and error codes/SQLSTATE. Unordered rows and documented unavailable physical statistics are normalized. Database connections are guarded by the expected test ports and exact temporary datadirs before any reset.

All ${engines[0].total} comparisons match the MariaDB 10.4.32 target. All 12 new guided sequences also match MariaDB 10.11 and MySQL 8. Cross-version differences remain intentional: extra SHOW INDEX fields, integer display widths, strict-mode conversions, different FK diagnostics/naming, and MariaDB 10.11 enforcing inline REFERENCES. Detailed mismatches are preserved in the evidence JSON; these were not silently treated as passes.

${summary.unitAndJSDOM} Node VM/jsdom checks, ${summary.playwright} Playwright checks and ${summary.contrastChecks} contrast checks passed. Coverage includes perfect/blank/wrong/partial exams, unchanged exam-bank contents, typed-answer variants, terminators, no-mutation incomplete batches, Run/Check/Show, keyboard focus, root status, all twelve new challenges, wrong schemas, error-operation controls, reset/session isolation, retained drafts, diagrams and both PDF controls. Deliberately disabled name and FK-index validation were detected by negative controls.

Screenshots: ${summary.baselineScreenshots} baseline and ${summary.finalScreenshots} final PNGs at 1440px and 380px, in light and dark themes. Existing views include home, chooser, exam before/after, all seven prior tracks, errors and focus; new views include all twelve guided challenges and empty/connected sandbox. No document overflow, overlapping header controls, external requests or JavaScript errors were observed. Selected desktop/mobile screenshots were visually inspected. Minimum measured normal-text contrast: ${summary.minTextContrast.toFixed(2)}:1; minimum focus/background contrast: ${summary.minFocusContrast.toFixed(2)}:1. Perfect identification exams score 89/89 and perfect multiple-choice exams score 60/60.

## Retained caveats and limits

The audited exam and original 125/30 task reference SQL remain unchanged. Existing module caveats remain, including unsupported FULL OUTER JOIN and the FULL alias trap, the beyond-module UNION workaround, missing DESC on p.72, and the SQL Server DATETIME minimum on p.39. The other previously audited temporal, REAL, ENUM, COMMENT, RIGHT JOIN, division and transcription notes are retained.

The page remains an offline emulator of the demonstrated command forms. Key-prefix syntax, arbitrary server features, authentication, subqueries, views and stored programs are outside its supported scope; explicit CASCADE/SET NULL actions are supported for valid foreign keys. Full storage-engine diagnostic chains and temporary-table/path text are not reproduced; primary errors use the verified target codes and SQLSTATE. Physical statistics remain explicitly unavailable. The new lab's constructed data and explicit FK syntax are labeled derived/supporting practice.

Only isolated task datadirs on ports 13307, 13311 and 13308 were used; configured XAMPP port 3307 and its existing databases were not touched. Test-server shutdown is recorded separately in root-lab-cleanup.json. The original Downloads HTML/PDF were left intact. Identical final artifacts are copied to Windows outputs and /mnt/user-data/outputs in WSL.

HTML SHA-256: ${summary.htmlSHA256}

Source/download PDF SHA-256: ${summary.pdfSHA256}
`;
if(!fs.existsSync('verification-artifacts/prior-verification-report.md'))fs.copyFileSync('DBMS_verification_report.md','verification-artifacts/prior-verification-report.md');fs.writeFileSync('DBMS_verification_report.md',report);fs.mkdirSync('outputs',{recursive:true});for(const n of ['DBMS_midterm_practice.html','DBMS_verification_report.md'])fs.copyFileSync(n,path.join('outputs',n));console.log(JSON.stringify(summary,null,2));
