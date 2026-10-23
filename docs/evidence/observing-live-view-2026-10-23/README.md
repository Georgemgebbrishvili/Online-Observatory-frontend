# The live view runs for the whole of OBSERVING — evidence, 2026-10-23

Phase 6.1, platform #199 (merged as 460c0c5), on `npm run dev:stack`: the real platform,
realtime and the simulated night-side agent (Mauna Kea, dark during Tbilisi's day). No
hardware. One booking, made through the API and paid through the sandbox checkout, for
the 10:00Z slot; mission c55105da-40f9-417e-bf69-25131f3d1d03 (Saturn).

A headless Chrome opened the room in English at 1440, pressed Start, and logged every
mission-channel message with its time (`channel-log.json`). Forty-five seconds into
OBSERVING, a second session opened the room in Georgian at 390 — the late joiner that,
before #199, got no stream at all.

| From OBSERVING | What arrived |
| --- | --- |
| 0 s | OBSERVING; the last plate-solve frame (no stack count) |
| 6.8 s → 92.9 s | 13 `MISSION_FRAME`s, stack 1, 2, 3 … 13, sub-exposure 2 s, gain 200 |
| 90 s | CAPTURING, its own stack from 1 |

- `room-observing-en-1..3.png`: the room during OBSERVING. The feed is live, badged
  Simulated, with "6 × 2 s stacked · gain 200" under the badge.
- `room-observing-ka-late-join.png`: the Georgian session that joined late. It was
  offered the stream and shows "11 × 2 წმ დაჯამებული · გაძლიერება 200". In this shot the
  line sat over the Simulated pill: fixed after the run (the console layout's plate
  position), checked by the visual baselines.

## What did not meet the bar

Frames came every 6.5 s on average, the longest gap 12 s, against 2 s exposures. The
laptop's load average was about 155 on 4 cores during the run (the stack, Chrome, CI
downloads and another session), and the agent's stacking and JPEG encoding share that
CPU. The rule itself — a stack at least every three exposures for ten minutes — is shown
on the simulator clock in `agent/tests/test_observing_live_view.py`. The live cadence is
to be measured again on the observatory mini-PC (slice 6.9).
