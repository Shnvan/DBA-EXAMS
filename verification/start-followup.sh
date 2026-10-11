#!/bin/bash
set -eu
if ss -ltn | grep -Eq ':(13308|13311) '; then echo 'Test port already occupied'; exit 1; fi
taskroot=/var/tmp/dbms-midterm-maria11
export LD_LIBRARY_PATH="$taskroot/runtime/usr/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"
setsid nohup "$taskroot/runtime/usr/sbin/mariadbd" --no-defaults --basedir="$taskroot/runtime/usr" --datadir="$taskroot/data" --user=mysql --port=13311 --bind-address=0.0.0.0 --socket="$taskroot/maria.sock" --pid-file="$taskroot/maria.pid" --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci --sql-mode=NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION --log-error="$taskroot/server.log" > "$taskroot/stdout.log" 2>&1 < /dev/null &
setsid nohup /usr/sbin/mysqld --no-defaults --datadir=/var/tmp/dbms-midterm-mysql8 --user=mysql --port=13308 --bind-address=0.0.0.0 --socket=/var/tmp/dbms-midterm-mysql8/mysql.sock --pid-file=/var/tmp/dbms-midterm-mysql8/mysql.pid --log-error=/var/tmp/dbms-midterm-mysql8/server.log > /var/tmp/dbms-midterm-mysql8/stdout.log 2>&1 < /dev/null &
sleep 3
ss -ltn | grep -E ':(13308|13311) '
