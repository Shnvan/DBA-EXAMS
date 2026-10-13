const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const htmlPath=path.join(root,'DBMS_midterm_practice.html'),pdfPath='C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf';
const verified=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/current-release/results.json'),'utf8'));
if(verified.htmlSHA256!==sha(htmlPath))throw Error('HTML changed after verification. Rerun release tests.');
const tests=Object.fromEntries(verified.suites.map(s=>[s.name,s.passed])),htmlHash=sha(htmlPath),pdfHash=sha(pdfPath),htmlBytes=fs.statSync(htmlPath).size;
const {X}=require('./load.cjs')(),audit=require('./exam-wording-audit.json'),reviewerCoverage=require('./reviewer-coverage.json'),syntaxCoverage=require('./reviewer-syntax-coverage.json');
const results={...verified,syntaxReference:{categories:syntaxCoverage.categories.length,entries:syntaxCoverage.categories.reduce((n,c)=>n+c.entries.length,0),pages:syntaxCoverage.pageReview.length},reviewer:{modules:reviewerCoverage.modules,lessons:reviewerCoverage.lessons,topics:reviewerCoverage.topics,sourceConcepts:reviewerCoverage.conceptLinks.length},writtenExam:{identification:X.examTotal('id'),multipleChoice:X.examTotal('mc'),total:X.examTotal('id')+X.examTotal('mc')},wordingAudit:audit.statusCounts,curriculum:{intermediate:34,advanced:75,total:109},taskContracts:{regular:183,curriculum:109,builder:12,total:304},tests,html:{bytes:htmlBytes,sha256:htmlHash},pdf:{sha256:pdfHash},generated:new Date().toISOString()};
const exampleEvidence=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/reviewer/sql-examples.json'),'utf8')),linkEvidence=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/reviewer/official-links.json'),'utf8'));
if(linkEvidence.links.some(l=>l.status!==200))throw Error('Reviewer correction link verification failed');
const syntaxExamples=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/syntax/sql-templates.json'),'utf8')),syntaxLinks=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/syntax/official-links.json'),'utf8'));
if(syntaxLinks.links.some(l=>l.status!==200))throw Error('Syntax correction link verification failed');
const livePath=path.join(root,'verification-artifacts/live-syntax/results.json');
if(fs.existsSync(livePath)){const live=JSON.parse(fs.readFileSync(livePath,'utf8'));if(live.htmlSHA256===htmlHash)results.live=live;}
fs.writeFileSync(path.join(root,'verification-artifacts/release-results.json'),JSON.stringify(results,null,2));
const report=`# DBMS Reviewer: categorized SQL syntax reference

## Changes

- Reviewer now has **Lesson notes** and **Syntax reference** tabs. The syntax section contains ${results.syntaxReference.entries} entries across ${results.syntaxReference.categories} categories: data types, database selection/inspection, data definition, data manipulation, queries/conditions, joins, permissions, transactions, and terminal/client commands.
- Templates remain visible and are labeled as constructed syntax templates. Placeholders, optional parts, type families, prerequisites and SQL/client contexts are explained briefly. Correct forms appear first; PDF mistakes and alternate dialects have short notices with official links. Spatial storage has a note because the PDF does not specify a concrete type declaration or constructor.
- Syntax content has stable identities and is separate from the ${results.reviewer.topics} existing lesson topics across five modules and eighteen actual lessons. The new source inventory accounts for all 105 pages, including image tables and the SQL command diagram, with source-topic links, exact excerpts or reviewed visual evidence, and explicit exclusions. Access interface procedures remain in Lesson notes; outside-lab extensions and a FULL OUTER JOIN workaround are excluded.
- One syntax category is displayed at a time. Search spans only the selected tab; results name the category or lesson and open the exact entry. Search stays temporary. Tabs support arrow keys, Home and End, visible focus and responsive controls. A compact sticky tab bar allows switching without scrolling away from the current reading position.
- Content version **reviewer-v9** saves the selected tab and independent lesson/syntax anchors and offsets. v8 snapshots retain compatible exam/SQL progress and the existing lesson position, defaulting to Lesson notes. Invalid reading data resets only the affected reading section. Clear saved progress resets both sections and retains theme preferences. Initial loading and refresh still start at Home.
- Existing ${results.writtenExam.total} exam questions and SQL exercises retain their content, identities and grading in this release. Migration tests compare the preserved state directly, including mutated SQL sessions, transactions and savepoints.

## Current verification

**${verified.total} checks passed across ${verified.suites.length} suites.** Counts come from the completed run against the actual HTML.

| Suite | Passed |
|---|---:|
${verified.suites.map(s=>`| ${s.name} | ${s.passed} |`).join('\n')}

Targeted tests exercise all ${results.writtenExam.total} active questions with perfect, incorrect, and mixed answers after shuffling. They cover blank prevention, full terms versus abbreviations, immutable first attempts, arbitrary part order, counters, saved drafts, review/navigation, automatic completion, prompt dismissal, migration of completed and partial old exams, retirement score recalculation, selective answer reopening, preservation of legacy blank locked reviews within reopened parts, Home-first startup, normal navigation resumption, escaped HTML-looking answers, malformed saves, and blocked/full storage. Existing SQL regression suites also pass.

Reviewer-specific tests cover all eighteen lesson views, source and correction evidence, every active coverage identity, search/results/clear, reading anchors, migration, reset/cancellation, escaped structured content, blocked and full storage, and normal Chrome reopening. All ${exampleEvidence.examples} executable SQL and column-definition examples run in isolated offline sessions; additional behavior checks verify NULL, grouping, sorting, joins, constraints, deletion and savepoints. These are offline-engine checks rather than a claim of full server conformance. All ${linkEvidence.links.length} distinct official correction links returned HTTP 200. Chrome checks cover Reviewer, long PDF descriptions, Home-first refresh/reopening, and both exam types and themes at 1440, 768, 360, 320, and 720 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks include actual Enter and button interactions, disabled/selected states, focus, answer locks, continuation, restoration, overlap, touch targets, and horizontal overflow. Desktop and narrow-mobile screenshots were visually inspected. Native browser zoom itself is not claimed by the reflow model.

Syntax-specific checks cover all categories, PDF evidence, visible templates, corrected forms, scoped search and clearing, keyboard tabs, independent positions, v8 migration, Home-first refresh/reopening, invalid navigation, escaping and blocked/full storage. ${syntaxExamples.templates} template forms execute against declared isolated fixtures; two additional behavior checks verify transaction recovery and joins against matched and unmatched rows. These verify the offline implementation, not full server conformance. Terminal/client and PostgreSQL forms are separately checked against official documentation; the spatial entry has no executable declaration. All ${syntaxLinks.links.length} syntax-related official links returned HTTP 200. Syntax Chrome checks cover the nine category controls, source references, long code wrapping, selected states, focus, sticky-header clearance, touch targets, independent reading restoration, refresh and normal profile reopening at desktop, tablet, narrow-mobile and 200% reflow widths in both themes. Desktop and narrow-mobile screenshots were visually inspected.

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
