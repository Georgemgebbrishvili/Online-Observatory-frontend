// Brand Identity System v2.0 enforcement for apps/web. See docs/design/brand-tokens.md
// and docs/plan/03-design-system.md for the v3 rules.
const rawLength = "/(^|[\\s(,])-?\\d*\\.?\\d+(rem|px|em)\\b/";

// v3 §4 — a font-size comes from the scale. The one permitted shape beyond a bare
// token is min(token, Nvw), which caps a heading by viewport width so a long Georgian
// compound does not break mid-word; the measurement belongs in a comment at the site.
const fontSizeFromScale = [
  "/^var\\(--font-size-[a-z0-9-]+\\)$/",
  "/^min\\(var\\(--font-size-[a-z0-9-]+\\), [0-9.]+vw\\)$/",
  "inherit",
];

// v3 §4 holds everywhere except these eight, which still carry 60 hardcoded font
// sizes. Their media queries were migrated in Phase 1, so §3 now holds everywhere with
// no exception at all. This list shrinks to nothing. Do not add a file to it.
const awaitingV3Migration = [
  "apps/web/src/styles/auth.css",
  "apps/web/src/styles/authenticated-home.css",
  "apps/web/src/styles/collection.css",
  "apps/web/src/styles/footer.css",
  "apps/web/src/styles/live.css",
  "apps/web/src/styles/mission-session.css",
  "apps/web/src/styles/missions.css",
  "apps/web/src/styles/shared-mission.css",
];

/** @type {import("stylelint").Config} */
const config = {
  rules: {
    // DV-070 AC1: no colour literal outside styles/tokens.css.
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hwb",
      "lab",
      "lch",
      "oklab",
      "oklch",
      "color",
    ],
    // The --st-* palette is private to tokens.css; everything else uses semantic tokens.
    "declaration-property-value-disallowed-list": { "/.*/": ["/var\\(--st-/"] },
    // v3 §3: the five named breakpoints, and no sixth. A stylesheet writes
    // @media (--md), never @media (min-width: 48rem). breakpoints.css declares them
    // with @custom-media, which this rule does not reach.
    "media-feature-name-disallowed-list": ["min-width", "max-width"],
    // §09 anti-pattern 04: no glassmorphism, no glowing text.
    "property-disallowed-list": [
      "backdrop-filter",
      "-webkit-backdrop-filter",
      "text-shadow",
    ],
  },
  overrides: [
    {
      files: ["apps/web/src/styles/tokens.css"],
      rules: {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "declaration-property-value-disallowed-list": null,
      },
    },
    {
      // v3 §4: every stylesheet takes its type from the scale, not just the library.
      files: ["apps/web/src/styles/*.css"],
      ignoreFiles: [...awaitingV3Migration, "apps/web/src/styles/tokens.css"],
      rules: {
        "declaration-property-value-allowed-list": {
          "font-size": fontSizeFromScale,
        },
      },
    },
    {
      // DV-070 AC1: the component library takes type and spacing from the scale only.
      files: [
        "apps/web/src/styles/components.css",
        "apps/web/src/styles/globals.css",
        "apps/web/src/styles/navigation.css",
        "apps/web/src/styles/design-system.css",
      ],
      rules: {
        "declaration-property-value-allowed-list": {
          "font-size": fontSizeFromScale,
          "font-weight": ["/^var\\(--font-weight-[a-z]+\\)$/", "inherit"],
        },
        "declaration-property-value-disallowed-list": {
          "/.*/": ["/var\\(--st-/"],
          "/^(padding|margin|gap|row-gap|column-gap)/": [rawLength],
        },
      },
    },
  ],
};

export default config;
