import type { TonightTarget } from "@darkview/contracts";

import { TELESCOPE_TARGET_BY_ID } from "@/lib/observatory-sim/telescope-targets";
import type { Locale } from "@/i18n/config";

/**
 * The platform's catalogue target as the sky model knows it: a body by its name, a
 * fixed object by its catalogue designation ("M13" → m13, "NGC 869" → ngc869), a star
 * by its slug. Null when the model has no such object to point at.
 */
export function simTargetId(target: TonightTarget["target"]): string | null {
  const candidates = [
    target.solarSystemBody?.toLowerCase(),
    target.catalogId?.toLowerCase().replace(/\s+/g, ""),
    target.slug,
    `star-${target.slug}`,
  ].filter((id): id is string => Boolean(id));
  return candidates.find((id) => TELESCOPE_TARGET_BY_ID.has(id)) ?? null;
}

/** The quick start's target: tonight's highest observable target the model can draw. */
export function quickStartTarget(
  items: TonightTarget[],
  locale: Locale,
): { name: string; targetId: string } | null {
  const up = items
    .filter((item) => item.visibility.observable)
    .sort(
      (a, b) =>
        b.visibility.horizontal.altitudeDegrees - a.visibility.horizontal.altitudeDegrees,
    );
  for (const item of up) {
    const targetId = simTargetId(item.target);
    if (targetId)
      return { name: locale === "ka" ? item.target.nameKa : item.target.nameEn, targetId };
  }
  return null;
}
