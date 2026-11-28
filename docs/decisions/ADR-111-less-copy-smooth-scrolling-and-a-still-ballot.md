# ADR-111: Less copy, smooth scrolling everywhere, and a ballot that does not jump

- **Status:** Accepted
- **Date:** 2026-11-28
- **Decided by:** the maintainer, in session: "polish the website, all pages, and make
  visual upgrades, delete additional and extra texts, and make smooth scrolling and fast
  loading on all pages".
- **Amends:** the pricing page (its guide and its "later" note), the status page, the gift
  page, the ballot's card layout and the observatory console's autopilot steps

## Decision

**Copy that repeats the page or has gone out of date is removed.**

- `/pricing`: "Prices may change before launch." (the site takes real payments since
  2026-11-26), the "Later" note about subscriptions and passes, and the guide's six
  "Included with every slot" cards, which repeated the "Your own slot" list above them.
  The guide keeps its heading, the questions and the closing call.
- `/status`: "Last completed observation", which showed a simulator date from August,
  and the forecast's "For guidance only" sentence.
- `/gift`: "You need an account to pay. They need one to book." under "Sign in to buy a
  gift", which says the same.

Captions that say a picture is an illustration, a game image or another observer's photo
stay: they keep the page honest (ADR-107).

**Every page scrolls smoothly on a fine pointer.** `SmoothScroll` (the root layout) starts
Lenis after the page loads on every page that does not scroll itself. The homepage keeps
its own Lenis, tied to its scenes; `/observatory`, `/sky`, the game, the live room, the
session and watch views and the operator's telescope pages keep the browser's wheel,
which they use for zoom and controls. Touch keeps the phone's own scrolling, and reduced
motion keeps the browser's. In-page links glide (`scroll-behavior: smooth`), land below the
sticky header (`scroll-padding-top`), and navigation between pages stays instant
(`data-scroll-behavior="smooth"`, Next 16).

**The ballot does not jump.** A card's name now sits above its type tag. Side by side, the
tag wrapped to a second line whenever the name ran long, and before Anton arrived its
fallback ran long on nearly every card, so the whole ballot moved down 27 px when the font
loaded (layout shift 0.151 on a phone; now under 0.001).

**The autopilot's step names never break inside a word.** "CENTE / R" was English breaking
at any letter in a fifth of the card; every other step now sits a line lower, as the
Georgian names already did. A target tile's long name hyphenates instead.

## Measured

Before, on the live site (Pixel 7 profile, 4x CPU slowdown, 150 ms latency): largest paint
under 1 s on most pages, 1.8 to 2.4 s on the homepage, `/observatory` and `/gift`; scrolling
held 60 fps on every page but the homepage (two frames over 50 ms). Loading was already
within "good"; the gains here are the ballot's stillness and the smoother wheel.
