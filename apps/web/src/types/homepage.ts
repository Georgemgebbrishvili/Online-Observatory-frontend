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
    steps: readonly { title: string; description: string }[];
    status: { simulated: string; real: string };
  };
  tonight: HomepageSectionHeading & {
    scheduleNote: string;
    all: string;
  };
  instrument: HomepageSectionHeading & {
    telescope: string;
    aperture: string;
    focalLength: string;
    focalRatio: string;
    camera: string;
    cameraValue: string;
    cameraNote: string;
    mode: string;
    modeValue: string;
    modeNote: string;
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
    privateNote: string;
  };
};

export type FooterDictionary = {
  brandAriaLabel: string;
  brandEndorsement: string;
  statement: string;
  product: string;
  company: string;
  legal: string;
  language: string;
  georgianLanguage: string;
  englishLanguage: string;
  missions: string;
  live: string;
  collection: string;
  observatory: string;
  status: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  refunds: string;
  comingSoon: string;
};
