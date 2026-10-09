import Link from "next/link";

import { ObservatoryPanel } from "@/components/home/authenticated-home";
import { StatePanel } from "@/components/ui/state-panel";
import type { ObservatoryPanelResult, UpcomingResult } from "@/features/home/read";
import { targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { liveCopy } from "@/i18n/resources/live";

type LiveNextProps = {
  locale: Locale;
  panel: ObservatoryPanelResult;
  upcoming: Exclude<UpcomingResult, { kind: "signed-out" }>;
};

/**
 * /app/live with nothing live (ADR-051 §2): the observatory's state and the customer's
 * next night, or the way to book one. With a live or imminent mission the route opens
 * its room instead (ADR-037) and this is never rendered.
 */
export function LiveNext({ locale, panel, upcoming }: LiveNextProps) {
  const copy = liveCopy[locale];
  const scheduleFormat = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tbilisi",
  });
  const next = upcoming.kind === "ok" ? (upcoming.items[0] ?? null) : null;

  return (
    <div className="authenticated-home live-next">
      <header className="page-hero">
        <p className="kicker">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="page-lede">{copy.description}</p>
      </header>

      <div className="home-dashboard-grid">
        <ObservatoryPanel locale={locale} panel={panel} />

        <section className="home-upcoming plate" aria-labelledby="live-next-title">
          <header>
            <h2 id="live-next-title" className="plate-title">
              {copy.next}
            </h2>
          </header>
          {upcoming.kind === "unreachable" && (
            <StatePanel variant="error" {...copy.unavailable} />
          )}
          {upcoming.kind === "ok" && !next && (
            <StatePanel
              title={copy.none.title}
              description={copy.none.description}
              action={
                <Link className="button button-primary" href={`/${locale}/app/book`}>
                  <span>{copy.none.action}</span>
                </Link>
              }
            />
          )}
          {next && (
            <ol className="home-upcoming-list">
              <li>
                <div>
                  <p>
                    {next.mission.scheduledStartAt &&
                      scheduleFormat.format(new Date(next.mission.scheduledStartAt))}
                  </p>
                  <h3>
                    <Link
                      href={`/${locale}/app/missions/${next.mission.id}/session`}
                      aria-label={`${copy.open}: ${
                        next.target ? targetName(next.target, locale) : copy.retiredTarget
                      }`}
                    >
                      {next.target ? targetName(next.target, locale) : copy.retiredTarget}
                    </Link>
                  </h3>
                  {next.mission.mode === "SIMULATED" && (
                    <small className="home-simulated">{copy.simulated}</small>
                  )}
                </div>
                <span className="tonight-list-arrow" aria-hidden="true">
                  →
                </span>
              </li>
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
