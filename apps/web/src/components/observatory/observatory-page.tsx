import type {
  PublicObservatoryStatus,
  TonightTarget,
  ViewingConditions,
} from "@darkview/contracts";
import Link from "next/link";

import { FieldPlate } from "@/components/observatory/field-plate";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { SiteClock } from "@/components/observatory/site-clock";
import { StarField } from "@/components/observatory/star-field";
import { ButtonLink } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import type { ObservatoryPanelResult } from "@/features/home/read";
import { observatories } from "@/features/observatory/observatories";
import { fieldOfView } from "@/features/observatory/optics";
import { fill } from "@/features/operator/format";
import { formatWindow, primaryReason, targetName } from "@/features/targets/present";
import type { TonightResult } from "@/features/targets/read";
import type { Locale } from "@/i18n/config";
import { observatoryPageCopy } from "@/i18n/resources/observatory";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";

type ObservatoryPageProps = {
  locale: Locale;
  panel: ObservatoryPanelResult;
  tonight: TonightResult;
  conditions: ViewingConditions | null;
};

type SceneState = "online" | "observing" | "hold" | "degraded" | "offline";

// The observatory's zone when the platform cannot be read: Phase 1 is one site, in
// Tbilisi (ADR-003).
const fallbackTimezone = "Asia/Tbilisi";

/** One word for the instrument's state, worst first: a hold outranks a session. */
function sceneState(status: PublicObservatoryStatus): SceneState {
  if (status.link === "OFFLINE") return "offline";
  if (status.weather.holdActive) return "hold";
  if (status.missionInProgress) return "observing";
  if (status.link === "DEGRADED") return "degraded";
  return "online";
}

function siteHour(iso: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

function wayLinks(locale: Locale) {
  return [`/${locale}/app/book`, `/${locale}/app/live`, `/${locale}/app/missions`];
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="9.5"
        r="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11.1 3.5 3.5 0 0 0 7 18Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Facts({
  locale,
  conditions,
  timezone,
}: {
  locale: Locale;
  conditions: ViewingConditions | null;
  timezone: string;
}) {
  const scene = observatoryPageCopy[locale].scene;
  const first = conditions?.items[0] ?? null;
  const cloud = conditions?.items.find(
    (hour) => hour.status === "KNOWN" && hour.cloudCoverPercent !== null,
  )?.cloudCoverPercent;
  const tone =
    cloud === undefined || cloud === null
      ? ""
      : cloud > 70
        ? " observatory-fact-icon-bad"
        : cloud > 30
          ? " observatory-fact-icon-warn"
          : "";

  return (
    <dl className="observatory-facts">
      <div className="observatory-fact">
        <span className={`observatory-fact-icon${tone}`}>
          <CloudIcon />
        </span>
        <div className="observatory-fact-text">
          <dt>{scene.cloudAbout}</dt>
          <dd>
            {cloud === undefined || cloud === null
              ? scene.noForecast
              : scene.cloud(Math.round(cloud))}
          </dd>
        </div>
      </div>
      <div className="observatory-fact">
        <span className="observatory-fact-icon">
          <MoonIcon />
        </span>
        <div className="observatory-fact-text">
          <dt>{scene.firstHour}</dt>
          <dd>{first ? siteHour(first.at, timezone, locale) : scene.noHours}</dd>
        </div>
      </div>
    </dl>
  );
}

