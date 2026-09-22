import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  activeObservatoryId,
  getMissionTarget,
  missionTargets,
} from "@/features/missions/targets";
import { getDevelopmentMissionForTarget } from "@/features/missions/simulator";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { missionBrowserCopy, missionDetailCopy } from "@/i18n/resources/missions";
import { requireUser } from "@/lib/platform/session";
import "@/styles/missions.css";

type MissionTargetPageProps = {
  params: Promise<{ locale: string; targetSlug: string }>;
  searchParams: Promise<{ action?: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    missionTargets.map((target) => ({ locale, targetSlug: target.slug })),
  );
}

export async function generateMetadata({
  params,
}: MissionTargetPageProps): Promise<Metadata> {
  const { locale, targetSlug } = await params;
  const target = getMissionTarget(targetSlug);

  if (!isLocale(locale) || !target) {
    return {};
  }

  const name = locale === "ka" ? target.georgianName : target.commonName;
  return {
    title: `${name} · Darkview`,
    description: target.description[locale],
  };
}

function targetName(
  locale: Locale,
  target: NonNullable<ReturnType<typeof getMissionTarget>>,
) {
  return locale === "ka" ? target.georgianName : target.commonName;
}

function formatBestMonths(locale: Locale, months: readonly number[]) {
  const formatter = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    month: "long",
    timeZone: "UTC",
  });
  return months
    .map((month) => formatter.format(new Date(Date.UTC(2026, month - 1, 1))))
    .join(" · ");
}

export default async function MissionTargetPage({
  params,
  searchParams,
}: MissionTargetPageProps) {
  const [{ locale, targetSlug }, { action }] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);

  const target = getMissionTarget(targetSlug);

  if (!target) {
    notFound();
  }

  const copy = missionDetailCopy[locale];
  const name = targetName(locale, target);
  const compatible = target.observatoryCompatibility.includes(activeObservatoryId);
  const developmentMission = getDevelopmentMissionForTarget(target.slug);

  if (!developmentMission) notFound();

  const actionMessage =
    action === "schedule" ? { title: copy.scheduleReady, note: copy.scheduleNote } : null;

  return (
    <article className="mission-detail">
      <Link className="mission-back-link" href={`/${locale}/app/missions`}>
        <span aria-hidden="true">←</span> {copy.back}
      </Link>

      <header className="mission-detail-hero">
        <div className="mission-detail-copy">
          <p className="eyebrow">
            <span aria-hidden="true" />
            {copy.available}
          </p>
          <p className="mission-detail-catalog">
            {missionBrowserCopy[locale].types[target.type]} · {target.catalogId}
          </p>
          <h1>{name}</h1>
          <p className="mission-detail-description">{target.description[locale]}</p>
        </div>
        <div
          className={`mission-detail-visual mission-target-visual-${target.imagePreset}`}
          aria-label={`${name} · ${copy.illustration}`}
          role="img"
        >
          <div className="mission-visual-reticle" aria-hidden="true">
            <span />
            <span />
          </div>
          <i aria-hidden="true" />
          <b aria-hidden="true" />
          <small>{target.currentVisibility.altitude}°</small>
        </div>
      </header>

      <section className="mission-detail-grid" aria-label={copy.visibility}>
        <div className="mission-detail-main">
          <div className="mission-stat-grid">
            <dl>
              <div>
                <dt>{copy.visibility}</dt>
                <dd>
                  <span className="detail-live-dot" />
                  {copy.visible}
                </dd>
              </div>
              <div>
                <dt>{copy.window}</dt>
                <dd>{target.currentVisibility.window}</dd>
              </div>
              <div>
                <dt>{copy.altitude}</dt>
                <dd>{target.currentVisibility.altitude}°</dd>
              </div>
              <div>
                <dt>{copy.duration}</dt>
                <dd>
                  {target.preferredObservationDuration} {copy.minutes}
                </dd>
              </div>
              <div>
                <dt>{copy.difficulty}</dt>
                <dd>{target.difficulty[locale]}</dd>
              </div>
            </dl>
          </div>

          <section className="mission-expectation">
            <p>{copy.expect}</p>
            <h2>{target.expectation[locale]}</h2>
          </section>

          <details className="mission-technical">
            <summary>
              {copy.technical}
              <span aria-hidden="true">+</span>
            </summary>
            <dl>
              <div>
                <dt>{copy.catalog}</dt>
                <dd>{target.catalogId}</dd>
              </div>
              <div>
                <dt>{copy.coordinates}</dt>
                <dd>
                  {target.ra} / {target.dec}
                </dd>
              </div>
              <div>
                <dt>{copy.magnitude}</dt>
                <dd>{target.magnitude}</dd>
              </div>
              <div>
                <dt>{copy.angularSize}</dt>
                <dd>{target.angularSize}</dd>
              </div>
              <div>
                <dt>{copy.minimumAltitude}</dt>
                <dd>{target.minimumAltitude}°</dd>
              </div>
              <div>
                <dt>{copy.bestMonths}</dt>
                <dd>{formatBestMonths(locale, target.bestMonths)}</dd>
              </div>
            </dl>
          </details>
        </div>

        <aside className="mission-action-panel" id="mission-actions">
          <p>{copy.observatory}</p>
          <h2>{copy.observatoryName}</h2>
          <span className="mission-compatible">
            <i aria-hidden="true" />
            {compatible ? copy.capable : "—"}
          </span>
          <div>
            <Link
              className="button button-primary button-large"
              href={`/${locale}/app/missions/${developmentMission.id}/session`}
            >
              <span>{copy.start}</span>
            </Link>
            <Link
              className="button button-secondary button-large"
              href={`?action=schedule#mission-actions`}
            >
              <span>{copy.schedule}</span>
            </Link>
          </div>
          {actionMessage && (
            <div className="mission-action-feedback" role="status">
              <strong>{actionMessage.title}</strong>
              <span>{actionMessage.note}</span>
            </div>
          )}
        </aside>
      </section>
    </article>
  );
}
