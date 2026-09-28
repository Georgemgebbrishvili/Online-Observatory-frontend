import type { PlanetId } from "@/features/targets/homepage-data";

type HomepageSectionHeading = {
  eyebrow: string;
  title: string;
  description: string;
};

export type HomepageDictionary = {
  hero: {
    eyebrow: string;
    cta: string;
    showPlanet: string;
    nextSection: string;
    illustration: string;
    /** Each lede is two lines; the wide layout breaks between them. */
    planets: Record<PlanetId, { name: string; lede: [string, string] }>;
  };
  common: {
    viewTarget: string;
    illustration: string;
    minutes: string;
    window: string;
    altitude: string;
    duration: string;
  };
  howItWorks: HomepageSectionHeading & {
    steps: readonly { title: string; description: string }[];
  };
  tonight: HomepageSectionHeading & {
    scheduleNote: string;
    railLabel: string;
    all: string;
    previous: string;
    next: string;
  };
  instrument: HomepageSectionHeading & {
    aperture: string;
    focalLength: string;
    focalRatio: string;
    camera: string;
    cameraValue: string;
    cameraNote: string;
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
