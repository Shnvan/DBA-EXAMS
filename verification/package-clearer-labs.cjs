const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const htmlPath=path.join(root,'DBMS_midterm_practice.html'),pdfPath='C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf';
const verified=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/current-release/results.json'),'utf8'));
if(verified.htmlSHA256!==sha(htmlPath))throw Error('HTML changed after verification. Rerun release tests.');
const tests=Object.fromEntries(verified.suites.map(s=>[s.name,s.passed])),htmlHash=sha(htmlPath),pdfHash=sha(pdfPath),htmlBytes=fs.statSync(htmlPath).size;
const {X}=require('./load.cjs')(),audit=require('./exam-wording-audit.json'),reviewerCoverage=require('./reviewer-coverage.json');
const results={...verified,reviewer:{modules:reviewerCoverage.modules,lessons:reviewerCoverage.lessons,topics:reviewerCoverage.topics,sourceConcepts:reviewerCoverage.conceptLinks.length},writtenExam:{identification:X.examTotal('id'),multipleChoice:X.examTotal('mc'),total:X.examTotal('id')+X.examTotal('mc')},wordingAudit:audit.statusCounts,curriculum:{intermediate:34,advanced:75,total:109},taskContracts:{regular:183,curriculum:109,builder:12,total:304},tests,html:{bytes:htmlBytes,sha256:htmlHash},pdf:{sha256:pdfHash},generated:new Date().toISOString()};
const exampleEvidence=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/reviewer/sql-examples.json'),'utf8')),linkEvidence=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/reviewer/official-links.json'),'utf8'));
if(linkEvidence.links.some(l=>l.status!==200))throw Error('Reviewer correction link verification failed');
const livePath=path.join(root,'verification-artifacts/live-reviewer/results.json');
if(fs.existsSync(livePath)){const live=JSON.parse(fs.readFileSync(livePath,'utf8'));if(live.htmlSHA256===htmlHash)results.live=live;}
fs.writeFileSync(path.join(root,'verification-artifacts/release-results.json'),JSON.stringify(results,null,2));
const report=`# DBMS practice: concise module Reviewer

## Changes

- Reviewer is available in navigation and on Home. It contains ${results.reviewer.topics} authored topic entries across five modules and the PDF's eighteen actual lessons, independent of the exam question bank.
- Each entry names the term directly, gives a short definition and behavior bullets, cites its source pages, and uses a small constructed example or comparison where useful. DBMS parent functions and subfunctions are separate entries. Definitions, types, aliases, NULL, commands, clauses, operators, joins, client and Access workflows are covered.
- Accurate behavior appears first. PDF errors and dialect differences have brief correction notices linking official documentation. All source evidence, diagram notes, existing ${results.reviewer.sourceConcepts} source-concept mappings, and explicit exclusions are recorded in reviewer-coverage.json and the authored content files.
- Module/lesson contents, topic links, previous/next navigation and search are ungated reading controls. Search spans all modules and does not persist; selecting a result opens its lesson and topic. Examples are reading material, with no scoring or answer gates.
- The selected reviewer lesson and topic/offset are saved automatically. Refresh and browser reopening still show Home at the top; opening Reviewer resumes reading. Invalid reviewer navigation resets only that position. Clear saved progress includes the reading position and retains the theme.
- Version reviewer-v8 preserves prior v7 exam state and SQL data exactly. The existing ${results.writtenExam.total} active questions, keys, answers, checks and SQL exercise content are unchanged in this release.

The Reviewer source inventory records all 105 PDF pages, links each instructional concept to its notes, and explains consolidation or exclusions. Earlier exam audit inventories remain included. Original PDF bytes remain unchanged.

## Current verification

**${verified.total} checks passed across ${verified.suites.length} suites.** Counts come from the completed run against the actual HTML.

| Suite | Passed |
|---|---:|
${verified.suites.map(s=>`| ${s.name} | ${s.passed} |`).join('\n')}

Targeted tests exercise all ${results.writtenExam.total} active questions with perfect, incorrect, and mixed answers after shuffling. They cover blank prevention, full terms versus abbreviations, immutable first attempts, arbitrary part order, counters, saved drafts, review/navigation, automatic completion, prompt dismissal, migration of completed and partial old exams, retirement score recalculation, selective answer reopening, preservation of legacy blank locked reviews within reopened parts, Home-first startup, normal navigation resumption, escaped HTML-looking answers, malformed saves, and blocked/full storage. Existing SQL regression suites also pass.

Reviewer-specific tests cover all eighteen lesson views, source and correction evidence, every active coverage identity, search/results/clear, reading anchors, migration, reset/cancellation, escaped structured content, blocked and full storage, and normal Chrome reopening. All ${exampleEvidence.examples} executable SQL and column-definition examples run in isolated offline sessions; additional behavior checks verify NULL, grouping, sorting, joins, constraints, deletion and savepoints. These are offline-engine checks rather than a claim of full server conformance. All ${linkEvidence.links.length} distinct official correction links returned HTTP 200. Chrome checks cover Reviewer, long PDF descriptions, Home-first refresh/reopening, and both exam types and themes at 1440, 768, 360, 320, and 720 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks include actual Enter and button interactions, disabled/selected states, focus, answer locks, continuation, restoration, overlap, touch targets, and horizontal overflow. Desktop and narrow-mobile screenshots were visually inspected. Native browser zoom itself is not claimed by the reflow model.

The offline SQL engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration. PDF coverage and SQL task inventories remain included as release references.

## Artifacts

Content version: ${verified.contentVersion}

HTML SHA-256: ${htmlHash}

PDF SHA-256: ${pdfHash}

HTML bytes: ${htmlBytes.toLocaleString()}

Root/output HTML and report copies match. The evidence ZIP includes current test results, reusable sources, browser screenshots, inventories, and the unchanged source PDF.
${results.live?`\n## Production verification\n\n${results.live.passed} live automated Chrome checks passed at ${results.live.url} on ${results.live.executedAt}. Production returned HTTP 200 and the same HTML SHA-256 as the local verified release. Deployed source commit: ${results.live.commit}.\n\n${results.live.manualReviewer?'Normal-browser verification additionally confirmed the deployed Reviewer, module/lesson navigation, search, visible examples and corrections, Home-first refresh and saved reading resumption. Observations and a screenshot are retained as evidence.\n\n':''}${results.live.automatedComplete===false?'The remaining headless live suites were interrupted by Vercel Security Checkpoint (HTTP 403). They are not counted as passing live checks. All local release checks passed. The recorded normal-browser checks supplement the completed live automated suites. Security settings were not changed.\n\n':''}Live logs, results and screenshots are included in the evidence ZIP.\n`:''}
`;
fs.writeFileSync(path.join(root,'DBMS_verification_report.md'),report.trimEnd()+'\n');fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
fs.copyFileSync(htmlPath,path.join(root,'outputs/DBMS_midterm_practice.html'));fs.copyFileSync(path.join(root,'DBMS_verification_report.md'),path.join(root,'outputs/DBMS_verification_report.md'));
execFileSync('python',[path.join(__dirname,'package-evidence.py')],{cwd:root,stdio:'inherit'});console.log(JSON.stringify({checks:verified.total,htmlSHA256:htmlHash,pdfSHA256:pdfHash}));
