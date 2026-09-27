export const collectionFrames = [
  { id: "m42", visual: "nebula" },
  { id: "moon", visual: "moon" },
  { id: "m13", visual: "cluster" },
] as const;

export type CollectionFrameId = (typeof collectionFrames)[number]["id"];

/** The homepage hero's targets (ADR-028), the first featured on load. */
export const showcaseTargets = ["saturn", "jupiter", "mars"] as const;

export type ShowcaseTargetId = (typeof showcaseTargets)[number];
