import Link from "next/link";

import type { PricingFacts } from "@/features/pricing/read";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";
import { pricingPageCopy } from "@/i18n/resources/pricing";

type HomeQuickProps = {
  locale: Locale;
  pricing: PricingFacts;
  /** The heading's id; /design-system shows the card twice. */
  id?: string;
  /** /design-system shows it as a specimen, not as a landmark of its page. */
  specimen?: boolean;
};

/** How many open start times the card offers. */
const timesShown = 4;

/**
 * The next open start times, each one tap from the booking board with that time chosen.
 * Every value is the platform's; a part that cannot be read says so in one line.
 */
export function HomeQuick({
  id = "home-quick-title",
  locale,
  pricing,
  specimen = false,
}: HomeQuickProps) {
  const Box = specimen ? "div" : "article";
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
    <Box className="home-tile home-quick" aria-labelledby={specimen ? undefined : id}>
      <header className="home-tile-head">
        <h3 id={id}>{tonight?.isToday === false ? copy.next : copy.title}</h3>
        {tonight && <time dateTime={tonight.date}>{tonight.label}</time>}
      </header>

      {!tonight || !time ? (
        <p className="home-tile-note">
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

      <Link className="home-tile-link" href={`/${locale}/app/book`}>
        {copy.all} <span aria-hidden="true">→</span>
      </Link>
    </Box>
  );
}
