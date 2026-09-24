# ADR-025 — The Product Is Renamed Stellar

- **Date:** 2026-09-24
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Supersedes:** the Darkview name throughout `CLAUDE.md`, ADR-006 and the Brand
  Identity System v2.0. Everything else in those documents stands.

## Context

The product has been called Darkview since the first commit. The maintainer has renamed
it **Stellar** — Georgian **სტელარი** — and supplied a new logo: a comet mark, white,
with a blue outer glow, on black.

Three things make this more than a find-and-replace.

1. `CLAUDE.md` is controlling document #1 and names Darkview throughout. The Brand
   Identity System v2.0 is #3 and is a Darkview document. `CLAUDE.md` requires that a
   superseded controlling document be retired by a dated decision record rather than
   silently outranked. This is that record.
2. **The name crosses the repository boundary.** `packages/contracts/` is a pinned copy
   of a spec this repository does not own. `@darkview/contracts`, `@darkview/web`,
   `DARKVIEW_PLATFORM_API_URL` and the session cookie names are shared with
   `darkview-platform`. Renaming them here alone breaks the seam.
3. **The logo glows.** `CLAUDE.md` lists "heavy glassmorphism and glow" among the
   things to avoid. The supplied mark has a blue outer glow. Read literally, the new
   logo violates the brand rules of the product it represents.

## Decision

### 1. The product is Stellar / სტელარი

Spelling is **Stellar**, two L, confirmed by the maintainer 2026-09-24. The Georgian
form is **სტელარი**.

### 2. The rename lands in two stages

**Stage A — everything a customer can see. Now.**

User-facing copy in both dictionaries, page titles and metadata, Open Graph text,
the logo and wordmark, legal document headings, email copy, the app manifest.

**Stage B — identifiers. After `darkview-platform` renames in lockstep.**

npm scopes (`@darkview/*`), `DARKVIEW_PLATFORM_API_URL`, cookie names, the repository
names, any `darkview` string inside `packages/contracts/`.

Until Stage B, an identifier reading `darkview` is correct and must not be "fixed"
opportunistically. `packages/contracts/openapi.yaml` is a pinned copy and is **never**
hand-edited — including to change a name. It changes when a renamed release is copied
across from the platform repository.

### 3. The glow is scoped to the logo mark

The comet mark keeps its glow wherever it appears **as a logo** — header lockup,
favicon, app icon, splash, social card.

The interface rule is unchanged and still binding: no glow on panels, cards, buttons,
inputs, focus rings, status indicators or live badges. Depth continues to come from the
surface ramp and borders. `--shadow-*` tokens remain shadows, not glows.

A glow token introduced for the mark must not be reachable from component CSS.

### 4. What stays exactly as it is

The rename changes the name, the mark and the wordmark. It does **not** change:

- the colour system — Darkview Night `#05080D`, Observatory Blue `#111722`,
  Photon Blue `#5CC8FF`, text `#F2F5F7` / `#AAB4BE` survive under new names;
- the typefaces — FiraGO and Noto Serif Georgian, chosen because they carry Georgian;
- the honesty rules — no illustration presented as telescope output, no long-exposure
  or Hubble-class claims, simulated frames always badged;
- every safety, contract and repository-boundary rule.

The tagline *The real sky, live.* / *შენი დრო ნამდვილ ცასთან.* carries over unchanged
pending a copy pass.

## Consequences

- `CLAUDE.md` is edited to say Stellar, and to carry the glow exception in §Design and
  brand. It remains controlling document #1.
- ADR-006 resolved which file is the Darkview Brand Identity System v2.0. That file
  remains the source for everything except the name and the mark, which this ADR
  overrides. A Stellar Brand Identity System supersedes both when it exists.
- A visible mismatch is expected and is not a defect: the site says Stellar while
  `package.json` says `@darkview/web`. Stage B closes it.
- Renaming is not a licence to rewrite copy. Where a sentence only contains the old
  name, only the name changes.

## Risks

- **A partial rename reads as a bug.** Mitigated by naming the two stages here and by
  the rename being a single phase with a checklist, not a background activity.
- **`Stellar` is a common word.** Domain, trademark and handle availability are the
  maintainer's to confirm; nothing in this repository depends on the outcome.
- **The glow exception erodes.** One sentence in `CLAUDE.md` and one unreachable token
  are the whole guard. If glow appears on a component, it is a defect against this ADR.
