import Link from "next/link";

import { TonightNotices } from "@/components/astronomy/tonight-notices";
import { CaptureImage } from "@/components/collection/capture-card";
import { linkTone, weatherTone } from "@/components/status/status-page";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { captureTitle } from "@/features/collection/present";
import type { CollectionResult } from "@/features/collection/read";
import type { ObservatoryPanelResult, UpcomingResult } from "@/features/home/read";
import {
  formatWindow,
  targetDescription,
  targetName,
  targetVisual,
} from "@/features/targets/present";
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

/** The drawn stand-in for a target, labelled as one: never presented as telescope output. */
function Illustration({ label, visual }: { label: string; visual: string }) {
  return (
    <figure className="home-illustration">
      <div
        className={`mission-target-visual mission-target-visual-${visual}`}
        aria-hidden="true"
      >
        <i />
        <b />
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function ObservatoryPanel({
  locale,
  panel,
}: {
  locale: Locale;
  panel: ObservatoryPanelResult;
}) {
  const copy = authenticatedHomeCopy[locale];
  const words = statusCopy[locale];

  return (
    <aside className="home-observatory" aria-labelledby="home-observatory-title">
      <div className="home-section-label">
        <h2 id="home-observatory-title" className="home-label-heading">
          {copy.observatory}
        </h2>
        <Link className="home-text-link" href={`/${locale}/status`}>
          {copy.fullStatus} <span aria-hidden="true">→</span>
        </Link>
      </div>

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
          <dl>
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

  return (
    <div className="authenticated-home">
      <header className="home-dashboard-header">
        <div>
          <p className="home-dashboard-kicker">
            {brand.en.name.toUpperCase()}
            {panel.kind === "ok" ? ` · ${panel.observatory.city}` : ""}
          </p>
          <h1>{copy.greeting(displayName)}</h1>
        </div>
        <p>{copy.introduction}</p>
      </header>

      <div className="tonight-notices">
        <TonightNotices result={tonight} locale={locale} headingLevel={2} />
      </div>

      <div className="home-dashboard-grid">
        {recommended ? (
          <section className="home-tonight" aria-labelledby="home-tonight-title">
            <Illustration
              label={copy.illustration}
              visual={targetVisual(recommended.target)}
            />
            <span className="home-tonight-shade" aria-hidden="true" />
            <div className="home-tonight-copy">
              <div className="home-section-label">
                <span>{copy.tonight}</span>
                <strong>{words.types[recommended.target.type]}</strong>
              </div>
              <h2 id="home-tonight-title">
                {copy.recommendation(targetName(recommended.target, locale))}
              </h2>
              {targetDescription(recommended.target, locale) && (
                <p>{targetDescription(recommended.target, locale)}</p>
              )}
              <dl>
                <div>
                  <dt>{copy.window}</dt>
                  <dd>
                    {formatWindow(recommended.visibility, timezone, locale, words.window)}
                  </dd>
                </div>
                <div>
                  <dt>{copy.altitude}</dt>
                  <dd>
                    {Math.round(recommended.visibility.horizontal.altitudeDegrees)}°
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
                <Link className="home-text-link" href={`/${locale}/app/missions`}>
                  {copy.exploreTonight} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="home-tonight home-tonight-empty" aria-label={copy.tonight}>
            <div className="home-tonight-copy">
              <Link className="home-text-link" href={`/${locale}/app/missions`}>
                {copy.exploreTonight} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        )}

        <ObservatoryPanel locale={locale} panel={panel} />

        <section className="home-upcoming" aria-labelledby="home-upcoming-title">
          <div className="home-section-label">
            <h2 id="home-upcoming-title" className="home-label-heading">
              {copy.upcoming}
            </h2>
          </div>
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
            <div className="home-upcoming-list">
              {upcoming.items.map(({ mission, target }, index) => {
                const name = target ? targetName(target, locale) : copy.retiredTarget;
                return (
                  <article key={mission.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p>
                        {mission.scheduledStartAt &&
                          scheduleFormat.format(new Date(mission.scheduledStartAt))}
                      </p>
                      <h3>{name}</h3>
                      {mission.mode === "SIMULATED" && <small>{copy.simulated}</small>}
                    </div>
                    {target && (
                      <Link
                        href={`/${locale}/app/missions/${target.slug}`}
                        aria-label={`${copy.viewTarget}: ${name}`}
                      >
                        <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {alsoTonight.length > 0 && (
        <section className="home-explore" aria-labelledby="home-explore-title">
          <header>
            <div>
              <h2 id="home-explore-title">{copy.alsoTonight}</h2>
            </div>
            <p>{copy.alsoTonightDescription}</p>
          </header>
          <div className="home-explore-grid">
            {alsoTonight.map(({ target, visibility }) => (
              <article key={target.id} className="home-explore-card">
                <Link
                  className={`mission-target-visual mission-target-visual-${targetVisual(target)}`}
                  href={`/${locale}/app/missions/${target.slug}`}
                  aria-label={`${copy.discover}: ${targetName(target, locale)}`}
                >
                  <i />
                  <b />
                </Link>
                <div>
                  <p>
                    {words.types[target.type]}
                    {target.catalogId ? ` · ${target.catalogId}` : ""}
                  </p>
                  <h3>{targetName(target, locale)}</h3>
                  <span>
                    {formatWindow(visibility, timezone, locale, words.window)} ·{" "}
                    {Math.round(visibility.horizontal.altitudeDegrees)}°
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section
        className="home-collection-progress"
        aria-labelledby="home-collection-title"
      >
        <div className="home-collection-intro">
          <h2 id="home-collection-title">{copy.collection}</h2>
          <p>{copy.collectionDescription}</p>
          <Link className="home-text-link" href={`/${locale}/app/collection`}>
            {copy.openCollection} <span aria-hidden="true">→</span>
          </Link>
        </div>
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
            <div>
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
                    sizes="8rem"
                    src={entry.thumbnail}
                  />
                  {entry.capture.mode === "SIMULATED" && (
                    <small className="home-capture-simulated">{copy.simulated}</small>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
