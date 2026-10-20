"use client";

import { useSyncExternalStore } from "react";

import { formatSlot } from "@/features/booking/present";
import type { Locale } from "@/i18n/config";

const never = () => () => {};
const readerZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * The slot in the reader's own zone, as a row of the booking's facts. The server cannot
 * know the reader's zone, so nothing renders until the browser does, and nothing at all
 * when the reader is in the observatory's zone.
 */
export function ViewerTime({
  durationMinutes,
  label,
  locale,
  startAt,
  timezone,
}: {
  durationMinutes: number;
  label: string;
  locale: Locale;
  startAt: string;
  timezone: string;
}) {
  const zone = useSyncExternalStore(never, readerZone, () => null);
  if (!zone || zone === timezone) return null;
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <time dateTime={startAt}>{formatSlot(startAt, durationMinutes, zone, locale)}</time>
      </dd>
    </div>
  );
}
