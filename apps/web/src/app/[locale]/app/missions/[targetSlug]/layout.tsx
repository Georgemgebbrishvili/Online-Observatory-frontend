import { Barlow_Condensed } from "next/font/google";
import type { ReactNode } from "react";

// The console's labels and controls (ADR-050 §6); only the room and the watch page load it.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function MissionLayout({ children }: { children: ReactNode }) {
  return (
    <div className={barlowCondensed.variable} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
