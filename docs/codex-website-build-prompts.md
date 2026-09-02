# DARKVIEW — Codex Website Build Prompts

## MASTER RULES — GIVE THIS TO CODEX FIRST

You are working on **Darkview by Astroman**, a new digital observatory platform.

Darkview lets users discover astronomical objects, launch or schedule missions using real telescopes, watch real telescope observations, capture astronomical images, and build a personal collection.

This is a completely new software product.

### Critical provenance rule

Do not copy, import, modify, or reuse source code from any pre-existing or unrelated project.

All application code must be newly created in this repository.

Existing brand assets may only be used when explicitly supplied and must be documented separately from newly developed software.

### Product philosophy

Darkview is not a telescope rental website.

The primary product unit is a **Mission**.

A mission means:

1. User selects an astronomical object.
2. Darkview verifies whether it can be observed.
3. Darkview reserves or immediately assigns telescope capacity.
4. Observatory software commands a real telescope.
5. Telescope slews to the target.
6. Position is verified.
7. Camera observation begins.
8. User watches the observation.
9. User captures an image.
10. Image is stored in their Collection.

Private 30, 60, and 120-minute observatory sessions will later exist as premium products.

### Inspiration

Slooh may be studied for product concepts such as:
- remote observatory access;
- missions;
- object discovery;
- image collections;
- telescope availability;
- memberships;
- educational exploration.

DO NOT reproduce Slooh's:
- source code;
- layout;
- copy;
- illustrations;
- branding;
- proprietary content;
- distinctive visual elements.

Darkview must have its own identity.

### Darkview identity

Brand:

**DARKVIEW**

Endorsement:

**by Astroman**

Core idea:

**A premium optical instrument looking into deep space.**

The interface must NOT look like:
- a crypto product;
- cyberpunk game;
- NASA clone;
- purple-nebula startup;
- generic telescope store.

It should feel:
- premium;
- dark;
- calm;
- precise;
- scientific;
- cinematic;
- trustworthy.

### Brand colors

Use design tokens rather than hard-coded colors.

Base palette:

- Background: `#05070A`
- Elevated background: `#0B1016`
- Elevated secondary: `#101720`
- Main text: `#F3F6F8`
- Secondary text: `#8D99A8`
- Muted text: `#647080`
- Primary cyan: `#18C8FF`
- Bright cyan: `#38DAFF`
- Cyan muted: translucent variants
- Success: restrained green
- Warning: warm amber
- Error: muted red

Avoid excessive gradients.

Cyan glow should be used sparingly for:
- active telescope states;
- live status;
- selected controls;
- target lock;
- primary CTA.

### Typography

Primary heading family:
**Space Grotesk**

UI/body family:
**Inter**

Use strong typography hierarchy and generous whitespace.

### Logo

Assume these brand files will eventually exist:

`/public/brand/darkview-logo.png`
`/public/brand/darkview-mark.svg`
`/public/brand/darkview-wordmark.svg`

If assets are missing, create clean text/placeholding containers only.

Do NOT attempt to redesign the logo.

Never generate fake logo artwork inside the application.

### Technical foundation

Use:

- latest stable supported Next.js with App Router
- React
- TypeScript strict mode
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Zod
- secure server-side authentication architecture
- React Query/TanStack Query where appropriate
- WebSocket/SSE abstraction for observatory live state
- object storage abstraction for captures
- Vitest for unit testing
- Playwright for critical end-to-end flows

Favor server components where appropriate.

Do not introduce:
- Kubernetes
- microservices
- GraphQL
- Redis
- blockchain
- complicated event infrastructure

unless later explicitly requested.

This MVP must remain manageable by one developer.

### Code rules

- TypeScript strict mode.
- English code comments.
- User-facing copy must be internationalization-ready.
- Georgian and English must be supported structurally from day one.
- Never expose telescope credentials to the browser.
- Never allow browser-to-mount direct control.
- Hardware commands always go through the backend and Observatory Agent.
- Never create fake production integrations.
- Simulator state must be explicitly labeled as simulated.
- Build accessible semantic UI.
- Mobile-first responsive design.
- No unnecessary dependencies.
- Prefer well-maintained libraries.
- Explain architectural decisions in `/docs/architecture.md`.

