"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Reveals every [data-reveal] inside it as it scrolls into view (ADR-030). Until this
 * has run, nothing is hidden: the hidden state is keyed to data-reveal-ready, which only
 * this sets, so the page reads in full without JavaScript. Under reduced motion it never
 * arms at all.
 */
export function RevealRoot({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    element.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
    element.setAttribute("data-reveal-ready", "");
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={root} id="main-content" className={className}>
      {children}
    </main>
  );
}
