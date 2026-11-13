import { worldOf, type Vec3 } from "./astro";

/** An alt-az camera with no roll: where it looks, and its vertical field of view. */
export type View = { alt: number; az: number; fov: number };

/** Down to 1.2′ across: wide enough for a planet's disc to fill the screen. */
export const FOV = { min: 0.02, max: 120 } as const;
/** Short of the zenith and nadir, where an alt-az camera's "up" is undefined. */
export const MAX_ALT = 89.5;

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normal = (a: Vec3): Vec3 => {
  const length = Math.hypot(...a) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};

/** The camera's forward, right and up, as three's lookAt builds them with up = +y. */
export function basis(view: View) {
  const forward = worldOf({ alt: view.alt, az: view.az });
  const right = normal(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);
  return { forward, right, up };
}

/** Pixel position of a world direction, or null behind the camera. */
export function screenOf(direction: Vec3, view: View, width: number, height: number) {
  const { forward, right, up } = basis(view);
  const depth = dot(direction, forward);
  if (depth <= 1e-6) return null;
  const f = 1 / Math.tan((view.fov * Math.PI) / 360);
  const ndcX = ((dot(direction, right) / depth) * f) / (width / height);
  const ndcY = (dot(direction, up) / depth) * f;
  return { x: ((ndcX + 1) / 2) * width, y: ((1 - ndcY) / 2) * height };
}

export function clampView(view: View): View {
  return {
    alt: Math.max(-MAX_ALT, Math.min(MAX_ALT, view.alt)),
    az: ((view.az % 360) + 360) % 360,
    fov: Math.max(FOV.min, Math.min(FOV.max, view.fov)),
  };
}

const RAD = Math.PI / 180;

/** The world direction under a screen point (x, y, from the top left): screenOf undone. */
export function directionAt(view: View, x: number, y: number, width: number, height: number): Vec3 {
  const { forward, right, up } = basis(view);
  const t = Math.tan((view.fov * RAD) / 2);
  const across = ((2 * x) / width - 1) * (width / height) * t;
  const down = (1 - (2 * y) / height) * t;
  return normal([
    forward[0] + right[0] * across + up[0] * down,
    forward[1] + right[1] * across + up[1] * down,
    forward[2] + right[2] * across + up[2] * down,
  ]);
}

/**
 * The view at a new field, turned so the sky under a screen point (x, y) stays under it:
 * a wheel or a pinch zooms where it is aimed, not at the middle. Solved by Newton's
 * method on the view's altitude and azimuth, with the screen's slopes measured.
 */
export function zoomAbout(view: View, fov: number, x: number, y: number, width: number, height: number): View {
  return aimAt({ ...view, fov }, directionAt(view, x, y, width, height), x, y, width, height);
}

/**
 * The view, at its own field, turned so a world direction falls on a screen point: a drag
 * keeps the star it took hold of under the finger, near the zenith too.
 */
export function aimAt(view: View, target: Vec3, x: number, y: number, width: number, height: number): View {
  let next = clampView(view);
  const h = Math.min(0.01, next.fov / 1000);
  for (let i = 0; i < 8; i++) {
    const at = screenOf(target, next, width, height);
    if (!at) break;
    const ex = at.x - x;
    const ey = at.y - y;
    if (Math.hypot(ex, ey) < 0.02) break;
    const byAlt = screenOf(target, { ...next, alt: next.alt + h }, width, height);
    const byAz = screenOf(target, { ...next, az: next.az + h }, width, height);
    if (!byAlt || !byAz) break;
    const [a, b, c, d] = [(byAlt.x - at.x) / h, (byAz.x - at.x) / h, (byAlt.y - at.y) / h, (byAz.y - at.y) / h];
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-9) break;
    const dAlt = (d * ex - b * ey) / det;
    const dAz = (a * ey - c * ex) / det;
    // Never more than a fifth of the field in one step, so a far start cannot overshoot.
    const cap = next.fov / 5;
    next = clampView({
      ...next,
      alt: next.alt - Math.max(-cap, Math.min(cap, dAlt)),
      az: next.az - Math.max(-cap, Math.min(cap, dAz)),
    });
  }
  return next;
}
