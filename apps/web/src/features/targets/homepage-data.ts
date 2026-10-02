/**
 * The plates held in the homepage hero's fan (ADR-039), left to right; the middle one
 * stands in front. Planets a 6SE shows in a live stack, each with an ADR-027 plate.
 */
export const fanPlates = ["jupiter", "saturn", "mars"] as const;

export type FanPlate = (typeof fanPlates)[number];

/** How many of tonight's targets the homepage lists; the full list is /app/missions. */
export const homeTonightLimit = 6;
