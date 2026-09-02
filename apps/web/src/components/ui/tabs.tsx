"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: readonly TabItem[];
  ariaLabel: string;
};

export function Tabs({ ariaLabel, items }: TabsProps) {
  const groupId = useId();
  const [activeId, setActiveId] = useState(items[0]?.id);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextItem = items[nextIndex];
    setActiveId(nextItem.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>("[role='tab']")
      [nextIndex]?.focus();
  }

  return (
    <div className="tabs">
      <div className="tab-list" role="tablist" aria-label={ariaLabel}>
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              id={`${groupId}-${item.id}-tab`}
              className="tab"
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${groupId}-${item.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${groupId}-${item.id}-panel`}
          className="tab-panel"
          role="tabpanel"
          aria-labelledby={`${groupId}-${item.id}-tab`}
          hidden={item.id !== activeId}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