Before changing code:

1. Inspect repository.
2. Explain intended changes.
3. Implement.
4. Run lint.
5. Run TypeScript check.
6. Run tests.
7. Report files changed and remaining issues.

Do not silently change architecture.

---

# PROMPT 1 — Bootstrap Darkview

Using the Master Rules above, initialize the Darkview repository.

Build the production-ready project skeleton.

Create:

- Next.js App Router project
- TypeScript strict configuration
- Tailwind
- linting
- formatting
- Vitest
- Playwright
- environment validation
- Prisma setup
- PostgreSQL configuration
- i18n-ready structure for Georgian and English
- `/docs`
- `/public/brand`
- reusable component structure

Use a clean architecture similar to:

```text
src/
  app/
  components/
    brand/
    layout/
    ui/
    astronomy/
    missions/
    observatory/
  features/
    auth/
    targets/
    missions/
    observatory/
    collection/
    booking/
  lib/
    astronomy/
    auth/
    db/
    observatory/
    storage/
    validation/
  server/
  styles/
  types/

prisma/
docs/
public/
```

Create initial documentation:

- `README.md`
- `docs/architecture.md`
- `docs/design-system.md`

The provenance record must explicitly state that this is newly developed software and contains no imported application code from any pre-existing or unrelated project.

Create a polished basic shell but do not build feature pages yet.

Acceptance criteria:

- project installs cleanly;
- development server runs;
- production build succeeds;
- lint succeeds;
- TypeScript succeeds;
- tests execute;
- homepage shell renders.

Stop after this task and report results.

---

# PROMPT 2 — Darkview Design System

Build the complete Darkview visual system before building individual pages.

Use the Darkview brand rules from the Master Rules.

Create reusable tokens and components for:

- page backgrounds;
- surface panels;
- borders;
- shadows;
- cyan illumination;
- typography;
- spacing;
- radii;
- buttons;
- icon buttons;
- chips;
- status indicators;
- cards;
- modals;
- sheets;
- dropdowns;
- tooltips;
- tabs;
- skeletons;
- empty states;
- error states;
- forms.

Build distinctive Darkview components:

### OpticalRing

A subtle circular optical-interface motif inspired by the Darkview logo.

It must be CSS/SVG based, lightweight and restrained.

### ObservatoryStatus

States:

- ONLINE
- PREPARING
- OBSERVING
- PARKED
- OFFLINE
- WEATHER_HOLD
- MAINTENANCE

### LiveIndicator

Small restrained cyan live indicator.

Do not use aggressive flashing.

### TargetQuality

Display:

- Excellent
- Good
- Fair
- Unavailable

### MissionStatus

Support:

- Requested
- Scheduled
- Preparing
- Slewing
- Verifying
- Centering
- Observing
- Processing
- Complete
- Weather Hold
- Failed
- Cancelled

Create a `/design-system` internal development route showing all components.

Make the design look premium and restrained.

Do not build feature pages.

Run full validation afterward.

---

# PROMPT 3 — Public Darkview Homepage

Build the Darkview public homepage.

This must be an original Darkview design, not a Slooh clone.

The primary visitor takeaway within five seconds must be:

**This website lets me observe the real universe through real telescopes.**

Hero:

Eyebrow:

**DARKVIEW · BY ASTROMAN**

Headline:

**Explore the real universe.**

Supporting copy:

**Connect to real observatories, launch astronomical missions, and capture your own images of the night sky.**

Primary CTA:

**Start a Mission**

Secondary CTA:

**Watch Live**

Hero visual:

Create an elegant dark observatory visualization using existing UI primitives.

Do not use fake generated astronomy photography.

Structure homepage sections:

### 1. Live Now

Display telescope status prominently.

Example:

**Darkview Tbilisi Observatory**

Status:
ONLINE

Current target:
Saturn

Include:
- live indicator;
- approximate viewer count placeholder from application data;
- current mission;
- telescope status;
- CTA: Watch Live.

### 2. Tonight's Sky

Horizontal/desktop grid of target cards.

Initial examples:

- Moon
- Saturn
- M31 Andromeda
- M13
- M27
- M57

