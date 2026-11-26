# ADR-109: The observatory unnamed, and a compact app home

- **Status:** Accepted
- **Date:** 2026-11-26
- **Decided by:** the maintainer, in session: "delete Tbilisi from everywhere. nobody should
  know where our telescope is located and which telescope we are using", and for `/app`:
  "better visuals, more compact, efficient use of space. no big free spaces."
- **Amends:** ADR-070 (the Astroman line named the telescope), ADR-107 (the homepage named
  the telescopes its real views came through), `CLAUDE.md` "Product" for customer copy

## Decision

**No page says where the observatory is or which telescope and camera it uses.**

1. The observatory is "Stellar Observatory" / "სტელარის ობსერვატორია". No page names a
   city, a maker, a model or the instrument's aperture, focal length or sensor.
2. Optics are named by focal ratio only (f/6.3, f/10, f/20). The camera is a "colour
   astronomy camera". The console's Setup tab keeps the design and the mount type and
   drops aperture, focal length, resolving power, sensor and elevation.
3. The homepage's real views stay credited to their authors under their licences, as the
   licences require, but the copy no longer names the telescopes they were taken through.
4. The Night Sky's default place and clock read "Observatory" and "Observatory time".
5. The draft legal pages drop the city; the weekly card draw runs on Georgian time
   (GMT+4). These drafts still need the maintainer's lawyer.
6. The platform's data for the live observatory carries the same names (set directly
   in its database on 2026-11-26).

**The app home is one dense grid.** Tonight's recommendation, or why there is none, sits
beside a column of the observatory's status over the upcoming sessions; the weekly cards
and the Collection share the row under them. An empty section says so in a line, not in
a panel. The telescope's size is no longer shown.

## Not covered

- The platform's horizon endpoint returns the site to a tenth of a degree, and its
  observatory record carries the IANA time zone. Both are platform contract.
- Internal code, comments and decision records in the public repository still name the
  city and the instrument.
