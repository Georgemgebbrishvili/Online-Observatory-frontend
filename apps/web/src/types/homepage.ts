import type { SkyPlate } from "@/features/targets/homepage-data";

type HomepageSectionHeading = {
  eyebrow: string;
  title: string;
  description: string;
};

export type HomepageDictionary = {
  hero: {
    /** The headline, then its last words in red. */
    headline: string;
    sunset: string;
    lede: string;
    cta: string;
    plates: Record<SkyPlate, string>;
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
  howItWorks: HomepageSectionHeading & {
    steps: readonly { title: string; description: string; action: string }[];
  };
  tonight: HomepageSectionHeading & {
    all: string;
  };
  instrument: HomepageSectionHeading & {
    aperture: string;
    focalLength: string;
    focalRatio: string;
    camera: string;
    cameraValue: string;
    mode: string;
    modeValue: string;
    location: string;
    locationValue: string;
    millimetres: string;
  };
  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    secondary: string;
    privateTitle: string;
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
  vote: string;
  pricing: string;
  live: string;
  collection: string;
  observatory: string;
  status: string;
  privacy: string;
  terms: string;
  refunds: string;
};
