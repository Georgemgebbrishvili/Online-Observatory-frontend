# ADR-065 — A Capture Can Be Shared

- **Date:** 2026-10-23
- **Status:** APPROVED (maintainer's standing approval for Phase 6 scope records, given
  2026-10-23; open to revision on review)
- **Decided by:** project maintainer
- **Relates to:** Phase 6 plan, slice 6.3; ADR-007 (what an observer gets);
  `docs/platform-requests/capture-visibility.md` (answered by platform #158); CLAUDE.md
  "Design and brand" (a simulated stream is always badged)

## Context

A customer who caught Saturn wants to show someone. Today a capture lives only in the
owner's Collection. The platform already lets the owner set `Capture.visibility` to
`GALLERY` (`setCaptureVisibility`), and refuses it with 409 for a `SIMULATED` capture.
Nothing serves a published capture to anyone else.

## Decision

### 1. Publishing is the owner's, one switch, off by default

On the Collection's capture page the owner sees **Make public** (or **Make private**),
then **Copy link** and, on a phone, the system share sheet. Publishing is
`setCaptureVisibility(GALLERY)`; taking it back is `PRIVATE` and the link stops working
at once.

### 2. A simulated capture is not shared

The platform's 409 stands. On the demo every capture is simulated, so the switch is shown
disabled with the reason ("Simulated captures cannot be shared — they are not telescope
output"). Sharing is exercised against the e2e fake with a `REAL` capture until the
telescope is installed.

### 3. The public page shows the picture and the facts, and never the person

`/[locale]/c/[captureId]`, no sign-in:

- shows: the image, the target's name, the local date, "Georgia" (ADR-063), the exposure,
  frames stacked and total integration, the instrument (aperture and focal length only,
  per ADR-055's rule on brand names), and a **Book your own night** call to action;
- never shows: the owner's name or email, the booking, the price, the mission, or any
  other capture.

The owner's name is left out entirely in this slice. A chosen display name for shared
captures is a later decision.

### 4. Private and gone are the same answer

A private capture, a deleted one and an id that never existed are all 404, not 403:
whether a private capture exists is not something a stranger may learn.

### 5. A link that looks right when pasted

Each public capture has an Open Graph image, generated per capture in English and
Georgian: the picture with the target's name and date. The page's metadata names the
target, never the owner.

### 6. Platform

A public read, `GET /gallery/{captureId}`, answers a `GALLERY` capture as a
`GalleryCapture` with a short-expiry signed URL for the display image, or 404. Like the
platform's other public reads it carries no rate limit of its own. Nothing else changes in
the platform.

## Consequences

- Nothing on the demo can be shared until real captures exist. That is the price of never
  presenting simulator output as telescope output.
- A shared link outlives nothing: making a capture private, deleting it, or deleting the
  account ends it.
