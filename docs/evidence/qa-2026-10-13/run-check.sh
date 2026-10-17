#!/bin/bash
# usage: run-check.sh <repo:clients|platform> <name> <command...>
# Runs a command in the repo, logs to <repo>-<name>.log, appends a JSON line to checks.jsonl.
E="$(cd "$(dirname "$0")" && pwd)"
repo="$1"; name="$2"; shift 2
case "$repo" in
  clients) dir="/Users/nika/Desktop/Stellar Observatory/part-2-clients";;
  platform) dir="/Users/nika/Desktop/Stellar Observatory/part-1-platform";;
esac
log="$E/$repo-$name.log"
start=$(date -u +%Y-%m-%dT%H:%M:%SZ); t0=$(date +%s)
( cd "$dir" && "$@" ) > "$log" 2>&1
code=$?
t1=$(date +%s)
printf '{"repo":"%s","name":"%s","command":%s,"startedAt":"%s","seconds":%d,"exitCode":%d,"log":"%s"}\n' \
  "$repo" "$name" "$(printf '%s ' "$@" | sed 's/ $//' | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')" "$start" $((t1-t0)) $code "$(basename "$log")" >> "$E/checks.jsonl"
echo "$repo/$name exit=$code ${t1}s"
exit $code
