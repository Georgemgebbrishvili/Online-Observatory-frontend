import type {
  BookableObservatory,
  MissionEvent,
  MissionState,
  OpticalConfig,
  Target,
} from "@darkview/contracts";

import { formatCoordinates } from "@/features/targets/present";

/**
 * The room's five steps, each the primary states it covers (ADR-027 §4). Failure and
 * hold states belong to no step: the contract forbids them in a progress indicator.
 */
export const missionSteps = [
  ["REQUESTED", "SCHEDULED", "PREPARING"],
  ["SLEWING"],
  ["VERIFYING", "CENTERING"],
  ["OBSERVING"],
  ["CAPTURING", "PROCESSING", "COMPLETE"],
] as const satisfies readonly (readonly MissionState[])[];

export type StepStatus = "done" | "current" | "stopped" | "pending";

export function stepOf(state: MissionState): number | null {
  const index = missionSteps.findIndex((states) =>
    (states as readonly MissionState[]).includes(state),
  );
  return index === -1 ? null : index;
}

/**
 * Each step's status for a mission. A failure or hold stops the flow at the step of the
 * last primary state in its history -- not the furthest, since a weather hold returns a
 * mission to SCHEDULED -- or at the first step when the history is unknown.
 */
export function missionProgress(
  state: MissionState,
  events: readonly Pick<MissionEvent, "state">[] | null,
): StepStatus[] {
  const step = stepOf(state);
  const reached =
    step ??
    (events ?? [])
      .map((event) => stepOf(event.state))
      .filter((index) => index !== null)
      .at(-1) ??
    0;

  return missionSteps.map((_, index) => {
    if (index < reached) return "done";
    if (index > reached) return "pending";
    if (step === null) return "stopped";
    return state === "COMPLETE" ? "done" : "current";
  });
}

/**
 * A point on the sky dial: the horizon at the rim, the zenith at the centre, north up
 * and east to the right. Null below the horizon, which the dial does not draw.
 */
export function dialPoint(
  altitudeDegrees: number,
  azimuthDegrees: number,
  radius: number,
  centre: number,
) {
  if (altitudeDegrees < 0) return null;
  const distance = radius * (1 - Math.min(altitudeDegrees, 90) / 90);
  const angle = (azimuthDegrees * Math.PI) / 180;
  return {
    // Two decimals, so the server's render and the browser's agree to the digit.
    x: Math.round((centre + distance * Math.sin(angle)) * 100) / 100,
    y: Math.round((centre - distance * Math.cos(angle)) * 100) / 100,
  };
}

/**
 * The SIDERA plates this app carries (ADR-027 §6), by target slug. Planets only: the
 * deep-sky plates promise more than the telescope shows.
 */
const plates: Record<string, string> = {
  jupiter: "/plates/jupiter.webp",
  saturn: "/plates/saturn.webp",
  mars: "/plates/mars.webp",
  venus: "/plates/venus.webp",
};

export function plateFor(slug: string) {
  return plates[slug] ?? null;
}

/** What the feed's corner plates say: the instrument, and the target. */
export type FeedPlates = {
  /** Observatory name, then the camera and optics; null when the observatory is unread. */
  instrument: string[] | null;
  /** The target's name, and its J2000 RA/Dec when it is a fixed target. */
  subject: { name: string; coordinates: string | null } | null;
};

/**
 * The feed's plates, from the contract only. The camera and the C6's optical
 * configurations are the first-party observatory's (ADR-001, `OpticalConfig`); a
 * partner publishes only its telescope, so that is all its plate names.
 */
export function feedPlates(
  observatory: BookableObservatory | null,
  target: Target | null,
  locale: "en" | "ka",
  labels: { camera: string; optics: Record<OpticalConfig, string> },
): FeedPlates {
  const name = (named: { nameEn: string; nameKa: string }) =>
    locale === "ka" ? named.nameKa : named.nameEn;
  const instrument = observatory
    ? [
        name(observatory),
        observatory.kind === "FIRST_PARTY"
          ? [labels.camera, target && labels.optics[target.opticalConfig]]
              .filter(Boolean)
              .join(" · ")
          : `${observatory.telescope.manufacturer} ${observatory.telescope.model}`,
      ]
    : null;
  return {
    instrument,
    subject: target
      ? {
          name: name(target),
          coordinates: target.coordinates ? formatCoordinates(target.coordinates) : null,
        }
      : null,
  };
}
