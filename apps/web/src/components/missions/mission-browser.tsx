"use client";

import type { TargetType, TonightTarget } from "@darkview/contracts";
import Link from "next/link";
import { useState } from "react";

import { TargetAvailability } from "@/components/astronomy/target-availability";
import {
  formatWindow,
  primaryReason,
  targetDescription,
  targetName,
  targetVisual,
} from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { missionBrowserCopy } from "@/i18n/resources/missions";
import { targetCopy } from "@/i18n/resources/targets";

type MissionBrowserProps = {
  locale: Locale;
  items: TonightTarget[];
  timezone: string;
};

type TargetFilter = "ALL" | TargetType;

export function MissionBrowser({ items, locale, timezone }: MissionBrowserProps) {
  const [activeFilter, setActiveFilter] = useState<TargetFilter>("ALL");
  const copy = missionBrowserCopy[locale];
  const words = targetCopy[locale];
  // Only the types tonight's list actually holds: a filter that can only ever be empty
  // is noise.
  const filters: TargetFilter[] = [
    "ALL",
    ...new Set(items.map((item) => item.target.type)),
  ];
  const visible = items.filter(
    (item) => activeFilter === "ALL" || item.target.type === activeFilter,
  );

  return (
    <>
      <div className="mission-filters" role="group" aria-label={copy.filterLabel}>
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="mission-filter"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === "ALL" ? copy.all : words.typesPlural[filter]}
          </button>
        ))}
      </div>

      <ol className="mission-target-grid" aria-live="polite">
        {visible.map(({ target, visibility }) => {
          const name = targetName(target, locale);
          const reason = primaryReason(visibility);
          const href = `/${locale}/app/missions/${target.slug}`;
          return (
            <li key={target.id}>
              <article
                className="mission-target-card"
                data-observable={visibility.observable}
              >
                <Link
                  className="mission-card-visual-link"
                  href={href}
                  aria-label={`${copy.view}: ${name}`}
                >
                  <div
                    className={`mission-target-visual mission-target-visual-${targetVisual(target)}`}
                    aria-hidden="true"
                  >
                    <i />
                    <b />
                  </div>
                </Link>

                <div className="mission-target-body">
                  <header>
                    <div>
                      <p>
                        {words.types[target.type]}
                        {target.catalogId ? ` · ${target.catalogId}` : ""}
                      </p>
                      <h2>
                        <Link href={href}>{name}</Link>
                      </h2>
                    </div>
                    <TargetAvailability
                      observable={visibility.observable}
                      label={reason ? words.reasons[reason] : words.observable}
                    />
                  </header>

                  <p className="mission-target-description">
                    {targetDescription(target, locale)}
                  </p>

                  <dl className="mission-card-data">
                    <div>
                      <dt>{copy.altitude}</dt>
                      <dd>{Math.round(visibility.horizontal.altitudeDegrees)}°</dd>
                    </div>
                    <div>
                      <dt>{copy.window}</dt>
                      <dd>{formatWindow(visibility, timezone, locale, words.window)}</dd>
                    </div>
                    <div>
                      <dt>{copy.duration}</dt>
                      <dd>
                        {target.expectedMissionMinutes} {copy.minutes}
                      </dd>
                    </div>
                  </dl>

                  <Link className="mission-card-action" href={href}>
                    {copy.view}
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </>
  );
}
