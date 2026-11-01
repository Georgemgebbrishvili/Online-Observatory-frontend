import type { SkyKind, SkyPlate } from "@/features/targets/homepage-data";

export type HomepageDictionary = {
  hero: {
    /** The headline, then its last words in red. */
    headline: string;
    sunset: string;
    lede: string;
    cta: string;
    watch: string;
    /** Names the two status chips under the buttons. */
    statusLabel: string;
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
    title: string;
    steps: readonly { title: string; description: string }[];
  };
  tonight: { title: string };
  /** ADR-076: the sections under "how it works". */
  more: {
    price: { title: string; perMinute: string; cloud: string };
    ways: {
      title: string;
      items: readonly { title: string; text: string; href: string }[];
    };
    faq: { title: string; items: readonly { q: string; a: string }[] };
    closer: {
      title: string;
      sunset: string;
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
