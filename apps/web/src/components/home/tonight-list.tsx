import type { TonightTarget } from "@darkview/contracts";
import Link from "next/link";

import { TargetAvailability } from "@/components/astronomy/target-availability";
import { formatWindow, primaryReason, targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { targetCopy } from "@/i18n/resources/targets";
import type { HomepageDictionary } from "@/types/homepage";

type TonightListProps = {
  items: readonly TonightTarget[];
  /** The observatory's, so a window reads in the sky's own local time. */
  timezone: string;
  locale: Locale;
  common: HomepageDictionary["common"];
};

/**
 * Tonight's targets as ruled rows (ADR-039): the platform's order and reasons, each
 * row a link to its target. No pictures here, so nothing to mistake for the feed.
 */
export function TonightList({ common, items, locale, timezone }: TonightListProps) {
  const copy = targetCopy[locale];

  return (
    <ol className="tonight-list">
      {items.map(({ target, visibility }, index) => {
        const reason = primaryReason(visibility);
        return (
          <li key={target.id} data-observable={visibility.observable}>
            <span className="tonight-list-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="tonight-list-name">
              <p>
                {copy.types[target.type]}
                {target.catalogId ? ` · ${target.catalogId}` : ""}
              </p>
              <h3>
                <Link href={`/${locale}/app/missions/${target.slug}`}>
                  {targetName(target, locale)}
                </Link>
              </h3>
            </div>
            <TargetAvailability
              observable={visibility.observable}
              label={reason ? copy.reasons[reason] : copy.observable}
            />
            <dl>
              <div>
                <dt>{common.altitude}</dt>
                <dd>{Math.round(visibility.horizontal.altitudeDegrees)}°</dd>
              </div>
              <div>
                <dt>{common.window}</dt>
                <dd>{formatWindow(visibility, timezone, locale, copy.window)}</dd>
              </div>
            </dl>
            <span className="tonight-list-arrow" aria-hidden="true">
              →
            </span>
          </li>
        );
      })}
    </ol>
  );
}
