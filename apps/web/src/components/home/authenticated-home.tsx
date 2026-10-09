import Link from "next/link";

import { TonightNotices } from "@/components/astronomy/tonight-notices";
import { CaptureImage } from "@/components/collection/capture-card";
import { TonightList } from "@/components/home/tonight-list";
import { linkTone, weatherTone } from "@/components/status/status-page";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { captureTitle } from "@/features/collection/present";
import type { CollectionResult } from "@/features/collection/read";
import type { ObservatoryPanelResult, UpcomingResult } from "@/features/home/read";
import { plateFor } from "@/features/missions/room";
import { formatWindow, targetDescription, targetName } from "@/features/targets/present";
import type { TonightResult } from "@/features/targets/read";
import type { Locale } from "@/i18n/config";
import { authenticatedHomeCopy } from "@/i18n/resources/authenticated-home";
import { collectionGalleryCopy } from "@/i18n/resources/collection";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";
import { brand } from "@/brand";

type AuthenticatedHomeProps = {
  locale: Locale;
  displayName: string | null;
  tonight: TonightResult;
  panel: ObservatoryPanelResult;
  upcoming: Exclude<UpcomingResult, { kind: "signed-out" }>;
  collection: Exclude<CollectionResult, { kind: "signed-out" }>;
};

/**
 * The target's drawn plate, where one exists, captioned as an illustration: never
 * presented as telescope output. A target without one shows no picture.
 */
