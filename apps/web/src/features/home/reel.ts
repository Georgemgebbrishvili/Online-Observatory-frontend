/**
 * The homepage's real views (ADR-107): a film and photographs taken through 8-inch
 * Celestron telescopes by other observers, each under a Creative Commons licence that
 * asks for its author to be named. `public/sky/scope/README.md` records every source.
 */
export const reelFilm = {
  webm: "/sky/scope/moon.webm",
  mp4: "/sky/scope/moon.mp4",
  poster: "/sky/scope/moon-poster.webp",
} as const;

export const reelStills = [
  { id: "saturn", src: "/sky/scope/saturn.webp" },
  { id: "jupiter", src: "/sky/scope/jupiter.webp" },
  { id: "clavius", src: "/sky/scope/clavius.webp" },
] as const;

export type ReelStill = (typeof reelStills)[number]["id"];

export const reelCredits = [
  {
    author: "Thomas Bresson",
    licence: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:2012-07-26_22-00-15-moon.ogv",
    licenceUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
  {
    author: "Dilshan Jayakody",
    licence: "CC BY-SA 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Saturn_on_6th_April_2020_(49741479786).jpg",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  {
    author: "John Purvis",
    licence: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Clavius_with_subcraters_(20667644979).jpg",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
] as const;
