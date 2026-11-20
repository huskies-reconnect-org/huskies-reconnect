#!/usr/bin/env bash
# Throwaway local Postgres for integration tests.
#   scripts/test-db.sh start   -> prints the TEST_DATABASE_URL to export
#   scripts/test-db.sh stop
# Needs `initdb` / `pg_ctl` on PATH (e.g. brew install postgresql@17).
set -euo pipefail
DIR="${TMPDIR:-/tmp}/huskies-test-pg"
PORT="${TEST_PG_PORT:-55432}"
case "${1:-}" in
  start)
    [ -d "$DIR/data" ] || initdb -D "$DIR/data" -U postgres -A trust >/dev/null
    pg_ctl -D "$DIR/data" -o "-p $PORT -k '' -c listen_addresses=127.0.0.1" -l "$DIR/log" -w start >/dev/null
    echo "export TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:$PORT/postgres"
    ;;
  stop)  pg_ctl -D "$DIR/data" stop -m fast >/dev/null && echo stopped ;;
  *)     echo "usage: $0 start|stop" >&2; exit 2 ;;
esac