function MainFloat({
  locale,
  name,
  panel,
  tonight,
  conditions,
  timezone,
}: ObservatoryPageProps & { name: string; timezone: string }) {
  const copy = observatoryPageCopy[locale];
  const scene = copy.scene;
  const words = statusCopy[locale];
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;
  const state = panel.kind === "ok" ? sceneState(panel.status) : null;
  const observable =
    tonight.kind === "ok"
      ? tonight.items.filter((item) => item.visibility.observable).length
      : null;

  return (
    <div className="observatory-float observatory-float-main observatory-live">
      <div className="observatory-float-head">
        <span className="observatory-float-node">
          <PinIcon />
          {copy.eyebrow}
        </span>
        {state && (
          <span className={`observatory-pill observatory-pill-${state}`}>
            <span className="observatory-pill-led" aria-hidden="true" />
            {scene.states[state]}
          </span>
        )}
      </div>
      <p className="observatory-float-meta">
        {telescope && (
          <span>
            {telescope.manufacturer} {telescope.model}
          </span>
        )}
        <span>{copy.cameraModel}</span>
      </p>

      <h1 id="observatory-page-title" className="observatory-float-title">
        {name}
      </h1>
      {observable !== null && (
        <p className="observatory-float-subtitle">{scene.summary(observable)}</p>
      )}
      <p className="observatory-float-text">{copy.statement}</p>

      {panel.kind === "unreachable" && (
        <StatePanel variant="error" headingLevel={2} {...copy.statusUnavailable} />
      )}
      {panel.kind === "no-observatory" && (
        <StatePanel headingLevel={2} {...copy.noObservatory} />
      )}
      {panel.kind === "ok" && (
        <>
          <ModeNotice
            mode={panel.status.mode}
            label={words.mode[panel.status.mode].banner}
            detail={words.mode[panel.status.mode].detail}
          />
          {panel.status.missionInProgress && (
            <p className="observatory-float-mission">
              {/* A target name only while its owner has opted in (ADR-007). */}
              {panel.status.currentTargetName
                ? copy.observingNow(panel.status.currentTargetName)
                : copy.missionInProgress}
            </p>
          )}
          <div className="observatory-float-rule" />
          <Facts locale={locale} conditions={conditions} timezone={timezone} />
        </>
      )}

      <div className="observatory-actions">
        <ButtonLink href={`/${locale}/app/book`} size="large">
          {scene.book}
        </ButtonLink>
        <ButtonLink href={`/${locale}/app/live`} size="large" variant="secondary">
          {scene.watch}
        </ButtonLink>
      </div>
    </div>
  );
}

