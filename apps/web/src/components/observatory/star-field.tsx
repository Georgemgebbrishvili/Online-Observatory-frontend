/**
 * The observatory page's ground: a fixed field of faint stars (ADR-041). Seeded, so the
 * server and the browser draw the same field, and still, so it costs nothing. It is a
 * ground, not a picture of the sky.
 */

const count = 320;

/** mulberry32: small, seeded, and the same on every render. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const next = seeded(41715);
const stars = Array.from({ length: count }, () => {
  const x = +(next() * 100).toFixed(2);
  const y = +(next() * 100).toFixed(2);
  const magnitude = next();
  // Most stars are faint; a handful are not.
  const r = magnitude > 0.96 ? 0.09 : magnitude > 0.8 ? 0.06 : 0.04;
  const opacity = magnitude > 0.96 ? 0.9 : magnitude > 0.8 ? 0.6 : 0.35;
  return { x, y, r, opacity };
});

export function StarField() {
  return (
    <svg
      className="observatory-stars"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {stars.map((star, index) => (
        <circle
          key={index}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="currentColor"
          opacity={star.opacity}
        />
      ))}
    </svg>
  );
}
