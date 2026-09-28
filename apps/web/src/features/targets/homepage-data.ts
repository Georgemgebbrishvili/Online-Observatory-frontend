/** The homepage hero's planets (ADR-029), the first featured on load. */
export const planets = ["earth", "venus", "mars"] as const;

export type PlanetId = (typeof planets)[number];