Each target card includes:

- object name;
- type;
- visibility;
- quality;
- best observation time;
- estimated mission duration;
- CTA.

Use a data model rather than hard-coded JSX.

### 3. How Darkview Works

Exactly three major concepts:

**Choose**
Pick an object from tonight's observable sky.

**Observe**
A real telescope automatically finds and tracks it.

**Keep**
Capture your own astronomical image and add it to your collection.

### 4. Real Observatory

Explain that Darkview controls physical astronomical hardware.

Include:

- telescope status;
- observatory location;
- camera;
- real-time operation concept.

Do not over-focus on specifications.

### 5. Your Collection

Show an elegant gallery preview.

The concept is:

**These are not stock images. They are observations captured through Darkview.**

Use development placeholders explicitly marked as demonstration data until real telescope captures exist.

### 6. Observatory Network

Introduce future scalability.

Show:

**Tbilisi Observatory — Active**

Architecture should support future nodes, but do not claim nonexistent observatories.

### 7. Private Observatory

Introduce premium private sessions:

- 30 minutes
- 60 minutes
- 120 minutes

Do not implement checkout yet.

### 8. Final CTA

Headline:

**Your next observation starts here.**

CTA:

**Explore Tonight's Sky**

### 9. Footer

Include:

Darkview by Astroman

Product:
- Missions
- Live
- Collection
- Observatory

Company:
- About
- Contact

Legal:
- Privacy
- Terms

Language:
- ქართული
- English

Fully responsive.

Run Lighthouse-conscious optimization and accessibility checks.

---

# PROMPT 4 — Global Navigation and Application Shell

Create two distinct navigation experiences.

### Public navigation

Darkview mark

Links:

- Explore
- Live
- Observatory
- Pricing
- About

Right side:

- Sign in
- Start Exploring

### Authenticated application

Desktop:
left navigation.

Mobile:
bottom navigation.

Primary app destinations:

**Home**
**Missions**
**Live**
**Collection**
**Profile**

Add a prominent observatory status indicator.

Mobile bottom navigation must feel like a polished native application.

Build layouts so the same design language can later be reused in the Expo mobile application.

Do not add unnecessary menu items.

---

# PROMPT 5 — Tonight's Sky / Mission Discovery

Build `/missions`.

This is one of Darkview's core product pages.

The user should not initially see a technical astronomy catalog.

Instead show:

### Available Tonight

Rank objects based on:

- visibility;
- altitude;
- configured safety threshold;
- observatory capability;
- manually configurable quality score.

Filters:

- All
- Planets
- Moon
- Galaxies
- Nebulae
- Clusters
- Stars

Target data model must support:

- id
- catalogId
- commonName
- Georgian name
- type
- RA
- Dec
- magnitude
- angularSize
- description
- minimumAltitude
- preferredObservationDuration
- imagePreset
- bestMonths
- observatory compatibility
- current visibility
- quality score

Create detailed target page:

`/missions/[targetSlug]`

Example:

**Saturn**

Show:

- description;
- visibility tonight;
- best observation window;
- current altitude;
- mission duration;
- difficulty;
- what the user can expect;
- observatory capable of observing it.

Primary CTA:

**Start Mission**

Secondary:

**Schedule Mission**

Do not expose raw RA/Dec as the dominant consumer interface.

Advanced technical information may be collapsible.

---

# PROMPT 6 — Mission Engine UI

Implement the Mission domain model and user interface.

Mission state machine:

```text
REQUESTED
SCHEDULED
PREPARING
SLEWING
PLATE_SOLVING
CENTERING
OBSERVING
CAPTURING
PROCESSING
COMPLETE
```

Failure states:

```text
WEATHER_HOLD
NOT_VISIBLE
HARDWARE_ERROR
CANCELLED
FAILED
```

Create mission screen:

`/missions/[missionId]/session`

The session must visually communicate what the observatory is doing.

Example:

**Preparing your observation**

✓ Observatory online  
✓ Saturn visible  
✓ Safety check passed  

then:

**Moving telescope to Saturn**

then:

**Verifying position**

then:

**Target locked**

then:

**LIVE**

