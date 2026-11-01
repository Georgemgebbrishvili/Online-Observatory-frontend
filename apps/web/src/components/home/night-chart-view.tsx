"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

import { MoonGlyph } from "@/components/booking/moon-glyph";
import { ButtonLink } from "@/components/ui/button";
import type { SkyBody } from "@/features/sky/tonight-sky";

export type NightChartModel = {
  start: number;
  end: number;
  sunset: string;
  sunrise: string;
  /** Percent along the night, sunset 0 to sunrise 100. */
  ticks: { at: number; label: string }[];
  objects: {
    body: SkyBody;
    name: string;
    from: number;
    to: number;
    best: number;
    bestLabel: string;
    upLabel: string;
    altitude: string;
    look: string;
    tag: string;
    lit?: number;
    waxing?: boolean;
    book: { href: string; label: string } | null;
  }[];
  /** The row shown first: the one standing highest tonight. */
  first: number;
  slots: { at: number; href: string; label: string; price: string }[];
  /** Stretches of back-to-back open times, as percent along the night. */
  open: { from: number; to: number }[];
};

type Copy = {
  chart: string;
  open: string;
  now: string;
  stat: { best: string; high: string; up: string; look: string };
};

const chipsShown = 4;

function Orb({ o, big = false }: { o: NightChartModel["objects"][number]; big?: boolean }) {
  return (
    <span className={big ? "night-orb night-orb-big" : "night-orb"} aria-hidden="true">
      {o.body === "Moon" && <MoonGlyph lit={o.lit ?? 0} waxing={o.waxing ?? true} />}
    </span>
  );
}

/** The chart's rows, its open-time lane and the readout of the chosen object. */
export function NightChartView({ copy, model }: { copy: Copy; model: NightChartModel }) {
  const [active, setActive] = useState(model.first);
  const [slot, setSlot] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // "Now" only in the browser, so the server's page stays the same for everyone.
  useEffect(() => {
    const place = () => {
      const t = Date.now();
      setNow(
        t > model.start && t < model.end
          ? ((t - model.start) / (model.end - model.start)) * 100
          : null,
      );
    };
    place();
    const timer = window.setInterval(place, 60_000);
    return () => window.clearInterval(timer);
  }, [model.start, model.end]);

  const o = model.objects[active];
  // Hours too near the ends, or under the "now" tag, step aside.
  const ticks = model.ticks.filter(
    (tick) => tick.at > 5 && tick.at < 95 && (now === null || Math.abs(tick.at - now) > 2.5),
  );

  return (
    <div className="night">
      <div className="night-panel">
        <div
          className="night-plot"
          role="group"
          aria-label={copy.chart}
          style={now === null ? undefined : ({ "--now": now } as CSSProperties)}
        >
          <div className="night-axis" aria-hidden="true">
            <span className="night-axis-track">
              {(now === null || now > 15) && (
                <span className="night-end" data-end="start">
                  {model.sunset}
                </span>
              )}
              {ticks.map((tick, index) => (
                <span
                  key={tick.at}
                  className="night-tick"
                  data-minor={index % 2 === 1 || undefined}
                  style={{ "--at": tick.at } as CSSProperties}
                >
                  {tick.label}
                </span>
              ))}
              {(now === null || now < 85) && (
                <span className="night-end" data-end="end">
                  {model.sunrise}
                </span>
              )}
            </span>
          </div>

          <div className="night-grid" aria-hidden="true">
            {ticks.map((tick, index) => (
              <span
                key={tick.at}
                data-minor={index % 2 === 1 || undefined}
                style={{ "--at": tick.at } as CSSProperties}
              />
            ))}
          </div>

          <ul className="night-rows">
            {model.objects.map((item, index) => (
              <li key={item.body}>
                <button
                  type="button"
                  className="night-row"
                  data-body={item.body}
                  aria-pressed={index === active}
                  onClick={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setActive(index);
                  }}
                  style={
                    {
                      "--from": item.from,
                      "--to": item.to,
                      "--peak":
                        item.to > item.from
                          ? ((item.best - item.from) / (item.to - item.from)) * 100
                          : 50,
                      "--best": item.best,
                    } as CSSProperties
                  }
                >
                  <span className="night-name">
                    <Orb o={item} />
                    {item.name}
                  </span>
                  <span className="night-track">
                    <span className="night-bar" />
                    <span className="night-peak" />
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {model.slots.length > 0 && (
            <div className="night-lane" aria-hidden="true">
              <span className="night-lane-label">{copy.open}</span>
              <span className="night-track">
                {model.open.map((item) => (
                  <span
                    key={item.from}
                    className="night-open"
                    style={{ "--from": item.from, "--to": item.to } as CSSProperties}
                  />
                ))}
                {slot !== null && (
                  <span
                    className="night-pin"
                    style={{ "--at": model.slots[slot].at } as CSSProperties}
                  />
                )}
              </span>
            </div>
          )}

          {now !== null && (
            <span className="night-now" aria-hidden="true">
              <span>{copy.now}</span>
            </span>
          )}
        </div>

        {model.slots.length > 0 && (
          <ul className="night-chips" aria-label={copy.open}>
            {model.slots.slice(0, chipsShown).map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onPointerEnter={() => setSlot(index)}
                  onPointerLeave={() => setSlot(null)}
                  onFocus={() => setSlot(index)}
                  onBlur={() => setSlot(null)}
                >
                  <time>{item.label}</time>
                  <span>{item.price}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="night-readout" data-body={o.body} aria-live="polite">
        <div className="night-readout-head" key={o.body}>
          <Orb o={o} big />
          <div>
            <h3>{o.name}</h3>
            <span className="night-tag">{o.tag}</span>
          </div>
        </div>
        <dl className="night-stats">
          <div>
            <dt>{copy.stat.best}</dt>
            <dd>{o.bestLabel}</dd>
          </div>
          <div>
            <dt>{copy.stat.high}</dt>
            <dd>
              {o.altitude}
            </dd>
          </div>
          <div>
            <dt>{copy.stat.look}</dt>
            <dd>{o.look}</dd>
          </div>
          <div>
            <dt>{copy.stat.up}</dt>
            <dd>{o.upLabel}</dd>
          </div>
        </dl>
        {o.book && (
          <ButtonLink href={o.book.href} className="night-book">
            {o.book.label}
          </ButtonLink>
        )}
      </aside>
    </div>
  );
}
