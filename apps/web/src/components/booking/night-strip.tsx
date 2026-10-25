"use client";

import { MoonGlyph, moonThatNight } from "@/components/booking/moon-glyph";
import { useRovingRadios } from "@/components/ui/roving-radios";
import type { NightLabel } from "@/features/booking/board";

export type StripNight = { date: string; label: NightLabel; open: number };

type NightStripProps = {
  nights: StripNight[];
  selected: string;
  onPick: (date: string) => void;
  timezone: string;
  groupLabel: string;
  openLabel: (count: number) => string;
  fullLabel: string;
};

/**
 * ADR-074: the nights the board sells, as one row of tiles: the weekday, the date, the
 * Moon that night and how many quarter hours are still open. One Tab stop.
 */
export function NightStrip({
  fullLabel,
  groupLabel,
  nights,
  onPick,
  openLabel,
  selected,
  timezone,
}: NightStripProps) {
  const { ref, onKeyDown } = useRovingRadios<HTMLDivElement>();
  return (
    <div
      className="night-strip"
      ref={ref}
      onKeyDown={onKeyDown}
      role="radiogroup"
      aria-label={groupLabel}
    >
      {nights.map((night) => {
        const moon = moonThatNight(night.date, timezone);
        const status = night.open > 0 ? openLabel(night.open) : fullLabel;
        return (
          <button
            key={night.date}
            type="button"
            role="radio"
            aria-checked={night.date === selected}
            aria-label={`${night.label.long}, ${status}`}
            className={`night-tile${night.open === 0 ? " is-full" : ""}`}
            onClick={() => onPick(night.date)}
          >
            <span className="night-tile-weekday">{night.label.weekday}</span>
            <span className="night-tile-day">{night.label.day}</span>
            <span className="night-tile-month">{night.label.month}</span>
            <span className="night-tile-foot">
              <MoonGlyph lit={moon.lit} waxing={moon.waxing} />
              <span>{night.open > 0 ? night.open : "—"}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