function Illustration({ label, src }: { label: string; src: string }) {
  return (
    <figure className="home-illustration">
      {/* A small static WebP from /public, shown at one size: next/image adds nothing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={388} height={555} />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function ObservatoryPanel({
  locale,
  panel,
}: {
  locale: Locale;
  panel: ObservatoryPanelResult;
}) {
  const copy = authenticatedHomeCopy[locale];
  const words = statusCopy[locale];

  return (
    <aside className="home-observatory plate" aria-labelledby="home-observatory-title">
      <header>
        <h2 id="home-observatory-title" className="plate-title">
          {copy.observatory}
        </h2>
        <Link className="page-link" href={`/${locale}/status`}>
          {copy.fullStatus} <span aria-hidden="true">→</span>
        </Link>
      </header>

      {panel.kind === "unreachable" && (
        <StatePanel variant="error" {...copy.statusUnavailable} />
      )}
      {panel.kind === "no-observatory" && <StatePanel {...copy.noObservatory} />}
      {panel.kind === "ok" && (
        <>
          <div className="home-observatory-copy">
            <h3>
              {locale === "ka" ? panel.observatory.nameKa : panel.observatory.nameEn}
            </h3>
            <p>{panel.observatory.city}</p>
            {panel.status.mode === "SIMULATED" && (
              <strong className="home-simulated">{copy.simulatedObservatory}</strong>
            )}
          </div>
          <div className="home-observatory-status">
            <StatusIndicator
              label={words.link[panel.status.link]}
              tone={linkTone[panel.status.link]}
            />
            <StatusIndicator
              label={words.weather[panel.status.weather.status]}
              tone={weatherTone[panel.status.weather.status]}
            />
            {panel.status.weather.holdActive && (
              <StatusIndicator label={words.now.holdActive} tone="danger" />
            )}
          </div>
          <dl className="ruled-specs">
            <div>
              <dt>{copy.telescope}</dt>
              <dd>
                {panel.observatory.telescope.manufacturer}{" "}
                {panel.observatory.telescope.model}
                {" · "}
                {panel.observatory.telescope.apertureMm} mm ·{" "}
                {panel.observatory.telescope.focalLengthMm} mm
              </dd>
            </div>
          </dl>
        </>
      )}
    </aside>
  );
}

export function AuthenticatedHome({
  collection,
  displayName,
  locale,
  panel,
  tonight,
  upcoming,
}: AuthenticatedHomeProps) {
  const copy = authenticatedHomeCopy[locale];
  const words = targetCopy[locale];
  const observable =
    tonight.kind === "ok"
      ? tonight.items.filter((item) => item.visibility.observable)
      : [];
  const [recommended, ...others] = observable;
  const alsoTonight = others.slice(0, 3);
  const timezone = tonight.kind === "ok" ? tonight.observatory.timezone : "UTC";
  const scheduleFormat = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: panel.kind === "ok" ? panel.observatory.timezone : timezone,
    timeZoneName: "short",
  });

  const plate = recommended ? plateFor(recommended.target.slug) : null;

  return (
    <div className="authenticated-home">
      <header className="page-hero home-dashboard-header">
        <p className="kicker">
          {/* The contract localises the observatory's name, not its city. */}
          {panel.kind === "ok"
            ? locale === "ka"
              ? panel.observatory.nameKa
              : panel.observatory.nameEn
            : locale === "ka"
              ? brand.ka.nominative
              : brand.en.name}
        </p>
        <h1>{copy.greeting(displayName)}</h1>
        <p className="page-lede">{copy.introduction}</p>
      </header>

      <div className="tonight-notices">
        <TonightNotices result={tonight} locale={locale} headingLevel={2} />
      </div>

      <div className="home-dashboard-grid">
        {recommended ? (
          <section
            className="home-tonight plate"
            data-illustrated={plate ? "true" : undefined}
            aria-labelledby="home-tonight-title"
          >
            <div className="home-tonight-copy">
              <p className="kicker">
                {copy.tonight} · {words.types[recommended.target.type]}
              </p>
              <h2 id="home-tonight-title">
                {copy.recommendation(targetName(recommended.target, locale))}
              </h2>
              {targetDescription(recommended.target, locale) && (
                <p>{targetDescription(recommended.target, locale)}</p>
              )}
              <dl className="ruled-specs">
                <div>
                  <dt>{copy.window}</dt>
                  <dd>
                    <span className="figure">
                      {formatWindow(
                        recommended.visibility,
                        timezone,
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
                      {Math.round(recommended.visibility.horizontal.altitudeDegrees)}°
                    </span>
                  </dd>
                </div>
              </dl>
              <div className="home-tonight-actions">
                <Link
                  className="button button-primary button-large"
                  href={`/${locale}/app/missions/${recommended.target.slug}`}
                >
                  <span>{copy.observe(targetName(recommended.target, locale))}</span>
                </Link>
                <Link className="page-link" href={`/${locale}/app/missions`}>
                  {copy.exploreTonight} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            {plate && <Illustration label={copy.illustration} src={plate} />}
          </section>
        ) : (
          <section className="home-tonight plate" aria-label={copy.tonight}>
            <Link className="page-link" href={`/${locale}/app/missions`}>
              {copy.exploreTonight} <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}

        <div className="home-side">
          <ObservatoryPanel locale={locale} panel={panel} />

          <section className="home-upcoming plate" aria-labelledby="home-upcoming-title">
            <header>
              <h2 id="home-upcoming-title" className="plate-title">
                {copy.upcoming}
              </h2>
            </header>
            {upcoming.kind === "unreachable" && (
              <StatePanel variant="error" {...copy.upcomingUnavailable} />
            )}
            {upcoming.kind === "ok" && upcoming.items.length === 0 && (
              <StatePanel
                title={copy.noUpcoming.title}
                description={copy.noUpcoming.description}
                action={
                  <Link
                    className="button button-secondary"
                    href={`/${locale}/app/missions`}
                  >
                    <span>{copy.noUpcoming.action}</span>
                  </Link>
                }
              />
            )}
            {upcoming.kind === "ok" && upcoming.items.length > 0 && (
              <ol className="home-upcoming-list">
                {upcoming.items.map(({ mission, target }) => {
                  const name = target ? targetName(target, locale) : copy.retiredTarget;
                  return (
                    <li key={mission.id}>
                      <div>
                        <p>
                          {mission.scheduledStartAt &&
                            scheduleFormat.format(new Date(mission.scheduledStartAt))}
                        </p>
                        <h3>
                          <Link
                            href={`/${locale}/app/missions/${mission.id}/session`}
                            aria-label={`${copy.openMission}: ${name}`}
                          >
                            {name}
                          </Link>
                        </h3>
                        {mission.mode === "SIMULATED" && (
                          <small className="home-simulated">{copy.simulated}</small>
                        )}
                      </div>
                      <span className="tonight-list-arrow" aria-hidden="true">
                        →
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>

      {alsoTonight.length > 0 && (
        <section className="page-section" aria-labelledby="home-explore-title">
          <div className="section-heading">
            <h2 id="home-explore-title">{copy.alsoTonight}</h2>
            <p className="page-lede">{copy.alsoTonightDescription}</p>
          </div>
          <div className="home-section-body">
            <TonightList
              common={{ altitude: copy.altitude, window: copy.window }}
              items={alsoTonight}
              locale={locale}
              timezone={timezone}
            />
          </div>
        </section>
      )}

      <section
        className="page-section home-collection"
        aria-labelledby="home-collection-title"
      >
        <div className="section-heading">
          <h2 id="home-collection-title">{copy.collection}</h2>
          <p className="page-lede">{copy.collectionDescription}</p>
          <Link className="page-link" href={`/${locale}/app/collection`}>
            {copy.openCollection} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="home-section-body">
          {collection.kind === "unreachable" && (
            <StatePanel variant="error" {...collectionGalleryCopy[locale].unreachable} />
          )}
          {collection.kind === "ok" && collection.entries.length === 0 && (
            <StatePanel
              title={collectionGalleryCopy[locale].empty.title}
              description={collectionGalleryCopy[locale].empty.description}
            />
          )}
          {collection.kind === "ok" && collection.entries.length > 0 && (
            <div className="home-recent-captures">
              {collection.entries.map((entry) => (
                <Link
                  key={entry.capture.id}
                  href={`/${locale}/app/collection/${entry.capture.id}`}
                  aria-label={captureTitle(entry, locale)}
                >
                  <CaptureImage
                    alt=""
                    captureId={`home-${entry.capture.id}`}
                    noPreview={collectionGalleryCopy[locale].noPreview}
                    sizes="12rem"
                    src={entry.thumbnail}
                  />
                  {entry.capture.mode === "SIMULATED" && (
                    <small className="home-capture-simulated">{copy.simulated}</small>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
