/**
 * The Night Sky's astronomy (ADR-085). Every position comes from astronomy-engine: the Sun,
 * Moon and planets through `Equator` and `Horizon`, the stars through one rotation matrix
 * `Rotation_EQJ_HOR` per frame plus the refraction `Horizon` applies. The renderer's shader
 * repeats `horizontal()` below; the tests hold the two to astronomy-engine within 0.01°.
 *
 * World frame for the renderer: x east, y up (zenith), z south, so the default camera,
 * looking down -z, faces north.
 */
import {
  BaryState,
  Body,
  C_AUDAY,
  Constellation,
  DefineStar,
  Equator,
  GeoVector,
  HelioVector,
  Horizon,
  Illumination,
  JupiterMoons,
  MakeTime,
  Observer,
  Refraction,
  CombineRotation,
  Rotation_EQD_HOR,
  Rotation_EQJ_EQD,
  Rotation_EQJ_HOR,
  RotationMatrix,
  SearchHourAngle,
  SearchRiseSet,
} from "astronomy-engine";

import { tbilisi } from "@/features/booking/almanac";

const DEG = Math.PI / 180;

/** The observatory's site, the page's default observer (almanac.ts). */
export const SITE = { latitude: tbilisi.latitude, longitude: tbilisi.longitude, height: tbilisi.height };

export type Site = { latitude: number; longitude: number; height: number };
export type Vec3 = [number, number, number];
export type AltAz = { alt: number; az: number };

export const observerOf = (site: Site) => new Observer(site.latitude, site.longitude, site.height);

/** J2000 unit vector for RA (hours) and Dec (degrees). */
export function unitJ2000(raHours: number, decDeg: number): Vec3 {
  const ra = raHours * 15 * DEG;
  const dec = decDeg * DEG;
  return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
}

/**
 * EQJ -> HOR (x north, y west, z zenith) as nine numbers in column-major order, ready for a
 * GLSL mat3 or three's Matrix3.fromArray: out = M * v with M[j][i] = rot[i][j].
 */
export function horizonMatrix(date: Date, site: Site): number[] {
  const { rot } = Rotation_EQJ_HOR(MakeTime(date), observerOf(site));
  return [...rot[0], ...rot[1], ...rot[2]];
}

/** Degrees of refraction lift at true altitude `alt`, astronomy-engine's "normal" model. */
export function refraction(alt: number) {
  return Refraction("normal", alt);
}

/**
 * Annual aberration: the Earth's velocity over the speed of light, J2000. Added to a star's
 * unit vector it leans the star up to 20.5″ the way the Earth is going, as astronomy-engine
 * already leans the planets, so a star and a planet keep their true distance apart.
 */
export function aberration(date: Date): Vec3 {
  const earth = BaryState(Body.Earth, MakeTime(date));
  return [earth.vx / C_AUDAY, earth.vy / C_AUDAY, earth.vz / C_AUDAY];
}

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
  for (let i = 0; i < n; i++) {
    const [x, y, z] = unitJ2000(ra[i] / 360_000, dec[i] / 36_000);
    out.set([x, y, z, v[i] / 100, bv[i] / 1000, pmRa[i] / 1000, pmDec[i] / 1000], i * CATALOGUE_RECORD);
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
    const length = Math.hypot(nx, ny, nz) || 1;
    out.set([nx / length, ny / length, nz / length, catalogue[at + 3], catalogue[at + 4]], i * 5);
  }
  return out;
}

/**
 * Apparent alt/az of a J2000 direction through the matrix, as the shader computes it. With
 * `lean` (see `aberration`) the direction is the star's as the moving Earth sees it.
 */
