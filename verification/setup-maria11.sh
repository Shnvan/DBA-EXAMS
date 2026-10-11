#!/usr/bin/env bash
set -e
taskroot=/var/tmp/dbms-midterm-maria11
mkdir -p "$taskroot/packages" "$taskroot/runtime" "$taskroot/data"
cd "$taskroot/packages"
apt-get download mariadb-server-core mariadb-client-core mariadb-server mariadb-common liburing2 >/dev/null
for package in *.deb; do dpkg-deb -x "$package" "$taskroot/runtime"; done
export LD_LIBRARY_PATH="$taskroot/runtime/usr/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"
chown mysql:mysql "$taskroot" "$taskroot/data"
"$taskroot/runtime/usr/bin/mariadb-install-db" --no-defaults --basedir="$taskroot/runtime/usr" --datadir="$taskroot/data" --user=mysql --auth-root-authentication-method=normal > "$taskroot/init.log" 2>&1
setsid nohup "$taskroot/runtime/usr/sbin/mariadbd" --no-defaults --basedir="$taskroot/runtime/usr" --datadir="$taskroot/data" --user=mysql --port=13311 --bind-address=0.0.0.0 --socket="$taskroot/maria.sock" --pid-file="$taskroot/maria.pid" --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci --sql-mode=NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION --log-error="$taskroot/server.log" > "$taskroot/stdout.log" 2>&1 < /dev/null &
disown
sleep 3
tail -n 4 "$taskroot/server.log"
