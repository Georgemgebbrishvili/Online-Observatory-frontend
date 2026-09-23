import type {
  CollectionFrameId,
  HomepageTargetId,
} from "@/features/targets/homepage-data";

type HomepageSectionHeading = {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
};

type TargetCopy = {
  name: string;
  type: string;
  visibility: string;
  bestTime: string;
};

export type HomepageDictionary = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    visualLabel: string;
    visualTitle: string;
    visualTarget: string;
    visualLocation: string;
    visualOperation: string;
    visualStatus: string;
    visualLive: string;
  };
  demoLabel: string;
  common: {
    watchLive: string;
    planMission: string;
    minutes: string;
    approximateViewers: string;
    currentTarget: string;
    currentMission: string;
    telescope: string;
    status: string;
    bestTime: string;
    duration: string;
    liveLabel: string;
    observatoryOnline: string;
    qualities: {
      Excellent: string;
      Good: string;
      Fair: string;
      Unavailable: string;
    };
  };
  live: HomepageSectionHeading & {
    observatoryName: string;
    targetName: string;
    currentMission: string;
    telescopeState: string;
  };
  tonight: HomepageSectionHeading & {
    scheduleNote: string;
    targets: Record<HomepageTargetId, TargetCopy>;
  };
  howItWorks: HomepageSectionHeading & {
    steps: readonly {
      title: string;
      description: string;
    }[];
  };
  realObservatory: HomepageSectionHeading & {
    statement: string;
    locationLabel: string;
    location: string;
    cameraLabel: string;
    camera: string;
    operationLabel: string;
    operation: string;
    telescopeLabel: string;
    telescope: string;
  };
  collection: HomepageSectionHeading & {
    statement: string;
    disclaimer: string;
    frames: Record<CollectionFrameId, { name: string; catalog: string }>;
  };
  network: HomepageSectionHeading & {
    observatoryName: string;
    active: string;
    location: string;
    descriptionLine: string;
    futureNote: string;
  };
  privateObservatory: HomepageSectionHeading & {
    sessionLabel: string;
    sessionDescription: string;
    availability: string;
  };
  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
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
