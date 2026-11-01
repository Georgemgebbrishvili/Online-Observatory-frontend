"use client";

import { useState, type CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/button";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";

/** The longest session (ADR-072), the end of the length bar. */
const longest = 240;

/**
 * ADR-078: what a session costs, one length at a time. Every price is the platform's,
 * worked out on the server at its rate by the minute.
 */
export function PricePicker({
  book,
  label,
  lengths,
  locale,
}: {
  /** "Book {length}". */
  book: string;
  label: string;
  lengths: { minutes: number; price: string }[];
  locale: Locale;
}) {
  const [chosen, setChosen] = useState(1 < lengths.length ? 1 : 0);
  const length = lengths[chosen];
  const duration = boardCopy[locale].duration;

  return (
    <div className="home-picker">
      <div className="home-picker-lengths" role="radiogroup" aria-label={label}>
        {lengths.map((item, index) => (
          <button
            key={item.minutes}
            type="button"
            role="radio"
            aria-checked={index === chosen}
            className="home-picker-length"
            onClick={() => setChosen(index)}
          >
            {duration(item.minutes)}
          </button>
        ))}
      </div>
      <output className="home-price" key={length.minutes} aria-live="polite">
        <b>{length.price}</b>
      </output>
      <span
        className="home-picker-meter"
        aria-hidden="true"
        style={{ "--share": length.minutes / longest } as CSSProperties}
      />
      <ButtonLink
        href={`/${locale}/app/book?length=${length.minutes}`}
        className="home-picker-book"
      >
        {fill(book, { length: duration(length.minutes) })}
      </ButtonLink>
    </div>
  );
}
