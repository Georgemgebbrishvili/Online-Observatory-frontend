# ADR-059 — The mobile application starts before launch

- **Date:** 2026-10-22
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session: asked for the mobile app next,
  then chose "Start now, new ADR" when told ADR-037 places it after launch. Apple
  developer enrolment: not yet done.
- **Amends:** `ADR-037` §1 ("The mobile application moves after launch"). The rest of
  ADR-037 stands: the first launch is still web only.

## Context

ADR-037 moved Phase 6 (DV-082–084) after launch so that design and launch work came
first. The web surfaces are now built and deployed, and what blocks the launch is on
hardware and outside parties (roadmap Tracks F and G), not client work.

Three facts shape the start:

- **Sign-in is undecided for a native client.** ADR-016 left it open: the API refuses
  a mutation without an exact `Origin`, and a native request carries none. Until the
  platform decides, the app cannot sign in, book, start a session or read a collection.
- **The website and Expo want different React versions.** Next 16.4 runs React 19.2;
  Expo SDK 58 pins React 19.3 and React Native 0.88. One npm workspace would force one
  of them onto the other.
- **This Mac has no Xcode or Android SDK**, and macOS 13 cannot run the Xcode SDK 58
  requires. Apple enrolment has not started.

## Decision

1. **Phase 6 starts now; the launch stays web only.** The app ships when it runs a
   mission on a real phone (Phase 6's "done when"), not with the website.
2. **`apps/mobile` is an Expo SDK 58 app with its own lockfile, outside the npm
   workspaces.** It installs and builds alone, so its dependencies never touch the
   website's install or CI. It reads the shared types from `packages/contracts` by path
   and never defines one of its own.
3. **The first slice uses only the contract's public operations**: the observatory's
   state and conditions, tonight's targets, a target's page, and the slots. Booking from
   the phone hands over to the website until sign-in exists.
4. **Sign-in is a platform request** (`docs/platform-requests/mobile-sign-in.md`).
   Nothing here works around the `Origin` check.
5. **Verification runs on Expo's web target and on Expo Go**, on the simulator stack.
   No store build exists until enrolment clears; Android internal builds (DV-084) come
   first.
6. The brand is the website's: ADR-052's palette and type, Georgian never uppercased,
   nothing below 13 px, every drawn object captioned, a simulated stream badged.

## Consequences

- CI gains a mobile job: install, typecheck, unit tests, a web export.
- DV-083 (live, collection, notifications) waits for the sign-in decision.
- Apple enrolment is still the long pole for iOS and is recorded as open.
