/**
 * The painted scene a turned card's face shows for a catalogue target (ADR-058 §1),
 * copied from Skychaser's `public/cards/art`. Each target's colour, which Skychaser
 * sampled from its painting, is in styles/skychaser-card.css under `data-face`. A
 * target with no painting takes a plain face. Every face is an illustration.
 */
const painted = new Set([
  "moon-terminator",
  "jupiter",
  "saturn",
  "mars",
  "venus",
  "m13-hercules-cluster",
  "m57-ring-nebula",
  "m42-orion-nebula",
  // Mizar and Alcor sit in the Big Dipper's handle; Skychaser painted the Dipper.
  "mizar-alcor",
]);

export function cardArt(slug: string | null): string | null {
  return slug && painted.has(slug) ? `/cards/art/${slug}.webp` : null;
}
