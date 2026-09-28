import { Hanken_Grotesk, Poppins, Prata } from "next/font/google";

// The homepage's type (ADR-029, ADR-030). Each face's variable is set on the page's
// root, so the hero and the sections below it read the same fonts.
const prata = Prata({ subsets: ["latin"], weight: "400", variable: "--font-prata" });
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken-grotesk",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-poppins",
});

export const homeFonts = [prata.variable, hankenGrotesk.variable, poppins.variable].join(
  " ",
);
