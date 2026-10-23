# Hardware test rig — what runs against the real mount and camera

Phase 6.10, item 6. A plan, not code. Written 2026-10-23, before the NexStar 8SE, the
ASI585MC and the observatory mini-PC are on site.

## Rules that do not change

- Every run here is **attended**: the operator is at the telescope with a hand on the
  power. Real-hardware mode needs `DARKVIEW_AGENT_DRIVER_MODE=REAL` and
  `DARKVIEW_AGENT_ATTENDED=1` set in the shell for that run; neither may sit in a file
  (`agent/darkview_agent/config.py`).
- The simulator stays the default. These runs are never in CI and never started by an
  agent.
- `MAX_ALT_SAFE` is measured from the optical train before the first slew test, and
  recorded with who measured it. Until then every slew is refused, correctly.
- Each run writes its evidence (log, frames, telemetry, a photo of the mount where it
  matters) to `docs/evidence/hardware-<date>/`.

## Order of runs

Each step only after the previous one passed. A failure stops the rig for the night.

1. **Bench, mount unpowered.** The existing driver conformance suite
   (`agent/tests/test_device_conformance.py`) against the real Alpaca endpoint on
   `127.0.0.1` and the real ASI SDK: device discovery, properties read, nothing moved.
   Confirms the bridge binds loopback only (`test_link_no_listening_ports.py`'s rule, on
   the real machine).
2. **Camera alone, cap on.** Exposure and gain round-trip, ROI, frame timing, dark frames
   at the live-stack cadence; frame metadata (exposure, gain, temperature) matches what was
   asked. Measures frame size and rate for ADR-071.
3. **Mount, powered, no optics risk.** Tracking on/off, Park and unpark, abort mid-slew,
   at low altitudes only. Emergency Park from the operator console while a slew runs.
4. **Safety envelope, live.** Each edge from `test_safety_edges.py` replayed against the
   real mount with the operator watching: below the horizon mask, above `MAX_ALT_SAFE`,
   inside the Sun exclusion (daytime, cap on), a forbidden azimuth sector, an expired
   command, a duplicate command. Each must be refused by the agent, not only the cloud.
5. **Heartbeat loss.** Pull the network during tracking: the agent stops capture and Parks
   within `heartbeatLossSeconds`.
6. **Plate solve.** One known star field: the solver (`agent/tests/test_astap_solver.py`'s
   path) returns a position within the expected error. Gives ADR-069 its first real
   number.
7. **One full simulated customer session, on real hardware.** A booking on the demo, the
   mission runs end to end on a bright double star, a capture lands in the Collection.
   Measured for ADR-071 with one owner, observers and spectators watching.

## What is not tested here

Focuser (none on site yet), weather automation (the operator's hold is authoritative),
and anything a customer can trigger unattended.
