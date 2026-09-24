# Stellar — the plan

Written 2026-09-24, from `part-1-platform/contracts/openapi.yaml`, both backlogs, and
this repository's route tree.

| Document | What it answers |
| --- | --- |
| [`01-surface-inventory.md`](01-surface-inventory.md) | Every page the product needs, what exists, and what the platform can already do that nothing calls |
| [`02-build-phases.md`](02-build-phases.md) | The order to build it in, and why that order |
| [`03-design-system.md`](03-design-system.md) | The token and component layer everything else consumes |
| [`../decisions/ADR-025-the-product-is-renamed-stellar.md`](../decisions/ADR-025-the-product-is-renamed-stellar.md) | The rename, the logo, and the glow exception |

## The short version

The platform exposes **54 endpoints**. The client calls **16**. Twenty-four routes
exist; six are wired, eighteen render fixtures or prose. The most finished surface is
the operator console — not anything a customer touches.

Booking, account, subscription, loyalty, vouchers, observer seats, partner registration
and the whole mobile application have no surface at all.

Seven phases: rename and tokens, navigation shell, wire the fixtures, booking, live
room, commerce, mobile — then polish, last, by instruction.

## Three things found while writing this

1. **Subscription has no client issue.** ADR-022 is approved, the platform ships six
   subscription endpoints, `/pricing` describes subscriptions in prose and cannot sell
   one. No issue exists in either backlog.
2. **Partner self-service has no client issue.** DV-120–123 build registration,
   windows, review and the installer — all server and agent side. A telescope owner has
   no page to register on.
3. **The `/v1/*` contract debt is still unfiled.** `shared-observations` calls six
   endpoints absent from the pinned contract, through a hand-written cross-boundary
   type with no validation. `CLAUDE.md` requires an issue against `darkview-platform`.
   It blocks Phase 2.

All three are Phase 0 items.
