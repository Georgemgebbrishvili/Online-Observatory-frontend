// Brand Identity System v2.0 enforcement for apps/web. See docs/design/brand-tokens.md.
const rawLength = "/(^|[\\s(,])-?\\d*\\.?\\d+(rem|px|em)\\b/";

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
    // The --dv-* palette is private to tokens.css; everything else uses semantic tokens.
    "declaration-property-value-disallowed-list": { "/.*/": ["/var\\(--dv-/"] },
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
      // DV-070 AC1: the component library takes type and spacing from the scale only.
      files: [
        "apps/web/src/styles/components.css",
        "apps/web/src/styles/globals.css",
        "apps/web/src/styles/navigation.css",
        "apps/web/src/styles/design-system.css",
      ],
      rules: {
        "declaration-property-value-allowed-list": {
          "font-size": ["/^var\\(--font-size-[a-z0-9-]+\\)$/", "inherit"],
          "font-weight": ["/^var\\(--font-weight-[a-z]+\\)$/", "inherit"],
        },
        "declaration-property-value-disallowed-list": {
          "/.*/": ["/var\\(--dv-/"],
          "/^(padding|margin|gap|row-gap|column-gap)/": [rawLength],
        },
      },
    },
  ],
};

export default config;
