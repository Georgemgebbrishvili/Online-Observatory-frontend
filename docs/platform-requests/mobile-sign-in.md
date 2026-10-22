# Platform request: a native client can sign in

Raised 2026-10-22 when the mobile application started (ADR-059).

## What blocks

ADR-016 §3 refuses any mutation whose `Origin` is not exactly `APP_URL`, and refuses a
missing `Origin`. A React Native request sends no `Origin`. So the mobile app cannot call
`signIn`, `register`, `createBooking`, `startMissionSession` or any other mutation, and
without a session it cannot read `/me`, `/bookings`, `/missions` or `/captures`. ADR-016
deferred this decision "until the mobile client is integrated". That is now.

The realtime mission channel has the same problem: it reads the session cookie.

## Screens that need it

Every signed-in screen in the app: sign in and register, bookings, the live room,
the collection, the profile. DV-083 cannot start without it.

## Options

1. **A device session with a bearer token** (proposed). `POST /auth/sign-in` with a
   `client: "native"` field answers with an opaque token instead of setting cookies. The
   API and realtime accept `Authorization: Bearer <token>` and skip the `Origin` check
   for that credential only, because a bearer token is not sent by a browser on its own
   and so is not exposed to CSRF. The token is a session row like any other (same
   lifetime, revoked by sign-out), and the app keeps it in the platform keychain
   (`expo-secure-store`). Google sign-in for the app would use the same token, issued at
   the end of the callback through a deep link.
2. **A fixed native `Origin`.** The app sends `Origin: stellar-app://`, which the API
   allows. Any non-browser client can forge it, so it adds nothing and weakens §3.
3. **Platform attestation** (App Attest, Play Integrity). Strongest, but tied to store
   builds that do not exist yet, and needs Apple enrolment.

## Proposed contract shape (option 1)

```yaml
components:
  securitySchemes:
    deviceSession:
      type: http
      scheme: bearer
      description: A native client's session token, from signIn with client "native".
# SignInRequest gains:
client: { type: string, enum: [web, native], default: web }
# signIn 200, when client is native, answers:
NativeSession:
  type: object
  additionalProperties: false
  required: [user, token, expiresAt]
  properties:
    user: { $ref: '#/components/schemas/User' }
    token: { type: string }
    expiresAt: { type: string, format: date-time }
```

Each authenticated operation then lists `security: [{ userSession: [] }, { deviceSession: [] }]`.

## What this does not ask for

No change to the web's cookies or its `Origin` check. No new service.
