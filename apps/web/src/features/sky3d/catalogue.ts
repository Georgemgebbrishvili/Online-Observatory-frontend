/**
 * The Night Sky's star catalogue (ADR-085), apart from the astronomy: the files, their
 * decoding, and the stars carried along their proper motion to a date. Plain arithmetic,
 * so a page that draws the stars (the homepage's sky, ADR-104) need not load
 * astronomy-engine to read them.
 */
const DEG = Math.PI / 180;

/** The sky's data files (scripts/build-sky-data.mjs). A new layout takes a new name. */
export const STARS_URL = "/sky/data/stars-v2.bin";
export const FIGURES_URL = "/sky/data/constellations.json";

/** Floats per decoded star: x, y, z, V, B−V, then the proper motions in ″ a year. */
const CATALOGUE_RECORD = 7;

/**
 * stars-v2.bin (scripts/build-sky-data.mjs) as records of seven floats: the J2000 unit
 * vector at epoch 2000, V, B−V, and the proper motions in RA (on the sky) and Dec, ″ a year.
 */
export function decodeCatalogue(file: ArrayBuffer): Float32Array {
  const n = file.byteLength / 16;
  const ra = new Uint32Array(file, 0, n);
  const dec = new Int32Array(file, 4 * n, n);
  const [v, bv, pmRa, pmDec] = [8, 10, 12, 14].map((at) => new Int16Array(file, at * n, n));
  const out = new Float32Array(n * CATALOGUE_RECORD);
  // Written in place: nine thousand stars, no array made for each.
  const raStep = (15 / 360_000) * DEG;
  const decStep = DEG / 36_000;
  for (let i = 0, at = 0; i < n; i++, at += CATALOGUE_RECORD) {
    const a = ra[i] * raStep;
    const d = dec[i] * decStep;
    const c = Math.cos(d);
    out[at] = c * Math.cos(a);
    out[at + 1] = c * Math.sin(a);
    out[at + 2] = Math.sin(d);
    out[at + 3] = v[i] / 100;
    out[at + 4] = bv[i] / 1000;
    out[at + 5] = pmRa[i] / 1000;
    out[at + 6] = pmDec[i] / 1000;
  }
  return out;
}
const ARCSEC = DEG / 3600;
const J2000_MS = Date.UTC(2000, 0, 1, 12);
const YEAR_MS = 365.25 * 86_400_000;

/**
 * The catalogue moved to a date: each star's J2000 unit vector carried along its proper
 * motion from epoch 2000, as records of [x, y, z, V, B−V]. Arcturus has gone a full
 * arcminute since 2000; a view a few arcminutes wide shows it.
 */
export function starsAtDate(catalogue: Float32Array, date: Date): Float32Array {
  const years = (date.getTime() - J2000_MS) / YEAR_MS;
  const count = Math.floor(catalogue.length / CATALOGUE_RECORD);
  const out = new Float32Array(count * 5);
  for (let i = 0; i < count; i++) {
    const at = i * CATALOGUE_RECORD;
    const x = catalogue[at];
    const y = catalogue[at + 1];
    const z = catalogue[at + 2];
    const east = catalogue[at + 5] * ARCSEC * years;
    const north = catalogue[at + 6] * ARCSEC * years;
    const flat = Math.hypot(x, y) || 1;
    // East and north on the sky at the star: (−sin RA, cos RA, 0) and the rest.
    const nx = x - (y / flat) * east - ((z * x) / flat) * north;
    const ny = y + (x / flat) * east - ((z * y) / flat) * north;
    const nz = z + flat * north;
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    const to = i * 5;
    out[to] = nx / length;
    out[to + 1] = ny / length;
    out[to + 2] = nz / length;
    out[to + 3] = catalogue[at + 3];
    out[to + 4] = catalogue[at + 4];
  }
  return out;
}
