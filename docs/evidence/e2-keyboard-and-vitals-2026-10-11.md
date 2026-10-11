# E2 — keyboard, structure and Core Web Vitals pass, 2026-10-11

Roadmap Track E2's hand half. The automated half, axe on every route in both languages at
390 and 1440, already runs on each CI run (`e2e/a11y.spec.ts`). This pass covers what axe
cannot: where keyboard focus goes, whether it can be seen, and how fast the live site
loads on a phone.

## Scope and method

- **Keyboard walk.** A Playwright script against the local stack (`fake-platform.mjs`,
  `next dev`) pressed Tab through 32 routes — public, signed-out, the customer's app and
  the operator's admin — in English and Georgian at 390 and 1440: 128 page loads, 2,159
  focus stops. At each stop it recorded the element, whether a focus ring was drawn,
  whether the element was hidden, zero-sized, off-screen or covered by another element,
  and whether Tab moved on. Per page it recorded the `h1`s, heading-level skips, `main`
  landmarks, unnamed navigation landmarks and `html[lang]`.
- **Widgets.** A second script drove the interactive pieces by keyboard alone: sign-in,
  the phone room's hand-control sheet, a nudge, Stop and its question, sharing, the
  design system's modal, tabs and dropdown.
- **Core Web Vitals.** Lighthouse 13.5 (mobile, simulated slow 4G) against
  `https://stellar.astroman.ge`, the public pages in both languages.

The scripts are not in the repository; the regressions they found are now e2e tests (see
below).

## What was right

- Every one of the 128 pages starts with the skip link, has exactly one `h1` and one
  `main`, has no heading-level skips and carries the right `lang`.
- No page traps focus. Dialogs (the modal, the hand-control sheet) take focus when they
  open and return it to their trigger on Escape. Tabs move with the arrow keys and End.
  The dropdown opens with Enter and closes with Escape. Sign-in submits with Enter from
  the password field.
- Lighthouse accessibility is 100 on every page measured; CLS is 0 everywhere.

## Defects found and fixed

| #   | Defect                                                                                                                                                                   | Where                                                                                                 | Fix                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | On a phone, a control reached by Tab could sit under the fixed bottom bar or the room's dock (WCAG 2.2 2.4.11, focus not obscured)                                       | `/app/book`, `/app/collection`, `/app/profile`, `/app/missions`, a booking — 9 pages × both languages | `scroll-padding-block` on the app shell for the sticky header and bottom bar, and more at the room's dock |
| 2   | A nudge disabled the pad while it waited, and a disabled button drops focus to the page: a keyboard user lost their place after every nudge                              | Hand control, desk and sheet                                                                          | The pad is `aria-disabled` while locked, still focusable; a press is ignored until the verdict            |
| 3   | Stop swapped itself for its question, and focus fell to the page                                                                                                         | Session panel                                                                                         | Focus moves to the question, and back to Stop when the observation is kept                                |
| 4   | "Let others watch" and "Stop sharing" were replaced by the next controls, and focus fell to the page                                                                     | Sharing panel                                                                                         | Focus moves to the control that replaced the one pressed                                                  |
| 5   | Every row's toggle was named "Disable" or "Enable"; a list of buttons said nothing about which target                                                                    | `/admin/targets`                                                                                      | Each is named for its row: "Disable: Saturn"                                                              |
| 6   | Zod probes `new Function("")`; the site's CSP refuses eval, so every page that validates in the browser logged a CSP violation (Lighthouse best practices 96 on sign-in) | Live sign-in                                                                                          | `instrumentation-client.ts` sets Zod's `jitless`; a production build shows no CSP issue                   |

Regressions are in `e2e/room-controls.spec.ts` (the keyboard keeps its place through a
nudge and the stop question) and `e2e/room-sharing.spec.ts` (focus follows opening and
closing).

## Findings that were not defects

- "No focus ring" on the homepage's tonight list and the app home's next night: the ring
  is drawn on the row or card with `:focus-within`, which the script could not see.
  Checked by screenshot.
- The profile's checkbox input is transparent; its ring is drawn on the visible box beside
  it.
- Two captures of one target are both named "Hercules Cluster" on the app home. They are
  two different links; the names could carry the capture time. Not changed.
- Tab out of an open `<dialog>` reaches the browser's own toolbar, then the dialog again —
  native modal behaviour; the page behind is never reached.

## Core Web Vitals (lab)

| Page                 | Performance | LCP   | TBT    | CLS |
| -------------------- | ----------- | ----- | ------ | --- |
| `/en` (warm)         | 72          | 3.7 s | 680 ms | 0   |
| `/ka` (warm)         | 80          | 3.3 s | 490 ms | 0   |
| `/en/observatory`    | 87          | 3.3 s | 250 ms | 0   |
| `/ka/observatory`    | 87          | 3.2 s | 280 ms | 0   |
| `/en/pricing`        | 92          | 3.2 s | 100 ms | 0   |
| `/en/status`         | 86          | 3.3 s | 270 ms | 0   |
| `/en/sign-in` (warm) | 84          | 3.3 s | 370 ms | 0   |

- LCP is over the 2.5 s "good" line on every page under simulated slow 4G. Observed
  without throttling, the homepage's LCP is about 1.4 s: 0.4 s to first byte and about
  1 s of render delay on the hero paragraph while its web font arrives. About 420 ms of
  render-blocking CSS and about 50 KiB of unused JavaScript are the larger levers.
- **The first visit after the site has been idle took 12 s to the first byte.** Every
  request goes through the Fly proxy, and the demo's Fly machine stops when idle
  (`auto_stop`, no minimum running) — the free-tier choice of 2026-10-08. Warm, the
  first byte comes in about 0.4 s. Keeping one machine running would remove the wait,
  at a cost; it is the maintainer's decision.
- TBT varied between runs by several hundred milliseconds with the machine's load; the
  numbers above are single runs, not medians.
- These are lab figures. Field data needs real visitors and a RUM source, which the site
  does not have.

## Not covered

- A real screen reader (VoiceOver, NVDA, TalkBack). Landmarks, headings and names were
  read from the DOM, not heard.
- Safari and iOS. The 2026-10-07 audit's WebKit keyboard finding on `/status` was fixed
  then; this pass ran in Chrome only.
- Shift+Tab. The walk moved forward; the scroll padding covers the header for the reverse
  direction, but it was not walked.
- The signed-in pages on the live site: the demo's accounts were not used from this
  session. Their vitals were not measured.
