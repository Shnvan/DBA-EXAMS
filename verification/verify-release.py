from pathlib import Path
from zipfile import ZipFile
import base64,hashlib,json,re
root=Path(__file__).resolve().parent.parent
html=(root/'DBMS_midterm_practice.html').read_bytes(); report=(root/'DBMS_verification_report.md').read_bytes()
assert html==(root/'outputs/DBMS_midterm_practice.html').read_bytes()
assert report==(root/'outputs/DBMS_verification_report.md').read_bytes()
source=html.decode('utf-8').replace('\r\n','\n')
fragments=['engine-core.js','engine-parser.js','engine-query.js','engine-write.js','exam-content.js','identification.js','curriculum.js','sql-grading.js','lab-content.js','lab-query-contract.js','lab-assessment.js','lab-ui.css','exam-ui.css','learning-ui.js','exam-ui.js','ui.js']
for name in fragments: assert (root/'verification'/name).read_text(encoding='utf8').strip() in source,name
m=re.search(r'<script id="module-pdf"[^>]*>(.*?)</script>',source,re.S);assert m
pdf=base64.b64decode(m.group(1));expected=(Path(r'C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf')).read_bytes();assert pdf==expected
results=json.loads((root/'verification-artifacts/release-results.json').read_text())
assert results['writtenExam']['total']==508 and results['curriculum']['total']==109 and results['taskContracts']['total']==304
assert results['htmlSHA256']==hashlib.sha256(html).hexdigest()
assert results['total']==sum(s['passed'] for s in results['suites'])
for rel in ['verification-artifacts/three-level-browser/browser-checks.json','verification-artifacts/final/browser-checks.json']:
 checks=json.loads((root/rel).read_text());assert checks and all(c.get('passed',True) and not c.get('errors') for c in checks),rel
with ZipFile(root/'outputs/DBMS_verification_evidence.zip') as z:
 assert z.testzip() is None
 assert z.read('DBMS_midterm_practice.html')==html
 assert z.read('DBMS_verification_report.md')==report
 for p in (root/'verification').iterdir():
  if p.is_file(): assert z.read('verification-scripts/'+p.name)==p.read_bytes(),p.name
print(json.dumps({'matchingCopies':True,'matchingFragments':True,'pdfSHA256':hashlib.sha256(pdf).hexdigest(),'htmlSHA256':hashlib.sha256(html).hexdigest(),'zipEntries':len(z.namelist()),'checks':results['tests']}))
