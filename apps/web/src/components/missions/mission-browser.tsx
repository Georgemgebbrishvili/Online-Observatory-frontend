"use client";

import Link from "next/link";
import { useState } from "react";

import type { Locale } from "@/i18n/config";
import { missionBrowserCopy } from "@/i18n/resources/missions";
import {
  rankedMissionTargets,
  type TargetType,
  targetTypes,
} from "@/features/missions/targets";

type MissionBrowserProps = {
  locale: Locale;
};

type TargetFilter = "All" | TargetType;

const filters: TargetFilter[] = ["All", ...targetTypes];

function localizedName(locale: Locale, target: (typeof rankedMissionTargets)[number]) {
  return locale === "ka" ? target.georgianName : target.commonName;
}

export function MissionBrowser({ locale }: MissionBrowserProps) {
  const [activeFilter, setActiveFilter] = useState<TargetFilter>("All");
  const copy = missionBrowserCopy[locale];
  const targets = rankedMissionTargets.filter(
    (target) => activeFilter === "All" || target.type === activeFilter,
  );

  return (
    <section className="missions-page" aria-labelledby="missions-title">
      <header className="missions-hero">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {copy.eyebrow}
        </p>
        <div className="missions-hero-copy">
          <h1 id="missions-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
      </header>

      <div className="mission-filters" role="group" aria-label={copy.title}>
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="mission-filter"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {copy.filters[filter]}
          </button>
        ))}
      </div>

      {targets.length > 0 ? (
        <ol className="mission-target-grid" aria-live="polite">
          {targets.map((target, index) => (
            <li key={target.id}>
              <article className="mission-target-card">
                <Link
                  className="mission-card-visual-link"
                  href={`/${locale}/app/missions/${target.slug}`}
                  aria-label={`${copy.view}: ${localizedName(locale, target)}`}
                >
                  <div
                    className={`mission-target-visual mission-target-visual-${target.imagePreset}`}
                    aria-hidden="true"
                  >
                    <span className="mission-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <i />
                    <b />
                  </div>
                </Link>

                <div className="mission-target-body">
                  <header>
                    <div>
                      <p>
                        {copy.types[target.type]} · {target.catalogId}
                      </p>
                      <h2>
                        <Link href={`/${locale}/app/missions/${target.slug}`}>
                          {localizedName(locale, target)}
                        </Link>
                      </h2>
                    </div>
                    <span className="mission-availability">
                      <i aria-hidden="true" />
                      {index === 0 ? copy.ranked : copy.available}
                    </span>
                  </header>

                  <p className="mission-target-description">
                    {target.description[locale]}
                  </p>

                  <dl className="mission-card-data">
                    <div>
                      <dt>{copy.altitude}</dt>
                      <dd>{target.currentVisibility.altitude}°</dd>
                    </div>
                    <div>
                      <dt>{copy.window}</dt>
                      <dd>{target.currentVisibility.window}</dd>
                    </div>
                    <div>
                      <dt>{copy.duration}</dt>
                      <dd>
                        {target.preferredObservationDuration} {copy.minutes}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    className="mission-card-action"
                    href={`/${locale}/app/missions/${target.slug}`}
                  >
                    {copy.view}
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mission-empty" role="status">
          <div className="mission-empty-orbit" aria-hidden="true">
            <span />
          </div>
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyDescription}</p>
        </div>
      )}
    </section>
  );
}
