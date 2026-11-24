const DEG = Math.PI / 180;

/** J2000 to the date, first-order precession (arcseconds over a few decades). */
export function precess(ra: number, dec: number, years: number): [number, number] {
  const r = ra * DEG;
  const d = Math.min(89, Math.max(-89, dec)) * DEG;
  return [
    (ra + ((46.1244 + 20.0431 * Math.sin(r) * Math.tan(d)) * years) / 3600 + 360) % 360,
    dec + (20.0431 * Math.cos(r) * years) / 3600,
  ];
}
