from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path.cwd()
with ZipFile(root / 'outputs/DBMS_verification_evidence.zip', 'w', ZIP_DEFLATED, compresslevel=6) as archive:
    for name in ['DBMS_midterm_practice.html', 'DBMS_verification_report.md', '.gitattributes']:
        archive.write(root / name, name)
    for folder in ['clearer-labs-browser', 'clearer-labs-existing', 'clearer-theme-browser', 'lab-notes-cleanup', 'reliability-browser', 'pdf-review']:
        for file in sorted((root / 'verification-artifacts' / folder).iterdir()):
            archive.write(file, 'screenshots/' + folder + '/' + file.name)
    for name in ['clearer-labs-before.html', 'clearer-labs-tests.json', 'clearer-labs-native.json', 'clearer-labs-contrast.json', 'clearer-labs-summary.json', 'smoke-checks.json', 'root-lab-smoke.json', 'root-lab-extra.json', 'root-lab-cleanup.json', 'progress-shuffle-tests.json', 'progress-browser.json', 'reliability-tests.json', 'reliability-edge-browser.json', 'deployment-smoke.json', 'source-audit.json', 'exam-source-audit.csv', 'sql-task-audit.json', 'previous-verification-report.md', 'module-text.json', 'tables-contact.png']:
        archive.write(root / 'verification-artifacts' / name, 'verification-results/' + name)
    for name in ['root-lab-native.json', 'root-lab-regression-databases.json']:
        archive.write(root / 'verification-artifacts' / name, 'previous-native-audit/' + name)
    for file in sorted((root / 'verification').iterdir()):
        if file.is_file():
            archive.write(file, 'verification-scripts/' + file.name)
print('Packaged current screenshots, tests and preserved native comparison evidence.')
