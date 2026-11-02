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
/** The longest slot a booking may hold (clients ADR-072: 15 minutes to 4 hours). */
const LONGEST_SLOT_MS = 240 * 60_000;

/**
 * When the mission's slot ends: `Mission.sessionEndsAt`, the booked slot's end
 * (ADR-079). Without one, the longest slot a booking may hold, so a long booking is never
 * sent away early; the platform refuses a start after the slot either way.
 */
export function slotEndOf(mission: Pick<Mission, "scheduledStartAt" | "sessionEndsAt">) {
  if (mission.sessionEndsAt) return Date.parse(mission.sessionEndsAt);
  if (!mission.scheduledStartAt) return null;
  return Date.parse(mission.scheduledStartAt) + LONGEST_SLOT_MS;
}

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
        const end = slotEndOf(mission) ?? start;
        // ...until its slot ends: the page opened inside it starts it (ADR-079).
        return now >= start - OPENS_BEFORE_MS && now < end;
      })
      .sort(
        (left, right) =>
          Date.parse(left.scheduledStartAt ?? "") -
          Date.parse(right.scheduledStartAt ?? ""),
      )[0] ?? null
  );
}
