"use client";

import type { TargetType, TonightTarget } from "@darkview/contracts";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { TargetCard } from "@/components/astronomy/target-card";
import type { Locale } from "@/i18n/config";
import { targetCopy } from "@/i18n/resources/targets";
import type { HomepageDictionary } from "@/types/homepage";

type TargetRailProps = {
  items: TonightTarget[];
  timezone: string;
  locale: Locale;
  common: HomepageDictionary["common"];
  copy: HomepageDictionary["tonight"];
};

/**
 * Tonight's targets as a horizontal rail (ADR-030): filter by type, step with the arrow
 * buttons, drag with a mouse, swipe on touch. The platform's order and reasons are kept;
 * a filter only narrows them.
 */
export function TargetRail({ common, copy, items, locale, timezone }: TargetRailProps) {
  const [filter, setFilter] = useState<TargetType | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const types = [...new Set(items.map((item) => item.target.type))];
  const shown = filter ? items.filter((item) => item.target.type === filter) : items;

  function measure() {
    const element = track.current;
    if (!element) return;
    setEdges({
      start: element.scrollLeft <= 4,
      end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 4,
    });
  }

  useEffect(() => {
    measure();
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [filter]);

  function step(direction: 1 | -1) {
    const element = track.current;
    const card = element?.querySelector<HTMLElement>(".target-card");
    if (!element || !card) return;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !track.current) return;
    drag.current = { x: event.clientX, left: track.current.scrollLeft, moved: false };
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    const element = track.current;
    if (!state || !element) return;
    const delta = event.clientX - state.x;
    if (Math.abs(delta) > 4 && !state.moved) {
      state.moved = true;
      element.setPointerCapture(event.pointerId);
      element.dataset.dragging = "";
    }
    if (state.moved) element.scrollLeft = state.left - delta;
  }

  function pointerUp() {
    const element = track.current;
    if (element) delete element.dataset.dragging;
    // A drag that moved must not also follow the link it ended on.
    if (drag.current?.moved) {
      element?.addEventListener("click", (event) => event.preventDefault(), {
        capture: true,
        once: true,
      });
    }
    drag.current = null;
  }

  return (
    <div className="target-rail">
      <div className="target-rail-controls">
        {types.length > 1 && (
          <div className="target-rail-filters" role="group" aria-label={copy.railLabel}>
            <button
              type="button"
              aria-pressed={filter === null}
              onClick={() => setFilter(null)}
            >
              {copy.all}
            </button>
            {types.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={filter === type}
                onClick={() => setFilter(type)}
              >
                {targetCopy[locale].types[type]}
              </button>
            ))}
          </div>
        )}
        <div className="target-rail-steps">
          <button
            type="button"
            aria-label={copy.previous}
            disabled={edges.start}
            onClick={() => step(-1)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={copy.next}
            disabled={edges.end}
            onClick={() => step(1)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="target-rail-track"
        role="region"
        aria-label={copy.railLabel}
        tabIndex={0}
        onScroll={measure}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        {shown.map((item) => (
          <TargetCard
            key={item.target.id}
            item={item}
            timezone={timezone}
            locale={locale}
            common={common}
          />
        ))}
      </div>
    </div>
  );
}
