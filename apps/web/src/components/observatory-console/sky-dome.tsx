'use client';

import { memo, useId, useMemo, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { raDecToAzAlt } from '@/lib/observatory-sim/catalog';
import { evaluateSafety, type AltAz } from '@/lib/observatory-sim/safety';
import { BRIGHT_STARS } from '@/lib/observatory-sim/stars';
import { SHOWPIECES } from '@/lib/observatory-sim/showpieces';
import type { Station } from '@/lib/observatory-sim/sim-stations';
import { TELESCOPE_TARGET_BY_ID, targetPosition, type TelescopeTarget } from '@/lib/observatory-sim/telescope-targets';
import { useCopy } from './copy-context';
import Icon from './icons';

type DomeKind = 'planet' | 'moon' | 'star' | 'deep';

const domeKind = (t: TelescopeTarget): DomeKind => (t.kind === 'planet' || t.kind === 'moon' || t.kind === 'star' ? t.kind : 'deep');

const R = 120;
const C = 130;

/** Alt-az onto the dome: zenith in the middle, north up and east to the right, as the Pointing compass draws it. */
function place(p: AltAz) {
  const r = ((90 - Math.max(0, p.altitude)) / 90) * R;
  const a = (p.azimuth * Math.PI) / 180;
  return { x: C + Math.sin(a) * r, y: C - Math.cos(a) * r };
}

/** "M27" for a catalogued object, the name for the rest: what fits on a chip. */
const shortLabel = (t: TelescopeTarget, name: string) => (t.catalog && /^M\d/.test(t.catalog) ? t.catalog : name);

export type SkyDomeProps = {
  locale: Locale;
  station: Station;
  /** The sky clock, rounded so the dome recomputes once a minute. */
  minuteMs: number;
  /** Where the tube points; null before a connection. */
  pointing: AltAz | null;
  targetId: string | null;
  onPick: (t: TelescopeTarget) => void;
  /** Daytime observing: the night gate is waived, the Sun's keep-out is not. */
  daytime?: boolean;
};

/**
 * Tonight's sky over the telescope with the twenty showpieces where they are: press one
 * and the console runs the whole acquisition to it. Objects under the safety floor or
 * behind the horizon mask stay pressable so the refusal can say why; objects below the
 * horizon are counted, not drawn.
 */
function SkyDome({ locale, station, minuteMs, pointing, targetId, onPick, daytime = false }: SkyDomeProps) {
  const t = useCopy();
  const [hover, setHover] = useState<string | null>(null);
  const id = useId();
  const items = useMemo(() => {
    const at = new Date(minuteMs);
    return SHOWPIECES.map((s) => {
      const target = TELESCOPE_TARGET_BY_ID.get(s.id)!;
      const position = targetPosition(target, station, at);
      return { s, target, position, kind: domeKind(target), safe: evaluateSafety(station, position, at, { daytime }).ok };
    }).sort((a, b) => b.position.altitude - a.position.altitude);
  }, [station, minuteMs, daytime]);
  // The bright stars, for the shape of the sky behind the showpieces.
  const stars = useMemo(() => {
    const at = new Date(minuteMs);
    return BRIGHT_STARS.filter((s) => s.mag < 3).map((s) => ({ id: s.id, mag: s.mag, ...raDecToAzAlt(s.ra, s.dec, station.lat, station.lon, at) })).filter((s) => s.altitude > 0);
  }, [station, minuteMs]);
  const up = items.filter((i) => i.position.altitude > 0);
  const scope = pointing && pointing.altitude > -1 ? place(pointing) : null;
  const named = hover ?? targetId;

  return (
    <section className="sdo-panel sdo-dome" aria-labelledby={`${id}-t`}>
      <div className="sdo-ph">
        <h2 id={`${id}-t`} className="sdo-ph__t"><Icon name="target" size={15} />{t.dome.title}</h2>
        <span className="sdo-ph__id">{t.dome.up(up.length)}</span>
      </div>
      <svg className="sdo-dome__sky" viewBox="0 0 260 260" role="group" aria-label={t.dome.aria}>
        <defs>
          <radialGradient id={`${id}-bg`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#0b1020" />
            <stop offset="0.85" stopColor="#070a14" />
            <stop offset="1" stopColor="#14214f" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={R} fill={`url(#${id}-bg)`} stroke="rgba(143,176,255,.28)" />
        <circle cx={C} cy={C} r={(R * 2) / 3} fill="none" stroke="rgba(143,176,255,.08)" />
        <circle cx={C} cy={C} r={R / 3} fill="none" stroke="rgba(143,176,255,.08)" />
        <path d={`M${C} ${C - R}V${C + R}M${C - R} ${C}H${C + R}`} stroke="rgba(143,176,255,.06)" />
        {(['N', 'E', 'S', 'W'] as const).map((d, i) => {
          const p = place({ altitude: -6, azimuth: i * 90 });
          return <text key={d} x={p.x} y={p.y + 4.5} className="sdo-dome__dir" textAnchor="middle">{d}</text>;
        })}
        <g className="sdo-dome__stars" aria-hidden="true">
          {stars.map((s) => {
            const p = place(s);
            return <circle key={s.id} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={Math.max(0.6, 1.9 - s.mag * 0.45).toFixed(2)} />;
          })}
        </g>
        {scope && (
          <g className="sdo-dome__scope" transform={`translate(${scope.x.toFixed(1)} ${scope.y.toFixed(1)})`} aria-label={t.dome.scope}>
            <circle r="9" fill="none" />
            <path d="M-14 0h8M6 0h8M0 -14v8M0 6v8" />
          </g>
        )}
        {up.map(({ s, target, position, kind, safe }) => {
          const p = place(position);
          const on = s.id === targetId;
          const name = s.name[locale];
          const size = kind === 'moon' ? 7 : kind === 'planet' ? 5 : kind === 'star' ? 3.6 : 4.2;
          return (
            <g
              key={s.id}
              className={`sdo-dome__obj is-${kind}${on ? ' is-on' : ''}${safe ? '' : ' is-low'}`}
              transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
              role="button"
              tabIndex={0}
              aria-label={`${name} · ${Math.round(position.altitude)}°`}
              aria-pressed={on}
              onClick={() => onPick(target)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPick(target);
                }
              }}
              onPointerEnter={() => setHover(s.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(s.id)}
              onBlur={() => setHover(null)}
            >
              <circle r="13" className="sdo-dome__hit" />
              {on && <circle r={size + 5} className="sdo-dome__ring" />}
              {kind === 'deep' ? <rect x={-size} y={-size} width={size * 2} height={size * 2} rx="1.5" transform="rotate(45)" /> : <circle r={size} />}
            </g>
          );
        })}
        {named && (() => {
          const it = up.find((i) => i.s.id === named);
          if (!it) return null;
          const p = place(it.position);
          const right = p.x < C + 40;
          return (
            <text x={p.x + (right ? 12 : -12)} y={p.y - 9} textAnchor={right ? 'start' : 'end'} className="sdo-dome__label">
              {it.s.name[locale]}
            </text>
          );
        })()}
      </svg>
      <ul className="sdo-dome__list">
        {up.map(({ s, target, position, kind, safe }) => (
          <li key={s.id}>
            <button
              type="button"
              className={`sdo-dome__chip is-${kind}${s.id === targetId ? ' is-on' : ''}${safe ? '' : ' is-low'}`}
              aria-pressed={s.id === targetId}
              aria-label={`${s.name[locale]} · ${Math.round(position.altitude)}°`}
              onClick={() => onPick(target)}
              onPointerEnter={() => setHover(s.id)}
              onPointerLeave={() => setHover(null)}
            >
              <i aria-hidden="true" />
              <span title={s.name[locale]}>{shortLabel(target, s.name[locale])}</span>
              <small>{Math.round(position.altitude)}°</small>
            </button>
          </li>
        ))}
      </ul>
      <p className="sdo-dome__note">
        {items.length > up.length && <span>{t.dome.down(items.length - up.length)} · </span>}
        {t.dome.press}
      </p>
    </section>
  );
}

export default memo(SkyDome);
