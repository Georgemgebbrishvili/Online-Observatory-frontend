export const homepageTargets = [
  { id: "moon", quality: "Excellent", visual: "moon", durationMinutes: 8 },
  { id: "saturn", quality: "Excellent", visual: "saturn", durationMinutes: 12 },
  { id: "m31", quality: "Good", visual: "galaxy", durationMinutes: 18 },
  { id: "m13", quality: "Good", visual: "cluster", durationMinutes: 14 },
  { id: "m27", quality: "Fair", visual: "nebula", durationMinutes: 16 },
  { id: "m57", quality: "Good", visual: "ring", durationMinutes: 15 },
] as const;

export type HomepageTarget = (typeof homepageTargets)[number];
export type HomepageTargetId = HomepageTarget["id"];

export const collectionFrames = [
  { id: "m42", visual: "nebula" },
  { id: "moon", visual: "moon" },
  { id: "m13", visual: "cluster" },
] as const;

export type CollectionFrameId = (typeof collectionFrames)[number]["id"];