export function horizontal(vec: Vec3, matrix: number[], lean?: Vec3): AltAz {
  let [x, y, z] = vec;
  if (lean) {
    x += lean[0];
    y += lean[1];
    z += lean[2];
    const length = Math.hypot(x, y, z);
    x /= length;
    y /= length;
    z /= length;
  }
  const north = matrix[0] * x + matrix[3] * y + matrix[6] * z;
  const west = matrix[1] * x + matrix[4] * y + matrix[7] * z;
  const up = matrix[2] * x + matrix[5] * y + matrix[8] * z;
  const alt = Math.asin(Math.max(-1, Math.min(1, up))) / DEG;
  const az = ((Math.atan2(-west, north) / DEG) % 360 + 360) % 360;
  return { alt: alt + refraction(alt), az };
}

/** The renderer's world direction (x east, y up, z south) for an apparent alt/az. */
export function worldOf({ alt, az }: AltAz): Vec3 {
  const a = alt * DEG;
  const z = az * DEG;
  return [Math.cos(a) * Math.sin(z), Math.sin(a), -Math.cos(a) * Math.cos(z)];
}

export function altAzOf([x, y, z]: Vec3): AltAz {
  const length = Math.hypot(x, y, z) || 1;
  const alt = Math.asin(Math.max(-1, Math.min(1, y / length))) / DEG;
  const az = ((Math.atan2(x, -z) / DEG) % 360 + 360) % 360;
  return { alt, az };
}

export type SkyBodyName =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune";

export const SKY_BODIES: SkyBodyName[] = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

/** Equatorial radii (km), for apparent size. */
const RADIUS_KM: Record<SkyBodyName, number> = {
  Sun: 695_700,
  Moon: 1_737.4,
  Mercury: 2_439.7,
  Venus: 6_051.8,
  Mars: 3_396.2,
  Jupiter: 71_492,
  Saturn: 60_268,
  Uranus: 25_559,
  Neptune: 24_764,
};
export const AU_KM = 149_597_870.7;

export type BodyState = {
  name: SkyBodyName;
  /** Apparent, topocentric, of date, refracted. */
  alt: number;
  az: number;
  /** Of-date, topocentric. */
  raHours: number;
  decDeg: number;
  magnitude: number;
  /** Apparent radius, degrees. */
  radiusDeg: number;
  /** From the observer, astronomical units. */
  distanceAu: number;
  /** 0..1 lit; the phase angle in degrees. */
  litFraction: number;
  phaseAngle: number;
  /** Saturn's ring opening, degrees. */
  ringTilt?: number;
  /** J2000 unit vector from the body to the Sun: which side of its disc is lit. */
  sunward: Vec3;
};

/** One body, exactly as astronomy-engine gives it. */
export function bodyState(name: SkyBodyName, date: Date, site: Site): BodyState {
  const time = MakeTime(date);
  const observer = observerOf(site);
  const body = Body[name];
  const eq = Equator(body, time, observer, true, true);
  const hor = Horizon(time, observer, eq.ra, eq.dec, "normal");
  const ill = Illumination(body, time);
  const helio = name === "Sun" ? { x: 0, y: 0, z: 1 } : HelioVector(body, time);
  const length = Math.hypot(helio.x, helio.y, helio.z) || 1;
  return {
    name,
    alt: hor.altitude,
    az: hor.azimuth,
    raHours: eq.ra,
    decDeg: eq.dec,
    magnitude: ill.mag,
    radiusDeg: Math.atan(RADIUS_KM[name] / (eq.dist * AU_KM)) / DEG,
    distanceAu: eq.dist,
    litFraction: name === "Sun" ? 1 : ill.phase_fraction,
    phaseAngle: name === "Sun" ? 0 : ill.phase_angle,
    ...(ill.ring_tilt !== undefined && { ringTilt: ill.ring_tilt }),
    sunward: [-helio.x / length, -helio.y / length, -helio.z / length],
  };
}

/** The constellation a J2000 place lies in, by its IAU abbreviation and Latin name. */
export function constellationAt(raHours: number, decDeg: number) {
  const { symbol, name } = Constellation(raHours, decDeg);
  return { id: symbol, name };
}

