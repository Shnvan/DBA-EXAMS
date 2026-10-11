from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
with ZipFile(root/'outputs/DBMS_verification_evidence.zip','w',ZIP_DEFLATED) as z:
    for name in ['DBMS_midterm_practice.html','DBMS_verification_report.md']:
        z.write(root/name,name)
    for p in (root/'verification').glob('*'):
        if p.is_file(): z.write(p,p.relative_to(root).as_posix())
    for p in (root/'verification-artifacts').glob('root-lab-*'):
        if p.is_dir():
            for f in p.rglob('*'):
                if f.is_file(): z.write(f,f.relative_to(root).as_posix())
        elif p.is_file(): z.write(p,p.relative_to(root).as_posix())
    for name in ['smoke-checks.json','fk-native-probe.json','prior-verification-report.md','exam-source-audit.csv','source-audit.json']:
        p=root/'verification-artifacts'/name
        if p.exists():z.write(p,p.relative_to(root).as_posix())
print(root/'outputs/DBMS_verification_evidence.zip')
