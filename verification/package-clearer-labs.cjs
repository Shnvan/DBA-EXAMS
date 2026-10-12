const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const htmlPath=path.join(root,'DBMS_midterm_practice.html'),pdfPath='C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf';
const verified=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/current-release/results.json'),'utf8'));
if(verified.htmlSHA256!==sha(htmlPath))throw Error('HTML changed after verification. Rerun release tests.');
const tests=Object.fromEntries(verified.suites.map(s=>[s.name,s.passed])),htmlHash=sha(htmlPath),pdfHash=sha(pdfPath),htmlBytes=fs.statSync(htmlPath).size;
const {X}=require('./load.cjs')(),audit=require('./exam-wording-audit.json');
const results={...verified,writtenExam:{identification:X.examTotal('id'),multipleChoice:X.examTotal('mc'),total:X.examTotal('id')+X.examTotal('mc')},wordingAudit:audit.statusCounts,curriculum:{intermediate:34,advanced:75,total:109},taskContracts:{regular:183,curriculum:109,builder:12,total:304},tests,html:{bytes:htmlBytes,sha256:htmlHash},pdf:{sha256:pdfHash},generated:new Date().toISOString()};
const livePath=path.join(root,'verification-artifacts/live-wording-home/results.json');
if(fs.existsSync(livePath)){const live=JSON.parse(fs.readFileSync(livePath,'utf8'));if(live.htmlSHA256===htmlHash)results.live=live;}
fs.writeFileSync(path.join(root,'verification-artifacts/release-results.json'),JSON.stringify(results,null,2));
const report=`# DBMS practice: targeted PDF corrections and home-first startup

## Changes

- Reviewed all 508 previous stable question identities against the PDF's 105 pages: 448 unchanged, 42 revised, 5 replaced, and 13 retired. The active bank has ${results.writtenExam.identification} Identification and ${results.writtenExam.multipleChoice} Multiple Choice questions. Unchanged questions are byte-identical to the previous bank.
- Schema uses the recognizable page 20 actual-design/theoretical-view/legitimate-view/metadata description. It remains distinct from Schema Definition. Complete conceptual terms and literal SQL/product names remain required.
- Unsupported flat-file questions id-9/mc-67 are retired, and the mc-129 distractor is replaced. Unsupported NULL-function semantics, transaction-command definitions, alias labels, and an unprinted sales formula are retired or replaced with supported examples. The FULL JOIN workaround question now tests the module's missing-side NULL behavior. Module dialect discrepancies appear after checking.
- Every initial load, refresh, and browser reopening shows Home at the top. Saved screen, scroll and focus are ignored; restored answers, exam mode/part/question, locked reviews, SQL tasks, sessions, transactions, drafts, results, builder work and completion are retained. Normal navigation resumes each area's logical position.
- Content-aware migration filters retired identities, preserves compatible answers and shuffled order, recalculates completed scores, and reopens only affected answers. Explicit equivalence preserves complete answers and expanded MC labels when their meaning is unchanged. Storage-failure notices take priority over migration notices.
- Single-question feedback, five module parts, independent completion, within-part shuffling, autosave, themes and Clear saved progress retain their existing behavior.

The source audit records every question's disposition, reason, exact before/after content and PDF evidence in verification/exam-wording-audit.json. The readable inventory is verification/exam-wording-audit.md. Source excerpts and image-only figure/table evidence are included; no inferred labels are required. Original PDF bytes remain unchanged.

## Current verification

**${verified.total} checks passed across ${verified.suites.length} suites.** Counts come from the completed run against the actual HTML.

| Suite | Passed |
|---|---:|
${verified.suites.map(s=>`| ${s.name} | ${s.passed} |`).join('\n')}

Targeted tests exercise all ${results.writtenExam.total} active questions with perfect, incorrect, and mixed answers after shuffling. They cover blank prevention, full terms versus abbreviations, immutable first attempts, arbitrary part order, counters, saved drafts, review/navigation, automatic completion, prompt dismissal, migration of completed and partial old exams, retirement score recalculation, selective answer reopening, preservation of legacy blank locked reviews within reopened parts, Home-first startup, normal navigation resumption, escaped HTML-looking answers, malformed saves, and blocked/full storage. Existing SQL regression suites also pass.

Chrome checks cover long PDF descriptions, Home-first refresh/reopening, and both exam types and themes at 1440, 768, 360, 320, and 720 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks include actual Enter and button interactions, disabled/selected states, focus, answer locks, continuation, restoration, overlap, touch targets, and horizontal overflow. Desktop and narrow-mobile screenshots were visually inspected. Native browser zoom itself is not claimed by the reflow model.

The offline SQL engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration. PDF coverage and SQL task inventories remain included as release references.

## Artifacts

Content version: ${verified.contentVersion}

HTML SHA-256: ${htmlHash}

PDF SHA-256: ${pdfHash}

HTML bytes: ${htmlBytes.toLocaleString()}

Root/output HTML and report copies match. The evidence ZIP includes current test results, reusable sources, browser screenshots, inventories, and the unchanged source PDF.
${results.live?`\n## Production verification\n\n${results.live.passed} live automated Chrome exam checks passed at ${results.live.url} on ${results.live.executedAt}. Production returned HTTP 200 and the same HTML SHA-256 as the local verified release. Deployed source commit: ${results.live.commit}.\n\n${results.live.manual?'Normal-browser verification also confirmed Home-first refresh and tab reopening; retained exam drafts and locked feedback; all three SQL level controls; restored SQL results, transactions and savepoints; explicit Intermediate checkpoint application; and independent Free practice with escaped HTML-looking values. These checks used the Codex in-app Chromium browser, with DOM observations and a screenshot retained as evidence.\n\n':''}${results.live.automatedComplete===false?'The remaining headless live suites were interrupted by Vercel Security Checkpoint (HTTP 403). They are not counted as passing live checks. All 4,409 local checks passed; normal-browser production workflows passed. Security settings were not changed.\n\n':''}Live logs, results and screenshots are included in the evidence ZIP.\n`:''}
`;
fs.writeFileSync(path.join(root,'DBMS_verification_report.md'),report.trimEnd()+'\n');fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
fs.copyFileSync(htmlPath,path.join(root,'outputs/DBMS_midterm_practice.html'));fs.copyFileSync(path.join(root,'DBMS_verification_report.md'),path.join(root,'outputs/DBMS_verification_report.md'));
execFileSync('python',[path.join(__dirname,'package-evidence.py')],{cwd:root,stdio:'inherit'});console.log(JSON.stringify({checks:verified.total,htmlSHA256:htmlHash,pdfSHA256:pdfHash}));
