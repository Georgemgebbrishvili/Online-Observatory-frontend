import { brand } from "@/brand";
import { HomeStory, type StoryNightStep, type StorySlide } from "@/components/home/home-story";
import { observatories } from "@/features/observatory/observatories";
import { fill } from "@/features/operator/format";
import type { PricingFacts } from "@/features/pricing/read";
import type { StoryObject, StorySky } from "@/features/sky/story-sky";
import type { Locale } from "@/i18n/config";
import { constellationKa } from "@/i18n/resources/night-sky";
import { skyTonightCopy } from "@/i18n/resources/sky-tonight";
import type { Dictionary } from "@/i18n/types";
import { exposureLabel } from "@/lib/observatory-sim/camera";
import { SHOWPIECE_BY_ID } from "@/lib/observatory-sim/showpieces";
import { palette } from "@/styles/tokens";

type HomeShellProps = {
  content: Dictionary["home"];
  locale: Locale;
  pricing: PricingFacts;
  sky: StorySky | null;
};

const timezone = "Asia/Tbilisi";
const minute = 60_000;

/** Each showpiece's own colour, for the light behind it. */
const glow: Record<string, string> = {
  moon: palette.targetMoon,
  saturn: palette.targetSaturn,
  jupiter: palette.targetJupiter,
  mars: palette.targetMars,
  venus: palette.targetVenus,
  m42: palette.targetMars,
  m31: palette.targetStarBlue,
  m13: palette.targetCluster,
  ngc869: palette.targetCluster,
  m27: palette.targetNebula,
  m51: palette.targetStarBlue,
  m81: palette.targetStarGold,
};

/**
 * The public homepage (ADR-087): one scroll story. Everything it says is worked out
 * here, from tonight's almanac, the platform's open times and prices, and the
 * observatory's record; the browser only animates it.
 */
