export const collectionFrames = [
  { id: "m42", visual: "nebula" },
  { id: "moon", visual: "moon" },
  { id: "m13", visual: "cluster" },
] as const;

export type CollectionFrameId = (typeof collectionFrames)[number]["id"];