function Dock({ locale }: { locale: Locale }) {
  const copy = observatoryPageCopy[locale];
  const ways = copy.scene.ways;
  const links = wayLinks(locale);

  return (
    <nav className="observatory-dock" aria-label={ways.label}>
      {ways.items.map((way, index) => (
        <Link key={way.title} href={links[index]} className="observatory-dock-way">
          <span className="observatory-dock-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="observatory-dock-title">{way.title}</span>
          <span className="observatory-dock-line">
            {way.cta} <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
      <div className="observatory-dock-end">
        <Link className="observatory-ghost" href={`/${locale}/status`}>
          {copy.fullStatus} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </nav>
  );
}

function Instrument({
  locale,
  panel,
}: {
  locale: Locale;
  panel: ObservatoryPanelResult;
}) {
  const copy = observatoryPageCopy[locale];
  const words = copy.instrumentSection;
  const scene = copy.scene;
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;
  const state = panel.kind === "ok" ? sceneState(panel.status) : null;
  const field = telescope ? fieldOfView(telescope.focalLengthMm) : null;
  const number = new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });

  return (
    <section
      className="observatory-float observatory-float-section observatory-instrument"
      id="instrument"
      aria-labelledby="observatory-instrument-title"
    >
      <header className="observatory-section-head">
        <h2 id="observatory-instrument-title">{words.title}</h2>
        <span className="observatory-label">{words.kicker}</span>
      </header>
      <p className="observatory-section-lede">{words.lede}</p>

      <article className="observatory-card">
        <div className="observatory-card-head">
          <span className="observatory-card-code" aria-hidden="true">
            01
          </span>
          <div className="observatory-card-name">
            <h3>
              {telescope
                ? `${telescope.manufacturer} ${telescope.model}`
                : copy.telescope}
            </h3>
            <p>
              {copy.siteSection.cityValue} · {words.designValue} · {words.mountValue}
            </p>
          </div>
          {state && (
            <span className={`observatory-pill observatory-pill-${state}`}>
              <span className="observatory-pill-led" aria-hidden="true" />
              {scene.states[state]}
            </span>
          )}
        </div>

        <dl className="observatory-specs">
          {telescope && (
            <>
              <div>
                <dt>{copy.aperture}</dt>
                <dd className="figure">{telescope.apertureMm} mm</dd>
              </div>
              <div>
                <dt>{copy.focalLength}</dt>
                <dd className="figure">{telescope.focalLengthMm} mm</dd>
              </div>
              <div>
                <dt>{words.focalRatio}</dt>
                <dd className="figure">
                  {`f/${Math.round(telescope.focalLengthMm / telescope.apertureMm)}`}
                </dd>
              </div>
            </>
          )}
          {field && (
            <div>
              <dt>{scene.fieldOfView}</dt>
              <dd className="figure">
                {number.format(field.widthArcmin)}′ × {number.format(field.heightArcmin)}′
              </dd>
            </div>
          )}
          <div>
            <dt>{copy.camera}</dt>
            <dd>{copy.cameraModel}</dd>
          </div>
        </dl>

        <div className="observatory-card-foot">
          <p>
            {words.cameraNote} {scene.instrumentNote}
          </p>
          <ButtonLink href={`/${locale}/app/book`}>{scene.book}</ButtonLink>
        </div>
      </article>

      <div className="observatory-optics">
        <h3>{words.optics}</h3>
        <p>{words.opticsLede}</p>
        <ul>
          {words.configurations.map((configuration) => (
            <li key={configuration.value}>
              <span className="observatory-label">{configuration.name}</span>
              <span className="figure">{configuration.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Tonight({ locale, tonight }: { locale: Locale; tonight: TonightResult }) {
  const copy = observatoryPageCopy[locale];
  const words = targetCopy[locale];

  let body;
  if (tonight.kind === "unreachable") {
    body = <StatePanel variant="error" headingLevel={3} {...words.unreachable} />;
  } else if (tonight.kind === "no-observatory") {
    body = <StatePanel headingLevel={3} {...words.noObservatory} />;
  } else {
    const observable: TonightTarget[] = tonight.items
      .filter((item) => item.visibility.observable)
      .slice(0, 3);
    const reason = tonight.items[0] ? primaryReason(tonight.items[0].visibility) : null;
    body =
      observable.length === 0 ? (
        <StatePanel
          headingLevel={3}
          title={words.noneObservable.title}
          description={
            reason
              ? fill(words.noneObservable.reason, { reason: words.reasons[reason] })
              : ""
          }
        />
      ) : (
        <ol className="observatory-tonight-list">
          {observable.map(({ target, visibility }) => (
            <li key={target.id}>
              <Link href={`/${locale}/app/missions/${target.slug}`}>
                <span className="observatory-tonight-name">
                  {targetName(target, locale)}
                </span>
                <span className="observatory-tonight-meta">
                  <span>{words.types[target.type]}</span>
                  <span className="figure">
                    {Math.round(visibility.horizontal.altitudeDegrees)}°
                  </span>
                  <span className="figure">
                    {formatWindow(
                      visibility,
                      tonight.observatory.timezone,
                      locale,
                      words.window,
                    )}
                  </span>
                </span>
                <span className="observatory-tonight-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      );
  }

  return (
    <section
      className="observatory-float observatory-float-section observatory-tonight"
      aria-labelledby="observatory-tonight-title"
    >
      <header className="observatory-section-head">
        <h2 id="observatory-tonight-title">{copy.tonight}</h2>
        <Link className="observatory-label-link" href={`/${locale}/app/missions`}>
          {copy.scene.tonightAll} <span aria-hidden="true">→</span>
        </Link>
      </header>
      <p className="observatory-section-lede">{copy.tonightDescription}</p>
      {body}
    </section>
  );
}

function Ways({ locale }: { locale: Locale }) {
  const ways = observatoryPageCopy[locale].scene.ways;
  const links = wayLinks(locale);

  return (
    <section
      className="observatory-float observatory-float-section"
      aria-labelledby="observatory-ways-title"
    >
      <header className="observatory-section-head">
        <h2 id="observatory-ways-title">{ways.label}</h2>
        <span className="observatory-label">{ways.note}</span>
      </header>
      <ol className="observatory-ways">
        {ways.items.map((way, index) => (
          <li key={way.title} className="observatory-way">
            <span className="observatory-way-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{way.title}</h3>
              <p>{way.body}</p>
            </div>
            <Link href={links[index]} className="observatory-way-link">
              {way.cta}
              <span aria-hidden="true"> →</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Safety({ locale }: { locale: Locale }) {
  const words = observatoryPageCopy[locale].safetySection;

  return (
    <section
      className="observatory-float observatory-float-section"
      id="safety"
      aria-labelledby="observatory-safety-title"
    >
      <header className="observatory-section-head">
        <h2 id="observatory-safety-title">{words.title}</h2>
        <span className="observatory-label">{words.kicker}</span>
      </header>
      <p className="observatory-section-lede">{words.lede}</p>
      <ol className="observatory-rules">
        {words.rules.map((rule, index) => (
          <li key={rule.title}>
            <span className="observatory-rule-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{rule.title}</h3>
            <p>{rule.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Site({ locale }: { locale: Locale }) {
  const copy = observatoryPageCopy[locale];
  const site = copy.siteSection;
  const network = copy.networkSection;

  return (
    <section
      className="observatory-float observatory-float-section"
      id="site"
      aria-labelledby="observatory-site-title"
    >
      <header className="observatory-section-head">
        <h2 id="observatory-site-title">{site.title}</h2>
        <span className="observatory-label">{site.kicker}</span>
      </header>
      <p className="observatory-section-lede">{site.lede}</p>
      <dl className="observatory-sheet">
        <div>
          <dt>{site.city}</dt>
          <dd>{site.cityValue}</dd>
        </div>
        <div>
          <dt>{site.placement}</dt>
          <dd>{site.placementValue}</dd>
        </div>
        <div>
          <dt>{site.precision}</dt>
          <dd>{site.precisionValue}</dd>
        </div>
      </dl>

      <div
        className="observatory-network"
        id="network"
        role="region"
        aria-labelledby="observatory-network-title"
      >
        <header className="observatory-section-head">
          <h3 id="observatory-network-title">{network.title}</h3>
          <span className="observatory-label">{network.kicker}</span>
        </header>
        <p className="observatory-section-lede">{network.lede}</p>
        <dl className="observatory-sheet">
          <div>
            <dt>{network.today}</dt>
            <dd>{network.todayValue}</dd>
          </div>
          <div>
            <dt>{network.later}</dt>
            <dd>{network.laterValue}</dd>
          </div>
          <div>
            <dt>{network.applications}</dt>
            <dd>{network.applicationsValue}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/**
 * /observatory as the reference app's observatory scene (ADR-041): a star field, a
 * floating instrument card, the camera's frame on the Moon, the site's clock and a dock
 * of ways in, then the instrument, tonight, the ways, the safety rules and the site.
 * Every value is the platform's or the product's own; nothing links to a page that does
 * not exist.
 */
export function ObservatoryPage(props: ObservatoryPageProps) {
  const { locale, panel } = props;
  const copy = observatoryPageCopy[locale];
  const name =
    panel.kind === "ok"
      ? locale === "ka"
        ? panel.observatory.nameKa
        : panel.observatory.nameEn
      : observatories[0].name[locale];
  const timezone = panel.kind === "ok" ? panel.observatory.timezone : fallbackTimezone;
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;

  return (
    <main id="main-content" className="observatory-page">
      <StarField />
      <section className="observatory-scene" aria-labelledby="observatory-page-title">
        <SiteClock locale={locale} timezone={timezone} zoneLabel={copy.scene.siteTime} />
        <div className="observatory-scene-body">
          <MainFloat {...props} name={name} timezone={timezone} />
          {telescope && (
            <div className="observatory-scene-object">
              <FieldPlate
                focalLengthMm={telescope.focalLengthMm}
                locale={locale}
                labels={{ ...copy.scene.plate, caption: copy.illustration }}
              />
            </div>
          )}
        </div>
        <Dock locale={locale} />
      </section>

      <div className="observatory-below">
        <Instrument locale={locale} panel={panel} />
        <Tonight locale={locale} tonight={props.tonight} />
        <Ways locale={locale} />
        <Safety locale={locale} />
        <Site locale={locale} />
      </div>
    </main>
  );
}
