import type { Locale } from "@/i18n/config";

/**
 * Dates for the card page. A browser without Georgian locale data formats `ka-GE` in
 * English, so the names come from here and only the numbers from Intl (as the night
 * calendar does).
 */
const names = {
  en: {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  ka: {
    months: ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"],
    weekdays: ["ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი", "კვირა"],
  },
};

function parts(at: Date, timeZone: string) {
  const values: Record<string, string> = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((part) => [part.type, part.value]),
  );
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(values.weekday);
  return {
    year: values.year,
    hour: values.hour,
    minute: values.minute,
    weekday,
    month: Number(values.month) - 1,
    day: Number(values.day),
  };
}

/** "21 September" */
export function dayMonth(at: Date, locale: Locale, timeZone = "UTC") {
  const p = parts(at, timeZone);
  return `${p.day} ${names[locale].months[p.month]}`;
}

/** "21 October 2099" */
export function longDate(at: Date, locale: Locale, timeZone = "UTC") {
  const p = parts(at, timeZone);
  return `${p.day} ${names[locale].months[p.month]} ${p.year}`;
}

/** "Monday 28 September, 00:00" */
export function weekdayTime(at: Date, locale: Locale, timeZone: string) {
  const p = parts(at, timeZone);
  return `${names[locale].weekdays[p.weekday]} ${p.day} ${names[locale].months[p.month]}, ${p.hour}:${p.minute}`;
}
