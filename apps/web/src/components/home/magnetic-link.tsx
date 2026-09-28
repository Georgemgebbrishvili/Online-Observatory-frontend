"use client";

import { useRef, type AnchorHTMLAttributes, type PointerEvent } from "react";

const PULL = 0.3;
const LIMIT = 10;

/**
 * A link that eases toward a fine pointer hovering over it, and settles back when the
 * pointer leaves (ADR-030). Touch and reduced motion get an ordinary link.
 */
export function MagneticLink({
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const node = useRef<HTMLAnchorElement>(null);

  function move(event: PointerEvent<HTMLAnchorElement>) {
    const element = node.current;
    if (!element || event.pointerType !== "mouse") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = element.getBoundingClientRect();
    const clamp = (n: number) => Math.max(-LIMIT, Math.min(LIMIT, n));
    const x = clamp((event.clientX - box.left - box.width / 2) * PULL);
    const y = clamp((event.clientY - box.top - box.height / 2) * PULL);
    element.style.setProperty("--magnet-x", `${x}px`);
    element.style.setProperty("--magnet-y", `${y}px`);
  }

  function leave() {
    node.current?.style.removeProperty("--magnet-x");
    node.current?.style.removeProperty("--magnet-y");
  }

  return (
    <a
      ref={node}
      className={`magnetic ${className}`}
      onPointerMove={move}
      onPointerLeave={leave}
      {...props}
    >
      <span>{children}</span>
    </a>
  );
}
