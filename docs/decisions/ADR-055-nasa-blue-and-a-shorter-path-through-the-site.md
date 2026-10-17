# ADR-055 — NASA blue, navy ground, and a shorter path through the site

- **Date:** 2026-10-17
- **Status:** APPROVED
- **Decided by:** project maintainer (Nika), in session: "make the colors of the
  observatory better, more NASA-like, and more easy to use, and polish all the website.
  Get rid of the small texts, leave only important texts, and the navigation to the site
  should be very easy for user. From home page to every other pages, it should be easy
  and understandable." Then: "dont shop celestron anywhere."
- **Amends:** `ADR-052` §2–§4 (the palette and the glows) and the CLAUDE.md "Avoid" line on
  NASA-styled colour. Type, lockup, honesty rules and the "Simulated" and "Illustration —
  not telescope output" captions are unchanged.

## Decision

1. **Palette.** The ground moves from warm black to navy (`#070d1a` canvas, `#0b1424`
   well, `#040914` bars and console). Ink is a cool white (`#f3f6fb`, `#b6c0d0`,
   `#97a3b8`). The accent is NASA blue: `#3d8bfd` for highlights, active tabs and glows,
   `#1f5fd1` under white for filled buttons, `#8ab8ff` for blue text and the focus ring,
   `#0b3d91` (the agency's own blue) at the deep end of ramps. NASA red `#fc3d21` is kept
   for a hold and the compass's north mark only. Gold stays "simulated"; green stays LIVE.
   Every pair is measured in `docs/design/contrast.md`; all pass AA.
2. **The console** takes the same palette through its own literal values (ADR-053 still
   exempts `observatory-console.css` from the token rule).
3. **Small text.** Nothing on a page reads below 13 px. Footnotes that repeat what a badge
   already says are removed: the simulator detail beside a "Simulated" badge on the
   homepage and tonight's list, "Simulated today" under each step, the instrument's
   sub-notes, the private-sessions note, the sign-in security footnote, the console's
   "HCG from 252" and "this session" captions.
4. **Navigation.** The header carries the five pages a visitor needs — Observatory, Book,
   Live, Vote, Pricing — and one button, "Reserve a slot", to the booking page. The two
   in-page anchors (Explore, About) are gone. Each homepage step links to the page where it
   happens; the footer lists every product page and drops the unlinked "Company" column;
   the console gains a phone menu with the same links.

5. **No maker's name.** No page shows the telescope's manufacturer or model. The homepage
   drops its "Telescope" row and keeps aperture, focal length and ratio; the signed-in home
   and a partner's live room show aperture and focal length; the console names a tube by
   aperture and design ("203 mm Schmidt-Cassegrain"); the terms say "a real telescope".
   The platform still sends `manufacturer` and `model`; the client does not render them.
   Source citations in code comments are not shown and stay.

## Not decided here

Military HUD decoration, mission-patch art and "NASA-cosplay" vocabulary stay out; the
change is colour and clarity, not costume. The agency's name and marks are not used.
