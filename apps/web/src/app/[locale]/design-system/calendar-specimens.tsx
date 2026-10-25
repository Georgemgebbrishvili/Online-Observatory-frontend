"use client";

import { useState } from "react";

import type { Target } from "@darkview/contracts";

import { NightStrip, type StripNight } from "@/components/booking/night-strip";
import { TargetArt, targetAccent } from "@/components/booking/target-art";
import { TimeGrid, type GridCell } from "@/components/booking/time-grid";
import { targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";
import { bookingCopy } from "@/i18n/resources/booking";
import { targetCopy } from "@/i18n/resources/targets";

import { targetSpecimens } from "./copy";

// A fixed week, worded here so the specimen never moves with the clock or the browser's
// Georgian data: the third night is full.
const weekdays = {
  en: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
  ka: ["ოთხ", "ხუთ", "პარ", "შაბ", "კვი", "ორშ", "სამ"],
};
const month = { en: "Oct", ka: "ოქტ" };
const week = (locale: Locale): StripNight[] =>
  [21, 22, 23, 24, 25, 26, 27].map((d, i) => ({
    date: `2026-10-${d}`,
    open: i === 2 ? 0 : 30 - i * 2,
    label: {
      weekday: weekdays[locale][i],
      day: String(d),
      month: month[locale],
      long: `${weekdays[locale][i]} ${d} ${month[locale]}`,
      short: `${weekdays[locale][i]} ${d} ${month[locale]}`,
    },
  }));

// A fixed evening of quarter hours from 19:45 (Tbilisi, UTC+4): two taken, one past.
const cells: GridCell[] = Array.from({ length: 14 }, (_, i) => ({
  startAt: new Date(Date.parse("2026-10-21T15:45:00Z") + i * 15 * 60_000).toISOString(),
  state: i === 0 ? "off" : i === 3 || i === 4 ? "taken" : "open",
  cloud: i < 6 ? 60 : 10,
  forecast: i < 6 ? "60%" : "10%",
  reason: null,
}));
const clock = (at: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Tbilisi",
  }).format(new Date(at));

// One of each kind of card art, from the contract's shape; nothing here reads the sky.
const base = targetSpecimens[0].target;
const cards: Target[] = [
  base,
  {
    ...base,
    id: "d511",
    slug: "s-jupiter",
    nameEn: "Jupiter",
    nameKa: "იუპიტერი",
    solarSystemBody: "JUPITER",
  },
  {
    ...base,
    id: "d512",
    slug: "s-mars",
    nameEn: "Mars",
    nameKa: "მარსი",
    solarSystemBody: "MARS",
  },
  {
    ...base,
    id: "d513",
    slug: "s-moon",
    type: "MOON",
    nameEn: "Moon",
    nameKa: "მთვარე",
    solarSystemBody: "MOON",
  },
  {
    ...base,
    id: "d514",
    slug: "s-albireo",
    type: "DOUBLE_STAR",
    nameEn: "Albireo",
    nameKa: "ალბირეო",
    solarSystemBody: null,
  },
  {
    ...base,
    id: "d515",
    slug: "s-m13",
    type: "GLOBULAR_CLUSTER",
    nameEn: "Hercules Cluster",
    nameKa: "ჰერკულესის გროვა",
    solarSystemBody: null,
  },
];

/** The booking board's pieces (ADR-074) in their states; every control works. */
export function CalendarSpecimens({ locale }: { locale: Locale }) {
  const copy = boardCopy[locale];
  const [night, setNight] = useState("2026-10-21");
  const [run, setRun] = useState<{ from: number; to: number; pending: boolean }>({
    from: 6,
    to: 9,
    pending: false,
  });
  const [chosen, setChosen] = useState(cards[0].id);
  const words = targetCopy[locale];
  return (
    <div className="ds-calendar">
      <div className="ds-calendar-wide">
        <NightStrip
          nights={week(locale)}
          selected={night}
          onPick={setNight}
          timezone="Asia/Tbilisi"
          groupLabel={bookingCopy[locale].nights}
          openLabel={copy.open}
          fullLabel={copy.full}
        />
      </div>
      <div className="ds-calendar-wide">
        <TimeGrid
          cells={cells}
          from={run.from}
          to={run.to}
          waiting={null}
          pending={run.pending}
          onCell={(index) =>
            setRun(
              run.pending && index >= run.from
                ? { from: run.from, to: index, pending: false }
                : { from: index, to: index, pending: true },
            )
          }
          onDrag={(index) =>
            setRun({ from: run.from, to: Math.max(run.from, index), pending: false })
          }
          clock={clock}
          minuteOf={(at) => Number(clock(at).slice(-2))}
          label={copy.grid}
          cloudLabel={copy.forecast.label}
        />
      </div>
      <div className="ds-calendar-wide">
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
