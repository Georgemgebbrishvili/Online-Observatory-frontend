"use client";

import { useEffect, useRef, useState } from "react";
import type { Axis } from "@/lib/observatory-sim/mount-drive";
import { useCopy } from "./copy-context";

/** What the hand controller shows and drives: the mount's own buttons, the hub's faceplate (ADR-083). */
export type HcProps = {
  /** The LCD's two lines, 16 characters each. */
  lcd: [string, string];
  enabled: boolean;
  onPress: (a: Axis, d: 1 | -1) => void;
  onRelease: (a: Axis) => void;
  rate: number;
  onRate: ((v: number) => void) | null;
  onAlign: (() => void) | null;
  onEnter: (() => void) | null;
  onBack: (() => void) | null;
  onMenu: (() => void) | null;
  /** What IDENTIFY and OBJECT INFO print. */
  identify: string;
  info: string;
  onFilter: (f: "planet" | "star" | "deep") => void;
  onFocusTab: () => void;
  onTour: () => void;
};

const ARROW = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 15l6-6 6 6" />
  </svg>
);
const fit = (s: string) => s.slice(0, 16).padEnd(16, " ");

export default function HandController(p: HcProps) {
  const t = useCopy();
  const k = t.hub.hc.keys;
  const [msg, setMsg] = useState<[string, string] | null>(null);
  const [rateMode, setRateMode] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flash = (a: string, b: string) => {
    setMsg([a, b]);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3000);
  };
  const digit = (n: number) => {
    if (rateMode) {
      setRateMode(false);
      if (n >= 1 && p.onRate) {
        p.onRate(n);
        flash(t.hub.hc.rateSet(n), "");
      }
      return;
    }
    if (n === 1) p.onFilter("planet");
    else if (n === 2) p.onFilter("star");
    else if (n === 3) p.onFilter("deep");
    else if (n === 4) flash("Identify", p.identify);
    else if (n === 5) p.onFocusTab();
    else if (n === 6) p.onMenu?.();
    else if (n === 7) {
      setRateMode(true);
      setMsg([t.hub.hc.ratePrompt, `Now ${p.rate}`]);
    } else if (n === 8) flash("Object info", p.info);
    else if (n === 9) p.onTour();
    else flash("Arrows: slew", "7 + 1-9: rate");
  };
  const lines = msg ?? p.lcd;

  const dir = (axis: Axis, d: 1 | -1, cls: string, label: string) => (
    <button
      type="button"
      className={`hc-k hc-dir ${cls}`}
      aria-label={label}
      disabled={!p.enabled}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* a synthetic pointer has no capture to take */
        }
        p.onPress(axis, d);
      }}
      onPointerUp={() => p.onRelease(axis)}
      onPointerCancel={() => p.onRelease(axis)}
      onLostPointerCapture={() => p.onRelease(axis)}
    >
      {ARROW}
    </button>
  );
  const pad: Array<[number, string]> = [
    [1, k.solar],
    [2, k.stars],
    [3, k.deep],
    [4, k.identify],
    [5, k.focuser],
    [6, k.menu],
    [7, k.speed],
    [8, k.info],
    [9, k.tour],
  ];

  return (
    <div className="hc hc-wide" role="group" aria-label={t.hand.title}>
      <div className="hc-face">
        <div className="hc-brand">{t.hub.hc.brand}</div>
        <div className="hc-lcd">
          <div className="hc-scr" aria-live="polite">
            {lines.map((l, i) => (
              <div key={i} className="hc-row">
                {fit(l)
                  .split("")
                  .map((c, j) => (
                    <i key={j}>{c}</i>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hc-nav">
        <button
          type="button"
          className="hc-k hc-fn"
          onClick={() => p.onAlign?.()}
          disabled={!p.onAlign}
        >
          {k.align}
        </button>
        {dir("alt", 1, "hc-u", t.hand.up)}
        <button
          type="button"
          className="hc-k hc-fn hc-opt"
          aria-label={k.option}
          onClick={() => p.onMenu?.()}
          disabled={!p.onMenu}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="7" />
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        {dir("az", -1, "hc-l", t.hand.west)}
        <span className="hc-hub" />
        {dir("az", 1, "hc-r", t.hand.east)}
        <button
          type="button"
          className="hc-k hc-fn"
          onClick={() => {
            setRateMode(false);
            setMsg(null);
            p.onBack?.();
          }}
        >
          {k.back}
        </button>
        {dir("alt", -1, "hc-d", t.hand.down)}
        <button
          type="button"
          className="hc-k hc-fn hc-enter"
          onClick={() => p.onEnter?.()}
          disabled={!p.onEnter}
        >
          {k.enter}
        </button>
      </div>
      <div className="hc-pad">
        {pad.map(([n, label]) => (
          <button key={n} type="button" className="hc-k hc-num" onClick={() => digit(n)}>
            <i>{n}</i>
            <span>{label}</span>
          </button>
        ))}
        <button
          type="button"
          className="hc-k hc-scroll"
          aria-label={`${t.hand.slewRate}: ${t.camera.more}`}
          onClick={() => p.onRate?.(p.rate + 1)}
          disabled={!p.onRate}
        >
          {ARROW}
        </button>
        <button type="button" className="hc-k hc-num" onClick={() => digit(0)}>
          <i>0</i>
          <span>{k.help}</span>
        </button>
        <button
          type="button"
          className="hc-k hc-scroll hc-sdown"
          aria-label={`${t.hand.slewRate}: ${t.camera.less}`}
          onClick={() => p.onRate?.(p.rate - 1)}
          disabled={!p.onRate}
        >
          {ARROW}
        </button>
      </div>
    </div>
  );
}