Create an elegant progress visualization based on optical rings and target alignment.

Do not use generic loading spinners where a mission state can be shown.

Mission event history must be data-driven.

Implement a development simulator that safely transitions through mission states.

It must display a clear:

**SIMULATED OBSERVATORY**

label whenever simulator mode is active.

Never make simulator events indistinguishable from real hardware.

---

# PROMPT 7 — Darkview Live Observatory

Build `/live`.

This should be one of the most visually impressive Darkview screens while staying functional.

Layout:

Large central observation viewport.

Top overlay:

**DARKVIEW LIVE**

Observatory:

**Tbilisi Observatory**

Target:
current target

Status:
live telescope state

Include:

- elapsed mission time;
- telescope status;
- target;
- exposure/processing state in simplified language;
- viewer count;
- mission owner if public sharing is enabled.

Primary action:

large **Capture** button.

Secondary controls:

- Natural
- Bright
- Detail

These are processing presets, not raw camera settings.

Do not expose unrestricted mount controls.

Provide an optional safe **Nudge** control component behind a feature flag.

Nudge must never directly command hardware from the browser.

Design the live interface to resemble a premium camera/observatory instrument rather than a dashboard full of tables.

Mobile live mode should prioritize the observation viewport.

Add fullscreen support.

---

# PROMPT 8 — Collection

Build `/collection`.

Concept:

Every completed Darkview observation can become part of the user's personal astronomy collection.

Gallery should feel important and emotional.

Each capture records:

- target;
- date;
- observatory;
- telescope;
- mission;
- capture ID;
- processing preset;
- thumbnail;
- original asset URL;
- optional FITS URL later;
- visibility/privacy status.

Capture detail page:

`/collection/[captureId]`

Show:

**Saturn**

**Captured by you**

Date

Darkview Tbilisi Observatory

Then the image prominently.

Actions:

- Download
- Share link
- Make private/public
- View mission

Add progress collections:

### Solar System

### Messier Starter

### Deep Sky

Structure this generically.

Do not build complex gamification yet.

---

# PROMPT 9 — User Dashboard

Build authenticated `/home`.

Personalized structure:

### Tonight

Show the single strongest recommended object.

Example:

**Saturn is excellent tonight**

CTA:

**Observe Saturn**

### Live Now

Current public observation.

### Upcoming Missions

Scheduled missions.

### Continue Exploring

Suggest targets not yet captured.

### Collection Progress

Show:

observations completed  
unique objects  
recent captures

### Observatory Status

Tbilisi:

Online / Offline / Weather Hold.

Avoid excessive statistics.

This is a consumer astronomy experience, not enterprise SaaS.

---

# PROMPT 10 — Darkview Observatory Page

Build `/observatory`.

This page establishes trust that Darkview uses real equipment.

Show:

# Darkview Tbilisi Observatory

**Tbilisi, Georgia**

State clearly:

Darkview operates a physical telescope system remotely through secure observatory software.

Sections:

### Observatory status

ONLINE / etc.

### Telescope

Initial hardware data should be configurable.

Support expected MVP configuration:

Celestron NexStar 6SE or finalized equivalent.

### Camera

Configurable astronomy camera information.

### What happens during a mission

Visual sequence:

Request  
→ Safety validation  
→ Telescope movement  
→ Position verification  
→ Imaging  
→ Capture

### Safety

Explain in consumer-friendly language that commands are validated for:

- target visibility;
- telescope movement limits;
- session ownership;
- Sun avoidance;
- observatory readiness.

### Future network

Architecture may show a single active site.

Do not invent future observatory partners.

Add data structures that support additional observatories later.

---

# PROMPT 11 — Pricing Architecture

Build `/pricing`, but keep pricing stored in configuration/database rather than duplicated throughout UI.

Create four conceptual offerings:

### Observer

Free.

- Watch public live missions
- Browse Tonight's Sky
- Explore object catalog

### Explorer

Subscription concept.

- Mission credits
- personal captures
- collection
- scheduled observations

### Advanced

Future/feature-flagged.

- priority reservations
- advanced processing
- raw/FITS data
- longer observations

### Private Observatory

Premium session.

