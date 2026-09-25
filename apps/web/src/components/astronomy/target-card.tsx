import type { TonightTarget } from "@darkview/contracts";

import { TargetAvailability } from "@/components/astronomy/target-availability";
import { ButtonLink } from "@/components/ui/button";
import {
  formatWindow,
  primaryReason,
  targetName,
  targetVisual,
} from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { targetCopy } from "@/i18n/resources/targets";
import type { HomepageDictionary } from "@/types/homepage";

type TargetCardProps = {
  item: TonightTarget;
  /** The observatory's, so a window reads in the sky's own local time. */
  timezone: string;
  locale: Locale;
  common: HomepageDictionary["common"];
};

export function TargetCard({ common, item, locale, timezone }: TargetCardProps) {
  const { target, visibility } = item;
  const copy = targetCopy[locale];
  const reason = primaryReason(visibility);

  return (
    <article className="target-card" data-observable={visibility.observable}>
      <div
        className={`target-visual target-visual-${targetVisual(target)}`}
        aria-hidden="true"
      >
        <span />
      </div>
      {/* CLAUDE.md: never present an illustration as telescope output. */}
      <p className="target-visual-note">{common.illustration}</p>
      <div className="target-card-body">
        <header>
          <div>
            <p>
              {copy.types[target.type]}
              {target.catalogId ? ` · ${target.catalogId}` : ""}
            </p>
            <h3>{targetName(target, locale)}</h3>
          </div>
          <TargetAvailability
            observable={visibility.observable}
            label={reason ? copy.reasons[reason] : copy.observable}
          />
        </header>
        <dl>
          <div>
            <dt>{common.altitude}</dt>
            <dd>{Math.round(visibility.horizontal.altitudeDegrees)}°</dd>
          </div>
          <div>
            <dt>{common.window}</dt>
            <dd>{formatWindow(visibility, timezone, locale, copy.window)}</dd>
          </div>
          <div>
            <dt>{common.duration}</dt>
            <dd>
              {target.expectedMissionMinutes} {common.minutes}
            </dd>
          </div>
        </dl>
        <ButtonLink
          href={`/${locale}/app/missions/${target.slug}`}
          variant="secondary"
          size="small"
        >
          {common.viewTarget}
        </ButtonLink>
      </div>
    </article>
  );
}
