import type { ReactNode } from "react";

export type PanelIcon =
  | "progress"
  | "pointing"
  | "hand"
  | "session"
  | "share"
  | "observatory"
  | "captures"
  | "history"
  | "seat";

// Stroke paths on a 16-unit grid. Plain signs, never a reticle or crosshair (ADR-039).
const paths: Record<PanelIcon, string> = {
  progress: "M2 8h12M4 6v4M8 6v4M12 6v4",
  pointing: "M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM8 4.5l1.5 3.5L8 11.5 6.5 8z",
  hand: "M8 2.5l2 2H6zM8 13.5l-2-2h4zM2.5 8l2-2v4zM13.5 8l-2 2V6z",
  session: "M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5v3l2 1.5",
  share:
    "M4 8a1.5 1.5 0 1 0 0 .01M12 4a1.5 1.5 0 1 0 0 .01M12 12a1.5 1.5 0 1 0 0 .01M5.3 7.3l5.4-2.6M5.3 8.7l5.4 2.6",
  observatory: "M2.5 13.5h11M3.5 13.5V9a4.5 4.5 0 0 1 9 0v4.5M8 4.5V9",
  captures: "M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3",
  history: "M5 4h8.5M5 8h8.5M5 12h8.5M2.5 4h.01M2.5 8h.01M2.5 12h.01",
  seat: "M8 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 13.5a5 5 0 0 1 10 0",
};

type PanelHeadProps = {
  id?: string;
  title: ReactNode;
  icon: PanelIcon;
  /** The small tracked label on the right: a count, a step, a place. */
  meta?: ReactNode;
  level?: 2 | 3;
};

/** A console panel's header: a small icon, a tracked caps title, and its meta label. */
export function PanelHead({ icon, id, level = 2, meta, title }: PanelHeadProps) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <header className="panel-head">
      <Heading id={id} className="panel-title">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d={paths[icon]} />
        </svg>
        {title}
      </Heading>
      {meta && <div className="panel-meta">{meta}</div>}
    </header>
  );
}
