import { HomePage, type HomeObject } from "@/components/home/home-page";
import { observatories } from "@/features/observatory/observatories";
import { fill } from "@/features/operator/format";
import type { PricingFacts } from "@/features/pricing/read";
import type { StoryObject, StorySky } from "@/features/sky/story-sky";
import type { Locale } from "@/i18n/config";
import { skyTonightCopy } from "@/i18n/resources/sky-tonight";
import type { Dictionary } from "@/i18n/types";
import { palette } from "@/styles/tokens";

type HomeShellProps = {
  content: Dictionary["home"];
  locale: Locale;
  pricing: PricingFacts;
  sky: StorySky | null;
};

const timezone = "Asia/Tbilisi";

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
 * The public homepage (ADR-093). Everything it says is worked out here, on the server,
 * from tonight's almanac, the platform's open times and prices, and the observatory's
 * record.
 */
export function HomeShell({ content, locale, pricing, sky }: HomeShellProps) {
  const copy = content.story;
  const names = copy.showpieces.names;
  const compass = skyTonightCopy[locale].compass;
  const tag = locale === "ka" ? "ka-GE" : "en-GB";
  const clock = new Intl.DateTimeFormat(tag, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });
  const book = `/${locale}/app/book`;
  const bookAt = (startAt: string) => `${book}?startAt=${encodeURIComponent(startAt)}`;

  // Tonight's open times inside the dark.
  const slots = (pricing.tonight?.slots ?? [])
    .map((slot) => ({ ...slot, time: Date.parse(slot.startAt) }))
    .filter((slot) => sky && slot.time >= sky.start && slot.time <= sky.end);
  /** The open time nearest an object's best, while it is up. */
  const near = (o: StoryObject) => {
    const slot = slots
      .filter((x) => x.time >= o.from && x.time <= o.to)
      .sort((a, b) => Math.abs(a.time - o.best) - Math.abs(b.time - o.best))[0];
    return slot
      ? {
          href: bookAt(slot.startAt),
          label: fill(copy.showpieces.book, { time: clock.format(slot.time) }),
        }
      : null;
  };

  const objects: HomeObject[] = (sky?.objects ?? []).map((o) => ({
    id: o.id,
    name: names[o.id],
    kind: copy.showpieces.kinds[o.kind],
    note: copy.showpieces.notes[o.id],
    image: o.image,
    time: clock.format(o.best),
    high: fill(copy.showpieces.high, {
      altitude: String(o.altitude),
      direction: compass[o.direction],
    }),
    glow: glow[o.id] ?? palette.targetMoon,
    book: near(o) ?? { href: book, label: copy.showpieces.bookAny },
  }));

  const telescope = observatories[0]?.telescope;

  return (
    <HomePage
      copy={copy}
      hero={content.hero}
      links={{
        book,
        watch: `/${locale}/tonight`,
        sky: `/${locale}/sky`,
        observatory: `/${locale}/observatory`,
        pricing: `/${locale}/pricing`,
      }}
      objects={objects}
      session={{
        lengths: (pricing.slot?.lengths ?? []).map((x) => ({
          minutes: x.minutes,
          label: `${x.minutes} ${content.common.minutes}`,
          price: x.price,
        })),
        perMinute: pricing.slot?.perMinute ?? null,
        cloud: content.more.price.cloud,
      }}
      faq={content.more.faq}
      scope={{
        lede: telescope
          ? fill(copy.scope.lede, {
              aperture: telescope.aperture,
              type: telescope.type[locale],
            })
          : "",
        facts: telescope
          ? [
              {
                label: copy.scope.optics,
                value: `${telescope.type[locale]} · ${telescope.aperture}`,
              },
              { label: copy.scope.focal, value: telescope.focalLength },
              { label: copy.scope.mount, value: telescope.mount[locale] },
            ]
          : [],
      }}
    />
  );
}
