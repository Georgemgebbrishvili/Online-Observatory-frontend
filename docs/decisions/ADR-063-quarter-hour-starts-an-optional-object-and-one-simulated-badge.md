# ADR-063 — Quarter-Hour Starts, an Optional Object, and One Simulated Badge

- **Date:** 2026-10-22
- **Status:** PROPOSED (maintainer chose each option in session; awaiting approval of this record)
- **Decided by:** project maintainer, in session
- **Amends:** ADR-053 §7 (the booking board: night, start, target); ADR-051 (the
  customer's nights under the board)
- **Relates to:** ADR-015 §2 (slot length and target fit), ADR-052 (brand), CLAUDE.md
  "Design and brand" ("a simulated stream is always badged Simulated")

## Context

On 2026-10-22 the maintainer reviewed `/app/book` and asked for:

1. any free start on a 15-minute grid ("22:25 to 22:50 — now I can't choose that");
2. the object to be optional — "they can just be there for information";
3. smaller object cards;
4. "Simulator" removed everywhere, and "live" and "Tbilisi" not repeated — the telescope
   is in Georgia;
5. the "Your nights" section off the booking page, and the board on one screen.

Item 4 conflicts with CLAUDE.md, which requires a simulated stream to be badged. The
maintainer was shown the conflict and chose to keep one quiet badge (below).

## Decision

### 1. Starts every quarter hour (platform)

Sessions stay 30 minutes. A session may start at any quarter hour inside darkness and
the owner's hours. A held booking blocks every start whose 30 minutes come within the
10-minute turnaround of it. Platform branch `feat/quarter-hour-starts-optional-target`.

### 2. The object is optional (platform contract)

`CreateBookingRequest.targetId` becomes optional. Without it the platform assigns the
best enabled target observable across the slot. The board shows the objects as small
chips, labelled optional; the session reads "Best in the sky" until one is chosen, and a
second click clears a choice.

### 3. One simulated badge

Page-level simulator banners and sentences go: the booking board, booking detail, home,
status, cards, mission pages, the watch and room headers, the guides and the
observatory's safety list. The badge stays only on telescope output: the live feed, the
console's pill and capture images. It disappears by itself when the platform reports
`REAL`. CLAUDE.md's rule is kept: a simulated stream is still badged.

### 4. Georgia, and "live" once

"Tbilisi" becomes "Georgia" or is dropped in customer copy; the observatory's own name
(platform data) and the legal drafts are unchanged. "Live" stays in the hero headline
and on the feed; repeats in ledes, steps, panel titles and the footer go.

### 5. The board is one screen

"Your nights" moves to `/app/bookings`, linked from the profile menu. The board loses
the page guide and the sky-events list under it.

## Consequences

- The fake platform (`e2e/fake-night.mjs`) follows the platform's new grid.
- Until the platform change merges and `contracts:sync` runs, the board can send a
  booking without `targetId` only to the fake.
