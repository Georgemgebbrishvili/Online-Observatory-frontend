import type { TonightTarget } from "@darkview/contracts";
import Link from "next/link";

import { ModeNotice } from "@/components/observatory/mode-notice";
import { linkTone, weatherTone } from "@/components/status/status-page";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { observatories } from "@/features/observatory/observatories";
import type { ObservatoryPanelResult } from "@/features/home/read";
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
};

/**
 * A line drawing of the alt-az fork mount, captioned as an illustration (ADR-039). The
 * tube slews into place once on load -- the one thing on this page that physically
 * moves -- and the light path follows it in. Both are off under prefers-reduced-motion.
 */
function TelescopeDrawing({ label }: { label: string }) {
  return (
    <figure className="telescope-drawing">
      <svg viewBox="0 0 320 220" role="presentation" aria-hidden="true">
        <line className="telescope-drawing-ground" x1="40" y1="206" x2="280" y2="206" />
        <path
          className="telescope-drawing-line"
          d="M160 154 L118 204 M160 154 L202 204 M160 154 L160 206"
        />
        <ellipse className="telescope-drawing-line" cx="160" cy="150" rx="36" ry="8" />
        <path
          className="telescope-drawing-line"
          d="M168 144 L176 88 Q178 80 186 80 L190 80 Q196 80 195 88 L187 144 Z"
        />
        <path className="telescope-drawing-arc" d="M246 104 A64 64 0 0 0 238 72" />
        <g className="telescope-drawing-tube">
          <rect
            className="telescope-drawing-body"
            x="96"
            y="70"
            width="150"
            height="30"
            rx="13"
          />
          <ellipse
            className="telescope-drawing-corrector"
            cx="246"
            cy="85"
            rx="5"
            ry="15"
          />
          <circle className="telescope-drawing-pivot" cx="184" cy="85" r="4" />
        </g>
        <line className="telescope-drawing-light" x1="252" y1="56" x2="298" y2="24" />
        <circle className="telescope-drawing-star" cx="300" cy="22" r="2.5" />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function LiveStatus({
  locale,
  panel,
}: {
  locale: Locale;
  panel: ObservatoryPanelResult;
}) {
  const copy = observatoryPageCopy[locale];
  const words = statusCopy[locale];

  return (
    <section className="plate observatory-live" aria-labelledby="observatory-live-title">
      <header>
        <h2 id="observatory-live-title" className="plate-title">
          {copy.liveStatus}
        </h2>
        <Link className="page-link" href={`/${locale}/status`}>
          {copy.fullStatus} <span aria-hidden="true">→</span>
        </Link>
      </header>
      {panel.kind === "unreachable" && (
        <StatePanel variant="error" headingLevel={3} {...copy.statusUnavailable} />
      )}
      {panel.kind === "no-observatory" && (
        <StatePanel headingLevel={3} {...copy.noObservatory} />
      )}
      {panel.kind === "ok" && (
        <>
          <ModeNotice
            mode={panel.status.mode}
            label={words.mode[panel.status.mode].banner}
            detail={words.mode[panel.status.mode].detail}
          />
          <dl className="observatory-live-rows">
            <div>
              <dt>{words.now.link}</dt>
              <dd>
                <StatusIndicator
                  label={words.link[panel.status.link]}
                  tone={linkTone[panel.status.link]}
                />
              </dd>
            </div>
            <div>
              <dt>{words.now.weather}</dt>
              <dd>
                <StatusIndicator
                  label={words.weather[panel.status.weather.status]}
                  tone={weatherTone[panel.status.weather.status]}
                />
              </dd>
            </div>
            <div>
              <dt>{words.now.hold}</dt>
              <dd>
                <StatusIndicator
                  label={
                    panel.status.weather.holdActive
                      ? words.now.holdActive
                      : words.now.holdInactive
                  }
                  tone={panel.status.weather.holdActive ? "danger" : "success"}
                />
              </dd>
            </div>
          </dl>
          {panel.status.missionInProgress && (
            <p className="observatory-live-mission">
              {/* A target name only while its owner has opted in (ADR-007). */}
              {panel.status.currentTargetName
                ? copy.observingNow(panel.status.currentTargetName)
                : copy.missionInProgress}
            </p>
          )}
        </>
      )}
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
      className="plate observatory-tonight"
      aria-labelledby="observatory-tonight-title"
    >
      <header>
        <h2 id="observatory-tonight-title" className="plate-title">
          {copy.tonight}
        </h2>
        <p>{copy.tonightDescription}</p>
      </header>
      {body}
    </section>
  );
}

/** The first screen's short version: what the telescope and camera are (ADR-026). */
function InstrumentSummary({
  locale,
  panel,
}: {
  locale: Locale;
  panel: ObservatoryPanelResult;
}) {
  const copy = observatoryPageCopy[locale];
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;

  return (
    <section
      className="plate observatory-instrument"
      aria-labelledby="observatory-instrument-title"
    >
      <header>
        <h2 id="observatory-instrument-title" className="plate-title">
          {copy.instrument}
        </h2>
      </header>
      <dl>
        {telescope && (
          <div>
            <dt>{copy.telescope}</dt>
            <dd>
              <strong>
                {telescope.manufacturer} {telescope.model}
              </strong>
              <span>
                {telescope.apertureMm} mm {copy.aperture} · {telescope.focalLengthMm} mm{" "}
                {copy.focalLength}
              </span>
            </dd>
          </div>
        )}
        <div>
          <dt>{copy.camera}</dt>
          <dd>
            <strong>{copy.cameraModel}</strong>
            <span>{copy.cameraType}</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}

function InstrumentSection({
  locale,
  panel,
}: {
  locale: Locale;
  panel: ObservatoryPanelResult;
}) {
  const copy = observatoryPageCopy[locale];
  const words = copy.instrumentSection;
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;

  return (
    <section
      className="page-section"
      id="instrument"
      aria-labelledby="observatory-instrument-section-title"
    >
      <Container className="page-split">
        <div className="observatory-instrument-intro">
          <header className="section-heading">
            <p className="kicker">{words.kicker}</p>
            <h2 id="observatory-instrument-section-title">{words.title}</h2>
            <p className="page-lede">{words.lede}</p>
          </header>
          <TelescopeDrawing label={copy.illustration} />
        </div>
        <div className="observatory-instrument-detail">
          <dl className="ruled-specs">
            {telescope && (
              <>
                <div>
                  <dt>{copy.telescope}</dt>
                  <dd>
                    {telescope.manufacturer} {telescope.model}
                  </dd>
                </div>
                <div>
                  <dt>{words.design}</dt>
                  <dd>{words.designValue}</dd>
                </div>
                <div>
                  <dt>{copy.aperture}</dt>
                  <dd>
                    <span className="figure">
                      {telescope.apertureMm} <small>{words.millimetres}</small>
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>{copy.focalLength}</dt>
                  <dd>
                    <span className="figure">
                      {telescope.focalLengthMm} <small>{words.millimetres}</small>
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>{words.focalRatio}</dt>
                  <dd>
                    <span className="figure">
                      {`f/${Math.round(telescope.focalLengthMm / telescope.apertureMm)}`}
                    </span>
                  </dd>
                </div>
              </>
            )}
            <div>
              <dt>{words.mount}</dt>
              <dd>{words.mountValue}</dd>
            </div>
            <div>
              <dt>{copy.camera}</dt>
              <dd>
                {copy.cameraModel}
                <small>{words.cameraNote}</small>
              </dd>
            </div>
            <div>
              <dt>{words.mode}</dt>
              <dd>
                {words.modeValue}
                <small>{words.modeNote}</small>
              </dd>
            </div>
          </dl>

          <div className="observatory-optics">
            <h3>{words.optics}</h3>
            <p>{words.opticsLede}</p>
            <ul>
              {words.configurations.map((configuration) => (
                <li key={configuration.value}>
                  <span className="plate-title">{configuration.name}</span>
                  <span className="figure">{configuration.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SafetySection({ locale }: { locale: Locale }) {
  const words = observatoryPageCopy[locale].safetySection;

  return (
    <section
      className="page-section"
      id="safety"
      aria-labelledby="observatory-safety-title"
    >
      <Container>
        <header className="section-heading">
          <p className="kicker">{words.kicker}</p>
          <h2 id="observatory-safety-title">{words.title}</h2>
          <p className="page-lede">{words.lede}</p>
        </header>
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
      </Container>
    </section>
  );
}

function SiteSection({
  locale,
  panel,
}: {
  locale: Locale;
  panel: ObservatoryPanelResult;
}) {
  const copy = observatoryPageCopy[locale];
  const site = copy.siteSection;
  const network = copy.networkSection;

  return (
    <section className="page-section" id="site" aria-labelledby="observatory-site-title">
      <Container className="page-split">
        <header className="section-heading">
          <p className="kicker">{site.kicker}</p>
          <h2 id="observatory-site-title">{site.title}</h2>
          <p className="page-lede">{site.lede}</p>
        </header>
        <dl className="ruled-specs">
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
      </Container>

      <Container>
        <div
          className="observatory-network"
          id="network"
          aria-labelledby="observatory-network-title"
          role="region"
        >
          <header>
            <p className="kicker">{network.kicker}</p>
            <h3 id="observatory-network-title">{network.title}</h3>
            <p>{network.lede}</p>
          </header>
          <dl className="ruled-specs">
            <div>
              <dt>{network.today}</dt>
              <dd>
                {network.todayValue}
                {panel.kind === "ok" && (
                  <StatusIndicator
                    label={statusCopy[locale].link[panel.status.link]}
                    tone={linkTone[panel.status.link]}
                  />
                )}
              </dd>
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
      </Container>
    </section>
  );
}

export function ObservatoryPage({ locale, panel, tonight }: ObservatoryPageProps) {
  const copy = observatoryPageCopy[locale];
  const site = observatories[0];
  const name =
    panel.kind === "ok"
      ? locale === "ka"
        ? panel.observatory.nameKa
        : panel.observatory.nameEn
      : site.name[locale];

  return (
    <main id="main-content" className="public-page observatory-page">
      <section
        className="page-hero observatory-first"
        aria-labelledby="observatory-page-title"
      >
        <Container className="observatory-first-grid">
          <div className="observatory-first-main">
            <p className="kicker">{copy.eyebrow}</p>
            <h1 id="observatory-page-title">{name}</h1>
            <p className="page-lede observatory-statement">{copy.statement}</p>
            <LiveStatus locale={locale} panel={panel} />
            <div className="observatory-actions">
              <ButtonLink href={`/${locale}/app/missions`} size="large">
                {copy.seeTonight}
              </ButtonLink>
              <ButtonLink href={`/${locale}/app/live`} size="large" variant="secondary">
                {copy.openLive}
              </ButtonLink>
              <small>{copy.liveNote}</small>
            </div>
          </div>
          <div className="observatory-first-side">
            <Tonight locale={locale} tonight={tonight} />
            <InstrumentSummary locale={locale} panel={panel} />
          </div>
        </Container>
      </section>

      <InstrumentSection locale={locale} panel={panel} />
      <SafetySection locale={locale} />
      <SiteSection locale={locale} panel={panel} />
    </main>
  );
}
