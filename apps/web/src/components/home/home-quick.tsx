import Link from "next/link";

import type { ObservatoryPanelResult } from "@/features/home/read";
import { fill } from "@/features/operator/format";
import type { PricingFacts } from "@/features/pricing/read";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";
import { pricingPageCopy } from "@/i18n/resources/pricing";
import { statusCopy } from "@/i18n/resources/status";
import type { HomepageDictionary } from "@/types/homepage";

type HomeQuickProps = {
  live: HomepageDictionary["live"];
  locale: Locale;
  panel: ObservatoryPanelResult;
  pricing: PricingFacts;
  /** The heading's id; /design-system shows the panel twice. */
  id?: string;
  /** /design-system shows it as a specimen, not as a landmark of its page. */
  specimen?: boolean;
};

/** How many open start times the phone's first screen offers. */
const timesShown = 4;

/**
 * A phone's first screen under the hero: the observatory right now in one line, and the
 * next open start times, each one tap from the booking board with that time chosen.
 * Every value is the platform's; a part that cannot be read is left out or says so.
 */
export function HomeQuick({
  id = "home-quick-title",
  live,
  locale,
  panel,
  pricing,
  specimen = false,
}: HomeQuickProps) {
  const Box = specimen ? "div" : "section";
  const words = statusCopy[locale];
  const copy = pricingPageCopy[locale].tonight;
  const { tonight } = pricing;
  const time = tonight
    ? new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: tonight.timezone,
      })
    : null;

  return (
    <Box className="home-quick" aria-labelledby={specimen ? undefined : id}>
      {panel.kind === "ok" && (
        <div className="home-quick-status">
          <p data-tone={panel.status.link === "ONLINE" ? "good" : "bad"}>
            <span className="home-dot" aria-hidden="true" />
            {words.link[panel.status.link]}
          </p>
          <p data-tone={panel.status.weather.status === "CLEAR" ? "good" : "quiet"}>
            <span className="home-dot" aria-hidden="true" />
            {words.weather[panel.status.weather.status]}
          </p>
          {panel.status.missionInProgress && (
            <Link className="home-quick-watch" href={`/${locale}/tonight`}>
              <span className="home-live-pulse" aria-hidden="true" />
              {panel.status.currentTargetName
                ? fill(live.observing, { name: panel.status.currentTargetName })
                : live.inProgress}
              <b>
                {live.watch} <span aria-hidden="true">›</span>
              </b>
            </Link>
          )}
        </div>
      )}

      <header className="home-quick-head">
        <h2 id={id} className="kicker">
          {tonight?.isToday === false ? copy.next : copy.title}
        </h2>
        {tonight && <time dateTime={tonight.date}>{tonight.label}</time>}
      </header>

      {!tonight || !time ? (
        <p className="home-quick-note">
          {pricing.reachable ? copy.none : copy.unreachable}
        </p>
      ) : (
        <ul className="home-quick-times">
          {tonight.slots.slice(0, timesShown).map((slot) => (
            <li key={slot.startAt}>
              <Link
                href={`/${locale}/app/book?startAt=${encodeURIComponent(slot.startAt)}`}
              >
                <time dateTime={slot.startAt}>{time.format(new Date(slot.startAt))}</time>
                <span>
                  {slot.price} · {boardCopy[locale].duration(slot.durationMinutes)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link className="home-quick-all" href={`/${locale}/app/book`}>
        {copy.all} <span aria-hidden="true">›</span>
      </Link>
    </Box>
  );
}
