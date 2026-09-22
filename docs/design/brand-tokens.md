# Darkview design tokens — extracted from Brand Identity System v2.0

- **Date:** 2026-08-31
- **Source:** the Brand Identity System source PDF (private brand archive, outside this repository), page 1 of which
  reads _"Brand Identity System v2.0 · MERGED"_, and its §11 Developer cheat sheet.
- **Status:** Reference for **DV-070**. The PDF remains the controlling document;
  `CLAUDE.md` outranks it.
- **Verification:** every colour `CLAUDE.md` names appears in the PDF with the same
  value. There is no conflict between them.

## Semantic tokens (§11 Developer cheat sheet, verbatim)

| Token            | Value     |
| ---------------- | --------- |
| `darkview-night` | `#05080D` |
| `surface-base`   | `#0B0F15` |
| `surface-raised` | `#111722` |
| `surface-hover`  | `#1A2330` |
| `border-subtle`  | `#2A3645` |
| `text-primary`   | `#F2F5F7` |
| `text-secondary` | `#AAB4BE` |
| `text-tertiary`  | `#778492` |
| `photon`         | `#5CC8FF` |
| `photon-deep`    | `#1677A3` |
| `success`        | `#4FD1A5` |
| `warning`        | `#E5B454` |
| `error`          | `#FF6B6B` |
| `info`           | `#78AFFF` |

Named palette roles: Darkview Night (primary background), Observatory Blue `#111722`
(cards, navigation, raised surfaces), Photon Blue `#5CC8FF` (signature accent — primary
CTA, active state, live indicator, focus, links), Instrument `#F2F5F7` (primary text —
_never pure white; it burns on OLED_), Deep Signal `#1677A3` (accent for light
backgrounds, because Photon Blue fails contrast on white), Star Brass `#D9A45B`
(editorial only — vouchers and print, **never a second CTA**), Lunar Silver `#A8B2BC`
(coordinates, metadata, timestamps), Optical Glass `#263A49` (charts and receding layers).

Neutral scale, cool-tinted on purpose — on a true-grey scale Photon Blue shifts
perceptually cyan: `950 #05080D · 900 #0B0F15 · 800 #111722 · 700 #1A2330 · 600 #2A3645
· 500 #4C5A68 · 400 #778492 · 300 #AAB4BE · 200 #D0D6DC · 100 #F2F5F7`.

## Rules that are easy to get wrong

- **The 90 / 8 / 2 rule.** 90% darkness, 8% white information, 2% Photon Blue. "Photon
  Blue at scale reads as neon; at 2% it reads as an instrument LED."
- **Buttons on dark use Darkview Night text on Photon Blue — not white.**
- **Semantic colour discipline.** Error is for destructive or actionable failures,
  _never for merely absent data_. Warning means degraded conditions — increasing cloud,
  high wind — which maps directly to `WEATHER_HOLD`.
- **Star Brass is never a second CTA.**

## Typography

| Role      | Family              | Weights     | Use                                                      |
| --------- | ------------------- | ----------- | -------------------------------------------------------- |
| Display   | Noto Serif Georgian | 500–600     | Heroes, campaign headlines, vouchers, editorial          |
| Body / UI | FiraGO              | 400/500/600 | Navigation, buttons, forms, body, mobile, observation UI |
| Mono      | IBM Plex Mono       | —           | Coordinates, timestamps, exposures, telemetry **only**   |

All three are free and self-hostable, chosen so the product never depends on a font
vendor. Both display and body families cover Mkhedruli natively.

**Two rules that will otherwise be broken:**

1. **Never `text-transform: uppercase` on Georgian.** Mkhedruli is not a case-based
   script. Forcing Latin conventions onto it is a visible mark of poor localisation.
2. **IBM Plex Mono has no Georgian coverage.** Use it for the numeric/technical column
   only; Georgian labels around those values stay in FiraGO.

## Implementation status

The drift recorded here on 2026-08-31 — background, text, accent (a cyan, not Photon Blue) and
all three semantic colours off by a few steps — was corrected in **DV-070** on 2026-09-22.
`apps/web/src/styles/tokens.css` now carries the §11 values verbatim, and
`apps/web/src/styles/tokens.test.ts` fails if they move. See `docs/design-system.md`.

## Phase 1 implementation order (§11, the brand system's own sequencing)

1. Lock semantic colour tokens before building any screens.
2. Load FiraGO and Noto Serif Georgian with Latin **and** Georgian subsets, tested on
   real content.
3. Create the Aperture mark as a one-colour SVG first; colour is secondary.
4. Build the Live Observation screen around the real camera feed and real instrument state.
5. Use genuine telescope and capture imagery before investing in illustration.
6. Keep Photon Blue scarce enough that active and important states stay meaningful.

The logo direction is **Concept A — The Aperture**.

## Product vocabulary — use these exact words

Reservation (not booking/order) · Observation Slot (not time slot) · Live Observation
(not session/tour) · Target (not object) · Live View (not feed/video/stream) · Live Stack
(not integration) · Capture (not photo/snapshot) · Collection (not gallery/album) ·
Observation Pass (not voucher/gift card) · Observatory Status (not uptime) · Viewing
Conditions (not weather/forecast) · Observation Record (not receipt/log).

Consumer-facing telescope movement is "Moving to [target]", not "Slewing" or "GoTo".
`SLEWING` remains the technical state name in the contract and the operator console.

## The brand-decision test — run before merging any screen

1. Does this make the physical telescope and the real observation feel more believable?
2. Is it honest about what the customer will get?
3. Would this feel quiet enough on a Tbilisi terrace at 2 a.m.?

> _"If it does not make the physical telescope feel more real, remove it."_
