import type { FanPlate } from "@/features/targets/homepage-data";

type HomepageSectionHeading = {
  eyebrow: string;
  title: string;
  description: string;
};

export type HomepageDictionary = {
  hero: {
    kicker: string;
    /** The headline's first line, then the one sunset line. */
    headline: string;
    sunset: string;
    lede: string;
    cta: string;
    secondary: string;
    illustration: string;
    fanLabel: string;
    plates: Record<FanPlate, string>;
    plateType: string;
    stats: {
      observableNow: string;
      aperture: string;
      focalLength: string;
      telescope: string;
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
