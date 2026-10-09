# Sign in with Google

- **Filed:** 2026-10-09, on the maintainer's instruction ("I need Google auth also,
  simple login") after the hosted demo refused registration for want of an email sender
- **Platform:** ADR-048, `GET /auth/google/start` and `GET /auth/google/callback`

## The screens that need it

Sign-in and registration. Both get a "Continue with Google" link above the fields; the
sign-in page also reads `?error=google`, where every Google failure lands.

## The shape

Two navigations, no JSON. The link goes to `/api/auth/google/start?locale={locale}`; the
platform sends the browser to Google and back to `/api/auth/google/callback`, exchanges
the code itself, and answers 303 to `/{locale}/app` with the session cookies set, or to
`/{locale}/sign-in?error=google`. The client holds no Google id, no secret and no Google
script; the CSP is unchanged.

## What it blocks

Any sign-in on the hosted demo by someone without a demo account, until Resend is set up
for password registration.

## Configuration, the maintainer's

A "Web application" OAuth client in Google Cloud with the authorised redirect URI
`https://stellar.astroman.ge/api/auth/google/callback` (and
`http://localhost:3000/api/auth/google/callback` for development), set on the platform
API as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
