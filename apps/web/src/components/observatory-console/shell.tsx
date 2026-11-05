"use client";

import { useState, type ReactNode, type RefObject } from "react";
import type { ConsoleCopy } from "./copy";
import { CopyProvider } from "./copy-context";
import { ROIS } from "@/lib/observatory-sim/camera";
import { TRAINS } from "@/lib/observatory-sim/optics";
import type { Frame } from "./dialogs";
import HandController, { type HcProps } from "./hand-controller";
import Icon, { type IconName } from "./icons";
import {
  Camera,
  FrameThumbs,
  HandControl,
  Pointing,
  type CameraProps,
  type HandProps,
  type PointingProps,
} from "./panels";
import { plateArt } from "./plates";
import ViewStage, { type ViewStageProps } from "./ViewStage";

export type Action = {
  label: string;
  run: () => void;
  disabled?: boolean;
  icon?: "camera";
};

export type DeviceRow = {
  key: "mount" | "camera" | "focuser";
  label: string;
  text: string;
  on: boolean;
};
export type HubKind = "planet" | "moon" | "star" | "deep";
export type HubTarget = {
  id: string;
  name: string;
  sub: string;
  kind: HubKind;
  altitude: number;
  up: boolean;
  /** Typed in by RA and Dec on the Custom tab. */
  custom?: boolean;
};
type Filter = "planet" | "star" | "deep" | "custom" | "all";
type Tab = "mount" | "align" | "focus" | "capture" | "setup" | "log";

