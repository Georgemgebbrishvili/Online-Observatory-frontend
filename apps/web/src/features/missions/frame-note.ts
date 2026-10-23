import type { LiveFrameInfo } from "@/features/missions/live";
import type { Locale } from "@/i18n/config";

type FrameCopy = { stacked: string; single: string; gain: string; ms: string; s: string };

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/** "12 × 2 s stacked · gain 200": what the live picture is made of (#199). */
export function frameNote(frame: LiveFrameInfo, copy: FrameCopy, locale: Locale): string {
  const number = (value: number, digits: number) =>
    new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-GB", {
      maximumFractionDigits: digits,
    }).format(value);
  const exposure =
    frame.exposureMilliseconds < 1000
      ? fill(copy.ms, { value: number(frame.exposureMilliseconds, 0) })
      : fill(copy.s, { value: number(frame.exposureMilliseconds / 1000, 1) });
  const what =
    frame.stackedFrames === null
      ? fill(copy.single, { exposure })
      : fill(copy.stacked, { count: String(frame.stackedFrames), exposure });
  return `${what} · ${fill(copy.gain, { gain: String(frame.gain) })}`;
}
