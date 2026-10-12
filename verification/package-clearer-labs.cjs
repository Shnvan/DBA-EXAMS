const fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const htmlPath=path.join(root,'DBMS_midterm_practice.html'),pdfPath='C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf';
const verified=JSON.parse(fs.readFileSync(path.join(root,'verification-artifacts/current-release/results.json'),'utf8'));
if(verified.htmlSHA256!==sha(htmlPath))throw Error('HTML changed after verification. Rerun release tests.');
const tests=Object.fromEntries(verified.suites.map(s=>[s.name,s.passed])),htmlHash=sha(htmlPath),pdfHash=sha(pdfPath),htmlBytes=fs.statSync(htmlPath).size;
const results={...verified,writtenExam:{identification:237,multipleChoice:271,total:508},curriculum:{intermediate:34,advanced:75,total:109},taskContracts:{regular:183,curriculum:109,builder:12,total:304},tests,html:{bytes:htmlBytes,sha256:htmlHash},pdf:{sha256:pdfHash},generated:new Date().toISOString()};
fs.writeFileSync(path.join(root,'verification-artifacts/release-results.json'),JSON.stringify(results,null,2));
const report=`# DBMS practice: one-question written exam

## Changes

- Identification and Multiple Choice show one question at a time within the existing five module parts. The 508-question bank and full-term grading rules are unchanged.
- Check Answer immediately reveals Correct/Incorrect, the learner's answer, the complete expected term, PDF page, and applicable module notes. Answers lock after the first check. Enter checks Identification answers; checking never advances automatically.
- Previous and Next preserve review and drafts. Part selectors restore each part's question position. Live correct/checked/remaining counters and the completion bar derive from checked identities.
- Parts finish automatically when every question is checked. The last feedback stays visible, with the part score and explicit Continue/Stay choices. Completing five parts shows the overall score.
- No Hint button, pre-check answer preview, or Submit part control. Layout follows the reference card while retaining the app's two themes, 44px controls, responsive navigation, and accessible feedback/focus.
- Versioned migration preserves prior answers, orders, completed scores, and SQL work. Submitted parts become checked locked reviews; unsubmitted drafts remain editable. Positions, checks, and continuation dismissal save automatically.

Easy, Intermediate, Advanced, Free practice, and previous builder sessions retain their existing behavior. Original PDF bytes are unchanged.

## Current verification

**${verified.total} checks passed across ${verified.suites.length} suites.** Counts come from the completed run against the actual HTML.

| Suite | Passed |
|---|---:|
${verified.suites.map(s=>`| ${s.name} | ${s.passed} |`).join('\n')}

Targeted tests exercise all 508 questions with perfect, incorrect, and mixed answers after shuffling. They cover blank prevention, full terms versus abbreviations, immutable first attempts, arbitrary part order, counters, saved drafts, review/navigation, automatic completion, prompt dismissal, migration of completed and partial old exams, escaped HTML-looking answers, malformed saves, and blocked/full storage. Existing SQL regression suites also pass.

Chrome checks cover both exam types and themes at 1440, 768, 360, 320, and 720 CSS pixels. The 720px layout models reflow at 200% zoom on a 1440px display. Checks include actual Enter and button interactions, disabled/selected states, focus, answer locks, continuation, restoration, overlap, touch targets, and horizontal overflow. Desktop and narrow-mobile screenshots were visually inspected. Native browser zoom itself is not claimed by the reflow model.

The offline SQL engine retains its documented limits: no live server, subqueries, stored programs, views, full GIS analysis, or arbitrary server configuration. PDF coverage and SQL task inventories remain included as release references.

## Artifacts

Content version: ${verified.contentVersion}

HTML SHA-256: ${htmlHash}

PDF SHA-256: ${pdfHash}

HTML bytes: ${htmlBytes.toLocaleString()}

Root/output HTML and report copies match. The evidence ZIP includes current test results, reusable sources, browser screenshots, inventories, and the unchanged source PDF.
`;
fs.writeFileSync(path.join(root,'DBMS_verification_report.md'),report);fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
fs.copyFileSync(htmlPath,path.join(root,'outputs/DBMS_midterm_practice.html'));fs.copyFileSync(path.join(root,'DBMS_verification_report.md'),path.join(root,'outputs/DBMS_verification_report.md'));
execFileSync('python',[path.join(__dirname,'package-evidence.py')],{cwd:root,stdio:'inherit'});console.log(JSON.stringify({checks:verified.total,htmlSHA256:htmlHash,pdfSHA256:pdfHash}));
