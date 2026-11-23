import { NightChartView, type NightChartModel } from "@/components/home/night-chart-view";
import { fill } from "@/features/operator/format";
import type { PricingFacts } from "@/features/pricing/read";
import type { TonightSky } from "@/features/sky/tonight-sky";
import type { Locale } from "@/i18n/config";
import { skyTonightCopy } from "@/i18n/resources/sky-tonight";

/** Faintest magnitude an eye picks out under city light. */
const eyeLimit = 5;
const hour = 3_600_000;

/**
 * Tonight from sunset to sunrise (ADR-078): when each planet is up and at its best, and
 * the open start times on the same clock. Positions and words are worked out here; the
 * browser only picks a row and draws "now".
 */
export function NightChart({
  locale,
  pricing,
  sky,
  timezone,
}: {
  locale: Locale;
  pricing: PricingFacts;
  sky: TonightSky;
  timezone: string;
}) {
  const copy = skyTonightCopy[locale];
  const clock = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });
  const { sunset: start, sunrise: end } = sky;
  const at = (time: number) =>
    Math.round(Math.min(1, Math.max(0, (time - start) / (end - start))) * 10_000) / 100;

  const slots = (pricing.tonight?.slots ?? [])
    .map((slot) => ({ ...slot, time: Date.parse(slot.startAt) }))
    .filter((slot) => slot.time >= start && slot.time <= end);
  const bookAt = (slot: { startAt: string }) =>
    `/${locale}/app/book?startAt=${encodeURIComponent(slot.startAt)}`;

  const ticks: NightChartModel["ticks"] = [];
  for (let t = Math.ceil(start / hour) * hour; t < end; t += hour) {
    ticks.push({ at: at(t), label: clock.format(t).slice(0, 2) });
  }

  const objects: NightChartModel["objects"] = sky.objects.map((o) => {
    // The open start time nearest its best, while it is up.
    const near = slots
      .filter((slot) => slot.time >= o.from && slot.time <= o.to)
      .sort((a, b) => Math.abs(a.time - o.best) - Math.abs(b.time - o.best))[0];
    return {
      body: o.body,
      name: copy.names[o.body],
      from: at(o.from),
      to: at(o.to),
      best: at(o.best),
      bestLabel: clock.format(o.best),
      upLabel: `${clock.format(o.from)}–${clock.format(o.to)}`,
      altitude: `${Math.round(o.altitude)}°`,
      look: copy.compass[o.direction] ?? "",
      tag:
        o.body === "Moon"
          ? fill(copy.lit, { lit: String(o.lit) })
          : o.magnitude <= eyeLimit
            ? copy.eye
            : copy.scope,
      lit: o.lit,
      waxing: o.waxing,
      book: near
        ? { href: bookAt(near), label: fill(copy.book, { time: clock.format(near.time) }) }
        : null,
    };
  });

  // Open times that run on from one another read as one stretch of open sky.
  const open: NightChartModel["open"] = [];
  let run: { from: number; to: number } | null = null;
  for (const slot of [...slots].sort((a, b) => a.time - b.time)) {
    const until = slot.time + slot.durationMinutes * 60_000;
    if (run && slot.time <= run.to + 60_000) run.to = Math.max(run.to, until);
    else {
      if (run) open.push({ from: at(run.from), to: at(run.to) });
      run = { from: slot.time, to: until };
    }
  }
  if (run) open.push({ from: at(run.from), to: at(run.to) });

  const highest = sky.objects.reduce(
    (best, o, index) => (o.altitude > sky.objects[best].altitude ? index : best),
    0,
  );

  return (
    <NightChartView
      model={{
        start,
        end,
        ticks,
        objects,
        first: highest,
        sunset: clock.format(start),
        sunrise: clock.format(end),
        open,
        slots: slots.map((slot) => ({
          at: at(slot.time),
          href: bookAt(slot),
          label: clock.format(slot.time),
          price: slot.price,
        })),
      }}
      copy={{
        chart: copy.chart,
        open: copy.open,
        now: copy.now,
        stat: copy.stat,
      }}
    />
  );
}
