import type { HorizontalCoordinates } from "@darkview/contracts";

import { dialPoint } from "@/features/missions/room";

const size = 140;
const centre = size / 2;
const radius = 62;

type PointingDialProps = {
  /** Null when nothing is known; a position below the horizon is drawn as no marker. */
  position: HorizontalCoordinates | null;
  label: string;
  cardinals: [string, string, string, string];
};

/**
 * The sky as a dial (ADR-027 §3): horizon at the rim, zenith at the centre, north up
 * and east to the right. Rings at 30° and 60° of altitude. The geometry is SIDERA's.
 */
export function PointingDial({ cardinals, label, position }: PointingDialProps) {
  const point = position
    ? dialPoint(position.altitudeDegrees, position.azimuthDegrees, radius, centre)
    : null;

  return (
    <svg
      className="pointing-dial"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
    >
      <circle className="pointing-dial-rim" cx={centre} cy={centre} r={radius} />
      <circle
        className="pointing-dial-ring"
        cx={centre}
        cy={centre}
        r={(radius * 2) / 3}
      />
      <circle className="pointing-dial-ring" cx={centre} cy={centre} r={radius / 3} />
      {Array.from({ length: 72 }, (_, index) => {
        const angle = (index * 5 * Math.PI) / 180;
        const length = index % 18 === 0 ? 6 : 3;
        return (
          <line
            key={index}
            className="pointing-dial-tick"
            x1={centre + radius * Math.sin(angle)}
            y1={centre - radius * Math.cos(angle)}
            x2={centre + (radius - length) * Math.sin(angle)}
            y2={centre - (radius - length) * Math.cos(angle)}
          />
        );
      })}
      {cardinals.map((cardinal, index) => {
        const angle = (index * 90 * Math.PI) / 180;
        return (
          <text
            key={cardinal}
            className={index === 0 ? "pointing-dial-north" : "pointing-dial-cardinal"}
            x={centre + (radius - 13) * Math.sin(angle)}
            y={centre - (radius - 13) * Math.cos(angle)}
            textAnchor="middle"
            dominantBaseline="central"
            aria-hidden="true"
          >
            {cardinal}
          </text>
        );
      })}
      <circle className="pointing-dial-centre" cx={centre} cy={centre} r={1.6} />
      {point && (
        <g className="pointing-dial-target">
          <line x1={centre} y1={centre} x2={point.x} y2={point.y} />
          <circle cx={point.x} cy={point.y} r={5} />
          <circle
            className="pointing-dial-target-dot"
            cx={point.x}
            cy={point.y}
            r={1.8}
          />
        </g>
      )}
    </svg>
  );
}
