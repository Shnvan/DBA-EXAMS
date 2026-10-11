#!/bin/bash
set -eu
mkdir -p /mnt/user-data/outputs
cp '/mnt/c/Projects/DBA MIDTERM/outputs/DBMS_midterm_practice.html' /mnt/user-data/outputs/DBMS_midterm_practice.html
cp '/mnt/c/Projects/DBA MIDTERM/outputs/DBMS_verification_report.md' /mnt/user-data/outputs/DBMS_verification_report.md
cp '/mnt/c/Projects/DBA MIDTERM/outputs/DBMS_verification_evidence.zip' /mnt/user-data/outputs/DBMS_verification_evidence.zip
sha256sum /mnt/user-data/outputs/DBMS_midterm_practice.html /mnt/user-data/outputs/DBMS_verification_report.md /mnt/user-data/outputs/DBMS_verification_evidence.zip
if ss -ltn | grep -Eq ':(13308|13311) '; then echo 'Unexpected test-server listener remains'; exit 1; fi
