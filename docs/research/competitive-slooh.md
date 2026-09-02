# Competitive teardown — Slooh

- **Date:** 2026-08-31
- **Source:** slooh.com and support.slooh.com, read 2026-08-31
- **Status:** Research input for `darkview-web`. **Not a controlling document.**
- **Purpose:** the maintainer identified Slooh as the reference product. This records what
  is worth learning from its *product logic*, what must not be copied, and where
  Darkview deliberately differs.

## The boundary, stated once

This document describes **functional patterns and information architecture**. It does
not reproduce Slooh's visual design, copy, imagery or brand, and no agent may. Those
are Slooh's protected expression, and `CLAUDE.md` ranks the Darkview Brand Identity
System v2.0 above every engineering document anyway. Where this file and the brand
system disagree, the brand system wins.

---

## 1. What Slooh actually is

| | Slooh | Darkview Phase 1 |
| --- | --- | --- |
| Instruments | Network across Canary Islands, Chile, Australia | **One** Celestron 6SE, Tbilisi rooftop |
| Users at once | Many; all members watch all missions | **One** active session owner |
| Booking | "Reservation Engine" picks observatory, telescope and time for you | Customer picks the slot and the target |
| Session | 5 or 10 minute queued mission | A reserved Observation Slot the customer attends |
| Liveness | Often **not** live for you — it runs, you get an email next day | **Live, attended, yours** |
| Commercial | Subscription tiers, per-seat, education/LMS | Per-slot reservation |
| Tone | Education platform, gamified: quests, badges, points, Gravity Awards | Quiet, premium, one person and one real telescope |

Slooh is a **queue over a fleet**. Darkview is **one person, one telescope, live**.
That difference is not cosmetic; it decides nearly every screen.

## 2. Adopt — patterns that transfer

These are functional, they suit a weather-dependent single-instrument product, and
Darkview already has issues for most of them.

**2.1 Instrument status is always visible, everywhere.** Slooh shows operational
status under each telescope name, plus a right-hand panel with current status and
weather. A user never has to guess whether the thing is alive. For a rooftop in
Tbilisi with real weather, this is essential, not decoration. → **DV-073** status
page, **DV-077** operator console, and a persistent status element in the app shell.

**2.2 A "last night" status report.** Slooh exposes conditions and technical reports
for the previous night. This builds trust precisely when the product failed — a clear
"clouded out at 23:40" beats silence. → **DV-073**, and it pairs with `WEATHER_HOLD`
and `MissionFailureReason`, which the contract already carries.

**2.3 Dome cam and all-sky cam.** Independent evidence that a real instrument exists
in a real place under a real sky. Directly serves CLAUDE.md's "the real feed and real
instrument status are the visual focus." → Worth a contract issue if pursued; not in
Phase 1 scope today.

**2.4 Capture slots shown before they are filled.** During a live session Slooh shows
a row of empty frames that populate as you capture. It makes the session's shape legible
at a glance — how many captures you have, how many remain. Simple, and it works. →
**DV-075** live mission room.

**2.5 Notification bracketing.** An email 15 minutes before the session, and another
the day after saying whether it ran. For a product that can be defeated by cloud, the
"did it work" message matters as much as the reminder. → **DV-064** notifications.

**2.6 Multiple ways into the target catalogue.** Slooh offers by-catalogue, by-
constellation and by-instrument entry. Darkview has twelve Phase 1 targets, so this
collapses to a much simpler browse — but the principle holds: people arrive knowing
"something in Orion" or "a planet", not a catalogue ID. → **DV-052**, **DV-074**.

**2.7 Processing presets and FITS as separate concerns.** Slooh separates a friendly
processed image from the raw FITS for people who want it. Darkview's schema already
has `ProcessingPreset` (`NATURAL`, `BRIGHT`, `DETAIL`) and `Capture.fitsUrl`. Slooh
gates FITS behind a tier; Darkview should simply give the customer their own data. →
**DV-061**, **DV-076**.

## 3. Reject — and why

**3.1 The multi-observatory network.** Frozen by **ADR-003**. A fleet is a different
product with different safety, ownership and settlement questions. Do not build toward
it, do not design UI that implies it, do not add an observatory picker.

**3.2 "All members watch all missions."** Rejected as Slooh implements it — an open
audience on every session. **Superseded in part by ADR-007:** Darkview sells an
**Observer Pack**, which is a different shape — at most five paying observers, view
only, and only when the controller has opted in. One controller remains the rule.

**3.3 Subscription tiers and per-seat pricing.** Frozen by ADR-003 (`Subscription`,
`SubscriptionPlan`, `CreditLedger`). Phase 1 sells an Observation Slot.

**3.4 Gamification — quests, badges, points, awards.** Present in no Darkview plan,
and squarely against the brand: "a quiet, premium interface between one person and one
real telescope." Collecting captures is already the reward.

**3.5 Education and LMS positioning.** Institutional seats, K-8/High School/College
segmentation, outcomes-based contracting. Not Phase 1.

**3.6 The Reservation Engine.** Slooh's system chooses time and instrument for you.
Darkview has one instrument, so the only real decision is *when this target is well
placed* — which is **DV-053** ephemeris plus **DV-054** slot generation, and the
customer makes the choice, not the system.

**3.7 The visual design, copy and imagery.** Not ours.

## 4. Where Darkview should deliberately differ

Slooh's own documentation says the quiet part: you schedule a mission, the engine runs
it when it likes, and **you get an email the next day telling you whether it worked**.
For most users, most of the time, the telescope is not something they are watching. It
is a batch job with a nice gallery.

Darkview Phase 1 is the opposite, and the tagline already says it: **"The real sky,
live." / "შენი დრო ნამდვილ ცასთან."** The customer is present while a real mount
slews. They watch `SLEWING`, then `VERIFYING`, then the frame settles and it is
theirs.

That is the entire differentiator, and it should be visible in the product:

- **Show the machine working.** The mission state machine is not a progress bar to
  hide — `SLEWING`, `VERIFYING`, `CENTERING` are the moments that prove it is real.
  Real instrument telemetry, honestly displayed, is the product.
- **Do not fake liveness.** No stock space imagery presented as telescope output, no
  simulated feed shown as real. `CLAUDE.md` forbids it and it is the one lie this
  product cannot survive.
- **Be honest about weather.** A clouded-out slot handled gracefully earns more trust
  than a product that pretends the sky is always clear. `WEATHER_HOLD` and
  `NOT_VISIBLE` are first-class states in the contract for this reason.
- **Set expectations: this is live-view / EAA.** Short exposures and live stacking, not
  long-exposure astrophotography. Never imply Hubble-class results.

## 5. What the maintainer actually wanted from Slooh

Clarified 2026-08-31: **the design system, not the product model.** Specifically the
dark ground, the left-side logo, simple dropdown navigation, live telescope availability
views, and a last-night observations view. Those are §2 items and the visual direction
belongs to the Darkview Brand Identity System v2.0, which outranks this file.

The product model stays Darkview's own, with one addition: **ADR-007, the Observer
Pack** — up to five paying view-only observers on a session whose controller has opted
in. It resembles Slooh's shared viewing only superficially; Slooh broadcasts every
mission to all members by default, Darkview sells a capped seat with consent.

Subscriptions remain frozen by ADR-003 and were not adopted. **C-2**, the contracted
loyalty programme, is still open and is the one place Slooh-style points could
re-enter — that remains an maintainer decision.
