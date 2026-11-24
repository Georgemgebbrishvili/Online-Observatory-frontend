"use client";

import { useEffect } from "react";

// The glass pieces whose rim catches the pointer (ADR-100), on every page (ADR-102).
const lit = [
  ".plate",
  ".pricing-plan",
  ".pricing-tonight",
  ".guide-points li",
  ".guide-cta",
  ".auth-panel",
  ".state-panel",
  ".vote-card",
  ".gift-ticket",
].join(", ");

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

    let current: HTMLElement | null = null;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onPointer = (event: PointerEvent) => {
      const panel = (event.target as Element | null)?.closest<HTMLElement>(lit) ?? null;
      // Leaving a piece lets whatever leaned toward the pointer settle back.
      if (panel !== current) {
        current?.style.removeProperty("--mx");
        current?.style.removeProperty("--my");
        current = panel;
      }
      if (!panel) return;
      const box = panel.getBoundingClientRect();
      panel.style.setProperty("--px", `${event.clientX - box.left}px`);
      panel.style.setProperty("--py", `${event.clientY - box.top}px`);
      // The same point as a fraction of the piece, for what leans toward it.
      panel.style.setProperty("--mx", ((event.clientX - box.left) / box.width).toFixed(3));
      panel.style.setProperty("--my", ((event.clientY - box.top) / box.height).toFixed(3));
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
