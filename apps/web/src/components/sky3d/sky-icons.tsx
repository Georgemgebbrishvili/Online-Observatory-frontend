/** The Night Sky's control icons: 24 px line drawings that take the button's colour. */
export type SkyIconName =
  | "search"
  | "clear"
  | "back"
  | "close"
  | "pin"
  | "clock"
  | "list"
  | "lines"
  | "names"
  | "dso"
  | "atmosphere"
  | "ground"
  | "altaz"
  | "equatorial"
  | "milkyway"
  | "path"
  | "point"
  | "full"
  | "unfull"
  | "plus"
  | "minus"
  | "play"
  | "pause";

const dot = { fill: "currentColor", stroke: "none" } as const;

const ICONS: Record<SkyIconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5.5 5.5" />
    </>
  ),
  clear: <path d="m7 7 10 10M17 7 7 17" />,
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  close: <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />,
  pin: (
    <>
      <path d="M12 21s6.5-6.1 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.9 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  list: (
    <>
      <path d="M9 7h11M9 12h11M9 17h11" />
      <circle cx="4.8" cy="7" r="1.2" {...dot} />
      <circle cx="4.8" cy="12" r="1.2" {...dot} />
      <circle cx="4.8" cy="17" r="1.2" {...dot} />
    </>
  ),
  lines: (
    <>
      <path d="M4.5 17.5 9.5 8l6 4.5 4-7.5" />
      <circle cx="4.5" cy="17.5" r="1.7" {...dot} />
      <circle cx="9.5" cy="8" r="1.7" {...dot} />
      <circle cx="15.5" cy="12.5" r="1.7" {...dot} />
      <circle cx="19.5" cy="5" r="1.7" {...dot} />
    </>
  ),
  names: (
    <>
      <path d="M3.5 18 8.6 5.5h.8L14.5 18M5.4 13.5h7.2" />
      <path d="M20.5 18v-5.2a2.4 2.4 0 0 0-4.6-.9M20.5 15.2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
    </>
  ),
  dso: (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-28 12 12)" />
      <circle cx="12" cy="12" r="1.6" {...dot} />
    </>
  ),
  atmosphere: (
    <>
      <circle cx="16.5" cy="7.5" r="2.6" />
      <path d="M16.5 2.4v1.2M21.6 7.5h-1.2M20.1 3.9l-.85.85" />
      <path d="M7.5 19.5h9a3.5 3.5 0 0 0 .5-6.96 5 5 0 0 0-9.6-.9A4 4 0 0 0 7.5 19.5Z" />
    </>
  ),
  ground: (
    <>
      <path d="M2.5 19.5 9 8.5l4 6.2 2.6-3.7 5.9 8.5Z" />
      <circle cx="17.5" cy="5.5" r="1.3" {...dot} />
    </>
  ),
  altaz: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.2" />
      <ellipse cx="12" cy="12" rx="3.2" ry="8.5" />
    </>
  ),
  equatorial: (
    <g transform="rotate(-32 12 12)">
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.2" />
      <path d="M12 1.5v21" />
    </g>
  ),
  milkyway: (
    <>
      <path d="M3 15.5C7 7 15 5.5 21 7.5M3.5 20.5C8.5 13 15 11 21 12.5" />
      <circle cx="9" cy="13.5" r="1" {...dot} />
      <circle cx="13.5" cy="10.5" r="1.2" {...dot} />
      <circle cx="17.5" cy="10" r="0.9" {...dot} />
    </>
  ),
  path: (
    <>
      <path d="M3 19c1.5-6.5 4.5-10.5 9-11.5" />
      <path d="M12 7.5c4.5-.8 7.5 2.2 9 8.5" strokeDasharray="2.6 2.6" />
      <circle cx="12" cy="7.5" r="2" {...dot} />
    </>
  ),
  point: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.6 8.4-2 5.2-5.2 2 2-5.2Z" />
    </>
  ),
  full: <path d="M4.5 9.5v-5h5M14.5 4.5h5v5M19.5 14.5v5h-5M9.5 19.5h-5v-5" />,
  unfull: <path d="M9.5 4.5v5h-5M19.5 9.5h-5v-5M14.5 19.5v-5h5M4.5 14.5h5v5" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  play: <path d="M8 5.5v13l10.5-6.5Z" {...dot} />,
  pause: <path d="M8 5.5v13M16 5.5v13" />,
};

export function SkyIcon({ name }: { name: SkyIconName }) {
  return (
    <svg className="sky-icon" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
