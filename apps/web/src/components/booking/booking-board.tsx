"use client";

import type {
  BookableObservatory,
  Booking,
  CardPrize,
  Slot,
  SlotTarget,
  Target,
} from "@darkview/contracts";
import {
  zCreateBookingResponse,
  zJoinWaitlistResponse,
  zListMyWaitlistEntriesResponse,
  zListSlotTargetsResponse,
  zListSlotsResponse,
  zRescheduleBookingResponse,
} from "@darkview/contracts/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { formatPrice } from "@/components/booking/booking-night";
import { NightStrip } from "@/components/booking/night-strip";
import { TargetArt, targetAccent } from "@/components/booking/target-art";
import { TimeGrid, type GridCell } from "@/components/booking/time-grid";
import { Dropdown } from "@/components/ui/dropdown";
import { useRovingRadios } from "@/components/ui/roving-radios";
import { longDate } from "@/features/cards/dates";
import { checkoutTarget } from "@/features/booking/checkout";
import { readRefusal } from "@/features/booking/refusal";
import { nightSky } from "@/features/booking/night-sky";
import { targetDescription, targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";
import { cardsCopy } from "@/i18n/resources/cards";
import { giftCopy } from "@/i18n/resources/gift";
import { bookingCopy } from "@/i18n/resources/booking";
import { rescheduleCopy } from "@/i18n/resources/reschedule";
import { reserveCopy } from "@/i18n/resources/reserve";
import { targetCopy } from "@/i18n/resources/targets";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import type { BoardNight } from "@/features/booking/board";

type BookingBoardProps = {
  locale: Locale;
  observatory: BookableObservatory;
  /** Each night's quarter hours: the platform's 15-minute slots (ADR-074). */
  nights: BoardNight[];
  targets: Target[];
  /** A booking whose lost slot is being replaced: its length, for free (ADR-043). */
  reschedule: Booking | null;
  /** How long a first tap chooses, from the address (ADR-072); 30 minutes by default. */
  durationMinutes: number;
  /** A start named in the address (the old reserve page's way in): chosen on arrival. */
  initialStartAt: string | null;
  signInPath: string;
  /** ADR-058: the account's unspent free-slot and discount prizes for this observatory. */
  prizes?: CardPrize[];
};

type Phase = "idle" | "reserving" | "redirecting";
/** The chosen run of quarter hours, by index into the night's cells, both ends included. */
type Run = { from: number; to: number; pending: boolean };

const QUARTER = 15;
const QUARTER_MS = QUARTER * 60_000;
/** ADR-072: a session runs 15 minutes to 4 hours. */
const MAX_CELLS = 240 / QUARTER;

/** ADR-075: the lengths a session card offers at a tap, beside the stepper. */
const QUICK_LENGTHS = [30, 60, 120, 240];

/** ADR-068: a forecast clear enough to call a start "clear". */
const CLEAR_CLOUD_PERCENT = 30;

function intlLocale(locale: Locale) {
  return locale === "ka" ? "ka-GE" : "en-GB";
}

/** Whether a target can be booked for a slot, by the two rules `createBooking` applies. */
function bookable({ target, visibility }: SlotTarget, durationMinutes: number) {
  return visibility.observable && target.expectedMissionMinutes <= durationMinutes;
}

/** A step's heading, numbered as the poster numbers its chapters: 01, 02, 03. */
function StepTitle({ step, title }: { step: number; title: string }) {
  return (
    <h2>
      <span className="board-step-no" aria-hidden="true">
        {String(step).padStart(2, "0")}
      </span>
      {title}
    </h2>
  );
}

function Section({
  step,
  title,
  aside,
  children,
}: {
  step: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="board-section">
      <header className="board-step">
        <StepTitle step={step} title={title} />
        {aside && <span className="board-aside">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

/**
 * The booking board (ADR-074, after ADR-053 §7): a night, then its quarter hours — a tap
 * for the start, a tap for the end — an object, and a cream card with what it costs and
 * one button. The quarter hours are the platform's 15-minute slots, read on the server;
 * a run of them is free exactly when each of them is, by the platform's turnaround rule.
 * The run's own slot, with its price and forecast, is read from `GET /slots` at its
 * length before anything is reserved; reserving is `POST /bookings` with an idempotency
 * key and the checkout redirect (ADR-043), or the free replacement of a lost slot.
 */
export function BookingBoard({
  durationMinutes,
  initialStartAt,
  locale,
  nights,
  observatory,
  prizes = [],
  reschedule,
  signInPath,
  targets,
}: BookingBoardProps) {
  const copy = boardCopy[locale];
  const booking = bookingCopy[locale];
  const reserve = reserveCopy[locale];
  const replacing = rescheduleCopy[locale];
  const words = targetCopy[locale];
  const cards = cardsCopy[locale];
  const gifts = giftCopy[locale].board;
  const { ref: targetRef, onKeyDown: onTargetKey } = useRovingRadios<HTMLDivElement>();
  const timezone = observatory.timezone;
  const router = useRouter();

  const time = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale(locale), {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: timezone,
      }),
    [locale, timezone],
  );
  const clock = useCallback((at: string | number) => time.format(new Date(at)), [time]);
  const minuteOf = useCallback((at: string) => Number(clock(at).slice(-2)), [clock]);
  const firstSlot = nights.flatMap((n) => n.slots)[0];
  // The zone's short name at the first slot: the observatory's, not the reader's.
  const zone = firstSlot
    ? new Intl.DateTimeFormat("en-GB", { timeZone: timezone, timeZoneName: "short" })
        .formatToParts(new Date(firstSlot.startAt))
        .find((part) => part.type === "timeZoneName")?.value
    : undefined;

  // Quarter hours refused as taken on this visit, struck out until the night is read again.
  const [gone, setGone] = useState<ReadonlySet<string>>(() => new Set());
  // ADR-068: starts freed and held for this customer by their waitlist, read in the browser.
  // Each offer's expiry, by its start; and the span it holds, so its quarter hours are open.
  const [held, setHeld] = useState<ReadonlyMap<string, string>>(() => new Map());
  const [offered, setOffered] = useState<{ from: number; to: number }[]>([]);
  useEffect(() => {
    apiRequest("/waitlist", { schema: zListMyWaitlistEntriesResponse })
      .then(({ items }) => {
        const offers = items.filter(
          (item) => item.status === "OFFERED" && item.offerExpiresAt,
        );
        setHeld(new Map(offers.map((item) => [item.slotStartAt, item.offerExpiresAt!])));
        setOffered(
          offers.map((item) => ({
            from: Date.parse(item.slotStartAt),
            to: Date.parse(item.slotStartAt) + item.durationMinutes * 60_000,
          })),
        );
      })
      .catch(() => {});
  }, []);

  const mine = (startAt: string) => {
    const at = Date.parse(startAt);
    return offered.some((offer) => at >= offer.from && at < offer.to);
  };
  const open = (slot: Slot) =>
    (slot.available ||
      (slot.unavailableReason === "HELD_FOR_WAITLIST" && mine(slot.startAt))) &&
    !gone.has(slot.startAt);
  // ADR-068: a start somebody else holds can be waited for, never on a replacement.
  const takenBySomeone = (slot: Slot) =>
    !open(slot) &&
    (slot.unavailableReason === "ALREADY_BOOKED" ||
      slot.unavailableReason === "HELD_FOR_WAITLIST" ||
      gone.has(slot.startAt));
  const openCount = (night: BoardNight) => night.slots.filter(open).length;

  // A replacement keeps its booking's length; anything else starts at the address's.
  const fixedCells = reschedule ? reschedule.durationMinutes / QUARTER : null;
  const firstCells = fixedCells ?? durationMinutes / QUARTER;

  /** The last index a run from `from` can reach: open, unbroken, at most four hours. */
  const reach = (slots: Slot[], from: number) => {
    let last = from;
    while (
      last + 1 < slots.length &&
      last + 1 - from < MAX_CELLS &&
      open(slots[last + 1]) &&
      Date.parse(slots[last + 1].startAt) - Date.parse(slots[last].startAt) === QUARTER_MS
    ) {
      last += 1;
    }
    return last;
  };

  // The run chosen on arrival (ADR-075: a board that opens ready to book): the address's
  // start; else the next clear start with room for the length (ADR-068), else the next
  // free one. One press books it; any tap changes it.
  const [arrival] = useState<{
    night: string;
    run: Run | null;
    kind: "named" | "clear" | "free" | null;
  }>(() => {
    const fits = (slots: Slot[], index: number) =>
      open(slots[index]) && reach(slots, index) >= index + firstCells - 1;
    const runAt = (index: number): Run => ({
      from: index,
      to: index + firstCells - 1,
      pending: false,
    });
    if (initialStartAt) {
      for (const night of nights) {
        const index = night.slots.findIndex((slot) => slot.startAt === initialStartAt);
        if (index >= 0 && fits(night.slots, index)) {
          return { night: night.date, run: runAt(index), kind: "named" };
        }
      }
    } else {
      const clear = (slot: Slot) =>
        slot.forecast.status === "KNOWN" &&
        slot.forecast.cloudCoverPercent !== null &&
        slot.forecast.cloudCoverPercent <= CLEAR_CLOUD_PERCENT;
      for (const kind of ["clear", "free"] as const) {
        for (const night of nights) {
          const index = night.slots.findIndex(
            (slot, at) => (kind === "free" || clear(slot)) && fits(night.slots, at),
          );
          if (index >= 0) return { night: night.date, run: runAt(index), kind };
        }
      }
    }
    return {
      night:
        nights.find((candidate) => openCount(candidate) > 0)?.date ??
        nights[0]?.date ??
        "",
      run: null,
      kind: null,
    };
  });

  const [night, setNight] = useState(arrival.night);
  const [run, setRun] = useState<Run | null>(arrival.run);
  const [waitingAt, setWaitingAt] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(reschedule?.targetId ?? null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [key] = useState(() => crypto.randomUUID());

  const current = nights.find((candidate) => candidate.date === night) ?? nights[0];
  const slots = useMemo(() => current?.slots ?? [], [current]);
  const darkness = current ? nightSky(current.date, timezone) : null;

  const cells: GridCell[] = slots.map((slot) => ({
    startAt: slot.startAt,
    state: open(slot) ? "open" : takenBySomeone(slot) && !reschedule ? "taken" : "off",
    cloud: slot.forecast.status === "KNOWN" ? slot.forecast.cloudCoverPercent : null,
    forecast:
      slot.forecast.status === "KNOWN" && slot.forecast.cloudCoverPercent !== null
        ? copy.forecast.cloud(Math.round(slot.forecast.cloudCoverPercent))
        : copy.forecast.unknown,
    reason:
      open(slot) || !slot.unavailableReason
        ? null
        : booking.reasons[slot.unavailableReason],
  }));

  const minutes = run ? (run.to - run.from + 1) * QUARTER : 0;
  const startSlot = run ? slots[run.from] : null;
  const waiting = waitingAt !== null ? slots[waitingAt] : null;

  // The run's own slot at its length, as `GET /slots` sells it: its price, its forecast,
  // and whether it is still free. A 15-minute run is a cell, already read.
  const [quotes, setQuotes] = useState<Record<string, Slot[] | "failed">>({});
  const quoteKey = `${night}|${minutes}`;
  const asked = useRef(new Set<string>());
  useEffect(() => {
    if (!run || minutes === QUARTER || asked.current.has(quoteKey)) return;
    asked.current.add(quoteKey);
    apiRequest(
      `/slots?observatoryId=${encodeURIComponent(observatory.id)}&date=${night}&durationMinutes=${minutes}`,
      { schema: zListSlotsResponse },
    )
      .then((list) => setQuotes((all) => ({ ...all, [quoteKey]: list.items })))
      .catch(() => {
        asked.current.delete(quoteKey);
        setQuotes((all) => ({ ...all, [quoteKey]: "failed" }));
      });
  }, [run, minutes, night, quoteKey, observatory.id]);
  const quoted = !run
    ? null
    : minutes === QUARTER
      ? startSlot
      : Array.isArray(quotes[quoteKey])
        ? ((quotes[quoteKey] as Slot[]).find(
            (slot) => slot.startAt === startSlot?.startAt,
          ) ?? null)
        : undefined;
  const quoteFailed = !!run && minutes !== QUARTER && quotes[quoteKey] === "failed";
  const checking = !!run && quoted === undefined && !quoteFailed;
  // The session that would be reserved: the run's slot while the platform still sells it.
  const chosen =
    quoted && open(quoted) && quoted.durationMinutes === minutes ? quoted : null;
  const stale = !!run && quoted !== undefined && !chosen && !quoteFailed;

  // What is up across the run, read once per start and length.
  const [skies, setSkies] = useState<Record<string, SlotTarget[]>>({});
  const reading = useRef(new Set<string>());
  const skyKey = (slot: Slot) => `${slot.startAt}|${slot.durationMinutes}`;
  const readSky = useCallback(
    (slot: Slot) => {
      const id = `${slot.startAt}|${slot.durationMinutes}`;
      if (reading.current.has(id)) return;
      reading.current.add(id);
      apiRequest(
        `/targets/visibility?observatoryId=${encodeURIComponent(observatory.id)}&startAt=${encodeURIComponent(slot.startAt)}&durationMinutes=${slot.durationMinutes}`,
        { schema: zListSlotTargetsResponse },
      )
        .then((list) => setSkies((all) => ({ ...all, [id]: list.items })))
        .catch(() => setSkies((all) => ({ ...all, [id]: [] })));
    },
    [observatory.id],
  );
  useEffect(() => {
    if (chosen) readSky(chosen);
  }, [chosen, readSky]);

  const judged = chosen ? (skies[skyKey(chosen)] ?? null) : null;
  const loading = !!chosen && judged === null;
  const judgement = (target: Target) =>
    judged?.find((item) => item.target.id === target.id) ?? null;
  const canBook = (target: Target) => {
    const item = judgement(target);
    return !!chosen && !!item && bookable(item, chosen.durationMinutes);
  };
  const target = targets.find((candidate) => candidate.id === targetId) ?? null;
  const ordered =
    chosen && judged
      ? [...targets].sort((a, b) => Number(canBook(b)) - Number(canBook(a)))
      : targets;
  // The object is optional: without one, the platform assigns the best one up.
  const ready = !!chosen && (!target || canBook(target));

  // ADR-058: a prize the run can take. A free slot pays only for its own length.
  const [prizeId, setPrizeId] = useState("");
  const usable = reschedule
    ? []
    : prizes.filter(
        (prize) =>
          prize.voucherCode &&
          (prize.kind === "DISCOUNT" ||
            (prize.kind === "FREE_SLOT" && (!run || minutes === prize.durationMinutes))),
      );
  // ADR-067: a gift code typed in takes the place of any prize; a booking takes one.
  const [giftCode, setGiftCode] = useState("");
  const gift = reschedule ? "" : giftCode.trim();
  const prize = gift
    ? null
    : (usable.find((candidate) => candidate.id === prizeId) ?? null);

  const settle = () => {
    setFeedback(null);
    setNotice(null);
    setWaitingAt(null);
  };
  const pickNight = (date: string) => {
    setNight(date);
    setRun(null);
    settle();
  };

  /** A run from `from` of `cells` quarter hours, cut where the night or a booking stops it. */
  const runFrom = (from: number, cells: number, pending: boolean): Run | null => {
    const end = from + cells - 1;
    const last = reach(slots, from);
    if (fixedCells !== null) {
      if (last < end) {
        setNotice(copy.noRoom(copy.duration(fixedCells * QUARTER)));
        return null;
      }
      return { from, to: end, pending: false };
    }
    return { from, to: Math.min(end, last), pending };
  };

  const endAt = (index: number) => {
    if (!run) return;
    const last = reach(slots, run.from);
    const to = Math.min(index, last);
    setRun({ from: run.from, to, pending: false });
    if (to < index) {
      setNotice(
        index - run.from >= MAX_CELLS
          ? copy.longest
          : copy.clipped(clock(Date.parse(slots[to].startAt) + QUARTER_MS)),
      );
    }
  };

  const onCell = (index: number) => {
    const cell = cells[index];
    settle();
    // Placing the end: a later tap anywhere ends the run there, or just before what stops it.
    if (run?.pending && index > run.from) return endAt(index);
    if (cell.state === "taken") {
      setRun(null);
      setWaitingAt(index);
      return;
    }
    if (cell.state !== "open") return;
    if (run?.pending && index >= run.from) return endAt(index);
    setRun(runFrom(index, firstCells, true));
  };
  const onDrag = (index: number) => {
    if (!run || fixedCells !== null || index < run.from) return;
    const to = Math.min(index, reach(slots, run.from));
    if (to !== run.to || run.pending) setRun({ from: run.from, to, pending: false });
  };
  // Moves the end by quarter hours; past what is free it stops there and says why.
  const nudge = (cells: number) => {
    if (!run || fixedCells !== null) return;
    settle();
    const wanted = Math.max(run.from, run.to + cells);
    const last = reach(slots, run.from);
    const to = Math.min(wanted, last);
    if (wanted > last) {
      setNotice(
        wanted - run.from >= MAX_CELLS
          ? copy.longest
          : copy.clipped(clock(Date.parse(slots[last].startAt) + QUARTER_MS)),
      );
    }
    setRun({ from: run.from, to, pending: false });
  };

  async function joinWaitlist() {
    if (!waiting || phase !== "idle") return;
    setPhase("reserving");
    setFeedback(null);
    try {
      const entry = await apiRequest("/waitlist", {
        method: "POST",
        body: {
          observatoryId: observatory.id,
          slotStartAt: waiting.startAt,
          durationMinutes: firstCells * QUARTER,
        },
        schema: zJoinWaitlistResponse,
      });
      setNotice(copy.waitlist.joined(entry.position ?? 1));
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      setFeedback(
        error instanceof ApiRequestError && (error.status === 409 || error.status === 422)
          ? copy.waitlist.refused
          : reserve.form.failed,
      );
    } finally {
      setPhase("idle");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (waiting) return void joinWaitlist();
    if (!chosen || !ready || phase !== "idle") return;
    setPhase("reserving");
    setFeedback(null);
    try {
      if (reschedule) {
        const booked = await apiRequest(
          `/bookings/${encodeURIComponent(reschedule.id)}/reschedule`,
          {
            method: "POST",
            body: {
              slotStartAt: chosen.startAt,
              targetId: target?.id ?? reschedule.targetId,
            },
            schema: zRescheduleBookingResponse,
          },
        );
        setPhase("redirecting");
        navigateWithFreshSession(`/${locale}/app/bookings/${booked.id}`);
        return;
      }
      const { booking: made, paymentIntent } = await apiRequest("/bookings", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: {
          observatoryId: observatory.id,
          ...(target ? { targetId: target.id } : {}),
          slotStartAt: chosen.startAt,
          durationMinutes: chosen.durationMinutes,
          locale,
          ...(gift
            ? { voucherCode: gift }
            : prize?.voucherCode
              ? { voucherCode: prize.voucherCode }
              : {}),
        },
        schema: zCreateBookingResponse,
      });
      const bookingPage = `/${locale}/app/bookings/${made.id}`;
      const checkout = paymentIntent?.redirectUrl
        ? checkoutTarget(paymentIntent.redirectUrl, window.location.origin)
        : null;
      setPhase("redirecting");
      // A full navigation: the checkout is not a page of this app, and it sets cookies of
      // its own on the way back.
      navigateWithFreshSession(checkout ?? bookingPage);
    } catch (error) {
      setPhase("idle");
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      const code = error instanceof ApiRequestError ? error.error?.code : undefined;
      if (reschedule && code === "CONFLICT") {
        setPhase("redirecting");
        navigateWithFreshSession(`/${locale}/app/bookings/${reschedule.id}`);
        return;
      }
      const refusal = readRefusal(error, reserve.form, words.reasons);
      setFeedback(
        gift && code === "VALIDATION_FAILED"
          ? gifts.refused
          : prize && code === "VALIDATION_FAILED"
            ? cards.board.refused
            : !target && code === "VALIDATION_FAILED"
              ? copy.noTargets
              : refusal.message,
      );
      if (refusal.slotGone) {
        setGone((all) => new Set(all).add(chosen.startAt));
        setRun(null);
        router.refresh();
      }
      if (refusal.skyChanged) {
        setTargetId(null);
        reading.current.delete(skyKey(chosen));
        setSkies((all) => {
          const rest = { ...all };
          delete rest[skyKey(chosen)];
          return rest;
        });
        readSky(chosen);
      }
    }
  }

  const price = (slot: Slot) =>
    reschedule
      ? replacing.free
      : gift
        ? gifts.paid
        : prize?.kind === "FREE_SLOT"
          ? cards.board.free
          : formatPrice(slot.priceMinor, slot.currency, locale);
  const runText = run
    ? `${clock(slots[run.from].startAt)} – ${clock(Date.parse(slots[run.to].startAt) + QUARTER_MS)}`
    : null;
  const cost = chosen ? price(chosen) : checking ? copy.checking : "—";
  const buttonLabel = waiting
    ? phase === "reserving"
      ? copy.waitlist.joining
      : copy.waitlist.join
    : phase === "reserving"
      ? reschedule
        ? replacing.form.booking
        : reserve.form.reserving
      : phase === "redirecting"
        ? reschedule
          ? replacing.form.booking
          : reserve.form.redirecting
        : reschedule
          ? replacing.form.book
          : reserve.form.reserve;
  const hint = run?.pending ? copy.hint.end : run ? copy.hint.again : copy.hint.start;

  return (
    <form className="board" onSubmit={submit} aria-busy={phase !== "idle" || undefined}>
      <header className="board-head">
        <h1 className="visually-hidden">{booking.title}</h1>
        <p className="board-lede">{reschedule ? replacing.replacing : copy.lede}</p>
      </header>

      <header className="board-step board-step-bare">
        <StepTitle step={1} title={copy.night} />
      </header>
      <NightStrip
        nights={nights.map((candidate) => ({
          date: candidate.date,
          label: candidate.label,
          open: openCount(candidate),
        }))}
        selected={night}
        onPick={pickNight}
        timezone={timezone}
        groupLabel={booking.nights}
        openLabel={copy.open}
        fullLabel={copy.full}
      />

      <div className="board-grid">
        <div className="board-main">
          <Section
            step={2}
            title={current ? current.label.long : copy.start}
            aside={
              <>
                {darkness && (
                  <span>{copy.dark(clock(darkness.dusk), clock(darkness.dawn))}</span>
                )}
                <span>{zone ? `${copy.siteTime} · ${zone}` : copy.siteTime}</span>
              </>
            }
          >
            <p className="board-hint" aria-live="polite">
              {hint}
            </p>
            {slots.length > 0 ? (
              <TimeGrid
                cells={cells}
                from={run?.from ?? null}
                to={run?.to ?? null}
                waiting={waitingAt}
                pending={!!run?.pending}
                onCell={onCell}
                onDrag={onDrag}
                clock={clock}
                minuteOf={minuteOf}
                label={`${copy.grid}, ${current?.label.long ?? ""}`}
                cloudLabel={copy.forecast.label}
              />
            ) : (
              <p className="board-note">{copy.noSlots}</p>
            )}
          </Section>

          <Section
            step={3}
            title={copy.target}
            aside={
              !chosen
                ? copy.optional
                : loading
                  ? copy.loadingTargets
                  : judged &&
                      judged.every((item) => !bookable(item, chosen.durationMinutes))
                    ? copy.noTargets
                    : copy.optional
            }
          >
            <div
              className="board-targets"
              ref={targetRef}
              onKeyDown={onTargetKey}
              role="radiogroup"
              aria-label={copy.target}
              aria-busy={loading || undefined}
            >
              <button
                type="button"
                role="radio"
                aria-checked={targetId === null}
                className="board-target board-target-any"
                onClick={() => setTargetId(null)}
              >
                <span className="board-thumb" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2.5l2.2 6.8 7.3.2-5.8 4.4 2.1 7-5.8-4.2-5.8 4.2 2.1-7L2.5 9.5l7.3-.2z" />
                  </svg>
                </span>
                <span className="board-target-text">
                  <span className="board-target-name">{copy.anyTarget}</span>
                  <span className="board-target-sub">{copy.anySub}</span>
                </span>
              </button>
              {ordered.map((candidate) => {
                const item = judgement(candidate);
                const down = !!chosen && !!judged && !canBook(candidate);
                const reasons = item?.visibility.blockReasons ?? [];
                const state = !chosen
                  ? null
                  : !item
                    ? null
                    : bookable(item, chosen.durationMinutes)
                      ? { tone: "up", text: copy.up, short: copy.upShort }
                      : item.visibility.observable
                        ? {
                            tone: "down",
                            text: copy.needs(candidate.expectedMissionMinutes),
                            short: copy.needsShort(candidate.expectedMissionMinutes),
                          }
                        : {
                            tone: "down",
                            text:
                              reasons
                                .map((reason) => words.reasons[reason])
                                .join(" · ") || booking.unavailable,
                            short: reasons[0]
                              ? copy.reasonsShort[reasons[0]]
                              : booking.unavailable,
                          };
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    role="radio"
                    aria-checked={targetId === candidate.id}
                    className={`board-target${down ? " is-down" : ""}`}
                    data-accent={targetAccent(candidate)}
                    disabled={down}
                    onClick={() =>
                      setTargetId(targetId === candidate.id ? null : candidate.id)
                    }
                    aria-label={`${targetName(candidate, locale)}, ${state?.text ?? words.types[candidate.type]}`}
                  >
                    <span className="board-thumb" aria-hidden="true">
                      <TargetArt target={candidate} />
                    </span>
                    <span className="board-target-text">
                      <span className="board-target-name">
                        {targetName(candidate, locale)}
                      </span>
                      {state ? (
                        <span
                          className={`board-target-state is-${state.tone}`}
                          title={state.text}
                        >
                          <span aria-hidden="true">{state.short}</span>
                          <span className="visually-hidden">{state.text}</span>
                        </span>
                      ) : (
                        <span className="board-target-sub">
                          {words.types[candidate.type]}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="board-focus">
              {target && (
                <>
                  <b>{targetName(target, locale)}</b> {targetDescription(target, locale)}
                </>
              )}
              <span className="board-art-note">{copy.illustrations}</span>
            </p>
          </Section>
        </div>

        <aside
          className="board-sum"
          id="session"
          aria-live="polite"
          aria-label={copy.session}
        >
          <span className="board-sum-kicker">{copy.session}</span>
          <p className="board-sum-time">
            {runText ?? (waiting ? clock(waiting.startAt) : copy.pickStart)}
          </p>
          <p className="board-sum-meta">
            {current ? current.label.short : "—"}
            {zone ? ` · ${zone}` : ""}
          </p>

          {run && fixedCells === null ? (
            <div className="board-length" role="group" aria-label={copy.length}>
              <button
                type="button"
                aria-label={copy.shorter}
                disabled={run.to <= run.from}
                onClick={() => nudge(-1)}
              >
                <span aria-hidden="true">−</span>
              </button>
              <output aria-live="polite">{copy.duration(minutes)}</output>
              <button type="button" aria-label={copy.longer} onClick={() => nudge(1)}>
                <span aria-hidden="true">+</span>
              </button>
            </div>
          ) : (
            run && <p className="board-length-fixed">{copy.duration(minutes)}</p>
          )}
          {run && fixedCells === null && (
            <div className="board-quick" role="group" aria-label={copy.quickLengths}>
              {QUICK_LENGTHS.map((length) => (
                <button
                  key={length}
                  type="button"
                  aria-pressed={minutes === length}
                  onClick={() => nudge(run.from + length / QUARTER - 1 - run.to)}
                >
                  {copy.duration(length)}
                </button>
              ))}
            </div>
          )}

          <dl className="board-rows">
            <div>
              <dt>{copy.target}</dt>
              <dd>{target ? targetName(target, locale) : copy.anyTarget}</dd>
            </div>
            {(chosen ?? waiting) && (
              <div>
                <dt>{copy.forecast.label}</dt>
                <dd>
                  {(chosen ?? waiting)!.forecast.status === "KNOWN" &&
                  (chosen ?? waiting)!.forecast.cloudCoverPercent !== null
                    ? copy.forecast.cloud(
                        Math.round((chosen ?? waiting)!.forecast.cloudCoverPercent!),
                      )
                    : copy.forecast.unknown}
                </dd>
              </div>
            )}
          </dl>

          {chosen && held.has(chosen.startAt) && (
            <p className="board-caption">
              {copy.waitlist.yours(clock(held.get(chosen.startAt)!))}
            </p>
          )}
          {(arrival.kind === "clear" || arrival.kind === "free") &&
            run &&
            night === arrival.night &&
            arrival.run?.from === run.from &&
            arrival.run.to === run.to && (
              <p className="board-caption">
                {reschedule && arrival.kind === "clear"
                  ? copy.nextClear
                  : copy.picked(
                      arrival.kind === "clear",
                      copy.duration(firstCells * QUARTER),
                    )}
              </p>
            )}
          {waiting && <p className="board-caption">{copy.waitlist.taken}</p>}
          {stale && <p className="board-caption">{copy.stretchGone}</p>}
          {quoteFailed && <p className="board-caption">{copy.quoteFailed}</p>}
          {usable.length > 0 && (
            <Dropdown
              label={cards.board.label}
              value={prize?.id ?? ""}
              onChange={(event) => setPrizeId(event.target.value)}
              options={[
                { value: "", label: cards.board.none },
                ...usable.map((candidate) => ({
                  value: candidate.id,
                  label: cards.board.option(
                    cards.prize(candidate.kind, candidate),
                    longDate(new Date(candidate.expiresAt), locale),
                  ),
                })),
              ]}
            />
          )}
          {!reschedule && (
            <details className="board-gift" open={giftCode !== "" || undefined}>
              <summary>{gifts.label}</summary>
              <label className="field">
                <span className="field-label">{gifts.field}</span>
                <input
                  className="field-input data"
                  name="giftCode"
                  value={giftCode}
                  onChange={(event) => {
                    setGiftCode(event.target.value);
                    setFeedback(null);
                  }}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={40}
                />
                {gift && <span className="field-hint">{gifts.note}</span>}
              </label>
            </details>
          )}
          <div className="board-total">
            <span className="board-label">{copy.cost}</span>
            <strong>{cost}</strong>
            {chosen && prize?.kind === "DISCOUNT" && prize.percentOff && (
              <span>{cards.board.discount(prize.percentOff)}</span>
            )}
          </div>
          <button
            type="submit"
            className="button button-primary button-large board-book"
            disabled={(!ready && !waiting) || phase !== "idle"}
          >
            <span>{buttonLabel}</span>
          </button>
          <p className="board-caption">{reschedule ? replacing.note : reserve.note}</p>
          {notice && (
            <p className="board-caption board-notice" role="status">
              {notice}
            </p>
          )}
          {feedback && (
            <p className="booking-feedback" role="alert">
              {feedback}
            </p>
          )}
        </aside>
      </div>

      {run && (
        <a href="#session" className="board-bar" aria-label={copy.goToSession}>
          <span>{runText}</span>
          <b>{cost}</b>
          <span className="board-bar-go">
            {reschedule ? replacing.form.book : reserve.form.reserve}
          </span>
        </a>
      )}
    </form>
  );
}
