# Mobile shell — evidence, 2026-10-22

ADR-059's first slice: the Tonight tab (status, conditions, what the telescope can reach),
a target's page, and the Book tab (tonight's slots, handing over to the website).

How these were made: `npx expo export --platform web` with
`EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL=http://127.0.0.1:4120`, served statically, against
`apps/web/e2e/fake-platform.mjs` on port 4120 (the simulator's data), in Chrome at
390 × 844, device scale 2, en-GB and ka-GE. The `unavailable-*` shots are the same with
the fake platform stopped.

What these do not show: a native build. This Mac has no Xcode or Android SDK, so the app
has not yet run in Expo Go on a phone. The weather-hold, offline and degraded headlines
are covered by `src/present.test.ts`, not by a screenshot.
