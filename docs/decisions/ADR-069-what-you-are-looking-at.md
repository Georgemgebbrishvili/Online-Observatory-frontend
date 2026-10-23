# ADR-069 — What You Are Looking At

- **Date:** 2026-10-23
- **Status:** APPROVED (maintainer's standing approval for Phase 6 scope records, given
  2026-10-23; open to revision on review)
- **Decided by:** project maintainer
- **Relates to:** Phase 6 plan, slice 6.7; ADR-068 §4 and the maintainer's request of
  2026-10-23 for a lean product; CLAUDE.md "Phase 1 is live view, not long-exposure
  astrophotography"

## Context

Slice 6.7 asks for three things: a guide to each target, labels on captured frames from a
plate solve, and a short clip of the stack building. The catalogue already carries an
authored English and Georgian description for every target. The other two need new agent
work (a local astrometry index), new storage and new pages.

## Decision

### 1. A guide, from what exists

The room and the target's page show **About {target}**: the target's own description, then
one honest line for its class saying what the live view will and will not show (a planet
stays a small disc that steadies as frames stack; a nebula's colour builds slowly and never
looks like a long-exposure photograph). The class lines are written once, in English and
Georgian, in the client; the maintainer checks them. No new platform field, no generated
text. Distances are left out: they would be new authored data per target, and the
description can carry one where it matters.

### 2. Frame labels and the stack clip are deferred

Plate solving needs an index installed on the observatory's mini-PC and measured against
the real camera; a clip needs frames kept and stored. Both wait for the hardware and for a
reason stronger than polish. They are recorded here so they are not forgotten.

## Consequences

- One small panel in the room and one line on the target page; nothing to store.
- The customer is told plainly what the view can and cannot be, which is the point of
  Phase 1's honesty rules.
