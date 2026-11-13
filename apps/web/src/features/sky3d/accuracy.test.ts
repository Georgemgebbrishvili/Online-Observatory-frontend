import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SITE,
  aberration,
  bodies,
  bodyState,
  decodeCatalogue,
  fixedAltAz,
  horizonMatrix,
  horizontal,
  skyAt,
  skySnapshot,
  starsAtDate,
  unitJ2000,
  type SkyBodyName,
} from "./astro";
import reference from "./jpl-horizons.fixture.json";

const DEG = Math.PI / 180;
const ARCSEC_RAD = DEG / 3600;

/** Great-circle separation of two RA/Dec places (degrees), in arcseconds. */
function apart(ra1: number, dec1: number, ra2: number, dec2: number) {
  const [a, b] = [unitJ2000(ra1 / 15, dec1), unitJ2000(ra2 / 15, dec2)];
  const cross = Math.hypot(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]);
  return (Math.atan2(cross, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / DEG) * 3600;
}

// The page's Sun, Moon and planets against NASA JPL's own ephemeris, at nine instants a
// body from November 2026 to June 2030. If the page drifts from the real sky on any of
// those days, this fails.
describe("the Sun, Moon and planets against JPL Horizons, 2026 to 2030", () => {
  for (const [name, rows] of Object.entries(reference.bodies)) {
    it(`${name} stays within 30″ and 0.25 magnitude`, () => {
      for (const row of rows) {
        const mine = bodyState(name as SkyBodyName, new Date(row.at), reference.site);
        expect(apart(mine.raHours * 15, mine.decDeg, row.raDeg, row.decDeg)).toBeLessThan(30);
        if (name !== "Sun") expect(Math.abs(mine.magnitude - row.magnitude)).toBeLessThan(0.25);
      }
    });
  }
});

describe("the stars on the day", () => {
  // Arcturus as the catalogue file holds it: Hipparcos gives −1.093″ and −1.999″ a year.
  const arcturus = [...unitJ2000(14 + 15 / 60 + 39.7 / 3600, 19 + 10 / 60 + 57 / 3600), -0.04, 1.23, -1.093, -1.998];
  const placeOf = (stars: Float32Array) => ({
    ra: (Math.atan2(stars[1], stars[0]) / DEG + 360) % 360,
    dec: Math.asin(stars[2]) / DEG,
  });

  it("leaves a star where the catalogue has it at epoch 2000", () => {
    const moved = placeOf(starsAtDate(new Float32Array(arcturus), new Date("2000-01-01T12:00:00Z")));
    const start = placeOf(new Float32Array(arcturus));
    expect(apart(moved.ra, moved.dec, start.ra, start.dec)).toBeLessThan(0.05);
  });

  it("carries Arcturus a full arcminute south-west by November 2026", () => {
    const start = placeOf(new Float32Array(arcturus));
    const moved = placeOf(starsAtDate(new Float32Array(arcturus), new Date("2026-11-11T00:00:00Z")));
    const years = 26.86;
    expect((moved.dec - start.dec) * 3600).toBeCloseTo(-1.998 * years, 0);
    expect((moved.ra - start.ra) * 3600 * Math.cos(start.dec * DEG)).toBeCloseTo(-1.093 * years, 0);
    expect(apart(moved.ra, moved.dec, start.ra, start.dec)).toBeGreaterThan(60);
  });

  it("keeps the magnitude and colour, five numbers a star", () => {
    const moved = starsAtDate(new Float32Array(arcturus), new Date("2026-11-11T00:00:00Z"));
    expect(moved).toHaveLength(5);
    expect(moved[3]).toBeCloseTo(-0.04, 5);
    expect(moved[4]).toBeCloseTo(1.23, 5);
  });

  it("leans a star by the Earth's motion, never more than 20.5″", () => {
    for (const day of ["2026-11-11", "2027-02-10", "2027-05-12", "2027-08-11"]) {
      const date = new Date(`${day}T18:00:00Z`);
      const lean = aberration(date);
      const size = (Math.hypot(...lean) / DEG) * 3600;
      expect(size).toBeGreaterThan(20);
      expect(size).toBeLessThan(21);
      const plain = horizontal(unitJ2000(5.278155, 45.997991), horizonMatrix(date, SITE));
      const leaned = fixedAltAz(5.278155, 45.997991, date, SITE);
      const shift = apart(plain.az, plain.alt, leaned.az, leaned.alt);
      expect(shift).toBeLessThan(21);
    }
  });

  it("ships the catalogue with proper motions, Sirius first, at the catalogue's precision", () => {
    const file = readFileSync(join(__dirname, "../../../public/sky/data/stars-v2.bin"));
    const catalogue = decodeCatalogue(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
    expect(catalogue.length % 7).toBe(0);
    expect(catalogue.length / 7).toBeGreaterThan(9000);
    // Sirius, BSC 2491: 6h 45m 08.9s, −16° 42′ 58″.
    const sirius = { ra: (Math.atan2(catalogue[1], catalogue[0]) / DEG + 360) % 360, dec: Math.asin(catalogue[2]) / DEG };
    expect(apart(sirius.ra, sirius.dec, (6 + 45 / 60 + 8.9 / 3600) * 15, -(16 + 42 / 60 + 58 / 3600))).toBeLessThan(0.2);
    expect(catalogue[3]).toBeCloseTo(-1.46, 2);
    expect(catalogue[5]).toBeCloseTo(-0.553, 3);
    expect(catalogue[6]).toBeCloseTo(-1.205, 3);
  });
});

describe("a frame between snapshots", () => {
  // The renderer works the sky out in full once a second and turns it with the Earth in
  // between: the stars exactly, the bodies within their own second's motion.
  const t0 = new Date("2026-11-13T18:00:00Z");
  const snapshot = skySnapshot(t0, SITE);
  for (const ms of [250, 1000]) {
    it(`holds stars and bodies ${ms} ms on`, () => {
      const at = new Date(t0.getTime() + ms);
      const fast = skyAt(snapshot, at);
      const exact = horizonMatrix(at, SITE);
      expect(Math.max(...fast.matrix.map((value, i) => Math.abs(value - exact[i]))) / ARCSEC_RAD).toBeLessThan(0.01);
      bodies(at, SITE).forEach((body, i) => {
        const drawn = fast.states[i];
        expect(apart(drawn.az, drawn.alt, body.az, body.alt)).toBeLessThan(0.6);
      });
    });
  }
});
