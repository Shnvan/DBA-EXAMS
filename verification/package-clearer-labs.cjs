const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const htmlPath=path.join(root,'DBMS_midterm_practice.html'),pdfPath='C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf';
const verified=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/current-release/results.json'),'utf8'));
if(verified.htmlSHA256!==sha(htmlPath))throw Error('HTML changed after verification. Rerun release tests.');
const tests=Object.fromEntries(verified.suites.map(s=>[s.name,s.passed])),htmlHash=sha(htmlPath),pdfHash=sha(pdfPath),htmlBytes=fs.statSync(htmlPath).size;
const results={...verified,writtenExam:{identification:237,multipleChoice:271,total:508},curriculum:{intermediate:34,advanced:75,total:109},taskContracts:{regular:183,curriculum:109,builder:12,total:304},tests,html:{bytes:htmlBytes,sha256:htmlHash},pdf:{sha256:pdfHash},generated:new Date().toISOString()};
fs.writeFileSync(path.join(root,'verification-artifacts/release-results.json'),JSON.stringify(results,null,2));
const report=`# DBMS practice: descriptive SQL lab tasks

## Changes

- Structured contracts cover all 183 regular exercises, 109 Intermediate/Advanced lessons, and 12 previous builder challenges. Tasks describe required columns, capacities, values, relationships, output and error behavior; reference SQL appears only after Show solution.
- Removed the MariaDB/user/task session strip, direct syntax panels, and worked-answer blocks. Optional notes/hints remain collapsed; reading-only notes use review controls.
- Added compact level navigation while solving, aligned actions, visible selected states, disabled prerequisite controls, focus restoration, and 44px navigation targets.
- Fixed drafts crossing levels, stale completion, and applying a checked result without rerunning SQL. Corrected prerequisite checkpoints can rebuild later tasks with confirmation, preserving earlier branches for recovery.
- Grading accepts equivalent methods while enforcing clearly described requirements. It validates foreign-key actions, exact error attempts, query relationships, varied records, and reads inside mutation batches. Reference child definitions adapt to accepted parent types and composite-key order.
- Versioned migration preserves exam progress, drafts, databases, transactions, savepoints and compatible checks; only invalidated checks reopen. Restore uses structured data and escaping.

The written bank remains 508 questions (237 Identification, 271 Multiple Choice), with five independent module parts. SQL practice remains Easy, Intermediate and Advanced, with separate Free practice and legacy builder sessions. The original PDF bytes are unchanged.

## Current verification

**${verified.total} checks passed across ${verified.suites.length} suites.** Counts come from the completed test run.

| Suite | Passed |
|---|---:|
${verified.suites.map(s=>`| ${s.name} | ${s.passed} |`).join('\n')}

Browser checks used the actual HTML in Chrome at desktop, tablet and narrow-mobile widths in both themes, from 320 to 1440 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks cover action overlap, page overflow, touch-target size, keyboard focus, disabled/selected states, exam restoration, independent drafts, reset cancellation, checked-result application, branch rebuilding/restoration, and browser reopening. Selected desktop and mobile screenshots were visually inspected. Earlier native-engine comparisons are historical; this release reruns the offline engine and regression suites.

The learner task/requirement inventory is in verification/lab-task-inventory.json. Existing PDF concept and Module 2-3 curriculum inventories remain synchronized. The offline engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration.

## Artifacts

Content version: ${verified.contentVersion}

HTML SHA-256: ${htmlHash}

PDF SHA-256: ${pdfHash}

HTML bytes: ${htmlBytes.toLocaleString()}

Root/output HTML and report copies match. The evidence ZIP includes current test results, verification sources, browser screenshots, task inventories, and the unchanged source PDF.
`;
fs.writeFileSync(path.join(root,'DBMS_verification_report.md'),report);fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
fs.copyFileSync(htmlPath,path.join(root,'outputs/DBMS_midterm_practice.html'));fs.copyFileSync(path.join(root,'DBMS_verification_report.md'),path.join(root,'outputs/DBMS_verification_report.md'));
execFileSync('python',[path.join(__dirname,'package-evidence.py')],{cwd:root,stdio:'inherit'});console.log(JSON.stringify({checks:verified.total,htmlSHA256:htmlHash,pdfSHA256:pdfHash}));
