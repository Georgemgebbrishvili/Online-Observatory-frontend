"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";

const RADIO = '[role="radio"]';

/**
 * Phase 6.10: a group of `role="radio"` buttons as one Tab stop (WAI-ARIA radio group).
 * The checked radio, or the first enabled one, takes focus; arrow keys, Home and End
 * move to an enabled neighbour and choose it, as a native radio group does.
 */
export function useRovingRadios<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  // After every render: the radios may have changed, and React sets no tabIndex itself.
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    const radios = [...group.querySelectorAll<HTMLButtonElement>(RADIO)];
    const enabled = radios.filter((radio) => !radio.disabled);
    const current =
      enabled.find((radio) => radio.getAttribute("aria-checked") === "true") ?? enabled[0];
    for (const radio of radios) radio.tabIndex = radio === current ? 0 : -1;
  });

  function onKeyDown(event: KeyboardEvent<T>) {
    const group = ref.current;
    if (!group) return;
    const enabled = [...group.querySelectorAll<HTMLButtonElement>(RADIO)].filter(
      (radio) => !radio.disabled,
    );
    const index = enabled.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? enabled[(index + 1) % enabled.length]
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? enabled[(index - 1 + enabled.length) % enabled.length]
          : event.key === "Home"
            ? enabled[0]
            : event.key === "End"
              ? enabled.at(-1)
              : null;
    if (!next) return;
    event.preventDefault();
    next.focus();
    next.click();
  }

  return { ref, onKeyDown };
}
