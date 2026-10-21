"use client";

import { Body, Illumination, MoonPhase } from "astronomy-engine";

/** The Moon on a night: how much of it is lit at the site's midnight, and whether it is growing. */
export function moonThatNight(date: string, timezone: string) {
  // Midnight after the night's evening, on the site's clock: noon UTC of the date plus
  // twelve hours, less the zone's offset.
  const noon = new Date(`${date}T12:00:00Z`);
  const offsetMinutes =
    (new Date(noon.toLocaleString("en-US", { timeZone: timezone })).getTime() -
      noon.getTime()) /
    60_000;
  const midnight = new Date(noon.getTime() + (12 * 60 - offsetMinutes) * 60_000);
  return {
    lit: Math.round(Illumination(Body.Moon, midnight).phase_fraction * 100),
    waxing: MoonPhase(midnight) < 180,
  };
}

/** The Moon that night: its lit part drawn on the side it is lit (the board's night tabs). */
export function MoonGlyph({ lit, waxing }: { lit: number; waxing: boolean }) {
  const r = 6;
  const f = Math.max(0, Math.min(1, lit / 100));
  // Rounded: the server's and the browser's cosine differ in the last digit.
  const rx = Math.round(Math.abs(Math.cos(Math.PI * f)) * r * 1000) / 1000;
  // The lit limb runs down the right; the terminator bulges toward the lit side below
  // half, away above.
  const d = `M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx},${r} 0 0 ${f < 0.5 ? 0 : 1} 0,${-r} Z`;
  return (
    <svg
      className="board-moon"
      viewBox="-8 -8 16 16"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <circle r={r} className="board-moon-dark" />
      <path d={d} className="board-moon-lit" transform={waxing ? undefined : "scale(-1 1)"} />
    </svg>
  );
}
