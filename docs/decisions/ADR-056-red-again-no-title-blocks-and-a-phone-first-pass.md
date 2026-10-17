# ADR-056 — Red again, no title blocks, a phone-first pass, and a deeper sky model

- **Date:** 2026-10-17
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session, with a phone screenshot of the
  sign-in page: "Get rid of such header across my site. Get rid of pages, live, voting,.
  Work more on Mobile responsivness and redisign the mobile. Take back previous colors.
  But use current blue there also. Make simulation more realistic and sophisticated."
  Answers to the follow-up questions: remove the big page title block (keep the bar);
  take Live and Vote out of the menus only; blue only in the observatory; all four
  realism areas (sky through the camera, mount, weather and night, capture).
- **Amends:** `ADR-055` §1 (palette) and §4 (navigation). ADR-055's 13 px floor, its
  removed small print and "no maker's name" stand.

## Decision

1. **Palette.** The website returns to ADR-052's warm black and red (`tokens.css`,
   `tokens.ts`, `docs/design/contrast.md` as they were before ADR-055). The observatory
   console (`observatory-console.css`) keeps ADR-055's NASA blue on navy.
2. **No title blocks.** The kicker, giant headline, ring drawing and lede that opened the
   sign-in pages, pricing, status, legal pages, missions, collection, profile, bookings,
   the booking board, /app/live and the signed-in home are gone. Each page keeps one
   visually hidden `<h1>` for screen readers and tests, and starts at its content. The
   homepage hero, the 404 and error pages, and pages whose title is their subject (a
   target, a booking, a capture, the room) keep theirs. An auth page shows its sentence
   only where it says what to do next ("check your email").
3. **Navigation.** The header carries Observatory, Book, Pricing and "Reserve a slot".
   Live and Vote leave the header, footer and homepage; their pages still work, and the
   signed-in app bar is unchanged. The homepage's Watch step has no link.
4. **Phones.** The menu is a solid full-height sheet with large links. The homepage hero
   is two thirds of a screen; the four steps are a two-by-two grid of cards; three of
   tonight's targets show; the instrument specs are tiles; heading ledes hide. Pricing
   rows are cards, the status readings sit two to a row, the booking facts no longer
   collide, and the footer's product links run two to a row. Every page is checked at
   320 px in Georgian for horizontal overflow.
5. **Sky model.** The simulated console gains a sensor model (electrons, gain, read and
   shot noise, 12-bit clipping, hot pixels), seeded seeing, twinkle and image wobble,
   sky glow from twilight and the Moon, drifting cloud and dew, periodic error and
   post-slew ringing in the mount, targets that set behind the ground, a live histogram,
   stacking that lowers noise frame by frame, and capture files that record exposure,
   gain, frames and times. Everything random is seeded. Visible text still names no
   camera or telescope maker.

## Consequences

- The `/observatory` baseline changes: the view label and the Pointing panel no longer
  name the sensor.
- `/design-system` does not yet show the console's new notices or histogram.
