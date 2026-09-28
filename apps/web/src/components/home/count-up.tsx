"use client";

import { useEffect, useRef } from "react";

type CountUpProps = { value: number; decimals?: number; prefix?: string };

/**
 * A number that counts up once when it scrolls into view. The server renders the final
 * value, so it reads correctly without JavaScript, under reduced motion and in a capture
 * that never scrolls; only a reader who scrolls to it sees the count.
 */
export function CountUp({ decimals = 0, prefix = "", value }: CountUpProps) {
  const node = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = node.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const format = (n: number) => `${prefix}${n.toFixed(decimals)}`;
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1200;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          element.textContent = format(value * (1 - Math.pow(1 - t, 4)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [decimals, prefix, value]);

  return (
    <span ref={node} className="count-up">
      {`${prefix}${value.toFixed(decimals)}`}
    </span>
  );
}
