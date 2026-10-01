# Platform request: a hosted demo deployment

Raised 2026-10-01 while planning hosting ([`docs/plan/hosting.md`](../plan/hosting.md)).
Against `darkview-platform` at `f2f51db`.

## What blocks

The website is live on Vercel but has no platform behind it, so nothing signed-in works.
Maintainer decision of 2026-10-01: host the platform as a **demo** first, booking end to
end on the sandbox checkout, simulated observatory only. Two platform behaviours stand in
the way.

1. **Money is refused in production.** Six places refuse the sandbox when
   `NODE_ENV === "production"`: `reserve.ts`, `payments/provider.ts`,
   `subscriptions.ts`, `vouchers.ts`, `observer-pack.ts`, and the realtime service's
   subscription charger. A hosted Next.js build is always `production`, so a hosted demo
   cannot book.
2. **Registration needs an email webhook.** `sendEmailVerification` posts to
   `EMAIL_VERIFICATION_WEBHOOK_URL` and registration is refused without it. Nothing
   receives that webhook yet.

## Proposed shape

1. `DARKVIEW_DEPLOYMENT`: `production` (default) or `demo`, in both services' environment
   schemas. In `demo`:
   - the six guards allow the sandbox provider, as in development;
   - `setObservatoryMode` refuses `REAL`, and both services refuse to start if any
     observatory is in `REAL` mode — a demo never commands hardware;
   - nothing else changes: cookies stay `__Host-` and `Secure`, every other production
     check holds.
   A decision record (ADR-035) states this and that it is undone for the real launch.
2. `RESEND_API_KEY` + `EMAIL_FROM`: when set, `sendEmailVerification` sends the
   verification email through Resend's HTTP API itself, in the customer's locale (en, ka).
   The webhook stays the alternative; either is enough for registration. The nine
   notification kinds are untouched: unset `NOTIFICATION_WEBHOOK_URL` leaves them queued
   in the outbox, as the runbook documents. Their wording is a later change.

No contract change: no operation, schema or field moves.

## What it unblocks

Every signed-in screen on the hosted site, and the whole booking loop (slices 2–4 and the
reschedule) against the real platform instead of `e2e/fake-platform.mjs`.
