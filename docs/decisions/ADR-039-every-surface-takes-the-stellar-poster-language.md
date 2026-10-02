# ADR-039 — Every Surface Takes the Stellar Poster Language

- **Date:** 2026-10-02
- **Status:** APPROVED
- **Decided by:** project maintainer
- **Supersedes:**
  - `ADR-038-the-app-takes-the-homepage-type-and-night.md`, the same day, before any of
    it was built.
  - `ADR-029-the-homepage-hero-is-the-reference-planet-hero.md` and
    `ADR-030-the-homepage-carries-the-hero-language.md`: the planet hero and its
    language go.
- **Amends:**
  - Brand Identity System v2.0, for colour and type.
  - `ADR-027-the-live-room-takes-the-sidera-console-layout.md`: the layout stands, and
    the room now takes the console's look as well.
  - `CLAUDE.md`, "Design and brand", whose text is changed in the same commit.

## Context

The maintainer reviewed every built screen on 2026-10-02 and rejected the look. The
reference they chose is their own Stellar project as it stood that day: the homepage
and the live telescope console of `stellarr.club`, in its "poster palette" (the
`stellar` repository, `src/styles/stellar-theme.css` and
`src/components/stellar/observatory/console.css`, at `c53234f`).

They decided:

- **Every page** takes it: the public site, the app and the live room.
- **No glow and no reticle.** The reference's glowing buttons and its targeting reticle
  over the picture are not taken.
- **Orange for actions, blue for data.**

## Decision

### Ground and ink

| Token role    | Value                                  | Use                                     |
| ------------- | -------------------------------------- | --------------------------------------- |
| Night         | `#000000`                              | The page                                |
| Deep          | `#050505`                              | Wells: the feed, data, inputs           |
| Plate         | cream at 4.5% (`rgba(243,230,204,.045)`) | Panels                                |
| Plate, hover  | cream at 8.5%                          | An interactive panel under the pointer  |
| Ink 1–4       | `#f6ecd8`, cream at 76%, 56%, 34%      | Text, secondary, tertiary, disabled     |
| Rule / strong | cream at 11% / 20%                     | Hairlines, panel borders                |

### Colour roles

- **Orange `#e8742f`, with `#f6a63f` for hover:** the primary action, filled.
  `#f6b062` is for orange text on the night ground (kickers, links, small highlights).
- **Yellow `#ffd36b`:** anything live or current. Status dots, "tracking", "online",
  and the "Simulated" chip.
- **Photon Blue `#5cc8ff`:** data. Live readouts (altitude, azimuth, exposure, time
  left), charts, and the keyboard focus ring.
- **Sunset `#fff3d2 → #ffd36b → #f7931f → #e0481f → #a81c14`:** the title gradient on
  one display line per page at most, as text fill only.
- Semantic error and success colours are unchanged from `tokens.css`.

### Type

| Role            | Latin            | Georgian (no Mkhedruli in the Latin faces)              |
| --------------- | ---------------- | ------------------------------------------------------- |
| Headline        | Anton, uppercase | Noto Sans Georgian, condensed (`wdth` 75), weight 800   |
| Title (sunset)  | Bowlby One       | Noto Sans Georgian, condensed, weight 900               |
| Spaced label    | Oswald, uppercase, tracked | Noto Sans Georgian, condensed, weight 600, not tracked |
| Body            | Geist            | FiraGO                                                  |
| Data            | JetBrains Mono   | JetBrains Mono for digits; FiraGO for words             |

Georgian has no capitals, so `text-transform: uppercase` never applies to it.
Mkhedruli is not letter-spaced.

### Components

- **Panels:** plate fill, strong rule border, a 14px radius (10px when small). Depth
  comes from the plate and the border.
- **Primary button:** filled orange, ink `#1a0f08`, radius 10px, Oswald label. No glow,
  no shadow halo. Secondary is a strong-rule outline in ink. Ghost is text only.
- **Kicker:** Oswald, tracked, orange text, above a headline.
- **Stats row:** Anton numbers over Oswald labels, under a hairline.
- **Chips:** an outlined pill. A yellow dot means live or simulated.
- **Live room:** the console's panel set:
  - the step tracker (numbered circles joined by a line, done steps checked)
  - the pointing dial
  - steppers and the gain slider
  - one orange primary action under the feed
  
  The picture stays clean: no reticle, no corner brackets, no crosshair.

### Still binding

- No glow on panels, cards, buttons, inputs, focus rings, status indicators or live
  badges. The comet mark keeps its glow as a logo (ADR-025 §3). No `backdrop-filter`.
- No HUD decoration and no NASA-cosplay vocabulary ("target locked").
- Every rendered or drawn object carries "Illustration — not telescope output". Phase 1
  is live view, never long exposure.
- WCAG 2.1 AA. Orange ink on night and dark ink on orange are both verified in
  `tokens.test.ts`.

## Consequences

- `tokens.css` is rewritten to these roles, and the fonts are loaded in the locale
  layout through `next/font`.
- `PlanetHero` and `planet-hero.css` are deleted. The homepage gets a poster hero:
  - an Anton headline with one sunset line
  - one action
  - a stats row
  - the target plates, captioned as illustrations
- Roadmap Track B is re-sliced to this language in `docs/plan/04-roadmap-to-launch.md`.
  Every slice regenerates its baselines in both languages.