/** The constellation a body stands in at an instant. */
export function constellationOfBody(name: SkyBodyName, date: Date, site: Site) {
  const eq = Equator(Body[name], MakeTime(date), observerOf(site), false, true);
  return constellationAt(eq.ra, eq.dec);
}

export function bodies(date: Date, site: Site) {
  return SKY_BODIES.map((name) => bodyState(name, date, site));
}

/** Saturn's north pole, J2000 (IAU WGCCRE): the ring plane's normal. */
export const SATURN_POLE = unitJ2000(40.589 / 15, 83.537);

/**
 * North poles, J2000 (IAU WGCCRE 2015; the Moon's mean pole), so a close-up disc turns as
 * the body does on the sky.
 */
export const POLES: Record<SkyBodyName, Vec3> = {
  Sun: unitJ2000(286.13 / 15, 63.87),
  Moon: unitJ2000(269.9949 / 15, 66.5392),
  Mercury: unitJ2000(281.0103 / 15, 61.4155),
  Venus: unitJ2000(272.76 / 15, 67.16),
  Mars: unitJ2000(317.681 / 15, 52.887),
  Jupiter: unitJ2000(268.057 / 15, 64.495),
  Saturn: SATURN_POLE,
  Uranus: unitJ2000(257.311 / 15, -15.175),
  Neptune: unitJ2000(299.36 / 15, 43.46),
};

export type MoonOfJupiter = "io" | "europa" | "ganymede" | "callisto";
const JUPITER_RADIUS_AU = 71_492 / AU_KM;
const LIGHT_DAYS_PER_AU = 499.004784 / 86_400;

/**
 * Jupiter's four large moons as seen from the Earth: each one's J2000 offset from
 * Jupiter's own direction (a small vector, radians), and whether Jupiter hides it.
 * The moons are placed where they were when their light left, as Jupiter is.
 */
export function jupiterMoons(date: Date): { name: MoonOfJupiter; offset: Vec3; hidden: boolean }[] {
  const time = MakeTime(date);
  const jupiter = GeoVector(Body.Jupiter, time, true);
  const distance = Math.hypot(jupiter.x, jupiter.y, jupiter.z);
  const toward: Vec3 = [jupiter.x / distance, jupiter.y / distance, jupiter.z / distance];
  const moons = JupiterMoons(time.AddDays(-distance * LIGHT_DAYS_PER_AU));
  return (["io", "europa", "ganymede", "callisto"] as const).map((name) => {
    const { x, y, z } = moons[name];
    const sum: Vec3 = [jupiter.x + x, jupiter.y + y, jupiter.z + z];
    const length = Math.hypot(...sum);
    const along = x * toward[0] + y * toward[1] + z * toward[2];
    const across = Math.sqrt(Math.max(0, x * x + y * y + z * z - along * along));
    return {
      name,
      offset: [sum[0] / length - toward[0], sum[1] / length - toward[1], sum[2] / length - toward[2]],
      hidden: along > 0 && across < JUPITER_RADIUS_AU,
    };
  });
}

export type SkyState = "day" | "civil" | "nautical" | "astronomical" | "night";

/** The sky by the Sun's apparent altitude: sunrise/sunset at −0.833°, then −6, −12, −18. */
export function skyState(sunAlt: number): SkyState {
  if (sunAlt > -0.833) return "day";
  if (sunAlt > -6) return "civil";
  if (sunAlt > -12) return "nautical";
  if (sunAlt > -18) return "astronomical";
  return "night";
}

/**
 * How bright the sky is, 0 (dark) to 1 (full day), from the Sun and the Moon: a smooth
 * ramp through twilight, and the Moon's light by its phase and height.
 */
