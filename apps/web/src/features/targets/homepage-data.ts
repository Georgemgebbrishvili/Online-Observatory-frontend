/**
 * The drawn plates hidden in the homepage sky (ADR-052 §7), placed round the words as the
 * Skychaser sky places its objects: x and y as shares of the sky, s the size as a share of
 * its short side, feather where the plate fades into the black. Saturn stands where the
 * Skychaser Moon does, above the headline, and the first light drifts to it. Every slug is
 * a catalogue target, so a found plate opens its page. None sits below the telescope's
 * pivot, so the observatory can point at every one.
 */
export const skyPlates = [
  { slug: "saturn", kind: "planet", x: 0.5, y: 0.14, s: 0.17, feather: 0.6 },
  { slug: "jupiter", kind: "planet", x: 0.13, y: 0.36, s: 0.13, feather: 0.7 },
  { slug: "mars", kind: "planet", x: 0.86, y: 0.3, s: 0.07, feather: 0.75 },
  { slug: "moon-terminator", kind: "moon", x: 0.8, y: 0.6, s: 0.15, feather: 0.72 },
  { slug: "m42-orion-nebula", kind: "nebula", x: 0.22, y: 0.12, s: 0.13, feather: 0.55 },
  { slug: "venus", kind: "planet", x: 0.17, y: 0.56, s: 0.06, feather: 0.75 },
  {
    slug: "m57-ring-nebula",
    kind: "planetaryNebula",
    x: 0.69,
    y: 0.1,
    s: 0.055,
    feather: 0.6,
  },
  {
    slug: "m13-hercules-cluster",
    kind: "cluster",
    x: 0.06,
    y: 0.62,
    s: 0.1,
    feather: 0.6,
  },
  { slug: "albireo", kind: "double", x: 0.3, y: 0.66, s: 0.11, feather: 0.6 },
  {
    slug: "m27-dumbbell-nebula",
    kind: "planetaryNebula",
    x: 0.92,
    y: 0.13,
    s: 0.07,
    feather: 0.6,
  },
  { slug: "mizar-alcor", kind: "double", x: 0.93, y: 0.66, s: 0.1, feather: 0.6 },
] as const;

export type SkyPlate = (typeof skyPlates)[number]["slug"];
export type SkyKind = (typeof skyPlates)[number]["kind"];

/** How many of tonight's targets the homepage lists; the full list is /app/missions. */
export const homeTonightLimit = 6;
