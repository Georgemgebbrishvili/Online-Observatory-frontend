/**
 * The Night Sky's three.js scene (ADR-085, amended 2026-11-08). Loaded only by night-sky.tsx,
 * in the browser. Stars and constellation lines are J2000 unit vectors uploaded once; each
 * frame one EQJ->HOR matrix turns them, and the shader adds astronomy-engine's refraction
 * (the same sum as `horizontal()` in features/sky3d/astro.ts). Labels are DOM, placed with
 * `screenOf`; the selected object's path and marker are drawn on a 2D overlay the same way.
 *
 * Close up, a planet is its photograph on a disc at its true apparent size, turned to its
 * pole and lit from the Sun's side, so its phase is right; Saturn is a globe and rings in
 * 3D, so their tilt is right; deep-sky showpieces are their painted plates at true size.
 */
import { MakeTime, Rotation_EQD_HOR } from "astronomy-engine";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  LinearFilter,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Quaternion,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";

import {
  POLES,
  bodies,
  colourOfBv,
  horizonMatrix,
  horizontal,
  jupiterMoons,
  limitingMagnitude,
  observerOf,
  skyBrightness,
  worldOf,
  type AltAz,
  type BodyState,
  type MoonOfJupiter,
  type Site,
  type SkyBodyName,
  type Vec3,
} from "@/features/sky3d/astro";
import { FOV, clampView, screenOf, type View } from "@/features/sky3d/projection";
import { PLATE_SPAN_ARCMIN } from "@/lib/observatory-sim/sky-field";
import { nightSkyArt, withAlpha } from "@/styles/tokens";

export type Toggles = {
  lines: boolean;
  names: boolean;
  planets: boolean;
  path: boolean;
  altaz: boolean;
  equatorial: boolean;
  milkyway: boolean;
  atmosphere: boolean;
  ground: boolean;
};

export type Constellation = { id: string; name: string; label: Vec3; lines: number[][] };

/** Something on the sky that can be labelled, searched and tapped. */
export type SkyThing =
  | { kind: "body"; id: SkyBodyName; name: string }
  | {
      kind: "fixed";
      id: string;
      name: string;
      type: "star" | "galaxy" | "nebula" | "cluster";
      raHours: number;
      decDeg: number;
      magnitude: number | null;
      /** Labelled even when not picked (named stars, showpieces). */
      labelled: boolean;
    }
  | { kind: "constellation"; id: string; name: string; label: Vec3 };

export type Frame = {
  date: Date;
  site: Site;
  view: View;
  toggles: Toggles;
  compass: { N: string; E: string; S: string; W: string };
  selected: string | null;
  /** Keep the selected object at the centre: the view follows it as the sky turns. */
  track?: boolean;
};

/** The selected object's path for the overlay: steps across the sky, and its events. */
export type PathOverlay = {
  points: { at: number; alt: number; az: number }[];
  marks: { alt: number; az: number; label: string }[];
  hourLabel: (at: number) => string;
};

const D = { sky: 0.97, plates: 0.955, milky: 0.98, lines: 0.965, bodies: 0.94, ground: 0.9, back: 5 } as const;
const DEG = Math.PI / 180;

const REFRACT = /* glsl */ `
  uniform mat3 uEqjHor;
  float refr(float alt) {
    if (alt < -90.0 || alt > 90.0) return 0.0;
    float hd = max(alt, -1.0);
    float r = (1.02 / tan(radians(hd + 10.3 / (hd + 5.11)))) / 60.0;
    if (alt < -1.0) r *= (alt + 90.0) / 89.0;
    return r;
  }
  // J2000 unit vector -> world (x east, y up, z south), apparent (refracted).
  vec3 toWorld(vec3 j) {
    vec3 h = uEqjHor * j;
    float alt = degrees(asin(clamp(h.z, -1.0, 1.0)));
    float a2 = radians(alt + refr(alt));
    vec2 flat2 = h.xy;
    float len = length(flat2);
    vec2 dir = len > 1e-9 ? flat2 / len : vec2(1.0, 0.0);
    vec3 h2 = vec3(dir * cos(a2), sin(a2));
    return vec3(-h2.y, h2.z, -h2.x);
  }
`;

/** A star's light: a sharp core, and for a bright one a wide soft halo, as the eye sees it. */
const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vTint;
  varying float vAlpha;
  varying float vHalo;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(p, p);
    if (r2 > 1.0) discard;
    float sharp = mix(4.0, 9.0, vHalo);
    float core = exp(-r2 * sharp);
    float halo = vHalo * 0.55 * exp(-r2 * 2.6) * (1.0 - r2);
    float light = core + halo;
    gl_FragColor = vec4(vTint * light, light * vAlpha);
  }