export function skyBrightness(sunAlt: number, moon?: { alt: number; litFraction: number }) {
  // Steep through twilight, as the sky's light falls about tenfold for every two or three
  // degrees the Sun sinks: by the end of civil twilight the second-magnitude stars are out.
  const sun = Math.min(1, Math.max(0, (sunAlt + 18) / 18.833)) ** 3.2;
  const moonLight = moon && moon.alt > 0 ? 0.12 * moon.litFraction * Math.sin(Math.min(moon.alt, 60) * DEG) / Math.sin(60 * DEG) : 0;
  return Math.min(1, sun + moonLight);
}

/** The faintest star the sky lets through at this brightness (naked-eye scale). */
export function limitingMagnitude(brightness: number) {
  return 6.5 - 8.5 * Math.sqrt(brightness);
}

/** A star's colour from B−V: blue-white through white to orange, as the eye sees it. */
export function colourOfBv(bv: number): Vec3 {
  const stops: [number, Vec3][] = [
    [-0.4, [0.62, 0.72, 1]],
    [0, [0.82, 0.88, 1]],
    [0.4, [1, 0.98, 0.94]],
    [0.8, [1, 0.9, 0.74]],
    [1.2, [1, 0.8, 0.58]],
    [1.6, [1, 0.7, 0.45]],
    [2.2, [1, 0.6, 0.36]],
  ];
  if (bv <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [b1, c1] = stops[i];
    const [b0, c0] = stops[i - 1];
    if (bv <= b1) {
      const t = (bv - b0) / (b1 - b0);
      return [0, 1, 2].map((k) => c0[k] + (c1[k] - c0[k]) * t) as Vec3;
    }
  }
  return stops.at(-1)![1];
}

export type Events = { rise: Date | null; transit: Date | null; set: Date | null };

const STAR_SLOT = Body.Star1;

/**
 * Tonight's rise, transit and set, searched from `from` over the next day. A fixed object
 * (J2000 RA/Dec) is defined as a user star first, so astronomy-engine searches it the same
 * way it searches a planet.
 */
/**
 * One pass over the horizon, in order. Up now: the rise it is still in, its highest, and
 * the set ahead. Down now: its next rise, then the highest and set after it. A body that
 * never rises or never sets has no rise and set, only its next highest.
 */
export function events(
  target: { body: SkyBodyName } | { raHours: number; decDeg: number },
  now: Date,
  site: Site,
): Events {
  const observer = observerOf(site);
  let body: Body;
  if ("body" in target) {
    body = Body[target.body];
  } else {
    DefineStar(STAR_SLOT, target.raHours, target.decDeg, 1000);
    body = STAR_SLOT;
  }
  const at = (time: { date: Date } | null) => (time ? time.date : null);
  const nextRise = at(SearchRiseSet(body, observer, +1, now, 1));
  const nextSet = at(SearchRiseSet(body, observer, -1, now, 1));
  const upNow = nextSet !== null && (nextRise === null || nextSet < nextRise);
  const rise = upNow ? at(SearchRiseSet(body, observer, +1, now, -1)) : nextRise;
  const passStart = rise ?? now;
  return {
    rise,
    transit: at(SearchHourAngle(body, observer, 0, passStart).time),
    set: upNow ? nextSet : nextRise && at(SearchRiseSet(body, observer, -1, nextRise, 1)),
  };
}

/** The next rise after `from` within a day, or null (up all day, or not rising). */
export function nextRise(target: { body: SkyBodyName } | { raHours: number; decDeg: number }, from: Date, site: Site) {
  let body: Body;
  if ("body" in target) {
    body = Body[target.body];
  } else {
    DefineStar(STAR_SLOT, target.raHours, target.decDeg, 1000);
    body = STAR_SLOT;
  }
  return SearchRiseSet(body, observerOf(site), +1, from, 1)?.date ?? null;
}

export type PathPoint = { at: number; alt: number; az: number };

