"use client";

import { useState } from "react";

import type { Target } from "@darkview/contracts";

import {
  SkyList,
  SkyMonth,
  useSkyCalendar,
  type CalendarNight,
} from "@/components/booking/night-calendar";
import { NightTimeline } from "@/components/booking/night-timeline";
import { TargetArt, targetAccent } from "@/components/booking/target-art";
import { nightSky } from "@/features/booking/night-sky";
import { targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";
import { bookingCopy } from "@/i18n/resources/booking";
import { targetCopy } from "@/i18n/resources/targets";

import { targetSpecimens } from "./copy";

/** A fixed week, so the specimen never moves with the clock: the third night is full. */
const week: CalendarNight[] = [21, 22, 23, 24, 25, 26, 27].map((d, i) => ({
  date: `2026-10-${d}`,
  open: i === 2 ? 0 : 8 - (i % 3),
}));

// One of each kind of card art, from the contract's shape; nothing here reads the sky.
const base = targetSpecimens[0].target;
const cards: Target[] = [
  base,
  { ...base, id: "d511", slug: "s-jupiter", nameEn: "Jupiter", nameKa: "იუპიტერი", solarSystemBody: "JUPITER" },
  { ...base, id: "d512", slug: "s-mars", nameEn: "Mars", nameKa: "მარსი", solarSystemBody: "MARS" },
  { ...base, id: "d513", slug: "s-moon", type: "MOON", nameEn: "Moon", nameKa: "მთვარე", solarSystemBody: "MOON" },
  { ...base, id: "d514", slug: "s-albireo", type: "DOUBLE_STAR", nameEn: "Albireo", nameKa: "ალბირეო", solarSystemBody: null },
  { ...base, id: "d515", slug: "s-m13", type: "GLOBULAR_CLUSTER", nameEn: "Hercules Cluster", nameKa: "ჰერკულესის გროვა", solarSystemBody: null },
];

// A fixed late-October night and its slots, so the bar never moves with the clock.
const barNight = "2026-10-21";
const barSlots = Array.from({ length: 15 }, (_, index) => ({
  startAt: new Date(Date.parse("2026-10-21T15:45:00Z") + index * 40 * 60_000).toISOString(),
  durationMinutes: 30,
  state: (index === 1 ? "taken" : index === 4 ? "chosen" : "open") as "taken" | "chosen" | "open",
}));

/** The booking board's calendar (ADR-053 §7) in its states; every control works. */
export function CalendarSpecimens({ locale }: { locale: Locale }) {
  const copy = boardCopy[locale];
  const [night, setNight] = useState(week[0].date);
  const [chosen, setChosen] = useState(cards[0].id);
  const words = targetCopy[locale];
  const darkness = nightSky(barNight, "Asia/Tbilisi");
  const clock = (at: number) =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Tbilisi",
    }).format(at);
  const sky = useSkyCalendar({
    locale,
    timezone: "Asia/Tbilisi",
    nights: week,
    selected: night,
    onPick: setNight,
    openLabel: copy.open,
    fullLabel: copy.full,
  });
  return (
    <div className="ds-calendar">
      <div>
        <SkyMonth groupLabel={bookingCopy[locale].nights} sky={sky} />
      </div>
      <div>
        <SkyList sky={sky} />
      </div>
      <div className="ds-calendar-wide">
        {darkness && (
          <NightTimeline sky={darkness} slots={barSlots} copy={copy.timeline} clock={clock} />
        )}
        <div className="board-targets" role="radiogroup" aria-label={copy.target}>
          {cards.map((card, index) => {
            const down = index === cards.length - 1;
            return (
              <button
                key={card.id}
                type="button"
                role="radio"
                aria-checked={chosen === card.id}
                className={`board-target${down ? " is-down" : ""}`}
                data-accent={targetAccent(card)}
                disabled={down}
                onClick={() => setChosen(card.id)}
              >
                <span className="board-thumb" aria-hidden="true">
                  <TargetArt target={card} />
                </span>
                <span className="board-target-name">{targetName(card, locale)}</span>
                <span className="board-target-sub">{words.types[card.type]}</span>
                <span className={`board-target-state is-${down ? "down" : "up"}`}>
                  {down ? copy.reasonsShort.BELOW_MIN_ALTITUDE : copy.upShort}
                </span>
              </button>
            );
          })}
        </div>
        <p className="board-focus">
          <span className="board-art-note">{copy.illustrations}</span>
        </p>
      </div>
    </div>
  );
}
