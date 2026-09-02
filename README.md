# Darkview Clients

**The website and the mobile application.** This is the half of Darkview a customer
actually touches.

Darkview is a Live Remote Observatory in Tbilisi, Georgia. A customer reserves an
Observation Slot, chooses an operator-approved Target, and during the Live Observation a
real Celestron NexStar 6SE physically slews to it. Phase 1 is a **live-view / EAA**
experience using short exposures and live stacking — not a long-exposure astrophotography
service.

Nothing here touches the telescope, the database, or a secret. Every server-side
capability comes from the `darkview-platform` repository over HTTP.

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

The two repositories share no file path, so they can be merged into a single repository
later with both histories intact.

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
| Next.js | **16.3.2** | App Router; see `AGENTS.md` — this is not the Next.js you know |
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
