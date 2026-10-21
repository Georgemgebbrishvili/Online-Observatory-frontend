"use client";

import { useMemo, useState } from "react";

import { MoonGlyph, moonThatNight } from "@/components/booking/moon-glyph";
import {
  monthAlmanac,
  type AlmanacEvent,
  type AlmanacKind,
} from "@/features/booking/almanac";
import type { Locale } from "@/i18n/config";
import { almanacCopy } from "@/i18n/resources/almanac";

export type CalendarNight = { date: string; open: number };

type SkyCalendarOptions = {
  locale: Locale;
  timezone: string;
  /** The nights the board offers, in order; only these can be chosen. */
  nights: CalendarNight[];
  selected: string;
  onPick: (date: string) => void;
  openLabel: (count: number) => string;
  fullLabel: string;
};

export type SkyCalendar = ReturnType<typeof useSkyCalendar>;

const day = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");
const shift = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * day).toISOString().slice(0, 10);
const partsOf = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
};
/** Monday 0 … Sunday 6, for a calendar date. */
const weekdayOf = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;

// Names are the calendar's own, not Intl's, so the server and every browser word a
// Georgian date the same and the grid hydrates unchanged.
const names = {
  en: {
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    weekdays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    label: (w: string, d: number, m: string) => `${w} ${d} ${m}`,
  },
  ka: {
    months: [
      "იანვარი",
      "თებერვალი",
      "მარტი",
      "აპრილი",
      "მაისი",
      "ივნისი",
      "ივლისი",
      "აგვისტო",
      "სექტემბერი",
      "ოქტომბერი",
      "ნოემბერი",
      "დეკემბერი",
    ],
    weekdays: [
      "ორშაბათი",
      "სამშაბათი",
      "ოთხშაბათი",
      "ხუთშაბათი",
      "პარასკევი",
      "შაბათი",
      "კვირა",
    ],
    short: ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვი"],
    label: (w: string, d: number, m: string) => `${w}, ${d} ${m}`,
  },
} as const;

/** A small drawn sign for each kind of event. */
function EventSign({ event, timezone }: { event: AlmanacEvent; timezone: string }) {
  if (event.kind === "moon") {
    const moon = moonThatNight(event.date, timezone);
    return <MoonGlyph lit={moon.lit} waxing={moon.waxing} />;
  }
  const kind: AlmanacKind = event.kind;
  return (
    <svg
      className={`cal-sign cal-sign-${kind}`}
      viewBox="-8 -8 16 16"
      width="14"
      height="14"
      aria-hidden="true"
    >
      {kind === "meteors" && (
        <>
          <path d="M-6,-5 L3,4" />
          <path d="M-2,-6 L5,1" />
          <circle cx="4.5" cy="5" r="1.6" />
        </>
      )}
      {(kind === "moonNear" || kind === "pair") && (
        <>
          <circle cx="-2.6" cy="0" r="3.4" />
          <circle cx="4.2" cy="-1.5" r="1.8" />
        </>
      )}
      {kind === "opposition" && (
        <>
          <circle r="3" />
          <circle r="6" className="cal-sign-ring" />
        </>
      )}
      {(kind === "lunarEclipse" || kind === "solarEclipse") && (
        <>
          <circle r="5.5" className="cal-sign-ring" />
          <circle cx="1.6" r="4.6" className="cal-sign-shade" />
        </>
      )}
      {kind === "season" && <path d="M0,-6 A6,6 0 0 1 0,6 Z" />}
    </svg>
  );
}

/**
 * The booking board's month (ADR-053 §7, the calendar pass): every day with its Moon,
 * the board's seven nights chosen as radios, and the sky's events — phases, close passes,
 * oppositions, eclipses, showers — marked on their dates, with a note for the day under
 * the pointer and the month's special nights in a list. Other days are for reading only.
 * One state drives both parts, so the list can sit apart from the month.
 */
