export type HomepageDictionary = {
  hero: {
    /** ADR-100: the line above the headline. */
    kicker: string;
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
    /** ADR-100: the instrument in three short facts under the buttons. */
    specs: readonly string[];
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
  /** ADR-100: the telescope and camera in figures, and how light runs through them. */
  instrument: {
    kicker: string;
    title: string;
    lede: string;
    figures: readonly { value: string; unit: string; label: string }[];
    safety: { title: string; text: string };
    diagram: string;
  };
  /** ADR-100: the page's last word, and the way in. */
  closing: { title: string; lede: string; gift: string };
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
