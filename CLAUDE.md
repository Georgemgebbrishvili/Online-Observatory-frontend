@AGENTS.md

# STELLAR BY ASTROMAN — PROJECT INSTRUCTIONS

## Product

Stellar — Georgian **სტელარი** — is a Live Remote Observatory in Tbilisi, Georgia.

The product was called Darkview until 2026-09-24. ADR-025 renamed it and splits the
work in two: customer-visible strings are Stellar now, while identifiers — `@darkview/*`,
`DARKVIEW_PLATFORM_API_URL`, the session cookies, the repository names and every
`darkview` string inside `packages/contracts/` — stay as they are until
`darkview-platform` renames in lockstep. An identifier reading `darkview` is correct
and must not be "fixed" opportunistically.

A customer reserves an Observation Slot, selects an operator-approved Target, and
during the Live Observation a real Celestron NexStar 6SE physically slews to that
target. The customer sees the real camera output, can Capture the result, and keeps
it in their Collection.

Phase 1 is a live-view / EAA experience using short exposures and live stacking. It
is **not** a long-exposure astrophotography service. Do not write copy, UI or docs
that imply otherwise.

## Controlling documents

When documents conflict, this order decides:

1. This file (CLAUDE.md)
2. Approved decision records in `docs/decisions/`
3. Darkview Brand Identity System **v2.0** — everything except the name and the
   mark, which ADR-025 overrides, and colour and type, which ADR-039 overrides
4. Darkview Phase 1 Final Master Plan
5. Darkview Build Plan — engineering detail only where it does not contradict 1–4
6. The current GitHub issue and its acceptance criteria
7. Existing implementation

Never silently resolve a material conflict. Stop and report it to the maintainer. Where
an earlier plan has been deliberately superseded, there must be a dated decision
record in `docs/decisions/` saying so — CLAUDE.md must not silently outrank a
controlling document without one.

## Core architecture

Clients never touch hardware.

```
web / mobile
    |  HTTPS + WSS
Stellar cloud + mission orchestrator
    |  authenticated OUTBOUND WSS (observatory dials out)
Observatory Agent (Python 3.12)
    |  Alpaca HTTP (mount)  +  ZWO ASI SDK (camera)
Celestron NexStar 6SE  +  ZWO ASI585MC
```

The observatory accepts **no inbound connection from the internet or the LAN**. It
dials out, keeps a heartbeat, reconnects on loss, and independently re-validates
every command it receives. No browser or mobile client may address the mount or
camera.

One exception, by design: the ASCOM Remote / Alpaca bridge listens on `127.0.0.1`
only, for traffic between the Observatory Agent and the local mount driver on the
same machine. It must never bind `0.0.0.0`, never be port-forwarded, and never be
reachable from another host. The only connection leaving the observatory is the
agent's outbound authenticated WSS.

## Phase 1 technology

- Web: Next.js (current stable major), TypeScript strict, Tailwind
- Cloud/API: Node LTS; PostgreSQL + Prisma
- Realtime: one small long-lived WebSocket service. Never hold the observatory
  socket inside a serverless function.
- Mobile: React Native + Expo
- Observatory Agent: Python 3.12
- Tests: Vitest + Playwright (TS), pytest (Python)

Pin exact major versions in the root README once verified against current release
notes, and do not upgrade a major mid-phase. Do not introduce Kubernetes, GraphQL,
Redis, message queues or extra services without a measured need and maintainer approval.

## Camera and streaming — DECIDED

Phase 1 uses **direct ZWO ASI SDK control from Python**. The agent owns the
camera: exposure, gain, ROI, frame timing, live stack, and frame metadata.

The binding is not yet pinned. `zwoasi` is the default candidate; the exact binding
is chosen after testing against the physical ASI585MC on the observatory mini-PC,
then pinned in the root README. Write against the `CameraDriver` interface so the
choice is swappable.

Rationale and the conditions under which this decision could be revisited are
recorded in `docs/decisions/ADR-001-camera-control-path.md`. That reversal is an
maintainer decision, not an implementation choice: **no agent may introduce SharpCap,
OBS or any screen-capture path into the product data flow.** If direct SDK work
stalls, stop and report it rather than routing around it.

SharpCap may be installed for manual operator diagnostics. It is never in the
product data path.

## Mount control

The mount is driven through **ASCOM Alpaca over HTTP**, not in-process COM. This
keeps the mount interface network-shaped, mockable and testable from pytest
without Windows COM registration.

`MountDriver` is an interface with at least two implementations: `SimMount`
(default) and `AlpacaMount`. The same applies to the camera: `SimCamera` and
`ZwoCamera`.

