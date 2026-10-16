/** Our drawn plate of a target, where there is one (ADR-052 §7); the rest take a swatch. */
export function plateOf(body: string | null | undefined): string | null {
  const id = body?.toLowerCase();
  return id && ["saturn", "jupiter", "mars", "venus"].includes(id) ? `/plates/${id}.webp` : null;
}
