# ADR-075 — Skychaser Again, a Board That Opens Ready, and a Fuller Homepage

- **Date:** 2026-10-25
- **Status:** APPROVED (maintainer, in session, 2026-10-25: "now lets take typography and
  design systems from skychaser website and implement in stellar astroman. make booking
  easier and more content on the main page"; asked whether to keep the crimson colours,
  he chose "Full Skychaser look")
- **Decided by:** project maintainer
- **Supersedes:** ADR-074 §1–5 (Crimson). ADR-074 §6–10, the booking board of quarter
  hours, stand.
- **Relates to:** ADR-052 (the Skychaser visuals), ADR-055 (the console's blue, retired
  again), ADR-068, ADR-072, ADR-074

## Decision

### Skychaser's design system, as skychaser.io runs it today

1. **Ground, ink and type are ADR-052's again:** canvas `#0d0d0d`, ink `#f4f4f2`, the
   red `#e3482c`; Anton titles in capitals, Oswald for tracked labels, nav and buttons,
   Geist for reading, JetBrains Mono for data.
2. **Skychaser's newer pieces join it:**
   - the poster button: vermilion (`#d9442a` to `#b8321f`) with cream letters
     (`#fff1d6`) and a hard 3px print shadow (`--gradient-poster`, `--shadow-poster`);
   - buttons and chips at 10px;
   - data rows with a dotted leader from label to value;
   - the cream card stock (`#efe3c4` with ink `#2b1b12`) for the session ticket and the
     price list.
3. **The observatory console and the live room** take Skychaser's own console colours,
   the red and near-black of its /node, rather than NASA blue.

### Booking, easier

4. **The board opens ready.** With no start in the address it chooses the next clear
   start (forecast 30% cloud or less) with room for the address's length, else the next
   free one, and says so. One press reserves it; any tap changes it.
5. **Quick lengths.** Beside − and +, the session ticket offers 30 min, 1 h, 2 h and 4 h;
   a length that would cross a booking or dawn stops there and says why.
6. **Numbered steps:** 01 Night, 02 the night's time, 03 Object.

### The homepage

7. Under the four cards, six chapters: tonight's targets (the platform's list, drawn,
   captioned as illustrations); booking in three taps beside what 15 min, 30 min, 1 h and
   2 h cost (the platform's price by the minute, ADR-072); what a session shows (live view
   and live stacking, plainly not long-exposure astrophotography); the other ways in
   (vote, gift, Explorer, weekly cards); four questions; and a last call.

## Consequences

- Every visual baseline changes again.
- `target-art.css` holds the drawn objects' colours so any page can draw them.
