# ADR-031 — The Platform Is Finished on the Simulator, Alongside the Clients

- **Date:** 2026-09-28
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Amends:** `CLAUDE.md`, "The platform repository", which made `../part-1-platform`
  read-only for agents working from this repository.

## Context

Part 1 (`darkview-platform`) was paused on 2026-09-22 and treated as read-only from here.
Every gap it left was written up in `docs/platform-requests/` and nothing moved: eight
requests stood open, and the local stack had never run end to end. The hardware (mount,
camera) has not arrived. The maintainer wants both repositories on one track, finished on
the simulator, so that when the hardware arrives only the device connection remains.

## Decision

1. **Part 1 is open for agent work.** Agents may branch, commit and open pull requests
   in `darkview-platform`, following _that_ repository's own `CLAUDE.md` (branches,
   ADR-014 merges, its safety rules). Commits there carry the platform repository's
   configured identity; issues and pull requests go through the GitHub account available
   on the machine.
2. **Platform requests are filed and served.** Each file in `docs/platform-requests/` is
   also an issue on the platform repository (#144–#151, filed 2026-09-28) and is built
   there, not worked around here. The contract still arrives only through
   `npm run contracts:sync` from a platform commit.
3. **The simulator is the finish line.** Both halves are complete when the full customer
   path — register, book, observe, capture, collection — runs on `npm run dev:stack` with
   the simulated agent. Real-hardware mode stays behind an attended operator action, as
   before; nothing here enables it.
4. **Hosting follows.** The platform is hosted (Prisma Postgres for its database) once
   both halves pass on the local stack, before the hardware arrives.

Decided with this record: ADR-007 stands, so an observer saves nothing and the watch page's
save path goes; the watcher count is `Mission.observerCount`, with no presence heartbeat.

## Consequences

- `npm run db:migrate` stays forbidden from this repository's tooling; migrations are
  written in the platform repository, on a branch, under its rules.
- No source path is shared between the two repositories; the merge plan is unchanged.
