from pathlib import Path
from zipfile import ZipFile
import base64
import hashlib
import json
import re

root = Path(__file__).resolve().parent.parent
html = (root / 'DBMS_midterm_practice.html').read_bytes()
report = (root / 'DBMS_verification_report.md').read_bytes()
assert html == (root / 'outputs/DBMS_midterm_practice.html').read_bytes()
assert report == (root / 'outputs/DBMS_verification_report.md').read_bytes()
source = html.decode('utf8')
for name in ['engine-core.js', 'engine-parser.js', 'engine-query.js', 'engine-write.js',
             'exam-content.js', 'sql-grading.js', 'identification.js', 'ui.js']:
    assert (root / 'verification' / name).read_text(encoding='utf8').strip() in source, name
pdf = base64.b64decode(re.search(rb'id="module-pdf"[^>]*>(.*?)</script>', html, re.S).group(1))
expected_pdf_hash = 'bd934884252012c84dd9536e847f5006fa79ef8422578ef9bf65fe1e837f892c'
assert hashlib.sha256(pdf).hexdigest() == expected_pdf_hash
with ZipFile(root / 'outputs/DBMS_verification_evidence.zip') as archive:
    assert archive.testzip() is None
    assert archive.read('DBMS_midterm_practice.html') == html
    assert archive.read('DBMS_verification_report.md') == report
    for file in (root / 'verification').iterdir():
        if file.is_file():
            assert archive.read('verification-scripts/' + file.name) == file.read_bytes(), file.name
    assert len([n for n in archive.namelist() if n.startswith('screenshots/pdf-review/')]) == 7
    checks = json.loads(archive.read('screenshots/reliability-browser/checks.json'))
    assert len(checks) == 350 and all(check['passed'] for check in checks)
    print(json.dumps({'matchingCopies': True, 'matchingFragments': True, 'zipEntries': len(archive.namelist()),
                      'pdfHash': expected_pdf_hash, 'htmlHash': hashlib.sha256(html).hexdigest()}))
