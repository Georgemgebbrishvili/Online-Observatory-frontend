# ADR-084 — The Loyalty Club gets its surfaces

- **Date:** 2026-11-07
- **Status:** APPROVED (2026-11-07)
- **Decided by:** project maintainer (Nika), in session: the brief "Stellar — loyalty, Night Sky 3D
  and Google Play", Prompt 1, "run all of them".
- **Builds on:** platform `ADR-008` and `DV-090`…`DV-096` (the club's ledger, tiers, bonuses,
  spending at booking, referral attribution and operator adjustments, all built and live),
  `ADR-059` (the Expo app), platform `ADR-061` (the app's bearer session).
- **Supersedes:** the navigation model's `loyalty` entry as a "planned, phase 5" destination.

## Context

The platform has run the Loyalty Club since DV-090: points earned on settled payments, a tier
with a discount, a welcome and a referral bonus, points spent at booking, and operator
adjustments under audit. Rates and tiers are rows, read from `GET /loyalty/scheme`.

The clients show almost none of it. The website shows the scheme on `/pricing` and the points a
booking spent; `/app/loyalty` is a "not yet available" placeholder. The booking board never
sends `loyaltyPoints`, registration never sends `referralCode`, the operator console cannot
adjust a balance, and the app has no loyalty code at all.

## Decision

1. **Loyalty is built.** `/[locale]/app/loyalty` replaces the placeholder and leaves the
   navigation's planned group. It is called the **Club** (KA **კლუბი**) wherever a customer
   reads it, and is reached from the account menu.
2. **The club page** (web): the member card (tier, spendable balance, progress to the next
   tier as `tierPoints / nextTier.thresholdPoints` with the scheme's progress markers, or "top
   tier" and no bar); the tier ladder (threshold, discount, the current tier marked); how points
   are earned (rate, welcome bonus, referral bonus, and plainly: only settled payments raise a
   tier, bonuses never do, points do not expire); the referral code with copy, share (Web Share
   API, copy-link fallback) and the link `/[locale]/register?ref=CODE`; and the history, the
   fifty entries the platform returns, each with its kind, signed points, date, and its booking
   when it has one. Loading, empty, and platform-unreachable states; signed out, `/app` already
   sends the visitor to sign in. An unreachable platform is said plainly and no balance is shown.
3. **Spending points at booking.** The board's session card gains a "Use points" control
   showing the balance, its value in GEL at `pointsPerGelRedeemed`, and the most that can be
   spent so the total stays at or above `minimumPayableMinor`. The control steps in hundreds,
   as the contract requires. The price breakdown lists the slot price, then the tier discount,
   then the points, then the total, by the platform's own arithmetic
   (`features/booking/reserve.ts`: tier discount rounded down, points on what is left).
   Points and a voucher (a gift code or a card prize) exclude each other in the UI, because the
   contract answers 422 for both.
4. **Referral at registration.** `/register?ref=CODE` carries the code to `referralCode` and
   says "Invited by a member", with no name, because the platform returns none. Google sign-up
   cannot carry a code: `GET /auth/google/start` has no field for it. That gap is a platform
   request (`docs/platform-requests/google-sign-up-referral.md`), not worked around.
5. **Operator adjustment.** `/admin/loyalty` holds a form (customer id, signed points, reason)
   that calls `POST /admin/loyalty/adjustments` with a client-generated UUID as
   `adjustmentId`, so a retried press changes nothing. A 409 (balance below zero) and a 404
   (unknown customer) are said in words. The customer is entered by id: the contract has no
   user search, and the console does not invent one.
6. **The app's Club tab.** A tab, Club (KA კლუბი), after Collection, reads `GET /loyalty` with
   the bearer session: the member card, the tier ladder, the referral code through the native
   Share sheet, and the history. Signed out it shows the public scheme and a sign-in button.
   Measured on a 360 dp phone, five tabs truncated "Collection", so **Account moved to a header
   button** opening a page of its own (with a back bar); the bar keeps four tabs.
7. **The app sells nothing and spends nothing.** There is no purchase, redemption or "use
   points" button in the app; points are spent on the website. Google Play's payments policy
   requires its own billing for digital goods and services sold inside an app and restricts
   steering to outside payment. **The maintainer decided (2026-11-07) that a remote
   telescope session is such a digital service.** The Play build therefore shows bookings,
   captures and points but sells nothing, and must not send the user to the website's checkout:
   the app's three booking hand-offs (Tonight's "Book tonight", the Book tab, a target's page,
   all opening `/[locale]/app/book`) are removed or replaced by Google Play Billing before the
   first upload to Play.
8. **Every number comes from the scheme.** Rates, thresholds, bonuses and discounts are read
   from `/loyalty/scheme` and `/loyalty`; nothing is hard-coded, on either client.

## Consequences

- The website calls three more operations (`getMyLoyalty`, `adminAdjustLoyaltyPoints`, and the
  booking and registration fields), and the app two (`getLoyaltyScheme`, `getMyLoyalty`).
- The fake platform gains a loyalty account per user, so e2e covers the club, spending points,
  a referral registration and an adjustment.
- The app's tab bar stays at four tabs (Tonight, Book, Collection, Club); Account is the
  header's person button (evidence: `docs/evidence/mobile-club-2026-11-07/`).
- The progress and spending arithmetic lives in one tested module per client; the app
  duplicates only the progress maths, because it lives outside the npm workspaces (ADR-059).
