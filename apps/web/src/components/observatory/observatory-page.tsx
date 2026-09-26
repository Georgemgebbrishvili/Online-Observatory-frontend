import type { TonightTarget } from "@darkview/contracts";
import Link from "next/link";

import { ModeNotice } from "@/components/observatory/mode-notice";
import { linkTone, weatherTone } from "@/components/status/status-page";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  missionOperations,
  observatories,
  observatorySafetyChecks,
} from "@/features/observatory/observatories";
import type { ObservatoryPanelResult } from "@/features/home/read";
import { fill } from "@/features/operator/format";
import { formatWindow, primaryReason, targetName } from "@/features/targets/present";
import type { TonightResult } from "@/features/targets/read";
import type { Locale } from "@/i18n/config";
import { observatoryPageCopy } from "@/i18n/resources/observatory";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";
import { brand } from "@/brand";

type ObservatoryPageProps = {
  locale: Locale;
  panel: ObservatoryPanelResult;
  tonight: TonightResult;
};

/**
 * A line drawing of the alt-az fork mount, labelled as a drawing. The tube slews into
 * place once on load -- the one thing on this page that physically moves -- and the
 * light path follows it in. Both are off under prefers-reduced-motion.
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
    <section className="observatory-live" aria-labelledby="observatory-live-title">
      <header>
        <h2 id="observatory-live-title">{copy.liveStatus}</h2>
        <Link className="observatory-text-link" href={`/${locale}/status`}>
          {copy.fullStatus} <span aria-hidden="true">→</span>
        </Link>
      </header>
      {panel.kind === "unreachable" && (
        <StatePanel variant="error" {...copy.statusUnavailable} />
      )}
      {panel.kind === "no-observatory" && <StatePanel {...copy.noObservatory} />}
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
    body = <StatePanel variant="error" {...words.unreachable} />;
  } else if (tonight.kind === "no-observatory") {
    body = <StatePanel {...words.noObservatory} />;
  } else {
    const observable: TonightTarget[] = tonight.items
      .filter((item) => item.visibility.observable)
      .slice(0, 3);
    const reason = tonight.items[0] ? primaryReason(tonight.items[0].visibility) : null;
    body =
      observable.length === 0 ? (
        <StatePanel
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
                  {words.types[target.type]} ·{" "}
                  {Math.round(visibility.horizontal.altitudeDegrees)}° ·{" "}
                  {formatWindow(
                    visibility,
                    tonight.observatory.timezone,
                    locale,
                    words.window,
                  )}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      );
  }

  return (
    <section className="observatory-tonight" aria-labelledby="observatory-tonight-title">
      <header>
        <h2 id="observatory-tonight-title">{copy.tonight}</h2>
        <p>{copy.tonightDescription}</p>
      </header>
      {body}
    </section>
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
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;

  return (
    <section
      className="observatory-instrument"
      aria-labelledby="observatory-instrument-title"
    >
      <header>
        <h2 id="observatory-instrument-title">{copy.instrument}</h2>
      </header>
      <TelescopeDrawing label={copy.drawing} />
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
    <main id="main-content" className="observatory-page">
      <section className="observatory-first" aria-labelledby="observatory-page-title">
        <div className="observatory-first-main">
          <p className="observatory-eyebrow">{copy.eyebrow}</p>
          <h1 id="observatory-page-title">{name}</h1>
          <p className="observatory-statement">{copy.statement}</p>
          <LiveStatus locale={locale} panel={panel} />
          <div className="observatory-actions">
            <Link
              className="button button-primary button-large"
              href={`/${locale}/app/missions`}
            >
              <span>{copy.seeTonight}</span>
            </Link>
            <Link
              className="button button-secondary button-large"
              href={`/${locale}/app/live`}
            >
              <span>{copy.openLive}</span>
            </Link>
            <small>{copy.liveNote}</small>
          </div>
        </div>
        <div className="observatory-first-side">
          <Tonight locale={locale} tonight={tonight} />
          <Instrument locale={locale} panel={panel} />
        </div>
      </section>

      <section className="observatory-mission-path" aria-labelledby="mission-path-title">
        <header>
          <span>01</span>
          <div>
            <h2 id="mission-path-title">{copy.missionTitle}</h2>
            <p>{copy.missionDescription}</p>
          </div>
        </header>
        <ol>
          {missionOperations.map((operation, index) => (
            <li key={operation.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{operation.label[locale]}</strong>
              {index < missionOperations.length - 1 && <i aria-hidden="true">→</i>}
            </li>
          ))}
        </ol>
      </section>

      <section className="observatory-safety" aria-labelledby="observatory-safety-title">
        <header>
          <span>02</span>
          <h2 id="observatory-safety-title">{copy.safety}</h2>
          <p>{copy.safetyDescription}</p>
        </header>
        <ol>
          {observatorySafetyChecks.map((check, index) => (
            <li key={check.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{check.title[locale]}</h3>
                <p>{check.description[locale]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="observatory-network"
        aria-labelledby="observatory-network-title"
      >
        <header>
          <span>03</span>
          <div>
            <h2 id="observatory-network-title">{copy.futureNetwork}</h2>
            <p>{copy.futureDescription}</p>
          </div>
        </header>
        <div className="observatory-network-track">
          {observatories.map((site) => (
            <article key={site.id}>
              <span className="observatory-network-node" aria-hidden="true" />
              <div>
                <small>{copy.activeSite}</small>
                <h3>{site.name[locale]}</h3>
                <p>{site.location[locale]}</p>
              </div>
              {panel.kind === "ok" && (
                <StatusIndicator
                  label={statusCopy[locale].link[panel.status.link]}
                  tone={linkTone[panel.status.link]}
                />
              )}
            </article>
          ))}
          <p>{copy.noPartners}</p>
        </div>
        <Link
          className="button button-secondary button-large"
          href={`/${locale}/network`}
        >
          <span>{copy.networkFoundation}</span>
        </Link>
        <Link className="observatory-back-link" href={`/${locale}`}>
          <span aria-hidden="true">←</span> {brand.en.name.toUpperCase()}
        </Link>
      </section>
    </main>
  );
}