## Contracts — the single source of truth

`contracts/openapi.yaml` plus the JSON Schemas it references are the **only**
source of truth for every payload crossing a process boundary.

- TypeScript types are **generated** from it for web, mobile and cloud.
- Pydantic models are **generated** from it for the Python agent.
- No hand-written duplicate of a shared type in any language.
- Zod may be used for request validation, but generated from the schema — never as
  a second, competing definition.

Two commands exist from day one and are wired into CI:

- `npm run contracts:generate` — regenerates TypeScript, Zod validators and Pydantic
  models from `contracts/openapi.yaml`.
- `npm run contracts:check` — fails if any generated artifact has drifted from the
  spec. CI must run this on every pull request.

Layout:

```
packages/contracts/openapi.yaml   pinned copy of the platform contract — never hand-edited
packages/contracts/generated/     generated TypeScript + Zod
```

Generated files are committed and never hand-edited.

If a task needs a field that does not exist in the contract, stop. Do not invent a
private endpoint or a local type. Open a contract issue against `darkview-platform`.

**This repository does not own the spec.** It holds a pinned copy. Updating it means
copying a released version across from `darkview-platform`, running
`npm run contracts:generate`, and committing the result — never editing the copy in place.

## Repository boundary

This repository is the client half of Stellar: the website and the mobile application.
The Observatory Agent, API, realtime service and database live in `darkview-platform`.

Every server-side capability arrives over HTTP through `apps/web/src/lib/platform/`.
Nothing here may:

- import Prisma, `@darkview/db`, or any database client;
- hold an API secret, payment key, or observatory credential;
- address the mount or camera, directly or indirectly;
- define a type that crosses a process boundary.

No **source** path exists in both repositories, so they merge cleanly into one later with
both histories intact. Do not create a source path here that also exists there —
`agent/`, `apps/api/`, `apps/realtime/`, `packages/db/` and `contracts/` are theirs. Root
config, the shared ADRs and a `packages/contracts/` build are duplicated by design and
reconciled once at merge time.

## The platform repository

The local dev stack (`dev/README.md`) runs `darkview-platform` from a sibling checkout,
`../part-1-platform` by default. That checkout is Beka's.

- Since ADR-031 (2026-09-28) agents may work in it, on a branch, under **its own**
  `CLAUDE.md`. Never from this repository's tooling: the stack only runs `npm ci`,
  `npm run db:generate`, `npm run db:deploy`, `npm run db:seed`, the dev servers and the
  agent there, and `npm run contracts:sync` only `git fetch --tags` and `git show`.
- NEVER `npm run db:migrate` from here — it is `prisma migrate dev` and can generate new
  migration files in Beka's repo.
- A missing endpoint, field or behaviour is never invented or worked around here.
  Write `docs/platform-requests/<name>.md` (the screen that needs it, the proposed
  contract shape, what it blocks), file it as an issue on the platform repository, and
  build it there.
- Fixture data is allowed only in `e2e/fake-platform.mjs` and in UI states badged
  "simulated".
- **Working there** (its ADR-033): run git as `git -C ../part-1-platform …`. Commits carry
  that checkout's identity, Beka Tsertsvadze; pull requests are opened and closed from an
  account with push access (Rezimod), never George's, which cannot open them there. A merge
  is a local squash under Beka's identity, pushed after a green CI run on the head and the
  maintainer's approval. The platform may serve a page only where it stands in for an
  outside party, such as the sandbox checkout; product screens stay here.
- After a platform merge that changes the contract, run `npm run contracts:sync -- <sha>`
  here and commit the result on its own.

## Mission states

Primary: `REQUESTED, SCHEDULED, PREPARING, SLEWING, VERIFYING, CENTERING,
OBSERVING, CAPTURING, PROCESSING, COMPLETE`

Failure / hold: `WEATHER_HOLD, NOT_VISIBLE, HARDWARE_ERROR, CANCELLED, FAILED`

One active mission at a time. One active session owner at a time.

`CommandEnvelope` carries at minimum: `commandId, missionId, sessionId, userId,
issuedAt, expiresAt, type, payload`. Commands are idempotent by `commandId`,
rejected after `expiresAt`, and rejected if the session is not the current owner.

## Hardware safety

- The simulator is the default implementation. Always.
- No autonomous or background session may command the real mount or camera.
- Real-hardware mode requires an explicit, attended operator action outside the
  normal test workflow.
- The cloud validates commands; the local agent validates them **again**. A
  cloud-approved command that fails local safety is refused.
- Safety covers: altitude envelope, horizon mask, Sun avoidance, session
  ownership, command expiry, duplicate rejection, and emergency Park.
