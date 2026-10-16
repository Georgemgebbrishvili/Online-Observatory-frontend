import type { NightWindow, VoteCandidate } from "@/features/vote/sky";
import type { Locale } from "@/i18n/config";
import type { VoteCopy } from "@/i18n/resources/vote";

const W = 1000;
const H = 380;
const X0 = 48;
const X1 = 984;
const TOP = 28;
const HORIZON = 316;

type TonightSkyChartProps = {
  window: NightWindow;
  candidates: VoteCandidate[];
  lead: string | null;
  timezone: string;
  now: Date;
  locale: Locale;
  copy: VoteCopy["chart"];
};

/**
 * The night drawn as it will happen (ADR-053 §8): each candidate's altitude from dusk to
 * dawn over the observatory, the horizon at the foot. The leading target is the lit path;
 * the rest are faint.
 */
export function TonightSkyChart({
  candidates,
  copy,
  lead,
  locale,
  now,
  timezone,
  window,
}: TonightSkyChartProps) {
  const t0 = Date.parse(window.dusk);
  const t1 = Date.parse(window.dawn);
  const x = (t: number) => X0 + ((t - t0) / (t1 - t0)) * (X1 - X0);
  const y = (alt: number) => HORIZON - (Math.max(-8, alt) / 90) * (HORIZON - TOP);
  const clock = (t: number) =>
    new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(t);

  const drawn = [...candidates].sort(
    (a, b) => Number(a.target.id === lead) - Number(b.target.id === lead),
  );

  // Labels sit beside each peak; stacked ones are pushed apart and keep a leader line.
  const labels = drawn
    .map((c) => ({
      c,
      lead: c.target.id === lead,
      px: x(Date.parse(c.at)),
      py: y(c.altitudeDeg),
      ly: y(c.altitudeDeg),
    }))
    .sort((a, b) => a.py - b.py);
  for (let i = 1; i < labels.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      if (Math.abs(labels[i].px - labels[j].px) < 240 && Math.abs(labels[i].ly - labels[j].ly) < 26) {
        labels[i].ly = labels[j].ly + 26;
        j = -1;
      }
    }
  }

  const hours: number[] = [];
  for (let t = Math.ceil(t0 / 3_600_000) * 3_600_000; t <= t1; t += 3_600_000) hours.push(t);
  const nowT = now.getTime();
  const lit = drawn.find((c) => c.target.id === lead);
  const summary = lit
    ? copy.summaryLead(lit.name, Math.round(lit.altitudeDeg), clock(Date.parse(lit.at)), candidates.length, clock(t0), clock(t1))
    : copy.summary(candidates.length, clock(t0), clock(t1));

  return (
    // The chart scrolls sideways on a phone, so the figure takes focus and the summary (axe).
    <figure className="vote-skychart" tabIndex={0} aria-label={summary}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        <defs>
          <linearGradient id="vote-twilight" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" className="vote-skychart-dusk" stopOpacity="0.55" />
            <stop offset="0.18" stopOpacity="0" />
            <stop offset="0.82" stopOpacity="0" />
            <stop offset="1" className="vote-skychart-dusk" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="vote-ground" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" className="vote-skychart-earth" stopOpacity="0.2" />
            <stop offset="1" className="vote-skychart-earth" stopOpacity="0.95" />
          </linearGradient>
          <clipPath id="vote-above">
            <rect x={X0} y={0} width={X1 - X0} height={HORIZON} />
          </clipPath>
          <filter id="vote-star" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <rect x={X0} y={TOP - 12} width={X1 - X0} height={HORIZON - TOP + 12} fill="url(#vote-twilight)" />

        {[30, 60, 90].map((a) => (
          <g key={a} className="vote-skychart-grid">
            <line x1={X0} x2={X1} y1={y(a)} y2={y(a)} />
            <text x={X0 - 10} y={y(a) + 4} textAnchor="end">
              {a}°
            </text>
          </g>
        ))}

        <g clipPath="url(#vote-above)">
          {drawn.map((c) => (
            <path
              key={c.target.id}
              className={
                c.target.id === lead
                  ? "vote-skychart-path vote-skychart-path-lead"
                  : "vote-skychart-path"
              }
              d={c.track
                .map((pt, i) => `${i ? "L" : "M"}${x(Date.parse(pt.at)).toFixed(1)},${y(pt.alt).toFixed(1)}`)
                .join(" ")}
            >
              <title>{copy.pathTitle(c.name, Math.round(c.altitudeDeg), clock(Date.parse(c.at)))}</title>
            </path>
          ))}
        </g>

        <rect x={X0} y={HORIZON} width={X1 - X0} height={H - HORIZON - 30} fill="url(#vote-ground)" />
        <line className="vote-skychart-horizon" x1={X0} x2={X1} y1={HORIZON} y2={HORIZON} />
        <text className="vote-skychart-tick" x={X1} y={HORIZON - 8} textAnchor="end">
          {copy.horizon}
        </text>

        {nowT > t0 && nowT < t1 && (
          <g className="vote-skychart-now">
            <line x1={x(nowT)} x2={x(nowT)} y1={TOP - 12} y2={HORIZON} />
            <text x={x(nowT) + 6} y={TOP}>
              {copy.now}
            </text>
          </g>
        )}

        {labels.map((l) => {
          const right = l.px < X1 - 230;
          const lx = right ? l.px + 16 : l.px - 16;
          return (
            <g
              key={l.c.target.id}
              className={l.lead ? "vote-skychart-peak vote-skychart-peak-lead" : "vote-skychart-peak"}
            >
              {l.lead && <circle cx={l.px} cy={l.py} r={10} filter="url(#vote-star)" className="vote-skychart-halo" />}
              <circle cx={l.px} cy={l.py} r={l.lead ? 5 : 4} className="vote-skychart-dot" />
              {l.ly !== l.py && <line x1={l.px} y1={l.py} x2={lx} y2={l.ly} className="vote-skychart-leader" />}
              <text x={lx} y={l.ly + 4} textAnchor={right ? "start" : "end"}>
                <tspan className="vote-skychart-name">{l.c.name}</tspan>
                <tspan className="vote-skychart-alt" dx={8}>
                  {Math.round(l.c.altitudeDeg)}°
                </tspan>
              </text>
            </g>
          );
        })}

        {hours.map((t, i) => (
          <text key={t} className="vote-skychart-tick" x={x(t)} y={H - 8} textAnchor="middle">
            {i % 2 === 0 ? clock(t) : "·"}
          </text>
        ))}
      </svg>
    </figure>
  );
}
