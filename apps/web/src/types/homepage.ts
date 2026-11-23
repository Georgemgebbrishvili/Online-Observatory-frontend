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
    /** Under the Moon, which is NASA's photograph darkened to tonight's phase. */
    moonCredit: string;
    /** ADR-086, ADR-099: the hero's three panels. */
    panels: { tonight: string; noTimes: string; upTonight: string; perMinute: string };
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
  gift: string;
  vote: string;
  cards: string;
};
