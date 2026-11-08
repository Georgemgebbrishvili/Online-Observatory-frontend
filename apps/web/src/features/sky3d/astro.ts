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
  Body,
  DefineStar,
  Equator,
  Horizon,
  Illumination,
  MakeTime,
  Observer,
  Refraction,
  Rotation_EQJ_HOR,
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

/** Apparent alt/az of a J2000 direction through the matrix, as the shader computes it. */
export function horizontal(vec: Vec3, matrix: number[]): AltAz {
  const [x, y, z] = vec;
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
const AU_KM = 149_597_870.7;

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
  /** 0..1 lit; the phase angle in degrees. */
  litFraction: number;
  phaseAngle: number;
  /** Saturn's ring opening, degrees. */
  ringTilt?: number;
};

/** One body, exactly as astronomy-engine gives it. */
export function bodyState(name: SkyBodyName, date: Date, site: Site): BodyState {
  const time = MakeTime(date);
  const observer = observerOf(site);
  const body = Body[name];
  const eq = Equator(body, time, observer, true, true);
  const hor = Horizon(time, observer, eq.ra, eq.dec, "normal");
  const ill = Illumination(body, time);
  return {
    name,
    alt: hor.altitude,
    az: hor.azimuth,
    raHours: eq.ra,
    decDeg: eq.dec,
    magnitude: ill.mag,
    radiusDeg: Math.atan(RADIUS_KM[name] / (eq.dist * AU_KM)) / DEG,
    litFraction: name === "Sun" ? 1 : ill.phase_fraction,
    phaseAngle: name === "Sun" ? 0 : ill.phase_angle,
    ...(ill.ring_tilt !== undefined && { ringTilt: ill.ring_tilt }),
  };
}

export function bodies(date: Date, site: Site) {
  return SKY_BODIES.map((name) => bodyState(name, date, site));
}

/** Saturn's north pole, J2000 (IAU WGCCRE): the ring plane's normal. */
export const SATURN_POLE = unitJ2000(40.589 / 15, 83.537);

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
  const sun = Math.min(1, Math.max(0, (sunAlt + 18) / 18.833)) ** 2.2;
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

/** Of-date apparent position of a J2000 object, through astronomy-engine's own Horizon. */
export function fixedAltAz(raHours: number, decDeg: number, date: Date, site: Site): AltAz {
  DefineStar(STAR_SLOT, raHours, decDeg, 1000);
  const time = MakeTime(date);
  const observer = observerOf(site);
  const eq = Equator(STAR_SLOT, time, observer, true, false);
  const hor = Horizon(time, observer, eq.ra, eq.dec, "normal");
  return { alt: hor.altitude, az: hor.azimuth };
}
