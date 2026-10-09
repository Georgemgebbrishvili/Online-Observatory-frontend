# Sign-in: an unverified address refused with its own code

- **Filed:** 2026-10-09, from the hosted demo walkthrough of 2026-10-08
- **Platform:** PR #187, `EMAIL_UNVERIFIED` added to `ErrorCode`; sign-in answers it
  with 403 once the password has been checked

## The screen that needs it

The sign-in form (`features/auth/actions.ts`). It read every 403 from `/auth/sign-in`
as "verify your email before signing in", because that was the only 403 the route
documented. The Origin refusal is a 403 too, and during the demo's misrouted-proxy
incident every visitor was told to go verify an address that was verified.

## The shape

No field changes. `ErrorCode` gains `EMAIL_UNVERIFIED`; `/auth/sign-in`'s 403 carries it
for the unverified case and `FORBIDDEN` for the Origin refusal. The form reads the code,
not the status: `EMAIL_UNVERIFIED` is the verify-first message, anything else is the
"temporarily unavailable" message the rest of the form already uses for a refusal the
visitor cannot fix.

## What it blocks

Nothing on its own; it stops the form lying about the cause of a refusal.
