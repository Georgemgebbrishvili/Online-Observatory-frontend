import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TargetAvailability } from "@/components/astronomy/target-availability";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatePanel } from "@/components/ui/state-panel";
import {
  formatCoordinates,
  formatWindow,
  primaryReason,
  targetDescription,
  targetName,
  targetVisual,
} from "@/features/targets/present";
import { readTarget } from "@/features/targets/read";
import { isLocale } from "@/i18n/config";
import { missionDetailCopy } from "@/i18n/resources/missions";
import { targetCopy } from "@/i18n/resources/targets";
import { requireUser } from "@/lib/platform/session";
import "@/styles/pages.css";
import "@/styles/missions.css";
import { brand } from "@/brand";

type MissionTargetPageProps = {
  params: Promise<{ locale: string; targetSlug: string }>;
};

export async function generateMetadata({
  params,
}: MissionTargetPageProps): Promise<Metadata> {
  const { locale, targetSlug } = await params;
  if (!isLocale(locale)) return {};

  const result = await readTarget(targetSlug, locale);
  if (result.kind !== "ok") return {};

  return {
    title: `${targetName(result.target, locale)} · ${brand.en.name}`,
    description: targetDescription(result.target, locale) ?? undefined,
  };
}

export default async function MissionTargetPage({ params }: MissionTargetPageProps) {
  const { locale, targetSlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);

  const result = await readTarget(targetSlug, locale);
  if (result.kind === "not-found") notFound();

  const copy = missionDetailCopy[locale];
  const words = targetCopy[locale];

  if (result.kind === "unreachable") {
    return (
      <article className="mission-detail">
        <Link className="page-link mission-back-link" href={`/${locale}/app/missions`}>
          <span aria-hidden="true">←</span> {copy.back}
        </Link>
        <StatePanel variant="error" headingLevel={1} {...words.unreachable} />
      </article>
    );
  }

  const { target, tonight } = result;
  const name = targetName(target, locale);
  const visibility = tonight?.item.visibility ?? null;
  const reason = visibility ? primaryReason(visibility) : null;

  return (
    <article className="mission-detail">
      <Link className="page-link mission-back-link" href={`/${locale}/app/missions`}>
        <span aria-hidden="true">←</span> {copy.back}
      </Link>

      <header className="mission-detail-hero">
        <div className="mission-detail-copy">
          <p className="kicker">
            {words.types[target.type]}
            {target.catalogId ? ` · ${target.catalogId}` : ""}
          </p>
          <h1>{name}</h1>
          <p className="page-lede">{targetDescription(target, locale)}</p>
        </div>
        <figure className="mission-detail-figure">
          <div
            className={`mission-detail-visual mission-target-visual-${targetVisual(target)}`}
            aria-hidden="true"
          >
            <i />
            <b />
          </div>
          <figcaption>{copy.illustration}</figcaption>
        </figure>
      </header>

      <section className="mission-detail-grid" aria-label={copy.visibility}>
        <div className="mission-detail-main">
          {tonight && visibility ? (
            <div className="plate">
              <dl className="ruled-specs">
                <div>
                  <dt>{copy.visibility}</dt>
                  <dd>
                    <TargetAvailability
                      observable={visibility.observable}
                      label={reason ? words.reasons[reason] : words.observable}
                    />
                  </dd>
                </div>
                <div>
                  <dt>{copy.window}</dt>
                  <dd>
                    <span className="figure">
                      {formatWindow(
                        visibility,
                        tonight.observatory.timezone,
                        locale,
                        words.window,
                      )}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>{copy.altitude}</dt>
                  <dd>
                    <span className="figure">
                      {Math.round(visibility.horizontal.altitudeDegrees)}°
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>{copy.duration}</dt>
                  <dd>
                    <span className="figure">
                      {target.expectedMissionMinutes} <small>{copy.minutes}</small>
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <StatePanel
              variant="error"
              headingLevel={2}
              title={copy.visibilityUnknown}
              description={words.unreachable.description}
            />
          )}

          <details className="mission-technical plate">
            <summary>
              {copy.technical}
              <span aria-hidden="true">+</span>
            </summary>
            <dl className="ruled-specs">
              {target.catalogId && (
                <div>
                  <dt>{copy.catalog}</dt>
                  <dd>{target.catalogId}</dd>
                </div>
              )}
              {target.coordinates && (
                <div>
                  <dt>{copy.coordinates}</dt>
                  <dd>
                    <span className="figure">
                      {formatCoordinates(target.coordinates)}
                    </span>
                  </dd>
                </div>
              )}
              <div>
                <dt>{copy.magnitude}</dt>
                <dd>
                  <span className="figure">{target.magnitude}</span>
                </dd>
              </div>
              <div>
                <dt>{copy.angularSize}</dt>
                <dd>
                  <span className="figure">{target.angularSizeArcmin}′</span>
                </dd>
              </div>
              <div>
                <dt>{copy.minimumAltitude}</dt>
                <dd>
                  <span className="figure">{target.minAltitudeDegrees}°</span>
                </dd>
              </div>
            </dl>
          </details>
        </div>

        <aside className="mission-action-panel plate" id="mission-actions">
          <p className="plate-title">{copy.observatory}</p>
          <h2>{tonight?.observatory.name ?? copy.observatoryName}</h2>
          {tonight?.observatory.mode === "SIMULATED" && (
            <ModeNotice
              mode="SIMULATED"
              label={words.simulated.label}
              detail={words.simulated.detail}
            />
          )}
          <div>
            {/* Booking is Phase 3; /app/book says so plainly until then. */}
            <Link
              className="button button-primary button-large"
              href={`/${locale}/app/book`}
            >
              <span>{copy.book}</span>
            </Link>
          </div>
        </aside>
      </section>
    </article>
  );
}