/** Everything the console draws, decided by whichever instrument drives it: the Observatory Hub's cockpit (ADR-083). */
export type ShellProps = {
  t: ConsoleCopy;
  mounted: boolean;
  night: boolean;
  onNight: () => void;
  simulated: boolean;
  observatoryName: string;
  clock: { local: string; lst: string };
  devices: DeviceRow[];
  onPark: (() => void) | null;
  onStopAll: (() => void) | null;
  tonight: {
    rows: [string, string][];
    chip: string;
    bar: { dark: [number, number]; now: number } | null;
  };
  targets: {
    list: HubTarget[];
    best: HubTarget[];
    up: number;
    selectedId: string | null;
    onSelect: (id: string) => void;
    /** Adds a target by RA and Dec text; false when either does not parse. Null: not offered. */
    onCustom: ((ra: string, dec: string) => boolean) | null;
    locked: boolean;
  };
  /** Tonight's sky with the showpieces, each one press from the live view. */
  dome: ReactNode;
  stage: Omit<ViewStageProps, "viewRef" | "look"> & {
    viewRef: RefObject<HTMLDivElement | null>;
  };
  rails: {
    onAutoExp: (() => void) | null;
    onFocus: (() => void) | null;
    focusing: boolean;
    onPng: (() => void) | null;
  };
  autopilot: {
    name: string | null;
    sub: string | null;
    plate: string | null;
    rows: [string, string][];
    go: Action;
    busy: boolean;
    /** The step under way, 0–4, or -1; the steps before `done` are done. */
    pipe: { now: number; done: number };
    readout: [string, string][];
    log: string[];
    links: Action[];
    after: string[];
    note: string | null;
  };
  pointing: PointingProps;
  camera: CameraProps & {
    stats: [string, string][];
    capture: Action | null;
    progress: { title: string; count: string; frac: number };
  };
  hand: HandProps;
  hc: Omit<HcProps, "onFilter" | "onFocusTab" | "onTour">;
  align: {
    done: number;
    points: string[];
    onWhere: (() => void) | null;
    onSync: (() => void) | null;
    onClear: (() => void) | null;
  };
  focuser: {
    rows: [string, string][];
    onIn: (() => void) | null;
    onOut: (() => void) | null;
    onRun: (() => void) | null;
    running: boolean;
    curve: number[];
  };
  setup: ReactNode;
  log: string[];
  frames: Frame[];
  onOpenFrame: (f: Frame) => void;
  modals: ReactNode;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const PLANET_TINT: Record<string, string> = {
  mercury: "#b9b3a8",
  venus: "#f3e3b4",
  mars: "#e0764a",
  jupiter: "#e6c79c",
  saturn: "#e9d39a",
  uranus: "#9fe0e6",
  neptune: "#6f8cff",
};

/** The hub's drawn target icons, in natural colours. */
function KindIcon({ kind, id, size = 34 }: { kind: HubKind; id: string; size?: number }) {
  if (kind === "planet") {
    const c = PLANET_TINT[id] ?? "#e6c79c";
    return (
      <svg
        className="oh-pic"
        width={size}
        height={size}
        viewBox="0 0 34 34"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`pg-${id}`} cx="35%" cy="32%" r="75%">
            <stop offset="0" stopColor="#fff" stopOpacity=".85" />
            <stop offset=".35" stopColor={c} />
            <stop offset="1" stopColor="#1a1a22" />
          </radialGradient>
        </defs>
        <circle cx="17" cy="17" r="9" fill={`url(#pg-${id})`} />
        {id === "saturn" && (
          <ellipse
            cx="17"
            cy="17"
            rx="15"
            ry="4.4"
            transform="rotate(-18 17 17)"
            fill="none"
            stroke="#d9c48c"
            strokeWidth="1.6"
          />
        )}
      </svg>
    );
  }
  if (kind === "moon") {
    return (
      <svg
        className="oh-pic"
        width={size}
        height={size}
        viewBox="0 0 34 34"
        aria-hidden="true"
      >
        <circle cx="17" cy="17" r="10" fill="#d8d9de" />
        <circle cx="13" cy="14" r="2" fill="#b5b7bf" />
        <circle cx="20" cy="20" r="2.6" fill="#b5b7bf" />
        <circle cx="21" cy="12" r="1.3" fill="#b5b7bf" />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg
        className="oh-pic"
        width={size}
        height={size}
        viewBox="0 0 34 34"
        aria-hidden="true"
      >
        <path
          d="M17 4c1 8 5 12 13 13-8 1-12 5-13 13-1-8-5-12-13-13 8-1 12-5 13-13z"
          fill="#f4f7ff"
        />
      </svg>
    );
  }
  return (
    <svg
      className="oh-pic"
      width={size}
      height={size}
      viewBox="0 0 34 34"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`dg-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".25" stopColor="#c9b6ff" stopOpacity=".7" />
          <stop offset="1" stopColor="#5b6cff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="17"
        cy="17"
        rx="14"
        ry="7"
        transform="rotate(-28 17 17)"
        fill={`url(#dg-${id})`}
      />
    </svg>
  );
}

function Card({
  icon,
  title,
  chip,
  chipOk,
  className,
  children,
  id,
  label,
}: {
  icon: IconName;
  title: string;
  chip?: string | null;
  chipOk?: boolean;
  className?: string;
  children: ReactNode;
  id?: string;
  label?: string;
}) {
  return (
    <section
      className={`oh-card${className ? ` ${className}` : ""}`}
      aria-label={label ?? title}
      id={id}
    >
      <h2 className="oh-h2">
        <span className="oh-hi">
          <Icon name={icon} size={20} />
        </span>
        <span>{title}</span>
        {chip && (
          <small
            className={
              chipOk === undefined ? undefined : `oh-chipst${chipOk ? " is-ok" : ""}`
            }
          >
            {chip}
          </small>
        )}
      </h2>
      {children}
    </section>
  );
}

function Targets({
  t,
  p,
  filter,
  setFilter,
}: {
  t: ConsoleCopy;
  p: ShellProps["targets"];
  filter: Filter;
  setFilter: (f: Filter) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const rows = p.list.filter((x) =>
    query
      ? `${x.name} ${x.sub}`.toLowerCase().includes(query)
      : filter === "all" ||
        (filter === "custom"
          ? !!x.custom
          : !x.custom &&
            (filter === "planet"
              ? x.kind === "planet" || x.kind === "moon"
              : x.kind === filter)),
  );
  const filters: Filter[] = p.onCustom
    ? ["planet", "star", "deep", "custom", "all"]
    : ["planet", "star", "deep", "all"];
  const [ra, setRa] = useState("");
  const [dec, setDec] = useState("");
  const [bad, setBad] = useState(false);
  return (
    <Card
      icon="rings"
      title={t.hub.targets.title}
      chip={t.hub.targets.up(p.up)}
      className="oh-tgcard"
    >
      {p.best.length > 0 && (
        <>
          <h3 className="oh-h3" style={{ marginTop: 0 }}>
            {t.hub.targets.best}
          </h3>
          <div className="oh-best">
            {p.best.map((b) => (
              <button
                key={b.id}
                type="button"
                className={b.id === p.selectedId ? "is-on" : ""}
                aria-pressed={b.id === p.selectedId}
                disabled={p.locked}
                onClick={() => p.onSelect(b.id)}
              >
                <KindIcon kind={b.kind} id={b.id} size={52} />
                {b.name}
                <small>
                  {b.sub} · {Math.round(b.altitude)}°
                </small>
              </button>
            ))}
          </div>
        </>
      )}
      <input
        className="oh-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.hub.targets.search}
        aria-label={t.hub.targets.search}
        disabled={p.locked}
      />
      <div className="oh-tabs" role="group" aria-label={t.hub.targets.title}>
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className={!query && filter === f ? "is-on" : ""}
            aria-pressed={!query && filter === f}
            onClick={() => {
              setQ("");
              setFilter(f);
            }}
          >
            {t.hub.targets.filters[f]}
          </button>
        ))}
      </div>
      {filter === "custom" && !query && p.onCustom && (
        <form
          className="oh-custom"
          aria-label={t.hub.targets.customForm}
          onSubmit={(e) => {
            e.preventDefault();
            setBad(!p.onCustom?.(ra, dec));
          }}
        >
          <label className="oh-field">
            {t.hub.targets.ra}
            <input className="oh-search" value={ra} onChange={(e) => setRa(e.target.value)} placeholder="19:30:43" aria-invalid={bad || undefined} />
          </label>
          <label className="oh-field">
            {t.hub.targets.dec}
            <input className="oh-search" value={dec} onChange={(e) => setDec(e.target.value)} placeholder="+27:57:35" aria-invalid={bad || undefined} />
          </label>
          <button type="submit" className="oh-btn">{t.hub.targets.add}</button>
          {bad && <p className="oh-hint" role="alert">{t.hub.targets.invalid}</p>}
        </form>
      )}
      <div className="oh-list">
        {rows.length === 0 && filter !== "custom" && <p className="oh-hint">{t.hub.targets.none}</p>}
        {rows.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`oh-row${r.id === p.selectedId ? " is-sel" : ""}${r.up ? "" : " is-below"}`}
            aria-pressed={r.id === p.selectedId}
            disabled={p.locked}
            onClick={() => p.onSelect(r.id)}
          >
            <KindIcon kind={r.kind} id={r.id} />
            <span className="oh-row__nm">
              {r.name}
              <em>{r.sub}</em>
            </span>
            <span className="oh-row__meta">
              {r.altitude > 0 ? `alt ${Math.round(r.altitude)}°` : t.hub.targets.below}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function RailButton({
  icon,
  label,
  on,
  onClick,
  disabled,
}: {
  icon: IconName;
  label: string;
  on?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={on ? "is-on" : ""}
      aria-pressed={on}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </button>
  );
}

export function ConsoleShell(p: ShellProps) {
  const { t } = p;
  const [tab, setTab] = useState<Tab>("mount");
  const [filter, setFilter] = useState<Filter>("planet");
  const [look, setLook] = useState({
    grid: false,
    invert: false,
    mirror: false,
    flip: false,
  });
  const [phone, setPhone] = useState<"live" | "targets" | "controls">("live");
  const ap = p.autopilot;
  const tabs: Tab[] = ["mount", "align", "focus", "capture", "setup", "log"];
  const tour = () => {
    const i = p.targets.best.findIndex((b) => b.id === p.targets.selectedId);
    const next = p.targets.best[(i + 1) % Math.max(1, p.targets.best.length)];
    if (next) p.targets.onSelect(next.id);
  };

  return (
    <CopyProvider value={t}>
      <div
        className={`sdo oh${p.night ? " is-night" : ""}`}
        data-phone={phone}
        aria-busy={p.mounted ? undefined : true}
      >
        <div className="oh-head">
          <div className="oh-banner" aria-hidden="true">
            <svg viewBox="0 0 1600 80" preserveAspectRatio="xMidYMax slice">
              <g fill="#dfe8ff">
                {[
                  [483, 21, 0.6],
                  [40, 27, 1],
                  [454, 35, 1],
                  [439, 3, 1],
                  [396, 12, 1],
                  [1240, 23, 1.3],
                  [364, 17, 1.3],
                  [597, 38, 1],
                  [847, 29, 1],
                  [924, 12, 0.8],
                  [947, 42, 1],
                  [1435, 23, 0.8],
                  [136, 28, 0.8],
                  [565, 13, 1],
                  [1529, 39, 1],
                  [678, 13, 1],
                  [600, 41, 0.8],
                  [744, 4, 1.3],
                  [899, 15, 1.3],
                  [1118, 33, 0.8],
                  [72, 9, 1],
                  [1334, 14, 1.3],
                  [495, 30, 1.3],
                  [75, 16, 1.3],
                  [1581, 16, 1.3],
                  [1157, 9, 1.3],
                  [606, 44, 1.3],
                  [860, 35, 0.8],
                  [1366, 5, 0.8],
                  [1165, 32, 1.3],
                  [413, 12, 1],
                  [780, 15, 1],
                  [1049, 29, 1.3],
                  [1066, 17, 1.3],
                  [1385, 5, 1],
                  [1163, 21, 1.3],
                  [1355, 23, 0.8],
                ].map(([x, y, r], i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={r}
                    opacity={i % 3 === 0 ? 0.9 : i % 3 === 1 ? 0.5 : 0.7}
                  />
                ))}
              </g>
              <path
                d="M0 80V58l70-14 60 10 90-24 80 20 70-12 110 22 90-30 100 26 80-10 120 18 90-26 110 24 80-8 120 20 90-18 110 16 70-6V80z"
                fill="#22306a"
                opacity=".9"
              />
              <path
                d="M0 80V66l120-10 100 12 140-16 120 14 160-8 130 10 150-14 140 12 120-6 160 10 160-12V80z"
                fill="#111a42"
              />
              <g transform="translate(860 34) scale(.62)">
                <rect x="6" y="40" width="68" height="24" fill="#1a2550" />
                <path d="M4 41a36 34 0 0 1 72 0z" fill="#c8d4f0" />
                <rect x="34" y="8" width="11" height="33" fill="#ffd27a" opacity=".9" />
                <rect x="18" y="48" width="8" height="10" fill="#ffd27a" opacity=".8" />
                <rect x="52" y="48" width="8" height="10" fill="#ffd27a" opacity=".55" />
              </g>
            </svg>
          </div>
          <div className="oh-brand">
            <span className="oh-logo" aria-hidden="true">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="9" fill="url(#oh-lg)" stroke="none" />
                <ellipse
                  cx="20"
                  cy="20"
                  rx="18"
                  ry="6.5"
                  transform="rotate(-18 20 20)"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <defs>
                  <radialGradient id="oh-lg" cx="35%" cy="30%" r="80%">
                    <stop offset="0" stopColor="#e8eeff" />
                    <stop offset="1" stopColor="#3b6ef6" />
                  </radialGradient>
                </defs>
              </svg>
            </span>
            <span className="oh-bt">
              <b>{p.observatoryName}</b>
              <small>{t.hub.brand}</small>
            </span>
          </div>
          {p.simulated ? (
            <span className="oh-badge" title={t.simulatedLong}>
              {t.simulated}
            </span>
          ) : (
            <span className="oh-badge is-live">{t.live}</span>
          )}
          {p.devices.map((d) => (
            <div key={d.key} className={`oh-dev oh-dev--${d.key}`}>
              <span className="oh-di">
                <Icon
                  name={
                    d.key === "mount"
                      ? "mount"
                      : d.key === "camera"
                        ? "camera"
                        : "focuser"
                  }
                  size={19}
                />
                <span className={`oh-dot${d.on ? " is-on" : ""}`} />
              </span>
              <div>
                <b>{d.label}</b>
                <small>{d.text}</small>
              </div>
            </div>
          ))}
          <div className="oh-sp" />
          <div className="oh-clock sdo-mono" aria-label={t.utc}>
            {p.clock.local}
            {"\n"}
            {t.hub.lst} {p.clock.lst}
          </div>
          <div className="oh-hacts">
            <button
              className={`oh-hbtn oh-tog${p.night ? " is-on" : ""}`}
              type="button"
              onClick={p.onNight}
              aria-pressed={p.night}
              aria-label={t.nightMode}
              title={t.nightMode}
            >
              <Icon name="moon" size={19} />
              {t.hub.night}
              <i className="oh-sw" />
            </button>
            <button
              className="oh-hbtn oh-park"
              type="button"
              onClick={() => p.onPark?.()}
              disabled={!p.onPark}
            >
              <Icon name="parkP" size={19} />
              {t.hub.park}
            </button>
          </div>
          <button
            className="oh-estop"
            type="button"
            onClick={() => p.onStopAll?.()}
            disabled={!p.onStopAll}
          >
            <i />
            {t.hub.stopAll}
          </button>
        </div>

        <main id="main-content" className="oh-main">
          <h1 className="sdo-sr">
            {t.observatory} — {p.observatoryName}
          </h1>
          <div className="oh-col oh-left">
            <Card
              icon="moon"
              title={t.hub.tonight.title}
              chip={p.tonight.chip}
              className="oh-tncard"
              label={t.hub.tonight.title}
            >
              <div className="oh-tn">
                {p.tonight.rows.map(([k, v]) => (
                  <div key={k}>
                    <small>{k}</small>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              {p.tonight.bar && (
                <div className="oh-darkbar" aria-hidden="true">
                  <i style={{ left: 0, width: `${p.tonight.bar.dark[0] * 100}%` }} />
                  <i style={{ left: `${p.tonight.bar.dark[1] * 100}%`, right: 0 }} />
                  <b style={{ left: `calc(${p.tonight.bar.now * 100}% - 5px)` }} />
                </div>
              )}
            </Card>
            <Targets t={t} p={p.targets} filter={filter} setFilter={setFilter} />
            {p.dome && <div className="oh-skycard">{p.dome}</div>}
          </div>

          <div className="oh-center">
            <section className="oh-stage" aria-label={t.stage.aria}>
              <div className="oh-rail" role="toolbar" aria-label={t.hub.view}>
                <h4>{t.hub.view}</h4>
                <RailButton
                  icon="target"
                  label={t.hub.reticle}
                  on={p.stage.reticle}
                  onClick={p.stage.onReticle}
                />
                <RailButton
                  icon="grid"
                  label={t.hub.grid}
                  on={look.grid}
                  onClick={() => setLook((l) => ({ ...l, grid: !l.grid }))}
                />
                <RailButton
                  icon="moon"
                  label={t.hub.invert}
                  on={look.invert}
                  onClick={() => setLook((l) => ({ ...l, invert: !l.invert }))}
                />
                <RailButton
                  icon="left"
                  label={t.hub.mirror}
                  on={look.mirror}
                  onClick={() => setLook((l) => ({ ...l, mirror: !l.mirror }))}
                />
                <RailButton
                  icon="up"
                  label={t.hub.flip}
                  on={look.flip}
                  onClick={() => setLook((l) => ({ ...l, flip: !l.flip }))}
                />
                <RailButton
                  icon="expand"
                  label={t.hub.full}
                  on={p.stage.full}
                  onClick={p.stage.onFull}
                />
              </div>
              <ViewStage {...p.stage} look={look} />
              <div className="oh-rail" role="toolbar" aria-label={t.hub.mode}>
                <h4>{t.hub.optics}</h4>
                <div className="oh-seg" role="group" aria-label={t.stage.train}>
                  {TRAINS.map((tr) => (
                    <button
                      key={tr.id}
                      type="button"
                      className={p.stage.train === tr.id ? "is-on" : ""}
                      aria-pressed={p.stage.train === tr.id}
                      title={tr.label}
                      disabled={!p.stage.onTrain}
                      onClick={() => p.stage.onTrain?.(tr.id)}
                    >
                      {tr.short}
                    </button>
                  ))}
                </div>
                <h4>{t.hub.roi}</h4>
                <div className="oh-seg" role="group" aria-label={t.stage.roi}>
                  {ROIS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={p.stage.roi === r.id ? "is-on" : ""}
                      aria-pressed={p.stage.roi === r.id}
                      title={r.label}
                      disabled={!p.stage.onRoi}
                      onClick={() => p.stage.onRoi?.(r.id)}
                    >
                      {r.id === "full" ? "Full" : r.id}
                    </button>
                  ))}
                </div>
                <h4>{t.hub.auto}</h4>
                <div className="oh-auto">
                  <RailButton
                    icon="sun"
                    label={t.hub.autoExp}
                    onClick={() => p.rails.onAutoExp?.()}
                    disabled={!p.rails.onAutoExp}
                  />
                  <RailButton
                    icon="focuser"
                    label={t.hub.focus}
                    on={p.rails.focusing}
                    onClick={() => p.rails.onFocus?.()}
                    disabled={!p.rails.onFocus || p.rails.focusing}
                  />
                </div>
                <h4>{t.hub.export}</h4>
                <RailButton
                  icon="download"
                  label={t.hub.png}
                  onClick={() => p.rails.onPng?.()}
                  disabled={!p.rails.onPng}
                />
              </div>
            </section>

            <section className="oh-card oh-ctrl" aria-label={t.hub.controls}>
              <div
                className="oh-tabs oh-rtabs"
                role="tablist"
                aria-label={t.hub.controls}
              >
                {tabs.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={tab === k}
                    className={tab === k ? "is-on" : ""}
                    onClick={() => setTab(k)}
                  >
                    {t.hub.tabs[k]}
                  </button>
                ))}
              </div>
              {tab === "mount" && (
                <div className="oh-pane oh-pane--mount" role="tabpanel">
                  <HandController
                    {...p.hc}
                    onFilter={setFilter}
                    onFocusTab={() => setTab("focus")}
                    onTour={tour}
                  />
                  <HandControl {...p.hand} />
                </div>
              )}
              {tab === "align" && (
                <div className="oh-pane oh-pane--cols" role="tabpanel">
                  <ol className="oh-steps">
                    {t.hub.align.steps.map((s, i) => (
                      <li key={s} className={i < p.align.done ? "is-done" : ""}>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <div>
                    <h3 className="oh-h3" style={{ marginTop: 0 }}>
                      {t.hub.align.points}
                    </h3>
                    <div className="oh-chips">
                      {p.align.points.length ? (
                        p.align.points.map((c) => (
                          <span key={c} className="oh-chip">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="oh-hint">{t.hub.align.none}</span>
                      )}
                    </div>
                    <div className="oh-btns">
                      <button
                        type="button"
                        className="oh-btn oh-btn--pri"
                        onClick={() => p.align.onWhere?.()}
                        disabled={!p.align.onWhere}
                      >
                        {t.hub.autopilot.whereAmI}
                      </button>
                      <button
                        type="button"
                        className="oh-btn"
                        onClick={() => p.align.onSync?.()}
                        disabled={!p.align.onSync}
                      >
                        {t.hub.autopilot.sync}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="oh-btn oh-btn--ghost"
                      style={{ width: "100%", marginTop: 8 }}
                      onClick={() => p.align.onClear?.()}
                      disabled={!p.align.onClear}
                    >
                      {t.hub.align.clear}
                    </button>
                  </div>
                </div>
              )}
              {tab === "focus" && (
                <div
                  className="oh-pane oh-pane--cols"
                  role="tabpanel"
                  aria-label={t.hub.focuser.title}
                >
                  <div>
                    <div className="oh-metric">
                      {p.focuser.rows.map(([k, v]) => (
                        <div key={k}>
                          <small>{k}</small>
                          <b>{v}</b>
                        </div>
                      ))}
                    </div>
                    <div className="oh-btns">
                      <button
                        type="button"
                        className="oh-btn"
                        aria-label={t.hand.focusIn}
                        onClick={() => p.focuser.onIn?.()}
                        disabled={!p.focuser.onIn || p.focuser.running}
                      >
                        <Icon name="minus" size={16} /> {t.hub.focuser.in}
                      </button>
                      <button
                        type="button"
                        className="oh-btn"
                        aria-label={t.hand.focusOut}
                        onClick={() => p.focuser.onOut?.()}
                        disabled={!p.focuser.onOut || p.focuser.running}
                      >
                        <Icon name="plus" size={16} /> {t.hub.focuser.out}
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="oh-h3" style={{ marginTop: 0 }}>
                      {t.hub.focuser.curve}
                    </h3>
                    <button
                      type="button"
                      className="oh-btn oh-btn--pri"
                      style={{ width: "100%" }}
                      onClick={() => p.focuser.onRun?.()}
                      disabled={!p.focuser.onRun || p.focuser.running}
                    >
                      {p.focuser.running ? t.hand.focusing : t.hub.focuser.run}
                    </button>
                    {p.focuser.curve.length > 1 && (
                      <svg
                        className="oh-chart"
                        viewBox="0 0 240 80"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          points={p.focuser.curve
                            .map(
                              (v, i) =>
                                `${(i / (p.focuser.curve.length - 1)) * 236 + 2},${76 - (Math.abs(v) / 12) * 70}`,
                            )
                            .join(" ")}
                        />
                      </svg>
                    )}
                  </div>
                </div>
              )}
              {tab === "capture" && (
                <div className="oh-pane" role="tabpanel">
                  <div className="oh-film oh-film--grid">
                    {p.frames.length ? (
                      <FrameThumbs frames={p.frames} onOpen={p.onOpenFrame} />
                    ) : (
                      <span className="oh-empty">{t.hub.camera.noFrames}</span>
                    )}
                  </div>
                  {p.camera.capture && (
                    <button
                      type="button"
                      className="oh-btn oh-btn--rec"
                      style={{ width: "100%", marginTop: 10 }}
                      onClick={p.camera.capture.run}
                      disabled={p.camera.capture.disabled}
                    >
                      {p.camera.capture.label}
                    </button>
                  )}
                </div>
              )}
              {tab === "setup" && (
                <div className="oh-pane" role="tabpanel">
                  {p.setup}
                </div>
              )}
              {tab === "log" && (
                <div className="oh-pane" role="tabpanel">
                  <h3 className="oh-h3" style={{ marginTop: 0 }}>
                    {t.hub.log.title}
                  </h3>
                  <div className="oh-notes sdo-mono">
                    {p.log.length ? (
                      p.log.map((l, i) => <div key={i}>{l}</div>)
                    ) : (
                      <span className="oh-hint">{t.hub.log.empty}</span>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="oh-col oh-right">
            <Card
              icon="bolt"
              title={t.hub.autopilot.title}
              chip={ap.sub}
              chipOk={ap.pipe.done >= 5}
              className="oh-apcard"
            >
              <div className="oh-selrow">
                {ap.plate && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="oh-selpic" src={plateArt(ap.plate)} alt="" />
                )}
                <div className="oh-big">{ap.name ?? t.hub.autopilot.pick}</div>
              </div>
              {ap.rows.length > 0 && (
                <div className="oh-kv">
                  {ap.rows.map(([k, v]) => (
                    <span key={k} style={{ display: "contents" }}>
                      <span>{k}</span>
                      <b>{v}</b>
                    </span>
                  ))}
                </div>
              )}
              <button
                className={`oh-go${ap.busy ? " is-busy" : ""}`}
                type="button"
                onClick={ap.go.run}
                disabled={ap.go.disabled}
              >
                <Icon name="target" size={20} />
                <span>{ap.go.label}</span>
                <span className="sdo-kbd" aria-hidden="true">
                  ↵
                </span>
              </button>
              <ol className="oh-pipe" aria-label={t.hub.autopilot.title}>
                {t.hub.autopilot.pipe.map((s, i) => (
                  <li
                    key={s}
                    className={
                      i < ap.pipe.done ? "is-done" : i === ap.pipe.now ? "is-now" : ""
                    }
                    aria-current={i === ap.pipe.now ? "step" : undefined}
                  >
                    {s}
                  </li>
                ))}
              </ol>
              <div className="oh-readout">
                {ap.readout.map(([k, v]) => (
                  <div key={k}>
                    <small>{k}</small>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              {ap.log.length > 0 && (
                <div className="oh-aplog sdo-mono" aria-live="polite">
                  {ap.log.slice(-3).map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              )}
              {ap.note && <p className="oh-apnote">{ap.note}</p>}
              {ap.links.length > 0 && (
                <div className="oh-linkbtns">
                  {ap.links.map((l) => (
                    <button
                      key={l.label}
                      type="button"
                      className="oh-btn"
                      onClick={l.run}
                      disabled={l.disabled}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
              {ap.after.length > 0 && (
                <>
                  <h3 className="oh-h3">{t.hub.autopilot.after}</h3>
                  {ap.after.map((a) => (
                    <p key={a} className="oh-pill">
                      <span className="oh-check" aria-hidden="true">
                        <Icon name="check" size={14} />
                      </span>
                      {a}
                    </p>
                  ))}
                </>
              )}
            </Card>

            <section className="oh-card oh-camcard" aria-label={t.camera.title}>
              <h2 className="oh-h2">
                <span className="oh-hi">
                  <Icon name="camera" size={20} />
                </span>
                <span>{t.camera.title}</span>
                <small
                  className={`oh-chipst${p.camera.progress.frac > 0 ? " is-ok" : ""}`}
                >
                  {p.camera.total}
                </small>
              </h2>
              <div className="oh-cstats">
                {p.camera.stats.map(([k, v]) => (
                  <div key={k}>
                    <small>{k}</small>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <Camera {...p.camera} bare />
              <h4 className="oh-h3">{t.hub.camera.recent}</h4>
              <div className="oh-film">
                {p.frames.length ? (
                  <FrameThumbs frames={p.frames.slice(0, 6)} onOpen={p.onOpenFrame} />
                ) : (
                  <span className="oh-empty">{t.hub.camera.noFrames}</span>
                )}
              </div>
              <div className="oh-prog">
                <div className="oh-prog__t">
                  <b>{p.camera.progress.title}</b>
                  <span className="sdo-mono">{p.camera.progress.count}</span>
                </div>
                <div className="oh-bar">
                  <i style={{ width: `${Math.round(p.camera.progress.frac * 100)}%` }} />
                </div>
                {p.camera.capture && (
                  <button
                    type="button"
                    className="oh-btn oh-btn--rec"
                    onClick={p.camera.capture.run}
                    disabled={p.camera.capture.disabled}
                  >
                    <Icon name="camera" size={16} /> {p.camera.capture.label}
                  </button>
                )}
              </div>
            </section>

            <Pointing {...p.pointing} />
          </div>
        </main>

        <nav className="oh-mnav" aria-label={t.hub.controls}>
          {(["live", "targets", "controls"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={phone === v ? "is-on" : ""}
              aria-pressed={phone === v}
              onClick={() => setPhone(v)}
            >
              <Icon
                name={v === "live" ? "camera" : v === "targets" ? "rings" : "sliders"}
                size={20}
              />
              <span>{t.hub.phoneTabs[v]}</span>
            </button>
          ))}
        </nav>
        {p.modals}
      </div>
    </CopyProvider>
  );
}

export const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};
export const degText = (v: number, width = 1) =>
  `${v < 0 ? "−" : ""}${Math.abs(v).toFixed(width)}°`;
export const raShort = (h: number) =>
  `${pad2(Math.floor(h))}H ${pad2(Math.floor((h % 1) * 60))}M`;
export const decShort = (d: number) =>
  `${d < 0 ? "−" : "+"}${pad2(Math.floor(Math.abs(d)))}° ${pad2(Math.floor((Math.abs(d) % 1) * 60))}′`;
export const duration = (s: number) =>
  s >= 60
    ? `${Math.floor(s / 60)} M ${pad2(Math.round(s % 60))} S`
    : s >= 1
      ? `${Math.round(s)} S`
      : `${(s * 1000).toFixed(0)} MS`;
export const lstText = (hours: number) =>
  `${pad2(Math.floor(hours))}h${pad2(Math.floor((hours % 1) * 60))}m`;
