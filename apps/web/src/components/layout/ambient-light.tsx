"use client";

import { useEffect } from "react";

// The glass pieces whose rim catches the pointer (ADR-100).
const lit = ".home-tile, .night-panel, .night-readout, .home-closing-card";

/**
 * ADR-100: two quiet touches on every page. The header is clear over the top of a page and
 * turns to glass once it scrolls; a glass panel's rim brightens where the pointer is.
 * Without this script the header is simply glass and the rims are plain.
 */
export function AmbientLight() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        root.toggleAttribute("data-top", window.scrollY < 8);
      });
    };
    root.toggleAttribute("data-top", window.scrollY < 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointer = (event: PointerEvent) => {
      const panel = (event.target as Element | null)?.closest<HTMLElement>(lit);
      if (!panel) return;
      const box = panel.getBoundingClientRect();
      panel.style.setProperty("--px", `${event.clientX - box.left}px`);
      panel.style.setProperty("--py", `${event.clientY - box.top}px`);
    };
    if (fine) document.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onPointer);
      root.removeAttribute("data-top");
    };
  }, []);

  return null;
}
