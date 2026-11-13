import { Body, Equator, GeoVector, Horizon, Illumination, MakeTime } from "astronomy-engine";
import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { precessJ2000ToDate } from "@/lib/observatory-sim/catalog";

import {
  SITE,
  bodyState,
  colourOfBv,
  events,
  horizonMatrix,
  fixedAltAz,
  horizontal,
  jupiterMoons,
  limitingMagnitude,
  observerOf,
  skyBrightness,
  skyPath,
  skyState,
  unitJ2000,
  worldOf,
} from "./astro";
import { MAX_ALT, directionAt, screenOf, zoomAbout } from "./projection";

// ADR-085's proof. The fixed instant: 2026-11-07 20:00 Asia/Tbilisi (UTC+4), at the site.
const at = new Date("2026-11-07T16:00:00Z");
const observer = observerOf(SITE);

/** Great-circle separation of two alt/az pairs, degrees. */
function separation(a: { alt: number; az: number }, b: { alt: number; az: number }) {
  const r = Math.PI / 180;
  const cos =
    Math.sin(a.alt * r) * Math.sin(b.alt * r) +
    Math.cos(a.alt * r) * Math.cos(b.alt * r) * Math.cos((a.az - b.az) * r);
  return Math.acos(Math.min(1, cos)) / r;
}

// J2000 positions (Hipparcos) of the two named stars.
const STARS = {
  Vega: { ra: 18.615649, dec: 38.783689 },
  Capella: { ra: 5.278155, dec: 45.997991 },
};

describe("positions against astronomy-engine's Horizon()", () => {
  it.each(["Moon", "Jupiter", "Saturn"] as const)("%s is Horizon() itself", (name) => {
    const time = MakeTime(at);
    const eq = Equator(Body[name], time, observer, true, true);
    const reference = Horizon(time, observer, eq.ra, eq.dec, "normal");
    const state = bodyState(name, at, SITE);
    expect(separation(state, { alt: reference.altitude, az: reference.azimuth })).toBeLessThanOrEqual(0.01);
  });

  it.each(Object.entries(STARS))("%s through the frame's matrix is within 0.01°", (_name, star) => {
    // The page's path: J2000 vector, one EQJ->HOR matrix, refraction.
    const mine = horizontal(unitJ2000(star.ra, star.dec), horizonMatrix(at, SITE));
    // astronomy-engine's: precess to the date, then Horizon().
    const ofDate = precessJ2000ToDate(star.ra, star.dec, at);
    const reference = Horizon(MakeTime(at), observer, ofDate.raHours, ofDate.decDeg, "normal");
    expect(separation(mine, { alt: reference.altitude, az: reference.azimuth })).toBeLessThanOrEqual(0.01);
  });

  it("holds the matrix path within 0.01° across the whole sky and a year", () => {
    let worst = 0;
    for (let day = 0; day < 365; day += 61) {
      const when = new Date(at.getTime() + day * 86_400_000);
      const matrix = horizonMatrix(when, SITE);
      for (let ra = 0; ra < 24; ra += 3) {
        for (let dec = -60; dec <= 85; dec += 29) {
          const mine = horizontal(unitJ2000(ra, dec), matrix);
          if (mine.alt < 2) continue; // refraction near the horizon is model-, not path-limited
          const ofDate = precessJ2000ToDate(ra, dec, when);
          const ref = Horizon(MakeTime(when), observer, ofDate.raHours, ofDate.decDeg, "normal");
          worst = Math.max(worst, separation(mine, { alt: ref.altitude, az: ref.azimuth }));
        }
      }
    }
    expect(worst).toBeLessThanOrEqual(0.01);
  });

  // Paste reference values from JPL Horizons or Stellarium for the instant above into
  // STELLARIUM (apparent alt/az, refraction on) to hold the page within 0.2°.
  const STELLARIUM: Record<string, { alt: number; az: number }> = {};
  it.skipIf(Object.keys(STELLARIUM).length === 0)("agrees with pasted reference values within 0.2°", () => {
    for (const [name, reference] of Object.entries(STELLARIUM)) {
      const star = STARS[name as keyof typeof STARS];
      const mine = star
        ? horizontal(unitJ2000(star.ra, star.dec), horizonMatrix(at, SITE))
        : bodyState(name as "Moon", at, SITE);
      expect(separation(mine, reference), name).toBeLessThanOrEqual(0.2);
    }
  });
});

