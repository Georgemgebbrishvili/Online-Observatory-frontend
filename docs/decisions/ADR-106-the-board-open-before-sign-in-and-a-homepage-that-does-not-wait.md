# ADR-106 — The board open before sign-in, and a homepage that does not wait

- **Date:** 2026-11-25
- **Status:** APPROVED (2026-11-25)
- **Decided by:** project maintainer (Nika), in session, in a brief to make the live site a
  working product: "Let a visitor browse available slots and prices before signing in, and
  only require sign-in at checkout"; "First load takes about 4–5 s … find the biggest wins
  … blocking API calls on first render"; "/observatory shows Mount, Camera and Focuser all
  Offline … the page should say so clearly rather than look broken"; "add a config/CMS
  slot so I can drop in a real Jupiter/Moon capture … Don't fake a capture."
- **Builds on:** `ADR-074` (the booking board), `ADR-072` (lengths and prices),
  `ADR-101` (the observatory page is the console), `ADR-104`/`ADR-105` (the homepage).

## Context

On 2026-11-25 the live site's Tonight, Status, Vote, Gift, pricing and booking pages all
failed. The cause was not in this repository: the platform's database (Neon) was over its
plan's quota, the API's startup check reads the database, and so every API route answered
500 (production log: `Database error. Code: 53000 … exceeded the quota`). Nothing here
fixes that; it is the maintainer's to lift at the database's host. The four changes below
are what the same review found in this repository.

## Decision

**The booking board is open at `/book`.** A visitor without an account sees the same
board as `/app/book`: the nights, each night's quarter hours, the forecast, what is up, and
the platform's own price for the run they choose (`GET /slots`, which the platform keeps
public for exactly this). Nothing is held and nothing is charged. The board's button reads
"Sign in to book" and takes them to sign-in with their choice; signing in, or registering
where the platform signs a new account in at once, lands on `/app/book` at that slot,
length and object. A signed-out request for `/app/book` is sent to `/book`, so every
existing "Book" link works for both; a signed-in visitor at `/book` is sent to `/app/book`,
where their prizes and points are. The Collection and the weekly cards stay behind
sign-in: they are an account's own.

**`?next=` goes to one page.** Sign-in and registration accept a return address only when
it is the booking board in the visitor's language, with a query of plain characters
(`bookingReturn`). Anything else is ignored and they land on `/app` as before, so the
parameter cannot be used to send anyone to another site or another page.

**The homepage shares its prices for a minute.** The homepage read the board on every
request: about a dozen platform calls before a byte of the page. Nothing in that read
depends on who asks, so the homepage now keeps it for sixty seconds per language
(`readPricingShared`), and asks an unreachable platform again after ten. The pricing page,
the board and the checkout still read the platform on every request, so what is paid is
never a remembered figure.

**The hero's pin spacer is in the page from the start.** The scroll script wrapped the
hero in its spacer once it loaded, seconds after the first paint; the hero left the page
and came back, and the browser counted its lede as the largest paint a second time, at
four to five seconds. The spacer is now a `div` rendered with the page (`.hs-pin`, handed
to ScrollTrigger as `pinSpacer`), so the hero is never moved and the largest paint is the
first one.

**A console that has not started is on standby.** Before "Start simulation" the
observatory console listed its mount, camera and focuser as "Offline", which read as a
broken observatory. They now read "Standby", the word the picture's corner already uses.
"Offline" stays for a camera that drops during a session and for the real instrument's
link.

**A place for a real capture.** `features/home/captures.ts` lists pictures taken with this
observatory's own telescope, by object; the files live in `public/sky/captures/`. When the
hero's object has one, the hero shows it instead of the drawn feed, badges it "Real
capture" and captions it with its date, and says the sky around it is drawn. The list is
empty: no capture exists yet, and none is invented.

## Measured

Homepage, Lighthouse 12.8.2, mobile, applied throttling (`--throttling-method=devtools`:
slow 4G and a 4× slower CPU really applied), three runs each, median:

| | Performance | LCP | FCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- |
| Live site, 2026-11-25 (`f860be1` deployed, API down) | 38 | 5.2 s | 3.4 s | 2,470 ms | 0 |
| This commit, local production build, English | 67 | 2.8 s | 2.0 s | 1,510 ms | 0 |
| This commit, local production build, Georgian | 65 | 2.9 s | 2.0 s | 1,490 ms | 0.015 |

Lighthouse's default simulated mode gives the same build 4.2 s: it estimates the largest
paint from an unthrottled load, in which the lede is painted twice in the first second.
The 2.5 s target is not met in either mode; first paint waits on four stylesheets and the
fonts. A local build has no network distance to its server, and the live figure was taken
with the API down, so the two rows are not the same conditions.

## Consequences

- New route `/[locale]/book`, in the sitemap and the proxy's sections.
- `e2e/booking-public.spec.ts` (signed-out project): browse, sign in, land on the chosen
  slot; a foreign `next` ignored; Georgian. Unit tests for `bookingReturn`,
  `readPricingShared` and `heroPicture`.
- `e2e/tonight.spec.ts` follows the 2026-11-16 heading ("live from the observatory"), and
  the Night Sky's pointing test, which reads a development-only hook, is skipped against
  a production build. Both had failed on `main` since those changes.
- The first email-verified sign-in after registering does not carry the chosen slot: the
  verification link opens a new page. They land on `/app` and book from there.
- Not verified against the live API, which was down for the whole session: the live
  booking, payment and email round trip.