export function useSkyCalendar({
  fullLabel,
  locale,
  nights,
  onPick,
  openLabel,
  selected,
  timezone,
}: SkyCalendarOptions) {
  const copy = almanacCopy[locale];
  const words = names[locale];
  const first = nights[0]?.date ?? selected;
  const start = partsOf(selected || first);
  const [view, setView] = useState({ y: start.y, m: start.m });
  const [peek, setPeek] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const bookable = useMemo(() => new Map(nights.map((n) => [n.date, n])), [nights]);
  const lastNight = nights[nights.length - 1]?.date ?? first;
  const home = partsOf(first);
  const monthIndex = (y: number, m: number) => y * 12 + m - 1;
  const atStart = monthIndex(view.y, view.m) <= monthIndex(home.y, home.m);
  const atEnd = monthIndex(view.y, view.m) >= monthIndex(home.y, home.m) + 11;

  const grid = useMemo(() => {
    const monthFirst = `${view.y}-${pad(view.m)}-01`;
    const monthLast = shift(
      view.m === 12 ? `${view.y + 1}-01-01` : `${view.y}-${pad(view.m + 1)}-01`,
      -1,
    );
    // The board's nights stay in sight when they run a few days into the next month.
    const spill =
      lastNight > monthLast && first <= monthLast && lastNight <= shift(monthLast, 7);
    const from = shift(monthFirst, -weekdayOf(monthFirst));
    const until = spill ? lastNight : monthLast;
    const to = shift(until, 6 - weekdayOf(until));
    const days: string[] = [];
    for (let d = from; d <= to; d = shift(d, 1)) days.push(d);
    return { days, monthFirst, monthLast };
  }, [view, first, lastNight]);

  const eventsOn = useMemo(() => {
    const map = new Map<string, AlmanacEvent[]>();
    const months = new Set(grid.days.map((d) => d.slice(0, 7)));
    for (const ym of months) {
      const { y, m } = partsOf(`${ym}-01`);
      for (const event of monthAlmanac(y, m, timezone)) {
        map.set(event.date, [...(map.get(event.date) ?? []), event]);
      }
    }
    return map;
  }, [grid.days, timezone]);

  const monthEvents = useMemo(
    () =>
      monthAlmanac(view.y, view.m, timezone).filter(
        (e) => e.kind !== "moon" || e.phase === "new" || e.phase === "full",
      ),
    [view, timezone],
  );

  const labelOf = (date: string) => {
    const { d, m } = partsOf(date);
    return words.label(words.weekdays[weekdayOf(date)], d, words.months[m - 1]);
  };
  const statusOf = (date: string) => {
    const night = bookable.get(date);
    if (night) return night.open > 0 ? openLabel(night.open) : fullLabel;
    return date < first ? copy.past : copy.notYet;
  };
  const go = (date: string) => {
    const { y, m } = partsOf(date);
    setView({ y, m });
    if (bookable.has(date)) {
      setPinned(null);
      onPick(date);
    } else setPinned(date);
  };
  const move = (by: number) => {
    const index = monthIndex(view.y, view.m) + by;
    setView({ y: Math.floor(index / 12), m: (index % 12) + 1 });
    setPinned(null);
  };

  const shown = peek ?? pinned ?? selected;
  const shownParts = partsOf(shown);
  const shownEvents = monthAlmanac(shownParts.y, shownParts.m, timezone).filter(
    (e) => e.date === shown,
  );
  const shownMoon = moonThatNight(shown, timezone);
  const shownNight = bookable.get(shown);
  const today = first;

  return {
    atEnd,
    atStart,
    bookable,
    copy,
    eventsOn,
    first,
    fullLabel,
    go,
    grid,
    labelOf,
    monthEvents,
    move,
    openLabel,
    selected,
    setPeek,
    setPinned,
    shown,
    shownEvents,
    shownMoon,
    shownNight,
    statusOf,
    timezone,
    today,
    view,
    words,
  };
}

