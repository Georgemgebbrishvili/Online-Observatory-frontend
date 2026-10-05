# Platform request: reset a forgotten password, and change a known one

Raised 2026-10-05 for roadmap slice C1, which C4 (account and profile, DV-079) waits on.
ADR-016 lists password reset under "what this record deliberately does not decide". It
should be decided before launch, because a customer who forgets their password has no
way back into their bookings and their Collection.

## What blocks

The contract has `register`, `verifyEmail`, `signIn`, `signOut` and `getCurrentUser`.
Nothing lets a signed-out customer recover their account, and nothing lets a signed-in
one change their password.

## Screens that need it

- `/{locale}/sign-in`: a "Forgot your password?" link.
- `/{locale}/reset-password`: the email form, and the "check your inbox" answer.
- `/{locale}/reset-password/{token}`: the new password form. It matches
  `/{locale}/verify-email/{token}`, which the verification link already uses.
- `/{locale}/app/profile` (C4): change the password while signed in.

## Proposed shape

Each follows ADR-016: the exact Origin check on every `POST`, no token in a response
body, `429 RATE_LIMITED` under `AUTHENTICATION_POLICY`, and an `AuthEventType` audit row.

- `POST /auth/password-reset` with `{ email, locale }` answers **202** whether or not the
  address holds an account, as `register` does. A verified account is sent a link to
  `APP_URL/{locale}/reset-password/{token}`. An unverified one is sent its verification
  link instead, since a reset would verify an address nobody has proved.
- `POST /auth/password-reset/confirm` with `{ token, password }`. The token is
  single-use and expires thirty minutes after it was sent, like a verification token.
  It answers **200** with `User` and sets the session cookies. Every other session the
  user held ends, as `verifyEmail` does. An expired or used token is a 4xx the client
  can tell apart from a validation error, so the page can offer a fresh link.
- `POST /me/password` with `{ currentPassword, password }`. It answers **204**, and it
  ends every other session. A wrong current password is the same 401, and takes the
  same time, as a wrong sign-in.

`password` keeps `RegisterRequest`'s bounds: 12 to 128 characters.

## The email

The reset email has to send in every deployment where sign-in exists. The hosted demo
sends only the verification email through Resend (hosting decision of 2026-10-01). Reset
would be the second email it sends, in both languages.

## Until then

The client builds nothing for it, and the sign-in page offers no reset link.