/**
 * Where an object stands, step by step, from `from` over `hours`: its daily path across
 * this site's sky (apparent, refracted). A body moves along the stars as it goes, so each
 * step is its own position, not a turned copy of the first.
 */
export function skyPath(
  target: { body: SkyBodyName } | { raHours: number; decDeg: number },
  from: Date,
  hours: number,
  stepMinutes: number,
  site: Site,
): PathPoint[] {
  const observer = observerOf(site);
  const points: PathPoint[] = [];
  const steps = Math.round((hours * 60) / stepMinutes);
  for (let i = 0; i <= steps; i++) {
    const at = from.getTime() + i * stepMinutes * 60_000;
    if ("body" in target) {
      const time = MakeTime(new Date(at));
      const eq = Equator(Body[target.body], time, observer, true, true);
      const hor = Horizon(time, observer, eq.ra, eq.dec, "normal");
      points.push({ at, alt: hor.altitude, az: hor.azimuth });
    } else {
      // The very point the panel and the drawn star give.
      points.push({ at, ...fixedAltAz(target.raHours, target.decDeg, new Date(at), site) });
    }
  }
  return points;
}

/**
 * Apparent position of a J2000 object: precessed, nutated, leaned by aberration and
 * refracted, the same sum the star shader draws.
 */
export function fixedAltAz(raHours: number, decDeg: number, date: Date, site: Site): AltAz {
  return horizontal(unitJ2000(raHours, decDeg), horizonMatrix(date, site), aberration(date));
}

/** The Earth's turn against the stars, radians a millisecond. */
const SIDEREAL_PER_MS = (2 * Math.PI * 1.00273781191135448) / 86_400_000;

const flat = (rotation: RotationMatrix) => [...rotation.rot[0], ...rotation.rot[1], ...rotation.rot[2]];

/**
 * The sky worked out in full at one instant: the slow parts -- precession and nutation,
 * aberration, the bodies' places among the stars, Jupiter's moons -- that a frame a few
 * hundred milliseconds later can reuse (see `skyAt`).
 */
export type SkySnapshot = {
  at: number;
  site: Site;
  eqjEqd: RotationMatrix;
  eqdHor: RotationMatrix;
  lean: Vec3;
  states: BodyState[];
  /** Each body's direction of date (topocentric, apparent), unrefracted. */
  directions: Vec3[];
  moons: ReturnType<typeof jupiterMoons>;
};

export function skySnapshot(date: Date, site: Site): SkySnapshot {
  const time = MakeTime(date);
  const states = bodies(date, site);
  return {
    at: date.getTime(),
    site,
    eqjEqd: Rotation_EQJ_EQD(time),
    eqdHor: Rotation_EQD_HOR(time, observerOf(site)),
    lean: aberration(date),
    states,
    directions: states.map((state) => unitJ2000(state.raHours, state.decDeg)),
    moons: jupiterMoons(date),
  };
}

/**
 * The sky at `date` from a snapshot taken within a second or so: the snapshot's frame
 * turned by the Earth's rotation since, which is all that changes visibly in that time.
 * The Moon, the fastest, moves half an arcsecond a second against the stars.
 */
export function skyAt(snapshot: SkySnapshot, date: Date) {
  const angle = (date.getTime() - snapshot.at) * SIDEREAL_PER_MS;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  // Equator of date turned east by the Earth's spin, then to the horizon.
  const eqdHor = CombineRotation(
    new RotationMatrix([
      [c, -s, 0],
      [s, c, 0],
      [0, 0, 1],
    ]),
    snapshot.eqdHor,
  );
  const matrix = flat(CombineRotation(snapshot.eqjEqd, eqdHor));
  const eqd = flat(eqdHor);
  const states = snapshot.states.map((state, i) => {
    const { alt, az } = horizontal(snapshot.directions[i], eqd);
    return { ...state, alt, az };
  });
  return { matrix, eqdMatrix: eqd, lean: snapshot.lean, states, moons: snapshot.moons };
}
