import type { Mission, MissionState } from "@darkview/contracts";

/** In the room now: the session is running, or held for the weather and may resume. */
const LIVE: readonly MissionState[] = [
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
  "OBSERVING",
  "CAPTURING",
  "PROCESSING",
  "WEATHER_HOLD",
];

/** A scheduled mission is imminent from an hour before its start... */
const OPENS_BEFORE_MS = 60 * 60_000;
/** ...until one slot after it: the customer starts it inside the booked slot (ADR-018). */
const SLOT_MS = 30 * 60_000;

/**
 * The mission /app/live should open (ADR-037): a live one first, else the scheduled one
 * whose start is nearest. Null sends the caller to booking.
 */
export function activeMission(missions: readonly Mission[], now: number): Mission | null {
  const live = missions.find((mission) => LIVE.includes(mission.state));
  if (live) return live;

  return (
    missions
      .filter((mission) => {
        if (mission.state !== "SCHEDULED" || !mission.scheduledStartAt) return false;
        const start = Date.parse(mission.scheduledStartAt);
        return now >= start - OPENS_BEFORE_MS && now < start + SLOT_MS;
      })
      .sort(
        (left, right) =>
          Date.parse(left.scheduledStartAt ?? "") -
          Date.parse(right.scheduledStartAt ?? ""),
      )[0] ?? null
  );
}
