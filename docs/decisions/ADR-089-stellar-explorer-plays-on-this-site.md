# ADR-089 — Stellar Explorer plays on this site

- **Date:** 2026-11-16
- **Status:** APPROVED (2026-11-16)
- **Decided by:** project maintainer (Nika), in session: "check the Voyager game links to
  skychaser. i need it to be on stellars website. not skychaser. fix it." Asked how the copy
  should work, he chose single-player: the full game, progress kept on the device, and none of
  Skychaser's multiplayer, leaderboard, wallet cards or tracking.
- **Supersedes:** `ADR-057` §3 (the Explorer page as a launch screen for `skychaser.io/voyage`)
  and its consequence that Stellar only links to the game.

## Decision

1. **The game is here.** `/[locale]/explorer/play` runs the game full screen. The Explorer
   page's launch button opens it on this site; nothing on the site links to skychaser.io's
   game any more.
2. **The engine is Skychaser's Voyage, kept as written.** It lives in `apps/web/src/voyage/`
   (code, stylesheets, English strings) and `apps/web/public/voyage/` (planet maps, models,
   the Tbilisi terrain). Its imports were moved under `@/voyage/` and its asset paths under
   `/voyage/`; ESLint, Stylelint and Prettier skip it, as they skip the console's Skychaser
   values (ADR-053).
3. **Single-player, nothing reaches Skychaser.** The game runs with its own `NO_ACCOUNT`
   host: no sign-in, no rooms, no leaderboard, no Stars credit, progress in the browser.
   Removed outright: the forecast fetch to Skychaser's `/api/sky/forecast` (Earth's weather is
   a clear sky), the analytics helper, and the reverse geocoder. Leaving the game returns to
   `/[locale]/explorer`.
4. **Stellar's names.** Every "Skychaser" in the game's strings reads "Stellar" (Stellar Base,
   Stellar Outpost, "Back to Stellar"), and the game's title is Stellar Explorer.
5. **English only.** The game's strings exist in English; the Georgian Explorer page says so.
6. **Policy.** The game's page alone may load images from `gibs.earthdata.nasa.gov` (Earth
   imagery) and `s3.amazonaws.com` (Terrarium heights); the rest of the site keeps its CSP. It may also fetch blob: URLs (model textures) and compile
   WebAssembly (`'wasm-unsafe-eval'`, three's meshopt model decoder).
   `/voyage/*` is excluded from the locale proxy and cached a day.
7. **Dependencies.** three 0.170 → 0.184 (the version the engine is built on; the site's own
   3D code typechecks unchanged), plus `use-intl` and `lucide-react`, which the engine uses.

## Consequences

- The repository grows by about 27 MB of game assets.
- The game is a copy: Skychaser's later changes to Voyage do not arrive by themselves. A
  refresh is the same copy and rewrite again.
- The multiplayer and leaderboard code stays in the copy but never runs, because the host has
  no accounts; it is kept so a refresh stays a straight copy.
- The brand test, like the linters, skips `src/voyage/`: a rename of the brand changes the
  game's strings and signs by hand.
