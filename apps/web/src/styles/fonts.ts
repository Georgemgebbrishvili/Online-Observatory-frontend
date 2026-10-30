import {
  Anton,
  Archivo,
  Geist,
  JetBrains_Mono,
  Noto_Sans_Georgian,
  Oswald,
} from "next/font/google";
import localFont from "next/font/local";

const firaGO = localFont({
  src: [
    { path: "../app/fonts/firago/FiraGO-Regular.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/firago/FiraGO-Medium.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/firago/FiraGO-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-firago",
  display: "swap",
  // Loaded where Georgian is set, not preloaded on every English page.
  preload: false,
});

// ADR-052 type, as the Skychaser site sets it: Anton for headlines,
// Oswald for labels, buttons and navigation, Geist for body, JetBrains Mono for data.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

// Archivo Expanded Black, as the Skychaser kit sets its wordmark (ADR-052 §3). The
// lockup draws it as outlines; only the weekly card's face still sets it as text.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  preload: false,
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

// The Mkhedruli headline and label face, variable in weight. Its width axis narrows Latin
// but hardly Mkhedruli, so Georgian headlines are heavy at their natural width.
const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-noto-sans-georgian",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  firaGO,
  anton,
  archivo,
  oswald,
  geist,
  jetBrainsMono,
  notoSansGeorgian,
]
  .map((font) => font.variable)
  .join(" ");
