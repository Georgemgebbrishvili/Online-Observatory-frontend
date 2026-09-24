# Stellar — surface inventory

Every page the product needs, measured against what `darkview-platform` already exposes
and what this repository already renders. Compiled 2026-09-24 from
`part-1-platform/contracts/openapi.yaml` (54 paths), `part-1-platform/docs/backlog.md`
(59 issues) and this repository's route tree.

This is the map. `02-build-phases.md` is the order.

## How to read the status column

| Status | Means |
| --- | --- |
| **Live** | Page exists and is wired to the platform endpoint |
| **Fixture** | Page exists and looks finished, but renders static demonstration data |
| **Copy** | Page exists as prose only; no data, no action |
| **None** | Platform can do this. No client surface exists. |

"Fixture" is the dangerous one: those pages are *visually* complete, which makes the
remaining work easy to underestimate.

## 1. Public site

| Route | Status | Platform endpoint | Issue |
| --- | --- | --- | --- |
| `/` | Fixture | `/targets/tonight` | DV-071 |
| `/pricing` | Copy | `/subscription/plans` | DV-071 |
| `/observatory` | Copy | — | DV-071 |
| `/network` | Copy | `/network/nodes` | DV-071 |
| `/status` | **Live** | `/observatories/{id}/state`, `/conditions` | DV-073 |
| `/terms`, `/privacy`, `/refunds` | Copy (draft) | — | DV-072 |
| `/sign-in`, `/register`, `/verify-email` | **Live** | `/auth/*` | — |

The homepage sells "tonight's sky" from `homepage-data.ts`, a hand-written array of
eight targets. `/targets/tonight` exists and is not called.

## 2. Customer application

| Route | Status | Platform endpoint | Issue |
| --- | --- | --- | --- |
| `/app` | Fixture | `/me` | DV-079 |
| `/app/missions` | Fixture | `/targets/tonight` | DV-074 |
| `/app/missions/[slug]` | Fixture | `/targets/{slug}` | DV-074 |
| `/app/missions/[slug]/session` | Fixture | `/missions/{id}`, `/command`, `/events` | DV-075 |
| `/app/missions/[slug]/watch` | Fixture | `/missions/{id}/observers` | DV-104 |
| `/app/live` | Fixture | `/missions/{id}/events` | DV-075 |
| `/app/collection` | Fixture | `/captures` | DV-076 |
| `/app/collection/[captureId]` | Fixture | `/captures/{id}`, `/download` | DV-076 |

Every authenticated surface is fixture-backed. The collection renders four committed
SVG files.

## 3. Missing entirely

The platform can do all of this today. None of it has a client surface.

| Surface | Platform endpoints | Issue |
| --- | --- | --- |
| **Booking** — slot picker, checkout, confirmation, manage | `/slots`, `/bookings`, `/bookings/{id}`, `/cancel`, `/reschedule`, `/refund` | DV-074 |
| **Account and profile** | `/me` | DV-079 |
| **Subscription** — plans, subscribe, pause, resume, cancel | `/subscription`, `/plans`, `/pause`, `/resume`, `/cancel` | **none — gap** |
| **Loyalty** — benefits, tier, ledger, redemption | `/loyalty`, `/loyalty/scheme` | DV-097 |
| **Observation Pass** — buy, redeem, gift | `/vouchers` | DV-113 |
| **Observer seat purchase** | `/missions/{id}/observer-pack` | DV-106 |
| **Partner node self-service** — register, submit for review | `/network/nodes`, `/network/nodes/{id}/submit` | **none — gap** |
| **Mobile application** | all of the above | DV-082/083/084 |

`apps/web/src/features/booking/` exists and is an empty directory.

### Two gaps with no issue behind them

**Subscription.** ADR-022 is approved and the platform ships six subscription
endpoints. `docs/backlog.md` has no client issue for any of them. `/pricing` describes
subscriptions in prose and cannot sell one. This needs an issue.

**Partner node self-service.** DV-120–DV-123 build registration, availability windows,
the operator review surface and the installer — all platform and agent side. A telescope
owner has no page on which to register. `/network` describes the network and cannot
join it. This needs an issue.

## 4. Operator console

| Route | Status | Platform endpoint | Issue |
| --- | --- | --- | --- |
| `/admin` | **Live** | `/admin/missions` | DV-077 |
| `/admin/control` | **Live** | `/admin/observatories/{id}/*`, `/admin/override` | DV-077 |
| `/admin/missions` | **Live** | `/admin/missions`, `/cancel` | DV-078 |
| `/admin/targets` | **Live** | `/admin/targets/{id}` | DV-078 |
| `/admin/logs` | **Live** | `/admin/logs` | DV-078 |
| Partner node review | **None** | `/admin/network/nodes/*` (7 paths) | DV-122 |
| Loyalty adjustment | **None** | `/admin/loyalty/adjustments` | DV-098 |

The operator console is the most finished part of the product. Seven admin network
paths and the loyalty adjustment path have no surface.

## 5. Contract debt, carried

`apps/web/src/features/shared-observations/` calls six `/v1/*` endpoints that do not
appear in `packages/contracts/openapi.yaml`, through a hand-written ~25-field
cross-boundary type with no schema validation. It predates this work and sits on `main`.

`CLAUDE.md` is explicit that a missing field stops the work and opens a contract issue
against `darkview-platform`. That issue is still unopened. **It must be filed before
Phase 2 touches the live room**, because that is the code path it is in.

## 6. Totals

| | Count |
| --- | --- |
| Routes today | 24 |
| Live against the platform | 6 |
| Fixture or copy | 18 |
| Customer surfaces missing entirely | 7 |
| Operator surfaces missing | 2 |
| Platform endpoints with no client caller | 38 of 54 |

The product is roughly **a third built** against what the platform already offers, and
the finished third is the operator console rather than anything a customer touches.