/** The month itself: its head, the grid of days, and the note for the day in view. */
export function SkyMonth({ groupLabel, sky }: { groupLabel: string; sky: SkyCalendar }) {
  const {
    atEnd,
    atStart,
    bookable,
    copy,
    eventsOn,
    first,
    fullLabel,
    go,
    grid,
    labelOf,
    move,
    openLabel,
    selected,
    setPeek,
    setPinned,
    shown,
    shownEvents,
    shownMoon,
    shownNight,
    statusOf,
    timezone,
    today,
    view,
    words,
  } = sky;
  return (
    <div className="cal">
      <div className="cal-head">
        <button
          type="button"
          className="cal-nav"
          onClick={() => move(-1)}
          disabled={atStart}
          aria-label={copy.previousMonth}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <p className="cal-month" aria-live="polite">
          {words.months[view.m - 1]} <span>{view.y}</span>
        </p>
        <button
          type="button"
          className="cal-nav"
          onClick={() => move(1)}
          disabled={atEnd}
          aria-label={copy.nextMonth}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="cal-week" aria-hidden="true">
        {words.short.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div
        className="board-nights cal-grid"
        role="radiogroup"
        aria-label={groupLabel}
        onMouseLeave={() => setPeek(null)}
      >
        {grid.days.map((date) => {
          const { d } = partsOf(date);
          const night = bookable.get(date);
          const events = eventsOn.get(date) ?? [];
          const outside = date < grid.monthFirst || date > grid.monthLast;
          const moon = moonThatNight(date, timezone);
          const special = events.some(
            (e) => e.kind !== "moon" || e.phase === "new" || e.phase === "full",
          );
          const cls = [
            "cal-day",
            night ? "board-night is-open" : "is-info",
            night && night.open === 0 ? "is-full" : "",
            outside ? "is-outside" : "",
            date < first ? "is-past" : "",
            date === today ? "is-today" : "",
            special ? "has-event" : "",
            date === shown && !night ? "is-shown" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const titles = events.map((e) => copy.title(e)).join(", ");
          const content = (
            <>
              <b>{d}</b>
              <MoonGlyph lit={moon.lit} waxing={moon.waxing} />
              {special && <span className="cal-mark" aria-hidden="true" />}
            </>
          );
          const hover = {
            onMouseEnter: () => setPeek(date),
            onFocus: () => setPeek(date),
            onBlur: () => setPeek(null),
          };
          if (night) {
            const status = night.open === 0 ? fullLabel : openLabel(night.open);
            return (
              <button
                key={date}
                type="button"
                role="radio"
                aria-checked={date === selected}
                className={cls}
                onClick={() => go(date)}
                aria-label={`${labelOf(date)}, ${status}${titles ? `, ${titles}` : ""}`}
                {...hover}
              >
                {content}
                <i className="visually-hidden">{status}</i>
              </button>
            );
          }
          if (events.length > 0 && !outside) {
            return (
              <button
                key={date}
                type="button"
                className={cls}
                onClick={() => setPinned(date)}
                aria-label={`${labelOf(date)}, ${titles}, ${statusOf(date)}`}
                {...hover}
              >
                {content}
              </button>
            );
          }
          return (
            <span key={date} className={cls} aria-hidden="true">
              {content}
            </span>
          );
        })}
      </div>

      <section className="cal-note" aria-live="polite" aria-label={labelOf(shown)}>
        <header>
          <p className="cal-note-date">{labelOf(shown)}</p>
          <span
            className={`cal-chip${shownNight ? (shownNight.open > 0 ? " is-open" : " is-full") : ""}`}
          >
            {statusOf(shown)}
          </span>
        </header>
        <p className="cal-note-moon">
          <MoonGlyph lit={shownMoon.lit} waxing={shownMoon.waxing} />
          {copy.moonLit(shownMoon.lit)}
        </p>
        {shownEvents.length > 0 ? (
          <ul>
            {shownEvents.map((e) => (
              <li key={`${e.kind}-${copy.title(e)}`}>
                <EventSign event={e} timezone={timezone} />
                <span>
                  <b>{copy.title(e)}</b> {copy.note(e)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cal-note-none">{copy.nothingTonight}</p>
        )}
      </section>
    </div>
  );
}

/** The month's special nights: a short list, each a way to its day. */
export function SkyList({ sky }: { sky: SkyCalendar }) {
  const { bookable, copy, go, monthEvents, setPeek, shown, timezone, words } = sky;
  return (
    <section className="cal-list" aria-label={copy.special}>
      <header>
        <h3>{copy.special}</h3>
        <span>{copy.computed}</span>
      </header>
      {monthEvents.length === 0 ? (
        <p className="cal-note-none">{copy.nothingThisMonth}</p>
      ) : (
        <ul>
          {monthEvents.map((e) => {
            const { d } = partsOf(e.date);
            const night = bookable.get(e.date);
            return (
              <li key={`${e.date}-${e.kind}-${copy.title(e)}`}>
                <button
                  type="button"
                  className={`cal-event${e.date === shown ? " is-shown" : ""}`}
                  onClick={() => go(e.date)}
                  onMouseEnter={() => setPeek(e.date)}
                  onMouseLeave={() => setPeek(null)}
                >
                  <span className="cal-event-date">
                    <b>{d}</b>
                    <small>{words.short[weekdayOf(e.date)]}</small>
                  </span>
                  <EventSign event={e} timezone={timezone} />
                  <span className="cal-event-text">
                    <b>{copy.title(e)}</b>
                    <small>{copy.note(e)}</small>
                  </span>
                  {night && night.open > 0 && (
                    <span className="cal-event-open" title={copy.legendOpen}>
                      <span className="visually-hidden">{copy.legendOpen}</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
