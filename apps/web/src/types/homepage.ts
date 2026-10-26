import type { SkyKind, SkyPlate } from "@/features/targets/homepage-data";

export type HomepageDictionary = {
  hero: {
    /** The headline, then its last words in red. */
    headline: string;
    sunset: string;
    lede: string;
    cta: string;
    plates: Record<SkyPlate, string>;
    /** What each plate is, written small above its name. */
    kinds: Record<SkyKind, string>;
    sky: {
      label: string;
      explore: string;
      tap: string;
      /** Around the count: "0/4 found" in English, "ნაპოვნია 0/4" in Georgian. */
      foundBefore: string;
      foundAfter: string;
      illustration: string;
    };
  };
  common: {
    minutes: string;
    window: string;
    altitude: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: readonly { title: string; description: string }[];
  };
  /** The four small cards under the steps: tonight, now, the telescope, the price. */
  tonight: {
    kicker: string;
    title: string;
    all: string;
    empty: string;
    unavailable: string;
  };
  live: {
    kicker: string;
    title: string;
    observing: string;
    inProgress: string;
    watch: string;
    fullStatus: string;
    unavailable: string;
  };
  /** ADR-075: the sections below the cards, Skychaser's chapters. */
  more: {
    book: {
      kicker: string;
      title: string;
      steps: readonly { title: string; text: string }[];
      lengths: string;
      perMinute: string;
      cta: string;
    };
    ways: {
      kicker: string;
      title: string;
      items: readonly { title: string; text: string; href: string }[];
    };
    faq: { kicker: string; title: string; items: readonly { q: string; a: string }[] };
    closer: {
      title: string;
      sunset: string;
      lede: string;
      cta: string;
      secondary: string;
    };
  };
};

export type FooterDictionary = {
  brandAriaLabel: string;
  brandEndorsement: string;
  statement: string;
  product: string;
  legal: string;
  language: string;
  georgianLanguage: string;
  englishLanguage: string;
  book: string;
  pricing: string;
  collection: string;
  observatory: string;
  status: string;
  privacy: string;
  terms: string;
  refunds: string;
};
