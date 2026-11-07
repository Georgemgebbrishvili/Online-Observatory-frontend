# A referral code through Google sign-up

- **Filed:** 2026-11-07, while building the Loyalty Club's surfaces (clients ADR-084)
- **Platform:** DV-096 (referral attribution on `POST /auth/register`), ADR-048
  (`GET /auth/google/start`, `GET /auth/google/callback`)

## The screen that needs it

`/register?ref=CODE`. A visitor who arrives on a member's link and registers with email and
password carries the code in `RegisterRequest.referralCode`, and both get the referral bonus
after the first paid booking. The same visitor pressing "Continue with Google" loses it:
`GET /auth/google/start` takes only `locale`, and a Google account is created in the callback
with no referral.

## The proposed shape

An optional query parameter on the start, kept in the signed OAuth `state` the platform
already round-trips, and applied only when the callback creates a new user:

```yaml
/auth/google/start:
  get:
    parameters:
      - name: referralCode
        in: query
        required: false
        schema: { type: string, minLength: 6, maxLength: 16 }
        description: |
          DV-096, as on RegisterRequest. Applied only when the callback creates the
          account; ignored for an existing one, and an unknown code is ignored.
```

The client then appends `&referralCode=CODE` to the Google link on `/register?ref=CODE`.

## What it blocks

Nothing is broken; a referred visitor who chooses Google simply earns no referral bonus. Until
this ships the client does not work around it: the Google link carries no code.
