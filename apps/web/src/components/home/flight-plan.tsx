"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export type FlightStep = {
  title: string;
  description: string;
  /** The page where this step happens. */
  href: string;
};

// Line drawings of the instrument at each step. No reticle, no crosshair (ADR-039).
const icons: ReactNode[] = [
  <>
    <rect x="8" y="11" width="32" height="28" rx="3" />
    <path d="M8 19h32M16 7v8M32 7v8" />
    <path d="M18 29l4 4 8-8" />
  </>,
  <>
    <path d="M10 22l22-9 3 7-22 9z" />
    <path d="M32 13l3-1.3 3 7-3 1.3" />
    <path d="M22 25.5l-6 14M22 25.5l6 14M22 25.5V40" />
  </>,
  <>
    <rect x="6" y="10" width="36" height="24" rx="3" />
    <path d="M18 40h12M24 34v6" />
    <circle cx="24" cy="22" r="5" />
  </>,
  <>
    <rect x="9" y="7" width="30" height="34" rx="2" />
    <rect x="14" y="12" width="20" height="16" />
    <path d="M14 34h12" />
  </>,
];

function Icon({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[index % icons.length]}
    </svg>
  );
}

/**
 * How a session works (ADR-078): four steps as tabs beside one stage. Each tab's bar
 * fills and hands on to the next while the section is in view; hovering or focusing
 * holds it, and with reduced motion nothing moves on its own.
 */
export function FlightPlan({ open, steps }: { open: string; steps: readonly FlightStep[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const step = steps[active];

  return (
    <div className="flight-plan" ref={root} data-running={inView || undefined}>
      <div className="flight-plan-tabs" role="tablist" aria-orientation="vertical">
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            className="flight-plan-tab"
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              const move = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[
                event.key
              ];
              if (!move) return;
              event.preventDefault();
              const next = (active + move + steps.length) % steps.length;
              setActive(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
          >
            <span className="flight-plan-no" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flight-plan-title">{item.title}</span>
            <span
              className="flight-plan-progress"
              aria-hidden="true"
              onAnimationEnd={() => setActive((index + 1) % steps.length)}
            />
          </button>
        ))}
      </div>

      <div
        className="flight-plan-stage"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
        data-step={String(active + 1).padStart(2, "0")}
      >
        <div className="flight-plan-art" key={active} aria-hidden="true">
          <span className="flight-plan-ring" />
          <span className="flight-plan-ring" />
          <span className="flight-plan-icon">
            <Icon index={active} />
          </span>
        </div>
        <div className="flight-plan-copy" key={`copy-${active}`}>
          <p className="flight-plan-text">{step.description}</p>
          <Link className="flight-plan-step" href={step.href}>
            {open} <span aria-hidden="true">→</span>
            <span className="visually-hidden"> — {step.title}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
