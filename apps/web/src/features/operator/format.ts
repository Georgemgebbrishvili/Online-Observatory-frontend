import type { EquatorialCoordinates, HorizontalCoordinates } from "@darkview/contracts";

const pad = (value: number) => String(value).padStart(2, "0");

/** RA 05h 35m 17.3s · DEC −05° 23′ 28″ — the notation Brand v2.0 §05 shows. */
export function formatEquatorial({ decDegrees, raHours }: EquatorialCoordinates) {
  // Round once, in the smallest unit shown, so a carry never shows 60.
  const ra = Math.round(raHours * 36_000) % 864_000; // tenths of a second of time
  const decArcseconds = Math.round(Math.abs(decDegrees) * 3600);
  const sign = decDegrees < 0 ? "−" : "+";
  return (
    `RA ${pad(Math.floor(ra / 36_000))}h ${pad(Math.floor(ra / 600) % 60)}m ` +
    `${((ra % 600) / 10).toFixed(1).padStart(4, "0")}s · ` +
    `DEC ${sign}${pad(Math.floor(decArcseconds / 3600))}° ` +
    `${pad(Math.floor(decArcseconds / 60) % 60)}′ ${pad(decArcseconds % 60)}″`
  );
}

export function formatHorizontal({
  altitudeDegrees,
  azimuthDegrees,
}: HorizontalCoordinates) {
  return `ALT ${altitudeDegrees.toFixed(1)}° · AZ ${azimuthDegrees.toFixed(1)}°`;
}

/** Seconds, then minutes, then hours: how old a reading is, not when it was. */
export function formatAge(milliseconds: number) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h`;
}

export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
