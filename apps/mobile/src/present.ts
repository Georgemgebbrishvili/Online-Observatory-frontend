import type {
  PublicObservatoryStatus,
  Slot,
  Target,
  TonightTarget,
  ViewingConditionsHour,
} from "@darkview/contracts";

import type { Locale } from "./i18n/copy";

/** YYYY-MM-DD for an instant, in a time zone: the date `GET /slots` means. */
export function localDate(at: number, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date(at));
}

/**
 * `GET /slots` names a night by the date its evening falls on, so before local noon
 * the night still in progress is yesterday's. Which one to ask for first; the caller
 * falls back to today when that night has no slot left to start.
 */
export function nightDates(now: number, timezone: string) {
  const today = localDate(now, timezone);
  const evening = localDate(now - 12 * 60 * 60_000, timezone);
  return evening === today ? [today] : [evening, today];
}

export function hasSlotAhead(slots: readonly Slot[], now: number) {
  return slots.some((slot) => Date.parse(slot.startAt) > now);
}

// A phone's JavaScript engine may carry no Georgian locale data, so Georgian dates and
// prices are spelled out here rather than left to Intl. Digits and clocks use en-GB's,
// which every engine has.
const georgianMonths = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];
const georgianWeekdays = [
  "კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი",
];

/** A clock time in the observatory's zone, 24-hour, as the website shows it. */
export function clock(at: string, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  }).format(new Date(at));
}

/** A night's date, YYYY-MM-DD, as a weekday and a day of the month. */
export function nightLabel(date: string, locale: Locale) {
  const [year, month, day] = date.split("-").map(Number);
  const at = new Date(Date.UTC(year, month - 1, day));
  if (locale === "ka") {
    return `${georgianWeekdays[at.getUTCDay()]}, ${day} ${georgianMonths[month - 1]}`;
  }
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(at);
}

/** Minor units (tetri) to lari, by integer arithmetic: "GEL 45.00" or "45,00 ₾" as on the website. */
export function price(minor: number, locale: Locale) {
  const lari = `${Math.floor(minor / 100)}`;
  const tetri = `${minor % 100}`.padStart(2, "0");
  return locale === "ka" ? `${lari},${tetri} ₾` : `GEL ${lari}.${tetri}`;
}

export type Tone = "live" | "warn" | "off";

/**
 * The one line a phone has room for. Offline outranks a hold, because nothing reported
 * is current then; a hold outranks the weather, because the operator's hold decides.
 */
export function statusHeadline(status: PublicObservatoryStatus):
  | { kind: "offline" | "hold" | "degraded"; tone: Tone }
  | { kind: "weather"; tone: Tone; weather: PublicObservatoryStatus["weather"]["status"] } {
  if (status.link === "OFFLINE") return { kind: "offline", tone: "off" };
  if (status.weather.holdActive) return { kind: "hold", tone: "warn" };
  if (status.link === "DEGRADED") return { kind: "degraded", tone: "warn" };
  return {
    kind: "weather",
    tone: status.weather.status === "CLEAR" ? "live" : "warn",
    weather: status.weather.status,
  };
}

/** The hours with a stored forecast, and their median cloud cover; null when none is known. */
export function cloudSummary(hours: readonly ViewingConditionsHour[]) {
  const known = hours
    .map((hour) => hour.cloudCoverPercent)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  if (known.length === 0) return null;
  const middle = Math.floor(known.length / 2);
  const median =
    known.length % 2 ? known[middle] : Math.round((known[middle - 1] + known[middle]) / 2);
  return { median, knownHours: known.length, hours: hours.length };
}

/** Observable first, then highest in the sky. A sort of the platform's data, not a ranking. */
export function sortTonight(items: readonly TonightTarget[]) {
  return [...items].sort(
    (left, right) =>
      Number(right.visibility.observable) - Number(left.visibility.observable) ||
      right.visibility.horizontal.altitudeDegrees - left.visibility.horizontal.altitudeDegrees,
  );
}

export function targetName(target: Target, locale: Locale) {
  return locale === "ka" ? target.nameKa : target.nameEn;
}

export function targetDescription(target: Target, locale: Locale) {
  return (locale === "ka" ? target.descriptionKa : target.descriptionEn) ?? null;
}
