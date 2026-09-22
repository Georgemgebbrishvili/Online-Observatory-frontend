// The palette from tokens.css, for renderers that cannot read CSS variables (next/og).
// tokens.test.ts fails if the two files disagree.
export const palette = {
  neutral950: "#05080d",
  neutral900: "#0b0f15",
  neutral800: "#111722",
  neutral700: "#1a2330",
  neutral600: "#2a3645",
  neutral500: "#4c5a68",
  neutral400: "#778492",
  neutral300: "#aab4be",
  neutral200: "#d0d6dc",
  neutral100: "#f2f5f7",
  photon: "#5cc8ff",
  deepSignal: "#1677a3",
  starBrass: "#d9a45b",
  lunarSilver: "#a8b2bc",
  opticalGlass: "#263a49",
  success: "#4fd1a5",
  warning: "#e5b454",
  error: "#ff6b6b",
  info: "#78afff",
  black: "#000",
} as const;
