# Stellar Clients

**The website and the mobile application.** This is the half of Stellar a customer
actually touches.

Stellar — Georgian **სტელარი** — is a Live Remote Observatory in Tbilisi, Georgia. A customer reserves an
Observation Slot, chooses an operator-approved Target, and during the Live Observation a
real Celestron NexStar 6SE physically slews to it. Phase 1 is a **live-view / EAA**
experience using short exposures and live stacking — not a long-exposure astrophotography
service.

Nothing here touches the telescope, the database, or a secret. Every server-side
capability comes from the `darkview-platform` repository over HTTP.

## The name

The product was renamed from Darkview to Stellar on 2026-09-24 by
[ADR-025](docs/decisions/ADR-025-the-product-is-renamed-stellar.md). Customer-visible
strings say Stellar today. Identifiers do not: `@darkview/*`,
`DARKVIEW_PLATFORM_API_URL`, the session cookie names, the repository names and every
`darkview` string inside `packages/contracts/` stay until `darkview-platform` renames
in lockstep. The mismatch is expected and is not a defect. Do not "fix" an identifier
opportunistically, and never hand-edit the pinned contract to change a name.

## Repository boundary

```
darkview-platform                          darkview-clients  (this repository)
  agent/       Observatory Agent (Python)     apps/web/     Next.js site
  apps/api/    REST API, auth, payments       apps/mobile/  Expo application
  apps/realtime/  observatory WSS             packages/contracts/  generated from the
  packages/db/    Prisma schema                                    pinned spec below
  contracts/      openapi.yaml  <-- source of truth
```

`packages/contracts/openapi.yaml` is a **pinned copy** of the platform repository's
contract. Never hand-edit it: update it by copying a released version across, then run
`npm run contracts:generate` and commit the result.

**Merging the two later.** No source path exists in both repositories — `apps/web/` and
`apps/mobile/` are only here; `agent/`, `apps/api/`, `apps/realtime/` and `packages/db/`
are only there. What both carry is scaffolding: root config, the shared ADRs, and a
`packages/contracts/` build of the same spec.

So the merge is `git subtree add` twice, which lands each repository under its own prefix
with its history intact, followed by one reconciliation pass: hoist a single root
`package.json` workspace, keep the platform's `contracts/openapi.yaml` and delete this
repository's pinned copy, keep one copy of each shared ADR. Source here needs no edit —
it already imports `@darkview/contracts` by package name.

Never create a source path here that also exists there.

## The platform seam

All server-side data reaches this application through `apps/web/src/lib/platform/`:

| Module | Purpose |
| --- | --- |
| `config.ts` | API base URL and cookie names |
| `client.ts` | authenticated `fetch` wrapper, forwards the session cookie and CSRF token |
| `session.ts` | `requireSession(locale)` — redirects to sign-in when unauthenticated |

Set the API location before running:

```bash
DARKVIEW_PLATFORM_API_URL=http://127.0.0.1:4000
```

**No component or page in this repository may import Prisma, read a database, or hold a
credential.** If a page needs data that the contract does not expose, stop and open a
contract issue against `darkview-platform`.

## Pinned versions

Do not upgrade a major mid-phase.

| | Version | Notes |
| --- | --- | --- |
| Node | **24 LTS** (`v24.14.1` in use) | `engines: >=20.19` |
| npm | 11+ | workspaces |
| Next.js | **16.3.6** | App Router; see `AGENTS.md` — this is not the Next.js you know |
| React | **19.2.8** | |
| TypeScript | **6.0.3** | strict |
| Zod | **4.4.3** | generated from the contract, never hand-written |
| Vitest | 4.1.11 | |
| Playwright | 1.62.1 | |
| Expo / React Native | **not yet pinned** | pinned when DV-082 starts |

## Layout

```
apps/web/            Next.js application — public site, dashboard, live room, admin
apps/mobile/         Expo application — created when DV-082 starts
packages/contracts/  Pinned spec + generated TypeScript and Zod  (never hand-edited)
docs/                design system, brand tokens, localisation, decisions
scripts/             contract generation and drift check
```

## Getting started

```bash
npm install
npm run contracts:check     # must be green before any work starts
npm run test
npm run dev
```

## Where to start

| | |
| --- | --- |
| What we are building and why | `CLAUDE.md` |
| Decisions that bind | `docs/decisions/` |
| The work, with acceptance criteria | `docs/backlog.md` |
| Design tokens and brand rules | `docs/design/brand-tokens.md`, `docs/design-system.md` |
| Georgian terminology | `docs/georgian-terminology.md` |
| File ownership between tracks | `docs/OWNERSHIP.md` |
