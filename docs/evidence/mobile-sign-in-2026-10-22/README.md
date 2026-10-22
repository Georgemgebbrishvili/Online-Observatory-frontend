# Mobile sign-in — evidence, 2026-10-22

The Account tab signing in with ADR-061's bearer session, against the real platform API
at 475b1b5 (not the e2e fake): `next dev` on port 4020 from a worktree of that commit,
on a scratch PostgreSQL with the development seed, `DARKVIEW_DEPLOYMENT=demo`. The demo
account and its password are the seed's published development-only ones.

The app is the web export (`EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL=http://127.0.0.1:4020`)
in Chrome at 390 × 844. The API sends no CORS headers (ADR-061 relies on that), so the
browser run answers the preflight in Playwright; a phone's request needs neither.

- `account-*-signed-out.png`: the form.
- `account-*-wrong-password.png`: 401, "Email or password is incorrect."
- `account-*-signed-in.png`: GET /bookings with `Authorization: Bearer`, the two seeded
  nights named from the public catalogue.
- After "Sign out" the form returns (POST /auth/sign-out with the bearer, 204).

Over curl, the same API: native sign-in with no Origin 200 and no Set-Cookie; /me with
the bearer 200, with `Basic` 401; the web sign-in with no Origin 403; sign-out with the
bearer 204, then /me 401.

Not shown: the keychain (`expo-secure-store`), which the web build does not have; it
keeps the token in memory there.
