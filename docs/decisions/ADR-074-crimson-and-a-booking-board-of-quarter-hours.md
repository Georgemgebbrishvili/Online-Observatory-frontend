# ADR-074 — Crimson, and a Booking Board of Quarter Hours

- **Date:** 2026-10-25
- **Status:** APPROVED (maintainer, in session, 2026-10-25: "work on booking page design, i
  dont like the current layout, should be simpler and better looking. also more flexible
  booking experience, i have to be able to select more timeslots, like press 20:00 and
  fill it until 21:30 … take design system from that. and redesign the whole other pages
  also", with two reference boards: glossy crimson panels on deep wine, and cream cards
  with crimson accents)
- **Decided by:** project maintainer
- **Supersedes:** ADR-052's colour, type and button shape (its glow roles stay); ADR-055's
  NASA blue for the observatory console; ADR-056's restoration of ADR-052's red;
  ADR-072 §4 (the length picker)
- **Relates to:** ADR-053 §7 (the booking board), ADR-063, ADR-068, ADR-072

## Context

The maintainer finds the booking board crowded — a month calendar, a row of length chips
and a stepper, a night bar, then the starts — and wants to choose a session by its start
and its end ("press 20:00 and fill it until 21:30") rather than by picking a length first.
He also handed over a new look for the whole site: deep wine grounds, glossy crimson for
whatever is chosen or primary, cream cards, pill buttons, large radii, and a clean bold
sans in sentence case.

## Decision

### Crimson, everywhere

1. **Palette.** Canvas `#14070b`, wells `#0f0408`, bars `#0b0306`; ink `#fbf3f2`,
   `#dcc4c7`, `#b89ea2`; crimson `#e1263f` for highlights and edges, `#c81d36` under white
   text (5.7:1), `#ff8090` for crimson text on the dark; cream paper `#f7ece4` with ink
   `#2a0d14` and `#6b4850`. Gold stays for simulated and done, green for LIVE. Every pair
   is measured in `docs/design/contrast.md`.
2. **Surfaces.** A panel is a wine gradient (`--gradient-panel`) with a hairline, a 24px
   radius, a soft drop and a lit top edge. What is chosen or primary is glossy crimson
   (`--gradient-crimson`, `--shadow-crimson`). A summary that carries a price and its one
   button is a cream paper card (`--color-paper`).
3. **Shape.** Buttons and chips are pills; panels 24px, large cards 32px.
4. **Type.** Headings are Geist, bold, tight (−0.025em), in sentence case; buttons, the
   header's links and the phone tabs are sentence case too. Small kickers and data labels
   stay uppercase and tracked. Georgian is unchanged: Noto Sans Georgian and FiraGO, never
   uppercased or tracked. Anton and Oswald remain only where a face must be condensed: the
   observatory console's labels and the weekly cards' art.
5. **The consoles.** The observatory console and the live room take the same wine and
   crimson; NASA blue is retired.

### The booking board

6. **A strip of nights** replaces the month calendar: one tile per bookable night with its
   weekday, date, the Moon that night and how many quarter hours are open.
7. **The night as quarter hours.** The board reads each night from `GET /slots` at 15
   minutes and lays the quarter hours out an hour to a row. A tap sets the start and runs
   it for the address's length (30 minutes by default, `?length=` as ADR-072 had it); a
   later tap sets the end. With a mouse the run can be dragged. A run stops before a taken
   quarter hour, at the end of the night, or at 4 hours, and says why. − and + move the
   end a quarter hour. A replacement for a lost slot keeps its booking's length: a tap
   places the whole of it, or says there is no room from that start.
8. **Why quarter hours are enough.** A 15-minute start is available exactly when
   `[start, start + 25 min)` is clear of every held booking's `[start, end + 10 min)`; a run
   of them is therefore clear exactly when the run itself and its turnaround are, which is
   the platform's rule for a session of the run's length. No contract change.
9. **The price is the platform's.** Before a run can be reserved its own slot is read from
   `GET /slots` at its length, and that slot's price, forecast and availability are shown
   and booked. A run the platform no longer sells is said to be gone.
10. **The session card** is cream: the run's times, the night, the length stepper, the
    object, the forecast, a prize or a gift code, the cost and one crimson button. On a
    phone a cream bar carries the run, its cost and the way to the card.

## Consequences

- `night-calendar.tsx`, `night-timeline.tsx`, the almanac's month events and their copy
  are deleted; `night-strip.tsx` and `time-grid.tsx` take their place on `/design-system`.
- Every visual baseline changes.
- Pricing, gifts, prizes, the waitlist and reschedule keep their contracts unchanged.
