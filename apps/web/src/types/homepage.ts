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
