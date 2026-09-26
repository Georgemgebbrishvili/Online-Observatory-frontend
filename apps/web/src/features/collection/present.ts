import type { Capture } from "@darkview/contracts";

import { targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";

import type { CollectionEntry } from "./read";

function intlLocale(locale: Locale) {
  return locale === "ka" ? "ka-GE" : "en-GB";
}

/** The target's name, or the imaging profile when the target is no longer in the catalogue. */
export function captureTitle({ capture, target }: CollectionEntry, locale: Locale) {
  return target
    ? targetName(target, locale)
    : collectionGalleryCopy[locale].profiles[capture.imagingProfile];
}

/** Catalogue id where the target has one, then the capture's own id, shortened. */
export function captureReference({ capture, target }: CollectionEntry) {
  const shortId = capture.id.slice(0, 8).toUpperCase();
  return target?.catalogId ? `${target.catalogId} · ${shortId}` : shortId;
}

/** The shutter time in the observatory's zone, with the zone named: it is not the reader's. */
export function formatCapturedAt(capturedAt: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(new Date(capturedAt));
}

/** Milliseconds under a second, seconds from there. Units stay international. */
export function formatExposure(milliseconds: number, locale: Locale) {
  const number = new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 2 });
  return milliseconds < 1000
    ? `${number.format(milliseconds)} ms`
    : `${number.format(milliseconds / 1000)} s`;
}

export function formatIntegration(seconds: number, locale: Locale) {
  const number = new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 1 });
  if (seconds < 60) return `${number.format(seconds)} s`;
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

export function formatFrameSize({ heightPx, widthPx }: Capture) {
  return widthPx && heightPx ? `${widthPx} × ${heightPx} px` : null;
}
