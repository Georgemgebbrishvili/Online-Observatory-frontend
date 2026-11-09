export type HomepageDictionary = {
  hero: {
    /** The headline, then its last words in red. */
    headline: string;
    sunset: string;
    lede: string;
    cta: string;
    watch: string;
    /** Under the drawn planet: it is a drawing, not the telescope's picture. */
    illustration: string;
    /** ADR-086: the hero's panels and the facts down its side. */
    panels: { tonight: string; noTimes: string; upTonight: string };
    rail: { aperture: string; perMinute: string; openWeek: string };
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
    price: { title: string; cloud: string };
    ways: {
      title: string;
      items: readonly { title: string; text: string; href: string }[];
    };
    faq: { title: string; items: readonly { q: string; a: string }[] };
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
