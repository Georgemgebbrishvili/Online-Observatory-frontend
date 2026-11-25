export type HomepageDictionary = {
  hero: {
    /** The headline, then its last words in red. */
    headline: string;
    sunset: string;
    lede: string;
    cta: string;
    watch: string;
  };
  common: {
    minutes: string;
    window: string;
    altitude: string;
  };
  /** ADR-087: the homepage as one scroll story. */
  story: {
    /** ADR-107: the hero's picture is a real photograph through the same telescope. */
    photo: string;
    /** {name} */
    photoLabel: string;
    /** The hero's steps after the headline: book, aim, watch, keep. */
    steps: readonly { a: string; b: string; text: string }[];
    /** The aim step when tonight has a planet to name: {name} {time} {altitude}. */
    aimTonight: string;
    booking: { tonight: string; none: string; all: string };
    feed: { label: string; stack: string };
    /** `real` names a capture of the observatory's own, with its {date} (ADR-106). */
    capture: { saved: string; real: string };
    showpieces: {
      label: string;
      title: string;
      em: string;
      all: string;
      best: string;
      /** {altitude} {direction} */
      high: string;
      book: string;
      bookAny: string;
      /** The row's arrows, for a screen reader. */
      previous: string;
      next: string;
      names: Record<string, string>;
      /** The name set large behind the picture: one short word. */
      kinds: Record<"moon" | "planet" | "galaxy" | "nebula" | "cluster", string>;
      notes: Record<string, string>;
    };
    night: {
      label: string;
      title: string;
      em: string;
      lede: string;
      zone: string;
      on: string;
      /** {name} */
      slewing: string;
      /** {name} {altitude} {direction} */
      pointing: string;
      first: { title: string; text: string };
      /** {name} */
      best: string;
      /** {time} {altitude} {direction} */
      bestText: string;
      open: string;
      compass: readonly string[];
    };
    session: {
      label: string;
      title: string;
      em: string;
      length: string;
      /** {price} */
      perMinute: string;
      noPrice: string;
      pricing: string;
      /** Three short facts under the headline, each already said elsewhere on the site. */
      facts: readonly string[];
      ticket: { admit: string; night: string; target: string; choice: string; length: string; price: string };
    };
    /** The observatory (ADR-105, ADR-107): what the telescope does for you, beside real views through one like it. */
    scope: {
      label: string;
      title: string;
      em: string;
      lede: string;
      see: string;
      sky: string;
      /** The film and photographs beside it, taken through 8-inch Celestron telescopes. */
      reel: {
        film: string;
        stills: Record<"saturn" | "jupiter" | "clavius", string>;
        note: string;
        credits: string;
        changes: string;
      };
    };
    closer: { title: string; em: string };
  };
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
