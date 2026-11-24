"use client";

import { useEffect } from "react";

// The page it is mounted in: inside the page, so it runs once the page has hydrated. The
// homepage has its own (scroll-reveal.tsx).
const roots = "#main-content:is(.public-page, .vote-page):not(.public-home)";
const targets =
  ".page-section :is(.plate, .pricing-plan, .guide-points li, .guide-steps li, .guide-faq-list details, .guide-cta), .gift-mine, .vote-card, .vote-chapter";

/**
 * ADR-102: below the fold, a page's panels rise into place as they are scrolled to, one
 * after another in a row. What is on screen when the page opens shows at once. Until this
 * runs, or with reduced motion, everything is simply shown.
 */
export function PageReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>(roots);
    if (!root || !("IntersectionObserver" in window)) return;

    const found = [...root.querySelectorAll<HTMLElement>(targets)];
    // Below the fold, and not inside another piece that rises on its own.
    const items = found.filter(
      (el) =>
        el.getBoundingClientRect().top > window.innerHeight &&
        !found.some((other) => other !== el && other.contains(el)),
    );
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
    );
    for (const el of items) {
      const order = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.setProperty("--enter-delay", `calc(var(--stagger) * ${Math.min(order, 5)})`);
      el.dataset.out = "";
      observer.observe(el);
    }
    // A fast scroll or a jump to an anchor can pass a panel between two frames.
    const sweep = () => {
      for (const el of items) {
        if (
          !("in" in el.dataset) &&
          el.getBoundingClientRect().top < window.innerHeight
        ) {
          el.dataset.in = "";
          observer.unobserve(el);
        }
      }
    };
    window.addEventListener("scroll", sweep, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sweep);
      for (const el of items) {
        delete el.dataset.out;
        delete el.dataset.in;
      }
    };
  }, []);

  return null;
}