export function HomeShell({ content, locale, pricing, sky }: HomeShellProps) {
  const copy = content.story;
  const names = copy.showpieces.names;
  const compass = skyTonightCopy[locale].compass;
  const tag = locale === "ka" ? "ka-GE" : "en-GB";
  const clock = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: timezone });
  const book = `/${locale}/app/book`;
  const bookAt = (startAt: string) => `${book}?startAt=${encodeURIComponent(startAt)}`;

  // Tonight's open times inside the dark, for the showpieces and the night's clock.
  const slots = (pricing.tonight?.slots ?? [])
    .map((slot) => ({ ...slot, time: Date.parse(slot.startAt) }))
    .filter((slot) => sky && slot.time >= sky.start && slot.time <= sky.end);
  /** The open time nearest an object's best, while it is up. */
  const near = (o: StoryObject) => {
    const slot = slots
      .filter((x) => x.time >= o.from && x.time <= o.to)
      .sort((a, b) => Math.abs(a.time - o.best) - Math.abs(b.time - o.best))[0];
    return slot ? { href: bookAt(slot.startAt), label: fill(copy.showpieces.book, { time: clock.format(slot.time) }) } : null;
  };

  // The hero's camera: tonight's brightest planet, or Saturn as a stand-in.
  const planet = sky?.objects.find((o) => o.kind === "planet");
  const targetId = planet?.id ?? "saturn";
  const recipe = SHOWPIECE_BY_ID.get(targetId)!.recipe;

  const slides: StorySlide[] = (sky?.objects ?? []).map((o) => ({
    id: o.id,
    name: names[o.id],
    word: copy.showpieces.words[o.id],
    kind: copy.showpieces.kinds[o.kind],
    note: copy.showpieces.notes[o.id],
    image: o.image,
    time: clock.format(o.best),
    high: fill(copy.showpieces.high, { altitude: String(o.altitude), direction: compass[o.direction] }),
    glow: glow[o.id] ?? palette.targetMoon,
    book: near(o) ?? { href: book, label: copy.showpieces.bookAny },
  }));

  // The night: the telescope visits each showpiece near its best, in order.
  let night = null;
  if (sky && sky.objects.length > 0) {
    const total = Math.round((sky.end - sky.start) / minute);
    const order = [...sky.objects].sort((a, b) => a.best - b.best);
    const steps: StoryNightStep[] = [{ at: 0, aim: order[0].id, title: copy.night.first.title, text: copy.night.first.text, book: null }];
    for (const o of order) {
      const last = steps[steps.length - 1].at;
      const at = Math.max(last + 45, Math.round((o.best - sky.start) / minute) - 20);
      if (at > total - 20 || sky.start + at * minute > o.to) continue;
      steps.push({
        at,
        aim: o.id,
        title: fill(copy.night.best, { name: names[o.id] }),
        text: fill(copy.night.bestText, {
          time: clock.format(o.best),
          altitude: String(o.altitude),
          direction: compass[o.direction],
        }),
        book: near(o),
      });
    }
    const pct = (time: number) => Math.round(Math.min(1, Math.max(0, (time - sky.start) / (sky.end - sky.start))) * 10_000) / 100;
    // Open times that run on from one another read as one stretch.
    const open: { from: number; to: number }[] = [];
    let run: { from: number; to: number } | null = null;
    for (const slot of [...slots].sort((a, b) => a.time - b.time)) {
      const until = slot.time + slot.durationMinutes * minute;
      if (run && slot.time <= run.to + minute) run.to = Math.max(run.to, until);
      else {
        if (run) open.push({ from: pct(run.from), to: pct(run.to) });
        run = { from: slot.time, to: until };
      }
    }
    if (run) open.push({ from: pct(run.from), to: pct(run.to) });
    const [h, m] = clock.format(sky.start).split(":").map(Number);
    night = {
      steps,
      startMinute: h * 60 + m,
      minutes: total,
      from: clock.format(sky.start),
      to: clock.format(sky.end),
      open,
      directions: compass,
    };
  }

  const nightLabel = new Intl.DateTimeFormat(tag, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${pricing.tonight?.date ?? sky?.date ?? new Date().toISOString().slice(0, 10)}T12:00:00Z`),
  );
  const telescope = observatories[0]?.telescope;
  const site = observatories[0]?.location[locale];

  return (
    <HomeStory
      copy={copy}
      hero={content.hero}
      links={{
        book,
        watch: `/${locale}/tonight`,
        sky: `/${locale}/sky`,
        observatory: `/${locale}/observatory`,
        pricing: `/${locale}/pricing`,
      }}
      target={{
        id: targetId,
        name: names[targetId],
        image: `/sky/targets/${targetId}.jpg`,
        exposure: exposureLabel(recipe.exposureS),
        gain: recipe.gain,
        stack: recipe.stack,
        line: planet
          ? fill(copy.aimTonight, {
              name: names[planet.id],
              time: clock.format(planet.best),
              altitude: String(planet.altitude),
            })
          : null,
      }}
      booking={
        pricing.reachable
          ? {
              night: pricing.tonight?.label ?? nightLabel,
              times: (pricing.tonight?.slots ?? []).slice(0, 4).map((slot) => ({
                label: clock.format(Date.parse(slot.startAt)),
                href: bookAt(slot.startAt),
                price: slot.price,
              })),
            }
          : null
      }
      sky={sky}
      skyLabels={{
        names,
        compass: copy.night.compass,
        constellations: locale === "ka" ? constellationKa : undefined,
      }}
      heroMinute={planet && sky ? Math.round((planet.best - sky.start) / minute) : 0}
      slides={slides}
      night={night}
      session={{
        lengths: (pricing.slot?.lengths ?? []).map((x) => ({
          minutes: x.minutes,
          label: `${x.minutes} ${content.common.minutes}`,
          price: x.price,
        })),
        perMinute: pricing.slot?.perMinute ?? null,
        night: nightLabel,
        cloud: content.more.price.cloud,
      }}
      faq={content.more.faq}
      scope={{
        lede: telescope ? fill(copy.scope.lede, { aperture: telescope.aperture, type: telescope.type[locale] }) : "",
        facts: telescope
          ? [
              { label: copy.scope.site, value: site ?? "" },
              { label: copy.scope.optics, value: `${telescope.type[locale]} · ${telescope.aperture}` },
              { label: copy.scope.focal, value: telescope.focalLength },
              { label: copy.scope.mount, value: telescope.mount[locale] },
            ]
          : [],
      }}
      ways={content.more.ways}
      wayBase={`/${locale}`}
      brandName={locale === "ka" ? brand.ka.nominative : brand.en.name}
    />
  );
}
