// The palette from tokens.css, for renderers that cannot read CSS variables (next/og).
// tokens.test.ts fails if the two files disagree.
export const palette = {
  black: "#000000",
  deep: "#050505",
  cream: "#f3e6cc",
  ink: "#f6ecd8",
  orange: "#e8742f",
  orangeHi: "#f6a63f",
  orangeInk: "#f6b062",
  onOrange: "#1a0f08",
  yellow: "#ffd36b",
  photon: "#5cc8ff",
  sun1: "#fff3d2",
  sun2: "#ffd36b",
  sun3: "#f7931f",
  sun4: "#e0481f",
  sun5: "#a81c14",
  starBrass: "#d9a45b",
  success: "#4fd1a5",
  warning: "#e5b454",
  error: "#ff6b6b",
  navy: "#0a1735",
} as const;