- 30 minutes
- 60 minutes
- 120 minutes
- exclusive telescope session

Do not invent production prices.

Use clearly labeled configurable placeholders until pricing is formally decided.

Do not integrate payment yet.

---

# PROMPT 12 — Georgian Localization

Complete Georgian localization.

The product must not feel like an English website translated badly into Georgian.

Implement locale:

`ka`

and:

`en`

All visible strings must come through localization resources.

Prioritize natural Georgian terminology.

Core navigation translations:

Home → მთავარი

Missions → მისიები

Live → პირდაპირი დაკვირვება

Collection → კოლექცია

Observatory → ობსერვატორია

Tonight's Sky → დღევანდელი ცა / tonight-context natural Georgian equivalent

Start Mission → დაიწყე მისია

Capture → გადაიღე

Target Locked → ობიექტი დაფიქსირდა

When astronomy terminology has a recognized Georgian form, use it.

If uncertain about scientific Georgian terminology, create a terminology file for human review rather than guessing.

Create:

`docs/georgian-terminology.md`

for review.

Ensure Georgian typography and line lengths look equally polished.

---

# PROMPT 13 — Authentication and Security Foundation

Implement authentication.

Requirements:

- secure password handling or reputable authentication provider;
- email verification architecture;
- secure cookies;
- CSRF considerations;
- rate limiting;
- authorization middleware;
- server-side session verification;
- secure logout;
- account role support.

Initial roles:

- USER
- OPERATOR
- ADMIN

A normal USER must never be able to access administrative observatory commands.

Implement command authorization model conceptually:

A telescope action must require:

- authenticated user;
- active mission/session;
- valid telescope lease;
- unexpired command;
- observatory ready state;
- server-side safety validation.

Browser must NEVER contain telescope credentials.

Document threat model in:

`docs/security.md`

Do not connect physical telescope hardware yet unless the corresponding adapter already exists.

---

# PROMPT 14 — Observatory API Boundary

Create the software boundary between Darkview cloud and physical telescope.

Do NOT implement undocumented Celestron commands.

Create an interface:

```ts
ObservatoryAdapter
```

with operations conceptually including:

- getStatus
- getCurrentTarget
- getCoordinates
- startMission
- abortMission
- park
- capture
- getPreview
- getMissionEvents

Create implementations:

### SimulatorObservatoryAdapter

For development.

### RealObservatoryAdapter

Interface/stub only until actual CPWI/ASCOM/Alpaca API is confirmed.

The real adapter must throw explicit `NOT_CONFIGURED` errors rather than pretending hardware operations succeeded.

All observatory commands need:

- commandId;
- missionId;
- userId;
- issuedAt;
- expiresAt.

Make operations idempotent where appropriate.

Document protocol in:

`docs/observatory-protocol.md`

---

# PROMPT 15 — Database Model

Create/refine Prisma schema for:

User

Account

Observatory

Telescope

Camera

Target

Mission

MissionEvent

Reservation

Capture

Collection

Subscription

CreditLedger

PrivateSession

ObservatoryCommand

AuditLog

Suggested Mission relationships:

Mission belongs to:
- user;
- target;
- observatory;
- telescope.

Mission may have:
- many events;
- many captures.

Build migrations.

Add robust development seed data.

Seed data must be clearly identified as development/demo data.

Never seed fake production observations.

---

# PROMPT 16 — Join a Live Mission

Implement Darkview's scalable shared-observation concept.

When one telescope is observing Saturn, another user should be able to:

**Watch Mission**

without commanding the telescope.

Optional:

**Join Mission**

Meaning:

The user joins the observation and may save an allowed resulting capture to their collection according to business rules.

Important:

Only the mission owner/operator can initiate telescope-affecting operations.

Viewers cannot control the mount.

Build:

- live viewer authorization;
- mission presence count;
- join/leave state;
- shared mission page;
- capture-sharing architecture.

This is important because one telescope observation can serve multiple users.

Keep implementation simple for MVP.

---

# PROMPT 17 — Darkview Network Foundation

Create `/network`.

Do not build a telescope marketplace yet.

Build the architectural foundation for future external observatory partners.

Show current:

**Darkview Tbilisi Observatory**

