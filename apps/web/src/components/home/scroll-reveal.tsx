"use client";

import { useEffect } from "react";

const targets =
  ".home-head, .home-tile, .night-panel, .night-readout, .flight-plan-tabs, .flight-plan-stage, .home-picker, .home-faq details, .home-closer-panel";

/**
 * ADR-077: the homepage's sections rise into place as they scroll into view. Until this
 * runs (or with reduced motion) everything is simply shown.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>(".public-home");
    if (!root || !("IntersectionObserver" in window)) return;

    const items = [...root.querySelectorAll<HTMLElement>(targets)];
    const reveal = (el: HTMLElement) => {
      el.dataset.in = "";
      observer.unobserve(el);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    // A fast scroll can carry a piece past the screen between two frames: anything
    // already above the fold shows at once.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      for (const el of items) {
        if (!("in" in el.dataset) && el.getBoundingClientRect().top < window.innerHeight) {
          reveal(el);
        }
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sweep);
    };
    for (const el of items) {
      const siblings = el.parentElement?.children;
      const index = siblings ? [...siblings].indexOf(el) : 0;
      const li = el.closest("li");
      const order = li?.parentElement
        ? [...li.parentElement.children].indexOf(li)
        : index;
      el.style.setProperty("--reveal-delay", `${Math.min(order, 5) * 70}ms`);
      observer.observe(el);
    }
    root.dataset.reveal = "";
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
