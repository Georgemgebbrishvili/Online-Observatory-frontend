"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";

export type GridCell = {
  startAt: string;
  /** open: can start or carry a session; taken: someone holds it (a waitlist may); off: past or closed. */
  state: "open" | "taken" | "off";
  /** The quarter hour's forecast cloud, when the platform has one. */
  cloud: number | null;
  /** The forecast worded, for its name. */
  forecast: string;
  /** Why it is not open, worded, for its name. */
  reason: string | null;
};

type TimeGridProps = {
  cells: GridCell[];
  /** The chosen run of quarter hours, by index, both ends included. */
  from: number | null;
  to: number | null;
  /** The cell a waitlist would be joined for. */
  waiting: number | null;
  /** The start is set and the next tap places the end. */
  pending: boolean;
  onCell: (index: number) => void;
  onDrag: (index: number) => void;
  /** HH:MM on the observatory's clock. */
  clock: (startAt: string) => string;
  /** The minute of the hour on the observatory's clock, 0–59. */
  minuteOf: (startAt: string) => number;
  label: string;
  cloudLabel: string;
};

/**
 * ADR-074: the night as quarter hours, an hour to a row. A tap sets the start, a later
 * tap the end; with a mouse the run can be dragged. One Tab stop: the arrow keys move
 * through the open cells, Enter or Space chooses.
 */
export function TimeGrid({
  cells,
  clock,
  cloudLabel,
  from,
  label,
  minuteOf,
  onCell,
  onDrag,
  pending,
  to,
  waiting,
}: TimeGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  // A mouse press acts on pointerdown, so its click must not act again.
  const pressed = useRef(false);

  useEffect(() => {
    const stop = () => {
      dragging.current = false;
    };
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);

  // One Tab stop: the start of the run, else the first cell that can be chosen.
  const usable = (cell: GridCell) => cell.state !== "off";
  const stop = from ?? waiting ?? cells.findIndex(usable);
  useEffect(() => {
    ref.current?.querySelectorAll<HTMLButtonElement>("[data-cell]").forEach((button) => {
      button.tabIndex = Number(button.dataset.cell) === stop ? 0 : -1;
    });
  });

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const at = Number((document.activeElement as HTMLElement | null)?.dataset.cell);
    if (Number.isNaN(at)) return;
    const step =
      event.key === "ArrowRight"
        ? 1
        : event.key === "ArrowLeft"
          ? -1
          : event.key === "ArrowDown"
            ? 4
            : event.key === "ArrowUp"
              ? -4
              : 0;
    if (!step) return;
    event.preventDefault();
    let next = at + step;
    while (next >= 0 && next < cells.length && !usable(cells[next]))
      next += Math.sign(step);
    if (next < 0 || next >= cells.length) return;
    ref.current?.querySelector<HTMLButtonElement>(`[data-cell="${next}"]`)?.focus();
  }

  // An hour to a row, each quarter in its own column, so 19:45 sits under :45.
  const rows: { hour: string; quarters: (number | null)[] }[] = [];
  cells.forEach((cell, index) => {
    const quarter = Math.floor(minuteOf(cell.startAt) / 15);
    const hour = clock(cell.startAt).slice(0, 2);
    const last = rows.at(-1);
    const prev = index > 0 ? cells[index - 1] : null;
    const sameHour =
      last &&
      last.hour === hour &&
      prev &&
      Date.parse(cell.startAt) - Date.parse(prev.startAt) < 60 * 60_000;
    if (!sameHour) rows.push({ hour, quarters: [null, null, null, null] });
    rows.at(-1)!.quarters[quarter] = index;
  });

  const inRun = (index: number) =>
    from !== null && to !== null && index >= from && index <= to;

  return (
    <div
      className={`time-grid${pending ? " is-pending" : ""}`}
      ref={ref}
      onKeyDown={onKeyDown}
      role="group"
      aria-label={label}
    >
      {rows.map((row, rowIndex) => {
        const clouds = row.quarters
          .map((index) => (index === null ? null : cells[index].cloud))
          .filter((cloud): cloud is number => cloud !== null);
        const cloud = clouds.length ? Math.round(Math.max(...clouds)) : null;
        return (
          <div className="time-row" key={`${row.hour}-${rowIndex}`}>
            <div className="time-cells">
              {row.quarters.map((index, quarter) => {
                if (index === null) {
                  return (
                    <span
                      key={quarter}
                      className="time-cell is-none"
                      aria-hidden="true"
                    />
                  );
                }
                const cell = cells[index];
                const start = clock(cell.startAt);
                const chosen = inRun(index);
                const classes = [
                  "time-cell",
                  `is-${cell.state}`,
                  chosen ? "is-in" : "",
                  index === from ? "is-from" : "",
                  index === to ? "is-to" : "",
                  index === waiting ? "is-waiting" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={quarter}
                    type="button"
                    data-cell={index}
                    className={classes}
                    disabled={cell.state === "off"}
                    aria-pressed={chosen || index === waiting}
                    aria-label={`${start}${cell.reason ? `, ${cell.reason}` : ""}, ${cloudLabel}: ${cell.forecast}`}
                    title={cell.reason ?? undefined}
                    onPointerDown={(event) => {
                      if (event.pointerType !== "mouse" || event.button !== 0) return;
                      pressed.current = true;
                      dragging.current = cell.state === "open";
                      onCell(index);
                    }}
                    onPointerEnter={() => {
                      if (dragging.current) onDrag(index);
                    }}
                    onClick={() => {
                      if (pressed.current) {
                        pressed.current = false;
                        return;
                      }
                      onCell(index);
                    }}
                  >
                    <time dateTime={cell.startAt}>{start}</time>
                  </button>
                );
              })}
            </div>
            <span className="time-cloud" aria-hidden="true">
              {cloud !== null ? `${cloud}%` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
