/**
 * Our own drawn plates (ADR-039, ADR-052 §7): the object as an illustration, never as
 * telescope output. The console draws a plate where a target has one and the sky model's
 * disc everywhere else. Skychaser's card art is its content and is not copied.
 */
const PLATES = new Set(["saturn", "jupiter", "mars", "venus"]);

/** The plate drawn of a telescope target, where there is one. */
export const plateFor = (targetId: string) => (PLATES.has(targetId) ? targetId : null);

export const plateArt = (plate: string) => `/plates/${plate}.webp`;

/** What a backyard telescope actually shows: small, soft and warm — not the plate. */
export const SCOPE_VIEW: Record<string, string> = { saturn: "/plates/scope/saturn.webp" };
