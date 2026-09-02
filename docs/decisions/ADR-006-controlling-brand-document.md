# ADR-006 — Which File Is Brand Identity System v2.0

- **Date:** 2026-08-31
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Resolves:** conflict C-9 in the project backlog

## Context

`CLAUDE.md` ranks "Darkview Brand Identity System **v2.0**" third among the
controlling documents. No file of that name exists. the private brand archive
contains four files:

| File                                       | Modified   |
| ------------------------------------------ | ---------- |
| `Darkview_Brand_Identity_System_v1.0.docx` | 2026-08-28 20:57 |
| `Darkview_Brand_Identity_System_v1.0.pdf`  | 2026-08-28 20:57 |
| `Darkview_Brand_Identity.pdf`              | 2026-08-28 20:58 |
| `Final Combined Branding.pdf`              | 2026-08-28 21:21 |

A controlling document that cannot be opened is not a controlling document, and
"align to v2.0" is not a verifiable acceptance criterion against a missing file.

## Decision

**the Brand Identity System source PDF (private brand archive, outside this repository) is the Darkview Brand
Identity System v2.0** referred to by `CLAUDE.md`.

It is the most recently modified of the four and supersedes the v1.0 documents and
`Darkview_Brand_Identity.pdf`, which are retained as history.

## Consequences

- DV-070 (design tokens) is unblocked. Tokens are extracted from this file.
- The colours named directly in `CLAUDE.md` — Darkview Night `#05080D`, Observatory
  Blue `#111722`, Photon Blue `#5CC8FF`, primary text `#F2F5F7`, secondary text
  `#AAB4BE` — remain authoritative, because `CLAUDE.md` outranks the brand system.
  Where this PDF and `CLAUDE.md` disagree on a value, `CLAUDE.md` wins and the
  disagreement is reported rather than silently resolved.
- **Verified 2026-08-31.** The PDF was read. Its title page reads *"Brand Identity
  System v2.0 · MERGED"*, confirming the maintainer's designation from the document itself
  rather than by inference. Every colour `CLAUDE.md` names appears in it with the same
  value, so there is **no conflict** between them. Its §11 Developer cheat sheet
  carries the full semantic token set, the type system and the logo direction
  (Concept A — The Aperture); these are extracted to `docs/design/brand-tokens.md`
  for DV-070.
- **Defect found during verification.** `apps/web/src/styles/tokens.css` does not match
  the brand system — most importantly its accent is `#18c8ff`, a cyan, where Photon
  Blue is `#5CC8FF`. `CLAUDE.md` names `#5CC8FF` and outranks the implementation, so
  this is a DV-070 correction, not an escalation.
- The v1.0 `.docx` and `.pdf` and `Darkview_Brand_Identity.pdf` are superseded. They
  are not deleted and are not used as a source for design tokens.