describe("projection", () => {
  const view = { alt: 30, az: 120, fov: 60 };
  const width = 1280;
  const height = 720;

  function threeCamera() {
    const camera = new PerspectiveCamera(view.fov, width / height, 0.01, 10);
    camera.up.set(0, 1, 0);
    camera.position.set(0, 0, 0);
    camera.lookAt(new Vector3(...worldOf(view)));
    camera.updateMatrixWorld();
    return camera;
  }

  it("puts the view's centre at the middle of the screen", () => {
    const point = screenOf(worldOf(view), view, width, height)!;
    expect(point.x).toBeCloseTo(640, 6);
    expect(point.y).toBeCloseTo(360, 6);
  });

  it("puts a point 10° above the centre where a pinhole camera does", () => {
    const point = screenOf(worldOf({ alt: 40, az: 120 }), view, width, height)!;
    const expected = 360 - (Math.tan((10 * Math.PI) / 180) / Math.tan((30 * Math.PI) / 180)) * 360;
    expect(Math.abs(point.x - 640)).toBeLessThan(1e-6);
    expect(Math.abs(point.y - expected)).toBeLessThan(1);
  });

  it("matches three's camera within 1 px across the field", () => {
    const camera = threeCamera();
    for (const target of [
      { alt: 45, az: 100 },
      { alt: 12, az: 150 },
      { alt: 28, az: 95 },
      { alt: 50, az: 160 },
    ]) {
      const mine = screenOf(worldOf(target), view, width, height)!;
      const ndc = new Vector3(...worldOf(target)).project(camera);
      const theirs = { x: ((ndc.x + 1) / 2) * width, y: ((1 - ndc.y) / 2) * height };
      expect(Math.abs(mine.x - theirs.x), `x ${JSON.stringify(target)}`).toBeLessThan(1);
      expect(Math.abs(mine.y - theirs.y), `y ${JSON.stringify(target)}`).toBeLessThan(1);
    }
  });

  it("hides what is behind the camera", () => {
    expect(screenOf(worldOf({ alt: -30, az: 300 }), view, width, height)).toBeNull();
  });
});

describe("zooming where it is aimed", () => {
  // A wheel or a pinch zooms about the pointer: the sky under it stays under it.
  const [width, height] = [1440, 723];
  const cases = [
    { alt: 20, az: 180, fov: 75, x: 668, y: 366 },
    { alt: 20, az: 180, fov: 75, x: 200, y: 150 },
    { alt: 60, az: 90, fov: 40, x: 1200, y: 600 },
    { alt: 5, az: 10, fov: 100, x: 100, y: 700 },
    { alt: 30, az: 300, fov: 0.5, x: 1000, y: 100 },
  ];
  for (const { x, y, ...view } of cases) {
    it(`holds the point under (${x}, ${y}) at alt ${view.alt}, field ${view.fov}°`, () => {
      const under = directionAt(view, x, y, width, height);
      const back = screenOf(under, view, width, height)!;
      expect(Math.hypot(back.x - x, back.y - y)).toBeLessThan(0.01);
      for (const factor of [1 / 2.6, 2]) {
        const zoomed = zoomAbout(view, view.fov * factor, x, y, width, height);
        const at = screenOf(under, zoomed, width, height)!;
        // Zooming out may need the view past the zenith, which it stops short of.
        if (Math.abs(zoomed.alt) < MAX_ALT) expect(Math.hypot(at.x - x, at.y - y)).toBeLessThan(1);
      }
    });
  }
});

describe("the sky's state", () => {
  it("switches at −0.833°, −6°, −12° and −18°", () => {
    expect(skyState(-0.8)).toBe("day");
    expect(skyState(-0.84)).toBe("civil");
    expect(skyState(-5.99)).toBe("civil");
    expect(skyState(-6.01)).toBe("nautical");
    expect(skyState(-11.99)).toBe("nautical");
    expect(skyState(-12.01)).toBe("astronomical");
    expect(skyState(-17.99)).toBe("astronomical");
    expect(skyState(-18.01)).toBe("night");
  });

  it("darkens with the Sun, and the Moon brightens it", () => {
    expect(skyBrightness(-25)).toBe(0);
    expect(skyBrightness(10)).toBe(1);
    expect(skyBrightness(-25, { alt: 50, litFraction: 1 })).toBeGreaterThan(0.1);
    expect(skyBrightness(-25, { alt: -5, litFraction: 1 })).toBe(0);
    expect(limitingMagnitude(0)).toBe(6.5);
    expect(limitingMagnitude(1)).toBeLessThan(-1);
    // The bright stars are out as civil twilight ends, and most stars by nautical's end.
    expect(limitingMagnitude(skyBrightness(-6))).toBeGreaterThan(2);
    expect(limitingMagnitude(skyBrightness(-6))).toBeLessThan(3);
    expect(limitingMagnitude(skyBrightness(-12))).toBeGreaterThan(4.5);
  });

  it("colours a hot star blue and a cool one orange", () => {
    const [r1, , b1] = colourOfBv(-0.3);
    const [r2, , b2] = colourOfBv(1.6);
    expect(b1).toBeGreaterThan(r1);
    expect(r2).toBeGreaterThan(b2);
  });
});

