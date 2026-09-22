type LiveIndicatorProps = {
  label: string;
  /** Brand v2.0 §08 rule 04: true only while the camera is genuinely live. */
  active: boolean;
};

export function LiveIndicator({ active, label }: LiveIndicatorProps) {
  return (
    <span className={`live-indicator ${active ? "live-indicator-active" : ""}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
}
