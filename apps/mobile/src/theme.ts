// The website's palette (apps/web/src/styles/tokens.ts, ADR-052/056), the subset this
// app paints with. theme.test.ts fails if a value drifts from the website's.
export const palette = {
  canvas: "#0d0d0d",
  deep: "#131313",
  bar: "#050507",
  ink: "#f4f4f2",
  ink2: "#b8b8b4",
  ink3: "#969692",
  red: "#e3482c",
  redInk: "#f0785a",
  redFill: "#c8392a",
  gold: "#e2b85a",
  green: "#2ecc71",
  error: "#ff7a6b",
} as const;

export const line = "rgba(244, 244, 242, 0.12)";

// Nothing reads below 13 px (CLAUDE.md).
export const size = { hint: 13, body: 15, lead: 17, title: 30, display: 44 } as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 } as const;

export const radius = { small: 8, medium: 14, pill: 999 } as const;

/** Font families as loaded in app/_layout.tsx. */
export const face = {
  display: "Anton_400Regular",
  body: "Geist_400Regular",
  bodyStrong: "Geist_600SemiBold",
  mono: "JetBrainsMono_500Medium",
  georgian: "NotoSansGeorgian_400Regular",
  georgianStrong: "NotoSansGeorgian_700Bold",
} as const;
