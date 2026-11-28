"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Pages that scroll themselves: the homepage drives its own Lenis with its scenes, and the
// observatory, the Night Sky, the game and the live room take the wheel for zoom and controls.
const ownScroll =
  /^\/(en|ka)(\/?$|\/(observatory|sky|explorer\/play|app\/live|app\/missions\/[^/]+\/(session|watch)|admin\/(control|telescope))(\/|$))/;

/**
 * Smooth wheel scrolling on every other page, for a fine pointer only: touch keeps the
 * phone's own scrolling, and reduced motion keeps the browser's. Lenis loads after the page
 * does, so it costs the first paint nothing.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (ownScroll.test(pathname)) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let lenis: { destroy(): void } | null = null;
    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        lerp: 0.1,
        autoRaf: true,
        anchors: true,
        allowNestedScroll: true,
      });
    });
    return () => {
      cancelled = true;
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}