`;

function starMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uEqjHor: { value: new Matrix3() },
      uLimit: { value: 6.5 },
      uScale: { value: 1 },
      uBelow: { value: 0 },
      uTime: { value: 0 },
      uTwinkle: { value: 1 },
      uExtinction: { value: 1 },
    },
    vertexShader: /* glsl */ `
      ${REFRACT}
      attribute float mag;
      attribute vec3 tint;
      uniform float uLimit;
      uniform float uScale;
      uniform float uBelow;
      uniform float uTime;
      uniform float uTwinkle;
      uniform float uExtinction;
      varying vec3 vTint;
      varying float vAlpha;
      varying float vHalo;
      void main() {
        vec3 w = toWorld(position);
        // Extinction: a star near the horizon shines through more air, fainter and redder.
        float s = max(w.y, 0.0);
        float airmass = 1.0 / (s + 0.025 * exp(-11.0 * s));
        float m = mag + uExtinction * 0.22 * (min(airmass, 30.0) - 1.0);
        float d = uLimit - m;
        // Scintillation: stronger low down, never for reduced motion (uTwinkle 0).
        float seed = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453);
        float low = clamp((airmass - 1.0) / 4.0 + 0.12, 0.0, 1.0);
        float twinkle = 1.0 + uTwinkle * low * 0.45 * sin(uTime * (5.0 + seed * 9.0) + seed * 60.0);
        vAlpha = clamp(d, 0.0, 1.0) * twinkle * ((w.y < 0.0 && uBelow < 0.5) ? 0.0 : 1.0);
        vHalo = clamp((d - 3.2) / 4.0, 0.0, 1.0);
        vTint = mix(tint, tint * vec3(1.0, 0.82, 0.62), uExtinction * clamp((airmass - 2.0) / 10.0, 0.0, 0.8));
        gl_PointSize = vAlpha <= 0.0 ? 0.0 : clamp(1.9 + d + 7.0 * vHalo, 1.9, 34.0) * uScale;
        gl_Position = projectionMatrix * viewMatrix * vec4(w * ${D.sky.toFixed(3)}, 1.0);
      }
    `,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

/** Planets too small to show a disc, and Jupiter's moons: points of light, like stars. */
function glowMaterial() {
  return new ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute vec3 tint;
      attribute float size;
      attribute float alpha;
      attribute float halo;
      varying vec3 vTint;
      varying float vAlpha;
      varying float vHalo;
      void main() {
        vTint = tint;
        vAlpha = alpha;
        vHalo = halo;
        gl_PointSize = alpha <= 0.0 ? 0.0 : size;
        gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

function lineMaterial(colour: string) {
  return new ShaderMaterial({
    uniforms: { uEqjHor: { value: new Matrix3() }, uColour: { value: new Color(colour) }, uAlpha: { value: 0.5 } },
    vertexShader: /* glsl */ `
      ${REFRACT}
      void main() { gl_Position = projectionMatrix * viewMatrix * vec4(toWorld(position) * ${D.lines.toFixed(3)}, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uAlpha;
      void main() { gl_FragColor = vec4(uColour, uAlpha); }
    `,
    transparent: true,
    depthWrite: false,
  });
}

function milkyMaterial() {
  return new ShaderMaterial({
    uniforms: { uEqjHor: { value: new Matrix3() }, uMap: { value: null }, uAlpha: { value: 0.5 } },
    vertexShader: /* glsl */ `
      ${REFRACT}
      varying vec3 vJ;
      void main() { vJ = position; gl_Position = projectionMatrix * viewMatrix * vec4(toWorld(position) * ${D.milky.toFixed(3)}, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uAlpha;
      varying vec3 vJ;
      void main() {
        vec3 j = normalize(vJ);
        vec2 uv = vec2(atan(j.y, j.x) / 6.2831853 + 0.5, asin(clamp(j.z, -1.0, 1.0)) / 3.1415927 + 0.5);
        float v = texture2D(uMap, uv).r;
        gl_FragColor = vec4(vec3(0.80, 0.84, 0.95) * v, v * uAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: BackSide,
  });
}

/**
 * The sky's own light: near-black overhead and a faint city glow low down at night; blue by
 * day, paler toward the horizon; at twilight a warm band low on the Sun's side.
 */
function atmosphereMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uSun: { value: new Vector3(0, -1, 0) },
      uBright: { value: 0 },
      uOn: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      uniform float uBright;
      uniform float uOn;
      varying vec3 vDir;
      void main() {
        if (uOn < 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        vec3 sun = normalize(uSun);
        float h = clamp(vDir.y, 0.0, 1.0);
        float low = exp(-h * 7.0);
        vec3 night = mix(vec3(0.006, 0.009, 0.022), vec3(0.050, 0.056, 0.082), low);
        vec3 day = mix(vec3(0.16, 0.36, 0.74), vec3(0.72, 0.81, 0.93), pow(1.0 - h, 3.0));
        vec3 sky = mix(night, day, uBright);
        // Twilight: strongest with the Sun a few degrees down, on its side of the sky.
        float sunAlt = sun.y;
        float twilight = smoothstep(-0.31, -0.06, sunAlt) * (1.0 - smoothstep(0.02, 0.22, sunAlt));
        vec2 flatDir = normalize(vDir.xz + vec2(1e-5));
        vec2 flatSun = normalize(sun.xz + vec2(1e-5));
        float side = pow(0.5 + 0.5 * dot(flatDir, flatSun), 2.5);
        vec3 band = mix(vec3(1.0, 0.46, 0.16), vec3(0.42, 0.30, 0.58), smoothstep(0.0, 0.32, h));
        sky += band * exp(-h * 4.5) * twilight * side * 0.55;
        float glow = max(dot(vDir, sun), 0.0);
        sky += vec3(1.0, 0.93, 0.80) * (pow(glow, 40.0) * 0.35 + pow(glow, 900.0)) * smoothstep(-0.05, 0.02, sunAlt);
        gl_FragColor = vec4(sky, 1.0);
      }
    `,
    side: BackSide,
    depthWrite: false,
  });
}

/**
 * A close-up disc. Mode 0 samples a photograph (rect: the photo's disc in UV), mode 1 is a
 * plain cloud-deck (Venus), mode 2 the Sun's limb-darkened face. Lit as a sphere from uSun,
 * given in the disc's own frame (x right, y the body's north, z toward the viewer).
 */
function discMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uMap: { value: null as Texture | null },
      uRect: { value: new Vector4(0.5, 0.5, 0.5, 0.5) },
      uMode: { value: 1 },
      uColour: { value: new Color(1, 1, 1) },
      uSun: { value: new Vector3(0, 0, 1) },
      uEdge: { value: 0.1 },
      uAmbient: { value: 0 },
      uSky: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec4 uRect;
      uniform float uMode;
      uniform vec3 uColour;
      uniform vec3 uSun;
      uniform float uEdge;
      uniform float uAmbient;
      uniform float uSky;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        if (r > 1.0) discard;
        float alpha = 1.0 - smoothstep(1.0 - uEdge, 1.0, r);
        vec3 n = vec3(vP, sqrt(max(0.0, 1.0 - r * r)));
        if (uMode > 1.5) {
          gl_FragColor = vec4(uColour * (0.42 + 0.58 * pow(n.z, 0.45)), alpha);
          return;
        }
        vec3 surface = uMode < 0.5
          ? texture2D(uMap, vec2(uRect.x + vP.x * uRect.z, uRect.y + vP.y * uRect.w)).rgb
          : uColour * (0.78 + 0.22 * n.z);
        float lit = smoothstep(-0.04, 0.12, dot(n, normalize(uSun)));
        // At night the dark side hides the stars behind it; by day the sky shows through it.
        gl_FragColor = vec4(surface * (lit + uAmbient), alpha * mix(1.0, lit, uSky));
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

const SATURN_RING = /* glsl */ `
  // Radial opacity of the rings, in Saturn radii: C, B, the Cassini Division, A and Encke.
  float ringOpacity(float r) {
    if (r < 1.239 || r > 2.27) return 0.0;
    float o;
    if (r < 1.527) o = 0.13 + 0.05 * sin(r * 90.0);
    else if (r < 1.951) o = mix(0.62, 0.95, smoothstep(1.53, 1.70, r)) + 0.04 * sin(r * 230.0);
    else if (r < 2.025) o = 0.08;
    else if (r > 2.214 && r < 2.222) o = 0.05;
    else o = 0.58 + 0.04 * sin(r * 170.0);
    return clamp(o, 0.0, 1.0);
  }
`;

function saturnGlobeMaterial() {
  return new ShaderMaterial({
    uniforms: { uSun: { value: new Vector3(0, 0, 1) }, uView: { value: new Vector3(0, 0, 1) } },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vP = position; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      ${SATURN_RING}
      uniform vec3 uSun;
      uniform vec3 uView;
      varying vec3 vP;
      void main() {
        vec3 n = normalize(vP);
        float b = n.y;
        vec3 zone = vec3(0.90, 0.81, 0.60);
        vec3 belt = vec3(0.74, 0.62, 0.42);
        float bands = (0.5 + 0.5 * sin(b * 23.0 + 0.6)) * smoothstep(0.92, 0.25, abs(b));
        vec3 col = mix(zone, belt, bands * 0.45);
        col = mix(col, vec3(0.60, 0.62, 0.58), smoothstep(0.78, 0.95, abs(b)));
        col *= 0.55 + 0.45 * pow(max(dot(n, uView), 0.0), 0.35);
        vec3 s = normalize(uSun);
        float lit = smoothstep(-0.03, 0.10, dot(n, s));
        // The rings' shadow on the globe.
        if (abs(s.y) > 1e-4) {
          float t = -n.y / s.y;
          if (t > 0.0) lit *= 1.0 - 0.85 * ringOpacity(length((n + t * s).xz));
        }
        gl_FragColor = vec4(col * lit, 1.0);
      }
    `,
  });
}

function saturnRingMaterial() {
  return new ShaderMaterial({
    uniforms: { uSun: { value: new Vector3(0, 0, 1) }, uView: { value: new Vector3(0, 0, 1) } },
    vertexShader: /* glsl */ `
      varying vec3 vP;
      void main() { vP = position; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      ${SATURN_RING}
      uniform vec3 uSun;
      uniform vec3 uView;
      varying vec3 vP;
      void main() {
        float r = length(vP.xz);
        float o = ringOpacity(r);
        if (o <= 0.0) discard;
        vec3 s = normalize(uSun);
        vec3 col = r < 1.527 ? vec3(0.62, 0.58, 0.52) : vec3(0.88, 0.81, 0.66);
        // Seen from the unlit face, the rings only glow with what they let through.
        float face = sign(s.y) == sign(uView.y) ? 1.0 : 0.3;
        // The globe's shadow across the rings.
        float tc = -dot(vP, s);
        float shade = (tc > 0.0 && dot(vP, vP) - tc * tc < 1.0) ? 0.06 : 1.0;
        gl_FragColor = vec4(col * face * shade, o);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
}

/** A painted deep-sky plate, added to the sky's light and faded toward its own edge. */
function plateMaterial() {
  return new ShaderMaterial({
    uniforms: { uMap: { value: null as Texture | null }, uAlpha: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uAlpha;
      varying vec2 vUv;
      void main() {
        vec2 p = abs(vUv * 2.0 - 1.0);
        float edge = 1.0 - smoothstep(0.82, 1.0, max(p.x, p.y));
        vec3 c = texture2D(uMap, vUv).rgb;
        gl_FragColor = vec4(c * uAlpha * edge, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

/** The halo around the Sun, and the Moon's when it is bright. */
function haloMaterial(colour: string) {
  return new ShaderMaterial({
    uniforms: { uColour: { value: asWritten(colour) }, uAlpha: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uAlpha;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        if (r > 1.0) discard;
        float glow = exp(-r * 7.0) * 0.7 + exp(-r * 2.5) * 0.25;
        gl_FragColor = vec4(uColour * glow * uAlpha * (1.0 - r), 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

/**
 * A palette colour as the shaders here want it: its sRGB values as they stand. three turns
 * a hex into linear light, and these ShaderMaterials write their output without converting
 * back, so a linear colour would come out dark and over-saturated.
 */
function asWritten(hex: string) {
  return new Color(hex).convertLinearToSRGB();
}

/** Points along a polyline, as segment pairs. */
function segments(polyline: number[], into: number[]) {
  for (let i = 0; i + 5 < polyline.length; i += 3) into.push(...polyline.slice(i, i + 6));
}

function circle(build: (t: number) => Vec3, steps = 96) {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) out.push(...build((i / steps) * 2 * Math.PI), ...build(((i + 1) / steps) * 2 * Math.PI));
  return out;
}

/** A grid on the unit sphere: circles of latitude and meridians, in its own frame. */
function grid(latStep: number, lonStep: number) {
  const pts: number[] = [];
  for (let lat = -90 + latStep; lat < 90; lat += latStep) {
    const c = Math.cos(lat * DEG);
    const s = Math.sin(lat * DEG);
    pts.push(...circle((t) => [c * Math.cos(t), c * Math.sin(t), s]));
  }
  for (let lon = 0; lon < 360; lon += lonStep) {
    const cl = Math.cos(lon * DEG);
    const sl = Math.sin(lon * DEG);
    for (let i = 0; i < 48; i++) {
      const a = -90 + (i * 180) / 48;
      const b = -90 + ((i + 1) * 180) / 48;
      pts.push(Math.cos(a * DEG) * cl, Math.cos(a * DEG) * sl, Math.sin(a * DEG));
      pts.push(Math.cos(b * DEG) * cl, Math.cos(b * DEG) * sl, Math.sin(b * DEG));
    }
  }
  return pts;
}

/** Sum of sines at fixed phases: a smooth, repeatable outline around the horizon. */
function outline(az: number, waves: [number, number, number][]) {
  let sum = 0;
  for (const [k, amplitude, phase] of waves) sum += amplitude * Math.sin(k * az * DEG + phase);
  return sum;
}

/**
 * The horizon's silhouette: distant hills and a near tree line, never more than 2.4° high,
 * so nothing the page calls "up" hides behind them for long. An illustration of a horizon,
 * not the observatory's measured one.
 */
function landscape(profile: (az: number) => number, radius: number) {
  const positions: number[] = [];
  const index: number[] = [];
  const steps = 1440;
  for (let i = 0; i <= steps; i++) {
    const az = (i / steps) * 360;
    for (const alt of [profile(az), -3]) positions.push(...worldOf({ alt, az }).map((v) => v * radius));
    if (i < steps) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(index);
  return geometry;
}

const farHills = (az: number) =>
  Math.max(
    0.15,
    0.75 +
      outline(az, [
        [2, 0.55, 0.4],
        [3, 0.45, 1.9],
        [5, 0.35, 4.1],
        [9, 0.18, 2.2],
        [17, 0.08, 0.7],
      ]),
  );

const treeLine = (az: number) => {
  const rolling = 0.35 + outline(az, [[4, 0.18, 2.8], [7, 0.12, 0.3], [11, 0.08, 5.1]]);
  const crowns = Math.abs(Math.sin(az * 7.3 * DEG * 6)) ** 3 * 0.32 + Math.abs(Math.sin(az * 19.7 * DEG * 4 + 1.3)) ** 6 * 0.22;
  const clearing = Math.sin(az * 3 * DEG + 0.9) > 0.55 ? 0.15 : 1;
  return Math.min(2.4, Math.max(0.08, rolling + crowns * clearing));
};

const BODY_COLOUR: Record<SkyBodyName, string> = {
  Sun: nightSkyArt.sun,
  Moon: nightSkyArt.moon,
  Mercury: nightSkyArt.mercury,
  Venus: nightSkyArt.venus,
  Mars: nightSkyArt.mars,
  Jupiter: nightSkyArt.jupiter,
  Saturn: nightSkyArt.saturn,
  Uranus: nightSkyArt.uranus,
  Neptune: nightSkyArt.neptune,
};

/**
 * The photographs (lib/observatory-sim/target-photos.ts, credited on the page): where each
 * disc sits in its picture, in pixels, measured from the picture itself. Venus's picture is
 * a radar map of the ground under its clouds, so Venus is drawn as the cloud deck it shows.
 */
const PHOTOS: Partial<Record<SkyBodyName, { src: string; w: number; h: number; cx: number; cy: number; rx: number; ry: number }>> = {
  Moon: { src: "/sky/targets/moon.jpg", w: 640, h: 608, cx: 320, cy: 309.5, rx: 266, ry: 266 },
  Mercury: { src: "/sky/targets/mercury.jpg", w: 640, h: 635, cx: 320, cy: 317.5, rx: 270, ry: 270 },
  Mars: { src: "/sky/targets/mars.jpg", w: 640, h: 640, cx: 320.5, cy: 319.5, rx: 268, ry: 268 },
  Jupiter: { src: "/sky/targets/jupiter.jpg", w: 640, h: 640, cx: 320.5, cy: 319, rx: 297.5, ry: 285 },
  Uranus: { src: "/sky/targets/uranus.jpg", w: 640, h: 640, cx: 316.5, cy: 317.5, rx: 259.5, ry: 253.5 },
  Neptune: { src: "/sky/targets/neptune.jpg", w: 640, h: 640, cx: 313.5, cy: 318, rx: 267, ry: 267 },
};

/** Deep-sky pictures: the painted plates (ADR-082) and M57's reference photograph. */
const PLATES: Record<string, { src: string; widthArcmin: number; heightArcmin: number }> = {
  ...Object.fromEntries(
    Object.entries(PLATE_SPAN_ARCMIN).map(([id, span]) => [id, { src: `/sky/plates/${id}.webp`, widthArcmin: span, heightArcmin: span }]),
  ),
  m57: { src: "/sky/targets/m57.jpg", widthArcmin: 2.8, heightArcmin: 3.5 },
};

const MOONS: MoonOfJupiter[] = ["io", "europa", "ganymede", "callisto"];

/** Showpiece doubles: framed tight enough to split. */
const DOUBLES = new Set(["albireo", "almach", "mizar", "star-albireo", "star-almach", "star-mizar"]);

const smooth = (from: number, to: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

export class SkyRenderer {
  readonly renderer: WebGLRenderer;
  private scene = new Scene();
  // Everything drawn sits between 0.88 and 5 from the eye; a near plane at 0.5 keeps the
  // depth buffer fine enough to sort Saturn's rings against its globe when zoomed in.
  private camera = new PerspectiveCamera(60, 1, 0.5, 8);
  private stars: Points;
  private starData: Float32Array;
  private lines: LineSegments;
  private milky: Mesh;
  private atmosphere: Mesh;
  private ground: Mesh;
  private hills: Mesh;
  private trees: Mesh;
  private altaz: LineSegments;
  private equatorial: LineSegments;
  private discs = new Map<SkyBodyName, Mesh>();
  private saturn: Group;
  private saturnGlobe: Mesh;
  private saturnRings: Mesh;
  private glow: Points;
  private sunHalo: Mesh;
  private moonHalo: Mesh;
  private plates = new Map<string, Mesh>();
  private textures = new Map<string, Texture | "loading">();
  private loader = new TextureLoader();
  private labels = new Map<string, HTMLSpanElement>();
  private matrix: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  private states: BodyState[] = [];
  private shown = new Map<string, { world: Vec3; radiusPx: number }>();
  private path: PathOverlay | null = null;
  private overlayContext: CanvasRenderingContext2D | null;
  private font = "sans-serif";
  private motion = true;
  private started = performance.now();
  private width = 1;
  private height = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    private labelLayer: HTMLElement,
    private overlay: HTMLCanvasElement,
    starData: Float32Array,
    private constellations: Constellation[],
    private things: SkyThing[],
  ) {
    this.starData = starData;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.camera.up.set(0, 1, 0);
    this.overlayContext = overlay.getContext("2d");
    this.font = getComputedStyle(labelLayer).fontFamily || this.font;

    // Background: the atmosphere, or black.
    this.atmosphere = new Mesh(new SphereGeometry(D.back, 48, 24), atmosphereMaterial());
    this.atmosphere.renderOrder = -10;
    this.scene.add(this.atmosphere);

    // The Milky Way, sampled from its equirectangular texture by J2000 direction.
    const milkyMaterialInstance = milkyMaterial();
    this.milky = new Mesh(new IcosahedronGeometry(1, 6), milkyMaterialInstance);
    this.milky.renderOrder = -5;
    this.milky.frustumCulled = false;
    this.loader.load("/sky/data/milkyway.webp", (texture) => {
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      milkyMaterialInstance.uniforms.uMap.value = texture;
    });
    this.scene.add(this.milky);

    // Stars: one draw.
    const count = starData.length / 5;
    const position = new Float32Array(count * 3);
    const mag = new Float32Array(count);
    const tint = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      position.set(starData.subarray(i * 5, i * 5 + 3), i * 3);
      mag[i] = starData[i * 5 + 3];
      tint.set(colourOfBv(starData[i * 5 + 4]), i * 3);
    }
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute("position", new BufferAttribute(position, 3));
    starGeometry.setAttribute("mag", new BufferAttribute(mag, 1));
    starGeometry.setAttribute("tint", new BufferAttribute(tint, 3));
    this.stars = new Points(starGeometry, starMaterial());
    this.stars.frustumCulled = false;
    this.stars.renderOrder = 2;
    this.scene.add(this.stars);

    // Constellation figures.
    const linePoints: number[] = [];
    for (const figure of constellations) for (const polyline of figure.lines) segments(polyline, linePoints);
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute("position", new BufferAttribute(new Float32Array(linePoints), 3));
    this.lines = new LineSegments(lineGeometry, lineMaterial(nightSkyArt.figures));
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 1;
    this.scene.add(this.lines);

    // Grids. Alt-az is drawn in the world frame directly (z up in its own frame -> y up).
    const altazPoints = grid(10, 15);
    for (let i = 0; i < altazPoints.length; i += 3) {
      const [x, y, z] = altazPoints.slice(i, i + 3);
      altazPoints[i] = y;
      altazPoints[i + 1] = z;
      altazPoints[i + 2] = -x;
    }
    const altazGeometry = new BufferGeometry();
    altazGeometry.setAttribute("position", new BufferAttribute(new Float32Array(altazPoints.map((v) => v * D.lines)), 3));
    this.altaz = new LineSegments(altazGeometry, new LineBasicMaterial({ color: nightSkyArt.altazGrid, transparent: true, opacity: 0.45, depthWrite: false }));
    this.altaz.frustumCulled = false;
    this.scene.add(this.altaz);
    const eqGeometry = new BufferGeometry();
    eqGeometry.setAttribute("position", new BufferAttribute(new Float32Array(grid(10, 15)), 3));
    this.equatorial = new LineSegments(eqGeometry, lineMaterial(nightSkyArt.equatorialGrid));
    this.equatorial.frustumCulled = false;
    this.scene.add(this.equatorial);

    // Deep-sky plates sit just in front of the stars; their pictures load when first big enough.
    // Halos for the Sun and the Moon.
    const quad = new PlaneGeometry(2, 2);
    this.sunHalo = new Mesh(quad, haloMaterial(nightSkyArt.sun));
    this.moonHalo = new Mesh(quad, haloMaterial(nightSkyArt.moon));
    for (const halo of [this.sunHalo, this.moonHalo]) {
      halo.matrixAutoUpdate = false;
      halo.renderOrder = 2;
      halo.frustumCulled = false;
      this.scene.add(halo);
    }

    // Bodies: a disc each, Saturn a globe with rings; a point of light while too small.
    for (const name of Object.keys(BODY_COLOUR) as SkyBodyName[]) {
      if (name === "Saturn") continue;
      const material = discMaterial();
      material.uniforms.uColour.value.copy(asWritten(BODY_COLOUR[name]));
      material.uniforms.uMode.value = name === "Sun" ? 2 : PHOTOS[name] ? 0 : 1;
      const photo = PHOTOS[name];
      if (photo) {
        material.uniforms.uRect.value.set(photo.cx / photo.w, 1 - photo.cy / photo.h, photo.rx / photo.w, photo.ry / photo.h);
      }
      material.uniforms.uAmbient.value = name === "Moon" ? 0.025 : 0;
      const mesh = new Mesh(quad, material);
      mesh.matrixAutoUpdate = false;
      mesh.renderOrder = 3;
      mesh.frustumCulled = false;
      this.discs.set(name, mesh);
      this.scene.add(mesh);
    }
    this.saturn = new Group();
    this.saturn.matrixAutoUpdate = false;
    this.saturnGlobe = new Mesh(new SphereGeometry(1, 64, 32), saturnGlobeMaterial());
    this.saturnGlobe.scale.set(1, 0.902, 1);
    this.saturnGlobe.renderOrder = 3;
    const rings = new RingGeometry(1.239, 2.27, 192, 1);
    rings.rotateX(-Math.PI / 2);
    this.saturnRings = new Mesh(rings, saturnRingMaterial());
    this.saturnRings.renderOrder = 4;
    for (const part of [this.saturnGlobe, this.saturnRings]) part.frustumCulled = false;
    this.saturn.add(this.saturnGlobe, this.saturnRings);
    this.scene.add(this.saturn);

    const glowCount = 9 + MOONS.length;
    const glowGeometry = new BufferGeometry();
    glowGeometry.setAttribute("position", new BufferAttribute(new Float32Array(glowCount * 3), 3));
    glowGeometry.setAttribute("tint", new BufferAttribute(new Float32Array(glowCount * 3), 3));
    glowGeometry.setAttribute("size", new BufferAttribute(new Float32Array(glowCount), 1));
    glowGeometry.setAttribute("alpha", new BufferAttribute(new Float32Array(glowCount), 1));
    glowGeometry.setAttribute("halo", new BufferAttribute(new Float32Array(glowCount), 1));
    this.glow = new Points(glowGeometry, glowMaterial());
    this.glow.frustumCulled = false;
    this.glow.renderOrder = 4;
    this.scene.add(this.glow);

    // The ground: the lower hemisphere, then hills and a tree line along the horizon.
    this.ground = new Mesh(
      new SphereGeometry(D.ground, 64, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new MeshBasicMaterial({ color: nightSkyArt.ground, side: DoubleSide, transparent: true, opacity: 1 }),
    );
    this.ground.renderOrder = 5;
    this.scene.add(this.ground);
    this.hills = new Mesh(landscape(farHills, 0.895), new MeshBasicMaterial({ color: nightSkyArt.hills, side: DoubleSide, transparent: true }));
    this.trees = new Mesh(landscape(treeLine, 0.89), new MeshBasicMaterial({ color: nightSkyArt.ground, side: DoubleSide, transparent: true }));
    this.hills.renderOrder = 5;
    this.trees.renderOrder = 6;
    for (const layer of [this.hills, this.trees]) {
      layer.frustumCulled = false;
      this.scene.add(layer);
    }

    for (const label of ["N", "E", "S", "W"]) this.label(`compass:${label}`, "sky-label sky-compass");
  }

  private label(id: string, className: string) {
    let span = this.labels.get(id);
    if (!span) {
      span = document.createElement("span");
      span.className = className;
      span.dataset.id = id;
      this.labelLayer.appendChild(span);
      this.labels.set(id, span);
    }
    return span;
  }

  private place(id: string, className: string, text: string, world: Vec3 | null) {
    const span = this.label(id, className);
    const point = world ? screenOf(world, this.view, this.width, this.height) : null;
    if (!point || point.x < -40 || point.y < -20 || point.x > this.width + 40 || point.y > this.height + 20) {
      span.hidden = true;
      return;
    }
    span.hidden = false;
    if (span.className !== className) span.className = className;
    if (span.textContent !== text) span.textContent = text;
    span.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
  }

  private view: View = { alt: 25, az: 180, fov: 70 };

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    const ratio = this.renderer.getPixelRatio();
    this.overlay.width = Math.round(this.width * ratio);
    this.overlay.height = Math.round(this.height * ratio);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  /** Reduced motion: no twinkling, no turning marker. */
  setMotion(on: boolean) {
    this.motion = on;
  }

  setPath(path: PathOverlay | null) {
    this.path = path;
  }

  /** J2000 direction -> world, no refraction: for directions such as a pole. */
  private turn(vec: Vec3): Vector3 {
    const m = this.matrix;
    const [x, y, z] = vec;
    const north = m[0] * x + m[3] * y + m[6] * z;
    const west = m[1] * x + m[4] * y + m[7] * z;
    const up = m[2] * x + m[5] * y + m[8] * z;
    return new Vector3(-west, up, -north);
  }

  /** The apparent world direction of a J2000 vector this frame. */
  worldOfJ2000(vec: Vec3): Vec3 {
    return worldOf(horizontal(vec, this.matrix));
  }

  bodyStates() {
    return this.states;
  }

  /** Where a key's object stood in the last frame, apparent; null if not drawn. */
  whereIs(key: string): AltAz | null {
    const kind = key.slice(0, key.indexOf(":"));
    const id = key.slice(key.indexOf(":") + 1);
    if (kind === "body") return this.states.find((state) => state.name === id) ?? null;
    if (kind === "fixed") {
      const thing = this.things.find((t) => t.kind === "fixed" && t.id === id);
      return thing && thing.kind === "fixed" ? horizontal(unit(thing.raHours, thing.decDeg), this.matrix) : null;
    }
    if (kind === "star") {
      const i = Number(id) * 5;
      return horizontal([this.starData[i], this.starData[i + 1], this.starData[i + 2]], this.matrix);
    }
    if (kind === "constellation") {
      const thing = this.things.find((t) => t.kind === "constellation" && t.id === id);
      return thing && thing.kind === "constellation" ? horizontal(thing.label, this.matrix) : null;
    }
    return null;
  }

  private texture(src: string) {
    const known = this.textures.get(src);
    if (known) return known === "loading" ? null : known;
    this.textures.set(src, "loading");
    this.loader.load(
      src,
      // Left in its own sRGB values: these shaders write what they read, unconverted.
      (texture) => this.textures.set(src, texture),
      undefined,
      () => this.textures.delete(src),
    );
    return null;
  }

  /** Places a camera-facing quad at a world direction, its +y along `north` on the sky. */
  private billboard(mesh: Mesh, world: Vec3, north: Vector3, distance: number, halfWidth: number, halfHeight: number) {
    const toViewer = new Vector3(-world[0], -world[1], -world[2]).normalize();
    const up = north.clone().addScaledVector(toViewer, -north.dot(toViewer));
    if (up.lengthSq() < 1e-12) up.set(0, 1, 0).addScaledVector(toViewer, -toViewer.y);
    up.normalize();
    const right = new Vector3().crossVectors(up, toViewer).normalize();
    mesh.matrix
      .makeBasis(right, up, toViewer)
      .scale(new Vector3(halfWidth, halfHeight, 1))
      .setPosition(world[0] * distance, world[1] * distance, world[2] * distance);
    mesh.matrixWorldNeedsUpdate = true;
    return { right, up, toViewer };
  }

  /** Draws one frame. `orientation` overrides the alt-az camera (phone pointing). */
  render(frame: Frame, orientation?: Quaternion | null) {
    const { date, site, toggles } = frame;
    let { view } = frame;
    this.matrix = horizonMatrix(date, site);
    this.states = bodies(date, site);
    this.shown.clear();
    const target = frame.selected ? this.whereIs(frame.selected) : null;
    if (frame.track && target && !orientation && (target.alt > -1 || toggles.ground)) {
      view = clampView({ ...view, alt: target.alt, az: target.az });
    }
    this.view = view;
    const sun = this.states[0];
    const moon = this.states[1];
    const bright = toggles.atmosphere ? skyBrightness(sun.alt, moon) : 0;
    const limit = toggles.atmosphere ? limitingMagnitude(bright) : 6.5;
    const zoomGain = Math.max(0, Math.log2(60 / view.fov));
    const effectiveLimit = Math.min(8, limit + 1.1 * zoomGain);
    const ratio = this.renderer.getPixelRatio();
    const seconds = (performance.now() - this.started) / 1000;

    // Camera.
    this.camera.fov = view.fov;
    this.camera.updateProjectionMatrix();
    if (orientation) {
      this.camera.quaternion.copy(orientation);
    } else {
      const forward = worldOf(view);
      this.camera.lookAt(new Vector3(...forward));
    }
    this.camera.updateMatrixWorld();

    const m3 = new Matrix3().fromArray(this.matrix);
    const starUniforms = (this.stars.material as ShaderMaterial).uniforms;
    starUniforms.uEqjHor.value.copy(m3);
    starUniforms.uLimit.value = effectiveLimit;
    // Stars grow a little as the view narrows, so a double's colours read when split.
    starUniforms.uScale.value = ratio * Math.min(3, 0.85 + 0.25 * zoomGain);
    starUniforms.uBelow.value = toggles.ground ? 1 : 0;
    starUniforms.uTime.value = seconds;
    starUniforms.uTwinkle.value = this.motion && toggles.atmosphere ? 1 - bright : 0;
    starUniforms.uExtinction.value = toggles.atmosphere ? 1 : 0;

    const lines = this.lines.material as ShaderMaterial;
    lines.uniforms.uEqjHor.value.copy(m3);
    lines.uniforms.uAlpha.value = 0.5 * (1 - bright * 0.8);
    this.lines.visible = toggles.lines;

    const milky = this.milky.material as ShaderMaterial;
    milky.uniforms.uEqjHor.value.copy(m3);
    // The Milky Way is a glow across tens of degrees; in a narrow view it would only grey
    // the background, so it fades out below a 12° field.
    milky.uniforms.uAlpha.value = 0.6 * Math.max(0, 1 - bright * 4) * smooth(3, 12, view.fov);
    this.milky.visible = toggles.milkyway;

    // The equatorial grid is the equator of date: its own EQD -> HOR rotation.
    const { rot } = Rotation_EQD_HOR(MakeTime(date), observerOf(site));
    const eq = this.equatorial.material as ShaderMaterial;
    eq.uniforms.uEqjHor.value.fromArray([...rot[0], ...rot[1], ...rot[2]]);
    eq.uniforms.uAlpha.value = 0.4;
    this.equatorial.visible = toggles.equatorial;
    this.altaz.visible = toggles.altaz;

    const atmosphere = this.atmosphere.material as ShaderMaterial;
    atmosphere.uniforms.uSun.value.set(...worldOf(sun));
    atmosphere.uniforms.uBright.value = bright;
    atmosphere.uniforms.uOn.value = toggles.atmosphere ? 1 : 0;

    // The ground and the horizon's silhouette, lit a little by the sky.
    const groundOpacity = toggles.ground ? 0.25 : 1;
    const groundColour = new Color(nightSkyArt.ground).lerp(new Color(nightSkyArt.groundDay), toggles.atmosphere ? bright : 0);
    const hillColour = new Color(nightSkyArt.hills).lerp(new Color(nightSkyArt.hillsDay), toggles.atmosphere ? bright : 0);
    for (const [mesh, colour] of [
      [this.ground, groundColour],
      [this.trees, groundColour],
      [this.hills, hillColour],
    ] as const) {
      const material = mesh.material as MeshBasicMaterial;
      material.opacity = groundOpacity;
      material.color.copy(colour);
    }

    // Bodies.
    const degPerPx = view.fov / this.height;
    const glowPosition = this.glow.geometry.getAttribute("position") as BufferAttribute;
    const glowTint = this.glow.geometry.getAttribute("tint") as BufferAttribute;
    const glowSize = this.glow.geometry.getAttribute("size") as BufferAttribute;
    const glowAlpha = this.glow.geometry.getAttribute("alpha") as BufferAttribute;
    const glowHalo = this.glow.geometry.getAttribute("halo") as BufferAttribute;
    this.states.forEach((state, index) => {
      const world = worldOf(state);
      const truePx = state.radiusDeg / degPerPx;
      const up = toggles.ground || state.alt > -state.radiusDeg - 0.5;
      const big = state.name === "Sun" || state.name === "Moon";
      // The Sun and the Moon always show a disc; a planet once it is wide enough to.
      const discPx = big ? Math.max(truePx, 6) : truePx;
      const discShown = up && (big || truePx >= 1.1);
      const discRadius = Math.tan(discPx * degPerPx * DEG) * D.bodies;
      const sunward = this.turn(state.sunward);
      const pole = this.turn(POLES[state.name]);

      if (state.name === "Saturn") {
        this.saturn.visible = discShown;
        if (discShown) {
          // Local y along the true pole, so the rings open as they do from here.
          const toViewer = new Vector3(-world[0], -world[1], -world[2]);
          const x = new Vector3().crossVectors(pole, toViewer);
          if (x.lengthSq() < 1e-12) x.set(1, 0, 0);
          x.normalize();
          const z = new Vector3().crossVectors(x, pole).normalize();
          this.saturn.matrix
            .makeBasis(x, pole, z)
            .scale(new Vector3(discRadius, discRadius, discRadius))
            .setPosition(world[0] * D.bodies, world[1] * D.bodies, world[2] * D.bodies);
          this.saturn.matrixWorldNeedsUpdate = true;
          const local = new Matrix4().makeBasis(x, pole, z).invert();
          const sunLocal = sunward.clone().applyMatrix4(local);
          const viewLocal = toViewer.clone().normalize().applyMatrix4(local);
          for (const part of [this.saturnGlobe, this.saturnRings]) {
            const uniforms = (part.material as ShaderMaterial).uniforms;
            uniforms.uSun.value.copy(sunLocal);
            uniforms.uView.value.copy(viewLocal);
          }
        }
      } else {
        const disc = this.discs.get(state.name)!;
        disc.visible = discShown;
        if (discShown) {
          const photo = PHOTOS[state.name];
          const material = disc.material as ShaderMaterial;
          const squash = photo ? Math.min(1, photo.ry / photo.rx) : 1;
          const frame3 = this.billboard(disc, world, pole, D.bodies, discRadius, discRadius * squash);
          material.uniforms.uSun.value.set(sunward.dot(frame3.right), sunward.dot(frame3.up), sunward.dot(frame3.toViewer));
          material.uniforms.uEdge.value = Math.min(0.5, 1.2 / Math.max(discPx, 1));
          material.uniforms.uSky.value = Math.min(1, bright * 3);
          if (photo && !material.uniforms.uMap.value) {
            const texture = this.texture(photo.src);
            if (texture) material.uniforms.uMap.value = texture;
            // Until the photograph is in, a plain disc of the body's colour.
            material.uniforms.uMode.value = texture ? 0 : 1;
          }
        }
      }

      // The point of light: a planet as a star until its disc shows.
      const resolved = big ? 1 : smooth(1.4, 5, truePx);
      const d = effectiveLimit - state.magnitude;
      glowPosition.setXYZ(index, world[0] * D.bodies, world[1] * D.bodies, world[2] * D.bodies);
      const tint = asWritten(BODY_COLOUR[state.name]);
      glowTint.setXYZ(index, tint.r, tint.g, tint.b);
      // Sized as the star shader sizes a star of the same magnitude.
      const halo = Math.max(0, Math.min(1, (d - 3.2) / 4));
      glowSize.setX(index, Math.min(34, 1.9 + d + 7 * halo) * ratio * Math.min(1.6, 0.85 + 0.25 * zoomGain));
      glowAlpha.setX(index, up && !big ? Math.max(0, Math.min(1, d)) * (1 - resolved) : 0);
      glowHalo.setX(index, halo);

      const shownPx = discShown ? discPx * (state.name === "Saturn" ? 2.27 : 1) : Math.max(3, 1 + 0.6 * d);
      this.shown.set(`body:${state.name}`, { world, radiusPx: shownPx });
      this.place(
        `body:${state.name}`,
        `sky-label sky-label-body${frame.selected === `body:${state.name}` ? " is-selected" : ""}${state.alt < 0 ? " is-below" : ""}`,
        this.names.get(`body:${state.name}`) ?? state.name,
        up && (toggles.planets || frame.selected === `body:${state.name}`) ? offset(world, (shownPx + 2) * degPerPx) : null,
      );

      if (state.name === "Sun" || state.name === "Moon") {
        const halo = state.name === "Sun" ? this.sunHalo : this.moonHalo;
        const size = state.name === "Sun" ? 9 : 2.6;
        this.billboard(halo, world, pole, D.bodies + 0.005, Math.tan(size * DEG) * D.bodies, Math.tan(size * DEG) * D.bodies);
        halo.visible = up && toggles.atmosphere;
        (halo.material as ShaderMaterial).uniforms.uAlpha.value =
          state.name === "Sun" ? 1 : 0.5 * state.litFraction * (1 - bright) * smooth(-1, 3, state.alt);
      }
    });

    // Jupiter's four moons, once the view is narrow enough to part them from it.
    const jupiter = this.states.find((state) => state.name === "Jupiter")!;
    const jupiterWorld = new Vector3(...worldOf(jupiter));
    const moonsAlpha = (toggles.ground || jupiter.alt > 0 ? 1 : 0) * smooth(4, 1.5, view.fov);
    jupiterMoons(date).forEach((moon, i) => {
      const index = 9 + i;
      const world = jupiterWorld.clone().add(this.turn(moon.offset)).normalize();
      glowPosition.setXYZ(index, world.x * (D.bodies - 0.002), world.y * (D.bodies - 0.002), world.z * (D.bodies - 0.002));
      glowTint.setXYZ(index, 1, 0.97, 0.9);
      glowSize.setX(index, 4.2 * ratio);
      glowAlpha.setX(index, moon.hidden ? 0 : moonsAlpha);
      glowHalo.setX(index, 0);
      this.place(
        `moon:${moon.name}`,
        "sky-label sky-label-moon",
        this.names.get(`moon:${moon.name}`) ?? moon.name,
        !moon.hidden && moonsAlpha > 0.5 && view.fov < 1 ? offset([world.x, world.y, world.z], 3 * degPerPx) : null,
      );
    });
    for (const attribute of [glowPosition, glowTint, glowSize, glowAlpha, glowHalo]) attribute.needsUpdate = true;

    // Labels and plates: constellations, named stars and showpieces, the compass.
    for (const thing of this.things) {
      const key = `${thing.kind}:${thing.id}`;
      if (thing.kind === "constellation") {
        this.place(key, "sky-label sky-label-constellation", thing.name, toggles.names ? this.visible(this.worldOfJ2000(thing.label), toggles) : null);
      } else if (thing.kind === "fixed") {
        const selected = frame.selected === key;
        const where = horizontal(unit(thing.raHours, thing.decDeg), this.matrix);
        const world = worldOf(where);
        const plate = this.plates.get(thing.id);
        let radiusPx = thing.type === "star" ? 6 : 9;
        if (plate) {
          const spec = PLATES[thing.id];
          const widthPx = spec.widthArcmin / 60 / degPerPx;
          const alpha = (toggles.ground || where.alt > 0 ? 1 : 0) * smooth(10, 44, widthPx) * Math.max(0, 1 - bright * 1.6);
          plate.visible = alpha > 0.01;
          if (plate.visible) {
            const material = plate.material as ShaderMaterial;
            const texture = this.texture(spec.src);
            material.uniforms.uMap.value = texture;
            material.uniforms.uAlpha.value = texture ? alpha : 0;
            const north = new Vector3(...this.worldOfJ2000(unit(thing.raHours, Math.min(89.9, thing.decDeg + 0.2)))).sub(new Vector3(...world));
            const half = (arcmin: number) => Math.tan((arcmin / 120) * DEG) * D.plates;
            this.billboard(plate, world, north, D.plates, half(spec.widthArcmin), half(spec.heightArcmin));
          }
          radiusPx = Math.max(radiusPx, widthPx * 0.22);
        }
        this.shown.set(key, { world, radiusPx });
        const show =
          selected ||
          (thing.labelled && (thing.type !== "star" ? view.fov <= 75 : (thing.magnitude ?? 9) <= Math.min(effectiveLimit, 1.6 + 1.2 * zoomGain)));
        this.place(
          key,
          `sky-label ${thing.type === "star" ? "sky-label-star" : "sky-label-showpiece"}${selected ? " is-selected" : ""}${where.alt < 0 ? " is-below" : ""}${radiusPx > 12 ? " is-framed" : ""}`,
          thing.name,
          show ? this.visible(radiusPx > 12 ? offset(world, (radiusPx + 4) * degPerPx) : world, toggles) : null,
        );
      }
    }
    const compass = frame.compass;
    this.place("compass:N", "sky-label sky-compass", compass.N, [0, 0.01, -1]);
    this.place("compass:E", "sky-label sky-compass", compass.E, [1, 0.01, 0]);
    this.place("compass:S", "sky-label sky-compass", compass.S, [0, 0.01, 1]);
    this.place("compass:W", "sky-label sky-compass", compass.W, [-1, 0.01, 0]);

    this.renderer.render(this.scene, this.camera);
    this.drawOverlay(frame, seconds);
    return { bright, sun, moon, view, target };
  }

  /** A field of view that frames the object: a planet's disc, a plate, a double star. */
  fitFov(key: string) {
    const kind = key.slice(0, key.indexOf(":"));
    const id = key.slice(key.indexOf(":") + 1);
    const fit = (fov: number) => Math.min(60, Math.max(FOV.min, fov));
    if (kind === "body") {
      const state = this.states.find((s) => s.name === id);
      if (!state) return 20;
      // Jupiter wide enough for its moons' inner orbits; the rest to fill a good part of the view.
      if (state.name === "Jupiter") return 0.14;
      const reach = state.radiusDeg * (state.name === "Saturn" ? 2.35 : 1);
      return fit(reach * 2 * (state.name === "Sun" || state.name === "Moon" ? 2.4 : 4.5));
    }
    if (kind === "fixed" && PLATES[id]) return fit((PLATES[id].widthArcmin / 60) * 1.5);
    if (kind === "fixed" && DOUBLES.has(id)) return 0.12;
    if (kind === "constellation") return 50;
    return 1.5;
  }

  /** The selected object's path across the sky, its hours and events, and its marker. */
  private drawOverlay(frame: Frame, seconds: number) {
    const context = this.overlayContext;
    if (!context) return;
    const ratio = this.renderer.getPixelRatio();
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, this.width, this.height);
    const seeBelow = frame.toggles.ground;
    const project = (alt: number, az: number) => screenOf(worldOf({ alt, az }), this.view, this.width, this.height);
    const onScreen = (p: { x: number; y: number }, margin = 0) =>
      p.x > -margin && p.y > -margin && p.x < this.width + margin && p.y < this.height + margin;

    if (this.path && frame.toggles.path && frame.selected) {
      const points = this.path.points.map((point) => ({ ...point, screen: project(point.alt, point.az) }));
      const above = new Path2D();
      const below = new Path2D();
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        if (!a.screen || !b.screen) continue;
        // A step that leaps across the screen has wrapped behind the eye.
        if (Math.hypot(b.screen.x - a.screen.x, b.screen.y - a.screen.y) > Math.max(this.width, this.height)) continue;
        const target = (a.alt + b.alt) / 2 > 0 ? above : below;
        target.moveTo(a.screen.x, a.screen.y);
        target.lineTo(b.screen.x, b.screen.y);
      }
      context.lineCap = "round";
      if (seeBelow) {
        context.setLineDash([3, 5]);
        context.lineWidth = 1.5;
        context.strokeStyle = withAlpha(nightSkyArt.path, 0.4);
        context.stroke(below);
        context.setLineDash([]);
      }
      context.lineWidth = 4;
      context.strokeStyle = withAlpha(nightSkyArt.path, 0.16);
      context.stroke(above);
      context.lineWidth = 1.6;
      context.strokeStyle = withAlpha(nightSkyArt.path, 0.9);
      context.stroke(above);

      // Whole hours: a dot each, a label where there is room, an arrow every third.
      context.font = `600 13px ${this.font}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      let lastLabel: { x: number; y: number } | null = null;
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (point.at % 3_600_000 !== 0 || !point.screen || !onScreen(point.screen, 20)) continue;
        if (point.alt < 0 && !seeBelow) continue;
        const next = points[Math.min(points.length - 1, i + 1)].screen ?? point.screen;
        const previous = points[Math.max(0, i - 1)].screen ?? point.screen;
        const dx = next.x - previous.x;
        const dy = next.y - previous.y;
        const length = Math.hypot(dx, dy) || 1;
        const alpha = point.alt < 0 ? 0.45 : 1;
        context.fillStyle = withAlpha(nightSkyArt.path, alpha);
        context.beginPath();
        context.arc(point.screen.x, point.screen.y, 2.6, 0, Math.PI * 2);
        context.fill();
        if (Math.round(point.at / 3_600_000) % 3 === 0 && length > 4) {
          // An arrowhead half an hour on, pointing the way the object goes.
          const half = points[Math.min(points.length - 1, i + 3)].screen;
          if (half && onScreen(half)) {
            const ux = dx / length;
            const uy = dy / length;
            context.beginPath();
            context.moveTo(half.x + ux * 5, half.y + uy * 5);
            context.lineTo(half.x - ux * 4 - uy * 4, half.y - uy * 4 + ux * 4);
            context.lineTo(half.x - ux * 4 + uy * 4, half.y - uy * 4 - ux * 4);
            context.closePath();
            context.fill();
          }
        }
        if (!lastLabel || Math.hypot(point.screen.x - lastLabel.x, point.screen.y - lastLabel.y) > 52) {
          const nx = -dy / length;
          const ny = dx / length;
          const side = ny > 0 ? -1 : 1; // the label above the line where it can be
          const x = point.screen.x + nx * 13 * side;
          const y = point.screen.y + ny * 13 * side;
          context.lineWidth = 3;
          context.strokeStyle = withAlpha(nightSkyArt.scrim, 0.7);
          context.strokeText(this.path.hourLabel(point.at), x, y);
          context.fillStyle = withAlpha(nightSkyArt.pathLabel, alpha);
          context.fillText(this.path.hourLabel(point.at), x, y);
          lastLabel = point.screen;
        }
      }

      // Rise, highest and set.
      context.font = `700 13px ${this.font}`;
      for (const mark of this.path.marks) {
        const point = project(Math.max(mark.alt, 0.05), mark.az);
        if (!point || !onScreen(point, 40) || (mark.alt < -1 && !seeBelow)) continue;
        context.fillStyle = nightSkyArt.path;
        context.beginPath();
        context.arc(point.x, point.y, 4, 0, Math.PI * 2);
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = withAlpha(nightSkyArt.scrim, 0.75);
        context.strokeText(mark.label, point.x, point.y - 15);
        context.fillStyle = nightSkyArt.pathLabel;
        context.fillText(mark.label, point.x, point.y - 15);
      }
    }

    // The marker round the selected object: four arcs, turning slowly.
    const selected = frame.selected ? this.shown.get(frame.selected) ?? this.markerOf(frame.selected) : null;
    if (selected && (seeBelow || selected.world[1] > -0.01)) {
      const point = screenOf(selected.world, this.view, this.width, this.height);
      if (point && onScreen(point, 30)) {
        const radius = Math.min(Math.max(selected.radiusPx + 8, 14), Math.min(this.width, this.height) * 0.45);
        const spin = this.motion ? seconds * 0.5 : 0;
        context.lineWidth = 2;
        context.strokeStyle = nightSkyArt.reticle;
        for (let k = 0; k < 4; k++) {
          const start = spin + (k * Math.PI) / 2 + 0.3;
          context.beginPath();
          context.arc(point.x, point.y, radius, start, start + 0.9);
          context.stroke();
        }
      }
    }
  }

  /** A marker for what has no drawn body or plate: a catalogue star or a constellation. */
  private markerOf(key: string) {
    const where = this.whereIs(key);
    return where ? { world: worldOf(where), radiusPx: key.startsWith("constellation:") ? 28 : 6 } : null;
  }

  private names = new Map<string, string>();
  setNames(names: Map<string, string>) {
    this.names = names;
  }

  /** Replaces the labelled, pickable things; labels and plates of things no longer listed go. */
  setThings(things: SkyThing[]) {
    const keep = new Set(things.map((thing) => `${thing.kind}:${thing.id}`));
    for (const [id, span] of this.labels) {
      if ((id.startsWith("fixed:") || id.startsWith("constellation:")) && !keep.has(id)) {
        span.remove();
        this.labels.delete(id);
      }
    }
    for (const thing of things) {
      if (thing.kind !== "fixed" || !PLATES[thing.id] || this.plates.has(thing.id)) continue;
      const plate = new Mesh(new PlaneGeometry(2, 2), plateMaterial());
      plate.matrixAutoUpdate = false;
      plate.frustumCulled = false;
      plate.renderOrder = 1;
      plate.visible = false;
      this.plates.set(thing.id, plate);
      this.scene.add(plate);
    }
    this.things = things;
  }

  private visible(world: Vec3, toggles: Toggles) {
    return world[1] < -0.005 && !toggles.ground ? null : world;
  }

  /** The nearest pickable thing within `radius` px of a point, else null. */
  pick(x: number, y: number, radius = 28): string | null {
    let best: { id: string; d: number } | null = null;
    const consider = (id: string, world: Vec3 | null, bias = 0, reach = radius) => {
      if (!world) return;
      const point = screenOf(world, this.view, this.width, this.height);
      if (!point) return;
      const d = Math.hypot(point.x - x, point.y - y) + bias;
      if (d <= reach && (!best || d < best.d)) best = { id, d };
    };
    for (const state of this.states) {
      const shown = this.shown.get(`body:${state.name}`);
      consider(`body:${state.name}`, worldOf(state), -6, Math.max(radius, (shown?.radiusPx ?? 0) + 6));
    }
    for (const thing of this.things) {
      if (thing.kind === "fixed") {
        const shown = this.shown.get(`fixed:${thing.id}`);
        consider(`fixed:${thing.id}`, this.worldOfJ2000(unit(thing.raHours, thing.decDeg)), thing.type === "star" ? 0 : -4, Math.max(radius, shown?.radiusPx ?? 0));
      }
    }
    if (best) return (best as { id: string }).id;
    // Any catalogue star, by its index.
    const count = this.starData.length / 5;
    for (let i = 0; i < count; i++) {
      if (this.starData[i * 5 + 3] > 6) break; // sorted brightest first
      consider(`star:${i}`, this.worldOfJ2000([this.starData[i * 5], this.starData[i * 5 + 1], this.starData[i * 5 + 2]]), 2);
    }
    if (best) return (best as { id: string }).id;
    for (const thing of this.things) {
      if (thing.kind === "constellation") consider(`constellation:${thing.id}`, this.worldOfJ2000(thing.label), 8);
    }
    return best ? (best as { id: string }).id : null;
  }

  dispose() {
    this.renderer.dispose();
    for (const texture of this.textures.values()) if (texture !== "loading") texture.dispose();
    for (const span of this.labels.values()) span.remove();
    this.labels.clear();
  }
}

function unit(raHours: number, decDeg: number): Vec3 {
  const ra = raHours * 15 * DEG;
  const dec = decDeg * DEG;
  return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
}

/** A label sits just below what it names, `degrees` under its centre. */
function offset(world: Vec3, degrees: number): Vec3 {
  return [world[0], world[1] - Math.tan(degrees * DEG), world[2]];
}
