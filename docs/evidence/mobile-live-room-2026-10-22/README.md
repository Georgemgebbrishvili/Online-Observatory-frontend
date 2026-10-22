# Mobile live room and Collection — evidence, 2026-10-22

The mission room (`/missions/[id]`) and the Collection tab, against the real platform at
475b1b5 (not the e2e fake). The stack: `next dev` on port 4020 and the realtime service
on 4021 from a worktree of that commit, a scratch PostgreSQL with the development seed,
SeaweedFS for S3, and the simulator agent for the Tbilisi demo observatory. No hardware.

The app is the web export in Chrome at 390 × 844, signed in as the seed's demo observer
with ADR-061's bearer. A browser cannot do two things a phone does, so the harness does
them, locally only:

- **The mission channel's `Authorization` header.** A browser WebSocket cannot set
  headers, so Playwright proxies `/ws/mission/*` through Node `ws` with the same bearer.
- **CORS.** The API and realtime send no CORS headers (ADR-061), so Playwright answers
  the API's preflight, and a small Node proxy on port 4031 adds them to realtime's
  stream. The app is built with `EXPO_PUBLIC_DARKVIEW_REALTIME_URL=http://127.0.0.1:4031`.

Each booking went through the sandbox checkout and was opened at its slot. The mission
was ae021d8d-c8cc-4e43-b25d-acdae6ac0f08 (Albireo, 16:25Z), run first in Georgian
without a capture, then reopened in English.

- `room-0-before-slot-en.png`: a confirmed night before its slot. No Start, and the
  opening time in the observatory's zone.
- `room-1-arrived-ka.png`: the slot is open, Start is shown.
- `room-1-arrived-en.png`: the same mission reopened while OBSERVING. The session
  reopens on its own and the controls come back.
- `room-2-observing-*.png`: after Start, through slew and centring to OBSERVING, with
  time left, the steps, the controls, and the feed badged Simulated.
- `room-3-nudged-*.png`: Higher, accepted on POST /missions/{id}/command, verdict on the
  channel: "Done." The Georgian shot shows a simulator frame read from the MJPEG stream.
- `collection-1-list-*.png`, `collection-2-detail-*.png`: GET /captures and
  GET /captures/{id}, the seeded simulated captures, which have no image ("No preview").

Also exercised: Capture took the mission to CAPTURING, PROCESSING and COMPLETE, and the
room then says the observation has ended.

## What the platform did not do

- **No live frames while OBSERVING.** The agent shows frames only while verifying and
  capturing, and realtime drops a frame after 30 s. The Georgian session joined in time
  and was served the last plate-solve frame. The English session joined later and never
  got a stream ("Connecting to the telescope"). Filed as
  `docs/platform-requests/observing-live-view.md`.
- **No new capture in the Collection.** Every upload to the scratch SeaweedFS was
  refused (403, SignatureDoesNotMatch on the platform's presigned PUT), so the agent
  recorded no capture and no MISSION_CAPTURE_READY arrived. This is scratch-stack S3, not
  the app. The "a capture was added" card is untested on screen for that reason.

## Not shown on screen

The feed now hides once the mission is no longer live. That change came after the last
run and is covered by typecheck only. A phone's keychain is also not shown: the web build
keeps the token in memory.
