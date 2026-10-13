/**
 * The drawn plates hidden in the homepage sky (ADR-052 §7), placed round the words as the
 * Skychaser sky places its objects: x and y as shares of the sky, s the size as a share of
 * its short side, feather where the plate fades into the black. Saturn stands where the
 * Skychaser Moon does, above the headline, and the first light drifts to it.
 */
export const skyPlates = [
  { slug: "saturn", x: 0.5, y: 0.14, s: 0.17, feather: 0.6 },
  { slug: "jupiter", x: 0.13, y: 0.36, s: 0.13, feather: 0.7 },
  { slug: "mars", x: 0.86, y: 0.3, s: 0.07, feather: 0.75 },
  { slug: "venus", x: 0.22, y: 0.86, s: 0.06, feather: 0.75 },
] as const;

export type SkyPlate = (typeof skyPlates)[number]["slug"];

/** How many of tonight's targets the homepage lists; the full list is /app/missions. */
export const homeTonightLimit = 6;
