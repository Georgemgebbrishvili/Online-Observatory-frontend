import type { HorizontalCoordinates, ObservatoryHorizon } from "@darkview/contracts";

import { dialPoint } from "@/features/missions/room";
import { CONSTELLATION_LINES, positionStars } from "@/lib/observatory-sim/stars";

const size = 320;
const centre = size / 2;
const radius = 148;

// Two decimals: the server's and the browser's trigonometry differ in the last digits,
// and an attribute that differs is a hydration mismatch.
const at = (value: number) => Math.round(value * 100) / 100;

/** The surveyed horizon at a bearing, interpolated linearly across north, as the agent reads it. */
export function horizonAt(azimuthDegrees: number, horizon: ObservatoryHorizon): number {
  const floor = horizon.minAltitudeDegrees ?? 0;
  const mask = horizon.mask;
  if (mask.length === 0) return floor;
  const azimuth = ((azimuthDegrees % 360) + 360) % 360;
  // The segment this bearing falls in; before the first bearing, the one across north.
  let low = { ...mask[mask.length - 1], at: mask[mask.length - 1].azimuthDegrees - 360 };
  let high = { ...mask[0], at: mask[0].azimuthDegrees };
  mask.forEach((entry, index) => {
    if (azimuth < entry.azimuthDegrees) return;
    const next = mask[(index + 1) % mask.length];
    low = { ...entry, at: entry.azimuthDegrees };
    high = {
      ...next,
      at: index + 1 < mask.length ? next.azimuthDegrees : next.azimuthDegrees + 360,
    };
  });
  const share = high.at === low.at ? 0 : (azimuth - low.at) / (high.at - low.at);
  return Math.max(
    floor,
    low.minAltitudeDegrees + share * (high.minAltitudeDegrees - low.minAltitudeDegrees),
  );
}

/** The ring of sky below the horizon: the rim outside, the surveyed horizon inside. */
function horizonPath(horizon: ObservatoryHorizon): string {
  const inner = Array.from({ length: 73 }, (_, index) => {
    const azimuth = index * 5;
    const point = dialPoint(horizonAt(azimuth, horizon), azimuth, radius, centre);
    return point ? `${index === 0 ? "M" : "L"}${point.x} ${point.y}` : "";
  }).join(" ");
  const rim = `M${centre} ${centre - radius} A${radius} ${radius} 0 1 1 ${centre - 0.01} ${centre - radius} Z`;
  return `${rim} ${inner} Z`;
}

type SkyChartProps = {
  /** When the sky is drawn for. The room passes the server's now, then ticks. */
  at: number;
  /** From GET /observatories/{id}/horizon: the site to a tenth of a degree, and the mask. */
  horizon: ObservatoryHorizon;
  /** The target's position, or null when it is not known. */
  target: HorizontalCoordinates | null;
  /**
   * Where the mount points, from the mission channel only. Undefined: the channel has said
   * nothing. Null: no position, so no marker.
   */
  telescope?: HorizontalCoordinates | null;
  label: string;
  caption: string;
  cardinals: [string, string, string, string];
};

/**
 * The sky over the observatory (Phase 6.2): the bright stars and the figures between
 * them, the horizon the telescope cannot see below shaded, the target as an open ring
 * and the telescope as the marker that travels to it during a slew. North up, east to the
 * right, zenith at the centre, as the pointing dial. Drawn, never telescope output, and
 * captioned so.
 */
export function SkyChart({
  at: when,
  caption,
  cardinals,
  horizon,
  label,
  target,
  telescope,
}: SkyChartProps) {
  const stars = positionStars(
    horizon.latitudeDegrees,
    horizon.longitudeDegrees,
    new Date(when),
  ).filter((star) => star.altitude > 0 && star.mag <= 3);
  const placed = new Map(
    stars.map((star) => [
      star.id,
      dialPoint(star.altitude, star.azimuth, radius, centre),
    ]),
  );
  const targetPoint = target
    ? dialPoint(target.altitudeDegrees, target.azimuthDegrees, radius, centre)
    : null;
  const mount = telescope
    ? dialPoint(telescope.altitudeDegrees, telescope.azimuthDegrees, radius, centre)
    : null;

  return (
    <figure className="sky-chart">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <circle className="sky-chart-sky" cx={centre} cy={centre} r={radius} />
        <circle className="sky-chart-ring" cx={centre} cy={centre} r={(radius * 2) / 3} />
        <circle className="sky-chart-ring" cx={centre} cy={centre} r={radius / 3} />
        {CONSTELLATION_LINES.map(([from, to]) => {
          const a = placed.get(from);
          const b = placed.get(to);
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              className="sky-chart-figure"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
            />
          );
        })}
        {stars.map((star) => {
          const point = placed.get(star.id);
          if (!point) return null;
          return (
            <circle
              key={star.id}
              className="sky-chart-star"
              cx={point.x}
              cy={point.y}
              r={at(Math.max(0.7, 2.6 - star.mag * 0.6))}
            />
          );
        })}
        <path
          className="sky-chart-horizon"
          d={horizonPath(horizon)}
          fillRule="evenodd"
          data-sky-horizon=""
        />
        <circle className="sky-chart-rim" cx={centre} cy={centre} r={radius} />
        {cardinals.map((cardinal, index) => {
          const angle = (index * 90 * Math.PI) / 180;
          return (
            <text
              key={cardinal}
              className="sky-chart-cardinal"
              x={at(centre + (radius - 14) * Math.sin(angle))}
              y={at(centre - (radius - 14) * Math.cos(angle))}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {cardinal}
            </text>
          );
        })}
        {targetPoint && (
          <circle
            className="sky-chart-target"
            cx={targetPoint.x}
            cy={targetPoint.y}
            r={9}
            data-sky-target=""
          />
        )}
        {mount && (
          <g
            className="sky-chart-telescope"
            style={{ transform: `translate(${mount.x}px, ${mount.y}px)` }}
            data-sky-telescope=""
          >
            <circle r={5} />
            <line x1={-11} y1={0} x2={-7} y2={0} />
            <line x1={7} y1={0} x2={11} y2={0} />
            <line x1={0} y1={-11} x2={0} y2={-7} />
            <line x1={0} y1={7} x2={0} y2={11} />
          </g>
        )}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
