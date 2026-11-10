export type HomepageDictionary = {
  hero: {
    /** The headline, then its last words in red. */
    headline: string;
    sunset: string;
    lede: string;
    cta: string;
    watch: string;
    /** Under every drawn object: it is a drawing, not the telescope's picture. */
    illustration: string;
  };
  common: {
    minutes: string;
    window: string;
    altitude: string;
  };
  /** ADR-087: the homepage as one scroll story. */
  story: {
    simulated: string;
    scroll: string;
    /** The hero's steps after the headline: book, aim, watch, keep. */
    steps: readonly { a: string; b: string; text: string }[];
    /** The aim step when tonight has a planet to name: {name} {time} {altitude}. */
    aimTonight: string;
    booking: { tonight: string; none: string; all: string };
    feed: { label: string; stack: string; exposure: string; gain: string };
    capture: { saved: string; frames: string };
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
      names: Record<string, string>;
      /** The name set large behind the picture: one short word. */
      words: Record<string, string>;
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
      ticket: { admit: string; night: string; target: string; choice: string; length: string; price: string };
    };
    scope: {
      label: string;
      title: string;
      em: string;
      /** {aperture} {type} */
      lede: string;
      site: string;
      optics: string;
      focal: string;
      mount: string;
      see: string;
      sky: string;
      moon: string;
      photo: string;
    };
    closer: { title: string; em: string; credits: string };
  };
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
