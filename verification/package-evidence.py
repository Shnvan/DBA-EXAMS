from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, json, base64, re
root=Path(__file__).resolve().parent.parent
html=(root/'DBMS_midterm_practice.html').read_bytes(); report=(root/'DBMS_verification_report.md').read_bytes()
out_html=(root/'outputs/DBMS_midterm_practice.html').read_bytes(); out_report=(root/'outputs/DBMS_verification_report.md').read_bytes()
assert html==out_html and report==out_report
source=html.decode('utf-8').replace('\r\n','\n')
for name in ['engine-core.js','engine-parser.js','engine-query.js','engine-write.js','exam-content.js','identification.js','curriculum.js','sql-grading.js','lab-content.js','lab-query-contract.js','lab-assessment.js','lab-ui.css','learning-ui.js','ui.js']:
    frag=(root/'verification'/name).read_text(encoding='utf-8').strip()
    assert frag in source, name
match=re.search(r'<script id="module-pdf"[^>]*>(.*?)</script>',source,re.S)
assert match
embedded=base64.b64decode(match.group(1)); expected=(Path(r'C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf')).read_bytes(); assert embedded==expected
zip_path=root/'outputs/DBMS_verification_evidence.zip'
with ZipFile(zip_path,'w',ZIP_DEFLATED) as z:
    z.writestr('DBMS_midterm_practice.html',html)
    z.writestr('DBMS_verification_report.md',report)
    z.write(root/'verification-artifacts/release-results.json','verification-artifacts/release-results.json')
    for p in sorted((root/'verification').iterdir()):
        if p.is_file(): z.write(p,'verification-scripts/'+p.name)
    for rel in ['verification-artifacts/three-level-browser','verification-artifacts/final','verification-artifacts/pdf-review','verification-artifacts/current-release','verification-artifacts/reliability-browser','verification-artifacts/lab-ui-browser']:
        d=root/rel
        if d.exists():
            for p in sorted(d.rglob('*')):
                if p.is_file(): z.write(p,str(p.relative_to(root)).replace('\\','/'))
    z.write(Path(r'C:/Users/Ivan/Downloads/UPDATED-DBMS_MIDTERM_MODULE (1).pdf'),'UPDATED-DBMS_MIDTERM_MODULE (1).pdf')
with ZipFile(zip_path) as z:
    assert z.testzip() is None
    assert z.read('DBMS_midterm_practice.html')==html
    assert z.read('DBMS_verification_report.md')==report
print(json.dumps({'htmlSHA256':hashlib.sha256(html).hexdigest(),'pdfSHA256':hashlib.sha256(expected).hexdigest(),'zipEntries':len(z.namelist())}))
