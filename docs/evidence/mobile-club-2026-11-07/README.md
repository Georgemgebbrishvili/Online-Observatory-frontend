# Mobile Club tab — evidence, 2026-11-07 (clients ADR-084)

The app's Club tab and Account page at 360 × 780 (a 360 dp phone), device scale 2, en-GB and
ka-GE: signed out (the public scheme and a sign-in button) and signed in (member card, referral
code, tiers, ways to earn, history), and the Account page with Delete account and Privacy policy.

How these were made: `npx expo export --platform web` with
`EXPO_PUBLIC_DARKVIEW_PLATFORM_API_URL=http://127.0.0.1:4120`, served statically, in Chrome.
The platform's answers were **stubbed in the browser** (`page.route`), because the fake platform
has no native sign-in; the stubbed shapes are the contract's (`LoyaltyScheme`, `LoyaltyAccount`,
`NativeSession`), with the same seeded club account the fake platform gives the observer. These
screenshots show layout and copy, not a platform round trip.

Tab fit, measured: with five tabs (Account as a tab) "Collection" was 72 of 72 px and drew
truncated ("COLLECT…", "კოლექ…"), so Account moved to a header button and a page of its own;
with four tabs every label fits on one line (longest: "Collection" 78 of 90 px; Georgian
"კოლექცია" 68 of 90 px).

Not shown: a native build on a real phone.
