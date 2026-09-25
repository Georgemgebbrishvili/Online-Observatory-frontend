import type {
  EquatorialCoordinates,
  Target,
  TargetVisibility,
  TonightTarget,
  VisibilityBlockReason,
} from "@darkview/contracts";

import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";

/** Observable first, then highest in the sky. A sort of the platform's data, not a ranking. */
export function sortTonight(items: readonly TonightTarget[]): TonightTarget[] {
  return [...items].sort(
    (left, right) =>
      Number(right.visibility.observable) - Number(left.visibility.observable) ||
      right.visibility.horizontal.altitudeDegrees -
        left.visibility.horizontal.altitudeDegrees,
  );
}

/**
 * The reason a target cannot be observed that a reader most needs. The platform
 * evaluates its checks in priority order — safety envelope, disabled, offline,
 * weather, then the sky — so the first reason is the one that decides.
 */
export function primaryReason(
  visibility: TargetVisibility,
): VisibilityBlockReason | null {
  return visibility.blockReasons[0] ?? null;
}

export type TargetVisual =
  "moon" | "saturn" | "jupiter" | "planet" | "star" | "cluster" | "ring" | "nebula";

/**
 * Which drawn illustration stands in for a target with no `previewImageUrl`. It is
 * always labelled an illustration: CLAUDE.md forbids presenting one as telescope output.
 */
export function targetVisual(target: Target): TargetVisual {
  switch (target.type) {
    case "MOON":
      return "moon";
    case "PLANET":
      if (target.solarSystemBody === "SATURN") return "saturn";
      if (target.solarSystemBody === "JUPITER") return "jupiter";
      return "planet";
    case "DOUBLE_STAR":
      return "star";
    case "GLOBULAR_CLUSTER":
      return "cluster";
    case "PLANETARY_NEBULA":
      return "ring";
    case "BRIGHT_NEBULA":
      return "nebula";
  }
}

/** Rise and set in the observatory's own time, or null where the platform gives none. */
export function viewingWindow(
  visibility: TargetVisibility,
  timezone: string,
  locale: Locale,
): { rises: string | null; sets: string | null } {
  const format = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });
  return {
    rises: visibility.risesAt ? format.format(new Date(visibility.risesAt)) : null,
    sets: visibility.setsAt ? format.format(new Date(visibility.setsAt)) : null,
  };
}

export function formatWindow(
  visibility: TargetVisibility,
  timezone: string,
  locale: Locale,
  templates: { between: string; from: string; until: string; none: string },
) {
  const { rises, sets } = viewingWindow(visibility, timezone, locale);
  if (rises && sets) return fill(templates.between, { rises, sets });
  if (rises) return fill(templates.from, { rises });
  if (sets) return fill(templates.until, { sets });
  return templates.none;
}

export function targetName(target: Target, locale: Locale) {
  return locale === "ka" ? target.nameKa : target.nameEn;
}

export function targetDescription(target: Target, locale: Locale) {
  return (locale === "ka" ? target.descriptionKa : target.descriptionEn) ?? null;
}

function sexagesimal(value: number) {
  const totalSeconds = Math.round(Math.abs(value) * 3600);
  return [
    Math.floor(totalSeconds / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ].map((part) => String(part).padStart(2, "0"));
}

/** J2000 right ascension and declination, as an astronomer writes them. */
export function formatCoordinates({ decDegrees, raHours }: EquatorialCoordinates) {
  const [raH, raM, raS] = sexagesimal(raHours);
  const [decD, decM, decS] = sexagesimal(decDegrees);
  const sign = decDegrees < 0 ? "−" : "+";
  return `${raH}h ${raM}m ${raS}s / ${sign}${decD}° ${decM}′ ${decS}″`;
}