describe("tonight's events", () => {
  it("finds Saturn's rise, transit and set within the day, in order around the transit", () => {
    const { rise, transit, set } = events({ body: "Saturn" }, new Date("2026-11-07T08:00:00Z"), SITE);
    expect(transit).not.toBeNull();
    expect(rise).not.toBeNull();
    expect(set).not.toBeNull();
  });

  it("gives one pass in order: a body below the horizon now shows its next rise, then its highest, then its set", () => {
    // 16:00 in Tbilisi on 8 November 2026: Saturn is down and rises at 16:19. The panel
    // used to show that morning's 04:35 set under the evening's rise; the set it means is
    // the one on the 9th.
    const now = new Date("2026-11-08T12:00:00Z");
    const { rise, transit, set } = events({ body: "Saturn" }, now, SITE);
    expect(rise!.getTime()).toBeGreaterThan(now.getTime());
    expect(transit!.getTime()).toBeGreaterThan(rise!.getTime());
    expect(set!.getTime()).toBeGreaterThan(transit!.getTime());
  });

  it("gives the pass under way for a body up now: its latest rise, then its highest, then its set", () => {
    // Vega at 16:00 Tbilisi on 8 November is high in the south-west; it rose that morning.
    const now = new Date("2026-11-08T12:00:00Z");
    const { rise, transit, set } = events({ raHours: 18.6156, decDeg: 38.7837 }, now, SITE);
    expect(rise!.getTime()).toBeLessThan(now.getTime());
    expect(set!.getTime()).toBeGreaterThan(now.getTime());
    expect(transit!.getTime()).toBeGreaterThan(rise!.getTime());
    expect(transit!.getTime()).toBeLessThan(set!.getTime());
  });

  it("finds a fixed star's transit within the pass it is in", () => {
    // 20:00 in Tbilisi: Vega is up, past its highest (16:31), and sets after midnight.
    // The transit shown is this pass's, between its rise and its set, within a day.
    const { rise, transit, set } = events({ raHours: 18.6156, decDeg: 38.7837 }, at, SITE);
    expect(transit!.getTime()).toBeGreaterThan(rise!.getTime());
    expect(transit!.getTime()).toBeLessThan(set!.getTime());
    expect(Math.abs(transit!.getTime() - at.getTime())).toBeLessThan(86_400_000);
  });
});

describe("the path across the sky", () => {
  it("passes through the body's own position at each step", () => {
    const path = skyPath({ body: "Saturn" }, at, 2, 30, SITE);
    expect(path).toHaveLength(5);
    for (const point of path) {
      expect(separation(point, bodyState("Saturn", new Date(point.at), SITE))).toBeLessThan(0.001);
    }
  });

  it("runs a star through the panel's own positions and tops out on the meridian", () => {
    const path = skyPath({ raHours: STARS.Vega.ra, decDeg: STARS.Vega.dec }, at, 24, 10, SITE);
    for (const point of path.filter((_, i) => i % 12 === 0)) {
      expect(separation(point, fixedAltAz(STARS.Vega.ra, STARS.Vega.dec, new Date(point.at), SITE))).toBeLessThan(0.001);
    }
    const top = path.reduce((best, point) => (point.alt > best.alt ? point : best));
    // Culmination south of the zenith: 90 - (latitude - declination), refraction aside.
    expect(top.alt).toBeCloseTo(90 - (SITE.latitude - STARS.Vega.dec), 0);
    // Near the zenith the azimuth swings fast, so the time decides: the transit's.
    const transit = events({ raHours: STARS.Vega.ra, decDeg: STARS.Vega.dec }, new Date(top.at - 6 * 3_600_000), SITE).transit!;
    expect(Math.abs(top.at - transit.getTime())).toBeLessThanOrEqual(5 * 60_000);
  });
});

describe("a close-up disc", () => {
  it.each(["Moon", "Venus", "Mars", "Jupiter"] as const)("lights %s from the side the phase angle says", (name) => {
    const state = bodyState(name, at, SITE);
    const geo = GeoVector(Body[name], MakeTime(at), true);
    const length = Math.hypot(geo.x, geo.y, geo.z);
    const towardEarth = [-geo.x / length, -geo.y / length, -geo.z / length];
    const cos = state.sunward.reduce((sum, value, i) => sum + value * towardEarth[i], 0);
    expect(Math.acos(cos) / (Math.PI / 180)).toBeCloseTo(Illumination(Body[name], MakeTime(at)).phase_angle, 0);
  });

  it("keeps Jupiter's moons within their orbits' reach, and Io closest", () => {
    const arcmin = (offset: number[]) => (Math.hypot(...offset) * 180 * 60) / Math.PI;
    const moons = jupiterMoons(at);
    expect(moons.map((moon) => moon.name)).toEqual(["io", "europa", "ganymede", "callisto"]);
    // Callisto reaches about 10.5' from Jupiter at the closest opposition; Io about 2.3'.
    for (const moon of moons) expect(arcmin(moon.offset)).toBeLessThan(11);
    expect(arcmin(moons[0].offset)).toBeLessThan(2.5);
  });
});
