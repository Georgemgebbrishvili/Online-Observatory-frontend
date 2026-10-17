#!/usr/bin/env python3
"""Builds checks.json from checks.jsonl (run-check.sh) plus the hand-run suites."""
import json, os, re
E = os.path.dirname(os.path.abspath(__file__))
rows = [json.loads(l) for l in open(os.path.join(E, "checks.jsonl")) if l.strip()]
def add(repo, name, command, log, exit_code, note=""):
    rows.append({"repo": repo, "name": name, "command": command, "log": log, "exitCode": exit_code, "note": note})
def tail_exit(log):
    m = re.findall(r"^exit (\d+)$", open(os.path.join(E, log), errors="replace").read(), re.M)
    return int(m[-1]) if m else None
add("clients", "e2e-4workers", "npx playwright test --project=setup --project=warm --project=chromium --project=signed-out --project=operator --project=operator-evidence --project=operator-records --workers=4", "clients-e2e-4workers.log", tail_exit("clients-e2e-4workers.log"), "invalid as a product signal: load average above 200 and source edits mid-run; see the report")
add("clients", "e2e-1worker", "same projects, --workers=1", "clients-e2e-1worker.log", tail_exit("clients-e2e-1worker.log"), "327 passed, 4 failed")
add("clients", "e2e-failed-rerun", "the 4 failed tests alone, --workers=1", "clients-e2e-failed-rerun.log", tail_exit("clients-e2e-failed-rerun.log"), "7 passed incl. setup and warm")
add("clients", "visual", "npm run visual", "clients-visual.log", tail_exit("clients-visual.log"), "136 passed, 22 failed")
add("clients", "visual-rerun", "the 22 failed visual tests in the container, -g filter", "clients-visual-rerun.log", tail_exit("clients-visual-rerun.log"), "23 passed, 1 failed (en /privacy 1440, 111 px)")
add("platform", "agent-dependency-audit", "pip-audit -r agent/requirements-dev.txt (scratch venv)", "agent-dependency-audit.log", 1, "pillow 11.3.0: 18 advisories; pytest 8.4.2: 1")
add("clients", "npm-audit-all", "npm audit --json", "clients-npm-audit-all.json", 1, "11 high, all development tooling")
add("platform", "npm-audit-all", "npm audit --json", "platform-npm-audit-all.json", 1, "13 high")
add("stack", "dev-stack", "npm run dev:stack", "dev-stack.log", None, "real platform, two simulated agents, web client")
add("stack", "real-stack-checks", "node docs/evidence/qa-2026-10-13/real-stack/run.mjs", "real-stack/run.log", tail_exit("real-stack/run.log") if os.path.exists(os.path.join(E, "real-stack/run.log")) else None, "attempts 1 and 2 kept as run-attempt-1.log and run-attempt-2.log")
json.dump({"generatedFor": "docs/test-audit-2026-10-13.md", "checks": rows}, open(os.path.join(E, "checks.json"), "w"), indent=2)
print(len(rows), "checks")
