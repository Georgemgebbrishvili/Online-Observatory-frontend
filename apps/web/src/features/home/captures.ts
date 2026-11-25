/**
 * Real captures for the homepage hero (ADR-106), by object. A picture here was taken with
 * this observatory's own telescope and camera on `capturedOn`; the hero shows it in
 * place of another observer's photograph (ADR-107) and says so. Empty until the first is taken: see
 * `public/sky/captures/README.md`.
 */
export type HeroCapture = { src: string; capturedOn: string };

export const heroCaptures: Partial<Record<string, HeroCapture>> = {};

/** The hero's two layers and its capture date for an object: the real picture when there is one. */
export function heroPicture(
  targetId: string,
  captures: Partial<Record<string, HeroCapture>> = heroCaptures,
) {
  const capture = captures[targetId];
  return capture
    ? { feed: { raw: capture.src, settled: capture.src }, capturedOn: capture.capturedOn }
    : {
        feed: { raw: `/sky/feed/${targetId}-raw.webp`, settled: `/sky/feed/${targetId}.webp` },
        capturedOn: null,
      };
}
