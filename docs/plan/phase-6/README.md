# Phase 6 — making Stellar stronger

Written 2026-10-22. Ten slices, each run as one Claude Code session from
`part-2-clients`. Every slice that changes product scope opens with an ADR, and every
server need starts as a request in `docs/platform-requests/` and is built in
`../part-1-platform` under its own `CLAUDE.md`.

## How to run it

Paste the **driver prompt** into a new session. It reads this file, picks the first slice
whose status is not `Done`, and runs that slice's prompt. You can also paste a slice prompt
directly to run one out of order.

### Driver prompt

```
Open docs/plan/phase-6/README.md. Read "Shared rules", then find the first slice in the
status table that is not Done and whose "Waits on" is satisfied. Tell me which slice you
picked and why, then run its prompt exactly. When the slice is finished, update its row in
the status table (state, commits, date) and stop. Do not start a second slice.
```

## Status

| #   | Slice                                  | Waits on                    | State   | Commits |
| --- | -------------------------------------- | --------------------------- | ------- | ------- |
| 6.0 | Stabilise the demo and see errors      | —                           | Done 2026-10-23 | platform 9f61cbb (#202); clients 7650a1d 6516c2e 0f7c938 |
| 6.1 | Live frames while OBSERVING (#199)     | 6.0                         | Done 2026-10-23 | platform 460c0c5 (#203); clients 28c32ab 912cc1c f9424d2 2c3fb8d |
| 6.2 | Reconnect states and the live sky chart| 6.1                         | Done 2026-10-23 | platform 46ef178 (#205); clients cf4d2a8 7d81f80 86618b8 |
| 6.3 | Shareable captures                     | 6.0                         | Done 2026-10-23 | platform e2e3694 (#206); clients 230743a 1673ec9 3eab8a7 (ADR-065) |
| 6.4 | Public "Tonight, live" page            | 6.1, 6.3                    | Done 2026-10-23 | platform 960ba41 (#207); clients 1d6db74 2584448 446d7f1 0f60057 a57944a 972811f (ADR-066) |
| 6.5 | Gift a night                           | 6.0                         | Done 2026-10-23 | platform ba88985 (#208); clients 1ebdec3 45263a2 1a98c9c d5bc14f + baselines (ADR-067) |
| 6.6 | Weather-aware booking and push         | 6.0                         | Done 2026-10-23, push deferred | platform f2bb15b (#209); clients 4520948 49a6e39 8340db2 (ADR-068) |
| 6.7 | Target guide, frame labels, stack clip | 6.1                         | Guide done 2026-10-23; labels and clip deferred | clients 75f585a (ADR-069) |
| 6.8 | Schools, observer log, Astroman tie-in | 6.3, 6.5                    | Done 2026-10-23, lean | clients ad8570a (ADR-070) |
| 6.9 | Video transport upgrade                | 6.1, 6.4, hardware measured | Waits for the camera | clients da9f803 (ADR-071, what to measure) |
| 6.10| Front-end quality and engineering upkeep | —                         | Mostly done 2026-10-23 | clients c815fb3 a1fc8e3 bea51ad 8d63efe e57d732 |

Also on 2026-10-23, outside the slices: Next.js 16.4.0 → 16.4.2 in both repositories for
three advisories, one a critical unauthenticated remote code execution (clients f78fa62,
platform 1a4dc42 #204). Notes from the run: 6.0's DB move had already been done on
2026-10-22 (Neon); 6.1's live cadence on an overloaded laptop missed the bar and is
re-measured in 6.9; site-wide, an unknown page answers 200 with a not-found body (6.10).
6.4's spectator view caps at twenty and was fan-out tested on the realtime service with ten
observers. 6.5 found the platform already sold gift vouchers (DV-112); it added only the
sandbox checkout for them and the buyer's view of the code. The phone app sells no gift:
its Book tab hands over to the website, where the code is redeemed.

From 6.6 on, the maintainer asked for a lean product ("simple and sophisticated, less
code"), so each slice built its smallest useful part and deferred the rest in its ADR:
push notifications (ADR-068 §4); frame labels and the stack clip (ADR-069 §2); group
booking, worksheets and prints (ADR-070); a new video transport until the camera is
measured (ADR-071). In 6.10, still open: the offline Collection (a service worker), the
manual screen-reader and Safari pass, and formatting the 243 files with Prettier plus its
CI check -- left until no other session is editing the tree, since it touches most files.

## Shared rules

Every slice prompt says "Follow the shared rules". They are:

1. `CLAUDE.md` in each repository outranks this file. Read it first.
2. Read the memory index and the latest `state-*` memory before touching anything; another
   session may share the tree. Commit only your own paths; check `git log origin/main..`
   before asking to push.
3. **Surface loop** for every screen: states listed (loading, empty, error, agent offline,
   weather hold, simulated, success) in English and Georgian; contract trace against
   `packages/contracts/openapi.yaml` and the platform handler; build on `npm run dev:stack`;
   shell contract and visual baselines in both languages; adversarial review; commit on
   `main`.
4. **A missing field or endpoint is never invented here.** Write
   `docs/platform-requests/<name>.md`, file it on the platform (from Rezimod), build it in
   `../part-1-platform` on a branch as Beka (ADR-033), get CI green and the maintainer's
   approval to merge, then `npm run contracts:sync -- <sha>` here as its own commit.
5. **Product scope changes need an ADR** in `docs/decisions/`, status PROPOSED, and the
   maintainer's approval before building.
6. New components appear on `/design-system` in all their states before a page uses them.
7. Phase 1 is live view and EAA. No copy implies long-exposure astrophotography. Rendered
   or drawn objects are captioned "Illustration — not telescope output"; a simulated
   stream is badged "Simulated".
8. No new services (Redis, queues, Kubernetes, GraphQL) without a measured need and the
   maintainer's approval. Any external account (Sentry, push, payments, email) is the
   maintainer's to create; ask, never sign up.
9. Simulator only. No session commands the real mount or camera.
10. Commits are authored by George Mgebrishvili, with no tool attribution of any kind.
    Pushing and deploying are approved per push, per deploy.
11. Finish with: what shipped, the evidence (tests, screenshots), risks, and a merge
    verdict with copy-paste commands using absolute paths.

---

## 6.0 Stabilise the demo and see errors

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.0.

Goal: the live demo stays up on a free database plan, and we hear about errors before a
customer does.

1. Platform: finish the branch fix/idle-db-operations (worktree
   part-1-worktrees/idle-db): heartbeats no longer write AgentMessage rows, and the demo
   sweeps slowly. Add a test that proves an idle hour writes fewer than N rows (pick N from
   a measurement and say how you measured it). CI green, then ask to merge.
2. Write a handover script for the maintainer to point Vercel stellar-platform and the Fly
   realtime secret at the new free database, migrate, seed the demo, and redeploy. Do not
   run production steps yourself.
3. Error monitoring: propose one tool (Sentry or similar free tier) in an ADR covering
   web, API, realtime and the agent, with what is scrubbed (no tokens, emails or
   payment data). Wire it behind env vars so nothing is sent when unset. The maintainer
   creates the account.
4. /status: show uptime history for the last 30 days from data the platform already has,
   or a platform request if it has none.

Done when: idle-hour test passes, the handover script is reviewed, errors from a forced
failure in dev appear in the tool's local or test mode, /status shows history in en and
ka with baselines.
```

## 6.1 Live frames while OBSERVING (#199)

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.1.

Goal: the observer sees a live, updating picture for the whole OBSERVING phase, not only
during VERIFYING and CAPTURING.

Read docs/platform-requests/observing-live-view.md and platform issue #199 first.

1. Platform: the agent's _do_observing streams live-stack frames at a steady rate with
   frame metadata (exposure, gain, stack count, timestamp); realtime stops dropping them
   after 30 s. pytest for the agent, integration tests for realtime. Simulator only.
2. Web room and watch page, mobile live room: show the stack count and exposure next to
   the feed, and the "Simulated" badge on a simulated stream.
3. Evidence: a recorded session on dev:stack showing frames for the full OBSERVING
   window, in web and in the mobile web export.

Done when: a 10-minute simulated session has no gap longer than 3 frame intervals, and
all three clients show it.
```

## 6.2 Reconnect states and the live sky chart

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.2.

Goal: the room never looks frozen, and the wait during a slew is worth watching.

1. Reconnect: when the WebSocket drops, the feed shows "Reconnecting…" with the last
   frame dimmed, then recovers without a reload. Same on mobile. Playwright test that kills
   the socket mid-session.
2. Sky chart: a sky chart of Tbilisi's sky for the slot time, with the telescope's
   current pointing (from contract telemetry only) and the target, moving during
   SLEWING. Horizon mask drawn. Captioned "Illustration — not telescope output". Respect
   reduced motion. If pointing is not in the contract, platform request first
   (docs/platform-requests/mission-pointing.md may already cover it — check).
3. Both on /design-system in every state, then in the room.

Done when: both work on dev:stack in en and ka at 390 and 1440, with baselines.
```

## 6.3 Shareable captures

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.3.

Goal: a customer can make a capture public and share a link that looks good on social
media.

Read docs/platform-requests/capture-visibility.md (answered by platform #158, never
wired) and ADR-007.

1. ADR: what a public capture page shows (image, target, date, Tbilisi, exposure, stack
   count, observer's chosen name or none) and what it never shows (email, booking, price).
2. Collection detail: Make public / Make private, Copy link, native share on mobile.
3. Public page /[locale]/c/[captureId] (or a name the ADR picks), no sign-in, with an
   Open Graph image generated per capture, and a "Book your own night" call to action.
   A private capture returns 404, not 403.
4. Mobile: share button on the capture detail.

Done when: e2e covers public, private and deleted captures; OG image renders in both
languages; baselines taken.
```

## 6.4 Public "Tonight, live" page

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.4.

Goal: anyone can watch tonight's session for free, at lower quality and with no controls,
and is invited to book.

1. ADR: consent (the session owner opts in, default off), what spectators see (feed,
   target, mission state, no names), quality cap, spectator limit, and how this differs
   from paid observer seats (ADR-036).
2. Platform: a public, read-only spectator stream and view; rate limits; the owner's
   opt-in on the booking. Load-test the realtime fan-out with ten observers plus the
   spectator cap.
3. Web /tonight (name per ADR) and a home-page entry when a session is live; mobile
   Tonight tab shows it. Offline, weather hold and no-session states.

Done when: the fan-out test passes at the cap, the page works logged out in en and ka,
baselines taken.
```

## 6.5 Gift a night

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.5.

Goal: someone buys a night as a gift; the recipient redeems it at booking.

1. ADR: what a gift is (one slot or an amount), expiry, refunds, what the recipient
   sees, and how it reuses the card-draw voucher machinery (ADR-058 / platform ADR-060).
2. Platform: gift purchase through the existing checkout adapter (sandbox until the real
   payment adapter lands), a gift code, redemption on the booking. Email to the buyer via
   the ADR-062 outbox if it is merged.
3. Web: /gift purchase page, a printable gift card (PDF or page), redeem field on the
   booking board. Mobile: redeem only.

Done when: buy -> redeem -> book works end to end on the sandbox checkout, with e2e and
baselines in both languages.
```

## 6.6 Weather-aware booking and push

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.6.

Goal: customers book clear nights, recover quickly from bad ones, and hear about it on
their phone.

1. Booking board: cloud forecast per slot (the platform already has a cloud median for
   tonight; request per-slot forecast if missing), plainly labelled as a forecast.
2. Waitlist: join a full slot; when it frees, the first in line is notified and holds it
   for a short time. Platform request + build.
3. After a weather hold: one-tap rebooking to the next clear slot.
4. Push on mobile (Expo notifications): slot in 15 minutes, weather hold, capture
   ready, waitlist slot free, card prize. Platform stores device tokens on the native
   session (ADR-061). The maintainer creates any push credentials.

Done when: each notification fires on dev:stack and lands in the mobile web export's
notification log or a device; e2e for waitlist and rebooking.
```

## 6.7 Target guide, frame labels, stack clip

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.7.

Goal: the customer understands what they are looking at.

1. Target guide: for each operator-approved target, short en/ka text (what it is,
   distance, what the live view will and will not show). Authored content checked by the
   maintainer, stored where targets live on the platform. Shown in the room during
   SLEWING and OBSERVING and on the target page. No AI-generated facts in this slice.
2. Frame labels: the agent plate-solves captures (astrometry.net or equivalent, local,
   no network dependency during a session) and the platform stores the catalogue objects
   in frame. The capture page draws labels as an overlay that can be turned off. Agent
   work is simulator-tested only.
3. Stack clip: the platform keeps a few frames as the stack builds and makes a short
   clip; the capture page plays it. Check storage cost on the free tier first.

Done when: all three show on dev:stack for at least three simulated targets in en and ka.
```

## 6.8 Schools, observer log, Astroman tie-in

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.8. Split into three
commits; each starts with its own ADR.

1. Schools: a group booking a teacher makes for a class, a presenter view for a
   projector (large feed, no controls clutter), and a printable Georgian worksheet per
   target. Uses ten-observer seats (ADR-036).
2. Observer log: progress on the Collection — Messier list, planets, first galaxy, etc.
   Quiet visual language per ADR-052, no cartoon badges, derived from captures only.
3. Astroman tie-in: on target and capture pages, "Seen through a Celestron NexStar 8SE"
   linking to astroman.ge; optional printed capture ordered through Astroman. No
   checkout here for prints unless the ADR says how.

Done when: each part has e2e and baselines in both languages.
```

## 6.9 Video transport upgrade

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.9.

Goal: sharper live video, less bandwidth, more viewers, and simpler mobile code than
hand-parsed MJPEG.

1. Measure first: bandwidth, latency and CPU of today's MJPEG path on the simulator and,
   when available, the ASI585MC on the mini-PC. Write the numbers down.
2. ADR comparing WebRTC (via a small SFU) and low-latency HLS against those numbers,
   including cost, the "no inbound connection to the observatory" rule (the agent still
   dials out), and the "no extra services without measured need" rule.
3. Only after approval: build the chosen path on the platform, keep MJPEG as fallback,
   switch web and mobile, delete the hand parser in the mobile app.

Done when: the new path beats MJPEG on the measured numbers and the fallback works when
it fails.
```

## 6.10 Front-end quality and engineering upkeep

```
Follow the shared rules in docs/plan/phase-6/README.md. Slice 6.10. Can run any time,
in small commits.

1. Installable web app: manifest, icons, offline Collection (captures already seen).
2. Accessibility: screen reader and Safari pass (roadmap E2); fix what fails.
3. Georgian: list every string a native reader should check (roadmap E1) for the
   maintainer.
4. Real-user Web Vitals reported to the monitoring tool from 6.0.
5. Prettier: format the 243 failing files in one commit with no other change, then add
   the check to CI.
6. Hardware test rig plan: what pytest runs against the real mount and camera once they
   arrive, attended only. Plan document, no code that touches hardware.

Done when: each item has its own commit and evidence.
```
