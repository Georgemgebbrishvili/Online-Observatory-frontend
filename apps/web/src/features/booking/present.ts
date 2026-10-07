import type { Locale } from "@/i18n/config";

function intlLocale(locale: Locale) {
  return locale === "ka" ? "ka-GE" : "en-GB";
}

/**
 * The slot as the customer booked it: its day, start and end in the observatory's zone,
 * with the zone named, since it is not necessarily the reader's.
 */
export function formatSlot(
  startAt: string,
  durationMinutes: number,
  timezone: string,
  locale: Locale,
) {
  const start = new Date(startAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const day = new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  }).format(start);
  const time = new Intl.DateTimeFormat(intlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });
  const zone = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .formatToParts(start)
    .find((part) => part.type === "timeZoneName")?.value;
  return `${day}, ${time.format(start)}–${time.format(end)}${zone ? ` ${zone}` : ""}`;
}

/** A calendar day in the observatory's zone, for a deadline. */
export function formatDay(at: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(at));
}

/** An instant in the observatory's zone, with the zone named: a hold's deadline. */
export function formatDeadline(at: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(new Date(at));
}

/** The booking's id, shortened, as a reference the customer can quote. */
export function bookingReference(id: string) {
  return id.slice(0, 8).toUpperCase();
}
