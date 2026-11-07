import { worldOf, type Vec3 } from "./astro";

/** An alt-az camera with no roll: where it looks, and its vertical field of view. */
export type View = { alt: number; az: number; fov: number };

export const FOV = { min: 5, max: 120 } as const;
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
