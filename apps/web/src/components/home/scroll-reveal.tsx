"use client";

import { useEffect } from "react";

const targets =
  ".home-head, .home-tile, .flight-plan-step, .home-faq details, .home-guarantee, .home-closer h2, .home-closer-actions";

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
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
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
    return () => observer.disconnect();
  }, []);

  return null;
}