Future feature concept:

**Connect Your Observatory**

Create partner node data model proposal supporting:

- owner;
- observatory;
- telescope;
- capabilities;
- availability;
- approved status;
- geographic coordinates;
- commission model later.

Do not implement payments or automatic third-party hardware onboarding.

Create:

`docs/network-future.md`

explaining how Darkview could eventually schedule missions across multiple independent observatories.

---

# PROMPT 18 — Premium Motion and Interaction Pass

Perform a restrained premium motion-design pass across Darkview.

Create:

- logo startup reveal;
- optical-ring loaders;
- mission target-lock animation;
- subtle card hover depth;
- observatory online pulse;
- smooth state transitions;
- skeleton transitions;
- view transitions where appropriate.

Constraints:

Animations must:

- respect `prefers-reduced-motion`;
- avoid performance-heavy particle systems;
- never block actions;
- never look like a videogame;
- stay under reasonable durations;
- preserve accessibility.

The Darkview identity should feel like precision optics, not science fiction.

---

# PROMPT 19 — Mobile Responsive Product Pass

Review every Darkview screen at:

- 320px
- 375px
- 390px
- 430px
- tablet
- desktop
- wide desktop

Fix:

- overflowing cards;
- navigation;
- typography;
- touch targets;
- live viewport;
- mission progress;
- collection gallery;
- forms;
- dialogs.

Mobile navigation:

Home  
Missions  
Live  
Collection  
Profile

The application should feel close to a native product on mobile.

Do not simply shrink the desktop interface.

---

# PROMPT 20 — Accessibility, Performance and SEO

Perform a production-readiness pass.

Accessibility:

- keyboard navigation;
- focus states;
- semantic HTML;
- accessible dialogs;
- proper labels;
- meaningful alt text;
- contrast compliance;
- reduced-motion support.

Performance:

- image optimization;
- lazy loading;
- bundle analysis;
- dynamic loading when justified;
- avoid unnecessary client components;
- optimize fonts.

SEO:

Create metadata for public routes.

Add:

- OpenGraph
- robots
- sitemap
- canonical metadata
- structured metadata where appropriate

Do not index authenticated application pages.

Aim for strong Lighthouse results without sacrificing product functionality.

---

# PROMPT 21 — Critical End-to-End Tests

Create Playwright tests for Darkview's primary user journey.

Test:

Visitor opens homepage  
→ explores Tonight's Sky  
→ selects Saturn  
→ signs in using development test account  
→ opens Saturn target  
→ starts simulated mission  
→ mission progresses  
→ reaches simulated LIVE state  
→ user captures image  
→ capture appears in Collection.

Also test:

- unauthorized mission access;
- unavailable target;
- observatory offline;
- expired command;
- wrong session user;
- mission failure;
- Georgian language switch;
- mobile navigation.

Simulator must remain explicitly labeled.

Run all tests.

Fix failures rather than merely reporting them.

---

# PROMPT 22 — Production Launch Audit

Do not add features.

Perform a complete repository review.

Look specifically for:

- fake integrations;
- placeholder production behavior;
- security issues;
- leaked secrets;
- hardcoded credentials;
- duplicate business logic;
- broken localization;
- inaccessible UI;
- unhandled mission states;
- browser-direct observatory commands;
- unreliable optimistic state;
- missing database constraints;
- weak error handling;
- dead code;
- dependency vulnerabilities;
- old copied project references;
- references to unrelated projects that should not exist;
- claims of observatory capability that are not actually implemented.

Run:

- production build;
- lint;
- TypeScript;
- unit tests;
- integration tests;
- Playwright tests.

Generate:

`docs/launch-readiness.md`

with:

- PASS;
- FAIL;
- BLOCKER;
- deferred Phase 2 items.

Do not mark the project launch-ready while blockers remain.

---

# FINAL RULE FOR CODEX

At no point should you sacrifice telescope safety, security, auditability, or code provenance in order to make a demo look complete.

If an external API or hardware interface is unknown, stop and document the missing interface instead of inventing one.

A visually complete feature backed by fake production behavior is considered a failure.

A smaller feature backed by real, testable functionality is considered success.