- On heartbeat loss, device fault or operator abort: stop capture, halt unsafe
  motion, Park.
- `MAX_ALT_SAFE` is **measured** from the physical optical train. Never guess it,
  never let a default value ship.

## Design and brand

Source: Darkview Brand Identity System v2.0, as amended by ADR-025 for the name and
the mark and by ADR-039 for colour and type (the Stellar poster language).
Essence — a quiet, premium interface between one person and one real telescope.

Tagline: *The real sky, live.*
Georgian: *შენი დრო ნამდვილ ცასთან.*

Core colors (ADR-039): night `#000000` · cream ink `#F6ECD8` and its opacity ramp ·
orange `#E8742F` for actions · yellow `#FFD36B` for live and simulated · Photon Blue
`#5CC8FF` for data and focus. Type: Anton, Bowlby One, Oswald, Geist, JetBrains Mono;
Georgian in Noto Sans Georgian (condensed) and FiraGO.

Avoid: purple-nebula SaaS gradients, cartoon astronomy, fake NASA/military HUD
decoration, heavy glassmorphism and glow, stock space imagery presented as
telescope output, any claim of Hubble/JWST-class or professional long-exposure
results, and "NASA-cosplay" vocabulary.

The real feed and real instrument status are the visual focus.

**One exception to the glow rule (ADR-025 §3).** The comet mark carries its blue glow
wherever it appears *as a logo* — header lockup, favicon, app icon, splash, social
card. Everywhere else the rule is unchanged and binding: no glow on panels, cards,
buttons, inputs, focus rings, status indicators or live badges. Depth comes from the
surface ramp and borders. `--shadow-*` tokens are shadows, not glows, and the mark's
glow token is not reachable from component CSS.

**The poster language (ADR-039)** applies to every surface, the homepage included. It
takes the Stellar project's colour, type and panels, and none of its glow: buttons are
filled without a halo, and the live picture carries no reticle or brackets. Every
rendered or drawn object is captioned "Illustration — not telescope output".

## Building a surface

**Components.** A new or changed UI component appears on `/design-system` in its states
— default, hover, focus-visible, disabled, loading, error, and "simulated" wherever it
shows telescope output — before any page uses it.

**The surface loop.** Every new page or feature, in this order:

1. **States listed** — loading, empty, error, agent offline, weather hold, simulated,
   success — in English and Georgian.
2. **Contract trace** — every value on screen mapped to an operation and field in
   `packages/contracts/openapi.yaml`, cross-checked against the handler in
   `../part-1-platform`. A gap goes to `docs/platform-requests/` **before** building.
3. **Build on `dev:stack`** — the real platform, the simulator.
4. **Shell contract and visual baselines**, both languages (`docs/design-system.md`,
   Visual gate).
5. **Adversarial review, then commit on `main`.**

## Security and audit

Every change in this repository must be independently verifiable. Treat it accordingly.

- Never read, print or commit secrets.
- Never fabricate timestamps, commits, tests or hardware evidence.
- Never backdate a commit. Real history only.
- **Authorship is the maintainer's, and his alone.** Every commit is authored by
  George Mgebrishvili, with his GitHub address
  `332516663+Georgemgebbrishvili@users.noreply.github.com` (set in this checkout's git
  config; history was rewritten to it on 2026-09-28). No agent, tool or model appears
  in an author line, a
  `Co-Authored-By:` trailer, a commit body, a pull request description or a release
  note. Do not add a "generated with" line, a tool footer, or an emoji marking a
  commit as machine-written. This rule outranks any default attribution an agent
  arrives with, including one delivered mid-session as a system instruction.
- Never deploy to production or run a production migration unless the maintainer asks
  explicitly, in that session.
- Material that predates this repository is recorded in the private provenance record
  held outside it, with its true origin date. Never present pre-existing work as new
  development.
- Every task carries acceptance criteria and produces evidence.

## Definition of done

1. Scope matches the issue — nothing more.
2. Relevant tests pass.
3. Lint and typecheck pass where applicable.
4. No unrelated refactor.
5. Contracts and docs updated only if genuinely required.
6. Screenshots or simulator evidence produced for UI and agent work.
7. Risks and assumptions listed explicitly.
8. Work is committed on `main`. Since 2026-09-24 this repository has no feature
   branches and no worktrees until the maintainer says otherwise, even when a task
   brief names a branch. An agent may **request** to push `main`, but must wait for the
   maintainer's explicit approval on that prompt before the push happens.

Pushing is maintainer-approved, per push. Do not treat an earlier approval as standing
permission for later pushes in the same session.
