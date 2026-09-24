# Stellar Clients — backlog

22 issues. IDs are stable across both repositories and never reused. Gaps in the
numbering are intentional headroom.

Detailed acceptance criteria and evidence requirements for each issue are held in the
project planning archive outside this repository. This file is the working index and the
dependency order.

## Conventions

- **Size:** S ≈ half a day, M ≈ 1–2 days, L ≈ 3–5 days, for one person.
- Every issue here runs against the simulator or against fixtures. Nothing in this
  repository commands hardware, and nothing in it holds a credential.
- No issue may define a cross-boundary type. Types come from `@darkview/contracts`,
  generated from the pinned spec. An issue that needs a field the contract does not have
  stops and opens a contract issue against `darkview-platform`.
- Branch naming: `web/dv-077-operator-console`, `mobile/dv-082-app-shell`.

## Website

| ID | Title | Size | Depends on |
| --- | --- | --- | --- |
| DV-070 | Design tokens and the Stellar component library | L | — |
| DV-071 | Public conversion pages | L | DV-070 |
| DV-072 | Legal pages | M | DV-070 |
| DV-073 | `/status` page | M | DV-070 |
| DV-074 | Booking flow | L | DV-070, platform DV-054/055 |
| DV-075 | Live mission room | L | DV-070, platform DV-060 |
| DV-076 | Collection | M | DV-070, platform DV-061 |
| DV-077 | Operator console | L | DV-070, platform DV-063 |
| DV-078 | Operator missions, targets and logs | M | DV-077 |
| DV-079 | Account and profile | M | DV-070, platform DV-051 |
| DV-080 | Georgian localisation QA | M | all surfaces |
| DV-081 | Accessibility, responsive and performance pass | M | all surfaces |

**DV-077 is built early**, before most of the customer surfaces. It is the debugging
instrument for everything after it.

## Mobile

| ID | Title | Size | Depends on |
| --- | --- | --- | --- |
| DV-082 | Expo application shell | L | DV-070 |
| DV-083 | Mobile live, collection and notifications | L | DV-082, platform DV-060/061 |
| DV-084 | Android internal build, and iOS if enrolment allows | M | DV-083 |

## Observer Pack — client side (ADR-007)

| ID | Title | Size | Depends on |
| --- | --- | --- | --- |
| DV-104 | Live room, observer view | M | DV-075, platform DV-103 |
| DV-105 | Sharing control for the controller | S | DV-075, platform DV-101 |
| DV-106 | Observer seat purchase flow | M | DV-074, platform DV-102 |

## Loyalty — client side (ADR-008)

| ID | Title | Size | Depends on |
| --- | --- | --- | --- |
| DV-097 | Loyalty web surface — benefits, calculator, dashboard, redemption | L | DV-070, platform DV-091 |
| DV-098 | Loyalty admin — accounts, adjustment with mandatory reason, audit | M | DV-077, platform DV-092 |
| DV-099 | Loyalty in the mobile application | M | DV-097, DV-082 |

Loyalty is a **module inside the website and a section inside the app**. It is not a
separate product, a separate site, or a separate application.

## Remaining client scope

| ID | Title | Size | Depends on |
| --- | --- | --- | --- |
| DV-113 | Observation Pass, customer surfaces | M | DV-074, platform DV-112 |

## Build order

**DV-070 first, and alone.** Every other issue in this repository consumes its tokens and
components. Starting a surface before the token layer exists means building it twice.

Then, in dependency order:

```
DV-070  design tokens and components
DV-077  operator console            <- the debugging instrument
DV-072  legal pages                 <- start early, it blocks payment onboarding
DV-075  live mission room
DV-104  observer view      DV-105  sharing control
DV-076  collection         DV-078  operator missions and logs
DV-071  public pages       DV-073  status page
DV-074  booking flow       DV-106  seat purchase   DV-113  pass surfaces
DV-079  account and profile
DV-097  loyalty web        DV-098  loyalty admin
DV-082  Expo shell -> DV-083 mobile live -> DV-099 loyalty -> DV-084 builds
DV-080  Georgian QA        DV-081  accessibility and performance
```

## Filed on GitHub, outside the DV numbering

Opened in Phase 0. The DV series is the planning archive's numbering and is shared with
`darkview-platform`; these three are issues on this repository and carry no DV number.

| Issue | What it is | Phase |
| --- | --- | --- |
| [#1](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/1) | `shared-observations` calls six `/v1/*` endpoints absent from the pinned contract, through an unvalidated hand-written cross-boundary type | blocks 2 |
| [#2](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/2) | Subscription has no client surface — six approved endpoints, no caller | 5 |
| [#3](https://github.com/Georgemgebbrishvili/Online-Observatory-frontend/issues/3) | Partner node self-service registration has no client surface | 5 |

## Blocking external dependencies

| | Blocks |
| --- | --- |
| Apple D-U-N-S number and Developer Program organisation enrolment — 5–30 days plus 1–4 weeks, not compressible | DV-084 (iOS half) |
| Google Play console setup | DV-084 |
| Brand Identity System source document | DV-070 |
| Legal text for terms, privacy and refund policy | DV-072 |

**Start the Apple enrolment before anything else in this repository.** It is the only
dependency here whose lead time exceeds the build time of the thing it gates.

## What this repository must never do

- Import Prisma, `@darkview/db`, or any database client.
- Hold an API secret, a payment key, or an observatory credential.
- Address the mount or camera, directly or indirectly.
- Define a type that crosses a process boundary.
- Present simulated output as real telescope output. Simulated frames carry the
  simulated badge, always.
